import React, { useState, useEffect } from 'react';
import {
  ProjectFolder,
  ProjectAsset,
  UIArtType,
  ImageSize,
  AspectRatio,
} from '../types.ts';
import { buildStylePrimedPrompt } from '../data/projectPresets.ts';
import {
  Sparkles,
  Download,
  FolderPlus,
  Star,
  Check,
  RotateCw,
  Sliders,
  Layers,
  Palette,
  Shield,
  Smartphone,
  Layout,
  Award,
  Zap,
} from 'lucide-react';

interface UIArtStudioProps {
  activeProject: ProjectFolder;
  onSaveAssetToProject: (asset: ProjectAsset) => void;
  onSetAsStyleAnchor: (asset: ProjectAsset) => void;
  injectedPrompt?: string;
}

interface UIArtPreset {
  id: UIArtType;
  label: string;
  aspectRatio: AspectRatio;
  icon: React.ReactNode;
  description: string;
  defaultPrompt: string;
}

const UI_ART_PRESETS: UIArtPreset[] = [
  {
    id: 'app_icon',
    label: 'App Launcher Icon',
    aspectRatio: '1:1',
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Rounded squircle launcher icon with glossy finish for iOS & Android app stores.',
    defaultPrompt: 'Modern high-tech app launcher icon with rounded squircle borders, glowing central emblem, polished glass and subtle bevels',
  },
  {
    id: 'splash_banner',
    label: 'Hero Splash Banner',
    aspectRatio: '16:9',
    icon: <Layout className="w-4 h-4" />,
    description: 'Cinematic wide banner for landing pages, App Store features, or onboarding headers.',
    defaultPrompt: 'Cinematic widescreen hero splash banner showcasing futuristic interface elements floating over an ambient depth backdrop',
  },
  {
    id: 'card_graphic',
    label: 'Feature Card Graphic',
    aspectRatio: '4:3',
    icon: <Layers className="w-4 h-4" />,
    description: 'Rich illustration for onboarding carousel slides, feature lists, and modals.',
    defaultPrompt: 'Isolated 3D feature illustration of interactive cloud servers and glowing data analytics nodes with soft shadow',
  },
  {
    id: 'badge',
    label: 'Achievement Badge',
    aspectRatio: '1:1',
    icon: <Award className="w-4 h-4" />,
    description: 'Gamification reward token, mastery emblem, or level-up medal for user progression.',
    defaultPrompt: 'Ornate gamification achievement badge medal with golden laurels, central gem, and radiant aura, clean isolated background',
  },
  {
    id: 'button_sprite',
    label: 'UI Button / Emblem',
    aspectRatio: '1:1',
    icon: <Zap className="w-4 h-4" />,
    description: 'Custom interactive action button, currency token, or mascot icon.',
    defaultPrompt: 'Chunky tactile 3D interactive button icon with metallic trim and glowing power core, game UI style',
  },
];

