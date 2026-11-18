import { useEffect, useRef, useState } from 'react';

/** Browser speech-to-text (no API key). `supported` is false where the browser has no SpeechRecognition. */
export function useDictation(onText: (text: string) => void) {
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : undefined;
  const rec = useRef<any>(null);
  const cb = useRef(onText);
  cb.current = onText;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    if (!SR) return;
    if (listening) { rec.current?.stop(); return; }
    setError(null);
    const r = new SR();
    r.lang = 'en-US'; r.continuous = true; r.interimResults = false;
    r.onresult = (e: any) => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript;
      if (t.trim()) cb.current(t.trim());
    };
    r.onerror = (e: any) => {
      setError(e?.error === 'not-allowed' ? 'Microphone blocked. Allow the microphone for this site and try again.' : `Dictation stopped (${e?.error ?? 'error'}).`);
      setListening(false);
    };
    r.onend = () => setListening(false);
    rec.current = r;
    try { r.start(); setListening(true); } catch { setListening(false); }
  };
  useEffect(() => () => rec.current?.stop(), []);
  return { supported: !!SR, listening, error, toggle };
}
