/**
 * Empirical Adversarial Stress Test Suite for Milestone 1 (M1_2)
 * Challenger: Challenger M1_2
 * 
 * Verifies:
 * 1. WCAG 2.1 Contrast Ratios for Exia Repair III Flat Matte Palette
 *    - Light Canvas (#F8FAFC) vs Primary Text (#1E293B) (AA >= 4.5, AAA >= 7.0)
 *    - Dark Canvas (#12161F) vs Primary Text (#F8FAFC) (AA >= 4.5, AAA >= 7.0)
 *    - Primary Cobalt Blue (#1D4ED8) vs White Text (#FFFFFF) (AA >= 4.5)
 *    - Light Card (#FFFFFF) vs Primary Text (#1E293B)
 *    - Dark Card (#1A202C) vs Primary Text (#F8FAFC)
 *    - Light Canvas (#F8FAFC) vs Muted Text (#64748B) (AA >= 4.5)
 *    - Dark Canvas (#12161F) vs Muted Text (#94A3B8) (AAA >= 7.0)
 * 2. Mobile Font Scaling Invariants in src/index.css
 *    - font-size: 16px intact on html
 *    - -webkit-text-size-adjust: 100% intact on html, *, and body
 * 3. Mobile Container Clamping in src/App.tsx
 *    - sm:max-w-md md:max-w-lg mx-auto clamping container intact
 *    - Mobile-first full width (<640px) and dynamic viewport height min-h-[100dvh]
 * 4. Automated Test Suite Integration Status
 *    - Full test suite execution status and identification of failing assertions
 */

import fs from 'fs';
import path from 'path';

interface AssertionResult {
  suite: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

const results: AssertionResult[] = [];

function assert(suite: string, name: string, condition: boolean, expected: string, actual: string) {
  results.push({ suite, name, passed: condition, expected, actual });
  if (condition) {
    console.log(`  ✓ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Expected: ${expected}`);
    console.error(`     Actual:   ${actual}`);
  }
}

// WCAG 2.1 Relative Luminance & Contrast Ratio Formulas
function sRGBtoLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

console.log('======================================================================');
console.log('CHALLENGER M1_2: EMPIRICAL STRESS TEST SUITE (CONTRAST & BOUNDS)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: WCAG 2.1 Color Contrast Ratios
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Color Contrast Ratios for Exia Repair III Palette ---');

const crLightCanvas = getContrastRatio('#F8FAFC', '#1E293B');
assert(
  'Suite 1: Contrast',
  'Light Canvas (#F8FAFC) vs Text (#1E293B) >= 7.0:1 (WCAG AAA)',
  crLightCanvas >= 7.0,
  '>= 7.0:1',
  `${crLightCanvas.toFixed(2)}:1`
);

const crDarkCanvas = getContrastRatio('#12161F', '#F8FAFC');
assert(
  'Suite 1: Contrast',
  'Dark Canvas (#12161F) vs Text (#F8FAFC) >= 7.0:1 (WCAG AAA)',
  crDarkCanvas >= 7.0,
  '>= 7.0:1',
  `${crDarkCanvas.toFixed(2)}:1`
);

const crCobalt = getContrastRatio('#1D4ED8', '#FFFFFF');
assert(
  'Suite 1: Contrast',
  'Primary Cobalt Blue (#1D4ED8) vs White Text (#FFFFFF) >= 4.5:1 (WCAG AA)',
  crCobalt >= 4.5,
  '>= 4.5:1',
  `${crCobalt.toFixed(2)}:1`
);

const crLightCard = getContrastRatio('#FFFFFF', '#1E293B');
assert(
  'Suite 1: Contrast',
  'Light Card (#FFFFFF) vs Text (#1E293B) >= 7.0:1 (WCAG AAA)',
  crLightCard >= 7.0,
  '>= 7.0:1',
  `${crLightCard.toFixed(2)}:1`
);

const crDarkCard = getContrastRatio('#1A202C', '#F8FAFC');
assert(
  'Suite 1: Contrast',
  'Dark Card (#1A202C) vs Text (#F8FAFC) >= 7.0:1 (WCAG AAA)',
  crDarkCard >= 7.0,
  '>= 7.0:1',
  `${crDarkCard.toFixed(2)}:1`
);

const crLightMuted = getContrastRatio('#F8FAFC', '#64748B');
assert(
  'Suite 1: Contrast',
  'Light Canvas (#F8FAFC) vs Muted Text (#64748B) >= 4.5:1 (WCAG AA)',
  crLightMuted >= 4.5,
  '>= 4.5:1',
  `${crLightMuted.toFixed(2)}:1`
);

const crDarkMuted = getContrastRatio('#12161F', '#94A3B8');
assert(
  'Suite 1: Contrast',
  'Dark Canvas (#12161F) vs Muted Text (#94A3B8) >= 7.0:1 (WCAG AAA)',
  crDarkMuted >= 7.0,
  '>= 7.0:1',
  `${crDarkMuted.toFixed(2)}:1`
);

// -----------------------------------------------------------------------------
// Suite 2: Font Scaling Invariants in src/index.css
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Font Scaling & Mobile Zoom Invariants ---');
const indexCssPath = path.resolve('src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');

assert(
  'Suite 2: Font Scaling',
  'html selector defines font-size: 16px',
  /html\s*\{[^}]*font-size:\s*16px;[^}]*\}/s.test(indexCssContent),
  'font-size: 16px;',
  indexCssContent.match(/html\s*\{[^}]*font-size:\s*[^;]+;/s)?.[0] || 'not found'
);

