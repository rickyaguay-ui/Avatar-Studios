import { Avatar, Style } from '@dicebear/core';
import definition from '@dicebear/styles/open-peeps.json';
import type { AvatarConfig } from '../types';

// DiceBear Open Peeps (CC0), rendered locally. No HTTP API calls.
// idRandomization is left at its default (off) so the same seed + options give identical SVG.
const style = new Style(definition as never);

export function renderAvatar(config: AvatarConfig, size = 256): string {
  return new Avatar(style, { seed: config.seed, size, ...config.options } as never).toString();
}

const comps = (definition as unknown as { components: Record<string, { variants: Record<string, unknown> }> }).components;
const cols = (definition as unknown as { colors: Record<string, { values: string[] }> }).colors;

export const AVATAR_CHOICES = {
  head: Object.keys(comps.head.variants),
  expression: Object.keys(comps.expression.variants),
  facialHair: Object.keys(comps.facialHair.variants),
  accessories: Object.keys(comps.accessories.variants),
  skin: cols.skin.values.map((v) => v.replace('#', '')),
  clothing: cols.clothing.values.map((v) => v.replace('#', '')),
  hair: cols.headContrast.values.map((v) => v.replace('#', '')),
};

/** Merge one customizer field into DiceBear options. 'none' turns facial hair / accessories off. */
export function setOption(
  options: Record<string, unknown>,
  field: 'head' | 'expression' | 'facialHair' | 'accessories' | 'skin' | 'clothing' | 'hair',
  value: string,
): Record<string, unknown> {
  const next = { ...options };
  switch (field) {
    case 'head': next.headVariant = [value]; break;
    case 'expression': next.expressionVariant = [value]; break;
    case 'facialHair':
      if (value === 'none') next.facialHairProbability = 0;
      else { next.facialHairVariant = [value]; next.facialHairProbability = 100; }
      break;
    case 'accessories':
      if (value === 'none') next.accessoriesProbability = 0;
      else { next.accessoriesVariant = [value]; next.accessoriesProbability = 100; }
      break;
    case 'skin': next.skinColor = [value]; break;
    case 'clothing': next.clothingColor = [value]; break;
    case 'hair': next.headContrastColor = [value]; break;
  }
  return next;
}

export function currentOption(options: Record<string, unknown>, field: string): string {
  const first = (k: string) => (options[k] as string[] | undefined)?.[0] ?? '';
  switch (field) {
    case 'head': return first('headVariant');
    case 'expression': return first('expressionVariant');
    case 'facialHair': return options.facialHairProbability === 0 || !options.facialHairVariant ? 'none' : first('facialHairVariant');
    case 'accessories': return options.accessoriesProbability === 0 || !options.accessoriesVariant ? 'none' : first('accessoriesVariant');
    case 'skin': return first('skinColor');
    case 'clothing': return first('clothingColor');
    case 'hair': return first('headContrastColor');
  }
  return '';
}

/** Open Peeps only recolors hair on some head styles; the rest ignore the color. Computed from the style itself. */
let hairHeads: Set<string> | null = null;
export function hairColorWorks(head: string): boolean {
  if (!hairHeads) {
    hairHeads = new Set();
    const [c1, c2] = [AVATAR_CHOICES.hair[0], AVATAR_CHOICES.hair[AVATAR_CHOICES.hair.length - 1]];
    for (const h of AVATAR_CHOICES.head) {
      const a = new Avatar(style, { seed: 'probe', headVariant: [h], headContrastColor: [c1] } as never).toString();
      const b = new Avatar(style, { seed: 'probe', headVariant: [h], headContrastColor: [c2] } as never).toString();
      if (a !== b) hairHeads.add(h);
    }
  }
  return hairHeads.has(head);
}
