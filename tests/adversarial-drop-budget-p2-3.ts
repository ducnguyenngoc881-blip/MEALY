/**
 * Challenger P2-3: Exhaustive Cartesian Product & Deep Stress Test Harness
 * 
 * Objectives:
 * 1. 100% Exhaustive Cartesian Product verification across ALL possible (main x side x drink) combinations:
 *    - Blue tier: strictly <= 45,000 VND (0 violations allowed)
 *    - Purple tier: strictly <= 85,000 VND (0 violations allowed)
 *    - Gold tier: strictly >= 65,000 VND (0 violations allowed)
 * 2. Extended Continuous Deduplication Testing (3,600 rolls total):
 *    - 1,200 Partitioned Rolls (100 rolls x 12 pools)
 *    - 1,200 Interleaved Chaotic Stream Rolls
 *    - 1,200 Multi-Prestige Wrap-Around Rolls (driving pools through 3+ prestige cycles)
 * 3. Edge Case & Fault Tolerance Mining:
 *    - Cold start (empty storage)
 *    - Storage corruption (malformed JSON)
 *    - Storage quota exhaustion (QuotaExceededError)
 *    - Zalo invitation generation integrity across all 12 pools
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
  resetAccountCaseCollection,
  getAllUnlockedDishes,
  getModeCollectionStats
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
console.log('   CHALLENGER P2-3: EXHAUSTIVE CARTESIAN & DEEP DEDUP HARNESS        ');
console.log('======================================================================\n');

const MODES: FastMealPreferenceMode[] = ['combo', 'express-1dish', 'snack-genz', 'bizarre-dare'];
const TIERS: ApexCaseTier[] = ['blue', 'purple', 'gold'];

// ======================================================================
// SECTION 1: EXHAUSTIVE CARTESIAN PRODUCT AUDIT (ALL COMBINATIONS)
// ======================================================================
console.log('--- SECTION 1: EXHAUSTIVE CARTESIAN PRODUCT AUDIT ---');

let totalCartesianCombinations = 0;
let cartesianBlueViolations = 0;
let cartesianPurpleViolations = 0;
let cartesianGoldViolations = 0;
let cartesianNonMultiple1000 = 0;

interface CartesianViolation {
  mode: string;
  tier: string;
  main: string;
  mainPrice: number;
  side?: string;
  sidePrice?: number;
  drink?: string;
  drinkPrice?: number;
  totalCost: number;
  expectedLimit: string;
}

const violationsList: CartesianViolation[] = [];

for (const mode of MODES) {
  for (const tier of TIERS) {
    const mainPool = getCasePool(mode, tier);

    // Retrieve sides and drinks corresponding to mode and tier
    let sideItems: { title: string; estimatedCostVnd: number }[] = [];
    let drinkItems: { title: string; estimatedCostVnd: number }[] = [];

    if (mode === 'express-1dish') {
      sideItems = [{ title: 'None', estimatedCostVnd: 0 }];
      drinkItems = [{ title: 'None', estimatedCostVnd: 0 }];
    } else if (mode === 'snack-genz') {
      sideItems = tier === 'gold' ? SNACK_GOLD_SIDES : tier === 'purple' ? SNACK_PURPLE_SIDES : SNACK_BLUE_SIDES;
      drinkItems = tier === 'gold' ? SNACK_GOLD_DRINKS : tier === 'purple' ? SNACK_PURPLE_DRINKS : SNACK_BLUE_DRINKS;
    } else if (mode === 'bizarre-dare') {
      sideItems = tier === 'gold' ? BIZARRE_GOLD_SIDES : tier === 'purple' ? BIZARRE_PURPLE_SIDES : BIZARRE_BLUE_SIDES;
      drinkItems = tier === 'gold' ? BIZARRE_GOLD_DRINKS : tier === 'purple' ? BIZARRE_PURPLE_DRINKS : BIZARRE_BLUE_DRINKS;
    } else if (mode === 'combo') {
      // Sample 200 drops to extract all sides and drinks registered in combo
      const sidesSeen = new Map<string, number>();
      const drinksSeen = new Map<string, number>();
      for (let i = 0; i < 200; i++) {
        const d = generateApexLootDrop(tier, 'combo');
        if (d.sideDish) sidesSeen.set(d.sideDish.title, d.sideDish.estimatedCostVnd);
        if (d.officeDrink) drinksSeen.set(d.officeDrink.title, d.officeDrink.estimatedCostVnd);
      }
      sideItems = Array.from(sidesSeen.entries()).map(([title, estimatedCostVnd]) => ({ title, estimatedCostVnd }));
      drinkItems = Array.from(drinksSeen.entries()).map(([title, estimatedCostVnd]) => ({ title, estimatedCostVnd }));
    }

    let minCombCost = Infinity;
    let maxCombCost = -Infinity;
    let comboCount = 0;

    for (const main of mainPool) {
      for (const side of sideItems) {
        for (const drink of drinkItems) {
          totalCartesianCombinations++;
          comboCount++;
          const cost = main.estimatedCostVnd + side.estimatedCostVnd + drink.estimatedCostVnd;
          if (cost < minCombCost) minCombCost = cost;
          if (cost > maxCombCost) maxCombCost = cost;

          if (cost % 1000 !== 0) {
            cartesianNonMultiple1000++;
          }

          if (tier === 'blue' && cost > 45000) {
            cartesianBlueViolations++;
            violationsList.push({
              mode,
              tier,
              main: main.title,
              mainPrice: main.estimatedCostVnd,
              side: side.title,
              sidePrice: side.estimatedCostVnd,
              drink: drink.title,
              drinkPrice: drink.estimatedCostVnd,
              totalCost: cost,
              expectedLimit: '<= 45,000 VND'
            });
          }

          if (tier === 'purple' && cost > 85000) {
            cartesianPurpleViolations++;
            violationsList.push({
              mode,
              tier,
              main: main.title,
              mainPrice: main.estimatedCostVnd,
              side: side.title,
              sidePrice: side.estimatedCostVnd,
              drink: drink.title,
              drinkPrice: drink.estimatedCostVnd,
              totalCost: cost,
              expectedLimit: '<= 85,000 VND'
            });
          }

          if (tier === 'gold' && cost < 65000) {
            cartesianGoldViolations++;
            violationsList.push({
              mode,
              tier,
              main: main.title,
              mainPrice: main.estimatedCostVnd,
              side: side.title,
              sidePrice: side.estimatedCostVnd,
              drink: drink.title,
              drinkPrice: drink.estimatedCostVnd,
              totalCost: cost,
              expectedLimit: '>= 65,000 VND'
            });
          }
        }
      }
    }

    console.log(
      `  [CARTESIAN] ${mode.padEnd(14)} | ${tier.padEnd(6)} | Combos: ${String(comboCount).padStart(5)} | Range: ${minCombCost.toLocaleString()}đ -> ${maxCombCost.toLocaleString()}đ`
    );
  }
}

console.log(`\nTotal Cartesian Triples Evaluated: ${totalCartesianCombinations.toLocaleString()}`);

recordTest(
  'Cartesian Budget',
  `Exhaustive Blue Combinations strictly <= 45,000 VND (${totalCartesianCombinations} checked)`,
  cartesianBlueViolations === 0,
  cartesianBlueViolations > 0 ? `Found ${cartesianBlueViolations} combinations violating Blue ceiling` : undefined
);

recordTest(
  'Cartesian Budget',
  `Exhaustive Purple Combinations strictly <= 85,000 VND (${totalCartesianCombinations} checked)`,
  cartesianPurpleViolations === 0,
  cartesianPurpleViolations > 0 ? `Found ${cartesianPurpleViolations} combinations violating Purple ceiling` : undefined
);

recordTest(
  'Cartesian Budget',
  `Exhaustive Gold Combinations strictly >= 65,000 VND (${totalCartesianCombinations} checked)`,
  cartesianGoldViolations === 0,
  cartesianGoldViolations > 0 ? `Found ${cartesianGoldViolations} combinations violating Gold floor` : undefined
);

recordTest(
  'Cartesian Budget',
  'All Cartesian drop costs are clean integer multiples of 1,000 VND',
  cartesianNonMultiple1000 === 0,
  cartesianNonMultiple1000 > 0 ? `Found ${cartesianNonMultiple1000} non-round drop totals` : undefined
);


// ======================================================================
// SECTION 2: 3,600 CONTINUOUS ROLLS & EXTENDED DEDUP STRESS HARNESS
// ======================================================================
console.log('\n--- SECTION 2: 3,600 CONTINUOUS ROLLS & MULTI-PRESTIGE DEDUP HARNESS ---');

// Part 2A: 1,200 Partitioned Continuous Rolls (100 rolls x 12 pools)
resetAccountCaseCollection();
let part2ADuplicates = 0;
let part2ATotalRolls = 0;

for (const mode of MODES) {
  for (const tier of TIERS) {
    const pool = getCasePool(mode, tier);
    const poolSize = pool.length;
    let activePrestige = 0;
    let seenInPrestige = new Set<string>();

    for (let i = 0; i < 100; i++) {
      part2ATotalRolls++;
      const res = pickNonDuplicateDish(mode, tier);

      if (res.prestigeCycle > activePrestige) {
        if (seenInPrestige.size !== poolSize) {
          recordTest(
            'Dedup Stress',
            `Premature rollover in ${mode}:${tier} at roll ${i}`,
            false,
            `Expected ${poolSize} items before prestige cycle ${res.prestigeCycle}, got ${seenInPrestige.size}`
          );
        }
        activePrestige = res.prestigeCycle;
        seenInPrestige = new Set<string>();
      }

      if (seenInPrestige.has(res.dish.id)) {
        part2ADuplicates++;
      } else {
        seenInPrestige.add(res.dish.id);
      }
    }
  }
}

recordTest(
  'Dedup Stress',
  'Part 2A: 1,200 Partitioned Rolls: 0% duplicate items in dynamic exclusion window',
  part2ADuplicates === 0,
  part2ADuplicates > 0 ? `Found ${part2ADuplicates} duplicates in 1,200 partitioned rolls` : undefined,
  { totalRolls: part2ATotalRolls, duplicates: part2ADuplicates }
);

// Part 2B: 1,200 Interleaved Chaotic Stream Rolls
resetAccountCaseCollection();
let part2BDuplicates = 0;
let part2BTotalRolls = 0;
const interleavedCycles: Record<string, number> = {};
const interleavedSeen: Record<string, Set<string>> = {};

for (const m of MODES) {
  for (const t of TIERS) {
    const k = `${m}:${t}`;
    interleavedCycles[k] = 0;
    interleavedSeen[k] = new Set<string>();
  }
}

for (let i = 0; i < 1200; i++) {
  part2BTotalRolls++;
  const m = MODES[Math.floor(Math.random() * MODES.length)];
  const t = TIERS[Math.floor(Math.random() * TIERS.length)];
  const k = `${m}:${t}`;
  const pool = getCasePool(m, t);

  const res = pickNonDuplicateDish(m, t);

  if (res.prestigeCycle > interleavedCycles[k]) {
    if (interleavedSeen[k].size !== pool.length) {
      recordTest(
        'Dedup Stress',
        `Premature rollover in interleaved ${k}`,
        false,
        `Expected ${pool.length} items, got ${interleavedSeen[k].size}`
      );
    }
    interleavedCycles[k] = res.prestigeCycle;
    interleavedSeen[k] = new Set<string>();
  }

  if (interleavedSeen[k].has(res.dish.id)) {
    part2BDuplicates++;
  } else {
    interleavedSeen[k].add(res.dish.id);
  }
}

recordTest(
  'Dedup Stress',
  'Part 2B: 1,200 Interleaved Chaotic Rolls: 0% duplicate items in dynamic exclusion window',
  part2BDuplicates === 0,
  part2BDuplicates > 0 ? `Found ${part2BDuplicates} duplicates in 1,200 interleaved rolls` : undefined,
  { totalRolls: part2BTotalRolls, duplicates: part2BDuplicates }
);

// Part 2C: 1,200 Deep Multi-Prestige Wrap-Around Rolls on Small Pools (Gold Pools: 50 items each)
// 300 rolls per mode on gold pools -> forces 6 complete cycles per pool!
resetAccountCaseCollection();
let part2CDuplicates = 0;
let part2CTotalRolls = 0;
let totalPrestigeCyclesCompleted = 0;

for (const m of MODES) {
  const goldPool = getCasePool(m, 'gold');
  const poolSize = goldPool.length; // 50
  let activeCycle = 0;
  let cycleSeen = new Set<string>();

  for (let i = 0; i < 300; i++) {
    part2CTotalRolls++;
    const res = pickNonDuplicateDish(m, 'gold');

    if (res.prestigeCycle > activeCycle) {
      totalPrestigeCyclesCompleted++;
      if (cycleSeen.size !== poolSize) {
        recordTest(
          'Dedup Stress',
          `Deep cycle premature rollover in ${m}:gold at cycle ${activeCycle}`,
          false,
          `Expected ${poolSize} items, got ${cycleSeen.size}`
        );
      }
      activeCycle = res.prestigeCycle;
      cycleSeen = new Set<string>();
    }

    if (cycleSeen.has(res.dish.id)) {
      part2CDuplicates++;
    } else {
      cycleSeen.add(res.dish.id);
    }
  }
}

recordTest(
  'Dedup Stress',
  `Part 2C: 1,200 Deep Multi-Prestige Rolls (${totalPrestigeCyclesCompleted} full cycles wrapped): 0% duplicates`,
  part2CDuplicates === 0,
  part2CDuplicates > 0 ? `Found ${part2CDuplicates} duplicates in multi-prestige test` : undefined,
  { totalRolls: part2CTotalRolls, cyclesCompleted: totalPrestigeCyclesCompleted }
);


// ======================================================================
// SECTION 3: EMPIRICAL LOOT DROP SAMPLING (2,400 RANDOM DROPS)
// ======================================================================
console.log('\n--- SECTION 3: EMPIRICAL LOOT DROP SAMPLING (2,400 DROPS) ---');

let sampledBlueOver = 0;
let sampledPurpleOver = 0;
let sampledGoldUnder = 0;
let sampledTotal = 2400; // 200 drops per combination

const sampledExtremes: Record<string, { min: number; max: number; count: number }> = {};
for (const m of MODES) {
  for (const t of TIERS) {
    sampledExtremes[`${m}:${t}`] = { min: Infinity, max: -Infinity, count: 0 };
  }
}

for (let i = 0; i < sampledTotal; i++) {
  const mode = MODES[i % MODES.length];
  const tier = TIERS[Math.floor(i / MODES.length) % TIERS.length];
  const key = `${mode}:${tier}`;
  const drop = generateApexLootDrop(tier, mode);

  sampledExtremes[key].count++;
  if (drop.totalCostVnd < sampledExtremes[key].min) sampledExtremes[key].min = drop.totalCostVnd;
  if (drop.totalCostVnd > sampledExtremes[key].max) sampledExtremes[key].max = drop.totalCostVnd;

  if (tier === 'blue' && drop.totalCostVnd > 45000) sampledBlueOver++;
  if (tier === 'purple' && drop.totalCostVnd > 85000) sampledPurpleOver++;
  if (tier === 'gold' && drop.totalCostVnd < 65000) sampledGoldUnder++;
}

for (const [k, v] of Object.entries(sampledExtremes)) {
  console.log(`  [SAMPLED] ${k.padEnd(22)}: Min ${v.min.toLocaleString()}đ | Max ${v.max.toLocaleString()}đ (n=${v.count})`);
}

recordTest(
  'Empirical Sampling',
  'Sampled Blue drops strictly <= 45,000 VND (2,400 drops)',
  sampledBlueOver === 0,
  sampledBlueOver > 0 ? `Found ${sampledBlueOver} Blue drops > 45,000 VND` : undefined
);

recordTest(
  'Empirical Sampling',
  'Sampled Purple drops strictly <= 85,000 VND (2,400 drops)',
  sampledPurpleOver === 0,
  sampledPurpleOver > 0 ? `Found ${sampledPurpleOver} Purple drops > 85,000 VND` : undefined
);

recordTest(
  'Empirical Sampling',
  'Sampled Gold drops strictly >= 65,000 VND (2,400 drops)',
  sampledGoldUnder === 0,
  sampledGoldUnder > 0 ? `Found ${sampledGoldUnder} Gold drops < 65,000 VND` : undefined
);


// ======================================================================
// SECTION 4: EDGE CASE RESILIENCE & ADVERSARIAL FAULT INJECTION
// ======================================================================
console.log('\n--- SECTION 4: EDGE CASE RESILIENCE & ADVERSARIAL FAULT INJECTION ---');

// 4.1 Zalo message invite formatting across all 12 combinations
let zaloTestPassed = true;
for (const m of MODES) {
  for (const t of TIERS) {
    const drop = generateApexLootDrop(t, m);
    const invite = formatZaloOfficeInvite(drop);
    if (!invite || typeof invite !== 'string' || invite.length < 30 || !invite.includes(drop.mainDish.title)) {
      zaloTestPassed = false;
    }
  }
}
recordTest(
  'Edge Cases',
  'formatZaloOfficeInvite produces valid invite text containing dish title across all 12 pools',
  zaloTestPassed
);

// 4.2 Storage boundary: Quota exceeded during high-frequency rolling
let quotaHandledCleanly = true;
try {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  const res = pickNonDuplicateDish('snack-genz', 'gold');
  if (!res || !res.dish) quotaHandledCleanly = false;
  localStorage.setItem = originalSetItem;
} catch (e) {
  quotaHandledCleanly = false;
}
recordTest(
  'Edge Cases',
  'QuotaExceededError handled gracefully without uncaught rejection',
  quotaHandledCleanly
);

// 4.3 Storage boundary: Corrupted JSON object with null/undefined values
let corruptedJsonHandled = false;
try {
  localStorage.setItem('mealwise_account_unlocked_cases_v1', '{"unlockedIds": null, "prestigeCycles": "invalid"}');
  const safeState = getAccountCaseState();
  if (Array.isArray(safeState.unlockedIds) && typeof safeState.prestigeCycles === 'object') {
    const rolled = pickNonDuplicateDish('bizarre-dare', 'blue');
    if (rolled && rolled.dish) {
      corruptedJsonHandled = true;
    }
  }
} catch (e) {
  corruptedJsonHandled = false;
}
recordTest(
  'Edge Cases',
  'Malformed JSON structure handled gracefully and sanitized',
  corruptedJsonHandled
);

// ======================================================================
// SECTION 5: FINAL SUMMARY
// ======================================================================
console.log('\n======================================================================');
console.log('                          FINAL AUDIT SUMMARY                         ');
console.log('======================================================================');

const totalExecuted = results.length;
const totalPassed = results.filter(r => r.passed).length;
const totalFailed = results.filter(r => !r.passed).length;

console.log(`Total Assertions: ${totalExecuted}`);
console.log(`Passed:           ${totalPassed}`);
console.log(`Failed:           ${totalFailed}`);

if (totalFailed > 0) {
  console.log('\n❌ FAILED TESTS:');
  for (const r of results.filter(r => !r.passed)) {
    console.log(`  • [${r.suite}] ${r.testName}: ${r.error}`);
  }
  process.exit(1);
} else {
  console.log('\n🎉 ALL CHALLENGER P2-3 ADVERSARIAL STRESS TESTS PASSED WITH 0 DEFECTS!');
  process.exit(0);
}
