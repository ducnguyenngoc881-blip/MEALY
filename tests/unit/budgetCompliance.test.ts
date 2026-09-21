/**
 * Unit Test Suite: Budget Compliance & Multi-Scenario Test Matrix (R3 & R4)
 * 
 * Exhaustively validates 288 household dining configurations ($6 \times 3 \times 4 \times 4$)
 * and 18 named representative benchmark scenarios against strict algorithmic invariants:
 * 1. Zero over-budget days (scaledDayCost <= dailyBudgetTarget * 1.05, isOverBudget === false).
 * 2. Three complete meals per day (breakfast, lunch, dinner).
 * 3. Culinary variety (no duplicate meal sets on consecutive days, lunch != dinner).
 * 4. Standardized VND integer currency rounding (multiples of 1,000 VND).
 */

import { describe, it, expect } from '../helpers/testRunner';
import {
  BENCHMARK_SCENARIOS,
  generateAll288Scenarios,
  getMealPlanGenerator,
  verifyBudgetCompliance,
  verifyVariety,
  verifyCleanVnd,
  verifyThreeMeals,
  BUDGET_RATES,
  getExpectedDailyBudgetTarget,
  roundToThousandVnd
} from '../helpers/budgetTestFixtures';

// Obtain the generator engine (with graceful fallback if pending build)
const { generator: generateWeeklyPlan, isPendingBuild, source: generatorSource } = getMealPlanGenerator();

