import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLANKS, PRESETS } from './portraitOptions';
import { neutralExample, userExample } from './neutral';
import { GUIDE, WELCOME } from './guide';
import { LIVE_INTEGRATIONS } from './integrations';
import type { FormatExample } from '../types';

const base = { id: 'tiktok', label: 'TikTok', brand: 'X', durationSec: 20, cues: [], avatar: { seed: 's', options: {} }, portraits: { mesa: '', reed: '' }, backdrop: '', voices: { mesa: '', reed: '' } } as unknown as FormatExample;

test('every preset value is an available option', () => {
  for (const preset of Object.values(PRESETS)) {
    for (const b of BLANKS) assert.ok(b.options.includes(preset[b.key]), `${b.key}=${preset[b.key]}`);
  }
});

test('live example has no built-in R&D script; user script becomes cues', () => {
  const n = neutralExample(base);
  assert.equal(n.brand, 'Your avatar');
  assert.ok(!JSON.stringify(n).match(/rain|homestead|berm/i));
  const u = userExample(n, 'Hello there. This is my own script.');
  assert.deepEqual(u.cues.map((c) => c.voiceover), ['Hello there.', 'This is my own script.']);
});

test('no Gemini or Hedra wording in anything Live mode shows', () => {
  const text = JSON.stringify([WELCOME, GUIDE, LIVE_INTEGRATIONS, BLANKS]);
  assert.doesNotMatch(text, /gemini|hedra/i);
  assert.deepEqual(LIVE_INTEGRATIONS.map((i) => i.id), ['cloudflare', 'elevenlabs']);
});

import { SCENE_CHIPS, widescreenCrop } from './scene';

test('quick scene chips are unique and non-empty', () => {
  assert.ok(SCENE_CHIPS.length >= 6);
  assert.equal(new Set(SCENE_CHIPS.map((c) => c.label)).size, SCENE_CHIPS.length);
  for (const c of SCENE_CHIPS) assert.ok(c.text.length > 10);
});

test('widescreen crop is a centered 16:9 window', () => {
  assert.deepEqual(widescreenCrop(1024, 1024), { sx: 0, sy: 224, sw: 1024, sh: 576 });
  assert.deepEqual(widescreenCrop(1920, 1080), { sx: 0, sy: 0, sw: 1920, sh: 1080 });
  const c = widescreenCrop(1000, 400);
  assert.ok(Math.abs(c.sw / c.sh - 16 / 9) < 0.01);
});

test('no Gemini or Hedra wording in scene chips', () => {
  assert.doesNotMatch(JSON.stringify(SCENE_CHIPS), /gemini|hedra/i);
});
