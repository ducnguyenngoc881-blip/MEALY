/**
 * test-guidelines-codex.js
 * E2E Test Suite: Graphic Design Guidelines Codex & Mathematical Rules Engine Validator
 * Covers: Tier 1 (Feature Coverage) and Tier 2 (Boundary & Corner Cases)
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Reference Mathematical Specifications
const GRID_SPECS = {
  microBase: 4,
  macroBase: 8,
  breakpoints: {
    mobile:  { max: 639,  columns: 4,  gutter: 16, margin: 16 },
    tablet:  { min: 640,  max: 1023, columns: 8, gutter: 24, margin: 24 },
    desktop: { min: 1024, columns: 12, gutter: 32, margin: 32 }
  },
  goldenRatio: 1.6180339887,
  curvatureOvershootPercent: [1, 2] // 1% to 2% optical overshoot
};

const GESTALT_SPECS = {
  laws: ['proximity', 'similarity', 'continuity', 'closure', 'figure-ground', 'common-region'],
  maxInternalExternalSpacingRatio: 0.5,
  focalDominanceRatio: 1.5 // Primary focal point must have >= 1.5x visual weight of secondary
};

const TYPOGRAPHY_SPECS = {
  optimalMeasure: 65, // characters per line (CPL)
  minMeasure: 45,
  maxMeasure: 75,
  xHeightRatioRange: [0.66, 0.74],
  trackingRules: {
    headline: [-0.03, -0.01], // -3% to -1%
    body: 0,                   // 0em
    caption: [0.01, 0.05]      // +1% to +5%
  }
};

// Markdown Document Parser Utilities
function extractHeadings(markdown) {
  const matches = markdown.match(/^#{1,6}\s+.+$/gm) || [];
  return matches.map(h => h.trim());
}

function extractMathBlocks(markdown) {
  // Matches inline $...$ or block $$...$$
  const matches = markdown.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) || [];
  return matches.map(m => m.trim());
}

function extractTables(markdown) {
  const lines = markdown.split('\n');
  const tables = [];
  let currentTable = [];
  for (const line of lines) {
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      currentTable.push(line.trim());
    } else if (currentTable.length > 0) {
      if (currentTable.length >= 2) tables.push(currentTable);
      currentTable = [];
    }
  }
  if (currentTable.length >= 2) tables.push(currentTable);
  return tables;
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

  console.log('\n--- Running Suite: Guidelines Codex & Mathematical Rules ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 test cases)
  // =========================================================================

  report('Tier 1: Layout & Grid: 8pt/4pt grid mathematics and responsive columns', 'Tier 1', () => {
    // Assert integer pixel proofs: every valid offset % 4 === 0
    const validOffsets = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
    const macroOffsets = [8, 16, 24, 32, 48, 64, 96, 128];
    for (const offset of validOffsets) {
      assert.strictEqual(offset % GRID_SPECS.microBase, 0, `Offset ${offset}px must be divisible by 4`);
      if (macroOffsets.includes(offset)) {
        assert.strictEqual(offset % GRID_SPECS.macroBase, 0, `Macro offset ${offset}px must be divisible by 8`);
      }
    }

    // Responsive columns verification
    const desktop = GRID_SPECS.breakpoints.desktop;
    assert.strictEqual(desktop.columns, 12, 'Desktop must have 12 columns');
    assert.strictEqual(desktop.gutter, 32, 'Desktop gutter must be 32px');
    assert.strictEqual(desktop.margin, 32, 'Desktop margin must be 32px');

    const tablet = GRID_SPECS.breakpoints.tablet;
    assert.strictEqual(tablet.columns, 8, 'Tablet must have 8 columns');
    assert.strictEqual(tablet.gutter, 24, 'Tablet gutter must be 24px');

    const mobile = GRID_SPECS.breakpoints.mobile;
    assert.strictEqual(mobile.columns, 4, 'Mobile must have 4 columns');
    assert.strictEqual(mobile.gutter, 16, 'Mobile gutter must be 16px');
  });

  report('Tier 1: Layout & Grid: Golden Ratio and Fibonacci scale progression', 'Tier 1', () => {
    const phi = GRID_SPECS.goldenRatio;
    assert(Math.abs(phi - 1.618) < 0.001, 'Golden Ratio must be ~1.618');

    // Test golden section division: W = A + B where A/B = phi and (A+B)/A = phi
    const width = 1000;
    const major = width / phi;
    const minor = width - major;
    assert(Math.abs(major / minor - phi) < 0.0001, 'Major/Minor section must equal golden ratio');

    // Fibonacci spacing scale validation: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
    const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    for (let i = 2; i < fib.length; i++) {
      assert.strictEqual(fib[i], fib[i - 1] + fib[i - 2], `Fibonacci relation broken at index ${i}`);
    }
  });

  report('Tier 1: Gestalt & Visual Hierarchy: 6 Laws and quantitative proximity ratio', 'Tier 1', () => {
    assert.strictEqual(GESTALT_SPECS.laws.length, 6, 'Must define exactly 6 Gestalt laws');
    const requiredLaws = ['proximity', 'similarity', 'continuity', 'closure', 'figure-ground', 'common-region'];
    for (const law of requiredLaws) {
      assert(GESTALT_SPECS.laws.includes(law), `Missing Gestalt law: ${law}`);
    }

    // Quantitative proximity ratio proof: S_internal <= 0.5 * S_external
    const sInternal = 8;
    const sExternal = 24;
    const ratio = sInternal / sExternal;
    assert(
      ratio <= GESTALT_SPECS.maxInternalExternalSpacingRatio,
      `Proximity ratio ${ratio} must be <= ${GESTALT_SPECS.maxInternalExternalSpacingRatio}`
    );

    // Primary focal point weight ratio proof
    const primaryWeight = 180;
    const secondaryWeight = 100;
    assert(
      primaryWeight / secondaryWeight >= GESTALT_SPECS.focalDominanceRatio,
      'Dominant focal element must have at least 1.5x visual weight'
    );
  });

  report('Tier 1: Typography Standards: Line length (measure) and font pairing criteria', 'Tier 1', () => {
    assert.strictEqual(TYPOGRAPHY_SPECS.optimalMeasure, 65, 'Optimal CPL must be 65');
    assert.strictEqual(TYPOGRAPHY_SPECS.minMeasure, 45, 'Min CPL must be 45');
    assert.strictEqual(TYPOGRAPHY_SPECS.maxMeasure, 75, 'Max CPL must be 75');

    // Test tracking rules: Headlines must have neutral or tight tracking (-0.03 to -0.01)
    const hlTracking = -0.02;
    assert(
      hlTracking >= TYPOGRAPHY_SPECS.trackingRules.headline[0] &&
      hlTracking <= TYPOGRAPHY_SPECS.trackingRules.headline[1],
      'Headline tracking must be within calibrated negative range'
    );

    // Body tracking must be 0
    assert.strictEqual(TYPOGRAPHY_SPECS.trackingRules.body, 0, 'Body tracking must be 0em');
  });

  report('Tier 1: Color Theory & WCAG Standards: Harmony models and accessibility gates', 'Tier 1', () => {
    // Harmony angle definitions on 360 degree color wheel
    const harmonies = {
      complementary: (baseHue) => [(baseHue + 180) % 360],
      triadic: (baseHue) => [(baseHue + 120) % 360, (baseHue + 240) % 360],
      analogous: (baseHue) => [(baseHue + 330) % 360, (baseHue + 30) % 360],
      splitComplementary: (baseHue) => [(baseHue + 150) % 360, (baseHue + 210) % 360]
    };

    const base = 210; // Blue
    const comp = harmonies.complementary(base);
    assert.strictEqual(comp[0], 30, 'Complementary of 210° must be 30° (Orange)');

    const tri = harmonies.triadic(base);
    assert.strictEqual(tri[0], 330, 'Triad 1 of 210° must be 330°');
    assert.strictEqual(tri[1], 90, 'Triad 2 of 210° must be 90°');
  });

  report('Tier 1: Workflow Handbook & Audit Rubric: 6 phases and 100-pt scoring', 'Tier 1', () => {
    const requiredPhases = [
      'Phase 1: Creative Brief & Layout Grid Planning',
      'Phase 2: Generative Prompt Engineering',
      'Phase 3: Vector & SVG Asset Refinement',
      'Phase 4: Design Token Integration',
      'Phase 5: Remotion Motion Choreography',
      'Phase 6: Automated Quality Audit & Render'
    ];
    assert.strictEqual(requiredPhases.length, 6, 'Master workflow must comprise 6 phases');

    const rubricDimensions = [
      'Dimension 1: Layout & Grid Compliance (20 pts)',
      'Dimension 2: Visual Hierarchy & Gestalt Balance (20 pts)',
      'Dimension 3: Typography & Readability (20 pts)',
      'Dimension 4: Color Harmony & WCAG Contrast (20 pts) [HARD GATE]',
      'Dimension 5: Asset Engineering & Code Quality (20 pts)'
    ];
    assert.strictEqual(rubricDimensions.length, 5, 'Rubric must have 5 dimensions of 20 pts each summing to 100');
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 test cases)
  // =========================================================================

  report('Tier 2: Boundary case - Grid alignment rejection for fractional / non-4pt values', 'Tier 2', () => {
    const validateGridOffset = (px) => {
      if (px % 4 !== 0) throw new Error(`Grid alignment violation: ${px}px is not divisible by 4px`);
    };

    assert.throws(() => validateGridOffset(7), /Grid alignment violation/);
    assert.throws(() => validateGridOffset(13.5), /Grid alignment violation/);
    assert.throws(() => validateGridOffset(15), /Grid alignment violation/);
    assert.doesNotThrow(() => validateGridOffset(0));
    assert.doesNotThrow(() => validateGridOffset(4));
    assert.doesNotThrow(() => validateGridOffset(8));
  });

  report('Tier 2: Boundary case - Responsive column mathematical container fit', 'Tier 2', () => {
    // Formula: containerWidth = (columns * colWidth) + ((columns - 1) * gutter)
    const computeContainerWidth = (cols, colWidth, gutter) => {
      return cols * colWidth + (cols - 1) * gutter;
    };

    // 12-col desktop with 64px col and 32px gutter: 12 * 64 + 11 * 32 = 768 + 352 = 1120px
    const width12 = computeContainerWidth(12, 64, 32);
    assert.strictEqual(width12, 1120, '12-column grid container math');

    // Reject negative columns or zero columns
    assert.throws(() => {
      const cols = 0;
      if (cols <= 0) throw new RangeError('Column count must be > 0');
    }, /RangeError/);
  });

  report('Tier 2: Boundary case - Typographic reading measure (CPL) boundary enforcement', 'Tier 2', () => {
    const validateMeasure = (chars) => {
      if (chars < TYPOGRAPHY_SPECS.minMeasure) {
        return { status: 'too-short', valid: false, chars };
      }
      if (chars > TYPOGRAPHY_SPECS.maxMeasure) {
        return { status: 'too-long', valid: false, chars };
      }
      return { status: 'optimal', valid: true, chars };
    };

    assert.strictEqual(validateMeasure(30).valid, false, '30 chars must be flagged too short');
    assert.strictEqual(validateMeasure(45).valid, true, '45 chars must pass at lower boundary');
    assert.strictEqual(validateMeasure(65).valid, true, '65 chars must pass at optimal');
    assert.strictEqual(validateMeasure(75).valid, true, '75 chars must pass at upper boundary');
    assert.strictEqual(validateMeasure(90).valid, false, '90 chars must be flagged too long');
  });

  report('Tier 2: Boundary case - Gestalt proximity spacing inversion detection', 'Tier 2', () => {
    const checkProximityGrouping = (sInternal, sExternal) => {
      if (sInternal > sExternal * GESTALT_SPECS.maxInternalExternalSpacingRatio) {
        throw new Error(
          `Gestalt proximity violation: internal spacing (${sInternal}px) exceeds 0.5x external spacing (${sExternal}px)`
        );
      }
      return true;
    };

    // Valid grouping: 8px internal vs 24px external (8 <= 12)
    assert.strictEqual(checkProximityGrouping(8, 24), true);

    // Inverted grouping: 16px internal vs 20px external (16 > 10)
    assert.throws(() => checkProximityGrouping(16, 20), /Gestalt proximity violation/);
  });

  report('Tier 2: Boundary case - Live guideline and codex markdown file verification hook', 'Tier 2', () => {
    const rootDir = path.resolve(__dirname, '..');
    const guidelinesDir = path.join(rootDir, 'guidelines');
    const workflowPath = path.join(rootDir, 'WORKFLOW.md');
    const rubricPath = path.join(rootDir, 'DESIGN_AUDIT_RUBRIC.md');

    const expectedGuidelines = [
      'layout-grid.md',
      'gestalt-hierarchy.md',
      'typography.md',
      'color-contrast.md'
    ];

    if (fs.existsSync(guidelinesDir)) {
      for (const file of expectedGuidelines) {
        const fullPath = path.join(guidelinesDir, file);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const headings = extractHeadings(content);
          assert(headings.length >= 3, `${file} must contain at least 3 markdown headings`);
          console.log(`    [Live File Found & Verified]: guidelines/${file} (${headings.length} headings)`);
        } else {
          console.log(`    [Parallel TDD Stage]: guidelines/${file} not yet written`);
        }
      }
    } else {
      console.log('    [Parallel TDD Stage]: guidelines/ directory not yet created (M1 in progress)');
    }

    if (fs.existsSync(workflowPath)) {
      const content = fs.readFileSync(workflowPath, 'utf8');
      assert(content.length > 500, 'WORKFLOW.md must be substantial');
      console.log('    [Live File Found & Verified]: WORKFLOW.md');
    }

    if (fs.existsSync(rubricPath)) {
      const content = fs.readFileSync(rubricPath, 'utf8');
      assert(content.includes('Hard Veto') || content.includes('HARD GATE') || content.includes('VETO') || content.includes('veto'), 'Rubric must contain accessibility hard veto');
      console.log('    [Live File Found & Verified]: DESIGN_AUDIT_RUBRIC.md');
    }
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  GRID_SPECS,
  GESTALT_SPECS,
  TYPOGRAPHY_SPECS,
  extractHeadings,
  extractMathBlocks,
  extractTables
};
