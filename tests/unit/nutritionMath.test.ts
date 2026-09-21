import { describe, it, expect } from '../helpers/testRunner';
import { Recipe, VietnameseMealSet, DailyMealPlan } from '../../src/types';
import {
  calculateServingsScale,
  calculateDailyNutrition,
  BUDGET_LEVEL_BENCHMARKS,
  evaluateDayBudgetStatus
} from '../helpers/calcUtils';

describe('Unit: Nutrition & Single-Day Budget Warning (nutritionMath)', () => {
  it('should calculate servings scale correctly without floor distortion', () => {
    // 1 person -> 0.25 (not clamped to 0.5)
    expect(calculateServingsScale(1)).toBe(0.25);
    // 2 people -> 0.5
    expect(calculateServingsScale(2)).toBe(0.5);
    // 4 people -> 1.0
    expect(calculateServingsScale(4)).toBe(1.0);
    // 8 people -> 2.0
    expect(calculateServingsScale(8)).toBe(2.0);
    // 20 people -> 5.0
    expect(calculateServingsScale(20)).toBe(5.0);
  });

  it('should sanitize negative, zero, and decimal servings inputs', () => {
    expect(calculateServingsScale(0)).toBe(0.25); // clamped to 1 person
    expect(calculateServingsScale(-5)).toBe(0.25);
    expect(calculateServingsScale(NaN)).toBe(1.0); // fallback to 4 people
    expect(calculateServingsScale(25)).toBe(5.0); // clamped to 20 people
    expect(calculateServingsScale(3.8)).toBe(1.0); // rounded to 4 people
  });

  it('should accumulate calories and protein accurately for meal sets and recipes', () => {
    const dummySet: VietnameseMealSet = {
      id: 'set-1',
      title: 'Mâm Bắc',
      region: 'bac',
      description: '',
      mainDish: {} as any,
      soupDish: {} as any,
      sideDish: {} as any,
      condimentNote: '',
      totalCostVnd: 180000,
      totalCalories: 1600,
      imageUrl: '',
      tags: []
    };

    const dummyRecipe: Recipe = {
      id: 'rec-bf',
      title: 'Phở Bò',
      description: '',
      category: 'an-sang',
      region: 'bac',
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      calories: 500,
      estimatedCostVnd: 70000,
      imageUrl: '',
      ingredients: [],
      instructions: [],
      tags: []
    };

    const day: DailyMealPlan = {
      dayId: 'mon',
      dayName: 'Thứ Hai',
      meals: {
        breakfast: dummyRecipe,
        lunch: dummySet,
        dinner: null
      }
    };

    // Unscaled:
    // Calories: 500 + 1600 = 2100
    // Cost: 70,000 + 180,000 = 250,000
    // Protein: Math.round(500 * 0.045) + Math.round(1600 * 0.045) = 23 + 72 = 95g
    const nutrition = calculateDailyNutrition(day, 4);
    expect(nutrition.unscaledCalories).toBe(2100);
    expect(nutrition.unscaledCost).toBe(250000);
    expect(nutrition.unscaledProtein).toBe(95);
    expect(nutrition.scaledCalories).toBe(2100);
    expect(nutrition.scaledCost).toBe(250000);
    expect(nutrition.scaledProtein).toBe(95);

    // Scaled for 2 servings (scale = 0.5):
    const nutrition2 = calculateDailyNutrition(day, 2);
    expect(nutrition2.scaledCalories).toBe(1050);
    expect(nutrition2.scaledCost).toBe(125000);
    expect(nutrition2.scaledProtein).toBe(48); // Math.round(95 * 0.5)
  });

  it('should evaluate single-day budget warning indicators across all budget tiers', () => {
    // 4 servings, tiet-kiem threshold = 250,000
    const safeCheck = evaluateDayBudgetStatus(200000, 'tiet-kiem', 4);
    expect(safeCheck.status).toBe('safe');
    expect(safeCheck.thresholdVnd).toBe(250000);

    const balancedCheck = evaluateDayBudgetStatus(250000, 'tiet-kiem', 4);
    expect(balancedCheck.status).toBe('balanced');

    const warningCheck = evaluateDayBudgetStatus(290000, 'tiet-kiem', 4);
    expect(warningCheck.status).toBe('warning');

    const dangerCheck = evaluateDayBudgetStatus(350000, 'tiet-kiem', 4);
    expect(dangerCheck.status).toBe('danger');
  });

  it('should scale budget thresholds proportionally when servings change', () => {
    // 2 servings, vua-phai base = 380,000 -> threshold = 190,000
    const checkHalf = evaluateDayBudgetStatus(180000, 'vua-phai', 2);
    expect(checkHalf.thresholdVnd).toBe(190000);
    expect(checkHalf.status).toBe('balanced');

    // 8 servings, thoai-mai base = 550,000 -> threshold = 1,100,000
    const checkDouble = evaluateDayBudgetStatus(1000000, 'thoai-mai', 8);
    expect(checkDouble.thresholdVnd).toBe(1100000);
    expect(checkDouble.status).toBe('balanced');
  });
});
