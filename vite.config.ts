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

        if (
          req.url &&
          (req.url.startsWith('/api/collab/') ||
            req.url.startsWith('/api/auth/') ||
            req.url.startsWith('/api/db/') ||
            req.url.startsWith('/api/health'))
        ) {
          try {
            const handled = await handleCollabRequest(req, res);
            if (handled) return;
          } catch (e) {
            console.error('Error in Vite API handler', e);
          }
        }
        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const devOnlyPaths = [
        'moodboard.html',
        'mockups',
        'dribbble-showcase.html',
        'master-blend-showcase.html',
        'minimalism-showcase.html',
        'mockup-showcase.html',
        'MealWise.apk',
        'MealWise.ipa',
        'Mealy.apk',
        'Mealy.ipa'
      ];
      for (const rel of devOnlyPaths) {
        const target = path.join(distDir, rel);
        try {
          if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true });
          }
        } catch {}
      }
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
      ignored: ['**/*.apk', '**/*.ipa', '**/*.zip', '**/*.pdf', '**/docs/**', '**/MealWise-Portable-PC/**', '**/NexsVideo/**', '**/android/**', '**/ios/**', '**/tools/**', '**/.server-data/**']
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
          if (id.includes('recipesDatabase')) {
            return 'data-recipes-vn1';
          }
          if (id.includes('vietnameseDishesPart1') || id.includes('vietnameseDishesPart2')) {
            return 'data-recipes-vn2';
          }
          if (id.includes('westernDishes500')) {
            return 'data-recipes-western';
          }
          if (id.includes('casePools')) {
            return 'data-minigames';
          }
        }
      }
    }
  }
});
