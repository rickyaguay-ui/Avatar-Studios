export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3' | '3:4';

export interface PredefinedScene {
  id: string;
  title: string;
  category: 'Cyberpunk' | 'Modern Tech' | 'Fantasy' | 'Retro Gaming' | 'Minimalist' | 'Cosmic';
  imageUrl: string;
  suggestedMusic: string;
  suggestedTone: string;
  description: string;
}

export interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  defaultDialogue: string;
  tag: string;
}

export interface MusicTrack {
  id: string;
  name: string;
  bpm: number;
  mood: string;
  genre: 'lofi' | 'synthwave' | 'epic' | 'chiptune' | 'ambient' | 'corporate';
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: Array<{
      web?: {
        uri?: string;
        title?: string;
      };
    }>;
    groundingSupports?: any[];
  } | null;
  actionPayload?: {
    type: 'background_prompt' | 'avatar_prompt' | 'dialogue_script' | 'music_style';
    value: string;
  };
}

export type ChatRole = 
  | 'intro_director'
  | 'avatar_designer'
  | 'dialogue_writer'
  | 'background_artist'
  | 'music_composer'
  | 'video_director'
  | 'ui_designer'
  | 'voice_actor';

export type GeminiModel = 
  | 'gemini-3.1-pro-preview' 
  | 'gemini-3.5-flash' 
  | 'gemini-3.1-flash-lite';

export type AvatarHairstyle = 
  | 'cyber_buzzcut' 
  | 'long_wavy' 
  | 'afro_fade' 
  | 'sleek_bob' 
  | 'braided_locs' 
  | 'spiky_anime' 
  | 'side_part_slick' 
  | 'curly_wild' 
  | 'bald_clean';

export type AvatarClothingTop = 
  | 'cyber_leather_jacket' 
  | 'executive_blazer' 
  | 'techwear_hoodie' 
  | 'nanotech_armor' 
  | 'minimal_tshirt' 
  | 'mystic_robe' 
  | 'flight_bomber';

export type AvatarClothingBottom = 
  | 'tactical_cargo_pants' 
  | 'tailored_trousers' 
  | 'cyber_joggers' 
  | 'reinforced_greaves' 
  | 'denim_jeans' 
  | 'armored_skirt';

export type AvatarShoes = 
  | 'cyber_high_top_sneakers' 
  | 'tactical_combat_boots' 
  | 'polished_oxfords' 
  | 'hover_mag_kicks' 
  | 'sleek_runners';

export type AvatarAccessory = 
  | 'none'
  | 'holo_visor' 
  | 'wireframe_glasses' 
  | 'studio_headset' 
  | 'cybernetic_mask' 
  | 'gold_chain_choker' 
  | 'neon_earring_cuff' 
  | 'beret_cap';

export type AvatarBodyType = 
  | 'athletic' 
  | 'slender' 
  | 'muscular' 
  | 'compact_chibi' 
  | 'cyber_cyborg' 
  | 'curvy';

export type AvatarFraming = 'bust_portrait' | 'half_body' | 'full_body';

export interface StudioProject {
  title: string;
  appType: 'mobile' | 'web_modal' | 'game_cutscene' | 'banner' | 'dashboard';
  
  // Background State
  backgroundMode: 'preset' | 'ai';
  backgroundUrl: string;
  backgroundPrompt: string;
  backgroundSize: ImageSize;
  backgroundAspect: AspectRatio;
  backgroundAnimation: 'zoom' | 'pan' | 'pulse' | 'none';

  // Avatar State & Customization
  avatarMode: 'preset' | 'ai';
  avatarUrl: string;
  avatarPrompt: string;
  avatarSize: ImageSize;
  avatarPose: 'center' | 'left' | 'right';
  avatarStyle: '3d_cute' | 'cyberpunk' | 'pixel' | 'anime' | 'vector' | 'watercolor' | 'painterly_cinematic' | 'motion_comic' | 'illustrated_portrait';
  
  // Detailed Avatar Customizations (optional)
  hairstyle?: AvatarHairstyle;
  hairColor?: string;
  clothingTop?: AvatarClothingTop;
  clothingBottom?: AvatarClothingBottom;
  shoes?: AvatarShoes;
  accessory?: AvatarAccessory;
  bodyType?: AvatarBodyType;
  framing?: AvatarFraming;
  isolateBackground?: boolean;

  // Voice & Speech State
  dialogueText: string;
  selectedVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  voiceProvider: 'gemini' | 'elevenlabs'; // 'gemini' = Gemini TTS (default), 'elevenlabs' = ElevenLabs v3
  speechEmotion: 'cheerful' | 'heroic' | 'calm' | 'dramatic' | 'playful' | 'robotic' | 'happy' | 'sad' | 'energetic';
  voiceAudioUrl: string | null;

  // Voice Modulation (optional)
  voicePitch?: number;      // 0.5 (deep) to 1.8 (high/chipmunk), default 1.0
  voiceSpeed?: number;      // 0.6 (slow) to 1.8 (fast), default 1.0
  modulatedAudioUrl?: string | null;

