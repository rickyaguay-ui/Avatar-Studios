import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { AvatarConfig, FormatId, HostId } from '../types';
import { provider } from '../services/provider';
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
}
type Action =
  | { t: 'step'; step: StepId } | { t: 'format'; format: FormatId } | { t: 'host'; host: HostId }
  | { t: 'avatar'; config: AvatarConfig } | { t: 'portrait'; url: string | null } | { t: 'backdrop'; url: string | null } | { t: 'voice'; id: string | null } | { t: 'walkthrough'; open: boolean } | { t: 'script'; text: string };

const initialAvatars = Object.fromEntries(
  FORMAT_ORDER.map((f) => [f, structuredClone(provider.getExample(f).avatar)]),
) as Record<FormatId, AvatarConfig>;

const initial: State = { step: 'format', format: 'tiktok', host: 'mesa', avatars: initialAvatars, portrait: null, voiceId: null, backdrop: null, walkthrough: true, script: '' };

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'step': return { ...s, step: a.step };
    case 'format': return { ...s, format: a.format, portrait: null };
    case 'host': return { ...s, host: a.host, portrait: null, voiceId: null };
    case 'avatar': return { ...s, avatars: { ...s.avatars, [s.format]: a.config } };
    case 'portrait': return { ...s, portrait: a.url };
    case 'backdrop': return { ...s, backdrop: a.url };
    case 'voice': return { ...s, voiceId: a.id };
    case 'walkthrough': return { ...s, walkthrough: a.open };
    case 'script': return s.script === a.text ? s : { ...s, script: a.text };
  }
}

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
