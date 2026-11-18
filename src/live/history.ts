// Version history for one generated image. Nothing is ever deleted: edits append, Undo/Redo walk the path the user took,
// and "Use this one" jumps to any earlier version.
import type { PromptRecord } from './promptRecord';

export interface ImageVersion {
  id: number;
  url: string;
  record: PromptRecord;
  label: string;                         // "Original", "Edit: add a professor", "Refine: Closer shot"
  method: 'generate' | 'edit' | 'seed';  // generated, true image edit, or same-seed regeneration
}

export interface ImageHistory { versions: ImageVersion[]; current: number; undo: number[]; redo: number[] }

export const newHistory = (v: ImageVersion): ImageHistory => ({ versions: [v], current: 0, undo: [], redo: [] });

export function pushVersion(h: ImageHistory, v: ImageVersion): ImageHistory {
  const versions = [...h.versions, v];
  return { versions, current: versions.length - 1, undo: [...h.undo, h.current], redo: [] };
}

export function undo(h: ImageHistory): ImageHistory {
  if (!h.undo.length) return h;
  const prev = h.undo[h.undo.length - 1];
  return { ...h, current: prev, undo: h.undo.slice(0, -1), redo: [...h.redo, h.current] };
}

export function redo(h: ImageHistory): ImageHistory {
  if (!h.redo.length) return h;
  const next = h.redo[h.redo.length - 1];
  return { ...h, current: next, redo: h.redo.slice(0, -1), undo: [...h.undo, h.current] };
}

export function useVersion(h: ImageHistory, index: number): ImageHistory {
  if (index < 0 || index >= h.versions.length || index === h.current) return h;
  return { ...h, current: index, undo: [...h.undo, h.current], redo: [] };
}

export const currentVersion = (h: ImageHistory): ImageVersion => h.versions[h.current];