  // Music State
  musicMode: 'synth' | 'ai';
  musicTrackId: string;
  musicVolume: number;
  voiceVolume: number;

  // Subtitles & UI
  showSubtitles: boolean;
  subtitleStyle: 'glass_pill' | 'retro_terminal' | 'comic_bubble' | 'minimal';

  // Project & Style Priming Engine
  projectId?: string;
  projectName?: string;
  stylePrimer?: ProjectStylePrimer;
  styleLockEnabled?: boolean;
}

export type UIArtType = 
  | 'app_icon' 
  | 'splash_banner' 
  | 'card_graphic' 
  | 'badge' 
  | 'button_sprite';

export interface ProjectStylePrimer {
  id: string;
  styleName: string;
  description: string;
  artMedium: 
    | '3d_raytraced'
    | '3d_octane' 
    | 'vector_flat' 
    | 'pixel_art' 
    | 'digital_anime' 
    | 'claymorphism' 
    | 'cyberpunk_glow' 
    | 'minimalist_duotone' 
    | 'photorealistic'
    | 'painterly_cinematic'
    | 'motion_comic'
    | 'illustrated_portrait';
  lightingStyle: 
    | 'studio_soft' 
    | 'neon_glow' 
    | 'dramatic_chiaroscuro' 
    | 'ambient_warm' 
    | 'cyber_volumetric' 
    | 'clean_daylight';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  styleDirectives: string;
  referenceImageUrl?: string | null;
  referenceImageName?: string;
  locked: boolean;
}

export type AssetCategoryFolder = 
  | 'avatar' 
  | 'background' 
  | 'ui_art' 
  | 'voice' 
  | 'music' 
  | 'video'
  | 'intro';

export interface ProjectAsset {
  id: string;
  projectId: string;
  name: string;
  folder: AssetCategoryFolder;
  type: 'image' | 'audio' | 'video' | 'intro_scene';
  url: string;
  prompt?: string;
  specs: {
    resolution?: ImageSize | '720p' | '1080p';
    aspectRatio?: AspectRatio;
    format?: string;
    duration?: number;
    voicePitch?: number;
    voiceSpeed?: number;
    voiceName?: string;
    voice?: string;
    genre?: string;
    bpm?: number;
    volume?: number;
    uiType?: UIArtType;
    videoModel?: string;
  };
  isStyleAnchor?: boolean;
  createdAt: number;
  tags: string[];
}

export interface ProjectFolder {
  id: string;
  name: string;
  appType: 'mobile' | 'web_modal' | 'game_cutscene' | 'banner' | 'dashboard';
  description: string;
  createdAt: number;
  updatedAt: number;
  stylePrimer: ProjectStylePrimer;
  currentStudioState: StudioProject;
  assets: ProjectAsset[];
}

export interface AppArchitectAvatar {
  id: string;
  name: string;
  role: string;
  personality: string;
  gender: string;
  appearancePrompt: string;
  hairstyle: AvatarHairstyle;
  clothingTop: AvatarClothingTop;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  voicePitch: number;
  voiceSpeed: number;
  speechEmotion: 'cheerful' | 'energetic' | 'calm' | 'heroic' | 'happy' | 'dramatic';
  dialogueIntro: string;
  screenTarget: string;
  imageUrl?: string;
  audioUrl?: string;
  isBuilt?: boolean;
}

export interface AppArchitectScene {
  id: string;
  name: string;
  screenName: string;
  description: string;
  prompt: string;
  aspectRatio: AspectRatio;
  stylePreset: string;
  imageUrl?: string;
  isBuilt?: boolean;
}

export interface AppArchitectUiAsset {
  id: string;
  name: string;
  category: 'icon' | 'badge' | 'card_frame' | 'banner' | 'logo';
  uiType: UIArtType;
  prompt: string;
  usageDescription: string;
  imageUrl?: string;
  isBuilt?: boolean;
}

export interface AppArchitectChecklistItem {
  id: string;
  category: 'architecture' | 'avatar' | 'voice' | 'scene' | 'ui' | 'engineering' | 'github';
  title: string;
  detail: string;
  completed: boolean;
  actionTarget?: string;
}

export interface AppArchitectEdgeCase {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  impact: string;
  mitigation: string;
  codePattern?: string;
}

export interface AppArchitectGitHubPlan {
  repositoryName: string;
  recommendedStructure: string;
  dependencies: string[];
  claudeMdContent: string;
  bashSetupScript: string;
  packageJsonSnippet: string;
}

export interface AppArchitectBlueprint {
  id: string;
  appName: string;
  tagline: string;
  targetAudience: string;
  userPromptSummary: string;
  aestheticTheme: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  styleDirectives: string;
  avatars: AppArchitectAvatar[];
  scenes: AppArchitectScene[];
  uiAssets: AppArchitectUiAsset[];
  checklist: AppArchitectChecklistItem[];
  edgeCases: AppArchitectEdgeCase[];
  gitHubPlan: AppArchitectGitHubPlan;
  createdAt: number;
}
