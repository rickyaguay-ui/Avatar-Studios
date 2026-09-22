# AppIntro & Avatar Studio — Current State + Required Changes

Source: AI Studio export (React/Vite + Express backend, Gemini API). This document is the handoff basis for the Claude Code contract-check → research-verify → implement-and-test pipeline.

---

## PART 1 — Current State (as exported, unchanged)

Ten top-level modules, a Gemini-backed Express server, and local + optional cloud persistence.

### 1. AI App Architect
- Single text prompt → generates a full app blueprint via Gemini: app name, tagline, target audience, aesthetic theme, color palette (primary/secondary/accent/background/surface hex), style directives
- Auto-generates an 8-avatar roster from that prompt — name, role, personality, gender description, appearance prompt, hairstyle, clothing, assigned voice, pitch/speed, emotion, intro dialogue line, target screen
- Auto-generates a scene list (screen name, description, prompt, aspect ratio, style preset) and a UI asset list (icon/badge/card/banner/logo, each with prompt + usage note)
- Auto-generates a QA checklist (categorized: architecture/avatar/voice/scene/ui/engineering/github) and an edge-case list (severity + impact + mitigation + optional code pattern)
- Generates a "GitHub plan": repo name, folder structure, dependency list, a `CLAUDE.md` content block, a bash setup script, a package.json snippet
- Voice audition per generated avatar; one-click "apply this avatar/scene to the working studio project"
- Downloads the whole blueprint + GitHub plan as a single JSON bundle file
- Ships with one preset blueprint baked in: `THE_BRIDGE_BLUEPRINT` (`src/data/theBridgePreset.ts`) — **see Part 2, item 1**

### 2. Project Vault (Project Folder Manager)
- Multiple named project folders, each with its own app type (mobile/web modal/game cutscene/banner/dashboard), style primer, and full studio state
- Per-project asset library, organized into folders: avatar / background / ui_art / voice / music / video / intro
- Search across current project or all projects; filter by tag; delete individual assets
- **Style Priming Engine**: named style presets (art medium — 3D raytraced, octane, vector flat, pixel, digital anime, claymorphism, cyberpunk glow, minimalist duotone, photorealistic; lighting style — studio soft, neon glow, dramatic chiaroscuro, ambient warm, cyber volumetric, clean daylight), editable hex color palette, free-text style directives, and a reference image anchor — any generated asset can be marked "Style Anchor" and used to condition future generations
- Style Lock toggle — when on, every new generation in that project is conditioned against the saved primer/anchor
- Create new project, export a project as JSON, import a project JSON back in

### 3. Avatar Studio
- Two generation modes: preset avatars, or AI-generate
- Style options: 3d_cute, cyberpunk, pixel, anime, vector — **see Part 2, items 2 & 3**
- Framing: bust / half-body / full-body; pose: center/left/right
- Wardrobe system: hairstyle (9), hair color, top garment (7), bottom (6), shoes (5), accessory (8), body type (6)
- "Isolate for App Cutout" (background removal for transparent PNG use)
- "Randomize Look" button
- Voice audition per avatar (5 voice options, shared across the app)
- Undo/redo, split-view (before/after compare), save to vault, set-as-style-anchor

### 4. Background Studio
- Preset scene library (6 built-in: cyberpunk city, deep space, glass office, fantasy forest, retro arcade grid, sunset gradient) or AI text-to-image generation
- Size (1K/2K/4K), aspect ratio, animation style (zoom/pan/pulse/none)
- "Pre-Play in Intro" — preview inside the intro simulator directly
- Undo/redo, save to vault

