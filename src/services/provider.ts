import type { AppMode, FormatExample, FormatId, HostId, IntegrationId, Result } from '../types';
import { demoProvider } from './demoProvider';
import { liveProvider } from './liveProvider';

export interface PortraitRequest {
  hairstyle: string; clothing: string; bodyType: string; framing: string; artStyle: string; host: HostId;
  prompt?: string;   // Live mode: the fully assembled prompt (overrides the fields above)
}
export interface ImageResult { imageUrl: string; model?: string; width?: number; height?: number; seedHonored?: boolean }
export interface GenerateImageRequest { kind: 'portrait' | 'scene'; prompt: string; seed: number; width: number; height: number }
export interface EditImageRequest { prompt: string; image: string; seed: number; width: number; height: number }
export interface SpeakRequest { format: FormatId; host: HostId; text: string; voiceId?: string }
export type IntegrationStatus = Record<IntegrationId, boolean>;

/** Every screen talks to this interface and never to fetch directly. */
export interface Provider {
  mode: AppMode;
  getExample(format: FormatId): FormatExample;
  getIntegrationStatus(): Promise<Result<IntegrationStatus>>;
  generatePortrait(req: PortraitRequest): Promise<Result<{ imageUrl: string }>>;
  /** Live mode only: an AI backdrop/scene from a prompt. Demo has none. */
  generateBackdrop?(prompt: string): Promise<Result<{ imageUrl: string }>>;
  /** Live mode only: a seeded image from the structured prompt (portrait or scene). */
  generateImage?(req: GenerateImageRequest): Promise<Result<ImageResult>>;
  /** Live mode only: true image editing from an instruction (reference image in, edited image out). */
  editImage?(req: EditImageRequest): Promise<Result<ImageResult>>;
  /** Returns an audio URL for the narration. Demo: the committed clip. Live: ElevenLabs via the server. */
  speak(req: SpeakRequest): Promise<Result<{ audioUrl: string }>>;
}

// Replaced at build time by vite.config.ts: the hosted demo is fixed to 'demo'.
declare const __APP_MODE__: AppMode;
export const APP_MODE: AppMode = typeof __APP_MODE__ !== 'undefined' ? __APP_MODE__ : 'live';

export const provider: Provider = APP_MODE === 'demo' ? demoProvider : liveProvider;
