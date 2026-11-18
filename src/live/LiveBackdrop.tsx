import { useState } from 'react';
import { provider } from '../services/provider';
import { Button, Img, Panel } from '../studio/Media';
import { useStudio } from '../studio/state';
import { STARTER_BACKDROPS } from '../studio/starterAssets';
import { useDictation } from './dictation';
import { SCENE_CHIPS, buildScenePrompt, cropToWidescreen } from './scene';

/** Live-mode backdrop panel: describe a scene (typed or spoken) and generate it with Cloudflare FLUX.
 *  The preloaded backdrops stay below as a fallback. Used in the Format, Avatar and Preview steps. */
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
    if (!provider.generateBackdrop) { setMsg('Scene generation is not available here.'); return; }
    setBusy(true); setMsg(null);
    const r = await provider.generateBackdrop(buildScenePrompt(scene));
    if (!r.ok) { setBusy(false); setMsg(r.message); return; }
    try {
      const wide = await cropToWidescreen(r.data.imageUrl);
      d({ t: 'backdrop', url: wide, prompt: scene });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not prepare the scene');
    }
    setBusy(false);
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
        <Button primary disabled={busy} onClick={generate}>{busy ? 'Generating...' : 'Generate scene'}</Button>
        <span className="text-xs text-ink-400">Widescreen, takes a few seconds.</span>
      </div>
      {msg && <p role="alert" className="text-sm text-warn mt-2">{msg}</p>}

      {ai && s.backdrop && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-gold-300">AI scene in use: {s.backdropPrompt}</p>
          <img src={s.backdrop} alt="Your generated scene" className="w-full rounded-md border border-ink-700 aspect-video object-cover" />
          <div className="flex flex-wrap gap-2">
            <a href={s.backdrop} download="avatar-studios-scene.jpg" className="px-4 py-2 rounded-md text-sm font-semibold bg-ink-700 text-ink-50 hover:bg-ink-600 border border-ink-600">Download scene</a>
            <Button onClick={() => d({ t: 'backdrop', url: null })}>Remove AI scene</Button>
          </div>
        </div>
      )}

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
