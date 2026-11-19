// Structured prompt state for every generated image (portraits and scenes).
// The APP owns this record, not the model: free text and the mic are parsed into fields by fixed rules, edits merge only
// into the fields they touch, and the final prompt is assembled from the fields in one fixed order. No randomness here
// except the seed, which is chosen once per image and then reused for every edit.
import type { PortraitForm } from './portraitOptions';

export type ImageKind = 'portrait' | 'scene';
export const FIELD_ORDER = ['subject', 'action', 'setting', 'lighting', 'style', 'camera', 'mood'] as const;
export type FieldKey = (typeof FIELD_ORDER)[number];
export type Fields = Record<FieldKey, string>;
export interface PromptRecord extends Fields { seed: number }

export const FIELD_LABELS: Record<FieldKey, string> = {
  subject: 'Subject', action: 'Action / pose', setting: 'Setting', lighting: 'Lighting', style: 'Style', camera: 'Camera / framing', mood: 'Mood',
};

export const emptyFields = (): Fields => ({ subject: '', action: '', setting: '', lighting: '', style: '', camera: '', mood: '' });

export function newSeed(rand: () => number = Math.random): number {
  return Math.floor(rand() * 2147483647);
}

/* ---------------- parsing ---------------- */

const STYLE = [
  /\bphotorealistic( photograph| photo)?\b/i, /\bcinematic( film still)?\b/i, /\bwatercolou?r( painting)?\b/i, /\banime( illustration)?\b/i,
  /\bpixel art\b/i, /\bpencil sketch\b/i, /\bflat vector illustration\b/i, /\b3d( animated)?( character)? render\b/i,
  /\b(?:soft |digital )?illustration\b/i, /\boil painting\b/i, /\bcomic book\b/i,
];
const LIGHTING = [
  /\bgolden[- ]hour( light(?:ing)?)?\b/i, /\b(?:soft )?(?:natural )?window light(?:ing)?\b/i, /\b(?:dramatic|harsh|high-contrast)(?: side)? light(?:ing)?\b/i,
  /\b(?:warm )?lamp ?light\b/i, /\bcandle ?light\b/i, /\bmoonlight\b/i, /\bovercast(?: daylight)?\b/i, /\bstudio(?: softbox)? lighting\b/i,
  /\bbacklit(?: with a rim light)?\b/i, /\b(?:bright|soft|warm|cool|dim|low)(?: [a-z]+)? light(?:ing)?\b/i,
];
const TIME = /\b(?:at |during )?(sunrise|sunset|dawn|dusk|night)\b/i;
const CAMERA = [
  /\bclose[- ]?up(?: shot)?\b/i, /\bcloser shot\b/i, /\bwide(?: angle)?(?: shot)?\b/i, /\baerial(?: view| shot)?\b/i, /\blow[- ]angle(?: shot)?\b/i,
  /\btop[- ]down(?: view)?\b/i, /\bhead and shoulders\b/i, /\bbust(?: portrait)?\b/i, /\bwaist[- ]up\b/i, /\bfull[- ]body\b/i, /\bmacro\b/i,
];
const MOOD = /\b(scary|eerie|spooky|cozy|calm|peaceful|dramatic|tense|joyful|happy|mysterious|gloomy|serene|ominous|whimsical|moody)\b(?: mood| atmosphere| feeling)?/i;
const ACTION = /\b(standing|sitting|walking|running|holding|smiling|laughing|looking|leaning|reading|writing|dancing|pointing|waving|kneeling|crouching|working|talking|speaking)\b[^,.;]*/i;
const SETTING_PREP = /\b(?:in|at|inside|on|by|near|under) ((?:a|an|the)\b[^,.;]+)/i;
const ADD = /^\s*(?:please\s+)?(?:add|include|insert|put|place|bring in)\b\s*/i;
const CHANGE_BG = /\b(?:change|replace|swap|set)(?: the)? (?:background|setting|scene|location)(?: only)? (?:to|with)\s+(.+)$/i;
const FILLER = /^\s*(?:please\s+|can you\s+|could you\s+|i want\s+|let'?s\s+)?(?:make (?:it|the [a-z ]+)\s+|turn it into\s+)?/i;

function take(text: string, patterns: RegExp[]): { value: string; rest: string } {
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return { value: m[0].trim().toLowerCase(), rest: (text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length)) };
  }
  return { value: '', rest: text };
}

