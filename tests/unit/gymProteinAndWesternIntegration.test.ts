import { describe, it, expect } from '../helpers/testRunner';
import { generateBudgetCompliantWeeklyPlan } from '../../src/utils/mealPlanGenerator';
import { estimateRecipeProtein, estimateMealSetProtein, calculateGymProteinTarget } from '../../src/utils/nutritionMath';
import { mockRecipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';

describe('Unit: Gym Protein & Western Food Integration', () => {
  it('GYM-01: Correctly estimates protein from recipe ingredients and protein categories', () => {
    // Recipe with 500g meat
    const steakRecipe = mockRecipes.find(r => /bít tết|steak|thịt ba chỉ/i.test(r.title));
    expect(steakRecipe).toBeDefined();
    if (steakRecipe) {
      const p = estimateRecipeProtein(steakRecipe);
      expect(p).toBeGreaterThanOrEqual(60); // 500g meat yields 80g+ protein
    }

    // Tofu / plant dish
    const tofuRecipe = mockRecipes.find(r => /đậu hũ chiên sả ớt/i.test(r.title));
    expect(tofuRecipe).toBeDefined();
    if (tofuRecipe) {
      const p = estimateRecipeProtein(tofuRecipe);
      expect(p).toBeGreaterThanOrEqual(25);
    }
  });

  it('GYM-02: Accurately estimates protein for Vietnamese 3-dish meal sets', () => {
    const steakSet = mockMealSets.find(s => s.id.startsWith('mam-com-au-steak'));
    expect(steakSet).toBeDefined();
    if (steakSet) {
      const setProtein = estimateMealSetProtein(steakSet);
      expect(setProtein).toBeGreaterThanOrEqual(80);
    }
  });

  it('GYM-03: Scales protein target proportionally to active home-cooked meals (2 meals vs 3 meals)', () => {
    // 4 people, 3 meals (breakfast, lunch, dinner)
    expect(calculateGymProteinTarget(4, 3)).toBe(280);
    // 4 people, 2 meals (lunch skipped - e.g. bento / bán trú)
    expect(calculateGymProteinTarget(4, 2)).toBe(200);
    // 1 person, 2 meals
    expect(calculateGymProteinTarget(1, 2)).toBe(50);
    // 1 person, 3 meals
    expect(calculateGymProteinTarget(1, 3)).toBe(70);
  });

  it('GYM-04: When gym-protein and western-food are both chosen, generates high-protein Western meals (not plain carbs)', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'thoai-mai',
      regionPreference: 'all',
      specialNeeds: ['gym-protein', 'western-food'],
      weekdayLunchRoutine: 'hop-com-van-phong',
      seed: 98765
    });

    expect(plan.length).toBe(7);

    plan.forEach(day => {
      const bfast = day.meals.breakfast;
      expect(bfast).toBeDefined();
      // Breakfast must NOT be plain garlic bread without protein
      const isPlainGarlicBread = bfast.title.toLowerCase().includes('bơ tỏi') && !/tôm|bò|thịt|gà|trứng|cá|hải sản/i.test(bfast.title);
      expect(isPlainGarlicBread).toBe(false);

      // Dinner must be a Western meal set
      const dinner = day.meals.dinner;
      expect(dinner).toBeDefined();
      expect(dinner.id).toMatch(/^mam-com-au-/);

      // Total protein of home meals should be substantial
      const bProtein = estimateRecipeProtein(bfast);
      const dProtein = estimateMealSetProtein(dinner as any);
      const totalDayProtein = bProtein + dProtein;
      expect(totalDayProtein).toBeGreaterThanOrEqual(140); // >= 35g/person for 2 meals
    });
  });
});