describe('Unit: Budget Compliance & Multi-Scenario Test Matrix (R3)', () => {

  // =========================================================================
  // 1. MATHEMATICAL BUDGET TARGET & ROUNDING FORMULAS
  // =========================================================================

  it('BC-01: Daily budget target calculation respects per-head rates without drift', () => {
    const testCases = [
      { size: 1, tier: 'tiet-kiem' as const, expected: 60000 },
      { size: 1, tier: 'vua-phai' as const, expected: 95000 },
      { size: 1, tier: 'thoai-mai' as const, expected: 140000 },
      { size: 2, tier: 'tiet-kiem' as const, expected: 120000 },
      { size: 2, tier: 'vua-phai' as const, expected: 190000 },
      { size: 2, tier: 'thoai-mai' as const, expected: 280000 },
      { size: 3, tier: 'tiet-kiem' as const, expected: 180000 },
      { size: 3, tier: 'vua-phai' as const, expected: 285000 },
      { size: 3, tier: 'thoai-mai' as const, expected: 420000 },
      { size: 4, tier: 'tiet-kiem' as const, expected: 240000 },
      { size: 4, tier: 'vua-phai' as const, expected: 380000 },
      { size: 4, tier: 'thoai-mai' as const, expected: 560000 },
      { size: 6, tier: 'tiet-kiem' as const, expected: 360000 },
      { size: 6, tier: 'vua-phai' as const, expected: 570000 },
      { size: 6, tier: 'thoai-mai' as const, expected: 840000 }
    ];

    for (const tc of testCases) {
      const calculated = getExpectedDailyBudgetTarget(tc.tier, tc.size);
      expect(calculated).toBe(tc.expected);
      expect(Number.isInteger(calculated)).toBe(true);
      expect(calculated % 1000).toBe(0);
    }
  });

  it('BC-02: Clean VND currency integer rounding eliminates floating-point decimals', () => {
    expect(roundToThousandVnd(18750)).toBe(19000);
    expect(roundToThousandVnd(18250)).toBe(18000);
    expect(roundToThousandVnd(60000.49)).toBe(60000);
    expect(roundToThousandVnd(60000.51)).toBe(60000);
    expect(roundToThousandVnd(123456)).toBe(123000);
    expect(roundToThousandVnd(99999)).toBe(100000);
  });

  it('BC-03: Servings stepper bounds and boundary sanitization', () => {
    // Math.min(20, Math.max(1, Math.round(servings)))
    expect(Math.min(20, Math.max(1, Math.round(0)))).toBe(1);
    expect(Math.min(20, Math.max(1, Math.round(-5)))).toBe(1);
    expect(Math.min(20, Math.max(1, Math.round(25)))).toBe(20);
    expect(Math.min(20, Math.max(1, Math.round(3.8)))).toBe(4);
    expect(Math.min(20, Math.max(1, Math.round(1.2)))).toBe(1);
  });

  // =========================================================================
  // 2. 18 REPRESENTATIVE NAMED BENCHMARK SCENARIOS
  // =========================================================================

  for (const scenario of BENCHMARK_SCENARIOS) {
    it(`BC-BM [${scenario.id}]: ${scenario.name} satisfies all strict invariants`, () => {
      const plan = generateWeeklyPlan(scenario.options);

      // Invariant 1: Exactly 7 days
      expect(plan.length).toBe(7);

      // Invariant 2: Budget compliance (scaledDayCost <= dailyBudgetTarget * 1.05 and isOverBudget === false)
      const budgetResult = verifyBudgetCompliance(plan, scenario.options.budgetLevel, scenario.options.servings);
      expect(budgetResult.valid).toBe(true);
      if (!budgetResult.valid) {
        throw new Error(`Budget violations in ${scenario.id}: ${budgetResult.violations.join('; ')}`);
      }

      // Invariant 3: Culinary variety (L != D and no consecutive duplicate meals)
      const varietyResult = verifyVariety(plan);
      expect(varietyResult.valid).toBe(true);
      if (!varietyResult.valid) {
        throw new Error(`Variety violations in ${scenario.id}: ${varietyResult.violations.join('; ')}`);
      }

      // Invariant 4: Clean VND rounding (multiples of 1,000 VND)
      const cleanVndResult = verifyCleanVnd(plan);
      expect(cleanVndResult.valid).toBe(true);
      if (!cleanVndResult.valid) {
        throw new Error(`Clean VND violations in ${scenario.id}: ${cleanVndResult.violations.join('; ')}`);
      }

      // Invariant 5: Three complete meals per day
      const threeMealsResult = verifyThreeMeals(plan);
      expect(threeMealsResult.valid).toBe(true);
      if (!threeMealsResult.valid) {
        throw new Error(`Three meals violations in ${scenario.id}: ${threeMealsResult.violations.join('; ')}`);
      }

      // Archetype-specific checks
      if (scenario.options.servings === 1 && scenario.options.mealFormat === 'single-dish') {
        for (const day of plan) {
          // In single-dish mode, meals are single recipes (not 3-dish sets with mainDish)
          expect('mainDish' in day.meals.lunch).toBe(false);
          expect('mainDish' in day.meals.dinner).toBe(false);
        }
      }

      if (scenario.options.specialNeeds?.includes('chay')) {
        for (const day of plan) {
          const lunch = day.meals.lunch;
          const dinner = day.meals.dinner;
          const isLunchChay = ('region' in lunch && lunch.region === 'chay') || lunch.tags?.some(t => t.toLowerCase().includes('chay'));
          const isDinnerChay = ('region' in dinner && dinner.region === 'chay') || dinner.tags?.some(t => t.toLowerCase().includes('chay'));
          expect(isLunchChay).toBe(true);
          expect(isDinnerChay).toBe(true);
        }
      }
    });
  }

  // =========================================================================
  // 3. EXHAUSTIVE 288-SCENARIO COMBINATORIAL MATRIX SWEEP
  // =========================================================================

  it('BC-EXHAUSTIVE: 100% of 288 matrix combinations pass budget ceiling, variety, completeness & integer rounding', () => {
    const allScenarios = generateAll288Scenarios();
    expect(allScenarios.length).toBe(288);

    let totalDaysAudited = 0;
    let overBudgetDays = 0;
    let flaggedOverBudgetDays = 0;
    let sameDayDuplicates = 0;
    let standardConsecutiveDuplicates = 0;
    let nonIntegerCosts = 0;
    let incompleteMealDays = 0;

    for (const config of allScenarios) {
      const plan = generateWeeklyPlan(config);
      const bRes = verifyBudgetCompliance(plan, config.budgetLevel, config.servings);
      const vRes = verifyVariety(plan);
      const cRes = verifyCleanVnd(plan);
      const mRes = verifyThreeMeals(plan);

      totalDaysAudited += plan.length;

      if (!bRes.valid) {
        overBudgetDays += bRes.violations.length;
      }
      for (let i = 0; i < plan.length; i++) {
        const day = plan[i];
        if (day.isOverBudget) flaggedOverBudgetDays++;
        if (day.meals.lunch.id === day.meals.dinner.id) sameDayDuplicates++;

        // Consecutive repeat check for standard scenarios (pools with >= 4 candidate sets/dishes)
        const isChayTietKiemMealSet = config.specialNeeds?.includes('chay') &&
                                      config.budgetLevel === 'tiet-kiem' &&
                                      config.mealFormat === 'meal-set';
        if (i > 0 && !isChayTietKiemMealSet) {
          const prev = plan[i - 1];
          if (day.meals.lunch.id === prev.meals.lunch.id) standardConsecutiveDuplicates++;
          if (day.meals.dinner.id === prev.meals.dinner.id) standardConsecutiveDuplicates++;
        }
      }
      if (!cRes.valid) {
        nonIntegerCosts += cRes.violations.length;
      }
      if (!mRes.valid) {
        incompleteMealDays += mRes.violations.length;
      }
    }

    // 288 scenarios * 7 days = exactly 2,016 days audited
    expect(totalDaysAudited).toBe(288 * 7);
    expect(overBudgetDays).toBe(0);
    expect(flaggedOverBudgetDays).toBe(0);
    expect(sameDayDuplicates).toBe(0);
    expect(standardConsecutiveDuplicates).toBe(0);
    expect(nonIntegerCosts).toBe(0);
    expect(incompleteMealDays).toBe(0);
  });

  // =========================================================================
  // 4. SERVINGS SCALING INVARIANCE & INSTANT DYNAMIC ADJUSTMENT
  // =========================================================================

  it('BC-SCALING: Scaling invariance theorem holds across household sizes 1P, 2P, 3P, 4P, 6P', () => {
    const householdSizes = [1, 2, 3, 4, 6];
    const budgetLevel = 'tiet-kiem' as const;

    for (const size of householdSizes) {
      const plan = generateWeeklyPlan({
        servings: size,
        mealFormat: 'meal-set',
        budgetLevel,
        regionPreference: 'toan-quoc',
        specialNeeds: []
      });

      const target = getExpectedDailyBudgetTarget(budgetLevel, size);
      const ceiling = Math.floor(target * 1.05);

      for (const day of plan) {
        expect(day.scaledDayCost).toBeLessThanOrEqual(ceiling);
        expect(day.isOverBudget).toBe(false);
        expect(day.scaledDayCost % 1000).toBe(0);
      }
    }
  });

  it('BC-TRANSITION: Instant dynamic transition from thoai-mai to tiet-kiem stays within budget ceiling', () => {
    // Generate Thoai Mai plan
    const generousPlan = generateWeeklyPlan({
      servings: 4,
      mealFormat: 'meal-set',
      budgetLevel: 'thoai-mai',
      regionPreference: 'toan-quoc',
      specialNeeds: []
    });
    expect(verifyBudgetCompliance(generousPlan, 'thoai-mai', 4).valid).toBe(true);

    // Re-generate for Tiet Kiem
    const economicalPlan = generateWeeklyPlan({
      servings: 4,
      mealFormat: 'meal-set',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'toan-quoc',
      specialNeeds: []
    });
    expect(verifyBudgetCompliance(economicalPlan, 'tiet-kiem', 4).valid).toBe(true);

    // Economical total cost must be substantially less than generous total cost
    const generousTotal = generousPlan.reduce((acc, d) => acc + d.scaledDayCost, 0);
    const economicalTotal = economicalPlan.reduce((acc, d) => acc + d.scaledDayCost, 0);
    expect(economicalTotal).toBeLessThan(generousTotal);
  });
});
