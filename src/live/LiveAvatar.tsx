import { useState } from 'react';
import type { HostId } from '../types';
import { provider } from '../services/provider';
import { currentOption, hairColorWorks, setOption } from '../studio/avatar';
import { Button, Img, Panel } from '../studio/Media';
import { StarterAvatarsPanel } from '../studio/StarterPanels';
import { LiveBackdropPanel } from './LiveBackdrop';
import { SquarePicker } from './NarratorPanel';
import { FIELDS, HOSTS, useCurrent } from '../studio/Steps';
import { useDictation } from './dictation';
import { BLANKS, DEFAULT_FORM, PRESETS, buildPortraitPrompt, type BlankDef, type PortraitForm } from './portraitOptions';

const OTHER = '__other__';

/** One blank in the template: pick a ready-made option or choose "Other" and type your own. */
function Blank({ def, value, onChange }: { def: BlankDef; value: string; onChange: (v: string) => void }) {
  const custom = !def.options.includes(value);
  return (
    <label className="text-xs text-ink-400 flex flex-col gap-1">
      {def.label}
      <select value={custom ? OTHER : value} onChange={(e) => onChange(e.target.value === OTHER ? '' : e.target.value)}
        className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-sm text-ink-50">
        {def.options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value={OTHER}>Other (type your own)...</option>
      </select>
      {custom && (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Your own ${def.label.toLowerCase()}`} autoFocus
          className="bg-ink-800 border border-gold-700 rounded px-2 py-1.5 text-sm text-ink-50" />
      )}
    </label>
  );
}

/** Live-mode Avatar step: wide layout. Customizer + fill-in-the-blank portrait builder on top,
 *  prompt/free text/mic and the result below, then starter avatars and backdrops. */
export function LiveAvatarStep() {
  const { s, d, exBase, avatar, svg } = useCurrent();
  const [form, setForm] = useState<PortraitForm>(DEFAULT_FORM);
  const [extra, setExtra] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const dict = useDictation((t) => setExtra((p) => ((p.trim() ? p.trimEnd() + ' ' : '') + t).slice(0, 600)));
  const prompt = buildPortraitPrompt(form, extra, onlyMine);
  const set = (k: keyof PortraitForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const bg = s.backdrop ? { backgroundImage: `url(${s.backdrop})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;

  const generate = async () => {
    if (onlyMine && !extra.trim()) { setMsg('Type or dictate your description first.'); return; }
    setBusy(true); setMsg(null);
    const r = await provider.generatePortrait({
      host: s.host, hairstyle: form.hair, clothing: form.wardrobe, bodyType: form.build, framing: form.framing, artStyle: form.style, prompt,
    });
    setBusy(false);
    if (r.ok) d({ t: 'portrait', url: r.data.imageUrl }); else setMsg(r.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Panel title="Avatar customizer (DiceBear Open Peeps)">
          <div className="grid sm:grid-cols-2 gap-3">
            {FIELDS.map((f) => {
              const cur = currentOption(avatar.options, f.field);
              const values = f.none ? ['none', ...f.list] : f.list;
              const hairOff = f.field === 'hair' && !hairColorWorks(currentOption(avatar.options, 'head'));
              return (
                <label key={f.field} className={`text-xs text-ink-400 flex flex-col gap-1 ${hairOff ? 'opacity-50' : ''}`}>
                  {f.label}{hairOff && ' (this head style ignores hair color)'}
                  {f.color ? (
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label={f.label}>
                      {values.map((v) => (
                        <button key={v} aria-label={`${f.label} #${v}`} aria-pressed={cur === v}
                          onClick={() => d({ t: 'avatar', config: { ...avatar, options: setOption(avatar.options, f.field, v) } })}
                          style={{ background: `#${v}` }} className={`w-6 h-6 rounded-full border-2 ${cur === v ? 'border-gold-400' : 'border-ink-600'}`} />
                      ))}
                    </div>
                  ) : (
                    <select value={cur || values[0]} onChange={(e) => d({ t: 'avatar', config: { ...avatar, options: setOption(avatar.options, f.field, e.target.value) } })}
                      className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-sm text-ink-50">
                      {values.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  )}
                </label>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col items-center gap-2">
            <div id="dicebear-preview" className="w-64 h-64 rounded-xl overflow-hidden bg-ink-800" style={bg} aria-label="Avatar preview" aria-live="polite" dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="text-[11px] text-ink-400">Updates as you change the options. Pick a backdrop below to change the scenery behind it.</div>
          </div>
        </Panel>

        <Panel title="AI portrait builder">
          <label className="flex flex-col gap-1 text-sm text-ink-50 font-semibold">
            Describe your portrait
            <textarea value={extra} onChange={(e) => setExtra(e.target.value.slice(0, 600))} rows={4} spellCheck lang="en-US" autoCapitalize="sentences"
              placeholder="Describe the person in your own words, or speak with the mic. Example: a kind farmer in her 50s with wire-rimmed glasses and a red scarf."
              className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-ink-50 font-normal" />
          </label>
          <div className="flex flex-wrap items-center gap-3 mt-2 mb-1">
            {dict.supported && <Button onClick={dict.toggle}>{dict.listening ? 'Stop mic' : 'Mic: speak your description'}</Button>}
            <Button onClick={() => setExtra('')} disabled={!extra}>Clear</Button>
            {dict.listening && <span role="status" className="text-xs text-gold-300">Listening... speak now.</span>}
            <span className="text-xs text-ink-400">{extra.length} / 600</span>
          </div>
          {dict.error && <p role="alert" className="text-sm text-warn mt-1">{dict.error}</p>}
          <p className="text-xs text-ink-400 mt-4 mb-3">The picks below shape the prompt along with your words. Mesa and Reed are example presets: click one to fill every pick, then change anything.</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['mesa', 'reed'] as HostId[]).map((h) => (
              <button key={h} onClick={() => { d({ t: 'host', host: h }); setForm(PRESETS[h]); }}
                className="rounded-lg overflow-hidden border border-ink-700 hover:border-gold-400 text-left">
                <Img src={exBase.portraits[h]} alt={`${HOSTS[h].name} example portrait`} className="w-full h-32 object-cover" />
                <div className="p-2 text-xs"><b className="text-ink-50">Example: {HOSTS[h].name}</b> <span className="text-ink-400">{HOSTS[h].blurb}</span></div>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {BLANKS.map((b) => <Blank key={b.key} def={b} value={form[b.key]} onChange={set(b.key)} />)}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Panel title="What will be generated">
          <p className="text-sm text-ink-50 bg-ink-800 border border-ink-700 rounded p-3 leading-relaxed" aria-live="polite">{prompt}</p>
          <label className="flex items-center gap-2 text-xs text-ink-200 mt-3">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            Use only my words (ignore the picks)
          </label>
          <div className="flex items-center gap-3 mt-4">
            <Button primary disabled={busy} onClick={generate}>{busy ? 'Generating...' : 'Generate portrait'}</Button>
            <span className="text-xs text-ink-400">Takes a few seconds.</span>
          </div>
          {msg && <p role="alert" className="text-sm text-warn mt-2">{msg}</p>}
        </Panel>

        <Panel title="Your portrait">
          {s.portrait ? (
            <div className="flex flex-col items-start gap-3">
              <Img src={s.portrait} alt="Your generated portrait" className="w-full max-w-sm rounded-lg border border-ink-700" />
              <Button onClick={() => d({ t: 'portrait', url: null })}>Remove portrait (use the customizer avatar)</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2 min-h-[16rem] rounded-lg border border-dashed border-ink-600 text-ink-400 text-sm p-6">
              <span>No portrait yet.</span>
              <span className="text-xs">Fill in the blanks and press Generate portrait, or pick a starter avatar below. Until then the Preview uses your customizer avatar.</span>
            </div>
          )}
        </Panel>
      </div>

      <SquarePicker />

      <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-start">
        <StarterAvatarsPanel resetLabel="Remove this avatar (use the customizer avatar)" />
        <LiveBackdropPanel />
      </div>

      <Button primary className="self-start" onClick={() => d({ t: 'step', step: 'voice' })}>Next: Voice</Button>
    </div>
  );
}
