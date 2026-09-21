import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { handleCollabRequest } from './scripts/collab-server-handler.js';

function collabSyncPlugin(): Plugin {
  return {
    name: 'collab-sync-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/collab/')) {
          try {
            const handled = await handleCollabRequest(req, res);
            if (handled) return;
          } catch (e) {
            console.error('Error in Vite collab handler', e);
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), collabSyncPlugin()],
  base: './', // Ensures relative assets work in static showcase launcher
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
