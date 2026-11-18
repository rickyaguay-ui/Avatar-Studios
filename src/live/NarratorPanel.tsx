import { useMemo, useState } from 'react';
import { provider } from '../services/provider';
import { renderAvatar } from '../studio/avatar';
import { NarratorCircle } from '../studio/Frames';
import { Button, Panel } from '../studio/Media';
import { useStudio, type SquareMode } from '../studio/state';
import { useDictation } from './dictation';
import { SQUARE_LABELS, buildSquarePrompt, resolveNarrator } from './narrator';

/** The narrator the whole app agrees on (the user's own avatar), plus what the small square shows. */
export function useNarrator() {
  const { s, d } = useStudio();
  const avatar = s.avatars[s.format];
  const svg = useMemo(() => renderAvatar(avatar), [avatar]);
  return { s, d, svg, info: resolveNarrator(s, svg) };
}

/** Same narrator badge in the Avatar, Voice, Preview and Export steps. */
export function NarratorBadge() {
  const { info } = useNarrator();
  return (
    <div className="flex items-center gap-3" data-testid="narrator-badge">
      <NarratorCircle src={info.src} size={44} />
      <div className="text-xs text-ink-200">
        <div className="text-sm text-ink-50 font-semibold">Your narrator</div>
        {info.hasAvatar
          ? 'The avatar you built. It is the circle in your frame and stays the same in every step.'
          : 'No avatar yet. Build one in the Avatar step; until then the circle stays empty.'}
      </div>
    </div>
  );
}

const MODES: SquareMode[] = ['mine', 'other', 'none'];

/** Chooses what the small square in the frame shows: my avatar (default), another generated avatar, or nothing. */
export function SquarePicker() {
  const { s, d, info } = useNarrator();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const dict = useDictation((t) => setText((p) => ((p.trim() ? p.trimEnd() + ' ' : '') + t).slice(0, 300)));

  const generate = async () => {
    if (!text.trim()) { setMsg('Describe the other avatar first.'); return; }
    setBusy(true); setMsg(null);
    const r = await provider.generatePortrait({ host: s.host, hairstyle: '', clothing: '', bodyType: '', framing: '', artStyle: '', prompt: buildSquarePrompt(text) });
    setBusy(false);
    if (r.ok) d({ t: 'square', mode: 'other', url: r.data.imageUrl }); else setMsg(r.message);
  };

  return (
    <Panel title="Narrator and small square">
      <NarratorBadge />
      <p className="text-xs text-ink-400 mt-3 mb-2">The circle is always your narrator. The small square is separate: it can show your avatar, a different avatar, or nothing.</p>
      <div role="radiogroup" aria-label="Small square" className="flex flex-col gap-2">
        {MODES.map((m) => (
          <label key={m} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${s.squareMode === m ? 'border-gold-400 bg-ink-800 text-ink-50' : 'border-ink-700 text-ink-200 hover:border-ink-600'}`}>
            <input type="radio" name="square-mode" checked={s.squareMode === m} onChange={() => d({ t: 'square', mode: m })} />
            {SQUARE_LABELS[m]}
          </label>
        ))}
      </div>
      {s.squareMode === 'other' && (
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-ink-400">
            Describe the other avatar
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 300))} rows={2} spellCheck lang="en-US"
              placeholder="Example: a friendly man in his 30s with a beard and a green cap."
              className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-ink-50" />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {dict.supported && <Button onClick={dict.toggle}>{dict.listening ? 'Stop mic' : 'Mic'}</Button>}
            <Button primary disabled={busy} onClick={generate}>{busy ? 'Generating...' : 'Generate avatar'}</Button>
            {s.squareUrl && <img src={s.squareUrl} alt="Your other avatar" className="w-10 h-10 rounded-md object-cover border border-ink-600" />}
          </div>
          {dict.error && <p role="alert" className="text-sm text-warn">{dict.error}</p>}
          {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
          {!info.squareSrc && !busy && <p className="text-xs text-ink-400">Nothing generated yet, so the square shows an empty placeholder.</p>}
        </div>
      )}
    </Panel>
  );
}
