export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3' | '3:4';

export interface PredefinedScene {
  id: string;
  title: string;
  category: 'Nature' | 'Calm' | 'Minimal';
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
  styleId: AvatarStyleId;
}

export interface MusicTrack {
  id: string;
  name: string;
  bpm: number;
  mood: string;
  genre: 'lofi' | 'electronic' | 'epic' | 'chiptune' | 'ambient' | 'corporate';
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
  | 'buzzcut' 
  | 'long_wavy' 
  | 'afro_fade' 
  | 'sleek_bob' 
  | 'braided_locs' 
  | 'spiky_anime' 
  | 'side_part_slick' 
  | 'curly_wild' 
  | 'bald_clean';

export type AvatarClothingTop = 
  | 'leather_jacket' 
  | 'blazer' 
  | 'hoodie' 
  | 'knit_sweater' 
  | 'tshirt' 
  | 'robe' 
  | 'bomber_jacket';

export type AvatarClothingBottom = 
  | 'cargo_pants' 
  | 'tailored_trousers' 
  | 'joggers' 
  | 'shorts' 
  | 'denim_jeans' 
  | 'pleated_skirt';

export type AvatarShoes = 
  | 'high_top_sneakers' 
  | 'boots' 
  | 'oxfords' 
  | 'sandals' 
  | 'runners';

export type AvatarAccessory = 
  | 'none'
  | 'sunglasses' 
  | 'glasses' 
  | 'headphones' 
  | 'scarf' 
  | 'necklace' 
  | 'earrings' 
  | 'hat';

export type AvatarBodyType = 
  | 'athletic' 
  | 'slender' 
  | 'muscular' 
  | 'compact' 
  | 'average' 
  | 'curvy';

export type AvatarFraming = 'bust_portrait' | 'half_body' | 'full_body';

export type AvatarStyleId =
  | 'sketch'
  | 'flat_portrait'
  | 'line_art'
  | 'pixel'
  | 'mascot'
  | 'watercolor'
  | 'comic_book'
  | 'anime'
  | '3d_cartoon'
  | 'painted_portrait';

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
  avatarStyle: AvatarStyleId;
  
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
  subtitleStyle: 'pill' | 'typewriter' | 'comic_bubble' | 'minimal';

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
    | 'vector_flat' 
    | 'pixel_art' 
    | 'digital_anime' 
    | 'claymorphism' 
    | 'line_art' 
    | 'sketch' 
    | 'watercolor' 
    | 'photorealistic'
    | 'painterly'
    | 'comic_book'
    | 'illustrated_portrait';
  lightingStyle: 
    | 'studio_soft' 
    | 'dramatic' 
    | 'ambient_warm' 
    | 'clean_daylight' 
    | 'flat_even';
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
