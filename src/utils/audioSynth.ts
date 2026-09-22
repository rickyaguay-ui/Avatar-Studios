import { decodeAudioFromUrl } from './audioModulator.ts';

/**
 * Web Audio Procedural Sound Engine
 * Generates continuous, harmonious background music tracks (Synthwave, Lo-Fi, Ambient, Chiptune, etc.)
 * and manages synchronized voiceover mixing with ducking.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingMusic: boolean = false;
  private currentTrackId: string = 'synthwave_pulse';
  private musicGainNode: GainNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private loopIntervalId: number | null = null;
  private activeOscillators: OscillatorNode[] = [];

  // Voice playback
  private currentVoiceSource: AudioBufferSourceNode | HTMLAudioElement | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGainNode.connect(this.masterGainNode);

      this.voiceGainNode = this.ctx.createGain();
      this.voiceGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.voiceGainNode.connect(this.masterGainNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicVolume(vol: number) {
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setVoiceVolume(vol: number) {
    if (this.voiceGainNode && this.ctx) {
      this.voiceGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public playMusicTrack(trackId: string) {
    this.init();
    this.stopMusic();
    this.currentTrackId = trackId;
    this.isPlayingMusic = true;

    // Start repeating musical pattern based on genre
    this.runMusicSequencer();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.loopIntervalId !== null) {
      window.clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  private runMusicSequencer() {
    if (!this.ctx || !this.musicGainNode) return;

    let step = 0;
    const intervalMs = 260; // ~115 BPM 16th notes

    const playStep = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGainNode) return;

      const now = this.ctx.currentTime;

      switch (this.currentTrackId) {
        case 'synthwave_pulse': {
          // Retro bassline + arpeggio
          const bassNotes = [110, 110, 130.81, 146.83, 98, 98, 123.47, 130.81];
          const arpNotes = [220, 261.63, 329.63, 392.0, 440, 523.25, 440, 329.63];

          const bassFreq = bassNotes[step % bassNotes.length];
          const arpFreq = arpNotes[(step * 2) % arpNotes.length];

          this.playTone(bassFreq, 'sawtooth', 0.22, 0.18, now, 800);
          if (step % 2 === 0) {
            this.playTone(arpFreq, 'square', 0.12, 0.08, now + 0.05, 1800);
          }
          break;
        }

        case 'chiptune_arcade': {
          // 8-bit fast bouncy notes
          const scales = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 440.0, 493.88];
          const freq = scales[step % scales.length];
          this.playTone(freq, 'square', 0.15, 0.12, now, 3500);
          if (step % 4 === 0) {
            this.playTone(130.81, 'triangle', 0.25, 0.15, now, 1200);
          }
          break;
        }

        case 'lofi_chill': {
          // Mellow warm chords on 4-beat cycle
          if (step % 4 === 0) {
            const chords = [
              [174.61, 220.0, 261.63, 329.63], // Fmaj7
              [146.83, 174.61, 220.0, 261.63], // Dm7
              [130.81, 164.81, 196.0, 246.94], // Cmaj7
              [164.81, 196.0, 246.94, 293.66], // Em7
            ];
            const chordIndex = Math.floor((step / 4) % chords.length);
            chords[chordIndex].forEach((f, idx) => {
              this.playTone(f, 'sine', 0.8, 0.09, now + idx * 0.02, 600);
            });
          }
          break;
        }

        case 'ambient_space': {
          // Slow evolving drone
          if (step % 8 === 0) {
            const dronePitches = [98.0, 146.83, 196.0, 220.0, 293.66];
            dronePitches.forEach(pitch => {
              this.playTone(pitch, 'sine', 2.0, 0.06, now, 450);
            });
          }
          break;
        }

        case 'corporate_upbeat': {
          // Bright rhythmic plucks
          const plucks = [329.63, 392.0, 493.88, 587.33, 659.25, 493.88];
          const p = plucks[step % plucks.length];
          this.playTone(p, 'triangle', 0.12, 0.14, now, 2200);
          if (step % 4 === 0) {
            this.playTone(110.0, 'sine', 0.3, 0.2, now, 900);
          }
          break;
        }

        case 'epic_orchestral':
        default: {
          // Low cello rumble + brass stab
          if (step % 8 === 0) {
            this.playTone(73.42, 'sawtooth', 1.8, 0.2, now, 500);
            this.playTone(110.0, 'triangle', 1.8, 0.15, now, 700);
          } else if (step % 4 === 2) {
            this.playTone(220.0, 'sawtooth', 0.3, 0.15, now, 1200);
          }
          break;
        }
      }

      step = (step + 1) % 64;
    };

    this.loopIntervalId = window.setInterval(playStep, intervalMs);
    playStep();
  }

  private playTone(
    frequency: number,
    type: OscillatorType,
    duration: number,
    gainLevel: number,
    startTime: number,
    filterFreq: number = 2000
  ) {
    if (!this.ctx || !this.musicGainNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);

      this.activeOscillators.push(osc);
      setTimeout(() => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx !== -1) this.activeOscillators.splice(idx, 1);
        try {
          osc.disconnect();
          gain.disconnect();
          filter.disconnect();
        } catch (e) {}
      }, (duration + 0.1) * 1000);
    } catch (e) {
      console.warn('Tone synth error:', e);
    }
  }

  /**
   * Plays a voice audio URL (base64 or wav), ducking background music gracefully
   */
  public async playVoiceover(
    audioUrl: string,
    onEnded?: () => void
  ): Promise<HTMLAudioElement | AudioBufferSourceNode | null> {
    if (!audioUrl || typeof audioUrl !== 'string' || !audioUrl.trim()) {
      if (onEnded) onEnded();
      return null;
    }

    this.init();
    this.stopVoiceover();

    // Duck music during dialogue
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.1);
    }

    const restoreMusicAndFinish = () => {
      if (this.musicGainNode && this.ctx) {
        this.musicGainNode.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.4);
      }
      if (onEnded) onEnded();
    };

    // Attempt native HTMLAudioElement first
    try {
      const audio = new Audio();
      this.currentVoiceSource = audio;
      audio.volume = 1.0;

      let fallbackTriggered = false;
      const triggerFallback = async () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        try {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.src = '';
        } catch {}
        await this.playVoiceoverViaWebAudio(audioUrl, restoreMusicAndFinish);
      };

      audio.onended = () => {
        if (this.currentVoiceSource === audio) {
          this.currentVoiceSource = null;
        }
        restoreMusicAndFinish();
      };

      audio.onerror = () => {
        // Fallback gracefully without crashing or throwing
        triggerFallback();
      };

      audio.src = audioUrl;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback blocked or unsupported format in <audio>, fallback to Web Audio
          triggerFallback();
        });
      }

      return audio;
    } catch {
      // Immediate failure, run Web Audio fallback
      return await this.playVoiceoverViaWebAudio(audioUrl, restoreMusicAndFinish);
    }
  }

  private async playVoiceoverViaWebAudio(
    audioUrl: string,
    onFinish: () => void
  ): Promise<AudioBufferSourceNode | null> {
    try {
      if (!this.ctx) this.init();
      if (!this.ctx) {
        onFinish();
        return null;
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      const audioBuffer = await decodeAudioFromUrl(audioUrl);
      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      if (this.voiceGainNode) {
        source.connect(this.voiceGainNode);
      } else {
        source.connect(this.ctx.destination);
      }

      this.currentVoiceSource = source;
      source.onended = () => {
        if (this.currentVoiceSource === source) {
          this.currentVoiceSource = null;
        }
        onFinish();
      };

      source.start(0);
      return source;
    } catch (err) {
      console.warn('Voiceover playback fallback failed:', err);
      this.currentVoiceSource = null;
      onFinish();
      return null;
    }
  }

  public stopVoiceover() {
    if (this.currentVoiceSource instanceof HTMLAudioElement) {
      try {
        this.currentVoiceSource.pause();
        this.currentVoiceSource.currentTime = 0;
        this.currentVoiceSource.src = '';
      } catch {}
      this.currentVoiceSource = null;
    } else if (this.currentVoiceSource) {
      try {
        (this.currentVoiceSource as AudioBufferSourceNode).stop();
        (this.currentVoiceSource as AudioBufferSourceNode).disconnect();
      } catch {}
      this.currentVoiceSource = null;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.3);
    }
  }
}

export const soundEngine = new SoundEngine();
