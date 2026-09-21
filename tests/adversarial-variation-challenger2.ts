/**
 * MealWise Adversarial Test Script — Challenger 2 (challenger_variation_2)
 * 
 * Objective:
 * Empirically stress-test PRNG distribution, seed uniqueness, zero over-budget days,
 * and deduplication across 1,000+ rapid consecutive generations.
 * 
 * Test Suites:
 * 1. High-Volume Seed Uniqueness & Collision Resistance (500 rapid consecutive plans under frozen millisecond timestamp)
 * 1B. High-Volume Seedless PRNG Fallback & Multiplier Scrambling (200 rapid consecutive plans)
 * 2. Dish Distribution & Entropy Spread (500 plans, evaluating breakfast, lunch, dinner, and main set variety)
 * 2B. Single-Dish Distribution & Entropy Spread (500 plans under 1P solo dining mode)
 * 3. Monotonic Cost Hierarchy across Household Sizes (1P, 2P, 4P, 6P across all 3 budget tiers, 600 plans)
 * 4. Boundary & Invariant Stress (Zero/extreme seeds, diet switching, 100 plans)
 */

import crypto from 'crypto';
import {
  generateBudgetCompliantWeeklyPlan,
  PlanGeneratorOptions,
  GeneratedDayPlan,
  createPRNG
} from '../src/utils/mealPlanGenerator';
import {
  roundToThousand,
  scaleCost,
  getDailyBudgetTarget,
  DAILY_BUDGET_RATES
} from '../src/utils/currency';
import { mockMealSets } from '../src/data/mockMealSets';
import { mockRecipes } from '../src/data/mockRecipes';
import { Recipe, VietnameseMealSet } from '../src/types';

// ============================================================================
// Test Harness & Telemetry
// ============================================================================

interface AssertionResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  telemetry?: Record<string, any>;
}

const testResults: AssertionResult[] = [];
let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, suite: string, name: string, errorMsg?: string, telemetry?: Record<string, any>) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    testResults.push({ suite, name, passed: true, telemetry });
    console.log(`  ✓ [PASS] [${suite}] ${name}`);
  } else {
    failedAssertions++;
    testResults.push({ suite, name, passed: false, error: errorMsg || 'Assertion failed', telemetry });
    console.error(`  ✗ [FAIL] [${suite}] ${name} -> ${errorMsg || 'Assertion failed'}`);
  }
}

/**
 * Extracts 21 slot dish/set IDs from a 7-day meal plan and computes a cryptographic SHA-256 hash.
 */
function hashPlan(plan: GeneratedDayPlan[]): { hash: string; serialized: string; slotIds: string[] } {
  const slotIds: string[] = [];
  for (const day of plan) {
    slotIds.push(day.meals.breakfast.id);
    slotIds.push(day.meals.lunch.id);
    slotIds.push(day.meals.dinner.id);
  }
  const serialized = slotIds.join('|');
  const hash = crypto.createHash('sha256').update(serialized).digest('hex');
  return { hash, serialized, slotIds };
}

/**
 * Calculates Shannon Entropy H = - sum(p_i * log2(p_i))
 */
function calculateShannonEntropy(frequencies: Record<string, number>, total: number): { entropy: number; normalizedEntropy: number; distinctCount: number } {
  let entropy = 0;
  const keys = Object.keys(frequencies);
  const distinctCount = keys.length;
  if (distinctCount <= 1 || total === 0) {
    return { entropy: 0, normalizedEntropy: 0, distinctCount };
  }

  for (const key of keys) {
    const p = frequencies[key] / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  const maxPossibleEntropy = Math.log2(distinctCount);
  const normalizedEntropy = maxPossibleEntropy > 0 ? entropy / maxPossibleEntropy : 0;
  return { entropy, normalizedEntropy, distinctCount };
}

/**
 * Calculates Gini coefficient of inequality for distribution of counts
 */
function calculateGini(frequencies: Record<string, number>): number {
  const values = Object.values(frequencies).sort((a, b) => a - b);
  const n = values.length;
  if (n === 0) return 0;
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total === 0) return 0;

  let cumulativeSum = 0;
  for (let i = 0; i < n; i++) {
    cumulativeSum += (2 * (i + 1) - n - 1) * values[i];
  }
  return cumulativeSum / (n * total);
}

console.log('\n================================================================================');
console.log('       MEALWISE ADVERSARIAL STRESS TEST HARNESS — CHALLENGER 2         ');
console.log('================================================================================\n');

const suiteStartTimestamp = Date.now();
let totalGenerationsExecuted = 0;

// ============================================================================
// SUITE 1: High-Volume Seed Uniqueness & Collision Resistance (500 Rapid Plans)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('SUITE 1: High-Volume Seed Uniqueness & Collision Resistance (500 Rapid Plans)');
console.log('--------------------------------------------------------------------------------');

