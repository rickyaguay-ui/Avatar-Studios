import { useEffect, useState } from 'react';
import { provider } from '../services/provider';
import { Button } from '../studio/Media';
import { useStudio } from '../studio/state';
import { useDictation } from './dictation';
import { currentVersion } from './history';
import { applyChange, regenerate, type ActionResult, type ImageApi } from './imageActions';
import {
  FIELD_LABELS, FIELD_ORDER, REFINERS, backgroundInstruction, editInstruction, mergeRecord, parseText,
  type Fields, type ImageKind, type PromptRecord, type Refiner,
} from './promptRecord';
import { cropToWidescreen } from './scene';

const fieldsOf = (r: PromptRecord): Fields => ({ subject: r.subject, action: r.action, setting: r.setting, lighting: r.lighting, style: r.style, camera: r.camera, mood: r.mood });

/** Under every generated image: the prompt fields as editable chips, an Edit button, one-tap refiners and the version history. */
export function ImageEditor({ kind }: { kind: ImageKind }) {
  const { s, d } = useStudio();
  const h = s.images[kind];
  const cur = h ? currentVersion(h) : null;
  const [draft, setDraft] = useState<Fields | null>(null);
  const [editing, setEditing] = useState(false);
  const [bgMode, setBgMode] = useState(false);
  const [change, setChange] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; error?: boolean } | null>(null);
  const dict = useDictation((t) => setChange((p) => ((p.trim() ? p.trimEnd() + ' ' : '') + t).slice(0, 400)));
  useEffect(() => { if (cur) setDraft(fieldsOf(cur.record)); }, [cur?.id, h?.current]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!h || !cur || !draft) return null;
  const api = provider as unknown as ImageApi;
  const inUse = (kind === 'scene' ? s.backdrop : s.portrait) === cur.url;
  const dirty = FIELD_ORDER.some((k) => draft[k] !== cur.record[k]);

  const commit = (r: ActionResult) => {
    setBusy(false);
    if (!r.ok) { setNote({ text: r.message, error: true }); return; }
    d({ t: 'imgEdit', kind, version: { ...r.version, id: h.versions.length } });
    setNote({ text: r.note }); setEditing(false); setBgMode(false); setChange('');
  };
  const go = async (merged: PromptRecord, instruction: string, label: string) => {
    setBusy(true); setNote(null);
    commit(await applyChange(api, kind, cur, merged, instruction, label, cropToWidescreen));
  };

  const submitChange = () => {
    const text = change.trim();
    if (!text) { setNote({ text: 'Describe what should change first.', error: true }); return; }
    if (bgMode) { void go({ ...cur.record, setting: text.replace(/[.\s]+$/, '') }, backgroundInstruction(text), `Edit: background to ${text}`); return; }
    void go(mergeRecord(cur.record, parseText(kind, text)), editInstruction(kind, text), `Edit: ${text}`);
  };
  const refine = (r: Refiner) => {
    if (r.needsText) { setBgMode(true); setEditing(true); setNote(null); return; }
    void go(mergeRecord(cur.record, { fields: r.patch, additive: false }), r.instruction, `Refine: ${r.label}`);
  };
  const fromFields = async () => {
    setBusy(true); setNote(null);
    commit(await regenerate(api, kind, { ...cur.record, ...draft }, 'Edited fields', cropToWidescreen));
  };

  return (
    <div className="flex flex-col gap-3" data-testid={`image-editor-${kind}`}>
      <img src={cur.url} alt={`Your generated ${kind}`} className={kind === 'scene' ? 'w-full aspect-video object-cover rounded-md border border-ink-700' : 'w-full max-w-sm rounded-lg border border-ink-700'} />
      {!inUse && (
        <p className="text-xs text-gold-300">This version is not the one in your frame. <button className="underline" onClick={() => d({ t: 'imgUse', kind, index: h.current })}>Use it in the frame</button></p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => { setEditing(!editing); setBgMode(false); }} disabled={busy}>Edit</Button>
        <Button onClick={() => { setNote(null); d({ t: 'imgUndo', kind }); }} disabled={busy || !h.undo.length}>Undo</Button>
        <Button onClick={() => { setNote(null); d({ t: 'imgRedo', kind }); }} disabled={busy || !h.redo.length}>Redo</Button>
        <span className="text-xs text-ink-400">Version {h.current + 1} of {h.versions.length}</span>
      </div>

      {editing && (
        <div className="rounded-lg border border-gold-700 bg-ink-800 p-3 flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm text-ink-50 font-semibold">
            {bgMode ? 'What should the new background be?' : 'What should change?'}
            <textarea value={change} onChange={(e) => setChange(e.target.value.slice(0, 400))} rows={2} spellCheck lang="en-US"
              placeholder={bgMode ? 'Example: a rainy city street at dusk' : 'Example: add a scary AI professor standing over the guy in the middle'}
              className="bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-ink-50 font-normal" />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {dict.supported && <Button onClick={dict.toggle}>{dict.listening ? 'Stop mic' : 'Mic'}</Button>}
            <Button primary disabled={busy} onClick={submitChange}>{busy ? 'Working...' : 'Apply change'}</Button>
            <Button onClick={() => { setEditing(false); setBgMode(false); }}>Cancel</Button>
            {dict.listening && <span role="status" className="text-xs text-gold-300">Listening...</span>}
          </div>
          {dict.error && <p role="alert" className="text-sm text-warn">{dict.error}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick refiners">
        {REFINERS.map((r) => (
          <button key={r.id} disabled={busy} onClick={() => refine(r)}
            className="px-2.5 py-1 rounded-full text-xs border border-ink-600 text-ink-200 hover:bg-ink-800 hover:border-gold-500 disabled:opacity-40">{r.label}</button>
        ))}
      </div>
      {note && <p role={note.error ? 'alert' : 'status'} className={`text-xs ${note.error ? 'text-warn' : 'text-ok'}`}>{note.text}</p>}

      <div>
        <div className="text-xs text-ink-400 mb-1">Prompt fields (edit any, then regenerate with the same seed {cur.record.seed})</div>
        <div className="grid sm:grid-cols-2 gap-2" aria-label="Prompt fields">
          {FIELD_ORDER.map((k) => (
            <label key={k} className="text-[11px] text-ink-400 flex flex-col gap-0.5">
              {FIELD_LABELS[k]}
              <input value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} placeholder="(not set)"
                className="bg-ink-800 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50" />
            </label>
          ))}
        </div>
        <Button className="mt-2" disabled={busy || !dirty} onClick={fromFields}>Regenerate from these fields</Button>
      </div>

      <div>
        <div className="text-xs text-ink-400 mb-1">Versions (nothing is lost when you edit)</div>
        <ol className="flex gap-2 overflow-x-auto pb-1" aria-label="Versions">
          {h.versions.map((v, i) => (
            <li key={v.id} className={`shrink-0 w-28 rounded-md border p-1 ${i === h.current ? 'border-gold-400 bg-ink-800' : 'border-ink-700'}`}>
              <img src={v.url} alt={`Version ${i + 1}`} className="w-full aspect-video object-cover rounded" />
              <div className="text-[10px] text-ink-200 mt-1 truncate" title={v.label}>v{i + 1}: {v.label}</div>
              {i === h.current
                ? <div className="text-[10px] text-gold-300">Current</div>
                : <button className="text-[10px] underline text-ink-200" onClick={() => { setNote(null); d({ t: 'imgUse', kind, index: i }); }}>Use this one</button>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
