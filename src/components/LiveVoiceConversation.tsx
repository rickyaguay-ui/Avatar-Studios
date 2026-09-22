import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Radio, Activity, Sparkles, AlertCircle } from 'lucide-react';

interface LiveVoiceConversationProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt?: string;
}

export const LiveVoiceConversation: React.FC<LiveVoiceConversationProps> = ({
  isOpen,
  onClose,
  systemPrompt,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // Convert Float32Array to 16-bit PCM Base64
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Play audio chunk at 24kHz
  const playAudioChunk = async (audioCtx: AudioContext, base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      setIsTalking(true);
      source.onended = () => {
        if (audioQueueRef.current.length > 0) {
          const next = audioQueueRef.current.shift();
          if (next) playAudioChunk(audioCtx, next);
        } else {
          isPlayingRef.current = false;
          setIsTalking(false);
        }
      };

      source.start();
    } catch (e) {
      console.warn('Audio playback error:', e);
      isPlayingRef.current = false;
      setIsTalking(false);
    }
  };

  const startSession = async () => {
    setErrorMsg(null);
    try {
      // 1. Initialize AudioContexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;

      // 2. Capture microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;
      setMicActive(true);

      // 3. Setup WebSocket to /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setErrorMsg(msg.error);
          }
          if (msg.interrupted) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsTalking(false);
          }
          if (msg.audio && outputAudioCtxRef.current) {
            if (isPlayingRef.current) {
              audioQueueRef.current.push(msg.audio);
            } else {
              isPlayingRef.current = true;
              playAudioChunk(outputAudioCtxRef.current, msg.audio);
            }
          }
        } catch (e) {
          console.warn('WS Message parse error:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket error:', e);
        setErrorMsg('Could not connect to Live API server socket.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setMicActive(false);
      };

      // 4. Connect microphone processing
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume level to indicate speaking
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        setIsUserSpeaking(avg > 0.02);

        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(inputData);
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      setErrorMsg(err?.message || 'Microphone access denied or audio unavailable');
    }
  };

  const stopSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setMicActive(false);
    setIsTalking(false);
    setIsUserSpeaking(false);
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="live-voice-conversation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          id="btn-close-live-voice"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Radio className={`w-5 h-5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
          <h3 className="text-lg font-semibold text-white">Live Voice Conversation</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-6">
          Powered by <span className="text-indigo-400 font-medium">gemini-3.8-live</span> real-time bidirectional audio
        </p>

        {/* Error notification */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Visual Reactive Orb */}
        <div className="relative my-8 flex items-center justify-center">
          {/* Outer glow rings */}
          <div
            className={`absolute w-44 h-44 rounded-full transition-all duration-300 ${
              isTalking
                ? 'bg-indigo-500/20 scale-125 blur-xl animate-pulse'
                : isUserSpeaking
                ? 'bg-emerald-500/20 scale-110 blur-lg'
                : 'bg-neutral-700/10 scale-95 blur-md'
            }`}
          />
          <div
            className={`absolute w-36 h-36 rounded-full border-2 transition-all duration-300 ${
              isTalking
                ? 'border-indigo-400/50 scale-110 animate-spin'
                : isUserSpeaking
                ? 'border-emerald-400/50 scale-105'
                : 'border-neutral-700/30'
            }`}
            style={{ animationDuration: '8s' }}
          />

          {/* Central orb */}
          <div
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
              isTalking
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 scale-105 shadow-indigo-500/50'
                : isUserSpeaking
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 scale-100 shadow-emerald-500/50'
                : isConnected
                ? 'bg-gradient-to-tr from-neutral-800 to-neutral-700'
                : 'bg-neutral-800'
            }`}
          >
            {isTalking ? (
              <Volume2 className="w-10 h-10 text-white animate-bounce" />
            ) : isUserSpeaking ? (
              <Mic className="w-10 h-10 text-white" />
            ) : (
              <Sparkles className="w-10 h-10 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="mb-6 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isTalking
                  ? 'bg-indigo-400 animate-ping'
                  : isUserSpeaking
                  ? 'bg-emerald-400 animate-pulse'
                  : isConnected
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-sm font-medium text-neutral-200">
              {isTalking
                ? 'Gemini Live Speaking...'
                : isUserSpeaking
                ? 'Listening to you...'
                : isConnected
                ? 'Ready — Speak naturally into your mic'
                : 'Connecting to Live API...'}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            You can interrupt Gemini at any time by speaking.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            id="btn-toggle-mic-live"
            onClick={() => {
              if (isConnected) {
                stopSession();
              } else {
                startSession();
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition ${
              isConnected
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isConnected ? (
              <>
                <MicOff className="w-4 h-4" />
                End Live Call
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Reconnect Live Call
              </>
            )}
          </button>

          <button
            id="btn-close-live-modal"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-750 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
