# Avatar Studios

> "AI-powered asset studio for generating avatars, backgrounds, UI art, voice, and music for app builds — standalone tool, independent of any single app it services."

[![GitHub Repository](https://img.shields.io/badge/GitHub-rickyaguay--ui%2FAvatar--Studios-blue?logo=github)](https://github.com/rickyaguay-ui/Avatar-Studios)

Avatar Studios is an end-to-end creative suite for building in-app intro cutscenes, avatar companions, voiceovers, soundtracks, and UI artwork across modern applications (Web, Android, iOS, Flutter).

---

## What it does

1. **Avatar Studio**: start from ten demo avatars in five art styles (hand-drawn sketch, flat portrait, line art, pixel art, friendly mascot). Flip through them, pick one, then customize the look or generate your own in that style.
2. **Background Studio**: six built-in backdrops, or generate your own in 1K / 2K / 4K.
3. **Voice Studio**: spoken lines with five Gemini voices (or ElevenLabs), eight emotions, and pitch / speed controls. Live voice chat and audio transcription.
4. **Music Studio**: six built-in tracks that play with no key, plus AI-generated music.
5. **UI Art & Icons**: app icons, banners, badges and cards in your project's style.
6. **Veo Video Studio**: text-to-video and image-to-video.
7. **Live Intro Simulator**: plays the avatar, backdrop, voice and music together in a phone, web or full-screen frame.
8. **Export Hub**: Raw, Web and Android profiles (iOS is a stub), with a JSON manifest.
9. **Project Vault & Style Primers**: one folder per project, with eight plainly named art styles you can edit.
10. **AI App Architect**: describe your app and get a plan. It starts empty. Nothing is pre-filled.

On first launch a short walkthrough explains the steps. The **?** button in the header reopens it.

The app ships with **no pre-built apps or projects**. You start with one empty project.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React
- **Audio Engine**: Web Audio API (real-time synthesizer & PCM modulator)
- **Backend**: Express (`server.ts`), `@google/genai` (Gemini 2.5 / 3.0 / Veo / Lyria), WebSocket (`ws`)
- **Persistence**: browser localStorage plus a local file store. Firebase Auth & Firestore sync is optional and off by default.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Gemini API Key

### Installation (Windows PowerShell)

```powershell
git clone https://github.com/rickyaguay-ui/Avatar-Studios.git
cd Avatar-Studios
npm install
Copy-Item .env.example .env
notepad .env        # set GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000.

- The server reads **`.env`** (not `.env.local`).
- The starter avatars, backdrops, music, intro player and export work **without any key**. Generating new images, voice, music and video needs `GEMINI_API_KEY`.
- Firebase is optional. To turn it on, copy `firebase-applet-config.example.json` to `firebase-applet-config.json` and fill in a real config. Without it, sign-in is hidden and projects stay in your browser.

---

## 🔒 Security & Version Control
- `.env*`, `projects_data.json` and `firebase-applet-config.json` are excluded from version control via `.gitignore`.

## Credits

Demo avatars are CC0 and are listed in `public/avatars/LICENSES.md`.
