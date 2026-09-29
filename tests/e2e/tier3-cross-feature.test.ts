import { describe, it, expect, beforeEach } from '../helpers/testRunner';
import { mockRecipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';
import { CORPORATE_PARTY_PRESETS } from '../../src/data/corporatePartyPresets';
import {
  Recipe,
  VietnameseMealSet,
  DailyMealPlan,
  OnboardingData,
  CustomPartyPlan,
  StoreChannel
} from '../../src/types';
import {
  calculateDailyNutrition,
  calculateServingsScale,
  evaluateDayBudgetStatus,
  aggregateIngredients,
  simulateStorePrice,
  formatZaloShoppingList,
  calculateCateringFinancials,
  calculateTables
} from '../helpers/calcUtils';
import { getContrastRatio, isWcagAaCompliant } from '../helpers/contrastMath';
import { MockLocalStorage, setupMockStorage } from '../helpers/mockStorage';

describe('Tier 3: Cross-Feature Combinations & State Synchronization', () => {
  let storage: MockLocalStorage;

  beforeEach(() => {
    storage = setupMockStorage();
  });

  it('T3-01: Onboarding budget level ("tiet-kiem") triggers budget warning on expensive meals in WeeklyBoard', () => {
    // 1. User sets budget level to tiet-kiem in Onboarding
    const onboarding: OnboardingData = {
      regionPreference: 'bac',
      familySize: 4,
      budgetLevel: 'tiet-kiem', // Base threshold: 250,000 VND
      specialNeeds: [],
      completed: true
    };

    // 2. Meal with high cost is placed on Tuesday
    const expensiveDay: DailyMealPlan = {
      dayId: 'tue',
      dayName: 'Thứ Ba',
      meals: {
        breakfast: mockRecipes[0], // ~35,000
        lunch: mockMealSets[0],   // ~180,000
        dinner: mockMealSets[1]   // ~190,000
      }
    };

    const nutrition = calculateDailyNutrition(expensiveDay, 4);
    // Total cost: ~405,000 > 250,000
    const budgetEval = evaluateDayBudgetStatus(nutrition.scaledCost, onboarding.budgetLevel, 4);

    expect(budgetEval.thresholdVnd).toBe(250000);
    expect(budgetEval.status).toBe('danger');
    expect(budgetEval.ratio).toBeGreaterThan(1.25);
  });

  it('T3-02: MealSet slot assignment to Tuesday Lunch updates WeeklyBoard daily nutrition and cost', () => {
    const dayPlan: DailyMealPlan = {
      dayId: 'tue',
      dayName: 'Thứ Ba',
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null
      }
    };

    // Initially 0
    const initialNutr = calculateDailyNutrition(dayPlan, 4);
    expect(initialNutr.unscaledCalories).toBe(0);
    expect(initialNutr.unscaledCost).toBe(0);

    // Assign MealSet
    const targetSet = mockMealSets[0];
    dayPlan.meals.lunch = targetSet;

    const updatedNutr = calculateDailyNutrition(dayPlan, 4);
    expect(updatedNutr.unscaledCalories).toBe(targetSet.totalCalories);
    expect(updatedNutr.unscaledCost).toBe(targetSet.totalCostVnd);
  });

  it('T3-03: MealSet slot assignment synchronizes with GroceryList ingredient aggregation', () => {
    const targetSet = mockMealSets[0];
    const componentRecipes = [targetSet.mainDish, targetSet.soupDish, targetSet.sideDish];

    const input = componentRecipes.flatMap(r =>
      r.ingredients.map(ing => ({
        ingredient: ing,
        recipeCost: r.estimatedCostVnd,
        totalIngredientsCount: r.ingredients.length
      }))
    );

    const aggregated = aggregateIngredients(input);
    expect(aggregated.items.length).toBeGreaterThanOrEqual(componentRecipes.length);
    expect(aggregated.totalCostEstimate).toBeGreaterThan(0);
  });

  it('T3-04: CateringPartyPlanner dish selection pushes scaled ingredients with [Tiệc] prefix to GroceryList', () => {
    const partyRecipe = mockRecipes[0];
    const guestCount = 20; // 5x scale for 4 servings
    const factor = guestCount / (partyRecipe.servings || 4);

    const cateringIngredients = partyRecipe.ingredients.map(ing => {
      const num = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount as string) || 1;
      return {
        ingredient: {
          ...ing,
          name: `[Tiệc] ${ing.name}`,
          amount: Math.round(num * factor * 10) / 10
        },
        recipeCost: Math.round((partyRecipe.estimatedCostVnd || 40000) * factor),
        totalIngredientsCount: partyRecipe.ingredients.length
      };
    });

    const groceryResult = aggregateIngredients(cateringIngredients);
    expect(groceryResult.items.every(i => i.name.startsWith('[Tiệc]'))).toBe(true);
    // Amount scaled by 5x
    const originalAmount = Number(partyRecipe.ingredients[0].amount) || 1;
    expect(groceryResult.items[0].amount).toBeCloseTo(originalAmount * 5, 0);
  });

  it('T3-05: Merged GroceryList combines catering ingredients and weekly plan ingredients accurately', () => {
    const weeklyRecipe = mockRecipes[1];
    const cateringRecipe = mockRecipes[0];

    const weeklyInput = weeklyRecipe.ingredients.map(ing => ({
      ingredient: ing,
      recipeCost: weeklyRecipe.estimatedCostVnd,
      totalIngredientsCount: weeklyRecipe.ingredients.length
    }));

    const cateringInput = cateringRecipe.ingredients.map(ing => ({
      ingredient: { ...ing, name: `[Tiệc] ${ing.name}` },
      recipeCost: cateringRecipe.estimatedCostVnd * 2,
      totalIngredientsCount: cateringRecipe.ingredients.length
    }));

    const combined = aggregateIngredients([...weeklyInput, ...cateringInput]);
    const expectedCost = weeklyRecipe.estimatedCostVnd + cateringRecipe.estimatedCostVnd * 2;
    expect(Math.abs(combined.totalCostEstimate - expectedCost) <= 10).toBe(true);
  });

  it('T3-06: Recipe Detail servings scaling (8 servings) applied to WeeklyBoard scales nutrition and cost', () => {
    const customRecipe = mockRecipes[2];
    const day: DailyMealPlan = {
      dayId: 'wed',
      dayName: 'Thứ Tư',
      meals: {
        breakfast: customRecipe,
        lunch: null,
        dinner: null
      }
    };

    // Calculate at 8 servings
    const nutr8 = calculateDailyNutrition(day, 8);
    // Calculate at 4 servings
    const nutr4 = calculateDailyNutrition(day, 4);

    expect(nutr8.scaledCost).toBe(nutr4.scaledCost * 2);
    expect(nutr8.scaledCalories).toBe(nutr4.scaledCalories * 2);
    expect(nutr8.scale).toBe(2.0);
  });

  it('T3-07: Light/Dark theme switch while Onboarding modal is open preserves WCAG AA contrast', () => {
    const lightText = '#0f172a';
    const lightBg = '#ffffff';
    const darkText = '#f8fafc';
    const darkBg = '#0f172a';

    // In Light mode
    expect(isWcagAaCompliant(lightText, lightBg)).toBe(true);
    expect(getContrastRatio(lightText, lightBg)).toBeGreaterThan(10);

    // Toggle to Dark mode
    storage.setItem('mealwise_theme', 'dark');
    expect(isWcagAaCompliant(darkText, darkBg)).toBe(true);
    expect(getContrastRatio(darkText, darkBg)).toBeGreaterThan(10);
  });

  it('T3-08: GroceryList item checkoff state persistence key mealwise_grocery_checked round-trips', () => {
    const checkedState: Record<string, boolean> = {
      'Thịt ba chỉ': true,
      'Cua đồng xay': false,
      'Rau mồng tơi': true
    };

    storage.setItem('mealwise_grocery_checked', JSON.stringify(checkedState));

    // Simulate tab change or refresh
    const loaded = JSON.parse(storage.getItem('mealwise_grocery_checked') || '{}');
    expect(loaded['Thịt ba chỉ']).toBe(true);
    expect(loaded['Cua đồng xay']).toBe(false);
    expect(loaded['Rau mồng tơi']).toBe(true);
  });

  it('T3-09: WeeklyPlan localStorage persistence key mealwise_weekly_plan round-trips across simulated reload', () => {
    const modifiedPlan: DailyMealPlan[] = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: mockRecipes[0],
          lunch: mockMealSets[2],
          dinner: null
        }
      }
    ];

    storage.setItem('mealwise_weekly_plan', JSON.stringify(modifiedPlan));

    const restored: DailyMealPlan[] = JSON.parse(storage.getItem('mealwise_weekly_plan') || '[]');
    expect(restored.length).toBe(1);
    expect(restored[0].dayId).toBe('mon');
    expect((restored[0].meals.lunch as VietnameseMealSet).id).toBe(mockMealSets[2].id);
  });

  it('T3-10: Onboarding preferences initialize default servings and regional preferences', () => {
    const userPrefs: OnboardingData = {
      regionPreference: 'nam',
      familySize: 6,
      budgetLevel: 'thoai-mai',
      specialNeeds: ['nhieu-rau'],
      completed: true
    };

    storage.setItem('mealwise_onboarding', JSON.stringify(userPrefs));

    const restored: OnboardingData = JSON.parse(storage.getItem('mealwise_onboarding') || '{}');
    const scale = calculateServingsScale(restored.familySize);

    expect(scale).toBe(1.5); // 6 / 4 = 1.5
    expect(restored.regionPreference).toBe('nam');
  });

  it('T3-11: Catering preset application updates dishes, drinks, and equipment checklist in tandem', () => {
    const preset = CORPORATE_PARTY_PRESETS[0];

    const partyPlan: CustomPartyPlan = {
      id: `party-${Date.now()}`,
      title: preset.title,
      eventType: 'corporate',
      guestCount: preset.defaultGuestCount,
      tableSize: 10,
      budgetPerHeadVnd: preset.suggestedPerHeadBudgetVnd,
      dishes: preset.menuRecipes.map((r, idx) => ({
        recipeId: r.id,
        course: idx === 0 ? 'appetizer' : idx === 1 ? 'main' : 'soup_hotpot'
      })),
      recommendedDrinks: [...preset.recommendedDrinks],
      equipmentChecklist: preset.equipmentChecklist.map(eq => ({ ...eq }))
    };

    expect(partyPlan.dishes.length).toBe(preset.menuRecipes.length);
    expect(partyPlan.recommendedDrinks.length).toBe(preset.recommendedDrinks.length);
    expect(partyPlan.equipmentChecklist.length).toBe(preset.equipmentChecklist.length);

    const fin = calculateCateringFinancials({
      guestCount: partyPlan.guestCount,
      tableSize: partyPlan.tableSize,
      budgetPerHead: partyPlan.budgetPerHeadVnd,
      dishes: partyPlan.dishes,
      recipeLookup: id => mockRecipes.find(r => r.id === id)
    });

    expect(fin.totalRevenue).toBe(partyPlan.guestCount * partyPlan.budgetPerHeadVnd);
    expect(fin.roundedFoodCost).toBeGreaterThan(0);
  });

  it('T3-12: Grocery 4-channel store filtering with online price simulation multipliers applied to combined list', () => {
    const recipe = mockRecipes[0];
    const items = recipe.ingredients.map(ing => ({
      ingredient: ing,
      recipeCost: recipe.estimatedCostVnd,
      totalIngredientsCount: recipe.ingredients.length
    }));

    const agg = aggregateIngredients(items);
    const baseCost = agg.totalCostEstimate;

    const choDanSinhCost = simulateStorePrice(baseCost, 'cho-dan-sinh');
    const winMartCost = simulateStorePrice(baseCost, 'winmart');
    const bachHoaXanhCost = simulateStorePrice(baseCost, 'bach-hoa-xanh');
    const sapDoiTacCost = simulateStorePrice(baseCost, 'sap-doi-tac');

    expect(choDanSinhCost).toBeLessThan(baseCost);
    expect(winMartCost).toBeGreaterThan(baseCost);
    expect(bachHoaXanhCost).toBeGreaterThan(baseCost);
    expect(sapDoiTacCost).toBeLessThan(baseCost);
  });
});
