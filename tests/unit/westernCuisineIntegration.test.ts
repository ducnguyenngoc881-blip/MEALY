import { describe, it, expect } from '../helpers/testRunner';
import { mockMealSets } from '../../src/data/mockMealSets';
import { mockRecipes, WESTERN_RECIPES } from '../../src/data/mockRecipes';
import { generateBudgetCompliantWeeklyPlan } from '../../src/utils/mealPlanGenerator';
import { isHotpotOrFeast } from '../../src/utils/textUtils';
import { getDailyBudgetTarget } from '../../src/utils/currency';

describe('Unit: Western Cuisine Research & Full Integration (Western Food Preference)', () => {
  it('WESTERN-01: Western meal sets library contains 24 diverse authentic sets with varied soups and sides', () => {
    const westernSets = mockMealSets.filter(s => s.id.startsWith('mam-com-au-'));
    expect(westernSets.length).toBe(24);

    // Verify soup diversity across Western sets (no single soup monopolizes all sets)
    const soupIds = new Set(westernSets.map(s => s.soupDish.id));
    expect(soupIds.size).toBeGreaterThanOrEqual(4);
    expect(soupIds.has('sup-kem-nam-tuoi-thao-moc')).toBe(true);
    expect(soupIds.has('sup-ca-chua-hung-que-y')).toBe(true);
    expect(soupIds.has('sup-kem-bi-do-banh-mi-bo')).toBe(true);
    expect(soupIds.has('sup-kem-bap-ngot-ga-xe')).toBe(true);

    // Verify side dish diversity (potatoes, garlic bread, Caesar salad, asparagus, Greek salad, french fries)
    const sideIds = new Set(westernSets.map(s => s.sideDish.id));
    expect(sideIds.size).toBeGreaterThanOrEqual(5);
    expect(sideIds.has('khoai-tay-nghien-bo-toi-thao-moc')).toBe(true);
    expect(sideIds.has('banh-mi-bo-toi-nuong-gion-rum')).toBe(true);
    expect(sideIds.has('salad-caesar-xac-lach-romaine')).toBe(true);
    expect(sideIds.has('mang-tay-ap-chao-bo-toi')).toBe(true);
  });

  it('WESTERN-02: Authentic Western breakfast recipes are registered with valid calories, ingredients and instructions', () => {
    const westernBfastIds = [
      'omelette-nam-pho-mai-mozzarella',
      'banh-mi-nuong-bo-trung-chan-avocado-toast',
      'trung-khuay-scrambled-eggs-xuc-xich-banh-mi',
      'pancake-mat-ong-bo-lat-chuoi',
      'french-toast-banh-mi-nuong-kieu-phap',
      'yen-mach-sua-chua-hoa-qua-say-overnight-oats'
    ];

    westernBfastIds.forEach(id => {
      const recipe = mockRecipes.find(r => r.id === id);
      expect(recipe).toBeDefined();
      expect(recipe!.category).toBe('an-sang');
      expect(recipe!.calories).toBeGreaterThanOrEqual(300);
      expect(recipe!.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(recipe!.instructions.length).toBeGreaterThanOrEqual(3);
      expect(recipe!.tags).toContain('Món Âu');
    });
  });

  it('WESTERN-03: 1-Click weekly meal plan with western-food preference recommends 100% Western breakfasts', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'thoai-mai',
      regionPreference: 'all',
      specialNeeds: ['western-food'],
      mealFormat: 'meal-set'
    });

    expect(plan.length).toBe(7);

    const isWesternBfast = (title: string, tags?: string[]) => {
      const matchTitle = /pancake|sandwich|omelette|bơ tỏi|trứng khuấy|scrambled|french toast|avocado|yến mạch/i.test(title);
      const matchTag = (tags || []).some(t => /món âu|western|breakfast|sandwich|pancake/i.test(t));
      return matchTitle || matchTag;
    };

    plan.forEach(day => {
      const b = day.meals.breakfast;
      expect(isWesternBfast(b.title, b.tags)).toBe(true);
      expect(day.isOverBudget).toBe(false);
    });
  });

  it('WESTERN-04: 1-Click weekly meal plan with western-food preference recommends 100% Western lunches and dinners', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'thoai-mai',
      regionPreference: 'all',
      specialNeeds: ['western-food'],
      mealFormat: 'meal-set'
    });

    plan.forEach(day => {
      expect(day.meals.lunch.id).toMatch(/^mam-com-au-/);
      expect(day.meals.dinner.id).toMatch(/^mam-com-au-/);
      // No same-day duplicates
      expect(day.meals.lunch.id).not.toBe(day.meals.dinner.id);
    });
  });

  it('WESTERN-05: Solo dining with western-food preference generates 100% Western single dishes under budget', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 1,
      budgetLevel: 'thoai-mai',
      regionPreference: 'all',
      specialNeeds: ['western-food'],
      mealFormat: 'single-dish'
    });

    const isWesternMain = (r: any) => {
      const matchTitle = /bít tết|steak|mì ý|pasta|salad|áp chảo|súp kem|khoai tây|burger|gà rán|sườn que|sườn nướng|carbonara|bolognese|curry|aglio e olio|bourguignon|parmigiana/i.test(r.title);
      const matchTag = (r.tags || []).some((t: string) => /món âu|western|steak|bít tết|mì ý|pasta|bbq|fast food/i.test(t));
      return matchTitle || matchTag;
    };

    plan.forEach(day => {
      expect(isWesternMain(day.meals.lunch)).toBe(true);
      expect(isWesternMain(day.meals.dinner)).toBe(true);
      expect(day.isOverBudget).toBe(false);
      expect(isHotpotOrFeast(day.meals.lunch as any)).toBe(false);
      expect(isHotpotOrFeast(day.meals.dinner as any)).toBe(false);
    });
  });

  it('WESTERN-06: Zero hotpot recipes in any Western meal set or recommendation', () => {
    const westernSets = mockMealSets.filter(s => s.id.startsWith('mam-com-au-'));
    westernSets.forEach(s => {
      expect(isHotpotOrFeast(s)).toBe(false);
      expect(isHotpotOrFeast(s.mainDish)).toBe(false);
      expect(isHotpotOrFeast(s.soupDish)).toBe(false);
      expect(isHotpotOrFeast(s.sideDish)).toBe(false);
    });
  });

  it('WESTERN-07: Carbonara appears at most 1 time in a 7-day meal plan with zero repetition across the week', () => {
    // Test both meal-set mode and single-dish mode across multiple runs
    for (let run = 0; run < 5; run++) {
      const planMealSet = generateBudgetCompliantWeeklyPlan({
        servings: 4,
        budgetLevel: 'thoai-mai',
        regionPreference: 'all',
        specialNeeds: ['western-food'],
        mealFormat: 'meal-set',
        seed: `run-mealset-${run}`
      });

      let carbonaraSetCount = 0;
      planMealSet.forEach(day => {
        const lunchTitle = ('title' in day.meals.lunch ? day.meals.lunch.title : '').toLowerCase();
        const dinnerTitle = ('title' in day.meals.dinner ? day.meals.dinner.title : '').toLowerCase();
        if (lunchTitle.includes('carbonara')) carbonaraSetCount++;
        if (dinnerTitle.includes('carbonara')) carbonaraSetCount++;
      });
      // Carbonara must appear at most 1 time in the whole week (never 2+ days, never repeated)
      expect(carbonaraSetCount).toBeLessThanOrEqual(1);

      // Single-dish mode test
      const planSingle = generateBudgetCompliantWeeklyPlan({
        servings: 1,
        budgetLevel: 'thoai-mai',
        regionPreference: 'all',
        specialNeeds: ['western-food'],
        mealFormat: 'single-dish',
        seed: `run-single-${run}`
      });

      let carbonaraDishCount = 0;
      planSingle.forEach(day => {
        const lunchTitle = day.meals.lunch.title.toLowerCase();
        const dinnerTitle = day.meals.dinner.title.toLowerCase();
        if (lunchTitle.includes('carbonara')) carbonaraDishCount++;
        if (dinnerTitle.includes('carbonara')) carbonaraDishCount++;
      });
      // Carbonara must appear at most 1 time in the whole week
      expect(carbonaraDishCount).toBeLessThanOrEqual(1);
    }
  });

  it('WESTERN-08: 500 popular Western dishes database is loaded with authentic categories and Vietnamese ingredient suitability', () => {
    const westernAll = mockRecipes.filter(r => r.tags?.some(t => /món âu|western/i.test(t)));
    // Expect 500+ Western recipes integrated
    expect(westernAll.length).toBeGreaterThanOrEqual(500);

    // Verify categories representation
    const mains = westernAll.filter(r => r.category === 'mon-man');
    const soups = westernAll.filter(r => r.category === 'mon-canh');
    const sides = westernAll.filter(r => r.category === 'mon-xao' || r.category === 'mon-rau' || r.category === 'trang-mieng');
    const bfasts = westernAll.filter(r => r.category === 'an-sang');

    expect(mains.length).toBeGreaterThanOrEqual(200);
    expect(soups.length).toBeGreaterThanOrEqual(50);
    expect(sides.length).toBeGreaterThanOrEqual(80);
    expect(bfasts.length).toBeGreaterThanOrEqual(50);
  });

  it('WESTERN-09: Western preference adapts daily budget target to higher ingredient baseline (85k, 120k, 180k)', () => {
    // 4 people household
    const normalTietKiem = getDailyBudgetTarget('tiet-kiem', 4);
    const westernTietKiem = getDailyBudgetTarget('tiet-kiem', 4, ['western-food']);
    expect(normalTietKiem).toBe(240000); // 60k * 4
    expect(westernTietKiem).toBe(340000); // 85k * 4
    expect(westernTietKiem).toBeGreaterThan(normalTietKiem);

    const normalVuaPhai = getDailyBudgetTarget('vua-phai', 4);
    const westernVuaPhai = getDailyBudgetTarget('vua-phai', 4, ['western-food']);
    expect(normalVuaPhai).toBe(380000); // 95k * 4
    expect(westernVuaPhai).toBe(480000); // 120k * 4
    expect(westernVuaPhai).toBeGreaterThan(normalVuaPhai);

    const normalThoaiMai = getDailyBudgetTarget('thoai-mai', 4);
    const westernThoaiMai = getDailyBudgetTarget('thoai-mai', 4, ['western-food']);
    expect(normalThoaiMai).toBe(560000); // 140k * 4
    expect(westernThoaiMai).toBe(720000); // 180k * 4
    expect(westernThoaiMai).toBeGreaterThan(normalThoaiMai);

    // 1 person solo household
    const soloNormal = getDailyBudgetTarget('tiet-kiem', 1);
    const soloWestern = getDailyBudgetTarget('tiet-kiem', 1, ['western-food']);
    expect(soloNormal).toBe(60000);
    expect(soloWestern).toBe(85000);
  });

  it('WESTERN-10: 1-Click weekly meal plan with western-food strictly satisfies adaptive budget targets (totalWeekCost <= weeklyBudgetTarget)', () => {
    const tiers: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
    
    tiers.forEach(tier => {
      const plan = generateBudgetCompliantWeeklyPlan({
        servings: 4,
        budgetLevel: tier,
        regionPreference: 'all',
        specialNeeds: ['western-food'],
        mealFormat: 'meal-set',
        seed: `test-western-budget-${tier}`
      });

      expect(plan.length).toBe(7);
      const expectedDailyTarget = getDailyBudgetTarget(tier, 4, ['western-food']);
      const weeklyBudgetTarget = expectedDailyTarget * 7;

      let totalWeekCost = 0;
      plan.forEach(day => {
        expect(day.dailyBudgetTarget).toBe(expectedDailyTarget);
        expect(day.isOverBudget).toBe(false);
        totalWeekCost += day.scaledDayCost;
      });

      // Weekly cost must strictly stay within the exact weekly budget target (0 over-budget weeks)
      expect(totalWeekCost).toBeLessThanOrEqual(weeklyBudgetTarget);
    });
  });

  it('WESTERN-11: Multi-need western plans (western + eat-clean / gym) across all household sizes never exceed weekly budget ceiling', () => {
    const testCases = [
      { servings: 1, needs: ['western-food'], format: 'single-dish' as const },
      { servings: 1, needs: ['western-food', 'eat-clean'], format: 'meal-set' as const },
      { servings: 2, needs: ['western-food'], format: 'meal-set' as const },
      { servings: 4, needs: ['western-food', 'eat-clean'], format: 'meal-set' as const },
      { servings: 4, needs: ['western-food', 'gym-protein'], format: 'meal-set' as const },
      { servings: 6, needs: ['western-food'], format: 'meal-set' as const }
    ];

    testCases.forEach(tc => {
      const plan = generateBudgetCompliantWeeklyPlan({
        servings: tc.servings,
        budgetLevel: 'tiet-kiem',
        regionPreference: 'all',
        specialNeeds: tc.needs,
        mealFormat: tc.format,
        seed: `multi-western-${tc.servings}-${tc.needs.join('-')}`
      });

      const dailyTarget = getDailyBudgetTarget('tiet-kiem', tc.servings, tc.needs);
      const weeklyTarget = dailyTarget * 7;
      let totalCost = 0;

      plan.forEach(day => {
        expect(day.isOverBudget).toBe(false);
        totalCost += day.scaledDayCost;
      });

      expect(totalCost).toBeLessThanOrEqual(weeklyTarget);
    });
  });
});
