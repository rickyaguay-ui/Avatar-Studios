import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLANKS, DEFAULT_FORM, PRESETS, buildPortraitPrompt } from './portraitOptions';
import { neutralExample, userExample } from './neutral';
import { GUIDE, WELCOME } from './guide';
import { LIVE_INTEGRATIONS } from './integrations';
import type { FormatExample } from '../types';

const base = { id: 'tiktok', label: 'TikTok', brand: 'X', durationSec: 20, cues: [], avatar: { seed: 's', options: {} }, portraits: { mesa: '', reed: '' }, backdrop: '', voices: { mesa: '', reed: '' } } as unknown as FormatExample;

test('picks and free text both shape the prompt', () => {
  const p = buildPortraitPrompt(DEFAULT_FORM, 'a red scarf', false);
  assert.match(p, /photorealistic photograph of a fictional woman/);
  assert.match(p, /light brown skin/);
  assert.match(p, /a red scarf\./);
  assert.match(p, /Synthetic person, no text, no logos\.$/);
});

test('"use only my words" ignores the picks', () => {
  const p = buildPortraitPrompt(DEFAULT_FORM, 'an old sailor with a grey beard', true);
  assert.ok(p.startsWith('an old sailor with a grey beard'));
  assert.doesNotMatch(p, /fictional woman/);
});

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
