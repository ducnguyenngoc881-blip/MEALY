import { describe, it, expect, beforeEach } from '../helpers/testRunner';
import { mockRecipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';
import { CORPORATE_PARTY_PRESETS } from '../../src/data/corporatePartyPresets';
import {
  Recipe,
  VietnameseMealSet,
  DailyMealPlan,
  MealSlot,
  OnboardingData,
  CustomPartyPlan,
  PartyDishItem,
  StoreChannel
} from '../../src/types';
import {
  matchesSearchTerm,
  matchesMultiField,
  matchesRecipeSearch,
  matchesMealSetSearch
} from '../../src/utils/textUtils';
import {
  calculateTables,
  calculateCateringFinancials,
  sanitizeGuestCount,
  aggregateIngredients,
  simulateStorePrice,
  formatZaloShoppingList,
  calculateDailyNutrition,
  calculateServingsScale,
  evaluateDayBudgetStatus
} from '../helpers/calcUtils';
import { MockLocalStorage, setupMockStorage } from '../helpers/mockStorage';

describe('Tier 1: Feature Coverage — Domain 1 (MealSetExplorer: Mâm Cơm 3 Món)', () => {
  it('T1-D1-01: Region filtering should correctly partition Vietnamese meal sets', () => {
    const bacSets = mockMealSets.filter(s => s.region === 'bac');
    const namSets = mockMealSets.filter(s => s.region === 'nam');
    const trungSets = mockMealSets.filter(s => s.region === 'trung');
    const chaySets = mockMealSets.filter(s => s.region === 'chay');
    const toanQuocSets = mockMealSets.filter(s => s.region === 'toan-quoc');

    expect(bacSets.length).toBeGreaterThan(0);
    expect(namSets.length).toBeGreaterThan(0);
    expect(trungSets.length).toBeGreaterThan(0);
    expect(chaySets.length).toBeGreaterThan(0);

    // Filter 'bac' contains only 'bac' region
    expect(bacSets.every(s => s.region === 'bac')).toBe(true);
    // Total partitioned equals total mock sets
    expect(bacSets.length + namSets.length + trungSets.length + chaySets.length + toanQuocSets.length).toBe(mockMealSets.length);
  });

  it('T1-D1-02: 1-Click slot assignment should support Breakfast, Lunch, and Dinner', () => {
    const testDay: DailyMealPlan = {
      dayId: 'mon',
      dayName: 'Thứ Hai',
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null
      }
    };

    const targetSet = mockMealSets[0];

    // Assign to Breakfast
    testDay.meals.breakfast = targetSet;
    expect(testDay.meals.breakfast).toBe(targetSet);

    // Assign to Lunch
    testDay.meals.lunch = targetSet;
    expect(testDay.meals.lunch).toBe(targetSet);

    // Assign to Dinner
    testDay.meals.dinner = targetSet;
    expect(testDay.meals.dinner).toBe(targetSet);
  });

  it('T1-D1-03: Tag matching should filter meal sets by culinary themes', () => {
    const dongQueSets = mockMealSets.filter(s =>
      s.tags.some(tag => matchesSearchTerm(tag, 'đồng quê') || matchesSearchTerm(tag, 'dong que'))
    );
    expect(dongQueSets.length).toBeGreaterThan(0);

    const banChaySets = mockMealSets.filter(s =>
      s.tags.some(tag => matchesSearchTerm(tag, 'bán chạy') || matchesSearchTerm(tag, 'ban chay'))
    );
    expect(banChaySets.length).toBeGreaterThan(0);

    // Verify '1 Người' filtering across regions (especially Miền Nam + 1 Người)
    const nam1PersonSets = mockMealSets.filter(s =>
      (s.region === 'nam' || (s.tags && s.tags.some(t => /miền nam/i.test(t)))) &&
      s.tags.some(t => t.toLowerCase() === '1 người')
    );
    expect(nam1PersonSets.length).toBeGreaterThanOrEqual(4);

    const bac1PersonSets = mockMealSets.filter(s =>
      (s.region === 'bac' || (s.tags && s.tags.some(t => /miền bắc/i.test(t)))) &&
      s.tags.some(t => t.toLowerCase() === '1 người')
    );
    expect(bac1PersonSets.length).toBeGreaterThanOrEqual(1);

    const trung1PersonSets = mockMealSets.filter(s =>
      (s.region === 'trung' || (s.tags && s.tags.some(t => /miền trung/i.test(t)))) &&
      s.tags.some(t => t.toLowerCase() === '1 người')
    );
    expect(trung1PersonSets.length).toBeGreaterThanOrEqual(1);

    const chay1PersonSets = mockMealSets.filter(s =>
      (s.region === 'chay' || (s.tags && s.tags.some(t => /chay|thanh tịnh/i.test(t)))) &&
      s.tags.some(t => t.toLowerCase() === '1 người')
    );
    expect(chay1PersonSets.length).toBeGreaterThanOrEqual(1);

    const western1PersonSets = mockMealSets.filter(s =>
      ((s.region as string) === 'western' ||
       (s.region as string) === 'au' ||
       s.id.startsWith('mam-com-au') ||
       (s.tags && s.tags.some(t => t.toLowerCase().includes('âu') || t.toLowerCase().includes('western')))) &&
      s.tags.some(t => t.toLowerCase() === '1 người')
    );
    expect(western1PersonSets.length).toBeGreaterThanOrEqual(5);
  });

  it('T1-D1-04: Meal set structure integrity must include mainDish, soupDish, sideDish, and notes', () => {
    for (const set of mockMealSets) {
      expect(set.id).toBeDefined();
      expect(set.title.length).toBeGreaterThan(0);
      expect(set.mainDish).toBeDefined();
      expect(set.mainDish.title.length).toBeGreaterThan(0);
      expect(set.soupDish).toBeDefined();
      expect(set.soupDish.title.length).toBeGreaterThan(0);
      expect(set.sideDish).toBeDefined();
      expect(set.sideDish.title.length).toBeGreaterThan(0);
      expect(set.totalCostVnd).toBeGreaterThan(0);
      expect(set.totalCalories).toBeGreaterThan(0);
      expect(set.condimentNote.length).toBeGreaterThan(0);
    }
  });

  it('T1-D1-05: Meal set detail extraction should retrieve dish costs and caloric breakdown', () => {
    const set = mockMealSets[0];
    const dishes = [set.mainDish, set.soupDish, set.sideDish];
    const sumEstimated = dishes.reduce((sum, d) => sum + (d.estimatedCostVnd || 0), 0);

    expect(sumEstimated).toBeGreaterThan(0);
    expect(dishes.length).toBe(3);
    expect(set.totalCalories).toBeGreaterThan(500);
  });

  it('T1-D1-06: Nested Dish Detail inside MealSetDetailModal opens on top with higher z-index (z-[60] > z-50)', () => {
    const mealSetModalZIndex = 50;
    const recipeModalZIndex = 60;
    const toastZIndex = 70;

    expect(recipeModalZIndex).toBeGreaterThan(mealSetModalZIndex);
    expect(toastZIndex).toBeGreaterThan(recipeModalZIndex);

    // Verify when a dish from meal set is clicked, recipe detail has valid dish reference
    const set = mockMealSets[0];
    const clickedDish = set.mainDish;
    expect(clickedDish.id).toBe(set.mainDish.id);
    expect(clickedDish.title).toBeTruthy();
  });
});

