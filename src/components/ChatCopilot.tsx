import React, { useState, useRef, useEffect } from 'react';
import { StudioProject, ChatMessage, ChatRole, GeminiModel } from '../types.ts';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  Wand2,
  Layers,
  User,
  Volume2,
  Music,
  Copy,
  Check,
  Globe,
  Mic,
  Square,
  ExternalLink,
  Film,
  Palette,
} from 'lucide-react';

interface ChatCopilotProps {
  project: StudioProject;
  onApplyProjectUpdate: (updates: Partial<StudioProject>) => void;
  onClose?: () => void;
  initialRole?: string;
}

const ROLES: { id: ChatRole; label: string; systemInstruction: string; icon: any }[] = [
  {
    id: 'intro_director',
    label: 'App Intro Director',
    icon: Wand2,
    systemInstruction:
      'You are the Executive Intro Scene Director for modern apps and games. Your job is to help the user craft compelling app opening sequences, welcome screens, splash animations, and cutscenes. Suggest cohesive themes, lighting, background aesthetics, avatar poses, and voiceover scripts. When suggesting a background prompt, start with "[BACKGROUND_PROMPT]: ". When suggesting an avatar concept, start with "[AVATAR_PROMPT]: ". When suggesting a voice line, start with "[SCRIPT]: ".',
  },
  {
    id: 'video_director',
    label: 'Veo Video Director',
    icon: Film,
    systemInstruction:
      'You are a Cinematic Director specializing in Veo 3 video cutscenes, motion camera paths, and animated photo transitions. Craft cinematic prompts specifying lens focal length, volumetric lighting, motion speed, and framing for 16:9 and 9:16 aspect ratios. When suggesting a video prompt, start with "[VIDEO_PROMPT]: ".',
  },
  {
    id: 'avatar_designer',
    label: 'Avatar Wardrobe Stylist',
    icon: User,
    systemInstruction:
      'You are a premier Character and Avatar Wardrobe Stylist for game avatars, mobile mascots, and UI companions. You specialize in unique hairstyles, clothing combinations (jackets, suits, hoodies, armor), accessories (visors, glasses, headsets, jewelry), and distinct body types. Provide detailed visual prompts suitable for transparent app cutouts and high-resolution generation. When suggesting an avatar prompt, format it clearly starting with "[AVATAR_PROMPT]: ".',
  },
  {
    id: 'dialogue_writer',
    label: 'Dialogue & Scriptwriter',
    icon: Volume2,
    systemInstruction:
      'You are an award-winning voiceover scriptwriter for mobile apps, SaaS onboarding, game cutscenes, and virtual assistants. Write concise, charismatic lines that fit within 5 to 15 seconds. Recommend voice actors (Kore, Puck, Charon, Fenrir, Zephyr), emotional tones, and pitch/tempo settings. When providing a dialogue script, start with "[SCRIPT]: ".',
  },
  {
    id: 'background_artist',
    label: 'World & Scene Artist',
    icon: Layers,
    systemInstruction:
      'You are an Environment Concept Artist specializing in 1K, 2K, and 4K ultra-wide and mobile backdrops (cyberpunk, synthwave, modern clean tech, fantasy, pixel art). Provide vivid visual prompts with depth, lighting, and color theory. When suggesting a background prompt, start with "[BACKGROUND_PROMPT]: ".',
  },
  {
    id: 'music_composer',
    label: 'Soundtrack & Audio Designer',
    icon: Music,
    systemInstruction:
      'You are an Audio Director and Composer. You guide users on background music tempos (BPM), Lyria generation styles (clip vs pro), synthesizers, sound design cues, and vocal modulation (pitch and speed) to evoke the exact emotion for their application intro.',
  },
  {
    id: 'ui_designer',
    label: 'UI Art & Icon Designer',
    icon: Palette,
    systemInstruction:
      'You are a World-Class UI/UX Visual Designer and App Icon Specialist. You design squircle app icons, feature cards, achievement badges, and store splash banners. When suggesting a background prompt, start with "[BACKGROUND_PROMPT]: ". When suggesting an avatar concept, start with "[AVATAR_PROMPT]: ".',
  },
];

const MODELS: { id: GeminiModel; label: string; desc: string }[] = [
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash (General & Search)',
    desc: 'Recommended for general creative tasks & Google Search Grounding',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro (Complex Tasks)',
    desc: 'Complex tasks, deep reasoning, cinematic direction & architecture',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite (Fast)',
    desc: 'Ultra-fast ideation & rapid script generation',
  },
];

const QUICK_STARTERS = [
  'Design a cyberpunk hacker app intro with neon glow',
  'Write an onboarding welcome script for a finance wallet',
  'Prompt for a 9:16 portrait video cutscene with Veo 3',
  'Suggest latest 2026 UI trends with search grounding',
];

