// Starter avatars and backdrops. All files are committed under /public, so using them
// makes no network calls and works the same in Demo and Live mode.
// Avatar art is CC0 (public domain). See public/avatars/LICENSES.md.

export type StarterStyle = 'Hand-Drawn Sketch' | 'Flat Portrait' | 'Line Art' | 'Pixel Art' | 'Friendly Mascot';

export interface StarterAvatar { id: string; name: string; role: string; style: StarterStyle; url: string }

export const STARTER_STYLES: StarterStyle[] = ['Hand-Drawn Sketch', 'Flat Portrait', 'Line Art', 'Pixel Art', 'Friendly Mascot'];

export const STARTER_AVATARS: StarterAvatar[] = [
  { id: 'sketch_hana', name: 'Hana', role: 'Welcome guide', style: 'Hand-Drawn Sketch', url: '/avatars/sketch_hana.png' },
  { id: 'sketch_kai', name: 'Kai', role: 'Study coach', style: 'Hand-Drawn Sketch', url: '/avatars/sketch_kai.png' },
  { id: 'portrait_eli', name: 'Eli', role: 'Community host', style: 'Flat Portrait', url: '/avatars/portrait_eli.png' },
  { id: 'portrait_ivan', name: 'Ivan', role: 'Reading buddy', style: 'Flat Portrait', url: '/avatars/portrait_ivan.png' },
  { id: 'line_eli', name: 'Elena', role: 'Product tour guide', style: 'Line Art', url: '/avatars/line_eli.png' },
  { id: 'line_ivan', name: 'Ian', role: 'Support helper', style: 'Line Art', url: '/avatars/line_ivan.png' },
  { id: 'pixel_cora', name: 'Cora', role: 'Game guide', style: 'Pixel Art', url: '/avatars/pixel_cora.png' },
  { id: 'pixel_hana', name: 'Rowan', role: 'Quiz host', style: 'Pixel Art', url: '/avatars/pixel_hana.png' },
  { id: 'mascot_ava', name: 'Mochi', role: 'Friendly mascot', style: 'Friendly Mascot', url: '/avatars/mascot_ava.png' },
  { id: 'mascot_fay', name: 'Pip', role: 'Daily reminder buddy', style: 'Friendly Mascot', url: '/avatars/mascot_fay.png' },
];

export interface StarterBackdrop { id: string; name: string; url: string }

export const STARTER_BACKDROPS: StarterBackdrop[] = [
  { id: 'sunrise_hills', name: 'Sunrise Hills', url: '/backgrounds/sunrise_hills.png' },
  { id: 'calm_lake', name: 'Calm Lake', url: '/backgrounds/calm_lake.png' },
  { id: 'pine_forest', name: 'Pine Forest', url: '/backgrounds/pine_forest.png' },
  { id: 'soft_paper', name: 'Soft Paper', url: '/backgrounds/soft_paper.png' },
  { id: 'evening_sky', name: 'Evening Sky', url: '/backgrounds/evening_sky.png' },
  { id: 'open_plain', name: 'Open Plain', url: '/backgrounds/open_plain.png' },
];