{
  const N = 500;
  const frozenTimestamp = Date.now(); // Simulating sub-millisecond clicking loop where Date.now() is identical
  const planHashes = new Set<string>();
  const hashList: string[] = [];
  let overBudgetDaysCount = 0;
  let sameDayDuplicateDays = 0;
  let consecutiveDayDuplicateDays = 0;
  let incompleteDays = 0;
  let novelTransitionsCount = 0;
  let minAlteredSlots = 21;
  let maxAlteredSlots = 0;
  let totalAlteredSlots = 0;

  let lastPlanSlotIds: Record<string, string> = {};

  for (let i = 1; i <= N; i++) {
    // Production seed formula from MealWiseContext: Date.now() ^ (nextCount * 2654435761)
    const seed = (frozenTimestamp ^ (i * 2654435761)) >>> 0;

    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'bac',
      specialNeeds: ['gym-protein'],
      mealFormat: 'meal-set',
      seed,
      variationIndex: i,
      previousPlanSlotIds: lastPlanSlotIds
    });
    totalGenerationsExecuted++;

    // 1. Verify 7 days presence
    if (plan.length !== 7) {
      incompleteDays++;
    }

    // 2. Hash 21 slot IDs
    const { hash, slotIds } = hashPlan(plan);
    planHashes.add(hash);
    hashList.push(hash);

    // 3. Verify invariants across the 7 days
    let prevLunchId = '';
    let prevDinnerId = '';

    for (let dayIdx = 0; dayIdx < plan.length; dayIdx++) {
      const day = plan[dayIdx];
      const ceiling = Math.floor(day.dailyBudgetTarget * 1.05);

      if (day.scaledDayCost > ceiling || day.isOverBudget) {
        overBudgetDaysCount++;
      }

      if (!day.meals.breakfast || !day.meals.lunch || !day.meals.dinner) {
        incompleteDays++;
      }

      // Intra-day deduplication
      if (day.meals.lunch.id === day.meals.dinner.id) {
        sameDayDuplicateDays++;
      }

      // Consecutive-day deduplication
      if (dayIdx > 0) {
        if (day.meals.lunch.id === prevLunchId || day.meals.dinner.id === prevDinnerId) {
          consecutiveDayDuplicateDays++;
        }
      }

      prevLunchId = day.meals.lunch.id;
      prevDinnerId = day.meals.dinner.id;
    }

    // 4. Consecutive variation novelty (compare to previous plan)
    if (i > 1 && Object.keys(lastPlanSlotIds).length === 21) {
      let altered = 0;
      for (const day of plan) {
        if (day.meals.breakfast.id !== lastPlanSlotIds[`${day.dayId}-breakfast`]) altered++;
        if (day.meals.lunch.id !== lastPlanSlotIds[`${day.dayId}-lunch`]) altered++;
        if (day.meals.dinner.id !== lastPlanSlotIds[`${day.dayId}-dinner`]) altered++;
      }
      totalAlteredSlots += altered;
      if (altered < minAlteredSlots) minAlteredSlots = altered;
      if (altered > maxAlteredSlots) maxAlteredSlots = altered;
      if (altered >= 9) { // 9/21 is ceil(21 * 0.40) = 42.8%
        novelTransitionsCount++;
      }
    }

    // Update lastPlanSlotIds for next iteration
    lastPlanSlotIds = {};
    for (const day of plan) {
      lastPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
      lastPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
      lastPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
    }
  }

  const collisionCount = N - planHashes.size;
  const collisionRate = (collisionCount / N) * 100;
  const avgAlteredSlots = totalAlteredSlots / (N - 1);
  const avgAlterationRate = (avgAlteredSlots / 21) * 100;

  console.log(`  Telemetry:`);
  console.log(`    - Generations executed: ${N}`);
  console.log(`    - Unique Plan Hashes: ${planHashes.size} / ${N}`);
  console.log(`    - Hash Collisions: ${collisionCount} (${collisionRate.toFixed(2)}%)`);
  console.log(`    - Over-Budget Days: ${overBudgetDaysCount} / ${N * 7}`);
  console.log(`    - Same-Day Duplicates: ${sameDayDuplicateDays} / ${N * 7}`);
  console.log(`    - Consecutive-Day Duplicates: ${consecutiveDayDuplicateDays} / ${N * 6}`);
  console.log(`    - Novel Transitions (>=40% changed): ${novelTransitionsCount} / ${N - 1} (${((novelTransitionsCount / (N - 1)) * 100).toFixed(1)}%)`);
  console.log(`    - Slot Alterations (min / avg / max): ${minAlteredSlots} / ${avgAlteredSlots.toFixed(1)} / ${maxAlteredSlots} (${avgAlterationRate.toFixed(1)}% avg)`);

  assert(
    planHashes.size === N,
    'SUITE 1',
    'Seed Uniqueness: Exactly 0 collisions across 500 rapid consecutive plans (100% unique)',
    `Observed ${collisionCount} collisions out of ${N} plans`,
    { uniqueHashes: planHashes.size, total: N, collisions: collisionCount }
  );

  assert(
    overBudgetDaysCount === 0,
    'SUITE 1',
    'Zero Over-Budget Days: Exactly 0 days exceeded budget ceiling out of 3,500 days',
    `Observed ${overBudgetDaysCount} over-budget days`,
    { overBudgetDays: overBudgetDaysCount, totalDays: N * 7 }
  );

  assert(
    sameDayDuplicateDays === 0,
    'SUITE 1',
    'Deduplication: Zero same-day lunch === dinner collisions across 3,500 days',
    `Observed ${sameDayDuplicateDays} same-day collisions`,
    { sameDayDuplicates: sameDayDuplicateDays }
  );

  assert(
    consecutiveDayDuplicateDays === 0,
    'SUITE 1',
    'Deduplication: Zero consecutive-day lunch/dinner repetitions across 3,000 day transitions',
    `Observed ${consecutiveDayDuplicateDays} consecutive-day repetitions`,
    { consecutiveDayDuplicates: consecutiveDayDuplicateDays }
  );

  assert(
    novelTransitionsCount === (N - 1),
    'SUITE 1',
    'Novelty Invariant: 100% of consecutive generations alter >= 40% of slots (>= 9 of 21 slots)',
    `Only ${novelTransitionsCount}/${N - 1} transitions altered >= 40%`,
    { novelTransitions: novelTransitionsCount, totalPairs: N - 1, minAlteredSlots, avgAlteredSlots }
  );
}

