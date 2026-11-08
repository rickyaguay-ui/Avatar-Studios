import { useEffect, useRef, useState } from 'react';
import { Button, Img } from './Media';
import { useStudio } from './state';
import steps from '../demo/bundles/onboarding.json';
import type { HostId, OnboardingStep } from '../types';

const data = steps as unknown as OnboardingStep[];
const HOST_NAME: Record<HostId, string> = { mesa: 'Mesa', reed: 'Reed' };
const PORTRAIT: Record<HostId, string> = { mesa: '/demo/portraits/mesa-tiktok.png', reed: '/demo/portraits/reed-tiktok.png' };

/** One host panel. Shows the portrait; while its host is speaking it gets a slow zoom and a pulsing gold ring.
 *  If a lip-sync clip exists for the active line it plays on top (muted; audio comes from the narration clip). */
function HostPanel({ host, active, talkingHead, speaking }: { host: HostId; active: boolean; talkingHead?: string; speaking: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(false); }, [talkingHead]);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    if (active && speaking) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
  }, [active, speaking, ok]);
  return (
    <div className={`relative flex-1 rounded-xl overflow-hidden border-2 transition-all ${active ? 'border-gold-400' : 'border-ink-700 opacity-60'}`} style={{ aspectRatio: '9 / 14' }}>
      <Img src={PORTRAIT[host]} alt={`${HOST_NAME[host]} portrait`}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out motion-reduce:transition-none ${active && speaking ? 'scale-110' : 'scale-100'}`} />
      {active && talkingHead && (
        <video ref={ref} src={talkingHead} muted playsInline preload="auto" onLoadedData={() => setOk(true)}
          className={`absolute inset-0 w-full h-full object-cover ${ok ? '' : 'hidden'}`} />
      )}
      {active && speaking && (
        <div aria-hidden="true" className="absolute inset-0 rounded-xl ring-2 ring-inset ring-gold-400/70 animate-pulse motion-reduce:animate-none pointer-events-none" />
      )}
      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center text-xs py-1 text-ink-50">
        {HOST_NAME[host]}{active && speaking && <span className="text-gold-400"> · speaking</span>}
      </div>
    </div>
  );
}

/** Walkthrough: Mesa and Reed stand side by side and take turns over six lines. */
export function Onboarding() {
  const { d } = useStudio();
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const step = data[i];

  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => { audio.current?.pause(); audio.current = null; setMsg(null); setSpeaking(false); }, [i]);

  const play = () => {
    audio.current?.pause();
    const a = new Audio(step.clip);
    a.onerror = () => { setMsg(`Narration clip missing: ${step.clip}. Read the captions below.`); setSpeaking(false); };
    a.onended = () => setSpeaking(false);
    audio.current = a;
    a.play().then(() => setSpeaking(true)).catch(() => setMsg('Browser blocked audio. Press play again.'));
  };
  const close = () => { audio.current?.pause(); d({ t: 'walkthrough', open: false }); };

  return (
    <div role="dialog" aria-modal="true" aria-label="Walkthrough" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-gold-700 bg-ink-900 p-6">
        <div className="flex items-center justify-between text-xs text-ink-400 mb-3">
          <span>Walkthrough {i + 1} of {data.length}</span>
          <button onClick={close} className="underline hover:text-ink-50">Skip</button>
        </div>
        <div className="flex gap-4 mb-4 max-w-sm mx-auto">
          <HostPanel host="mesa" active={step.host === 'mesa'} talkingHead={step.talkingHead} speaking={speaking} />
          <HostPanel host="reed" active={step.host === 'reed'} talkingHead={step.talkingHead} speaking={speaking} />
        </div>
        <h2 className="font-display text-2xl text-gold-400">{step.title}</h2>
        <p className="text-xs text-ink-400 mb-3">{HOST_NAME[step.host]} speaking</p>
        <blockquote className="text-ink-50 text-base leading-relaxed border-l-2 border-gold-500 pl-3" aria-live="polite">{step.text}</blockquote>
        <ul className="mt-4 flex flex-col gap-1.5">
          {step.covers.map((c) => (
            <li key={c.step} className="text-sm"><b className="text-gold-300">{c.step}</b> <span className="text-ink-200">{c.what}</span></li>
          ))}
        </ul>
        {msg && <p role="alert" className="text-sm text-warn mt-3">{msg}</p>}
        <div className="flex items-center justify-between mt-6">
          <Button onClick={play}>Play narration</Button>
          <div className="flex gap-2">
            <Button disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
            {i < data.length - 1 ? <Button primary onClick={() => setI(i + 1)}>Next</Button> : <Button primary onClick={close}>Start</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
