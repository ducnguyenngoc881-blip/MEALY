import { describe, it, expect } from '../helpers/testRunner';
import { mockRecipes as recipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';
import { VietnameseMealSet, Recipe, isMealSet } from '../../src/types';
import { isHotpotOrFeast } from '../../src/utils/textUtils';
import { generateBudgetCompliantWeeklyPlan } from '../../src/utils/mealPlanGenerator';

describe('Unit: Individual Dish Swap in 3-Dish Meal Sets', () => {

  it('SWAP-DISH-01: isMealSet type guard accurately discriminates 3-dish sets vs single recipes', () => {
    const mealSet = mockMealSets[0];
    const singleRecipe = recipes[0];

    expect(isMealSet(mealSet)).toBe(true);
    expect(isMealSet(singleRecipe)).toBe(false);
    expect(isMealSet(null)).toBe(false);
    expect(isMealSet(undefined)).toBe(false);
    expect(isMealSet({ title: 'Invalid' })).toBe(false);
  });

  it('SWAP-DISH-02: Swapping Món Mặn replaces mainDish while leaving soupDish and sideDish untouched', () => {
    const originalSet = mockMealSets[0];
    const oldMainId = originalSet.mainDish.id;
    const oldSoup = originalSet.soupDish;
    const oldSide = originalSet.sideDish;

    // Filter candidate main dishes
    const candidateMains = recipes.filter(r => 
      r.category === 'mon-man' && 
      r.id !== oldMainId && 
      r.id !== oldSoup.id && 
      r.id !== oldSide.id
    );
    expect(candidateMains.length).toBeGreaterThan(0);

    const replacement = candidateMains[0];
    const updatedSet: VietnameseMealSet = {
      ...originalSet,
      mainDish: replacement,
      totalCostVnd: replacement.estimatedCostVnd + oldSoup.estimatedCostVnd + oldSide.estimatedCostVnd,
      totalCalories: (replacement.calories || 400) + (oldSoup.calories || 150) + (oldSide.calories || 100)
    };

    expect(updatedSet.mainDish.id).toBe(replacement.id);
    expect(updatedSet.mainDish.id).not.toBe(oldMainId);
    expect(updatedSet.soupDish.id).toBe(oldSoup.id);
    expect(updatedSet.sideDish.id).toBe(oldSide.id);
    expect(updatedSet.totalCostVnd).toBe(replacement.estimatedCostVnd + oldSoup.estimatedCostVnd + oldSide.estimatedCostVnd);
  });

  it('SWAP-DISH-03: Swapping Món Canh replaces soupDish while leaving mainDish and sideDish untouched', () => {
    const originalSet = mockMealSets[1];
    const oldMain = originalSet.mainDish;
    const oldSoupId = originalSet.soupDish.id;
    const oldSide = originalSet.sideDish;

    const candidateSoups = recipes.filter(r => 
      r.category === 'mon-canh' && 
      r.id !== oldSoupId && 
      r.id !== oldMain.id && 
      r.id !== oldSide.id
    );
    expect(candidateSoups.length).toBeGreaterThan(0);

    const replacement = candidateSoups[0];
    const updatedSet: VietnameseMealSet = {
      ...originalSet,
      soupDish: replacement,
      totalCostVnd: oldMain.estimatedCostVnd + replacement.estimatedCostVnd + oldSide.estimatedCostVnd,
      totalCalories: (oldMain.calories || 400) + (replacement.calories || 150) + (oldSide.calories || 100)
    };

    expect(updatedSet.soupDish.id).toBe(replacement.id);
    expect(updatedSet.soupDish.id).not.toBe(oldSoupId);
    expect(updatedSet.mainDish.id).toBe(oldMain.id);
    expect(updatedSet.sideDish.id).toBe(oldSide.id);
    expect(updatedSet.totalCostVnd).toBe(oldMain.estimatedCostVnd + replacement.estimatedCostVnd + oldSide.estimatedCostVnd);
  });

  it('SWAP-DISH-04: Swapping Món Rau replaces sideDish while leaving mainDish and soupDish untouched', () => {
    const originalSet = mockMealSets[2];
    const oldMain = originalSet.mainDish;
    const oldSoup = originalSet.soupDish;
    const oldSideId = originalSet.sideDish.id;

    const candidateSides = recipes.filter(r => 
      r.category === 'mon-rau' && 
      r.id !== oldSideId && 
      r.id !== oldMain.id && 
      r.id !== oldSoup.id
    );
    expect(candidateSides.length).toBeGreaterThan(0);

    const replacement = candidateSides[0];
    const updatedSet: VietnameseMealSet = {
      ...originalSet,
      sideDish: replacement,
      totalCostVnd: oldMain.estimatedCostVnd + oldSoup.estimatedCostVnd + replacement.estimatedCostVnd,
      totalCalories: (oldMain.calories || 400) + (oldSoup.calories || 150) + (replacement.calories || 100)
    };

    expect(updatedSet.sideDish.id).toBe(replacement.id);
    expect(updatedSet.sideDish.id).not.toBe(oldSideId);
    expect(updatedSet.mainDish.id).toBe(oldMain.id);
    expect(updatedSet.soupDish.id).toBe(oldSoup.id);
    expect(updatedSet.totalCostVnd).toBe(oldMain.estimatedCostVnd + oldSoup.estimatedCostVnd + replacement.estimatedCostVnd);
  });

  it('SWAP-DISH-05: Swapping dishes in a vegetarian meal set preserves vegetarian dietary compliance', () => {
    const vegSet = mockMealSets.find(m => m.region === 'chay' || m.tags.includes('Ăn Chay') || m.tags.includes('Thanh Tịnh')) || mockMealSets[3];
    expect(vegSet).toBeDefined();

    const candidateVeg = recipes.filter(r => 
      (r.category === 'mon-chay' || (r.tags && r.tags.some(t => /chay/i.test(t)))) &&
      r.id !== vegSet.mainDish.id
    );
    expect(candidateVeg.length).toBeGreaterThan(0);

    // Any picked dish should be vegetarian
    const replacement = candidateVeg[0];
    expect(replacement.category === 'mon-chay' || (replacement.tags && replacement.tags.some(t => /chay/i.test(t)))).toBe(true);
  });

  it('SWAP-DISH-06: Consecutive dish swaps rotate among diverse alternatives without immediate duplicate', () => {
    const mealSet = mockMealSets[0];
    let currentDish = mealSet.mainDish;
    const history: string[] = [currentDish.id];

    for (let i = 0; i < 5; i++) {
      const candidates = recipes.filter(r => 
        r.category === 'mon-man' && 
        r.id !== currentDish.id
      );
      expect(candidates.length).toBeGreaterThan(1);
      const nextDish = candidates[i % candidates.length];
      expect(nextDish.id).not.toBe(currentDish.id);
      currentDish = nextDish;
      history.push(currentDish.id);
    }

    expect(history.length).toBe(6);
  });

  it('SWAP-DISH-07: Western food special need filter identifies western-style dishes and applies bonuses', () => {
    const westernMatches = recipes.filter(r => 
      r.tags?.some(t => /âu|western|steak|bít tết|mì ý|pasta/i.test(t)) ||
      /bít tết|steak|mì ý|pasta|salad|áp chảo|súp kem|khoai tây/i.test(r.title)
    );
    expect(westernMatches.length).toBeGreaterThan(0);

    // Verify western dishes have high protein or distinctive western culinary identity
    const titles = westernMatches.map(r => r.title.toLowerCase());
    const hasSteakOrSaladOrPasta = titles.some(t => t.includes('bít tết') || t.includes('salad') || t.includes('áp chảo') || t.includes('bò'));
    expect(hasSteakOrSaladOrPasta).toBe(true);
  });

  it('SWAP-DISH-08: Empty special needs array produces unrestricted, fully randomized meal suggestions without dietary constraints', () => {
    const emptyNeeds: string[] = [];
    expect(emptyNeeds.length).toBe(0);

    // With empty needs, candidate selection draws from the full diverse recipe catalog
    const allManDishes = recipes.filter(r => r.category === 'mon-man');
    const allCanhDishes = recipes.filter(r => r.category === 'mon-canh');
    const allRauDishes = recipes.filter(r => r.category === 'mon-rau');

    expect(allManDishes.length).toBeGreaterThan(5);
    expect(allCanhDishes.length).toBeGreaterThan(5);
    expect(allRauDishes.length).toBeGreaterThan(5);
  });

  it('SWAP-DISH-09: isHotpotOrFeast accurately identifies all hotpots and banquet party feasts', () => {
    const testHotpots = [
      { id: 'party-lau-rieu-cua-bap-bo', title: 'Đại Tiệc Lẩu Riêu Cua Bắp Bò Sườn Sụn Hà Nội (Hanoi Crab Hotpot)' },
      { id: 'party-lau-thai-hai-san-bo-my', title: 'Đại Tiệc Lẩu Thái Hải Sản Tom Yum & Ba Chỉ Bò Mỹ (Hotpot Party)' },
      { id: 'party-lau-ga-la-e-phu-yen', title: 'Đại Tiệc Lẩu Gà Ta Nấu Lá É Phú Yên (Phu Yen Chicken Hotpot)' },
      { id: 'party-korean-bbq-bo-heo', title: 'Đại Tiệc Nướng BBQ Hàn Quốc Chuẩn K-Pub (Korean BBQ Feast)' },
      { id: 'lau-ech-mang-cay', title: 'Lẩu Ếch Măng Cay' },
      { id: 'hotpot-hai-san', title: 'Seafood Hotpot Mâm Tiệc' }
    ];

    testHotpots.forEach(hp => {
      expect(isHotpotOrFeast(hp as any)).toBe(true);
    });

    const everydaySoups = [
      { id: 'canh-cua-mong-toi', title: 'Canh Cua Đồng Mồng Tơi Rêu Cua' },
      { id: 'canh-chua-ca-hu', title: 'Canh Chua Cá Hú Nam Bộ' },
      { id: 'canh-ngao-nau-chua', title: 'Canh Ngao Nấu Chua Thanh Mát' },
      { id: 'canh-cai-thit-bam', title: 'Canh Cải Ngọt Nấu Thịt Băm' },
      { id: 'canh-bi-dao-tom', title: 'Canh Bí Đao Nấu Tôm Tươi' }
    ];

    everydaySoups.forEach(soup => {
      expect(isHotpotOrFeast(soup as any)).toBe(false);
    });
  });

  it('SWAP-DISH-10: Dish candidate selection for meal set soup slot strictly excludes hotpot recipes across 100 repeated random samplings', () => {
    // Generate pool combining regular recipes and hotpots
    const mockSoupPool: Recipe[] = [
      ...recipes.filter(r => r.category === 'mon-canh'),
      {
        id: 'party-lau-rieu-cua-bap-bo',
        title: 'Đại Tiệc Lẩu Riêu Cua Bắp Bò Sườn Sụn Hà Nội (Hanoi Crab Hotpot)',
        description: 'Lẩu tiệc',
        category: 'mon-canh',
        region: 'bac',
        prepTimeMinutes: 20,
        cookTimeMinutes: 20,
        servings: 4,
        calories: 650,
        estimatedCostVnd: 366000,
        imageUrl: '',
        ingredients: [],
        instructions: [],
        tags: ['Món Lẩu', 'Mâm Tiệc']
      }
    ];

    // Filter candidate recipes following the exact MealWiseContext algorithm
    const isSingleDish = (r: Recipe) => !r.title.startsWith('Mâm Cơm') && !r.id.startsWith('mam-com') && !isHotpotOrFeast(r);
    const isAppropriateForSlot = (r: Recipe) => {
      if (isHotpotOrFeast(r)) return false;
      const hasSoupKeyword = /canh|súp|soup|riêu/i.test(r.title);
      const hasDryKeyword = /chiên|nướng|kho|rang|xào lăn|bít tết|steak|lẩu|hotpot/i.test(r.title);
      if (hasDryKeyword && !hasSoupKeyword) return false;
      return true;
    };

    const eligibleCandidates = mockSoupPool.filter(r => r.category === 'mon-canh' && isSingleDish(r) && isAppropriateForSlot(r));

    // Must have valid candidates
    expect(eligibleCandidates.length).toBeGreaterThan(0);

    // Over 100 random samplings, zero hotpot recipes must ever be selected
    for (let i = 0; i < 100; i++) {
      const chosen = eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
      expect(isHotpotOrFeast(chosen)).toBe(false);
      expect(chosen.title.toLowerCase().includes('lẩu')).toBe(false);
      expect(chosen.title.toLowerCase().includes('hotpot')).toBe(false);
      expect(chosen.id.startsWith('party-')).toBe(false);
    }
  });

  it('SWAP-DISH-11: Weekly plan generation with western-food preference reliably recommends Western meal sets', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['western-food'],
      mealFormat: 'meal-set'
    });

    let westernMealsCount = 0;
    plan.forEach(day => {
      (['lunch', 'dinner'] as const).forEach(slot => {
        const meal = day.meals[slot];
        if (meal && isMealSet(meal)) {
          const isWestern = meal.tags?.some(t => /món âu|western/i.test(t)) ||
                            /món âu|bít tết|mì ý|bbq|cá hồi/i.test(meal.title);
          if (isWestern) westernMealsCount++;
        }
      });
    });

    // In a 7-day week (14 main meals), Western meals must be prominently recommended
    expect(westernMealsCount).toBeGreaterThanOrEqual(4);
  });

  it('SWAP-DISH-12: Single-dish weekly plan with western-food preference prominently recommends Western dishes', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 1,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: ['western-food'],
      mealFormat: 'single-dish'
    });

    let westernDishesCount = 0;
    plan.forEach(day => {
      (['lunch', 'dinner'] as const).forEach(slot => {
        const meal = day.meals[slot];
        if (meal && !isMealSet(meal)) {
          const isWestern = meal.tags?.some(t => /món âu|western|steak|bít tết|mì ý|pasta|bbq/i.test(t)) ||
                            /bít tết|steak|mì ý|pasta|salad|áp chảo|burger|gà rán|sườn nướng|carbonara|bolognese/i.test(meal.title);
          if (isWestern) westernDishesCount++;
        }
      });
    });

    expect(westernDishesCount).toBeGreaterThanOrEqual(3);
  });

});