const tidy = (s: string) => s.replace(/\b(?:at|during|on|in)\s+(?=with\b|and\b)/gi, '').replace(/\b(?:with|and|plus|in|at|of|a|an|the|more|some|little)\s*$/i, '').replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '').replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim();

export interface Parsed { fields: Partial<Fields>; additive: boolean }

/** Free text (typed or from the mic) -> fields. `layered` = this text sits on top of existing picks, so subject/action append. */
export function parseText(kind: ImageKind, input: string, layered = false): Parsed {
  let text = input.replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, '');
  const fields: Partial<Fields> = {};
  if (!text) return { fields, additive: layered };

  const bg = CHANGE_BG.exec(text);
  if (bg) return { fields: { setting: tidy(bg[1]) }, additive: false };

  const additive = ADD.test(text) || layered;
  text = text.replace(ADD, '');
  if (!additive) text = text.replace(FILLER, '');

  const style = take(text, STYLE); text = style.rest; if (style.value) fields.style = style.value;
  let light = take(text, LIGHTING); text = light.rest;
  if (!light.value) { const t = TIME.exec(text); if (t) { light = { value: `${t[1].toLowerCase()} light`, rest: text.replace(t[0], ' ') }; text = light.rest; } }
  if (light.value) fields.lighting = light.value;
  const cam = take(text, CAMERA); text = cam.rest; if (cam.value) fields.camera = cam.value;
  if (!additive) { const m = MOOD.exec(text); if (m) { fields.mood = m[1].toLowerCase(); text = text.replace(m[0], ' '); } }

  const act = ACTION.exec(text);
  if (act) { fields.action = tidy(act[0]); text = text.replace(act[0], ' '); }
  if (kind === 'portrait') {
    const set = SETTING_PREP.exec(text);
    if (set) { fields.setting = tidy(set[1]); text = text.replace(set[0], ' '); }
  }
  const rest = tidy(text);
  const meaningful = rest.length >= 3 && !/^(it|this|that|the image|the picture|more|less|please)$/i.test(rest);
  if (meaningful) {
    if (kind === 'scene' && !additive) fields.setting = fields.setting ?? rest.replace(/^(?:a scene of|an image of|a picture of|a photo of)\s+/i, '');
    else fields.subject = rest;
  }
  return { fields, additive: additive || (kind === 'portrait' && !!fields.subject && !bgLike(fields)) };
}
const bgLike = (f: Partial<Fields>) => !!f.setting && !f.subject;

/** Merge a parsed change into a record. Only the fields the change touches are modified; the seed never changes. */
export function mergeRecord(rec: PromptRecord, parsed: Parsed): PromptRecord {
  const out: PromptRecord = { ...rec };
  for (const key of FIELD_ORDER) {
    const v = parsed.fields[key];
    if (!v) continue;
    if (parsed.additive && key === 'subject') out.subject = rec.subject ? `${rec.subject}, and ${v}` : v;
    else if (parsed.additive && key === 'action') out.action = rec.action ? `${rec.action}; ${v}` : v;
    else out[key] = v;
  }
  return out;
}

/* ---------------- records ---------------- */

const pronoun = (subject: string) => (subject === 'woman' ? 'her' : subject === 'man' ? 'his' : 'their');

/** Builds the record for a new portrait from the blanks plus the free-text description. */
export function recordFromPicks(f: PortraitForm, text: string, onlyMine: boolean, seed: number): PromptRecord {
  if (onlyMine && text.trim()) return recordFromText('portrait', text, seed);
  const base: PromptRecord = {
    subject: `${f.subject} in ${pronoun(f.subject)} ${f.age}, ${f.skin}, ${f.hair}, ${f.build}, wearing ${f.wardrobe}`,
    action: '', setting: f.setting, lighting: f.lighting, style: f.style, camera: f.framing, mood: f.expression, seed,
  };
  return text.trim() ? mergeRecord(base, parseText('portrait', text, true)) : base;
}

