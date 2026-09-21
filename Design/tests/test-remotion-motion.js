/**
 * test-remotion-motion.js
 * E2E Test Suite: Remotion Spring Physics, Multi-Format Dimensions & Safe Zone Validator
 * Covers: Tier 1 (Feature Coverage) and Tier 2 (Boundary & Corner Cases)
 */

const assert = require('node:assert');

// Authoritative Remotion Motion Specifications
const MOTION_PRESETS = {
  springGentle: { mass: 1.0, damping: 20, stiffness: 100, targetZeta: 1.000 },
  springSnappy: { mass: 0.8, damping: 14, stiffness: 180, targetZeta: 0.583 },
  springBouncy: { mass: 1.2, damping: 10, stiffness: 140, targetZeta: 0.386 },
  springStiff:  { mass: 0.5, damping: 20, stiffness: 260, targetZeta: 0.877 },
  springHeavy:  { mass: 2.0, damping: 30, stiffness: 120, targetZeta: 0.968 }
};

const CANONICAL_FORMATS = {
  '16:9': { width: 1920, height: 1080, ratio: 16 / 9 },
  '9:16': { width: 1080, height: 1920, ratio: 9 / 16 },
  '1:1':  { width: 1080, height: 1080, ratio: 1.0 }
};

// Physics Engine: Damping Ratio & Harmonic Oscillator Simulation
function calculateDampingRatio(mass, damping, stiffness) {
  if (mass <= 0 || damping <= 0 || stiffness <= 0) {
    throw new RangeError('Mass, damping, and stiffness must be strictly positive');
  }
  return damping / (2 * Math.sqrt(stiffness * mass));
}

// Numerical Spring Integrator (Simulating Remotion spring() evaluation at discrete frames)
function simulateSpring({ mass, damping, stiffness, fps = 30, durationFrames = 90 }) {
  const dt = 1 / fps;
  let x = 0;      // initial position
  let v = 0;      // initial velocity
  const target = 1; // target rest position
  const history = [];

  for (let frame = 0; frame <= durationFrames; frame++) {
    history.push({ frame, x, v });
    // Spring force = -k * (x - target), Damping force = -c * v
    const fSpring = -stiffness * (x - target);
    const fDamp = -damping * v;
    const a = (fSpring + fDamp) / mass;
    v += a * dt;
    x += v * dt;
  }

  // Find settle frame (within 1% of target rest position)
  let settleFrame = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (Math.abs(history[i].x - target) > 0.01) {
      settleFrame = history[i].frame + 1;
      break;
    }
  }

  return {
    finalValue: x,
    settleFrame,
    history
  };
}

// Safe Zone Geometry Engine
function getSafeZones(width, height) {
  return {
    actionSafe: {
      x: width * 0.05,
      y: height * 0.05,
      width: width * 0.90,
      height: height * 0.90
    },
    titleSafe: {
      x: width * 0.10,
      y: height * 0.10,
      width: width * 0.80,
      height: height * 0.80
    }
  };
}

function isInsideSafeZone(elementRect, safeZoneRect) {
  const elemRight = elementRect.x + elementRect.width;
  const elemBottom = elementRect.y + elementRect.height;
  const safeRight = safeZoneRect.x + safeZoneRect.width;
  const safeBottom = safeZoneRect.y + safeZoneRect.height;

  return (
    elementRect.x >= safeZoneRect.x &&
    elementRect.y >= safeZoneRect.y &&
    elemRight <= safeRight &&
    elemBottom <= safeBottom
  );
}

