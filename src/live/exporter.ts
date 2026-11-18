// Export helpers (Live mode): file names, Save as, Share and plain downloads. No platform APIs, no keys:
// only the browser's own File, download, File System Access and Web Share features. Everything takes its
// browser objects as parameters so it can be tested with mocks.

export const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'text/plain': 'txt', 'text/markdown': 'md',
  'application/pdf': 'pdf', 'application/json': 'json', 'video/mp4': 'mp4', 'video/webm': 'webm', 'audio/mpeg': 'mp3',
};
export const KNOWN_EXTS = [...new Set(Object.values(MIME_EXT)), 'jpeg'];

export function extForMime(mime: string): string {
  return MIME_EXT[mime.split(';')[0].trim().toLowerCase()] ?? 'bin';
}

/** "My Story: Part 1!" -> "my-story-part-1". Lowercase, ASCII, dashes. */
export function slugify(text: string, max = 60): string {
  const s = text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, max).replace(/-+$/, '');
}

/** The pre-filled name: slug of the project or story title plus the format, e.g. "my-story-tiktok". */
export function defaultStem(title: string, format: string, role?: string): string {
  return [slugify(title) || 'my-story', slugify(format), role ? slugify(role) : ''].filter(Boolean).join('-');
}

const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * Turns whatever the user typed into a safe file name with the right extension:
 * strips characters filenames can't contain, control characters, trailing dots/spaces and Windows reserved names,
 * and replaces any typed extension with the correct one.
 */
export function sanitizeFilename(typed: string, ext: string): string {
  let stem = typed.normalize('NFC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(stem);
  if (m && KNOWN_EXTS.includes(m[1].toLowerCase())) stem = stem.slice(0, -m[0].length);
  stem = stem.replace(/^[.\s]+|[.\s]+$/g, '').slice(0, 120).replace(/[.\s]+$/g, '');
  if (!stem) stem = 'untitled';
  if (RESERVED.test(stem)) stem = `${stem}-file`;
  return `${stem}.${ext.replace(/^\./, '')}`;
}

/** Decodes a data: URL (base64 or percent-encoded) or fetches any other URL into a Blob. */
export async function srcToBlob(src: string, fetchFn: typeof fetch = fetch): Promise<Blob> {
  const m = /^data:([^;,]*)((?:;[^;,]*)*),(.*)$/s.exec(src);
  if (m) {
    const mime = m[1] || 'application/octet-stream';
    if (/;base64/i.test(m[2])) {
      const bin = atob(m[3]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(m[3])], { type: mime });
  }
  const r = await fetchFn(src);
  if (!r.ok) throw new Error(`Could not read ${src} (HTTP ${r.status})`);
  return r.blob();
}

export const makeFile = (blob: Blob, name: string, mime: string): File => new File([blob], name, { type: mime });

/* ---------------- capabilities ---------------- */

export interface NavLike { share?: (data: ShareData) => Promise<void>; canShare?: (data: ShareData) => boolean }
export interface WinLike { showSaveFilePicker?: (opts: any) => Promise<any> }

export type ShareSupport = 'files' | 'no-share' | 'no-files';

export function shareSupport(nav: NavLike, file: File): ShareSupport {
  if (typeof nav.share !== 'function') return 'no-share';
  if (typeof nav.canShare !== 'function' || !nav.canShare({ files: [file] })) return 'no-files';
  return 'files';
}

export const canSaveAs = (win: WinLike): boolean => typeof win.showSaveFilePicker === 'function';

/** What to tell the user up front about this file on this browser (never a silent failure). */
export function supportNote(nav: NavLike, win: WinLike, file: File | null): string | null {
  if (!file) return null;
  const ext = file.name.split('.').pop()!.toUpperCase();
  const s = shareSupport(nav, file);
  if (s === 'no-share') return `Sharing isn't available in this browser, so Share will download the file. ${canSaveAs(win) ? 'Use Save as to pick where it goes.' : ''}`.trim();
  if (s === 'no-files') {
    return ext === 'PDF'
      ? "This browser's share sheet can't send PDF files, so Share will download the PDF instead."
      : `This browser's share sheet can't take .${ext.toLowerCase()} files, so Share will download it instead.`;
  }
  return null;
}

/* ---------------- actions ---------------- */

export type Outcome = { status: 'shared' | 'saved' | 'downloaded' | 'cancelled'; note?: string };

/** A plain named download through <a download>. Works everywhere. */
export function downloadFile(doc: Pick<Document, 'createElement' | 'body'>, urlApi: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>, file: File, name = file.name): void {
  const a = doc.createElement('a') as HTMLAnchorElement;
  const url = urlApi.createObjectURL(file);
  a.href = url; a.download = name; a.rel = 'noopener'; a.style.display = 'none';
  doc.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => urlApi.revokeObjectURL(url), 10_000);
}

const isAbort = (e: unknown) => (e as { name?: string })?.name === 'AbortError';

/**
 * Share button. Call it from the click handler with an already-built File so the browser still counts it as a user gesture.
 * Files the browser can share open the share sheet; everything else falls back to the named download. A cancelled
 * share sheet (AbortError) is quiet.
 */
export async function shareFile(nav: NavLike, file: File, data: { title: string; text: string }, fallback: () => void): Promise<Outcome> {
  const s = shareSupport(nav, file);
  if (s !== 'files') {
    fallback();
    return { status: 'downloaded', note: supportNote(nav, {}, file) ?? 'Downloaded instead.' };
  }
  try {
    await nav.share!({ files: [file], title: data.title, text: data.text });
    return { status: 'shared' };
  } catch (e) {
    if (isAbort(e)) return { status: 'cancelled' };
    fallback();
    return { status: 'downloaded', note: `The share sheet couldn't send this file (${(e as Error)?.message || 'error'}), so it was downloaded instead.` };
  }
}

/** Save as: the real save dialog where the browser has one (desktop Chrome/Edge), otherwise a plain named download. */
export async function saveFileAs(win: WinLike, file: File, fallback: () => void): Promise<Outcome> {
  if (!canSaveAs(win)) { fallback(); return { status: 'downloaded', note: "This browser has no Save as dialog, so the file was downloaded with this name." }; }
  const ext = file.name.split('.').pop() ?? '';
  try {
    const handle = await win.showSaveFilePicker!({
      suggestedName: file.name,
      types: [{ description: `${ext.toUpperCase()} file`, accept: { [file.type || 'application/octet-stream']: [`.${ext}`] } }],
    });
    const w = await handle.createWritable();
    await w.write(file);
    await w.close();
    return { status: 'saved' };
  } catch (e) {
    if (isAbort(e)) return { status: 'cancelled' };
    fallback();
    return { status: 'downloaded', note: `The save dialog failed (${(e as Error)?.message || 'error'}), so the file was downloaded instead.` };
  }
}
