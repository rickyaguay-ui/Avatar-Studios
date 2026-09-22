import { ProjectFolder, ProjectStylePrimer, ProjectAsset } from '../types.ts';
import { PREDEFINED_SCENES, PREDEFINED_AVATARS } from './presets.ts';

export const PRESET_STYLE_PRIMERS: ProjectStylePrimer[] = [
  {
    id: 'cyberpunk_3d',
    styleName: 'Cyberpunk Raytraced 3D',
    description: 'High-gloss volumetric 3D render with electric cyan & neon magenta lighting, raytraced reflections and crisp edges.',
    artMedium: '3d_raytraced',
    lightingStyle: 'cyber_volumetric',
    colorPalette: {
      primary: '#06b6d4', // cyan-500
      secondary: '#d946ef', // fuchsia-500
      accent: '#facc15', // amber-400
      background: '#070a12',
    },
    styleDirectives: 'Glossy 3D isometric raytraced render, volumetric neon lighting, cinematic teal and fuchsia subsurface scattering, raytraced metallic surfaces, clean UI contrast, sharp geometric details, dark studio backdrop.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Cyberpunk Skyline Anchor',
    locked: true,
  },
  {
    id: 'saas_minimal_vector',
    styleName: 'Modern SaaS Flat Vector',
    description: 'Clean, elegant corporate vector illustrations with refined gradients, generous negative space, and indigo accents.',
    artMedium: 'vector_flat',
    lightingStyle: 'clean_daylight',
    colorPalette: {
      primary: '#4f46e5', // indigo-600
      secondary: '#38bdf8', // sky-400
      accent: '#10b981', // emerald-500
      background: '#0f172a',
    },
    styleDirectives: 'Modern minimalist vector design, sleek gradient shading, clean geometric lines, soft dropshadows, executive enterprise aesthetic, studio-grade vector precision, no clutter.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Modern Studio Glass Anchor',
    locked: true,
  },
  {
    id: 'claymorphism_soft',
    styleName: 'Whimsical Claymorphism',
    description: 'Playful soft-clay 3D models with rounded pillowy forms, matte plasticine textures, and warm pastel lighting.',
    artMedium: 'claymorphism',
    lightingStyle: 'ambient_warm',
    colorPalette: {
      primary: '#f43f5e', // rose-500
      secondary: '#a855f7', // purple-500
      accent: '#fbbf24', // amber-400
      background: '#18181b',
    },
    styleDirectives: 'Soft rounded claymorphism 3D character, smooth matte plasticine clay texture, warm diffused studio lighting, gentle ambient occlusion, cute friendly proportions, pastel gradient palette.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Nova Hologram Anchor',
    locked: true,
  },
  {
    id: 'retro_pixel_16bit',
    styleName: '16-Bit Retro Arcade',
    description: 'Crisp hand-crafted pixel art with limited color dithering, vibrant arcade synth aesthetics, and nostalgic charm.',
    artMedium: 'pixel_art',
    lightingStyle: 'neon_glow',
    colorPalette: {
      primary: '#ec4899', // pink-500
      secondary: '#6366f1', // indigo-500
      accent: '#22c55e', // green-500
      background: '#030712',
    },
    styleDirectives: 'Authentic 16-bit classic console pixel art, clean pixel grid without anti-aliasing blur, vibrant retro arcade palette, detailed sprites, outrun synthwave aesthetic.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Outrun Synth Grid Anchor',
    locked: true,
  },
  {
    id: 'dark_obsidian_glass',
    styleName: 'Dark Obsidian Luxury Glass',
    description: 'Premium dark luxury interface art with frosted glass layers, golden hairline accents, and deep charcoal materials.',
    artMedium: 'cyberpunk_glow',
    lightingStyle: 'dramatic_chiaroscuro',
    colorPalette: {
      primary: '#eab308', // yellow-500 / gold
      secondary: '#94a3b8', // slate-400
      accent: '#ffffff',
      background: '#020617',
    },
    styleDirectives: 'Dark luxury UI art, polished black obsidian and frosted smoked glass, subtle 24k gold edge reflections, deep cinematic lighting, minimal high-contrast elegance.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Deep Orbit Anchor',
    locked: true,
  },
  {
    id: 'bible_project',
    styleName: 'Bible Project',
    description: 'Flat 2D vector illustration inspired by paper-cutout character silhouettes, geometric simplified forms, and muted earthy color blocks with depth implied through layered flat shapes.',
    artMedium: 'vector_flat',
    lightingStyle: 'clean_daylight',
    colorPalette: {
      primary: '#c27d38', // Ochre
      secondary: '#b85d3b', // Terracotta
      accent: '#1e3a5f', // Deep Blue
      background: '#f4ede2', // Cream
    },
    styleDirectives: 'Flat 2D vector illustration, paper-cutout character silhouettes, geometric simplified forms, muted earthy limited color palette (ochre, terracotta, deep blue, cream), no facial detail beyond simple shape, ancient Near-Eastern visual motifs, clean bold outlines, no photorealism, no 3D shading',
    referenceImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Bible Project Flat Vector Anchor',
    locked: true,
  },
  {
    id: 'painterly_cinematic',
    styleName: 'Painterly Cinematic',
    description: 'Dramatic oil-painting aesthetic with chiaroscuro lighting and expressive brushstroke textures. Used in premium storytelling apps and prestige game concept art.',
    artMedium: 'painterly_cinematic',
    lightingStyle: 'dramatic_chiaroscuro',
    colorPalette: {
      primary: '#c2793a',   // warm amber
      secondary: '#1c2a3a', // deep navy shadow
      accent: '#e8c97d',    // golden highlight
      background: '#0d1117',
    },
    styleDirectives: 'Dramatic cinematic oil-painting portrait, expressive brushstroke textures, chiaroscuro high-contrast lighting, rich warm ochre and deep navy shadow palette, painterly impasto edges, heroic compositional framing, premium prestige aesthetic, no flat vector, no pixel, no 3D render.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Cinematic Portrait Anchor',
    locked: true,
  },
  {
    id: 'illustrated_portrait',
    styleName: 'Illustrated Portrait',
    description: 'Warm semi-realistic digital illustration used by premium devotional and editorial apps. Dignified, expressive, hand-painted feel without photorealism.',
    artMedium: 'illustrated_portrait',
    lightingStyle: 'ambient_warm',
    colorPalette: {
      primary: '#d97c4f',   // warm terracotta
      secondary: '#6b8fa3', // muted sky
      accent: '#f0d080',    // soft gold
      background: '#1a1612',
    },
    styleDirectives: 'Semi-realistic illustrated portrait, warm dignified fine-art digital rendering, soft hand-painted brushwork, expressive human presence, gentle warm ambient lighting, editorial quality character illustration, no harsh lines, no cartoon exaggeration, no photorealistic skin pores.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Editorial Portrait Anchor',
    locked: true,
  },
  {
    id: 'motion_comic',
    styleName: 'Motion Comic',
    description: 'Bold graphic novel aesthetic with strong ink outlines and flat color fills. Used in Bible story apps, narrative games, and sequential art storytelling.',
    artMedium: 'motion_comic',
    lightingStyle: 'dramatic_chiaroscuro',
    colorPalette: {
      primary: '#2b2b2b',   // bold black ink
      secondary: '#d94f38', // dramatic red
      accent: '#f5c842',    // golden accent
      background: '#f5f0e8',// cream page
    },
    styleDirectives: 'Graphic novel comic book illustration, strong confident ink outline contours, flat bold color fills with subtle halftone texture, dramatic panel composition, high-contrast black and ink shadows, sequential art energy, like a prestige biblical graphic novel — no watercolor, no painterly blur, no photorealism.',
    referenceImageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=85',
    referenceImageName: 'Graphic Novel Anchor',
    locked: true,
  },
];

