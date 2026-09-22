import React, { useState, useEffect } from 'react';
import { StudioProject } from '../types.ts';
import { soundEngine } from '../utils/audioSynth.ts';
import {
  Play,
  Square,
  RotateCcw,
  Smartphone,
  Monitor,
  Gamepad2,
  Maximize2,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface AppIntroPlayerProps {
  project: StudioProject;
  autoPlayKey?: number;
  initialFocusMode?: 'all' | 'avatar_voice_only';
  onClose?: () => void;
  isCompact?: boolean;
  onNavigateScreen?: (screen: 'avatar' | 'voice' | 'background' | 'music') => void;
}

export const AppIntroPlayer: React.FC<AppIntroPlayerProps> = ({
  project,
  autoPlayKey,
  initialFocusMode = 'all',
  onClose,
  isCompact = false,
  onNavigateScreen,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [captionProgress, setCaptionProgress] = useState(0);
  const [deviceView, setDeviceView] = useState<'mobile' | 'web_modal' | 'cutscene' | 'fullscreen'>(
    isCompact ? 'mobile' : 'mobile'
  );
  const [focusMode, setFocusMode] = useState<'all' | 'avatar_voice_only'>(initialFocusMode);

  // Sync focus mode when initialFocusMode prop changes
  useEffect(() => {
    if (initialFocusMode) {
      setFocusMode(initialFocusMode);
    }
  }, [initialFocusMode]);

  const startIntroSequence = () => {
    // Only play background music if not in avatar_voice_only focus mode
    if (focusMode === 'all') {
      soundEngine.playMusicTrack(project.musicTrackId);
    } else {
      soundEngine.stopMusic();
    }

    // Play voiceover if available (modulated preferred)
    const voiceToPlay = project.modulatedAudioUrl || project.voiceAudioUrl;
    if (voiceToPlay) {
      soundEngine.playVoiceover(voiceToPlay, () => {
        // Dialogue finished
      });
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && project.dialogueText) {
      // Fallback voice audition if Gemini audio not synthesized yet
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(project.dialogueText);
      utter.rate = project.voiceSpeed || 1.0;
      utter.pitch = project.voicePitch || 1.0;
      window.speechSynthesis.speak(utter);
    }

    setIsPlaying(true);
    setCurrentCaption(project.dialogueText);
  };

  const stopIntroSequence = () => {
    soundEngine.stopMusic();
    soundEngine.stopVoiceover();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCaptionProgress(0);
  };

  // Trigger autoplay when autoPlayKey changes and is positive
  useEffect(() => {
    if (autoPlayKey && autoPlayKey > 0) {
      stopIntroSequence();
      const timer = setTimeout(() => {
        startIntroSequence();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoPlayKey]);

  // Animate typewriter/subtitle progression when playing
  useEffect(() => {
    if (!isPlaying) {
      setCurrentCaption(project.dialogueText);
      return;
    }

    let charIndex = 0;
    const fullText = project.dialogueText;
    const speed = Math.max(25, 75 / (project.voiceSpeed || 1.0));

    const interval = setInterval(() => {
      charIndex++;
      if (charIndex <= fullText.length) {
        setCurrentCaption(fullText.slice(0, charIndex));
        setCaptionProgress(charIndex / fullText.length);
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, project.dialogueText, project.voiceSpeed]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopMusic();
      soundEngine.stopVoiceover();
    };
  }, []);

  // Avatar position styles
  const getAvatarPositionClasses = () => {
    switch (project.avatarPose) {
      case 'left':
        return 'items-end justify-start pl-6 sm:pl-12';
      case 'right':
        return 'items-end justify-end pr-6 sm:pr-12';
      case 'center':
      default:
        return 'items-end justify-center';
    }
  };

  // Background animation styles
  const getBackgroundAnimStyle = () => {
    if (!isPlaying) return {};
    switch (project.backgroundAnimation) {
      case 'zoom':
        return { animation: 'introZoom 12s ease-in-out infinite alternate' };
      case 'pan':
        return { animation: 'introPan 16s ease-in-out infinite alternate' };
      case 'pulse':
        return { animation: 'introPulse 4s ease-in-out infinite' };
      default:
        return {};
    }
  };

  return (
    <div id="app-intro-player" className="space-y-4">
      {/* Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="btn-play-intro-sequence"
            type="button"
            onClick={() => (isPlaying ? stopIntroSequence() : startIntroSequence())}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause Intro' : 'Run Full App Intro Scene'}
          </button>

          <button
            type="button"
            onClick={() => {
              stopIntroSequence();
              setTimeout(() => startIntroSequence(), 100);
            }}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg border border-slate-700 transition-colors"
            title="Restart intro sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {isPlaying && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium ml-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live In-App Intro Active
            </span>
          )}
        </div>

        {/* Device Viewport Modes */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Focus Mode: Full Scene vs Solo Avatar & Voice */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              id="mode-full-scene"
              type="button"
              onClick={() => {
                setFocusMode('all');
                if (isPlaying) {
                  soundEngine.playMusicTrack(project.musicTrackId);
                }
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                focusMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Full Scene
            </button>
            <button
              id="mode-solo-avatar-voice"
              type="button"
              onClick={() => {
                setFocusMode('avatar_voice_only');
                soundEngine.stopMusic();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                focusMode === 'avatar_voice_only' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Audition only the avatar figure and voice with clean studio spotlight"
            >
              <Volume2 className="w-3 h-3 text-teal-300" />
              Solo Avatar &amp; Voice
            </button>
          </div>

          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              id="view-mode-mobile"
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
            <button
              id="view-mode-modal"
              type="button"
              onClick={() => setDeviceView('web_modal')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'web_modal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Web
            </button>
            <button
              id="view-mode-cutscene"
              type="button"
              onClick={() => setDeviceView('cutscene')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'cutscene' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Cutscene
            </button>
            <button
              id="view-mode-fullscreen"
              type="button"
              onClick={() => setDeviceView('fullscreen')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceView === 'fullscreen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Full
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                stopIntroSequence();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview Player"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Casting & Tuning Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-slate-900/50 rounded-xl border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            Live App Cast:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Avatar:</span>
            <span className="font-medium text-indigo-300">{project.avatarStyle}</span>
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('avatar')}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline ml-0.5 cursor-pointer"
              >
                Edit Look
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Voice:</span>
            <span className="font-medium text-sky-300">{project.selectedVoice} ({project.speechEmotion})</span>
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('voice')}
                className="text-[10px] text-sky-400 hover:text-sky-300 underline ml-0.5 cursor-pointer"
              >
                Tune Voice
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Scene:</span>
            <span className="font-medium text-emerald-300 capitalize">{project.backgroundMode}</span>
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('background')}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline ml-0.5 cursor-pointer"
              >
                Swap Scene
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Soundtrack:</span>
            <span className="font-medium text-pink-300 capitalize">{project.musicTrackId.replace(/_/g, ' ')}</span>
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('music')}
                className="text-[10px] text-pink-400 hover:text-pink-300 underline ml-0.5 cursor-pointer"
              >
                Change Music
              </button>
            )}
          </div>
        </div>

        {/* Focus Mode Indicator */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
            {focusMode === 'all' ? 'Full Intro Mode' : 'Solo Avatar + Voice Mode'}
          </span>
        </div>
      </div>

      {/* Stage Container */}
      <div className="w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 rounded-2xl border border-slate-800 min-h-[460px] overflow-hidden relative">
        {/* Mobile Device Frame */}
        {deviceView === 'mobile' && (
          <div className="w-[320px] h-[580px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
            {/* Phone Speaker & Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800 mr-2" />
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="w-full h-full rounded-[28px] overflow-hidden relative flex flex-col justify-between">
              {/* Background Layer */}
              {focusMode === 'avatar_voice_only' ? (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-[#070a12] flex items-center justify-center overflow-hidden">
                  <div className="w-56 h-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 to-transparent" />
                  <div className="absolute top-12 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-teal-300 font-medium z-10">
                    Solo Avatar &amp; Voice Audition
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={project.backgroundUrl}
                    alt="App background"
                    referrerPolicy="no-referrer"
                    style={getBackgroundAnimStyle()}
                    className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
                </>
              )}

              {/* App Brand Header */}
              <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold tracking-wide drop-shadow-md">{project.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-slate-300">
                  v1.0 Intro
                </span>
              </div>

              {/* Avatar Layer */}
              <div className={`relative z-10 w-full flex-1 flex ${getAvatarPositionClasses()}`}>
                <div
                  className={`relative max-w-[210px] max-h-[300px] transition-transform duration-300 ${
                    isPlaying ? 'scale-105 animate-bounce-subtle' : ''
                  }`}
                >
                  <img
                    src={project.avatarUrl}
                    alt="App avatar mascot"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                  />
                  {isPlaying && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-500/90 text-white text-[9px] font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm animate-pulse">
                      <Volume2 className="w-2.5 h-2.5" />
                      Speaking
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitles & Action Footer */}
              <div className="relative z-20 p-4 space-y-2">
                {project.showSubtitles && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-center">
                    <p className="text-xs text-slate-100 font-medium leading-relaxed">
                      "{currentCaption}"
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  Get Started →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Web Modal Frame */}
        {deviceView === 'web_modal' && (
          <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative flex flex-col">
            {/* Browser top chrome */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                https://app.workspace.io/onboarding
              </span>
              <span className="text-xs text-slate-400">✕</span>
            </div>

            {/* Modal Interior */}
            <div className="relative h-[380px] flex items-center justify-between p-6 overflow-hidden">
              {focusMode === 'avatar_voice_only' ? (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-[#070a12] flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                </div>
              ) : (
                <>
                  <img
                    src={project.backgroundUrl}
                    alt="App background"
                    referrerPolicy="no-referrer"
                    style={getBackgroundAnimStyle()}
                    className="absolute inset-0 w-full h-full object-cover select-none opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                </>
              )}

              {/* Left Column: Onboarding Copy */}
              <div className="relative z-10 max-w-sm space-y-3">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  Welcome to {project.title}
                </span>
                <h2 className="text-xl font-bold text-white leading-tight">
                  Your Digital Avatar Assistant is Ready.
                </h2>
                {project.showSubtitles && (
                  <p className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 p-3 rounded-xl leading-relaxed">
                    "{currentCaption}"
                  </p>
                )}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    Enter Application
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Tour Features
                  </button>
                </div>
              </div>

              {/* Right Column: Avatar Figure */}
              <div className="relative z-10 w-64 h-72 flex items-end justify-center">
                <img
                  src={project.avatarUrl}
                  alt="Avatar figure"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] ${
                    isPlaying ? 'scale-105 transition-transform' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Game Cutscene Frame */}
        {deviceView === 'cutscene' && (
          <div className="w-full max-w-3xl aspect-[16/9] bg-black rounded-xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col justify-between">
            {/* Cinematic Background */}
            {focusMode === 'avatar_voice_only' ? (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              </div>
            ) : (
              <>
                <img
                  src={project.backgroundUrl}
                  alt="Cutscene scene"
                  referrerPolicy="no-referrer"
                  style={getBackgroundAnimStyle()}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
              </>
            )}

            {/* Top Cutscene Bar */}
            <div className="relative z-10 p-4 flex justify-between items-center text-white">
              <span className="font-mono text-xs text-indigo-400 uppercase tracking-widest">
                [ACT 1: THE AWAKENING]
              </span>
              <span className="text-[10px] text-slate-400">PRESS SPACE TO SKIP</span>
            </div>

            {/* Cutscene Avatar Character Sprite */}
            <div className={`relative z-10 w-full flex-1 flex ${getAvatarPositionClasses()}`}>
              <div className="h-64 sm:h-72">
                <img
                  src={project.avatarUrl}
                  alt="Character sprite"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] ${
                    isPlaying ? 'animate-bounce-subtle' : ''
                  }`}
                />
              </div>
            </div>

            {/* Bottom RPG Dialogue Box */}
            <div className="relative z-20 p-4">
              <div className="bg-slate-950/90 border-2 border-indigo-500/60 rounded-xl p-3.5 backdrop-blur-md shadow-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {project.selectedVoice} (Companion)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Tone: {project.speechEmotion}
                  </span>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed font-sans">
                  {currentCaption}
                  {isPlaying && <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-1 animate-pulse" />}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Stage Frame */}
        {deviceView === 'fullscreen' && (
          <div className="w-full aspect-[16/9] max-h-[500px] bg-slate-950 rounded-xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col justify-end">
            {focusMode === 'avatar_voice_only' ? (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              </div>
            ) : (
              <>
                <img
                  src={project.backgroundUrl}
                  alt="Full background"
                  referrerPolicy="no-referrer"
                  style={getBackgroundAnimStyle()}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />
              </>
            )}

            <div className={`relative z-10 w-full flex ${getAvatarPositionClasses()}`}>
              <img
                src={project.avatarUrl}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="max-h-[380px] object-contain drop-shadow-2xl"
              />
            </div>

            {project.showSubtitles && (
              <div className="relative z-20 p-6 flex justify-center">
                <div className="px-5 py-2.5 rounded-full bg-slate-950/80 backdrop-blur-lg border border-slate-700/60 text-slate-100 text-sm shadow-xl max-w-xl text-center">
                  "{currentCaption}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
