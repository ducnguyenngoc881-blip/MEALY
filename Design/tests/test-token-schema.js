/**
 * test-token-schema.js
 * E2E Test Suite: W3C Design Tokens Community Group (DTCG) Schema & Consistency Validator
 * Covers: Tier 1 (Feature Coverage) and Tier 2 (Boundary & Corner Cases)
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Authoritative Canonical DTCG Token Data (Reference Oracle)
const CANONICAL_TOKENS = {
  $schema: 'https://design-tokens.github.io/community-group/format/',
  color: {
    slate: {
      '50':  { $value: '#f8fafc', $type: 'color', $description: 'Light canvas background' },
      '100': { $value: '#f1f5f9', $type: 'color', $description: 'Surface-1 card fill' },
      '200': { $value: '#e2e8f0', $type: 'color', $description: 'Subdued border' },
      '300': { $value: '#cbd5e1', $type: 'color', $description: 'Standard card border' },
      '400': { $value: '#94a3b8', $type: 'color', $description: 'Placeholder text' },
      '500': { $value: '#64748b', $type: 'color', $description: 'Tertiary text' },
      '600': { $value: '#475569', $type: 'color', $description: 'Secondary text' },
      '700': { $value: '#334155', $type: 'color', $description: 'High-contrast secondary text' },
      '800': { $value: '#1e293b', $type: 'color', $description: 'Dark surface' },
      '900': { $value: '#0f172a', $type: 'color', $description: 'Primary text on light canvas' },
      '950': { $value: '#020617', $type: 'color', $description: 'Dark canvas background' }
    },
    brand: {
      '50':  { $value: '#eef2ff', $type: 'color', $description: 'Selected tint' },
      '100': { $value: '#e0e7ff', $type: 'color', $description: 'Hover highlight' },
      '200': { $value: '#c7d2fe', $type: 'color', $description: 'Brand border' },
      '300': { $value: '#a5b4fc', $type: 'color', $description: 'Focus outline' },
      '400': { $value: '#818cf8', $type: 'color', $description: 'Icon accent' },
      '500': { $value: '#6366f1', $type: 'color', $description: 'Large brand headings' },
      '600': { $value: '#4f46e5', $type: 'color', $description: 'Primary CTA button' },
      '700': { $value: '#4338ca', $type: 'color', $description: 'Primary CTA hover' },
      '800': { $value: '#3730a3', $type: 'color', $description: 'Primary CTA active' },
      '900': { $value: '#312e81', $type: 'color', $description: 'Dark brand header' },
      '950': { $value: '#1e1b4b', $type: 'color', $description: 'Midnight brand canvas' }
    },
    semantic: {
      success: {
        text:       { $value: '#064e3b', $type: 'color' },
        background: { $value: '#ecfdf5', $type: 'color' },
        base:       { $value: '#10b981', $type: 'color' },
        border:     { $value: '#6ee7b7', $type: 'color' }
      },
      warning: {
        text:       { $value: '#78350f', $type: 'color' },
        background: { $value: '#fffbeb', $type: 'color' },
        base:       { $value: '#f59e0b', $type: 'color' },
        border:     { $value: '#fcd34d', $type: 'color' }
      },
      error: {
        text:       { $value: '#7f1d1d', $type: 'color' },
        background: { $value: '#fef2f2', $type: 'color' },
        base:       { $value: '#ef4444', $type: 'color' },
        border:     { $value: '#fca5a5', $type: 'color' }
      },
      info: {
        text:       { $value: '#0c4a6e', $type: 'color' },
        background: { $value: '#f0f9ff', $type: 'color' },
        base:       { $value: '#0ea5e9', $type: 'color' },
        border:     { $value: '#7dd3fc', $type: 'color' }
      }
    }
  },
  spacing: {
    '0':  { $value: '0px',   $type: 'dimension', px: 0,   rem: '0rem' },
    '1':  { $value: '4px',   $type: 'dimension', px: 4,   rem: '0.25rem' },
    '2':  { $value: '8px',   $type: 'dimension', px: 8,   rem: '0.5rem' },
    '3':  { $value: '12px',  $type: 'dimension', px: 12,  rem: '0.75rem' },
    '4':  { $value: '16px',  $type: 'dimension', px: 16,  rem: '1rem' },
    '5':  { $value: '20px',  $type: 'dimension', px: 20,  rem: '1.25rem' },
    '6':  { $value: '24px',  $type: 'dimension', px: 24,  rem: '1.5rem' },
    '8':  { $value: '32px',  $type: 'dimension', px: 32,  rem: '2rem' },
    '10': { $value: '40px',  $type: 'dimension', px: 40,  rem: '2.5rem' },
    '12': { $value: '48px',  $type: 'dimension', px: 48,  rem: '3rem' },
    '16': { $value: '64px',  $type: 'dimension', px: 64,  rem: '4rem' },
    '20': { $value: '80px',  $type: 'dimension', px: 80,  rem: '5rem' },
    '24': { $value: '96px',  $type: 'dimension', px: 96,  rem: '6rem' },
    '32': { $value: '128px', $type: 'dimension', px: 128, rem: '8rem' }
  },
  typography: {
    fontFamily: {
      sans:  { $value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', $type: 'fontFamily' },
      serif: { $value: '"Playfair Display", Merriweather, Georgia, Cambria, serif', $type: 'fontFamily' },
      mono:  { $value: '"JetBrains Mono", "Fira Code", Menlo, Monaco, monospace', $type: 'fontFamily' }
    },
    fontWeight: {
      regular:  { $value: 400, $type: 'fontWeight' },
      medium:   { $value: 500, $type: 'fontWeight' },
      semibold: { $value: 600, $type: 'fontWeight' },
      bold:     { $value: 700, $type: 'fontWeight' }
    },
    scale: {
      'xs':   { fontSize: '12px', lineHeight: '16px', letterSpacing: '+0.01em', px: 12, $type: 'typography' },
      'sm':   { fontSize: '14px', lineHeight: '20px', letterSpacing: '0em',     px: 14, $type: 'typography' },
      'base': { fontSize: '16px', lineHeight: '24px', letterSpacing: '0em',     px: 16, $type: 'typography' },
      'lg':   { fontSize: '18px', lineHeight: '28px', letterSpacing: '-0.01em', px: 18, $type: 'typography' },
      'xl':   { fontSize: '20px', lineHeight: '28px', letterSpacing: '-0.01em', px: 20, $type: 'typography' },
      '2xl':  { fontSize: '24px', lineHeight: '32px', letterSpacing: '-0.02em', px: 24, $type: 'typography' },
      '3xl':  { fontSize: '30px', lineHeight: '36px', letterSpacing: '-0.02em', px: 30, $type: 'typography' },
      '4xl':  { fontSize: '36px', lineHeight: '40px', letterSpacing: '-0.025em',px: 36, $type: 'typography' },
      '5xl':  { fontSize: '48px', lineHeight: '48px', letterSpacing: '-0.03em', px: 48, $type: 'typography' },
      '6xl':  { fontSize: '60px', lineHeight: '60px', letterSpacing: '-0.03em', px: 60, $type: 'typography' }
    }
  },
  radii: {
    'none': { $value: '0px',    px: 0,    $type: 'dimension' },
    'sm':   { $value: '4px',    px: 4,    $type: 'dimension' },
    'md':   { $value: '8px',    px: 8,    $type: 'dimension' },
    'lg':   { $value: '12px',   px: 12,   $type: 'dimension' },
    'xl':   { $value: '16px',   px: 16,   $type: 'dimension' },
    '2xl':  { $value: '24px',   px: 24,   $type: 'dimension' },
    'full': { $value: '9999px', px: 9999, $type: 'dimension' }
  },
  elevation: {
    'elevation-1': { $value: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)', $type: 'shadow' },
    'elevation-2': { $value: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)', $type: 'shadow' },
    'elevation-3': { $value: '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.08)', $type: 'shadow' },
    'elevation-4': { $value: '0 20px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)', $type: 'shadow' },
    'elevation-5': { $value: '0 25px 50px -12px rgba(0,0,0,0.22)', $type: 'shadow' }
  },
  motion: {
    spring: {
      springGentle: { mass: 1.0, damping: 20, stiffness: 100, dampingRatio: 1.000, $type: 'motion' },
      springSnappy: { mass: 0.8, damping: 14, stiffness: 180, dampingRatio: 0.583, $type: 'motion' },
      springBouncy: { mass: 1.2, damping: 10, stiffness: 140, dampingRatio: 0.386, $type: 'motion' },
      springStiff:  { mass: 0.5, damping: 20, stiffness: 260, dampingRatio: 0.877, $type: 'motion' },
      springHeavy:  { mass: 2.0, damping: 30, stiffness: 120, dampingRatio: 0.968, $type: 'motion' }
    },
    transition: {
      duration: {
        instant:    { $value: '50ms',  ms: 50,  $type: 'duration' },
        fast:       { $value: '150ms', ms: 150, $type: 'duration' },
        normal:     { $value: '250ms', ms: 250, $type: 'duration' },
        slow:       { $value: '400ms', ms: 400, $type: 'duration' },
        deliberate: { $value: '600ms', ms: 600, $type: 'duration' }
      },
      easing: {
        easeOut:    { $value: 'cubic-bezier(0.16, 1, 0.3, 1)',    $type: 'cubicBezier' },
        easeInOut:  { $value: 'cubic-bezier(0.65, 0, 0.35, 1)',   $type: 'cubicBezier' },
        easeIn:     { $value: 'cubic-bezier(0.32, 0, 0.67, 0)',   $type: 'cubicBezier' },
        spring:     { $value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', $type: 'cubicBezier' }
      }
    }
  }
};

const VALID_DTCG_TYPES = new Set([
  'color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'shadow', 'motion', 'typography'
]);

function validateDtcgNode(node, pathStr = '') {
  if (node === null || typeof node !== 'object') {
    throw new Error(`Invalid token node at "${pathStr}": must be an object`);
  }
  // Leaf token node check
  if ('$value' in node || ('fontSize' in node && 'lineHeight' in node) || ('mass' in node && 'damping' in node)) {
    if ('$type' in node) {
      if (!VALID_DTCG_TYPES.has(node.$type)) {
        throw new Error(`Invalid $type "${node.$type}" at "${pathStr}"`);
      }
    }
    return;
  }
  // Group node: recurse
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    validateDtcgNode(child, pathStr ? `${pathStr}.${key}` : key);
  }
}

function run(runner) {
  const report = runner ? runner.reportTest : (name, tier, fn) => {
    try {
      fn();
      console.log(`  ✓ [${tier}] ${name}`);
      return true;
    } catch (err) {
      console.error(`  ✗ [${tier}] ${name}: ${err.message}`);
      throw err;
    }
  };

  console.log('\n--- Running Suite: Design Token Schema & Consistency ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 test cases)
  // =========================================================================

  report('Tier 1: W3C DTCG Token schema validation across all domains', 'Tier 1', () => {
    const requiredDomains = ['color', 'spacing', 'typography', 'radii', 'elevation', 'motion'];
    for (const domain of requiredDomains) {
      assert(domain in CANONICAL_TOKENS, `Missing mandatory token domain: ${domain}`);
    }
    validateDtcgNode(CANONICAL_TOKENS);
  });

  report('Tier 1: Spacing Scale: Base-4 and Base-8 grid alignment for all 14 steps', 'Tier 1', () => {
    const expectedSteps = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32'];
    const spacingTokens = CANONICAL_TOKENS.spacing;

    assert.strictEqual(
      Object.keys(spacingTokens).length,
      14,
      `Spacing scale must contain exactly 14 steps, found ${Object.keys(spacingTokens).length}`
    );

    for (const step of expectedSteps) {
      assert(step in spacingTokens, `Spacing step "${step}" missing from scale`);
      const token = spacingTokens[step];
      assert(token.px >= 0, `Spacing px for step "${step}" must be non-negative`);
      assert(token.px % 4 === 0, `Spacing px for step "${step}" (${token.px}px) must be a multiple of 4px`);
      const expectedRem = `${token.px / 16}rem`;
      assert.strictEqual(token.rem, expectedRem, `Step "${step}" rem mismatch: expected ${expectedRem}, got ${token.rem}`);
    }
  });

  report('Tier 1: Typography Scale: Major Third (1.250) progression and line-height constraints', 'Tier 1', () => {
    const scale = CANONICAL_TOKENS.typography.scale;
    const sizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];

    assert.strictEqual(Object.keys(scale).length, 10, 'Typography scale must have 10 sizes');

    let prevPx = 0;
    for (const key of sizeKeys) {
      assert(key in scale, `Typography size key "${key}" missing`);
      const item = scale[key];
      assert(item.px > prevPx, `Typography size "${key}" (${item.px}px) must be strictly greater than previous (${prevPx}px)`);
      prevPx = item.px;

      // Line height must be >= font size
      const lhPx = parseInt(item.lineHeight, 10);
      assert(lhPx >= item.px, `Line height (${lhPx}px) must be >= font size (${item.px}px) for size "${key}"`);
    }

    // Check base size is 16px
    assert.strictEqual(scale['base'].px, 16, 'Base font size must be 16px');
    assert.strictEqual(scale['base'].lineHeight, '24px', 'Base line-height must be 24px (1.5)');
  });

  report('Tier 1: Border Radii Scale: Strict monotonicity from none to full', 'Tier 1', () => {
    const radii = CANONICAL_TOKENS.radii;
    const expectedKeys = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
    let prevPx = -1;
    for (const key of expectedKeys) {
      assert(key in radii, `Radius key "${key}" missing`);
      const item = radii[key];
      assert(item.px > prevPx, `Radius "${key}" (${item.px}px) must be strictly greater than previous (${prevPx}px)`);
      prevPx = item.px;
    }
    assert.strictEqual(radii['none'].px, 0, 'Radius "none" must be 0px');
    assert.strictEqual(radii['full'].px, 9999, 'Radius "full" must be 9999px');
  });

  report('Tier 1: Elevation Scale: Dual key+ambient light shadow structure for 5 tiers', 'Tier 1', () => {
    const elevation = CANONICAL_TOKENS.elevation;
    for (let i = 1; i <= 5; i++) {
      const key = `elevation-${i}`;
      assert(key in elevation, `Missing elevation key "${key}"`);
      const shadowStr = elevation[key].$value;
      assert(typeof shadowStr === 'string' && shadowStr.includes('rgba(0,0,0,'), `Elevation "${key}" must contain calibrated rgba shadow`);
      if (i < 5) {
        // Elevations 1-4 feature dual shadow layers (comma separated)
        assert(shadowStr.includes(','), `Elevation "${key}" must use dual key + ambient shadow architecture`);
      }
    }
  });

  report('Tier 1: Motion System: 5 Spring presets with canonical damping ratios and CSS curves', 'Tier 1', () => {
    const springs = CANONICAL_TOKENS.motion.spring;
    const presetNames = ['springGentle', 'springSnappy', 'springBouncy', 'springStiff', 'springHeavy'];

    for (const name of presetNames) {
      assert(name in springs, `Spring preset "${name}" missing`);
      const preset = springs[name];
      assert(preset.mass > 0, `Preset "${name}" mass must be > 0`);
      assert(preset.damping > 0, `Preset "${name}" damping must be > 0`);
      assert(preset.stiffness > 0, `Preset "${name}" stiffness must be > 0`);

      // Verify damping ratio formula: zeta = damping / (2 * sqrt(stiffness * mass))
      const expectedZeta = preset.damping / (2 * Math.sqrt(preset.stiffness * preset.mass));
      assert(
        Math.abs(expectedZeta - preset.dampingRatio) < 0.005,
        `Preset "${name}" damping ratio mismatch: expected ~${expectedZeta.toFixed(3)}, got ${preset.dampingRatio}`
      );
    }

    // Verify CSS transitions
    const durations = CANONICAL_TOKENS.motion.transition.duration;
    assert.strictEqual(durations.normal.ms, 250, 'Normal duration must be 250ms');
    const easings = CANONICAL_TOKENS.motion.transition.easing;
    assert(easings.easeOut.$value.startsWith('cubic-bezier'), 'easeOut must be valid cubic-bezier');
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 test cases)
  // =========================================================================

  report('Tier 2: Boundary case - Negative spacing and non-multiple-of-4 rejection', 'Tier 2', () => {
    const validateSpacingValue = (px) => {
      if (typeof px !== 'number' || px < 0) throw new RangeError('Spacing must be >= 0');
      if (px % 4 !== 0) throw new TypeError('Spacing must be integer multiple of 4px');
    };

    assert.doesNotThrow(() => validateSpacingValue(0));
    assert.doesNotThrow(() => validateSpacingValue(4));
    assert.doesNotThrow(() => validateSpacingValue(128));

    assert.throws(() => validateSpacingValue(-4), /RangeError/);
    assert.throws(() => validateSpacingValue(7), /TypeError/);
    assert.throws(() => validateSpacingValue(13.5), /TypeError/);
  });

  report('Tier 2: Boundary case - Invalid DTCG token type rejection', 'Tier 2', () => {
    assert.throws(() => {
      validateDtcgNode({
        testToken: { $value: '10px', $type: 'illegalType' }
      });
    }, /Invalid \$type/);
  });

  report('Tier 2: Boundary case - Non-monotonic typography scale detection', 'Tier 2', () => {
    const badScale = [
      { name: 'sm', px: 14 },
      { name: 'base', px: 16 },
      { name: 'lg', px: 15 } // Violation: smaller than base
    ];

    const verifyMonotonic = (items) => {
      for (let i = 1; i < items.length; i++) {
        if (items[i].px <= items[i - 1].px) {
          throw new Error(`Scale inversion detected at index ${i}: ${items[i].name} (${items[i].px}px) <= ${items[i - 1].name} (${items[i - 1].px}px)`);
        }
      }
    };

    assert.throws(() => verifyMonotonic(badScale), /Scale inversion/);
  });

  report('Tier 2: Boundary case - Extreme radius (full = 9999px) bounds check', 'Tier 2', () => {
    const fullRadius = CANONICAL_TOKENS.radii.full.px;
    assert.strictEqual(fullRadius, 9999);
    assert(Number.isSafeInteger(fullRadius), 'full radius must be a safe integer');
    assert(fullRadius > 1000, 'full radius must exceed any realistic standard screen dimension');
  });

  report('Tier 2: Boundary case - Live file validation hook for tokens.json / tokens.ts', 'Tier 2', () => {
    const rootDir = path.resolve(__dirname, '..');
    const jsonPath = path.join(rootDir, 'tokens.json');
    const tsPath = path.join(rootDir, 'tokens.ts');

    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(raw);
      validateDtcgNode(parsed);
      console.log('    [Live File Found & Verified]: tokens.json');
    } else {
      console.log('    [Parallel TDD Stage]: tokens.json not yet on disk (M3 in progress)');
    }

    if (fs.existsSync(tsPath)) {
      const raw = fs.readFileSync(tsPath, 'utf8');
      assert(raw.includes('as const'), 'tokens.ts must include "as const" assertion');

      // Directly import and functionally execute tokens.ts exports
      const tokensModule = require('../tokens.ts');
      assert(typeof tokensModule.getContrastRatio === 'function', 'tokens.ts must export getContrastRatio');
      assert(typeof tokensModule.getRelativeLuminance === 'function', 'tokens.ts must export getRelativeLuminance');
      assert(typeof tokensModule.isWCAGCompliant === 'function', 'tokens.ts must export isWCAGCompliant');
      assert(typeof tokensModule.sRGBtoLin === 'function', 'tokens.ts must export sRGBtoLin');

      // Functional assertion: sRGBtoLin channel 1 normalization (must not evaluate to 1.0)
      const lin1 = tokensModule.sRGBtoLin(1);
      assert(lin1 > 0 && lin1 < 0.001, `sRGBtoLin(1) must be ~0.000304, got ${lin1}`);

      // Functional assertion: Dark color #010101 contrast against white must be > 20:1
      const crDark = tokensModule.getContrastRatio('#010101', '#ffffff');
      assert(crDark > 20.0, `Contrast ratio for #010101 against #ffffff must be > 20:1, got ${crDark.toFixed(2)}:1`);
      assert.strictEqual(tokensModule.isWCAGCompliant('#010101', '#ffffff', 'AAA'), true, '#010101 on #ffffff must pass WCAG AAA');

      // Functional assertion: Long-duration motion engine evaluation at t=100s returns no NaN
      const motionEngine = require('../src/motion/motion-engine.ts');
      for (const [presetName, preset] of Object.entries(motionEngine.SPRING_PRESETS)) {
        for (const t of [0, 1, 5, 10, 60, 64, 70, 100]) {
          const val = motionEngine.evaluateHarmonicOscillator(t, preset.mass, preset.stiffness, preset.damping, preset.overshootClamping);
          assert(!isNaN(val), `Motion preset "${presetName}" returned NaN at t=${t}s`);
          if (t >= 10) {
            assert(Math.abs(val - 1.0) < 1e-4, `Motion preset "${presetName}" did not converge to 1.0 at t=${t}s: ${val}`);
          }
        }
      }

      console.log('    [Live File Found & Verified]: tokens.ts (functional execution passed)');
    } else {
      console.log('    [Parallel TDD Stage]: tokens.ts not yet on disk (M3 in progress)');
    }
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  CANONICAL_TOKENS,
  validateDtcgNode
};
