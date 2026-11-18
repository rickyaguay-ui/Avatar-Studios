import { useState } from 'react';
import { provider } from '../services/provider';
import { Button, Img, Panel } from '../studio/Media';
import { useStudio } from '../studio/state';
import { STARTER_BACKDROPS } from '../studio/starterAssets';
import { useDictation } from './dictation';
import { ImageEditor } from './ImageEditor';
import { generateFirst, type ImageApi } from './imageActions';
import { newSeed, recordFromText } from './promptRecord';
import { SCENE_CHIPS, cropToWidescreen } from './scene';

/** Live-mode backdrop panel: describe a scene (typed or spoken), generate it, then edit it with the prompt fields,
 *  the Edit button and the refiners. The preloaded backdrops stay below as a fallback. Used in Format, Avatar and Preview. */
export function LiveBackdropPanel() {
  const { s, d } = useStudio();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const dict = useDictation((t) => setText((p) => ((p.trim() ? p.trimEnd() + ' ' : '') + t).slice(0, 400)));
  const ai = !!s.backdropPrompt;

  const generate = async () => {
    const scene = text.trim();
    if (!scene) { setMsg('Describe a scene first, or pick one of the quick scenes.'); return; }
    if (!provider.generateImage) { setMsg('Scene generation is not available here.'); return; }
    setBusy(true); setMsg(null);
    const r = await generateFirst(provider as unknown as ImageApi, 'scene', recordFromText('scene', scene, newSeed()), cropToWidescreen);
    setBusy(false);
    if (!r.ok) { setMsg(r.message); return; }
    d({ t: 'imgGen', kind: 'scene', version: { ...r.version, id: 0 } });
  };

  return (
    <Panel title="Backdrop / scene">
      <label className="flex flex-col gap-1 text-sm text-ink-50 font-semibold">
        Describe your scene
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 400))} rows={3} spellCheck lang="en-US" autoCapitalize="sentences"
          placeholder="Where is your avatar? Example: a quiet beekeeping yard at golden hour with wildflowers."
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-ink-50 font-normal" />
      </label>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {dict.supported && <Button onClick={dict.toggle}>{dict.listening ? 'Stop mic' : 'Mic: speak your scene'}</Button>}
        <Button onClick={() => setText('')} disabled={!text}>Clear</Button>
        {dict.listening && <span role="status" className="text-xs text-gold-300">Listening... speak now.</span>}
        <span className="text-xs text-ink-400">{text.length} / 400</span>
      </div>
      {dict.error && <p role="alert" className="text-sm text-warn mt-1">{dict.error}</p>}
      <div className="flex flex-wrap gap-1.5 mt-3" role="group" aria-label="Quick scenes">
        {SCENE_CHIPS.map((c) => (
          <button key={c.label} onClick={() => setText(c.text)}
            className="px-2.5 py-1 rounded-full text-xs border border-ink-600 text-ink-200 hover:bg-ink-800 hover:border-gold-500">{c.label}</button>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Button primary disabled={busy} onClick={generate}>{busy ? 'Generating...' : s.images.scene ? 'Generate a new scene' : 'Generate scene'}</Button>
        <span className="text-xs text-ink-400">Widescreen, takes a few seconds.</span>
      </div>
      {msg && <p role="alert" className="text-sm text-warn mt-2">{msg}</p>}

      {s.images.scene && <div className="mt-4"><ImageEditor kind="scene" /></div>}
      {ai && s.backdrop && (
        <p className="text-xs text-gold-300 mt-2">AI scene in use: {s.backdropPrompt}</p>
      )}
      {ai && s.backdrop && <p className="text-xs text-ink-400 mt-1">Name, save or share it in the Export step.</p>}

      <details className="mt-4" open={!ai}>
        <summary className="text-xs text-ink-400 cursor-pointer">Preloaded backdrops (fallback)</summary>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2 mt-2" role="group" aria-label="Preloaded backdrops">
          {STARTER_BACKDROPS.map((b) => {
            const on = !ai && s.backdrop === b.url;
            return (
              <button key={b.id} onClick={() => d({ t: 'backdrop', url: b.url })} aria-pressed={on} title={b.name}
                className={`rounded-md overflow-hidden border ${on ? 'border-gold-400' : 'border-ink-700 hover:border-ink-500'}`}>
                <Img src={b.url} alt={b.name} className="w-full aspect-video object-cover bg-ink-800" />
                <div className="text-[10px] text-ink-200 py-1 text-center">{b.name}</div>
              </button>
            );
          })}
        </div>
        {s.backdrop && !ai && <Button className="mt-3" onClick={() => d({ t: 'backdrop', url: null })}>Use the default backdrop</Button>}
      </details>
    </Panel>
  );
}
