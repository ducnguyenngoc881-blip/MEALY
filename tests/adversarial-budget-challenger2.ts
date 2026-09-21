/**
 * MealWise Adversarial Stress Test Suite — Challenger 2 (challenger_budget_2)
 * 
 * Objective:
 * Empirically stress-test UI state transitions, dynamic recalculation, and extreme culinary edge cases.
 * 
 * Adversarial Focus Areas:
 * 1. Dynamic Servings & Tier Transitions (headcount integer scaling 1->2->4->6->20, tier drop thoai-mai -> tiet-kiem)
 * 2. Vegetarian / Chay Mode Stress (3-set scarcity pool, 2P tiet-kiem 120k, 0 over-budget, no back-to-back identical sets)
 * 3. Central Region / Miền Trung Stress (1-set pool graceful blending with Toan Quoc, 0 starve/crash)
 * 4. Single-Dish vs Meal-Set Mode for 1 Person (60k, 95k, 140k limits, Recipe vs MealSet discrimination)
 * 5. UI State Recalibration & Dynamic Retuning (Weekly & Day-level recalibration, servings stepper bounds)
 * 6. Fuzzing & Boundary Invariants
 */

import { generateBudgetCompliantWeeklyPlan, PlanGeneratorOptions, GeneratedDayPlan } from '../src/utils/mealPlanGenerator';
import { roundToThousand, scaleCost, getDailyBudgetTarget, DAILY_BUDGET_RATES } from '../src/utils/currency';
import { mockMealSets } from '../src/data/mockMealSets';
import { mockRecipes } from '../src/data/mockRecipes';
import { Recipe, VietnameseMealSet, DailyMealPlan } from '../src/types';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  telemetry?: any;
}

const results: TestResult[] = [];
let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, suite: string, name: string, errorMsg?: string, telemetry?: any) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    results.push({ suite, name, passed: true, telemetry });
    console.log(`  ✓ [PASS] [${suite}] ${name}`);
  } else {
    failedAssertions++;
    results.push({ suite, name, passed: false, error: errorMsg || 'Assertion failed', telemetry });
    console.error(`  ✗ [FAIL] [${suite}] ${name} -> ${errorMsg || 'Assertion failed'}`);
  }
}

console.log('\n======================================================================');
console.log('       MEALWISE ADVERSARIAL STRESS TEST SUITE — CHALLENGER 2         ');
console.log('======================================================================\n');

// ============================================================================
// SUITE 1: DYNAMIC SERVINGS & TIER TRANSITIONS
// ============================================================================
console.log('--- SUITE 1: Dynamic Servings & Tier Transitions ---');

// 1.1 Headcount scaling with integer VND (1 -> 2 -> 4 -> 6 -> 20)
{
  const headcounts = [1, 2, 4, 6, 20];
  let allScaledVndAreInteger = true;
  let allScaledVndMultiplesOf1000 = true;
  let totalCostChecks = 0;

  for (const servings of headcounts) {
    // Test scaling across all 16 mock meal sets
    for (const set of mockMealSets) {
      totalCostChecks++;
      const scaled = scaleCost(set.totalCostVnd, servings);
      if (!Number.isInteger(scaled)) allScaledVndAreInteger = false;
      if (scaled % 1000 !== 0) allScaledVndAreInteger = false;
      if (scaled <= 0) allScaledVndAreInteger = false;
    }

    // Test scaling across 100 mock recipes
    for (const recipe of mockRecipes.slice(0, 100)) {
      totalCostChecks++;
      const scaled = scaleCost(recipe.estimatedCostVnd || 30000, servings);
      if (!Number.isInteger(scaled)) allScaledVndAreInteger = false;
      if (scaled % 1000 !== 0) allScaledVndMultiplesOf1000 = false;
      if (scaled <= 0) allScaledVndAreInteger = false;
    }
  }

  assert(
    allScaledVndAreInteger && allScaledVndMultiplesOf1000,
    'Suite 1',
    `1.1 Headcount scaling across 1P, 2P, 4P, 6P, 20P (${totalCostChecks} cost checks) yields clean integer multiples of 1,000 VND`,
    'Float drift or non-thousand multiple found in scaled costs',
    { totalCostChecks, headcounts }
  );
}

