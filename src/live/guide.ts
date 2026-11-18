// Live-mode guide text. Text only: nothing here is pre-recorded, so it works with no keys and no audio files.
// Read aloud uses the device's own speech voice (speechSynthesis), which needs no API.
import type { StepId } from '../studio/state';

export interface GuideEntry { title: string; say: string; can: string[] }

export const WELCOME: GuideEntry = {
  title: 'Welcome to Avatar Studios',
  say: 'Welcome. In Live mode you build everything yourself: pick a format, design an avatar, give it a voice, and preview the result. Nothing here is pre-recorded. The whole run takes a few minutes.',
  can: ['Six steps run left to right along the top.', 'Press "Help me set this up" in the top right at any time for a rundown of the screen you are on.'],
};

export const GUIDE: Record<StepId, GuideEntry> = {
  format: {
    title: '1. Format',
    say: 'Pick what you are making: a TikTok or Reel, a web intro for a PWA, or an Android app intro. This sets the screen shape and the starting script.',
    can: ['Choose TikTok / Reel, PWA web intro, or Android app intro.', 'The choice sets the frame shape used in Preview.', 'You can come back and change it at any time.'],
  },
  avatar: {
    title: '2. Avatar',
    say: 'Design the face. Use the customizer for a drawn avatar, the AI portrait builder for a realistic portrait, or pick a starter avatar. Change any field, then press Generate portrait and give it a few seconds.',
    can: ['Customizer: change hair, expression, clothing and more. It updates instantly and costs nothing.', 'AI portrait builder: fill in the fields and press Generate portrait. A new image appears in a few seconds.', 'Starter avatars: click one to use it as the portrait.', 'If the site asks for an access code, enter it once. It is remembered on this device.'],
  },
  voice: {
    title: '3. Voice',
    say: 'Choose a narrator voice, then write exactly what it should say. Erase the starting line and type anything, or press Dictate and speak it. Press Play to hear it.',
    can: ['Pick one of the four voices.', 'The script box is yours: select all, delete, and write your own line (up to 500 characters).', 'Dictate turns your speech into text using your browser. It is free and needs no key.', 'Misspelled words get a red underline from your browser. Right-click one to fix it.', 'Press Play to hear the voice say your script.'],
  },
  preview: {
    title: '4. Preview',
    say: 'Watch your avatar and voice together in the frame. Step through each moment, and turn on Safe zone to see what TikTok covers.',
    can: ['Play, pause, step back or forward, or drag the timeline.', 'Safe zone shows the areas TikTok overlays with buttons and captions.', 'Pick a backdrop in the panel on the right.', 'Click any line in the script list to jump to that moment.'],
  },
  export: {
    title: '5. Export',
    say: 'Copy your project out. The prompt bundle holds the script and avatar settings, and the specs list the sizes and formats each platform expects.',
    can: ['Copy prompt bundle: script, avatar settings and asset names as text.', 'Copy specs: the platform size and format checklist.', 'Paste either one into your video or coding tool.'],
  },
  integrations: {
    title: '6. Integrations',
    say: 'See which outside services are connected on this site. Each one shows Configured or Not configured. Keys live on the server and are never typed into this page.',
    can: ['Each card names the service and what it powers.', 'Configured means the server has its key. Not configured means that feature will not work yet.'],
  },
};