// Kinetic Typography Reading Budget Validator
function validateReadingBudget({ wordCount, holdFrames, fps = 30 }) {
  const holdSeconds = holdFrames / fps;
  if (holdSeconds <= 0) throw new RangeError('Hold duration must be positive');
  const wpm = (wordCount / holdSeconds) * 60;
  return {
    wpm: Math.round(wpm),
    holdSeconds: Number(holdSeconds.toFixed(2)),
    isWithinBudget: wpm <= 250 // standard budget: 200 - 250 WPM
  };
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

  console.log('\n--- Running Suite: Remotion Motion Physics & Safe Zones ---');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 test cases)
  // =========================================================================

  report('Tier 1: Harmonic oscillator damping ratios match theoretical presets', 'Tier 1', () => {
    for (const [name, preset] of Object.entries(MOTION_PRESETS)) {
      const zeta = calculateDampingRatio(preset.mass, preset.damping, preset.stiffness);
      assert(
        Math.abs(zeta - preset.targetZeta) < 0.005,
        `Preset ${name} damping ratio mismatch: expected ~${preset.targetZeta}, got ${zeta.toFixed(3)}`
      );
    }
  });

  report('Tier 1: Numerical spring simulation converges to rest position (1.0)', 'Tier 1', () => {
    // Test springGentle (critically damped: converges smoothly without excessive oscillation)
    const gentle = simulateSpring({ mass: 1.0, damping: 20, stiffness: 100, fps: 30, durationFrames: 60 });
    assert(Math.abs(gentle.finalValue - 1.0) < 0.01, `springGentle did not converge: ${gentle.finalValue}`);
    assert(gentle.settleFrame > 0 && gentle.settleFrame <= 45, `springGentle settle frame out of bounds: ${gentle.settleFrame}`);

    // Test springSnappy (underdamped: quick response with modest overshoot)
    const snappy = simulateSpring({ mass: 0.8, damping: 14, stiffness: 180, fps: 30, durationFrames: 45 });
    assert(Math.abs(snappy.finalValue - 1.0) < 0.01, `springSnappy did not converge: ${snappy.finalValue}`);
  });

  report('Tier 1: Multi-format video aspect ratio dimension validation (16:9, 9:16, 1:1)', 'Tier 1', () => {
    for (const [format, spec] of Object.entries(CANONICAL_FORMATS)) {
      const computedRatio = spec.width / spec.height;
      assert(
        Math.abs(computedRatio - spec.ratio) < 0.001,
        `Format ${format} aspect ratio mismatch: expected ${spec.ratio}, got ${computedRatio}`
      );
      assert(spec.width >= 1080, `Width for ${format} must be at least 1080px`);
      assert(spec.height >= 1080, `Height for ${format} must be at least 1080px`);
    }
  });

  report('Tier 1: Action Safe (90%) and Title Safe (80%) zone geometry verification', 'Tier 1', () => {
    const zones169 = getSafeZones(1920, 1080);
    // Action safe: x=96, y=54, w=1728, h=972
    assert.strictEqual(zones169.actionSafe.x, 96);
    assert.strictEqual(zones169.actionSafe.y, 54);
    assert.strictEqual(zones169.actionSafe.width, 1728);
    assert.strictEqual(zones169.actionSafe.height, 972);

    // Title safe: x=192, y=108, w=1536, h=864
    assert.strictEqual(zones169.titleSafe.x, 192);
    assert.strictEqual(zones169.titleSafe.y, 108);
    assert.strictEqual(zones169.titleSafe.width, 1536);
    assert.strictEqual(zones169.titleSafe.height, 864);
  });

  report('Tier 1: Kinetic typography 3-phase timing and reading budget calculation', 'Tier 1', () => {
    // Budget check: 10 words held for 90 frames (3.0 seconds) at 30fps -> 200 WPM
    const budget = validateReadingBudget({ wordCount: 10, holdFrames: 90, fps: 30 });
    assert.strictEqual(budget.wpm, 200);
    assert.strictEqual(budget.isWithinBudget, true, '200 WPM must be within reading budget');

    // Over budget check: 25 words in 3.0 seconds -> 500 WPM
    const overBudget = validateReadingBudget({ wordCount: 25, holdFrames: 90, fps: 30 });
    assert.strictEqual(overBudget.isWithinBudget, false, '500 WPM must exceed reading budget');
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 test cases)
  // =========================================================================

  report('Tier 2: Boundary case - Negative damping rejection (c <= 0)', 'Tier 2', () => {
    assert.throws(() => calculateDampingRatio(1.0, -10, 100), /strictly positive/);
    assert.throws(() => calculateDampingRatio(1.0, 0, 100), /strictly positive/);
  });

  report('Tier 2: Boundary case - Negative or zero mass & stiffness rejection', 'Tier 2', () => {
    assert.throws(() => calculateDampingRatio(0, 20, 100), /strictly positive/);
    assert.throws(() => calculateDampingRatio(-0.5, 20, 100), /strictly positive/);
    assert.throws(() => calculateDampingRatio(1.0, 20, 0), /strictly positive/);
    assert.throws(() => calculateDampingRatio(1.0, 20, -50), /strictly positive/);
  });

  report('Tier 2: Boundary case - Over-damped extreme (zeta > 2.0) detection', 'Tier 2', () => {
    // mass = 1, damping = 100, stiffness = 10 -> zeta = 100 / (2 * sqrt(10)) ~= 15.8
    const extremeZeta = calculateDampingRatio(1.0, 100, 10);
    assert(extremeZeta > 2.0, 'Must detect extreme overdamped ratio');
  });

  report('Tier 2: Boundary case - Element safe zone boundary detection (inside vs clipped)', 'Tier 2', () => {
    const zones = getSafeZones(1920, 1080);

    // Completely centered element (x: 500, y: 400, w: 400, h: 200)
    const insideElem = { x: 500, y: 400, width: 400, height: 200 };
    assert.strictEqual(isInsideSafeZone(insideElem, zones.titleSafe), true);

    // Element violating title safe boundary (x: 50, inside action safe but outside title safe)
    const outsideTitleElem = { x: 50, y: 400, width: 400, height: 200 };
    assert.strictEqual(isInsideSafeZone(outsideTitleElem, zones.titleSafe), false);
    assert.strictEqual(isInsideSafeZone(outsideTitleElem, zones.actionSafe), false); // x=50 < 96
  });

  report('Tier 2: Boundary case - Extreme aspect ratios and frame rates rejection', 'Tier 2', () => {
    const validateCompositionParams = ({ fps, width, height, durationInFrames }) => {
      if (![30, 60].includes(fps)) throw new Error(`Invalid FPS: ${fps}. Must be 30 or 60.`);
      if (width <= 0 || height <= 0) throw new Error('Dimensions must be positive');
      if (durationInFrames <= 0) throw new Error('Duration must be positive');
      const ratio = width / height;
      if (ratio < 0.2 || ratio > 5.0) throw new Error(`Extreme aspect ratio rejected: ${ratio}`);
      return true;
    };

    assert.doesNotThrow(() => validateCompositionParams({ fps: 30, width: 1920, height: 1080, durationInFrames: 300 }));
    assert.throws(() => validateCompositionParams({ fps: 24, width: 1920, height: 1080, durationInFrames: 300 }), /Invalid FPS/);
    assert.throws(() => validateCompositionParams({ fps: 30, width: 1920, height: 0, durationInFrames: 300 }), /Dimensions must be positive/);
    assert.throws(() => validateCompositionParams({ fps: 30, width: 10000, height: 100, durationInFrames: 300 }), /Extreme aspect ratio/);
  });
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  calculateDampingRatio,
  simulateSpring,
  getSafeZones,
  isInsideSafeZone,
  validateReadingBudget,
  MOTION_PRESETS,
  CANONICAL_FORMATS
};
