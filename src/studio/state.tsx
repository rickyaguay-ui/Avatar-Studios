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
  walkthrough: boolean;
}
type Action =
  | { t: 'step'; step: StepId } | { t: 'format'; format: FormatId } | { t: 'host'; host: HostId }
  | { t: 'avatar'; config: AvatarConfig } | { t: 'portrait'; url: string | null } | { t: 'walkthrough'; open: boolean };

const initialAvatars = Object.fromEntries(
  FORMAT_ORDER.map((f) => [f, structuredClone(provider.getExample(f).avatar)]),
) as Record<FormatId, AvatarConfig>;

const initial: State = { step: 'format', format: 'tiktok', host: 'mesa', avatars: initialAvatars, portrait: null, walkthrough: true };

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'step': return { ...s, step: a.step };
    case 'format': return { ...s, format: a.format, portrait: null };
    case 'host': return { ...s, host: a.host, portrait: null };
    case 'avatar': return { ...s, avatars: { ...s.avatars, [s.format]: a.config } };
    case 'portrait': return { ...s, portrait: a.url };
    case 'walkthrough': return { ...s, walkthrough: a.open };
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
