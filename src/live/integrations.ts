// Live-mode Integrations text. Live mode does not read src/demo/bundles/integrations.json (that file describes
// Demo mode and the old Gemini/Hedra plan). These cards describe what the hosted Live site actually uses.

export interface LiveIntegration {
  id: string;        // key in the server's /api/integrations/status response
  name: string;
  powers: string;
  how: string;
  envVars: string;   // server environment variable name(s); never typed into the page
}

export const LIVE_INTEGRATIONS: LiveIntegration[] = [
  {
    id: 'cloudflare',
    name: 'Cloudflare Workers AI (FLUX)',
    powers: 'AI portrait builder: the portrait made from your fill-in-the-blank description.',
    how: "The browser asks this app's server, the server calls Cloudflare Workers AI (FLUX schnell) with its token, and the image comes back to the screen.",
    envVars: 'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    powers: 'Voice: speaks your script in the voice you pick (Sarah, Chris, Alice or Eric) in the Voice and Preview steps.',
    how: 'The server sends your script text to ElevenLabs text-to-speech and returns an MP3.',
    envVars: 'ELEVENLABS_API_KEY',
  },
];
