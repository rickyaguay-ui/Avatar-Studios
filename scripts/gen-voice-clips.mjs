// ONE-TIME clip generation with ElevenLabs. Run on Ricky's PC only; the deployed demo never uses a key.
//
//   node scripts/gen-voice-clips.mjs --voices          list voices (name, id, category) to pick Mesa/Reed
//   node scripts/gen-voice-clips.mjs --models          list model ids that support text-to-speech
//   node scripts/gen-voice-clips.mjs [--force]         generate any missing clip into public/demo-audio
//   --only=onboarding|tiktok|android|pwa               limit to one group (combine with --force to overwrite)
//   --dry                                              print per-clip character counts, call nothing
//
// Reads from .env (never printed): ELEVENLABS_API_KEY, ELEVENLABS_VOICE_MESA, ELEVENLABS_VOICE_REED,
// ELEVENLABS_MODEL_ID (confirm the v4 id with --models first), optional ELEVENLABS_OUTPUT_FORMAT
// (default mp3_44100_128; if the free plan rejects it the API error is shown, try mp3_44100_64).
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const key = process.env.ELEVENLABS_API_KEY;
if (!key && !process.argv.includes('--dry')) { console.error('ELEVENLABS_API_KEY missing from .env. Run the ElevenLabs onboarding step first.'); process.exit(1); }
const H = { 'xi-api-key': key ?? '' };
const args = new Set(process.argv.slice(2));

if (args.has('--voices') && !args.has('--dry')) {
  const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: H });
  if (!r.ok) { console.error('voices failed', r.status, await r.text()); process.exit(1); }
  const { voices } = await r.json();
  for (const v of voices) console.log(`${v.voice_id}  ${v.name}  [${v.category ?? '?'}]  ${Object.values(v.labels ?? {}).join(', ')}`);
  process.exit(0);
}
if (args.has('--models')) {
  const r = await fetch('https://api.elevenlabs.io/v1/models', { headers: H });
  if (!r.ok) { console.error('models failed', r.status, await r.text()); process.exit(1); }
  for (const m of await r.json()) if (m.can_do_text_to_speech) console.log(`${m.model_id}  ${m.name}`);
  process.exit(0);
}

const model = process.env.ELEVENLABS_MODEL_ID;
const voice = { mesa: process.env.ELEVENLABS_VOICE_MESA, reed: process.env.ELEVENLABS_VOICE_REED };
const fmt = process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128';
if (!args.has('--dry') && (!model || !voice.mesa || !voice.reed)) {
  console.error('Set ELEVENLABS_MODEL_ID, ELEVENLABS_VOICE_MESA and ELEVENLABS_VOICE_REED in .env (use --models and --voices).');
  process.exit(1);
}

const dir = 'src/demo/bundles';
const read = (f) => JSON.parse(fs.readFileSync(`${dir}/${f}.json`, 'utf8'));
const jobs = [];
for (const o of read('onboarding')) jobs.push({ file: o.clip, host: o.host, text: o.text });
for (const f of ['tiktok', 'android', 'pwa']) {
  const b = read(f);
  const text = b.cues.map((c) => c.voiceover).filter(Boolean).join(' ');
  for (const host of ['mesa', 'reed']) jobs.push({ file: b.voices[host], host, text });
}

const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const group = (j) => (j.file.includes('onboarding') ? 'onboarding' : path.basename(j.file).split('-')[0]);
const sel = only ? jobs.filter((j) => group(j) === only) : jobs;
if (args.has('--dry')) {
  let t = 0;
  for (const j of sel) { t += j.text.length; console.log(`${j.file}  ${j.host}  ${j.text.length} chars  ${fs.existsSync(path.join('public', j.file)) ? '(exists)' : '(missing)'}`); }
  console.log(`Total ${t} chars across ${sel.length} clips`);
  process.exit(0);
}
let chars = 0;
for (const j of sel) {
  const out = path.join('public', j.file);
  if (fs.existsSync(out) && !args.has('--force')) { console.log('skip  ', out); continue; }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice[j.host]}?output_format=${fmt}`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: j.text, model_id: model }),
  });
  if (!r.ok) { console.error('FAILED', out, r.status, await r.text()); process.exit(1); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  chars += j.text.length;
  console.log('wrote ', out, `(${j.text.length} chars)`);
}
console.log(`Done. ${chars} characters used this run.`);
