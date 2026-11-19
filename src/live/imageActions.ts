// Orchestration for generating and editing images. The api and the crop are injected so this is testable without a browser.
import type { EditImageRequest, GenerateImageRequest, ImageResult } from '../services/provider';
import type { Result } from '../types';
import type { ImageVersion } from './history';
import { assemblePrompt, type ImageKind, type PromptRecord } from './promptRecord';

export interface ImageApi {
  generateImage(req: GenerateImageRequest): Promise<Result<ImageResult>>;
  editImage(req: EditImageRequest): Promise<Result<ImageResult>>;
}
export type Crop = (dataUrl: string) => Promise<string>;

export const SIZES: Record<ImageKind, { width: number; height: number }> = {
  portrait: { width: 1024, height: 1024 },
  scene: { width: 1024, height: 576 },
};

export type ActionResult = { ok: true; version: Omit<ImageVersion, 'id'>; note: string } | { ok: false; message: string };

/** A scene that came back square (the schnell fallback) is cropped to 16:9. */
async function fit(kind: ImageKind, r: ImageResult, crop: Crop): Promise<string> {
  const square = r.width !== undefined && r.height !== undefined && r.width === r.height;
  return kind === 'scene' && square ? crop(r.imageUrl) : r.imageUrl;
}

/** First version of an image: generated from the assembled prompt with the record's seed. */
export async function generateFirst(api: ImageApi, kind: ImageKind, record: PromptRecord, crop: Crop): Promise<ActionResult> {
  const { width, height } = SIZES[kind];
  const r = await api.generateImage({ kind, prompt: assemblePrompt(kind, record), seed: record.seed, width, height });
  if (!r.ok) return { ok: false, message: r.message };
  const url = await fit(kind, r.data, crop);
  return { ok: true, version: { url, record, label: 'Original', method: 'generate' }, note: `Generated with ${r.data.model ?? 'FLUX'}.` };
}

/** Regenerates from the (possibly hand-edited) fields with the SAME seed. No reference image. */
export async function regenerate(api: ImageApi, kind: ImageKind, record: PromptRecord, label: string, crop: Crop): Promise<ActionResult> {
  const { width, height } = SIZES[kind];
  const r = await api.generateImage({ kind, prompt: assemblePrompt(kind, record), seed: record.seed, width, height });
  if (!r.ok) return { ok: false, message: r.message };
  const url = await fit(kind, r.data, crop);
  return { ok: true, version: { url, record, label, method: 'seed' }, note: `Regenerated from your fields with seed ${record.seed}.` };
}

/**
 * Applies a change: true image edit first (the current image goes in as the reference, same seed); if that is unavailable,
 * regenerates from the merged fields with the SAME seed. The record is the merged one either way.
 */
export async function applyChange(
  api: ImageApi, kind: ImageKind, current: { url: string; record: PromptRecord }, merged: PromptRecord,
  instruction: string, label: string, crop: Crop,
): Promise<ActionResult> {
  const { width, height } = SIZES[kind];
  const edit = await api.editImage({ prompt: instruction, image: current.url, seed: current.record.seed, width, height });
  if (edit.ok) {
    return { ok: true, version: { url: edit.data.imageUrl, record: merged, label, method: 'edit' }, note: `Edited the image itself with ${edit.data.model ?? 'FLUX.2 klein'}; the rest of the picture was kept.` };
  }
  const regen = await api.generateImage({ kind, prompt: assemblePrompt(kind, merged), seed: merged.seed, width, height });
  if (!regen.ok) return { ok: false, message: `The edit failed (${edit.message}) and so did the same-seed regeneration (${regen.message}).` };
  const url = await fit(kind, regen.data, crop);
  const honored = regen.data.seedHonored ? 'with the same seed' : 'from your fields (this model ignores the seed, so the composition may shift)';
  return { ok: true, version: { url, record: merged, label, method: 'seed' }, note: `Image editing was unavailable, so I regenerated ${honored}.` };
}
