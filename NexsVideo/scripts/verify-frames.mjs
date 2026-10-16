import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const compId = process.argv[2] || 'Group1';
const frames = [15, 60, 150, 220, 350, 420];
const outDir = path.resolve(process.cwd(), 'out', 'verification');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`\n🎬 [Remotion Verification] Extracting keyframes for composition: "${compId}"...`);

for (const frame of frames) {
  const targetPath = path.join(outDir, `frame_${frame}.png`);
  console.log(`📸 Extracting frame ${frame} -> ${path.relative(process.cwd(), targetPath)}`);
  try {
    execSync(
      `npx remotion still src/index.ts "${compId}" "${targetPath}" --frame=${frame} --overwrite --quiet`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error(`❌ Failed to extract frame ${frame}:`, err.message);
  }
}

console.log(`\n✅ Keyframes extracted successfully to: ${outDir}`);
console.log(`💡 You can view these images directly to inspect layout, spacing, and animations.\n`);
