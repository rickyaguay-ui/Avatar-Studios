import type { AppMode, FormatExample, FormatId, HostId, IntegrationId, Result } from '../types';
import { demoProvider } from './demoProvider';
import { liveProvider } from './liveProvider';

export interface PortraitRequest {
  hairstyle: string; clothing: string; bodyType: string; framing: string; artStyle: string; host: HostId;
}
export interface SpeakRequest { format: FormatId; host: HostId; text: string }
export type IntegrationStatus = Record<IntegrationId, boolean>;

/** Every screen talks to this interface and never to fetch directly. */
export interface Provider {
  mode: AppMode;
  getExample(format: FormatId): FormatExample;
  getIntegrationStatus(): Promise<Result<IntegrationStatus>>;
  generatePortrait(req: PortraitRequest): Promise<Result<{ imageUrl: string }>>;
  /** Returns an audio URL for the narration. Demo: the committed clip. Live: ElevenLabs via the server. */
  speak(req: SpeakRequest): Promise<Result<{ audioUrl: string }>>;
}

// Replaced at build time by vite.config.ts: the hosted demo is fixed to 'demo'.
declare const __APP_MODE__: AppMode;
export const APP_MODE: AppMode = typeof __APP_MODE__ !== 'undefined' ? __APP_MODE__ : 'live';

export const provider: Provider = APP_MODE === 'demo' ? demoProvider : liveProvider;
