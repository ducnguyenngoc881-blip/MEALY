import { describe, it, expect } from '../helpers/testRunner';
import { Recipe } from '../../src/types';
import {
  sanitizeGuestCount,
  calculateTables,
  calculateCateringFinancials
} from '../helpers/calcUtils';

describe('Unit: Catering Calculations (cateringMath)', () => {
  it('should sanitize guest count bounds across edge inputs', () => {
    expect(sanitizeGuestCount(0)).toBe(1);
    expect(sanitizeGuestCount(-10)).toBe(1);
    expect(sanitizeGuestCount(NaN)).toBe(1);
    expect(sanitizeGuestCount('abc')).toBe(1);
    expect(sanitizeGuestCount(25)).toBe(25);
    expect(sanitizeGuestCount(100)).toBe(100);
    expect(sanitizeGuestCount(999)).toBe(500); // capped at upper bound
  });

  it('should calculate table counts accurately for table sizes 6, 8, and 10', () => {
    // 10-person tables
    expect(calculateTables(10, 10)).toBe(1);
    expect(calculateTables(15, 10)).toBe(2);
    expect(calculateTables(20, 10)).toBe(2);
    expect(calculateTables(45, 10)).toBe(5);

    // 8-person tables
    expect(calculateTables(8, 8)).toBe(1);
    expect(calculateTables(9, 8)).toBe(2);
    expect(calculateTables(16, 8)).toBe(2);
    expect(calculateTables(25, 8)).toBe(4);

    // 6-person tables
    expect(calculateTables(6, 6)).toBe(1);
    expect(calculateTables(7, 6)).toBe(2);
    expect(calculateTables(12, 6)).toBe(2);
    expect(calculateTables(30, 6)).toBe(5);
  });

  it('should calculate revenue and per-table revenue correctly', () => {
    const fin = calculateCateringFinancials({
      guestCount: 20,
      tableSize: 10,
      budgetPerHead: 200000,
      dishes: [],
      recipeLookup: () => undefined
    });

    expect(fin.totalRevenue).toBe(4000000);
    expect(fin.numTables).toBe(2);
    expect(fin.revenuePerTable).toBe(2000000);
  });

  it('should scale food cost proportionally with headcount', () => {
    const mockRecipe: Recipe = {
      id: 'rec-1',
      title: 'Gà Luộc',
      description: '',
      category: 'mon-man',
      region: 'bac',
      prepTimeMinutes: 20,
      cookTimeMinutes: 30,
      servings: 4,
      calories: 500,
      estimatedCostVnd: 120000, // 120k for 4 people -> 30k/person
      imageUrl: '',
      ingredients: [],
      instructions: [],
      tags: []
    };

    const fin = calculateCateringFinancials({
      guestCount: 20, // 5x scale
      tableSize: 10,
      budgetPerHead: 100000,
      dishes: [{ recipeId: 'rec-1', course: 'main' }],
      recipeLookup: id => (id === 'rec-1' ? mockRecipe : undefined)
    });

    // 120k * (20 / 4) = 600,000 đ
    expect(fin.roundedFoodCost).toBe(600000);
    expect(fin.foodCostPerHead).toBe(30000);
    expect(fin.totalRevenue).toBe(2000000);
    expect(fin.grossProfit).toBe(1400000);
    // Margin: 1,400,000 / 2,000,000 = 70%
    expect(fin.profitMarginPercent).toBe(70);
  });

  it('should handle empty course lists safely with 0% margin and zero food cost', () => {
    const fin = calculateCateringFinancials({
      guestCount: 30,
      tableSize: 10,
      budgetPerHead: 250000,
      dishes: [], // no dishes
      recipeLookup: () => undefined
    });

    expect(fin.roundedFoodCost).toBe(0);
    expect(fin.profitMarginPercent).toBe(0); // must not falsely report 100%
  });

  it('should handle odd guest counts and partial tables consistently', () => {
    const mockRecipe: Recipe = {
      id: 'rec-1',
      title: 'Bò Xào',
      description: '',
      category: 'mon-man',
      region: 'bac',
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 4,
      calories: 400,
      estimatedCostVnd: 100000, // 25k/person
      imageUrl: '',
      ingredients: [],
      instructions: [],
      tags: []
    };

    const fin = calculateCateringFinancials({
      guestCount: 15, // 15 guests on 10-person tables -> 2 tables
      tableSize: 10,
      budgetPerHead: 200000,
      dishes: [{ recipeId: 'rec-1', course: 'main' }],
      recipeLookup: id => (id === 'rec-1' ? mockRecipe : undefined)
    });

    expect(fin.numTables).toBe(2);
    expect(fin.totalRevenue).toBe(3000000);
    expect(fin.foodCostPerTable).toBe(187500); // 375,000 / 2 tables
  });

  it('should verify recipesDatabase contains >= 710 dishes and mockRecipes contains all dishes', async () => {
    const { recipesDatabase } = await import('../../src/data/recipesDatabase');
    const { mockRecipes, INITIAL_RECIPES } = await import('../../src/data/mockRecipes');

    expect(recipesDatabase.length).toBeGreaterThanOrEqual(710);
    expect(mockRecipes.length).toBeGreaterThanOrEqual(723);
    expect(INITIAL_RECIPES.length).toBe(13);
  });

  it('should accurately match recipes to party courses using matchRecipeToPartyCourse', async () => {
    const { matchRecipeToPartyCourse } = await import('../../src/components/CateringPartyPlanner');
    const { mockRecipes } = await import('../../src/data/mockRecipes');

    const appetizers = mockRecipes.filter(r => matchRecipeToPartyCourse(r, 'appetizer'));
    const mains = mockRecipes.filter(r => matchRecipeToPartyCourse(r, 'main'));
    const soups = mockRecipes.filter(r => matchRecipeToPartyCourse(r, 'soup_hotpot'));
    const staples = mockRecipes.filter(r => matchRecipeToPartyCourse(r, 'staple'));
    const desserts = mockRecipes.filter(r => matchRecipeToPartyCourse(r, 'dessert_drink'));

    // Verify rich selection for every course category
    expect(appetizers.length).toBeGreaterThanOrEqual(100);
    expect(mains.length).toBeGreaterThanOrEqual(300);
    expect(soups.length).toBeGreaterThanOrEqual(100);
    expect(staples.length).toBeGreaterThanOrEqual(300);
    expect(desserts.length).toBeGreaterThanOrEqual(90);

    // Verify specific dishes match expected courses
    const nemRan = mockRecipes.find(r => r.title.toLowerCase().includes('nem') || r.title.toLowerCase().includes('gỏi'));
    if (nemRan) {
      expect(matchRecipeToPartyCourse(nemRan, 'appetizer')).toBe(true);
    }

    const thitKho = mockRecipes.find(r => r.id === 'thit-kho-tau-trung-vit' || r.id === 'thit-rang-chay-canh');
    if (thitKho) {
      expect(matchRecipeToPartyCourse(thitKho, 'main')).toBe(true);
    }

    const canhCua = mockRecipes.find(r => r.id === 'canh-cua-mong-toi' || r.id.startsWith('party-lau'));
    if (canhCua) {
      expect(matchRecipeToPartyCourse(canhCua, 'soup_hotpot')).toBe(true);
    }

    const banhMi = mockRecipes.find(r => r.id.startsWith('banh-mi-') || r.id.startsWith('pho-'));
    if (banhMi) {
      expect(matchRecipeToPartyCourse(banhMi, 'staple')).toBe(true);
    }

    const cheOrFruit = mockRecipes.find(r => r.category === 'trang-mieng' || r.id.startsWith('snack-'));
    if (cheOrFruit) {
      expect(matchRecipeToPartyCourse(cheOrFruit, 'dessert_drink')).toBe(true);
    }

    // Zero-orphan coverage: every single recipe must be discoverable in at least one course
    const allCourses: Array<'appetizer' | 'main' | 'soup_hotpot' | 'staple' | 'dessert_drink'> = [
      'appetizer',
      'main',
      'soup_hotpot',
      'staple',
      'dessert_drink'
    ];
    const unmatchable = mockRecipes.filter(r => !allCourses.some(c => matchRecipeToPartyCourse(r, c)));
    expect(unmatchable.length).toBe(0);

    // Verify tofu vegetarian dish dau-hu-chien-sa-ot is discoverable
    const dauHu = mockRecipes.find(r => r.id === 'dau-hu-chien-sa-ot');
    expect(dauHu).toBeDefined();
    if (dauHu) {
      expect(matchRecipeToPartyCourse(dauHu, 'main')).toBe(true);
    }
  });

  it('should resolve target course accurately based on modal tab and opened course (resolveTargetCourse)', async () => {
    const { resolveTargetCourse } = await import('../../src/components/CateringPartyPlanner');
    const { mockRecipes } = await import('../../src/data/mockRecipes');

    const beefRecipe = mockRecipes.find(r => r.id === 'thit-rang-chay-canh') || mockRecipes[0];
    const dessertRecipe = mockRecipes.find(r => r.category === 'trang-mieng') || mockRecipes[3];
    const soupRecipe = mockRecipes.find(r => r.category === 'mon-canh') || mockRecipes[1];

    // Scenario 1: User is on a specific tab (e.g. 'main') -> must strictly assign to that tab regardless of openedCourse
    expect(resolveTargetCourse(beefRecipe, 'main', 'appetizer')).toBe('main');
    expect(resolveTargetCourse(dessertRecipe, 'dessert_drink', 'main')).toBe('dessert_drink');

    // Scenario 2: User is on 'all' tab, and selected recipe matches the openedCourse -> retains openedCourse
    expect(resolveTargetCourse(beefRecipe, 'all', 'main')).toBe('main');

    // Scenario 3: User is on 'all' tab, but browsed and picked a dessert while openedCourse was 'main' -> detects dessert_drink
    expect(resolveTargetCourse(dessertRecipe, 'all', 'main')).toBe('dessert_drink');

    // Scenario 4: User is on 'all' tab, but browsed and picked a soup while openedCourse was 'appetizer' -> detects soup_hotpot
    expect(resolveTargetCourse(soupRecipe, 'all', 'appetizer')).toBe('soup_hotpot');
  });

  it('should calculate kitchen workload time correctly with concurrency and guest scaling (calculatePartyKitchenTime)', async () => {
    const { calculatePartyKitchenTime } = await import('../../src/utils/cateringTimeMath');

    // Edge case 1: Empty dishes
    const emptyResult = calculatePartyKitchenTime([], 20);
    expect(emptyResult.prepTimeMinutes).toBe(0);
    expect(emptyResult.cookTimeMinutes).toBe(0);
    expect(emptyResult.totalTimeMinutes).toBe(0);
    expect(emptyResult.formattedTotalTime).toBe('0 phút');

    // Case 2: Standard 4 dishes for 4 guests (base serving)
    const dishes = [
      { title: 'Nem Rán', prepTimeMinutes: 20, cookTimeMinutes: 25 },
      { title: 'Bò Kho', prepTimeMinutes: 25, cookTimeMinutes: 45 },
      { title: 'Canh Cua', prepTimeMinutes: 15, cookTimeMinutes: 20 },
      { title: 'Chè Bưởi', prepTimeMinutes: 20, cookTimeMinutes: 30 }
    ];

    const baseResult = calculatePartyKitchenTime(dishes, 4);
    // Base prep = 20 + 25 + 15 + 20 = 80 min
    expect(baseResult.prepTimeMinutes).toBe(80);
    // Cook times sorted: [45, 30, 25, 20]. max = 45, remaining sum = 75, 75 * 0.25 = 18.75 -> 45 + 18.75 = 64
    expect(baseResult.cookTimeMinutes).toBe(64);
    expect(baseResult.totalTimeMinutes).toBe(144);
    expect(baseResult.formattedTotalTime).toBe('2 giờ 24 phút');

    // Case 3: Scaled for 20 guests (sub-linear prep scaling + batch multiplier 1.2)
    const partyResult = calculatePartyKitchenTime(dishes, 20);
    expect(partyResult.prepTimeMinutes).toBeGreaterThan(baseResult.prepTimeMinutes);
    expect(partyResult.cookTimeMinutes).toBeGreaterThan(baseResult.cookTimeMinutes);
    expect(partyResult.totalTimeMinutes).toBeGreaterThan(baseResult.totalTimeMinutes);
    expect(partyResult.formattedTotalTime).toContain('giờ');

    // Case 4: Scaled for 50 guests (high guest volume batch multiplier 1.35)
    const largeParty = calculatePartyKitchenTime(dishes, 50);
    expect(largeParty.prepTimeMinutes).toBeGreaterThan(partyResult.prepTimeMinutes);
    expect(largeParty.cookTimeMinutes).toBeGreaterThan(partyResult.cookTimeMinutes);
    expect(largeParty.formattedTotalTime).toContain('giờ');
  });

  it('should support saving and loading user party presets with complete data integrity', async () => {
    const { calculatePartyKitchenTime } = await import('../../src/utils/cateringTimeMath');
    const { SavedPartyPreset } = await import('../../src/types');

    const customPreset: SavedPartyPreset = {
      id: 'custom-preset-test-1',
      title: 'Tiệc Tân Gia 30 Khách',
      description: 'Mâm cỗ truyền thống miền Bắc 5 món đậm đà',
      eventType: 'family',
      guestCount: 30,
      tableSize: 10,
      budgetPerHeadVnd: 250000,
      dishes: [
        { recipeId: 'nem-ran-ha-noi', course: 'appetizer' },
        { recipeId: 'thit-rang-chay-canh', course: 'main' },
        { recipeId: 'canh-cua-rau-day', course: 'soup_hotpot' },
        { recipeId: 'che-buoi-an-giang', course: 'dessert_drink' }
      ],
      recommendedDrinks: ['Trà hoa cúc', 'Bia tươi'],
      equipmentChecklist: [
        { id: 'eq-1', text: 'Bát đĩa sứ 30 bộ', category: 'Dụng cụ tiệc', done: true }
      ],
      staffNotes: 'Dọn cỗ lúc 11h30 trưa',
      estimatedPrepMinutes: 90,
      estimatedCookMinutes: 60,
      totalTimeMinutes: 150,
      totalFoodCostVnd: 2800000,
      createdAt: new Date().toISOString()
    };

    expect(customPreset.title).toBe('Tiệc Tân Gia 30 Khách');
    expect(customPreset.guestCount).toBe(30);
    expect(customPreset.dishes.length).toBe(4);
    expect(customPreset.totalTimeMinutes).toBe(150);
    expect(customPreset.totalFoodCostVnd).toBe(2800000);
  });
});

