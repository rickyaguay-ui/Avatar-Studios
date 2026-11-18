import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIELD_ORDER, REFINERS, assemblePrompt, backgroundInstruction, editInstruction, emptyFields, mergeRecord, newSeed, parseText,
  recordFromPicks, recordFromText, type PromptRecord,
} from './promptRecord';
import { DEFAULT_FORM } from './portraitOptions';
import { currentVersion, newHistory, pushVersion, redo, undo, useVersion, type ImageVersion } from './history';
import { SIZES, applyChange, generateFirst, regenerate, type ImageApi } from './imageActions';
import { makeInitial, makeReducer } from '../studio/state';
import type { Result } from '../types';
import type { ImageResult } from '../services/provider';

const SCENE = 'a quiet beekeeping yard at golden hour with wildflowers and white hive boxes';

test('free text is parsed into fields by fixed rules (scene)', () => {
  const r = recordFromText('scene', SCENE, 42);
  assert.equal(r.seed, 42);
  assert.equal(r.setting, 'a quiet beekeeping yard with wildflowers and white hive boxes');
  assert.equal(r.lighting, 'golden hour');
  assert.equal(r.style, 'photorealistic');
  assert.equal(r.camera, 'wide cinematic shot');
  assert.equal(r.subject, '');
});

test('parsing is deterministic: same text, same fields, every time', () => {
  assert.equal(JSON.stringify(parseText('scene', SCENE)), JSON.stringify(parseText('scene', SCENE)));
});

test('portrait text: style, camera, action, setting and subject are separated', () => {
  const p = parseText('portrait', 'a friendly man in a barn, standing with a hat, cinematic, close-up');
  assert.deepEqual(p.fields, { style: 'cinematic', camera: 'close-up', action: 'standing with a hat', setting: 'a barn', subject: 'a friendly man' });
});

test('the example edit adds to subject/action and keeps setting, lighting and seed', () => {
  const v1 = recordFromText('scene', SCENE, 99);
  const v2 = mergeRecord(v1, parseText('scene', 'add a scary AI professor standing over the guy in the middle'));
  assert.equal(v2.subject, 'a scary AI professor');
  assert.equal(v2.action, 'standing over the guy in the middle');
  assert.equal(v2.setting, v1.setting);
  assert.equal(v2.lighting, v1.lighting);
  assert.equal(v2.style, v1.style);
  assert.equal(v2.seed, 99);
  assert.match(assemblePrompt('scene', v2), /with a scary AI professor, standing over the guy in the middle/);
  assert.doesNotMatch(assemblePrompt('scene', v2), /No people/);
  assert.match(assemblePrompt('scene', v1), /No people/);
});

test('a scene that already has people in it is not told "No people"', () => {
  const r = recordFromText('scene', 'a cozy library with a young man in a gray sweater sitting at a table in the middle of the room', 4);
  assert.doesNotMatch(assemblePrompt('scene', r), /No people/);
  assert.match(assemblePrompt('scene', r), /young man in a gray sweater/);
});

test('a second "add" appends instead of replacing', () => {
  let r = mergeRecord(recordFromText('scene', SCENE, 1), parseText('scene', 'add a professor standing by the door'));
  r = mergeRecord(r, parseText('scene', 'add a dog sitting on the floor'));
  assert.equal(r.subject, 'a professor, and a dog');
  assert.equal(r.action, 'standing by the door; sitting on the floor');
});

test('the final prompt uses one fixed order, whatever order the fields were filled in', () => {
  const a: PromptRecord = { ...emptyFields(), seed: 5, mood: 'eerie', setting: 'a library', style: 'cinematic', subject: 'a man', lighting: 'moonlight', camera: 'wide shot', action: 'standing' };
  const b = { seed: 5, action: 'standing', camera: 'wide shot', lighting: 'moonlight', subject: 'a man', style: 'cinematic', setting: 'a library', mood: 'eerie' } as PromptRecord;
  assert.equal(assemblePrompt('portrait', a), assemblePrompt('portrait', b));
  assert.equal(assemblePrompt('portrait', a), 'cinematic of a man, standing, in a library, moonlight, wide shot, eerie mood. Synthetic person, no text, no logos.');
  assert.deepEqual([...FIELD_ORDER], ['subject', 'action', 'setting', 'lighting', 'style', 'camera', 'mood']);
});

test('quick refiners touch exactly one field and never the seed', () => {
  const base = recordFromText('scene', SCENE, 7);
  for (const r of REFINERS.filter((x) => !x.needsText)) {
    const m = mergeRecord(base, { fields: r.patch, additive: false });
    assert.equal(FIELD_ORDER.filter((k) => m[k] !== base[k]).length, 1, r.id);
    assert.equal(m.seed, 7);
    assert.ok(r.instruction.length > 20 && /Keep/.test(r.instruction), r.id);
  }
  assert.ok(REFINERS.some((r) => r.needsText && r.id === 'background'));
});

