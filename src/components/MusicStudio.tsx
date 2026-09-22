import React, { useState, useRef } from 'react';
import { StudioProject, ProjectAsset } from '../types.ts';
import { MUSIC_TRACKS } from '../data/presets.ts';
import { soundEngine } from '../utils/audioSynth.ts';
import {
  Music,
  Play,
  Square,
  Volume2,
  Sparkles,
  Loader2,
  AlertCircle,
  FolderPlus,
  Check,
  Download,
  Sliders,
  AudioWaveform,
} from 'lucide-react';

interface MusicStudioProps {
  project: StudioProject;
  onChange: (updates: Partial<StudioProject>) => void;
  onSaveAssetToProject?: (asset: ProjectAsset) => void;
  onPrePlayIntro?: (focusMode?: 'all' | 'avatar_voice_only') => void;
}

export const MusicStudio: React.FC<MusicStudioProps> = ({
  project,
  onChange,
  onSaveAssetToProject,
  onPrePlayIntro,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isGeneratingLyria, setIsGeneratingLyria] = useState(false);
  const [lyriaModelType, setLyriaModelType] = useState<'clip' | 'pro'>('clip');
  const [lyriaPrompt, setLyriaPrompt] = useState(
    'Cinematic futuristic electronic arpeggio soundtrack for mobile app welcome screen'
  );
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [hasSavedTrack, setHasSavedTrack] = useState(false);
  const [hasSavedLyria, setHasSavedLyria] = useState(false);

  const activeTrackObj =
    MUSIC_TRACKS.find((t) => t.id === project.musicTrackId) || MUSIC_TRACKS[0];

  const handleSaveTrackToProject = () => {
    if (!onSaveAssetToProject) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_music_${now}`,
      projectId: project.projectId || 'proj_active',
      name: `${project.title || 'App'} Soundtrack - ${activeTrackObj.name}`,
      folder: 'music',
      type: 'audio',
      url: `synth://${activeTrackObj.id}`,
      prompt: activeTrackObj.description,
      specs: {
        genre: activeTrackObj.genre,
        bpm: activeTrackObj.bpm,
        volume: project.musicVolume,
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: ['soundtrack', activeTrackObj.genre, `${activeTrackObj.bpm}bpm`],
    };
    onSaveAssetToProject(newAsset);
    setHasSavedTrack(true);
    setTimeout(() => setHasSavedTrack(false), 2000);
  };

  const handleSaveLyriaToProject = () => {
    if (!onSaveAssetToProject || !generatedAudioUrl) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_lyria_${now}`,
      projectId: project.projectId || 'proj_active',
      name: `${project.title || 'App'} Lyria ${lyriaModelType === 'pro' ? 'Pro Track' : 'Clip'}`,
      folder: 'music',
      type: 'audio',
      url: generatedAudioUrl,
      prompt: lyriaPrompt,
      specs: {
        genre: 'AI Generated',
        duration: lyriaModelType === 'clip' ? 30 : 120,
        volume: project.musicVolume,
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: [
        'lyria',
        lyriaModelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview',
        'soundtrack',
      ],
    };
    onSaveAssetToProject(newAsset);
    setHasSavedLyria(true);
    setTimeout(() => setHasSavedLyria(false), 2000);
  };

  const toggleMusic = (trackId?: string) => {
    const idToPlay = trackId || project.musicTrackId;
    if (isPlayingMusic && (!trackId || trackId === project.musicTrackId)) {
      soundEngine.stopMusic();
      setIsPlayingMusic(false);
    } else {
      soundEngine.playMusicTrack(idToPlay);
      setIsPlayingMusic(true);
      if (trackId && trackId !== project.musicTrackId) {
        onChange({ musicTrackId: trackId });
      }
    }
  };

  const handleGenerateLyria = async () => {
    if (!lyriaPrompt.trim()) return;
    setIsGeneratingLyria(true);
    setErrorMessage(null);
    setGeneratedAudioUrl(null);
    setGeneratedLyrics(null);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lyriaPrompt,
          modelType: lyriaModelType,
          imageUrl: project.backgroundUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || (data.error && !data.audioUrl)) {
        throw new Error(data.error || 'Lyria soundtrack generation unavailable.');
      }

      setGeneratedAudioUrl(data.audioUrl);
      if (data.lyrics) setGeneratedLyrics(data.lyrics);
      if (data.notice) setNoticeMessage(data.notice);

      // Play the generated audio
      soundEngine.playVoiceover(data.audioUrl);
    } catch (err: any) {
      setErrorMessage(
        'Lyria music generation quota is currently limited. You can also select our high-fidelity Web Audio synthesized tracks below.'
      );
    } finally {
      setIsGeneratingLyria(false);
    }
  };

  return (
    <div id="music-studio" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            Background Music &amp; Audio Mixer
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate custom AI soundtracks with Lyria (clips or pro tracks) or select dynamic synthesized loops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onPrePlayIntro && (
            <button
              id="btn-music-preplay-live-intro"
              type="button"
              onClick={() => onPrePlayIntro('all')}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Pre-play live app intro with this music soundtrack"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Pre-Play in Intro</span>
            </button>
          )}

          <button
            id="btn-global-music-toggle"
            type="button"
            onClick={() => toggleMusic()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingMusic
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlayingMusic ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlayingMusic ? 'Stop Music Preview' : 'Play Selected Track'}
          </button>
        </div>
      </div>

      {/* Lyria AI Music Generator Section */}
      <div className="bg-slate-900/60 border border-indigo-950/60 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h4 className="text-xs font-bold text-slate-100">Lyria AI Music Generator</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              {lyriaModelType === 'clip' ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview'}
            </span>
          </div>

          {/* Model toggle: Clip vs Pro */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              id="btn-lyria-clip"
              type="button"
              onClick={() => setLyriaModelType('clip')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                lyriaModelType === 'clip'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Clip (up to 30s)
            </button>
            <button
              id="btn-lyria-pro"
              type="button"
              onClick={() => setLyriaModelType('pro')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                lyriaModelType === 'pro'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Track (Pro)
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="lyria-prompt-input"
            type="text"
            value={lyriaPrompt}
            onChange={(e) => setLyriaPrompt(e.target.value)}
            placeholder="E.g. Upbeat 80s synthwave intro soundtrack for mobile app..."
            className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            id="btn-generate-lyria"
            type="button"
            disabled={isGeneratingLyria || !lyriaPrompt.trim()}
            onClick={handleGenerateLyria}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            {isGeneratingLyria ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>
              {isGeneratingLyria
                ? 'Synthesizing Audio Stream...'
                : lyriaModelType === 'clip'
                ? 'Generate 30s Clip'
                : 'Generate Full Track'}
            </span>
          </button>
        </div>

        {noticeMessage && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-lg text-[11px] text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 p-2.5 bg-indigo-950/40 border border-indigo-800/50 rounded-lg text-[11px] text-indigo-300">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Generated Audio Player & Actions */}
        {generatedAudioUrl && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Lyria Generated Audio Stream ({lyriaModelType === 'clip' ? 'Clip' : 'Full Track'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={generatedAudioUrl}
                  download={`lyria_soundtrack_${Date.now()}.wav`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  Download WAV
                </a>
                {onSaveAssetToProject && (
                  <button
                    type="button"
                    onClick={handleSaveLyriaToProject}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    {hasSavedLyria ? (
                      <>
                        <Check className="w-3 h-3" /> Saved!
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3 h-3" /> Save to Project
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <audio src={generatedAudioUrl} controls className="w-full h-8 accent-indigo-500" />

            {generatedLyrics && (
              <div className="text-[11px] text-slate-400 p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1">Generated Lyrics/Notes:</span>
                {generatedLyrics}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Tracks Grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <AudioWaveform className="w-4 h-4 text-indigo-400" />
          Pre-orchestrated Interactive Loops
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MUSIC_TRACKS.map((track) => {
            const isSelected = project.musicTrackId === track.id;
            const isThisPlaying = isPlayingMusic && isSelected;

            return (
              <div
                key={track.id}
                id={`music-track-${track.id}`}
                onClick={() => {
                  onChange({ musicTrackId: track.id });
                  toggleMusic(track.id);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-100">{track.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 uppercase tracking-wider font-mono">
                      {track.bpm} BPM
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{track.mood}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 capitalize">{track.genre}</span>
                  <button
                    type="button"
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      isThisPlaying ? 'text-amber-400' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    {isThisPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isThisPlaying ? 'Playing' : 'Select & Play'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Mixer Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          Soundtrack &amp; Voiceover Volume Mixer
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Background Music Volume</span>
              <span className="font-mono text-slate-200">
                {Math.round(project.musicVolume * 100)}%
              </span>
            </div>
            <input
              id="slider-music-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={project.musicVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange({ musicVolume: val });
                soundEngine.setMusicVolume(val);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Avatar Voiceover Volume</span>
              <span className="font-mono text-slate-200">
                {Math.round(project.voiceVolume * 100)}%
              </span>
            </div>
            <input
              id="slider-voice-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={project.voiceVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange({ voiceVolume: val });
                soundEngine.setVoiceVolume(val);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {onSaveAssetToProject && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
            <button
              type="button"
              onClick={handleSaveTrackToProject}
              disabled={hasSavedTrack}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasSavedTrack
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {hasSavedTrack ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{hasSavedTrack ? 'Saved to Project' : 'Save Track to Project Folder'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