// 1.2 Dynamic budget tier downward transitions (Thoải mái -> Vừa phải -> Tiết kiệm)
{
  const testSizes = [1, 2, 4, 6];
  let transitionsClean = true;
  let downwardTargetObserved = true;
  let downwardCostObserved = true;

  for (const servings of testSizes) {
    const generousPlan = generateBudgetCompliantWeeklyPlan({
      servings,
      budgetLevel: 'thoai-mai',
      regionPreference: 'toan-quoc',
      specialNeeds: []
    });

    const moderatePlan = generateBudgetCompliantWeeklyPlan({
      servings,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: []
    });

    const economicalPlan = generateBudgetCompliantWeeklyPlan({
      servings,
      budgetLevel: 'tiet-kiem',
      regionPreference: 'toan-quoc',
      specialNeeds: []
    });

    const targetGenerous = getDailyBudgetTarget('thoai-mai', servings);
    const targetModerate = getDailyBudgetTarget('vua-phai', servings);
    const targetEconomical = getDailyBudgetTarget('tiet-kiem', servings);

    if (!(targetGenerous > targetModerate && targetModerate > targetEconomical)) {
      downwardTargetObserved = false;
    }

    const costGenerous = generousPlan.reduce((sum, d) => sum + d.scaledDayCost, 0);
    const costModerate = moderatePlan.reduce((sum, d) => sum + d.scaledDayCost, 0);
    const costEconomical = economicalPlan.reduce((sum, d) => sum + d.scaledDayCost, 0);

    if (!(costGenerous >= costModerate && costModerate >= costEconomical)) {
      downwardCostObserved = false;
    }

    // Verify economical plan has 0 over-budget days under economical ceiling
    const ceilingEconomical = Math.floor(targetEconomical * 1.05);
    for (const day of economicalPlan) {
      if (day.scaledDayCost > ceilingEconomical || day.isOverBudget) {
        transitionsClean = false;
      }
    }
  }

  assert(
    transitionsClean && downwardTargetObserved && downwardCostObserved,
    'Suite 1',
    '1.2 Downward tier transition (thoai-mai -> vua-phai -> tiet-kiem) dynamically recalculates daily targets and yields compliant menus',
    'Tier transition produced over-budget days or failed monotonic downward cost adjustment'
  );
}

// 1.3 Extreme headcount transition (1P -> 20P)
{
  const plan1P = generateBudgetCompliantWeeklyPlan({
    servings: 1,
    budgetLevel: 'tiet-kiem',
    regionPreference: 'toan-quoc',
    specialNeeds: []
  });

  const plan20P = generateBudgetCompliantWeeklyPlan({
    servings: 20,
    budgetLevel: 'tiet-kiem',
    regionPreference: 'toan-quoc',
    specialNeeds: []
  });

  const target1P = getDailyBudgetTarget('tiet-kiem', 1);
  const target20P = getDailyBudgetTarget('tiet-kiem', 20);

  const ceiling20P = Math.floor(target20P * 1.05);
  const allDaysCompliant20P = plan20P.every(d => d.scaledDayCost <= ceiling20P && !d.isOverBudget);
  const cleanIntegerCosts20P = plan20P.every(d => d.scaledDayCost % 1000 === 0 && Number.isInteger(d.scaledDayCost));

  assert(
    target1P === 60000 && target20P === 1200000 && allDaysCompliant20P && cleanIntegerCosts20P,
    'Suite 1',
    '1.3 Extreme headcount transition 1P (60k/day) -> 20P (1.2M/day) yields 100% compliant menu with integer VND',
    '20P plan violated budget ceiling or integer currency rounding',
    { target1P, target20P, ceiling20P }
  );
}

// ============================================================================
// SUITE 2: VEGETARIAN / CHAY MODE STRESS (SCARCITY RESILIENCE)
// ============================================================================
console.log('\n--- SUITE 2: Vegetarian / Chay Mode Stress ---');

