import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateAllMonMan } from './build-complete-catalog.mjs';
import { generateAllMonCanh } from './catalog-mon-canh.mjs';
import { generateAllMonRau } from './catalog-mon-rau.mjs';
import { generateAllMonChay } from './catalog-mon-chay.mjs';
import { generateAllAnSang } from './catalog-an-sang.mjs';
import { generateAllTrangMieng } from './catalog-trang-mieng.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Generating recipe subsets...');
const monMan = generateAllMonMan();
const monCanh = generateAllMonCanh();
const monRau = generateAllMonRau();
const monChay = generateAllMonChay();
const anSang = generateAllAnSang();
const trangMieng = generateAllTrangMieng();

console.log(`Counts:
  mon-man: ${monMan.length} (expected 350)
  mon-canh: ${monCanh.length} (expected 200)
  mon-rau: ${monRau.length} (expected 180)
  mon-chay: ${monChay.length} (expected 120)
  an-sang: ${anSang.length} (expected 100)
  trang-mieng: ${trangMieng.length} (expected 50)
`);

if (monMan.length !== 350 || monCanh.length !== 200 || monRau.length !== 180 ||
    monChay.length !== 120 || anSang.length !== 100 || trangMieng.length !== 50) {
  throw new Error('Unexpected recipe subset counts!');
}

const part1 = [
  ...monMan.slice(0, 200),
  ...monCanh.slice(0, 100),
  ...monRau.slice(0, 90),
  ...monChay.slice(0, 60),
  ...anSang.slice(0, 50)
];

const part2 = [
  ...monMan.slice(200, 350),
  ...monCanh.slice(100, 200),
  ...monRau.slice(90, 180),
  ...monChay.slice(60, 120),
  ...anSang.slice(50, 100),
  ...trangMieng
];

console.log(`Part 1 total: ${part1.length} (expected 500)`);
console.log(`Part 2 total: ${part2.length} (expected 500)`);

if (part1.length !== 500 || part2.length !== 500) {
  throw new Error('Part totals do not equal 500 each!');
}

// Validation
const all1000 = [...part1, ...part2];
const ids = new Set();
const BLACKLISTED = [
  'photo-1544025162-d76694265947',
  'photo-1540420773420-3366772f4999',
  'photo-1547592166-23ac45744acd',
  'photo-1528735602780-2552fd46c7af',
  'photo-1574484284002-952d92456975',
  'photo-1541832676-9b763b0239ab',
  'photo-1534422298391-e4f8c172dddb',
  'photo-1546069901-ba9599a7e63c',
  'photo-1512058564366-18510be2db19',
  'photo-1528207776546-365bb710ee93',
  'photo-1576107232684-1279f3908594',
  'photo-176107232684-1279f3908594',
  'photo-1627054234057-a41764661031',
  'photo-1621996346565-e3d5d6281744',
  'photo-1621996346565-e3d5d6281292',
  'photo-1573140247632-f8fd74997d5c'
];

all1000.forEach((r, idx) => {
  if (ids.has(r.id)) {
    throw new Error(`Duplicate ID found: ${r.id} at index ${idx}`);
  }
  ids.add(r.id);

  if (!r.title || r.title.length < 5) throw new Error(`Short title in ${r.id}`);
  if (!r.description || r.description.length < 15) throw new Error(`Short description in ${r.id}`);
  if (!r.imageUrl || !r.imageUrl.startsWith('https://images.unsplash.com/')) {
    throw new Error(`Invalid imageUrl in ${r.id}: ${r.imageUrl}`);
  }
  for (const bad of BLACKLISTED) {
    if (r.imageUrl.includes(bad)) {
      throw new Error(`Blacklisted image ${bad} in ${r.id}`);
    }
  }

  if (!r.ingredients || r.ingredients.length < 2) {
    throw new Error(`Empty or too few ingredients in ${r.id}`);
  }
  for (const ing of r.ingredients) {
    if (!ing.name || typeof ing.amount !== 'number' || ing.amount <= 0 || !ing.unit) {
      throw new Error(`Invalid ingredient in ${r.id}: ${JSON.stringify(ing)}`);
    }
    const u = ing.unit.toLowerCase();
    if (u.includes('chai (1l)') || u.includes('vỉ (10 quả)')) {
      throw new Error(`Packaging violation in ${r.id}: ${ing.unit}`);
    }
  }

  if (!r.instructions || r.instructions.length < 4) {
    throw new Error(`Less than 4 instructions in ${r.id}`);
  }
  for (const inst of r.instructions) {
    if (!inst.title || inst.title.length < 5) throw new Error(`Short instruction title in ${r.id}`);
    if (!inst.content || inst.content.length < 15) throw new Error(`Short instruction content in ${r.id}`);
    if (typeof inst.durationMinutes !== 'number' || inst.durationMinutes <= 0) {
      throw new Error(`Invalid durationMinutes in ${r.id}`);
    }
    if (!inst.heatLevel) throw new Error(`Missing heatLevel in ${r.id}`);
  }

  if (!r.chefTip || r.chefTip.length < 15 || !r.chefTip.startsWith('Bí quyết đầu bếp:')) {
    throw new Error(`Invalid chefTip in ${r.id}: ${r.chefTip}`);
  }
});

console.log('All 1,000 recipes passed rigorous validation!');

const part1Path = path.resolve(rootDir, 'src/data/vietnameseDishesPart1.ts');
const part2Path = path.resolve(rootDir, 'src/data/vietnameseDishesPart2.ts');

const part1Content = `import { Recipe } from '../types';\n\nexport const vietnameseDishesPart1: Recipe[] = ${JSON.stringify(part1, null, 2)};\n`;
const part2Content = `import { Recipe } from '../types';\n\nexport const vietnameseDishesPart2: Recipe[] = ${JSON.stringify(part2, null, 2)};\n`;

fs.writeFileSync(part1Path, part1Content, 'utf-8');
console.log(`Wrote ${part1.length} recipes to ${part1Path}`);

fs.writeFileSync(part2Path, part2Content, 'utf-8');
console.log(`Wrote ${part2.length} recipes to ${part2Path}`);
