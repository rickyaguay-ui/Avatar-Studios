/**
 * Voice Modulation and Offline Audio Export Engine
 * Applies real-time and offline pitch shifting, playback speed adjustment,
 * and renders clean downloadable WAV audio files.
 */

export async function decodeAudioFromUrl(audioUrl: string): Promise<AudioBuffer> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();

  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    // Try standard decodeAudioData on a slice (since decodeAudioData can detach the ArrayBuffer)
    try {
      const copy = arrayBuffer.slice(0);
      const audioBuffer = await ctx.decodeAudioData(copy);
      ctx.close();
      return audioBuffer;
    } catch {
      // If standard decoding fails (e.g. raw 16-bit PCM returned without WAV header)
      // Check if it's raw 16-bit PCM
      if (arrayBuffer.byteLength > 0) {
        // Typical Gemini TTS sample rate is 24000Hz mono
        const sampleRate = 24000;
        const numSamples = Math.floor(arrayBuffer.byteLength / 2);
        if (numSamples > 0) {
          const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
          const channelData = audioBuffer.getChannelData(0);
          const int16View = new Int16Array(arrayBuffer);
          for (let i = 0; i < numSamples; i++) {
            channelData[i] = int16View[i] / 32768.0;
          }
          ctx.close();
          return audioBuffer;
        }
      }
      throw new Error('Unsupported or empty audio buffer');
    }
  } catch (err) {
    ctx.close();
    throw err;
  }
}

/**
 * Modulates an AudioBuffer with pitch, speed, and renders into a WAV Data URL via OfflineAudioContext
 */
export async function renderModulatedAudioWav(
  audioBuffer: AudioBuffer,
  pitch: number = 1.0,
  speed: number = 1.0
): Promise<string> {
  const effectiveRate = Math.max(0.5, Math.min(2.5, speed * pitch));
  const newDuration = audioBuffer.duration / effectiveRate;
  const sampleRate = audioBuffer.sampleRate;
  const lengthInSamples = Math.ceil(newDuration * sampleRate);

  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.max(1, lengthInSamples),
    sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.setValueAtTime(effectiveRate, 0);

  // Equalizer curve to enhance voice clarity depending on pitch
  const filter = offlineCtx.createBiquadFilter();
  if (pitch > 1.2) {
    // High pitch: tame harsh treble
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(7000, 0);
  } else if (pitch < 0.85) {
    // Low pitch: boost bass resonance slightly
    filter.type = 'peaking';
    filter.frequency.setValueAtTime(140, 0);
    filter.gain.setValueAtTime(3, 0);
  } else {
    filter.type = 'allpass';
  }

  source.connect(filter);
  filter.connect(offlineCtx.destination);

  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavDataUrl(renderedBuffer);
}

/**
 * Converts an AudioBuffer into standard 16-bit PCM WAV Data URL
 */
function audioBufferToWavDataUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  // Helper to write string
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + length, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, length, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
