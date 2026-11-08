import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// `vite build --mode demo` produces the hosted Demo-mode site (dist-demo, no server, no keys).
// Anything else is the Live-mode UI served by server.ts.
export default defineConfig(({mode}) => {
  const demo = mode === 'demo';
  return {
    plugins: [react(), tailwindcss()],
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
