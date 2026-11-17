import { PredefinedScene, AvatarPreset, MusicTrack } from '../types.ts';

// Backgrounds are bundled in /public/backgrounds (drawn for this project, no outside license).
export const PREDEFINED_SCENES: PredefinedScene[] = [
  {
    id: 'sunrise_hills',
    title: 'Sunrise Hills',
    category: 'Nature',
    imageUrl: '/backgrounds/sunrise_hills.png',
    suggestedMusic: 'soft_ambient',
    suggestedTone: 'Calm & Warm',
    description: 'Warm orange sky over layered rolling hills. A gentle, hopeful start screen.'
  },
  {
    id: 'calm_lake',
    title: 'Calm Lake',
    category: 'Calm',
    imageUrl: '/backgrounds/calm_lake.png',
    suggestedMusic: 'lofi_chill',
    suggestedTone: 'Calm & Warm',
    description: 'Still blue water with soft distant mountains. Quiet and easy on the eyes.'
  },
  {
    id: 'pine_forest',
    title: 'Pine Forest',
    category: 'Nature',
    imageUrl: '/backgrounds/pine_forest.png',
    suggestedMusic: 'soft_ambient',
    suggestedTone: 'Calm & Warm',
    description: 'Layered green hills fading into light. Good for wellness, outdoors and learning apps.'
  },
  {
    id: 'soft_paper',
    title: 'Soft Paper',
    category: 'Minimal',
    imageUrl: '/backgrounds/soft_paper.png',
    suggestedMusic: 'corporate_upbeat',
    suggestedTone: 'Cheerful',
    description: 'Plain cream backdrop with faint shapes. Keeps all focus on your avatar and UI.'
  },
  {
    id: 'evening_sky',
    title: 'Evening Sky',
    category: 'Calm',
    imageUrl: '/backgrounds/evening_sky.png',
    suggestedMusic: 'lofi_chill',
    suggestedTone: 'Calm & Warm',
    description: 'Purple to orange dusk with soft clouds. Works for night-time and reflection screens.'
  },
  {
    id: 'open_plain',
    title: 'Open Plain',
    category: 'Nature',
    imageUrl: '/backgrounds/open_plain.png',
    suggestedMusic: 'epic_orchestral',
    suggestedTone: 'Heroic & Confident',
    description: 'Wide golden field under a clear sky. Open and simple.'
  }
];