export function recordFromText(kind: ImageKind, text: string, seed: number): PromptRecord {
  const p = parseText(kind, text);
  const rec: PromptRecord = { ...emptyFields(), ...p.fields, seed };
  if (kind === 'scene') { rec.style ||= 'photorealistic'; rec.camera ||= 'wide cinematic shot'; }
  if (kind === 'portrait') { rec.style ||= 'photorealistic photograph'; rec.camera ||= 'head and shoulders'; }
  return rec;
}

/* ---------------- assembly (one fixed order) ---------------- */

const PEOPLE = /\b(man|woman|guy|person|people|boy|girl|student|professor|crowd|child|kid|teacher)\b/i;

export function assemblePrompt(kind: ImageKind, r: PromptRecord): string {
  const tail = (s: string, pre: string) => (s ? `${pre}${s}` : '');
  if (kind === 'portrait') {
    return `${r.style || 'photorealistic photograph'} of ${r.subject || 'a fictional person'}${tail(r.action, ', ')}${tail(r.setting, ', in ')}${tail(r.lighting, ', ')}${tail(r.camera, ', ')}${r.mood ? `, ${r.mood} mood` : ''}. Synthetic person, no text, no logos.`;
  }
  const hasPeople = !!(r.subject || r.action) || PEOPLE.test(r.setting);
  const head = `${r.style || 'photorealistic'}${tail(r.camera, ', ')}: ${r.setting || 'an empty room'}${tail(r.subject, ', with ')}${tail(r.action, ', ')}${tail(r.lighting, ', ')}${r.mood ? `, ${r.mood} mood` : ''}.`;
  return hasPeople ? `${head} No text, no logos.` : `${head} Empty foreground with open space in the center. No people, no text, no logos.`;
}

/** Short human label for a scene version (used in the UI and the Export bundle). */
export function describeRecord(kind: ImageKind, r: PromptRecord): string {
  return kind === 'scene' ? [r.setting, r.subject && `with ${r.subject}`, r.action].filter(Boolean).join(', ') : r.subject;
}

/* ---------------- edit instructions and one-tap refiners ---------------- */

export interface Refiner { id: string; label: string; patch: Partial<Fields>; instruction: string; needsText?: boolean }

export const REFINERS: Refiner[] = [
  { id: 'closer', label: 'Closer shot', patch: { camera: 'close-up shot' }, instruction: 'Move the camera closer for a close-up of the same image. Keep the same subject, setting and lighting.' },
  { id: 'dramatic', label: 'More dramatic lighting', patch: { lighting: 'dramatic high-contrast lighting' }, instruction: 'Make the lighting more dramatic with stronger contrast and shadows. Keep the same subject, setting and composition.' },
  { id: 'cinematic', label: 'Cinematic', patch: { style: 'cinematic film still, shallow depth of field' }, instruction: 'Give the image a cinematic look: film still, shallow depth of field, rich color grading. Keep the same content and composition.' },
  { id: 'brighter', label: 'Brighter', patch: { lighting: 'bright, well-lit, high-key lighting' }, instruction: 'Make the image brighter and well lit. Keep the same content and composition.' },
  { id: 'background', label: 'Change background only', patch: {}, instruction: '', needsText: true },
];

/** The instruction sent to the image-editing model for a typed change. Always ends by pinning everything else. */
export function editInstruction(kind: ImageKind, changeText: string): string {
  const change = changeText.trim().replace(/[.\s]+$/, '');
  const keep = kind === 'scene' ? 'the setting, lighting and composition' : 'the person, pose, lighting and background';
  return `${change.charAt(0).toUpperCase()}${change.slice(1)}. Keep everything else exactly as it is, including ${keep}.`;
}

export function backgroundInstruction(newBackground: string): string {
  return `Change only the background to: ${newBackground.trim().replace(/[.\s]+$/, '')}. Keep the subject, pose, clothing and lighting exactly the same.`;
}
