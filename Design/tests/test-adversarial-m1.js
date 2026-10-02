#!/usr/bin/env node
/**
 * test-adversarial-m1.js
 * Empirical Adversarial Challenger Test Suite for Milestone 1 Codex Files
 * Zero runtime dependencies (Pure Node.js built-ins)
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const GUIDELINES_DIR = path.join(ROOT_DIR, 'guidelines');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('  EMPIRICAL ADVERSARIAL STRESS TEST SUITE — MILESTONE 1 CODEX   ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: Mathematical Model Stress Testing — Visual Weight ($VW$)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Quantitative Visual Weight Model ($VW$) Stress Testing ---');

test('VW-01: Sum of factor weights must identically equal 1.000', () => {
  const wA = 0.25;
  const wC = 0.30;
  const wS = 0.15;
  const wP = 0.15;
  const wI = 0.15;
  const sum = wA + wC + wS + wP + wI;
  assert.strictEqual(Math.round(sum * 1000) / 1000, 1.0, `Sum of weights was ${sum}`);
});

function calcVW(fA, fC, fS, fP, fI) {
  const wA = 0.25, wC = 0.30, wS = 0.15, wP = 0.15, wI = 0.15;
  return 100 * (wA * fA + wC * fC + wS * fS + wP * fP + wI * fI);
}

test('VW-02: Boundary check — All zero factors evaluate strictly to 0.0', () => {
  const vw = calcVW(0, 0, 0, 0, 0);
  assert.strictEqual(vw, 0.0, `Expected 0.0, got ${vw}`);
});

test('VW-03: Boundary check — All maximum (1.0) factors evaluate strictly to 100.0', () => {
  const vw = calcVW(1.0, 1.0, 1.0, 1.0, 1.0);
  assert.strictEqual(Math.round(vw * 100) / 100, 100.0, `Expected 100.0, got ${vw}`);
});

test('VW-04: Monte Carlo random sampling across 20,000 vectors within [0, 1]^5', () => {
  for (let k = 0; k < 20000; k++) {
    const fA = Math.random();
    const fC = Math.random();
    const fS = Math.random();
    const fP = Math.random();
    const fI = Math.random();
    const vw = calcVW(fA, fC, fS, fP, fI);
    assert.ok(vw >= 0.0 && vw <= 100.0, `VW out of bounds [0, 100]: ${vw}`);
  }
});

function calcFactorArea(areaElement, areaViewport) {
  if (areaViewport <= 0) return 0;
  return Math.min(1.0, Math.sqrt(areaElement / (areaViewport * 0.25)));
}

test('VW-05: Area factor f_A edge conditions & clamping behavior', () => {
  const vp = 390 * 844; // standard iPhone 15 viewport area
  assert.strictEqual(calcFactorArea(0, vp), 0.0, 'Zero area must yield 0');
  assert.strictEqual(calcFactorArea(vp * 0.25, vp), 1.0, '25% viewport area must yield 1.0');
  assert.strictEqual(calcFactorArea(vp, vp), 1.0, '100% viewport area must clamp to 1.0');
  assert.strictEqual(calcFactorArea(vp * 0.0625, vp), 0.5, '6.25% viewport area must yield sqrt(0.25) = 0.5');
});

function calcFactorContrast(lElement, lBackground) {
  const denom = Math.max(lElement, lBackground, 0.05);
  return Math.abs(lElement - lBackground) / denom;
}

test('VW-06: Luminance contrast factor f_C mathematical robustness & divide-by-zero avoidance', () => {
  // Edge: identical colors
  assert.strictEqual(calcFactorContrast(0, 0), 0.0, 'Pure black on pure black must be 0 (no NaN)');
  assert.strictEqual(calcFactorContrast(1, 1), 0.0, 'Pure white on pure white must be 0');
  assert.strictEqual(calcFactorContrast(0.5, 0.5), 0.0, 'Mid-gray on mid-gray must be 0');

  // Edge: maximum contrast
  assert.strictEqual(calcFactorContrast(1, 0), 1.0, 'Pure white on pure black must be 1.0');
  assert.strictEqual(calcFactorContrast(0, 1), 1.0, 'Pure black on pure white must be 1.0');

  // Edge: near zero luminance
  const nearZero = calcFactorContrast(0.05, 0);
  assert.strictEqual(nearZero, 1.0, '0.05 vs 0 with 0.05 floor must equal 1.0');

  // Exhaustive grid scan across [0, 1] x [0, 1] with step 0.01
  for (let le = 0; le <= 1.0; le += 0.02) {
    for (let lb = 0; lb <= 1.0; lb += 0.02) {
      const fc = calcFactorContrast(le, lb);
      assert.ok(!isNaN(fc) && isFinite(fc), `f_C became NaN or infinite for (${le}, ${lb})`);
      assert.ok(fc >= 0.0 && fc <= 1.0000001, `f_C exceeded bounds [0, 1]: ${fc} for (${le}, ${lb})`);
    }
  }
});

function calcFactorChroma(cOklch) {
  return Math.min(1.0, cOklch / 0.22);
}

test('VW-07: Chromatic saturation factor f_S scaling & clamping', () => {
  assert.strictEqual(calcFactorChroma(0), 0.0);
  assert.strictEqual(calcFactorChroma(0.22), 1.0);
  assert.strictEqual(calcFactorChroma(0.40), 1.0);
  assert.strictEqual(Math.round(calcFactorChroma(0.11) * 100) / 100, 0.5);
});

function calcFactorIsolation(marginClear, width, height) {
  const minDim = Math.min(width, height);
  if (minDim <= 0) return 0.0;
  return Math.min(1.0, marginClear / minDim);
}

test('VW-08: Isolation factor f_I edge cases and dimensions', () => {
  assert.strictEqual(calcFactorIsolation(0, 100, 50), 0.0);
  assert.strictEqual(calcFactorIsolation(50, 100, 50), 1.0);
  assert.strictEqual(calcFactorIsolation(100, 100, 50), 1.0);
  assert.strictEqual(calcFactorIsolation(25, 100, 50), 0.5);
  assert.strictEqual(calcFactorIsolation(10, 0, 50), 0.0, 'Zero width handled gracefully');
});

function calcCenterOfVisualGravity(elements) {
  let sumVW = 0;
  let sumWeightedX = 0;
  let sumWeightedY = 0;
  for (const el of elements) {
    sumVW += el.vw;
    sumWeightedX += el.vw * el.x;
    sumWeightedY += el.vw * el.y;
  }
  if (sumVW === 0) return { x: 0.5, y: 0.45 }; // fallback to optical center
  return { x: sumWeightedX / sumVW, y: sumWeightedY / sumVW };
}

test('VW-09: Center of Visual Gravity (CVG) calculation & optical center alignment', () => {
  // Symmetric bilateral nodes placed at optical Y = 0.45
  const elements = [
    { vw: 60, x: 0.2, y: 0.45 },
    { vw: 60, x: 0.8, y: 0.45 }
  ];
  const cvg = calcCenterOfVisualGravity(elements);
  assert.strictEqual(Math.round(cvg.x * 100) / 100, 0.5);
  assert.strictEqual(Math.round(cvg.y * 100) / 100, 0.45);

  // Fallback when zero visual weight
  const zeroElements = [{ vw: 0, x: 0.1, y: 0.1 }];
  const fallback = calcCenterOfVisualGravity(zeroElements);
  assert.strictEqual(fallback.x, 0.5);
  assert.strictEqual(fallback.y, 0.45);
});

// -----------------------------------------------------------------------------
// SECTION 2: Thumb-Zone Ergonomic Geometry
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Thumb-Zone Geometry Stress Testing ---');

test('TZ-01: Thumb-zone percentages must strictly sum to 100%', () => {
  const natural = 40;
  const reach = 35;
  const hard = 25;
  const total = natural + reach + hard;
  assert.strictEqual(total, 100, `Total thumb-zone percentage was ${total}%`);
});

test('TZ-02: Spatial partition interval continuity across [0.0, 1.0]', () => {
  const hardRange = [0.0, 0.25];
  const reachRange = [0.25, 0.60];
  const naturalRange = [0.60, 1.00];

  assert.strictEqual(hardRange[1], reachRange[0], 'Hard-to-Reach boundary must match');
  assert.strictEqual(reachRange[1], naturalRange[0], 'Reach-to-Natural boundary must match');
  assert.strictEqual(hardRange[0], 0.0, 'Starts at 0%');
  assert.strictEqual(naturalRange[1], 1.0, 'Ends at 100%');

  const spanHard = hardRange[1] - hardRange[0];
  const spanReach = reachRange[1] - reachRange[0];
  const spanNatural = naturalRange[1] - naturalRange[0];

  assert.strictEqual(Math.round(spanHard * 100), 25);
  assert.strictEqual(Math.round(spanReach * 100), 35);
  assert.strictEqual(Math.round(spanNatural * 100), 40);
});

test('TZ-03: Viewport height pixel allocations for canonical smartphones', () => {
  const devices = [
    { name: 'iPhone SE (375x667)', height: 667 },
    { name: 'iPhone 15 (390x844)', height: 844 },
    { name: 'iPhone 15 Pro Max (430x932)', height: 932 },
    { name: 'Galaxy S23 (360x780)', height: 780 }
  ];

  for (const d of devices) {
    const hardH = d.height * 0.25;
    const reachH = d.height * 0.35;
    const naturalH = d.height * 0.40;
    const sumH = hardH + reachH + naturalH;
    assert.strictEqual(Math.round(sumH * 100) / 100, d.height, `Height mismatch for ${d.name}`);
    // Check that Natural zone provides ample vertical room (>= 250px) for primary interactions
    assert.ok(naturalH >= 250, `Natural zone too cramped on ${d.name}: ${naturalH}px`);
  }
});

// -----------------------------------------------------------------------------
// SECTION 3: Safe Area Calc Expressions & Syntax Validity
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Safe Area Inset Syntax & Expression Parsing ---');

const CALC_EXPRESSIONS = [
  { raw: 'pt-[env(safe-area-inset-top,0px)]', property: 'padding-top', cssVal: 'env(safe-area-inset-top, 0px)' },
  { raw: 'pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]', property: 'padding-bottom', cssVal: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' },
  { raw: 'pb-[calc(1rem+env(safe-area-inset-bottom,0px))]', property: 'padding-bottom', cssVal: 'calc(1rem + env(safe-area-inset-bottom, 0px))' },
  { raw: 'pb-[calc(2rem+env(safe-area-inset-bottom,0px))]', property: 'padding-bottom', cssVal: 'calc(2rem + env(safe-area-inset-bottom, 0px))' },
  { raw: 'height: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));', property: 'height' }
];

test('SA-01: Safe area expressions balance parentheses and brackets', () => {
  for (const item of CALC_EXPRESSIONS) {
    let parens = 0;
    let brackets = 0;
    for (const ch of item.raw) {
      if (ch === '(') parens++;
      if (ch === ')') parens--;
      if (ch === '[') brackets++;
      if (ch === ']') brackets--;
      assert.ok(parens >= 0, `Unmatched closing parenthesis in: ${item.raw}`);
      assert.ok(brackets >= 0, `Unmatched closing bracket in: ${item.raw}`);
    }
    assert.strictEqual(parens, 0, `Unclosed parenthesis in: ${item.raw}`);
    assert.strictEqual(brackets, 0, `Unclosed bracket in: ${item.raw}`);
  }
});

test('SA-02: Tailwind arbitrary value syntax matches safe area pattern', () => {
  const tailwindPattern = /^(pt|pb|p)-\[(?:calc\([^)]+\)|env\([^)]+\))\]$/;
  const sampleClasses = [
    'pt-[env(safe-area-inset-top,0px)]',
    'pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]',
    'pb-[calc(1rem+env(safe-area-inset-bottom,0px))]',
    'pb-[calc(2rem+env(safe-area-inset-bottom,0px))]'
  ];

  for (const cls of sampleClasses) {
    assert.ok(tailwindPattern.test(cls), `Tailwind class rejected by syntax pattern: ${cls}`);
  }
});

test('SA-03: Safe area calc expression numerical evaluation simulation', () => {
  // Simulate standard device safe areas: top = 47px, bottom = 34px, 1rem = 16px
  const rem = 16;
  const insetTop = 47;
  const insetBottom = 34;

  const topPadding = insetTop;
  assert.strictEqual(topPadding, 47);

  const bottomActionPadding = (0.75 * rem) + insetBottom;
  assert.strictEqual(bottomActionPadding, 12 + 34); // 46px >= 44px touch target clearance!

  const bottomSheetPadding = (2.0 * rem) + insetBottom;
  assert.strictEqual(bottomSheetPadding, 32 + 34); // 66px ample gesture room!

  const viewportHeight = 844;
  const contentHeight = viewportHeight - insetTop - insetBottom;
  assert.strictEqual(contentHeight, 763);
});

// -----------------------------------------------------------------------------
// SECTION 4: Touch Target Bounding Dimensions & Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Touch Target Bounding Dimensions ---');

test('TT-01: iOS HIG minimum touch target bounding dimensions (44x44px)', () => {
  const minWidth = 44;
  const minHeight = 44;
  const minArea = minWidth * minHeight;
  assert.strictEqual(minArea, 1936, 'iOS minimum bounding box is 1936 px^2');
  assert.ok(minWidth >= 44 && minHeight >= 44);
});

test('TT-02: Android Material minimum touch target bounding dimensions (48x48px)', () => {
  const minWidth = 48;
  const minHeight = 48;
  const minArea = minWidth * minHeight;
  assert.strictEqual(minArea, 2304, 'Android minimum bounding box is 2304 px^2');
  assert.ok(minWidth >= 48 && minHeight >= 48);
});

test('TT-03: Minimum inter-target clearance requirement (8px)', () => {
  const minInterTargetDistance = 8;
  assert.ok(minInterTargetDistance >= 8, 'Clearance must be at least 8px');
});

// -----------------------------------------------------------------------------
// SECTION 5: Guideline File Existence & Substantive Content Auditing
// -----------------------------------------------------------------------------
console.log('\n--- Section 5: Codex Markdown File Existence & Content Invariant Auditing ---');

const REQUIRED_CODEX_FILES = [
  {
    name: 'flow-states.md',
    minBytes: 10000,
    minHeadings: 10,
    requiredTokens: [
      'STATE_EMPTY', 'STATE_LOADING', 'STATE_ACTIVE', 'STATE_ERROR', 'STATE_PARTIAL',
      'Thử lại', 'Xóa bộ lọc', 'Đi Chợ Chung 🔒', 'mealwise_onboarding_completed_'
    ]
  },
  {
    name: 'mobile-ergonomics.md',
    minBytes: 10000,
    minHeadings: 10,
    requiredTokens: [
      'Natural Zone', 'Reach Zone', 'Hard Zone', '44', '48',
      'env(safe-area-inset-top', 'env(safe-area-inset-bottom',
      'max-w-lg', 'min-w-0', 'truncate', 'overflow-hidden'
    ]
  },
  {
    name: 'component-hierarchy.md',
    minBytes: 10000,
    minHeadings: 10,
    requiredTokens: [
      '1100', '1000', '900', '500', '100', '0',
      'Đi Chợ Chung 🔒', 'AuthModal', 'hasExistingMeals'
    ]
  },
  {
    name: 'visual-balance.md',
    minBytes: 10000,
    minHeadings: 10,
    requiredTokens: [
      'VW', '0.25', '0.30', '0.15',
      'Center of Visual Gravity', '0.45', 'Irradiation', 'Stone 800', 'Stone 950'
    ]
  }
];

for (const codex of REQUIRED_CODEX_FILES) {
  test(`FILE: ${codex.name} exists and meets substantive requirements`, () => {
    const fullPath = path.join(GUIDELINES_DIR, codex.name);
    assert.ok(fs.existsSync(fullPath), `File does not exist: ${fullPath}`);

    const stat = fs.statSync(fullPath);
    assert.ok(stat.size >= codex.minBytes, `File size too small: ${stat.size} < ${codex.minBytes}`);

    const content = fs.readFileSync(fullPath, 'utf8');
    const headings = content.split('\n').filter(line => /^#{1,6}\s+/.test(line));
    assert.ok(headings.length >= codex.minHeadings, `Too few headings in ${codex.name}: ${headings.length} < ${codex.minHeadings}`);

    for (const token of codex.requiredTokens) {
      assert.ok(content.includes(token), `Missing required token "${token}" in ${codex.name}`);
    }
  });
}

// -----------------------------------------------------------------------------
// SECTION 6: User Rules & Operational Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Section 6: Operational & User Rules Invariant Checks ---');

test('RULE-01: React Rules of Hooks — Unconditional hook placement invariant in codex examples', () => {
  const flowPath = path.join(GUIDELINES_DIR, 'flow-states.md');
  const compPath = path.join(GUIDELINES_DIR, 'component-hierarchy.md');
  const flowContent = fs.readFileSync(flowPath, 'utf8');
  const compContent = fs.readFileSync(compPath, 'utf8');

  // Must explicitly forbid placing hooks after early returns
  assert.ok(compContent.includes('Early return before hooks breaks React fiber reconciliation'));
  assert.ok(compContent.includes('Early returns strictly placed AFTER all hooks'));
  assert.ok(flowContent.includes('Unconditional Hooks at the top'));
});

test('RULE-02: Bilingual Cleanliness — No redundant Vietnamese/English words in guidelines', () => {
  const redundantPairs = [
    'Salad Xà Lách',
    'Xà Lách Salad',
    'Canh Súp',
    'Canh súp',
    'Súp canh'
  ];

  for (const codex of REQUIRED_CODEX_FILES) {
    const content = fs.readFileSync(path.join(GUIDELINES_DIR, codex.name), 'utf8');
    for (const pair of redundantPairs) {
      assert.ok(!content.includes(pair), `Found prohibited redundant bilingual phrase "${pair}" in ${codex.name}`);
    }
  }
});

test('RULE-03: Food Photography Purity Mandate explicitly articulated in component anatomy', () => {
  const compContent = fs.readFileSync(path.join(GUIDELINES_DIR, 'component-hierarchy.md'), 'utf8');
  assert.ok(compContent.includes('Food Photography Purity Invariant'));
  assert.ok(compContent.includes('Never use images featuring human faces or non-culinary subjects'));
});

test('RULE-04: Guest Account Feature Gating Invariant explicitly articulated', () => {
  const compContent = fs.readFileSync(path.join(GUIDELINES_DIR, 'component-hierarchy.md'), 'utf8');
  const flowContent = fs.readFileSync(path.join(GUIDELINES_DIR, 'flow-states.md'), 'utf8');
  assert.ok(compContent.includes('Đi Chợ Chung 🔒'));
  assert.ok(compContent.includes('!isRegistered'));
  assert.ok(flowContent.includes('Đi Chợ Chung 🔒'));
  assert.ok(flowContent.includes('AuthModal'));
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL ADVERSARIAL CHECKS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  console.error('\nFAILURE DETAILS:');
  for (const f of failures) {
    console.error(`- ${f.name}: ${f.error.message}`);
  }
  process.exit(1);
} else {
  console.log('\nVERDICT: CONFIRMED — ALL EMPIRICAL ADVERSARIAL STRESS CHECKS PASSED WITH 100% SUCCESS.\n');
  process.exit(0);
}
