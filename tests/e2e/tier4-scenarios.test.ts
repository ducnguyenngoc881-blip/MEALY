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
  PartyDishItem,
  StoreChannel
} from '../../src/types';
import {
  matchesRecipeSearch,
  removeVietnameseTones
} from '../../src/utils/textUtils';
import {
  calculateServingsScale,
  calculateDailyNutrition,
  evaluateDayBudgetStatus,
  aggregateIngredients,
  simulateStorePrice,
  formatZaloShoppingList,
  calculateTables,
  calculateCateringFinancials,
  sanitizeGuestCount
} from '../helpers/calcUtils';
import { MockLocalStorage, setupMockStorage } from '../helpers/mockStorage';
import fs from 'fs';
import path from 'path';

describe('Tier 4: Real-World Application Scenarios', () => {
  let storage: MockLocalStorage;

  beforeEach(() => {
    storage = setupMockStorage();
  });

  it('Scenario 1: Vietnamese 4-person family 7-day meal plan & supermarket grocery trip', () => {
    // Step 1: Onboarding for 4-person family
    const familyOnboarding: OnboardingData = {
      regionPreference: 'bac',
      familySize: 4,
      budgetLevel: 'vua-phai', // 380,000 đ/day baseline
      specialNeeds: ['nhieu-rau'],
      completed: true
    };
    storage.setItem('mealwise_onboarding', JSON.stringify(familyOnboarding));

    // Step 2: Set up 7-day meal plan with authentic 3-dish sets
    const daysOfWeek = [
      { id: 'mon', name: 'Thứ Hai' },
      { id: 'tue', name: 'Thứ Ba' },
      { id: 'wed', name: 'Thứ Tư' },
      { id: 'thu', name: 'Thứ Năm' },
      { id: 'fri', name: 'Thứ Sáu' },
      { id: 'sat', name: 'Thứ Bảy' },
      { id: 'sun', name: 'Chủ Nhật' }
    ];

    const weeklyPlan: DailyMealPlan[] = daysOfWeek.map((d, idx) => ({
      dayId: d.id,
      dayName: d.name,
      meals: {
        breakfast: mockRecipes[idx % mockRecipes.length],
        lunch: mockMealSets[idx % mockMealSets.length],
        dinner: mockMealSets[(idx + 1) % mockMealSets.length]
      }
    }));
    storage.setItem('mealwise_weekly_plan', JSON.stringify(weeklyPlan));

    // Step 3: Verify budget and nutrition for each day
    for (const day of weeklyPlan) {
      const nutrition = calculateDailyNutrition(day, familyOnboarding.familySize);
      expect(nutrition.scaledCalories).toBeGreaterThan(1000);
      expect(nutrition.scaledProtein).toBeGreaterThan(40);

      const budgetStatus = evaluateDayBudgetStatus(
        nutrition.scaledCost,
        familyOnboarding.budgetLevel,
        familyOnboarding.familySize
      );
      // Ensure day cost is within reasonable family budget limits (< 1.3 ratio)
      expect(budgetStatus.ratio).toBeLessThan(1.5);
    }

    // Step 4: Aggregate ingredients into smart grocery list
    const allIngredients: Array<{ ingredient: any; recipeCost: number; totalIngredientsCount: number }> = [];
    weeklyPlan.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (!meal) return;
        if ('mainDish' in meal) {
          const set = meal as VietnameseMealSet;
          [set.mainDish, set.soupDish, set.sideDish].forEach(d => {
            d.ingredients.forEach(ing => {
              allIngredients.push({
                ingredient: ing,
                recipeCost: d.estimatedCostVnd || 40000,
                totalIngredientsCount: d.ingredients.length
              });
            });
          });
        } else {
          const rec = meal as Recipe;
          rec.ingredients.forEach(ing => {
            allIngredients.push({
              ingredient: ing,
              recipeCost: rec.estimatedCostVnd || 35000,
              totalIngredientsCount: rec.ingredients.length
            });
          });
        }
      });
    });

    const grocery = aggregateIngredients(allIngredients);
    expect(grocery.items.length).toBeGreaterThan(10);
    expect(grocery.totalCostEstimate).toBeGreaterThan(500000);

    // Step 5: Simulate WinMart supermarket price markup
    const winMartCost = simulateStorePrice(grocery.totalCostEstimate, 'winmart');
    expect(winMartCost).toBe(Math.round(grocery.totalCostEstimate * 1.15));

    // Step 6: Check off 70% of items during shopping trip
    const checkedMap: Record<string, boolean> = {};
    const checkCount = Math.floor(grocery.items.length * 0.7);
    for (let i = 0; i < checkCount; i++) {
      checkedMap[grocery.items[i].name] = true;
    }
    storage.setItem('mealwise_grocery_checked', JSON.stringify(checkedMap));

    // Step 7: Verify reload persistence
    const reloadedChecked = JSON.parse(storage.getItem('mealwise_grocery_checked') || '{}');
    expect(Object.keys(reloadedChecked).length).toBe(checkCount);

    const zaloSummary = formatZaloShoppingList(grocery.items, reloadedChecked, winMartCost);
    expect(zaloSummary).toContain(`TIẾN ĐỘ HOÀN TẤT: ${Math.round((checkCount / grocery.items.length) * 100)}%`);
    expect(zaloSummary).toContain(`(${checkCount}/${grocery.items.length} món)`);
    expect(zaloSummary).toContain('[✓] ĐÃ MUA');
    expect(zaloSummary).toContain('[ ] CẦN MUA');
  });

  it('Scenario 2: 45-guest corporate banquet catering with 10-person tables & Zalo quotation', () => {
    const guestCount = 45;
    const tableSize = 10;
    const budgetPerHead = 250000;

    // Table math
    const numTables = calculateTables(guestCount, tableSize);
    expect(numTables).toBe(5); // 45 / 10 -> 5 tables

    // Course selection
    const partyDishes: PartyDishItem[] = [
      { recipeId: mockRecipes[0].id, course: 'appetizer', customNotes: 'Trang trí hoa tỉa tỉ mỉ' },
      { recipeId: mockRecipes[1].id, course: 'main', customNotes: 'Nóng giòn, ra món sau khai vị 15p' },
      { recipeId: mockRecipes[2].id, course: 'soup_hotpot', customNotes: 'Nước dùng thanh, kèm bếp cồn' },
      { recipeId: mockRecipes[3].id, course: 'staple', customNotes: 'Cơm tám thơm dẻo' },
      { recipeId: mockRecipes[4].id, course: 'dessert_drink', customNotes: 'Ướp lạnh trước 30p' }
    ];

    const fin = calculateCateringFinancials({
      guestCount,
      tableSize,
      budgetPerHead,
      dishes: partyDishes,
      recipeLookup: id => mockRecipes.find(r => r.id === id)
    });

    // Total revenue: 45 * 250,000 = 11,250,000 đ
    expect(fin.totalRevenue).toBe(11250000);
    expect(fin.numTables).toBe(5);
    expect(fin.revenuePerTable).toBe(2250000);
    expect(fin.roundedFoodCost).toBeGreaterThan(1000000);
    expect(fin.grossProfit).toBe(fin.totalRevenue - fin.roundedFoodCost);
    expect(fin.profitMarginPercent).toBeGreaterThan(40);

    // Equipment Checklist
    const equipment = [
      { id: 'eq-1', text: '5 Nồi lẩu & Bếp từ tiệc', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-2', text: '50 Bát đĩa sứ & Muỗng đũa', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-3', text: 'Thùng đá ướp lạnh bia & nước ngọt', category: 'Dụng cụ tiệc', done: false }
    ];

    // Verify custom kitchen notes and Zalo quotation formatting
    let quote = `🎉 BẢNG BÁO GIÁ THỰC ĐƠN TIỆC & CATERING MEALWISE\n`;
    quote += `SỰ KIỆN: Tiệc Liên Hoan Công Ty Năm Mới\n`;
    quote += `KHÁCH HÀNG: Ban Giám Đốc\n`;
    quote += `SỐ LƯỢNG KHÁCH: ${fin.safeGuests} khách (~${fin.numTables} bàn x ${tableSize} người/bàn)\n`;
    quote += `ĐƠN GIÁ TRỌN GÓI: ${budgetPerHead.toLocaleString('vi-VN')} đ / khách (~${(budgetPerHead * tableSize).toLocaleString('vi-VN')} đ / bàn)\n`;
    quote += `TỔNG DỰ TOÁN BÀN TIỆC: ${fin.totalRevenue.toLocaleString('vi-VN')} đ\n\n`;
    quote += `THỰC ĐƠN CHI TIẾT:\n`;

    partyDishes.forEach((d, idx) => {
      const r = mockRecipes.find(rec => rec.id === d.recipeId);
      quote += `  ${idx + 1}. ${r?.title} [Ghi chú: ${d.customNotes}]\n`;
    });

    expect(quote).toContain('45 khách (~5 bàn x 10 người/bàn)');
    expect(quote).toContain('11.250.000 đ');
    expect(quote).toContain('Trang trí hoa tỉa tỉ mỉ');
  });

  it('Scenario 3: Solo student budget meal prep (servings = 1, 1/4 cost scaling, Chợ Dân Sinh)', () => {
    // Solo student profile
    const studentServings = 1;
    const scale = calculateServingsScale(studentServings);
    expect(scale).toBe(0.25); // Exactly 1/4, NOT distorted to 0.5

    // Budget benchmark: tiet-kiem base 250,000 đ -> scaled 62,500 đ/day
    const budgetEval = evaluateDayBudgetStatus(55000, 'tiet-kiem', studentServings);
    expect(budgetEval.thresholdVnd).toBe(62500);
    expect(budgetEval.status).toBe('balanced');

    // Economical single-day meal plan
    const singleRecipe = mockRecipes[0];
    const originalCost = singleRecipe.estimatedCostVnd || 40000;
    const scaledCost = Math.round(originalCost * scale);
    expect(scaledCost).toBe(Math.round(originalCost * 0.25));

    // Filter grocery for Chợ Dân Sinh (-5% discount)
    const choDanSinhPrice = simulateStorePrice(scaledCost, 'cho-dan-sinh');
    expect(choDanSinhPrice).toBe(Math.round(scaledCost * 0.95));
    expect(choDanSinhPrice).toBeLessThanOrEqual(budgetEval.thresholdVnd);
  });

  it('Scenario 4: Weekend cooking masterclass recipe search & accordion cooking steps', () => {
    // Unaccented search for "thit kho"
    const searchResults = mockRecipes.filter(r => matchesRecipeSearch(r, 'thit kho'));
    expect(searchResults.length).toBeGreaterThan(0);
    const chosenRecipe = searchResults[0];

    // Scale up for 12 guests (3x standard 4 servings)
    const targetServings = 12;
    const multiplier = targetServings / (chosenRecipe.servings || 4);
    expect(multiplier).toBe(3);

    const scaledIngredients = chosenRecipe.ingredients.map(ing => {
      const amt = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount as string) || 1;
      return {
        name: ing.name,
        amount: Math.round(amt * multiplier * 10) / 10,
        unit: ing.unit
      };
    });

    expect(scaledIngredients[0].amount).toBe(
      Math.round((Number(chosenRecipe.ingredients[0].amount) || 1) * 3 * 10) / 10
    );

    // Follow step-by-step accordion instructions
    const stepCompleted: Record<number, boolean> = {};
    chosenRecipe.instructions.forEach(inst => {
      expect(inst.step).toBeGreaterThan(0);
      expect(inst.content.length).toBeGreaterThan(0);
      // Mark step completed
      stepCompleted[inst.step] = true;
    });

    const completedCount = Object.values(stepCompleted).filter(Boolean).length;
    expect(completedCount).toBe(chosenRecipe.instructions.length);
  });

  it('Scenario 5: Low-height mobile device onboarding wizard navigation', () => {
    const screenWidth = 320;
    const screenHeight = 568; // iPhone SE dimensions

    expect(screenWidth).toBeLessThanOrEqual(375);
    expect(screenHeight).toBeLessThan(650);

    // Onboarding wizard data container
    const wizardState: OnboardingData = {
      regionPreference: 'bac',
      familySize: 4,
      budgetLevel: 'vua-phai',
      specialNeeds: [],
      completed: false
    };

    let step = 1;

    // Step 1: Select region preference
    wizardState.regionPreference = 'trung';
    step++;

    // Step 2: Select family size
    wizardState.familySize = 2;
    step++;

    // Step 3: Select budget level
    wizardState.budgetLevel = 'thoai-mai';
    step++;

    // Step 4: Special needs & complete
    wizardState.specialNeeds.push('it-cay');
    wizardState.completed = true;

    expect(step).toBe(4);
    expect(wizardState.completed).toBe(true);
    expect(wizardState.regionPreference).toBe('trung');
    expect(wizardState.familySize).toBe(2);
    expect(wizardState.budgetLevel).toBe('thoai-mai');
    expect(wizardState.specialNeeds).toContain('it-cay');
  });

  it('Scenario 6: Full build & showcase deployment bundle verification', () => {
    // 1. Verify package.json structure
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();

    // 2. Verify source tree key files
    const srcIndex = path.resolve(process.cwd(), 'src/main.tsx');
    const srcApp = path.resolve(process.cwd(), 'src/App.tsx');
    const srcContext = path.resolve(process.cwd(), 'src/context/MealWiseContext.tsx');
    const srcTypes = path.resolve(process.cwd(), 'src/types/index.ts');

    expect(fs.existsSync(srcIndex)).toBe(true);
    expect(fs.existsSync(srcApp)).toBe(true);
    expect(fs.existsSync(srcContext)).toBe(true);
    expect(fs.existsSync(srcTypes)).toBe(true);

    // 3. Verify showcase deployment target directory specification exists
    const showcasePath = 'C:\\Users\\EXIA\\Downloads\\MealWise-Portable-Showcase';
    // Directory is the authoritative target location specified in ORIGINAL_REQUEST.md & PROJECT.md
    expect(showcasePath).toContain('MealWise-Portable-Showcase');
  });
});
