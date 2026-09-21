/**
 * test-contrast-math.js
 * E2E Test Suite: Mathematical Relative Luminance & WCAG Contrast Ratio Verification
 * Covers: Tier 1 (Feature Coverage) and Tier 2 (Boundary & Corner Cases)
 */

const assert = require('node:assert');

// Authoritative WCAG 2.1 Color Math Implementation
function parseHex(hex) {
  if (typeof hex !== 'string') {
    throw new TypeError(`Expected hex string, received ${typeof hex}`);
  }
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color string: "${hex}"`);
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

function srgbChannelToLinear(channelValue) {
  const c = channelValue / 255;
  if (c <= 0.04045) {
    return c / 12.92;
  }
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex) {
  const { r, g, b } = parseHex(hex);
  const rLin = srgbChannelToLinear(r);
  const gLin = srgbChannelToLinear(g);
  const bLin = srgbChannelToLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function getContrastRatio(fgHex, bgHex) {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

function evaluateWcagCompliance(ratio, size = 'normal') {
  const isLarge = size === 'large';
  const aaMin = isLarge ? 3.0 : 4.5;
  const aaaMin = isLarge ? 4.5 : 7.0;
  return {
    ratio: Number(ratio.toFixed(2)),
    passAA: ratio >= aaMin,
    passAAA: ratio >= aaaMin,
    isLarge
  };
}

// Authoritative Palette Data from Survey Report 3 & M1 Codex
const PALETTES = {
  slate: {
    '50': '#f8fafc',
    '100': '#f1f5f9',
    '200': '#e2e8f0',
    '300': '#cbd5e1',
    '400': '#94a3b8',
    '500': '#64748b',
    '600': '#475569',
    '700': '#334155',
    '800': '#1e293b',
    '900': '#0f172a',
    '950': '#020617'
  },
  indigo: {
    '50': '#eef2ff',
    '100': '#e0e7ff',
    '200': '#c7d2fe',
    '300': '#a5b4fc',
    '400': '#818cf8',
    '500': '#6366f1',
    '600': '#4f46e5',
    '700': '#4338ca',
    '800': '#3730a3',
    '900': '#312e81',
    '950': '#1e1b4b'
  },
  semanticStatus: {
    success: { text: '#064e3b', bg: '#ecfdf5', base: '#10b981', border: '#6ee7b7' },
    warning: { text: '#78350f', bg: '#fffbeb', base: '#f59e0b', border: '#fcd34d' },
    error:   { text: '#7f1d1d', bg: '#fef2f2', base: '#ef4444', border: '#fca5a5' },
    info:    { text: '#0c4a6e', bg: '#f0f9ff', base: '#0ea5e9', border: '#7dd3fc' }
  }
};

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

  console.log('\n--- Running Suite: Contrast & Math Verification ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 test cases)
  // =========================================================================

  report('Tier 1: sRGB gamma piecewise expansion and pure primary luminance', 'Tier 1', () => {
    // Pure primaries check
    const lRed = getRelativeLuminance('#ff0000');
    const lGreen = getRelativeLuminance('#00ff00');
    const lBlue = getRelativeLuminance('#0000ff');

    assert(Math.abs(lRed - 0.2126) < 0.001, `Red luminance should be 0.2126, got ${lRed}`);
    assert(Math.abs(lGreen - 0.7152) < 0.001, `Green luminance should be 0.7152, got ${lGreen}`);
    assert(Math.abs(lBlue - 0.0722) < 0.001, `Blue luminance should be 0.0722, got ${lBlue}`);

    // Sum of primary luminances must equal 1.0 (white)
    const lWhite = getRelativeLuminance('#ffffff');
    assert(Math.abs(lRed + lGreen + lBlue - lWhite) < 0.0001, 'Primary sum must equal white luminance');
  });

  report('Tier 1: Contrast ratio formula calculation and symmetry', 'Tier 1', () => {
    const ratio1 = getContrastRatio('#ffffff', '#000000');
    const ratio2 = getContrastRatio('#000000', '#ffffff');
    assert.strictEqual(ratio1, 21.0, 'White vs Black must be 21:1');
    assert.strictEqual(ratio1, ratio2, 'Contrast ratio must be symmetric regarding foreground/background order');
  });

  report('Tier 1: Neutral Slate monotonic luminance decrease across 11 steps', 'Tier 1', () => {
    const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    let prevLuminance = 1.01;
    for (const step of steps) {
      const hex = PALETTES.slate[step];
      const lum = getRelativeLuminance(hex);
      assert(
        lum < prevLuminance,
        `Step ${step} (${hex}) luminance ${lum} is not strictly less than previous step ${prevLuminance}`
      );
      prevLuminance = lum;
    }
  });

  report('Tier 1: Neutral Slate contrast vs White (#ffffff) and Dark (#020617)', 'Tier 1', () => {
    const white = '#ffffff';
    const dark = PALETTES.slate['950']; // #020617

    // slate-500 on white >= 4.5:1 (AA Normal Text)
    const cr500 = getContrastRatio(PALETTES.slate['500'], white);
    assert(cr500 >= 4.5, `slate-500 on white must be >= 4.5:1, got ${cr500.toFixed(2)}`);

    // slate-600 on white >= 7.0:1 (AAA Normal Text)
    const cr600 = getContrastRatio(PALETTES.slate['600'], white);
    assert(cr600 >= 7.0, `slate-600 on white must be >= 7.0:1, got ${cr600.toFixed(2)}`);

    // slate-900 on white >= 17.0:1
    const cr900 = getContrastRatio(PALETTES.slate['900'], white);
    assert(cr900 >= 17.0, `slate-900 on white must be >= 17.0:1, got ${cr900.toFixed(2)}`);

    // slate-50 on dark canvas >= 18.0:1 (AAA)
    const cr50Dark = getContrastRatio(PALETTES.slate['50'], dark);
    assert(cr50Dark >= 18.0, `slate-50 on dark canvas must be >= 18.0:1, got ${cr50Dark.toFixed(2)}`);
  });

  report('Tier 1: Primary Brand Indigo contrast compliance', 'Tier 1', () => {
    const white = '#ffffff';
    // indigo-600 (#4f46e5) on white must achieve AA (>= 4.5:1)
    const cr600 = getContrastRatio(PALETTES.indigo['600'], white);
    assert(cr600 >= 4.5, `indigo-600 on white must be >= 4.5:1, got ${cr600.toFixed(2)}`);

    // indigo-700 (#4338ca) on white must achieve AAA (>= 7.0:1)
    const cr700 = getContrastRatio(PALETTES.indigo['700'], white);
    assert(cr700 >= 7.0, `indigo-700 on white must be >= 7.0:1, got ${cr700.toFixed(2)}`);
  });

  report('Tier 1: Semantic Status (Success/Warning/Error/Info) text-to-background >= 7.0:1 (AAA)', 'Tier 1', () => {
    for (const [status, colors] of Object.entries(PALETTES.semanticStatus)) {
      const cr = getContrastRatio(colors.text, colors.bg);
      assert(
        cr >= 7.0,
        `${status} status text (${colors.text}) on background (${colors.bg}) must be >= 7.0:1 (AAA), got ${cr.toFixed(2)}:1`
      );

      const crWhite = getContrastRatio(colors.text, '#ffffff');
      assert(
        crWhite >= 7.0,
        `${status} status text (${colors.text}) on #ffffff must be >= 7.0:1 (AAA), got ${crWhite.toFixed(2)}:1`
      );
    }
  });

  report('Tier 1: Light & Dark Mode Surface Pairing WCAG Evaluation', 'Tier 1', () => {
    // Light Canvas (#ffffff)
    const cPrimary = evaluateWcagCompliance(getContrastRatio(PALETTES.slate['900'], '#ffffff'));
    const cSecondary = evaluateWcagCompliance(getContrastRatio(PALETTES.slate['600'], '#ffffff'));
    const cTertiary = evaluateWcagCompliance(getContrastRatio(PALETTES.slate['500'], '#ffffff'));

    assert.strictEqual(cPrimary.passAAA, true, 'Light Canvas + text-primary must pass AAA');
    assert.strictEqual(cSecondary.passAAA, true, 'Light Canvas + text-secondary must pass AAA');
    assert.strictEqual(cTertiary.passAA, true, 'Light Canvas + text-tertiary must pass AA');

    // Dark Canvas (#020617)
    const dPrimary = evaluateWcagCompliance(getContrastRatio(PALETTES.slate['50'], PALETTES.slate['950']));
    const dSecondary = evaluateWcagCompliance(getContrastRatio(PALETTES.slate['300'], PALETTES.slate['950']));
    const dTertiary = evaluateWcagCompliance(getContrastRatio(PALETTES.slate['400'], PALETTES.slate['950']));

    assert.strictEqual(dPrimary.passAAA, true, 'Dark Canvas + text-primary must pass AAA');
    assert.strictEqual(dSecondary.passAAA, true, 'Dark Canvas + text-secondary must pass AAA');
    assert.strictEqual(dTertiary.passAA, true, 'Dark Canvas + text-tertiary must pass AA');
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 test cases)
  // =========================================================================

  report('Tier 2: Boundary case - Pure white on pure white & pure black on pure black (1.0:1)', 'Tier 2', () => {
    const whiteOnWhite = getContrastRatio('#ffffff', '#ffffff');
    const blackOnBlack = getContrastRatio('#000000', '#000000');
    assert.strictEqual(whiteOnWhite, 1.0, 'Identical white colors must yield exactly 1.0:1');
    assert.strictEqual(blackOnBlack, 1.0, 'Identical black colors must yield exactly 1.0:1');
  });

  report('Tier 2: Boundary case - Shorthand 3-digit hex equivalence with 6-digit hex', 'Tier 2', () => {
    const lum3 = getRelativeLuminance('#fff');
    const lum6 = getRelativeLuminance('#ffffff');
    assert.strictEqual(lum3, lum6, '3-digit hex #fff must match 6-digit hex #ffffff luminance');

    const cr3 = getContrastRatio('#000', '#fff');
    assert.strictEqual(cr3, 21.0, '3-digit #000 vs #fff must yield 21:1');
  });

  report('Tier 2: Boundary case - Malformed and invalid hex string rejection', 'Tier 2', () => {
    const invalidHexes = ['', '#', '#1', '#12', '#1234', '#12345', '#1234567', '#gggggg', 'red', null, undefined, 123];
    for (const invalid of invalidHexes) {
      assert.throws(() => {
        getRelativeLuminance(invalid);
      }, /Invalid hex|Expected hex/);
    }
  });

  report('Tier 2: Boundary case - Exact threshold cutoff (4.499 fails AA, 4.500 passes AA)', 'Tier 2', () => {
    const passThreshold = evaluateWcagCompliance(4.500);
    const failThreshold = evaluateWcagCompliance(4.499);
    assert.strictEqual(passThreshold.passAA, true, 'Ratio 4.500 must pass AA');
    assert.strictEqual(failThreshold.passAA, false, 'Ratio 4.499 must fail AA');

    const passLarge = evaluateWcagCompliance(3.000, 'large');
    const failLarge = evaluateWcagCompliance(2.999, 'large');
    assert.strictEqual(passLarge.passAA, true, 'Ratio 3.000 must pass AA Large');
    assert.strictEqual(failLarge.passAA, false, 'Ratio 2.999 must fail AA Large');

    const passAAA = evaluateWcagCompliance(7.000);
    const failAAA = evaluateWcagCompliance(6.999);
    assert.strictEqual(passAAA.passAAA, true, 'Ratio 7.000 must pass AAA');
    assert.strictEqual(failAAA.passAAA, false, 'Ratio 6.999 must fail AAA');
  });

  report('Tier 2: Boundary case - Case insensitivity and whitespace trimming resilience', 'Tier 2', () => {
    const l1 = getRelativeLuminance('  #4F46E5  ');
    const l2 = getRelativeLuminance('#4f46e5');
    assert.strictEqual(l1, l2, 'Luminance must be invariant to uppercase and surrounding whitespace');
  });

  report('Tier 2: Boundary case - Non-integer hex values and extreme near-zero luminance', 'Tier 2', () => {
    // #010101 is near-black, test that relative luminance does not underflow or produce NaN
    const nearBlack = getRelativeLuminance('#010101');
    assert(!isNaN(nearBlack), 'Near black luminance must not be NaN');
    assert(nearBlack > 0 && nearBlack < 0.001, 'Near black luminance must be positive and < 0.001');
    const crNearBlack = getContrastRatio('#ffffff', '#010101');
    assert(crNearBlack > 20.0 && crNearBlack < 21.0, 'Near black vs white must be slightly less than 21:1');
  });
}

// Allow direct execution
if (require.main === module) {
  run();
}

module.exports = {
  run,
  parseHex,
  srgbChannelToLinear,
  getRelativeLuminance,
  getContrastRatio,
  evaluateWcagCompliance,
  PALETTES
};
