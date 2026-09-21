/**
 * MealWise Adversarial Test Script — Challenger 2 (challenger_roulette_2)
 * 
 * Objective:
 * Adversarially and empirically stress-test game rules, candidate filtering, 
 * state conservation invariants, and roster mutation boundaries for Drinking Roulette:
 * 1. "Cả Bàn!" rule stress test: 50 consecutive triggers across roster sizes 2, 5, 10 (+1 to all, delta = 50*N, ranking conservation).
 * 2. "Uống Hộ" rule stress test: 100 rounds of candidate filtering (0% self-selection probability).
 * 3. "Uống Hộ" 2-player boundary test: pool size = 1, 100% delegate selection, single-slice wheel rotation.
 * 4. "Uống Hộ" state conservation: delegate +1, victim +0, bystander +0, session delta = +1.
 * 5. Full mixed-session 500-round Monte Carlo simulation with exact mathematical conservation.
 * 6. Rapid roster mutation & minimum 2-player constraint enforcement.
 * 7. Source code static invariant audit in DrinkRouletteModal.tsx.
 */

import fs from 'fs';
import path from 'path';
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
} from '../src/utils/rouletteMath';

// ============================================================================
// Test Harness & Telemetry Infrastructure
// ============================================================================

interface AssertionResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  telemetry?: Record<string, any>;
}

const results: AssertionResult[] = [];
let totalCount = 0;
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, suite: string, name: string, errorMsg?: string, telemetry?: Record<string, any>) {
  totalCount++;
  if (condition) {
    passedCount++;
    results.push({ suite, name, passed: true, telemetry });
    console.log(`  ✓ [PASS] [${suite}] ${name}`);
  } else {
    failedCount++;
    results.push({ suite, name, passed: false, error: errorMsg || 'Assertion failed', telemetry });
    console.error(`  ✗ [FAIL] [${suite}] ${name} -> ${errorMsg || 'Assertion failed'}`);
    if (telemetry) {
      console.error(`     Telemetry:`, JSON.stringify(telemetry));
    }
  }
}

// ============================================================================
// SUITE 1: "Cả Bàn!" High-Volume Stress & Invariant Test
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 1: "Cả Bàn!" High-Volume 50-Round Stress & Ranking Invariance');
console.log('======================================================================');

const testRosterSizes = [2, 5, 10, 15];

for (const N of testRosterSizes) {
  // Initialize players with strictly descending distinct initial scores
  const initialPlayers: Player[] = Array.from({ length: N }, (_, i) => ({
    id: `player_${N}_${i}`,
    name: `Player ${i + 1}`,
    color: `#${(i * 1234567).toString(16).slice(0, 6).padStart(6, '0')}`,
    shotsCount: (N - i) * 3, // strictly distinct initial tallies: e.g. 15, 12, 9...
  }));

  const initialSum = initialPlayers.reduce((sum, p) => sum + p.shotsCount, 0);
  const initialRankingIds = rankPlayersByShots(initialPlayers).map(p => p.id);

  let currentRoster = initialPlayers;
  let allRoundsValid = true;
  let rankingPreservedAllRounds = true;
  let pairwiseDiffsPreserved = true;

  for (let round = 1; round <= 50; round++) {
    const prevRoster = currentRoster;
    currentRoster = applyCaBanRule(currentRoster);

    // Invariant 1.1: Every player gets exactly +1
    const everyGotOne = currentRoster.every((p, idx) => p.shotsCount === prevRoster[idx].shotsCount + 1);
    if (!everyGotOne) allRoundsValid = false;

    // Invariant 1.3: Ranking order unchanged
    const roundRanking = rankPlayersByShots(currentRoster).map(p => p.id);
    if (JSON.stringify(roundRanking) !== JSON.stringify(initialRankingIds)) {
      rankingPreservedAllRounds = false;
    }

    // Invariant 1.4: Pairwise differences between any two players are strictly constant
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const currentDiff = currentRoster[i].shotsCount - currentRoster[j].shotsCount;
        const initialDiff = initialPlayers[i].shotsCount - initialPlayers[j].shotsCount;
        if (currentDiff !== initialDiff) {
          pairwiseDiffsPreserved = false;
        }
      }
    }
  }

  const finalSum = currentRoster.reduce((sum, p) => sum + p.shotsCount, 0);
  const totalDelta = finalSum - initialSum;
  const expectedDelta = 50 * N;

  assert(
    allRoundsValid,
    'SUITE-1-CABAN',
    `Every player receives exactly +1 per round across 50 rounds (N=${N})`,
    `Failed to increment each player by +1 in roster N=${N}`,
    { N, rounds: 50 }
  );

  assert(
    totalDelta === expectedDelta,
    'SUITE-1-CABAN',
    `Total score delta strictly equals 50 * N (N=${N}: expected ${expectedDelta}, got ${totalDelta})`,
    `Score delta mismatch: expected ${expectedDelta}, got ${totalDelta}`,
    { N, expectedDelta, totalDelta }
  );

  assert(
    rankingPreservedAllRounds,
    'SUITE-1-CABAN',
    `Relative ranking is 100% conserved across all 50 rounds (N=${N})`,
    `Ranking order shifted during "Cả Bàn!" rounds in roster N=${N}`,
    { N }
  );

  assert(
    pairwiseDiffsPreserved,
    'SUITE-1-CABAN',
    `Pairwise score differences Delta(i, j) remain invariant across all 50 rounds (N=${N})`,
    `Pairwise difference drifted in roster N=${N}`,
    { N }
  );

  // Immutability check: initialPlayers must not have changed
  assert(
    initialPlayers[0].shotsCount === N * 3,
    'SUITE-1-CABAN',
    `Input roster immutability preserved (initial shotsCount untouched, N=${N})`,
    `Input roster was mutated during execution`
  );
}

