import { safeZonePx, SAFE_ZONE } from './safeZones';
import type { FormatId } from '../types';

export interface SpecRow { item: string; value: string; note?: string }
export interface SpecGroup { title: string; rows: SpecRow[] }

const DENSITIES = [
  ['mdpi', 1], ['hdpi', 1.5], ['xhdpi', 2], ['xxhdpi', 3], ['xxxhdpi', 4],
] as const;

// Android/PWA values verified against developer.android.com, support.google.com/googleplay
// and web.dev on 2026-11-07. Launcher px = 48dp x density scale.
export function exportSpecs(format: FormatId): SpecGroup[] {
  if (format === 'android') {
    return [
      { title: 'Splash icon (Android 12+)', rows: [
        { item: 'Icon with icon background', value: '240x240 dp, fits a 160 dp circle' },
        { item: 'Icon without background', value: '288x288 dp, fits a 192 dp circle' },
        { item: 'Animated icon (AVD)', value: '432 dp area, inner 288 dp visible; keep under 1,000 ms' },
        { item: 'Format', value: 'Vector drawable; window background is one opaque color' },
      ]},
      { title: 'Adaptive launcher icon', rows: [
        { item: 'Layers', value: '108x108 dp foreground + background', note: 'Inner 72x72 dp is the visible area' },
      ]},
      { title: 'Launcher icon density buckets', rows: DENSITIES.map(([d, s]) => ({
        item: d, value: `${48 * s}x${48 * s} px`, note: `res/mipmap-${d}/`,
      }))},
      { title: 'Google Play listing', rows: [
        { item: 'App icon', value: '512x512 px, 32-bit PNG, sRGB, max 1024 KB' },
        { item: 'Feature graphic', value: '1024x500 px, JPEG or 24-bit PNG, no alpha' },
        { item: 'Screenshots', value: '9:16 at 1080x1920 min, JPEG or 24-bit PNG, no alpha' },
      ]},
    ];
  }
  if (format === 'pwa') {
    return [
      { title: 'Web app manifest icons', rows: [
        { item: 'Required sizes', value: '192x192 and 512x512 px' },
        { item: 'Maskable', value: 'Add "purpose": "maskable" (or "any maskable") to an icon entry' },
        { item: 'Entry fields', value: 'src, sizes, type' },
      ]},
      { title: 'Manifest screenshots', rows: [
        { item: 'Size limits', value: '320 to 3840 px per side; long side at most 2.3x the short side' },
        { item: 'Wide (desktop)', value: 'form_factor "wide"; same aspect ratio across all wide shots; 1 to 8 shown', note: 'Suggested 1920x1080' },
        { item: 'Narrow (Android)', value: 'form_factor "narrow"; same aspect ratio across all narrow shots; 1 to 5 shown', note: 'Suggested 1080x1920' },
      ]},
    ];
  }
  const z = safeZonePx();
  return [
    { title: 'Video', rows: [
      { item: 'Frame', value: `${SAFE_ZONE.frame.width}x${SAFE_ZONE.frame.height} px, 9:16 vertical` },
      { item: 'File', value: 'MP4 (H.264)', note: 'Suggested; confirm in the platform uploader' },
    ]},
    { title: 'Safe zone (configurable, not verified)', rows: [
      { item: 'Top', value: `${z.top} px` }, { item: 'Bottom', value: `${z.bottom} px` },
      { item: 'Left', value: `${z.left} px` }, { item: 'Right', value: `${z.right} px`, note: 'Sources disagree; edit src/config/safeZones.ts' },
    ]},
    { title: 'Cover crop', rows: [
      { item: 'Cover', value: 'Pick a frame from the clip; keep faces and text inside the safe zone' },
    ]},
  ];
}

export function specsToText(format: FormatId): string {
  return exportSpecs(format)
    .map((g) => `${g.title}\n` + g.rows.map((r) => `  - ${r.item}: ${r.value}${r.note ? ` (${r.note})` : ''}`).join('\n'))
    .join('\n\n');
}

export function pwaManifestSnippet(brand: string): string {
  return JSON.stringify({
    name: brand, short_name: 'R&B Homestead', start_url: '/', display: 'standalone',
    background_color: '#17171a', theme_color: '#d4a948',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/shots/wide.png', sizes: '1920x1080', type: 'image/png', form_factor: 'wide' },
      { src: '/shots/narrow.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
    ],
  }, null, 2);
}