// ============================================================================
// SUITE 1B: Seedless PRNG Fallback & Multiplier Scrambling (200 Rapid Plans)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('SUITE 1B: Seedless PRNG Fallback & Multiplier Scrambling (200 Rapid Plans)');
console.log('--------------------------------------------------------------------------------');

{
  const N = 200;
  const planHashes = new Set<string>();
  let overBudgetDaysCount = 0;
  let sameDayDuplicates = 0;
  let lastPlanSlotIds: Record<string, string> = {};

  for (let i = 1; i <= N; i++) {
    // Calling generator WITHOUT options.seed to test internal globalCallCounter & fallback multiplier
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 2,
      budgetLevel: 'thoai-mai',
      regionPreference: 'trung',
      specialNeeds: ['eat-clean'],
      mealFormat: 'meal-set',
      variationIndex: i,
      previousPlanSlotIds: lastPlanSlotIds
    });
    totalGenerationsExecuted++;

    const { hash } = hashPlan(plan);
    planHashes.add(hash);

    for (const day of plan) {
      if (day.scaledDayCost > Math.floor(day.dailyBudgetTarget * 1.05) || day.isOverBudget) {
        overBudgetDaysCount++;
      }
      if (day.meals.lunch.id === day.meals.dinner.id) {
        sameDayDuplicates++;
      }
    }

    lastPlanSlotIds = {};
    for (const day of plan) {
      lastPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
      lastPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
      lastPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
    }
  }

  const collisionCount = N - planHashes.size;
  console.log(`  Telemetry:`);
  console.log(`    - Seedless runs executed: ${N}`);
  console.log(`    - Unique Plan Hashes: ${planHashes.size} / ${N}`);
  console.log(`    - Over-Budget Days: ${overBudgetDaysCount} / ${N * 7}`);
  console.log(`    - Same-Day Duplicates: ${sameDayDuplicates} / ${N * 7}`);

  assert(
    planHashes.size === N,
    'SUITE 1B',
    'Seedless Uniqueness: 100% unique plans without explicit seed parameter',
    `Observed ${collisionCount} collisions out of ${N} plans`,
    { uniqueHashes: planHashes.size, total: N }
  );

  assert(
    overBudgetDaysCount === 0,
    'SUITE 1B',
    'Seedless Budget Invariant: 0 over-budget days in seedless generation',
    `Observed ${overBudgetDaysCount} violations`
  );
}

// ============================================================================
// SUITE 2: Dish Distribution & Entropy Spread (Meal-Set Mode, 500 Plans)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('SUITE 2: Dish Distribution & Entropy Spread (Meal-Set Mode, 500 Plans)');
console.log('--------------------------------------------------------------------------------');

