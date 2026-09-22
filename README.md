# Avatar Studios

> "AI-powered asset studio for generating avatars, backgrounds, UI art, voice, and music for app builds — standalone tool, independent of any single app it services."

[![GitHub Repository](https://img.shields.io/badge/GitHub-rickyaguay--ui%2FAvatar--Studios-blue?logo=github)](https://github.com/rickyaguay-ui/Avatar-Studios)

Avatar Studios is an end-to-end creative suite for building in-app intro cutscenes, avatar companions, voiceovers, soundtracks, and UI artwork across modern applications (Web, Android, iOS, Flutter).

---

## 🌟 Core Studios & Features

1. **AI App Architect**
   - Single-prompt full app blueprint generation powered by Gemini.
   - Generates 8-character avatar rosters, multi-screen scene lists, UI icon specs, QA checklists, and edge-case mitigations.
   - Includes canonical presets such as **The Bridge** (featuring the locked canonical cast: David, Paul, Peter, Moses, Mary, Rahab, Ruth, Mary Magdalene).

2. **Project Vault & Style Priming Engine**
   - Manage multiple named projects (Mobile, Web Modal, Game Cutscene, Banner, Dashboard).
   - Style Anchors & Style Lock to enforce aesthetic consistency across all generated assets.
   - Built-in style primers including **Bible Project** (flat 2D vector / paper-cutout silhouettes, ancient Near-Eastern motifs, muted earthy palette), Cyberpunk Raytraced 3D, Modern SaaS Flat Vector, and Whimsical Claymorphism.

3. **Avatar Studio**
   - Multi-style character generation: `3d_cute`, `cyberpunk`, `anime`, `pixel`, `vector`, and `watercolor` (for full-body watercolor portraits).
   - Wardrobe customization: 9 hairstyles, 7 tops, 6 bottoms, 5 footwear types, 8 accessories, and 6 body types.
   - Transparent PNG isolation mode for clean mobile/web UI cutouts.
   - Live voice auditioning and pitch/speed modulation.

4. **Background Studio**
   - High-resolution (1K / 2K / 4K) scenic backdrops with aspect ratios (16:9, 1:1, 9:16, 4:3, 3:4).
   - Dynamic motion preview (zoom, pan, pulse).

5. **UI Art & Icons Studio**
   - Style-primed icons, badges, hero splash banners, card frames, and button sprites.

6. **Voice Studio & Live Conversation**
   - Text-to-speech with 5 distinct voices (*Kore, Puck, Charon, Fenrir, Zephyr*) and 8 emotional deliveries.
   - Pitch (0.5x–1.8x) and Speed (0.6x–1.8x) offline PCM modulation.
   - Real-time two-way voice chat over WebSockets and audio transcription.

7. **Music Studio**
   - Built-in Web Audio synthesis engine (6 preset tracks, zero external API latency).
   - AI music generation with Lyria integration.

8. **Veo Video Studio**
   - Cinematic text-to-video and image-to-video generation using Google Veo.

9. **Live Intro Simulator (`AppIntroPlayer`)**
   - Live cross-platform preview in realistic device frames: **Mobile**, **Web Modal**, **Fullscreen**, and **Cutscene**.

10. **Multi-Profile Export Hub (`ExportHub` / `ExportModal`)**
    - **Raw / Source**: Full-resolution master assets and unconstrained manifest.
    - **Web**: Flat PNG/WebP assets with drop-in React and HTML embed snippets.
    - **Android**: Density-bucketed raster resource tree (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`), XML vector drawables, and Jetpack Compose (`AvatarIntroScreen.kt`) integration.
    - **iOS (Stub)**: Shaped for Xcode `.xcassets` catalog structure with `@1x`, `@2x`, `@3x` scale variants and SwiftUI stubs.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React
- **Audio Engine**: Web Audio API (real-time synthesizer & PCM modulator)
- **Backend**: Express (`server.ts`), `@google/genai` (Gemini 2.5 / 3.0 / Veo / Lyria), WebSocket (`ws`)
- **Cloud Persistence**: Optional Firebase Auth & Cloud Firestore sync

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/rickyaguay-ui/Avatar-Studios.git
cd Avatar-Studios

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set GEMINI_API_KEY in .env.local

# Run development server
npm run dev
```

---

## 🔒 Security & Version Control
- `.env*` and `firebase-applet-config.json` are strictly excluded from version control via `.gitignore`.
