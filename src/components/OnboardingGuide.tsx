import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const ONBOARDING_STORAGE_KEY = 'avatar_studios_onboarded_v1';

interface OnboardingGuideProps {
  onClose: () => void;
  /** Called from the last step. Should open the avatar screen. */
  onStart: () => void;
}

interface Step {
  title: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: 'What this app does',
    body: (
      <>
        <p>
          Avatar Studios makes the four pieces of an app intro: an <b>avatar</b>, a <b>backdrop</b>, a <b>voice</b>,
          and <b>music</b>. Then it plays them together so you can see the result, and exports them for your app.
        </p>
        <p className="mt-3">
          You'll build one small intro. It takes about five minutes, and you don't need an API key for the first
          part.
        </p>
      </>
    ),
  },
  {
    title: 'Step 1: Pick a starter avatar',
    body: (
      <>
        <p>
          Open <b>Avatar Studio</b> in the menu. The <b>1. Pick a Starter</b> tab has ten demo avatars in five art
          styles: hand-drawn sketch, flat portrait, line art, pixel art and friendly mascot.
        </p>
        <ul className="mt-3 space-y-1.5 list-disc pl-5">
          <li>Use the arrows to flip through them.</li>
          <li>Tap a style name to see only that style.</li>
          <li>
            Press <b>Use this avatar</b> to select it, or <b>Use &amp; Customize</b> to keep going.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Step 2: Make it your own',
    body: (
      <>
        <p>
          The <b>2. Customize</b> tab changes how the avatar looks: art style, hair, clothes, accessories and
          framing. Write a short description, then press generate to make a new image in that style.
        </p>
        <p className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-amber-200">
          Generating new images needs a Gemini key. Put <code className="font-mono">GEMINI_API_KEY</code> in a file
          named <code className="font-mono">.env</code> next to <code className="font-mono">package.json</code>,
          then restart the app.
        </p>
      </>
    ),
  },
  {
    title: 'Step 3: Add a backdrop, a voice and music',
    body: (
      <ul className="space-y-2 list-disc pl-5">
        <li>
          <b>Background Studio</b>: six backdrops are built in. Pick one, or describe your own.
        </li>
        <li>
          <b>Voice Studio</b>: type what the avatar says, pick a voice and an emotion, and preview it.
        </li>
        <li>
          <b>Music Studio</b>: six tracks are built in and play right away. Describe a track to generate a new one.
        </li>
      </ul>
    ),
  },
  {
    title: 'Step 4: Preview and export',
    body: (
      <>
        <p>
          <b>Live Intro Simulator</b> plays everything together in a phone, web window or full-screen frame. When it looks
          right, open <b>Export Hub</b> and pick where it's going: Web, Android, or the raw files.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="font-semibold text-emerald-300 mb-1">Works with no key</div>
            Starter avatars, built-in backdrops, built-in music, the Live Intro Simulator, and Export Hub.
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div className="font-semibold text-slate-200 mb-1">Needs a Gemini key</div>
            New images, spoken voice, generated music, video, App Architect and the Chat Copilot.
          </div>
        </div>
      </>
    ),
  },
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onClose, onStart }) => {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !isLast) setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLast, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="How Avatar Studios works"
      id="onboarding-guide"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex gap-1.5" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-7 rounded-full ${i <= index ? 'bg-indigo-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 text-sm text-slate-300 leading-relaxed min-h-[230px]">
          <h2 className="text-lg font-bold text-white mb-3">{step.title}</h2>
          {step.body}
        </div>

        <div className="flex items-center justify-between px-5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={onStart}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Pick a starter avatar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex(index + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
