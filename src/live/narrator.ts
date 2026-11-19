// The narrator is the avatar the user built. It is the circle in the frame and is the same in every step.
// Nothing preloaded is ever shown as the narrator: before the user builds one, the circle is an empty placeholder.
import type { SquareMode } from '../studio/state';

export interface NarratorState { portrait: string | null; customized: boolean; squareMode: SquareMode; squareUrl: string | null }

export interface NarratorInfo {
  src: string | null;        // the narrator image (generated/starter portrait, else the customized avatar), or null = placeholder
  hasAvatar: boolean;
  squareSrc: string | null;  // what the small square shows (null = empty placeholder)
  showSquare: boolean;       // false when the user chose "none"
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** `svg` is the customizer avatar render; it only counts once the user has changed the customizer. */
export function resolveNarrator(s: NarratorState, svg: string): NarratorInfo {
  const src = s.portrait ?? (s.customized ? svgToDataUrl(svg) : null);
  const squareSrc = s.squareMode === 'mine' ? src : s.squareMode === 'other' ? s.squareUrl : null;
  return { src, hasAvatar: src !== null, squareSrc, showSquare: s.squareMode !== 'none' };
}

export const SQUARE_LABELS: Record<SquareMode, string> = {
  mine: 'Same as my avatar',
  other: 'Generate another avatar',
  none: 'None',
};

/** Prompt for a separately generated small-square avatar. */
export function buildSquarePrompt(text: string): string {
  const who = text.trim().replace(/[.\s]+$/, '');
  return `Photorealistic head-and-shoulders portrait of ${who}, soft natural light, plain background. Synthetic person, no text, no logos.`;
}
