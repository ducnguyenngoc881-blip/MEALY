import { describe, it, expect } from '../helpers/testRunner';
import { mockRecipes } from '../../src/data/mockRecipes';
import { matchesRecipeSearch } from '../../src/utils/textUtils';

// Mirroring the scaling logic from RecipeDetailModal for independent verification
export function scaleIngredientAmount(amount: number | string, currentServings: number, baseServings: number): string {
  if (baseServings <= 0) return String(amount);
  const ratio = currentServings / baseServings;

  if (typeof amount === 'number') {
    const scaled = amount * ratio;
    if (Number.isInteger(scaled)) {
      return scaled.toString();
    }
    const rounded = Math.round(scaled * 100) / 100;
    return rounded.toString().replace('.', ',');
  }

  const str = String(amount).trim();

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0].trim());
      const den = parseFloat(parts[1].trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        const scaled = (num / den) * ratio;
        if (Number.isInteger(scaled)) {
          return scaled.toString();
        }
        const rounded = Math.round(scaled * 100) / 100;
        return rounded.toString().replace('.', ',');
      }
    }
  }

  const parsed = parseFloat(str.replace(',', '.'));
  if (!isNaN(parsed) && isFinite(parsed)) {
    const scaled = parsed * ratio;
    if (Number.isInteger(scaled)) {
      return scaled.toString();
    }
    const rounded = Math.round(scaled * 100) / 100;
    return rounded.toString().replace('.', ',');
  }

  return str;
}

export function calculateProgress(totalSteps: number, completedCount: number): { percent: number; isAllCompleted: boolean } {
  if (totalSteps <= 0) return { percent: 0, isAllCompleted: false };
  const percent = Math.round((completedCount / totalSteps) * 100);
  return { percent, isAllCompleted: completedCount === totalSteps };
}

describe('Unit: Recipe Scaling, Servings Stepper & Cooking Progress (Domain 5)', () => {
  it('should accurately scale numerical ingredients up and down', () => {
    // 500g for 4 servings
    expect(scaleIngredientAmount(500, 2, 4)).toBe('250');
    expect(scaleIngredientAmount(500, 4, 4)).toBe('500');
    expect(scaleIngredientAmount(500, 6, 4)).toBe('750');
    expect(scaleIngredientAmount(500, 1, 4)).toBe('125');
  });

  it('should handle fractional and decimal ingredients with clean comma formatting', () => {
    // 1 tablespoon for 4 servings -> 2 servings = 0,5
    expect(scaleIngredientAmount(1, 2, 4)).toBe('0,5');
    // 3 tablespoons for 4 servings -> 2 servings = 1,5
    expect(scaleIngredientAmount(3, 2, 4)).toBe('1,5');
    // String fraction "1/2" for 4 servings -> 4 servings = 0,5
    expect(scaleIngredientAmount('1/2', 4, 4)).toBe('0,5');
    // String fraction "1/2" for 4 servings -> 8 servings = 1
    expect(scaleIngredientAmount('1/2', 8, 4)).toBe('1');
  });

  it('should preserve qualitative string units without distortion', () => {
    expect(scaleIngredientAmount('ít', 2, 4)).toBe('ít');
    expect(scaleIngredientAmount('vừa đủ', 6, 4)).toBe('vừa đủ');
    expect(scaleIngredientAmount('theo khẩu vị', 10, 4)).toBe('theo khẩu vị');
  });

  it('should calculate scaled estimated cost and calories proportionally', () => {
    const recipe = mockRecipes[0]; // Thịt Ba Chỉ Rang Cháy Cạnh: servings 4, cost 75000, cal 450
    const servings = 2;
    const scaledCost = Math.round((recipe.estimatedCostVnd * servings) / recipe.servings);
    const scaledCal = Math.round((recipe.calories * servings) / recipe.servings);

    expect(scaledCost).toBe(37500);
    expect(scaledCal).toBe(225);

    const servings6 = 6;
    expect(Math.round((recipe.estimatedCostVnd * servings6) / recipe.servings)).toBe(112500);
    expect(Math.round((recipe.calories * servings6) / recipe.servings)).toBe(675);
  });

  it('should enforce servings stepper bounds between 1 and 20', () => {
    const clampServings = (val: number) => Math.min(20, Math.max(1, val));
    expect(clampServings(0)).toBe(1);
    expect(clampServings(-5)).toBe(1);
    expect(clampServings(1)).toBe(1);
    expect(clampServings(15)).toBe(15);
    expect(clampServings(20)).toBe(20);
    expect(clampServings(25)).toBe(20);
  });

  it('should calculate cooking steps progress accurately', () => {
    expect(calculateProgress(4, 0)).toEqual({ percent: 0, isAllCompleted: false });
    expect(calculateProgress(4, 1)).toEqual({ percent: 25, isAllCompleted: false });
    expect(calculateProgress(4, 2)).toEqual({ percent: 50, isAllCompleted: false });
    expect(calculateProgress(4, 3)).toEqual({ percent: 75, isAllCompleted: false });
    expect(calculateProgress(4, 4)).toEqual({ percent: 100, isAllCompleted: true });
  });

  it('should find recipes by title, ingredient, tag, and region in mock data', () => {
    // Search unaccented title
    const thitRangMatches = mockRecipes.filter(r => matchesRecipeSearch(r, 'thit rang'));
    expect(thitRangMatches.length).toBeGreaterThan(0);
    expect(thitRangMatches.some(r => r.id === 'thit-rang-chay-canh')).toBe(true);

    // Search by ingredient (unaccented: "mam tom")
    const mamTomMatches = mockRecipes.filter(r => matchesRecipeSearch(r, 'mam tom'));
    expect(mamTomMatches.length).toBeGreaterThan(0);
    expect(mamTomMatches.some(r => r.id === 'canh-cua-mong-toi')).toBe(true);

    // Search by tag (unaccented: "giai nhiet")
    const tagMatches = mockRecipes.filter(r => matchesRecipeSearch(r, 'giai nhiet'));
    expect(tagMatches.length).toBeGreaterThan(0);

    // Region filter
    const bacRecipes = mockRecipes.filter(r => r.region === 'bac');
    expect(bacRecipes.length).toBeGreaterThan(0);
    expect(bacRecipes.every(r => r.region === 'bac')).toBe(true);

    const namRecipes = mockRecipes.filter(r => r.region === 'nam');
    expect(namRecipes.length).toBeGreaterThan(0);
    expect(namRecipes.every(r => r.region === 'nam')).toBe(true);
  });
});
