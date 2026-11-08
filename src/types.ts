export type FormatId = 'android' | 'pwa' | 'tiktok';
export type HostId = 'mesa' | 'reed';
export type AppMode = 'demo' | 'live';

export interface Cue {
  at: number;            // seconds from start (nominal, scaled to real clip length)
  voiceover: string;
  onScreen: string;
  screen?: string;       // android: splash | card1..3 | end
}

export interface AvatarConfig {
  seed: string;
  options: Record<string, unknown>;
}

export interface FormatExample {
  id: FormatId;
  label: string;
  brand: string;
  durationSec: number;
  cues: Cue[];
  avatar: AvatarConfig;
  portraits: Record<HostId, string>;
  backdrop: string;      // still image with slow zoom (bg-<format>.png)
  video?: string;        // optional clip-<format>.mp4; used only if the file exists
  voices: Record<HostId, string>;
  extra?: Record<string, unknown>;
}

export interface OnboardingStep {
  id: number;
  title: string;
  host: HostId;
  text: string;
  clip: string;
  talkingHead?: string;  // optional Hedra lip-sync clip; falls back to portrait + audio
  covers: { step: string; what: string }[];
}

export type IntegrationId = 'gemini' | 'elevenlabs' | 'hedra';
export interface IntegrationInfo {
  id: IntegrationId;
  name: string;
  powers: string;
  how: string;
  envVar: string;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'not_configured' | 'demo_mode' | 'error'; message: string };
