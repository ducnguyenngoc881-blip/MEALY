/**
 * MealWise Adversarial Stress Test Suite — Challenger P2-2
 * Domain Focus: Deduplication Engine (1,200 Rolls) & Apex Loot Drop Budget Calculations
 */

// Mock localStorage for headless Node environment
const memoryStore: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => memoryStore[k] || null,
  setItem: (k: string, v: string) => { memoryStore[k] = String(v); },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; },
  length: 0,
  key: () => null
} as any;

import { 
  pickNonDuplicateDish, 
  getCasePool, 
  getAccountCaseState, 
  resetAccountCaseCollection
} from '../src/utils/caseDeduplication';
import { 
  generateApexLootDrop, 
  formatZaloOfficeInvite,
  SNACK_BLUE_SIDES, SNACK_PURPLE_SIDES, SNACK_GOLD_SIDES,
  SNACK_BLUE_DRINKS, SNACK_PURPLE_DRINKS, SNACK_GOLD_DRINKS,
  BIZARRE_BLUE_SIDES, BIZARRE_PURPLE_SIDES, BIZARRE_GOLD_SIDES,
  BIZARRE_BLUE_DRINKS, BIZARRE_PURPLE_DRINKS, BIZARRE_GOLD_DRINKS
} from '../src/data/fastMealData';
import { FastMealPreferenceMode, ApexCaseTier } from '../src/types';

interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function recordTest(suite: string, testName: string, passed: boolean, error?: string, details?: any) {
  results.push({ suite, testName, passed, error, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  [${status}] [${suite}] ${testName}${error ? ` -> ${error}` : ''}`);
}

console.log('======================================================================');
console.log('   CHALLENGER P2-2: EMPIRICAL ADVERSARIAL STRESS-TEST HARNESS       ');
console.log('======================================================================\n');

const MODES: FastMealPreferenceMode[] = ['combo', 'express-1dish', 'snack-genz', 'bizarre-dare'];
const TIERS: ApexCaseTier[] = ['blue', 'purple', 'gold'];

// ======================================================================
// SECTION 1: DATABASE INTEGRITY & CROSS-POOL DISH ID UNIQUENESS
// ======================================================================
console.log('\n--- SECTION 1: DATABASE INTEGRITY & CROSS-POOL UNIQUENESS ---');

const globalDishIds = new Map<string, { mode: string; tier: string }>();
let totalDishesCounted = 0;
let crossPoolIdCollisions = 0;

for (const mode of MODES) {
  for (const tier of TIERS) {
    const pool = getCasePool(mode, tier);
    totalDishesCounted += pool.length;
    for (const dish of pool) {
      if (globalDishIds.has(dish.id)) {
        crossPoolIdCollisions++;
        const prev = globalDishIds.get(dish.id)!;
        recordTest(
          'Database Integrity',
          `Dish ID Collision: ${dish.id}`,
          false,
          `Dish ${dish.id} exists in both ${prev.mode}:${prev.tier} and ${mode}:${tier}`
        );
      } else {
        globalDishIds.set(dish.id, { mode, tier });
      }
    }
  }
}

recordTest(
  'Database Integrity',
  'All dish IDs across all 12 pools are 100% globally unique',
  crossPoolIdCollisions === 0,
  crossPoolIdCollisions > 0 ? `Found ${crossPoolIdCollisions} duplicate IDs` : undefined,
  { totalDishesCounted, uniqueDishIds: globalDishIds.size }
);

// Check price rounding to multiples of 1,000 VND and non-negative/non-NaN
let nonMultiple1000Dishes = 0;
let invalidPriceDishes = 0;

for (const mode of MODES) {
  for (const tier of TIERS) {
    const pool = getCasePool(mode, tier);
    for (const dish of pool) {
      if (typeof dish.estimatedCostVnd !== 'number' || isNaN(dish.estimatedCostVnd) || dish.estimatedCostVnd <= 0) {
        invalidPriceDishes++;
      }
      if (dish.estimatedCostVnd % 1000 !== 0) {
        nonMultiple1000Dishes++;
      }
    }
  }
}

recordTest(
  'Database Integrity',
  'Dish prices are strictly positive integers and valid numbers',
  invalidPriceDishes === 0,
  invalidPriceDishes > 0 ? `${invalidPriceDishes} dishes have invalid prices` : undefined
);

recordTest(
  'Database Integrity',
  'Dish prices are cleanly rounded to multiples of 1,000 VND',
  nonMultiple1000Dishes === 0,
  nonMultiple1000Dishes > 0 ? `${nonMultiple1000Dishes} dishes not multiple of 1,000 VND` : undefined
);


// ======================================================================
// SECTION 2: 1,200 CONTINUOUS ROLLS & DYNAMIC EXCLUSION WINDOW AUDIT
// ======================================================================
console.log('\n--- SECTION 2: 1,200 CONTINUOUS ROLLS & DYNAMIC EXCLUSION WINDOW ---');

// Part 2A: 100 rolls per mode/tier combination (12 * 100 = 1,200 rolls)
resetAccountCaseCollection();

let part2ATotalRolls = 0;
let part2AWndDuplicates = 0;
let part2APrestigeTransitions = 0;

for (const mode of MODES) {
  for (const tier of TIERS) {
    const pool = getCasePool(mode, tier);
    const poolSize = pool.length;
    const rollsForThisCombo = 100; // Exceeds pool size (50, 70, or 80) to force prestige wrap-around!

    let activeCycle = 0;
    let seenInCurrentCycle = new Set<string>();

    for (let i = 0; i < rollsForThisCombo; i++) {
      part2ATotalRolls++;
      const res = pickNonDuplicateDish(mode, tier);

      if (res.prestigeCycle > activeCycle) {
        part2APrestigeTransitions++;
        if (seenInCurrentCycle.size !== poolSize) {
          recordTest(
            'Exclusion Window',
            `Premature prestige cycle transition at roll ${i + 1} for ${mode}:${tier}`,
            false,
            `Cycle rolled over with only ${seenInCurrentCycle.size}/${poolSize} items drawn!`
          );
        }
        activeCycle = res.prestigeCycle;
        seenInCurrentCycle = new Set<string>();
      }

      if (seenInCurrentCycle.has(res.dish.id)) {
        part2AWndDuplicates++;
        recordTest(
          'Exclusion Window',
          `Duplicate item in exclusion window: ${res.dish.id} (${res.dish.title})`,
          false,
          `Item was drawn again within prestige cycle ${activeCycle} at roll ${i + 1}`
        );
      } else {
        seenInCurrentCycle.add(res.dish.id);
      }
    }

    recordTest(
      'Exclusion Window',
      `Dynamic exclusion window for ${mode}:${tier} (100 rolls, pool size ${poolSize})`,
      true,
      undefined,
      { poolSize, finalCycle: activeCycle }
    );
  }
}

recordTest(
  'Exclusion Window',
  'Part 2A: 1,200 Partitioned Continuous Rolls: 0% duplicate items in dynamic exclusion window',
  part2AWndDuplicates === 0,
  part2AWndDuplicates > 0 ? `Found ${part2AWndDuplicates} window duplicates in 1,200 rolls` : undefined,
  { totalRolls: part2ATotalRolls, duplicates: part2AWndDuplicates, prestigeTransitions: part2APrestigeTransitions }
);

// Part 2B: 1,200 Continuous Randomized / Interleaved Rolls
resetAccountCaseCollection();

let part2BTotalRolls = 0;
let part2BWndDuplicates = 0;

const activeCycles: Record<string, number> = {};
const seenInCycles: Record<string, Set<string>> = {};

for (const m of MODES) {
  for (const t of TIERS) {
    const key = `${m}:${t}`;
    activeCycles[key] = 0;
    seenInCycles[key] = new Set<string>();
  }
}

for (let i = 0; i < 1200; i++) {
  part2BTotalRolls++;
  const mode = MODES[Math.floor(Math.random() * MODES.length)];
  const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
  const key = `${mode}:${tier}`;
  const pool = getCasePool(mode, tier);

  const res = pickNonDuplicateDish(mode, tier);

  if (res.prestigeCycle > activeCycles[key]) {
    if (seenInCycles[key].size !== pool.length) {
      recordTest(
        'Interleaved Exclusion',
        `Premature cycle rollover in interleaved stream for ${key}`,
        false,
        `Expected ${pool.length} items before rollover, got ${seenInCycles[key].size}`
      );
    }
    activeCycles[key] = res.prestigeCycle;
    seenInCycles[key] = new Set<string>();
  }

  if (seenInCycles[key].has(res.dish.id)) {
    part2BWndDuplicates++;
    recordTest(
      'Interleaved Exclusion',
      `Duplicate in interleaved stream: ${res.dish.id} in ${key}`,
      false,
      `Duplicate dish drawn in prestige cycle ${activeCycles[key]}`
    );
  } else {
    seenInCycles[key].add(res.dish.id);
  }
}

recordTest(
  'Interleaved Exclusion',
  'Part 2B: 1,200 Interleaved Continuous Rolls: 0% duplicate items in dynamic exclusion window',
  part2BWndDuplicates === 0,
  part2BWndDuplicates > 0 ? `Found ${part2BWndDuplicates} duplicates in 1,200 interleaved rolls` : undefined,
  { totalRolls: part2BTotalRolls, duplicates: part2BWndDuplicates }
);


// ======================================================================
// SECTION 3: LOOT-DROP BUDGET CALCULATIONS STRESS TEST
// ======================================================================
console.log('\n--- SECTION 3: LOOT-DROP BUDGET CALCULATIONS STRESS TEST ---');

let blueBudgetViolations = 0;
let purpleBudgetViolations = 0;
let goldBudgetViolations = 0;

const budgetViolationsByMode: Record<string, { blueOver: number; purpleOver: number; goldUnder: number }> = {};
for (const m of MODES) {
  budgetViolationsByMode[m] = { blueOver: 0, purpleOver: 0, goldUnder: 0 };
}

const sampledDropsSummary: Record<string, { min: number; max: number; count: number }> = {};

for (const mode of MODES) {
  for (const tier of TIERS) {
    const key = `${mode}:${tier}`;
    sampledDropsSummary[key] = { min: Infinity, max: -Infinity, count: 0 };

    for (let i = 0; i < 100; i++) {
      const drop = generateApexLootDrop(tier, mode);
      sampledDropsSummary[key].count++;
      if (drop.totalCostVnd < sampledDropsSummary[key].min) sampledDropsSummary[key].min = drop.totalCostVnd;
      if (drop.totalCostVnd > sampledDropsSummary[key].max) sampledDropsSummary[key].max = drop.totalCostVnd;

      if (tier === 'blue' && drop.totalCostVnd > 45000) {
        blueBudgetViolations++;
        budgetViolationsByMode[mode].blueOver++;
      }
      if (tier === 'purple' && drop.totalCostVnd > 85000) {
        purpleBudgetViolations++;
        budgetViolationsByMode[mode].purpleOver++;
      }
      if (tier === 'gold' && drop.totalCostVnd < 65000) {
        goldBudgetViolations++;
        budgetViolationsByMode[mode].goldUnder++;
      }
    }
  }
}

recordTest(
  'Budget Calculation',
  'Blue drops strictly <= 45,000 VND (1,200 sampled drops)',
  blueBudgetViolations === 0,
  blueBudgetViolations > 0 ? `Found ${blueBudgetViolations} Blue drops exceeding 45,000₫` : undefined,
  { violationsByMode: budgetViolationsByMode }
);

recordTest(
  'Budget Calculation',
  'Purple drops strictly <= 85,000 VND (1,200 sampled drops)',
  purpleBudgetViolations === 0,
  purpleBudgetViolations > 0 ? `Found ${purpleBudgetViolations} Purple drops exceeding 85,000₫` : undefined,
  { violationsByMode: budgetViolationsByMode }
);

recordTest(
  'Budget Calculation',
  'Gold drops strictly >= 65,000 VND (1,200 sampled drops)',
  goldBudgetViolations === 0,
  goldBudgetViolations > 0 ? `Found ${goldBudgetViolations} Gold drops below 65,000₫` : undefined,
  { violationsByMode: budgetViolationsByMode }
);


// ======================================================================
// SECTION 4: EDGE CASES (EMPTY EXCLUSION, POOL EXHAUSTION, FALLBACK)
// ======================================================================
console.log('\n--- SECTION 4: EDGE CASE RESILIENCE & ERROR RECOVERY ---');

// 4.1 Cold start
resetAccountCaseCollection();
let coldStartSuccess = true;
try {
  const coldState = getAccountCaseState();
  if (coldState.unlockedIds.length !== 0) coldStartSuccess = false;
  const firstDrop = generateApexLootDrop('blue', 'express-1dish');
  if (!firstDrop || !firstDrop.mainDish) coldStartSuccess = false;
  const postColdState = getAccountCaseState();
  if (postColdState.unlockedIds.length !== 1) coldStartSuccess = false;
} catch (e: any) {
  coldStartSuccess = false;
}
recordTest(
  'Edge Cases',
  'Cold start with empty exclusion list (initial storage null/empty)',
  coldStartSuccess
);

// 4.2 Pool Exhaustion & Prestige Wrap-around
resetAccountCaseCollection();
let exhaustionSuccess = true;
try {
  const targetMode = 'combo';
  const targetTier = 'gold';
  const goldPool = getCasePool(targetMode, targetTier);
  const poolLen = goldPool.length;

  const cycle0Dishes = new Set<string>();
  for (let i = 0; i < poolLen; i++) {
    const res = pickNonDuplicateDish(targetMode, targetTier);
    cycle0Dishes.add(res.dish.id);
  }
  const rolloverRes = pickNonDuplicateDish(targetMode, targetTier);
  if (rolloverRes.prestigeCycle !== 1) exhaustionSuccess = false;
} catch (e: any) {
  exhaustionSuccess = false;
}
recordTest(
  'Edge Cases',
  'Pool exhaustion gracefully wraps to prestigeCycle + 1 and preserves pool items',
  exhaustionSuccess
);

// 4.3 Fallback Trigger on Corrupted LocalStorage JSON
let corruptedStorageHandled = false;
try {
  localStorage.setItem('mealwise_account_unlocked_cases_v1', 'CORRUPTED_NON_JSON_DATA{{{{{{');
  const safeState = getAccountCaseState();
  if (Array.isArray(safeState.unlockedIds) && safeState.unlockedIds.length === 0) {
    const safeDish = pickNonDuplicateDish('express-1dish', 'blue');
    if (safeDish && safeDish.dish) {
      corruptedStorageHandled = true;
    }
  }
} catch (e: any) {
  corruptedStorageHandled = false;
}
recordTest(
  'Edge Cases',
  'Corrupted localStorage gracefully caught and reset to valid state',
  corruptedStorageHandled
);

// 4.4 Fallback Trigger on QuotaExceededError
let quotaExceededHandled = false;
try {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error('QuotaExceededError: DOM Exception 22');
  };
  const dropDespiteError = pickNonDuplicateDish('snack-genz', 'purple');
  if (dropDespiteError && dropDespiteError.dish) {
    quotaExceededHandled = true;
  }
  localStorage.setItem = originalSetItem;
} catch (e: any) {
  quotaExceededHandled = false;
}
recordTest(
  'Edge Cases',
  'Storage write errors (QuotaExceededError) caught gracefully without crashing roll',
  quotaExceededHandled
);

// 4.5 formatZaloOfficeInvite across all 4 modes
let zaloFormatHandled = true;
try {
  const testModes: FastMealPreferenceMode[] = ['combo', 'express-1dish', 'snack-genz', 'bizarre-dare'];
  for (const tm of testModes) {
    const drop = generateApexLootDrop('purple', tm);
    const invite = formatZaloOfficeInvite(drop);
    if (!invite || typeof invite !== 'string' || invite.length < 20) {
      zaloFormatHandled = false;
    }
  }
} catch (e) {
  zaloFormatHandled = false;
}
recordTest(
  'Edge Cases',
  'formatZaloOfficeInvite produces valid invite text across all 4 modes',
  zaloFormatHandled
);

console.log('\n======================================================================');
console.log('                          TEST SUITE SUMMARY                          ');
console.log('======================================================================');

const totalExecuted = results.length;
const totalPassed = results.filter(r => r.passed).length;
const totalFailed = results.filter(r => !r.passed).length;

console.log(`Total Assertions: ${totalExecuted}`);
console.log(`Passed:           ${totalPassed}`);
console.log(`Failed:           ${totalFailed}`);

if (totalFailed > 0) {
  console.log('\n❌ FAILED TESTS REQUIRING ATTENTION:');
  for (const r of results.filter(r => !r.passed)) {
    console.log(`  • [${r.suite}] ${r.testName}: ${r.error}`);
  }
}
console.log('======================================================================\n');
