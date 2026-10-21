import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { handleCollabRequest } from './scripts/collab-server-handler.js';

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST_MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

interface CachedCompressedAsset {
  mtimeMs: number;
  raw: Buffer;
  gzip?: Buffer;
  br?: Buffer;
  contentType: string;
  compressible: boolean;
}

const distAssetCache = new Map<string, CachedCompressedAsset>();

function getCompressedDistAsset(filePath: string): CachedCompressedAsset | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return null;
    const cached = distAssetCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = DIST_MIME_TYPES[ext] || 'application/octet-stream';
    const compressible = ['.html', '.js', '.mjs', '.css', '.json', '.svg', '.webmanifest'].includes(ext);
    const raw = fs.readFileSync(filePath);
    const entry: CachedCompressedAsset = {
      mtimeMs: stat.mtimeMs,
      raw,
      contentType,
      compressible
    };
    if (compressible && raw.length > 512) {
      entry.gzip = zlib.gzipSync(raw, { level: 6 });
      entry.br = zlib.brotliCompressSync(raw, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 }
      });
    }
    distAssetCache.set(filePath, entry);
    return entry;
  } catch {
    return null;
  }
}

function collabSyncPlugin(): Plugin {
  return {
    name: 'collab-sync-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/MealWise.apk' || req.url === '/Mealy.apk' || req.url === '/api/download/apk') {
          const apkPath = path.resolve(__dirname, 'MealWise.apk');
          if (fs.existsSync(apkPath)) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="Mealy.apk"');
            res.setHeader('Content-Length', fs.statSync(apkPath).size);
            fs.createReadStream(apkPath).pipe(res);
            return;
          }
        }

        if (req.url === '/MealWise.ipa' || req.url === '/Mealy.ipa' || req.url === '/api/download/ipa') {
          const ipaPath = path.resolve(__dirname, 'Mealy.ipa');
          if (fs.existsSync(ipaPath)) {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="Mealy.ipa"');
            res.setHeader('Content-Length', fs.statSync(ipaPath).size);
            fs.createReadStream(ipaPath).pipe(res);
            return;
          }
        }

        if (req.url && (req.url.startsWith('/api/collab/') || req.url.startsWith('/api/auth/') || req.url.startsWith('/api/admin/'))) {
          try {
            const handled = await handleCollabRequest(req, res);
            if (handled) return;
          } catch (e) {
            console.error('Error in Vite collab/auth/admin handler', e);
          }
        }

        // Ultra-fast pre-bundled Brotli/Gzip delivery for mobile & ngrok tunnels
        // Eliminates the 90-file unbundled dev waterfall (~10.8 MB) down to 6 requests (~380 KB)
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
        const hasProxyHeaders = Boolean(req.headers['x-forwarded-for'] || req.headers['x-forwarded-proto']);
        const reqPath = (req.url || '/').split('?')[0];
        const isViteInternal = reqPath.startsWith('/@') || reqPath.startsWith('/src/') || reqPath.startsWith('/node_modules/');
        const isRemoteOrTunnel =
          !isViteInternal && (
            hasProxyHeaders ||
            host.includes('ngrok') ||
            host.includes('trycloudflare') ||
            host.includes('loca.lt') ||
            (!host.startsWith('localhost') && !host.startsWith('127.0.0.1') && !host.startsWith('[::1]'))
          );
        const isDistAssetRequest = reqPath.startsWith('/assets/');

        if ((isRemoteOrTunnel || isDistAssetRequest) && (req.method === 'GET' || req.method === 'HEAD')) {
          const distDir = path.resolve(__dirname, 'dist');
          const distIndex = path.join(distDir, 'index.html');
          if (fs.existsSync(distIndex)) {
            const targetRel = reqPath === '/' || reqPath === '' ? 'index.html' : reqPath.replace(/^\/+/, '');
            let targetFile = path.join(distDir, targetRel);
            let asset = getCompressedDistAsset(targetFile);

            // SPA fallback for client-side routes when not requesting a static file extension
            if (!asset && !path.extname(targetRel)) {
              targetFile = distIndex;
              asset = getCompressedDistAsset(distIndex);
            }

            if (asset) {
              const acceptEncoding = String(req.headers['accept-encoding'] || '');
              const isImmutableAsset = reqPath.startsWith('/assets/');
              res.setHeader('Content-Type', asset.contentType);
              res.setHeader('Vary', 'Accept-Encoding');
              res.setHeader(
                'Cache-Control',
                isImmutableAsset
                  ? 'public, max-age=31536000, immutable'
                  : 'no-cache, must-revalidate'
              );

              if (asset.compressible && acceptEncoding.includes('br') && asset.br) {
                res.setHeader('Content-Encoding', 'br');
                res.setHeader('Content-Length', asset.br.length);
                res.statusCode = 200;
                res.end(req.method === 'HEAD' ? undefined : asset.br);
                return;
              }
              if (asset.compressible && acceptEncoding.includes('gzip') && asset.gzip) {
                res.setHeader('Content-Encoding', 'gzip');
                res.setHeader('Content-Length', asset.gzip.length);
                res.statusCode = 200;
                res.end(req.method === 'HEAD' ? undefined : asset.gzip);
                return;
              }

              res.setHeader('Content-Length', asset.raw.length);
              res.statusCode = 200;
              res.end(req.method === 'HEAD' ? undefined : asset.raw);
              return;
            }
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
      ignored: ['**/dist/**', '**/*.apk', '**/*.ipa', '**/*.zip', '**/*.pdf', '**/docs/**', '**/MealWise-Portable-PC/**', '**/NexsVideo/**', '**/android/**', '**/ios/**', '**/tools/**']
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