test('"change the background to ..." only changes the setting', () => {
  const base = mergeRecord(recordFromText('scene', SCENE, 3), parseText('scene', 'add a professor standing by the door'));
  const m = mergeRecord(base, parseText('scene', 'change the background to a rainy city street'));
  assert.equal(m.setting, 'a rainy city street');
  assert.equal(m.subject, base.subject);
  assert.equal(m.lighting, base.lighting);
  assert.match(backgroundInstruction('a rainy city street.'), /^Change only the background to: a rainy city street\. Keep the subject/);
});

test('picks plus free text build one record; "use only my words" ignores the picks', () => {
  const r = recordFromPicks(DEFAULT_FORM, 'wearing a straw hat', false, 8);
  assert.match(r.subject, /^woman in her 30s, light brown skin, short dark hair, average build, wearing a canvas work jacket, and wearing a straw hat$/);
  assert.equal(r.setting, DEFAULT_FORM.setting);
  const mine = recordFromPicks(DEFAULT_FORM, 'an old sailor with a grey beard', true, 8);
  assert.doesNotMatch(assemblePrompt('portrait', mine), /woman/);
  assert.match(assemblePrompt('portrait', mine), /old sailor with a grey beard/);
});

test('edit instructions pin everything else', () => {
  assert.equal(editInstruction('scene', 'add a professor'), 'Add a professor. Keep everything else exactly as it is, including the setting, lighting and composition.');
  assert.match(editInstruction('portrait', 'make her smile'), /including the person, pose, lighting and background\.$/);
});

test('newSeed is an integer in range and injectable', () => {
  assert.equal(newSeed(() => 0), 0);
  assert.equal(newSeed(() => 0.5), 1073741823);
  const s = newSeed();
  assert.ok(Number.isInteger(s) && s >= 0 && s < 2147483647);
});

const ver = (n: number, record: PromptRecord): ImageVersion => ({ id: n, url: `u${n}`, record, label: `v${n + 1}`, method: 'generate' });

test('history: edits append, undo/redo walk the path, "use this one" jumps, nothing is lost', () => {
  const r = recordFromText('scene', SCENE, 1);
  let h = newHistory(ver(0, r));
  h = pushVersion(h, ver(1, r)); h = pushVersion(h, ver(2, r));
  assert.equal(h.versions.length, 3); assert.equal(h.current, 2);
  h = undo(h); assert.equal(h.current, 1);
  h = undo(h); assert.equal(h.current, 0);
  assert.equal(undo(h), h);
  h = redo(h); assert.equal(h.current, 1);
  h = pushVersion(h, ver(3, r));
  assert.equal(h.versions.length, 4); assert.equal(h.current, 3); assert.deepEqual(h.redo, []);
  assert.equal(h.versions[2].url, 'u2');
  h = useVersion(h, 2); assert.equal(currentVersion(h).url, 'u2');
  h = undo(h); assert.equal(h.current, 3);
  assert.equal(useVersion(h, 99), h);
});

const ok = (data: ImageResult): Result<ImageResult> => ({ ok: true, data });
const fail = (message: string): Result<ImageResult> => ({ ok: false, code: 'error', message });
const makeApi = (over: Partial<ImageApi> = {}) => {
  const calls: { gen: unknown[]; edit: unknown[] } = { gen: [], edit: [] };
  const api: ImageApi = {
    generateImage: async (r) => { calls.gen.push(r); return ok({ imageUrl: 'GEN', model: 'flux-2-klein-4b', width: r.width, height: r.height, seedHonored: true }); },
    editImage: async (r) => { calls.edit.push(r); return ok({ imageUrl: 'EDIT', model: 'flux-2-klein-4b' }); },
    ...over,
  };
  return { api, calls };
};
const crop = async (u: string) => `CROP(${u})`;

test('generateFirst sends the assembled prompt, the record seed and the right size', async () => {
  const { api, calls } = makeApi();
  const rec = recordFromText('scene', SCENE, 123);
  const r = await generateFirst(api, 'scene', rec, crop);
  assert.ok(r.ok);
  const c = calls.gen[0] as { prompt: string; seed: number; width: number; height: number; kind: string };
  assert.equal(c.seed, 123); assert.equal(c.width, SIZES.scene.width); assert.equal(c.height, SIZES.scene.height); assert.equal(c.kind, 'scene');
  assert.equal(c.prompt, assemblePrompt('scene', rec));
  if (r.ok) { assert.equal(r.version.url, 'GEN'); assert.equal(r.version.label, 'Original'); }
});

