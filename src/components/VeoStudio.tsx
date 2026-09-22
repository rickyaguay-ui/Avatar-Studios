import React, { useState, useRef, useEffect } from 'react';
import { StudioProject, ProjectAsset } from '../types.ts';
import {
  Film,
  Sparkles,
  Upload,
  Play,
  Pause,
  Download,
  FolderPlus,
  RefreshCw,
  Sliders,
  Maximize2,
  Video,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface VeoStudioProps {
  project: StudioProject;
  onSaveAssetToProject?: (asset: ProjectAsset) => void;
}

export const VeoStudio: React.FC<VeoStudioProps> = ({ project, onSaveAssetToProject }) => {
  const [mode, setMode] = useState<'text_to_video' | 'image_to_video'>('text_to_video');
  const [prompt, setPrompt] = useState(
    'Cinematic hyper-detailed cutscene pan with volumetric lighting and floating dust motes'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [sourceImage, setSourceImage] = useState<string>(project.avatarUrl || project.backgroundUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollTimerRef = useRef<any>(null);

  // Suggested Prompts for App Intro & Cutscene
  const SUGGESTED_PROMPTS = [
    'Cinematic slow-motion pan revealing an epic sci-fi city with neon hologram billboards',
    'Dynamic camera orbiting character as digital particles swirl and assemble the app UI',
    'Fast-paced dramatic intro cutscene with atmospheric fog and lens flare lighting',
    'Calm meditative sunrise over minimalist architectural water pavilion, gentle ripple effects',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSourceImage(reader.result);
          setMode('image_to_video');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startVideoGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setVideoUrl(null);
    setGenerationStep('Initiating generation with veo-3.1-fast-generate-preview...');

    try {
      const payload: any = {
        prompt,
        aspectRatio,
        resolution,
      };

      if (mode === 'image_to_video' && sourceImage) {
        payload.imageUrl = sourceImage;
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      const opName = data.operationName;
      setOperationName(opName);
      setGenerationStep('Synthesizing frames & temporal vectors (this takes 1-2 minutes)...');

      // Begin polling operation
      pollOperation(opName);
    } catch (err: any) {
      console.error('Veo video generation error:', err);
      setErrorMsg(err?.message || 'Error occurred while starting video generation');
      setIsGenerating(false);
    }
  };

  const pollOperation = (opName: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    let attempts = 0;
    const reassuringMessages = [
      'Synthesizing frames & camera trajectory...',
      'Computing neural motion interpolation...',
      'Rendering high-fidelity textures & lighting...',
      'Assembling final MP4 stream...',
    ];

    pollTimerRef.current = setInterval(async () => {
      attempts++;
      setGenerationStep(reassuringMessages[attempts % reassuringMessages.length]);

      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const data = await res.json();
        if (data.done) {
          clearInterval(pollTimerRef.current);
          if (data.error) {
            throw new Error(data.error?.message || 'Video generation failed');
          }

          setGenerationStep('Downloading compiled video stream...');
          await downloadVideo(opName);
        }
      } catch (err: any) {
        console.warn('Polling status check error:', err);
        if (attempts > 40) {
          clearInterval(pollTimerRef.current);
          setErrorMsg('Video generation timed out or failed. Please check your connection.');
          setIsGenerating(false);
        }
      }
    }, 5000);
  };

  const downloadVideo = async (opName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!res.ok) {
        throw new Error('Failed to stream video');
      }

      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      setVideoUrl(localUrl);
      setIsGenerating(false);
      setGenerationStep('');
    } catch (err: any) {
      console.error('Download video error:', err);
      setErrorMsg('Failed to download completed video stream');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handleSaveToProject = () => {
    if (!videoUrl) return;
    const now = Date.now();
    const newAsset: ProjectAsset = {
      id: `asset_video_${now}`,
      projectId: project.projectId || 'proj_active',
      name: `${project.title || 'App'} Veo Cutscene`,
      folder: 'video',
      type: 'video',
      url: videoUrl,
      prompt,
      specs: {
        aspectRatio,
        resolution,
        format: 'mp4',
        videoModel: 'veo-3.1-fast-generate-preview',
      },
      isStyleAnchor: false,
      createdAt: now,
      tags: ['veo', 'cutscene', aspectRatio, mode],
    };

    if (onSaveAssetToProject) {
      onSaveAssetToProject(newAsset);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div id="veo-studio-container" className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Veo Video Studio</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              veo-3.1-fast-generate-preview
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Generate high-fidelity app intro videos and animate existing photos into video cutscenes with Veo 3.
          </p>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            id="tab-mode-text-to-video"
            onClick={() => setMode('text_to_video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'text_to_video'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Text to Video
          </button>
          <button
            id="tab-mode-image-to-video"
            onClick={() => setMode('image_to_video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              mode === 'image_to_video'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Animate Photo / Image
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Controls + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Source Image Selector (for Image to Video) */}
          {mode === 'image_to_video' && (
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 space-y-3">
              <label className="text-xs font-semibold text-neutral-300 block">
                Starting Photo / Scene to Animate:
              </label>

              <div className="flex items-center gap-4">
                {sourceImage ? (
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
                    <img
                      src={sourceImage}
                      alt="Source"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-20 rounded-lg border border-dashed border-neutral-700 flex items-center justify-center text-neutral-500 text-[10px]">
                    No Image Selected
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      id="btn-upload-photo-veo"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo
                    </button>
                    {project.avatarUrl && (
                      <button
                        onClick={() => setSourceImage(project.avatarUrl)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 text-xs font-medium"
                      >
                        Use Current Avatar
                      </button>
                    )}
                    {project.backgroundUrl && (
                      <button
                        onClick={() => setSourceImage(project.backgroundUrl)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 text-xs font-medium"
                      >
                        Use Background
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">
              {mode === 'image_to_video' ? 'Animation & Motion Prompt:' : 'Veo Video Prompt:'}
            </label>
            <textarea
              id="input-veo-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition leading-relaxed resize-none"
              placeholder="Describe camera angles, lighting, environment dynamics, and action..."
            />

            {/* Prompt presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-neutral-400 font-medium">Quick Prompts:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p)}
                    className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 text-left transition truncate max-w-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Video Specs: Aspect Ratio & Resolution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Aspect Ratio (Mandatory 16:9 or 9:16):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-aspect-16-9"
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    aspectRatio === '16:9'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  16:9 (Landscape)
                </button>
                <button
                  id="btn-aspect-9-16"
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    aspectRatio === '9:16'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  9:16 (Portrait)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">Resolution:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setResolution('720p')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    resolution === '720p'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  720p HD
                </button>
                <button
                  onClick={() => setResolution('1080p')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    resolution === '1080p'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  1080p FHD
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            id="btn-generate-veo-video"
            onClick={startVideoGeneration}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering Veo Video...
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                {mode === 'image_to_video' ? 'Animate Image with Veo 3' : 'Generate Veo Video'}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Player / Render Status */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Film className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Veo 3 Engine Active</h4>
                  <p className="text-xs text-neutral-400 max-w-sm">{generationStep}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Veo fast generation model processing</span>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                <div
                  className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center ${
                    aspectRatio === '9:16' ? 'w-56 h-96' : 'w-full aspect-video'
                  }`}
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    loop={isLooping}
                    autoPlay
                    playsInline
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Video controls */}
                <div className="flex items-center justify-between w-full pt-2 px-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">
                      {aspectRatio} • {resolution}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={videoUrl}
                      download="veo_cutscene.mp4"
                      className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download MP4
                    </a>

                    <button
                      id="btn-save-video-to-project"
                      onClick={handleSaveToProject}
                      className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                    >
                      {savedSuccess ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <FolderPlus className="w-3.5 h-3.5" />
                          Save to Project
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2 text-neutral-500">
                <Film className="w-12 h-12 mx-auto stroke-1 text-neutral-600" />
                <h4 className="text-sm font-medium text-neutral-400">No Video Generated Yet</h4>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Enter a prompt or animate a photo to synthesize a full motion video cutscene using Veo 3.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
