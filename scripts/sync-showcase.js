#!/usr/bin/env node

/**
 * MealWise Portable Showcase Sync & Verification Script
 *
 * Objectives:
 * 1. Cleanly build Vite production distribution (`dist/`).
 * 2. Purge stale legacy bundle assets from `MealWise-Portable-Showcase/assets`.
 * 3. Deploy new bundle files and index.html to `MealWise-Portable-Showcase`.
 * 4. Verify file integrity and manifest (non-empty files, referenced assets present).
 * 5. Spin up a temporary local HTTP server on the showcase directory to verify HTTP 200 serving.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const distDir = path.join(workspaceRoot, 'dist');
const showcaseDir = 'C:\\Users\\EXIA\\Downloads\\MealWise-Portable-Showcase';
const showcaseAssetsDir = path.join(showcaseDir, 'assets');
const showcaseIndexHtml = path.join(showcaseDir, 'index.html');

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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function logStep(step, message) {
  console.log(`\n\x1b[1m\x1b[34m[Step ${step}]\x1b[0m \x1b[1m${message}\x1b[0m`);
}

function logSuccess(message) {
  console.log(`  \x1b[32m✓\x1b[0m ${message}`);
}

function logWarning(message) {
  console.log(`  \x1b[33m⚠\x1b[0m ${message}`);
}

function logError(message) {
  console.error(`  \x1b[31m✗\x1b[0m ${message}`);
}

/**
 * Step 1: Clean previous dist and compile Vite production build
 */