export function buildStylePrimedPrompt(
  rawPrompt: string,
  stylePrimer: ProjectStylePrimer,
  categoryType: 'avatar' | 'background' | 'ui_art' = 'ui_art'
): string {
  const colorSpec = `Color Palette: [Primary: ${stylePrimer.colorPalette.primary}, Secondary: ${stylePrimer.colorPalette.secondary}, Accent: ${stylePrimer.colorPalette.accent}].`;
  const mediumSpec = `Artistic Medium: ${stylePrimer.artMedium.replace('_', ' ')}. Lighting: ${stylePrimer.lightingStyle.replace('_', ' ')}.`;
  
  let framingSpec = '';
  if (categoryType === 'ui_art') {
    framingSpec = 'Clean isolated UI graphic with transparent or solid background, crisp bounding silhouette, production ready for application asset pipelines.';
  } else if (categoryType === 'avatar') {
    framingSpec = 'Consistent character design matching project art direction, high detail, studio lighting.';
  } else {
    framingSpec = 'Immersive scene background, depth-of-field separation for UI overlay readability.';
  }

  return `[STYLE PRIMER: ${stylePrimer.styleName.toUpperCase()}]
${stylePrimer.styleDirectives}
${mediumSpec} ${colorSpec}
${framingSpec}
[SUBJECT]: ${rawPrompt}`.trim();
}

