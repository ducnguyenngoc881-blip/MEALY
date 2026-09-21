#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import qrcode from 'qrcode-terminal';
import { handleCollabRequest } from './collab-server-handler.js';

const SHOWCASE_DIR = 'C:\\Users\\EXIA\\Downloads\\MealWise-Portable-Showcase';
const PORT = 5173;

const MIME_TYPES = {
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

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!iface.address.startsWith('169.254')) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const localUrl = `http://localhost:${PORT}/`;
const mobileUrl = `http://${localIp}:${PORT}/`;

const server = http.createServer(async (req, res) => {
  // Check collaborative real-time sync endpoints first
  try {
    const handled = await handleCollabRequest(req, res);
    if (handled) return;
  } catch (err) {
    console.error('Error in collab request handler:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
    return;
  }

  // CORS & PWA headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = req.url ? req.url.split('?')[0] : '/';
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(SHOWCASE_DIR, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA Fallback: serve index.html for client-side routing
      fs.readFile(path.join(SHOWCASE_DIR, 'index.html'), (fallbackErr, indexData) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          res.end(indexData);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isHtmlOrSw = reqPath.endsWith('.html') || reqPath === '/' || reqPath.endsWith('sw.js') || reqPath.endsWith('manifest.webmanifest');

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isHtmlOrSw 
        ? 'no-cache, no-store, must-revalidate' 
        : 'public, max-age=31536000, immutable',
      ...(isHtmlOrSw ? { 'Pragma': 'no-cache', 'Expires': '0' } : {})
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n===============================================================');
  console.log('   MEALWISE MOBILE & DESKTOP SHOWCASE SERVER (0.0.0.0)         ');
  console.log('===============================================================');
  console.log(`  💻 PC / Local:    ${localUrl}`);
  console.log(`  📱 Mobile (Wi-Fi): ${mobileUrl}`);
  console.log('---------------------------------------------------------------');
  console.log('  QUÉT MÃ QR BẰNG CAMERA ĐIỆN THOẠI ĐỂ MỞ ỨNG DỤNG NGAY:');
  console.log('---------------------------------------------------------------');
  qrcode.generate(mobileUrl, { small: true }, (qr) => {
    console.log(qr);
    console.log('---------------------------------------------------------------');
    console.log('  💡 MẸO CÀI ĐẶT NHƯ APP (PWA / WebAPK):');
    console.log('  - Mở link trên Chrome điện thoại Android.');
    console.log('  - Bấm menu 3 chấm (⋮) > Chọn "Cài đặt ứng dụng" hoặc "Thêm vào MH chính".');
    console.log('  - Ứng dụng sẽ cài đặt thành icon riêng biệt, chạy full-screen như app native!');
    console.log('===============================================================\n');
  });
});