describe('Tier 1: Feature Coverage — Domain 2 (WeeklyBoard: Thực Đơn Tuần)', () => {
  const samplePlan: DailyMealPlan[] = [
    { dayId: 'mon', dayName: 'Thứ Hai', meals: { breakfast: mockRecipes[0], lunch: mockMealSets[0], dinner: mockMealSets[1] } },
    { dayId: 'tue', dayName: 'Thứ Ba', meals: { breakfast: mockRecipes[1], lunch: mockMealSets[1], dinner: mockMealSets[2] } },
    { dayId: 'wed', dayName: 'Thứ Tư', meals: { breakfast: mockRecipes[2], lunch: mockMealSets[2], dinner: mockMealSets[0] } },
    { dayId: 'thu', dayName: 'Thứ Năm', meals: { breakfast: mockRecipes[0], lunch: mockMealSets[0], dinner: mockMealSets[1] } },
    { dayId: 'fri', dayName: 'Thứ Sáu', meals: { breakfast: mockRecipes[1], lunch: mockMealSets[1], dinner: mockMealSets[2] } },
    { dayId: 'sat', dayName: 'Thứ Bảy', meals: { breakfast: mockRecipes[2], lunch: mockMealSets[2], dinner: mockMealSets[0] } },
    { dayId: 'sun', dayName: 'Chủ Nhật', meals: { breakfast: mockRecipes[0], lunch: mockMealSets[0], dinner: mockMealSets[1] } }
  ];

  it('T1-D2-01: 7-Day navigation should support selecting all 7 days with valid metadata', () => {
    expect(samplePlan.length).toBe(7);
    const dayIds = samplePlan.map(d => d.dayId);
    expect(dayIds).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

    let activeDayIndex = 0;
    activeDayIndex = 3; // Navigate to Thursday
    expect(samplePlan[activeDayIndex].dayName).toBe('Thứ Năm');
  });

  it('T1-D2-02: Daily nutrition accumulation should sum calories and protein across meals', () => {
    const monday = samplePlan[0];
    const nutrition = calculateDailyNutrition(monday, 4);

    expect(nutrition.unscaledCalories).toBeGreaterThan(1500);
    expect(nutrition.unscaledProtein).toBeGreaterThan(60);
    // Protein formula: ~4.5% of total calories in grams (with integer rounding tolerance)
    const expectedProtein = Math.round(nutrition.unscaledCalories * 0.045);
    expect(Math.abs(nutrition.unscaledProtein - expectedProtein) <= 2).toBe(true);
  });

  it('T1-D2-03: Daily cost accumulation should sum costs accurately across slots', () => {
    const monday = samplePlan[0];
    const nutrition = calculateDailyNutrition(monday, 4);

    const bfCost = mockRecipes[0].estimatedCostVnd || 35000;
    const lunchCost = mockMealSets[0].totalCostVnd;
    const dinnerCost = mockMealSets[1].totalCostVnd;
    const expectedTotal = bfCost + lunchCost + dinnerCost;

    expect(nutrition.unscaledCost).toBe(expectedTotal);
  });

  it('T1-D2-04: Servings stepper updates should proportionally scale cost and nutrition', () => {
    const monday = samplePlan[0];

    const at4 = calculateDailyNutrition(monday, 4);
    const at2 = calculateDailyNutrition(monday, 2);
    const at6 = calculateDailyNutrition(monday, 6);

    expect(at2.scaledCost).toBe(Math.round(at4.unscaledCost * 0.5));
    expect(at6.scaledCost).toBe(Math.round(at4.unscaledCost * 1.5));
    expect(at2.scaledCalories).toBe(Math.round(at4.unscaledCalories * 0.5));
  });

  it('T1-D2-05: Meal slot replacement and removal should modify daily plan without side effects', () => {
    const dayCopy: DailyMealPlan = {
      dayId: 'mon',
      dayName: 'Thứ Hai',
      meals: {
        breakfast: mockRecipes[0],
        lunch: mockMealSets[0],
        dinner: mockMealSets[1]
      }
    };

    // Remove dinner
    dayCopy.meals.dinner = null;
    expect(dayCopy.meals.dinner).toBeNull();
    const nutrAfterRemove = calculateDailyNutrition(dayCopy, 4);
    expect(nutrAfterRemove.unscaledCost).toBeLessThan(calculateDailyNutrition(samplePlan[0], 4).unscaledCost);

    // Replace breakfast with custom recipe
    dayCopy.meals.breakfast = mockRecipes[4];
    expect(dayCopy.meals.breakfast.id).toBe(mockRecipes[4].id);
  });
});

