import { useCallback, useEffect, useRef, useState } from 'react';
import type { Cue, FormatExample, HostId } from '../types';
import { provider } from '../services/provider';

/**
 * Intro playback clock. Audio drives the clock when a clip is loaded (cue times are scaled to the
 * real clip length); otherwise a timer does. The browser speech fallback is never used.
 */
export function usePlayer(ex: FormatExample, host: HostId) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const cache = useRef(new Map<string, string>());
  const clockRef = useRef(0);

  const narration = ex.cues.map((c) => c.voiceover).filter(Boolean).join(' ');

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  // Reset when format or voice changes.
  useEffect(() => {
    stop(); setT(0); clockRef.current = 0; setNotice(null);
    audioRef.current = null; urlRef.current = null;
  }, [ex.id, host, stop]);

  const loadAudio = useCallback(async () => {
    const key = `${ex.id}:${host}`;
    let url = cache.current.get(key);
    if (!url) {
      const r = await provider.speak({ format: ex.id, host, text: narration });
      if (!r.ok) { setNotice(r.message); return null; }
      url = r.data.audioUrl;
      cache.current.set(key, url);
    }
    if (urlRef.current !== url || !audioRef.current) {
      const a = new Audio(url);
      a.preload = 'auto';
      a.onerror = () => { setNotice(`Voice clip missing: ${url}. Playing captions only.`); audioRef.current = null; };
      audioRef.current = a; urlRef.current = url;
    }
    return audioRef.current;
  }, [ex.id, host, narration]);

  const scale = () => {
    const a = audioRef.current;
    return a && Number.isFinite(a.duration) && a.duration > 0 ? a.duration / ex.durationSec : 1;
  };

  const play = useCallback(async () => {
    setNotice(null);
    const a = await loadAudio();   // Runs inside the click handler's async chain; play() follows the user gesture.
    if (a) { try { await a.play(); } catch { setNotice('Browser blocked audio. Press play again.'); } }
    setPlaying(true);
  }, [loadAudio]);

  const pause = useCallback(() => stop(), [stop]);

  const seek = useCallback((sec: number) => {
    clockRef.current = sec; setT(sec);
    const a = audioRef.current;
    if (a) a.currentTime = sec * scale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id]);

  // Clock loop.
  useEffect(() => {
    if (!playing) return;
    let raf = 0; let last = performance.now();
    const tick = (now: number) => {
      const a = audioRef.current;
      const usable = a && !a.paused && Number.isFinite(a.duration) && a.duration > 0;
      if (usable) clockRef.current = a!.currentTime / (a!.duration / ex.durationSec);
      else clockRef.current += (now - last) / 1000;
      last = now;
      if (clockRef.current >= ex.durationSec || (a && a.ended)) {
        setPlaying(false); setT(0); clockRef.current = 0; if (a) a.currentTime = 0; return;
      }
      setT(clockRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, ex.durationSec]);

  useEffect(() => () => audioRef.current?.pause(), []);

  let idx = 0;
  ex.cues.forEach((c, i) => { if (t >= c.at) idx = i; });
  const cue: Cue = ex.cues[idx];

  const step = (dir: 1 | -1) => {
    const n = Math.min(Math.max(idx + dir, 0), ex.cues.length - 1);
    seek(ex.cues[n].at);
  };

  return { t, playing, notice, cue, cueIndex: idx, play, pause, step, seek };
}