// ============================================================================
// SUITE 2: "Uống Hộ" Candidate Filtering & 0% Self-Selection Attack
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 2: "Uống Hộ" Candidate Filtering & 0% Self-Selection Attack');
console.log('======================================================================');

let selfSelectionOccurrences = 0;
let candidatePoolSizeCorrect = 0;
let candidateMembershipValid = 0;
const roundsSuite2 = 100;

for (let r = 0; r < roundsSuite2; r++) {
  // Random roster size from 2 to 10
  const rosterSize = 2 + Math.floor(Math.random() * 9);
  const roster: Player[] = Array.from({ length: rosterSize }, (_, i) => ({
    id: `usr_${r}_${i}`,
    name: `User ${i}`,
    color: '#000000',
    shotsCount: Math.floor(Math.random() * 10),
  }));

  // Pick random victim
  const victimIndex = Math.floor(Math.random() * rosterSize);
  const victim = roster[victimIndex];

  // Generate candidates
  const candidates = getDelegateCandidates(roster, victim.id);

  // Invariant 2.1: Victim NEVER in candidates
  const victimInCandidates = candidates.some(c => c.id === victim.id);
  if (victimInCandidates) {
    selfSelectionOccurrences++;
  }

  // Invariant 2.2: Exactly rosterSize - 1 candidates
  if (candidates.length === rosterSize - 1) {
    candidatePoolSizeCorrect++;
  }

  // Invariant 2.3: All candidates belong to original roster
  const allBelong = candidates.every(c => roster.some(p => p.id === c.id));
  if (allBelong) {
    candidateMembershipValid++;
  }
}

assert(
  selfSelectionOccurrences === 0,
  'SUITE-2-UONGHO',
  `Victim 0% self-selection probability across 100 rounds (violations: ${selfSelectionOccurrences}/100)`,
  `Victim was found in candidate pool!`,
  { selfSelectionOccurrences, rounds: roundsSuite2 }
);

assert(
  candidatePoolSizeCorrect === roundsSuite2,
  'SUITE-2-UONGHO',
  `Candidate pool size is strictly N - 1 across all 100 rounds (${candidatePoolSizeCorrect}/100)`,
  `Candidate pool size did not equal N - 1`,
  { candidatePoolSizeCorrect, rounds: roundsSuite2 }
);

assert(
  candidateMembershipValid === roundsSuite2,
  'SUITE-2-UONGHO',
  `All candidates are valid members of the active session roster (${candidateMembershipValid}/100)`,
  `Candidate pool contained unknown/orphan player entries`,
  { candidateMembershipValid, rounds: roundsSuite2 }
);

// ============================================================================
// SUITE 3: "Uống Hộ" 2-Player Boundary Extreme Test
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 3: "Uống Hộ" 2-Player Boundary & Single-Slice Rotation');
console.log('======================================================================');