const STORAGE_KEY = 'appintro_studio_projects_v2';

export function getStarterProjects(): ProjectFolder[] {
  const now = Date.now();

  const cyberpunkPrimer = PRESET_STYLE_PRIMERS[0];
  const saasPrimer = PRESET_STYLE_PRIMERS[1];
  const clayPrimer = PRESET_STYLE_PRIMERS[2];

  const project1: ProjectFolder = {
    id: 'proj_cyberpunk_nexus',
    name: 'Cyberpunk Nexus Mobile App',
    appType: 'mobile',
    description: 'Sci-fi cyberpunk mobile RPG with neon UI elements, avatar mascot, and pulse soundtrack.',
    createdAt: now - 86400000 * 2,
    updatedAt: now - 3600000,
    stylePrimer: cyberpunkPrimer,
    currentStudioState: {
      title: 'Cyberpunk Nexus Onboarding',
      appType: 'mobile',
      backgroundMode: 'preset',
      backgroundUrl: PREDEFINED_SCENES[0].imageUrl,
      backgroundPrompt: 'Futuristic neon cyberpunk megalopolis with flying transports in rain',
      backgroundSize: '2K',
      backgroundAspect: '16:9',
      backgroundAnimation: 'zoom',
      avatarMode: 'preset',
      avatarUrl: PREDEFINED_AVATARS[0].imageUrl,
      avatarPrompt: '3D cute robot mascot guide with cyan glowing visor and high-contrast studio lighting',
      avatarSize: '1K',
      avatarPose: 'center',
      avatarStyle: '3d_cute',
      hairstyle: 'cyber_buzzcut',
      hairColor: 'electric_cyan',
      clothingTop: 'cyber_leather_jacket',
      clothingBottom: 'tactical_cargo_pants',
      shoes: 'cyber_high_top_sneakers',
      accessory: 'holo_visor',
      bodyType: 'athletic',
      framing: 'bust_portrait',
      isolateBackground: false,
      dialogueText: PREDEFINED_AVATARS[0].defaultDialogue,
      selectedVoice: 'Kore',
      voiceProvider: 'gemini',
      speechEmotion: 'cheerful',
      voiceAudioUrl: null,
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      modulatedAudioUrl: null,
      musicMode: 'synth',
      musicTrackId: 'synthwave_pulse',
      musicVolume: 0.35,
      voiceVolume: 1.0,
      showSubtitles: true,
      subtitleStyle: 'glass_pill',
      projectId: 'proj_cyberpunk_nexus',
      projectName: 'Cyberpunk Nexus Mobile App',
      stylePrimer: cyberpunkPrimer,
      styleLockEnabled: true,
    },
    assets: [
      {
        id: 'asset_cp_bg_1',
        projectId: 'proj_cyberpunk_nexus',
        name: 'Megacity Neon Skyline (Backdrop)',
        folder: 'background',
        type: 'image',
        url: PREDEFINED_SCENES[0].imageUrl,
        prompt: 'Futuristic neon cyberpunk megalopolis with flying transports in rain',
        specs: { resolution: '2K', aspectRatio: '16:9', format: 'PNG' },
        isStyleAnchor: true,
        createdAt: now - 86400000 * 2,
        tags: ['background', 'cyberpunk', 'neon', '2K'],
      },
      {
        id: 'asset_cp_av_1',
        projectId: 'proj_cyberpunk_nexus',
        name: 'Nova 7 Mascot (Avatar)',
        folder: 'avatar',
        type: 'image',
        url: PREDEFINED_AVATARS[0].imageUrl,
        prompt: '3D cute robot mascot guide with cyan glowing visor',
        specs: { resolution: '1K', aspectRatio: '1:1', format: 'PNG' },
        isStyleAnchor: false,
        createdAt: now - 86400000 * 1.5,
        tags: ['avatar', 'mascot', 'robot', 'cyan'],
      },
      {
        id: 'asset_cp_icon_1',
        projectId: 'proj_cyberpunk_nexus',
        name: 'Nexus App Launcher Icon (1:1 Squircle)',
        folder: 'ui_art',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=85',
        prompt: 'Glossy 3D isometric app icon of a glowing cybernetic prism with cyan circuit lines',
        specs: { resolution: '1K', aspectRatio: '1:1', uiType: 'app_icon', format: 'PNG' },
        isStyleAnchor: false,
        createdAt: now - 86400000,
        tags: ['ui_art', 'app_icon', 'launcher'],
      },
      {
        id: 'asset_cp_banner_1',
        projectId: 'proj_cyberpunk_nexus',
        name: 'App Store Hero Splash Banner (16:9)',
        folder: 'ui_art',
        type: 'image',
        url: PREDEFINED_SCENES[0].imageUrl,
        prompt: 'Wide cinematic landing banner showing neon city with glowing UI overlay HUD',
        specs: { resolution: '2K', aspectRatio: '16:9', uiType: 'splash_banner', format: 'PNG' },
        isStyleAnchor: false,
        createdAt: now - 40000000,
        tags: ['ui_art', 'splash_banner', 'store_header'],
      },
      {
        id: 'asset_cp_track_1',
        projectId: 'proj_cyberpunk_nexus',
        name: 'Synthwave Pulse Loop (Soundtrack)',
        folder: 'music',
        type: 'audio',
        url: 'synth:synthwave_pulse',
        specs: { duration: 180, format: 'WebAudio Synth' },
        createdAt: now - 86400000 * 2,
        tags: ['music', 'synthwave', 'loop'],
      },
    ],
  };

  const project2: ProjectFolder = {
    id: 'proj_aura_meditation',
    name: 'Aura Meditation & Calm App',
    appType: 'mobile',
    description: 'Wellness & mindfulness mobile companion with soft claymorphism visuals and soothing voices.',
    createdAt: now - 86400000 * 5,
    updatedAt: now - 7200000,
    stylePrimer: clayPrimer,
    currentStudioState: {
      title: 'Aura Morning Calm Onboarding',
      appType: 'mobile',
      backgroundMode: 'preset',
      backgroundUrl: PREDEFINED_SCENES[5].imageUrl,
      backgroundPrompt: 'Serene minimal gradient sky with soft pastel clouds and calm horizon',
      backgroundSize: '2K',
      backgroundAspect: '16:9',
      backgroundAnimation: 'pulse',
      avatarMode: 'preset',
      avatarUrl: PREDEFINED_AVATARS[3].imageUrl,
      avatarPrompt: 'Whimsical friendly meditation clay mascot with smiling closed eyes and pastel aura',
      avatarSize: '1K',
      avatarPose: 'center',
      avatarStyle: '3d_cute',
      hairstyle: 'bald_clean',
      hairColor: 'platinum_blonde',
      clothingTop: 'mystic_robe',
      clothingBottom: 'tailored_trousers',
      shoes: 'sleek_runners',
      accessory: 'none',
      bodyType: 'compact_chibi',
      framing: 'bust_portrait',
      isolateBackground: true,
      dialogueText: 'Take a deep breath in... and gently let it go. Welcome to your daily moment of stillness.',
      selectedVoice: 'Zephyr',
      voiceProvider: 'gemini',
      speechEmotion: 'calm',
      voiceAudioUrl: null,
      voicePitch: 0.95,
      voiceSpeed: 0.9,
      modulatedAudioUrl: null,
      musicMode: 'synth',
      musicTrackId: 'lofi_chill',
      musicVolume: 0.4,
      voiceVolume: 1.0,
      showSubtitles: true,
      subtitleStyle: 'glass_pill',
      projectId: 'proj_aura_meditation',
      projectName: 'Aura Meditation & Calm App',
      stylePrimer: clayPrimer,
      styleLockEnabled: true,
    },
    assets: [
      {
        id: 'asset_aura_bg_1',
        projectId: 'proj_aura_meditation',
        name: 'Pastel Sunset Calm Glade (Backdrop)',
        folder: 'background',
        type: 'image',
        url: PREDEFINED_SCENES[5].imageUrl,
        prompt: 'Soft duotone pastel gradient backdrop that keeps full focus on avatar',
        specs: { resolution: '2K', aspectRatio: '16:9', format: 'PNG' },
        isStyleAnchor: true,
        createdAt: now - 86400000 * 5,
        tags: ['background', 'calm', 'pastel'],
      },
      {
        id: 'asset_aura_av_1',
        projectId: 'proj_aura_meditation',
        name: 'Zen Companion (Avatar)',
        folder: 'avatar',
        type: 'image',
        url: PREDEFINED_AVATARS[3].imageUrl,
        prompt: 'Cute friendly companion mascot with soft clay lighting',
        specs: { resolution: '1K', aspectRatio: '1:1', format: 'PNG' },
        isStyleAnchor: false,
        createdAt: now - 86400000 * 4,
        tags: ['avatar', 'zen', 'chibi'],
      },
      {
        id: 'asset_aura_icon_1',
        projectId: 'proj_aura_meditation',
        name: 'Aura App Lotus Icon (1:1 Squircle)',
        folder: 'ui_art',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=85',
        prompt: 'Minimalist 3D clay lotus blossom flower in pastel rose and mint green',
        specs: { resolution: '1K', aspectRatio: '1:1', uiType: 'app_icon', format: 'PNG' },
        isStyleAnchor: false,
        createdAt: now - 86400000 * 3,
        tags: ['ui_art', 'app_icon', 'lotus'],
      },
      {
        id: 'asset_aura_track_1',
        projectId: 'proj_aura_meditation',
        name: 'Lo-Fi Chill Pad (Soundtrack)',
        folder: 'music',
        type: 'audio',
        url: 'synth:lofi_chill',
        specs: { duration: 180, format: 'WebAudio Synth' },
        createdAt: now - 86400000 * 5,
        tags: ['music', 'lofi', 'meditation'],
      },
    ],
  };

  const project3: ProjectFolder = {
    id: 'proj_saas_metrics',
    name: 'Vanguard Analytics SaaS',
    appType: 'web_modal',
    description: 'Executive analytics and financial dashboard with high-contrast vector UI art and confident voices.',
    createdAt: now - 86400000 * 7,
    updatedAt: now - 18000000,
    stylePrimer: saasPrimer,
    currentStudioState: {
      title: 'Vanguard Enterprise Intro',
      appType: 'web_modal',
      backgroundMode: 'preset',
      backgroundUrl: PREDEFINED_SCENES[2].imageUrl,
      backgroundPrompt: 'Ultra-clean architectural glass office with natural golden daylight',
      backgroundSize: '2K',
      backgroundAspect: '16:9',
      backgroundAnimation: 'zoom',
      avatarMode: 'preset',
      avatarUrl: PREDEFINED_AVATARS[2].imageUrl,
      avatarPrompt: 'Elena Cross, strategic executive advisor in tailored indigo blazer with confident smile',
      avatarSize: '1K',
      avatarPose: 'right',
      avatarStyle: 'vector',
      hairstyle: 'sleek_bob',
      hairColor: 'warm_auburn',
      clothingTop: 'executive_blazer',
      clothingBottom: 'tailored_trousers',
      shoes: 'polished_oxfords',
      accessory: 'wireframe_glasses',
      bodyType: 'slender',
      framing: 'bust_portrait',
      isolateBackground: false,
      dialogueText: 'Great to meet you! Your quarterly enterprise analytics dashboard is ready for review.',
      selectedVoice: 'Kore',
      voiceProvider: 'gemini',
      speechEmotion: 'cheerful',
      voiceAudioUrl: null,
      voicePitch: 1.0,
      voiceSpeed: 1.05,
      modulatedAudioUrl: null,
      musicMode: 'synth',
      musicTrackId: 'corporate_upbeat',
      musicVolume: 0.3,
      voiceVolume: 1.0,
      showSubtitles: true,
      subtitleStyle: 'glass_pill',
      projectId: 'proj_saas_metrics',
      projectName: 'Vanguard Analytics SaaS',
      stylePrimer: saasPrimer,
      styleLockEnabled: true,
    },
    assets: [
      {
        id: 'asset_saas_bg_1',
        projectId: 'proj_saas_metrics',
        name: 'Modern Glass Studio (Backdrop)',
        folder: 'background',
        type: 'image',
        url: PREDEFINED_SCENES[2].imageUrl,
        prompt: 'Ultra-clean architectural glass office with natural daylight',
        specs: { resolution: '2K', aspectRatio: '16:9', format: 'PNG' },
        isStyleAnchor: true,
        createdAt: now - 86400000 * 7,
        tags: ['background', 'saas', 'office'],
      },
      {
        id: 'asset_saas_icon_1',
        projectId: 'proj_saas_metrics',
        name: 'Vanguard Prism Logo (App Icon)',
        folder: 'ui_art',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=85',
        prompt: 'Sleek vector prism icon with blue and indigo gradient facets on dark rounded container',
        specs: { resolution: '1K', aspectRatio: '1:1', uiType: 'app_icon', format: 'PNG' },
        isStyleAnchor: false,
        createdAt: now - 86400000 * 6,
        tags: ['ui_art', 'app_icon', 'logo'],
      },
    ],
  };

  return [project1, project2, project3];
}

export const DEFAULT_PROJECTS = getStarterProjects();

export function loadProjectsFromStorage(): ProjectFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read projects from localStorage:', err);
  }
  const starters = getStarterProjects();
  saveProjectsToStorage(starters);
  return starters;
}

export function saveProjectsToStorage(projects: ProjectFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.warn('Could not write projects to localStorage:', err);
  }
}