{
  const N = 500;
  const bfastFreq: Record<string, number> = {};
  const lunchFreq: Record<string, number> = {};
  const dinnerFreq: Record<string, number> = {};
  const allMainsFreq: Record<string, number> = {};
  let totalBfastSlots = 0;
  let totalLunchSlots = 0;
  let totalDinnerSlots = 0;

  const baseTimestamp = Date.now();
  let lastPlanSlotIds: Record<string, string> = {};

  for (let i = 1; i <= N; i++) {
    const seed = (baseTimestamp ^ (i * 16777619)) >>> 0;
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['gym-protein'],
      mealFormat: 'meal-set',
      seed,
      variationIndex: i,
      previousPlanSlotIds: lastPlanSlotIds
    });
    totalGenerationsExecuted++;

    for (const day of plan) {
      const bId = day.meals.breakfast.id;
      const lId = day.meals.lunch.id;
      const dId = day.meals.dinner.id;

      bfastFreq[bId] = (bfastFreq[bId] || 0) + 1;
      lunchFreq[lId] = (lunchFreq[lId] || 0) + 1;
      dinnerFreq[dId] = (dinnerFreq[dId] || 0) + 1;
      allMainsFreq[lId] = (allMainsFreq[lId] || 0) + 1;
      allMainsFreq[dId] = (allMainsFreq[dId] || 0) + 1;

      totalBfastSlots++;
      totalLunchSlots++;
      totalDinnerSlots++;
    }

    lastPlanSlotIds = {};
    for (const day of plan) {
      lastPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
      lastPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
      lastPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
    }
  }

  // Distribution Metrics
  const bfastEntropy = calculateShannonEntropy(bfastFreq, totalBfastSlots);
  const lunchEntropy = calculateShannonEntropy(lunchFreq, totalLunchSlots);
  const dinnerEntropy = calculateShannonEntropy(dinnerFreq, totalDinnerSlots);
  const mainsEntropy = calculateShannonEntropy(allMainsFreq, totalLunchSlots + totalDinnerSlots);

  const bfastGini = calculateGini(bfastFreq);
  const mainsGini = calculateGini(allMainsFreq);

  const maxBfastCount = Math.max(...Object.values(bfastFreq));
  const maxBfastShare = (maxBfastCount / totalBfastSlots) * 100;
  const topBfastDish = Object.keys(bfastFreq).find(k => bfastFreq[k] === maxBfastCount);

  const maxLunchCount = Math.max(...Object.values(lunchFreq));
  const maxLunchShare = (maxLunchCount / totalLunchSlots) * 100;
  const topLunchDish = Object.keys(lunchFreq).find(k => lunchFreq[k] === maxLunchCount);

  const maxDinnerCount = Math.max(...Object.values(dinnerFreq));
  const maxDinnerShare = (maxDinnerCount / totalDinnerSlots) * 100;
  const topDinnerDish = Object.keys(dinnerFreq).find(k => dinnerFreq[k] === maxDinnerCount);

  const maxMainCount = Math.max(...Object.values(allMainsFreq));
  const maxMainShare = (maxMainCount / (totalLunchSlots + totalDinnerSlots)) * 100;
  const topMainDish = Object.keys(allMainsFreq).find(k => allMainsFreq[k] === maxMainCount);

  console.log(`  Telemetry (Meal-Set Mode, 500 plans = 3,500 days):`);
  console.log(`    - Breakfast:`);
  console.log(`        Distinct Dishes Used: ${bfastEntropy.distinctCount}`);
  console.log(`        Shannon Entropy: ${bfastEntropy.entropy.toFixed(3)} bits (Normalized: ${(bfastEntropy.normalizedEntropy * 100).toFixed(1)}%)`);
  console.log(`        Gini Coefficient: ${bfastGini.toFixed(3)}`);
  console.log(`        Top Dish: "${topBfastDish}" with ${maxBfastCount} / ${totalBfastSlots} (${maxBfastShare.toFixed(2)}%)`);
  console.log(`    - Lunch Sets:`);
  console.log(`        Distinct Sets Used: ${lunchEntropy.distinctCount}`);
  console.log(`        Shannon Entropy: ${lunchEntropy.entropy.toFixed(3)} bits (Normalized: ${(lunchEntropy.normalizedEntropy * 100).toFixed(1)}%)`);
  console.log(`        Top Set: "${topLunchDish}" with ${maxLunchCount} / ${totalLunchSlots} (${maxLunchShare.toFixed(2)}%)`);
  console.log(`    - Dinner Sets:`);
  console.log(`        Distinct Sets Used: ${dinnerEntropy.distinctCount}`);
  console.log(`        Shannon Entropy: ${dinnerEntropy.entropy.toFixed(3)} bits (Normalized: ${(dinnerEntropy.normalizedEntropy * 100).toFixed(1)}%)`);
  console.log(`        Top Set: "${topDinnerDish}" with ${maxDinnerCount} / ${totalDinnerSlots} (${maxDinnerShare.toFixed(2)}%)`);
  console.log(`    - Consolidated Main Sets (Lunch + Dinner):`);
  console.log(`        Distinct Sets: ${mainsEntropy.distinctCount} / ${mockMealSets.length}`);
  console.log(`        Combined Shannon Entropy: ${mainsEntropy.entropy.toFixed(3)} bits (Normalized: ${(mainsEntropy.normalizedEntropy * 100).toFixed(1)}%)`);
  console.log(`        Mains Gini Coefficient: ${mainsGini.toFixed(3)}`);
  console.log(`        Max Single-Set Share: ${maxMainShare.toFixed(2)}% ("${topMainDish}")`);

  // Assertions:
  // 1. No single breakfast dish monopolizes > 30% of breakfast slots
  assert(
    maxBfastShare < 30.0,
    'SUITE 2',
    'No Monopolization (Breakfast): Highest dish share is < 30% of all breakfast slots',
    `Top dish "${topBfastDish}" had ${maxBfastShare.toFixed(2)}% share`,
    { topDish: topBfastDish, share: maxBfastShare, count: maxBfastCount }
  );

  // 2. No single main set monopolizes > 25% of all lunch + dinner slots
  assert(
    maxMainShare < 25.0,
    'SUITE 2',
    'No Monopolization (Mains): Highest meal set share is < 25% of all main meal slots',
    `Top set "${topMainDish}" had ${maxMainShare.toFixed(2)}% share`,
    { topSet: topMainDish, share: maxMainShare, count: maxMainCount }
  );

  // 3. High normalized entropy for mains (> 75%)
  assert(
    mainsEntropy.normalizedEntropy >= 0.75,
    'SUITE 2',
    'High Entropy Spread: Mains normalized entropy is >= 75% of theoretical max',
    `Mains normalized entropy was ${(mainsEntropy.normalizedEntropy * 100).toFixed(1)}%`,
    { normalizedEntropy: mainsEntropy.normalizedEntropy, entropyBits: mainsEntropy.entropy }
  );

  // 4. Low Gini coefficient (< 0.40 indicates equitable distribution without harsh disparities)
  assert(
    mainsGini < 0.45,
    'SUITE 2',
    'Distribution Uniformity: Mains Gini coefficient is < 0.45',
    `Gini was ${mainsGini.toFixed(3)}`,
    { gini: mainsGini }
  );

  // 5. Broad pool coverage: at least 70% of available meal sets are used
  const poolCoverage = (mainsEntropy.distinctCount / mockMealSets.length) * 100;
  assert(
    poolCoverage >= 70.0,
    'SUITE 2',
    'Pool Coverage: At least 70% of candidate meal sets are utilized',
    `Only ${mainsEntropy.distinctCount}/${mockMealSets.length} sets used (${poolCoverage.toFixed(1)}%)`,
    { distinctCount: mainsEntropy.distinctCount, totalSets: mockMealSets.length, coverage: poolCoverage }
  );
}

