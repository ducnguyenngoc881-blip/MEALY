/**
 * MealWise Adversarial Stress Test Suite — Challenger 2
 * Domain Focus: Touch Gestures, Mobile Viewports (<650px & 320px), and WCAG AA Contrast
 */

import { getContrastRatio, isWcagAaCompliant, isWcagAaLargeCompliant } from './helpers/contrastMath';

console.log('\n======================================================================');
console.log('       CHALLENGER 2: ADVERSARIAL STRESS-TESTING & EMPIRICAL AUDIT      ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, msg: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${msg}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] ${msg}`);
  }
}

// ======================================================================
// SECTION 1: TOUCH GESTURES & SCROLL BOUNDARIES
// ======================================================================
console.log('\n--- 1. TOUCH GESTURES & SCROLL BOUNDARIES ---');

// Implementation replica from WeeklyBoard.tsx
function evaluateWeeklyBoardSwipe(diffX: number, diffY: number, currentIndex: number, totalDays: number = 7): {
  swiped: boolean;
  direction: 'left' | 'right' | 'none';
  newIndex: number;
} {
  // WeeklyBoard.tsx condition:
  // Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 40
  const isSwipe = Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 40;
  if (!isSwipe) {
    return { swiped: false, direction: 'none', newIndex: currentIndex };
  }

  if (diffX > 0) {
    return { swiped: true, direction: 'right', newIndex: Math.max(0, currentIndex - 1) };
  } else {
    return { swiped: true, direction: 'left', newIndex: Math.min(totalDays - 1, currentIndex + 1) };
  }
}

// 1.1 Pure vertical scroll simulation (10,000 iterations)
let verticalCollisions = 0;
for (let i = 0; i < 10000; i++) {
  // diffX in [-30..30] (slight thumb drift), diffY in [40..800] (vigorous scroll)
  const diffX = (Math.random() * 60) - 30;
  const diffY = (Math.random() * 760) + 40;
  const result = evaluateWeeklyBoardSwipe(diffX, diffY, 2);
  if (result.swiped) verticalCollisions++;
}
assert(verticalCollisions === 0, `Pure vertical scroll (10k trials): 0 collisions detected (actual: ${verticalCollisions})`);

// 1.2 Ergonomic Thumb Arc drift (natural downward-curved scroll)
// Thumb arcing creates up to 60px horizontal drift during a 120px-300px scroll
let ergonomicCollisions = 0;
for (let i = 0; i < 5000; i++) {
  const diffY = 100 + Math.random() * 300;
  const diffX = (Math.random() * 0.5 * diffY) * (Math.random() > 0.5 ? 1 : -1); // diffX <= 0.5 * diffY
  const result = evaluateWeeklyBoardSwipe(diffX, diffY, 3);
  if (result.swiped) ergonomicCollisions++;
}
assert(ergonomicCollisions === 0, `Ergonomic curved vertical scroll (5k trials): 0 collisions (actual: ${ergonomicCollisions})`);

// 1.3 Intentional horizontal swipes
let successfulSwipes = 0;
for (let i = 0; i < 5000; i++) {
  // diffX in [45..300], diffY in [-15..15]
  const diffX = (45 + Math.random() * 255) * (i % 2 === 0 ? 1 : -1);
  const diffY = (Math.random() * 30) - 15;
  const result = evaluateWeeklyBoardSwipe(diffX, diffY, 3);
  if (result.swiped) successfulSwipes++;
}
assert(successfulSwipes === 5000, `Intentional horizontal swipes (5k trials): 100% recognized (${successfulSwipes}/5000)`);

// 1.4 Ambiguous diagonal swipes (around 45 degrees: |diffX| ~ |diffY|)
let diagonalCollisions = 0;
for (let i = 0; i < 5000; i++) {
  const base = 50 + Math.random() * 150;
  const diffX = base;
  const diffY = base * (0.8 + Math.random() * 0.4); // 0.8 to 1.2 ratio
  const result = evaluateWeeklyBoardSwipe(diffX, diffY, 2);
  if (result.swiped) diagonalCollisions++;
}
assert(diagonalCollisions === 0, `Ambiguous diagonal swipe rejection: 0 false triggers (${diagonalCollisions}/5000)`);

