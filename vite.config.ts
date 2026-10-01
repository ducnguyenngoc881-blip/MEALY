import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { handleCollabRequest } from './scripts/collab-server-handler.js';

import fs from 'node:fs';
import path from 'node:path';

function collabSyncPlugin(): Plugin {
  return {
    name: 'collab-sync-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/MealWise.apk' || req.url === '/api/download/apk') {
          const apkPath = path.resolve(__dirname, 'MealWise.apk');
          if (fs.existsSync(apkPath)) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="MealWise.apk"');
            res.setHeader('Content-Length', fs.statSync(apkPath).size);
            fs.createReadStream(apkPath).pipe(res);
            return;
          }
        }

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
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/*.apk', '**/MealWise-Portable-PC/**', '**/tools/**']
    },
    hmr: {
      port: 5173
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('recipesDatabase') || id.includes('westernDishes500')) {
            return 'data-recipes';
          }
          if (id.includes('casePools')) {
            return 'data-minigames';
          }
        }
      }
    }
  }
});