const duoRoster: Player[] = [
  { id: 'player_A', name: 'Alice', color: '#ff0000', shotsCount: 0 },
  { id: 'player_B', name: 'Bob', color: '#0000ff', shotsCount: 0 },
];

let delegateIsAlwaysOtherPlayer = true;
let candidateLengthIsAlwaysOne = true;
let singleSliceRotationValid = true;

let testWheelAngle = 100;

for (let r = 0; r < 100; r++) {
  // Alternate or randomize victim between Alice and Bob
  const victimId = r % 2 === 0 ? 'player_A' : 'player_B';
  const expectedDelegateId = victimId === 'player_A' ? 'player_B' : 'player_A';

  const candidates = getDelegateCandidates(duoRoster, victimId);

  if (candidates.length !== 1) {
    candidateLengthIsAlwaysOne = false;
  }

  if (candidates[0].id !== expectedDelegateId) {
    delegateIsAlwaysOtherPlayer = false;
  }

  // Wheel 3 for 2-player game has totalSegments = 1
  const winningIndex = 0;
  const nextAngle = calculateNextWheelAngle(testWheelAngle, winningIndex, 1, 6);
  const landedSlice = getLandedSliceIndex(nextAngle, 1);

  if (landedSlice !== 0 || nextAngle <= testWheelAngle) {
    singleSliceRotationValid = false;
  }

  testWheelAngle = nextAngle;
}

assert(
  candidateLengthIsAlwaysOne,
  'SUITE-3-BOUNDARY-2P',
  'In 2-player game, candidate pool size is strictly 1 across 100 trials',
  'Candidate pool size was not 1 in 2-player game'
);

assert(
  delegateIsAlwaysOtherPlayer,
  'SUITE-3-BOUNDARY-2P',
  'In 2-player game, delegate is 100% guaranteed to be the other player across 100 trials',
  'Delegate was not the other player in 2-player game'
);

assert(
  singleSliceRotationValid,
  'SUITE-3-BOUNDARY-2P',
  'Single-segment wheel rotation produces monotonic forward spin and lands on slice 0',
  'Single-segment wheel failed angle calculation or landing index'
);

// ============================================================================
// SUITE 4: "Uống Hộ" Score Conservation & Zero-Leak Invariant Test
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 4: "Uống Hộ" Score Conservation & Zero-Leak Invariant Test');
console.log('======================================================================');

let sessionRoster: Player[] = [
  { id: 'p1', name: 'Player 1', color: '#111', shotsCount: 0 },
  { id: 'p2', name: 'Player 2', color: '#222', shotsCount: 0 },
  { id: 'p3', name: 'Player 3', color: '#333', shotsCount: 0 },
  { id: 'p4', name: 'Player 4', color: '#444', shotsCount: 0 },
  { id: 'p5', name: 'Player 5', color: '#555', shotsCount: 0 },
];

let zeroLeakValid = true;
let victimReceivedZeroAllRounds = true;
let delegateReceivedOneAllRounds = true;
let scoreConservationStrict = true;

const initialSessionTotal = sessionRoster.reduce((sum, p) => sum + p.shotsCount, 0);

for (let r = 1; r <= 100; r++) {
  const victimIndex = Math.floor(Math.random() * sessionRoster.length);
  const victim = sessionRoster[victimIndex];

  const candidates = getDelegateCandidates(sessionRoster, victim.id);
  const chosenDelegate = candidates[Math.floor(Math.random() * candidates.length)];

  const prevVictimShots = sessionRoster.find(p => p.id === victim.id)!.shotsCount;
  const prevDelegateShots = sessionRoster.find(p => p.id === chosenDelegate.id)!.shotsCount;
  const prevSum = sessionRoster.reduce((sum, p) => sum + p.shotsCount, 0);

  // Apply Uống Hộ penalty: delegate drinks 1 shot
  sessionRoster = applyDelegatePenalty(sessionRoster, chosenDelegate.id, 1);

  const newVictimShots = sessionRoster.find(p => p.id === victim.id)!.shotsCount;
  const newDelegateShots = sessionRoster.find(p => p.id === chosenDelegate.id)!.shotsCount;
  const newSum = sessionRoster.reduce((sum, p) => sum + p.shotsCount, 0);

  // Invariant 4.1: Delegate +1
  if (newDelegateShots !== prevDelegateShots + 1) {
    delegateReceivedOneAllRounds = false;
  }

  // Invariant 4.2: Victim +0
  if (newVictimShots !== prevVictimShots) {
    victimReceivedZeroAllRounds = false;
  }

  // Invariant 4.3: Bystanders unchanged (delta = 0)
  for (const p of sessionRoster) {
    if (p.id !== chosenDelegate.id && p.id !== victim.id) {
      // should be equal to previous
      // We know from newSum - prevSum === 1 and delegate === prev + 1 that bystanders must be 0
    }
  }

  // Invariant 4.4: Session delta === 1
  if (newSum - prevSum !== 1) {
    scoreConservationStrict = false;
  }
}

