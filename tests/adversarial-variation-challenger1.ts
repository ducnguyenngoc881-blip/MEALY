/**
 * Standalone Adversarial Verification & Stress Harness: Stochastic Knapsack Variation (Challenger 1)
 * 
 * Target: src/utils/mealPlanGenerator.ts, src/context/MealWiseContext.tsx
 * 
 * Verification Objectives:
 * 1. Suite 1: Consecutive Novelty & Slot Alteration Stress
 *    - Simulate 20 consecutive clicks on "Gợi Ý 1-Click Cả Tuần" across household sizes (1P-single, 1P-mealset, 2P, 4P, 6P) and budget tiers.
 *    - Measure slot change percentage between every run k and run k-1.
 *    - Assert 100% of consecutive runs alter >= 40% of slots (>= 9 of 21 slots) and 0% of consecutive runs are identical.
 * 2. Suite 2: Budget Ceiling Invariant Stress
 *    - Assert 100% of days satisfy scaledDayCost <= dailyBudgetTarget * 1.05 and isOverBudget === false.
 *    - Assert clean integer VND currency rounding (% 1,000 === 0).
 * 3. Suite 3: Deduplication Stress
 *    - Assert lunch !== dinner intra-day on every day.
 *    - Assert lunch !== prevLunch and dinner !== prevDinner on consecutive days.
 * 4. Suite 4: Extreme Dietary & Regional Constraints Stress
 *    - Stress tight candidate pools (Chay on Tiết Kiệm, Gym-Protein on Thoải Mái, regional Bắc/Trung/Nam) across 20 consecutive clicks.
 * 5. Suite 5: Extended Marathon & Unseeded Robustness Stress
 *    - 30-iteration consecutive click marathon on 4P Standard Family to detect novelty decay or cyclic attractors.
 *    - Headcount boundary sweeps (1, 2, 3, 5, 8, 10, 20 persons).
 *    - Unseeded consecutive clicks relying on PRNG fallback entropy.
 */

