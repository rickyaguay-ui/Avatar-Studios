import React, { useState } from 'react';
import { StudioProject, ProjectFolder } from '../types.ts';
import {
  Sparkles,
  HelpCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  Bot,
  Lightbulb,
  Check,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export type StudioScreenId =
  | 'architect'
  | 'projects'
  | 'avatar'
  | 'background'
  | 'ui_art'
  | 'voice'
  | 'music'
  | 'video'
  | 'intro_player'
  | 'export';

interface BrainstormIdea {
  title: string;
  description: string;
  promptValue: string;
  tags: string[];
}

interface StudioGuideInfo {
  title: string;
  headline: string;
  description: string;
  steps: { label: string; detail: string }[];
  proTips: string[];
  defaultBrainstorms: BrainstormIdea[];
}

const STUDIO_GUIDES: Record<StudioScreenId, StudioGuideInfo> = {
  architect: {
    title: 'AI App Architect & Production Director',
    headline: 'Decompose high-level app concepts into multi-avatar rosters, distinct voices, scene art, and Claude Code bundles',
    description:
      'Describe your complete app idea in plain words (e.g., "a study app with 4 friendly coaches, calm backdrops and simple icons"). The AI produces a comprehensive plan, edge case mitigations, and ready-to-push GitHub files.',
    steps: [
      {
        label: '1. State Your Comprehensive Vision',
        detail: 'Type your overall app requirements, including target audience, theme, number of avatars, and screen count.',
      },
      {
        label: '2. Review the Multi-Avatar & Voice Roster',
        detail: 'Audition each avatar’s spoken dialogue, verify pitch and speed modulation, and inspect demographic roles.',
      },
      {
        label: '3. Track Production Milestones',
        detail: 'Use the interactive production checklist to verify edge cases, offline audio latency caching, and WCAG AA contrast.',
      },
      {
        label: '4. Export to Claude Code & GitHub',
        detail: 'Copy the self-contained CLAUDE.md and quick-push bash script to hand off directly to your Claude Code CLI.',
      },
    ],
    proTips: [
      'Click "Save to Project Vault" to auto-create a dedicated folder in your project manager populated with all your avatars and scenes.',
      'Use the "Audition Voice" buttons to test voice modulation in real-time before committing to your repository.',
    ],
    defaultBrainstorms: [
      {
        title: 'Study Helper App',
        description: 'A learning app with a few friendly coaches, calm backdrops and simple icons.',
        promptValue: "I'm building a study helper app for college students. I need 4 friendly coaches with different voices, calm backdrops for each main screen, and simple clean icons.",
        tags: ['Education', '4 Avatars', 'Calm'],
      },
      {
        title: 'Fitness Coach App',
        description: 'Short daily workouts led by encouraging coaches.',
        promptValue: "I'm building a fitness app with 3 coaches: one strength, one yoga, one cardio. Each needs a different voice, bright backdrops, and badge icons for streaks.",
        tags: ['Fitness', '3 Avatars', 'Energetic'],
      },
      {
        title: 'Wellness & Meditation App',
        description: 'Gentle guides, quiet scenery and soft music.',
        promptValue: "I'm building a meditation app with 4 gentle guides, calm nature backdrops, soft ambient music, and simple rounded icons.",
        tags: ['Wellness', 'Calm', 'Nature'],
      },
    ],
  },
  avatar: {
    title: 'Avatar & Character Studio',
    headline: 'Design cohesive 2D & 3D mascots, digital hosts, and character avatars',
    description:
      'Generate high-resolution character sprites and app onboarding guides. Use your Project Style Anchor to keep visual consistency across all characters.',
    steps: [
      {
        label: '1. Select Framing & Proportions',
        detail:
          'Choose "Bust Portrait" for app profile icons & chat heads, or "Full Figure" for game sprites and hero mascots.',
      },
      {
        label: '2. Customize Wardrobe & Accessories',
        detail:
          'Combine jackets, hoodies, glasses or hats to match your brand personality.',
      },
      {
        label: '3. Enable Style Primer Lock',
        detail:
          'When Style Lock is ON, your project\'s color palette, lighting rules, and reference anchor are automatically injected.',
      },
      {
        label: '4. Save & Anchor',
        detail:
          'Save successful outputs directly to your Project Folder, or set one as the Master Style Anchor for future generations.',
      },
    ],
    proTips: [
      'Enable "Isolate on Dark Solid Backdrop" if you want to cleanly extract the avatar with no background clutter.',
      'Specify distinct facial expressions (e.g., confident, curious, joyful) to give your avatar emotional warmth.',
    ],
    defaultBrainstorms: [
      {
        title: 'Friendly Welcome Guide',
        description: 'Warm, approachable host for a first-run screen.',
        promptValue: 'Friendly guide with a warm smile, casual sweater, short curly hair, welcoming wave, soft even lighting',
        tags: ['Guide', 'Friendly', 'Welcome'],
      },
      {
        title: 'Professional Advisor',
        description: 'Clean, trustworthy look for a business or finance app.',
        promptValue: 'Polished product advisor in a navy blazer, calm confident expression, neat hair, soft studio lighting',
        tags: ['Business', 'Advisor', 'Host'],
      },
      {
        title: 'Round Mascot',
        description: 'Simple rounded character with a big smile.',
        promptValue: 'Cute round mascot character with big friendly eyes, simple shapes, bright flat colors, waving hello',
        tags: ['Mascot', 'Casual', 'Cute'],
      },
    ],
  },
  background: {
    title: 'Background & Scene Studio',
    headline: 'Generate immersive 1K to 4K widescreen and mobile backdrops',
    description:
      'Create environments that set the atmosphere for your app intro. Choose aspect ratios matching your target device (16:9 for desktop/tablet, 9:16 for mobile).',
    steps: [
      {
        label: '1. Choose Resolution & Aspect Ratio',
        detail:
          'Use 16:9 for widescreen web cutscenes, or 9:16 for vertical TikTok/mobile app onboarding splash screens.',
      },
      {
        label: '2. Apply Depth & Lighting Modifiers',
        detail:
          'Pick soft daylight, warm evening light or dramatic light to match your avatar.',
      },
      {
        label: '3. Test Motion Zoom Animation',
        detail:
          'Toggle subtle slow-zoom or panning animations to bring static backdrops to life during the intro sequence.',
      },
    ],
    proTips: [
      'Keep the center of the backdrop uncluttered so your avatar and dialogue text remain crystal clear.',
      'Select a suggested soundtrack track to preview how sound and scenery complement each other.',
    ],
    defaultBrainstorms: [
      {
        title: 'Sunrise Hills',
        description: 'Warm orange sky over layered hills.',
        promptValue: 'Wide rolling hills at sunrise, warm orange and yellow sky, soft layered shapes, calm and open',
        tags: ['Nature', '16:9', 'Warm'],
      },
      {
        title: 'Bright Workspace',
        description: 'Clean room with natural light and plants.',
        promptValue: 'Bright modern workspace with large windows, soft morning light, a few green plants, clean uncluttered surfaces',
        tags: ['Clean', 'Modern', 'Indoor'],
      },
      {
        title: 'Quiet Lake',
        description: 'Still water and soft mountains.',
        promptValue: 'Calm blue lake with distant soft mountains, clear sky, gentle reflections, peaceful and quiet',
        tags: ['Calm', 'Nature', 'Peaceful'],
      },
    ],
  },
  ui_art: {
    title: 'UI Art & App Icon Studio',
    headline: 'Generate squircles, achievement badges, and store banners',
    description:
      'Craft branded app icons, squircle launcher tiles, store hero headers, and game UI emblems matching your project\'s exact style primer.',
    steps: [
      {
        label: '1. Select UI Format',
        detail:
          'Choose between App Launcher Icon (1:1), Store Splash Banner (16:9), Feature Card (4:3), or Gamification Badge (1:1).',
      },
      {
        label: '2. Review Style Primer Palette',
        detail:
          'Your active project\'s primary, secondary, and accent colors guide the generation for brand harmony.',
      },
      {
        label: '3. Save Directly to Project Bin',
        detail:
          'Filed automatically under your project\'s UI Art folder with complete metadata specs for developer export.',
      },
    ],
    proTips: [
      'For app icons, use concise metaphors like an energetic lightning core, crystal prism, or geometric shield.',
      'Export in PNG format to preserve crisp edge definition on mobile screens.',
    ],
    defaultBrainstorms: [
      {
        title: 'Rounded App Icon',
        description: 'A simple friendly launcher icon.',
        promptValue: 'Simple app launcher icon with rounded square shape, one clear symbol in the center, flat colors, clean edges',
        tags: ['App Icon', 'Squircle', '1:1'],
      },
      {
        title: 'Store Banner',
        description: 'Wide banner for an app store page.',
        promptValue: 'Wide app store banner with a friendly character on the left, short empty space on the right for text, flat colors, clean look',
        tags: ['Banner', '16:9', 'Store'],
      },
      {
        title: 'Streak Badge',
        description: 'A small reward badge.',
        promptValue: 'Round achievement badge with a simple flame symbol, flat gold and orange colors, clean outline, plain background',
        tags: ['Badge', 'Reward', 'Streak'],
      },
    ],
  },
  voice: {
    title: 'Voice & Speech Studio',
    headline: 'Synthesize expressive dialogue and modulate vocal frequencies',
    description:
      'Convert written welcome scripts and character lines into natural speech with Gemini Text-to-Speech voices and WebAudio vocal frequency modulators.',
    steps: [
      {
        label: '1. Draft Your Intro Script',
        detail:
          'Keep lines punchy (under 200 characters) so users hear an energetic 5-10 second welcoming line.',
      },
      {
        label: '2. Choose Voice Actor & Timbre',
        detail:
          'Select Kore for inspiring guides, Puck for friendly mascots, Charon for deep authority, Fenrir for bold action, or Zephyr for smooth tech.',
      },
      {
        label: '3. Apply Emotional Direction & Modulation',
        detail:
          'Adjust the pitch and speed sliders to give each character a different voice.',
      },
    ],
    proTips: [
      'Use natural punctuation (commas, exclamation points) to guide natural speech cadence and breathing.',
      'Test your dialogue with modulated audio enabled to check clarity before finalizing.',
    ],
    defaultBrainstorms: [
      {
        title: 'Warm Welcome',
        description: 'Friendly opening line to start the app.',
        promptValue: "Welcome! Everything is set up. Let's take a quick look around, and then you can get started.",
        tags: ['Friendly', 'Welcome', 'Kore'],
      },
      {
        title: 'Short Instruction',
        description: 'A clear, calm how-to line.',
        promptValue: 'Tap the button at the bottom to begin. You can come back to this screen any time.',
        tags: ['Clear', 'Calm', 'Zephyr'],
      },
      {
        title: 'Calm Breathing',
        description: 'Gentle line for wellness and focus apps.',
        promptValue: 'Take a deep breath and settle in. This is your quiet space to refocus.',
        tags: ['Calm', 'Soothing', 'Zephyr'],
      },
    ],
  },
  music: {
    title: 'Music & Soundtrack Studio',
    headline: 'Generate generative AI audio tracks and procedural synthesizers',
    description:
      'Compose bespoke musical accompaniment for your app intros using Google Lyria soundtrack generation with automatic procedural WebAudio fallback.',
    steps: [
      {
        label: '1. Choose Soundtrack Style',
        detail:
          'Select Steady Pulse, Lo-Fi Chill, Bright Start, Chiptune 8-Bit, or Soft Air.',
      },
      {
        label: '2. Formulate Lyria Prompt',
        detail:
          'Describe the instruments, tempo (BPM), and emotion you want (e.g., "Warm Rhodes piano, 85 BPM lo-fi chill hip-hop beats").',
      },
      {
        label: '3. Balance Audio Mixing',
        detail:
          'Adjust the background music volume (recommended 25%-35%) so the avatar voiceover remains loud and distinct.',
      },
    ],
    proTips: [
      'Looping tracks work best when they maintain a steady rhythmic groove without abrupt volume spikes.',
      'Our built-in procedural synthesizer guarantees seamless playback even if cloud API limits are reached.',
    ],
    defaultBrainstorms: [
      {
        title: 'Chill Lo-Fi Groove',
        description: 'Warm piano chords and a relaxed beat.',
        promptValue: 'Warm electric piano chords, gentle vinyl crackle, relaxed 82 BPM drums, easy focus background',
        tags: ['Lo-Fi', 'Relaxing', '82 BPM'],
      },
      {
        title: 'Bright Acoustic Start',
        description: 'Light guitar and upbeat percussion.',
        promptValue: 'Light acoustic guitar strumming, soft hand percussion, cheerful upbeat mood, 110 BPM, friendly and clean',
        tags: ['Upbeat', 'Acoustic', '110 BPM'],
      },
      {
        title: 'Soft Ambient Pads',
        description: 'Slow pads for quiet screens.',
        promptValue: 'Slow soft pads, warm low hum, very gentle movement, calm and open background music',
        tags: ['Ambient', 'Peaceful', 'Slow'],
      },
    ],
  },
  video: {
    title: 'Veo Cinematic Video Studio',
    headline: 'Generate high-definition motion video cutscenes with Google Veo',
    description:
      'Create cinematic intro clips, fluid logo motion sequences, and video backgrounds for your app onboarding.',
    steps: [
      {
        label: '1. Specify Motion & Camera Path',
        detail:
          'Describe camera movements such as "slow orbital pan", "cinematic forward dolly", or "dramatic tilt up".',
      },
      {
        label: '2. Direct Subject Interaction',
        detail:
          'Specify what your character or scene does over the 5-8 second clip (e.g., "mascot turns toward camera and gives a thumbs up").',
      },
      {
        label: '3. Save Cutscene Asset',
        detail:
          'Filed directly under your project\'s Video bin and ready for playback in the Intro Simulator.',
      },
    ],
    proTips: [
      'For best results, describe lighting changes, such as sunlight filtering through trees or clouds drifting past.',
      'Keep actions clear and focused rather than overcrowding multiple scene transitions into one short clip.',
    ],
    defaultBrainstorms: [
      {
        title: 'Sunrise Valley Pan',
        description: 'Slow camera move across green hills.',
        promptValue: 'Slow cinematic camera pan across a green valley at sunrise, soft golden light, smooth steady motion',
        tags: ['Nature', 'Pan', 'Cinematic'],
      },
      {
        title: 'Mascot Waves Hello',
        description: 'A friendly character waves at the camera.',
        promptValue: 'Friendly cartoon mascot waves at the camera and smiles, simple background, gentle camera push-in',
        tags: ['Mascot', 'Intro', 'Friendly'],
      },
      {
        title: 'Soft Moving Shapes',
        description: 'Slow abstract shapes for a splash screen.',
        promptValue: 'Slow flowing soft pastel shapes drifting across the screen, smooth continuous motion, clean background',
        tags: ['Abstract', 'Soft', 'Splash'],
      },
    ],
  },
  intro_player: {
    title: 'Live App Intro Simulator',
    headline: 'Experience and test your synchronized multi-modal intro sequence',
    description:
      'Preview how your avatar, background scenery, voiceover dialogue, animated subtitles, and soundtrack harmonize in real time across phone, tablet, and web views.',
    steps: [
      {
        label: '1. Select Target Device Frame',
        detail:
          'Toggle between Mobile Phone (iOS/Android), Web App Modal, Widescreen Cutscene, and Fullscreen modes.',
      },
      {
        label: '2. Press Play to Test Flow',
        detail:
          'The simulator triggers audio playback, avatar posture framing, subtitle typewriter effects, and scene animations.',
      },
      {
        label: '3. Fine-Tune Timing & Mix',
        detail:
          'If the voice is overpowered by the soundtrack, return to the Voice or Music studio to adjust relative volume levels.',
      },
    ],
    proTips: [
      'Use the Web Modal view to verify how the intro looks as an onboarding popup inside a web dashboard.',
      'Check subtitle legibility against bright backgrounds by switching subtitle styles.',
    ],
    defaultBrainstorms: [
      {
        title: 'Mobile Welcome Screen',
        description: 'Mascot greets the user on a phone.',
        promptValue: 'A short friendly welcome sequence for a vertical phone screen',
        tags: ['Mobile', 'Welcome', 'Puck'],
      },
      {
        title: 'Dashboard Walkthrough',
        description: 'Guide introduces the main page.',
        promptValue: 'A calm product walkthrough that points out the three main areas of the dashboard',
        tags: ['Web Modal', 'Guide', 'Zephyr'],
      },
      {
        title: 'Story Opening',
        description: 'Narrated opening for a story-style app.',
        promptValue: 'A quiet narrated opening with a still backdrop and soft music',
        tags: ['Widescreen', 'Narrator', 'Charon'],
      },
    ],
  },
  projects: {
    title: 'Project Vault & Asset Filing Bin',
    headline: 'Organize and search your multi-modal assets filed by project',
    description:
      'Keep all UI art, avatars, backdrops, voices, music, and cutscenes neatly sorted by application. Use Style Primers to maintain visual consistency.',
    steps: [
      {
        label: '1. Switch or Create Projects',
        detail:
          'Each project has its own dedicated style primer (color palette, art medium, and reference image anchor).',
      },
      {
        label: '2. Search Across All Projects',
        detail:
          'Use the Search Bar and Tag Filter chips to instantly find specific assets (e.g. #icon, #watercolor, #1K).',
      },
      {
        label: '3. Set Master Style Anchors',
        detail:
          'Mark any top-tier asset as a "Style Anchor" to guide future generations with high aesthetic consistency.',
      },
    ],
    proTips: [
      'Use the "Search All Projects" scope to easily reuse assets created in other projects.',
      'Duplicate a project to quickly create a variation with an alternative color scheme or art style.',
    ],
    defaultBrainstorms: [
      {
        title: 'Banking App',
        description: 'Clean, trustworthy look.',
        promptValue: 'A mobile banking app with a clean flat vector style, deep blue and white colors, and a calm professional guide',
        tags: ['Finance', 'Flat Vector', 'Trust'],
      },
      {
        title: 'Kids Reading App',
        description: 'Bright and friendly.',
        promptValue: 'A reading app for kids with a round friendly mascot, bright flat colors and playful music',
        tags: ['Kids', 'Mascot', 'Bright'],
      },
      {
        title: 'Sleep & Relax App',
        description: 'Soft and quiet.',
        promptValue: 'A sleep app with a soft watercolor style, evening sky backdrops and slow ambient music',
        tags: ['Sleep', 'Watercolor', 'Calm'],
      },
    ],
  },
  export: {
    title: 'Export Hub & Code Integration',
    headline: 'Download production assets and copy ready-to-use code snippets',
    description:
      'Export production-ready PNGs, WAV audio files, and JSON scene configurations, complete with turnkey code for React, Next.js, Flutter, and React Native.',
    steps: [
      {
        label: '1. Select Your Target Framework',
        detail:
          'Choose React / Next.js, Flutter / Dart, or React Native / Expo to generate tailored integration code.',
      },
      {
        label: '2. Download Production Bundle',
        detail:
          'Download assets individually or download the full project archive with scene metadata and assets.',
      },
      {
        label: '3. Embed in Your App',
        detail:
          'Paste the exported component code into your codebase to render the intro experience instantly.',
      },
    ],
    proTips: [
      'The generated code handles audio autoplay policies and responsive sizing automatically.',
      'All asset URLs and specs are formatted for production CDN delivery.',
    ],
    defaultBrainstorms: [
      {
        title: 'React & Next.js Onboarding Modal',
        description: 'Drop-in component with Framer Motion transitions and HTML5 audio synchronization.',
        promptValue: 'Export ready-to-run React component code with interactive playback controls',
        tags: ['React', 'Next.js', 'Tailwind'],
      },
      {
        title: 'Flutter Mobile Welcome Flow',
        description: 'Dart widget using Stack layout and just_audio package for smooth mobile playback.',
        promptValue: 'Export Flutter Dart widget code for Android & iOS onboarding',
        tags: ['Flutter', 'Dart', 'Mobile'],
      },
      {
        title: 'React Native / Expo Screen',
        description: 'Complete mobile screen component configured with expo-av and expo-image.',
        promptValue: 'Export React Native Expo component for cross-platform app intro',
        tags: ['React Native', 'Expo', 'Mobile'],
      },
    ],
  },
};

interface StudioAiHelperProps {
  screenId: StudioScreenId;
  project: StudioProject;
  activeProject?: ProjectFolder;
  onApplyPrompt?: (promptText: string) => void;
  onOpenCopilot?: (roleId?: string) => void;
}

export const StudioAiHelper: React.FC<StudioAiHelperProps> = ({
  screenId,
  project,
  activeProject,
  onApplyPrompt,
  onOpenCopilot,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [customIdeas, setCustomIdeas] = useState<BrainstormIdea[]>([]);

  const guide = STUDIO_GUIDES[screenId] || STUDIO_GUIDES.avatar;
  const currentIdeas = customIdeas.length > 0 ? customIdeas : guide.defaultBrainstorms;

  const handleApplyIdea = (idea: BrainstormIdea, index: number) => {
    if (onApplyPrompt) {
      onApplyPrompt(idea.promptValue);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  const handleGenerateFreshBrainstorm = async () => {
    setIsAiGenerating(true);
    try {
      const primer = activeProject?.stylePrimer || project.stylePrimer;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `You are an expert creative AI designer for a digital app development studio.
Generate 3 fresh, creative, highly specific prompt ideas for the "${guide.title}" feature.
The user is working on an app named "${activeProject?.name || project.projectName || 'My App'}" with the style theme: "${primer?.styleName || 'Flat Vector'}" (${primer?.artMedium || 'Digital'}).
Primary color: ${primer?.colorPalette?.primary || '#6366f1'}.

Return ONLY a valid JSON array of 3 objects with these exact keys:
[
  {
    "title": "Short creative title (2-4 words)",
    "description": "One sentence explaining why this idea fits",
    "promptValue": "The full detailed prompt to send to the generator (50-80 words)",
    "tags": ["Tag1", "Tag2", "Tag3"]
  }
]
Do not include markdown codeblocks or extra text. Only raw JSON.`,
            },
          ],
          model: 'gemini-3.8-flash',
        }),
      });

      const data = await res.json();
      if (data && data.content) {
        let cleanText = data.content.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
        }
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomIdeas(parsed);
          setIsBrainstormOpen(true);
        }
      }
    } catch (err) {
      console.warn('AI Brainstorm generation fallback:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const getTargetRole = (screen: StudioScreenId): string => {
    switch (screen) {
      case 'avatar':
        return 'avatar_designer';
      case 'background':
        return 'background_artist';
      case 'voice':
        return 'dialogue_writer';
      case 'music':
        return 'music_composer';
      case 'video':
        return 'video_director';
      case 'ui_art':
        return 'intro_director';
      case 'intro_player':
      default:
        return 'intro_director';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg backdrop-blur-sm">
      {/* Header bar: Screen purpose + Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{guide.title} AI Guide</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Helper Active
              </span>
            </div>
            <p className="text-xs text-slate-400">{guide.headline}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-700/60"
            title="Learn how this studio works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>How It Works</span>
            {isGuideOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setIsBrainstormOpen(!isBrainstormOpen)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-700/60"
            title="Toggle brainstorming cards"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Brainstorm Ideas</span>
            {isBrainstormOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => onOpenCopilot && onOpenCopilot(getTargetRole(screenId))}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition cursor-pointer"
            title="Open conversational AI assistant for this screen"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Expandable How-It-Works Guide */}
      {isGuideOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {guide.steps.map((step, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-xl">
                <div className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{step.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300">
              <span className="font-semibold text-indigo-300">Pro Tips: </span>
              {guide.proTips.join(' ')}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Brainstorm Ideas Generator */}
      {isBrainstormOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Creative Suggestions for {guide.title}</span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Tailored to {activeProject?.name || 'Active Project'})
              </span>
            </div>

            <button
              type="button"
              onClick={handleGenerateFreshBrainstorm}
              disabled={isAiGenerating}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer border border-indigo-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>{isAiGenerating ? 'Brainstorming...' : 'Generate New Ideas'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentIdeas.map((idea, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {idea.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      {idea.tags.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 truncate max-w-[170px] italic">
                    "{idea.promptValue}"
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyIdea(idea, idx)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer flex-shrink-0"
                    title="Apply this prompt directly into the studio"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <span>Use Idea</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