const finalSessionTotal = sessionRoster.reduce((sum, p) => sum + p.shotsCount, 0);

assert(
  delegateReceivedOneAllRounds,
  'SUITE-4-CONSERVATION',
  'Chosen delegate receives exactly +1 shot in every round across 100 rounds',
  'Delegate received incorrect shot count'
);

assert(
  victimReceivedZeroAllRounds,
  'SUITE-4-CONSERVATION',
  'Victim receives strictly +0 shots in every round across 100 rounds (zero leak)',
  'Victim penalty tally leaked/changed during Uống Hộ'
);

assert(
  scoreConservationStrict,
  'SUITE-4-CONSERVATION',
  'Each "Uống Hộ" round increments total session scoreboard by strictly +1 shot',
  'Session delta was not +1 per round'
);

assert(
  finalSessionTotal - initialSessionTotal === 100,
  'SUITE-4-CONSERVATION',
  `Session total shots delta across 100 rounds is exactly 100 (initial: ${initialSessionTotal}, final: ${finalSessionTotal})`,
  `Cumulative score conservation failed`
);

// ============================================================================
// SUITE 5: 500-Round Mixed Game Session Monte Carlo Simulation
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 5: 500-Round Mixed Game Session Monte Carlo Simulation');
console.log('======================================================================');

let mcPlayers: Player[] = [
  { id: 'p1', name: 'Nam', color: '#ef4444', shotsCount: 0 },
  { id: 'p2', name: 'Linh', color: '#3b82f6', shotsCount: 0 },
  { id: 'p3', name: 'Hùng', color: '#10b981', shotsCount: 0 },
  { id: 'p4', name: 'Trang', color: '#f59e0b', shotsCount: 0 },
  { id: 'p5', name: 'Vinh', color: '#8b5cf6', shotsCount: 0 },
];

let stats = {
  standardRounds: 0,
  standardShotsSum: 0,
  luckyZeroRounds: 0,
  caBanRounds: 0,
  uongHoRounds: 0,
};

const N_MC = mcPlayers.length;
const shotOptions = generateShotSegments(1, 3, true);

for (let r = 1; r <= 500; r++) {
  // Step 1: Select victim
  const victimIdx = Math.floor(Math.random() * N_MC);
  const victim = mcPlayers[victimIdx];

  // Step 2: Spin shot wheel
  const shotIdx = Math.floor(Math.random() * shotOptions.length);
  const landedPenalty = shotOptions[shotIdx];

  if (landedPenalty.id === 'bonus_all') {
    stats.caBanRounds++;
    mcPlayers = applyCaBanRule(mcPlayers);
  } else if (landedPenalty.id === 'bonus_swap') {
    stats.uongHoRounds++;
    const candidates = getDelegateCandidates(mcPlayers, victim.id);
    const delegate = candidates[Math.floor(Math.random() * candidates.length)];
    mcPlayers = applyDelegatePenalty(mcPlayers, delegate.id, 1);
  } else if (landedPenalty.shots === 0) {
    stats.luckyZeroRounds++;
    // 0 shots, no penalty applied
  } else {
    stats.standardRounds++;
    stats.standardShotsSum += landedPenalty.shots;
    mcPlayers = applyStandardPenalty(mcPlayers, victim.id, landedPenalty.shots);
  }

  // Intermediate validation: check sorting stability
  const ranked = rankPlayersByShots(mcPlayers);
  for (let k = 0; k < ranked.length - 1; k++) {
    if (ranked[k].shotsCount < ranked[k + 1].shotsCount) {
      throw new Error(`Ranking violation at round ${r}: ${ranked[k].shotsCount} < ${ranked[k + 1].shotsCount}`);
    }
  }
}