// ============================================================================
// SUITE 2B: Single-Dish Distribution & Entropy Spread (1P Solo Mode, 500 Plans)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('SUITE 2B: Single-Dish Distribution & Entropy Spread (1P Solo Mode, 500 Plans)');
console.log('--------------------------------------------------------------------------------');

{
  const N = 500;
  const singleDishFreq: Record<string, number> = {};
  let totalSingleSlots = 0;
  let overBudgetCount = 0;
  const planHashes = new Set<string>();

  const baseTimestamp = Date.now();
  let lastPlanSlotIds: Record<string, string> = {};

  for (let i = 1; i <= N; i++) {
    const seed = (baseTimestamp ^ (i * 2654435761)) >>> 0;
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 1,
      budgetLevel: 'vua-phai',
      regionPreference: 'nam',
      specialNeeds: ['eat-clean'],
      mealFormat: 'single-dish',
      seed,
      variationIndex: i,
      previousPlanSlotIds: lastPlanSlotIds
    });
    totalGenerationsExecuted++;

    const { hash } = hashPlan(plan);
    planHashes.add(hash);

    for (const day of plan) {
      if (day.scaledDayCost > Math.floor(day.dailyBudgetTarget * 1.05) || day.isOverBudget) {
        overBudgetCount++;
      }
      const lId = day.meals.lunch.id;
      const dId = day.meals.dinner.id;
      singleDishFreq[lId] = (singleDishFreq[lId] || 0) + 1;
      singleDishFreq[dId] = (singleDishFreq[dId] || 0) + 1;
      totalSingleSlots += 2;
    }

    lastPlanSlotIds = {};
    for (const day of plan) {
      lastPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
      lastPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
      lastPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
    }
  }

  const singleEntropy = calculateShannonEntropy(singleDishFreq, totalSingleSlots);
  const singleGini = calculateGini(singleDishFreq);
  const maxDishCount = Math.max(...Object.values(singleDishFreq));
  const maxDishShare = (maxDishCount / totalSingleSlots) * 100;
  const topDish = Object.keys(singleDishFreq).find(k => singleDishFreq[k] === maxDishCount);

  console.log(`  Telemetry (Single-Dish Mode, 500 plans = 3,500 days = 7,000 main slots):`);
  console.log(`    - Unique Plan Hashes: ${planHashes.size} / ${N}`);
  console.log(`    - Distinct Recipes Used: ${singleEntropy.distinctCount}`);
  console.log(`    - Shannon Entropy: ${singleEntropy.entropy.toFixed(3)} bits (Normalized: ${(singleEntropy.normalizedEntropy * 100).toFixed(1)}%)`);
  console.log(`    - Gini Coefficient: ${singleGini.toFixed(3)}`);
  console.log(`    - Top Single Recipe: "${topDish}" with ${maxDishCount} / ${totalSingleSlots} (${maxDishShare.toFixed(2)}%)`);
  console.log(`    - Over-Budget Days: ${overBudgetCount} / 3,500`);

  assert(
    planHashes.size === N,
    'SUITE 2B',
    'Single-Dish Uniqueness: Exactly 0 collisions across 500 rapid 1P plans (100% unique)',
    `Observed ${N - planHashes.size} collisions`
  );

  assert(
    overBudgetCount === 0,
    'SUITE 2B',
    'Single-Dish Budget Invariant: 0 over-budget days in 1P solo dining',
    `Observed ${overBudgetCount} violations`
  );

  assert(
    maxDishShare < 20.0,
    'SUITE 2B',
    'Single-Dish Variety: No single dish accounts for >= 20% of main slots',
    `Top dish "${topDish}" had ${maxDishShare.toFixed(2)}% share`,
    { topDish, share: maxDishShare }
  );

  assert(
    singleEntropy.normalizedEntropy >= 0.70,
    'SUITE 2B',
    'Single-Dish Entropy: Normalized entropy is >= 70%',
    `Normalized entropy was ${(singleEntropy.normalizedEntropy * 100).toFixed(1)}%`
  );
}