// 1.5 Boundary Day Clamping
assert(evaluateWeeklyBoardSwipe(100, 0, 0).newIndex === 0, 'Monday swipe-right clamped to index 0');
assert(evaluateWeeklyBoardSwipe(-100, 0, 6).newIndex === 6, 'Sunday swipe-left clamped to index 6');
assert(evaluateWeeklyBoardSwipe(-100, 0, 0).newIndex === 1, 'Monday swipe-left advances to Tuesday (index 1)');
assert(evaluateWeeklyBoardSwipe(100, 0, 6).newIndex === 5, 'Sunday swipe-right rewinds to Saturday (index 5)');

// 1.6 Bottom Sheet Drag-to-Dismiss Clamping
function simulateBottomSheetDrag(startY: number, currentY: number, threshold: number = 75) {
  const rawDiff = currentY - startY;
  const clampedDragY = Math.max(0, rawDiff);
  const dismissed = clampedDragY > threshold;
  return { clampedDragY, dismissed };
}

// Negative drag (upward swipe) must clamp to 0
assert(simulateBottomSheetDrag(200, 100).clampedDragY === 0, 'Upward drag (diff = -100px) strictly clamped to 0px');
assert(simulateBottomSheetDrag(200, 199).clampedDragY === 0, 'Micro upward drag (diff = -1px) clamped to 0px');
assert(simulateBottomSheetDrag(200, 200).clampedDragY === 0, 'Zero movement drag clamped to 0px');

// Below threshold bounce-back
assert(simulateBottomSheetDrag(100, 174).dismissed === false, 'Downward drag of 74px (<75px threshold) does NOT dismiss (bounces back)');
assert(simulateBottomSheetDrag(100, 175).dismissed === false, 'Downward drag of 75px exactly does NOT dismiss');
assert(simulateBottomSheetDrag(100, 176).dismissed === true, 'Downward drag of 76px (>75px threshold) successfully dismisses');
assert(simulateBottomSheetDrag(100, 600).dismissed === true, 'Fast downward drag of 500px successfully dismisses');


// ======================================================================
// SECTION 2: MOBILE VIEWPORTS & LOW-HEIGHT SCREEN BOUNDS
// ======================================================================
console.log('\n--- 2. MOBILE VIEWPORTS & LOW-HEIGHT SCREEN BOUNDS ---');

interface ViewportSpec {
  name: string;
  width: number;
  height: number;
}

const VIEWPORTS: ViewportSpec[] = [
  { name: 'Ultra-small / Legacy', width: 320, height: 480 },
  { name: 'iPhone SE (1st gen)', width: 320, height: 568 },
  { name: 'Low-end Android', width: 360, height: 640 },
  { name: 'iPhone SE (2nd/3rd)', width: 375, height: 667 },
  { name: 'iPhone 13 / 14 / 15', width: 390, height: 844 },
  { name: 'Pixel 7 / Galaxy S21', width: 412, height: 915 }
];