export const ChatCopilot: React.FC<ChatCopilotProps> = ({
  project,
  onApplyProjectUpdate,
  onClose,
  initialRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(initialRole || 'intro_director');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Audio transcription recording state
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am your AI Studio Creative Copilot. I can help you design custom avatars, write voice scripts, generate 1K-4K backgrounds, produce Veo 3 video cutscenes, and research live web design trends. What kind of app or scene are you creating?`,
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Audio Recording with Microphone and transcribe with gemini-3.5-transcribe
  const toggleMicRecording = async () => {
    if (isRecordingMic) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecordingMic(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            setIsLoading(true);
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.transcript) {
              setInputMessage((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
            }
          } catch (err) {
            console.warn('Transcribe error:', err);
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecordingMic(true);
    } catch (err) {
      console.warn('Mic access error:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    const currentRoleObj = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: useSearchGrounding ? 'gemini-3.5-flash' : selectedModel,
          systemInstruction: currentRoleObj.systemInstruction,
          useSearchGrounding,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      const assistantReply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'I have analyzed your request.',
        groundingMetadata: data.groundingMetadata || null,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err?.message || 'Could not reach Gemini. Please verify your GEMINI_API_KEY.'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. Choose a role, toggle Search Grounding, or ask me to generate avatar ideas, scripts, or background concepts!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const extractActions = (content: string) => {
    const actions: { type: 'bg' | 'avatar' | 'script'; label: string; text: string }[] = [];

    const bgMatch = content.match(/\[BACKGROUND_PROMPT\]:\s*([^\n\r]+)/i);
    if (bgMatch && bgMatch[1]) {
      actions.push({ type: 'bg', label: 'Apply as Background Prompt', text: bgMatch[1].trim() });
    }

    const avatarMatch = content.match(/\[AVATAR_PROMPT\]:\s*([^\n\r]+)/i);
    if (avatarMatch && avatarMatch[1]) {
      actions.push({ type: 'avatar', label: 'Apply as Avatar Concept', text: avatarMatch[1].trim() });
    }

    const scriptMatch = content.match(/\[SCRIPT\]:\s*([^\n\r]+)/i);
    if (scriptMatch && scriptMatch[1]) {
      actions.push({ type: 'script', label: 'Apply as Dialogue Script', text: scriptMatch[1].trim() });
    }

    return actions;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  return (
    <div
      id="gemini-chat-copilot"
      className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Gemini Copilot
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-400">Multi-turn Assistant with Role Specialization</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-clear-chat-history"
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Role & Model Selectors */}
        <div className="grid grid-cols-2 gap-2">
          {/* Role selector */}
          <div className="relative">
            <select
              id="chat-role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-2 pr-6 py-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  Role: {role.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Model selector */}
          <div className="relative">
            <select
              id="chat-model-select"
              value={useSearchGrounding ? 'gemini-3.5-flash' : selectedModel}
              disabled={useSearchGrounding}
              onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
              className="w-full pl-2 pr-6 py-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer font-mono disabled:opacity-60"
            >
              {MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Google Search Grounding Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <button
            id="toggle-search-grounding"
            type="button"
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
              useSearchGrounding
                ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className={`w-3 h-3 ${useSearchGrounding ? 'text-blue-400 animate-pulse' : ''}`} />
            Google Search Grounding (gemini-3.5-flash)
          </button>
          {useSearchGrounding && (
            <span className="text-[10px] text-blue-400 font-mono">Live Web Data Active</span>
          )}
        </div>
      </div>

      {/* Message Thread (Scrollable) */}
      <div id="chat-messages-thread" className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const actions = !isUser ? extractActions(msg.content) : [];
          const grounding = msg.groundingMetadata;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                {/* Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding Sources (if Search Grounding was active) */}
                {grounding && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5">
                    {grounding.webSearchQueries && grounding.webSearchQueries.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-blue-300">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span className="font-semibold">Searched:</span>
                        {grounding.webSearchQueries.map((q, idx) => (
                          <span key={idx} className="bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/60">
                            {q}
                          </span>
                        ))}
                      </div>
                    )}
                    {grounding.groundingChunks && grounding.groundingChunks.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Sources:</span>
                        <div className="flex flex-wrap gap-1">
                          {grounding.groundingChunks.map((chunk, idx) => {
                            if (!chunk.web?.uri) return null;
                            return (
                              <a
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-blue-300 hover:border-blue-800 transition"
                              >
                                <span className="truncate max-w-[140px]">
                                  {chunk.web.title || chunk.web.uri}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Extracted Action Chips */}
                {actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {actions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (act.type === 'bg') {
                            onApplyProjectUpdate({ backgroundPrompt: act.text, backgroundMode: 'ai' });
                          } else if (act.type === 'avatar') {
                            onApplyProjectUpdate({ avatarPrompt: act.text, avatarMode: 'ai' });
                          } else if (act.type === 'script') {
                            onApplyProjectUpdate({ dialogueText: act.text });
                          }
                        }}
                        className="text-[10px] font-semibold px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="hover:text-slate-300 ml-1"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 max-w-[80%]">
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>
              {useSearchGrounding
                ? 'Gemini is querying Google Search & synthesizing grounded response...'
                : 'Gemini is generating response...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starters */}
      <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] text-slate-400 shrink-0">Try:</span>
        {QUICK_STARTERS.map((starter, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(starter)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Input Form with Audio Transcribe Recording */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleMicRecording}
          title={isRecordingMic ? 'Stop recording & transcribe' : 'Dictate with microphone (gemini-3.5-transcribe)'}
          className={`p-2 rounded-xl border transition ${
            isRecordingMic
              ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          {isRecordingMic ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          id="chat-input-field"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask the ${currentRole.label}...`}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />

        <button
          id="btn-chat-send"
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
