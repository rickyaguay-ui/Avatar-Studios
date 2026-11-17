import { ProjectFolder, ProjectStylePrimer } from '../types.ts';

// Plain-named art styles. Each one is just a starting point: pick it, then change
// the colors and the written directions to make it yours.
export const PRESET_STYLE_PRIMERS: ProjectStylePrimer[] = [
  {
    id: 'flat_vector',
    styleName: 'Flat Vector',
    description: 'Clean flat shapes, solid colors and simple outlines. Looks sharp at any size.',
    artMedium: 'vector_flat',
    lightingStyle: 'flat_even',
    colorPalette: { primary: '#4f46e5', secondary: '#38bdf8', accent: '#f59e0b', background: '#f8fafc' },
    styleDirectives: 'Flat 2D vector illustration, solid color fills, simple clean outlines, rounded friendly shapes, no gradients, no photorealism, plain background.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'hand_drawn_sketch',
    styleName: 'Hand-Drawn Sketch',
    description: 'Loose ink-line drawings with a few flat colors, like a sketchbook.',
    artMedium: 'sketch',
    lightingStyle: 'flat_even',
    colorPalette: { primary: '#111827', secondary: '#f59e0b', accent: '#ef4444', background: '#fffbeb' },
    styleDirectives: 'Hand-drawn ink sketch illustration, confident marker line work, a few flat accent colors, slightly imperfect lines, simple faces, paper background.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'line_art',
    styleName: 'Line Art',
    description: 'Black and white outline drawing. Minimal, editorial, easy to recolor.',
    artMedium: 'line_art',
    lightingStyle: 'flat_even',
    colorPalette: { primary: '#111827', secondary: '#6b7280', accent: '#d97706', background: '#ffffff' },
    styleDirectives: 'Minimal black line art illustration, thin consistent outlines, white fills, no shading, clean editorial look, plain light background.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'watercolor',
    styleName: 'Watercolor',
    description: 'Soft paint washes on textured paper with gentle edges.',
    artMedium: 'watercolor',
    lightingStyle: 'ambient_warm',
    colorPalette: { primary: '#0ea5a4', secondary: '#f59e0b', accent: '#e11d48', background: '#fdf6e3' },
    styleDirectives: 'Watercolor illustration, soft translucent paint washes, visible paper texture, gentle bleeding edges, light pencil outline, warm natural colors.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'comic_book',
    styleName: 'Comic Book',
    description: 'Bold ink outlines and flat color fills, like a graphic novel page.',
    artMedium: 'comic_book',
    lightingStyle: 'dramatic',
    colorPalette: { primary: '#1d4ed8', secondary: '#f59e0b', accent: '#dc2626', background: '#fef3c7' },
    styleDirectives: 'Graphic novel illustration, strong black ink outlines, flat bold color fills, light halftone shading, clear expressive faces, no painterly blur.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'pixel_art',
    styleName: 'Pixel Art',
    description: 'Small blocky pixels with a limited color set, like an old video game.',
    artMedium: 'pixel_art',
    lightingStyle: 'flat_even',
    colorPalette: { primary: '#2563eb', secondary: '#16a34a', accent: '#f59e0b', background: '#e0f2fe' },
    styleDirectives: '16-bit pixel art sprite, clean pixel grid with no blur or anti-aliasing, limited color palette, simple readable shapes.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'soft_3d_cartoon',
    styleName: '3D Cartoon',
    description: 'Rounded, soft 3D characters with smooth matte surfaces.',
    artMedium: 'claymorphism',
    lightingStyle: 'studio_soft',
    colorPalette: { primary: '#f43f5e', secondary: '#a855f7', accent: '#fbbf24', background: '#fdf2f8' },
    styleDirectives: 'Soft rounded 3D cartoon character, smooth matte clay-like surfaces, gentle studio lighting, friendly proportions, pastel colors.',
    referenceImageUrl: null,
    locked: false,
  },
  {
    id: 'painted_portrait',
    styleName: 'Painted Portrait',
    description: 'Realistic painted faces with natural light and warm earth colors.',
    artMedium: 'painterly',
    lightingStyle: 'studio_soft',
    colorPalette: { primary: '#92400e', secondary: '#1e3a8a', accent: '#ca8a04', background: '#f5f0e8' },
    styleDirectives: 'Semi-realistic painted portrait, visible brush strokes, warm natural light, rich earth tones, dignified calm expression.',
    referenceImageUrl: null,
    locked: false,
  },
];

