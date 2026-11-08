import type { FormatExample, FormatId } from '../types';
import tiktok from '../demo/bundles/tiktok.json';
import android from '../demo/bundles/android.json';
import pwa from '../demo/bundles/pwa.json';

const EXAMPLES = { tiktok, android, pwa } as unknown as Record<FormatId, FormatExample>;
export const FORMAT_ORDER: FormatId[] = ['android', 'pwa', 'tiktok'];
export const getExample = (f: FormatId): FormatExample => EXAMPLES[f];
