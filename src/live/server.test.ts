// Route tests for /api/generate-backdrop. They exercise validation, configuration and the access-code check only;
// no Cloudflare call is made, so they cost nothing and need no network.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

process.env.VERCEL = '1'; // server.ts exports the app and does not listen on its own
const { default: app } = await import('../../server');

let server: Server;
let base = '';
before(() => new Promise<void>((resolve) => {
  server = app.listen(0, () => { base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`; resolve(); });
}));
after(() => new Promise<void>((resolve) => { server.close(() => resolve()); }));

const post = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${base}/api/generate-backdrop`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('missing prompt is a 400', async () => {
  delete process.env.APP_ACCESS_CODE;
  assert.equal((await post({})).status, 400);
  assert.equal((await post({ prompt: '   ' })).status, 400);
});

test('over-long prompt is a 400', async () => {
  assert.equal((await post({ prompt: 'x'.repeat(1501) })).status, 400);
});

test('without Cloudflare credentials it is a 503 and says what to add', async () => {
  const keep = { id: process.env.CLOUDFLARE_ACCOUNT_ID, tok: process.env.CLOUDFLARE_API_TOKEN };
  delete process.env.CLOUDFLARE_ACCOUNT_ID; delete process.env.CLOUDFLARE_API_TOKEN;
  const r = await post({ prompt: 'a greenhouse' });
  assert.equal(r.status, 503);
  assert.match((await r.json() as { error: string }).error, /CLOUDFLARE_ACCOUNT_ID/);
  if (keep.id) process.env.CLOUDFLARE_ACCOUNT_ID = keep.id;
  if (keep.tok) process.env.CLOUDFLARE_API_TOKEN = keep.tok;
});

test('the access code (a throwaway test value) is enforced before any generation', async () => {
  process.env.APP_ACCESS_CODE = 'test-only-code';
  assert.equal((await post({ prompt: 'a greenhouse' })).status, 401);
  assert.equal((await post({ prompt: 'a greenhouse' }, { 'x-access-code': 'wrong' })).status, 401);
  assert.equal((await post({ prompt: '' }, { 'x-access-code': 'test-only-code' })).status, 400);
  delete process.env.APP_ACCESS_CODE;
});
