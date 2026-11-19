// AI backdrops/scenes (Live mode). Prompt assembly and the 16:9 crop live here so they can be tested.

export interface SceneChip { label: string; text: string }

export const SCENE_CHIPS: SceneChip[] = [
  { label: 'Sunlit greenhouse', text: 'a sunlit greenhouse full of green plants, golden hour light' },
  { label: 'Modern office', text: 'a bright modern office with large windows and a city skyline' },
  { label: 'Pine forest at dawn', text: 'a misty pine forest at dawn with soft sunbeams' },
  { label: 'Cozy library', text: 'a cozy library with warm lamps and tall wooden bookshelves' },
  { label: 'Rainy city street', text: 'a rainy city street at dusk with glowing shop windows' },
  { label: 'Farm at sunrise', text: 'rolling farmland at sunrise with a red barn in the distance' },
  { label: 'Beach at sunset', text: 'an empty beach at sunset with gentle waves' },
  { label: 'Bright classroom', text: 'a bright empty classroom with a chalkboard and wooden desks' },
];

/** Crop box for a centered 16:9 window inside a w x h image. */
export function widescreenCrop(w: number, h: number): { sx: number; sy: number; sw: number; sh: number } {
  const target = 16 / 9;
  if (w / h >= target) {
    const sw = Math.round(h * target);
    return { sx: Math.round((w - sw) / 2), sy: 0, sw, sh: h };
  }
  const sh = Math.round(w / target);
  return { sx: 0, sy: Math.round((h - sh) / 2), sw: w, sh };
}

/** Browser only: crops a square FLUX image to a 16:9 JPEG data URL (FLUX schnell cannot render widescreen itself). */
export function cropToWidescreen(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { sx, sy, sw, sh } = widescreenCrop(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = sw; canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas is not available in this browser')); return; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Could not read the generated image'));
    img.src = dataUrl;
  });
}
