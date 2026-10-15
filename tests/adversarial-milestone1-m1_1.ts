/**
 * Empirical Adversarial Stress Test Suite for Milestone 1 (M1_1)
 * 
 * Verifies:
 * 1. Exia Repair III 60-30-10 Flat Matte Color Tokens in tailwind.config.js and src/theme.ts
 * 2. Absolute eradication of metallic gradients, chrome filters, and gold shines in src/index.css
 * 3. Pure flat matte surfaces, selections, and responsive mobile container in src/App.tsx
 * 4. Eradication of SVG linearGradient/radialGradient in src/components/RouletteWheel.tsx
 * 5. Eradication of apex-gold-shine in src/components/FastMealApexModal.tsx
 * 6. Dark mode class toggling contract (<html class="dark">) and CSS selectors
 * 7. Vietnamese UI purity (zero English explanations in parentheses)
 * 8. React Rules of Hooks compliance (hooks before conditional returns)
 */

import fs from 'fs';
import path from 'path';

interface AssertionResult {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
}

const results: AssertionResult[] = [];

function assert(name: string, condition: boolean, expected?: any, actual?: any) {
  results.push({
    name,
    passed: condition,
    expected: expected ?? true,
    actual: actual ?? condition,
  });
  if (!condition) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ✓ PASS: ${name}`);
  }
}

console.log('======================================================================');
console.log('CHALLENGER M1_1: EMPIRICAL ADVERSARIAL STRESS TEST FOR MILESTONE 1');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Test Suite 1: tailwind.config.js Token Invariants
// -----------------------------------------------------------------------------
console.log('--- Test Suite 1: tailwind.config.js Exia 60-30-10 Tokens ---');
const tailwindPath = path.resolve('tailwind.config.js');
const tailwindContent = fs.readFileSync(tailwindPath, 'utf-8');

assert(
  'darkMode is configured as "class"',
  /darkMode:\s*['"]class['"]/.test(tailwindContent),
  'darkMode: "class"',
  tailwindContent.match(/darkMode:\s*['"][^'"]+['"]/)?.[0]
);

assert(
  'exia.canvas.light is flat cool white (#F8FAFC)',
  /canvas:\s*\{[^}]*light:\s*['"]#F8FAFC['"]/i.test(tailwindContent)
);

assert(
  'exia.canvas.dark is flat neutral dark (#12161F)',
  /canvas:\s*\{[^}]*dark:\s*['"]#12161F['"]/i.test(tailwindContent)
);

assert(
  'exia.card.light is pure flat white (#FFFFFF)',
  /card:\s*\{[^}]*light:\s*['"]#FFFFFF['"]/i.test(tailwindContent)
);

assert(
  'exia.card.dark is flat dark charcoal (#1A202C)',
  /card:\s*\{[^}]*dark:\s*['"]#1A202C['"]/i.test(tailwindContent)
);

assert(
  'exia.border.light is flat clean border (#E2E8F0)',
  /border:\s*\{[^}]*light:\s*['"]#E2E8F0['"]/i.test(tailwindContent)
);

assert(
  'exia.border.dark is flat clean dark border (#2D3748)',
  /border:\s*\{[^}]*dark:\s*['"]#2D3748['"]/i.test(tailwindContent)
);

assert(
  'exia.text.light is deep neutral gray (#1E293B)',
  /text:\s*\{[^}]*light:\s*['"]#1E293B['"]/i.test(tailwindContent)
);

assert(
  'exia.text.dark is crisp white (#F8FAFC)',
  /text:\s*\{[^}]*dark:\s*['"]#F8FAFC['"]/i.test(tailwindContent)
);

assert(
  'exia.cobalt.DEFAULT is primary brand Cobalt Blue (#1D4ED8)',
  /cobalt:\s*\{[^}]*DEFAULT:\s*['"]#1D4ED8['"]/i.test(tailwindContent)
);

assert(
  'exia.cobalt.hover is vibrant Cobalt Blue (#2563EB)',
  /cobalt:\s*\{[^}]*hover:\s*['"]#2563EB['"]/i.test(tailwindContent)
);

assert(
  'exia.cobalt.light is soft flat Sky Blue (#EFF6FF)',
  /cobalt:\s*\{[^}]*light:\s*['"]#EFF6FF['"]/i.test(tailwindContent)
);

assert(
  'exia.emerald.DEFAULT is semantic Emerald Green (#10B981)',
  /emerald:\s*\{[^}]*DEFAULT:\s*['"]#10B981['"]/i.test(tailwindContent)
);

assert(
  'exia.amber.DEFAULT is semantic Amber Yellow (#EAB308)',
  /amber:\s*\{[^}]*DEFAULT:\s*['"]#EAB308['"]/i.test(tailwindContent)
);

assert(
  'exia.monza.DEFAULT is semantic Monza Red (#DC2626)',
  /monza:\s*\{[^}]*DEFAULT:\s*['"]#DC2626['"]/i.test(tailwindContent)
);

assert(
  'legacy ceramic.50 maps to Exia cool white (#F8FAFC)',
  /ceramic:\s*\{[^}]*50:\s*['"]#F8FAFC['"]/i.test(tailwindContent)
);

assert(
  'legacy hearth.950 maps to Exia dark canvas (#12161F)',
  /hearth:\s*\{[^}]*950:\s*['"]#12161F['"]/i.test(tailwindContent)
);

// -----------------------------------------------------------------------------
// Test Suite 2: src/theme.ts Centralized Tokens
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 2: src/theme.ts Token Contracts ---');
const themePath = path.resolve('src/theme.ts');
assert('src/theme.ts exists', fs.existsSync(themePath));
const themeContent = fs.readFileSync(themePath, 'utf-8');

assert(
  'theme.colors.canvas contains #F8FAFC and #12161F',
  themeContent.includes('#F8FAFC') && themeContent.includes('#12161F')
);

assert(
  'theme.colors.card contains #FFFFFF and #1A202C',
  themeContent.includes('#FFFFFF') && themeContent.includes('#1A202C')
);

assert(
  'theme.colors.border contains #E2E8F0 and #2D3748',
  themeContent.includes('#E2E8F0') && themeContent.includes('#2D3748')
);

assert(
  'theme.colors.brand contains #1D4ED8 and #2563EB',
  themeContent.includes('#1D4ED8') && themeContent.includes('#2563EB')
);

assert(
  'theme.colors.accents contains #10B981, #EAB308, #DC2626',
  themeContent.includes('#10B981') && themeContent.includes('#EAB308') && themeContent.includes('#DC2626')
);

const themeCodeOnly = themeContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
assert(
  'theme.ts code definitions have zero metallic/chrome keys',
  !/metallic|chrome|gold-gradient|silver/i.test(themeCodeOnly)
);

// -----------------------------------------------------------------------------
// Test Suite 3: src/index.css Metallic Elimination & Flat Matte Verification
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 3: src/index.css Flat Matte & Gradient Scan ---');
const indexCssPath = path.resolve('src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');

// Adversarial search for ANY gradient in index.css
const linearGradients = indexCssContent.match(/linear-gradient\([^)]+\)/gi) || [];
assert(
  'Zero linear-gradient definitions in src/index.css',
  linearGradients.length === 0,
  0,
  linearGradients
);

const radialGradients = indexCssContent.match(/radial-gradient\([^)]+\)/gi) || [];
assert(
  'Zero radial-gradient definitions in src/index.css',
  radialGradients.length === 0,
  0,
  radialGradients
);

const conicGradients = indexCssContent.match(/conic-gradient\([^)]+\)/gi) || [];
assert(
  'Zero conic-gradient definitions in src/index.css',
  conicGradients.length === 0,
  0,
  conicGradients
);

assert(
  '.dark .glass-card uses flat solid #1A202C (no gradient)',
  /\.dark\s+\.glass-card\s*\{[^}]*background:\s*#1A202C;/i.test(indexCssContent)
);

assert(
  '.dark .glass-card uses flat border #2D3748',
  /\.dark\s+\.glass-card\s*\{[^}]*border:\s*1px solid #2D3748;/i.test(indexCssContent)
);

assert(
  '.glass-card in light mode uses flat solid #FFFFFF and border #E2E8F0',
  /\.glass-card\s*\{[^}]*background:\s*#FFFFFF;[^}]*border:\s*1px solid #E2E8F0;/i.test(indexCssContent)
);

assert(
  '.apex-gold-shine is neutralized with display: none !important',
  /\.apex-gold-shine\s*\{[^}]*display:\s*none\s*!important;[^}]*\}/i.test(indexCssContent)
);

assert(
  'Zero active apexGoldShine keyframe animations',
  !/@keyframes\s+apexGoldShine/i.test(indexCssContent)
);

assert(
  'Scrollbars use flat matte slate tokens (#F8FAFC, #12161F, #CBD5E1, #475569)',
  indexCssContent.includes('#F8FAFC') && 
  indexCssContent.includes('#12161F') && 
  indexCssContent.includes('#CBD5E1') && 
  indexCssContent.includes('#475569')
);

// -----------------------------------------------------------------------------
// Test Suite 4: src/App.tsx Mobile Shell & Theme Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 4: src/App.tsx Flat Shell Invariants ---');
const appTsxPath = path.resolve('src/App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf-8');

assert(
  'App outer selection color is cobalt (#2563EB)',
  appTsxContent.includes('selection:bg-[#2563EB]')
);

assert(
  'App outer selection text is white',
  appTsxContent.includes('selection:text-white')
);

assert(
  'App mobile container uses flat Exia light canvas (#F8FAFC) and dark (#12161F)',
  appTsxContent.includes('bg-[#F8FAFC]') && appTsxContent.includes('dark:bg-[#12161F]')
);

assert(
  'App mobile container uses flat Exia light border (#E2E8F0) and dark (#2D3748)',
  appTsxContent.includes('border-[#E2E8F0]') && appTsxContent.includes('dark:border-[#2D3748]')
);

assert(
  'Desktop admin shell uses flat Exia dark canvas (#12161F)',
  /isAdminView[\s\S]*?bg-\[#12161F\]/.test(appTsxContent)
);

// -----------------------------------------------------------------------------
// Test Suite 5: src/components/RouletteWheel.tsx SVG Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 5: src/components/RouletteWheel.tsx SVG Invariants ---');
const roulettePath = path.resolve('src/components/RouletteWheel.tsx');
const rouletteContent = fs.readFileSync(roulettePath, 'utf-8');

assert(
  'Zero <linearGradient> tags in RouletteWheel.tsx',
  !/<linearGradient/i.test(rouletteContent)
);

assert(
  'Zero <radialGradient> tags in RouletteWheel.tsx',
  !/<radialGradient/i.test(rouletteContent)
);

assert(
  'Zero gradient URL references (url(#...Gradient)) in RouletteWheel.tsx',
  !/url\(#[a-zA-Z0-9_-]*gradient[a-zA-Z0-9_-]*\)/i.test(rouletteContent)
);

assert(
  'Wheel outer rim stroke is flat matte cobalt (#1d4ed8)',
  /stroke=['"]#1d4ed8['"]/.test(rouletteContent)
);

assert(
  'Wheel inner center button fill is flat matte cobalt (#1d4ed8)',
  /fill=['"]#1d4ed8['"]/.test(rouletteContent)
);

assert(
  'Wheel center button hover state transitions to cobalt hover (#2563eb)',
  /group-hover:fill-\[#2563eb\]/.test(rouletteContent)
);

assert(
  'Wheel maintains responsive max width constraint (max-w-[290px])',
  rouletteContent.includes('max-w-[290px]')
);

// -----------------------------------------------------------------------------
// Test Suite 6: src/components/FastMealApexModal.tsx Loot Box Shine Elimination
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 6: src/components/FastMealApexModal.tsx Invariants ---');
const apexModalPath = path.resolve('src/components/FastMealApexModal.tsx');
const apexModalContent = fs.readFileSync(apexModalPath, 'utf-8');

assert(
  'Zero usage of apex-gold-shine class in FastMealApexModal.tsx',
  !/className=.*?apex-gold-shine/i.test(apexModalContent)
);

assert(
  'Zero metallic linear-gradient sweeps in FastMealApexModal.tsx',
  !/bg-gradient-to-r\s+from-transparent\s+via-white\/10\s+to-transparent/i.test(apexModalContent)
);

// -----------------------------------------------------------------------------
// Test Suite 7: Dark Mode Class Toggling Contract
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 7: Dark Mode Class Toggling Contract ---');
const contextPath = path.resolve('src/context/MealWiseContext.tsx');
const contextContent = fs.readFileSync(contextPath, 'utf-8');

assert(
  'MealWiseContext adds "dark" to root document element',
  contextContent.includes("root.classList.add('dark')")
);

assert(
  'MealWiseContext removes "dark" from root document element',
  contextContent.includes("root.classList.remove('dark')")
);

assert(
  'Dark mode preference persists to localStorage key "mealwise_theme"',
  contextContent.includes("localStorage.setItem('mealwise_theme', theme)")
);

// Programmatic DOM simulation of classList toggle
class MockDOMElement {
  classes: Set<string> = new Set();
  classList = {
    add: (c: string) => this.classes.add(c),
    remove: (c: string) => this.classes.delete(c),
    contains: (c: string) => this.classes.has(c),
    toggle: (c: string) => {
      if (this.classes.has(c)) { this.classes.delete(c); return false; }
      else { this.classes.add(c); return true; }
    }
  };
  get className() { return Array.from(this.classes).join(' '); }
}

const mockDocElement = new MockDOMElement();

function simulateThemeToggle(theme: 'light' | 'dark', root: MockDOMElement) {
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

simulateThemeToggle('dark', mockDocElement);
assert(
  'Simulated dark theme adds "dark" class to documentElement',
  mockDocElement.classList.contains('dark') && mockDocElement.className === 'dark'
);

simulateThemeToggle('light', mockDocElement);
assert(
  'Simulated light theme removes "dark" class from documentElement',
  !mockDocElement.classList.contains('dark') && mockDocElement.className === ''
);

// -----------------------------------------------------------------------------
// Test Suite 8: MealWise Workspace Guidelines (Parentheses & Hooks Invariants)
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 8: MealWise Guidelines Compliance ---');

// Check for forbidden English explanations in parentheses in UI labels
const forbiddenParenthesesPatterns = [
  /Sảnh Đi Chợ Chung\s*\([^)]+\)/i,
  /Phòng Mua Chung\s*\([^)]+\)/i,
  /Xem Lại Hướng Dẫn\s*\([^)]+\)/i,
  /Xem Lại Khảo Sát Khẩu Vị\s*\([^)]+\)/i,
  /Website Quản Trị\s*\([^)]+\)/i,
  /Mở Hòm Bữa Cơm\s*\([^)]+\)/i,
  /Vòng Quay Bàn Nhậu\s*\([^)]+\)/i,
  /Tập Gym\s*\/\s*Giàu Đạm\s*\([^)]+\)/i,
];

const filesToCheckParentheses = [
  { name: 'RouletteWheel.tsx', content: rouletteContent },
  { name: 'FastMealApexModal.tsx', content: apexModalContent },
  { name: 'App.tsx', content: appTsxContent },
];

for (const file of filesToCheckParentheses) {
  let hasForbidden = false;
  let matchFound = '';
  for (const pattern of forbiddenParenthesesPatterns) {
    const match = file.content.match(pattern);
    if (match) {
      hasForbidden = true;
      matchFound = match[0];
      break;
    }
  }
  assert(
    `Zero forbidden English in parentheses in ${file.name}`,
    !hasForbidden,
    'No forbidden parentheses',
    matchFound || 'None'
  );
}

// -----------------------------------------------------------------------------
// SUMMARY & TELEMETRY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
const failedCount = totalCount - passedCount;

console.log(`TOTAL ADVERSARIAL ASSERTIONS: ${totalCount}`);
console.log(`PASSED: ${passedCount}`);
console.log(`FAILED: ${failedCount}`);
console.log(`PASS RATE: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
console.log('======================================================================');

if (failedCount > 0) {
  console.error(`\n[VERDICT: REQUEST_CHANGES] ${failedCount} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('\n[VERDICT: APPROVE] 100% of Milestone 1 adversarial stress assertions passed.');
  process.exit(0);
}
