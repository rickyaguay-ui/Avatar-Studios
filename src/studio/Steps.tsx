import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormatId, HostId, IntegrationInfo } from '../types';
import { provider, APP_MODE } from '../services/provider';
import { FORMAT_ORDER } from '../services/examples';
import { AVATAR_CHOICES, currentOption, hairColorWorks, renderAvatar, setOption } from './avatar';
import { exportSpecs, pwaManifestSnippet, specsToText } from '../config/exportSpecs';
import { Frame } from './Frames';
import { Button, Img, Panel } from './Media';
import { useStudio } from './state';
import { BackdropPanel, StarterAvatarsPanel } from './StarterPanels';
import { ELEVEN_VOICES } from './voices';
import { usePlayer } from './usePlayer';
import integrations from '../demo/bundles/integrations.json';
import { svgToDataUrl, userExample } from '../live/neutral';
import { LIVE_INTEGRATIONS } from '../live/integrations';

const FORMAT_BLURB: Record<FormatId, string> = {
  android: 'Native app intro: system splash, then three onboarding cards.',
  pwa: 'Web / PWA landing page in a 16:9 browser frame with an install button.',
  tiktok: 'Vertical 9:16 short for TikTok / Reels with a configurable safe-zone overlay.',
};
export const HOSTS: Record<HostId, { name: string; blurb: string }> = {
  mesa: { name: 'Mesa', blurb: 'Woman, late 30s, calm and clear. Explains the why.' },
  reed: { name: 'Reed', blurb: 'Man, 40s, warm and direct. Explains the how.' },
};

export function useCurrent() {
  const { s, d } = useStudio();
  const live = APP_MODE === 'live';
  const exBase = provider.getExample(s.format);
  // Live mode: the script, timing and captions come from what the user wrote. Demo mode: the built-in example.
  const ex = live ? userExample(exBase, s.script) : exBase;
  const avatar = s.avatars[s.format];
  const svg = useMemo(() => renderAvatar(avatar), [avatar]);
  // Live mode shows the user's own avatar (a generated/starter portrait, else the customizer avatar), never Mesa/Reed.
  const portrait = s.portrait ?? (live ? svgToDataUrl(svg) : ex.portraits[s.host]);
  // A chosen backdrop replaces the picture in the frame only. Script, timing and export text keep using `ex`.
  const frameEx = s.backdrop ? { ...ex, backdrop: s.backdrop, video: undefined } : ex;
  return { s, d, ex, exBase, frameEx, avatar, svg, portrait };
}

/* ---------------- 1. Format ---------------- */
export function FormatStep() {
  const { s, d, ex, frameEx, svg, portrait } = useCurrent();
  const cue = ex.cues[Math.min(1, ex.cues.length - 1)];
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <Panel title="Choose a format">
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Format">
          {FORMAT_ORDER.map((f) => {
            const e = provider.getExample(f);
            return (
              <button key={f} role="radio" aria-checked={s.format === f} onClick={() => d({ t: 'format', format: f })}
                className={`text-left rounded-lg border p-3 transition-colors ${s.format === f ? 'border-gold-400 bg-ink-800' : 'border-ink-700 hover:border-ink-600'}`}>
                <div className="font-semibold text-ink-50">{e.label}</div>
                <div className="text-xs text-ink-400 mt-1">{FORMAT_BLURB[f]}</div>
              </button>
            );
          })}
        </div>
        <Button primary className="mt-4 w-full" onClick={() => d({ t: 'step', step: 'avatar' })}>Next: Avatar</Button>
      </Panel>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-start p-4 rounded-xl bg-ink-900 border border-ink-700 min-h-[400px]">
          <Frame ex={frameEx} cue={cue} avatarSvg={svg} portrait={portrait} playing={false} showSafe={false} />
        </div>
        {APP_MODE === 'live' && <BackdropPanel />}
      </div>
    </div>
  );
}

/* ---------------- 2. Avatar ---------------- */
export const FIELDS: { field: Parameters<typeof setOption>[1]; label: string; list: string[]; color?: boolean; none?: boolean }[] = [
  { field: 'head', label: 'Head / hair', list: AVATAR_CHOICES.head },
  { field: 'expression', label: 'Expression', list: AVATAR_CHOICES.expression },
  { field: 'facialHair', label: 'Facial hair', list: AVATAR_CHOICES.facialHair, none: true },
  { field: 'accessories', label: 'Accessories', list: AVATAR_CHOICES.accessories, none: true },
  { field: 'skin', label: 'Skin', list: AVATAR_CHOICES.skin, color: true },
  { field: 'clothing', label: 'Clothing', list: AVATAR_CHOICES.clothing, color: true },
  { field: 'hair', label: 'Hair color', list: AVATAR_CHOICES.hair, color: true },
];

