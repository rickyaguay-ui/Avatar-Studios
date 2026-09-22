import React, { useState, useEffect } from 'react';
import {
  StudioProject,
  ImageSize,
  AvatarHairstyle,
  AvatarClothingTop,
  AvatarClothingBottom,
  AvatarShoes,
  AvatarAccessory,
  AvatarBodyType,
  AvatarFraming,
  ProjectAsset,
} from '../types.ts';
import { PREDEFINED_AVATARS } from '../data/presets.ts';
import { soundEngine } from '../utils/audioSynth.ts';
import {
  User,
  Sparkles,
  Check,
  Wand2,
  Loader2,
  AlertCircle,
  Shirt,
  Scissors,
  Glasses,
  Activity,
  Crop,
  Layers,
  RefreshCw,
  FolderPlus,
  Star,
  Play,
  Volume2,
  Square,
  MessageSquare,
  Columns2,
  Undo2,
  Redo2,
} from 'lucide-react';

interface AvatarStudioProps {
  project: StudioProject;
  onChange: (updates: Partial<StudioProject>) => void;
  onSaveAssetToProject?: (asset: ProjectAsset) => void;
  onSetAsStyleAnchor?: (asset: ProjectAsset) => void;
  onPrePlayIntro?: (focusMode?: 'all' | 'avatar_voice_only') => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const AVATAR_VOICES = [
  { id: 'Kore', label: 'Kore (Warm Guide)' },
  { id: 'Puck', label: 'Puck (Energetic Mascot)' },
  { id: 'Charon', label: 'Charon (Deep Commander)' },
  { id: 'Fenrir', label: 'Fenrir (Bold Action)' },
  { id: 'Zephyr', label: 'Zephyr (Smooth Tech)' },
] as const;

const HAIRSTYLES: { id: AvatarHairstyle; label: string }[] = [
  { id: 'cyber_buzzcut', label: 'Cyber Buzzcut' },
  { id: 'long_wavy', label: 'Long Wavy Flow' },
  { id: 'afro_fade', label: 'Afro Taper Fade' },
  { id: 'sleek_bob', label: 'Sleek Chic Bob' },
  { id: 'braided_locs', label: 'Braided Locs' },
  { id: 'spiky_anime', label: 'Dynamic Spiky' },
  { id: 'side_part_slick', label: 'Classic Side Part' },
  { id: 'curly_wild', label: 'Voluminous Curls' },
  { id: 'bald_clean', label: 'Clean Shaved' },
];

const HAIR_COLORS = [
  { id: 'jet_black', label: 'Jet Black', hex: '#111827' },
  { id: 'platinum_blonde', label: 'Platinum Blonde', hex: '#fef08a' },
  { id: 'neon_cyan', label: 'Neon Cyan', hex: '#06b6d4' },
  { id: 'electric_purple', label: 'Electric Violet', hex: '#a855f7' },
  { id: 'auburn', label: 'Warm Auburn', hex: '#b45309' },
  { id: 'silver_white', label: 'Silver White', hex: '#e2e8f0' },
  { id: 'emerald_green', label: 'Emerald Green', hex: '#10b981' },
];

const CLOTHING_TOPS: { id: AvatarClothingTop; label: string }[] = [
  { id: 'cyber_leather_jacket', label: 'Cyberpunk Leather Jacket' },
  { id: 'executive_blazer', label: 'Executive Tailored Blazer' },
  { id: 'techwear_hoodie', label: 'Tactical Techwear Hoodie' },
  { id: 'nanotech_armor', label: 'Nanotech Powered Armor' },
  { id: 'minimal_tshirt', label: 'Minimalist Premium Tee' },
  { id: 'mystic_robe', label: 'Mystic Enchanted Robe' },
  { id: 'flight_bomber', label: 'Retro Flight Bomber' },
];

const CLOTHING_BOTTOMS: { id: AvatarClothingBottom; label: string }[] = [
  { id: 'tactical_cargo_pants', label: 'Tactical Cargo Pants' },
  { id: 'tailored_trousers', label: 'Tailored Slim Trousers' },
  { id: 'cyber_joggers', label: 'Cyber Utility Joggers' },
  { id: 'reinforced_greaves', label: 'Reinforced Armor Greaves' },
  { id: 'denim_jeans', label: 'Classic Dark Denim' },
  { id: 'armored_skirt', label: 'Pleated Combat Skirt' },
];

const SHOES: { id: AvatarShoes; label: string }[] = [
  { id: 'cyber_high_top_sneakers', label: 'High-Top LED Sneakers' },
  { id: 'tactical_combat_boots', label: 'Reinforced Combat Boots' },
  { id: 'polished_oxfords', label: 'Polished Italian Oxfords' },
  { id: 'hover_mag_kicks', label: 'Hover Magnetic Kicks' },
  { id: 'sleek_runners', label: 'Aero Minimal Runners' },
];

const ACCESSORIES: { id: AvatarAccessory; label: string }[] = [
  { id: 'none', label: 'None (Clean)' },
  { id: 'holo_visor', label: 'Holographic Visor' },
  { id: 'wireframe_glasses', label: 'Thin Wireframe Glasses' },
  { id: 'studio_headset', label: 'Over-Ear Studio Headset' },
  { id: 'cybernetic_mask', label: 'Cyber Tech Face Mask' },
  { id: 'gold_chain_choker', label: 'Gold Link Chain' },
  { id: 'neon_earring_cuff', label: 'Neon Ear Cuffs' },
  { id: 'beret_cap', label: 'Modern Beret Cap' },
];

const BODY_TYPES: { id: AvatarBodyType; label: string }[] = [
  { id: 'athletic', label: 'Athletic' },
  { id: 'slender', label: 'Slender' },
  { id: 'muscular', label: 'Muscular / Strong' },
  { id: 'compact_chibi', label: 'Compact / Chibi Mascot' },
  { id: 'cyber_cyborg', label: 'Cybernetic Cyborg' },
  { id: 'curvy', label: 'Curvy / Broad' },
];

const FRAMING_OPTIONS: { id: AvatarFraming; label: string; desc: string }[] = [
  { id: 'bust_portrait', label: 'Bust Portrait', desc: 'Ideal for App Profile Avatars & Chat Heads' },
  { id: 'half_body', label: 'Half-Body', desc: 'Ideal for Visual Novels & Dialogue Box Cutscenes' },
  { id: 'full_body', label: 'Full Figure', desc: 'Ideal for Game Character Sprites & Hero Mascots' },
];

const AVATAR_STYLES = [
  { id: 'illustrated_portrait', label: 'Illustrated Portrait', suffix: ', semi-realistic digital portrait illustration, warm dignified fine-art rendering, expressive hand-painted brushwork, soft natural lighting, clean character presence, like a premium devotional or editorial illustration' },
  { id: 'painterly_cinematic', label: 'Painterly Cinematic', suffix: ', cinematic painterly portrait, dramatic chiaroscuro lighting, expressive brushstroke textures, oil-painting aesthetic, rich warm earth tones, high-contrast heroic composition, like concept art for a prestige film or AAA game' },
  { id: 'motion_comic', label: 'Motion Comic', suffix: ', bold graphic novel comic book illustration, strong ink outline contours, flat color fills with halftone texture accents, dynamic sequential art composition, dramatic panel-ready framing, confident bold line weight' },
  { id: 'watercolor', label: 'Watercolor Portrait', suffix: ', full-body watercolor portrait, fine art watercolor illustration, delicate paint washes, fluid pigments, textured cold-press cotton paper, expressive elegant contour lines, luminous artistic depth' },
  { id: 'anime', label: 'Anime Hero Figure', suffix: ', vibrant modern anime character, crisp cel-shaded lines, dynamic expression, studio character portrait' },
  { id: 'vector', label: 'Modern Flat Mascot', suffix: ', minimalist modern vector mascot character, rounded friendly curves, tech brand onboarding icon' },
  { id: 'pixel', label: '16-Bit Pixel Art', suffix: ', retro 16-bit pixel art sprite portrait, nostalgic arcade game aesthetic, crisp pixels' },
  { id: '3d_cute', label: '3D Animated Stylized', suffix: ', 3D animated character render style, smooth clay, expressive lighting, character bust portrait' },
  { id: 'cyberpunk', label: 'Cyberpunk Operative', suffix: ', cyberpunk digital avatar, neon holographic highlights, futuristic visor, high tech aesthetic, 4k portrait' },
];

export const AvatarStudio: React.FC<AvatarStudioProps> = ({
  project,
  onChange,
  onSaveAssetToProject,
  onSetAsStyleAnchor,
  onPrePlayIntro,
  isSplitView,
  onToggleSplitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [activeTab, setActiveTab] = useState<'customizer' | 'preset'>('customizer');
  const [customDescription, setCustomDescription] = useState(
    project.avatarPrompt || 'A charismatic digital avatar companion with expressive eyes and confident demeanor'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuditioningVoice, setIsAuditioningVoice] = useState(false);

  const handleAuditionVoice = () => {
    if (isAuditioningVoice) {
      soundEngine.stopVoiceover();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsAuditioningVoice(false);
      return;
    }

    const voiceAudio = project.modulatedAudioUrl || project.voiceAudioUrl;
    if (voiceAudio) {
      setIsAuditioningVoice(true);
      soundEngine.playVoiceover(voiceAudio, () => {
        setIsAuditioningVoice(false);
      });
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && project.dialogueText) {
      setIsAuditioningVoice(true);
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(project.dialogueText);
      utter.rate = project.voiceSpeed || 1.0;
      utter.pitch = project.voicePitch || 1.0;
      utter.onend = () => setIsAuditioningVoice(false);
      utter.onerror = () => setIsAuditioningVoice(false);
      window.speechSynthesis.speak(utter);
    }
  };

  useEffect(() => {
    if (project.avatarPrompt && project.avatarPrompt !== customDescription) {
      setCustomDescription(project.avatarPrompt);
    }
  }, [project.avatarPrompt]);

  // Build a comprehensive, highly descriptive prompt from all customization choices
  const buildCompositePrompt = () => {
    const styleObj = AVATAR_STYLES.find((s) => s.id === project.avatarStyle);
    const hair = HAIRSTYLES.find((h) => h.id === project.hairstyle)?.label || 'styled hair';
    const top = CLOTHING_TOPS.find((t) => t.id === project.clothingTop)?.label || 'jacket';
    const bottom = CLOTHING_BOTTOMS.find((b) => b.id === project.clothingBottom)?.label || 'pants';
    const shoes = SHOES.find((s) => s.id === project.shoes)?.label || 'sneakers';
    const acc = project.accessory !== 'none' ? ACCESSORIES.find((a) => a.id === project.accessory)?.label : null;
    const body = BODY_TYPES.find((b) => b.id === project.bodyType)?.label || 'athletic';
    const framing = FRAMING_OPTIONS.find((f) => f.id === project.framing)?.label || 'portrait';

    const hairColorStr = (project.hairColor || 'electric_cyan').replace('_', ' ');
    let prompt = `${framing} of a character with ${body} build, featuring ${hair} in ${hairColorStr} color. Wearing ${top}, paired with ${bottom} and ${shoes}.`;
    if (acc) {
      prompt += ` Accessorized with ${acc}.`;
    }
    if (customDescription.trim()) {
      prompt += ` Personality and detail: ${customDescription.trim()}.`;
    }
    if (project.isolateBackground) {
      prompt += ` Rendered isolated on clean studio dark solid backdrop, high contrast edge lighting, perfectly suited for app UI cutout and transparent asset extraction.`;
    }
    if (styleObj) {
      prompt += styleObj.suffix;
    }
    return prompt;
  };

  const primer = project.stylePrimer;
  const [hasSavedAvatar, setHasSavedAvatar] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setHasSavedAvatar(false);

    const prompt = buildCompositePrompt();

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: project.framing === 'full_body' ? '9:16' : '1:1',
          imageSize: project.avatarSize,
          requestedModel: 'gemini-3.1-flash-image-preview',
          referenceImageUrl: project.styleLockEnabled && primer?.referenceImageUrl ? primer.referenceImageUrl : undefined,
          styleDirectives: project.styleLockEnabled && primer ? primer.styleDirectives : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate avatar');
      }

      onChange({
        avatarMode: 'ai',
        avatarUrl: data.imageUrl,
        avatarPrompt: customDescription,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Avatar generation failed. Check your GEMINI_API_KEY.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToProjectFolder = () => {
    if (!project.avatarUrl || !onSaveAssetToProject) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_avatar_${now}`,
      projectId: project.projectId || 'proj_active',
      name: `${project.title || 'App'} Avatar Figure`,
      folder: 'avatar',
      type: 'image',
      url: project.avatarUrl,
      prompt: customDescription || project.avatarPrompt,
      specs: {
        resolution: project.avatarSize,
        aspectRatio: project.framing === 'full_body' ? '9:16' : '1:1',
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: ['avatar', project.avatarStyle || '3d', project.framing || 'bust_portrait'],
    };
    onSaveAssetToProject(newAsset);
    setHasSavedAvatar(true);
  };

  const handleRandomizeLook = () => {
    const randomHair = HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id;
    const randomColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const randomTop = CLOTHING_TOPS[Math.floor(Math.random() * CLOTHING_TOPS.length)].id;
    const randomBottom = CLOTHING_BOTTOMS[Math.floor(Math.random() * CLOTHING_BOTTOMS.length)].id;
    const randomShoes = SHOES[Math.floor(Math.random() * SHOES.length)].id;
    const randomAcc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id;
    const randomBody = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)].id;

    onChange({
      hairstyle: randomHair,
      hairColor: randomColor,
      clothingTop: randomTop,
      clothingBottom: randomBottom,
      shoes: randomShoes,
      accessory: randomAcc,
      bodyType: randomBody,
    });
  };

  return (
    <div id="avatar-studio" className="space-y-6">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Avatar Figure &amp; Wardrobe Studio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Design diverse avatars with custom hairstyles, outfits, accessories, and body types for your apps
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onUndo && (
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                id="btn-avatar-undo"
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                  canUndo
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title="Undo avatar modification (Ctrl+Z / ⌘Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Undo</span>
              </button>
              <button
                id="btn-avatar-redo"
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                  canRedo
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title="Redo avatar modification (Ctrl+Y / ⌘⇧Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Redo</span>
              </button>
            </div>
          )}

          <button
            id="btn-randomize-avatar"
            type="button"
            onClick={handleRandomizeLook}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Randomize avatar look"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            Randomize Look
          </button>

          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              id="tab-avatar-customizer"
              type="button"
              onClick={() => setActiveTab('customizer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'customizer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              Wardrobe &amp; Customizer
            </button>
            <button
              id="tab-avatar-preset"
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'preset'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Presets
            </button>
          </div>
        </div>
      </div>

      {/* Active Character & Voice Companion Hub - Build and View Central */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Avatar figure thumbnail + details */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-400/60 shadow-lg shrink-0 group">
              <img
                src={project.avatarUrl}
                alt="Active Avatar Mascot"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs py-0.5 text-center text-[9px] font-mono text-indigo-300 uppercase">
                {project.avatarPose} stage
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">
                  {project.title || 'App'} Mascot
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {project.avatarStyle.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {(project.framing || 'portrait').replace('_', ' ')}
                </span>
              </div>

              {/* Voice assignment and emotion */}
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                  Voice Cast:
                </span>
                <select
                  id="avatar-voice-quick-select"
                  value={project.selectedVoice}
                  onChange={(e) => onChange({ selectedVoice: e.target.value as any })}
                  className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded-md text-teal-300 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {AVATAR_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  Tone: {project.speechEmotion}
                </span>
              </div>

              {/* Active dialogue speech quote with quick inline editing */}
              <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-300 italic max-w-xl">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 not-italic" />
                <span className="truncate max-w-[260px] sm:max-w-md">"{project.dialogueText}"</span>
              </div>
            </div>
          </div>

          {/* Direct Pre-Play Intro Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
            <button
              id="btn-audition-avatar-voice"
              type="button"
              onClick={handleAuditionVoice}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAuditioningVoice
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-teal-300 border-teal-500/30'
              }`}
              title="Quickly test avatar dialogue voice speech"
            >
              {isAuditioningVoice ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>{isAuditioningVoice ? 'Stop Speech' : 'Audition Voice'}</span>
            </button>

            {onPrePlayIntro && (
              <>
                <button
                  id="btn-preplay-solo-avatar"
                  type="button"
                  onClick={() => onPrePlayIntro('avatar_voice_only')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Audition only the avatar character and spoken dialogue against clean spotlight"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pre-Play Avatar &amp; Voice</span>
                </button>

                <button
                  id="btn-preplay-live-intro"
                  type="button"
                  onClick={() => onPrePlayIntro('all')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all cursor-pointer"
                  title="Launch full Play Intro simulation with avatar, voice, background and music"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Pre-Play Full Intro</span>
                </button>
              </>
            )}

            {onToggleSplitView && (
              <button
                type="button"
                onClick={onToggleSplitView}
                className={`p-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                  isSplitView
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title={isSplitView ? 'Disable Split Live View' : 'Enable Split Side-by-Side Live View'}
              >
                <Columns2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Avatars View */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PREDEFINED_AVATARS.map((avatar) => {
              const isSelected = project.avatarUrl === avatar.imageUrl;
              return (
                <div
                  key={avatar.id}
                  id={`avatar-preset-${avatar.id}`}
                  onClick={() => {
                    onChange({
                      avatarMode: 'preset',
                      avatarUrl: avatar.imageUrl,
                      selectedVoice: avatar.voice,
                      dialogueText: avatar.defaultDialogue,
                    });
                  }}
                  className={`group rounded-xl overflow-hidden cursor-pointer border p-3 flex flex-col items-center text-center transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2.5 relative border-2 border-slate-700 group-hover:border-indigo-400 transition-colors">
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-100">{avatar.name}</span>
                  <span className="text-[10px] text-slate-400 mb-1">{avatar.role}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                    Voice: {avatar.voice}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comprehensive Customizer View */}
      {activeTab === 'customizer' && (
        <div className="space-y-6">
          {/* Custom Description */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Avatar Character Personality &amp; Specific Details</span>
                <span className="text-[11px] font-normal text-slate-400">gemini-3-pro-image-preview</span>
              </label>
              <input
                id="avatar-custom-description"
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="E.g. Friendly AI android guide with warm golden eyes and subtle cyber freckles..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* In-App Suitability Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              {/* Framing / Composition */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Crop className="w-3.5 h-3.5 text-indigo-400" />
                  In-App Framing
                </label>
                <select
                  id="avatar-framing-select"
                  value={project.framing}
                  onChange={(e) => onChange({ framing: e.target.value as AvatarFraming })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {FRAMING_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.id === 'bust_portrait' ? 'App Avatar' : opt.id === 'half_body' ? 'Dialogue Cutscene' : 'Game Sprite'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Resolution Affordance (1K, 2K, 4K) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Resolution (gemini-3-pro)
                </label>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                  {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                    <button
                      key={size}
                      id={`avatar-res-${size}`}
                      type="button"
                      onClick={() => onChange({ avatarSize: size })}
                      className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                        project.avatarSize === size
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clean Backdrop Toggle for In-App Cutout */}
              <div className="flex flex-col justify-center">
                <label className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Isolate for App Cutout</span>
                  <input
                    id="toggle-isolate-bg"
                    type="checkbox"
                    checked={project.isolateBackground}
                    onChange={(e) => onChange({ isolateBackground: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 w-4 h-4 cursor-pointer"
                  />
                </label>
                <span className="text-[10px] text-slate-400">
                  High-contrast studio backdrop optimized for transparent app extraction
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Customization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Hair & Hair Color */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                Hairstyle &amp; Color
              </h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hairstyle</label>
                <select
                  id="avatar-hair-select"
                  value={project.hairstyle}
                  onChange={(e) => onChange({ hairstyle: e.target.value as AvatarHairstyle })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {HAIRSTYLES.map((hair) => (
                    <option key={hair.id} value={hair.id}>
                      {hair.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">Hair Color</label>
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((color) => {
                    const isSelected = project.hairColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => onChange({ hairColor: color.id })}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-600"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Body Type & Character Style */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Body Type &amp; Art Style
              </h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Body Build</label>
                <select
                  id="avatar-body-select"
                  value={project.bodyType}
                  onChange={(e) => onChange({ bodyType: e.target.value as AvatarBodyType })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {BODY_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Visual Art Direction</label>
                <select
                  id="avatar-art-style-select"
                  value={project.avatarStyle}
                  onChange={(e) => onChange({ avatarStyle: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {AVATAR_STYLES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Clothing Items: Tops & Bottoms */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Shirt className="w-3.5 h-3.5 text-indigo-400" />
                Clothing Outfit (Tops &amp; Bottoms)
              </h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Top Garment</label>
                <select
                  id="avatar-clothing-top-select"
                  value={project.clothingTop}
                  onChange={(e) => onChange({ clothingTop: e.target.value as AvatarClothingTop })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CLOTHING_TOPS.map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bottoms / Pants</label>
                <select
                  id="avatar-clothing-bottom-select"
                  value={project.clothingBottom}
                  onChange={(e) => onChange({ clothingBottom: e.target.value as AvatarClothingBottom })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CLOTHING_BOTTOMS.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                      {bot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Shoes & Accessories */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Glasses className="w-3.5 h-3.5 text-indigo-400" />
                Shoes &amp; Accessories (Hats, Glasses, Jewelry)
              </h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Footwear / Shoes</label>
                <select
                  id="avatar-shoes-select"
                  value={project.shoes}
                  onChange={(e) => onChange({ shoes: e.target.value as AvatarShoes })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {SHOES.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Accessory Item</label>
                <select
                  id="avatar-accessory-select"
                  value={project.accessory}
                  onChange={(e) => onChange({ accessory: e.target.value as AvatarAccessory })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {ACCESSORIES.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Generated Prompt Preview */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Live Synthesized AI Prompt
            </span>
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
              {buildCompositePrompt()}
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generate Button & Project Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              {onSaveAssetToProject && project.avatarUrl && (
                <button
                  type="button"
                  onClick={handleSaveToProjectFolder}
                  disabled={hasSavedAvatar}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    hasSavedAvatar
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {hasSavedAvatar ? <Check className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{hasSavedAvatar ? 'Saved to Project' : 'Save Avatar to Project Folder'}</span>
                </button>
              )}

              {onSetAsStyleAnchor && project.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const now = Date.now();
                    onSetAsStyleAnchor({
                      id: `asset_avatar_${now}`,
                      projectId: project.projectId || 'proj_active',
                      name: `${project.title || 'App'} Avatar Figure`,
                      folder: 'avatar',
                      type: 'image',
                      url: project.avatarUrl!,
                      prompt: customDescription || project.avatarPrompt,
                      specs: { resolution: project.avatarSize },
                      isStyleAnchor: true,
                      createdAt: now,
                      tags: ['avatar', 'anchor'],
                    });
                  }}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                  title="Make this avatar figure the visual style anchor for this app project"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Set as Style Anchor</span>
                </button>
              )}

              {onPrePlayIntro && project.avatarUrl && (
                <button
                  type="button"
                  onClick={() => onPrePlayIntro('all')}
                  className="px-3 py-2 bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  title="Pre-play live intro sequence with this avatar"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Pre-Play in Intro</span>
                </button>
              )}
            </div>

            <button
              id="btn-generate-custom-avatar"
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Custom Avatar ({project.avatarSize})...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Generate Custom Avatar Figure
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Screen Placement */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">In-App Intro Stage Position:</span>
        </div>
        <div className="flex items-center gap-2">
          {(['left', 'center', 'right'] as const).map((pose) => (
            <button
              key={pose}
              id={`avatar-pose-${pose}`}
              type="button"
              onClick={() => onChange({ avatarPose: pose })}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                project.avatarPose === pose
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pose}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