test('edit uses true image editing with the current image and the SAME seed', async () => {
  const { api, calls } = makeApi();
  const v1 = recordFromText('scene', SCENE, 77);
  const merged = mergeRecord(v1, parseText('scene', 'add a scary AI professor standing over the guy in the middle'));
  const r = await applyChange(api, 'scene', { url: 'CURRENT', record: v1 }, merged, editInstruction('scene', 'add a scary AI professor'), 'Edit: x', crop);
  assert.ok(r.ok);
  const e = calls.edit[0] as { image: string; seed: number; prompt: string };
  assert.equal(e.image, 'CURRENT'); assert.equal(e.seed, 77); assert.match(e.prompt, /Keep everything else exactly as it is/);
  assert.equal(calls.gen.length, 0);
  if (r.ok) { assert.equal(r.version.method, 'edit'); assert.equal(r.version.record.seed, 77); assert.equal(r.version.record.setting, v1.setting); }
});

test('if editing is unavailable it regenerates from the merged fields with the same seed', async () => {
  const { api, calls } = makeApi({ editImage: async () => fail('Image editing is unavailable') });
  const v1 = recordFromText('scene', SCENE, 77);
  const merged = mergeRecord(v1, parseText('scene', 'add a professor standing by the door'));
  const r = await applyChange(api, 'scene', { url: 'CURRENT', record: v1 }, merged, 'x', 'Edit: y', crop);
  assert.ok(r.ok);
  const g = calls.gen[0] as { prompt: string; seed: number };
  assert.equal(g.seed, 77); assert.equal(g.prompt, assemblePrompt('scene', merged));
  if (r.ok) { assert.equal(r.version.method, 'seed'); assert.match(r.note, /Image editing was unavailable/); }
});

test('a square fallback result is cropped to 16:9 for scenes only; both paths failing reports both errors', async () => {
  const sq = makeApi({ editImage: async () => fail('no'), generateImage: async () => ok({ imageUrl: 'SQ', model: 'flux-1-schnell', width: 1024, height: 1024, seedHonored: false }) });
  const v1 = recordFromText('scene', SCENE, 1);
  const r = await applyChange(sq.api, 'scene', { url: 'C', record: v1 }, v1, 'x', 'l', crop);
  if (r.ok) { assert.equal(r.version.url, 'CROP(SQ)'); assert.match(r.note, /ignores the seed/); } else assert.fail('should succeed');
  const p = await applyChange(sq.api, 'portrait', { url: 'C', record: v1 }, v1, 'x', 'l', crop);
  if (p.ok) assert.equal(p.version.url, 'SQ'); else assert.fail('should succeed');
  const bad = makeApi({ editImage: async () => fail('E1'), generateImage: async () => fail('G1') });
  const f = await applyChange(bad.api, 'scene', { url: 'C', record: v1 }, v1, 'x', 'l', crop);
  assert.equal(f.ok, false);
  if (!f.ok) assert.match(f.message, /E1.*G1/);
  assert.ok((await regenerate(makeApi().api, 'scene', v1, 'Edited fields', crop)).ok);
});

test('reducer: portrait/scene history keeps the in-use image in step (undo, redo, use this one)', () => {
  const r = makeReducer(true);
  const rec = recordFromText('scene', SCENE, 5);
  let s = makeInitial(true);
  s = r(s, { t: 'imgGen', kind: 'scene', version: ver(0, rec) });
  assert.equal(s.backdrop, 'u0'); assert.match(s.backdropPrompt!, /beekeeping yard/);
  s = r(s, { t: 'imgEdit', kind: 'scene', version: ver(1, mergeRecord(rec, parseText('scene', 'add a professor standing by the door'))) });
  assert.equal(s.backdrop, 'u1'); assert.match(s.backdropPrompt!, /with a professor/);
  s = r(s, { t: 'imgUndo', kind: 'scene' }); assert.equal(s.backdrop, 'u0');
  s = r(s, { t: 'imgRedo', kind: 'scene' }); assert.equal(s.backdrop, 'u1');
  s = r(s, { t: 'imgUse', kind: 'scene', index: 0 }); assert.equal(s.backdrop, 'u0');
  s = r(s, { t: 'imgGen', kind: 'portrait', version: ver(0, rec) });
  assert.equal(s.portrait, 'u0'); assert.equal(s.images.scene!.versions.length, 2);
  s = r(s, { t: 'portrait', url: null });
  assert.equal(s.portrait, null); assert.equal(s.images.portrait!.versions.length, 1);
});
