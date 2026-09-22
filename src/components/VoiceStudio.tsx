import React, { useState } from 'react';
import { StudioProject, ProjectAsset } from '../types.ts';
import { soundEngine } from '../utils/audioSynth.ts';
import { decodeAudioFromUrl, renderModulatedAudioWav } from '../utils/audioModulator.ts';
import {
  Volume2,
  Play,
  Square,
  Loader2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Sliders,
  Gauge,
  Music2,
  Download,
  CheckCircle2,
  FolderPlus,
  Check,
  Radio,
  Mic,
  Columns2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { AudioTranscriber } from './AudioTranscriber.tsx';
import { LiveVoiceConversation } from './LiveVoiceConversation.tsx';

interface VoiceStudioProps {
  project: StudioProject;
  onChange: (updates: Partial<StudioProject>) => void;
  onSaveAssetToProject?: (asset: ProjectAsset) => void;
  onPrePlayIntro?: (focusMode?: 'all' | 'avatar_voice_only') => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const VOICES = [
  { id: 'Kore', name: 'Kore', desc: 'Warm, clear, and inspiring (Best for guide/assistant)', provider: 'gemini' },
  { id: 'Puck', name: 'Puck', desc: 'Energetic, cheerful, and friendly (Great for game mascots)', provider: 'gemini' },
  { id: 'Charon', name: 'Charon', desc: 'Deep, resonant, and authoritative (Commanders, narrators)', provider: 'gemini' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Bold, gritty, and dramatic (Cyberpunk/action characters)', provider: 'gemini' },
  { id: 'Zephyr', name: 'Zephyr', desc: 'Calm, smooth, and tech-forward (Product intros)', provider: 'gemini' },
] as const;

// ElevenLabs character voices pre-assigned to The Bridge canonical cast.
// Only shown when voiceProvider === 'elevenlabs'. Require ELEVENLABS_API_KEY in .env.
const ELEVENLABS_BRIDGE_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'David', character: 'David', desc: 'Warm baritone — gravitas and depth', emoji: '👑' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Paul',  character: 'Paul',  desc: 'Authoritative, deliberate, rhetorical', emoji: '✍️' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Peter', character: 'Peter', desc: 'Bold, direct, unpolished sincerity', emoji: '⚓' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Moses', character: 'Moses', desc: 'Ancient weight, commanding presence', emoji: '🪨' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Mary',  character: 'Mary',  desc: 'Gentle, warm, quietly extraordinary', emoji: '🌹' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Rahab', character: 'Rahab', desc: 'Resilient, grounded, transformed', emoji: '🔴' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Ruth',  character: 'Ruth',  desc: 'Earnest, faithful, quietly tenacious', emoji: '🌾' },
  { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Mary Magdalene', character: 'Mary Magdalene', desc: 'Expressive, transformed, devoted', emoji: '💜' },
];

const EMOTIONS = [
  { id: 'cheerful', label: 'Cheerful & Upbeat', emoji: '🌟' },
  { id: 'energetic', label: 'Energetic & Hyped', emoji: '⚡' },
  { id: 'happy', label: 'Happy & Welcoming', emoji: '😄' },
  { id: 'heroic', label: 'Heroic & Epic', emoji: '🛡️' },
  { id: 'calm', label: 'Calm & Soothing', emoji: '🍃' },
  { id: 'sad', label: 'Somber & Emotional', emoji: '💧' },
  { id: 'dramatic', label: 'Dramatic & Intense', emoji: '🔥' },
  { id: 'robotic', label: 'Cybernetic AI', emoji: '🤖' },
] as const;

const SCRIPT_TEMPLATES = [
  { label: 'SaaS App Onboarding', text: 'Welcome to your workspace! Let us review your key metrics and automate your workflow in seconds.' },
  { label: 'Game Intro Cutscene', text: 'Warning: Dimensional anomaly detected. Prepare your arsenal, champion. The invasion begins now!' },
  { label: 'Fintech / Security Alert', text: 'Identity verified. Secure biometric encryption active. Your digital vault is now unlocked.' },
  { label: 'Fitness / Habit Coach', text: 'Outstanding work today! You just unlocked a 7-day streak. Keep this momentum burning!' },
  { label: 'The Bridge — David', text: 'The Lord is my shepherd — and yours. Even in the valley, His rod and staff are with you. Walk with me.' },
  { label: 'The Bridge — Ruth', text: 'Where you go, I will go. Where you lodge, I will lodge. You are never walking this path alone.' },
  { label: 'The Bridge — Paul', text: 'I have learned, in whatever state I am, to be content. Not by my own strength — but through Christ who strengthens me.' },
];


export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  project,
  onChange,
  onSaveAssetToProject,
  onPrePlayIntro,
  isSplitView,
  onToggleSplitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isModulating, setIsModulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingModulated, setIsPlayingModulated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [hasSavedVoice, setHasSavedVoice] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [showTranscriber, setShowTranscriber] = useState(false);

  const handleSaveToProjectFolder = () => {
    const audioUrl = project.modulatedAudioUrl || project.voiceAudioUrl;
    if (!audioUrl || !onSaveAssetToProject) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_voice_${now}`,
      projectId: project.projectId || 'proj_active',
      name: `${project.title || 'App'} Voiceover (${project.selectedVoice})`,
      folder: 'voice',
      type: 'audio',
      url: audioUrl,
      prompt: project.dialogueText,
      specs: {
        voice: project.selectedVoice,
        voiceName: project.selectedVoice,
        voicePitch: project.voicePitch,
        voiceSpeed: project.voiceSpeed,
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: ['voice', project.selectedVoice.toLowerCase(), project.speechEmotion],
    };
    onSaveAssetToProject(newAsset);
    setHasSavedVoice(true);
  };

  // Synthesize Base Speech — routes to ElevenLabs v3 or Gemini TTS based on voiceProvider
  const handleSynthesize = async () => {
    if (!project.dialogueText.trim()) return;
    setIsSynthesizing(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const useElevenLabs = project.voiceProvider === 'elevenlabs';
      const endpoint = useElevenLabs ? '/api/elevenlabs-speech' : '/api/generate-speech';

      // Find the selected ElevenLabs character name if in ElevenLabs mode
      const elCharacter = useElevenLabs
        ? (ELEVENLABS_BRIDGE_VOICES.find(v => v.id === project.selectedVoice)?.character || undefined)
        : undefined;

      const body = useElevenLabs
        ? {
            text: project.dialogueText,
            characterName: elCharacter,
            voiceId: project.selectedVoice,
            emotion: project.speechEmotion,
          }
        : {
            text: project.dialogueText,
            voice: project.selectedVoice,
            emotion: project.speechEmotion,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate voice audio');
      }

      // Automatically modulate with current pitch and speed
      let modulatedUrl = data.audioUrl;
      try {
        const audioBuffer = await decodeAudioFromUrl(data.audioUrl);
        modulatedUrl = await renderModulatedAudioWav(
          audioBuffer,
          project.voicePitch || 1.0,
          project.voiceSpeed || 1.0
        );
      } catch (modErr) {
        console.warn('Auto-modulation fallback to raw audio:', modErr);
      }

      onChange({
        voiceAudioUrl: data.audioUrl,
        modulatedAudioUrl: modulatedUrl,
      });

      // Automatically play preview
      soundEngine.playVoiceover(modulatedUrl, () => {
        setIsPlaying(false);
        setIsPlayingModulated(false);
      });
      setIsPlaying(true);
      setSuccessNotice('Synthesized and modulated voice ready!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Voice synthesis failed. Verify API key (GEMINI_API_KEY or ELEVENLABS_API_KEY).');
    } finally {
      setIsSynthesizing(false);
    }
  };


  // Re-modulate existing audio when pitch/speed sliders change
  const handleApplyModulation = async () => {
    const sourceUrl = project.voiceAudioUrl;
    if (!sourceUrl) return;

    setIsModulating(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const audioBuffer = await decodeAudioFromUrl(sourceUrl);
      const modulatedUrl = await renderModulatedAudioWav(
        audioBuffer,
        project.voicePitch,
        project.voiceSpeed
      );

      onChange({ modulatedAudioUrl: modulatedUrl });
      setSuccessNotice('Modulation applied and ready for playback & export!');

      // Play test
      soundEngine.playVoiceover(modulatedUrl, () => {
        setIsPlayingModulated(false);
      });
      setIsPlayingModulated(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Audio modulation error: ' + (err?.message || 'Unable to reprocess buffer'));
    } finally {
      setIsModulating(false);
    }
  };

  const togglePlayback = (useModulated = true) => {
    const url = useModulated ? (project.modulatedAudioUrl || project.voiceAudioUrl) : project.voiceAudioUrl;
    if (!url) return;

    if (isPlaying || isPlayingModulated) {
      soundEngine.stopVoiceover();
      setIsPlaying(false);
      setIsPlayingModulated(false);
    } else {
      soundEngine.playVoiceover(url, () => {
        setIsPlaying(false);
        setIsPlayingModulated(false);
      });
      if (useModulated) {
        setIsPlayingModulated(true);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const getPitchDescription = (pitch: number) => {
    if (pitch < 0.75) return 'Deep Titan / Commander';
    if (pitch < 0.95) return 'Low Baritone / Grounded';
    if (pitch <= 1.05) return 'Natural Voice Pitch';
    if (pitch < 1.3) return 'Bright / Youthful / Mascot';
    return 'Chipmunk / Pixie High Pitch';
  };

  const getSpeedDescription = (speed: number) => {
    if (speed < 0.8) return 'Slow & Deliberate';
    if (speed <= 1.1) return 'Standard Conversational';
    if (speed <= 1.4) return 'Fast & Energetic';
    return 'Rapid / Auctioneer';
  };

  return (
    <div id="voice-studio" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            Voice Studio &amp; Modulation Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate speech with Gemini TTS, modulate pitch and tempo, or engage in real-time Live voice dialogue
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onUndo && (
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                id="btn-voice-undo"
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                  canUndo
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title="Undo voice modification (Ctrl+Z / ⌘Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Undo</span>
              </button>
              <button
                id="btn-voice-redo"
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                  canRedo
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title="Redo voice modification (Ctrl+Y / ⌘⇧Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Redo</span>
              </button>
            </div>
          )}

          <button
            id="btn-open-live-voice"
            type="button"
            onClick={() => setIsLiveVoiceOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live Voice (gemini-3.8-live)
          </button>

          {project.modulatedAudioUrl && (
            <a
              id="btn-download-voice-wav"
              href={project.modulatedAudioUrl}
              download={`${project.title.toLowerCase().replace(/\s+/g, '_')}_modulated_voice.wav`}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Download .WAV
            </a>
          )}
        </div>
      </div>

      {/* Voice & Avatar Casting Stage */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border-2 border-sky-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-sky-400/60 shadow-lg shrink-0">
              <img
                src={project.avatarUrl}
                alt="Cast Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 py-0.5 text-center text-[8px] font-mono text-sky-300 uppercase">
                Speaker
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">
                  Casting for: {project.title || 'App'} Avatar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Voice: {project.selectedVoice}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Pitch: {(project.voicePitch ?? 1.0).toFixed(2)}x | Speed: {(project.voiceSpeed ?? 1.0).toFixed(2)}x
                </span>
              </div>
              <p className="text-xs text-slate-300 italic max-w-xl truncate">
                "{project.dialogueText}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
            {onPrePlayIntro && (
              <>
                <button
                  id="btn-voice-preplay-solo"
                  type="button"
                  onClick={() => onPrePlayIntro('avatar_voice_only')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Audition only the avatar figure and this voice against clean spotlight"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Audition Avatar + Voice</span>
                </button>

                <button
                  id="btn-voice-preplay-full"
                  type="button"
                  onClick={() => onPrePlayIntro('all')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-sky-600/20 hover:shadow-sky-600/40 transition-all cursor-pointer"
                  title="Launch full Play Intro sequence with this voice, avatar, scene and soundtrack"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Pre-Play in Intro Scene</span>
                </button>
              </>
            )}

            {onToggleSplitView && (
              <button
                type="button"
                onClick={onToggleSplitView}
                className={`p-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                  isSplitView
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title={isSplitView ? 'Disable Split Live View' : 'Enable Split Side-by-Side Live View'}
              >
                <Columns2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Script Textarea & Quick Templates & Audio Transcriber */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            Avatar Speech Script
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTranscriber(!showTranscriber)}
              className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"
            >
              <Mic className="w-3 h-3" />
              {showTranscriber ? 'Hide Transcriber' : 'Dictate / Transcribe Audio (gemini-3.5-transcribe)'}
            </button>
            <span className="text-[11px] text-slate-400">
              {project.dialogueText.length} characters
            </span>
          </div>
        </div>

        {/* Audio Transcriber Box */}
        {showTranscriber && (
          <AudioTranscriber
            onUseAsDialogue={(text) => {
              onChange({ dialogueText: text });
              setShowTranscriber(false);
            }}
          />
        )}

        <textarea
          id="voice-script-input"
          rows={3}
          value={project.dialogueText}
          onChange={(e) => onChange({ dialogueText: e.target.value })}
          placeholder="Type what your avatar should say in the intro scene..."
          className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        {/* Quick presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          <span className="text-[11px] text-slate-400 shrink-0">Templates:</span>
          {SCRIPT_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange({ dialogueText: tmpl.text })}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection & Emotional Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Voice Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Voice Provider &amp; Character Actor
          </label>

          {/* Provider toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg mb-3">
            {(['gemini', 'elevenlabs'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ voiceProvider: p })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  (project.voiceProvider ?? 'gemini') === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'gemini' ? '🤖 Gemini TTS' : '🎙️ ElevenLabs v3'}
              </button>
            ))}
          </div>

          {(project.voiceProvider ?? 'gemini') === 'gemini' ? (
            <div className="space-y-2">
              {VOICES.map((v) => {
                const isSelected = project.selectedVoice === v.id;
                return (
                  <div
                    key={v.id}
                    id={`voice-select-${v.id}`}
                    onClick={() => onChange({ selectedVoice: v.id })}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border ${
                        isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{v.name}</div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{v.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-950/20 border border-amber-800/40 mb-2">
                <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠️</span>
                <p className="text-[11px] text-amber-300/80 leading-tight">
                  Requires <code className="font-mono">ELEVENLABS_API_KEY</code> in your <code className="font-mono">.env</code> file.
                  Each character is pre-mapped to an ElevenLabs voice optimized for their biblical role.
                </p>
              </div>
              {ELEVENLABS_BRIDGE_VOICES.map((v) => {
                const isSelected = project.selectedVoice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => onChange({ selectedVoice: v.id as any })}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base mt-0.5 shrink-0">{v.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{v.character}</div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{v.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Emotional Tone & Delivery */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Emotional Tone &amp; Vocal Temperament
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map((emo) => (
                <button
                  key={emo.id}
                  type="button"
                  id={`emotion-${emo.id}`}
                  onClick={() => onChange({ speechEmotion: emo.id as any })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors flex items-center justify-between ${
                    project.speechEmotion === emo.id
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{emo.label}</span>
                  <span>{emo.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtitles setting */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Display On-Screen Captions
              </label>
              <input
                id="toggle-subtitles"
                type="checkbox"
                checked={project.showSubtitles}
                onChange={(e) => onChange({ showSubtitles: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 w-4 h-4 cursor-pointer"
              />
            </div>

            {project.showSubtitles && (
              <div className="flex gap-1.5 pt-1">
                {(['glass_pill', 'retro_terminal', 'comic_bubble', 'minimal'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onChange({ subtitleStyle: style })}
                    className={`flex-1 py-1 text-[10px] font-medium rounded capitalize border transition-colors ${
                      project.subtitleStyle === style
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {style.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Modulation Rack (Pitch & Speed Controls) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Voice Modulation Rack
          </h4>
          <span className="text-[11px] text-indigo-300 font-mono">
            Pitch: {(project.voicePitch ?? 1.0).toFixed(2)}x | Speed: {(project.voiceSpeed ?? 1.0).toFixed(2)}x
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Pitch Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span className="flex items-center gap-1">
                <Music2 className="w-3.5 h-3.5 text-indigo-400" />
                Vocal Pitch (Resampling)
              </span>
              <span className="text-slate-400 text-[11px]">
                {getPitchDescription(project.voicePitch ?? 1.0)}
              </span>
            </div>
            <input
              id="slider-voice-pitch"
              type="range"
              min="0.5"
              max="1.7"
              step="0.05"
              value={project.voicePitch ?? 1.0}
              onChange={(e) => onChange({ voicePitch: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.5x (Deep Commander)</span>
              <span>1.0x (Original)</span>
              <span>1.7x (Pixie/High)</span>
            </div>
          </div>

          {/* Speed / Tempo Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                Speaking Speed / Tempo
              </span>
              <span className="text-slate-400 text-[11px]">
                {getSpeedDescription(project.voiceSpeed ?? 1.0)}
              </span>
            </div>
            <input
              id="slider-voice-speed"
              type="range"
              min="0.6"
              max="1.6"
              step="0.05"
              value={project.voiceSpeed ?? 1.0}
              onChange={(e) => onChange({ voiceSpeed: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.6x (Deliberate)</span>
              <span>1.0x (Normal)</span>
              <span>1.6x (Hype/Fast)</span>
            </div>
          </div>
        </div>

        {/* Quick Pitch Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-400">Modulation Presets:</span>
          <button
            type="button"
            onClick={() => onChange({ voicePitch: 0.75, voiceSpeed: 0.9 })}
            className="px-2 py-0.5 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition-colors"
          >
            Deep Titan (0.75x)
          </button>
          <button
            type="button"
            onClick={() => onChange({ voicePitch: 1.0, voiceSpeed: 1.0 })}
            className="px-2 py-0.5 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition-colors"
          >
            Natural Neutral (1.0x)
          </button>
          <button
            type="button"
            onClick={() => onChange({ voicePitch: 1.25, voiceSpeed: 1.15 })}
            className="px-2 py-0.5 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition-colors"
          >
            Animated Mascot (1.25x)
          </button>
          <button
            type="button"
            onClick={() => onChange({ voicePitch: 1.5, voiceSpeed: 1.2 })}
            className="px-2 py-0.5 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition-colors"
          >
            Pixie / Chipmunk (1.5x)
          </button>

          {project.voiceAudioUrl && (
            <button
              id="btn-apply-modulation"
              type="button"
              disabled={isModulating}
              onClick={handleApplyModulation}
              className="ml-auto px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isModulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-300" />}
              Apply &amp; Re-Render Audio
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {project.modulatedAudioUrl || project.voiceAudioUrl ? (
            <>
              <button
                id="btn-play-voice-preview"
                type="button"
                onClick={() => togglePlayback(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {isPlayingModulated ? (
                  <Square className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {isPlayingModulated ? 'Stop Modulated Playback' : 'Play Modulated Voice'}
              </button>

              <button
                id="btn-play-original-voice"
                type="button"
                onClick={() => togglePlayback(false)}
                className="px-2.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg border border-slate-800 transition-colors cursor-pointer"
                title="Play raw unmodulated voice"
              >
                {isPlaying ? 'Stop Original' : 'Play Raw Original'}
              </button>

              {onPrePlayIntro && (
                <button
                  id="btn-voice-preplay-live-intro"
                  type="button"
                  onClick={() => onPrePlayIntro('all')}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  title="Pre-play live in-app intro sequence with this voice & avatar"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Pre-Play in Intro</span>
                </button>
              )}

              {onSaveAssetToProject && (
                <button
                  type="button"
                  onClick={handleSaveToProjectFolder}
                  disabled={hasSavedVoice}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    hasSavedVoice
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {hasSavedVoice ? <Check className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{hasSavedVoice ? 'Saved to Project' : 'Save Voiceover to Project Folder'}</span>
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Click Synthesize to generate speech for your avatar
            </span>
          )}
        </div>

        <button
          id="btn-synthesize-voice"
          type="button"
          disabled={isSynthesizing || !project.dialogueText.trim()}
          onClick={handleSynthesize}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-600/30 transition-all cursor-pointer"
        >
          {isSynthesizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Synthesizing Voice &amp; Modulating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Synthesize Speech (Gemini Flash TTS)
            </>
          )}
        </button>
      </div>

      <LiveVoiceConversation
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
    </div>
  );
};