function buildProductionBundle() {
  logStep(1, 'Compiling fresh production build via Vite...');

  const builtIndexCheck = path.join(distDir, 'index.html');
  const isFresh = fs.existsSync(builtIndexCheck) && (Date.now() - fs.statSync(builtIndexCheck).mtimeMs < 10 * 60 * 1000);
  if ((process.argv.includes('--no-build') || isFresh) && fs.existsSync(builtIndexCheck)) {
    console.log('  Reusing fresh production build in dist/ (< 10m old)');
    return;
  }

  if (fs.existsSync(distDir)) {
    console.log(`  Cleaning existing dist folder: ${distDir}`);
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  const viteBin = path.join(workspaceRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const buildCommand = `node "${viteBin}" build`;
  console.log(`  Running: ${buildCommand}`);
  const out = execSync(buildCommand, {
    cwd: workspaceRoot,
    stdio: 'pipe'
  });
  console.log(out.toString());

  const builtIndex = path.join(distDir, 'index.html');
  const builtAssetsDir = path.join(distDir, 'assets');

  if (!fs.existsSync(builtIndex) || !fs.existsSync(builtAssetsDir)) {
    throw new Error(`Build artifacts missing in ${distDir}`);
  }

  logSuccess('Production bundle successfully built in dist/');
}

/**
 * Step 2: Remove obsolete/stale legacy assets from target showcase
 */
function cleanTargetAssets() {
  logStep(2, 'Cleaning target showcase asset directory...');

  if (!fs.existsSync(showcaseDir)) {
    console.log(`  Creating showcase directory: ${showcaseDir}`);
    fs.mkdirSync(showcaseDir, { recursive: true });
  }

  if (!fs.existsSync(showcaseAssetsDir)) {
    fs.mkdirSync(showcaseAssetsDir, { recursive: true });
    logSuccess('Created showcase assets directory');
    return;
  }

  const staleFiles = fs.readdirSync(showcaseAssetsDir);
  console.log(`  Found ${staleFiles.length} file(s) in showcase assets directory:`);

  let removedCount = 0;
  for (const file of staleFiles) {
    const filePath = path.join(showcaseAssetsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      fs.unlinkSync(filePath);
      console.log(`    - Removed stale: ${file} (${formatBytes(stat.size)})`);
      removedCount++;
    }
  }

  logSuccess(`Purged ${removedCount} obsolete asset file(s) from target`);
}

/**
 * Step 3: Copy newly generated bundle files and index.html to showcase
 */
function copyNewAssets() {
  logStep(3, 'Copying new bundle files to showcase directory...');

  const distAssetsDir = path.join(distDir, 'assets');
  const distIndexHtml = path.join(distDir, 'index.html');

  // Copy assets
  const assetFiles = fs.readdirSync(distAssetsDir);
  for (const file of assetFiles) {
    const src = path.join(distAssetsDir, file);
    const dest = path.join(showcaseAssetsDir, file);
    fs.copyFileSync(src, dest);
    const stat = fs.statSync(dest);
    console.log(`    + Copied asset: assets/${file} (${formatBytes(stat.size)})`);
  }

  // Copy index.html and all root files (manifest, icons, service worker)
  const rootFiles = fs.readdirSync(distDir).filter(f => f !== 'assets');
  for (const file of rootFiles) {
    const src = path.join(distDir, file);
    if (fs.statSync(src).isFile()) {
      const dest = path.join(showcaseDir, file);
      fs.copyFileSync(src, dest);
      const stat = fs.statSync(dest);
      console.log(`    + Copied root:  ${file} (${formatBytes(stat.size)})`);
    }
  }

  logSuccess(`Copied ${assetFiles.length} asset(s) and ${rootFiles.length} root file(s) to ${showcaseDir}`);
}

/**
 * Step 4: Verify file integrity and generate manifest
 */
function verifyDeployedFiles() {
  logStep(4, 'Verifying deployed file integrity and manifest...');

  if (!fs.existsSync(showcaseIndexHtml)) {
    throw new Error(`Target index.html does not exist at ${showcaseIndexHtml}`);
  }

  const indexContent = fs.readFileSync(showcaseIndexHtml, 'utf-8');
  if (indexContent.length === 0) {
    throw new Error('Target index.html is empty (0 bytes)');
  }
  if (!indexContent.includes('id="root"')) {
    throw new Error('Target index.html is missing root mounting node (<div id="root">)');
  }

  const deployedAssets = fs.readdirSync(showcaseAssetsDir);
  if (deployedAssets.length === 0) {
    throw new Error('No assets found in target showcase assets directory');
  }

  console.log('\n  \x1b[1mDeployed File Manifest:\x1b[0m');
  console.log('  ----------------------------------------------------------------------');
  console.log('  File Name                        Size          Modified');
  console.log('  ----------------------------------------------------------------------');

  const indexStat = fs.statSync(showcaseIndexHtml);
  console.log(`  index.html                       ${formatBytes(indexStat.size).padEnd(13)} ${indexStat.mtime.toISOString()}`);

  // Extract referenced scripts and stylesheets from index.html
  const scriptMatch = indexContent.match(/src=["']\.\/assets\/([^"']+)["']/g);
  const cssMatch = indexContent.match(/href=["']\.\/assets\/([^"']+)["']/g);

  const referencedFiles = [];
  if (scriptMatch) {
    scriptMatch.forEach(m => {
      const match = m.match(/assets\/([^"']+)/);
      if (match) referencedFiles.push(match[1]);
    });
  }
  if (cssMatch) {
    cssMatch.forEach(m => {
      const match = m.match(/assets\/([^"']+)/);
      if (match) referencedFiles.push(match[1]);
    });
  }

  for (const asset of deployedAssets) {
    const assetPath = path.join(showcaseAssetsDir, asset);
    const stat = fs.statSync(assetPath);
    if (stat.size === 0) {
      throw new Error(`Asset ${asset} is 0 bytes!`);
    }
    const isReferenced = referencedFiles.includes(asset) ? ' [REF]' : '';
    console.log(`  assets/${asset.padEnd(25)} ${formatBytes(stat.size).padEnd(13)} ${stat.mtime.toISOString()}${isReferenced}`);
  }

  console.log('  ----------------------------------------------------------------------');

  for (const ref of referencedFiles) {
    const fullPath = path.join(showcaseAssetsDir, ref);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`HTML references ${ref} but it was not found in deployed assets!`);
    }
  }

  logSuccess(`Integrity verified: all ${deployedAssets.length + 1} files valid and referenced bundles present`);
  return { referencedFiles, deployedAssets };
}

/**
 * Step 5: Start temporary HTTP server to verify HTTP 200 serving of showcase
 */
async function verifyHttpServing(referencedFiles) {
  logStep(5, 'Verifying live HTTP 200 serving of portable showcase...');

  const serverPort = 5174;

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    const filePath = path.join(showcaseDir, reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': content.length,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(serverPort, '127.0.0.1', () => {
      console.log(`  Local test server listening on http://127.0.0.1:${serverPort}`);
      resolve();
    });
    server.on('error', reject);
  });

  try {
    // 1. Fetch index.html via /
    const rootRes = await fetch(`http://127.0.0.1:${serverPort}/`);
    if (rootRes.status !== 200) {
      throw new Error(`GET / returned HTTP ${rootRes.status}`);
    }
    const rootText = await rootRes.text();
    if (!rootText.includes('id="root"')) {
      throw new Error('GET / did not return MealWise HTML');
    }
    logSuccess(`HTTP GET / -> 200 OK (${formatBytes(Buffer.byteLength(rootText, 'utf-8'))}, text/html)`);

    // 2. Fetch /index.html directly
    const indexRes = await fetch(`http://127.0.0.1:${serverPort}/index.html`);
    if (indexRes.status !== 200) {
      throw new Error(`GET /index.html returned HTTP ${indexRes.status}`);
    }
    logSuccess(`HTTP GET /index.html -> 200 OK`);

    // 3. Fetch each referenced asset
    for (const file of referencedFiles) {
      const assetUrl = `http://127.0.0.1:${serverPort}/assets/${file}`;
      const assetRes = await fetch(assetUrl);
      if (assetRes.status !== 200) {
        throw new Error(`GET /assets/${file} returned HTTP ${assetRes.status}`);
      }
      const assetBuffer = await assetRes.arrayBuffer();
      const contentType = assetRes.headers.get('content-type');
      if (assetBuffer.byteLength === 0) {
        throw new Error(`GET /assets/${file} returned 0 bytes`);
      }
      logSuccess(`HTTP GET /assets/${file} -> 200 OK (${formatBytes(assetBuffer.byteLength)}, ${contentType})`);
    }

    logSuccess('All HTTP serving checks PASSED (HTTP 200 OK for HTML and all assets)');
  } finally {
    await new Promise(resolve => server.close(resolve));
    console.log(`  Local test server stopped cleanly.`);
  }
}

/**
 * Main execution routine
 */
async function main() {
  console.log('\n\x1b[1m\x1b[36m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m       MEALWISE PORTABLE SHOWCASE SYNCHRONIZATION & DEPLOYMENT        \x1b[0m');
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m');
  console.log(`Workspace: ${workspaceRoot}`);
  console.log(`Showcase:  ${showcaseDir}`);

  const startTime = Date.now();

  try {
    buildProductionBundle();
    cleanTargetAssets();
    copyNewAssets();
    const { referencedFiles } = verifyDeployedFiles();
    await verifyHttpServing(referencedFiles);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n\x1b[1m\x1b[36m======================================================================\x1b[0m');
    console.log(`\x1b[1m\x1b[32m[SUCCESS] Showcase synchronization complete in ${elapsed}s!\x1b[0m`);
    console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');
    process.exit(0);
  } catch (err) {
    console.error('\n\x1b[1m\x1b[31m======================================================================\x1b[0m');
    console.error(`\x1b[1m\x1b[31m[FAILED] Showcase sync error:\x1b[0m ${err.message}`);
    if (err.stack) console.error(err.stack);
    console.error('\x1b[1m\x1b[31m======================================================================\x1b[0m\n');
    process.exit(1);
  }
}

main();
