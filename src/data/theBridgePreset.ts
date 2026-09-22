import { AppArchitectBlueprint } from '../types.ts';

export const THE_BRIDGE_BLUEPRINT: AppArchitectBlueprint = {
  id: 'blueprint_the_bridge',
  appName: 'The Bridge',
  tagline: 'Spiritual Sanctuary & Christian Community Companion',
  targetAudience: 'Believers, seekers, prayer groups, and church communities seeking daily fellowship, scripture reflection, and guided spiritual growth.',
  userPromptSummary: "Building an app called 'The Bridge'. A spiritual Christian app with 8 avatars, distinct voices, artwork for each landing screen, full UI art, production checklist, edge cases, and Claude Code exportable GitHub bundle.",
  aestheticTheme: 'Luminous Sanctuary (Warm Gold, Deep Indigo, Pristine White, Celestial Amber)',
  colorPalette: {
    primary: '#4f46e5', // Royal Indigo / Devotion
    secondary: '#d97706', // Warm Gold / Divinity
    accent: '#0d9488', // Serene Teal / Living Water
    background: '#090d16', // Deep Twilight Sky
    surface: '#111827', // Clean Slate Sanctuary
  },
  styleDirectives: 'Sacred modern aesthetic, luminous golden hour lighting, peaceful botanical gardens, subtle celestial ambient glows, clean typography with high contrast, serene reflections, elegant stained-glass geometric motifs without visual clutter.',
  avatars: [
    {
      id: 'avatar_david',
      name: 'David',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'long_wavy',
      clothingTop: 'mystic_robe',
      voice: 'Charon',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_paul',
      name: 'Paul',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'bald_clean',
      clothingTop: 'mystic_robe',
      voice: 'Fenrir',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_peter',
      name: 'Peter',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'curly_wild',
      clothingTop: 'mystic_robe',
      voice: 'Puck',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_moses',
      name: 'Moses',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'long_wavy',
      clothingTop: 'mystic_robe',
      voice: 'Charon',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_mary',
      name: 'Mary (mother of Jesus)',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'long_wavy',
      clothingTop: 'mystic_robe',
      voice: 'Kore',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_rahab',
      name: 'Rahab',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'long_wavy',
      clothingTop: 'mystic_robe',
      voice: 'Kore',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_ruth',
      name: 'Ruth',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'long_wavy',
      clothingTop: 'mystic_robe',
      voice: 'Kore',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
    {
      id: 'avatar_mary_magdalene',
      name: 'Mary Magdalene',
      role: '',
      personality: '',
      gender: '',
      appearancePrompt: '',
      hairstyle: 'long_wavy',
      clothingTop: 'mystic_robe',
      voice: 'Kore',
      voicePitch: 1.0,
      voiceSpeed: 1.0,
      speechEmotion: 'calm',
      dialogueIntro: '',
      screenTarget: '',
    },
  ],
  scenes: [
    {
      id: 'scene_sanctuary_dawn',
      name: 'Sanctuary Dawn',
      screenName: 'Welcome & Daily Devotional Landing',
      description: 'Majestic modern cathedral interior at daybreak with golden sunbeams filtering through floor-to-ceiling glass.',
      prompt: 'Interior of a modern luminous architectural church sanctuary at sunrise, wooden timber arches, clean minimalist altar, floor-to-ceiling glass windows with morning golden sunbeams casting warm rays onto polished slate floors, pristine serenity, 4k cinematic photoreal',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_prayer_garden',
      name: 'Gethsemane Prayer Garden',
      screenName: 'Interactive Prayer & Intercession Altar',
      description: 'Lush tranquil olive garden with stone benches, flowing fountain, and blooming white lilies under morning mist.',
      prompt: 'Serene tranquil prayer garden with ancient olive trees, carved stone prayer bench, gentle trickling stone water fountain, blooming white lilies and lavender, soft morning mist with warm diffused sunlight, spiritual tranquility, photorealistic',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_scripture_athenaeum',
      name: 'Scripture Athenaeum',
      screenName: 'Bible Study & Commentaries Library',
      description: 'Sunlit timber-lined theological study hall with arching bookshelves and leather reading alcoves.',
      prompt: 'Magnificent architectural theological library, two-story arched oak bookshelves filled with leather-bound books and ancient manuscripts, warm brass reading lamps, sunlit stained glass window casting soft blue and amber colors, peaceful atmosphere',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_mountain_retreat',
      name: 'Mount of Transfiguration Retreat',
      screenName: 'Fasting & Quiet Time Solitude',
      description: 'Breathtaking mountain peak overlooking sunrise sea of clouds with wooden overlook terrace.',
      prompt: 'Awe-inspiring sunrise mountain overlook overlooking endless sea of gold and purple clouds, clean wooden observation terrace, crisp alpine morning air, spiritual reflection, golden hour illumination, cinematic master landscape',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_fellowship_hall',
      name: 'Agape Fellowship Hall',
      screenName: 'Community Groups & Small Group Chat',
      description: 'Warm inviting community space with rustic reclaimed timber tables, string lights, and coffee lounge.',
      prompt: 'Warm modern church fellowship cafe and gathering hall, reclaimed timber harvest tables, cozy armchairs, hanging warm Edison bulbs, exposed brick and natural pine walls, welcoming community ambiance, interior photography',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_river_living_water',
      name: 'Living Water Riverbank',
      screenName: 'Baptism & Spiritual Renewal Audio Stage',
      description: 'Crystal-clear river winding through green cedar forests with smooth river stones and warm afternoon reflections.',
      prompt: 'Crystal clear river of living water winding through majestic green cedar forest, polished river stones visible through turquoise water, dappled sunlight sparkling across ripples, symbolizing baptism and spiritual renewal, ultra-realistic',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_missions_outreach',
      name: 'Urban Outreach Center',
      screenName: 'Service Projects & Food Pantry Dashboard',
      description: 'Vibrant sunlit city community hub with volunteer food boxes and global mission map wall.',
      prompt: 'Bright active urban community center with large glass garage doors open to city courtyard, rustic wood shelves stocked with fresh harvest food pantry baskets, wooden map of the world on back wall, clean warm lighting, inspiring documentary style',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'scene_vespers_twilight',
      name: 'Evening Vespers Candlelight',
      screenName: 'Nightly Examen & Sleep Reflections',
      description: 'Intimate stone chapel illuminated by hundreds of glowing beeswax prayer candles at dusk.',
      prompt: 'Intimate ancient stone chapel at dusk, glowing clusters of hundreds of warm beeswax candles illuminating rough stone walls, soft twilight blue visible through high arched lancet windows, serene prayer atmosphere, chiaroscuro lighting',
      aspectRatio: '16:9',
      stylePreset: 'cinematic',
      imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&auto=format&fit=crop&q=80',
    },
  ],
  uiAssets: [
    {
      id: 'ui_cross_emblem',
      name: 'Luminous Celtic Cross Emblem',
      category: 'logo',
      uiType: 'icon_glyph',
      prompt: 'Minimalist modern stylized cross logo with subtle intertwined circular bridge motif, golden gradient on dark royal indigo circular badge, vector tech aesthetic, clean sharp edges',
      usageDescription: 'Primary App Icon and Splash Screen Brand Mark',
    },
    {
      id: 'ui_dove_peace',
      name: 'Dove of Peace Icon',
      category: 'icon',
      uiType: 'icon_glyph',
      prompt: 'Stylized soaring white dove icon with olive leaf in beak, gentle golden halo, modern flat vector, clean 2D app UI icon, transparent background',
      usageDescription: 'Prayer Request & Spiritual Deliverance Category Badge',
    },
    {
      id: 'ui_scripture_card_frame',
      name: 'Illuminated Scripture Verse Card Frame',
      category: 'card_frame',
      uiType: 'card_frame',
      prompt: 'UI card background container with subtle golden foil borders, soft dark navy gradient fill, delicate corner flourishes, high contrast for white scripture typography, modern web UI',
      usageDescription: 'Daily Verse of the Day and Memorization Card Template',
    },
    {
      id: 'ui_prayer_flame_streak',
      name: 'Holy Spirit Flame Streak Badge',
      category: 'badge',
      uiType: 'badge_achievement',
      prompt: 'Vibrant golden-amber sacred flame icon with modern clean curves, floating inside soft neon cyan ring, game badge achievement style, 3D glossy finish, dark background',
      usageDescription: 'Daily Prayer Streak & Bible Reading Milestone Badge',
    },
    {
      id: 'ui_living_water_banner',
      name: 'Living Waters Devotional Banner',
      category: 'banner',
      uiType: 'banner_hero',
      prompt: 'Header banner graphic with flowing abstract waves of golden and turquoise light, spiritual energy, soft particle sparkles, clean spacious layout for text overlay',
      usageDescription: 'Home Feed Hero Header & Audio Hymn Player Backdrop',
    },
  ],
  checklist: [
    {
      id: 'chk_arch_1',
      category: 'architecture',
      title: 'Define Multi-Persona Voice & Dialogue Architecture',
      detail: 'Configure 8 unique demographic personas, assigning specific Gemini TTS voice models (Kore, Puck, Charon, Fenrir, Zephyr) with custom pitch and speed offsets.',
      completed: true,
      actionTarget: 'avatar',
    },
    {
      id: 'chk_avatar_all',
      category: 'avatar',
      title: 'Render 8 Distinct Pastor & Leader Avatar Portraits',
      detail: 'Generate high-res portraits for Pastor David, Grace, Elder Elijah, Dr. Hannah, Marcus, Abigail, Lucas, and Esther matching their wardrobe and demographic specs.',
      completed: true,
      actionTarget: 'avatar',
    },
    {
      id: 'chk_voice_all',
      category: 'voice',
      title: 'Synthesize & Audition Voiceovers for All 8 Guides',
      detail: 'Produce base Gemini TTS audio tracks and modulate pitch/tempo for each persona’s introductory greeting.',
      completed: true,
      actionTarget: 'voice',
    },
    {
      id: 'chk_scene_all',
      category: 'scene',
      title: 'Generate 8 Screen Backdrops for Complete User Journey',
      detail: 'Render 16:9 cinematic scenery for Sanctuary Dawn, Prayer Garden, Scripture Library, Fellowship Hall, Outreach Center, and Evening Vespers.',
      completed: true,
      actionTarget: 'background',
    },
    {
      id: 'chk_ui_kit',
      category: 'ui',
      title: 'Produce Spiritual Iconography & Verse Card System',
      detail: 'Generate the Celtic Bridge Cross emblem, Holy Spirit Flame streak badge, and illuminated Scripture Card containers.',
      completed: false,
      actionTarget: 'ui_art',
    },
    {
      id: 'chk_edge_cases',
      category: 'engineering',
      title: 'Audit Audio Latency & Offline Scripture Cache Defenses',
      detail: 'Implement IndexedDB audio caching and web worker speech synthesis fallbacks for low-connectivity church retreat settings.',
      completed: true,
      actionTarget: 'engineering',
    },
    {
      id: 'chk_claude_export',
      category: 'github',
      title: 'Generate CLAUDE.md & Repository Push Script',
      detail: 'Bundle all asset URLs, manifests, types, and terminal commands for instant hand-off to Claude Code CLI.',
      completed: true,
      actionTarget: 'export',
    },
  ],
  edgeCases: [
    {
      id: 'edge_audio_latency',
      title: 'High Audio Latency on Cellular Retreat & Mission Trips',
      severity: 'critical',
      impact: 'Users on 3G or remote church retreats experience 2-4 second pauses when avatars speak, breaking spiritual immersion.',
      mitigation: 'Implement local IndexedDB audio caching for synthesized persona greetings and pre-fetch the next devotional speech audio in service workers.',
      codePattern: 'const cachedBlob = await idbKeyval.get(`voice_${avatarId}`); if (cachedBlob) return URL.createObjectURL(cachedBlob);',
    },
    {
      id: 'edge_wcag_contrast',
      title: 'Low Text Legibility Against Stained Glass Backdrops',
      severity: 'high',
      impact: 'Bright sunlit cathedral and stained glass backgrounds can reduce text contrast below WCAG 2.1 AA ratios (4.5:1).',
      mitigation: 'Enforce automatic backdrop scrim overlay (e.g. `bg-slate-950/75 backdrop-blur-md`) beneath all scripture verse text and dialogue cards.',
      codePattern: '<div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">',
    },
    {
      id: 'edge_speech_fallback',
      title: 'Browser Offline / Gemini API Rate Limit Fallback',
      severity: 'high',
      impact: 'If users lose internet connection during quiet time prayer, TTS synthesis fails abruptly.',
      mitigation: 'Implement a graceful fallback chain: Gemini TTS API -> Cached Audio Blob -> Native Web SpeechSynthesis with pitch/rate matching.',
      codePattern: 'if (!navigator.onLine && window.speechSynthesis) { const utter = new SpeechSynthesisUtterance(text); utter.pitch = avatar.pitch; window.speechSynthesis.speak(utter); }',
    },
    {
      id: 'edge_avatar_scale',
      title: 'Mobile Portrait vs Tablet Landscape Framing',
      severity: 'medium',
      impact: 'Avatars rendered in 1:1 square crop awkwardly on vertical mobile screens when paired with dialogue cards.',
      mitigation: 'Use responsive layout containers with flex-col on mobile (`<640px`) and grid 7/5 split-view on desktop (`>=1024px`), with `object-cover object-top` image positioning.',
      codePattern: 'className="w-full h-64 sm:h-80 lg:h-96 object-cover object-top rounded-2xl border border-indigo-500/20"',
    },
  ],
  gitHubPlan: {
    repositoryName: 'the-bridge-app',
    recommendedStructure: `the-bridge-app/
├── CLAUDE.md                    # Claude Code instructions & architecture guide
├── package.json                 # React + Tailwind + Lucide dependencies
├── vite.config.ts
├── /src
│   ├── /components
│   │   ├── SanctuaryFeed.tsx    # Daily devotional screen
│   │   ├── PrayerGarden.tsx     # Intercessory prayer room
│   │   ├── ScriptureAthenaeum.tsx # Bible study
│   │   ├── WorshipStage.tsx     # Hymns & worship
│   │   ├── AvatarDialogue.tsx   # Universal avatar voice companion widget
│   │   └── VerseCard.tsx        # Scripture memory cards
│   ├── /data
│   │   ├── avatars.json         # 8 Avatar personas, voices, and dialogue
│   │   ├── scenes.json          # 8 Screen backdrops and image assets
│   │   └── devotionals.json     # Scripture reading plans
│   ├── /lib
│   │   ├── audioEngine.ts       # Audio playback, modulation & offline caching
│   │   └── ttsService.ts        # Gemini TTS + Web Speech fallback
│   └── /assets
│       ├── /avatars/            # Generated portraits for all 8 guides
│       ├── /scenes/             # 4K backdrops for all screens
│       └── /ui/                 # Logos, emblems, and badge graphics
└── scripts/
    └── setup-repo.sh            # Git initialization and asset sync`,
    dependencies: [
      'react@^18.3.1',
      'react-dom@^18.3.1',
      'lucide-react@^1.16.0',
      'tailwindcss@^4.0.0',
      '@google/genai@^0.1.2',
      'idb-keyval@^6.2.1',
    ],
    claudeMdContent: `# The Bridge - Spiritual Christian Companion App

## Project Overview
"The Bridge" is a modern spiritual Christian mobile/web application designed to connect believers with daily devotionals, intercessory prayer fellowship, Scripture scholarship, and worship music.

## Core Architectural Decisions
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with "Luminous Sanctuary" theme:
  - Primary: \`#4f46e5\` (Royal Indigo)
  - Secondary: \`#d97706\` (Warm Gold)
  - Accent: \`#0d9488\` (Serene Living Water)
  - Background: \`#090d16\` (Deep Slate Sky)
- **8 Avatar Guides (Locked Canonical Roster)**:
  1. **David**
  2. **Paul**
  3. **Peter**
  4. **Moses**
  5. **Mary (mother of Jesus)**
  6. **Rahab**
  7. **Ruth**
  8. **Mary Magdalene**

## Implementation Directives for Claude Code
1. Read \`/src/data/avatars.json\` and wire the avatar select dropdown into \`AvatarDialogue.tsx\`.
2. Ensure all text placed over screen backdrops utilizes \`bg-slate-950/80 backdrop-blur-md\` container cards to satisfy WCAG AA contrast.
3. Use \`idb-keyval\` in \`/src/lib/audioEngine.ts\` to cache synthesized voice files locally for offline quiet times.
4. Implement the 8 screen views matching the routes:
   - \`/devotionals\` -> Sanctuary Dawn
   - \`/prayer\` -> Gethsemane Prayer Garden
   - \`/study\` -> Scripture Athenaeum
   - \`/retreat\` -> Mount of Transfiguration
   - \`/fellowship\` -> Agape Fellowship Hall
   - \`/renewal\` -> Living Water Riverbank
   - \`/outreach\` -> Urban Outreach Center
   - \`/vespers\` -> Evening Candlelight Chapel
`,
    bashSetupScript: `#!/usr/bin/env bash
# Quick Setup Script for The Bridge Repository
set -e

echo "🚀 Initializing Git repository for The Bridge..."
git init
git add .
git commit -m "feat: initial commit with The Bridge architecture, 8 avatar guides, and scenes"

echo "📦 Installing production dependencies..."
npm install

echo "✨ Ready! You can now run Claude Code:"
echo "claude --prompt 'Review CLAUDE.md and implement the SanctuaryFeed and AvatarDialogue components'"
`,
    packageJsonSnippet: `{
  "name": "the-bridge-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^0.1.2",
    "idb-keyval": "^6.2.1",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.7.2",
    "vite": "^6.2.0"
  }
}`,
  },
  createdAt: 1774130000000,
};
