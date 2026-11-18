// Live-mode guide text. Text only: no narration audio of any kind.
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
    can: ['Choose TikTok / Reel, PWA web intro, or Android app intro.', 'The choice sets the frame shape used in Preview.', 'Click a backdrop to change the scenery in the frame.', 'You can come back and change it at any time.'],
  },
  avatar: {
    title: '2. Avatar',
    say: 'Design the face. Use the customizer for a drawn avatar, or build a realistic portrait by filling in the blanks: subject, age, skin tone, hair, build, expression, wardrobe, setting, lighting and style. Add your own words or speak them with the mic, then press Generate portrait.',
    can: ['Customizer: change hair, expression, clothing and more. It updates instantly and costs nothing.', 'AI portrait builder: every blank becomes part of the description. Mesa and Reed are example presets you can load and change.', 'Your own details: type or press the mic to speak extra details, or tick "Use only my text".', 'Starter avatars: click one to use it as the portrait.', 'Backdrops: click one to change the scenery behind the avatar.', 'If the site asks for an access code, enter it once. It is remembered on this device.'],
  },
  voice: {
    title: '3. Voice',
    say: 'Choose a narrator voice, then write exactly what it should say. Erase the starting line and type anything, or press Dictate and speak it. Press Play to hear it.',
    can: ['Pick one of the four voices.', 'The script box is yours: select all, delete, and write your own line (up to 500 characters).', 'Dictate turns your speech into text using your browser. It is free and needs no key.', 'Misspelled words get a red underline from your browser. Right-click one to fix it.', 'Press Play to hear the voice say your script.'],
  },
  preview: {
    title: '4. Preview',
    say: 'This previews what you built: your avatar, your script and your chosen voice. Play it, step through each line, and change the backdrop. Turn on Safe zone to see what TikTok covers.',
    can: ['It uses the avatar from step 2 and the script you wrote in step 3. Nothing here is pre-written.', 'Play, pause, step back or forward, or drag the timeline.', 'Pick a backdrop in the panel on the right.', 'Click any line in the script list to jump to that moment.', 'Empty? Go back to Voice and write your script first.'],
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
