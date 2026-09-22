import { useState, useCallback, useRef, useEffect } from 'react';
import { StudioProject } from '../types.ts';

export type ModificationCategory = 'avatar' | 'background' | 'voice' | 'music' | 'project' | 'general';

export interface HistoryItem {
  id: string;
  timestamp: number;
  project: StudioProject;
  description: string;
  category: ModificationCategory;
  field?: string;
}

export interface StudioHistoryState {
  undoStack: HistoryItem[];
  redoStack: HistoryItem[];
  canUndo: boolean;
  canRedo: boolean;
  lastActionMessage: string | null;
}

function formatToken(str?: string): string {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncate(str: string, maxLen = 32): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

// Deep clone helper to ensure isolated snapshots
function cloneProject(project: StudioProject): StudioProject {
  try {
    return structuredClone(project);
  } catch {
    return JSON.parse(JSON.stringify(project));
  }
}

export function detectProjectChange(
  prev: StudioProject,
  updates: Partial<StudioProject>
): { description: string; category: ModificationCategory; field?: string } | null {
  const keys = Object.keys(updates) as (keyof StudioProject)[];
  const changedKeys = keys.filter((k) => updates[k] !== undefined && updates[k] !== prev[k]);

  if (changedKeys.length === 0) {
    return null;
  }

  // Preset avatar or major avatar image change
  if (updates.avatarUrl && updates.avatarUrl !== prev.avatarUrl) {
    return {
      description: updates.avatarStyle
        ? `Avatar look switched to ${formatToken(updates.avatarStyle)}`
        : 'New avatar image applied',
      category: 'avatar',
      field: 'avatarUrl',
    };
  }

  // Specific avatar customizations
  if (updates.avatarStyle && updates.avatarStyle !== prev.avatarStyle) {
    return { description: `Avatar style: ${formatToken(updates.avatarStyle)}`, category: 'avatar', field: 'avatarStyle' };
  }
  if (updates.hairstyle && updates.hairstyle !== prev.hairstyle) {
    return { description: `Hairstyle: ${formatToken(updates.hairstyle)}`, category: 'avatar', field: 'hairstyle' };
  }
  if (updates.hairColor && updates.hairColor !== prev.hairColor) {
    return { description: `Hair color: ${formatToken(updates.hairColor)}`, category: 'avatar', field: 'hairColor' };
  }
  if (updates.clothingTop && updates.clothingTop !== prev.clothingTop) {
    return { description: `Outfit top: ${formatToken(updates.clothingTop)}`, category: 'avatar', field: 'clothingTop' };
  }
  if (updates.clothingBottom && updates.clothingBottom !== prev.clothingBottom) {
    return { description: `Outfit bottom: ${formatToken(updates.clothingBottom)}`, category: 'avatar', field: 'clothingBottom' };
  }
  if (updates.shoes && updates.shoes !== prev.shoes) {
    return { description: `Shoes: ${formatToken(updates.shoes)}`, category: 'avatar', field: 'shoes' };
  }
  if (updates.accessory && updates.accessory !== prev.accessory) {
    return { description: `Accessory: ${formatToken(updates.accessory)}`, category: 'avatar', field: 'accessory' };
  }
  if (updates.bodyType && updates.bodyType !== prev.bodyType) {
    return { description: `Body build: ${formatToken(updates.bodyType)}`, category: 'avatar', field: 'bodyType' };
  }
  if (updates.framing && updates.framing !== prev.framing) {
    return { description: `Framing: ${formatToken(updates.framing)}`, category: 'avatar', field: 'framing' };
  }
  if (updates.avatarPose && updates.avatarPose !== prev.avatarPose) {
    return { description: `Pose: ${formatToken(updates.avatarPose)}`, category: 'avatar', field: 'avatarPose' };
  }
  if (updates.isolateBackground !== undefined && updates.isolateBackground !== prev.isolateBackground) {
    return {
      description: `Backdrop isolation ${updates.isolateBackground ? 'enabled' : 'disabled'}`,
      category: 'avatar',
      field: 'isolateBackground',
    };
  }
  if (updates.avatarPrompt && updates.avatarPrompt !== prev.avatarPrompt) {
    return { description: 'Avatar prompt refined', category: 'avatar', field: 'avatarPrompt' };
  }

  // Voice changes
  if (updates.selectedVoice && updates.selectedVoice !== prev.selectedVoice) {
    return { description: `Voice actor: ${updates.selectedVoice}`, category: 'voice', field: 'selectedVoice' };
  }
  if (updates.speechEmotion && updates.speechEmotion !== prev.speechEmotion) {
    return { description: `Voice tone: ${formatToken(updates.speechEmotion)}`, category: 'voice', field: 'speechEmotion' };
  }
  if (updates.voicePitch !== undefined && updates.voicePitch !== prev.voicePitch) {
    return { description: `Voice pitch: ${updates.voicePitch.toFixed(2)}x`, category: 'voice', field: 'voicePitch' };
  }
  if (updates.voiceSpeed !== undefined && updates.voiceSpeed !== prev.voiceSpeed) {
    return { description: `Voice speed: ${updates.voiceSpeed.toFixed(2)}x`, category: 'voice', field: 'voiceSpeed' };
  }
  if (updates.dialogueText !== undefined && updates.dialogueText !== prev.dialogueText) {
    return { description: `Script: "${truncate(updates.dialogueText)}"`, category: 'voice', field: 'dialogueText' };
  }
  if (updates.voiceAudioUrl && updates.voiceAudioUrl !== prev.voiceAudioUrl) {
    return { description: 'Synthesized voice audio updated', category: 'voice', field: 'voiceAudioUrl' };
  }
  if (updates.modulatedAudioUrl && updates.modulatedAudioUrl !== prev.modulatedAudioUrl) {
    return { description: 'Modulated voice audio updated', category: 'voice', field: 'modulatedAudioUrl' };
  }

  // Background changes
  if (updates.backgroundUrl && updates.backgroundUrl !== prev.backgroundUrl) {
    return { description: 'Background scene changed', category: 'background', field: 'backgroundUrl' };
  }
  if (updates.backgroundMode && updates.backgroundMode !== prev.backgroundMode) {
    return { description: `Background mode: ${formatToken(updates.backgroundMode)}`, category: 'background', field: 'backgroundMode' };
  }
  if (updates.backgroundPrompt && updates.backgroundPrompt !== prev.backgroundPrompt) {
    return { description: 'Background prompt refined', category: 'background', field: 'backgroundPrompt' };
  }
  if (updates.backgroundAnimation && updates.backgroundAnimation !== prev.backgroundAnimation) {
    return { description: `Scene animation: ${formatToken(updates.backgroundAnimation)}`, category: 'background', field: 'backgroundAnimation' };
  }
  if (updates.backgroundAspect && updates.backgroundAspect !== prev.backgroundAspect) {
    return { description: `Aspect ratio: ${updates.backgroundAspect}`, category: 'background', field: 'backgroundAspect' };
  }

  // Music changes
  if (updates.musicTrackId && updates.musicTrackId !== prev.musicTrackId) {
    return { description: `Music track: ${formatToken(updates.musicTrackId)}`, category: 'music', field: 'musicTrackId' };
  }
  if (updates.musicVolume !== undefined && updates.musicVolume !== prev.musicVolume) {
    return { description: `Music volume: ${Math.round(updates.musicVolume * 100)}%`, category: 'music', field: 'musicVolume' };
  }
  if (updates.voiceVolume !== undefined && updates.voiceVolume !== prev.voiceVolume) {
    return { description: `Voice volume: ${Math.round(updates.voiceVolume * 100)}%`, category: 'music', field: 'voiceVolume' };
  }

  // Project / UI
  if (updates.title && updates.title !== prev.title) {
    return { description: `Title: "${truncate(updates.title)}"`, category: 'project', field: 'title' };
  }
  if (updates.showSubtitles !== undefined && updates.showSubtitles !== prev.showSubtitles) {
    return { description: `Subtitles ${updates.showSubtitles ? 'shown' : 'hidden'}`, category: 'project', field: 'showSubtitles' };
  }
  if (updates.subtitleStyle && updates.subtitleStyle !== prev.subtitleStyle) {
    return { description: `Subtitle style: ${formatToken(updates.subtitleStyle)}`, category: 'project', field: 'subtitleStyle' };
  }

  return { description: 'Studio settings adjusted', category: 'general' };
}

// Continuous adjustment fields that should be debounced into a single undo step
const CONTINUOUS_FIELDS = new Set([
  'voicePitch',
  'voiceSpeed',
  'musicVolume',
  'voiceVolume',
  'dialogueText',
  'avatarPrompt',
  'backgroundPrompt',
]);

const MAX_HISTORY_DEFAULT = 40;
const CONTINUOUS_DEBOUNCE_MS = 800;

export function useStudioHistory(
  activeProjectId: string,
  initialProject: StudioProject,
  onApplyProject: (project: StudioProject, notice?: { message: string; type: 'undo' | 'redo' }) => void
) {
  // Store stacks per project ID so switching projects preserves separate histories
  const stacksByProject = useRef<
    Record<
      string,
      {
        undoStack: HistoryItem[];
        redoStack: HistoryItem[];
        lastPushTime: number;
        lastPushedField?: string;
      }
    >
  >({});

  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'undo' | 'redo' } | null>(null);

  // Sync state when active project changes
  useEffect(() => {
    if (!stacksByProject.current[activeProjectId]) {
      stacksByProject.current[activeProjectId] = {
        undoStack: [],
        redoStack: [],
        lastPushTime: 0,
      };
    }
    const store = stacksByProject.current[activeProjectId];
    setUndoStack([...store.undoStack]);
    setRedoStack([...store.redoStack]);
  }, [activeProjectId]);

  // Toast notice auto-clear timer
  useEffect(() => {
    if (!toastNotice) return;
    const timer = setTimeout(() => {
      setToastNotice(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastNotice]);

  /**
   * Records a prospective project update to the undo stack before applying.
   */
  const recordModification = useCallback(
    (
      currentProject: StudioProject,
      updates: Partial<StudioProject>,
      customDescription?: string
    ) => {
      const change = detectProjectChange(currentProject, updates);
      if (!change) return; // No meaningful change detected

      const now = Date.now();
      const store = stacksByProject.current[activeProjectId] || {
        undoStack: [],
        redoStack: [],
        lastPushTime: 0,
      };

      const isContinuous =
        change.field &&
        CONTINUOUS_FIELDS.has(change.field) &&
        store.lastPushedField === change.field &&
        now - store.lastPushTime < CONTINUOUS_DEBOUNCE_MS;

      if (isContinuous && store.undoStack.length > 0) {
        // Update top undo snapshot's description to the latest state without consuming extra stack depth
        store.undoStack[store.undoStack.length - 1].description =
          customDescription || change.description;
        store.lastPushTime = now;
      } else {
        const item: HistoryItem = {
          id: `hist_${now}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now,
          project: cloneProject(currentProject),
          description: customDescription || change.description,
          category: change.category,
          field: change.field,
        };

        store.undoStack.push(item);
        if (store.undoStack.length > MAX_HISTORY_DEFAULT) {
          store.undoStack.shift();
        }
        // Any new modification invalidates the redo branch
        store.redoStack = [];
        store.lastPushTime = now;
        store.lastPushedField = change.field;
      }

      stacksByProject.current[activeProjectId] = store;
      setUndoStack([...store.undoStack]);
      setRedoStack([...store.redoStack]);
    },
    [activeProjectId]
  );

  /**
   * Undo the most recent modification
   */
  const undo = useCallback(
    (currentProject: StudioProject) => {
      const store = stacksByProject.current[activeProjectId];
      if (!store || store.undoStack.length === 0) return false;

      const previousSnapshot = store.undoStack.pop()!;
      // Push current state onto redo stack
      store.redoStack.push({
        id: `redo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        project: cloneProject(currentProject),
        description: previousSnapshot.description,
        category: previousSnapshot.category,
        field: previousSnapshot.field,
      });

      stacksByProject.current[activeProjectId] = store;
      setUndoStack([...store.undoStack]);
      setRedoStack([...store.redoStack]);

      const notice = {
        message: `Reverted: ${previousSnapshot.description}`,
        type: 'undo' as const,
      };
      setToastNotice(notice);
      onApplyProject(previousSnapshot.project, notice);
      return true;
    },
    [activeProjectId, onApplyProject]
  );

  /**
   * Redo the previously undone modification
   */
  const redo = useCallback(
    (currentProject: StudioProject) => {
      const store = stacksByProject.current[activeProjectId];
      if (!store || store.redoStack.length === 0) return false;

      const nextSnapshot = store.redoStack.pop()!;
      // Push current state back to undo stack
      store.undoStack.push({
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        project: cloneProject(currentProject),
        description: nextSnapshot.description,
        category: nextSnapshot.category,
        field: nextSnapshot.field,
      });

      stacksByProject.current[activeProjectId] = store;
      setUndoStack([...store.undoStack]);
      setRedoStack([...store.redoStack]);

      const notice = {
        message: `Restored: ${nextSnapshot.description}`,
        type: 'redo' as const,
      };
      setToastNotice(notice);
      onApplyProject(nextSnapshot.project, notice);
      return true;
    },
    [activeProjectId, onApplyProject]
  );

  /**
   * Revert directly to a specific history snapshot
   */
  const jumpToHistorySnapshot = useCallback(
    (snapshotId: string, currentProject: StudioProject) => {
      const store = stacksByProject.current[activeProjectId];
      if (!store) return;

      const targetIndex = store.undoStack.findIndex((i) => i.id === snapshotId);
      if (targetIndex === -1) return;

      const target = store.undoStack[targetIndex];
      // Everything after target goes to redo stack in reverse
      const popped = store.undoStack.splice(targetIndex);
      // Push current project and popped items to redo
      store.redoStack.push({
        id: `redo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        project: cloneProject(currentProject),
        description: target.description,
        category: target.category,
      });
      for (let i = popped.length - 1; i > 0; i--) {
        store.redoStack.push(popped[i]);
      }

      stacksByProject.current[activeProjectId] = store;
      setUndoStack([...store.undoStack]);
      setRedoStack([...store.redoStack]);

      const notice = {
        message: `Reverted to: ${target.description}`,
        type: 'undo' as const,
      };
      setToastNotice(notice);
      onApplyProject(target.project, notice);
    },
    [activeProjectId, onApplyProject]
  );

  /**
   * Clear history for active project
   */
  const clearHistory = useCallback(() => {
    stacksByProject.current[activeProjectId] = {
      undoStack: [],
      redoStack: [],
      lastPushTime: 0,
    };
    setUndoStack([]);
    setRedoStack([]);
    setToastNotice({
      message: 'Modification history cleared',
      type: 'undo',
    });
  }, [activeProjectId]);

  return {
    undoStack,
    redoStack,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    toastNotice,
    setToastNotice,
    recordModification,
    undo,
    redo,
    jumpToHistorySnapshot,
    clearHistory,
  };
}
