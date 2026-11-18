import { APP_MODE } from './services/provider';
import { StudioProvider, STEPS, useStudio } from './studio/state';
import { AvatarStep, ExportStep, FormatStep, IntegrationsStep, PreviewStep, VoiceStep } from './studio/Steps';
import { Onboarding } from './studio/Onboarding';
import { HelpButton, LiveWalkthrough } from './live/LiveGuide';

function Shell() {
  const { s, d } = useStudio();
  const Screen = { format: FormatStep, avatar: AvatarStep, voice: VoiceStep, preview: PreviewStep, export: ExportStep, integrations: IntegrationsStep }[s.step];
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="relative border-b border-ink-700 bg-ink-900">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-xl text-gold-400">Avatar Studios</h1>
          <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${APP_MODE === 'demo' ? 'bg-ink-700 text-gold-300' : 'bg-gold-400 text-ink-950'}`}>
            {APP_MODE === 'demo' ? 'Demo mode' : 'Live mode'}
          </span>
          <nav aria-label="Steps" className="flex flex-wrap gap-1 ml-auto">
            {STEPS.map((st, i) => (
              <button key={st.id} onClick={() => d({ t: 'step', step: st.id })} aria-current={s.step === st.id ? 'step' : undefined}
                className={`px-3 py-1.5 rounded-md text-sm ${s.step === st.id ? 'bg-gold-400 text-ink-950 font-semibold' : 'text-ink-200 hover:bg-ink-800'}`}>
                {i + 1}. {st.label}
              </button>
            ))}
            {APP_MODE === 'demo' && <button onClick={() => d({ t: 'walkthrough', open: true })} className="px-3 py-1.5 rounded-md text-sm text-ink-400 hover:text-ink-50">Walkthrough</button>}
          </nav>
          {APP_MODE === 'live' && <HelpButton />}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6"><Screen /></main>
      {s.walkthrough && (APP_MODE === 'demo' ? <Onboarding /> : <LiveWalkthrough />)}
    </div>
  );
}

export default function App() {
  return <StudioProvider><Shell /></StudioProvider>;
}
