import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeInitial, makeReducer } from '../studio/state';
import { resolveNarrator, buildSquarePrompt, SQUARE_LABELS } from './narrator';
import { TiktokFrame, AndroidFrame, PwaFrame, NarratorCircle } from '../studio/Frames';
import { neutralExample } from './neutral';
import { getExample } from '../services/examples';
import type { Cue } from '../types';

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4"/></svg>';
const base = { portrait: null, customized: false, squareMode: 'mine' as const, squareUrl: null };
const cue: Cue = { at: 0, voiceover: 'Hello.', onScreen: 'Hello.' };
const frame = (id: 'tiktok' | 'android' | 'pwa', live: { narrator: string | null; square: string | null; showSquare: boolean }) => {
  const ex = neutralExample(getExample(id));
  const props = { ex, cue, avatarSvg: SVG, portrait: '', playing: false, showSafe: false, live };
  const C = id === 'tiktok' ? TiktokFrame : id === 'android' ? AndroidFrame : PwaFrame;
  return renderToStaticMarkup(createElement(C, props));
};

test('before anything is built the narrator is an empty placeholder, never a stock face', () => {
  const n = resolveNarrator(base, SVG);
  assert.equal(n.src, null);
  assert.equal(n.hasAvatar, false);
  assert.equal(n.squareSrc, null);
});

test('customizing the avatar makes it the narrator; a portrait wins over the customizer avatar', () => {
  assert.match(resolveNarrator({ ...base, customized: true }, SVG).src!, /^data:image\/svg\+xml/);
  assert.equal(resolveNarrator({ ...base, customized: true, portrait: 'data:image/jpeg;base64,AAA' }, SVG).src, 'data:image/jpeg;base64,AAA');
});

test('the small square defaults to my avatar, can be another avatar, or none', () => {
  const mine = resolveNarrator({ ...base, portrait: 'P' }, SVG);
  assert.equal(mine.squareSrc, 'P'); assert.equal(mine.showSquare, true);
  const other = resolveNarrator({ ...base, portrait: 'P', squareMode: 'other', squareUrl: 'OTHER' }, SVG);
  assert.equal(other.src, 'P'); assert.equal(other.squareSrc, 'OTHER');
  const none = resolveNarrator({ ...base, portrait: 'P', squareMode: 'none' }, SVG);
  assert.equal(none.showSquare, false); assert.equal(none.squareSrc, null);
  const otherEmpty = resolveNarrator({ ...base, portrait: 'P', squareMode: 'other' }, SVG);
  assert.equal(otherEmpty.squareSrc, null);
  assert.deepEqual(Object.keys(SQUARE_LABELS), ['mine', 'other', 'none']);
  assert.match(buildSquarePrompt(' a friendly man with a beard. '), /portrait of a friendly man with a beard,/);
});

test('Live: the user avatar survives format and voice-host changes and is shared by every format', () => {
  const r = makeReducer(true);
  let s = makeInitial(true);
  assert.equal(s.customized, false);
  assert.equal(s.squareMode, 'mine');
  s = r(s, { t: 'portrait', url: 'MY-FACE' });
  s = r(s, { t: 'format', format: 'android' });
  s = r(s, { t: 'host', host: 'reed' });
  assert.equal(s.portrait, 'MY-FACE');
  s = r(s, { t: 'avatar', config: { seed: 'mine', options: { a: 1 } } });
  assert.equal(s.customized, true);
  for (const f of ['tiktok', 'android', 'pwa'] as const) assert.equal(s.avatars[f].seed, 'mine');
});

test('Demo behavior is unchanged: format/host clear the portrait, avatars stay per format', () => {
  const r = makeReducer(false);
  let s = makeInitial(false);
  s = r(s, { t: 'portrait', url: 'X' });
  assert.equal(r(s, { t: 'format', format: 'pwa' }).portrait, null);
  assert.equal(r(s, { t: 'host', host: 'reed' }).portrait, null);
  const before = { ...s.avatars };
  s = r(s, { t: 'avatar', config: { seed: 'q', options: {} } });
  assert.equal(s.avatars.tiktok.seed, 'q');
  assert.equal(s.avatars.pwa.seed, before.pwa.seed);
});

test('frames: placeholder when nothing is built, in all three formats', () => {
  for (const id of ['tiktok', 'android', 'pwa'] as const) {
    const html = frame(id, { narrator: null, square: null, showSquare: true });
    assert.match(html, /aria-label="No avatar yet"/, id);
    assert.doesNotMatch(html, /Host portrait/, id);
    assert.doesNotMatch(html, /\/demo\/portraits\//, id);
    assert.doesNotMatch(html, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"><circle r="4"/, id); // the stock DiceBear svg is not injected
  }
});

test('frames: the circle is the narrator and matches the square when "same as my avatar"', () => {
  const html = frame('tiktok', { narrator: 'NARRATOR.jpg', square: 'NARRATOR.jpg', showSquare: true });
  assert.equal((html.match(/NARRATOR\.jpg/g) ?? []).length >= 2, true);
  assert.match(html, /aria-label="Narrator avatar"/);
});

test('frames: a different square avatar never replaces the narrator circle; "none" removes the square', () => {
  const other = frame('tiktok', { narrator: 'ME.jpg', square: 'OTHER.jpg', showSquare: true });
  assert.match(other, /alt="Narrator"[^>]*|src="ME\.jpg"/);
  assert.ok(other.includes('ME.jpg') && other.includes('OTHER.jpg'));
  const none = frame('tiktok', { narrator: 'ME.jpg', square: null, showSquare: false });
  assert.ok(none.includes('ME.jpg'));
  assert.doesNotMatch(none, /aria-label="Small square"/);
});

test('NarratorCircle renders an image only when there is an avatar', () => {
  assert.match(renderToStaticMarkup(createElement(NarratorCircle, { src: null, size: 30 })), /No avatar yet/);
  assert.match(renderToStaticMarkup(createElement(NarratorCircle, { src: 'a.jpg', size: 30 })), /src="a\.jpg"/);
});