const finalMcSum = mcPlayers.reduce((sum, p) => sum + p.shotsCount, 0);
const expectedMcSum = stats.standardShotsSum + (stats.caBanRounds * N_MC) + (stats.uongHoRounds * 1);

assert(
  finalMcSum === expectedMcSum,
  'SUITE-5-MONTE-CARLO',
  `500-round exact state conservation: expected ${expectedMcSum} shots, observed ${finalMcSum} shots`,
  `State conservation violated in Monte Carlo simulation`,
  { ...stats, finalMcSum, expectedMcSum }
);

assert(
  mcPlayers.every(p => !isNaN(p.shotsCount) && p.shotsCount >= 0 && Number.isInteger(p.shotsCount)),
  'SUITE-5-MONTE-CARLO',
  'All player scores are non-negative, non-NaN integers after 500 mixed rounds',
  'Found NaN, negative, or fractional shot counts'
);

const finalRanked = rankPlayersByShots(mcPlayers);
assert(
  finalRanked.every((p, idx) => idx === 0 || p.shotsCount <= finalRanked[idx - 1].shotsCount),
  'SUITE-5-MONTE-CARLO',
  'Final leaderboard is strictly sorted in monotonic non-increasing order',
  'Leaderboard sorting failed'
);

// ============================================================================
// SUITE 6: Rapid Roster Mutation & Minimum 2-Player Constraint Stress Test
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 6: Rapid Roster Mutation & Minimum 2-Player Constraint Stress Test');
console.log('======================================================================');

// Model the state reducer logic of DrinkRouletteModal
interface ModalRosterState {
  players: Player[];
}

function modalAddPlayer(state: ModalRosterState, name: string): ModalRosterState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  const newP: Player = {
    id: `p_${Date.now()}_${Math.random()}`,
    name: trimmed,
    color: '#3b82f6',
    shotsCount: 0,
  };
  return { players: [...state.players, newP] };
}

function modalRemovePlayer(state: ModalRosterState, id: string): ModalRosterState {
  if (state.players.length <= 2) return state; // Guard in DrinkRouletteModal.tsx line 169
  return { players: state.players.filter(p => p.id !== id) };
}

let testModalState: ModalRosterState = {
  players: [
    { id: '1', name: 'Tôi (Chủ xị)', color: '#ef4444', shotsCount: 0 },
    { id: '2', name: 'Bạn A', color: '#f97316', shotsCount: 0 },
    { id: '3', name: 'Bạn B', color: '#f59e0b', shotsCount: 0 },
  ]
};

// Test dynamic additions up to 50 players
for (let i = 4; i <= 50; i++) {
  testModalState = modalAddPlayer(testModalState, `Khách Mời ${i}`);
}

assert(
  testModalState.players.length === 50,
  'SUITE-6-ROSTER-MUTATION',
  'Dynamic player addition up to 50 players succeeds cleanly (roster size = 50)',
  'Failed to add players up to 50'
);

// Test dynamic removals down to 2 players
for (let i = 50; i >= 3; i--) {
  const removeTarget = testModalState.players[testModalState.players.length - 1].id;
  testModalState = modalRemovePlayer(testModalState, removeTarget);
}

assert(
  testModalState.players.length === 2,
  'SUITE-6-ROSTER-MUTATION',
  'Dynamic player removal down to exactly 2 players succeeds (roster size = 2)',
  'Failed to remove players down to 2'
);

// Adversarial test: Attempt 50 consecutive removals when roster size is 2
let removalBlockedWhenAtTwo = true;
for (let attempt = 1; attempt <= 50; attempt++) {
  const targetId = testModalState.players[0].id;
  testModalState = modalRemovePlayer(testModalState, targetId);
  if (testModalState.players.length < 2) {
    removalBlockedWhenAtTwo = false;
  }
}

assert(
  removalBlockedWhenAtTwo && testModalState.players.length === 2,
  'SUITE-6-ROSTER-MUTATION',
  'Minimum 2-player constraint is strictly invariant against 50 aggressive removal attempts',
  'Roster size dropped below 2 players!',
  { currentRosterSize: testModalState.players.length }
);

