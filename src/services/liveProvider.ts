import type { Provider } from './provider';
import type { Result } from '../types';
import { getExample } from './examples';

async function post<T>(url: string, body: unknown, serviceKey: string): Promise<Result<T>> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
  getExample,
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
    const prompt = `Portrait of a fictional ${r.host === 'mesa' ? 'woman' : 'man'}, ${r.hairstyle} hair, wearing ${r.clothing}, ${r.bodyType} build, ${r.framing} framing, ${r.artStyle} style. Synthetic person, no text, no logos.`;
    const res = await post<{ imageUrl: string }>('/api/generate-image', { prompt, aspectRatio: '9:16' }, 'Gemini');
    return res;
  },
  async speak({ format, host, text }) {
    const res = await post<{ audioUrl: string }>('/api/elevenlabs-speech', { text, characterName: host === 'mesa' ? 'Mesa' : 'Reed' }, 'ElevenLabs');
    if (res.ok) return { ok: true, data: { audioUrl: res.data.audioUrl } };
    void format;
    return res;
  },
};