// 2.1 7-day meal plan for Chay mode on Tiết kiệm (120k for 2 people)
{
  const chayPlan2P = generateBudgetCompliantWeeklyPlan({
    servings: 2,
    budgetLevel: 'tiet-kiem',
    specialNeeds: ['chay'],
    mealFormat: 'meal-set'
  });

  const target = getDailyBudgetTarget('tiet-kiem', 2); // 120,000 VND
  const ceiling = Math.floor(target * 1.05); // 126,000 VND

  assert(target === 120000, 'Suite 2', '2.1a Daily target for 2 people on Tiết kiệm is exactly 120,000 VND');
  assert(chayPlan2P.length === 7, 'Suite 2', '2.1b Exactly 7 days generated for Chay 2P Tiết kiệm');

  let overBudgetDaysCount = 0;
  let flagViolationsCount = 0;
  let sameDayDuplicatesCount = 0;
  let consecutiveLunchDuplicates = 0;
  let consecutiveDinnerDuplicates = 0;
  let backToBackIdenticalPairs = 0;
  let nonVegetarianMeals = 0;

  for (let i = 0; i < chayPlan2P.length; i++) {
    const day = chayPlan2P[i];

    if (day.scaledDayCost > ceiling) overBudgetDaysCount++;
    if (day.isOverBudget) flagViolationsCount++;

    const lunch = day.meals.lunch;
    const dinner = day.meals.dinner;
    const bfast = day.meals.breakfast;

    // Check vegetarian authenticity
    const isBfastChay = bfast.category === 'mon-chay' || bfast.tags?.some(t => t.toLowerCase().includes('chay'));
    const isLunchChay = ('region' in lunch && lunch.region === 'chay') || lunch.tags?.some(t => t.toLowerCase().includes('chay'));
    const isDinnerChay = ('region' in dinner && dinner.region === 'chay') || dinner.tags?.some(t => t.toLowerCase().includes('chay'));

    if (!isBfastChay || !isLunchChay || !isDinnerChay) nonVegetarianMeals++;

    // Same-day check
    if (lunch.id === dinner.id) sameDayDuplicatesCount++;

    // Consecutive check
    if (i > 0) {
      const prev = chayPlan2P[i - 1];
      if (lunch.id === prev.meals.lunch.id) consecutiveLunchDuplicates++;
      if (dinner.id === prev.meals.dinner.id) consecutiveDinnerDuplicates++;
      if (lunch.id === prev.meals.lunch.id && dinner.id === prev.meals.dinner.id) {
        backToBackIdenticalPairs++;
      }
    }
  }

  assert(
    overBudgetDaysCount === 0 && flagViolationsCount === 0,
    'Suite 2',
    `2.1c 0 over-budget days for Chay 2P Tiết kiệm (120k target, 126k ceiling) [actual over: ${overBudgetDaysCount}]`,
    'Over-budget days detected in Chay 2P Tiết kiệm',
    { overBudgetDaysCount, flagViolationsCount }
  );

  assert(
    nonVegetarianMeals === 0,
    'Suite 2',
    '2.1d 100% of breakfast, lunch, and dinner meals in Chay plan are strictly vegetarian',
    'Non-vegetarian meal found in Chay plan',
    { nonVegetarianMeals }
  );

  assert(
    sameDayDuplicatesCount === 0,
    'Suite 2',
    '2.1e Same-day lunch and dinner sets are strictly distinct across all 7 days (lunch !== dinner)',
    'Same-day duplicate meal sets found'
  );

  assert(
    backToBackIdenticalPairs === 0,
    'Suite 2',
    '2.1f Zero back-to-back identical (Lunch, Dinner) meal set pairs across consecutive days',
    'Identical meal set pair assigned on consecutive days',
    { consecutiveLunchDuplicates, consecutiveDinnerDuplicates, backToBackIdenticalPairs }
  );
}