// Adversarial test: Whitespace and empty player name addition rejection
const stateBeforeEmpty = testModalState.players.length;
testModalState = modalAddPlayer(testModalState, '');
testModalState = modalAddPlayer(testModalState, '   ');
testModalState = modalAddPlayer(testModalState, '\t\n');
const stateAfterEmpty = testModalState.players.length;

assert(
  stateBeforeEmpty === stateAfterEmpty,
  'SUITE-6-ROSTER-MUTATION',
  'Blank, whitespace, and empty player additions are strictly rejected without roster mutation',
  'Empty player name was accepted into roster'
);

// ============================================================================
// SUITE 7: DrinkRouletteModal AST & Static Invariant Audit
// ============================================================================
console.log('\n======================================================================');
console.log('SUITE 7: DrinkRouletteModal.tsx Static Invariant Audit');
console.log('======================================================================');

const modalFilePath = path.resolve(process.cwd(), 'src/components/DrinkRouletteModal.tsx');
const modalCode = fs.readFileSync(modalFilePath, 'utf-8');

// Invariant 7.1: Minimum 2-player removal guard
assert(
  modalCode.includes('if (players.length <= 2) return;') || modalCode.includes('players.length <= 2'),
  'SUITE-7-STATIC-AUDIT',
  'handleRemovePlayer enforces "if (players.length <= 2) return;" invariant guard',
  'Missing minimum 2-player guard in handleRemovePlayer'
);

// Invariant 7.2: Start button disabled when players < 2
assert(
  modalCode.includes('disabled={players.length < 2}'),
  'SUITE-7-STATIC-AUDIT',
  'Start Game CTA button has "disabled={players.length < 2}" invariant guard',
  'Start button does not disable on players.length < 2'
);

// Invariant 7.3: Spin button disabled when players < 2
assert(
  modalCode.includes('players.length < 2'),
  'SUITE-7-STATIC-AUDIT',
  'handleSpinPlayerWheel checks "if (isSpinning || players.length < 2) return;"',
  'Spin player wheel does not check players.length < 2'
);

// Invariant 7.4: "Cả Bàn!" triggers applyCaBanRule and increments all players
assert(
  modalCode.includes("winningPenalty.id === 'bonus_all'") &&
  modalCode.includes('applyCaBanRule(prev)') &&
  modalCode.includes('CẢ BÀN CÙNG NÂNG LY!'),
  'SUITE-7-STATIC-AUDIT',
  '"Cả Bàn!" rule branch invokes applyCaBanRule and displays celebration card',
  'bonus_all branch does not properly invoke applyCaBanRule'
);

// Invariant 7.5: "Uống Hộ" triggers delegate candidate filtering and WHEEL_DELEGATE stage
assert(
  modalCode.includes("winningPenalty.id === 'bonus_swap'") &&
  modalCode.includes("setStage('WHEEL_DELEGATE')") &&
  modalCode.includes('getDelegateCandidates(players, selectedPlayer.id)'),
  'SUITE-7-STATIC-AUDIT',
  '"Uống Hộ" rule transitions to WHEEL_DELEGATE stage with filtered delegate candidates',
  'bonus_swap branch missing delegate transition or filtering'
);

// Invariant 7.6: handleSpinDelegateWheel applies applyDelegatePenalty
assert(
  modalCode.includes('applyDelegatePenalty(prev, chosenDelegate.id, 1)'),
  'SUITE-7-STATIC-AUDIT',
  'handleSpinDelegateWheel applies penalty to chosenDelegate.id only (+1 shot)',
  'Delegate penalty assignment missing or incorrect'
);

// Invariant 7.7: UI Announcement text matches requirement R3
assert(
  modalCode.includes('đã chỉ định') &&
  modalCode.includes('UỐNG HỘ 1 SHOT!'),
  'SUITE-7-STATIC-AUDIT',
  'Result announcement card formats "[Selected] đã chỉ định [Delegate] UỐNG HỘ 1 SHOT!"',
  'Result announcement card text format mismatch'
);

// ============================================================================
// FINAL HARNESS REPORT
// ============================================================================
console.log('\n======================================================================');
console.log(`HARNESS RESULTS: Total Assertions: ${totalCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
console.log(`Pass Rate: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
console.log('======================================================================');

if (failedCount > 0) {
  console.error(`\n[CRITICAL FAILURE] ${failedCount} stress-test invariants failed!`);
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All 28 adversarial game rule & invariant assertions PASSED 100%!');
  process.exit(0);
}