### 5. UI Art & Icons Studio
- Presets: app launcher icon (1:1 squircle), hero splash banner (16:9), card graphics, badges, button sprites
- Style-primed prompt building (pulls from the active project's style primer automatically)
- Save to vault, set-as-style-anchor

### 6. Voice Studio
- Text-to-speech via 5 named voices (Kore, Puck, Charon, Fenrir, Zephyr), 8 emotion presets (cheerful, energetic, happy, heroic, calm, sad, dramatic, robotic)
- 4 script templates (SaaS onboarding, game cutscene, fintech alert, fitness coach)
- Voice modulation: pitch (0.5–1.8) and speed (0.6–1.8) sliders, rendered to a separate WAV
- Live Voice Conversation — real-time two-way voice chat over WebSocket
- Audio Transcriber — record or upload audio, get transcript back, push into dialogue or prompt fields
- Undo/redo, split-view, save to vault

### 7. Music Studio
- Preset synth tracks (6 built-in, local Web Audio synth engine — no API call)
- AI music generation via Lyria (two model tiers: "clip" and "pro"), free-text prompt, returns audio + optionally lyrics
- Independent music/voice volume mixer
- Save preset or AI track to vault

### 8. Veo Video Studio
- Text-to-video or image-to-video (upload source, or pull current avatar/background)
- Model: veo-3.1-fast-generate-preview; aspect ratio 16:9/9:16; resolution 720p/1080p
- 4 suggested cinematic prompts
- Async job handling: kicks off generation, polls status endpoint, downloads finished video
- Preview player with loop toggle, save to vault

### 9. Live Intro Simulator (AppIntroPlayer)
- Plays the assembled intro (background + avatar + voice + music + subtitles) as a live preview
- Three device frames: mobile, web modal, fullscreen (plus a cutscene mode)
- Focus mode: full intro vs. avatar+voice only
- Subtitle styles: glass pill, retro terminal, comic bubble, minimal
- Can be launched pre-scoped from any other studio

### 10. Export Hub / Export Modal
- Generates copy-pasteable code in React, Flutter, and plain HTML, plus a raw JSON manifest of every asset/setting in the current project
- Manifest schema versioned (`schemaVersion: "1.0.0"`)
- Direct file downloads for individual assets (PNG for images, WAV for audio)
- **See Part 2, item 4** — export target handling needs restructuring

### Cross-cutting infrastructure
- **Chat Copilot** — sidebar AI assistant, 8 role personas (Intro Director, Video Director, Avatar Stylist, Dialogue Writer, Background Artist, Music Composer, UI Designer, general), 3 selectable Gemini models, optional Google Search grounding, quick-starter prompts, structured output tags (`[BACKGROUND_PROMPT]`, `[AVATAR_PROMPT]`, `[SCRIPT]`, `[VIDEO_PROMPT]`) that apply directly into the relevant studio
- **Studio AI Helper** — contextual per-screen guide (what/how-to/pro tips) plus brainstorm starters
- **Undo/Redo history system** — full deep-cloned state snapshots, categorized, with a history modal to jump to any past snapshot
- **Persistence** — localStorage by default; optional Google sign-in (Firebase Auth) syncs to Firestore per user; local `/api/projects` REST fallback also present in `server.ts`
- **Backend (`server.ts`)** — Express endpoints for chat, architect-plan generation, image generation, audio transcription, video generation + status polling + download, speech generation, music generation, local project CRUD. This is where `GEMINI_API_KEY` is used.

---

## PART 2 — Required Changes (the actual contract scope)

1. **Remove the fabricated Bridge cast.** `src/data/theBridgePreset.ts` currently contains a full blueprint for "The Bridge" with an invented modern-staff cast (Pastor David, Grace Miller, Elder Elijah, Dr. Hannah Chen, Marcus Vance, Abigail Stone, Lucas Silva, Esther Morales) — none of which match the real, locked cast. Replace with the actual 8: David, Paul, Peter, Moses, Mary (mother of Jesus), Rahab, Ruth, Mary Magdalene. Style/personality/voice fields for each to be filled in as the app grows — leave as a minimal/blank template where content isn't decided yet, not fabricated.

2. **Add a `watercolor` value to the `AvatarStudio`/`StudioProject` `avatarStyle` type** (currently `3d_cute | cyberpunk | pixel | anime | vector`). Tied to the existing locked Bridge cast style — full-body watercolor portraits.

3. **Add a `bible_project` style preset** to the Style Priming Engine (`ProjectStylePrimer` / `projectPresets.ts`), separate from watercolor — this is a new, distinct visual language, not a replacement:
   - Style name: Bible Project
   - Art medium: flat vector / paper-cutout illustration — no painterly texture, no gradients beyond flat color blocks
   - Lighting style: none in the photographic sense — depth implied through layered flat shapes
   - Style directives: "Flat 2D vector illustration, paper-cutout character silhouettes, geometric simplified forms, muted earthy limited color palette (ochre, terracotta, deep blue, cream), no facial detail beyond simple shape, ancient Near-Eastern visual motifs, clean bold outlines, no photorealism, no 3D shading"

4. **Restructure export as a selectable profile system**, not a single hardcoded output path. This tool is explicitly general-purpose — it must not be built only around The Bridge's needs.
   - Profiles: **Raw/Source** (full-res, unprocessed — current default), **Web** (flat PNG/WebP, as-is — current behavior), **Android** (density-bucketed raster: mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi, vector drawable where feasible), **iOS** (stub only for now — @1x/@2x/@3x suffixed files, not implemented yet, just shaped so it can be added later without rework)
   - Android is the only new profile actually built out in this pass, since it's the one with a live current need
   - Export action should let the user pick a profile per export, not assume one globally

---

## Notes for Claude Code
- Manual approval required before any commits (per standing rule).
- Secrets check before first push: confirm `.env.local` (`GEMINI_API_KEY`) and `firebase-applet-config.json` are actually excluded by `.gitignore` — they are AI-Studio-export artifacts and were not confirmed excluded as of this handoff.
- Repo visibility (public/private) is not a blocker — can be toggled after the fact.
