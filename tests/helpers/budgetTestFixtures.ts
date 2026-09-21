/**
 * Budget Test Fixtures & Invariant Validators
 * Comprehensive test definitions for MealWise M3 Budget Compliance Suite.
 */

import { Recipe, VietnameseMealSet } from '../../src/types';
import { mockRecipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';
import { generateBudgetCompliantWeeklyPlan } from '../../src/utils/mealPlanGenerator';

export interface PlanGeneratorOptions {
  servings: number; // 1, 2, 3, 4, 6+
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai';
  regionPreference?: 'bac' | 'trung' | 'nam' | 'toan-quoc' | 'all';
  specialNeeds?: string[]; // 'gym-protein', 'eat-clean', 'chay', etc.
  mealFormat?: 'single-dish' | 'meal-set';
}

export interface GeneratedDayPlan {
  dayId: string;
  dayName: string;
  meals: {
    breakfast: Recipe;
    lunch: VietnameseMealSet | Recipe;
    dinner: VietnameseMealSet | Recipe;
  };
  unscaledDayCost: number;
  scaledDayCost: number;
  dailyBudgetTarget: number;
  isOverBudget: boolean;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  options: PlanGeneratorOptions;
  expectedDailyBudgetTarget: number;
  expectedMaxAllowedDayCost: number; // target * 1.05
}

export const BUDGET_RATES: Record<'tiet-kiem' | 'vua-phai' | 'thoai-mai', number> = {
  'tiet-kiem': 60000,
  'vua-phai': 95000,
  'thoai-mai': 140000
};

export const INITIAL_DAYS = [
  { dayId: 'mon', dayName: 'Thứ Hai' },
  { dayId: 'tue', dayName: 'Thứ Ba' },
  { dayId: 'wed', dayName: 'Thứ Tư' },
  { dayId: 'thu', dayName: 'Thứ Năm' },
  { dayId: 'fri', dayName: 'Thứ Sáu' },
  { dayId: 'sat', dayName: 'Thứ Bảy' },
  { dayId: 'sun', dayName: 'Chủ Nhật' }
];

export function getExpectedDailyBudgetTarget(
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai',
  servings: number
): number {
  const safeServings = Math.min(20, Math.max(1, Math.round(servings)));
  const rate = BUDGET_RATES[budgetLevel] || 95000;
  return rate * safeServings;
}

export function roundToThousandVnd(amount: number): number {
  return Math.round(amount / 1000) * 1000;
}

// 1. 18 Representative Benchmark Scenarios
export const BENCHMARK_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'BM-01',
    name: 'Solo Student Economical (1P, Single-Dish, Tiet Kiem, Bac, Normal)',
    options: {
      servings: 1,
      mealFormat: 'single-dish',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'bac',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 60000,
    expectedMaxAllowedDayCost: 63000
  },
  {
    id: 'BM-02',
    name: 'Solo Gymer High-Protein (1P, Single-Dish, Vua Phai, Toan Quoc, Gym/Protein)',
    options: {
      servings: 1,
      mealFormat: 'single-dish',
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['gym-protein']
    },
    expectedDailyBudgetTarget: 95000,
    expectedMaxAllowedDayCost: 99750
  },
  {
    id: 'BM-03',
    name: 'Solo Gourmet Home Cook (1P, Meal-Set, Thoai Mai, Nam, Normal)',
    options: {
      servings: 1,
      mealFormat: 'meal-set',
      budgetLevel: 'thoai-mai',
      regionPreference: 'nam',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 140000,
    expectedMaxAllowedDayCost: 147000
  },
  {
    id: 'BM-04',
    name: 'Solo Vegetarian (1P, Single-Dish, Tiet Kiem, Toan Quoc, Chay)',
    options: {
      servings: 1,
      mealFormat: 'single-dish',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'toan-quoc',
      specialNeeds: ['chay']
    },
    expectedDailyBudgetTarget: 60000,
    expectedMaxAllowedDayCost: 63000
  },
  {
    id: 'BM-05',
    name: 'Young Couple Economical (2P, Meal-Set, Tiet Kiem, Toan Quoc, Normal)',
    options: {
      servings: 2,
      mealFormat: 'meal-set',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'toan-quoc',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 120000,
    expectedMaxAllowedDayCost: 126000
  },
  {
    id: 'BM-06',
    name: 'Young Couple Central Flavor (2P, Meal-Set, Vua Phai, Trung, Normal)',
    options: {
      servings: 2,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'trung',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 190000,
    expectedMaxAllowedDayCost: 199500
  },
  {
    id: 'BM-07',
    name: 'Young Couple Eat Clean (2P, Meal-Set, Vua Phai, Nam, Eat Clean)',
    options: {
      servings: 2,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'nam',
      specialNeeds: ['eat-clean']
    },
    expectedDailyBudgetTarget: 190000,
    expectedMaxAllowedDayCost: 199500
  },
  {
    id: 'BM-08',
    name: 'Young Couple Gym Enthusiasts (2P, Meal-Set, Thoai Mai, Toan Quoc, Gym/Protein)',
    options: {
      servings: 2,
      mealFormat: 'meal-set',
      budgetLevel: 'thoai-mai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['gym-protein']
    },
    expectedDailyBudgetTarget: 280000,
    expectedMaxAllowedDayCost: 294000
  },
  {
    id: 'BM-09',
    name: 'Small Family Economical (3P, Meal-Set, Tiet Kiem, Bac, Normal)',
    options: {
      servings: 3,
      mealFormat: 'meal-set',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'bac',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 180000,
    expectedMaxAllowedDayCost: 189000
  },
  {
    id: 'BM-10',
    name: 'Small Family Vegetarian (3P, Meal-Set, Vua Phai, Toan Quoc, Chay)',
    options: {
      servings: 3,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['chay']
    },
    expectedDailyBudgetTarget: 285000,
    expectedMaxAllowedDayCost: 299250
  },
  {
    id: 'BM-11',
    name: 'Standard Family Northern Economical (4P, Meal-Set, Tiet Kiem, Bac, Normal)',
    options: {
      servings: 4,
      mealFormat: 'meal-set',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'bac',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 240000,
    expectedMaxAllowedDayCost: 252000
  },
  {
    id: 'BM-12',
    name: 'Standard Family Southern Balanced (4P, Meal-Set, Vua Phai, Nam, Normal)',
    options: {
      servings: 4,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'nam',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 380000,
    expectedMaxAllowedDayCost: 399000
  },
  {
    id: 'BM-13',
    name: 'Standard Family Central Feast (4P, Meal-Set, Thoai Mai, Trung, Normal)',
    options: {
      servings: 4,
      mealFormat: 'meal-set',
      budgetLevel: 'thoai-mai',
      regionPreference: 'trung',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 560000,
    expectedMaxAllowedDayCost: 588000
  },
  {
    id: 'BM-14',
    name: 'Standard Family Healthy Eat Clean (4P, Meal-Set, Vua Phai, Toan Quoc, Eat Clean)',
    options: {
      servings: 4,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['eat-clean']
    },
    expectedDailyBudgetTarget: 380000,
    expectedMaxAllowedDayCost: 399000
  },
  {
    id: 'BM-15',
    name: 'Large Family Economical (6P, Meal-Set, Tiet Kiem, Trung, Normal)',
    options: {
      servings: 6,
      mealFormat: 'meal-set',
      budgetLevel: 'tiet-kiem',
      regionPreference: 'trung',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 360000,
    expectedMaxAllowedDayCost: 378000
  },
  {
    id: 'BM-16',
    name: 'Large Family Northern Balanced (6P, Meal-Set, Vua Phai, Bac, Normal)',
    options: {
      servings: 6,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'bac',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 570000,
    expectedMaxAllowedDayCost: 598500
  },
  {
    id: 'BM-17',
    name: 'Large Family Gourmet Feast (6P, Meal-Set, Thoai Mai, Nam, Normal)',
    options: {
      servings: 6,
      mealFormat: 'meal-set',
      budgetLevel: 'thoai-mai',
      regionPreference: 'nam',
      specialNeeds: []
    },
    expectedDailyBudgetTarget: 840000,
    expectedMaxAllowedDayCost: 882000
  },
  {
    id: 'BM-18',
    name: 'Large Family Pure Vegetarian (6P, Meal-Set, Vua Phai, Toan Quoc, Chay)',
    options: {
      servings: 6,
      mealFormat: 'meal-set',
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['chay']
    },
    expectedDailyBudgetTarget: 570000,
    expectedMaxAllowedDayCost: 598500
  }
];

// 2. Full 288-Scenario Combinatorial Matrix Generator
export function generateAll288Scenarios(): PlanGeneratorOptions[] {
  const households: Array<{ servings: number; mealFormat: 'single-dish' | 'meal-set' }> = [
    { servings: 1, mealFormat: 'single-dish' },
    { servings: 1, mealFormat: 'meal-set' },
    { servings: 2, mealFormat: 'meal-set' },
    { servings: 3, mealFormat: 'meal-set' },
    { servings: 4, mealFormat: 'meal-set' },
    { servings: 6, mealFormat: 'meal-set' }
  ];

  const budgetTiers: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = [
    'tiet-kiem',
    'vua-phai',
    'thoai-mai'
  ];

  const regions: Array<'bac' | 'trung' | 'nam' | 'toan-quoc'> = [
    'bac',
    'trung',
    'nam',
    'toan-quoc'
  ];

  const dietaryModes: Array<{ name: string; specialNeeds: string[] }> = [
    { name: 'normal', specialNeeds: [] },
    { name: 'gym-protein', specialNeeds: ['gym-protein'] },
    { name: 'eat-clean', specialNeeds: ['eat-clean'] },
    { name: 'chay', specialNeeds: ['chay'] }
  ];

  const scenarios: PlanGeneratorOptions[] = [];
  for (const h of households) {
    for (const b of budgetTiers) {
      for (const r of regions) {
        for (const d of dietaryModes) {
          scenarios.push({
            servings: h.servings,
            mealFormat: h.mealFormat,
            budgetLevel: b,
            regionPreference: r,
            specialNeeds: d.specialNeeds
          });
        }
      }
    }
  }

  return scenarios; // Exactly 288 scenarios
}

// 3. Invariant Validation Helpers

/**
 * Invariant 1: Budget Compliance
 * Verifies that all 7 days have scaledDayCost <= dailyBudgetTarget * 1.05 and isOverBudget === false.
 */
export function verifyBudgetCompliance(
  plan: GeneratedDayPlan[],
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai',
  servings: number
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const expectedTarget = getExpectedDailyBudgetTarget(budgetLevel, servings);
  const maxAllowed = Math.floor(expectedTarget * 1.05);

  if (plan.length !== 7) {
    violations.push(`Plan does not contain 7 days (found: ${plan.length})`);
  }

  plan.forEach((day, idx) => {
    if (day.scaledDayCost > maxAllowed) {
      violations.push(
        `Day ${idx} (${day.dayName}): scaledDayCost (${day.scaledDayCost.toLocaleString('vi-VN')} đ) exceeds max allowed (${maxAllowed.toLocaleString('vi-VN')} đ)`
      );
    }
    if (day.isOverBudget !== false) {
      violations.push(
        `Day ${idx} (${day.dayName}): isOverBudget is ${day.isOverBudget}, expected false`
      );
    }
    if (day.dailyBudgetTarget !== expectedTarget) {
      violations.push(
        `Day ${idx} (${day.dayName}): dailyBudgetTarget (${day.dailyBudgetTarget}) does not match expected (${expectedTarget})`
      );
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Invariant 2: Culinary Variety
 * Verifies no identical lunch and dinner on the same day, and no consecutive duplicate meals.
 */
export function verifyVariety(
  plan: GeneratedDayPlan[]
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  for (let i = 0; i < plan.length; i++) {
    const day = plan[i];
    const lunch = day.meals?.lunch;
    const dinner = day.meals?.dinner;

    if (!lunch || !dinner) {
      violations.push(`Day ${i} (${day.dayName}): lunch or dinner meal is missing`);
      continue;
    }

    // Intra-day distinction
    if (lunch.id === dinner.id) {
      violations.push(
        `Day ${i} (${day.dayName}): Lunch and Dinner are identical (${lunch.id})`
      );
    }

    // Consecutive-day non-repetition: no consecutive duplicate meal sets
    if (i > 0) {
      const prevDay = plan[i - 1];
      const prevLunch = prevDay.meals?.lunch;
      const prevDinner = prevDay.meals?.dinner;

      if (prevLunch && lunch.id === prevLunch.id) {
        violations.push(
          `Consecutive repeat: Lunch on day ${i} (${lunch.id}) repeats day ${i - 1} lunch`
        );
      }
      if (prevDinner && dinner.id === prevDinner.id) {
        violations.push(
          `Consecutive repeat: Dinner on day ${i} (${dinner.id}) repeats day ${i - 1} dinner`
        );
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Invariant 3: Clean VND Integer Rounding
 * Verifies all scaled costs and targets are integer multiples of 1,000 VND without floats or NaN.
 */
export function verifyCleanVnd(
  plan: GeneratedDayPlan[]
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  plan.forEach((day, idx) => {
    if (!Number.isInteger(day.scaledDayCost) || day.scaledDayCost <= 0) {
      violations.push(`Day ${idx}: scaledDayCost (${day.scaledDayCost}) is not a positive integer`);
    } else if (day.scaledDayCost % 1000 !== 0) {
      violations.push(`Day ${idx}: scaledDayCost (${day.scaledDayCost}) is not a multiple of 1,000 VND`);
    }

    if (!Number.isInteger(day.dailyBudgetTarget) || day.dailyBudgetTarget <= 0) {
      violations.push(`Day ${idx}: dailyBudgetTarget (${day.dailyBudgetTarget}) is not a positive integer`);
    } else if (day.dailyBudgetTarget % 1000 !== 0) {
      violations.push(`Day ${idx}: dailyBudgetTarget (${day.dailyBudgetTarget}) is not a multiple of 1,000 VND`);
    }

    if (day.unscaledDayCost != null) {
      if (!Number.isInteger(day.unscaledDayCost) || day.unscaledDayCost <= 0) {
        violations.push(`Day ${idx}: unscaledDayCost (${day.unscaledDayCost}) is not a positive integer`);
      } else if (day.unscaledDayCost % 1000 !== 0) {
        violations.push(`Day ${idx}: unscaledDayCost (${day.unscaledDayCost}) is not a multiple of 1,000 VND`);
      }
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Invariant 4: Three Complete Meals
 * Verifies that every day contains valid breakfast, lunch, and dinner.
 */
export function verifyThreeMeals(
  plan: GeneratedDayPlan[]
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (plan.length !== 7) {
    violations.push(`Plan must have exactly 7 days, received ${plan.length}`);
  }

  plan.forEach((day, idx) => {
    if (!day.meals) {
      violations.push(`Day ${idx}: meals object is undefined`);
      return;
    }
    if (!day.meals.breakfast || !day.meals.breakfast.id || !day.meals.breakfast.title) {
      violations.push(`Day ${idx}: Breakfast is missing or incomplete`);
    }
    if (!day.meals.lunch || !day.meals.lunch.id || !day.meals.lunch.title) {
      violations.push(`Day ${idx}: Lunch is missing or incomplete`);
    }
    if (!day.meals.dinner || !day.meals.dinner.id || !day.meals.dinner.title) {
      violations.push(`Day ${idx}: Dinner is missing or incomplete`);
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}

// 4. Algorithmic Fallback Generator & Engine Loader

/**
 * Pure Reference Multi-Objective Knapsack Generator
 * Used as genuine fallback whenever src/utils/mealPlanGenerator.ts is pending build.
 */
export function generateReferenceMealPlan(options: PlanGeneratorOptions): GeneratedDayPlan[] {
  const safeServings = Math.min(20, Math.max(1, Math.round(options.servings || 4)));
  const scale = safeServings / 4;
  const rate = BUDGET_RATES[options.budgetLevel] || 95000;
  const dailyBudgetTarget = rate * safeServings;
  const budgetCeiling = Math.floor(dailyBudgetTarget * 1.05);

  const specialNeeds = options.specialNeeds || [];
  const isChay = specialNeeds.includes('chay');
  const isGym = specialNeeds.includes('gym-protein');
  const isEatClean = specialNeeds.includes('eat-clean');
  const isSingle = safeServings === 1;
  const isSingleDish = isSingle && options.mealFormat !== 'meal-set';
  const region = options.regionPreference || 'toan-quoc';

  // Step 1: Breakfast pool & budget cap
  const bfastMaxRatio = options.budgetLevel === 'tiet-kiem' ? 0.28 : options.budgetLevel === 'vua-phai' ? 0.32 : 0.38;
  const maxBfastCost = Math.floor(budgetCeiling * bfastMaxRatio);

  let bfastPool = mockRecipes.filter(r => r.category === 'an-sang');
  if (bfastPool.length === 0) bfastPool = [mockRecipes[0]];

  if (isChay) {
    const chayBfast = mockRecipes.filter(
      r => (r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay'))) &&
           (r.category === 'an-sang' || (r.calories || 0) <= 500)
    );
    if (chayBfast.length > 0) bfastPool = chayBfast;
  } else if (isGym) {
    const gymBfast = bfastPool.filter(
      r => (r.calories || 0) >= 400 || r.tags?.some(t => t.toLowerCase().includes('đạm') || t.toLowerCase().includes('bò'))
    );
    if (gymBfast.length > 0) bfastPool = gymBfast;
  }

  let affordableBfast = bfastPool.filter(r => roundToThousandVnd((r.estimatedCostVnd || 25000) * scale) <= maxBfastCost);
  if (affordableBfast.length === 0) {
    affordableBfast = [...bfastPool].sort((a, b) => (a.estimatedCostVnd || 25000) - (b.estimatedCostVnd || 25000)).slice(0, 5);
  }

  const result: GeneratedDayPlan[] = [];
  let prevBfastId = '';
  let prevLunchId = '';
  let prevDinnerId = '';

  if (isSingleDish) {
    // 1-Person Single Dish Mode
    let singlePool = mockRecipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
    if (isChay) {
      const chayDishes = mockRecipes.filter(r => r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay')));
      if (chayDishes.length > 0) singlePool = chayDishes;
    }

    // Sort dishes by relevance score
    const scoredDishes = singlePool.map(r => {
      let score = 0;
      if (r.region === region && region !== 'toan-quoc') score += 8;
      else if (r.region === 'toan-quoc') score += 3;

      if (isGym && ((r.calories || 0) >= 450 || r.tags?.some(t => t.toLowerCase().includes('đạm')))) score += 6;
      if (isEatClean && r.tags?.some(t => t.toLowerCase().includes('eat clean') || t.toLowerCase().includes('healthy'))) score += 6;

      const rawCost = r.estimatedCostVnd || 35000;
      const scaledCost = roundToThousandVnd(rawCost * scale);
      return { item: r, score, rawCost, scaledCost };
    }).sort((a, b) => b.score - a.score);

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const dayMeta = INITIAL_DAYS[dayIdx];

      // Select breakfast
      const unusedBfast = affordableBfast.filter(b => b.id !== prevBfastId);
      const bfastCandidates = unusedBfast.length > 0 ? unusedBfast : affordableBfast;
      const bfast = bfastCandidates[dayIdx % bfastCandidates.length];
      prevBfastId = bfast.id;

      const scaledBfast = roundToThousandVnd((bfast.estimatedCostVnd || 25000) * scale);
      const remBudget = budgetCeiling - scaledBfast;

      // Knapsack pair search: find (L, D) such that L != D, neither equals prevLunch nor prevDinner
      let bestLunch = scoredDishes[0].item;
      let bestDinner = scoredDishes[1]?.item || scoredDishes[0].item;
      let bestScore = -Infinity;
      let found = false;

      for (let i = 0; i < scoredDishes.length; i++) {
        const dishA = scoredDishes[i];
        if (dishA.item.id === prevLunchId || dishA.item.id === prevDinnerId) continue;

        for (let j = 0; j < scoredDishes.length; j++) {
          if (i === j) continue;
          const dishB = scoredDishes[j];
          if (dishB.item.id === prevLunchId || dishB.item.id === prevDinnerId) continue;

          const sum = dishA.scaledCost + dishB.scaledCost;
          if (sum <= remBudget) {
            const scoreSum = dishA.score + dishB.score + (sum / remBudget) * 2;
            if (scoreSum > bestScore || !found) {
              bestScore = scoreSum;
              bestLunch = dishA.item;
              bestDinner = dishB.item;
              found = true;
              if (sum >= remBudget * 0.90) break;
            }
          }
        }
        if (found && bestScore >= 18) break;
      }

      // Fallback if no strict non-consecutive pair found
      if (!found) {
        for (let i = 0; i < scoredDishes.length; i++) {
          const dishA = scoredDishes[i];
          for (let j = 0; j < scoredDishes.length; j++) {
            if (i === j) continue;
            const dishB = scoredDishes[j];
            const sum = dishA.scaledCost + dishB.scaledCost;
            if (sum <= remBudget) {
              bestLunch = dishA.item;
              bestDinner = dishB.item;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      prevLunchId = bestLunch.id;
      prevDinnerId = bestDinner.id;

      const unscaledLunch = roundToThousandVnd(bestLunch.estimatedCostVnd || 35000);
      const unscaledDinner = roundToThousandVnd(bestDinner.estimatedCostVnd || 35000);
      const scaledLunch = roundToThousandVnd(unscaledLunch * scale);
      const scaledDinner = roundToThousandVnd(unscaledDinner * scale);
      const unscaledBfast = roundToThousandVnd(bfast.estimatedCostVnd || 25000);

      const scaledDayCost = scaledBfast + scaledLunch + scaledDinner;
      const unscaledDayCost = unscaledBfast + unscaledLunch + unscaledDinner;

      result.push({
        dayId: dayMeta.dayId,
        dayName: dayMeta.dayName,
        meals: {
          breakfast: bfast,
          lunch: bestLunch,
          dinner: bestDinner
        },
        unscaledDayCost,
        scaledDayCost,
        dailyBudgetTarget,
        isOverBudget: scaledDayCost > Math.floor(dailyBudgetTarget * 1.1)
      });
    }
  } else {
    // Meal-Set Mode (Multi-Person or 1P Meal-Set)
    let candidateSets = [...mockMealSets];
    if (isChay) {
      candidateSets = mockMealSets.filter(s => s.region === 'chay' || s.tags?.some(t => t.toLowerCase().includes('chay')));
    }

    const scoredSets = candidateSets.map(s => {
      let score = 0;
      if (s.region === region && region !== 'toan-quoc') score += 10;
      else if (s.region === 'toan-quoc') score += 4;

      if (isGym && s.tags?.some(t => t.toLowerCase().includes('đạm') || t.toLowerCase().includes('gym'))) score += 6;
      if (isEatClean && s.tags?.some(t => t.toLowerCase().includes('eat clean') || t.toLowerCase().includes('healthy'))) score += 6;

      const rawCost = s.totalCostVnd;
      const scaledCost = roundToThousandVnd(rawCost * scale);
      return { item: s, score, rawCost, scaledCost };
    }).sort((a, b) => b.score - a.score);

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const dayMeta = INITIAL_DAYS[dayIdx];

      // Select breakfast
      const unusedBfast = affordableBfast.filter(b => b.id !== prevBfastId);
      const bfastCandidates = unusedBfast.length > 0 ? unusedBfast : affordableBfast;
      const bfast = bfastCandidates[dayIdx % bfastCandidates.length];
      prevBfastId = bfast.id;

      const scaledBfast = roundToThousandVnd((bfast.estimatedCostVnd || 25000) * scale);
      const remBudget = budgetCeiling - scaledBfast;

      // Knapsack pair search: find (L, D) such that L != D, neither equals prevLunch nor prevDinner
      let bestLunch = scoredSets[0].item;
      let bestDinner = scoredSets[1]?.item || scoredSets[0].item;
      let bestScore = -Infinity;
      let found = false;

      for (let i = 0; i < scoredSets.length; i++) {
        const setA = scoredSets[i];
        if (setA.item.id === prevLunchId || setA.item.id === prevDinnerId) continue;

        for (let j = 0; j < scoredSets.length; j++) {
          if (i === j) continue;
          const setB = scoredSets[j];
          if (setB.item.id === prevLunchId || setB.item.id === prevDinnerId) continue;

          const sum = setA.scaledCost + setB.scaledCost;
          if (sum <= remBudget) {
            const scoreSum = setA.score + setB.score + (sum / remBudget) * 2;
            if (scoreSum > bestScore || !found) {
              bestScore = scoreSum;
              bestLunch = setA.item;
              bestDinner = setB.item;
              found = true;
              if (sum >= remBudget * 0.90) break;
            }
          }
        }
        if (found && bestScore >= 20) break;
      }

      // If no pair without consecutive repeat, find any non-identical pair within remBudget
      if (!found) {
        for (let i = 0; i < scoredSets.length; i++) {
          const setA = scoredSets[i];
          for (let j = 0; j < scoredSets.length; j++) {
            if (i === j) continue;
            const setB = scoredSets[j];
            const sum = setA.scaledCost + setB.scaledCost;
            if (sum <= remBudget) {
              bestLunch = setA.item;
              bestDinner = setB.item;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      prevLunchId = bestLunch.id;
      prevDinnerId = bestDinner.id;

      const unscaledLunch = roundToThousandVnd(bestLunch.totalCostVnd);
      const unscaledDinner = roundToThousandVnd(bestDinner.totalCostVnd);
      const scaledLunch = roundToThousandVnd(unscaledLunch * scale);
      const scaledDinner = roundToThousandVnd(unscaledDinner * scale);
      const unscaledBfast = roundToThousandVnd(bfast.estimatedCostVnd || 25000);

      const scaledDayCost = scaledBfast + scaledLunch + scaledDinner;
      const unscaledDayCost = unscaledBfast + unscaledLunch + unscaledDinner;

      result.push({
        dayId: dayMeta.dayId,
        dayName: dayMeta.dayName,
        meals: {
          breakfast: bfast,
          lunch: bestLunch,
          dinner: bestDinner
        },
        unscaledDayCost,
        scaledDayCost,
        dailyBudgetTarget,
        isOverBudget: scaledDayCost > Math.floor(dailyBudgetTarget * 1.1)
      });
    }
  }

  return result;
}

/**
 * Dynamic Generator Loader
 * Loads genuine implementation from src/utils/mealPlanGenerator.ts if present;
 * otherwise falls back gracefully to generateReferenceMealPlan.
 */
export function getMealPlanGenerator(): {
  generator: (options: PlanGeneratorOptions) => GeneratedDayPlan[];
  isPendingBuild: boolean;
  source: string;
} {
  if (typeof generateBudgetCompliantWeeklyPlan === 'function') {
    return {
      generator: generateBudgetCompliantWeeklyPlan as (options: PlanGeneratorOptions) => GeneratedDayPlan[],
      isPendingBuild: false,
      source: 'src/utils/mealPlanGenerator.ts'
    };
  }

  return {
    generator: generateReferenceMealPlan,
    isPendingBuild: true,
    source: 'budgetTestFixtures.ts (reference fallback)'
  };
}