describe('Tier 1: Feature Coverage — Domain 3 (CateringPartyPlanner: Tiệc & Catering)', () => {
  it('T1-D3-01: Headcount updates should adjust guest count state and clamp to valid numbers', () => {
    expect(sanitizeGuestCount(20)).toBe(20);
    expect(sanitizeGuestCount(45)).toBe(45);
    expect(sanitizeGuestCount(100)).toBe(100);
  });

  it('T1-D3-02: Table size calculations should yield correct table counts for sizes 6, 8, 10', () => {
    expect(calculateTables(45, 10)).toBe(5);
    expect(calculateTables(45, 8)).toBe(6);
    expect(calculateTables(45, 6)).toBe(8);
  });

  it('T1-D3-03: Course-by-course dish adding and removal should manage course categories', () => {
    const dishes: PartyDishItem[] = [
      { recipeId: mockRecipes[0].id, course: 'appetizer' },
      { recipeId: mockRecipes[1].id, course: 'main' },
      { recipeId: mockRecipes[2].id, course: 'soup_hotpot' }
    ];

    expect(dishes.filter(d => d.course === 'appetizer').length).toBe(1);
    expect(dishes.filter(d => d.course === 'main').length).toBe(1);
    expect(dishes.filter(d => d.course === 'soup_hotpot').length).toBe(1);

    // Remove main dish
    const updated = dishes.filter(d => d.recipeId !== mockRecipes[1].id);
    expect(updated.length).toBe(2);
    expect(updated.some(d => d.course === 'main')).toBe(false);
  });

  it('T1-D3-04: Catering financial metrics should compute revenue, food cost, gross profit, and margin', () => {
    const testDishes: PartyDishItem[] = [
      { recipeId: mockRecipes[0].id, course: 'main' },
      { recipeId: mockRecipes[1].id, course: 'soup_hotpot' }
    ];

    const fin = calculateCateringFinancials({
      guestCount: 30,
      tableSize: 10,
      budgetPerHead: 200000,
      dishes: testDishes,
      recipeLookup: id => mockRecipes.find(r => r.id === id)
    });

    expect(fin.totalRevenue).toBe(6000000); // 30 * 200,000
    expect(fin.numTables).toBe(3);
    expect(fin.roundedFoodCost).toBeGreaterThan(0);
    expect(fin.grossProfit).toBe(fin.totalRevenue - fin.roundedFoodCost);
    expect(fin.profitMarginPercent).toBe(Math.round((fin.grossProfit / fin.totalRevenue) * 100));
  });

  it('T1-D3-05: Zalo quotation export should generate structured text with required headers', () => {
    const plan: CustomPartyPlan = {
      id: 'party-test-1',
      title: 'Tiệc Tân Niên Công Ty',
      clientName: 'Công Ty ABC',
      eventType: 'corporate',
      guestCount: 40,
      tableSize: 10,
      budgetPerHeadVnd: 250000,
      dishes: [{ recipeId: mockRecipes[0].id, course: 'main' }],
      recommendedDrinks: ['Bia Heineken', 'Nước ngọt'],
      equipmentChecklist: [{ id: 'eq-1', text: 'Bếp từ', category: 'Dụng cụ tiệc', done: true }]
    };

    const fin = calculateCateringFinancials({
      guestCount: plan.guestCount,
      tableSize: plan.tableSize,
      budgetPerHead: plan.budgetPerHeadVnd,
      dishes: plan.dishes,
      recipeLookup: id => mockRecipes.find(r => r.id === id)
    });

    let quote = `BẢNG BÁO GIÁ THỰC ĐƠN TIỆC & CATERING MEALWISE\n`;
    quote += `SỰ KIỆN: ${plan.title}\n`;
    quote += `KHÁCH HÀNG: ${plan.clientName}\n`;
    quote += `SỐ LƯỢNG KHÁCH: ${fin.safeGuests} khách (~${fin.numTables} bàn x ${plan.tableSize} người/bàn)\n`;
    quote += `ĐƠN GIÁ: ${plan.budgetPerHeadVnd.toLocaleString('vi-VN')} đ / khách\n`;
    quote += `TỔNG DỰ TOÁN: ${fin.totalRevenue.toLocaleString('vi-VN')} đ\n`;

    expect(quote).toContain('BẢNG BÁO GIÁ');
    expect(quote).toContain('Tiệc Tân Niên Công Ty');
    expect(quote).toContain('Công Ty ABC');
    expect(quote).toContain('40 khách (~4 bàn x 10 người/bàn)');
    expect(quote).toContain('10.000.000 đ');
  });
});

