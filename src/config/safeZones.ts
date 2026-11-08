// TikTok / Reels safe-zone margins as fractions of the 1080x1920 frame.
// Sources disagree on exact pixels, so these are CONFIG VALUES, not facts.
// Adjust here; the overlay and the export panel both read this file.
export const SAFE_ZONE = {
  frame: { width: 1080, height: 1920 },
  top: 0.1,      // fraction of height kept clear (status bar / search)
  bottom: 0.2,   // caption, handle, music row
  left: 0.05,
  right: 0.15,   // action rail (like / comment / share)
  verified: false,
} as const;

export function safeZonePx() {
  const { width: w, height: h } = SAFE_ZONE.frame;
  return {
    top: Math.round(h * SAFE_ZONE.top),
    bottom: Math.round(h * SAFE_ZONE.bottom),
    left: Math.round(w * SAFE_ZONE.left),
    right: Math.round(w * SAFE_ZONE.right),
  };
}