import {
  generateBudgetCompliantWeeklyPlan,
  PlanGeneratorOptions,
  GeneratedDayPlan
} from '../src/utils/mealPlanGenerator';
import { getDailyBudgetTarget } from '../src/utils/currency';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
  details?: Record<string, any>;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, message: string, details?: Record<string, any>) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  [PASS] [${suite}] ${name}`);
  } else {
    results.push({ suite, name, passed: false, message, details });
    console.error(`  [FAIL] [${suite}] ${name}: ${message}`);
  }
}

function extractSlotMap(plan: GeneratedDayPlan[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const day of plan) {
    if (day.meals.breakfast?.id) map[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
    if (day.meals.lunch?.id) map[`${day.dayId}-lunch`] = day.meals.lunch.id;
    if (day.meals.dinner?.id) map[`${day.dayId}-dinner`] = day.meals.dinner.id;
  }
  return map;
}

function comparePlans(planA: GeneratedDayPlan[], planB: GeneratedDayPlan[]) {
  let alteredSlots = 0;
  const totalSlots = 21;
  const differences: string[] = [];

  for (let d = 0; d < 7; d++) {
    const dayA = planA[d];
    const dayB = planB[d];
    const dayId = dayA.dayId;

    if (dayA.meals.breakfast.id !== dayB.meals.breakfast.id) {
      alteredSlots++;
      differences.push(`${dayId}-breakfast: ${dayA.meals.breakfast.id} -> ${dayB.meals.breakfast.id}`);
    }
    if (dayA.meals.lunch.id !== dayB.meals.lunch.id) {
      alteredSlots++;
      differences.push(`${dayId}-lunch: ${dayA.meals.lunch.id} -> ${dayB.meals.lunch.id}`);
    }
    if (dayA.meals.dinner.id !== dayB.meals.dinner.id) {
      alteredSlots++;
      differences.push(`${dayId}-dinner: ${dayA.meals.dinner.id} -> ${dayB.meals.dinner.id}`);
    }
  }

  const rate = alteredSlots / totalSlots;
  return {
    alteredSlots,
    totalSlots,
    rate,
    isDistinct: alteredSlots > 0,
    differences
  };
}

async function runAdversarialVariationHarness() {
  console.log('================================================================================');
  console.log('MEALWISE ADVERSARIAL VARIATION & BUDGET INVARIANCE STRESS HARNESS (CHALLENGER 1)');
  console.log('Timestamp: ' + new Date().toISOString());
  console.log('================================================================================\n');

  const startTime = Date.now();

  // ============================================================================
  // SUITE 1: Consecutive Novelty & Slot Alteration Stress (20 Clicks per Config)
  // ============================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log('SUITE 1: Consecutive Novelty & Slot Alteration Stress (20 Clicks per Config)');
  console.log('--------------------------------------------------------------------------------');

  const householdConfigs: Array<{ label: string; servings: number; mealFormat: 'single-dish' | 'meal-set' }> = [
    { label: '1P-SingleDish', servings: 1, mealFormat: 'single-dish' },
    { label: '1P-MealSet', servings: 1, mealFormat: 'meal-set' },
    { label: '2P-MealSet', servings: 2, mealFormat: 'meal-set' },
    { label: '4P-MealSet', servings: 4, mealFormat: 'meal-set' },
    { label: '6P-MealSet', servings: 6, mealFormat: 'meal-set' }
  ];

  const budgetTiers: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];

  let totalSimulatedClicks = 0;
  let totalConsecutivePairsS1 = 0;
  let pairsMeeting40PercentS1 = 0;
  let identicalPairsS1 = 0;
  let minAlterationObservedS1 = 1.0;
  let maxAlterationObservedS1 = 0.0;
  let cumulativeAlterationRateS1 = 0.0;

  // Track all generated plans across all configs for Suite 2 & 3 audits
  interface PlanRecord {
    configLabel: string;
    budgetTier: string;
    servings: number;
    clickIndex: number;
    plan: GeneratedDayPlan[];
  }
  const allGeneratedPlans: PlanRecord[] = [];

  for (const h of householdConfigs) {
    for (const b of budgetTiers) {
      const configId = `${h.label}-${b}`;
      let prevPlan: GeneratedDayPlan[] | null = null;
      let prevSlotMap: Record<string, string> = {};
      let configMinAlteration = 1.0;
      let configIdenticalCount = 0;
      let configSub40Count = 0;

      for (let click = 0; click < 20; click++) {
        totalSimulatedClicks++;
        const nextCount = click + 1;
        // Replicate dynamic seed generation from MealWiseContext: Date.now() ^ (nextCount * 2654435761)
        const dynamicSeed = (Date.now() + click * 31) ^ (nextCount * 2654435761);

        const options: PlanGeneratorOptions = {
          servings: h.servings,
          budgetLevel: b,
          regionPreference: 'toan-quoc',
          mealFormat: h.mealFormat,
          variationIndex: nextCount,
          seed: dynamicSeed,
          previousPlanSlotIds: prevSlotMap
        };

        const plan = generateBudgetCompliantWeeklyPlan(options);
        allGeneratedPlans.push({
          configLabel: h.label,
          budgetTier: b,
          servings: h.servings,
          clickIndex: click,
          plan
        });

        if (prevPlan) {
          totalConsecutivePairsS1++;
          const diff = comparePlans(plan, prevPlan);

          if (!diff.isDistinct) {
            identicalPairsS1++;
            configIdenticalCount++;
          }
          if (diff.rate >= 0.40) {
            pairsMeeting40PercentS1++;
          } else {
            configSub40Count++;
          }

          if (diff.rate < minAlterationObservedS1) minAlterationObservedS1 = diff.rate;
          if (diff.rate > maxAlterationObservedS1) maxAlterationObservedS1 = diff.rate;
          if (diff.rate < configMinAlteration) configMinAlteration = diff.rate;
          cumulativeAlterationRateS1 += diff.rate;
        }

        prevPlan = plan;
        prevSlotMap = extractSlotMap(plan);
      }

      assert(
        configIdenticalCount === 0,
        'Suite 1',
        `${configId}: Zero identical consecutive plans across 20 clicks`,
        `Observed ${configIdenticalCount} identical plans`,
        { configId, identicalCount: configIdenticalCount }
      );

      assert(
        configSub40Count === 0,
        'Suite 1',
        `${configId}: 100% of consecutive pairs alter >= 40% slots (min: ${(configMinAlteration * 100).toFixed(1)}%)`,
        `Observed ${configSub40Count} pairs altering < 40% of slots`,
        { configId, minAlteration: configMinAlteration }
      );
    }
  }

  const avgAlterationRateS1 = cumulativeAlterationRateS1 / totalConsecutivePairsS1;
  const passRate40PercentS1 = (pairsMeeting40PercentS1 / totalConsecutivePairsS1) * 100;

  console.log(`\n  >> Suite 1 Telemetry:`);
  console.log(`     Total Configurations Tested: ${householdConfigs.length * budgetTiers.length} (5 formats x 3 tiers)`);
  console.log(`     Total 1-Click Generations: ${totalSimulatedClicks} weekly plans`);
  console.log(`     Total Consecutive Pairs Evaluated: ${totalConsecutivePairsS1}`);
  console.log(`     Identical Consecutive Runs: ${identicalPairsS1} (0.00%)`);
  console.log(`     Pairs Altering >= 40% Slots: ${pairsMeeting40PercentS1} / ${totalConsecutivePairsS1} (${passRate40PercentS1.toFixed(2)}%)`);
  console.log(`     Min Alteration Observed: ${(minAlterationObservedS1 * 100).toFixed(1)}% (${Math.round(minAlterationObservedS1 * 21)}/21 slots)`);
  console.log(`     Max Alteration Observed: ${(maxAlterationObservedS1 * 100).toFixed(1)}% (${Math.round(maxAlterationObservedS1 * 21)}/21 slots)`);
  console.log(`     Average Alteration Rate: ${(avgAlterationRateS1 * 100).toFixed(1)}% (${(avgAlterationRateS1 * 21).toFixed(1)}/21 slots)`);

  assert(
    passRate40PercentS1 === 100,
    'Suite 1',
    'GLOBAL INVARIANT: 100% of consecutive runs alter >= 40% of slots (>= 9 of 21 slots)',
    `Actual pass rate: ${passRate40PercentS1.toFixed(2)}%`,
    { pairsMeeting40PercentS1, totalConsecutivePairsS1, minAlterationObservedS1 }
  );

  assert(
    identicalPairsS1 === 0,
    'Suite 1',
    'GLOBAL INVARIANT: 0% of consecutive runs are identical across 20-click simulations',
    `Found ${identicalPairsS1} identical pairs`,
    { identicalPairsS1 }
  );

  // ============================================================================
  // SUITE 2: Budget Ceiling Invariant Stress
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 2: Budget Ceiling Invariant Stress across all Generated Plans');
  console.log('--------------------------------------------------------------------------------');

  let totalDaysAuditedS2 = 0;
  let ceilingViolationsS2 = 0;
  let isOverBudgetFlagViolationsS2 = 0;
  let currencyIntegerViolationsS2 = 0;
  let maxUtilizationS2 = 0;
  let minUtilizationS2 = 2.0;
  let sumUtilizationS2 = 0;

  for (const record of allGeneratedPlans) {
    const expectedDailyTarget = getDailyBudgetTarget(record.budgetTier as any, record.servings);
    const maxAllowedCeiling = Math.floor(expectedDailyTarget * 1.05);

    for (const day of record.plan) {
      totalDaysAuditedS2++;

      // Invariant: scaledDayCost <= dailyBudgetTarget * 1.05
      if (day.scaledDayCost > maxAllowedCeiling) {
        ceilingViolationsS2++;
        console.error(`  [CEILING VIOLATION] ${record.configLabel} ${record.budgetTier} Run ${record.clickIndex} Day ${day.dayId}: Cost ${day.scaledDayCost} > Ceiling ${maxAllowedCeiling}`);
      }

      // Invariant: isOverBudget === false
      if (day.isOverBudget !== false) {
        isOverBudgetFlagViolationsS2++;
      }

      // Invariant: Clean VND integer divisible by 1,000
      if (!Number.isInteger(day.scaledDayCost) || day.scaledDayCost % 1000 !== 0) {
        currencyIntegerViolationsS2++;
      }

      const utilization = day.scaledDayCost / expectedDailyTarget;
      if (utilization > maxUtilizationS2) maxUtilizationS2 = utilization;
      if (utilization < minUtilizationS2) minUtilizationS2 = utilization;
      sumUtilizationS2 += utilization;
    }
  }

  const avgUtilizationS2 = sumUtilizationS2 / totalDaysAuditedS2;

  console.log(`  >> Suite 2 Telemetry:`);
  console.log(`     Total Daily Plans Audited: ${totalDaysAuditedS2} days`);
  console.log(`     Over-Budget Violations (> 105% Target): ${ceilingViolationsS2}`);
  console.log(`     isOverBudget === true Flag Count: ${isOverBudgetFlagViolationsS2}`);
  console.log(`     Currency Integer Leaks (% 1000 != 0): ${currencyIntegerViolationsS2}`);
  console.log(`     Min Budget Utilization Ratio: ${(minUtilizationS2 * 100).toFixed(1)}%`);
  console.log(`     Avg Budget Utilization Ratio: ${(avgUtilizationS2 * 100).toFixed(1)}%`);
  console.log(`     Max Budget Utilization Ratio: ${(maxUtilizationS2 * 100).toFixed(1)}% (Ceiling: 105.0%)`);

  assert(
    ceilingViolationsS2 === 0,
    'Suite 2',
    'BUDGET CEILING: 100% of days satisfy scaledDayCost <= dailyBudgetTarget * 1.05',
    `Found ${ceilingViolationsS2} ceiling violations`,
    { ceilingViolationsS2, totalDaysAuditedS2 }
  );

  assert(
    isOverBudgetFlagViolationsS2 === 0,
    'Suite 2',
    'BUDGET FLAG: 100% of days have isOverBudget === false',
    `Found ${isOverBudgetFlagViolationsS2} days flagged over-budget`,
    { isOverBudgetFlagViolationsS2 }
  );

  assert(
    currencyIntegerViolationsS2 === 0,
    'Suite 2',
    'CURRENCY INTEGRITY: 100% of scaled day costs are clean integer multiples of 1,000 VND',
    `Found ${currencyIntegerViolationsS2} currency format violations`,
    { currencyIntegerViolationsS2 }
  );

  // ============================================================================
  // SUITE 3: Deduplication Stress (Intra-Day & Consecutive Days)
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 3: Deduplication Stress (Intra-Day & Consecutive Days)');
  console.log('--------------------------------------------------------------------------------');

  let totalSameDayDuplicates = 0;
  let totalConsecutiveLunchDuplicates = 0;
  let totalConsecutiveDinnerDuplicates = 0;
  let totalIncompleteMeals = 0;

  for (const record of allGeneratedPlans) {
    for (let d = 0; d < record.plan.length; d++) {
      const day = record.plan[d];

      // Meal completeness
      if (!day.meals.breakfast?.id || !day.meals.lunch?.id || !day.meals.dinner?.id) {
        totalIncompleteMeals++;
      }

      // Intra-day deduplication: lunch !== dinner
      if (day.meals.lunch.id === day.meals.dinner.id) {
        totalSameDayDuplicates++;
        console.error(`  [INTRA-DAY DUPLICATE] ${record.configLabel} ${record.budgetTier} Run ${record.clickIndex} Day ${day.dayId}: Lunch == Dinner == ${day.meals.lunch.id}`);
      }

      // Consecutive day deduplication: lunch !== prevLunch, dinner !== prevDinner
      if (d > 0) {
        const prevDay = record.plan[d - 1];
        if (day.meals.lunch.id === prevDay.meals.lunch.id) {
          totalConsecutiveLunchDuplicates++;
          console.error(`  [CONSECUTIVE LUNCH DUPLICATE] ${record.configLabel} ${record.budgetTier} Run ${record.clickIndex} Day ${day.dayId}: repeats ${prevDay.dayId} lunch (${day.meals.lunch.id})`);
        }
        if (day.meals.dinner.id === prevDay.meals.dinner.id) {
          totalConsecutiveDinnerDuplicates++;
          console.error(`  [CONSECUTIVE DINNER DUPLICATE] ${record.configLabel} ${record.budgetTier} Run ${record.clickIndex} Day ${day.dayId}: repeats ${prevDay.dayId} dinner (${day.meals.dinner.id})`);
        }
      }
    }
  }

  console.log(`  >> Suite 3 Telemetry:`);
  console.log(`     Total Days Evaluated for Variety: ${totalDaysAuditedS2}`);
  console.log(`     Incomplete Meal Slots (null/missing): ${totalIncompleteMeals}`);
  console.log(`     Intra-Day Duplicates (Lunch == Dinner): ${totalSameDayDuplicates}`);
  console.log(`     Consecutive Lunch Duplicates (Day[d] == Day[d-1]): ${totalConsecutiveLunchDuplicates}`);
  console.log(`     Consecutive Dinner Duplicates (Day[d] == Day[d-1]): ${totalConsecutiveDinnerDuplicates}`);

  assert(
    totalIncompleteMeals === 0,
    'Suite 3',
    'MEAL COMPLETENESS: 100% of meal slots (breakfast, lunch, dinner) are fully populated',
    `Found ${totalIncompleteMeals} incomplete meal slots`,
    { totalIncompleteMeals }
  );

  assert(
    totalSameDayDuplicates === 0,
    'Suite 3',
    'DEDUPLICATION: lunch !== dinner on 100% of days',
    `Found ${totalSameDayDuplicates} intra-day duplicates`,
    { totalSameDayDuplicates }
  );

  assert(
    totalConsecutiveLunchDuplicates === 0,
    'Suite 3',
    'DEDUPLICATION: lunch !== prevLunch on 100% of consecutive days',
    `Found ${totalConsecutiveLunchDuplicates} consecutive lunch duplicates`,
    { totalConsecutiveLunchDuplicates }
  );

  assert(
    totalConsecutiveDinnerDuplicates === 0,
    'Suite 3',
    'DEDUPLICATION: dinner !== prevDinner on 100% of consecutive days',
    `Found ${totalConsecutiveDinnerDuplicates} consecutive dinner duplicates`,
    { totalConsecutiveDinnerDuplicates }
  );

  // ============================================================================
  // SUITE 4: Extreme Dietary & Regional Constraints Stress
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 4: Extreme Dietary & Regional Constraints Stress (20 Clicks per Constrained Pool)');
  console.log('--------------------------------------------------------------------------------');

  const extremeConfigs: Array<{
    label: string;
    servings: number;
    budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai';
    region: 'bac' | 'trung' | 'nam' | 'toan-quoc';
    specialNeeds: string[];
    mealFormat: 'single-dish' | 'meal-set';
  }> = [
    // Strictest vegetarian pool on lowest budget tier
    { label: 'Chay-1P-TietKiem-Single', servings: 1, budgetLevel: 'tiet-kiem', region: 'toan-quoc', specialNeeds: ['chay'], mealFormat: 'single-dish' },
    { label: 'Chay-2P-TietKiem-MealSet', servings: 2, budgetLevel: 'tiet-kiem', region: 'toan-quoc', specialNeeds: ['chay'], mealFormat: 'meal-set' },
    { label: 'Chay-4P-TietKiem-MealSet', servings: 4, budgetLevel: 'tiet-kiem', region: 'toan-quoc', specialNeeds: ['chay'], mealFormat: 'meal-set' },
    // Gym high-protein on luxury budget
    { label: 'Gym-4P-ThoaiMai-MealSet', servings: 4, budgetLevel: 'thoai-mai', region: 'toan-quoc', specialNeeds: ['gym-protein'], mealFormat: 'meal-set' },
    { label: 'Gym-6P-ThoaiMai-MealSet', servings: 6, budgetLevel: 'thoai-mai', region: 'toan-quoc', specialNeeds: ['gym-protein'], mealFormat: 'meal-set' },
    // Eat Clean on medium budget
    { label: 'Clean-2P-VuaPhai-MealSet', servings: 2, budgetLevel: 'vua-phai', region: 'toan-quoc', specialNeeds: ['eat-clean'], mealFormat: 'meal-set' },
    // Specific regional preferences under tight budget
    { label: 'Bac-4P-TietKiem-MealSet', servings: 4, budgetLevel: 'tiet-kiem', region: 'bac', specialNeeds: [], mealFormat: 'meal-set' },
    { label: 'Trung-4P-TietKiem-MealSet', servings: 4, budgetLevel: 'tiet-kiem', region: 'trung', specialNeeds: [], mealFormat: 'meal-set' },
    { label: 'Nam-4P-TietKiem-MealSet', servings: 4, budgetLevel: 'tiet-kiem', region: 'nam', specialNeeds: [], mealFormat: 'meal-set' }
  ];

  let extremePairsTotal = 0;
  let extremePairsSub40 = 0;
  let extremePairsIdentical = 0;
  let extremeCeilingViolations = 0;
  let extremeSameDayDuplicates = 0;

  for (const ec of extremeConfigs) {
    let prevPlan: GeneratedDayPlan[] | null = null;
    let prevSlotMap: Record<string, string> = {};
    let minDiff = 1.0;

    for (let click = 0; click < 20; click++) {
      const nextCount = click + 1;
      const dynamicSeed = (Date.now() + click * 43) ^ (nextCount * 2654435761);

      const options: PlanGeneratorOptions = {
        servings: ec.servings,
        budgetLevel: ec.budgetLevel,
        regionPreference: ec.region,
        specialNeeds: ec.specialNeeds,
        mealFormat: ec.mealFormat,
        variationIndex: nextCount,
        seed: dynamicSeed,
        previousPlanSlotIds: prevSlotMap
      };

      const plan = generateBudgetCompliantWeeklyPlan(options);
      const expectedTarget = getDailyBudgetTarget(ec.budgetLevel, ec.servings);
      const ceiling = Math.floor(expectedTarget * 1.05);

      for (const day of plan) {
        if (day.scaledDayCost > ceiling) extremeCeilingViolations++;
        if (day.meals.lunch.id === day.meals.dinner.id) extremeSameDayDuplicates++;
      }

      if (prevPlan) {
        extremePairsTotal++;
        const diff = comparePlans(plan, prevPlan);
        if (!diff.isDistinct) extremePairsIdentical++;
        if (diff.rate < 0.40) extremePairsSub40++;
        if (diff.rate < minDiff) minDiff = diff.rate;
      }

      prevPlan = plan;
      prevSlotMap = extractSlotMap(plan);
    }

    assert(
      minDiff >= 0.40,
      'Suite 4',
      `${ec.label}: Constrained pool maintained >= 40% alteration across 20 clicks (min: ${(minDiff * 100).toFixed(1)}%)`,
      `Min alteration fell to ${(minDiff * 100).toFixed(1)}%`,
      { label: ec.label, minDiff }
    );
  }

  console.log(`  >> Suite 4 Telemetry:`);
  console.log(`     Constrained Pool Scenarios Tested: ${extremeConfigs.length}`);
  console.log(`     Total Constrained Pairs: ${extremePairsTotal}`);
  console.log(`     Identical Consecutive Runs: ${extremePairsIdentical}`);
  console.log(`     Pairs Altering < 40% Slots: ${extremePairsSub40}`);
  console.log(`     Budget Ceiling Violations: ${extremeCeilingViolations}`);
  console.log(`     Same-Day Duplicates: ${extremeSameDayDuplicates}`);

  assert(
    extremePairsIdentical === 0 && extremePairsSub40 === 0 && extremeCeilingViolations === 0 && extremeSameDayDuplicates === 0,
    'Suite 4',
    'CONSTRAINED POOL COMPLIANCE: 100% variation and budget invariance maintained in tight pools',
    'Found defects in constrained pools',
    { extremePairsIdentical, extremePairsSub40, extremeCeilingViolations }
  );

  // ============================================================================
  // SUITE 5: Extended Marathon & Unseeded Robustness Stress
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 5: Extended Marathon (30 Clicks) & Unseeded Dynamic Entropy');
  console.log('--------------------------------------------------------------------------------');

  // Test 5.1: 30-click marathon on 4-person family Vừa Phải
  console.log('  Testing 30-Click Marathon on 4P Standard Family (Vừa Phải)...');
  let marathonPrevPlan: GeneratedDayPlan[] | null = null;
  let marathonPrevSlotMap: Record<string, string> = {};
  let marathonIdentical = 0;
  let marathonSub40 = 0;
  let marathonMinRate = 1.0;
  const marathonRates: number[] = [];

  for (let click = 0; click < 30; click++) {
    const nextCount = click + 1;
    const dynamicSeed = (Date.now() + click * 13) ^ (nextCount * 2654435761);

    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      variationIndex: nextCount,
      seed: dynamicSeed,
      previousPlanSlotIds: marathonPrevSlotMap
    });

    if (marathonPrevPlan) {
      const diff = comparePlans(plan, marathonPrevPlan);
      marathonRates.push(diff.rate);
      if (!diff.isDistinct) marathonIdentical++;
      if (diff.rate < 0.40) marathonSub40++;
      if (diff.rate < marathonMinRate) marathonMinRate = diff.rate;
    }

    marathonPrevPlan = plan;
    marathonPrevSlotMap = extractSlotMap(plan);
  }

  const marathonAvgRate = marathonRates.reduce((a, b) => a + b, 0) / marathonRates.length;

  assert(
    marathonIdentical === 0 && marathonSub40 === 0,
    'Suite 5',
    `30-Click Marathon: Zero decay across 29 consecutive pairs (min: ${(marathonMinRate * 100).toFixed(1)}%, avg: ${(marathonAvgRate * 100).toFixed(1)}%)`,
    `Marathon failed with ${marathonSub40} sub-40% pairs`,
    { marathonSub40, marathonMinRate, marathonAvgRate }
  );

  // Test 5.2: Unseeded Consecutive Clicks (relying entirely on internal clock entropy & iteration counter)
  console.log('  Testing Unseeded Consecutive Clicks (Internal PRNG entropy)...');
  let unseededPrevPlan: GeneratedDayPlan[] | null = null;
  let unseededPrevSlotMap: Record<string, string> = {};
  let unseededSub40 = 0;
  let unseededIdentical = 0;

  for (let click = 0; click < 15; click++) {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'thoai-mai',
      regionPreference: 'toan-quoc',
      variationIndex: click + 1,
      // seed omitted intentionally
      previousPlanSlotIds: unseededPrevSlotMap
    });

    if (unseededPrevPlan) {
      const diff = comparePlans(plan, unseededPrevPlan);
      if (!diff.isDistinct) unseededIdentical++;
      if (diff.rate < 0.40) unseededSub40++;
    }

    unseededPrevPlan = plan;
    unseededPrevSlotMap = extractSlotMap(plan);
  }

  assert(
    unseededIdentical === 0 && unseededSub40 === 0,
    'Suite 5',
    'Unseeded Entropy: 15 consecutive clicks without explicit seed maintain >= 40% alteration',
    `Unseeded run had ${unseededSub40} sub-40% pairs and ${unseededIdentical} identical pairs`,
    { unseededSub40, unseededIdentical }
  );

  // Test 5.3: Boundary Headcounts (1, 2, 3, 5, 8, 10, 20 persons)
  console.log('  Testing Boundary Headcounts (1, 2, 3, 5, 8, 10, 20)...');
  const headcounts = [1, 2, 3, 5, 8, 10, 20];
  let headcountFailures = 0;

  for (const hc of headcounts) {
    const planA = generateBudgetCompliantWeeklyPlan({
      servings: hc,
      budgetLevel: 'vua-phai',
      variationIndex: 1,
      seed: 101
    });
    const planB = generateBudgetCompliantWeeklyPlan({
      servings: hc,
      budgetLevel: 'vua-phai',
      variationIndex: 2,
      seed: 202,
      previousPlanSlotIds: extractSlotMap(planA)
    });

    const diff = comparePlans(planB, planA);
    const target = getDailyBudgetTarget('vua-phai', hc);
    const ceiling = Math.floor(target * 1.05);

    const hasOverBudget = planB.some(d => d.scaledDayCost > ceiling || d.isOverBudget);
    if (diff.rate < 0.40 || hasOverBudget) {
      headcountFailures++;
      console.error(`  [HEADCOUNT FAILURE] Servings = ${hc}: diff = ${(diff.rate * 100).toFixed(1)}%, overBudget = ${hasOverBudget}`);
    }
  }

  assert(
    headcountFailures === 0,
    'Suite 5',
    'Boundary Headcounts: Servings [1, 2, 3, 5, 8, 10, 20] satisfy both >= 40% alteration & budget ceiling',
    `Found ${headcountFailures} boundary headcount failures`,
    { headcountFailures }
  );

  // ============================================================================
  // FINAL HARNESS VERDICT & SUMMARY
  // ============================================================================
  const elapsedMs = Date.now() - startTime;
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  console.log('\n================================================================================');
  console.log('ADVERSARIAL CHALLENGER 1 EXECUTION SUMMARY');
  console.log('================================================================================');
  console.log(`Total Assertions Executed: ${totalTests}`);
  console.log(`Assertions Passed: ${passedTests}`);
  console.log(`Assertions Failed: ${failedTests}`);
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`Total Wall-Clock Runtime: ${(elapsedMs / 1000).toFixed(3)}s`);
  console.log('================================================================================');

  if (failedTests > 0) {
    console.error('\n❌ CHALLENGER 1 VERDICT: REQUEST_CHANGES (Failures detected)');
    process.exit(1);
  } else {
    console.log('\n✅ CHALLENGER 1 VERDICT: APPROVE (100% Invariants rigorously verified)');
    process.exit(0);
  }
}

runAdversarialVariationHarness().catch(err => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
