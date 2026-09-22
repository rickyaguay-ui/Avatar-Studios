import { PredefinedScene, AvatarPreset, MusicTrack } from '../types.ts';

export const PREDEFINED_SCENES: PredefinedScene[] = [
  {
    id: 'cyberpunk_city',
    title: 'Neon Megacity Skyline',
    category: 'Cyberpunk',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=85',
    suggestedMusic: 'synthwave_pulse',
    suggestedTone: 'Cyberpunk Futuristic',
    description: 'Towering holographic skyscrapers bathed in violet and cyan rain, ideal for tech or gaming apps.'
  },
  {
    id: 'deep_space',
    title: 'Celestial Deep Orbit',
    category: 'Cosmic',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=85',
    suggestedMusic: 'ambient_space',
    suggestedTone: 'Calm & Warm',
    description: 'Ethereal nebula stars and planetary horizons for futuristic onboarding or sci-fi dashboards.'
  },
  {
    id: 'modern_minimal_office',
    title: 'Prism Glass Workspace',
    category: 'Modern Tech',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
    suggestedMusic: 'corporate_upbeat',
    suggestedTone: 'Cheerful',
    description: 'Ultra-clean architectural glass office with natural golden daylight, perfect for SaaS products.'
  },
  {
    id: 'fantasy_forest',
    title: 'Enchanted Lumina Glade',
    category: 'Fantasy',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1600&q=85',
    suggestedMusic: 'epic_orchestral',
    suggestedTone: 'Heroic & Confident',
    description: 'Glowing bio-luminescent flora, ancient mossy stones, and fairy mist for RPGs and creative apps.'
  },
  {
    id: 'retro_arcade_grid',
    title: 'Retro Neon Wave Grid',
    category: 'Retro Gaming',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=85',
    suggestedMusic: 'chiptune_arcade',
    suggestedTone: 'Playful',
    description: 'Outrun 80s wireframe grid with digital mountains and synthetic sun for indie games.'
  },
  {
    id: 'sunset_studio',
    title: 'Minimalist Sunset Gradient',
    category: 'Minimalist',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=85',
    suggestedMusic: 'lofi_chill',
    suggestedTone: 'Calm & Warm',
    description: 'Smooth duotone pastel gradient backdrop that keeps full focus on your avatar and UI.'
  }
];

export const PREDEFINED_AVATARS: AvatarPreset[] = [
  {
    id: 'nova_ai',
    name: 'Nova 7',
    role: 'AI Companion & Guide',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=85',
    voice: 'Kore',
    defaultDialogue: 'Welcome aboard! I am Nova, your intelligent co-pilot. All systems are initialized and ready for your first mission.',
    tag: '3D Hologram'
  },
  {
    id: 'kai_hacker',
    name: 'Kai Vesper',
    role: 'Cyberpunk Operative',
    imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=85',
    voice: 'Fenrir',
    defaultDialogue: 'Grid connection established. Security firewalls breached. You have unrestricted root access now.',
    tag: 'Sci-Fi'
  },
  {
    id: 'elena_pro',
    name: 'Elena Cross',
    role: 'Strategic Onboarding Lead',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85',
    voice: 'Zephyr',
    defaultDialogue: 'Great to meet you! Let me walk you through your personalized analytics dashboard and key milestones.',
    tag: 'Executive'
  },
  {
    id: 'spark_bot',
    name: 'Sparky',
    role: 'Playful Mascot Bot',
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=800&q=85',
    voice: 'Puck',
    defaultDialogue: 'BEEP BOOP! High five! You just leveled up your daily streak! Ready for the next adventure?',
    tag: 'Gaming'
  },
  {
    id: 'aegis_sentinel',
    name: 'Commander Aegis',
    role: 'Defense Protocol Sentinel',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    voice: 'Charon',
    defaultDialogue: 'Perimeter secure. All encryption protocols verified. Proceed with standard operational deployment.',
    tag: 'Heroic'
  }
];

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'synthwave_pulse',
    name: 'Neon Horizon',
    bpm: 110,
    mood: 'Energetic & Driving',
    genre: 'synthwave',
    description: 'Analog sawtooth basslines with shimmering arpeggiated retro synths.'
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
    id: 'ambient_space',
    name: 'Zero Gravity',
    bpm: 65,
    mood: 'Ethereal & Atmospheric',
    genre: 'ambient',
    description: 'Floating reverb pads with subtle sub-bass harmonic resonance.'
  },
  {
    id: 'chiptune_arcade',
    name: 'Pixel Quest 8-Bit',
    bpm: 130,
    mood: 'Playful & Bouncy',
    genre: 'chiptune',
    description: 'Square wave melodies and upbeat NES-inspired drum rhythms.'
  },
  {
    id: 'corporate_upbeat',
    name: 'Future Momentum',
    bpm: 118,
    mood: 'Optimistic & Clean',
    genre: 'corporate',
    description: 'Bright electric piano, muted guitar plucks, and clean modern pulse.'
  },
  {
    id: 'epic_orchestral',
    name: 'Titans Rise',
    bpm: 96,
    mood: 'Cinematic & Heroic',
    genre: 'epic',
    description: 'Brass stabs, low cello ostinatos, and dramatic percussion buildup.'
  }
];
