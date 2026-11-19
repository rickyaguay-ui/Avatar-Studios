import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const LIVE_SITE = 'https://avatar-studios-live.vercel.app';

// Live build only: Open Graph / Twitter card tags and the cover image, so shared links show a card.
// The Demo build never gets these (its HTML and files stay exactly as they were).
function liveSocialCard(): Plugin {
  const title = 'Avatar Studios';
  const description = 'Build your own avatar, scene and voice, then preview and share your intro.';
  const tags = [
    `<meta property="og:site_name" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${LIVE_SITE}/" />`,
    `<meta property="og:image" content="${LIVE_SITE}/og-cover.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Avatar Studios: build your own avatar, scene and voice" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${LIVE_SITE}/og-cover.png" />`,
  ].map((t) => `    ${t}`).join('\n');
  return {
    name: 'live-social-card',
    transformIndexHtml: (html) => html.replace('</head>', `${tags}\n  </head>`),
    generateBundle() {
      this.emitFile({type: 'asset', fileName: 'og-cover.png', source: fs.readFileSync(path.resolve(__dirname, 'src/live/og-cover.png'))});
    },
  };
}

// `vite build --mode demo` produces the hosted Demo-mode site (dist-demo, no server, no keys).
// Anything else is the Live-mode UI served by server.ts.
export default defineConfig(({mode}) => {
  const demo = mode === 'demo';
  return {
    plugins: [react(), tailwindcss(), ...(demo ? [] : [liveSocialCard()])],
    define: {__APP_MODE__: JSON.stringify(demo ? 'demo' : 'live')},
    build: {outDir: demo ? 'dist-demo' : 'dist'},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
