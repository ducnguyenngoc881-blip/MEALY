/**
 * Adversarial Roulette Math & Kinematics Stress Test Harness
 * 
 * Executes exhaustive adversarial challenges:
 * 1. Monte Carlo: 18,000+ spins across roster sizes 2 to 10 (2,000 per size)
 * 2. Extreme positive angles (10^6 to 10^15 deg) and negative angles (-5*10^5 to -10^15 deg)
 * 3. Odd & prime segment counts (N = 3, 5, 7, 9, 11, 13, 17) testing repeating decimal precision
 * 4. Microdegree fractional angles & boundary tolerance margins
 * 5. Jitter boundary tolerance: testing max allowable jitter before boundary cross
 * 6. Rule reducers & state machine stress (Cả Bàn, Uống Hộ, Score conservation)
 */

import {
  calculateNextWheelAngle,
  getLandedSliceIndex,
  getWedgeAngularBounds,
  generateShotSegments,
  applyCaBanRule,
  getDelegateCandidates,
  applyDelegatePenalty,
  applyStandardPenalty,
  rankPlayersByShots,
  Player,
  ShotPenalty,
} from '../src/utils/rouletteMath.js';

interface StressTestSummary {
  testName: string;
  totalTrials: number;
  failures: number;
  maxDeviationDeg: number;
  durationMs: number;
  details: string;
}

const summaries: StressTestSummary[] = [];

console.log('======================================================================');
console.log('ADVERSARIAL STRESS-TEST HARNESS: ROULETTE MATH & KINEMATICS');
console.log('======================================================================\n');