// ============================================================================
// SUITE 3: Monotonic Cost Hierarchy Across Household Sizes (600 Plans)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('SUITE 3: Monotonic Cost Hierarchy Across Household Sizes (600 Plans)');
console.log('--------------------------------------------------------------------------------');

{
  const householdSizes = [1, 2, 4, 6];
  const budgetTiers: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
  const plansPerCombination = 50;

  interface TierMetrics {
    servings: number;
    budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai';
    dailyTarget: number;
    dailyCeiling: number;
    avgScaledDailyCost: number;
    avgScaledWeeklyCost: number;
    minScaledDailyCost: number;
    maxScaledDailyCost: number;
    overBudgetCount: number;
    allVndMultiplesOf1000: boolean;
    budgetUtilizationPct: number;
  }

  const hierarchyResults: Record<number, Record<'tiet-kiem' | 'vua-phai' | 'thoai-mai', TierMetrics>> = {};

  for (const servings of householdSizes) {
    hierarchyResults[servings] = {} as any;

    for (const tier of budgetTiers) {
      const dailyTarget = getDailyBudgetTarget(tier, servings);
      const dailyCeiling = Math.floor(dailyTarget * 1.05);

      let totalScaledCost = 0;
      let minScaled = Infinity;
      let maxScaled = -Infinity;
      let overBudgetCount = 0;
      let allMultiplesOf1000 = true;
      let lastPlanSlotIds: Record<string, string> = {};

      for (let run = 1; run <= plansPerCombination; run++) {
        const seed = (run * 31337 + servings * 101) >>> 0;
        const plan = generateBudgetCompliantWeeklyPlan({
          servings,
          budgetLevel: tier,
          regionPreference: 'toan-quoc',
          specialNeeds: [],
          mealFormat: servings === 1 ? 'meal-set' : undefined,
          seed,
          variationIndex: run,
          previousPlanSlotIds: lastPlanSlotIds
        });
        totalGenerationsExecuted++;

        for (const day of plan) {
          const cost = day.scaledDayCost;
          totalScaledCost += cost;
          if (cost < minScaled) minScaled = cost;
          if (cost > maxScaled) maxScaled = cost;
          if (cost > dailyCeiling || day.isOverBudget) {
            overBudgetCount++;
          }
          if (!Number.isInteger(cost) || cost % 1000 !== 0) {
            allMultiplesOf1000 = false;
          }
        }

        lastPlanSlotIds = {};
        for (const day of plan) {
          lastPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
          lastPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
          lastPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
        }
      }

      const totalDays = plansPerCombination * 7;
      const avgScaledDailyCost = Math.round(totalScaledCost / totalDays);
      const avgScaledWeeklyCost = avgScaledDailyCost * 7;
      const budgetUtilizationPct = (avgScaledDailyCost / dailyTarget) * 100;

      hierarchyResults[servings][tier] = {
        servings,
        budgetLevel: tier,
        dailyTarget,
        dailyCeiling,
        avgScaledDailyCost,
        avgScaledWeeklyCost,
        minScaledDailyCost: minScaled,
        maxScaledDailyCost: maxScaled,
        overBudgetCount,
        allVndMultiplesOf1000: allMultiplesOf1000,
        budgetUtilizationPct
      };
    }
  }

  // Print Formatted Hierarchy Table
  console.log('\n  ================================================================================');
  console.log('  HOUSEHOLD SIZE & BUDGET TIER COST HIERARCHY MATRIX (50 runs / 350 days per cell)');
  console.log('  ================================================================================');
  console.log('  Size | Tier       | Target VND   | Ceiling VND  | Avg Scaled   | Util%   | OverBud | Valid VND');
  console.log('  -----+------------+--------------+--------------+--------------+---------+---------+----------');

  for (const servings of householdSizes) {
    for (const tier of budgetTiers) {
      const m = hierarchyResults[servings][tier];
      const tierLabel = tier === 'tiet-kiem' ? 'Tiết kiệm' : tier === 'vua-phai' ? 'Vừa phải ' : 'Thoải mái';
      console.log(
        `   ${servings}P  | ${tierLabel} | ${m.dailyTarget.toLocaleString('vi-VN').padStart(12)} | ${m.dailyCeiling.toLocaleString('vi-VN').padStart(12)} | ${m.avgScaledDailyCost.toLocaleString('vi-VN').padStart(12)} | ${m.budgetUtilizationPct.toFixed(1).padStart(6)}% | ${m.overBudgetCount.toString().padStart(7)} | ${m.allVndMultiplesOf1000 ? 'YES' : 'NO'}`
      );
    }
    console.log('  -----+------------+--------------+--------------+--------------+---------+---------+----------');
  }

  // Evaluate Monotonic Cost Invariant for each household size:
  // avgCost(thoai-mai) >= avgCost(vua-phai) >= avgCost(tiet-kiem)
  for (const servings of householdSizes) {
    const tietKiem = hierarchyResults[servings]['tiet-kiem'];
    const vuaPhai = hierarchyResults[servings]['vua-phai'];
    const thoaiMai = hierarchyResults[servings]['thoai-mai'];

    const isMonotonic = (thoaiMai.avgScaledDailyCost >= vuaPhai.avgScaledDailyCost) &&
                        (vuaPhai.avgScaledDailyCost >= tietKiem.avgScaledDailyCost);

    const isStrictlyMonotonic = (thoaiMai.avgScaledDailyCost > vuaPhai.avgScaledDailyCost) &&
                                (vuaPhai.avgScaledDailyCost > tietKiem.avgScaledDailyCost);

    assert(
      isMonotonic,
      'SUITE 3',
      `Cost Hierarchy (${servings}P): thoai-mai (${thoaiMai.avgScaledDailyCost.toLocaleString()}) >= vua-phai (${vuaPhai.avgScaledDailyCost.toLocaleString()}) >= tiet-kiem (${tietKiem.avgScaledDailyCost.toLocaleString()})`,
      `Failed hierarchy order for ${servings}P: TK=${tietKiem.avgScaledDailyCost}, VP=${vuaPhai.avgScaledDailyCost}, TM=${thoaiMai.avgScaledDailyCost}`,
      { servings, tietKiem: tietKiem.avgScaledDailyCost, vuaPhai: vuaPhai.avgScaledDailyCost, thoaiMai: thoaiMai.avgScaledDailyCost }
    );

    assert(
      isStrictlyMonotonic,
      'SUITE 3',
      `Strict Differentiation (${servings}P): Premium tier spends strictly more than moderate, which spends strictly more than budget`,
      `Lack of strict differentiation for ${servings}P`,
      { diffTM_VP: thoaiMai.avgScaledDailyCost - vuaPhai.avgScaledDailyCost, diffVP_TK: vuaPhai.avgScaledDailyCost - tietKiem.avgScaledDailyCost }
    );

    // Assert zero over-budget days across all 3 tiers for this size
    const totalOverBudget = tietKiem.overBudgetCount + vuaPhai.overBudgetCount + thoaiMai.overBudgetCount;
    assert(
      totalOverBudget === 0,
      'SUITE 3',
      `Zero Over-Budget Days (${servings}P): 0 violations across 1,050 audited days (350 days x 3 tiers)`,
      `Observed ${totalOverBudget} over-budget days for ${servings}P`,
      { servings, totalOverBudget }
    );

    // Assert clean integer rounding to 1,000 VND
    const allCleanVnd = tietKiem.allVndMultiplesOf1000 && vuaPhai.allVndMultiplesOf1000 && thoaiMai.allVndMultiplesOf1000;
    assert(
      allCleanVnd,
      'SUITE 3',
      `Currency Cleanliness (${servings}P): All scaled costs are integer multiples of 1,000 VND`,
      `Found non-standard VND values in ${servings}P`
    );
  }
}

