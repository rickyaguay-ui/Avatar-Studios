import fs from 'node:fs';
const d = 'src/demo/bundles/';
const n = (id) => JSON.parse(fs.readFileSync(d + id + '.json', 'utf8'));
const vo = (id) => n(id).cues.map((c) => c.voiceover).filter(Boolean).join(' ').length;
const on = n('onboarding').map((o) => o.text.length);
const t = vo('tiktok'), a = vo('android'), p = vo('pwa');
console.log({ tiktok: t, android: a, pwa: p, onboarding: on, onboardingTotal: on.reduce((x, y) => x + y, 0) });
console.log('total with 2 voices per format:', on.reduce((x, y) => x + y, 0) + 2 * (t + a + p));
