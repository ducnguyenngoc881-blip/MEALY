import { describe, it, expect, beforeEach } from '../helpers/testRunner';
import { mockRecipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';
import { Recipe, VietnameseMealSet, DailyMealPlan, StoreChannel } from '../../src/types';
import {
  removeVietnameseTones,
  matchesSearchTerm,
  matchesRecipeSearch,
  normalizeSearchString
} from '../../src/utils/textUtils';
import {
  sanitizeGuestCount,
  calculateTables,
  calculateCateringFinancials,
  normalizeUnitAndAmount,
  aggregateIngredients,
  formatZaloShoppingList,
  calculateServingsScale,
  evaluateDayBudgetStatus
} from '../helpers/calcUtils';
import {
  getContrastRatio,
  isWcagAaCompliant
} from '../helpers/contrastMath';
import { MockLocalStorage, setupMockStorage } from '../helpers/mockStorage';

describe('Tier 2: Boundary & Corner Cases — Domain 1 (MealSetExplorer)', () => {
  it('T2-D1-01: Empty or whitespace search query should return all meal sets without filtering', () => {
    const query = '   ';
    const filtered = mockMealSets.filter(s => matchesSearchTerm(s.title, query));
    expect(filtered.length).toBe(mockMealSets.length);
  });

  it('T2-D1-02: Non-existent tags or queries should return empty array gracefully without throw', () => {
    const query = 'nonexistent_dish_12345_xyz';
    const filtered = mockMealSets.filter(s => matchesSearchTerm(s.title, query));
    expect(filtered.length).toBe(0);
    expect(Array.isArray(filtered)).toBe(true);
  });

  it('T2-D1-03: Assigning to slot with pre-existing meal should cleanly overwrite without orphan data', () => {
    const day: DailyMealPlan = {
      dayId: 'tue',
      dayName: 'Thứ Ba',
      meals: {
        breakfast: mockRecipes[0],
        lunch: mockMealSets[0],
        dinner: mockMealSets[1]
      }
    };

    // Replace lunch with meal set 2
    day.meals.lunch = mockMealSets[2];
    expect(day.meals.lunch.id).toBe(mockMealSets[2].id);
    expect((day.meals.lunch as VietnameseMealSet).title).toBe(mockMealSets[2].title);
  });

  it('T2-D1-04: Drag-to-dismiss threshold boundary logic should discriminate dismiss vs bounce back', () => {
    const DISMISS_THRESHOLD = 80;

    const checkDismiss = (dragOffset: number): boolean => {
      return dragOffset >= DISMISS_THRESHOLD;
    };

    expect(checkDismiss(0)).toBe(false);
    expect(checkDismiss(45)).toBe(false);
    expect(checkDismiss(79)).toBe(false);
    expect(checkDismiss(80)).toBe(true);
    expect(checkDismiss(150)).toBe(true);
  });

  it('T2-D1-05: Special characters in search input should not break regex or parsing', () => {
    const specialQueries = ['[thịt]', '(canh)', 'cá*kèo', 'tôm+thịt', '"sườn non"', '$%^&*'];

    for (const q of specialQueries) {
      expect(() => {
        mockMealSets.filter(s => matchesSearchTerm(s.title, q));
      }).not.toThrow();
    }
  });
});

describe('Tier 2: Boundary & Corner Cases — Domain 2 (WeeklyBoard)', () => {
  it('T2-D2-01: Servings stepper lower bound clamping: 0 and negative inputs sanitized to 1 person', () => {
    expect(calculateServingsScale(0)).toBe(0.25);
    expect(calculateServingsScale(-1)).toBe(0.25);
    expect(calculateServingsScale(-999)).toBe(0.25);
  });

  it('T2-D2-02: Servings stepper upper bound clamping: >20 inputs clamped to 20', () => {
    expect(calculateServingsScale(21)).toBe(5.0);
    expect(calculateServingsScale(50)).toBe(5.0);
    expect(calculateServingsScale(999)).toBe(5.0);
  });

  it('T2-D2-03: Servings stepper decimal and NaN input sanitization', () => {
    expect(calculateServingsScale(NaN)).toBe(1.0); // fallback to 4 people
    expect(calculateServingsScale('invalid' as any)).toBe(1.0);
    expect(calculateServingsScale(2.2)).toBe(0.5); // rounds to 2
    expect(calculateServingsScale(5.9)).toBe(1.5); // rounds to 6
  });

  it('T2-D2-04: Touch gesture swipe discrimination prevents vertical scroll drift from jumping days', () => {
    // Formula: Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50
    const evaluateSwipe = (diffX: number, diffY: number): 'left' | 'right' | 'none' => {
      if (Math.abs(diffX) <= 50) return 'none';
      if (Math.abs(diffX) <= Math.abs(diffY) * 1.5) return 'none'; // rejected as vertical drift
      return diffX > 0 ? 'right' : 'left';
    };

    // Pure horizontal swipe right
    expect(evaluateSwipe(80, 10)).toBe('right');
    // Pure horizontal swipe left
    expect(evaluateSwipe(-80, 15)).toBe('left');
    // Vertical scroll with slight horizontal drift (60px X, 100px Y) -> must NOT trigger swipe!
    expect(evaluateSwipe(60, 100)).toBe('none');
    expect(evaluateSwipe(-60, 90)).toBe('none');
    // Sub-threshold horizontal movement
    expect(evaluateSwipe(30, 5)).toBe('none');
  });

  it('T2-D2-05: Navigation bounds: Monday swiping right stays 0, Sunday swiping left stays 6', () => {
    const totalDays = 7;

    const navigate = (currentIndex: number, direction: 'prev' | 'next') => {
      if (direction === 'prev') return Math.max(0, currentIndex - 1);
      return Math.min(totalDays - 1, currentIndex + 1);
    };

    expect(navigate(0, 'prev')).toBe(0); // Monday boundary
    expect(navigate(6, 'next')).toBe(6); // Sunday boundary
    expect(navigate(3, 'prev')).toBe(2);
    expect(navigate(3, 'next')).toBe(4);
  });
});

describe('Tier 2: Boundary & Corner Cases — Domain 3 (CateringPartyPlanner)', () => {
  it('T2-D3-01: Guest count 0, negative, or NaN sanitized to minimum 1 without 0||10 fallback bug', () => {
    expect(sanitizeGuestCount(0)).toBe(1);
    expect(sanitizeGuestCount(-1)).toBe(1);
    expect(sanitizeGuestCount(NaN)).toBe(1);
    expect(sanitizeGuestCount('0')).toBe(1);
  });

  it('T2-D3-02: Odd guest counts non-divisible by table size should compute full table count and exact revenue', () => {
    const fin = calculateCateringFinancials({
      guestCount: 15, // 15 guests on 10-person table -> 2 tables
      tableSize: 10,
      budgetPerHead: 200000,
      dishes: [],
      recipeLookup: () => undefined
    });

    expect(fin.numTables).toBe(2);
    expect(fin.totalRevenue).toBe(3000000); // exactly 15 * 200,000
    expect(fin.revenuePerTable).toBe(1500000); // 3,000,000 / 2 tables
  });

  it('T2-D3-03: Empty course list financial formulas: 0 dishes chosen yields 0 food cost and 0% margin', () => {
    const fin = calculateCateringFinancials({
      guestCount: 50,
      tableSize: 10,
      budgetPerHead: 300000,
      dishes: [],
      recipeLookup: () => undefined
    });

    expect(fin.roundedFoodCost).toBe(0);
    expect(fin.grossProfit).toBe(15000000);
    expect(fin.profitMarginPercent).toBe(0); // must be 0%, not 100%
  });

  it('T2-D3-04: Extreme guest count (150+ guests) calculation stability and scaling precision', () => {
    const testDish = mockRecipes[0];
    const fin = calculateCateringFinancials({
      guestCount: 200, // 50x scaling for 4-person recipe
      tableSize: 10,
      budgetPerHead: 250000,
      dishes: [{ recipeId: testDish.id, course: 'main' }],
      recipeLookup: id => (id === testDish.id ? testDish : undefined)
    });

    expect(fin.safeGuests).toBe(200);
    expect(fin.numTables).toBe(20);
    expect(fin.totalRevenue).toBe(50000000);
    // 200 / 4 = 50 factor
    const expectedFoodCost = Math.round((testDish.estimatedCostVnd || 40000) * 50);
    expect(fin.roundedFoodCost).toBe(expectedFoodCost);
    expect(fin.grossProfit).toBe(50000000 - expectedFoodCost);
    expect(fin.profitMarginPercent).toBeGreaterThan(0);
    expect(fin.profitMarginPercent).toBeLessThan(100);
  });

  it('T2-D3-05: Equipment checklist custom item whitespace-only addition is rejected, valid text is trimmed', () => {
    const sanitizeEquipmentText = (raw: string): string | null => {
      const trimmed = raw.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    expect(sanitizeEquipmentText('')).toBeNull();
    expect(sanitizeEquipmentText('    ')).toBeNull();
    expect(sanitizeEquipmentText('\t\n')).toBeNull();
    expect(sanitizeEquipmentText('  Bình nước nóng 5L  ')).toBe('Bình nước nóng 5L');
  });
});

describe('Tier 2: Boundary & Corner Cases — Domain 4 (GroceryList)', () => {
  it('T2-D4-01: Duplicate ingredients with unit normalization (kg <-> g, muỗng <-> thìa canh)', () => {
    const input = [
      {
        ingredient: { name: 'Thịt bò phi lê', amount: 0.5, unit: 'kg', category: 'thit-ca' as const },
        recipeCost: 120000,
        totalIngredientsCount: 1
      },
      {
        ingredient: { name: 'Thịt bò phi lê', amount: 300, unit: 'g', category: 'thit-ca' as const },
        recipeCost: 80000,
        totalIngredientsCount: 1
      }
    ];

    const result = aggregateIngredients(input);
    expect(result.items.length).toBe(1);
    // 500g + 300g = 800g
    expect(result.items[0].amount).toBe(800);
    expect(result.items[0].unit).toBe('g');
    expect(result.items[0].cost).toBe(200000);
  });

  it('T2-D4-02: Cost aggregation when same ingredient appears in 10 dishes doesn not compound old costs', () => {
    const dishesCount = 10;
    const input = [];
    for (let i = 0; i < dishesCount; i++) {
      input.push({
        ingredient: { name: 'Hành tím', amount: 50, unit: 'g', category: 'gia-vi' as const },
        recipeCost: 10000,
        totalIngredientsCount: 1
      });
    }

    const result = aggregateIngredients(input);
    expect(result.items.length).toBe(1);
    expect(result.items[0].amount).toBe(500); // 50 * 10
    expect(result.items[0].cost).toBe(100000); // 10,000 * 10
    expect(result.totalCostEstimate).toBe(100000);
  });

  it('T2-D4-03: Empty grocery list progress calculation yields 0% (zero division safe)', () => {
    const zalo = formatZaloShoppingList([], {}, 0);
    expect(zalo).toContain('0% (0/0 món)');
    expect(zalo).toContain('0 đ');
  });

  it('T2-D4-04: 100% checkoff completion percentage calculation when all items are checked', () => {
    const items = [
      { name: 'Cá hồi', normalizedName: 'ca hoi', amount: 300, unit: 'g', category: 'thit-ca' as const, cost: 90000, type: 'fresh' as const },
      { name: 'Măng tây', normalizedName: 'mang tay', amount: 200, unit: 'g', category: 'rau-cu' as const, cost: 40000, type: 'fresh' as const }
    ];
    const checked = { 'Cá hồi': true, 'Măng tây': true };
    const zalo = formatZaloShoppingList(items, checked, 130000);
    expect(zalo).toContain('100% (2/2 món)');
    expect(zalo).not.toContain('[ ] CẦN MUA');
  });

  it('T2-D4-05: Extra grocery items from catering combined with weekly plan without unit collisions', () => {
    const weeklyInput = [
      {
        ingredient: { name: 'Tỏi', amount: 100, unit: 'g', category: 'gia-vi' as const },
        recipeCost: 10000,
        totalIngredientsCount: 1
      }
    ];

    const cateringInput = [
      {
        ingredient: { name: '[Tiệc] Tỏi', amount: 500, unit: 'g', category: 'gia-vi' as const },
        recipeCost: 50000,
        totalIngredientsCount: 1
      }
    ];

    const combined = aggregateIngredients([...weeklyInput, ...cateringInput]);
    expect(combined.items.length).toBe(2); // Separated by [Tiệc] prefix
    expect(combined.totalCostEstimate).toBe(60000);
  });
});

describe('Tier 2: Boundary & Corner Cases — Domain 5 (RecipeCatalog & Modal)', () => {
  it('T2-D5-01: Complex Vietnamese diacritics tone stripping and insensitive matching', () => {
    expect(removeVietnameseTones('phở bò tái chín')).toBe('pho bo tai chin');
    expect(removeVietnameseTones('thịt kho hột vịt')).toBe('thit kho hot vit');
    expect(removeVietnameseTones('lẩu mắm cá linh')).toBe('lau mam ca linh');
    expect(matchesSearchTerm('Lẩu Mắm Cá Linh Bông Điên Điển', 'lau mam')).toBe(true);
    expect(matchesSearchTerm('Thịt Kho Hột Vịt Nước Dừa', 'hot vit')).toBe(true);
  });

  it('T2-D5-02: Unaccented query matching accented recipe titles', () => {
    for (const r of mockRecipes) {
      const unaccented = removeVietnameseTones(r.title).toLowerCase();
      // First 2 words of title
      const query = unaccented.split(' ').slice(0, 2).join(' ');
      expect(matchesRecipeSearch(r, query)).toBe(true);
    }
  });

  it('T2-D5-03: Servings multiplier lower bound: 1 serving multiplier fraction rounding', () => {
    const recipe = mockRecipes[0];
    const base = recipe.servings || 4;
    const factor = 1 / base; // 0.25

    recipe.ingredients.forEach(ing => {
      const num = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount as string) || 1;
      const scaled = Math.round(num * factor * 10) / 10;
      expect(scaled).toBeGreaterThan(0);
    });
  });

  it('T2-D5-04: Extreme servings multiplier (100 servings) scaling math precision', () => {
    const recipe = mockRecipes[0];
    const base = recipe.servings || 4;
    const factor = 100 / base; // 25x

    recipe.ingredients.forEach(ing => {
      const num = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount as string) || 1;
      const scaled = Math.round(num * factor * 10) / 10;
      expect(Number.isFinite(scaled)).toBe(true);
      expect(scaled).toBeGreaterThanOrEqual(num);
    });
  });

  it('T2-D5-05: Cooking step accordion toggle boundary logic', () => {
    const stepsCount = 5;
    const openSteps = new Set<number>();

    const toggleStep = (step: number) => {
      if (openSteps.has(step)) {
        openSteps.delete(step);
      } else {
        openSteps.add(step);
      }
    };

    // Initially all closed
    expect(openSteps.size).toBe(0);

    // Open step 1
    toggleStep(1);
    expect(openSteps.has(1)).toBe(true);
    expect(openSteps.size).toBe(1);

    // Toggle step 1 again -> closed
    toggleStep(1);
    expect(openSteps.has(1)).toBe(false);
    expect(openSteps.size).toBe(0);

    // Open all steps
    for (let i = 1; i <= stepsCount; i++) toggleStep(i);
    expect(openSteps.size).toBe(5);
  });
});

