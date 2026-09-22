import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, Copy, Check, Sparkles, FileAudio, RefreshCw, AlertCircle } from 'lucide-react';

interface AudioTranscriberProps {
  onTranscriptReady?: (transcript: string) => void;
  onUseAsDialogue?: (transcript: string) => void;
  onUseAsPrompt?: (transcript: string) => void;
  className?: string;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscriptReady,
  onUseAsDialogue,
  onUseAsPrompt,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startRecording = async () => {
    setErrorMsg(null);
    setTranscript('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMsg(err?.message || 'Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const res = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Audio,
              mimeType: audioBlob.type || 'audio/webm',
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to transcribe');
          }

          setTranscript(data.transcript);
          if (onTranscriptReady) onTranscriptReady(data.transcript);
        } catch (err: any) {
          setErrorMsg(err?.message || 'Transcription error occurred');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process audio');
      setIsTranscribing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAudioUpload(file);
    }
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="audio-transcriber-container"
      className={`rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-violet-400" />
          <h4 className="text-xs font-semibold text-neutral-200">
            Audio Transcriber <span className="text-[10px] text-violet-400 font-mono">gemini-3.5-transcribe</span>
          </h4>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rec: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action controls */}
      <div className="flex items-center gap-2 mb-3">
        {isRecording ? (
          <button
            id="btn-stop-transcribe-record"
            onClick={stopRecording}
            className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Square className="w-3.5 h-3.5" />
            Stop & Transcribe
          </button>
        ) : (
          <button
            id="btn-start-transcribe-record"
            onClick={startRecording}
            disabled={isTranscribing}
            className="flex-1 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            Record Mic Audio
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          id="btn-upload-transcribe-audio"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || isTranscribing}
          className="py-2 px-3 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 disabled:opacity-50 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Audio
        </button>
      </div>

      {/* Transcription Loading */}
      {isTranscribing && (
        <div className="py-4 flex flex-col items-center justify-center gap-2 text-center">
          <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
          <p className="text-xs text-neutral-400">
            Transcribing with <span className="text-violet-300">gemini-3.5-transcribe</span>...
          </p>
        </div>
      )}

      {/* Transcript Result & Quick Actions */}
      {transcript && !isTranscribing && (
        <div className="space-y-2 mt-2 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Transcribed Output:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed max-h-36 overflow-y-auto">
            {transcript}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {onUseAsDialogue && (
              <button
                id="btn-use-as-dialogue"
                onClick={() => onUseAsDialogue(transcript)}
                className="py-1 px-2.5 rounded-md bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[11px] font-medium border border-neutral-700 transition"
              >
                Use as Avatar Dialogue
              </button>
            )}
            {onUseAsPrompt && (
              <button
                id="btn-use-as-prompt"
                onClick={() => onUseAsPrompt(transcript)}
                className="py-1 px-2.5 rounded-md bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[11px] font-medium border border-neutral-700 transition"
              >
                Use as Generation Prompt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