// ============================================================================
// SUITE 4: Boundary & Invariant Stress (100 Extreme Runs)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('SUITE 4: Boundary & Invariant Stress (100 Extreme Runs)');
console.log('--------------------------------------------------------------------------------');

{
  const extremeSeeds = [
    0,
    1,
    -1,
    Number.MAX_SAFE_INTEGER,
    2147483647,
    -2147483648,
    4294967295,
    'adversarial-string-seed-alpha',
    '🚀🔥_unicode_seed_123',
    ''
  ];

  let boundaryCrashes = 0;
  let boundaryOverBudget = 0;

  for (let idx = 0; idx < extremeSeeds.length; idx++) {
    const testSeed = extremeSeeds[idx];
    try {
      const plan = generateBudgetCompliantWeeklyPlan({
        servings: 4,
        budgetLevel: 'tiet-kiem',
        regionPreference: 'bac',
        specialNeeds: ['chay'],
        mealFormat: 'meal-set',
        seed: testSeed as any,
        variationIndex: idx
      });
      totalGenerationsExecuted++;

      for (const d of plan) {
        if (d.scaledDayCost > Math.floor(d.dailyBudgetTarget * 1.05) || d.isOverBudget) {
          boundaryOverBudget++;
        }
      }
    } catch (err) {
      boundaryCrashes++;
      console.error(`  Crash on seed ${testSeed}:`, err);
    }
  }

  // Rapid dietary switching stress (Chay -> Gym -> Eat Clean -> Chay...)
  const dietRotation: Array<'chay' | 'gym-protein' | 'eat-clean'> = ['chay', 'gym-protein', 'eat-clean'];
  let dietMismatchCount = 0;
  let dietOverBudget = 0;

  for (let step = 0; step < 90; step++) {
    const diet = dietRotation[step % 3];
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 2,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: [diet],
      seed: step * 7919,
      variationIndex: step
    });
    totalGenerationsExecuted++;

    for (const d of plan) {
      if (d.scaledDayCost > Math.floor(d.dailyBudgetTarget * 1.05) || d.isOverBudget) {
        dietOverBudget++;
      }
      if (diet === 'chay') {
        const isBfastChay = d.meals.breakfast.category === 'mon-chay' || d.meals.breakfast.tags?.some(t => t.toLowerCase().includes('chay'));
        const isLunchChay = ('region' in d.meals.lunch && d.meals.lunch.region === 'chay') || d.meals.lunch.tags?.some(t => t.toLowerCase().includes('chay'));
        const isDinnerChay = ('region' in d.meals.dinner && d.meals.dinner.region === 'chay') || d.meals.dinner.tags?.some(t => t.toLowerCase().includes('chay'));
        if (!isBfastChay || !isLunchChay || !isDinnerChay) {
          dietMismatchCount++;
        }
      }
    }
  }

  console.log(`  Telemetry (Boundary & Diet Stress, 100 runs):`);
  console.log(`    - Extreme seed crashes: ${boundaryCrashes} / ${extremeSeeds.length}`);
  console.log(`    - Extreme seed over-budget: ${boundaryOverBudget}`);
  console.log(`    - Dietary mode mismatches: ${dietMismatchCount} / 90 runs`);
  console.log(`    - Dietary switching over-budget: ${dietOverBudget}`);

  assert(
    boundaryCrashes === 0 && boundaryOverBudget === 0,
    'SUITE 4',
    'Extreme Seeds: 0 crashes and 0 budget violations across negative, zero, max-integer, and unicode seeds',
    `Observed crashes=${boundaryCrashes}, overBudget=${boundaryOverBudget}`
  );

  assert(
    dietMismatchCount === 0 && dietOverBudget === 0,
    'SUITE 4',
    'Dietary Mode Fidelity: 100% adherence under rapid alternating dietary switches (Chay/Gym/Clean)',
    `Observed dietMismatches=${dietMismatchCount}, overBudget=${dietOverBudget}`
  );
}

