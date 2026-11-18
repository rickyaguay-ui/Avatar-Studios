import type { Provider } from './provider';
import type { Result } from '../types';
import { getExample } from './examples';
import { neutralExample } from '../live/neutral';

const ACCESS_CODE_KEY = 'avatarStudiosAccessCode';

function readAccessCode(): string {
  try { return localStorage.getItem(ACCESS_CODE_KEY) || ''; } catch { return ''; }
}

async function post<T>(url: string, body: unknown, serviceKey: string): Promise<Result<T>> {
  try {
    const send = () => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const code = readAccessCode();
      if (code) headers['x-access-code'] = code;
      return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    };
    let res = await send();
    if (res.status === 401) {
      const entered = window.prompt('Enter the access code');
      if (entered) {
        try { localStorage.setItem(ACCESS_CODE_KEY, entered); } catch { /* ignore */ }
        res = await send();
      }
    }
    const json = await res.json().catch(() => ({}));
    if (res.status === 503 || /not configured|API key/i.test(String(json?.error ?? ''))) {
      return { ok: false, code: 'not_configured', message: `${serviceKey} is not configured. Add its key to .env on the server machine.` };
    }
    if (!res.ok) return { ok: false, code: 'error', message: String(json?.error ?? `Request failed (${res.status})`) };
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, code: 'error', message: e instanceof Error ? e.message : 'Network error' };
  }
}

/** Live provider: same interface, calls the server's /api routes. */
export const liveProvider: Provider = {
  mode: 'live',
  // Live mode starts blank: no built-in example script (the Mesa/Reed copy stays in Demo mode only).
  getExample: (f) => neutralExample(getExample(f)),
  async getIntegrationStatus() {
    try {
      const res = await fetch('/api/integrations/status');
      if (!res.ok) return { ok: false, code: 'error', message: `Status check failed (${res.status})` };
      return { ok: true, data: await res.json() };
    } catch (e) {
      return { ok: false, code: 'error', message: e instanceof Error ? e.message : 'Network error' };
    }
  },
  async generatePortrait(r) {
    const who = r.host === 'mesa' ? 'woman in her late 30s, calm and clear expression' : 'man in his 40s, warm and direct expression';
    const prompt = r.prompt || `Portrait of a fictional ${who}, ${r.hairstyle} hair, wearing ${r.clothing}, ${r.bodyType} build, ${r.framing} framing, ${r.artStyle} style, soft natural window light, neutral studio backdrop, sharp focus, head and shoulders. Synthetic person, no text, no logos.`;
    const res = await post<{ imageUrl: string }>('/api/generate-image', { prompt, aspectRatio: '9:16' }, 'Image generation');
    return res;
  },
  async generateBackdrop(prompt) {
    return post<{ imageUrl: string }>('/api/generate-backdrop', { prompt }, 'Image generation');
  },
  async speak({ format, host, text, voiceId }) {
    // voiceId (an ElevenLabs voice picked in the Voice step) wins; otherwise the host's voice from .env is used.
    const res = await post<{ audioUrl: string }>('/api/elevenlabs-speech', { text, characterName: host === 'mesa' ? 'Mesa' : 'Reed', ...(voiceId ? { voiceId } : {}) }, 'ElevenLabs');
    if (res.ok) return { ok: true, data: { audioUrl: res.data.audioUrl } };
    void format;
    return res;
  },
};
