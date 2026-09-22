import React, { useState, useEffect } from 'react';
import { StudioProject, ImageSize, AspectRatio, ProjectAsset } from '../types.ts';
import { PREDEFINED_SCENES } from '../data/presets.ts';
import {
  Sparkles,
  Image as ImageIcon,
  Check,
  Loader2,
  Wand2,
  Maximize2,
  Music,
  AlertCircle,
  FolderPlus,
  Lock,
  Play,
  Undo2,
  Redo2,
} from 'lucide-react';

interface BackgroundStudioProps {
  project: StudioProject;
  onChange: (updates: Partial<StudioProject>) => void;
  onSelectMusicTrack?: (trackId: string) => void;
  onSaveAssetToProject?: (asset: ProjectAsset) => void;
  onPrePlayIntro?: (focusMode?: 'all' | 'avatar_voice_only') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const STYLE_PRESETS = [
  { id: 'cinematic', label: 'Cinematic Photoreal', suffix: ', 8k cinematic lighting, photorealistic, atmospheric depth of field, high detail' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', suffix: ', futuristic neon glow, volumetric fog, dark cyberpunk aesthetic, high resolution' },
  { id: 'anime', label: 'Makoto Shinkai Anime', suffix: ', beautiful anime scenery style, lush sky clouds, painterly vibrant lighting, 4k' },
  { id: 'vector', label: 'Modern Minimal Vector', suffix: ', clean vector art, soft isometric gradients, minimalist tech aesthetic, pristine' },
  { id: 'fantasy', label: 'Epic Fantasy Matte', suffix: ', fantasy concept art, mystical glowing lights, intricate scenery, majestic atmosphere' },
];

export const BackgroundStudio: React.FC<BackgroundStudioProps> = ({
  project,
  onChange,
  onSelectMusicTrack,
  onSaveAssetToProject,
  onPrePlayIntro,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'ai'>('preset');
  const [prompt, setPrompt] = useState(project.backgroundPrompt || 'A futuristic glass skyscraper observatory overlooking a glowing cybernetic sunset city');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSavedBackground, setHasSavedBackground] = useState(false);

  useEffect(() => {
    if (project.backgroundPrompt && project.backgroundPrompt !== prompt) {
      setPrompt(project.backgroundPrompt);
    }
  }, [project.backgroundPrompt]);

  const primer = project.stylePrimer;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setHasSavedBackground(false);

    const style = STYLE_PRESETS.find(s => s.id === selectedStyle);
    const fullPrompt = `${prompt}${style ? style.suffix : ''}`;

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: project.backgroundAspect,
          imageSize: project.backgroundSize,
          requestedModel: 'gemini-3.1-flash-image-preview',
          referenceImageUrl: project.styleLockEnabled && primer?.referenceImageUrl ? primer.referenceImageUrl : undefined,
          styleDirectives: project.styleLockEnabled && primer ? primer.styleDirectives : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate background image');
      }

      onChange({
        backgroundMode: 'ai',
        backgroundUrl: data.imageUrl,
        backgroundPrompt: prompt,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Image generation failed. Please ensure GEMINI_API_KEY is configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToProjectFolder = () => {
    if (!project.backgroundUrl || !onSaveAssetToProject) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_bg_${now}`,
      projectId: project.projectId || 'proj_active',
      name: `${project.title || 'App'} Background (${project.backgroundSize || '2K'})`,
      folder: 'background',
      type: 'image',
      url: project.backgroundUrl,
      prompt: project.backgroundPrompt || prompt,
      specs: {
        resolution: project.backgroundSize,
        aspectRatio: project.backgroundAspect,
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: ['background', project.backgroundMode || 'preset'],
    };
    onSaveAssetToProject(newAsset);
    setHasSavedBackground(true);
  };

  return (
    <div id="background-studio" className="space-y-6">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            Background &amp; Scenery Studio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a curated scene or generate custom 1K-4K backgrounds with Gemini Pro
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onUndo && (
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                id="btn-bg-undo"
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                  canUndo
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title="Undo background modification (Ctrl+Z / ⌘Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Undo</span>
              </button>
              <button
                id="btn-bg-redo"
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                  canRedo
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title="Redo background modification (Ctrl+Y / ⌘⇧Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Redo</span>
              </button>
            </div>
          )}

          {onPrePlayIntro && (
            <button
              id="btn-bg-preplay-live-intro"
              type="button"
              onClick={() => onPrePlayIntro('all')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Pre-play this background in Live App Intro"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Pre-Play Scene</span>
            </button>
          )}

          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              id="tab-preset-bg"
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'preset'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Curated Library
            </button>
            <button
              id="tab-ai-bg"
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              AI Prompt Generator
            </button>
          </div>
        </div>
      </div>

      {/* Predefined Library Tab */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Predefined atmospheric scenes paired with complementary music &amp; voice tones:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PREDEFINED_SCENES.map((scene) => {
              const isSelected = project.backgroundUrl === scene.imageUrl;
              return (
                <div
                  key={scene.id}
                  id={`preset-scene-${scene.id}`}
                  onClick={() => {
                    onChange({
                      backgroundMode: 'preset',
                      backgroundUrl: scene.imageUrl,
                    });
                    if (onSelectMusicTrack) {
                      onSelectMusicTrack(scene.suggestedMusic);
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                  }`}
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-indigo-300 border border-indigo-500/20">
                      {scene.category}
                    </span>

                    {isSelected && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold text-white truncate mr-2">{scene.title}</span>
                      <span className="flex items-center gap-1 text-slate-400 bg-black/40 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                        <Music className="w-3 h-3 text-indigo-400" />
                        Paired
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {scene.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Prompt Generator Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Text Prompt for Custom Background</span>
              <span className="text-[11px] font-normal text-slate-400">Powered by gemini-3-pro-image-preview</span>
            </label>
            <textarea
              id="bg-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your desired app background scene in vivid visual detail..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Controls row: Size, Aspect Ratio, Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Resolution Affordance (1K, 2K, 4K) */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Resolution (gemini-3-pro)
              </label>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    id={`bg-size-${size}`}
                    type="button"
                    onClick={() => onChange({ backgroundSize: size })}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                      project.backgroundSize === size
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Affordance */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Aspect Ratio
              </label>
              <select
                id="bg-aspect-ratio"
                value={project.backgroundAspect}
                onChange={(e) => onChange({ backgroundAspect: e.target.value as AspectRatio })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="16:9">16:9 (Landscape / Web)</option>
                <option value="9:16">9:16 (Portrait / Mobile Intro)</option>
                <option value="1:1">1:1 (Square / App Card)</option>
                <option value="4:3">4:3 (Tablet / Window)</option>
              </select>
            </div>

            {/* Aesthetic Style Preset */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Visual Art Style
              </label>
              <select
                id="bg-style-preset"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {STYLE_PRESETS.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {onSaveAssetToProject && project.backgroundUrl && (
              <button
                type="button"
                onClick={handleSaveToProjectFolder}
                disabled={hasSavedBackground}
                className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasSavedBackground
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {hasSavedBackground ? <Check className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{hasSavedBackground ? 'Saved to Project' : 'Save Background to Project Folder'}</span>
              </button>
            )}

            {onPrePlayIntro && project.backgroundUrl && (
              <button
                type="button"
                onClick={() => onPrePlayIntro('all')}
                className="px-3 py-2 bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Pre-play live intro sequence with this background"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Pre-Play in Intro</span>
              </button>
            )}

            <button
              id="btn-generate-bg"
              type="button"
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-md hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating {project.backgroundSize} Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Generate High-Res Background
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Animation & Camera Movement Options */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">App Intro Camera Motion:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(['zoom', 'pan', 'pulse', 'none'] as const).map((mode) => (
            <button
              key={mode}
              id={`motion-mode-${mode}`}
              type="button"
              onClick={() => onChange({ backgroundAnimation: mode })}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors ${
                project.backgroundAnimation === mode
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
              }`}
            >
              {mode === 'zoom' ? 'Ken Burns Zoom' : mode === 'pan' ? 'Cinematic Pan' : mode === 'pulse' ? 'Soft Glow' : 'Static'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