export function buildStylePrimedPrompt(
  rawPrompt: string,
  stylePrimer: ProjectStylePrimer,
  categoryType: 'avatar' | 'background' | 'ui_art' = 'ui_art'
): string {
  const colorSpec = `Color Palette: [Primary: ${stylePrimer.colorPalette.primary}, Secondary: ${stylePrimer.colorPalette.secondary}, Accent: ${stylePrimer.colorPalette.accent}].`;
  const mediumSpec = `Artistic Medium: ${stylePrimer.artMedium.replace(/_/g, ' ')}. Lighting: ${stylePrimer.lightingStyle.replace(/_/g, ' ')}.`;

  let framingSpec = '';
  if (categoryType === 'ui_art') {
    framingSpec = 'Clean isolated UI graphic with transparent or solid background, crisp bounding silhouette, production ready for application asset pipelines.';
  } else if (categoryType === 'avatar') {
    framingSpec = 'Consistent character design matching project art direction, high detail, studio lighting.';
  } else {
    framingSpec = 'Immersive scene background, depth-of-field separation for UI overlay readability.';
  }

  return `[STYLE: ${stylePrimer.styleName.toUpperCase()}]
${stylePrimer.styleDirectives}
${mediumSpec} ${colorSpec}
${framingSpec}
[SUBJECT]: ${rawPrompt}`.trim();
}

// v3: the old v2 key held the pre-built demo projects. Using a new key means they never reappear.
const STORAGE_KEY = 'avatar_studios_projects_v3';

// One empty project. No demo content, no preset app.
export function getStarterProjects(): ProjectFolder[] {
  const now = Date.now();
  const primer = PRESET_STYLE_PRIMERS[0];

  const blank: ProjectFolder = {
    id: 'proj_first',
    name: 'My First Project',
    appType: 'mobile',
    description: '',
    createdAt: now,
    updatedAt: now,
    stylePrimer: primer,
    currentStudioState: {
      title: 'My First Project',
      appType: 'mobile',
      backgroundMode: 'preset',
      backgroundUrl: '/backgrounds/soft_paper.png',
      backgroundPrompt: '',
      backgroundSize: '2K',
      backgroundAspect: '16:9',
      backgroundAnimation: 'none',
      avatarMode: 'preset',
      avatarUrl: '',
      avatarPrompt: '',
      avatarSize: '1K',
      avatarPose: 'center',
      avatarStyle: 'flat_portrait',
      hairstyle: 'side_part_slick',
      hairColor: 'jet_black',
      clothingTop: 'tshirt',
      clothingBottom: 'denim_jeans',
      shoes: 'runners',
      accessory: 'none',
      bodyType: 'average',
      framing: 'bust_portrait',
      isolateBackground: false,
      dialogueText: '',
      selectedVoice: 'Kore',
      voiceProvider: 'gemini',
      speechEmotion: 'cheerful',
      voiceAudioUrl: null,
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      modulatedAudioUrl: null,
      musicMode: 'synth',
      musicTrackId: 'lofi_chill',
      musicVolume: 0.35,
      voiceVolume: 1.0,
      showSubtitles: true,
      subtitleStyle: 'pill',
      projectId: 'proj_first',
      projectName: 'My First Project',
      stylePrimer: primer,
      styleLockEnabled: false,
    },
    assets: [],
  };

  return [blank];
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