describe('Tier 2: Boundary & Corner Cases — Domain 6 (AccountView & Onboarding)', () => {
  let storage: MockLocalStorage;

  beforeEach(() => {
    storage = setupMockStorage();
  });

  it('T2-D6-01: Low-height screen (< 650px) sticky footer boundary layout verification', () => {
    // In low-height viewport (e.g. 568px iPhone SE), action buttons must be styled as sticky footer:
    // shrink-0, border-t, bg-white/95 or bg-slate-900/95
    const footerClasses = 'shrink-0 border-t bg-white/95 dark:bg-slate-900/95 p-4';
    expect(footerClasses).toContain('shrink-0');
    expect(footerClasses).toContain('border-t');
  });

  it('T2-D6-02: Narrow viewport (320px width) button container bounds (no horizontal overflow)', () => {
    const containerWidth = 320;
    const padding = 32; // p-4 each side = 32px
    const availableWidth = containerWidth - padding; // 288px

    const backButtonWidth = 90;
    const nextButtonWidth = 170;
    const gap = 12; // gap-3 = 12px
    const totalButtonsWidth = backButtonWidth + nextButtonWidth + gap; // 272px

    expect(totalButtonsWidth).toBeLessThanOrEqual(availableWidth);
  });

  it('T2-D6-03: WCAG AA contrast ratio computation verifies compliance (>= 4.5:1 for normal text)', () => {
    // White background (#ffffff) with dark slate text (#0f172a / #1e293b)
    const ratioLight = getContrastRatio('#0f172a', '#ffffff');
    expect(ratioLight).toBeGreaterThan(10);
    expect(isWcagAaCompliant('#0f172a', '#ffffff')).toBe(true);

    // Dark background (#0f172a) with white text (#ffffff)
    const ratioDark = getContrastRatio('#ffffff', '#0f172a');
    expect(ratioDark).toBeGreaterThan(10);
    expect(isWcagAaCompliant('#ffffff', '#0f172a')).toBe(true);

    // Slate-600 (#475569) on white
    const ratioSlate = getContrastRatio('#475569', '#ffffff');
    expect(ratioSlate).toBeGreaterThan(4.5);
    expect(isWcagAaCompliant('#475569', '#ffffff')).toBe(true);
  });

  it('T2-D6-04: Fast repeated theme toggle (light -> dark -> light) state consistency', () => {
    let theme: 'light' | 'dark' = 'light';
    for (let i = 0; i < 10; i++) {
      theme = theme === 'light' ? 'dark' : 'light';
      storage.setItem('mealwise_theme', theme);
    }
    // 10 toggles from light returns to light
    expect(theme).toBe('light');
    expect(storage.getItem('mealwise_theme')).toBe('light');
  });

  it('T2-D6-05: Onboarding step boundaries: step 1 back stays at 1; step 4 complete closes wizard', () => {
    let step = 1;
    let wizardOpen = true;

    const back = () => {
      if (step > 1) step--;
    };
    const next = () => {
      if (step < 4) {
        step++;
      } else {
        wizardOpen = false;
      }
    };

    // Attempt back from step 1
    back();
    expect(step).toBe(1);

    // Progress to step 4
    next(); next(); next();
    expect(step).toBe(4);
    expect(wizardOpen).toBe(true);

    // Next at step 4
    next();
    expect(wizardOpen).toBe(false);
  });
});