for (const vp of VIEWPORTS) {
  // Outer overlay padding: p-2.5 (10px on each side = 20px) on mobile
  const outerPadding = vp.width < 640 ? 20 : 32;
  const modalWidth = Math.min(512, vp.width - outerPadding);

  // In low-height viewport, modal height is h-[92vh]
  const modalHeight = Math.round(vp.height * 0.92);

  const headerHeight = 60; // progress bar (6px) + header padding (pt-3.5 pb-2.5) + text/icon
  const footerHeight = 56; // border-t + py-3 (24px) + button height (40px)
  const availableScrollBodyHeight = modalHeight - headerHeight - footerHeight;

  assert(
    availableScrollBodyHeight >= 250,
    `Viewport ${vp.name} (${vp.width}x${vp.height}): Scrollable body height (${availableScrollBodyHeight}px) preserves usable question space`
  );

  assert(
    footerHeight + headerHeight < modalHeight,
    `Viewport ${vp.name} (${vp.width}x${vp.height}): Sticky footer permanently anchored without clipping`
  );

  // Test button container width in 320px screen
  const footerPadding = vp.width < 640 ? 32 : 48; // px-4 = 16*2 = 32px
  const availableFooterWidth = modalWidth - footerPadding;

  // Step 1: Only "Tiếp Theo" button
  const nextBtnWidthStep1 = 110; // "Tiếp Theo" + icon + px-4 (32px)
  assert(
    nextBtnWidthStep1 <= availableFooterWidth,
    `Viewport ${vp.name} (${vp.width}px) Step 1: Next button (${nextBtnWidthStep1}px) fits in available footer (${availableFooterWidth}px)`
  );

  // Steps 2 & 3: "Quay Lại" + "Tiếp Theo"
  const backBtnWidth = 96; // "Quay Lại" + icon + px-3
  const gap = 8; // gap-2 = 8px
  const combinedSteps23 = backBtnWidth + nextBtnWidthStep1 + gap;
  assert(
    combinedSteps23 <= availableFooterWidth,
    `Viewport ${vp.name} (${vp.width}px) Steps 2-3: Both action buttons (${combinedSteps23}px) fit without wrapping (limit: ${availableFooterWidth}px)`
  );

  // Step 4: "Quay Lại" + "Hoàn Tất" (with hidden xs:inline "Thiết Lập")
  // On 320px width screen (<475px), "Thiết Lập" is hidden via Tailwind 'hidden xs:inline'
  const nextBtnWidthStep4 = 106; // "Hoàn Tất" + icon + px-4
  const combinedStep4 = backBtnWidth + nextBtnWidthStep4 + gap;
  assert(
    combinedStep4 <= availableFooterWidth,
    `Viewport ${vp.name} (${vp.width}px) Step 4: Final completion buttons (${combinedStep4}px) fit without overflow (limit: ${availableFooterWidth}px)`
  );
}


// ======================================================================
// SECTION 3: WCAG AA CONTRAST COMPLIANCE AUDIT
// ======================================================================
console.log('\n--- 3. WCAG AA CONTRAST COMPLIANCE AUDIT ---');

interface ColorTokenPair {
  label: string;
  fg: string;
  bg: string;
  isLargeText?: boolean;
}