export function AvatarStep() {
  const { s, d, ex, avatar, svg } = useCurrent();
  const [form, setForm] = useState({ hairstyle: 'short dark', clothing: 'canvas work jacket', bodyType: 'average', framing: 'bust', artStyle: 'photorealistic photo' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const live = APP_MODE === 'live';

  const generate = async () => {
    setBusy(true); setMsg(null);
    const r = await provider.generatePortrait({ ...form, host: s.host });
    setBusy(false);
    if (r.ok) d({ t: 'portrait', url: r.data.imageUrl }); else setMsg(r.message);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
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
            <div id="dicebear-preview" className="w-64 h-64 rounded-xl overflow-hidden bg-ink-800" aria-label="Avatar preview" aria-live="polite" dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="text-[11px] text-ink-400">Updates as you change the options. Seed <code className="text-gold-300">{avatar.seed}</code>. Same seed and options always render the same SVG.</div>
          </div>
        </Panel>

        <Panel title={live ? 'AI portrait builder' : 'Portraits (curated set)'}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['mesa', 'reed'] as HostId[]).map((h) => (
              <button key={h} onClick={() => { d({ t: 'host', host: h }); }} aria-pressed={s.host === h && !s.portrait}
                className={`rounded-lg overflow-hidden border text-left ${s.host === h ? 'border-gold-400' : 'border-ink-700'}`}>
                <Img src={ex.portraits[h]} alt={`${HOSTS[h].name} portrait`} className="w-full h-40 object-cover" />
                <div className="p-2 text-xs"><b className="text-ink-50">{HOSTS[h].name}</b> <span className="text-ink-400">{HOSTS[h].blurb}</span></div>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-xs text-ink-400">
            {(['hairstyle', 'clothing', 'bodyType', 'framing', 'artStyle'] as const).map((k) => (
              <label key={k} className="flex flex-col gap-1">{k}
                <input value={form[k]} disabled={!live} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-ink-50 disabled:opacity-50" />
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Button disabled={!live || busy} onClick={generate}>{busy ? 'Generating...' : 'Generate portrait'}</Button>
            <span className="text-xs text-ink-400">{live ? 'Generates the portrait on the server.' : 'Demo mode: builder is disabled and shows the curated set.'}</span>
          </div>
          {msg && <p role="alert" className="text-sm text-warn mt-2">{msg}</p>}
          {s.portrait && <div className="mt-3"><Img src={s.portrait} alt="Selected portrait" className="h-40 rounded" /></div>}
        </Panel>

        <StarterAvatarsPanel />

        <Button primary className="self-start" onClick={() => d({ t: 'step', step: 'voice' })}>Next: Voice</Button>
    </div>
  );
}

/* ---------------- 3. Voice ---------------- */
export function VoiceStep() {
  const { s, d, exBase: ex } = useCurrent();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const demo = APP_MODE === 'demo';
  // The picked ElevenLabs voice: an extra voice (voiceId) or the base voice of the selected host.
  const picked = ELEVEN_VOICES.find((v) => (s.voiceId ? v.id === s.voiceId : v.host === s.host));
  const exampleScript = ex.cues.map((c) => c.voiceover).filter(Boolean).slice(0, 2).join(' ');
  // The script box. It starts as the picked voice's announcement and resets when you pick another voice.
  const [script, setScript] = useState(picked?.intro ?? '');
  useEffect(() => { setScript(picked?.intro ?? ''); }, [picked?.id]);
  // Live mode: share the script so the Preview plays what the user wrote here.
  useEffect(() => { if (!demo) d({ t: 'script', text: script }); }, [script, demo]);

  // Dictation: the browser's built-in speech recognition (no API key). Hidden where the browser lacks it.
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : undefined;
  const rec = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const dictate = () => {
    if (!SR) return;
    if (listening) { rec.current?.stop(); return; }
    setMsg(null);
    const r = new SR();
    r.lang = 'en-US'; r.continuous = true; r.interimResults = false;
    r.onresult = (e: any) => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript;
      if (t.trim()) setScript((p) => ((p.trim() ? p.trimEnd() + ' ' : '') + t.trim()).slice(0, 500));
    };
    r.onerror = (e: any) => { setMsg(e?.error === 'not-allowed' ? 'Microphone blocked. Allow the microphone for this site and try again.' : `Dictation stopped (${e?.error ?? 'error'}).`); setListening(false); };
    r.onend = () => setListening(false);
    rec.current = r;
    try { r.start(); setListening(true); } catch { setListening(false); }
  };
  useEffect(() => () => rec.current?.stop(), []);

  const sample = async () => {
    audio?.pause(); setMsg(null);
    const text = script.trim();
    if (!demo && !text) { setMsg('Type something for the voice to say.'); return; }
    setBusy(true);
    const r = await provider.speak({ format: s.format, host: s.host, text, voiceId: s.voiceId ?? undefined });
    setBusy(false);
    if (!r.ok) { setMsg(r.message); return; }
    const a = new Audio(r.data.audioUrl);
    a.onerror = () => setMsg(`Voice clip missing: ${r.data.audioUrl}`);
    setAudio(a);
    a.play().catch(() => setMsg('Browser blocked audio. Press the button again.'));
  };
  useEffect(() => () => audio?.pause(), [audio]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Panel title="Choose the narrator">
        <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Voice">
          {(Object.keys(HOSTS) as HostId[]).map((h) => (
            <button key={h} role="radio" aria-checked={s.host === h && !s.voiceId} onClick={() => d({ t: 'host', host: h })}
              className={`text-left rounded-lg border p-4 ${s.host === h && !s.voiceId ? 'border-gold-400 bg-ink-800' : 'border-ink-700 hover:border-ink-600'}`}>
              <div className="font-display text-lg text-ink-50">{HOSTS[h].name}</div>
              <div className="text-xs text-ink-400 mt-1">{HOSTS[h].blurb}</div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="ElevenLabs voices">
        <p className="text-xs text-ink-400 mb-3">
          Shown under ElevenLabs' own names. Sarah and Chris are the voices Mesa and Reed were built from.
          {demo && ' Demo mode only has pre-recorded clips for those two. Alice and Eric need Live mode.'}
        </p>
        <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="ElevenLabs voice">
          {ELEVEN_VOICES.map((v) => {
            const on = picked?.id === v.id;
            const locked = demo && !v.host;
            return (
              <button key={v.id} role="radio" aria-checked={on} disabled={locked} data-voice={v.name}
                onClick={() => (v.host ? d({ t: 'host', host: v.host }) : d({ t: 'voice', id: v.id }))}
                className={`text-left rounded-lg border p-4 disabled:opacity-40 disabled:cursor-not-allowed ${on ? 'border-gold-400 bg-ink-800' : 'border-ink-700 hover:border-ink-600'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg text-ink-50">{v.name}</span>
                  {v.host && <span className="text-[10px] rounded-full bg-ink-700 text-gold-300 px-2 py-0.5">{HOSTS[v.host].name}'s voice</span>}
                </div>
                <div className="text-xs text-ink-200 mt-1">{v.tagline}</div>
                <div className="text-[11px] text-ink-400 mt-1">{v.gender}, {v.age}, {v.accent}{locked ? ' · Live mode only' : ''}</div>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title="Your script">
        {!demo && <p className="text-sm text-ink-200 mb-2">This box is yours. Erase the starting line and write anything you want the voice to say, or press Dictate and speak it.</p>}
        <label className="flex flex-col gap-1 text-xs text-ink-400">
          What {picked ? picked.name : 'the voice'} says
          <textarea id="voice-script" value={script} onChange={(e) => setScript(e.target.value)} maxLength={500} rows={5} disabled={demo}
            spellCheck autoCapitalize="sentences" lang="en-US"
            placeholder="Type or dictate what you want the voice to say."
            className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-ink-50 disabled:opacity-50" />
        </label>
        {!demo && (
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {SR
              ? <Button onClick={dictate}>{listening ? 'Stop dictating' : 'Dictate'}</Button>
              : <span className="text-xs text-ink-400">Dictation is not supported in this browser. Type your script instead.</span>}
            <Button onClick={() => setScript('')} disabled={!script}>Clear</Button>
            {listening && <span role="status" className="text-xs text-gold-300">Listening... speak now.</span>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Button onClick={sample} disabled={busy}>{busy ? 'Working...' : `Play ${picked ? picked.name : HOSTS[s.host].name}'s ${demo ? ex.label + ' clip' : 'script'}`}</Button>
          {!demo && <Button onClick={() => setScript(exampleScript)}>Use the example narration</Button>}
          <span className="text-xs text-ink-400">{demo ? 'Demo mode plays the pre-recorded clip. Typing a script needs Live mode.' : `${script.length} / 500 characters`}</span>
        </div>
        {!demo && <p className="text-[11px] text-ink-400 mt-2">Spelling is checked by your browser (red underline). Dictation uses your browser's speech recognition, so no key is needed. These voices are AI-generated.</p>}
        {msg && <p role="alert" className="text-sm text-warn mt-2">{msg}</p>}
      </Panel>
      <Button primary className="self-start" onClick={() => d({ t: 'step', step: 'preview' })}>Next: Preview</Button>
    </div>
  );
}

/* ---------------- 4. Preview ---------------- */
export function PreviewStep() {
  const { s, d, ex, frameEx, svg, portrait } = useCurrent();
  const p = usePlayer(ex, s.host, s.voiceId ?? undefined);
  const [safe, setSafe] = useState(true);
  // Live mode previews what the user built; with no script yet there is nothing to play.
  const noScript = APP_MODE === 'live' && !s.script.trim();
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-ink-900 border border-ink-700">
        <Frame ex={frameEx} cue={p.cue} avatarSvg={svg} portrait={portrait} playing={p.playing} showSafe={safe && ex.id === 'tiktok'}
          onStep={p.step} onCue={(i) => i >= 0 && p.seek(ex.cues[i].at)} />
        <div className="w-full max-w-xl rounded-lg bg-black/60 border border-ink-700 px-4 py-3 text-center text-sm text-ink-50 min-h-[3.5rem]" aria-live="polite" aria-label="Captions">
          {p.cue.voiceover || <span className="text-ink-400">(no narration)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => p.step(-1)} title="Previous step">Back</Button>
          {p.playing ? <Button primary onClick={p.pause}>Pause</Button> : <Button primary onClick={p.play} disabled={noScript}>Play</Button>}
          <Button onClick={() => p.step(1)} title="Next step">Step</Button>
          {ex.id === 'tiktok' && <label className="text-xs text-ink-400 ml-3 flex items-center gap-1"><input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} />Safe zone</label>}
        </div>
        <input type="range" aria-label="Timeline" min={0} max={ex.durationSec} step={0.1} value={p.t} onChange={(e) => p.seek(Number(e.target.value))} className="w-full max-w-xl accent-gold-400" />
        {p.notice && <p role="alert" className="text-sm text-warn">{p.notice}</p>}
        {noScript && (
          <p className="text-sm text-gold-300 text-center">This previews what you build. Write your script in the Voice step, then come back and press Play.
            {' '}<button className="underline" onClick={() => d({ t: 'step', step: 'voice' })}>Go to Voice</button></p>
        )}
      </div>
      <div className="flex flex-col gap-6">
      <BackdropPanel />
      <Panel title={APP_MODE === 'live' ? 'Your script' : 'Script'}>
        <ol className="flex flex-col gap-2 text-sm">
          {ex.cues.map((c, i) => (
            <li key={i}>
              <button onClick={() => p.seek(c.at)} className={`text-left w-full rounded p-2 ${i === p.cueIndex ? 'bg-ink-800 border border-gold-500' : 'border border-transparent hover:bg-ink-800'}`}>
                <span className="text-[10px] text-ink-400">{c.at}s</span>
                <div className="text-gold-300 text-xs">{c.onScreen}</div>
                <div className="text-ink-200 text-xs">{c.voiceover || '(no narration)'}</div>
              </button>
            </li>
          ))}
        </ol>
        <Button primary className="w-full mt-4" onClick={() => d({ t: 'step', step: 'export' })}>Next: Export</Button>
      </Panel>
      </div>
    </div>
  );
}

/* ---------------- 5. Export ---------------- */
export function ExportStep() {
  const { s, ex, avatar } = useCurrent();
  const [msg, setMsg] = useState<string | null>(null);
  const specs = exportSpecs(s.format);

  const bundle = [
    `Brand: ${ex.brand}`, `Format: ${ex.label}`, `Narrator: ${APP_MODE === 'live' ? (ELEVEN_VOICES.find((v) => (s.voiceId ? v.id === s.voiceId : v.host === s.host))?.name ?? 'ElevenLabs voice') : HOSTS[s.host].name}`, '',
    'Script:', ...ex.cues.map((c) => `  [${c.at}s] VO: ${c.voiceover || '(none)'}\n        On screen: ${c.onScreen}`), '',
    'Avatar (DiceBear Open Peeps):', JSON.stringify(avatar, null, 2), '',
    'Assets:', ...(APP_MODE === 'live'
      ? [`  portrait: ${s.portrait ? 'generated or starter portrait from the Avatar step' : 'customizer avatar from the Avatar step'}`, `  backdrop: ${s.backdrop ?? '(none chosen)'}`]
      : [`  portrait: ${ex.portraits[s.host]}`, `  video: ${ex.video}`, `  voice: ${ex.voices[s.host]}`]),
  ].join('\n');
  const specText = specsToText(s.format) + (s.format === 'pwa' ? `\n\nManifest snippet:\n${pwaManifestSnippet(ex.brand)}` : '');

  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setMsg(`${label} copied to clipboard.`); }
    catch { setMsg('Clipboard blocked by the browser. Select the text below and copy it manually.'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel title={`Export: ${ex.label}`}>
        <div className="flex flex-wrap gap-3">
          <Button primary onClick={() => copy('Prompt bundle', bundle)}>Copy prompt bundle</Button>
          <Button onClick={() => copy('Specs', specText)}>Copy specs</Button>
        </div>
        {msg && <p role="status" className="text-sm text-ok mt-3">{msg}</p>}
      </Panel>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Expected output by platform">
          <div className="flex flex-col gap-4">
            {specs.map((g) => (
              <div key={g.title}>
                <h3 className="text-sm font-semibold text-gold-300 mb-1">{g.title}</h3>
                <table className="w-full text-xs"><tbody>
                  {g.rows.map((r) => (
                    <tr key={r.item} className="border-t border-ink-700"><td className="py-1 pr-3 text-ink-400 align-top whitespace-nowrap">{r.item}</td><td className="py-1 text-ink-50">{r.value}{r.note && <span className="text-ink-400"> ({r.note})</span>}</td></tr>
                  ))}
                </tbody></table>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Prompt bundle preview">
          <pre className="text-[11px] text-ink-200 whitespace-pre-wrap bg-ink-950 rounded p-3 max-h-[28rem] overflow-auto">{bundle}</pre>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- 6. Integrations ---------------- */
export function IntegrationsStep() {
  const [status, setStatus] = useState<Record<string, boolean> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const demo = APP_MODE === 'demo';
  // Demo reads the Demo bundle untouched. Live uses its own cards (Cloudflare FLUX images + ElevenLabs voice).
  const cards: { id: string; name: string; powers: string; how: string; envVar: string }[] = APP_MODE === 'demo'
    ? (integrations as IntegrationInfo[])
    : LIVE_INTEGRATIONS.map((c) => ({ id: c.id, name: c.name, powers: c.powers, how: c.how, envVar: c.envVars }));
  useEffect(() => {
    if (demo) return;
    provider.getIntegrationStatus().then((r) => (r.ok ? setStatus(r.data) : setErr(r.message)));
  }, [demo]);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {demo && <p className="rounded-lg border border-gold-700 bg-ink-800 px-4 py-2 text-sm text-gold-300">Demo mode: integrations are shown for reference and are disabled. This site holds no keys and makes no live calls.</p>}
      {cards.map((i) => {
        const configured = status?.[i.id];
        return (
          <Panel key={i.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-ink-50">{i.name}</h3>
                <p className="text-sm text-ink-200 mt-1"><b>Powers:</b> {i.powers}</p>
                <p className="text-sm text-ink-400 mt-1"><b>How:</b> {i.how}</p>
                {!demo && <p className="text-xs text-ink-400 mt-2">Stored on the server as <code className="text-gold-300">{i.envVar}</code>. This app never accepts a key.</p>}
              </div>
              <span className={`text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap ${demo ? 'bg-ink-700 text-ink-400' : configured ? 'bg-ok/20 text-ok' : 'bg-warn/20 text-warn'}`}>
                {demo ? 'Demo mode' : status === null ? (err ? 'Unknown' : 'Checking...') : configured ? 'Configured' : 'Not configured'}
              </span>
            </div>
          </Panel>
        );
      })}
      {err && <p role="alert" className="text-sm text-warn">{err}</p>}
    </div>
  );
}