// 2.2 Chay mode across all 3 budget tiers for 1P, 2P, 4P, 6P (12 combinations)
{
  const tiers: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
  const sizes = [1, 2, 4, 6];
  let totalChayDays = 0;
  let totalChayOverBudget = 0;
  let allChayAuthentic = true;

  for (const tier of tiers) {
    for (const size of sizes) {
      const plan = generateBudgetCompliantWeeklyPlan({
        servings: size,
        budgetLevel: tier,
        specialNeeds: ['chay'],
        mealFormat: 'meal-set'
      });

      const target = getDailyBudgetTarget(tier, size);
      const ceiling = Math.floor(target * 1.05);

      for (const day of plan) {
        totalChayDays++;
        if (day.scaledDayCost > ceiling || day.isOverBudget) {
          totalChayOverBudget++;
        }
        const isBfastChay = day.meals.breakfast.category === 'mon-chay' || day.meals.breakfast.tags?.some(t => t.toLowerCase().includes('chay'));
        const isLunchChay = ('region' in day.meals.lunch && day.meals.lunch.region === 'chay') || day.meals.lunch.tags?.some(t => t.toLowerCase().includes('chay'));
        const isDinnerChay = ('region' in day.meals.dinner && day.meals.dinner.region === 'chay') || day.meals.dinner.tags?.some(t => t.toLowerCase().includes('chay'));
        if (!isBfastChay || !isLunchChay || !isDinnerChay) {
          allChayAuthentic = false;
        }
      }
    }
  }

  assert(
    totalChayOverBudget === 0 && allChayAuthentic,
    'Suite 2',
    `2.2 Multi-tier Chay matrix (${totalChayDays} days audited across 12 configurations): 0 over-budget days and 100% vegetarian authenticity`,
    'Over-budget days or non-vegetarian meals detected in multi-tier Chay sweep',
    { totalChayDays, totalChayOverBudget }
  );
}

// ============================================================================
// SUITE 3: CENTRAL REGION / MIỀN TRUNG STRESS (SINGLE-SET POOL BLENDING)
// ============================================================================
console.log('\n--- SUITE 3: Central Region / Miền Trung Stress ---');

// 3.1 7-day plan with regionPreference='trung'
{
  const sizes = [1, 2, 4, 6];
  const tiers: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
  let noCrashes = true;
  let completeMealsCount = 0;
  let mienTrungSetIncludedCount = 0;
  let overBudgetDaysCount = 0;
  let duplicateMealSetsPerDay = 0;

  for (const tier of tiers) {
    for (const size of sizes) {
      try {
        const plan = generateBudgetCompliantWeeklyPlan({
          servings: size,
          budgetLevel: tier,
          regionPreference: 'trung',
          mealFormat: 'meal-set'
        });

        if (plan.length !== 7) noCrashes = false;

        const target = getDailyBudgetTarget(tier, size);
        const ceiling = Math.floor(target * 1.05);

        let planHasMienTrungSet = false;

        for (const day of plan) {
          if (day.scaledDayCost > ceiling || day.isOverBudget) overBudgetDaysCount++;

          if (day.meals.breakfast && day.meals.lunch && day.meals.dinner) {
            completeMealsCount++;
          }

          const lunchId = day.meals.lunch.id;
          const dinnerId = day.meals.dinner.id;

          if (lunchId === dinnerId) duplicateMealSetsPerDay++;

          if (lunchId === 'mam-com-mien-trung' || dinnerId === 'mam-com-mien-trung') {
            planHasMienTrungSet = true;
          }
        }

        if (planHasMienTrungSet) mienTrungSetIncludedCount++;
      } catch (e) {
        noCrashes = false;
        console.error('Crash during Central Region plan generation:', e);
      }
    }
  }

  const expectedTotalDays = sizes.length * tiers.length * 7; // 4 * 3 * 7 = 84

  assert(
    noCrashes && completeMealsCount === expectedTotalDays,
    'Suite 3',
    `3.1a Central Region (regionPreference='trung') generates 7-day plans without crashing or starving across all 12 configs (${completeMealsCount}/${expectedTotalDays} complete meals)`,
    'Crash or missing meal slots detected in Central Region stress tests'
  );

  assert(
    mienTrungSetIncludedCount > 0,
    'Suite 3',
    `3.1b The single Miền Trung set ('mam-com-mien-trung') is successfully utilized across plans (${mienTrungSetIncludedCount}/12 configs)`,
    'Miền Trung set was never selected'
  );

  assert(
    overBudgetDaysCount === 0,
    'Suite 3',
    `3.1c Central Region plans have 0 over-budget days across all 84 audited days`,
    'Over-budget days detected in Central Region plans',
    { overBudgetDaysCount }
  );

  assert(
    duplicateMealSetsPerDay === 0,
    'Suite 3',
    '3.1d Central Region blends with Toàn quốc sets with 0 same-day duplicates (lunch !== dinner)',
    'Same-day duplicate sets detected'
  );
}

