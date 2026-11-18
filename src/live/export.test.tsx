import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  canSaveAs, defaultStem, downloadFile, extForMime, makeFile, sanitizeFilename, saveFileAs, shareFile, shareSupport, slugify,
  srcToBlob, supportNote, type NavLike,
} from './exporter';
import { StudioProvider } from '../studio/state';
import { ExportFiles } from './ExportFiles';

const jpg = (name = 'my-story-tiktok-scene.jpg') => makeFile(new Blob(['x'], { type: 'image/jpeg' }), name, 'image/jpeg');
const pdf = () => makeFile(new Blob(['%PDF'], { type: 'application/pdf' }), 'doc.pdf', 'application/pdf');
const abort = () => Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });

test('slug: lowercase, ascii, dashes, trimmed', () => {
  assert.equal(slugify('My Story: Part 1!'), 'my-story-part-1');
  assert.equal(slugify('  Café Déjà vu  '), 'cafe-deja-vu');
  assert.equal(slugify('***'), '');
  assert.equal(slugify('a'.repeat(100)).length, 60);
  assert.equal(slugify('Ünïcödé — test'), 'unicode-test');
});

test('default name is the slug of the title plus the format (and role)', () => {
  assert.equal(defaultStem('My Story', 'tiktok'), 'my-story-tiktok');
  assert.equal(defaultStem('', 'android'), 'my-story-android');
  assert.equal(defaultStem('My Story', 'pwa', 'scene'), 'my-story-pwa-scene');
});