// ============================================================================
// Consolidated Summary & Verdict
// ============================================================================
const suiteDurationMs = Date.now() - suiteStartTimestamp;

console.log('\n================================================================================');
console.log('       CONSOLIDATED ADVERSARIAL STRESS TEST RESULTS & TELEMETRY         ');
console.log('================================================================================\n');
console.log(`  - Total Weekly Generations Executed: ${totalGenerationsExecuted.toLocaleString()}`);
console.log(`  - Total Days Audited: ${(totalGenerationsExecuted * 7).toLocaleString()}`);
console.log(`  - Total Meal Slots Audited: ${(totalGenerationsExecuted * 21).toLocaleString()}`);
console.log(`  - Total Assertions: ${totalAssertions}`);
console.log(`  - Passed Assertions: ${passedAssertions}`);
console.log(`  - Failed Assertions: ${failedAssertions}`);
console.log(`  - Execution Wall-Clock Duration: ${(suiteDurationMs / 1000).toFixed(2)}s`);
console.log(`  - Average Throughput: ${(totalGenerationsExecuted / (suiteDurationMs / 1000)).toFixed(0)} generations/second\n`);

if (failedAssertions === 0) {
  console.log('  ======================================================================');
  console.log('  >>> EMPIRICAL VERDICT: ALL ASSERTIONS PASSED (STATUS: APPROVE) <<<');
  console.log('  ======================================================================\n');
  process.exit(0);
} else {
  console.error('  ======================================================================');
  console.error(`  >>> EMPIRICAL VERDICT: ${failedAssertions} FAILURES (STATUS: REQUEST_CHANGES) <<<`);
  console.error('  ======================================================================\n');
  process.exit(1);
}