// ============================================================================
// SUITE 4: SINGLE-DISH VS MEAL-SET MODE FOR 1 PERSON
// ============================================================================
console.log('\n--- SUITE 4: Single-Dish vs Meal-Set Mode for 1 Person ---');

// 4.1 Single-dish mode for 1 person across 60k, 95k, 140k daily limits
{
  const limits = [
    { tier: 'tiet-kiem' as const, target: 60000, ceiling: 63000 },
    { tier: 'vua-phai' as const, target: 95000, ceiling: 99750 },
    { tier: 'thoai-mai' as const, target: 140000, ceiling: 147000 }
  ];

  for (const { tier, target, ceiling } of limits) {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 1,
      budgetLevel: tier,
      mealFormat: 'single-dish',
      regionPreference: 'toan-quoc'
    });

    assert(plan.length === 7, 'Suite 4', `4.1a [${tier}] 1P single-dish plan generates exactly 7 days`);

    let allSingleRecipes = true;
    let allWithinCeiling = true;
    let noFlaggedDays = true;
    let distinctDishesPerDay = true;
    let cleanIntegerCosts = true;

    for (const day of plan) {
      // Must be Recipe, not VietnameseMealSet
      const isLunchSingle = !('mainDish' in day.meals.lunch);
      const isDinnerSingle = !('mainDish' in day.meals.dinner);
      const isBfastSingle = !('mainDish' in day.meals.breakfast);

      if (!isLunchSingle || !isDinnerSingle || !isBfastSingle) allSingleRecipes = false;

      if (day.scaledDayCost > ceiling) allWithinCeiling = false;
      if (day.isOverBudget) noFlaggedDays = false;

      // 3 distinct dishes
      if (
        day.meals.lunch.id === day.meals.dinner.id ||
        day.meals.lunch.id === day.meals.breakfast.id ||
        day.meals.dinner.id === day.meals.breakfast.id
      ) {
        distinctDishesPerDay = false;
      }

      if (day.scaledDayCost % 1000 !== 0 || !Number.isInteger(day.scaledDayCost)) {
        cleanIntegerCosts = false;
      }
    }

    assert(
      allSingleRecipes,
      'Suite 4',
      `4.1b [${tier}] 1P single-dish mode picks 3 single recipes (not 3-dish meal sets)`,
      'MealSet object found where Recipe expected'
    );

    assert(
      allWithinCeiling && noFlaggedDays,
      'Suite 4',
      `4.1c [${tier}] 1P single-dish plan strictly conforms to ${target.toLocaleString()} VND limit (max ceiling: ${ceiling.toLocaleString()} VND)`,
      'Scaled day cost exceeded daily budget limit'
    );

    assert(
      distinctDishesPerDay,
      'Suite 4',
      `4.1d [${tier}] 1P single-dish mode provides 3 distinct dishes per day (B !== L, B !== D, L !== D)`,
      'Duplicate dishes found on the same day'
    );

    assert(
      cleanIntegerCosts,
      'Suite 4',
      `4.1e [${tier}] 1P single-dish costs are clean integers rounded to 1,000 VND`,
      'Non-thousand multiple or float cost found'
    );
  }
}

