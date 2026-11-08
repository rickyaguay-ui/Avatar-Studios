import { useRef, useEffect, useState } from 'react';
import type { Cue, FormatExample } from '../types';
import { SAFE_ZONE } from '../config/safeZones';
import { Img, Pending } from './Media';

export interface FrameProps {
  ex: FormatExample; cue: Cue; avatarSvg: string; portrait: string; playing: boolean; showSafe: boolean;
}

/** Still backdrop with slow zoom. If an optional clip mp4 exists and loads, it plays on top. */
function Backdrop({ ex, playing }: { ex: FormatExample; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [clipOk, setClipOk] = useState(false);
  const [stillBad, setStillBad] = useState(false);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    if (playing) v.play().catch(() => {}); else v.pause();
  }, [playing, clipOk]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      {stillBad
        ? <Pending path={ex.backdrop} className="absolute inset-0" />
        : <img src={ex.backdrop} alt="" onError={() => setStillBad(true)} className={`absolute inset-0 w-full h-full object-cover ${playing ? 'backdrop-zoom' : ''}`} />}
      {ex.video && (
        <video ref={ref} src={ex.video} muted loop playsInline preload="auto" onLoadedData={() => setClipOk(true)}
          className={`absolute inset-0 w-full h-full object-cover ${clipOk ? '' : 'hidden'}`} />
      )}
    </div>
  );
}

const Avatar = ({ svg, size }: { svg: string; size: number }) => (
  <div aria-label="Brand avatar" style={{ width: size, height: size }} className="rounded-full overflow-hidden bg-ink-700 border-2 border-gold-400 shrink-0"
    dangerouslySetInnerHTML={{ __html: svg }} />
);

/* ---------- TikTok / Reels 9:16 ---------- */
export function TiktokFrame({ ex, cue, avatarSvg, portrait, playing, showSafe }: FrameProps) {
  const z = SAFE_ZONE;
  return (
    <div className="relative bg-black rounded-[28px] border-4 border-ink-600 overflow-hidden" style={{ aspectRatio: '9 / 16', width: 270 }}>
      <Backdrop ex={ex} playing={playing} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      <div className="absolute top-2 inset-x-0 flex justify-center gap-4 text-[10px] text-white/80 font-semibold"><span>Following</span><span className="border-b border-white">For You</span></div>
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-3 text-[9px] text-white/80">
        <Avatar svg={avatarSvg} size={34} /><span>Like</span><span>Reply</span><span>Share</span>
      </div>
      <div className="absolute left-2 bottom-3 right-14 text-[10px] text-white/90"><b>@example_handle</b><br />{ex.brand}</div>
      <div className="absolute flex items-center justify-center text-center" style={{ top: `${z.top * 100 + 25}%`, left: `${z.left * 100}%`, right: `${z.right * 100}%` }}>
        <span key={cue.onScreen} className="bg-black/60 text-gold-300 font-display font-bold text-[17px] leading-tight px-2 py-1 rounded">{cue.onScreen}</span>
      </div>
      <div className="absolute left-2 bottom-12 w-12 h-12 rounded-md overflow-hidden border border-gold-400"><Img src={portrait} alt="Host portrait" className="w-full h-full object-cover" /></div>
      {showSafe && (
        <div className="absolute border border-dashed border-gold-400/80 pointer-events-none" aria-label="Safe zone overlay"
          style={{ top: `${z.top * 100}%`, bottom: `${z.bottom * 100}%`, left: `${z.left * 100}%`, right: `${z.right * 100}%` }} />
      )}
    </div>
  );
}

