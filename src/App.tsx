/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { StudioProject, ProjectFolder, ProjectAsset, AppArchitectBlueprint } from './types.ts';
import {
  DEFAULT_PROJECTS,
  loadProjectsFromStorage,
  saveProjectsToStorage,
} from './data/projectPresets.ts';
import { ProjectFolderManager } from './components/ProjectFolderManager.tsx';
import { AppArchitectStudio } from './components/AppArchitectStudio.tsx';
import { UIArtStudio } from './components/UIArtStudio.tsx';
import { BackgroundStudio } from './components/BackgroundStudio.tsx';
import { AvatarStudio } from './components/AvatarStudio.tsx';
import { VoiceStudio } from './components/VoiceStudio.tsx';
import { MusicStudio } from './components/MusicStudio.tsx';
import { VeoStudio } from './components/VeoStudio.tsx';
import { LiveVoiceConversation } from './components/LiveVoiceConversation.tsx';
import { AppIntroPlayer } from './components/AppIntroPlayer.tsx';
import { ChatCopilot } from './components/ChatCopilot.tsx';
import { ExportHub } from './components/ExportHub.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { StudioHistoryModal } from './components/StudioHistoryModal.tsx';
import { useStudioHistory } from './hooks/useStudioHistory.ts';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  loadUserProjectsFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
} from './lib/firestoreSync.ts';
import type { User } from './lib/firestoreSync.ts';
import { StudioAiHelper, StudioScreenId } from './components/StudioAiHelper.tsx';
import {
  Sparkles,
  Image as ImageIcon,
  User as UserIcon,
  Volume2,
  Music,
  Share2,
  Bot,
  PackageCheck,
  Folder,
  Palette,
  ChevronDown,
  Film,
  Radio,
  Cloud,
  LogIn,
  LogOut,
  CheckCircle2,
  Loader2,
  Menu,
  X,
  Play,
  ArrowRight,
  Sparkle,
  Undo2,
  Redo2,
  RotateCcw,
  RotateCw,
  History,
  Wand2,
} from 'lucide-react';

export type StudioScreen = StudioScreenId;

export interface ScreenDef {
  id: StudioScreen;
  label: string;
  shortDesc: string;
  icon: any;
  color: string;
  badge?: string;
}

export const SCREENS: ScreenDef[] = [
  {
    id: 'architect',
    label: 'AI App Architect',
    shortDesc: 'Plan & auto-orchestrate complete app, 8 avatars & Claude export',
    icon: Wand2,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    badge: 'DIRECTOR',
  },
  {
    id: 'projects',
    label: 'Project Vault',
    shortDesc: 'Search, tag & organize assets across project folders',
    icon: Folder,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'avatar',
    label: 'Avatar Studio',
    shortDesc: 'Design 2D/3D characters, clothing & companion avatars',
    icon: UserIcon,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'background',
    label: 'Background Studio',
    shortDesc: 'Generate 1K-4K backdrops & cinematic scenes',
    icon: ImageIcon,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'ui_art',
    label: 'UI Art & Icons',
    shortDesc: 'App icons, squircles, feature cards & badges',
    icon: Palette,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'voice',
    label: 'Voice Studio',
    shortDesc: 'Synthesize speech, emotions & audio modulation',
    icon: Volume2,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'music',
    label: 'Music Studio',
    shortDesc: 'Lyria soundtrack generation & synth cues',
    icon: Music,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  },
  {
    id: 'video',
    label: 'Veo Video Studio',
    shortDesc: 'Cinematic video cutscenes with Google Veo',
    icon: Film,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'intro_player',
    label: 'Live Intro Simulator',
    shortDesc: 'Interactive test on mobile, web & fullscreen',
    icon: Play,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    badge: 'Live',
  },
  {
    id: 'export',
    label: 'Export Hub',
    shortDesc: 'Export assets & turnkey code for React/Flutter',
    icon: PackageCheck,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  },
];