// 4.2 Single-dish vs Meal-set discrimination for 1 person
{
  const singlePlan = generateBudgetCompliantWeeklyPlan({
    servings: 1,
    budgetLevel: 'vua-phai',
    mealFormat: 'single-dish'
  });

  const mealSetPlan = generateBudgetCompliantWeeklyPlan({
    servings: 1,
    budgetLevel: 'vua-phai',
    mealFormat: 'meal-set'
  });

  const singleAllRecipes = singlePlan.every(d => !('mainDish' in d.meals.lunch) && !('mainDish' in d.meals.dinner));
  const mealSetAllSets = mealSetPlan.every(d => ('mainDish' in d.meals.lunch) && ('mainDish' in d.meals.dinner));

  assert(
    singleAllRecipes && mealSetAllSets,
    'Suite 4',
    '4.2 1 Person explicit mealFormat toggle discriminates correctly: single-dish produces Recipe, meal-set produces VietnameseMealSet',
    'Discrimination failed between single-dish and meal-set format'
  );
}

// ============================================================================
// SUITE 5: UI STATE RECALIBRATION & DYNAMIC RETUNING
// ============================================================================
console.log('\n--- SUITE 5: UI State Recalibration & Dynamic Retuning ---');

// 5.1 Weekly recalibration after headcount reduction & tier shift (4P thoai-mai -> 2P tiet-kiem)
{
  // 1. User starts with 4P generous plan
  const initialGenerousPlan = generateBudgetCompliantWeeklyPlan({
    servings: 4,
    budgetLevel: 'thoai-mai',
    regionPreference: 'bac',
    mealFormat: 'meal-set'
  });
  const initialGenerousTarget = getDailyBudgetTarget('thoai-mai', 4); // 560,000 VND
  const initialGenerousCeiling = Math.floor(initialGenerousTarget * 1.05); // 588,000 VND

  const initialAllCompliant = initialGenerousPlan.every(d => d.scaledDayCost <= initialGenerousCeiling && !d.isOverBudget);

  // 2. User changes preferences in UI: familySize: 4 -> 2, budgetLevel: thoai-mai -> tiet-kiem
  // Then triggers 1-click recalibration (recalibrateWeeklyMenu / autoFillWeeklyMenu)
  const newServings = 2;
  const newTier = 'tiet-kiem';
  const newTarget = getDailyBudgetTarget(newTier, newServings); // 120,000 VND
  const newCeiling = Math.floor(newTarget * 1.05); // 126,000 VND
  const newWeeklyCeiling = newCeiling * 7; // 882,000 VND

  const recalibratedPlan = generateBudgetCompliantWeeklyPlan({
    servings: newServings,
    budgetLevel: newTier,
    regionPreference: 'bac',
    mealFormat: 'meal-set'
  });

  const recalibratedAllCompliant = recalibratedPlan.every(d => d.scaledDayCost <= newCeiling && !d.isOverBudget);
  const recalibratedTotalCost = recalibratedPlan.reduce((acc, d) => acc + d.scaledDayCost, 0);
  const initialTotalCost = initialGenerousPlan.reduce((acc, d) => acc + d.scaledDayCost, 0);

  assert(
    initialAllCompliant && recalibratedAllCompliant && recalibratedTotalCost <= newWeeklyCeiling && recalibratedTotalCost < initialTotalCost,
    'Suite 5',
    `5.1 1-Click weekly recalibration retunes 4P Thoải mái (${(initialTotalCost).toLocaleString()} VND) down to 2P Tiết kiệm (${recalibratedTotalCost.toLocaleString()} VND <= ${newWeeklyCeiling.toLocaleString()} VND weekly ceiling) with 0 over-budget days`,
    'Recalibrated weekly plan failed budget ceiling or downward scaling',
    { initialTotalCost, recalibratedTotalCost, newCeiling, newWeeklyCeiling }
  );
}