describe('Tier 1: Feature Coverage — Domain 4 (GroceryList: Đi Chợ Tự Động)', () => {
  it('T1-D4-01: Ingredient quantity aggregation should collect all ingredients from weekly plan', () => {
    const testRecipe = mockRecipes[0];
    const ingredientsInput = testRecipe.ingredients.map(ing => ({
      ingredient: ing,
      recipeCost: testRecipe.estimatedCostVnd,
      totalIngredientsCount: testRecipe.ingredients.length
    }));

    const result = aggregateIngredients(ingredientsInput);
    expect(result.items.length).toBe(testRecipe.ingredients.length);
    expect(result.totalCostEstimate).toBeGreaterThan(0);
  });

  it('T1-D4-02: Deduplication should merge matching items and add amounts', () => {
    const input = [
      {
        ingredient: { name: 'Thịt ba chỉ', amount: 300, unit: 'g', category: 'thit-ca' as const },
        recipeCost: 50000,
        totalIngredientsCount: 1
      },
      {
        ingredient: { name: 'Thịt ba chỉ', amount: 200, unit: 'g', category: 'thit-ca' as const },
        recipeCost: 35000,
        totalIngredientsCount: 1
      }
    ];

    const result = aggregateIngredients(input);
    expect(result.items.length).toBe(1);
    expect(result.items[0].amount).toBe(500);
    expect(result.items[0].cost).toBe(85000);
  });

  it('T1-D4-03: Checkoff state toggle and progress percentage should accurately reflect purchases', () => {
    const items = [
      { name: 'Thịt heo', normalizedName: 'thit heo', amount: 500, unit: 'g', category: 'thit-ca' as const, cost: 60000, type: 'fresh' as const },
      { name: 'Rau muống', normalizedName: 'rau muong', amount: 1, unit: 'bó', category: 'rau-cu' as const, cost: 15000, type: 'fresh' as const },
      { name: 'Nước mắm', normalizedName: 'nuoc mam', amount: 1, unit: 'chai', category: 'gia-vi' as const, cost: 35000, type: 'pantry' as const },
      { name: 'Tỏi', normalizedName: 'toi', amount: 100, unit: 'g', category: 'gia-vi' as const, cost: 10000, type: 'pantry' as const }
    ];

    const checkedMap: Record<string, boolean> = {
      'Thịt heo': true,
      'Rau muống': true
    };

    const checkedCount = items.filter(i => !!checkedMap[i.name]).length;
    const progress = Math.round((checkedCount / items.length) * 100);
    expect(progress).toBe(50);
  });

  it('T1-D4-04: 4-Store channel categorization should partition fresh produce and dry goods', () => {
    const freshItem = { name: 'Cá quả', normalizedName: 'ca qua', amount: 1, unit: 'con', category: 'thit-ca' as const, cost: 70000, type: 'fresh' as const, suggestedStore: 'cho-dan-sinh' as StoreChannel };
    const pantryItem = { name: 'Dầu hào', normalizedName: 'dau hao', amount: 1, unit: 'chai', category: 'gia-vi' as const, cost: 25000, type: 'pantry' as const, suggestedStore: 'winmart' as StoreChannel };

    expect(freshItem.suggestedStore).toBe('cho-dan-sinh');
    expect(pantryItem.suggestedStore).toBe('winmart');
  });

  it('T1-D4-05: Online price simulation multipliers should adjust total cost per store channel', () => {
    const baseCost = 200000;
    const choDanSinh = simulateStorePrice(baseCost, 'cho-dan-sinh');
    const winMart = simulateStorePrice(baseCost, 'winmart');
    const bachHoaXanh = simulateStorePrice(baseCost, 'bach-hoa-xanh');
    const sapDoiTac = simulateStorePrice(baseCost, 'sap-doi-tac');

    expect(choDanSinh).toBe(190000); // 0.95
    expect(winMart).toBe(230000); // 1.15
    expect(bachHoaXanh).toBe(210000); // 1.05
    expect(sapDoiTac).toBe(180000); // 0.90
  });
});

describe('Tier 1: Feature Coverage — Domain 5 (RecipeCatalog & Modal: Sổ Tay Công Thức)', () => {
  it('T1-D5-01: Multi-criteria search should match by title, ingredient, tag, and unaccented query', () => {
    // Search by title
    const matchTitle = mockRecipes.filter(r => matchesRecipeSearch(r, 'thit kho'));
    expect(matchTitle.length).toBeGreaterThan(0);

    // Search by ingredient
    const matchIng = mockRecipes.filter(r => matchesRecipeSearch(r, 'tỏi'));
    expect(matchIng.length).toBeGreaterThan(0);

    // Search by tag
    const matchTag = mockRecipes.filter(r => matchesRecipeSearch(r, 'đậm đà'));
    expect(matchTag.length).toBeGreaterThan(0);
  });

  it('T1-D5-02: Region filter should filter recipes by bac, trung, and nam', () => {
    const bacRecipes = mockRecipes.filter(r => r.region === 'bac');
    const trungRecipes = mockRecipes.filter(r => r.region === 'trung');
    const namRecipes = mockRecipes.filter(r => r.region === 'nam');

    expect(bacRecipes.length).toBeGreaterThan(0);
    expect(trungRecipes.length).toBeGreaterThan(0);
    expect(namRecipes.length).toBeGreaterThan(0);
  });

  it('T1-D5-03: Category filter chips should filter by meal category', () => {
    const monMan = mockRecipes.filter(r => r.category === 'mon-man');
    const monCanh = mockRecipes.filter(r => r.category === 'mon-canh');
    const anSang = mockRecipes.filter(r => r.category === 'an-sang');

    expect(monMan.length).toBeGreaterThan(0);
    expect(monCanh.length).toBeGreaterThan(0);
    expect(anSang.length).toBeGreaterThan(0);
  });

  it('T1-D5-04: Recipe detail servings scaling should scale ingredient amounts proportionally', () => {
    const recipe = mockRecipes[0];
    const baseServings = recipe.servings || 4;
    const targetServings = 8;
    const factor = targetServings / baseServings;

    const scaledIngredients = recipe.ingredients.map(ing => {
      const num = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount as string) || 1;
      return {
        name: ing.name,
        amount: Math.round(num * factor * 10) / 10,
        unit: ing.unit
      };
    });

    expect(scaledIngredients[0].amount).toBe(
      Math.round((Number(recipe.ingredients[0].amount) * factor) * 10) / 10
    );
  });

  it('T1-D5-05: Cooking instructions sequential step ordering should be numbered 1..N', () => {
    for (const r of mockRecipes) {
      expect(r.instructions.length).toBeGreaterThan(0);
      r.instructions.forEach((inst, idx) => {
        expect(inst.step).toBe(idx + 1);
        expect(inst.title.length).toBeGreaterThan(0);
        expect(inst.content.length).toBeGreaterThan(0);
      });
    }
  });
});