export function UIArtStudio({
  activeProject,
  onSaveAssetToProject,
  onSetAsStyleAnchor,
  injectedPrompt,
}: UIArtStudioProps) {
  const primer = activeProject.stylePrimer;
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [sourceImageUrl, setSourceImageUrl] = useState<string>('');
  const [selectedType, setSelectedType] = useState<UIArtType>('app_icon');
  const [customPrompt, setCustomPrompt] = useState(UI_ART_PRESETS[0].defaultPrompt);
  const [editInstruction, setEditInstruction] = useState('Add glowing neon circuit lines and golden trim');
  const [resolution, setResolution] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('Nexus App Icon');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (injectedPrompt && injectedPrompt !== customPrompt) {
      setCustomPrompt(injectedPrompt);
    }
  }, [injectedPrompt]);

  const activePreset = UI_ART_PRESETS.find((p) => p.id === selectedType) || UI_ART_PRESETS[0];

  const handleSelectPreset = (preset: UIArtPreset) => {
    setSelectedType(preset.id);
    setAspectRatio(preset.aspectRatio);
    setCustomPrompt(preset.defaultPrompt);
    setAssetName(`${activeProject.name.split(' ')[0]} ${preset.label}`);
    setIsSaved(false);
  };

  const handleGenerateUIArt = async () => {
    const activePromptText = mode === 'edit' ? editInstruction : customPrompt;
    if (!activePromptText.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setIsSaved(false);

    try {
      // Build the primed prompt
      const primedPrompt = primer.locked && mode === 'create'
        ? buildStylePrimedPrompt(customPrompt, primer, 'ui_art')
        : activePromptText;

      const payload: any = {
        prompt: primedPrompt,
        aspectRatio,
        imageSize: resolution,
        requestedModel: 'gemini-3.1-flash-image-preview',
        isEdit: mode === 'edit',
        sourceImageUrl: mode === 'edit' ? (sourceImageUrl || generatedImageUrl) : undefined,
        referenceImageUrl: primer.locked && primer.referenceImageUrl ? primer.referenceImageUrl : undefined,
        styleDirectives: primer.locked ? primer.styleDirectives : undefined,
      };

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate UI art');
      }

      const data = await res.json();
      setGeneratedImageUrl(data.imageUrl);
      if (mode === 'create') {
        setSourceImageUrl(data.imageUrl);
      }
    } catch (err: any) {
      console.error('UI Art Generation error:', err);
      setErrorMsg(err.message || 'Error communicating with generation engine');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToProject = () => {
    if (!generatedImageUrl) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_ui_${now}`,
      projectId: activeProject.id,
      name: assetName.trim() || `${activePreset.label} Asset`,
      folder: 'ui_art',
      type: 'image',
      url: generatedImageUrl,
      prompt: customPrompt,
      specs: {
        resolution,
        aspectRatio,
        uiType: selectedType,
        format: 'PNG',
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: ['ui_art', selectedType, activeProject.stylePrimer.styleName.toLowerCase().replace(/\s+/g, '_')],
    };

    onSaveAssetToProject(newAsset);
    setIsSaved(true);
  };

  const handleMakeStyleAnchor = () => {
    if (!generatedImageUrl) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_ui_${now}`,
      projectId: activeProject.id,
      name: assetName.trim() || `${activePreset.label} Asset`,
      folder: 'ui_art',
      type: 'image',
      url: generatedImageUrl,
      prompt: customPrompt,
      specs: {
        resolution,
        aspectRatio,
        uiType: selectedType,
        format: 'PNG',
      },
      isStyleAnchor: true,
      createdAt: now,
      tags: ['ui_art', selectedType, 'anchor'],
    };

    onSetAsStyleAnchor(newAsset);
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner: Style Primed Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              App UI Art &amp; Icon Studio
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Style Primed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Produce app launcher icons, splash headers, feature cards, and achievement badges locked to{' '}
            <strong className="text-slate-200">{activeProject.name}</strong>&apos;s visual style.
          </p>
        </div>

        {/* Style Anchor Mini Pill */}
        <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          {primer.referenceImageUrl ? (
            <img
              src={primer.referenceImageUrl}
              alt="Primer Anchor"
              className="w-7 h-7 rounded-lg object-cover border border-indigo-500/40"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <span className="text-[10px] text-indigo-300 font-bold block">Active Anchor:</span>
            <span className="text-white font-medium text-[11px] truncate max-w-[130px] block">
              {primer.styleName}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            mode === 'create'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Create New Asset (gemini-3.1-flash-image-preview)
        </button>
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            mode === 'edit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5 text-cyan-300" />
          Edit Image with Text Prompts
        </button>
      </div>

      {mode === 'create' ? (
        /* Preset Selector Chips */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {UI_ART_PRESETS.map((preset) => {
            const isSelected = selectedType === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={isSelected ? 'text-white' : 'text-indigo-400'}>{preset.icon}</span>
                  <span className="text-xs font-bold leading-tight">{preset.label}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'} line-clamp-2`}>
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Edit Mode Source Selector */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Select Image to Edit
          </label>
          <p className="text-[11px] text-slate-400">
            Pick from your project assets or provide an image URL to modify using gemini-3.1-flash-image-preview.
          </p>

          <div className="flex flex-wrap gap-2">
            {activeProject.assets.filter((a) => a.type === 'image').map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSourceImageUrl(asset.url)}
                className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition ${
                  sourceImageUrl === asset.url
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img src={asset.url} alt={asset.name} className="w-8 h-8 rounded object-cover" />
                <span className="max-w-[120px] truncate text-[11px]">{asset.name}</span>
              </button>
            ))}
            {generatedImageUrl && (
              <button
                type="button"
                onClick={() => setSourceImageUrl(generatedImageUrl)}
                className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition ${
                  sourceImageUrl === generatedImageUrl
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img src={generatedImageUrl} alt="Current" className="w-8 h-8 rounded object-cover" />
                <span className="text-[11px]">Current Preview</span>
              </button>
            )}
          </div>

          <input
            type="text"
            value={sourceImageUrl}
            onChange={(e) => setSourceImageUrl(e.target.value)}
            placeholder="Or paste an image URL or data URL..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Controls & Generation Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        {/* Prompt Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
            <span>{mode === 'create' ? 'UI Art Description' : 'Text Prompt Edit Instructions'}</span>
            <span className="text-indigo-400 normal-case font-normal text-[11px]">
              {mode === 'create' ? 'Style Primer directives will be automatically attached' : 'gemini-3.1-flash-image-preview'}
            </span>
          </label>
          <textarea
            rows={3}
            value={mode === 'create' ? customPrompt : editInstruction}
            onChange={(e) => mode === 'create' ? setCustomPrompt(e.target.value) : setEditInstruction(e.target.value)}
            placeholder={
              mode === 'create'
                ? 'Describe the UI element, symbols, materials, bevels, lighting...'
                : 'Describe what to edit (e.g., "Add neon circuit borders and gold highlights", "Change style to cyberpunk neon")'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Configurations: Resolution & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['1K', '2K', '4K'] as ImageSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setResolution(sz)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    resolution === sz
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['1:1', '16:9', '4:3'] as AspectRatio[]).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    aspectRatio === ar
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Asset Filing Label
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Nexus Launcher Icon"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerateUIArt}
          disabled={isGenerating || !customPrompt.trim()}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-white" />
              <span>Synthesizing Style-Primed UI Art ({resolution})...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Generate {activePreset.label} in {primer.styleName}</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Art Preview & Filing Panel */}
      {generatedImageUrl && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-center">
          <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-800">
            <div
              className={`overflow-hidden shadow-2xl border border-white/10 ${
                selectedType === 'app_icon' ? 'rounded-3xl max-w-[240px]' : 'rounded-xl max-w-full'
              }`}
            >
              <img
                src={generatedImageUrl}
                alt={assetName}
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                Generated Asset Preview
              </span>
              <h3 className="text-base font-bold text-white">{assetName}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">
                &quot;{customPrompt}&quot;
              </p>

              <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {resolution} • {aspectRatio}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                  {primer.styleName}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Folder: ui_art
                </span>
              </div>
            </div>

            {/* Actions: Save to Project / Set Anchor / Download */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveToProject}
                disabled={isSaved}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved to Project' : 'Save to Project Folder'}</span>
              </button>

              <button
                type="button"
                onClick={handleMakeStyleAnchor}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="Use this UI piece as the visual anchor for all future generations"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Set as Style Anchor</span>
              </button>

              <a
                href={generatedImageUrl}
                download={`${assetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                title="Download full resolution image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