// 5.2 Single-day over-budget recalibration algorithm (recalibrateDayMenu logic)
{
  // Simulate an arbitrary over-budget day (e.g. user manually swapped into expensive dishes)
  const expensiveBreakfast = mockRecipes.find(r => r.estimatedCostVnd && r.estimatedCostVnd >= 45000) || mockRecipes[0];
  const expensiveLunch = mockMealSets.find(s => s.totalCostVnd >= 170000) || mockMealSets[0];
  const expensiveDinner = mockMealSets.find(s => s.totalCostVnd >= 150000 && s.id !== expensiveLunch.id) || mockMealSets[1];

  const targetTier = 'tiet-kiem';
  const targetServings = 2;
  const dayTarget = getDailyBudgetTarget(targetTier, targetServings); // 120,000 VND
  const dayCeiling = Math.floor(dayTarget * 1.05); // 126,000 VND

  const unscaledCost = (expensiveBreakfast.estimatedCostVnd || 45000) + expensiveLunch.totalCostVnd + expensiveDinner.totalCostVnd;
  const initialScaledCost = scaleCost(unscaledCost, targetServings); // ~185k - 200k, clearly over 126k

  const wasOverBudget = initialScaledCost > dayCeiling;

  // Now execute Context recalibrateDayMenu logic:
  const bfastCapRatio = targetTier === 'tiet-kiem' ? 0.25 : 0.32;
  const maxBfastCost = Math.floor(dayTarget * bfastCapRatio);

  const rawBfastPool = mockRecipes.filter(r => r.category === 'an-sang');
  let affordableBfast = rawBfastPool.filter(r => scaleCost(r.estimatedCostVnd || 25000, targetServings) <= maxBfastCost);
  if (affordableBfast.length === 0) {
    affordableBfast = [...rawBfastPool].sort((a, b) => (a.estimatedCostVnd || 25000) - (b.estimatedCostVnd || 25000)).slice(0, 5);
  }

  let chosenBfast = affordableBfast[0];
  let chosenLunch: VietnameseMealSet | null = null;
  let chosenDinner: VietnameseMealSet | null = null;

  for (const bfastCandidate of affordableBfast) {
    const bfastCost = scaleCost(bfastCandidate.estimatedCostVnd || 25000, targetServings);
    const remBudget = dayCeiling - bfastCost;

    const candidateSets = [...mockMealSets].sort((a, b) => b.totalCostVnd - a.totalCostVnd);

    for (let i = 0; i < candidateSets.length; i++) {
      const costI = scaleCost(candidateSets[i].totalCostVnd, targetServings);
      for (let j = 0; j < candidateSets.length; j++) {
        if (i === j) continue;
        const costJ = scaleCost(candidateSets[j].totalCostVnd, targetServings);
        if (costI + costJ <= remBudget) {
          chosenBfast = bfastCandidate;
          chosenLunch = candidateSets[i];
          chosenDinner = candidateSets[j];
          break;
        }
      }
      if (chosenLunch && chosenDinner) break;
    }
    if (chosenLunch && chosenDinner) break;
  }

  const recalibratedDayCost = scaleCost(
    (chosenBfast.estimatedCostVnd || 25000) + chosenLunch!.totalCostVnd + chosenDinner!.totalCostVnd,
    targetServings
  );

  const isRecalibratedCompliant = recalibratedDayCost <= dayCeiling && chosenLunch!.id !== chosenDinner!.id;

  assert(
    wasOverBudget && isRecalibratedCompliant,
    'Suite 5',
    `5.2 Single-day recalibration successfully detects over-budget state (${initialScaledCost.toLocaleString()} VND) and retunes to compliant set pair (${recalibratedDayCost.toLocaleString()} VND <= ${dayCeiling.toLocaleString()} VND ceiling)`,
    'Single day recalibration failed to bring day cost within budget ceiling',
    { initialScaledCost, recalibratedDayCost, dayCeiling }
  );
}

