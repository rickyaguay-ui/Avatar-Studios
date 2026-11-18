// Route tests for generation and editing with Cloudflare mocked: no network, no cost.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

process.env.VERCEL = '1';
const { default: app } = await import('../../server');

let server: Server;
let base = '';
before(() => new Promise<void>((resolve) => {
  server = app.listen(0, () => { base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`; resolve(); });
}));
after(() => new Promise<void>((resolve) => { server.close(() => resolve()); }));

type Call = { url: string; form?: Record<string, FormDataEntryValue>; json?: Record<string, unknown> };
const realFetch = globalThis.fetch;
function mockCloudflare(handler: (c: Call) => { ok: boolean; status?: number; body: unknown }) {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: any, init?: any) => {
    const url = String(input);
    if (!url.includes('api.cloudflare.com')) return realFetch(input, init);
    const call: Call = { url };
    if (init?.body instanceof FormData) call.form = Object.fromEntries(init.body.entries());
    else if (typeof init?.body === 'string') call.json = JSON.parse(init.body);
    calls.push(call);
    const r = handler(call);
    return new Response(JSON.stringify(r.body), { status: r.status ?? (r.ok ? 200 : 400), headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = realFetch; } };
}
const withCf = () => { process.env.CLOUDFLARE_ACCOUNT_ID = 'acct'; process.env.CLOUDFLARE_API_TOKEN = 'tok'; delete process.env.APP_ACCESS_CODE; };
const JPEG = '/9j/AAAA';
const IMG = `data:image/jpeg;base64,${JPEG}`;
const postTo = (path: string, body: unknown) => fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('generate-backdrop uses FLUX.2 klein with the exact size and the seed', async () => {
  withCf();
  const m = mockCloudflare(() => ({ ok: true, body: { result: { image: JPEG } } }));
  const r = await postTo('/api/generate-backdrop', { prompt: 'a library', seed: 42, width: 1024, height: 576 });
  m.restore();
  const j = await r.json() as any;
  assert.equal(r.status, 200);
  assert.equal(j.model, 'flux-2-klein-4b'); assert.equal(j.width, 1024); assert.equal(j.height, 576); assert.equal(j.seedHonored, true);
  assert.match(m.calls[0].url, /flux-2-klein-4b$/);
  assert.deepEqual([m.calls[0].form!.width, m.calls[0].form!.height, m.calls[0].form!.seed], ['1024', '576', '42']);
});

test('if klein fails the route falls back to FLUX schnell (square, no seed)', async () => {
  withCf();
  const m = mockCloudflare((c) => c.url.includes('klein') ? { ok: false, status: 400, body: { errors: [{ message: 'nope' }] } } : { ok: true, body: { result: { image: JPEG } } });
  const r = await postTo('/api/generate-backdrop', { prompt: 'a library', seed: 42 });
  m.restore();
  const j = await r.json() as any;
  assert.equal(j.model, 'flux-1-schnell'); assert.equal(j.seedHonored, false); assert.equal(j.width, 1024); assert.equal(j.height, 1024);
  assert.equal(m.calls[1].json!.seed, undefined);
});

test('edit-image sends the reference image, the instruction and the same seed to klein', async () => {
  withCf();
  const m = mockCloudflare(() => ({ ok: true, body: { result: { image: JPEG } } }));
  const r = await postTo('/api/edit-image', { prompt: 'Add a professor.', image: IMG, seed: 77, width: 1024, height: 576 });
  m.restore();
  const j = await r.json() as any;
  assert.equal(r.status, 200); assert.equal(j.method, 'edit'); assert.equal(j.model, 'flux-2-klein-4b');
  const f = m.calls[0].form!;
  assert.equal(f.prompt, 'Add a professor.'); assert.equal(f.seed, '77'); assert.equal(f.width, '1024');
  assert.ok(f.input_image_0 instanceof Blob);
});

test('edit-image validates input and reports edit_unavailable so the client can fall back', async () => {
  withCf();
  assert.equal((await postTo('/api/edit-image', { image: IMG })).status, 400);
  assert.equal((await postTo('/api/edit-image', { prompt: 'x', image: 'not-an-image' })).status, 400);
  const m = mockCloudflare(() => ({ ok: false, status: 500, body: { errors: [{ message: 'boom' }] } }));
  const r = await postTo('/api/edit-image', { prompt: 'x', image: IMG });
  m.restore();
  assert.equal(r.status, 502); assert.equal((await r.json() as any).code, 'edit_unavailable');
  delete process.env.CLOUDFLARE_ACCOUNT_ID; delete process.env.CLOUDFLARE_API_TOKEN;
  assert.equal((await postTo('/api/edit-image', { prompt: 'x', image: IMG })).status, 503);
});

test('edit-image is behind the access code (a throwaway test value)', async () => {
  process.env.APP_ACCESS_CODE = 'test-only-code';
  assert.equal((await postTo('/api/edit-image', { prompt: 'x', image: IMG })).status, 401);
  delete process.env.APP_ACCESS_CODE;
});
