# Avatar Studios

Pick where an intro will play, build the avatar, choose the voice, preview it, and export what you need to ship it. One example brand, **R&B's Homesteading**, is shown in three formats so you can see the whole flow.

The app runs in two modes:

- **Demo mode** uses only committed files. It makes no network calls and needs no keys. The hosted build is fixed to this mode (`npm run build:demo`).
- **Live mode** is what `npm run dev` runs. It calls the local server, which uses your API keys from `.env`.

## The six steps

1. **Format**: Android app intro, PWA web intro, or TikTok / Reels (9:16, with a safe-zone overlay).
2. **Avatar**: a DiceBear Open Peeps customizer (head, expression, facial hair, accessories, skin, clothing, hair color), the two example hosts (Mesa and Reed), and ten **starter avatars** in five art styles. In Live mode, a Gemini portrait builder.
3. **Voice**: play the narration for the chosen host. Demo mode plays pre-made clips. Live mode generates it with ElevenLabs.
4. **Preview**: plays the scripted cues with captions in a device frame. Choose one of six **backdrops** for the frame.
5. **Export**: platform spec tables (Android, PWA, TikTok) and a copyable prompt bundle. The TikTok safe-zone values are configurable and marked unverified in `src/config/safeZones.ts`.
6. **Integrations**: what each key (Gemini, ElevenLabs, Hedra) powers and where it goes. Hedra is wired on the server but no screen uses it yet.

A short walkthrough opens on first load. The **Walkthrough** button in the header reopens it.

## Run it (Windows PowerShell)

Needs Node.js 18 or newer.

```powershell
git clone https://github.com/rickyaguay-ui/Avatar-Studios.git
cd Avatar-Studios
npm install
Copy-Item .env.example .env
notepad .env        # add the keys you have
npm run dev
```

Open http://localhost:3000.

The server reads **`.env`** (not `.env.local`). Keys are never typed into the app.

| Variable | What it enables |
| --- | --- |
| `GEMINI_API_KEY` | Portrait builder and the other Gemini routes (Live mode) |
| `ELEVENLABS_API_KEY` | Narration in Live mode |
| `ELEVENLABS_VOICE_MESA`, `ELEVENLABS_VOICE_REED` | Voice IDs for the two hosts (pick them from your ElevenLabs voice list) |
| `ELEVENLABS_VOICE_DEFAULT` | Fallback voice ID |
| `HEDRA_API_KEY` | Talking-avatar video (server only for now) |

Everything in Demo mode, including the starter avatars and backdrops, works with no keys.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Live-mode app on port 3000 |
| `npm run build:demo` | Builds the keyless Demo site into `dist-demo` |
| `npm run preview:demo` | Serves `dist-demo` locally |
| `npm run check:assets` | Checks that every file the demo bundles point to exists and that images stay under the size budget |
| `npm run lint` | TypeScript check |

## Tech

React 19, TypeScript, Vite, Tailwind CSS v4. Express server (`server.ts`) with `@google/genai`. Avatars render locally with `@dicebear/core`.

## Credits

The starter avatars in `public/avatars` are CC0 (public domain). Sources and licenses are in `public/avatars/LICENSES.md`. The backdrops in `public/backgrounds` were drawn for this project.