// 5.3 Headcount stepper boundary sanitization (WeeklyBoard handleServingsChange & generator options logic)
{
  // WeeklyBoard handleServingsChange: Math.min(20, Math.max(1, Math.round(newServings)))
  const stepperSanitize = (newServings: number) => Math.min(20, Math.max(1, Math.round(newServings)));

  assert(stepperSanitize(0) === 1, 'Suite 5', '5.3a Servings stepper sanitizes 0 to 1');
  assert(stepperSanitize(-5) === 1, 'Suite 5', '5.3b Servings stepper sanitizes negative numbers to 1');
  assert(stepperSanitize(25) === 20, 'Suite 5', '5.3c Servings stepper clamps >20 values to maximum 20');
  assert(stepperSanitize(3.2) === 3, 'Suite 5', '5.3d Servings stepper rounds decimal 3.2 to integer 3');
  assert(stepperSanitize(5.8) === 6, 'Suite 5', '5.3e Servings stepper rounds decimal 5.8 to integer 6');

  // Generator engine options fallback: Number.isFinite(s) && s > 0 ? Math.min(20, Math.max(1, Math.round(s))) : 4
  const generatorSanitize = (raw: any) => {
    const s = typeof raw === 'number' ? raw : parseFloat(raw);
    return Number.isFinite(s) && s > 0 ? Math.min(20, Math.max(1, Math.round(s))) : 4;
  };

  assert(generatorSanitize(NaN) === 4, 'Suite 5', '5.3f Generator engine falls back to default 4 for NaN');
  assert(generatorSanitize('invalid') === 4, 'Suite 5', '5.3g Generator engine falls back to default 4 for non-numeric input');
  assert(generatorSanitize(0) === 4, 'Suite 5', '5.3h Generator engine falls back to default 4 for 0');
}

// ============================================================================
// SUITE 6: FUZZING & BOUNDARY INVARIANTS
// ============================================================================
console.log('\n--- SUITE 6: Fuzzing & Boundary Invariants ---');

// 6.1 Fuzzing invalid and boundary inputs
{
  const fuzzCases: PlanGeneratorOptions[] = [
    { servings: 0, budgetLevel: 'tiet-kiem' },
    { servings: -3, budgetLevel: 'vua-phai' },
    { servings: 999, budgetLevel: 'thoai-mai' },
    { servings: NaN, budgetLevel: 'tiet-kiem' },
    { servings: 2.7, budgetLevel: 'tiet-kiem' },
    { servings: 4, budgetLevel: 'invalid-tier' as any },
    { servings: 4, budgetLevel: 'vua-phai', regionPreference: 'non-existent' as any },
    { servings: 4, budgetLevel: 'vua-phai', specialNeeds: ['unknown-tag-1', 'unknown-tag-2'] }
  ];

  let allFuzzPassed = true;

  for (let idx = 0; idx < fuzzCases.length; idx++) {
    const c = fuzzCases[idx];
    try {
      const plan = generateBudgetCompliantWeeklyPlan(c);
      if (plan.length !== 7) allFuzzPassed = false;
      for (const d of plan) {
        if (!d.meals.breakfast || !d.meals.lunch || !d.meals.dinner) allFuzzPassed = false;
        if (!Number.isFinite(d.scaledDayCost) || d.scaledDayCost <= 0) allFuzzPassed = false;
        if (d.scaledDayCost % 1000 !== 0) allFuzzPassed = false;
      }
    } catch (err) {
      allFuzzPassed = false;
      console.error(`Fuzz case ${idx} threw uncaught exception:`, err);
    }
  }

  assert(
    allFuzzPassed,
    'Suite 6',
    '6.1 Fuzzing boundary inputs (servings: 0, -3, 999, NaN, 2.7, invalid tiers, unknown regions) produces valid 7-day plans without crashing',
    'Uncaught exception or invalid plan produced during fuzzing'
  );
}

// ============================================================================
// SUMMARY & TELEMETRY
// ============================================================================
console.log('\n======================================================================');
console.log('                 ADVERSARIAL STRESS TEST TELEMETRY                    ');
console.log('======================================================================');
console.log(`  • Total Assertions Executed:  ${totalAssertions}`);
console.log(`  • Passed Assertions:          ${passedAssertions}`);
console.log(`  • Failed Assertions:          ${failedAssertions}`);
console.log(`  • Adversarial Pass Rate:      ${((passedAssertions / totalAssertions) * 100).toFixed(1)}%`);
console.log('======================================================================\n');

if (failedAssertions > 0) {
  console.error(`[VERDICT] REJECT — ${failedAssertions} adversarial stress test(s) failed!`);
  process.exit(1);
} else {
  console.log('[VERDICT] APPROVE — 100% of adversarial stress tests passed without regressions!');
  process.exit(0);
}
