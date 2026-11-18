import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { AvatarConfig, FormatId, HostId } from '../types';
import { provider, APP_MODE } from '../services/provider';
import { FORMAT_ORDER } from '../services/examples';

export type StepId = 'format' | 'avatar' | 'voice' | 'preview' | 'export' | 'integrations';
export const STEPS: { id: StepId; label: string }[] = [
  { id: 'format', label: 'Format' }, { id: 'avatar', label: 'Avatar' }, { id: 'voice', label: 'Voice' },
  { id: 'preview', label: 'Preview' }, { id: 'export', label: 'Export' }, { id: 'integrations', label: 'Integrations' },
];

interface State {
  step: StepId; format: FormatId; host: HostId;
  avatars: Record<FormatId, AvatarConfig>;
  portrait: string | null;     // chosen portrait URL (preloaded or generated)
  voiceId: string | null;      // an ElevenLabs voice picked in the Voice step; null = the host's own voice
  backdrop: string | null;     // chosen backdrop URL; null = the format's example backdrop
  walkthrough: boolean;
  script: string;              // Live mode: the script written in the Voice step; the Preview plays it
  backdropPrompt: string | null; // Live mode: the scene description when `backdrop` is an AI-generated scene
  customized: boolean;         // Live mode: the user has changed the customizer avatar (until then no stock face is shown)
  squareMode: SquareMode;      // Live mode: what the small square in the frame shows
  squareUrl: string | null;    // Live mode: a separately generated avatar for the small square
}
export type SquareMode = 'mine' | 'other' | 'none';
export type Action =
  | { t: 'step'; step: StepId } | { t: 'format'; format: FormatId } | { t: 'host'; host: HostId }
  | { t: 'avatar'; config: AvatarConfig } | { t: 'portrait'; url: string | null } | { t: 'backdrop'; url: string | null; prompt?: string } | { t: 'voice'; id: string | null } | { t: 'walkthrough'; open: boolean } | { t: 'script'; text: string }
  | { t: 'square'; mode: SquareMode; url?: string | null };

/** Live mode has ONE avatar for every format; Demo keeps its per-format examples. */
export function makeInitial(live: boolean): State {
  const avatars = Object.fromEntries(
    FORMAT_ORDER.map((f) => [f, structuredClone(provider.getExample(live ? FORMAT_ORDER[0] : f).avatar)]),
  ) as Record<FormatId, AvatarConfig>;
  return { step: 'format', format: 'tiktok', host: 'mesa', avatars, portrait: null, voiceId: null, backdrop: null, walkthrough: true, script: '', backdropPrompt: null, customized: false, squareMode: 'mine', squareUrl: null };
}

export function makeReducer(live: boolean) {
  return function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'step': return { ...s, step: a.step };
    // Live: the user's avatar survives format and narrator-voice changes. Demo: the portrait follows the example host.
    case 'format': return { ...s, format: a.format, portrait: live ? s.portrait : null };
    case 'host': return { ...s, host: a.host, portrait: live ? s.portrait : null, voiceId: null };
    case 'avatar': {
      if (!live) return { ...s, avatars: { ...s.avatars, [s.format]: a.config } };
      return { ...s, customized: true, avatars: Object.fromEntries(FORMAT_ORDER.map((f) => [f, a.config])) as Record<FormatId, AvatarConfig> };
    }
    case 'square': return { ...s, squareMode: a.mode, squareUrl: a.url === undefined ? s.squareUrl : a.url };
    case 'portrait': return { ...s, portrait: a.url };
    case 'backdrop': return { ...s, backdrop: a.url, backdropPrompt: a.url ? a.prompt ?? null : null };
    case 'voice': return { ...s, voiceId: a.id };
    case 'walkthrough': return { ...s, walkthrough: a.open };
    case 'script': return s.script === a.text ? s : { ...s, script: a.text };
  }
  };
}

const initial = makeInitial(APP_MODE === 'live');
const reducer = makeReducer(APP_MODE === 'live');

const Ctx = createContext<{ s: State; d: React.Dispatch<Action> } | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, initial);
  const v = useMemo(() => ({ s, d }), [s]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export function useStudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStudio outside provider');
  return c;
}