/* ---------- Android native app ---------- */
export function AndroidFrame({ ex, cue, avatarSvg, portrait, playing }: FrameProps) {
  const screen = cue.screen ?? 'splash';
  const lines = cue.onScreen.split('|').map((s) => s.trim());
  return (
    <div className="relative rounded-[32px] border-4 border-ink-600 bg-ink-900 overflow-hidden flex flex-col" style={{ aspectRatio: '9 / 19.5', width: 270 }}>
      <div className="flex justify-between px-4 py-1.5 text-[9px] text-ink-200 bg-black"><span>9:41</span><span>5G  84%</span></div>
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        <Backdrop ex={ex} playing={playing} /><div className="absolute inset-0 bg-ink-950/70" />
        <div className="relative z-10 w-full flex items-center justify-center">
        {screen === 'splash' ? (
          <div className="flex flex-col items-center gap-3"><Avatar svg={avatarSvg} size={120} /><span className="text-xs text-ink-200">{lines[0]}</span></div>
        ) : screen === 'end' ? (
          <div className="flex flex-col items-center gap-4 text-center"><div className="font-display text-lg text-gold-300">Water. Power. Heat.</div>
            <button className="bg-gold-400 text-ink-950 font-bold rounded-full px-6 py-2 text-sm">{lines[0]}</button></div>
        ) : (
          <div key={screen} className="w-full rounded-2xl bg-ink-800 border border-ink-600 p-4 flex flex-col items-center gap-3 text-center">
            <div className="w-24 h-24 rounded-xl overflow-hidden"><Img src={portrait} alt="Host portrait" className="w-full h-full object-cover" /></div>
            <div className="font-display text-xl text-gold-300">{lines[0]}</div>
            {lines.slice(1).map((l) => <div key={l} className="text-sm text-ink-50 bg-ink-700 rounded px-2 py-0.5">{l}</div>)}
            <div className="flex gap-1.5 mt-1">{['card1', 'card2', 'card3'].map((c) => <span key={c} className={`w-2 h-2 rounded-full ${c === screen ? 'bg-gold-400' : 'bg-ink-600'}`} />)}</div>
          </div>
        )}
        </div>
      </div>
      <div className="flex justify-center gap-8 py-2 bg-black text-ink-400 text-xs" aria-hidden><span>&lt;</span><span>o</span><span>=</span></div>
      <span className="sr-only">{ex.label}</span>
    </div>
  );
}

/* ---------- PWA web 16:9 browser ---------- */
export function PwaFrame({ ex, cue, avatarSvg, portrait, playing }: FrameProps) {
  const x = ex.extra as { headline: string; subhead: string; cards: { title: string; text: string }[]; caveat: string };
  const idx = ex.cues.indexOf(cue);
  return (
    <div className="rounded-xl border-4 border-ink-600 bg-ink-900 overflow-hidden" style={{ width: 560, maxWidth: '100%' }}>
      <div className="flex items-center gap-2 bg-ink-800 px-3 py-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-ink-600" /><span className="w-2.5 h-2.5 rounded-full bg-ink-600" /><span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
        <div className="flex-1 bg-ink-950 rounded text-[10px] text-ink-400 px-2 py-0.5 ml-2">https://rbhomesteading.example</div>
      </div>
      <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
        <Backdrop ex={ex} playing={playing} />
        <div className="absolute inset-0 bg-ink-950/60" />
        <div className="relative z-10 h-full flex items-center gap-4 px-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2"><Avatar svg={avatarSvg} size={28} /><span className="text-[11px] text-gold-300 font-semibold">{ex.brand}</span></div>
            <h3 className="font-display text-xl leading-tight text-ink-50">{x.headline}</h3>
            <p className="text-[11px] text-ink-200 mt-1">{x.subhead}</p>
            <div className="mt-3 inline-block bg-gold-400 text-ink-950 text-[11px] font-bold rounded px-3 py-1">Install the app</div>
          </div>
          <div className="w-24 h-32 rounded-lg overflow-hidden border border-gold-400 shrink-0"><Img src={portrait} alt="Host portrait" className="w-full h-full object-cover" /></div>
        </div>
        <div className="absolute bottom-2 inset-x-0 z-10 text-center"><span key={idx} className="inline-block bg-black/70 text-gold-300 text-[11px] px-2 py-0.5 rounded">{cue.onScreen}</span></div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 bg-ink-900">
        {x.cards.map((c) => (
          <div key={c.title} className="rounded-md bg-ink-800 border border-ink-700 p-2"><div className="text-[11px] font-semibold text-gold-300">{c.title}</div><div className="text-[9px] text-ink-200 leading-snug">{c.text}</div></div>
        ))}
      </div>
      <div className="px-3 pb-2 text-[9px] text-ink-400">{x.caveat}</div>
    </div>
  );
}

export function Frame(props: FrameProps) {
  if (props.ex.id === 'android') return <AndroidFrame {...props} />;
  if (props.ex.id === 'pwa') return <PwaFrame {...props} />;
  return <TiktokFrame {...props} />;
}
