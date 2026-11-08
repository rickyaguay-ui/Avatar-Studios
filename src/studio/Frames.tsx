import { useRef, useEffect, useState, type MouseEvent } from 'react';
import type { Cue, FormatExample } from '../types';
import { SAFE_ZONE } from '../config/safeZones';
import { Img, Pending } from './Media';

export interface FrameProps {
  ex: FormatExample; cue: Cue; avatarSvg: string; portrait: string; playing: boolean; showSafe: boolean;
  onStep?: (dir: 1 | -1) => void;   // tap navigation (Android)
  onCue?: (index: number) => void;  // jump to a cue (Android system chips)
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
  <div aria-label="Brand avatar" style={{ width: size, height: size }} className="rounded-full overflow-hidden bg-ink-50 border-2 border-gold-400 shrink-0 [&>svg]:w-full [&>svg]:h-full"
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

/* ---------- R&B's Homesteading logo (original mark: earth-berm arch + sun over the monogram) ---------- */
export function RbLogo({ size = 160, slam = false }: { size?: number; slam?: boolean }) {
  return (
    <div className={`relative ${slam ? 'impact-shake' : ''}`} style={{ width: size, height: size * 0.72 }} role="img" aria-label="R&B's Homesteading logo">
      {slam && <span aria-hidden="true" className="dust-ring absolute inset-x-[10%] bottom-[18%] h-[22%] rounded-[50%] border-2 border-gold-300/70" />}
      <svg viewBox="0 0 200 144" className={`relative w-full h-full ${slam ? 'logo-slam' : ''}`} aria-hidden="true">
        <circle cx="100" cy="34" r="11" fill="#d4a948" />
        <path d="M16 108 Q100 -4 184 108" fill="none" stroke="#d4a948" strokeWidth="7" strokeLinecap="round" />
        <path d="M8 112 H192" stroke="#e8cf86" strokeWidth="3" strokeLinecap="round" />
        <text x="100" y="100" textAnchor="middle" fontFamily="Outfit, system-ui, sans-serif" fontWeight="800" fontSize="50" fill="#f4f3ef">R&amp;B</text>
        <text x="100" y="136" textAnchor="middle" fontFamily="Outfit, system-ui, sans-serif" fontWeight="600" fontSize="15" letterSpacing="5" fill="#e8cf86">HOMESTEADING</text>
      </svg>
    </div>
  );
}

/* ---------- Android native app 9:19.5 ----------
   Opens on the logo slam, then runs like a vertical short: one system per caption.
   Tap the left third of the screen to go back, anywhere else to go forward. The six chips jump straight to a system. */
export function AndroidFrame({ ex, cue, avatarSvg, portrait, playing, onStep, onCue }: FrameProps) {
  const x = ex.extra as { cards: { title: string; text: string }[] };
  const idx = ex.cues.indexOf(cue);
  const sysIdx = (title: string) => ex.cues.findIndex((c) => c.onScreen.endsWith(title));
  const active = x.cards.find((c) => cue.onScreen.endsWith(c.title));
  const logo = cue.screen === 'logo';
  const tap = (e: MouseEvent<HTMLDivElement>) => {
    if (!onStep) return;
    const r = e.currentTarget.getBoundingClientRect();
    onStep(e.clientX - r.left < r.width / 3 ? -1 : 1);
  };
  return (
    <div className="relative rounded-[32px] border-4 border-ink-600 bg-black overflow-hidden flex flex-col" style={{ aspectRatio: '9 / 19.5', width: 270 }}>
      <div className="flex justify-between px-4 py-1.5 text-[9px] text-ink-200 bg-black"><span>9:41</span><span>5G  84%</span></div>
      <div className="flex-1 relative overflow-hidden">
        <Backdrop ex={ex} playing={playing} />
        <div className={`absolute inset-0 transition-colors duration-500 ${logo ? 'bg-ink-950/85' : 'bg-gradient-to-b from-black/60 via-black/10 to-black/85'}`} />
        <div className="absolute top-1.5 inset-x-2 z-10 flex gap-1" aria-hidden="true">
          {ex.cues.map((c, i) => <span key={i} className={`h-0.5 flex-1 rounded ${i <= idx ? 'bg-gold-400' : 'bg-white/25'}`} />)}
        </div>
        <div className="absolute top-4 inset-x-2 z-20 flex items-center gap-2">
          <Avatar svg={avatarSvg} size={26} />
          <span className="text-[11px] font-semibold text-gold-300 flex-1 truncate">{ex.brand}</span>
          <span className="bg-gold-400 text-ink-950 text-[10px] font-bold rounded-md px-2 py-1 shadow-lg">Install app</span>
        </div>
        <div onClick={tap} title={onStep ? 'Tap right for next, left for back' : undefined}
          className={`absolute inset-x-0 top-12 bottom-[132px] z-10 flex flex-col items-center justify-center gap-3 px-4 text-center ${onStep ? 'cursor-pointer' : ''}`}>
          {logo
            ? <RbLogo key={`logo-${playing}`} size={190} slam />
            : <span key={idx} className="bg-black/60 text-gold-300 font-display font-bold text-[19px] leading-tight px-2 py-1 rounded">{cue.onScreen}</span>}
        </div>
        {!logo && (
          <div className="absolute bottom-0 inset-x-0 z-20 p-2 flex flex-col gap-1.5">
            <div className="flex items-end gap-2">
              <div className="w-12 h-14 rounded-md overflow-hidden border border-gold-400 shrink-0">
                <Img src={portrait} alt="Host portrait" className="w-full h-full object-cover object-[50%_68%]" />
              </div>
              <p className="text-[10px] text-ink-50 leading-snug">{active ? active.text : 'Shelter, heat, power, water, waste, and food. One app.'}</p>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {x.cards.map((c) => {
                const on = active?.title === c.title;
                return (
                  <button key={c.title} type="button" onClick={() => onCue?.(sysIdx(c.title))} aria-pressed={on}
                    className={`rounded text-[10px] font-semibold py-1 border transition-colors ${on ? 'bg-gold-400 text-ink-950 border-gold-400' : 'bg-black/60 text-gold-300 border-ink-600 hover:border-gold-400'}`}>
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