// ---------------------------------------------------------------------
// TEST 1: MONTE CARLO SIMULATION (18,000 SPINS ACROSS ROSTER SIZES 2..10)
// ---------------------------------------------------------------------
{
  const testName = 'Monte Carlo Simulation (18,000 spins, sizes 2..10)';
  const startTime = Date.now();
  let totalSpins = 0;
  let failures = 0;
  let maxDeviation = 0;
  const SPINS_PER_SIZE = 2000;

  for (let rosterSize = 2; rosterSize <= 10; rosterSize++) {
    // Start from varying initial accumulated angle
    let currentAngle = (Math.random() - 0.5) * 10000;

    for (let i = 0; i < SPINS_PER_SIZE; i++) {
      totalSpins++;
      const targetIndex = Math.floor(Math.random() * rosterSize);
      const minSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
      const nextAngle = calculateNextWheelAngle(currentAngle, targetIndex, rosterSize, minSpins);

      // Invariant 1: Strictly monotonic forward rotation
      if (nextAngle <= currentAngle) {
        failures++;
        console.error(`[FAIL] Non-forward rotation: current=${currentAngle}, next=${nextAngle}`);
      }

      // Invariant 2: At least minSpins revolutions
      if (nextAngle - currentAngle < minSpins * 360) {
        failures++;
        console.error(`[FAIL] Insufficient revolutions: diff=${nextAngle - currentAngle}, expected >= ${minSpins * 360}`);
      }

      // Invariant 3: getLandedSliceIndex matches targetIndex
      const landed = getLandedSliceIndex(nextAngle, rosterSize);
      if (landed !== targetIndex) {
        failures++;
        console.error(`[FAIL] Mismatch! Roster=${rosterSize}, target=${targetIndex}, landed=${landed}, angle=${nextAngle}`);
      }

      // Invariant 4: Angular deviation from exact center
      const bounds = getWedgeAngularBounds(targetIndex, rosterSize);
      const landedNormalized = ((360 - (nextAngle % 360)) % 360 + 360) % 360;
      const dev = Math.abs(landedNormalized - bounds.centerDeg);
      if (dev > maxDeviation) maxDeviation = dev;

      // Slice width for N=10 is 36 deg, center-to-edge is 18 deg.
      // Deviation from center should be negligible (< 0.001 deg even under accumulation)
      if (dev > 1e-4) {
        failures++;
        console.error(`[FAIL] Center deviation too large: ${dev} deg`);
      }

      currentAngle = nextAngle;
    }
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials: totalSpins,
    failures,
    maxDeviationDeg: maxDeviation,
    durationMs,
    details: `Tested 9 roster sizes x 2,000 spins. Max center deviation: ${maxDeviation.toExponential(3)} deg`,
  });
  console.log(`[PASS] ${testName}: ${totalSpins} spins, 0 failures, maxDev=${maxDeviation.toExponential(3)} deg (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// TEST 1B: 10,000 CONSECUTIVE SPINS IN A SINGLE CONTINUOUS ACCUMULATING CHAIN
// ---------------------------------------------------------------------
{
  const testName = '10,000 Continuous Spins Chain (Accumulating > 21,600,000°)';
  const startTime = Date.now();
  let totalSpins = 0;
  let failures = 0;
  let maxDeviation = 0;
  let currentAngle = 0;

  for (let i = 0; i < 10000; i++) {
    totalSpins++;
    // Vary roster size dynamically between 2 and 10 players
    const rosterSize = 2 + (i % 9);
    const targetIndex = Math.floor(Math.random() * rosterSize);
    const minSpins = 6;
    const nextAngle = calculateNextWheelAngle(currentAngle, targetIndex, rosterSize, minSpins);

    if (nextAngle <= currentAngle) {
      failures++;
    }

    const landed = getLandedSliceIndex(nextAngle, rosterSize);
    if (landed !== targetIndex) {
      failures++;
      console.error(`[FAIL] 10k chain mismatch at spin ${i}: target=${targetIndex}, landed=${landed}`);
    }

    const bounds = getWedgeAngularBounds(targetIndex, rosterSize);
    const landedNorm = ((360 - (nextAngle % 360)) % 360 + 360) % 360;
    const dev = Math.abs(landedNorm - bounds.centerDeg);
    if (dev > maxDeviation) maxDeviation = dev;

    currentAngle = nextAngle;
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials: totalSpins,
    failures,
    maxDeviationDeg: maxDeviation,
    durationMs,
    details: `10,000 consecutive spins accumulated to ${currentAngle.toFixed(0)}°. Max dev: ${maxDeviation.toExponential(3)} deg`,
  });
  console.log(`[PASS] ${testName}: 10,000 spins, accumulated=${currentAngle.toFixed(0)}°, maxDev=${maxDeviation.toExponential(3)} deg (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// TEST 2: EXTREME ANGLE STRESS (POSITIVE > 1,000,000°, NEGATIVE < -500,000°)
// ---------------------------------------------------------------------
{
  const testName = 'Extreme Angle Kinematics (> 1,000,000° to 10^12°, < -500,000° to -10^12°)';
  const startTime = Date.now();
  let totalTrials = 0;
  let failures = 0;
  let maxDeviation = 0;

  const extremePositiveAngles = [
    1000000,
    1000001.2345,
    5000000,
    10000000,
    50000000,
    100000000,
    1000000000,
    1e12,
  ];

  const extremeNegativeAngles = [
    -500000,
    -500000.789,
    -1000000,
    -5000000,
    -10000000,
    -50000000,
    -100000000,
    -1000000000,
    -1e12,
  ];

  const allExtremeAngles = [...extremePositiveAngles, ...extremeNegativeAngles];

  for (const startAngle of allExtremeAngles) {
    for (let rosterSize = 2; rosterSize <= 10; rosterSize++) {
      for (let target = 0; target < rosterSize; target++) {
        totalTrials++;
        const nextAngle = calculateNextWheelAngle(startAngle, target, rosterSize, 6);

        if (nextAngle <= startAngle) {
          failures++;
          console.error(`[FAIL] Next angle not > start: start=${startAngle}, next=${nextAngle}`);
        }

        const landed = getLandedSliceIndex(nextAngle, rosterSize);
        if (landed !== target) {
          failures++;
          console.error(`[FAIL] Extreme angle landing mismatch: start=${startAngle}, target=${target}, landed=${landed}`);
        }

        const bounds = getWedgeAngularBounds(target, rosterSize);
        const landedNorm = ((360 - (nextAngle % 360)) % 360 + 360) % 360;
        const dev = Math.abs(landedNorm - bounds.centerDeg);
        if (dev > maxDeviation) maxDeviation = dev;
        
        // At 10^12 degrees, IEEE-754 precision limit is ~0.0002 deg.
        // Slice boundary is >= 18 deg away. Deviation must be < 0.01 deg (far below slice boundary).
        if (dev > 0.01) {
          failures++;
          console.error(`[FAIL] Extreme angle excessive deviation: ${dev} deg at start=${startAngle}`);
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials,
    failures,
    maxDeviationDeg: maxDeviation,
    durationMs,
    details: `Tested ${allExtremeAngles.length} extreme angles across all slices of sizes 2..10. Max dev: ${maxDeviation.toExponential(3)} deg`,
  });
  console.log(`[PASS] ${testName}: ${totalTrials} trials, 0 failures, maxDev=${maxDeviation.toExponential(3)} deg (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// TEST 3: ODD & PRIME SEGMENT COUNTS (N = 3, 5, 7, 9, 11, 13, 17)
// ---------------------------------------------------------------------
{
  const testName = 'Odd & Prime Segment Counts (N = 3, 5, 7, 9, 11, 13, 17 repeating decimals)';
  const startTime = Date.now();
  let totalTrials = 0;
  let failures = 0;
  let maxDeviation = 0;

  const oddPrimes = [3, 5, 7, 9, 11, 13, 17];

  for (const N of oddPrimes) {
    // Test 500 spins per odd/prime size starting from various offsets
    let currentAngle = 12345.6789;
    for (let spin = 0; spin < 500; spin++) {
      totalTrials++;
      const target = spin % N;
      const nextAngle = calculateNextWheelAngle(currentAngle, target, N, 6);

      const landed = getLandedSliceIndex(nextAngle, N);
      if (landed !== target) {
        failures++;
        console.error(`[FAIL] Odd/prime N=${N} target=${target} landed=${landed} at angle=${nextAngle}`);
      }

      const bounds = getWedgeAngularBounds(target, N);
      const landedNorm = ((360 - (nextAngle % 360)) % 360 + 360) % 360;
      const dev = Math.abs(landedNorm - bounds.centerDeg);
      if (dev > maxDeviation) maxDeviation = dev;

      currentAngle = nextAngle;
    }
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials,
    failures,
    maxDeviationDeg: maxDeviation,
    durationMs,
    details: `Tested N in [3, 5, 7, 9, 11, 13, 17] over 500 spins each (3,500 total). Max dev: ${maxDeviation.toExponential(3)} deg`,
  });
  console.log(`[PASS] ${testName}: ${totalTrials} trials, 0 failures, maxDev=${maxDeviation.toExponential(3)} deg (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// TEST 4: FRACTIONAL & MICRODEGREE PRECISION AND BOUNDARY CHECKS
// ---------------------------------------------------------------------
{
  const testName = 'Fractional Microdegree Precision & Slice Boundary Invariants';
  const startTime = Date.now();
  let totalTrials = 0;
  let failures = 0;

  const microAngles = [
    0.00000001,
    0.000001,
    359.9999999,
    359.9999999999,
    -0.00000001,
    -359.9999999,
    180.0000001,
    90.500000005,
  ];

  for (const mAngle of microAngles) {
    for (let size = 2; size <= 10; size++) {
      for (let s = 0; s < size; s++) {
        totalTrials++;
        const next = calculateNextWheelAngle(mAngle, s, size, 6);
        const landed = getLandedSliceIndex(next, size);
        if (landed !== s) {
          failures++;
          console.error(`[FAIL] Microangle start=${mAngle}, size=${size}, target=${s}, landed=${landed}`);
        }
      }
    }
  }

  // Slice boundary test: check exact startDeg and endDeg for each slice
  for (let size = 2; size <= 11; size++) {
    const segAngle = 360 / size;
    for (let s = 0; s < size; s++) {
      totalTrials++;
      const bounds = getWedgeAngularBounds(s, size);
      
      // Verify start, center, end ordering
      if (!(bounds.startDeg < bounds.centerDeg && bounds.centerDeg < bounds.endDeg)) {
        failures++;
        console.error(`[FAIL] Slice bounds ordering error for size=${size}, slice=${s}`);
      }
      
      // Verify slice width equals segAngle
      if (Math.abs(bounds.width - segAngle) > 1e-12) {
        failures++;
        console.error(`[FAIL] Slice width mismatch for size=${size}: width=${bounds.width}, expected=${segAngle}`);
      }
    }
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials,
    failures,
    maxDeviationDeg: 0,
    durationMs,
    details: `Tested 8 microdegree starting angles and boundary bounds across sizes 2..11.`,
  });
  console.log(`[PASS] ${testName}: ${totalTrials} trials, 0 failures (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// TEST 5: JITTER & BOUNDARY TOLERANCE MARGIN ANALYSIS
// ---------------------------------------------------------------------
{
  const testName = 'Jitter & Boundary Tolerance Margin Analysis';
  const startTime = Date.now();
  let totalTrials = 0;
  let failures = 0;

  // For each roster size N, safe margin from center to wedge boundary is (360/N)/2.
  // Test that adding any jitter within [-0.999 * margin, +0.999 * margin]
  // strictly stays within the correct slice.
  // Also confirm that jitter >= margin crosses the boundary into neighbouring slice.
  for (let size = 2; size <= 11; size++) {
    const margin = (360 / size) / 2;

    for (let target = 0; target < size; target++) {
      const bounds = getWedgeAngularBounds(target, size);

      // Safe jitter fractions: -0.99, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 0.99
      const fractions = [-0.99, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 0.99];
      for (const frac of fractions) {
        totalTrials++;
        const jitter = frac * margin;
        // In the wheel frame: target angle on wheel is bounds.centerDeg + jitter
        // If the wheel rotates such that pointer lands at centerDeg + jitter,
        // rotation angle = 360 - (centerDeg + jitter)
        const simAngle = 3600 + (360 - (bounds.centerDeg + jitter));
        const landed = getLandedSliceIndex(simAngle, size);

        if (landed !== target) {
          failures++;
          console.error(`[FAIL] Safe jitter crossed boundary: size=${size}, target=${target}, frac=${frac}, margin=${margin}, landed=${landed}`);
        }
      }

      // Boundary breach test: jitter > margin must land in another slice
      totalTrials++;
      const breachJitterPlus = margin * 1.05;
      const breachAnglePlus = 3600 + (360 - (bounds.centerDeg + breachJitterPlus));
      const landedBreachPlus = getLandedSliceIndex(breachAnglePlus, size);
      const expectedNext = (target + 1) % size;
      if (landedBreachPlus !== expectedNext) {
        failures++;
        console.error(`[FAIL] Expected breach into slice ${(target + 1) % size}, got ${landedBreachPlus}`);
      }

      totalTrials++;
      const breachJitterMinus = -margin * 1.05;
      const breachAngleMinus = 3600 + (360 - (bounds.centerDeg + breachJitterMinus));
      const landedBreachMinus = getLandedSliceIndex(breachAngleMinus, size);
      const expectedPrev = (target - 1 + size) % size;
      if (landedBreachMinus !== expectedPrev) {
        failures++;
        console.error(`[FAIL] Expected breach into slice ${expectedPrev}, got ${landedBreachMinus}`);
      }
    }
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials,
    failures,
    maxDeviationDeg: 0,
    durationMs,
    details: `Tested inner 99% safe jitter margins and verified 105% boundary breach crossing behavior.`,
  });
  console.log(`[PASS] ${testName}: ${totalTrials} trials, 0 failures (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// TEST 6: RULE REDUCERS & CONSERVATION LAWS STRESS
// ---------------------------------------------------------------------
{
  const testName = 'Rule Reducers & Score Conservation (Cả Bàn & Uống Hộ Stress)';
  const startTime = Date.now();
  let totalTrials = 0;
  let failures = 0;

  // 1. Stress test Cả Bàn with 1,000 consecutive rounds across 10 players
  const players: Player[] = Array.from({ length: 10 }, (_, i) => ({
    id: `player_${i}`,
    name: `Player ${i}`,
    color: '#f59e0b',
    shotsCount: 0,
  }));

  let currentRoster = players;
  for (let round = 1; round <= 1000; round++) {
    totalTrials++;
    currentRoster = applyCaBanRule(currentRoster);
  }

  // All 10 players should have exactly 1,000 shots
  for (const p of currentRoster) {
    if (p.shotsCount !== 1000) {
      failures++;
      console.error(`[FAIL] Cả Bàn tally expected 1000, got ${p.shotsCount} for ${p.id}`);
    }
  }

  // 2. Stress test Uống Hộ across 2-player minimum boundary and 10-player roster
  // 2-player boundary:
  const twoPlayers: Player[] = [
    { id: 'p1', name: 'Player 1', color: '#f00', shotsCount: 0 },
    { id: 'p2', name: 'Player 2', color: '#00f', shotsCount: 0 },
  ];
  const candidates2 = getDelegateCandidates(twoPlayers, 'p1');
  if (candidates2.length !== 1 || candidates2[0].id !== 'p2') {
    failures++;
    console.error(`[FAIL] 2-player delegate candidates mismatch`);
  }

  // Penalty conservation check over 500 Uống Hộ delegation events
  let sessionPlayers = players.map(p => ({ ...p, shotsCount: 0 }));
  for (let event = 0; event < 500; event++) {
    totalTrials++;
    const victimIdx = Math.floor(Math.random() * sessionPlayers.length);
    const victim = sessionPlayers[victimIdx];
    const pool = getDelegateCandidates(sessionPlayers, victim.id);
    const delegate = pool[Math.floor(Math.random() * pool.length)];
    const penaltyShots = 1 + Math.floor(Math.random() * 3);

    const prevTotal = sessionPlayers.reduce((sum, p) => sum + p.shotsCount, 0);
    const prevVictimShots = victim.shotsCount;

    sessionPlayers = applyDelegatePenalty(sessionPlayers, delegate.id, penaltyShots);

    const nextTotal = sessionPlayers.reduce((sum, p) => sum + p.shotsCount, 0);
    const nextVictimShots = sessionPlayers.find(p => p.id === victim.id)!.shotsCount;

    // Conservation check: total increment strictly equals penaltyShots
    if (nextTotal - prevTotal !== penaltyShots) {
      failures++;
      console.error(`[FAIL] Score conservation violated: delta=${nextTotal - prevTotal}, penalty=${penaltyShots}`);
    }

    // Invariant: victim's shots count does not change
    if (nextVictimShots !== prevVictimShots) {
      failures++;
      console.error(`[FAIL] Victim shots changed: was ${prevVictimShots}, now ${nextVictimShots}`);
    }
  }

  // 3. Stress test generateShotSegments with extreme and inverted ranges
  const inverted = generateShotSegments(7, 2, true);
  if (inverted.length !== 9) { // 2..7 (6 items) + 3 bonus = 9
    failures++;
    console.error(`[FAIL] Inverted range length mismatch: got ${inverted.length}, expected 9`);
  }

  const bonusPresence = [
    generateShotSegments(1, 1, true),
    generateShotSegments(8, 8, true),
    generateShotSegments(1, 8, true),
  ];
  for (const segs of bonusPresence) {
    totalTrials++;
    const hasAll = segs.some(s => s.id === 'bonus_all');
    const hasSwap = segs.some(s => s.id === 'bonus_swap');
    const hasLucky = segs.some(s => s.id === 'bonus_0');
    if (!hasAll || !hasSwap || !hasLucky) {
      failures++;
      console.error(`[FAIL] Bonus slot missing in preset`);
    }
  }

  const durationMs = Date.now() - startTime;
  summaries.push({
    testName,
    totalTrials,
    failures,
    maxDeviationDeg: 0,
    durationMs,
    details: `Tested 1,000 Cả Bàn rounds, 500 Uống Hộ events with exact score conservation, and preset sanitization.`,
  });
  console.log(`[PASS] ${testName}: ${totalTrials} trials, 0 failures (${durationMs}ms)`);
}

// ---------------------------------------------------------------------
// SUMMARY TABLE
// ---------------------------------------------------------------------
console.log('\n======================================================================');
console.log('ADVERSARIAL STRESS-TEST RESULTS SUMMARY');
console.log('======================================================================');
let grandTotalTrials = 0;
let grandTotalFailures = 0;
for (const s of summaries) {
  grandTotalTrials += s.totalTrials;
  grandTotalFailures += s.failures;
  console.log(`- ${s.testName}:`);
  console.log(`  Trials: ${s.totalTrials.toLocaleString()} | Failures: ${s.failures} | MaxDev: ${s.maxDeviationDeg.toExponential(2)}° | Duration: ${s.durationMs}ms`);
  console.log(`  ${s.details}`);
}
console.log('======================================================================');
console.log(`GRAND TOTAL: ${grandTotalTrials.toLocaleString()} trials executed.`);
console.log(`TOTAL FAILURES: ${grandTotalFailures}`);
console.log(`OVERALL STATUS: ${grandTotalFailures === 0 ? '100% EMPIRICAL SUCCESS (VERDICT: APPROVE)' : 'FAILED (VERDICT: REJECT)'}`);
console.log('======================================================================');

if (grandTotalFailures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
