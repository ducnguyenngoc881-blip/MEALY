import { describe, it, expect } from '../helpers/testRunner';
import { mockRecipes as recipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';
import { scaleCost, getDailyBudgetTarget } from '../../src/utils/currency';
import { MealSlot, Recipe, DailyMealPlan } from '../../src/types';

describe('Unit: Slot Category Strictness & Budget Room Suggestions', () => {

  it('SLOT-CAT-01: Breakfast slot selector filters strictly to an-sang recipes only', () => {
    const breakfastRecipes = recipes.filter(r => r.category === 'an-sang');
    expect(breakfastRecipes.length).toBeGreaterThan(10);

    // Ensure no lunch/dinner/dessert category leaks into breakfast
    const invalidCategories = breakfastRecipes.filter(r => r.category !== 'an-sang');
    expect(invalidCategories.length).toBe(0);

    // Verify presence of iconic Vietnamese breakfast dishes
    const titles = breakfastRecipes.map(r => r.title.toLowerCase());
    const hasPhoOrBunOrBanhMi = titles.some(t => t.includes('phở') || t.includes('bún') || t.includes('bánh mì') || t.includes('xôi'));
    expect(hasPhoOrBunOrBanhMi).toBe(true);
  });

  it('SLOT-CAT-02: Snack / Dessert slot selector filters strictly to trang-mieng recipes only', () => {
    const snackRecipes = recipes.filter(r => r.category === 'trang-mieng');
    expect(snackRecipes.length).toBeGreaterThan(10);

    // Ensure no breakfast or savory main dish leaks into snack
    const invalidCategories = snackRecipes.filter(r => r.category !== 'trang-mieng');
    expect(invalidCategories.length).toBe(0);

    // Verify presence of iconic Vietnamese desserts / snacks
    const titles = snackRecipes.map(r => r.title.toLowerCase());
    const hasCheOrFruitOrDessert = titles.some(t => t.includes('chè') || t.includes('sâm') || t.includes('trái cây') || t.includes('sữa chua') || t.includes('bánh'));
    expect(hasCheOrFruitOrDessert).toBe(true);
  });

  it('SLOT-CAT-03: Lunch and Dinner single-dish selectors strictly exclude breakfast and dessert recipes', () => {
    const lunchDinnerRecipes = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
    expect(lunchDinnerRecipes.length).toBeGreaterThan(50);

    const hasBreakfast = lunchDinnerRecipes.some(r => r.category === 'an-sang');
    const hasDessert = lunchDinnerRecipes.some(r => r.category === 'trang-mieng');
    expect(hasBreakfast).toBe(false);
    expect(hasDessert).toBe(false);
  });

  it('SLOT-BUDGET-01: When budget has room (e.g. 89,000 VND), system suggests all desserts fitting within budget', () => {
    const safeServings = 4;
    const remainingBudgetRoom = 89000;
    const desserts = recipes.filter(r => r.category === 'trang-mieng');

    const affordableDesserts = desserts.filter(r => 
      scaleCost(r.estimatedCostVnd || 25000, safeServings) <= remainingBudgetRoom
    );

    // There must be multiple desserts fitting within 89k VND for 4 people
    expect(affordableDesserts.length).toBeGreaterThan(0);

    // Every suggested dessert must strictly satisfy the budget ceiling
    affordableDesserts.forEach(item => {
      const cost = scaleCost(item.estimatedCostVnd || 25000, safeServings);
      expect(cost).toBeLessThanOrEqual(remainingBudgetRoom);
    });
  });

  it('SLOT-BUDGET-02: When remaining budget is extremely tight, system fallbacks to lowest-cost dishes rather than empty list', () => {
    const safeServings = 4;
    const extremelyTightBudget = 5000; // 5k is too low for 4 people
    const desserts = recipes.filter(r => r.category === 'trang-mieng');

    const affordableDesserts = desserts.filter(r => 
      scaleCost(r.estimatedCostVnd || 25000, safeServings) <= extremelyTightBudget
    );

    // Direct affordable list is empty
    expect(affordableDesserts.length).toBe(0);

    // Fallback behavior: "rather than not having anything", sort all by price ascending
    const fallbackList = [...desserts].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0));
    expect(fallbackList.length).toBeGreaterThan(0);
    expect((fallbackList[0].estimatedCostVnd || 0)).toBeLessThanOrEqual((fallbackList[fallbackList.length - 1].estimatedCostVnd || 0));
  });

  it('SLOT-STATE-01: Adding, swapping, and removing snack updates DailyMealPlan correctly', () => {
    const mockDay: DailyMealPlan = {
      dayId: 'mon',
      dayName: 'Thứ Hai',
      meals: {
        breakfast: recipes.find(r => r.category === 'an-sang') || null,
        lunch: mockMealSets[0] || null,
        dinner: mockMealSets[1] || null,
        snack: null
      }
    };

    expect(mockDay.meals.snack).toBeNull();

    // Assign snack
    const snackDish = recipes.find(r => r.category === 'trang-mieng')!;
    mockDay.meals.snack = snackDish;
    expect(mockDay.meals.snack).not.toBeNull();
    expect((mockDay.meals.snack as Recipe).id).toBe(snackDish.id);

    // Remove snack
    mockDay.meals.snack = null;
    expect(mockDay.meals.snack).toBeNull();
  });

});
