import { useState } from 'react';
import { Button, Img, Panel } from './Media';
import { useStudio } from './state';
import { STARTER_AVATARS, STARTER_BACKDROPS, STARTER_STYLES } from './starterAssets';

/** Pick one of ten starter avatars. It becomes the portrait shown in the preview frames. */
export function StarterAvatarsPanel() {
  const { s, d } = useStudio();
  const [filter, setFilter] = useState<string>('All');
  const list = STARTER_AVATARS.filter((a) => filter === 'All' || a.style === filter);
  return (
    <Panel title="Starter avatars">
      <p className="text-xs text-ink-400 mb-3">Ten demo avatars in five art styles. Pick one to use it as the portrait in the preview. They are CC0 (public domain).</p>
      <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Art style">
        {['All', ...STARTER_STYLES].map((st) => (
          <button key={st} onClick={() => setFilter(st)} aria-pressed={filter === st}
            className={`px-2.5 py-1 rounded-full text-xs border ${filter === st ? 'bg-gold-400 text-ink-950 border-gold-400 font-semibold' : 'border-ink-600 text-ink-200 hover:bg-ink-800'}`}>{st}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {list.map((a) => {
          const on = s.portrait === a.url;
          return (
            <button key={a.id} onClick={() => d({ t: 'portrait', url: a.url })} aria-pressed={on}
              className={`rounded-lg overflow-hidden border text-left ${on ? 'border-gold-400' : 'border-ink-700 hover:border-ink-500'}`}>
              <Img src={a.url} alt={`${a.name}, ${a.style}`} className="w-full aspect-square object-cover bg-ink-800" />
              <div className="p-2 text-xs"><b className="text-ink-50">{a.name}</b> <span className="text-ink-400">{a.role}</span></div>
            </button>
          );
        })}
      </div>
      {s.portrait && <Button className="mt-3" onClick={() => d({ t: 'portrait', url: null })}>Back to the host portrait</Button>}
    </Panel>
  );
}

/** Pick one of six backdrops for the preview frame. Does not change the script or timing. */
export function BackdropPanel() {
  const { s, d } = useStudio();
  return (
    <Panel title="Backdrop">
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2" role="group" aria-label="Backdrop">
        {STARTER_BACKDROPS.map((b) => {
          const on = s.backdrop === b.url;
          return (
            <button key={b.id} onClick={() => d({ t: 'backdrop', url: b.url })} aria-pressed={on} title={b.name}
              className={`rounded-md overflow-hidden border ${on ? 'border-gold-400' : 'border-ink-700 hover:border-ink-500'}`}>
              <Img src={b.url} alt={b.name} className="w-full aspect-video object-cover bg-ink-800" />
              <div className="text-[10px] text-ink-200 py-1 text-center">{b.name}</div>
            </button>
          );
        })}
      </div>
      {s.backdrop && <Button className="mt-3" onClick={() => d({ t: 'backdrop', url: null })}>Use the example backdrop</Button>}
    </Panel>
  );
}
