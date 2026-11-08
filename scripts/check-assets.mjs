// Lists every committed-asset path the demo bundles reference and whether the file exists.
// REQUIRED: portraits, bg-<format> backdrops, voice clips, onboarding clips.
// OPTIONAL: clip-<format>.mp4 (used only if present) and onboarding-N.mp4 talking heads, plus image size budget.
// Exit code 1 if any required file is missing or any image exceeds the size budget.
import fs from 'node:fs';
import path from 'node:path';
const dir = 'src/demo/bundles';
const required = new Set();
const optional = new Set();
for (const f of ['tiktok', 'android', 'pwa']) {
  const b = JSON.parse(fs.readFileSync(`${dir}/${f}.json`, 'utf8'));
  Object.values(b.portraits).forEach((p) => required.add(p));
  Object.values(b.voices).forEach((p) => required.add(p));
  required.add(b.backdrop);
  if (b.video) optional.add(b.video);
}
for (const o of JSON.parse(fs.readFileSync(`${dir}/onboarding.json`, 'utf8'))) {
  required.add(o.clip);
  if (o.talkingHead) optional.add(o.talkingHead);
}
const IMAGE_BUDGET = 700 * 1024; // bytes per demo image
let bad = 0;
const size = (p) => fs.statSync(path.join('public', p)).size;
for (const p of [...required].sort()) {
  const exists = fs.existsSync(path.join('public', p));
  let note = '';
  if (exists && /\.(png|jpe?g|webp)$/i.test(p) && size(p) > IMAGE_BUDGET) { note = `  TOO LARGE (${Math.round(size(p) / 1024)} KB > ${IMAGE_BUDGET / 1024} KB)`; bad++; }
  if (!exists) bad++;
  console.log(`${exists ? (note ? 'BIG    ' : 'ok     ') : 'MISSING'} public${p}${note}`);
}
for (const p of [...optional].sort()) console.log(`${fs.existsSync(path.join('public', p)) ? 'ok     ' : 'optional'} public${p}`);
console.log(`\n${required.size - bad} of ${required.size} required files ready`);
process.exit(bad ? 1 : 0);
