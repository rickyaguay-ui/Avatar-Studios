// Live mode starts blank: the built-in Mesa/Reed example script is replaced with neutral placeholders,
// and the Preview is built from what the user wrote. Mesa and Reed stay only as example presets.
import type { Cue, FormatExample } from '../types';

const PLACEHOLDER_CUES: Cue[] = [
  { at: 0, voiceover: 'Your headline goes here.', onScreen: 'Your headline' },
  { at: 4, voiceover: 'Write your own script in the Voice step.', onScreen: 'Your message' },
  { at: 8, voiceover: 'Your call to action goes here.', onScreen: 'Your call to action' },
];

/** The example with no built-in R&D copy. */
export function neutralExample(ex: FormatExample): FormatExample {
  const extra: Record<string, unknown> =
    ex.id === 'android' ? { cards: [], fallback: 'Your message appears here.' }
    : ex.id === 'pwa' ? { headline: 'Your headline', subhead: 'Your short description goes here.', cards: [], caveat: '', url: 'https://your-app.example' }
    : {};
  return { ...ex, brand: 'Your avatar', backdrop: '/backgrounds/sunrise_hills.png', video: undefined, cues: PLACEHOLDER_CUES, durationSec: 12, extra };
}

function shorten(s: string, n = 44) { return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s; }

/** The user's script as cues (one per sentence) with timing proportional to length. */
export function userExample(base: FormatExample, script: string): FormatExample {
  const text = script.trim();
  if (!text) return base;
  const sentences = (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
  const total = Math.max(5, Math.round(text.split(/\s+/).length / 2.5));
  const chars = sentences.reduce((n, s) => n + s.length, 0) || 1;
  let acc = 0;
  const cues: Cue[] = sentences.map((s) => {
    const at = Math.round((acc / chars) * total * 10) / 10;
    acc += s.length;
    return { at, voiceover: s, onScreen: shorten(s) };
  });
  const extra = base.id === 'pwa' ? { ...(base.extra ?? {}), headline: shorten(sentences[0], 60), subhead: sentences.slice(1).join(' ') || ' ' } : base.extra;
  return { ...base, cues, durationSec: total, extra };
}
