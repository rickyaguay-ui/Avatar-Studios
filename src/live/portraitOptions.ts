// Fill-in-the-blank portrait template. Each field is a blank in one sentence; the picks assemble into the prompt.
// Mesa and Reed are example presets that fill every blank (they are examples only).

export interface PortraitForm {
  subject: string; age: string; skin: string; hair: string; build: string; expression: string;
  wardrobe: string; setting: string; lighting: string; framing: string; style: string;
}

export interface BlankDef { key: keyof PortraitForm; label: string; options: string[] }

export const BLANKS: BlankDef[] = [
  { key: 'subject', label: 'Subject', options: ['woman', 'man', 'non-binary person'] },
  { key: 'age', label: 'Age', options: ['early 20s', 'late 20s', '30s', 'late 30s', '40s', '50s', '60s', '70s'] },
  { key: 'skin', label: 'Ethnicity / skin tone', options: [
    'fair skin', 'light skin with freckles', 'olive skin', 'tan skin', 'light brown skin', 'medium brown skin', 'dark brown skin', 'deep ebony skin',
    'East Asian features', 'South Asian features', 'Black features', 'Latino features', 'Middle Eastern features', 'Pacific Islander features', 'Native American features', 'mixed heritage'] },
  { key: 'hair', label: 'Hair', options: [
    'short dark hair', 'long wavy auburn hair', 'short curly black hair', 'long straight black hair', 'shoulder-length brown hair', 'blonde ponytail', 'gray bob', 'short salt-and-pepper hair',
    'braids', 'afro', 'buzz cut', 'shaved head', 'messy bun', 'silver hair'] },
  { key: 'build', label: 'Build', options: ['slim build', 'average build', 'athletic build', 'stocky build', 'broad-shouldered build', 'tall and lean'] },
  { key: 'expression', label: 'Expression', options: [
    'calm, clear expression', 'warm friendly smile', 'confident look', 'serious and focused', 'big laugh', 'thoughtful expression', 'kind, welcoming look', 'direct and honest look'] },
  { key: 'wardrobe', label: 'Wardrobe', options: [
    'a canvas work jacket', 'a denim jacket', 'a flannel shirt', 'a business suit', 'a hoodie', 'a cozy knit sweater', 'a lab coat', 'a leather jacket',
    'a plain white t-shirt', 'a button-up shirt', 'a blazer over a t-shirt', 'a winter coat and scarf'] },
  { key: 'setting', label: 'Setting', options: [
    'a neutral studio backdrop', 'a sunlit greenhouse', 'a woodworking shop', 'a modern office', 'a coffee shop', 'a library', 'a city street', 'a park in autumn', 'a farmhouse kitchen', 'a classroom'] },
  { key: 'lighting', label: 'Lighting', options: [
    'soft natural window light', 'warm golden-hour light', 'bright studio softbox lighting', 'overcast daylight', 'dramatic side lighting', 'warm lamp light', 'backlit with a rim light'] },
  { key: 'framing', label: 'Framing', options: ['head and shoulders', 'bust portrait', 'waist-up', 'full body'] },
  { key: 'style', label: 'Style', options: [
    'photorealistic photograph', 'cinematic film still', 'soft digital illustration', 'watercolor painting', 'flat vector illustration', '3D animated character render', 'anime illustration', 'pencil sketch', 'pixel art'] },
];

export const DEFAULT_FORM: PortraitForm = {
  subject: 'woman', age: '30s', skin: 'light brown skin', hair: 'short dark hair', build: 'average build', expression: 'warm friendly smile',
  wardrobe: 'a canvas work jacket', setting: 'a neutral studio backdrop', lighting: 'soft natural window light', framing: 'head and shoulders', style: 'photorealistic photograph',
};

/** Example presets: Mesa and Reed as ready-made fill-ins. */
export const PRESETS: Record<'mesa' | 'reed', PortraitForm> = {
  mesa: { subject: 'woman', age: 'late 30s', skin: 'fair skin', hair: 'long wavy auburn hair', build: 'average build', expression: 'calm, clear expression',
    wardrobe: 'a canvas work jacket', setting: 'a sunlit greenhouse', lighting: 'soft natural window light', framing: 'head and shoulders', style: 'photorealistic photograph' },
  reed: { subject: 'man', age: '40s', skin: 'tan skin', hair: 'short salt-and-pepper hair', build: 'stocky build', expression: 'direct and honest look',
    wardrobe: 'a flannel shirt', setting: 'a woodworking shop', lighting: 'warm golden-hour light', framing: 'head and shoulders', style: 'photorealistic photograph' },
};

const pronoun = (subject: string) => (subject === 'woman' ? 'her' : subject === 'man' ? 'his' : 'their');

/** Assembles the picks (and optional free text) into the prompt sent to the image model. */
export function buildPortraitPrompt(f: PortraitForm, extra: string, onlyMine: boolean): string {
  const tail = 'Synthetic person, no text, no logos.';
  const free = extra.trim();
  if (onlyMine && free) return `${free} ${tail}`;
  const parts = [
    `${f.style} of a fictional ${f.subject} in ${pronoun(f.subject)} ${f.age}`,
    f.skin, f.hair, f.build, f.expression, `wearing ${f.wardrobe}`, `in ${f.setting}`, f.lighting, f.framing,
  ];
  return `${parts.join(', ')}.${free ? ` ${free.replace(/\s+$/, '')}${/[.!?]$/.test(free) ? '' : '.'}` : ''} ${tail}`;
}