export default function App() {
  // Initialize projects from localStorage or defaults
  const [projects, setProjects] = useState<ProjectFolder[]>(() => {
    return loadProjectsFromStorage();
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const initial = loadProjectsFromStorage();
    return initial[0]?.id || DEFAULT_PROJECTS[0].id;
  });

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECTS[0];

  // Active studio project state initialized from activeProject.currentStudioState
  const [project, setProject] = useState<StudioProject>(() => ({
    ...activeProject.currentStudioState,
    projectId: activeProject.id,
    projectName: activeProject.name,
    stylePrimer: activeProject.stylePrimer,
    styleLockEnabled: activeProject.stylePrimer.locked ?? true,
  }));

  const [activeScreen, setActiveScreen] = useState<StudioScreen>('projects');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotRole, setCopilotRole] = useState<string>('intro_director');
  const [injectedUiPrompt, setInjectedUiPrompt] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  // Live App Intro Pre-Play State
  const [introFocusMode, setIntroFocusMode] = useState<'all' | 'avatar_voice_only'>('all');
  const [introAutoPlayKey, setIntroAutoPlayKey] = useState<number>(0);
  const [isSplitPreviewOpen, setIsSplitPreviewOpen] = useState(false);

  const handlePrePlayIntro = (focusMode: 'all' | 'avatar_voice_only' = 'all') => {
    setIntroFocusMode(focusMode);
    setIntroAutoPlayKey((prev) => prev + 1);
    setActiveScreen('intro_player');
  };

  // Firebase Auth state & Firestore sync status
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firebase Auth & Firestore Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsCloudSyncing(true);
        try {
          const cloudProjects = await loadUserProjectsFromFirestore(user.uid);
          if (cloudProjects.length > 0) {
            setProjects(cloudProjects);
            saveProjectsToStorage(cloudProjects);
            if (!cloudProjects.some((p) => p.id === activeProjectId)) {
              setActiveProjectId(cloudProjects[0].id);
            }
          } else {
            // First sign-in: sync existing local projects to Firestore
            for (const proj of projects) {
              await saveProjectToFirestore(user.uid, proj);
            }
          }
        } catch (err) {
          console.warn('Firestore sync warning:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to backend file store on mount
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          if (!currentUser) {
            setProjects(data.projects);
            saveProjectsToStorage(data.projects);
          }
        }
      })
      .catch((err) => console.warn('Could not load server projects:', err));
  }, [currentUser]);

  // Save projects to localStorage and sync active project to server & Firestore
  const persistProjects = useCallback((updatedProjects: ProjectFolder[]) => {
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    const active = updatedProjects.find((p) => p.id === activeProjectId);
    if (active) {
      // Local server sync
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(active),
      }).catch((e) => console.warn('Could not sync project to server:', e));

      // Firestore cloud sync if user is signed in
      if (currentUser) {
        saveProjectToFirestore(currentUser.uid, active).catch((e) =>
          console.warn('Firestore cloud sync failed:', e)
        );
      }
    }
  }, [activeProjectId, currentUser]);

  // Studio History Undo/Redo Engine
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleApplyHistoryState = useCallback(
    (restoredProject: StudioProject) => {
      setProject(restoredProject);
      setProjects((prevProjects) => {
        const updatedProjList = prevProjects.map((p) => {
          if (p.id === activeProjectId) {
            return {
              ...p,
              updatedAt: Date.now(),
              currentStudioState: restoredProject,
            };
          }
          return p;
        });
        saveProjectsToStorage(updatedProjList);
        const active = updatedProjList.find((p) => p.id === activeProjectId);
        if (active) {
          fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(active),
          }).catch((e) => console.warn('Could not sync project to server:', e));

          if (currentUser) {
            saveProjectToFirestore(currentUser.uid, active).catch((e) =>
              console.warn('Firestore cloud sync failed:', e)
            );
          }
        }
        return updatedProjList;
      });
    },
    [activeProjectId, currentUser]
  );

  const {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    toastNotice,
    recordModification,
    undo,
    redo,
    jumpToHistorySnapshot,
    clearHistory,
  } = useStudioHistory(activeProjectId, project, handleApplyHistoryState);

  const handleUndo = useCallback(() => {
    undo(project);
  }, [undo, project]);

  const handleRedo = useCallback(() => {
    redo(project);
  }, [redo, project]);

  const handleJumpToSnapshot = useCallback(
    (snapshotId: string) => {
      jumpToHistorySnapshot(snapshotId, project);
    },
    [jumpToHistorySnapshot, project]
  );

  // Global Keyboard Shortcuts (Cmd+Z / Ctrl+Z for undo, Cmd+Shift+Z / Ctrl+Y / Ctrl+Shift+Z for redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.key.toLowerCase() === 'z' && e.shiftKey) ||
        e.key.toLowerCase() === 'y'
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const updateProject = (updates: Partial<StudioProject>, customDescription?: string) => {
    // Record to history stack before mutating state
    recordModification(project, updates, customDescription);

    setProject((prev) => {
      const updated = { ...prev, ...updates };
      // Also update the active project's currentStudioState
      const updatedProjList = projects.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            updatedAt: Date.now(),
            currentStudioState: updated,
          };
        }
        return p;
      });
      persistProjects(updatedProjList);
      return updated;
    });
  };

  // Switch Active Project Folder
  const handleSelectProject = (newProject: ProjectFolder) => {
    setActiveProjectId(newProject.id);
    setIsProjectDropdownOpen(false);

    setProject({
      ...newProject.currentStudioState,
      projectId: newProject.id,
      projectName: newProject.name,
      stylePrimer: newProject.stylePrimer,
      styleLockEnabled: newProject.stylePrimer.locked ?? true,
    });
  };

  // Create New Project Folder
  const handleCreateProject = (newProj: ProjectFolder) => {
    const updated = [newProj, ...projects];
    persistProjects(updated);
    handleSelectProject(newProj);
    if (currentUser) {
      saveProjectToFirestore(currentUser.uid, newProj).catch(() => {});
    }
  };

  // Update existing Project Folder
  const handleUpdateProject = (updatedProj: ProjectFolder) => {
    const updated = projects.map((p) => (p.id === updatedProj.id ? updatedProj : p));
    persistProjects(updated);
    if (updatedProj.id === activeProjectId) {
      setProject((prev) => ({
        ...prev,
        stylePrimer: updatedProj.stylePrimer,
        styleLockEnabled: updatedProj.stylePrimer.locked ?? true,
        projectName: updatedProj.name,
      }));
    }
  };

  // Delete Project Folder
  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) {
      alert('You must keep at least one project folder.');
      return;
    }
    const updated = projects.filter((p) => p.id !== projId);
    persistProjects(updated);
    fetch(`/api/projects/${projId}`, { method: 'DELETE' }).catch(() => {});
    if (currentUser) {
      deleteProjectFromFirestore(currentUser.uid, projId).catch(() => {});
    }
    if (activeProjectId === projId) {
      handleSelectProject(updated[0]);
    }
  };

  // Duplicate Project Folder
  const handleDuplicateProject = (orig: ProjectFolder) => {
    const now = Date.now();
    const dupe: ProjectFolder = {
      ...orig,
      id: `proj_${now}`,
      name: `${orig.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    handleCreateProject(dupe);
  };

  // Add an asset to active project's folder
  const handleSaveAssetToProject = (asset: ProjectAsset) => {
    const updatedAssets = [asset, ...activeProject.assets];
    const updatedProj: ProjectFolder = {
      ...activeProject,
      assets: updatedAssets,
      updatedAt: Date.now(),
    };
    handleUpdateProject(updatedProj);
  };

  // Set an asset as the Project's Style Anchor
  const handleSetAsStyleAnchor = (asset: ProjectAsset) => {
    const updatedAssets = activeProject.assets.map((a) => ({
      ...a,
      isStyleAnchor: a.id === asset.id,
    }));
    const updatedPrimer = {
      ...activeProject.stylePrimer,
      referenceImageUrl: asset.url,
      referenceImageName: asset.name,
      locked: true,
    };
    const updatedProj: ProjectFolder = {
      ...activeProject,
      stylePrimer: updatedPrimer,
      assets: updatedAssets,
      updatedAt: Date.now(),
      currentStudioState: {
        ...activeProject.currentStudioState,
        stylePrimer: updatedPrimer,
        styleLockEnabled: true,
      },
    };
    handleUpdateProject(updatedProj);
  };

  // Load an asset into the active Studio intro player
  const handleApplyAssetToStudio = (asset: ProjectAsset) => {
    if (asset.folder === 'avatar') {
      updateProject({
        avatarMode: 'ai',
        avatarUrl: asset.url,
        avatarPrompt: asset.prompt || project.avatarPrompt,
      });
      setActiveScreen('avatar');
    } else if (asset.folder === 'background') {
      updateProject({
        backgroundMode: 'ai',
        backgroundUrl: asset.url,
        backgroundPrompt: asset.prompt || project.backgroundPrompt,
      });
      setActiveScreen('background');
    } else if (asset.folder === 'voice') {
      updateProject({
        voiceAudioUrl: asset.url,
        modulatedAudioUrl: asset.url,
        dialogueText: asset.prompt || project.dialogueText,
      });
      setActiveScreen('voice');
    } else if (asset.folder === 'music') {
      const match = asset.url.replace('synth://', '');
      updateProject({ musicTrackId: match });
      setActiveScreen('music');
    } else if (asset.folder === 'ui_art') {
      if (asset.prompt) setInjectedUiPrompt(asset.prompt);
      setActiveScreen('ui_art');
    } else if (asset.type === 'video') {
      setActiveScreen('video');
    } else if (asset.folder === 'intro') {
      setActiveScreen('intro_player');
    }
  };

  const handleOpenCopilot = (roleId?: string) => {
    if (roleId) {
      setCopilotRole(roleId);
    } else {
      const roleMap: Record<StudioScreen, string> = {
        architect: 'intro_director',
        projects: 'intro_director',
        avatar: 'avatar_designer',
        background: 'background_artist',
        ui_art: 'ui_designer',
        voice: 'voice_actor',
        music: 'music_composer',
        video: 'video_director',
        intro_player: 'intro_director',
        export: 'intro_director',
      };
      setCopilotRole(roleMap[activeScreen] || 'intro_director');
    }
    setIsCopilotOpen(true);
  };

  const handleSaveBlueprintToProjectVault = useCallback(
    (blueprint: AppArchitectBlueprint) => {
      const projId = `proj_${blueprint.appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // 1. Create asset records for all avatars
      const avatarAssets: ProjectAsset[] = blueprint.avatars.map((av, idx) => ({
        id: `asset_${av.id}_${Date.now()}_${idx}`,
        projectId: projId,
        name: `${av.name} (${av.role})`,
        folder: 'avatar',
        type: 'image',
        url: av.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        prompt: av.appearancePrompt,
        specs: {
          voiceName: av.voice,
          voicePitch: av.voicePitch,
          voiceSpeed: av.voiceSpeed,
          format: 'png',
        },
        createdAt: Date.now() + idx,
        tags: [blueprint.appName, 'avatar', av.voice, av.speechEmotion],
      }));

      // 2. Create asset records for all scenes
      const sceneAssets: ProjectAsset[] = blueprint.scenes.map((sc, idx) => ({
        id: `asset_${sc.id}_${Date.now()}_${idx}`,
        projectId: projId,
        name: sc.name,
        folder: 'background',
        type: 'image',
        url: sc.imageUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80',
        prompt: sc.prompt,
        specs: {
          aspectRatio: sc.aspectRatio,
          format: 'png',
        },
        createdAt: Date.now() + idx + 10,
        tags: [blueprint.appName, 'scene', sc.screenName],
      }));

      // 3. Create UI assets
      const uiAssets: ProjectAsset[] = blueprint.uiAssets.map((ui, idx) => ({
        id: `asset_${ui.id}_${Date.now()}_${idx}`,
        projectId: projId,
        name: ui.name,
        folder: 'ui_art',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        prompt: ui.prompt,
        specs: {
          uiType: ui.uiType,
        },
        createdAt: Date.now() + idx + 20,
        tags: [blueprint.appName, 'ui', ui.category],
      }));

      const newFolder: ProjectFolder = {
        id: projId,
        name: blueprint.appName,
        appType: 'mobile',
        description: `${blueprint.tagline} · ${blueprint.aestheticTheme}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stylePrimer: {
          styleName: blueprint.aestheticTheme,
          artMedium: 'photorealistic',
          lightingStyle: 'ambient_warm',
          colorPalette: {
            primary: blueprint.colorPalette.primary,
            secondary: blueprint.colorPalette.secondary,
            accent: blueprint.colorPalette.accent,
            background: blueprint.colorPalette.background,
          },
          styleDirectives: blueprint.styleDirectives,
          locked: true,
        },
        currentStudioState: {
          ...project,
          projectId: projId,
          projectName: blueprint.appName,
          avatarName: blueprint.avatars[0]?.name || project.avatarName,
          avatarHairstyle: blueprint.avatars[0]?.hairstyle || project.avatarHairstyle,
          avatarClothingTop: blueprint.avatars[0]?.clothingTop || project.avatarClothingTop,
          voiceActor: blueprint.avatars[0]?.voice || project.voiceActor,
          voicePitch: blueprint.avatars[0]?.voicePitch || project.voicePitch,
          voiceSpeed: blueprint.avatars[0]?.voiceSpeed || project.voiceSpeed,
          speechEmotion: blueprint.avatars[0]?.speechEmotion || project.speechEmotion,
          dialogueText: blueprint.avatars[0]?.dialogueIntro || project.dialogueText,
          avatarImageUrl: blueprint.avatars[0]?.imageUrl || project.avatarImageUrl,
          backgroundImageUrl: blueprint.scenes[0]?.imageUrl || project.backgroundImageUrl,
          backgroundPrompt: blueprint.scenes[0]?.prompt || project.backgroundPrompt,
        },
        assets: [...avatarAssets, ...sceneAssets, ...uiAssets],
      };

      setProjects((prev) => {
        const existingIdx = prev.findIndex(
          (p) => p.id === projId || p.name.toLowerCase() === blueprint.appName.toLowerCase()
        );
        let updated: ProjectFolder[];
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = newFolder;
        } else {
          updated = [newFolder, ...prev];
        }
        saveProjectsToStorage(updated);
        return updated;
      });

      setActiveProjectId(projId);
      setProject(newFolder.currentStudioState);

      if (user) {
        saveProjectToFirestore(user.uid, newFolder).catch((err) =>
          console.warn('Firestore sync warning:', err)
        );
      }
    },
    [project, user]
  );

  const handleApplyAiPrompt = (promptText: string) => {
    if (activeScreen === 'avatar') {
      updateProject({ avatarPrompt: promptText, avatarMode: 'ai' });
    } else if (activeScreen === 'background') {
      updateProject({ backgroundPrompt: promptText, backgroundMode: 'ai' });
    } else if (activeScreen === 'voice') {
      updateProject({ dialogueText: promptText });
    } else if (activeScreen === 'ui_art') {
      setInjectedUiPrompt(promptText);
    } else if (activeScreen === 'music') {
      updateProject({ title: promptText });
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Sign-in error:', err);
      setAuthError(err?.message || 'Authentication failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err: any) {
      console.warn('Sign-out error:', err);
    }
  };

  const currentScreenDef = SCREENS.find((s) => s.id === activeScreen) || SCREENS[0];
  const CurrentScreenIcon = currentScreenDef.icon;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white relative">
      {/* Top Application Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Hamburger Menu & Studio Identity */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button */}
          <button
            id="btn-hamburger-menu"
            type="button"
            onClick={() => setIsNavDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            title="Open Studio Screen Navigation Menu"
          >
            <Menu className="w-5 h-5 text-indigo-400" />
            <span className="hidden sm:inline text-xs font-bold text-slate-200">Menu</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight font-display">
                  AppIntro &amp; Avatar Studio
                </h1>
                <span className="hidden lg:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Gemini Multi-Modal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block">
                Consistent UI art, avatars, backdrops, voices &amp; Veo video filed by project
              </p>
            </div>
          </div>

          {/* Active Screen Indicator Tag */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className={`p-1.5 rounded-lg ${currentScreenDef.color}`}>
              <CurrentScreenIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentScreenDef.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick Screen Jumper (Visible on wide screens) */}
        <div className="hidden 2xl:flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl">
          {SCREENS.map((s) => {
            const Icon = s.icon;
            const isActive = activeScreen === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveScreen(s.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Studio Undo / Redo / History Stack */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
            <button
              id="btn-nav-undo"
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                canUndo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title={
                canUndo && undoStack.length > 0
                  ? `Undo: ${undoStack[undoStack.length - 1].description} (⌘Z / Ctrl+Z)`
                  : 'Undo (No recent changes)'
              }
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="sr-only">Undo</span>
            </button>

            <button
              id="btn-nav-redo"
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                canRedo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title={
                canRedo && redoStack.length > 0
                  ? `Redo: ${redoStack[redoStack.length - 1].description} (⌘⇧Z / Ctrl+Y)`
                  : 'Redo (No undone changes)'
              }
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="sr-only">Redo</span>
            </button>

            <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

            <button
              id="btn-nav-history"
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-2 py-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Open Studio Modification Timeline"
            >
              <History className="w-3.5 h-3.5" />
              {undoStack.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-indigo-500/20 text-indigo-300 font-semibold">
                  {undoStack.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Project Folder Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[100px] sm:max-w-[140px] truncate text-white">
                {activeProject.name}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/20 text-indigo-300 font-mono">
                {activeProject.assets.length}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                  <span>Switch Project Folder</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setActiveScreen('projects');
                    }}
                    className="text-indigo-400 hover:underline cursor-pointer"
                  >
                    Manage Vault
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProject(p)}
                      className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        p.id === activeProjectId
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.stylePrimer.colorPalette.primary }}
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 opacity-80">
                        {p.assets.length} items
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Voice Button */}
          <button
            id="btn-nav-live-voice"
            type="button"
            onClick={() => setIsLiveVoiceOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Start Real-Time Voice Conversation with Gemini 3.8 Live API"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
            <span className="hidden lg:inline">Live Voice</span>
          </button>

          {/* Firebase User Authentication */}
          {currentUser ? (
            <div className="flex items-center gap-2 p-1 pl-2 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-1.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500/50"
                  />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-slate-200 font-medium">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                {isCloudSyncing ? (
                  <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                ) : (
                  <span title="Firestore Cloud Synced">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-firebase-signin"
              type="button"
              onClick={handleSignIn}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Sign in with Google to sync all projects to Cloud Firestore"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* AI App Architect Direct Button */}
          <button
            id="btn-nav-architect"
            type="button"
            onClick={() => setActiveScreen('architect')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              activeScreen === 'architect'
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="Open AI App Architect & Director (8 Avatars, Voices, Art & Claude Export)"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">App Architect</span>
            <span className="hidden xl:inline text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
              Director
            </span>
          </button>

          {/* AI Copilot Slide-Out Drawer Toggle */}
          <button
            id="btn-toggle-copilot"
            type="button"
            onClick={() => handleOpenCopilot()}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-indigo-500/30 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 transition-colors cursor-pointer"
            title="Open AI Studio Creative Copilot & Brainstorming Chat"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-semibold">AI Copilot</span>
          </button>

          {/* Quick Preview Intro Simulator */}
          <button
            type="button"
            onClick={() => setActiveScreen('intro_player')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
              activeScreen === 'intro_player'
                ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-teal-400 hover:bg-slate-800'
            }`}
            title="Open Live App Intro Simulator"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Play Intro</span>
          </button>

          {/* Use in App Button */}
          <button
            id="btn-export-app-content"
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Use in App</span>
          </button>
        </div>
      </header>

      {/* Hamburger Navigation Drawer (Left Slide-Over) */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsNavDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-sm h-full bg-slate-950 border-r border-slate-800 shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Studio Screens</h2>
                  <p className="text-[10px] text-slate-400">Select any dedicated full-screen feature</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNavDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Project Card inside Drawer */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: activeProject.stylePrimer.colorPalette.primary }}
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 truncate">{activeProject.name}</div>
                  <div className="text-[10px] text-slate-400">{activeProject.assets.length} assets filed</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('projects');
                  setIsNavDrawerOpen(false);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Switch Folder
              </button>
            </div>

            {/* Screens List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {SCREENS.map((screen) => {
                const Icon = screen.icon;
                const isActive = activeScreen === screen.id;
                const assetCount =
                  screen.id === 'projects'
                    ? activeProject.assets.length
                    : activeProject.assets.filter((a) => a.folder === screen.id).length;

                return (
                  <button
                    key={screen.id}
                    type="button"
                    onClick={() => {
                      setActiveScreen(screen.id);
                      setIsNavDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isActive ? 'bg-white/20 text-white' : screen.color
                      } flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{screen.label}</span>
                        {screen.badge ? (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-white/30 text-white'
                                : 'bg-teal-500/20 text-teal-300'
                            }`}
                          >
                            {screen.badge}
                          </span>
                        ) : screen.id !== 'export' ? (
                          <span
                            className={`text-[10px] font-mono opacity-80 ${
                              isActive ? 'text-indigo-200' : 'text-slate-500'
                            }`}
                          >
                            {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {screen.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Bottom Shortcuts */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsNavDrawerOpen(false);
                  handleOpenCopilot();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/70"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Open Creative Copilot</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNavDrawerOpen(false);
                  setIsLiveVoiceOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-xs font-semibold text-emerald-300 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer border border-emerald-500/30"
              >
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Start Gemini Live Voice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Full-Screen Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">
        {/* Universal Studio AI Helper Banner on EVERY Screen */}
        <StudioAiHelper
          screenId={activeScreen}
          project={project}
          activeProject={activeProject}
          onApplyPrompt={handleApplyAiPrompt}
          onOpenCopilot={handleOpenCopilot}
        />

        {/* Dedicated Full-Screen Feature View */}
        <div className="w-full flex-1">
          {activeScreen === 'architect' && (
            <AppArchitectStudio
              currentProject={project}
              activeProjectFolder={activeProject}
              onApplyStudioState={(updated) => updateProject(updated)}
              onSaveBlueprintToProjectVault={handleSaveBlueprintToProjectVault}
              onNavigateScreen={(scr) => setActiveScreen(scr as StudioScreen)}
              onPrePlayIntro={(mode) => handlePrePlayIntro(mode)}
            />
          )}

          {activeScreen === 'projects' && (
            <ProjectFolderManager
              projects={projects}
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
              onUpdateProject={handleUpdateProject}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onDuplicateProject={handleDuplicateProject}
              onApplyAssetToStudio={handleApplyAssetToStudio}
            />
          )}

          {activeScreen === 'avatar' && (
            <div className={`grid grid-cols-1 ${isSplitPreviewOpen ? 'lg:grid-cols-12 gap-6' : ''}`}>
              <div className={`bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl ${isSplitPreviewOpen ? 'lg:col-span-7' : 'w-full'}`}>
                <AvatarStudio
                  project={project}
                  onChange={updateProject}
                  onSaveAssetToProject={handleSaveAssetToProject}
                  onSetAsStyleAnchor={handleSetAsStyleAnchor}
                  onPrePlayIntro={handlePrePlayIntro}
                  isSplitView={isSplitPreviewOpen}
                  onToggleSplitView={() => setIsSplitPreviewOpen(!isSplitPreviewOpen)}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
              {isSplitPreviewOpen && (
                <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" />
                      Live Intro Split View
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSplitPreviewOpen(false)}
                      className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Close Split View
                    </button>
                  </div>
                  <AppIntroPlayer
                    project={project}
                    initialFocusMode={introFocusMode}
                    autoPlayKey={introAutoPlayKey}
                    onNavigateScreen={(scr) => setActiveScreen(scr)}
                    isCompact={true}
                  />
                </div>
              )}
            </div>
          )}

          {activeScreen === 'background' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <BackgroundStudio
                project={project}
                onChange={updateProject}
                onSelectMusicTrack={(trackId) => updateProject({ musicTrackId: trackId })}
                onSaveAssetToProject={handleSaveAssetToProject}
                onPrePlayIntro={handlePrePlayIntro}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          )}

          {activeScreen === 'ui_art' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <UIArtStudio
                activeProject={activeProject}
                onSaveAssetToProject={handleSaveAssetToProject}
                onSetAsStyleAnchor={handleSetAsStyleAnchor}
                injectedPrompt={injectedUiPrompt}
              />
            </div>
          )}

          {activeScreen === 'voice' && (
            <div className={`grid grid-cols-1 ${isSplitPreviewOpen ? 'lg:grid-cols-12 gap-6' : ''}`}>
              <div className={`bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl ${isSplitPreviewOpen ? 'lg:col-span-7' : 'w-full'}`}>
                <VoiceStudio
                  project={project}
                  onChange={updateProject}
                  onSaveAssetToProject={handleSaveAssetToProject}
                  onPrePlayIntro={handlePrePlayIntro}
                  isSplitView={isSplitPreviewOpen}
                  onToggleSplitView={() => setIsSplitPreviewOpen(!isSplitPreviewOpen)}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
              {isSplitPreviewOpen && (
                <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" />
                      Live Intro Split View
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSplitPreviewOpen(false)}
                      className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Close Split View
                    </button>
                  </div>
                  <AppIntroPlayer
                    project={project}
                    initialFocusMode={introFocusMode}
                    autoPlayKey={introAutoPlayKey}
                    onNavigateScreen={(scr) => setActiveScreen(scr)}
                    isCompact={true}
                  />
                </div>
              )}
            </div>
          )}

          {activeScreen === 'music' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <MusicStudio
                project={project}
                onChange={updateProject}
                onSaveAssetToProject={handleSaveAssetToProject}
                onPrePlayIntro={handlePrePlayIntro}
              />
            </div>
          )}

          {activeScreen === 'video' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <VeoStudio
                project={project}
                onSaveAssetToProject={handleSaveAssetToProject}
              />
            </div>
          )}

          {activeScreen === 'intro_player' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-teal-400" />
                    <span>Live App Intro &amp; Interactive Simulator</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Experience your active project's avatar, scene, synthesized voice, and music in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export Code Snippet</span>
                  </button>
                </div>
              </div>
              <div className="max-w-2xl mx-auto w-full">
                <AppIntroPlayer
                  project={project}
                  initialFocusMode={introFocusMode}
                  autoPlayKey={introAutoPlayKey}
                  onNavigateScreen={(scr) => setActiveScreen(scr)}
                />
              </div>
            </div>
          )}

          {activeScreen === 'export' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <ExportHub project={project} />
            </div>
          )}
        </div>

        {/* Bottom Project Asset Quick Ribbon */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 mt-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-200 font-semibold">{activeProject.name}</span>
              <span className="text-[11px] text-slate-500">
                ({activeProject.assets.length} assets filed)
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200">
                {activeProject.stylePrimer.styleName} ({activeProject.stylePrimer.artMedium.replace('_', ' ')})
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen('projects')}
            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Open Project Vault &amp; Asset Library →</span>
          </button>
        </div>
      </main>

      {/* Floating AI Helper Summoner Button */}
      <button
        id="floating-btn-ai-helper"
        type="button"
        onClick={() => handleOpenCopilot()}
        className="fixed bottom-5 right-5 z-30 px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer border border-indigo-400/30"
        title="Summon AI Studio Creative Copilot & Brainstorming Helper"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>AI Brainstormer</span>
      </button>

      {/* Slide-Out AI Copilot Side Drawer */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCopilotOpen(false)}
          />
          {/* Slide-over panel */}
          <div className="relative w-full max-w-lg h-full bg-slate-950 border-l border-slate-800 shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">AI Studio Creative Copilot</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                  {currentScreenDef.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCopilotOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ChatCopilot
                project={project}
                initialRole={copilotRole}
                onApplyProjectUpdate={updateProject}
                onClose={() => setIsCopilotOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Voice Conversation Modal */}
      <LiveVoiceConversation
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />

      {/* Export & Use in App Modal */}
      {showExportModal && (
        <ExportModal project={project} onClose={() => setShowExportModal(false)} />
      )}

      {/* Studio History Modal Timeline */}
      <StudioHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        undoStack={undoStack}
        redoStack={redoStack}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onJumpToSnapshot={handleJumpToSnapshot}
        onClearHistory={clearHistory}
        projectName={activeProject.name}
      />

      {/* Floating Undo/Redo Action Toast Notice */}
      {toastNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 border border-indigo-500/40 text-white rounded-full shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none">
          {toastNotice.type === 'undo' ? (
            <RotateCcw className="w-4 h-4 text-indigo-400 shrink-0 animate-spin-reverse" />
          ) : (
            <RotateCw className="w-4 h-4 text-teal-400 shrink-0 animate-spin" />
          )}
          <span>{toastNotice.message}</span>
        </div>
      )}
    </div>
  );
}
