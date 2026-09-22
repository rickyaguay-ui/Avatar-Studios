import React from 'react';
import { HistoryItem } from '../hooks/useStudioHistory.ts';
import {
  History,
  X,
  RotateCcw,
  RotateCw,
  User,
  Volume2,
  Image as ImageIcon,
  Music,
  Folder,
  Sliders,
  CheckCircle2,
  Trash2,
  Command,
} from 'lucide-react';

interface StudioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  undoStack: HistoryItem[];
  redoStack: HistoryItem[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onJumpToSnapshot: (id: string) => void;
  onClearHistory: () => void;
  projectName: string;
}

export const StudioHistoryModal: React.FC<StudioHistoryModalProps> = ({
  isOpen,
  onClose,
  undoStack,
  redoStack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onJumpToSnapshot,
  onClearHistory,
  projectName,
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: HistoryItem['category']) => {
    switch (category) {
      case 'avatar':
        return <User className="w-3.5 h-3.5 text-indigo-400" />;
      case 'voice':
        return <Volume2 className="w-3.5 h-3.5 text-sky-400" />;
      case 'background':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'music':
        return <Music className="w-3.5 h-3.5 text-pink-400" />;
      case 'project':
        return <Folder className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sliders className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category: HistoryItem['category']) => {
    switch (category) {
      case 'avatar':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'voice':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'background':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'music':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'project':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalActions = undoStack.length + redoStack.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Studio Modification Timeline
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {undoStack.length} undoable / {redoStack.length} redoable
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Project: <span className="text-indigo-300 font-medium">{projectName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalActions > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Clear modification history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Undo / Redo Actions Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              id="modal-btn-undo"
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition cursor-pointer ${
                canUndo
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  : 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Step Back (Undo)</span>
            </button>

            <button
              id="modal-btn-redo"
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition cursor-pointer ${
                canRedo
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  : 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Step Forward (Redo)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 hidden sm:flex">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                ⌘Z
              </kbd>
              Undo
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                ⌘⇧Z
              </kbd>
              Redo
            </span>
          </div>
        </div>

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[260px] max-h-[480px]">
          {totalActions === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300 mb-1">
                No Modifications Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Customize avatar hairstyles, switch voice actors, change backdrops, or tune pitch to build an undoable history log.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Redoable Future Snapshots (if any) */}
              {redoStack.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
                    <span>Redoable Future Steps ({redoStack.length})</span>
                    <span className="text-[9px] text-slate-600">Undone actions</span>
                  </div>
                  <div className="space-y-1.5 opacity-65 hover:opacity-100 transition-opacity">
                    {[...redoStack].reverse().map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-400 hover:border-indigo-500/40 transition"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-1 rounded bg-slate-800 text-slate-400">
                            {getCategoryIcon(item.category)}
                          </div>
                          <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded border ${getCategoryBadgeClass(item.category)}`}>
                            {item.category.toUpperCase()}
                          </span>
                          <span className="truncate font-medium text-slate-300">
                            {item.description}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current State Marker */}
              <div className="flex items-center gap-2 py-1 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Studio State (Live)
                </span>
                <div className="flex-1 h-px bg-emerald-500/30 ml-2" />
              </div>

              {/* Past Snapshots (Undoable Stack) */}
              {undoStack.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                    <span>Previous Steps ({undoStack.length})</span>
                    <span className="text-[9px] text-slate-500">Click to revert</span>
                  </div>
                  <div className="space-y-1.5">
                    {[...undoStack].reverse().map((item, reverseIdx) => {
                      const actualIdx = undoStack.length - 1 - reverseIdx;
                      const isImmediatePrevious = reverseIdx === 0;

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition group ${
                            isImmediatePrevious
                              ? 'bg-slate-950/80 border-indigo-500/40 hover:border-indigo-500 shadow-xs'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="p-1 rounded bg-slate-800">
                              {getCategoryIcon(item.category)}
                            </div>
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-semibold rounded border ${getCategoryBadgeClass(
                                item.category
                              )}`}
                            >
                              {item.category.toUpperCase()}
                            </span>
                            <span className="truncate font-medium text-slate-200 group-hover:text-white">
                              {item.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] text-slate-500">
                              {formatTime(item.timestamp)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onJumpToSnapshot(item.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-md text-[10px] font-semibold transition cursor-pointer"
                              title="Revert back to this snapshot"
                            >
                              Revert
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            History is saved per project folder and auto-batches continuous slider tweaks.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