test('sanitizing strips characters filenames cannot contain and keeps the right extension', () => {
  assert.equal(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j', 'jpg'), 'abcdefghij.jpg');
  assert.equal(sanitizeFilename('my story!', 'jpg'), 'my story!.jpg');
  assert.equal(sanitizeFilename('x.png', 'jpg'), 'x.jpg');       // wrong typed extension is replaced
  assert.equal(sanitizeFilename('x.JPG', 'jpg'), 'x.jpg');
  assert.equal(sanitizeFilename('report.v2', 'txt'), 'report.v2.txt'); // unknown suffix is part of the name
  assert.equal(sanitizeFilename('  spaced   out  ', 'png'), 'spaced out.png');
  assert.equal(sanitizeFilename('name. . ', 'pdf'), 'name.pdf');
  assert.equal(sanitizeFilename('', 'jpg'), 'untitled.jpg');
  assert.equal(sanitizeFilename('///', 'jpg'), 'untitled.jpg');
  assert.equal(sanitizeFilename('CON', 'txt'), 'CON-file.txt');
  assert.equal(sanitizeFilename('../../etc/passwd', 'txt'), 'etcpasswd.txt');
  assert.equal(sanitizeFilename('tab\there\u0000x', 'txt'), 'tabherex.txt');
  assert.equal(sanitizeFilename('x'.repeat(300), 'jpg').length, 120 + 4);
  assert.equal(sanitizeFilename('clip', '.mp4'), 'clip.mp4');
});

test('extension follows the MIME type', () => {
  assert.equal(extForMime('image/jpeg'), 'jpg'); assert.equal(extForMime('image/png'), 'png');
  assert.equal(extForMime('application/pdf'), 'pdf'); assert.equal(extForMime('video/mp4'), 'mp4');
  assert.equal(extForMime('text/plain; charset=utf-8'), 'txt'); assert.equal(extForMime('image/svg+xml'), 'svg');
  assert.equal(extForMime('application/x-unknown'), 'bin');
});

test('data URLs and plain URLs both become blobs', async () => {
  const b64 = await srcToBlob('data:image/jpeg;base64,/9j/AAAA');
  assert.equal(b64.type, 'image/jpeg'); assert.ok(b64.size > 0);
  const svg = await srcToBlob('data:image/svg+xml;utf8,%3Csvg%20a%3D%221%22%3E%3C%2Fsvg%3E');
  assert.equal(svg.type, 'image/svg+xml'); assert.equal(await svg.text(), '<svg a="1"></svg>');
  const fetched = await srcToBlob('/backgrounds/x.png', (async () => new Response(new Blob(['png'], { type: 'image/png' }))) as unknown as typeof fetch);
  assert.equal(fetched.type, 'image/png');
});

test('download uses <a download> with the typed name', () => {
  const made: any[] = [];
  const doc = { createElement: () => { const a: any = { style: {}, click() { a.clicked = true; }, remove() { a.removed = true; } }; made.push(a); return a; }, body: { appendChild: () => {} } } as any;
  const urls: string[] = [];
  const urlApi = { createObjectURL: () => 'blob:abc', revokeObjectURL: (u: string) => urls.push(u) } as any;
  const file = jpg('my-typed-name.jpg');
  downloadFile(doc, urlApi, file);
  assert.equal(made[0].download, 'my-typed-name.jpg'); assert.equal(made[0].href, 'blob:abc'); assert.ok(made[0].clicked && made[0].removed);
});

test('Share: when the browser can share files it opens the share sheet with that exact named File', async () => {
  const calls: any[] = []; let fell = 0;
  const nav: NavLike = { canShare: (d) => !!d.files?.length, share: async (d) => { calls.push(d); } };
  const file = jpg();
  assert.equal(shareSupport(nav, file), 'files');
  const out = await shareFile(nav, file, { title: 'My story', text: 'Made with Avatar Studios' }, () => { fell++; });
  assert.equal(out.status, 'shared'); assert.equal(fell, 0); assert.equal(calls.length, 1);
  assert.equal(calls[0].files[0], file); assert.equal(calls[0].files[0].name, 'my-story-tiktok-scene.jpg'); assert.equal(calls[0].files[0].type, 'image/jpeg');
  assert.equal(calls[0].title, 'My story'); assert.equal(calls[0].text, 'Made with Avatar Studios');
});

test('Share: if canShare says no, it falls back to the named download and says why', async () => {
  let shared = 0, fell = 0;
  const nav: NavLike = { canShare: () => false, share: async () => { shared++; } };
  const out = await shareFile(nav, jpg(), { title: 't', text: 'x' }, () => { fell++; });
  assert.equal(out.status, 'downloaded'); assert.equal(shared, 0); assert.equal(fell, 1);
  assert.match(out.note!, /can't take \.jpg files/);
});

test('Share: no Web Share at all -> download fallback with a clear note', async () => {
  let fell = 0;
  const out = await shareFile({}, jpg(), { title: 't', text: 'x' }, () => { fell++; });
  assert.equal(out.status, 'downloaded'); assert.equal(fell, 1); assert.match(out.note!, /Sharing isn't available/);
  assert.equal(shareSupport({ share: async () => {} }, jpg()), 'no-files'); // share exists but no canShare
});

test('PDF and share-sheet limits are explained in the UI instead of failing silently', () => {
  const nav: NavLike = { canShare: (d) => !d.files?.some((f) => f.type === 'application/pdf'), share: async () => {} };
  assert.match(supportNote(nav, {}, pdf())!, /can't send PDF files, so Share will download the PDF instead/);
  assert.equal(supportNote(nav, {}, jpg()), null);
  assert.match(supportNote({}, { showSaveFilePicker: async () => ({}) }, jpg())!, /Use Save as/);
  assert.equal(supportNote(nav, {}, null), null);
});

test('Share: a cancelled share sheet (AbortError) is quiet; other errors fall back', async () => {
  let fell = 0;
  const cancel = await shareFile({ canShare: () => true, share: async () => { throw abort(); } }, jpg(), { title: 't', text: 'x' }, () => { fell++; });
  assert.deepEqual(cancel, { status: 'cancelled' }); assert.equal(fell, 0);
  const bad = await shareFile({ canShare: () => true, share: async () => { throw new Error('NotAllowedError: nope'); } }, jpg(), { title: 't', text: 'x' }, () => { fell++; });
  assert.equal(bad.status, 'downloaded'); assert.equal(fell, 1); assert.match(bad.note!, /downloaded instead/);
});

test('Save as: opens the real dialog with the typed name and writes the file; falls back elsewhere', async () => {
  const written: any[] = []; let opts: any;
  const win = { showSaveFilePicker: async (o: any) => { opts = o; return { createWritable: async () => ({ write: async (f: any) => { written.push(f); }, close: async () => {} }) }; } };
  const file = jpg('chosen-name.jpg'); let fell = 0;
  assert.equal(canSaveAs(win), true); assert.equal(canSaveAs({}), false);
  const out = await saveFileAs(win, file, () => { fell++; });
  assert.equal(out.status, 'saved'); assert.equal(opts.suggestedName, 'chosen-name.jpg'); assert.deepEqual(opts.types[0].accept, { 'image/jpeg': ['.jpg'] });
  assert.equal(written[0], file); assert.equal(fell, 0);
  const none = await saveFileAs({}, file, () => { fell++; });
  assert.equal(none.status, 'downloaded'); assert.equal(fell, 1); assert.match(none.note!, /no Save as dialog/);
  const cancelled = await saveFileAs({ showSaveFilePicker: async () => { throw abort(); } }, file, () => { fell++; });
  assert.deepEqual(cancelled, { status: 'cancelled' }); assert.equal(fell, 1);
  const broken = await saveFileAs({ showSaveFilePicker: async () => { throw new Error('boom'); } }, file, () => { fell++; });
  assert.equal(broken.status, 'downloaded'); assert.equal(fell, 2);
});

test('the Export panel pre-fills every file name from the title and format and offers Download and Share', () => {
  const html = renderToStaticMarkup(createElement(StudioProvider, null, createElement(ExportFiles, { bundle: 'Brand: x' })));
  assert.match(html, /Project or story title/);
  assert.match(html, /value="my-story-tiktok-prompt"/);
  assert.match(html, /my-story-tiktok-prompt\.txt/);
  assert.match(html, />Download</); assert.match(html, />Share</);
  assert.doesNotMatch(html, /Save as/); // no showSaveFilePicker in this environment: plain download only
});
