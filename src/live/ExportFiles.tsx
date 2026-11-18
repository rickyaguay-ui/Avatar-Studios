import { useEffect, useMemo, useState } from 'react';
import { Button, Panel } from '../studio/Media';
import { useNarrator } from './NarratorPanel';
import {
  canSaveAs, defaultStem, downloadFile, extForMime, makeFile, sanitizeFilename, saveFileAs, shareFile, srcToBlob, supportNote,
  type NavLike, type Outcome, type WinLike,
} from './exporter';

interface Item { id: string; role: string; label: string; src?: string; text?: string; mime: string }

const guessMime = (src: string): string => {
  const d = /^data:([^;,]+)/.exec(src);
  if (d) return d[1];
  return /\.png(\?|$)/i.test(src) ? 'image/png' : /\.svg(\?|$)/i.test(src) ? 'image/svg+xml' : 'image/jpeg';
};

const firstWords = (text: string, n = 4) => text.trim().split(/\s+/).slice(0, n).join(' ').replace(/[.,!?;:]+$/, '');

function ExportRow({ item, title, format }: { item: Item; title: string; format: string }) {
  const [override, setOverride] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setBlob(null); setLoadError(null);
    const make = item.text !== undefined ? Promise.resolve(new Blob([item.text], { type: item.mime })) : srcToBlob(item.src!);
    make.then((b) => { if (live) setBlob(b); }).catch((e) => { if (live) setLoadError(e instanceof Error ? e.message : 'Could not prepare this file'); });
    return () => { live = false; };
  }, [item.src, item.text, item.mime]);

  const mime = blob?.type || item.mime;
  const ext = extForMime(mime);
  const typed = override ?? defaultStem(title, format, item.role);
  const name = sanitizeFilename(typed, ext);
  // Built ahead of the click so Share/Save as can run inside the user gesture.
  const file = useMemo(() => (blob ? makeFile(blob, name, mime) : null), [blob, name, mime]);
  const nav = (typeof navigator !== 'undefined' ? navigator : {}) as unknown as NavLike;
  const win = (typeof window !== 'undefined' ? window : {}) as unknown as WinLike;
  const note = supportNote(nav, win, file);
  const fallback = () => { if (file) downloadFile(document, URL, file); };

  const report = (o: Outcome) => setOutcome(o.status === 'cancelled' ? null : o);
  const onDownload = () => { if (file) { downloadFile(document, URL, file); report({ status: 'downloaded' }); } };
  const onSaveAs = () => { if (file) void saveFileAs(win, file, fallback).then(report); };
  const onShare = () => { if (file) void shareFile(nav, file, { title: title || 'My Avatar Studios project', text: 'Made with Avatar Studios' }, fallback).then(report); };

  return (
    <li className="rounded-lg border border-ink-700 bg-ink-800 p-3 flex flex-col gap-2" data-testid={`export-row-${item.id}`}>
      <div className="text-sm text-ink-50 font-semibold">{item.label}</div>
      <label className="flex flex-col gap-1 text-xs text-ink-400">
        File name
        <span className="flex items-center gap-1">
          <input value={typed} onChange={(e) => { setOverride(e.target.value); setOutcome(null); }} aria-label={`${item.label} file name`} spellCheck={false}
            className="flex-1 min-w-0 bg-ink-900 border border-ink-600 rounded px-2 py-1.5 text-sm text-ink-50" />
          <span className="text-sm text-ink-200">.{ext}</span>
        </span>
      </label>
      <div className="text-[11px] text-ink-400">Saves as <code className="text-gold-300" data-testid="final-name">{name}</code></div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onDownload} disabled={!file}>Download</Button>
        {canSaveAs(win) && <Button onClick={onSaveAs} disabled={!file}>Save as...</Button>}
        <Button primary onClick={onShare} disabled={!file}>Share</Button>
      </div>
      {loadError && <p role="alert" className="text-xs text-warn">{loadError}</p>}
      {note && <p className="text-xs text-gold-300" data-testid="support-note">{note}</p>}
      {outcome && (
        <p role="status" className="text-xs text-ok">
          {outcome.status === 'shared' ? 'Shared.' : outcome.status === 'saved' ? 'Saved.' : `Downloaded as ${name}.`}{outcome.note ? ` ${outcome.note}` : ''}
        </p>
      )}
    </li>
  );
}

/** Live-mode export panel: one file-name field per export, plus Download, Save as and Share. */
export function ExportFiles({ bundle }: { bundle: string }) {
  const { s, info } = useNarrator();
  const [title, setTitle] = useState(() => firstWords(s.script));
  const format = s.format;

  const items: Item[] = [];
  if (s.backdrop) items.push({ id: 'scene', role: 'scene', label: 'Scene backdrop', src: s.backdrop, mime: guessMime(s.backdrop) });
  if (info.src) items.push({ id: 'narrator', role: 'narrator', label: 'Narrator avatar', src: info.src, mime: guessMime(info.src) });
  if (s.squareMode === 'other' && s.squareUrl) items.push({ id: 'square', role: 'square', label: 'Small square avatar', src: s.squareUrl, mime: guessMime(s.squareUrl) });
  items.push({ id: 'prompt', role: 'prompt', label: 'Prompt bundle', text: bundle, mime: 'text/plain' });

  return (
    <Panel title="Name, save and share your files">
      <label className="flex flex-col gap-1 text-sm text-ink-50 font-semibold">
        Project or story title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="my story" spellCheck lang="en-US"
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-ink-50 font-normal" />
      </label>
      <p className="text-xs text-ink-400 mt-1 mb-3">File names start from this title and the format ({format}). Change any name before you save or share. No account or key is involved.</p>
      <ul className="grid lg:grid-cols-2 gap-3" aria-label="Files to export">
        {items.map((it) => <ExportRow key={it.id} item={it} title={title} format={format} />)}
      </ul>
    </Panel>
  );
}