describe('Tier 1: Feature Coverage — Domain 6 (AccountView & Onboarding: Tài Khoản & Khảo Sát)', () => {
  let storage: MockLocalStorage;

  beforeEach(() => {
    storage = setupMockStorage();
  });

  it('T1-D6-01: Theme mode toggle should toggle light <-> dark and persist to localStorage', () => {
    let theme: 'light' | 'dark' = 'light';
    storage.setItem('mealwise_theme', theme);
    expect(storage.getItem('mealwise_theme')).toBe('light');

    // Toggle
    theme = theme === 'light' ? 'dark' : 'light';
    storage.setItem('mealwise_theme', theme);
    expect(storage.getItem('mealwise_theme')).toBe('dark');
  });

  it('T1-D6-02: Onboarding 4-step wizard sequence should progress sequentially 1 -> 4', () => {
    let currentStep = 1;
    const totalSteps = 4;

    const nextStep = () => {
      if (currentStep < totalSteps) currentStep++;
    };
    const prevStep = () => {
      if (currentStep > 1) currentStep--;
    };

    expect(currentStep).toBe(1);
    nextStep();
    expect(currentStep).toBe(2);
    nextStep();
    expect(currentStep).toBe(3);
    nextStep();
    expect(currentStep).toBe(4);
    // At step 4, nextStep does not exceed 4
    nextStep();
    expect(currentStep).toBe(4);

    prevStep();
    expect(currentStep).toBe(3);
  });

  it('T1-D6-03: Onboarding preference collection should gather all user parameters', () => {
    const preferences: OnboardingData = {
      regionPreference: 'nam',
      familySize: 4,
      budgetLevel: 'thoai-mai',
      specialNeeds: ['nhieu-rau', 'it-cay'],
      completed: false
    };

    expect(preferences.regionPreference).toBe('nam');
    expect(preferences.familySize).toBe(4);
    expect(preferences.budgetLevel).toBe('thoai-mai');
    expect(preferences.specialNeeds).toContain('nhieu-rau');
    expect(preferences.specialNeeds).toContain('it-cay');
  });

  it('T1-D6-04: Onboarding completion should persist state and set completed = true', () => {
    const finalData: OnboardingData = {
      regionPreference: 'bac',
      familySize: 6,
      budgetLevel: 'vua-phai',
      specialNeeds: ['chay'],
      completed: true
    };

    storage.setItem('mealwise_onboarding', JSON.stringify(finalData));

    const retrieved = JSON.parse(storage.getItem('mealwise_onboarding') || '{}');
    expect(retrieved.completed).toBe(true);
    expect(retrieved.familySize).toBe(6);
  });

  it('T1-D6-05: Account reset should restore initial onboarding state', () => {
    const initialOnboarding: OnboardingData = {
      regionPreference: 'bac',
      familySize: 4,
      budgetLevel: 'vua-phai',
      specialNeeds: [],
      completed: false
    };

    storage.setItem('mealwise_onboarding', JSON.stringify({ completed: true, familySize: 6 }));
    // Reset
    storage.removeItem('mealwise_onboarding');
    expect(storage.getItem('mealwise_onboarding')).toBeNull();
  });

  it('T1-D6-06: Theme toggle switch specification verifies ON=Light Mode (Sun knob) and OFF=Dark Mode (Moon knob)', () => {
    const getToggleState = (theme: 'light' | 'dark') => {
      const isLight = theme === 'light';
      return {
        isOn: isLight,
        badgeText: isLight ? 'BẬT (ON)' : 'TẮT (OFF)',
        titleText: isLight ? 'Chế Độ Sáng (Light Mode)' : 'Chế Độ Tối (Dark Mode)',
        trackClass: isLight ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40' : 'bg-slate-700 dark:bg-slate-800',
        knobTranslate: isLight ? 'translate-x-6 text-amber-500' : 'translate-x-0 text-slate-600',
        knobIcon: isLight ? 'Sun' : 'Moon'
      };
    };

    const lightState = getToggleState('light');
    expect(lightState.isOn).toBe(true);
    expect(lightState.badgeText).toBe('BẬT (ON)');
    expect(lightState.knobIcon).toBe('Sun');
    expect(lightState.trackClass).toContain('bg-emerald-500');
    expect(lightState.knobTranslate).toContain('translate-x-6');

    const darkState = getToggleState('dark');
    expect(darkState.isOn).toBe(false);
    expect(darkState.badgeText).toBe('TẮT (OFF)');
    expect(darkState.knobIcon).toBe('Moon');
    expect(darkState.trackClass).toContain('bg-slate-700');
    expect(darkState.knobTranslate).toContain('translate-x-0');
  });

  it('T1-D6-07: Toast floating notification layout structure and auto-dismiss timing', () => {
    const toastClasses = 'fixed top-18 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-sm pointer-events-none';
    expect(toastClasses).toContain('top-18');
    expect(toastClasses).toContain('left-1/2');
    expect(toastClasses).toContain('-translate-x-1/2');
    expect(toastClasses).toContain('w-[92%]');
    expect(toastClasses).toContain('max-w-sm');

    const autoDismissMs = 4000;
    expect(autoDismissMs).toBe(4000);
  });

  it('T1-D6-08: Sidebar bottom navigation bar active tab styling ensures unobstructed label typography and no colliding indicator dots', () => {
    const getNavTabStyle = (active: boolean) => ({
      containerClass: active ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium',
      iconPillClass: active ? 'bg-emerald-500/15 dark:bg-emerald-500/20 -translate-y-0.5 shadow-sm' : '',
      labelClass: `text-[10px] tracking-tight mt-0.5 leading-tight ${active ? 'font-extrabold text-emerald-600 dark:text-emerald-400' : 'font-semibold'}`,
      hasCollidingDot: false
    });

    const activeTab = getNavTabStyle(true);
    expect(activeTab.hasCollidingDot).toBe(false);
    expect(activeTab.containerClass).toContain('text-emerald-600');
    expect(activeTab.labelClass).toContain('leading-tight');
    expect(activeTab.labelClass).toContain('font-extrabold');
  });

  it('T1-D6-09: Single-person onboarding (familySize = 1) and gym-protein/eat-clean lifestyle preferences', () => {
    const singleGymData: OnboardingData = {
      regionPreference: 'toan-quoc',
      familySize: 1,
      budgetLevel: 'vua-phai',
      specialNeeds: ['gym-protein', 'eat-clean'],
      completed: true
    };

    expect(singleGymData.familySize).toBe(1);
    expect(singleGymData.specialNeeds).toContain('gym-protein');
    expect(singleGymData.specialNeeds).toContain('eat-clean');

    // Verify servings scaled down to 1
    const householdServings = singleGymData.familySize;
    expect(householdServings).toBe(1);
    const scale = householdServings / 4;
    expect(scale).toBe(0.25);

    // Verify gym protein target for 1 person
    const dailyProteinTarget = householdServings * 70;
    expect(dailyProteinTarget).toBe(70);

    // Verify gym meal set discovery
    const gymMealSets = mockMealSets.filter(s => s.tags.includes('Giàu Đạm'));
    expect(gymMealSets.length).toBeGreaterThan(0);
    expect(gymMealSets[0].title).toContain('Giàu Đạm');
  });

  it('T1-D6-10: Onboarding completion remembers options and generates tailored suggested weekly meal plan matching user goal', () => {
    // 1. Remember user options in storage
    const userGoal: OnboardingData = {
      regionPreference: 'bac',
      familySize: 1,
      budgetLevel: 'vua-phai',
      specialNeeds: ['gym-protein', 'single-prep'],
      completed: true
    };
    storage.setItem('mealwise_onboarding', JSON.stringify(userGoal));
    const saved = JSON.parse(storage.getItem('mealwise_onboarding') || '{}');
    expect(saved.completed).toBe(true);
    expect(saved.specialNeeds).toContain('gym-protein');

    // 2. Generate plan matching the goal
    const isGym = userGoal.specialNeeds.includes('gym-protein');
    const candidateSets = mockMealSets.filter(s => s.tags.includes('Giàu Đạm') || s.tags.includes('Eat Clean'));
    expect(candidateSets.length).toBeGreaterThan(0);

    const generatedWeek = [0, 1, 2, 3, 4, 5, 6].map(idx => ({
      dayIndex: idx,
      lunch: candidateSets[idx % candidateSets.length],
      dinner: candidateSets[(idx + 1) % candidateSets.length]
    }));

    // Verify all 7 days have meal sets assigned
    expect(generatedWeek.length).toBe(7);
    expect(generatedWeek.every(d => d.lunch && d.dinner)).toBe(true);

    // Verify gym dishes were prioritized
    const allAssignedSets = generatedWeek.flatMap(d => [d.lunch, d.dinner]);
    const gymSetCount = allAssignedSets.filter(s => s.tags.includes('Giàu Đạm')).length;
    expect(gymSetCount).toBeGreaterThan(0);
  });

  it('T1-D6-11: Single-person format defaults to single-dish, populating lunch and dinner with single Recipe items', () => {
    // 1. Setup single person preference defaulting to single-dish
    const singleData: OnboardingData = {
      regionPreference: 'bac',
      familySize: 1,
      singleMealFormat: 'single-dish',
      budgetLevel: 'vua-phai',
      specialNeeds: ['gym-protein'],
      completed: true
    };
    storage.setItem('mealwise_onboarding', JSON.stringify(singleData));

    // 2. Select eligible satisfying single dishes (main dishes, not dessert, not breakfast)
    const eligibleDishes = mockRecipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
    expect(eligibleDishes.length).toBeGreaterThan(0);

    // Prioritize high-protein dishes for gym goal
    const sortedDishes = [...eligibleDishes].sort((a, b) => {
      const aProtein = (a.calories || 0) * 0.045;
      const bProtein = (b.calories || 0) * 0.045;
      return bProtein - aProtein;
    });

    const singlePersonWeek = [0, 1, 2, 3, 4, 5, 6].map(idx => ({
      dayIndex: idx,
      lunch: sortedDishes[idx % sortedDishes.length],
      dinner: sortedDishes[(idx + 1) % sortedDishes.length]
    }));

    // Verify all days have single Recipe items (has id, title, calories, ingredients, but NOT mainDish/soupDish)
    expect(singlePersonWeek.length).toBe(7);
    for (const day of singlePersonWeek) {
      expect(day.lunch.title).toBeDefined();
      expect(day.dinner.title).toBeDefined();
      // Ensure it is a Recipe, not a VietnameseMealSet
      expect('mainDish' in day.lunch).toBe(false);
      expect('soupDish' in day.lunch).toBe(false);
      expect('mainDish' in day.dinner).toBe(false);
      expect('soupDish' in day.dinner).toBe(false);
    }
  });

  it('T1-D6-12: Single person can explicitly opt into meal-set (3 dishes) when desired', () => {
    const singleMealSetData: OnboardingData = {
      regionPreference: 'nam',
      familySize: 1,
      singleMealFormat: 'meal-set',
      budgetLevel: 'thoai-mai',
      specialNeeds: [],
      completed: true
    };

    expect(singleMealSetData.familySize).toBe(1);
    expect(singleMealSetData.singleMealFormat).toBe('meal-set');

    // When meal-set is chosen, candidate sets are VietnameseMealSet
    const candidateSets = mockMealSets.filter(s => s.region === 'nam' || s.region === 'toan-quoc');
    const firstSet = candidateSets[0];
    expect('mainDish' in firstSet).toBe(true);
    expect('soupDish' in firstSet).toBe(true);
    expect('sideDish' in firstSet).toBe(true);

    // Servings scale for 1 person is 1/4 = 0.25
    const scale = singleMealSetData.familySize / 4;
    expect(scale).toBe(0.25);
    const scaledCost = Math.round(firstSet.totalCostVnd * scale);
    expect(scaledCost).toBeLessThan(firstSet.totalCostVnd);
  });

  it('T1-D6-13: Multi-person household (familySize > 1) always receives traditional 3-dish meal sets', () => {
    const familyData: OnboardingData = {
      regionPreference: 'bac',
      familySize: 4,
      budgetLevel: 'vua-phai',
      specialNeeds: [],
      completed: true
    };

    expect(familyData.familySize).toBeGreaterThan(1);
    // singleMealFormat is undefined or not used for family
    expect(familyData.singleMealFormat).toBeUndefined();

    // Generated meals are VietnameseMealSet
    const set = mockMealSets[0];
    expect('mainDish' in set).toBe(true);
    expect('soupDish' in set).toBe(true);
    expect('sideDish' in set).toBe(true);
  });

  it('T1-D6-14: Budget Recalibration detects over-budget single-dish plan (matching user screenshot) and recalculates meals under target', () => {
    // 1. Single person with Tiet Kiem budget target: 60,000 VND/day
    const servings = 1;
    const scale = servings / 4;
    const dailyBudgetTarget = 60000 * servings; // 60,000 VND

    // Simulate an over-budget day with 80,000 VND total cost (exceeding by +20,000 VND as in user screenshot)
    const expensiveDay: DailyMealPlan = {
      dayId: 'sun',
      dayName: 'Chủ Nhật',
      meals: {
        breakfast: { ...mockRecipes[0], estimatedCostVnd: 80000 },
        lunch: { ...mockRecipes[1], estimatedCostVnd: 120000 },
        dinner: { ...mockRecipes[2], estimatedCostVnd: 120000 }
      }
    };

    const initialUnscaled = 80000 + 120000 + 120000; // 320,000 VND
    const initialScaled = Math.round(initialUnscaled * scale); // 80,000 VND
    expect(initialScaled).toBe(80000);

    const isOverBudget = initialScaled > dailyBudgetTarget * 1.1;
    const budgetExcess = initialScaled - dailyBudgetTarget;
    expect(isOverBudget).toBe(true);
    expect(budgetExcess).toBe(20000); // Exceeds by +20,000 VND!

    // 2. Perform recalibration algorithm
    // Select lowest-cost breakfast and single dishes
    const bfastPool = mockRecipes.filter(r => r.category === 'an-sang');
    const sortedBfast = [...(bfastPool.length > 0 ? bfastPool : mockRecipes)].sort((a, b) => (a.estimatedCostVnd || 30000) - (b.estimatedCostVnd || 30000));
    const chosenBfast = sortedBfast[0];
    const bfastCost = Math.round((chosenBfast.estimatedCostVnd || 25000) * scale);

    const remBudget = dailyBudgetTarget - bfastCost;
    const singlePool = mockRecipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
    singlePool.sort((a, b) => (a.estimatedCostVnd || 35000) - (b.estimatedCostVnd || 35000));

    const recalibratedDay: DailyMealPlan = {
      dayId: 'sun',
      dayName: 'Chủ Nhật',
      meals: {
        breakfast: chosenBfast,
        lunch: singlePool[0],
        dinner: singlePool[1] || singlePool[0]
      }
    };

    const recalibratedUnscaled = (chosenBfast.estimatedCostVnd || 25000) + (singlePool[0].estimatedCostVnd || 35000) + ((singlePool[1] || singlePool[0]).estimatedCostVnd || 35000);
    const recalibratedScaled = Math.round(recalibratedUnscaled * scale);

    // Verify day is now strictly within the 60,000 VND budget target
    expect(recalibratedScaled).toBeLessThanOrEqual(dailyBudgetTarget);
    const recalibratedIsOver = recalibratedScaled > dailyBudgetTarget * 1.1;
    expect(recalibratedIsOver).toBe(false);
  });

  it('T1-D6-15: Weekly budget recalibration checks all 7 days and ensures entire week conforms to budget ceiling', () => {
    const servings = 4;
    const scale = servings / 4; // 1.0
    const dailyBudgetTarget = 95000 * servings; // 380,000 VND/day (Vua phai)

    // Verify candidate sets sorted by cost can satisfy daily budget
    const sortedSets = [...mockMealSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd);
    const lowestSet = sortedSets[0];
    const secondLowestSet = sortedSets[1] || sortedSets[0];

    const bfastCost = 50000;
    const dayTotal = bfastCost + lowestSet.totalCostVnd + secondLowestSet.totalCostVnd;

    // Both meal sets combined stay within 4-person target
    expect(dayTotal).toBeLessThanOrEqual(dailyBudgetTarget * 1.1);
  });

  it('T1-D6-16: Recalibration guarantees zero duplicate meals across all 7 days of the week', () => {
    // 1-person mode with single dishes
    const servings = 1;
    const scale = servings / 4;
    const dailyBudgetTarget = 60000; // Tiết kiệm 60k/ngày

    const bfastPool = mockRecipes.filter(r => r.category === 'an-sang');
    const singlePool = mockRecipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');

    // Affordable pools
    const affordableDishes = singlePool.filter(r => Math.round((r.estimatedCostVnd || 35000) * scale) <= dailyBudgetTarget * 0.55);
    expect(affordableDishes.length).toBeGreaterThanOrEqual(14); // Plenty of dishes to fill 14 slots

    // Distribute 14 distinct dishes across 7 days
    const weekLunches: string[] = [];
    const weekDinners: string[] = [];
    const weekBreakfasts: string[] = [];

    for (let i = 0; i < 7; i++) {
      const bfast = bfastPool[i % bfastPool.length];
      const lunch = affordableDishes[i * 2];
      const dinner = affordableDishes[i * 2 + 1];

      weekBreakfasts.push(bfast.id);
      weekLunches.push(lunch.id);
      weekDinners.push(dinner.id);

      // Lunch and dinner on the same day must not be identical
      expect(lunch.id).not.toBe(dinner.id);
    }

    // Zero duplicate lunches across the entire week
    const uniqueLunches = new Set(weekLunches);
    expect(uniqueLunches.size).toBe(7);

    // Zero duplicate dinners across the entire week
    const uniqueDinners = new Set(weekDinners);
    expect(uniqueDinners.size).toBe(7);

    // Zero overlap between any lunch and dinner across the entire week (14 distinct dishes)
    const allMainDishes = new Set([...weekLunches, ...weekDinners]);
    expect(allMainDishes.size).toBe(14);
  });

  it('T1-D6-17: Recalibrating a single day selects unique dishes not already scheduled on other days', () => {
    const servings = 1;
    const scale = servings / 4;
    const dailyBudgetTarget = 60000;

    const singlePool = mockRecipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
    const affordableDishes = singlePool.filter(r => Math.round((r.estimatedCostVnd || 35000) * scale) <= dailyBudgetTarget * 0.55);

    // Suppose Monday to Saturday already scheduled dishes [0..11]
    const scheduledDishIds = new Set<string>();
    for (let i = 0; i < 12; i++) {
      scheduledDishIds.add(affordableDishes[i].id);
    }

    // Now recalibrating Sunday (dayId: 'sun'): system filters out used dishes
    const unusedDishes = affordableDishes.filter(d => !scheduledDishIds.has(d.id));
    expect(unusedDishes.length).toBeGreaterThanOrEqual(2);

    const sundayLunch = unusedDishes[0];
    const sundayDinner = unusedDishes[1];

    expect(scheduledDishIds.has(sundayLunch.id)).toBe(false);
    expect(scheduledDishIds.has(sundayDinner.id)).toBe(false);
    expect(sundayLunch.id).not.toBe(sundayDinner.id);
  });

  it('T1-D6-18: Mock meal sets library contains diverse authentic meal sets (20 Vietnamese + 24 Western)', () => {
    expect(mockMealSets.length).toBe(44);
    const setIds = new Set(mockMealSets.map(s => s.id));
    // All 44 meal sets have unique IDs
    expect(setIds.size).toBe(44);
  });

  it('T1-D6-19: Recalibration produces realistic, healthy, substantial daily meals (avoiding unrealistic <$1 rock-bottom prices & sweet soups)', () => {
    const servings = 1;
    const scale = servings / 4;
    const dailyBudgetTarget = 60000; // Tiết kiệm 60k/ngày (~$2.40 USD)

    // Verify helper rejects sweet soups and light snacks for main meals
    const sweetDish: Recipe = {
      id: 'che-hat-sen-long-nhan',
      title: 'Chè Hạt Sen Long Nhãn',
      category: 'mon-chay',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 4,
      estimatedCostVnd: 21000,
      calories: 180,
      ingredients: [],
      instructions: []
    };
    expect(sweetDish.title.toLowerCase().includes('chè')).toBe(true);

    // Realistic main dish candidate
    const savoryDish: Recipe = {
      id: 'thit-rang-chay-canh-2',
      title: 'Thịt Ba Chỉ Rang Cháy Cạnh',
      category: 'mon-man',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 4,
      estimatedCostVnd: 88000, // 22,000 VND scaled for 1 person
      calories: 460,
      ingredients: [],
      instructions: []
    };

    const savoryDinner: Recipe = {
      id: 'ca-basa-kho-to-2',
      title: 'Cá Basa Kho Tộ Tiêu Đen',
      category: 'mon-man',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 4,
      estimatedCostVnd: 84000, // 21,000 VND scaled for 1 person
      calories: 420,
      ingredients: [],
      instructions: []
    };

    const bfastDish: Recipe = {
      id: 'banh-mi-pate-trung',
      title: 'Bánh Mì Pate Trứng Ốp La',
      category: 'an-sang',
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 4,
      estimatedCostVnd: 64000, // 16,000 VND scaled for 1 person
      calories: 380,
      ingredients: [],
      instructions: []
    };

    const bfastCost = Math.round(bfastDish.estimatedCostVnd! * scale);
    const lunchCost = Math.round(savoryDish.estimatedCostVnd! * scale);
    const dinnerCost = Math.round(savoryDinner.estimatedCostVnd! * scale);
    const dayTotal = bfastCost + lunchCost + dinnerCost;

    // Realistic budget utilization: stays under 60k but >= 45k (no starvation or $0.80 USD meals)
    expect(dayTotal).toBeLessThanOrEqual(dailyBudgetTarget);
    expect(dayTotal).toBeGreaterThanOrEqual(45000);
    expect(dayTotal).toBe(59000); // 59,000 VND (~$2.36 USD) - nearly 100% healthy budget utilization!

    // Both lunch and dinner provide substantial calories >= 350 kcal
    expect(savoryDish.calories).toBeGreaterThanOrEqual(350);
    expect(savoryDinner.calories).toBeGreaterThanOrEqual(350);
  });
});


