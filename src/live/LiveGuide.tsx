import { useEffect, useState } from 'react';
import { Button } from '../studio/Media';
import { STEPS, useStudio } from '../studio/state';
import { GUIDE, WELCOME, type GuideEntry } from './guide';

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

function useReadAloud() {
  const [speaking, setSpeaking] = useState(false);
  const stop = () => { if (canSpeak) window.speechSynthesis.cancel(); setSpeaking(false); };
  const say = (text: string) => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  useEffect(() => stop, []);
  return { speaking, say, stop };
}

/** Live-mode walkthrough: one text card per section, with optional Read aloud (device voice, no API). */
export function LiveWalkthrough() {
  const { d } = useStudio();
  const slides: GuideEntry[] = [WELCOME, ...STEPS.map((st) => GUIDE[st.id])];
  const [i, setI] = useState(0);
  const { speaking, say, stop } = useReadAloud();
  const slide = slides[i];
  useEffect(() => { stop(); }, [i]);
  const close = () => { stop(); d({ t: 'walkthrough', open: false }); };
  return (
    <div role="dialog" aria-modal="true" aria-label="Walkthrough" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-xl rounded-2xl border border-gold-700 bg-ink-900 p-6">
        <div className="flex items-center justify-between text-xs text-ink-400 mb-3">
          <span>Walkthrough {i + 1} of {slides.length}</span>
          <button onClick={close} className="underline hover:text-ink-50">Skip</button>
        </div>
        <h2 className="font-display text-2xl text-gold-400">{slide.title}</h2>
        <p className="text-ink-50 text-base leading-relaxed mt-3" aria-live="polite">{slide.say}</p>
        <ul className="mt-4 flex flex-col gap-1.5 list-disc pl-5 text-sm text-ink-200">
          {slide.can.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="flex items-center justify-between mt-6">
          {canSpeak
            ? <Button onClick={() => (speaking ? stop() : say(slide.say))}>{speaking ? 'Stop' : 'Read aloud'}</Button>
            : <span className="text-xs text-ink-400">Read aloud is not available in this browser.</span>}
          <div className="flex gap-2">
            <Button disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
            {i < slides.length - 1 ? <Button primary onClick={() => setI(i + 1)}>Next</Button> : <Button primary onClick={close}>Start</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Always-available "Help me set this up" button (top right) that drops a text block for the current screen. */
export function HelpButton() {
  const { s, d } = useStudio();
  const [open, setOpen] = useState(false);
  const { speaking, say, stop } = useReadAloud();
  const g = GUIDE[s.step];
  useEffect(() => { stop(); }, [s.step, open]);
  return (
    <div>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="help-panel"
        className="px-3 py-1.5 rounded-md text-sm font-semibold bg-gold-400 text-ink-950 hover:bg-gold-300">Help me set this up</button>
      {open && (
        <div id="help-panel" role="region" aria-label="Help for this screen"
          className="absolute top-full mt-1 right-4 left-4 sm:left-auto sm:w-[24rem] z-40 rounded-xl border border-gold-700 bg-ink-900 p-4 shadow-xl max-h-[80vh] overflow-auto">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg text-gold-400">{g.title}</h2>
            <button onClick={() => setOpen(false)} aria-label="Close help" className="text-ink-400 hover:text-ink-50 text-sm">Close</button>
          </div>
          <p className="text-sm text-ink-50 mt-2 leading-relaxed">{g.say}</p>
          <h3 className="text-xs font-semibold text-gold-300 mt-3 mb-1">What you can do here</h3>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-ink-200">
            {g.can.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <div className="flex gap-2 mt-4">
            {canSpeak && <Button onClick={() => (speaking ? stop() : say(g.say))}>{speaking ? 'Stop' : 'Read aloud'}</Button>}
            <Button onClick={() => { setOpen(false); d({ t: 'walkthrough', open: true }); }}>Replay walkthrough</Button>
          </div>
        </div>
      )}
    </div>
  );
}