// Demo avatars are bundled in /public/avatars. All five art sets are CC0 (public domain):
// Open Peeps (Pablo Stanley), Lorelei (Lisa Wischofsky), Notionists (Zoish), Pixel Art, Thumbs (DiceBear).
// See public/avatars/LICENSES.md. `tag` is the art style shown in the gallery.
export const PREDEFINED_AVATARS: AvatarPreset[] = [
  {
    id: 'sketch_hana',
    name: 'Hana',
    role: 'Welcome Guide',
    imageUrl: '/avatars/sketch_hana.png',
    voice: 'Kore',
    defaultDialogue: "Hi, I'm Hana. I'll show you around so you can get started in a minute or two.",
    tag: 'Hand-Drawn Sketch',
    styleId: 'sketch'
  },
  {
    id: 'sketch_kai',
    name: 'Kai',
    role: 'Study Coach',
    imageUrl: '/avatars/sketch_kai.png',
    voice: 'Fenrir',
    defaultDialogue: "Let's pick one small goal for today. We'll build from there.",
    tag: 'Hand-Drawn Sketch',
    styleId: 'sketch'
  },
  {
    id: 'portrait_eli',
    name: 'Eli',
    role: 'Community Host',
    imageUrl: '/avatars/portrait_eli.png',
    voice: 'Puck',
    defaultDialogue: "Welcome! Say hello to the group, and ask anything you like.",
    tag: 'Flat Portrait',
    styleId: 'flat_portrait'
  },
  {
    id: 'portrait_ivan',
    name: 'Ivan',
    role: 'Reading Buddy',
    imageUrl: '/avatars/portrait_ivan.png',
    voice: 'Zephyr',
    defaultDialogue: "Ready when you are. Take your time, and we'll read this together.",
    tag: 'Flat Portrait',
    styleId: 'flat_portrait'
  },
  {
    id: 'line_eli',
    name: 'Elena',
    role: 'Product Tour Guide',
    imageUrl: '/avatars/line_eli.png',
    voice: 'Zephyr',
    defaultDialogue: "Here's your dashboard. The three things you'll use most are right at the top.",
    tag: 'Line Art',
    styleId: 'line_art'
  },
  {
    id: 'line_ivan',
    name: 'Ian',
    role: 'Support Helper',
    imageUrl: '/avatars/line_ivan.png',
    voice: 'Charon',
    defaultDialogue: "If you get stuck, tap the help button and I'll walk you through it.",
    tag: 'Line Art',
    styleId: 'line_art'
  },
  {
    id: 'pixel_cora',
    name: 'Cora',
    role: 'Game Guide',
    imageUrl: '/avatars/pixel_cora.png',
    voice: 'Puck',
    defaultDialogue: "Level one is ready. Grab your first badge and I'll show you the next step.",
    tag: 'Pixel Art',
    styleId: 'pixel'
  },
  {
    id: 'pixel_hana',
    name: 'Rowan',
    role: 'Quiz Host',
    imageUrl: '/avatars/pixel_hana.png',
    voice: 'Fenrir',
    defaultDialogue: "Three questions, no pressure. Pick the answer that feels right.",
    tag: 'Pixel Art',
    styleId: 'pixel'
  },
  {
    id: 'mascot_ava',
    name: 'Mochi',
    role: 'Friendly Mascot',
    imageUrl: '/avatars/mascot_ava.png',
    voice: 'Puck',
    defaultDialogue: "Yay, you're here! Let's go see what's new today.",
    tag: 'Friendly Mascot',
    styleId: 'mascot'
  },
  {
    id: 'mascot_fay',
    name: 'Pip',
    role: 'Daily Reminder Buddy',
    imageUrl: '/avatars/mascot_fay.png',
    voice: 'Kore',
    defaultDialogue: "Quick check-in time. How are you feeling today?",
    tag: 'Friendly Mascot',
    styleId: 'mascot'
  }
];

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'electronic_pulse',
    name: 'Steady Pulse',
    bpm: 110,
    mood: 'Energetic & Driving',
    genre: 'electronic',
    description: 'Warm synth bass with a steady, shimmering arpeggio.'
  },
  {
    id: 'lofi_chill',
    name: 'Midnight Brew',
    bpm: 82,
    mood: 'Relaxed & Cozy',
    genre: 'lofi',
    description: 'Warm vinyl warmth, mellow Rhodes chords, and laid-back beat.'
  },
  {
    id: 'soft_ambient',
    name: 'Soft Air',
    bpm: 65,
    mood: 'Calm & Open',
    genre: 'ambient',
    description: 'Slow floating pads with a quiet low hum underneath.'
  },
  {
    id: 'chiptune_8bit',
    name: 'Pixel Quest 8-Bit',
    bpm: 130,
    mood: 'Playful & Bouncy',
    genre: 'chiptune',
    description: 'Square wave melodies and upbeat NES-inspired drum rhythms.'
  },
  {
    id: 'corporate_upbeat',
    name: 'Bright Start',
    bpm: 118,
    mood: 'Optimistic & Clean',
    genre: 'corporate',
    description: 'Bright electric piano, muted guitar plucks, and clean modern pulse.'
  },
  {
    id: 'epic_orchestral',
    name: 'Rising Strings',
    bpm: 96,
    mood: 'Cinematic & Heroic',
    genre: 'epic',
    description: 'Brass stabs, low cello ostinatos, and dramatic percussion buildup.'
  }
];
