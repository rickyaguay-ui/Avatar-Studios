import type { Provider } from './provider';
import { getExample } from './examples';

const demoOff = <T,>() => Promise.resolve({
  ok: false as const, code: 'demo_mode' as const,
  message: 'Demo mode: this action is preloaded and makes no live calls.',
}) as Promise<import('../types').Result<T>>;

/** Demo provider: committed bundles only. Never touches the network. */
export const demoProvider: Provider = {
  mode: 'demo',
  getExample: getExample,
  getIntegrationStatus: () => demoOff(),
  generatePortrait: () => demoOff(),
  speak: async ({ format, host }) => ({ ok: true, data: { audioUrl: getExample(format).voices[host] } }),
};