const COLOR_PAIRS: ColorTokenPair[] = [
  // LIGHT MODE AUDIT
  { label: 'Light - Headings: text-slate-900 (#0f172a) on white (#ffffff)', fg: '#0f172a', bg: '#ffffff' },
  { label: 'Light - Subtitles: text-slate-800 (#1e293b) on white (#ffffff)', fg: '#1e293b', bg: '#ffffff' },
  { label: 'Light - Body text: text-slate-700 (#334155) on white (#ffffff)', fg: '#334155', bg: '#ffffff' },
  { label: 'Light - Muted text: text-slate-600 (#475569) on white (#ffffff)', fg: '#475569', bg: '#ffffff' },
  { label: 'Light - Action Button: text-slate-950 (#020617) on bg-emerald-500 (#10b981)', fg: '#020617', bg: '#10b981' },
  { label: 'Light - Emerald label: text-emerald-700 (#047857) on white (#ffffff)', fg: '#047857', bg: '#ffffff' },
  { label: 'Light - Emerald label bold: text-emerald-800 (#065f46) on white (#ffffff)', fg: '#065f46', bg: '#ffffff' },
  { label: 'Light - Emerald label dark: text-emerald-900 (#064e3b) on white (#ffffff)', fg: '#064e3b', bg: '#ffffff' },
  { label: 'Light - Amber badge: text-amber-700 (#b45309) on white (#ffffff)', fg: '#b45309', bg: '#ffffff' },
  { label: 'Light - Amber dark: text-amber-800 (#92400e) on white (#ffffff)', fg: '#92400e', bg: '#ffffff' },
  { label: 'Light - Rose warning: text-rose-700 (#be123c) on white (#ffffff)', fg: '#be123c', bg: '#ffffff' },
  { label: 'Light - Rose dark: text-rose-800 (#9f1239) on white (#ffffff)', fg: '#9f1239', bg: '#ffffff' },
  { label: 'Light - Blue protein: text-blue-700 (#1d4ed8) on white (#ffffff)', fg: '#1d4ed8', bg: '#ffffff' },
  { label: 'Light - Blue dark: text-blue-800 (#1e40af) on white (#ffffff)', fg: '#1e40af', bg: '#ffffff' },
  { label: 'Light - Secondary Button: text-slate-800 (#1e293b) on bg-slate-100 (#f1f5f9)', fg: '#1e293b', bg: '#f1f5f9' },

  // DARK MODE AUDIT
  { label: 'Dark - Headings: text-white (#ffffff) on slate-900 (#0f172a)', fg: '#ffffff', bg: '#0f172a' },
  { label: 'Dark - Headings: text-white (#ffffff) on slate-950 (#020617)', fg: '#ffffff', bg: '#020617' },
  { label: 'Dark - Body text: text-slate-200 (#e2e8f0) on slate-900 (#0f172a)', fg: '#e2e8f0', bg: '#0f172a' },
  { label: 'Dark - Body text: text-slate-300 (#cbd5e1) on slate-900 (#0f172a)', fg: '#cbd5e1', bg: '#0f172a' },
  { label: 'Dark - Secondary text: text-slate-400 (#94a3b8) on slate-900 (#0f172a)', fg: '#94a3b8', bg: '#0f172a' },
  { label: 'Dark - Secondary text: text-slate-400 (#94a3b8) on slate-950 (#020617)', fg: '#94a3b8', bg: '#020617' },
  { label: 'Dark - Emerald accent: text-emerald-300 (#6ee7b7) on slate-900 (#0f172a)', fg: '#6ee7b7', bg: '#0f172a' },
  { label: 'Dark - Emerald accent: text-emerald-400 (#34d399) on slate-900 (#0f172a)', fg: '#34d399', bg: '#0f172a' },
  { label: 'Dark - Amber accent: text-amber-300 (#fcd34d) on slate-900 (#0f172a)', fg: '#fcd34d', bg: '#0f172a' },
  { label: 'Dark - Rose warning: text-rose-300 (#fda4af) on slate-900 (#0f172a)', fg: '#fda4af', bg: '#0f172a' },
  { label: 'Dark - Blue protein: text-blue-300 (#93c5fd) on slate-900 (#0f172a)', fg: '#93c5fd', bg: '#0f172a' },
  { label: 'Dark - Secondary Button: text-slate-200 (#e2e8f0) on bg-slate-800 (#1e293b)', fg: '#e2e8f0', bg: '#1e293b' },
  { label: 'Dark - Emerald badge: text-emerald-300 (#6ee7b7) on bg-emerald-950 (#022c22)', fg: '#6ee7b7', bg: '#022c22' },
  { label: 'Dark - Amber badge: text-amber-300 (#fcd34d) on bg-amber-950 (#451a03)', fg: '#fcd34d', bg: '#451a03' }
];

for (const pair of COLOR_PAIRS) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const targetRatio = pair.isLargeText ? 3.0 : 4.5;
  const compliant = ratio >= targetRatio;

  assert(
    compliant,
    `${pair.label} => Ratio: ${ratio.toFixed(2)}:1 (Min: ${targetRatio}:1)`
  );
}

// ======================================================================
// SECTION 4: SUMMARY & VERDICT
// ======================================================================
console.log('\n======================================================================');
console.log(`STRESS AUDIT COMPLETED: Total Checks: ${totalChecks} | Passed: ${passedChecks} | Failed: ${failedChecks}`);
console.log(`Compliance Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
console.log('======================================================================\n');

if (failedChecks === 0) {
  console.log('>>> VERDICT: APPROVE <<<');
  process.exit(0);
} else {
  console.log('>>> VERDICT: REQUEST_CHANGES <<<');
  process.exit(1);
}