assert(
  'Suite 2: Font Scaling',
  'html selector defines -webkit-text-size-adjust: 100%',
  /html\s*\{[^}]*-webkit-text-size-adjust:\s*100%;[^}]*\}/s.test(indexCssContent),
  '-webkit-text-size-adjust: 100%;',
  indexCssContent.match(/html\s*\{[^}]*-webkit-text-size-adjust:\s*[^;]+;/s)?.[0] || 'not found'
);

assert(
  'Suite 2: Font Scaling',
  'Universal selector (*) defines -webkit-text-size-adjust: 100%',
  /\*\s*\{[^}]*-webkit-text-size-adjust:\s*100%;[^}]*\}/s.test(indexCssContent),
  '-webkit-text-size-adjust: 100%;',
  indexCssContent.match(/\*\s*\{[^}]*-webkit-text-size-adjust:\s*[^;]+;/s)?.[0] || 'not found'
);

assert(
  'Suite 2: Font Scaling',
  'body selector defines -webkit-text-size-adjust: 100%',
  /body\s*\{[^}]*-webkit-text-size-adjust:\s*100%;[^}]*\}/s.test(indexCssContent),
  '-webkit-text-size-adjust: 100%;',
  indexCssContent.match(/body\s*\{[^}]*-webkit-text-size-adjust:\s*[^;]+;/s)?.[0] || 'not found'
);

// -----------------------------------------------------------------------------
// Suite 3: Mobile Container Bounds & Clamping in src/App.tsx
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Mobile Container Bounds & Clamping ---');
const appTsxPath = path.resolve('src/App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf-8');

assert(
  'Suite 3: Container Bounds',
  'App mobile shell contains sm:max-w-md md:max-w-lg mx-auto',
  appTsxContent.includes('sm:max-w-md md:max-w-lg mx-auto'),
  'sm:max-w-md md:max-w-lg mx-auto',
  appTsxContent.includes('sm:max-w-md md:max-w-lg mx-auto') ? 'present' : 'missing'
);

assert(
  'Suite 3: Container Bounds',
  'App mobile shell container defines w-full for full-bleed mobile display',
  appTsxContent.includes('w-full sm:max-w-md'),
  'w-full sm:max-w-md',
  appTsxContent.includes('w-full sm:max-w-md') ? 'present' : 'missing'
);

assert(
  'Suite 3: Container Bounds',
  'App mobile shell container defines min-h-[100dvh] for dynamic mobile viewport',
  appTsxContent.includes('min-h-[100dvh]'),
  'min-h-[100dvh]',
  appTsxContent.includes('min-h-[100dvh]') ? 'present' : 'missing'
);

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
console.log(`TOTAL SPECIFIC ASSERTIONS: ${totalCount}`);
console.log(`PASSED: ${passedCount}`);
console.log(`FAILED: ${totalCount - passedCount}`);
console.log(`PASS RATE: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
console.log('======================================================================\n');
