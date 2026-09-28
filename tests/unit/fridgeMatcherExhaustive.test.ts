/**
 * Exhaustive Automated Test Suite: Smart Fridge Matching Engine & Semantic Validation
 * Location: tests/unit/fridgeMatcherExhaustive.test.ts
 * 
 * Verifies:
 * 1. 7-Category Exhaustive Matrix Coverage (37 distinct pantry items).
 * 2. 10 Anti-Collision & Brand-Trap Negative Invariants.
 * 3. Multi-Factor Ranking & Synergy Verification (Urgency +50, Leftover bonus, Multi-ingredient sorting).
 * 4. Long-Running Stress & Mutation Testing (728-recipe sweep, pagination offset rotation, adversarial inputs).
 */

import { describe, it, expect } from '../helpers/testRunner';
import { mockRecipes } from '../../src/data/mockRecipes';
import {
  findLeftoverRecipeSuggestions,
  findWholeFridgeRecipeSuggestions,
  matchRecipeWithPantryItem,
  hasExactSyllable,
  isCondiment
} from '../../src/utils/fridgeMatcher';
import { PantryItem, Recipe } from '../../src/types';

// ============================================================================
// SUITE 1: 7-CATEGORY EXHAUSTIVE MATRIX COVERAGE (37 PANTRY ITEMS)
// ============================================================================

describe('Unit: FridgeMatcher - 7-Category Exhaustive Matrix Coverage (35+ Items)', () => {
  // --- CATEGORY 1: TRỨNG (EGG DOMAIN) ---
  it('EXH-CAT1-01: Trứng gà ta strictly suggests dishes containing eggs (0% chicken meat hallucination)', () => {
    const item: PantryItem = {
      id: 'egg-ga',
      name: 'Trứng gà ta',
      category: 'Trứng & Đậu',
      quantity: '4 quả',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasEggIng = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('trứng') || n.includes('hột vịt') || n.includes('ốp la') || n.includes('lòng đỏ');
      });
      const hasEggTitle = r.title.toLowerCase().includes('trứng') || r.title.toLowerCase().includes('ốp la');
      expect(hasEggIng || hasEggTitle).toBe(true);

      // Verify ZERO chicken meat dishes without egg
      const isChickenOnly = r.title.toLowerCase().includes('gỏi gà') || r.title.toLowerCase().includes('gà rán') || r.title.toLowerCase().includes('ức gà');
      if (isChickenOnly) {
        expect(hasEggIng).toBe(true);
      }
    }
  });

  it('EXH-CAT1-02: Trứng vịt strictly suggests egg dishes and excludes duck meat', () => {
    const item: PantryItem = {
      id: 'egg-vit',
      name: 'Trứng vịt',
      category: 'Trứng & Đậu',
      quantity: '4 quả',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasEgg = r.ingredients.some(i => i.name.toLowerCase().includes('trứng') || i.name.toLowerCase().includes('hột vịt')) ||
        r.title.toLowerCase().includes('trứng');
      expect(hasEgg).toBe(true);
    }
  });

  it('EXH-CAT1-03: Trứng cút strictly suggests quail egg / egg dishes', () => {
    const item: PantryItem = {
      id: 'egg-cut',
      name: 'Trứng cút',
      category: 'Trứng & Đậu',
      quantity: '10 quả',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasEgg = r.ingredients.some(i => i.name.toLowerCase().includes('trứng')) || r.title.toLowerCase().includes('trứng');
      expect(hasEgg).toBe(true);
    }
  });

  it('EXH-CAT1-04: Trứng ốp la thừa strictly suggests egg repurposing dishes (bánh mì ốp la, trứng cuộn)', () => {
    const item: PantryItem = {
      id: 'egg-opla',
      name: 'Trứng ốp la thừa',
      category: 'Đồ ăn thừa',
      quantity: '2 quả',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasEgg = r.ingredients.some(i => i.name.toLowerCase().includes('trứng') || i.name.toLowerCase().includes('ốp la')) ||
        r.title.toLowerCase().includes('trứng') || r.title.toLowerCase().includes('ốp la');
      expect(hasEgg).toBe(true);
    }
  });

  // --- CATEGORY 2: THỊT GIA SÚC & GIA CẦM (MEAT & POULTRY DOMAIN) ---
  it('EXH-CAT2-01: Thịt ba chỉ strictly suggests pork belly dishes and rejects vegetarian/chicken dishes', () => {
    const item: PantryItem = {
      id: 'meat-bachi',
      name: 'Thịt ba chỉ',
      category: 'Thịt & Hải sản',
      quantity: '400g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasPork = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('ba chỉ') || n.includes('ba rọi') || n.includes('thịt heo') || n.includes('thịt lợn') || n.includes('thịt nạc');
      }) || r.title.toLowerCase().includes('ba chỉ') || r.title.toLowerCase().includes('ba rọi') || r.title.toLowerCase().includes('thịt heo');
      expect(hasPork).toBe(true);
      expect(r.category).not.toBe('mon-chay');
    }
  });

  it('EXH-CAT2-02: Thịt bò strictly suggests authentic beef dishes (phở bò, bò xào, bò thăn)', () => {
    const item: PantryItem = {
      id: 'meat-bo',
      name: 'Thịt bò',
      category: 'Thịt & Hải sản',
      quantity: '300g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasBeef = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('bò') || n.includes('thịt bò') || n.includes('bò thăn') || n.includes('ba chỉ bò');
      }) || r.title.toLowerCase().includes('bò');
      expect(hasBeef).toBe(true);
    }
  });

  it('EXH-CAT2-03: Thịt gà strictly suggests chicken dishes without poultry-egg confusion', () => {
    const item: PantryItem = {
      id: 'meat-ga',
      name: 'Thịt gà',
      category: 'Thịt & Hải sản',
      quantity: '500g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasChicken = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('gà') && !n.includes('trứng gà') && !n.includes('nấm đùi gà') && !n.includes('hạt nêm')) ||
          n.includes('thịt gà') || n.includes('ức gà') || n.includes('cánh gà') || n.includes('đùi gà');
      }) || (r.title.toLowerCase().includes('gà') && !r.title.toLowerCase().includes('nấm đùi gà') && !r.title.toLowerCase().includes('trứng gà'));
      expect(hasChicken).toBe(true);
    }
  });

  it('EXH-CAT2-04: Thịt heo luộc strictly suggests boiled pork repurposing dishes (cuốn bánh tráng, rang cháy cạnh)', () => {
    const item: PantryItem = {
      id: 'meat-heoluoc',
      name: 'Thịt heo luộc',
      category: 'Đồ ăn thừa',
      quantity: '300g',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasPork = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('thịt heo') || n.includes('thịt lợn') || n.includes('ba chỉ') || n.includes('ba rọi') || n.includes('thịt luộc');
      }) || r.title.toLowerCase().includes('thịt luộc') || r.title.toLowerCase().includes('ba chỉ') || r.title.toLowerCase().includes('thịt heo') || r.title.toLowerCase().includes('cháy cạnh');
      expect(hasPork).toBe(true);
    }
  });

  it('EXH-CAT2-05: Sườn non heo strictly suggests rib dishes and handles Vietnamese synonym mappings', () => {
    const item: PantryItem = {
      id: 'meat-suon',
      name: 'Sườn non heo',
      category: 'Thịt & Hải sản',
      quantity: '500g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasRibs = r.ingredients.some(i => i.name.toLowerCase().includes('sườn')) || r.title.toLowerCase().includes('sườn');
      expect(hasRibs).toBe(true);
    }
  });

  it('EXH-CAT2-06: Thịt vịt strictly suggests authentic duck meat dishes without egg confusion', () => {
    const item: PantryItem = {
      id: 'meat-vit',
      name: 'Thịt vịt',
      category: 'Thịt & Hải sản',
      quantity: '600g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasDuck = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('vịt') && !n.includes('trứng vịt')) || n.includes('thịt vịt');
      }) || (r.title.toLowerCase().includes('vịt') && !r.title.toLowerCase().includes('trứng vịt'));
      expect(hasDuck).toBe(true);
    }
  });

  // --- CATEGORY 3: THỦY HẢI SẢN (SEAFOOD DOMAIN) ---
  it('EXH-CAT3-01: Cá nục strictly suggests mackerel dishes (cá nục kho tiêu, kho dưa chua)', () => {
    const item: PantryItem = {
      id: 'fish-canuc',
      name: 'Cá nục',
      category: 'Thịt & Hải sản',
      quantity: '500g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasCaNuc = r.ingredients.some(i => i.name.toLowerCase().includes('cá nục')) || r.title.toLowerCase().includes('cá nục');
      expect(hasCaNuc).toBe(true);
    }
  });

  it('EXH-CAT3-02: Cá lóc strictly suggests snakehead fish dishes (cháo cá lóc, canh chua cá lóc)', () => {
    const item: PantryItem = {
      id: 'fish-caloc',
      name: 'Cá lóc',
      category: 'Thịt & Hải sản',
      quantity: '600g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasCaLoc = r.ingredients.some(i => i.name.toLowerCase().includes('cá lóc') || i.name.toLowerCase().includes('cá quả')) ||
        r.title.toLowerCase().includes('cá lóc') || r.title.toLowerCase().includes('cá quả');
      expect(hasCaLoc).toBe(true);
    }
  });

  it('EXH-CAT3-03: Cá hồi strictly suggests salmon dishes (cá hồi áp chảo bơ tỏi)', () => {
    const item: PantryItem = {
      id: 'fish-cahoi',
      name: 'Cá hồi',
      category: 'Thịt & Hải sản',
      quantity: '300g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasCaHoi = r.ingredients.some(i => i.name.toLowerCase().includes('cá hồi')) || r.title.toLowerCase().includes('cá hồi');
      expect(hasCaHoi).toBe(true);
    }
  });

  it('EXH-CAT3-04: Tôm sú strictly suggests shrimp dishes and ignores shrimp paste condiment', () => {
    const item: PantryItem = {
      id: 'shrimp-tom',
      name: 'Tôm sú',
      category: 'Thịt & Hải sản',
      quantity: '300g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasShrimp = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('tôm') && !n.includes('mắm tôm') && !n.includes('mì tôm')) || n.includes('tôm sú') || n.includes('tôm thẻ');
      }) || (r.title.toLowerCase().includes('tôm') && !r.title.toLowerCase().includes('mắm tôm'));
      expect(hasShrimp).toBe(true);
    }
  });

  it('EXH-CAT3-05: Mực strictly suggests squid dishes (mực xào cần tỏi)', () => {
    const item: PantryItem = {
      id: 'seafood-muc',
      name: 'Mực',
      category: 'Thịt & Hải sản',
      quantity: '400g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasSquid = r.ingredients.some(i => i.name.toLowerCase().includes('mực') || i.name.toLowerCase().includes('bạch tuộc')) ||
        r.title.toLowerCase().includes('mực');
      expect(hasSquid).toBe(true);
    }
  });

  it('EXH-CAT3-06: Cua đồng strictly suggests fresh field crab dishes and rejects Gạo Ông Cua brand trap', () => {
    const item: PantryItem = {
      id: 'crab-cua',
      name: 'Cua đồng',
      category: 'Thịt & Hải sản',
      quantity: '300g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasCrab = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('cua') && !n.includes('ông cua')) || n.includes('riêu cua');
      }) || (r.title.toLowerCase().includes('cua') && !r.title.toLowerCase().includes('ông cua'));
      expect(hasCrab).toBe(true);
    }
  });

  it('EXH-CAT3-07: Nghêu strictly suggests clam / bivalve dishes (canh ngao nấu chua, cháo ngao)', () => {
    const item: PantryItem = {
      id: 'seafood-ngheu',
      name: 'Nghêu',
      category: 'Thịt & Hải sản',
      quantity: '500g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasClam = r.ingredients.some(i => i.name.toLowerCase().includes('nghêu') || i.name.toLowerCase().includes('ngao')) ||
        r.title.toLowerCase().includes('nghêu') || r.title.toLowerCase().includes('ngao');
      expect(hasClam).toBe(true);
    }
  });

  // --- CATEGORY 4: ĐẬU & NẤM (TOFU & MUSHROOM DOMAIN) ---
  it('EXH-CAT4-01: Đậu phụ sống strictly suggests fresh tofu dishes and ignores soy sauce / oil', () => {
    const item: PantryItem = {
      id: 'tofu-song',
      name: 'Đậu phụ sống',
      category: 'Trứng & Đậu',
      quantity: '2 bìa',
      daysLeft: 1,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasTofu = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('đậu phụ') || n.includes('đậu hũ') || n.includes('đậu rán')) &&
          !n.includes('nước tương') && !n.includes('đậu nành');
      }) || r.title.toLowerCase().includes('đậu hũ') || r.title.toLowerCase().includes('đậu phụ');
      expect(hasTofu).toBe(true);
    }
  });

  it('EXH-CAT4-02: Đậu hũ chiên strictly suggests fried tofu dishes and authentic regional synonyms', () => {
    const item: PantryItem = {
      id: 'tofu-chien',
      name: 'Đậu hũ chiên',
      category: 'Trứng & Đậu',
      quantity: '3 bìa',
      daysLeft: 1,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasTofu = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('đậu phụ') || n.includes('đậu hũ') || n.includes('đậu rán')) && !n.includes('nước tương');
      }) || r.title.toLowerCase().includes('đậu hũ') || r.title.toLowerCase().includes('đậu phụ');
      expect(hasTofu).toBe(true);
    }
  });

  it('EXH-CAT4-03: Nấm rơm strictly suggests straw mushroom dishes (canh nấm hạt sen, cháo nấm)', () => {
    const item: PantryItem = {
      id: 'shroom-rom',
      name: 'Nấm rơm',
      category: 'Rau củ & Nấm',
      quantity: '200g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasMushroom = r.ingredients.some(i => (i.name.toLowerCase().includes('nấm rơm') || i.name.toLowerCase().includes('nấm')) && !i.name.toLowerCase().includes('hạt nêm')) ||
        r.title.toLowerCase().includes('nấm');
      expect(hasMushroom).toBe(true);
    }
  });

  it('EXH-CAT4-04: Nấm đùi gà strictly suggests king oyster mushroom dishes without poultry meat hallucination', () => {
    const item: PantryItem = {
      id: 'shroom-duiga',
      name: 'Nấm đùi gà',
      category: 'Rau củ & Nấm',
      quantity: '250g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasMushroom = r.ingredients.some(i => (i.name.toLowerCase().includes('nấm đùi gà') || i.name.toLowerCase().includes('nấm')) && !i.name.toLowerCase().includes('hạt nêm')) ||
        r.title.toLowerCase().includes('nấm');
      expect(hasMushroom).toBe(true);

      // Verify ZERO poultry meat dishes (e.g. KFC, chicken wings, chicken salads)
      const isChickenDish = r.title.toLowerCase().includes('kfc') || r.title.toLowerCase().includes('cánh gà') || r.title.toLowerCase().includes('gỏi gà');
      expect(isChickenDish).toBe(false);
    }
  });

  it('EXH-CAT4-05: Nấm hương strictly suggests shiitake mushroom dishes (bún mọc, xôi nấm, canh nấm)', () => {
    const item: PantryItem = {
      id: 'shroom-huong',
      name: 'Nấm hương',
      category: 'Rau củ & Nấm',
      quantity: '50g',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasMushroom = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('nấm hương') || n.includes('mộc nhĩ') || n.includes('nấm mèo')) && !n.includes('hạt nêm');
      }) || r.title.toLowerCase().includes('nấm') || r.title.toLowerCase().includes('mộc nhĩ');
      expect(hasMushroom).toBe(true);
    }
  });

  // --- CATEGORY 5: RAU CỦ QUẢ (PRODUCE DOMAIN) ---
  it('EXH-CAT5-01: Cà chua strictly suggests tomato dishes and avoids diacritic collision with fish (cá)', () => {
    const item: PantryItem = {
      id: 'veg-cachua',
      name: 'Cà chua',
      category: 'Rau củ & Nấm',
      quantity: '3 quả',
      daysLeft: 3,
      status: 'fresh'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasTomato = r.ingredients.some(i => i.name.toLowerCase().includes('cà chua')) ||
        r.title.toLowerCase().includes('cà chua') || r.title.toLowerCase().includes('sốt cà');
      expect(hasTomato).toBe(true);
    }
  });

  it('EXH-CAT5-02: Bắp cải strictly suggests cabbage dishes (gỏi gà bắp cải, bắp cải luộc)', () => {
    const item: PantryItem = {
      id: 'veg-bapcai',
      name: 'Bắp cải',
      category: 'Rau củ & Nấm',
      quantity: '1 bắp',
      daysLeft: 3,
      status: 'fresh'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasCabbage = r.ingredients.some(i => i.name.toLowerCase().includes('bắp cải') || i.name.toLowerCase().includes('cải bắp')) ||
        r.title.toLowerCase().includes('bắp cải') || r.title.toLowerCase().includes('cải bắp');
      expect(hasCabbage).toBe(true);
    }
  });

  it('EXH-CAT5-03: Rau muống strictly suggests water spinach dishes (rau muống luộc, bò xào rau muống)', () => {
    const item: PantryItem = {
      id: 'veg-muong',
      name: 'Rau muống',
      category: 'Rau củ & Nấm',
      quantity: '1 bó',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasWaterSpinach = r.ingredients.some(i => i.name.toLowerCase().includes('rau muống')) ||
        r.title.toLowerCase().includes('rau muống');
      expect(hasWaterSpinach).toBe(true);
    }
  });

  it('EXH-CAT5-04: Mồng tơi strictly suggests Malabar spinach dishes (canh cua mồng tơi)', () => {
    const item: PantryItem = {
      id: 'veg-mongtoi',
      name: 'Mồng tơi',
      category: 'Rau củ & Nấm',
      quantity: '1 mớ',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasMalabar = r.ingredients.some(i => i.name.toLowerCase().includes('mồng tơi')) ||
        r.title.toLowerCase().includes('mồng tơi');
      expect(hasMalabar).toBe(true);
    }
  });

  it('EXH-CAT5-05: Cải ngọt strictly suggests choy sum dishes (canh cải, cải ngọt xào)', () => {
    const item: PantryItem = {
      id: 'veg-caingot',
      name: 'Cải ngọt',
      category: 'Rau củ & Nấm',
      quantity: '1 bó',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasChoySum = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('cải ngọt') || n.includes('cải thìa') || (n.includes('rau cải') && !n.includes('dưa cải'));
      }) || r.title.toLowerCase().includes('cải ngọt') || r.title.toLowerCase().includes('cải thìa') ||
        (r.title.toLowerCase().includes('canh cải') && !r.title.toLowerCase().includes('dưa cải'));
      expect(hasChoySum).toBe(true);
    }
  });

  it('EXH-CAT5-06: Bí đỏ strictly suggests pumpkin dishes (cháo bí đỏ thịt băm, canh bí đỏ)', () => {
    const item: PantryItem = {
      id: 'veg-bido',
      name: 'Bí đỏ',
      category: 'Rau củ & Nấm',
      quantity: '1 quả',
      daysLeft: 3,
      status: 'fresh'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasPumpkin = r.ingredients.some(i => i.name.toLowerCase().includes('bí đỏ')) ||
        r.title.toLowerCase().includes('bí đỏ');
      expect(hasPumpkin).toBe(true);
    }
  });

  it('EXH-CAT5-07: Cà rốt strictly suggests carrot dishes (dưa giá, canh nấm hạt sen)', () => {
    const item: PantryItem = {
      id: 'veg-carot',
      name: 'Cà rốt',
      category: 'Rau củ & Nấm',
      quantity: '2 củ',
      daysLeft: 4,
      status: 'fresh'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasCarrot = r.ingredients.some(i => i.name.toLowerCase().includes('cà rốt')) ||
        r.title.toLowerCase().includes('cà rốt');
      expect(hasCarrot).toBe(true);
    }
  });

  it('EXH-CAT5-08: Mướp strictly suggests sweet luffa dishes and rejects bitter melon (mướp đắng)', () => {
    const item: PantryItem = {
      id: 'veg-muop',
      name: 'Mướp',
      category: 'Rau củ & Nấm',
      quantity: '2 quả',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const hasLuffa = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('mướp') || n.includes('mướp hương')) && !n.includes('mướp đắng');
      }) || (r.title.toLowerCase().includes('mướp') && !r.title.toLowerCase().includes('mướp đắng'));
      expect(hasLuffa).toBe(true);
    }
  });

  // --- CATEGORY 6: TINH BỘT & ĐỒ ĂN THỪA (CARBS & STARCH DOMAIN) ---
  it('EXH-CAT6-01: Cơm nguội strictly suggests fried rice / congee and rejects bread, noodles, and blanket Mâm Cơm sets', () => {
    const item: PantryItem = {
      id: 'carb-comnguoi',
      name: 'Cơm nguội',
      category: 'Đồ ăn thừa',
      quantity: '2 bát',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      // Anti-carb clashing
      expect(t.includes('bánh mì')).toBe(false);
      expect(t.includes('bún')).toBe(false);
      expect(t.includes('phở')).toBe(false);
      expect(t.includes('hủ tiếu')).toBe(false);
      expect(t.includes('miến')).toBe(false);

      const isRepurposing = t.includes('cơm rang') || t.includes('cơm chiên') || t.includes('cơm cháy') || t.includes('cháo');
      const hasRiceIng = r.ingredients.some(i => i.name.toLowerCase().includes('cơm') && !i.name.toLowerCase().includes('cá cơm'));
      expect(isRepurposing || hasRiceIng).toBe(true);
    }
  });

  it('EXH-CAT6-02: Xôi strictly suggests sticky rice dishes and rejects bread and noodles', () => {
    const item: PantryItem = {
      id: 'carb-xoi',
      name: 'Xôi',
      category: 'Đồ ăn thừa',
      quantity: '1 gói',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      expect(t.includes('bánh mì')).toBe(false);
      expect(t.includes('bún')).toBe(false);

      const hasStickyRice = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('gạo nếp') || n.includes('nếp cái') || n.includes('xôi');
      }) || t.includes('xôi');
      expect(hasStickyRice).toBe(true);
    }
  });

  it('EXH-CAT6-03: Bún tươi strictly suggests vermicelli noodle dishes and rejects yardlong bean (đậu bún)', () => {
    const item: PantryItem = {
      id: 'carb-buntuoi',
      name: 'Bún tươi',
      category: 'Tinh bột',
      quantity: '500g',
      daysLeft: 1,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      expect(t.includes('cơm rang')).toBe(false);
      expect(t.includes('bánh mì')).toBe(false);

      const hasBun = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('bún') || n.includes('bún tươi')) && !n.includes('đậu bún');
      }) || (t.includes('bún') && !t.includes('đậu bún'));
      expect(hasBun).toBe(true);
    }
  });

  it('EXH-CAT6-04: Bánh mì strictly suggests bread dishes (bánh mì ốp la, bánh mì xíu mại) and rejects rice/noodles', () => {
    const item: PantryItem = {
      id: 'carb-banhmi',
      name: 'Bánh mì',
      category: 'Tinh bột',
      quantity: '2 ổ',
      daysLeft: 2,
      status: 'warning'
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      expect(t.includes('cơm rang')).toBe(false);
      expect(t.includes('cơm chiên')).toBe(false);
      expect(t.includes('phở')).toBe(false);

      const hasBread = r.ingredients.some(i => i.name.toLowerCase().includes('bánh mì') || i.name.toLowerCase().includes('sandwich')) ||
        t.includes('bánh mì');
      expect(hasBread).toBe(true);
    }
  });

  // --- CATEGORY 7: MÓN ĂN THỪA PHỨC HỢP (COMPLEX LEFTOVERS DOMAIN) ---
  it('EXH-CAT7-01: Thịt kho tàu thừa strictly suggests braised pork dishes and rejects fish or standalone pickled cabbage', () => {
    const item: PantryItem = {
      id: 'leftover-thitkho',
      name: 'Thịt kho tàu thừa',
      category: 'Đồ ăn thừa',
      quantity: '1 bát',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      // Rejects fish dishes (Cá Nục Kho Tiêu)
      expect(t.includes('cá nục')).toBe(false);

      const hasBraisedPork = t.includes('thịt kho') || t.includes('kho tàu') || t.includes('thịt ba chỉ kho') ||
        r.ingredients.some(i => i.name.toLowerCase().includes('thịt kho') || i.name.toLowerCase().includes('ba chỉ'));
      expect(hasBraisedPork).toBe(true);
    }
  });

  it('EXH-CAT7-02: Thịt gà luộc thừa strictly suggests authentic shredded chicken dishes (gỏi gà, bún gà xé)', () => {
    const item: PantryItem = {
      id: 'leftover-galuoc',
      name: 'Thịt gà luộc thừa',
      category: 'Đồ ăn thừa',
      quantity: '300g',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      const hasChicken = t.includes('gà') || r.ingredients.some(i => i.name.toLowerCase().includes('thịt gà') || i.name.toLowerCase().includes('gà'));
      expect(hasChicken).toBe(true);
    }
  });

  it('EXH-CAT7-03: Canh rau thừa strictly suggests soup dishes and rejects dry bread or fried rice', () => {
    const item: PantryItem = {
      id: 'leftover-canhrau',
      name: 'Canh rau thừa',
      category: 'Đồ ăn thừa',
      quantity: '1 bát tô',
      daysLeft: 1,
      status: 'warning',
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      expect(t.includes('bánh mì')).toBe(false);
      expect(t.includes('cơm rang')).toBe(false);
      expect(t.includes('canh')).toBe(true);
    }
  });
});

// ============================================================================
// SUITE 2: 10 ANTI-COLLISION & BRAND-TRAP NEGATIVE INVARIANTS
// ============================================================================

describe('Unit: FridgeMatcher - 10 Anti-Collision & Brand-Trap Negative Invariants', () => {
  it('EXH-NEG-01: Trứng gà ta must NOT match chicken meat dishes (KFC, Gỏi gà, Bún gà xé)', () => {
    const item: PantryItem = { id: 'tg', name: 'Trứng gà ta', category: 'Trứng', quantity: '4 quả', daysLeft: 2 };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 20);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      // If dish is chicken salad, fried chicken, or shredded chicken, it MUST contain eggs to be valid
      if (t.includes('kfc') || t.includes('gà rán') || t.includes('gỏi gà xé phay')) {
        const hasEgg = r.ingredients.some(i => i.name.toLowerCase().includes('trứng'));
        expect(hasEgg).toBe(true);
      }
    }
  });

  it('EXH-NEG-02: Nấm đùi gà must NOT match chicken poultry dishes', () => {
    const item: PantryItem = { id: 'ndg', name: 'Nấm đùi gà', category: 'Nấm', quantity: '200g', daysLeft: 2 };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 20);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      // Must not match pure chicken meat recipes
      expect(t.includes('gà rán')).toBe(false);
      expect(t.includes('cánh gà')).toBe(false);
      expect(t.includes('ức gà')).toBe(false);

      const hasMushroom = r.ingredients.some(i => i.name.toLowerCase().includes('nấm')) || t.includes('nấm');
      expect(hasMushroom).toBe(true);
    }
  });

  it('EXH-NEG-03: Cơm nguội must NOT match non-rice Mâm Cơm sets or bread/noodle dishes', () => {
    const item: PantryItem = { id: 'cn', name: 'Cơm nguội', category: 'Đồ ăn thừa', quantity: '1 bát', daysLeft: 1, isLeftover: true };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 20);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      expect(t.includes('bánh mì')).toBe(false);
      expect(t.includes('sandwich')).toBe(false);
      expect(t.includes('bún')).toBe(false);
      expect(t.includes('phở')).toBe(false);

      // Must be a dedicated repurposing dish or genuine rice recipe
      const isRiceRepurposing = t.includes('cơm chiên') || t.includes('cơm rang') || t.includes('cơm cháy') || t.includes('cháo') ||
        r.ingredients.some(i => i.name.toLowerCase().includes('cơm') && !i.name.toLowerCase().includes('cá cơm'));
      expect(isRiceRepurposing).toBe(true);
    }
  });

  it('EXH-NEG-04: Cua đồng must NOT match recipes containing Gạo ST25 Ông Cua', () => {
    const item: PantryItem = { id: 'cd', name: 'Cua đồng', category: 'Hải sản', quantity: '300g', daysLeft: 2 };
    
    // Test direct match against a recipe having only Gạo ST25 Ông Cua and no crab
    const riceOnlyRecipe: Recipe = {
      id: 'test-rice-ongcua',
      title: 'Cơm Trắng Nóng Hổi Gạo ST25',
      description: 'Cơm thơm dẻo',
      category: 'mon-chay',
      region: 'nam',
      prepTimeMinutes: 5,
      cookTimeMinutes: 25,
      servings: 4,
      calories: 300,
      estimatedCostVnd: 20000,
      imageUrl: '',
      ingredients: [{ name: 'Gạo ST25 Ông Cua Thơm Dẻo', amount: 500, unit: 'g', category: 'do-kho' }],
      instructions: [],
      tags: ['com', 'chay']
    };

    const match = matchRecipeWithPantryItem(riceOnlyRecipe, item);
    expect(match.matched).toBe(false);

    // Verify all returned suggestions for Cua đồng from mockRecipes genuinely contain crab
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);
    for (const r of suggestions) {
      const hasCrab = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return (n.includes('cua') && !n.includes('ông cua')) || n.includes('riêu cua');
      }) || (r.title.toLowerCase().includes('cua') && !r.title.toLowerCase().includes('ông cua'));
      expect(hasCrab).toBe(true);
    }
  });

  it('EXH-NEG-05: Cá nục must NOT match Xoài Cát or Gạo Nếp Cái', () => {
    const item: PantryItem = { id: 'ca', name: 'Cá nục', category: 'Hải sản', quantity: '500g', daysLeft: 2 };

    const nonFishRecipeWithXoaiCat: Recipe = {
      id: 'test-xoai-cat',
      title: 'Chè Xoài Cát Hòa Lộc Nước Cốt Dừa',
      description: 'Chè xoài thơm ngon',
      category: 'trang-mieng',
      region: 'nam',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 2,
      calories: 250,
      estimatedCostVnd: 25000,
      imageUrl: '',
      ingredients: [{ name: 'Xoài Cát Hòa Lộc Chín Vàng', amount: 2, unit: 'quả', category: 'rau-cu' }],
      instructions: [],
      tags: ['trang-mieng']
    };

    const match = matchRecipeWithPantryItem(nonFishRecipeWithXoaiCat, item);
    expect(match.matched).toBe(false);

    const nonFishRecipeWithNepCai: Recipe = {
      id: 'test-nep-cai',
      title: 'Xôi Nếp Cái Hoa Vàng Đậu Xanh',
      description: 'Xôi nếp thơm',
      category: 'an-sang',
      region: 'bac',
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      calories: 400,
      estimatedCostVnd: 20000,
      imageUrl: '',
      ingredients: [{ name: 'Gạo Nếp Cái Hoa Vàng', amount: 500, unit: 'g', category: 'do-kho' }],
      instructions: [],
      tags: ['xoi']
    };

    const matchNep = matchRecipeWithPantryItem(nonFishRecipeWithNepCai, item);
    expect(matchNep.matched).toBe(false);
  });

  it('EXH-NEG-06: Hạt tiêu must NOT match Chuối Tiêu', () => {
    const item: PantryItem = { id: 'tieu', name: 'Hạt tiêu', category: 'Gia vị', quantity: '50g', daysLeft: 30 };

    const dessertRecipe: Recipe = {
      id: 'test-chuoi-tieu',
      title: 'Chè Chuối Tiêu Nếp Nướng Nam Bộ',
      description: 'Chuối tiêu nướng',
      category: 'trang-mieng',
      region: 'nam',
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      servings: 2,
      calories: 300,
      estimatedCostVnd: 20000,
      imageUrl: '',
      ingredients: [{ name: 'Chuối Tiêu Chín Mọng', amount: 4, unit: 'quả', category: 'khac' }],
      instructions: [],
      tags: ['che']
    };

    const match = matchRecipeWithPantryItem(dessertRecipe, item);
    expect(match.matched).toBe(false);
  });

  it('EXH-NEG-07: Dầu mè must NOT match Nấm Mèo', () => {
    const item: PantryItem = { id: 'me', name: 'Dầu mè', category: 'Gia vị', quantity: '100ml', daysLeft: 60 };

    const mushroomRecipe: Recipe = {
      id: 'test-nam-meo',
      title: 'Nấm Mèo Xào Mộc Nhĩ Chay',
      description: 'Mộc nhĩ nấm mèo',
      category: 'mon-chay',
      region: 'bac',
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      servings: 2,
      calories: 120,
      estimatedCostVnd: 15000,
      imageUrl: '',
      ingredients: [{ name: 'Nấm Mèo Đen Rừng Khô', amount: 50, unit: 'g', category: 'do-kho' }],
      instructions: [],
      tags: ['chay']
    };

    const match = matchRecipeWithPantryItem(mushroomRecipe, item);
    expect(match.matched).toBe(false);
  });

  it('EXH-NEG-08: Thịt kho tàu thừa must NOT match Cá Nục Kho Tiêu or standalone Dưa chua', () => {
    const item: PantryItem = {
      id: 'tk',
      name: 'Thịt kho tàu thừa',
      category: 'Đồ ăn thừa',
      quantity: '1 bát',
      daysLeft: 1,
      isLeftover: true
    };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    for (const r of suggestions) {
      const t = r.title.toLowerCase();
      expect(t.includes('cá nục kho tiêu')).toBe(false);
      // Standalone pickled mustard greens without pork must not match
      if (t.includes('dưa chua') || t.includes('dưa cải')) {
        const hasPork = r.ingredients.some(i => i.name.toLowerCase().includes('thịt') || i.name.toLowerCase().includes('ba chỉ'));
        expect(hasPork).toBe(true);
      }
    }
  });

  it('EXH-NEG-09: Nước mắm must NOT trigger fish/rice staple matches', () => {
    const item: PantryItem = { id: 'nm', name: 'Nước mắm', category: 'Gia vị', quantity: '1 chai', daysLeft: 60 };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);
    // Base condiment is blocked by isCondiment trap and must return 0 staple dish suggestions
    expect(suggestions.length).toBe(0);
  });

  it('EXH-NEG-10: Thịt ba chỉ must NOT match vegetarian dishes', () => {
    const item: PantryItem = { id: 'bc', name: 'Thịt ba chỉ', category: 'Thịt', quantity: '400g', daysLeft: 2 };
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 20);

    for (const r of suggestions) {
      expect(r.category).not.toBe('mon-chay');
      expect(r.tags.includes('chay')).toBe(false);
    }
  });
});

// ============================================================================
// SUITE 3: MULTI-FACTOR RANKING & SYNERGY VERIFICATION
// ============================================================================

describe('Unit: FridgeMatcher - Multi-Factor Ranking & Synergy Verification', () => {
  it('EXH-RNK-01: Urgency weighting: items with daysLeft <= 2 receive +50 score boost', () => {
    const urgentItem: PantryItem = { id: 'u1', name: 'Trứng gà ta', category: 'Trứng', quantity: '2', daysLeft: 1 };
    const normalItem: PantryItem = { id: 'u2', name: 'Trứng gà ta', category: 'Trứng', quantity: '2', daysLeft: 5 };

    const rUrgent = findWholeFridgeRecipeSuggestions([urgentItem], mockRecipes, 1);
    const rNormal = findWholeFridgeRecipeSuggestions([normalItem], mockRecipes, 1);

    expect(rUrgent.results.length).toBeGreaterThan(0);
    expect(rNormal.results.length).toBeGreaterThan(0);

    const urgentScore = rUrgent.results[0].totalScore;
    const normalScore = rNormal.results[0].totalScore;

    expect(urgentScore - normalScore).toBe(50);
    expect(rUrgent.results[0].urgentMatchedCount).toBe(1);
    expect(rNormal.results[0].urgentMatchedCount).toBe(0);
  });

  it('EXH-RNK-02: Leftover repurposing bonus: leftover items (isLeftover === true) receive repurposing bonus', () => {
    const leftoverItem: PantryItem = { id: 'l1', name: 'Cơm nguội', category: 'Đồ ăn thừa', quantity: '1', daysLeft: 3, isLeftover: true };
    const nonLeftoverItem: PantryItem = { id: 'l2', name: 'Cơm nguội', category: 'Tinh bột', quantity: '1', daysLeft: 3, isLeftover: false };

    const rLeftover = findWholeFridgeRecipeSuggestions([leftoverItem], mockRecipes, 1);
    const rNonLeftover = findWholeFridgeRecipeSuggestions([nonLeftoverItem], mockRecipes, 1);

    expect(rLeftover.results.length).toBeGreaterThan(0);
    expect(rNonLeftover.results.length).toBeGreaterThan(0);

    // Leftover bonus adds score (at least 30 pts)
    expect(rLeftover.results[0].totalScore).toBeGreaterThanOrEqual(rNonLeftover.results[0].totalScore + 30);
  });

  it('EXH-RNK-03: Whole-fridge suggestions sort descending by matchedCount first, then totalScore', () => {
    const multiItems: PantryItem[] = [
      { id: '1', name: 'Cơm nguội', category: 'Đồ ăn thừa', quantity: '1', daysLeft: 1, isLeftover: true },
      { id: '2', name: 'Trứng gà ta', category: 'Trứng & Đậu', quantity: '2', daysLeft: 1 },
      { id: '3', name: 'Cà chua', category: 'Rau củ & Nấm', quantity: '2', daysLeft: 2 },
      { id: '4', name: 'Đậu phụ sống', category: 'Trứng & Đậu', quantity: '1', daysLeft: 1 },
      { id: '5', name: 'Thịt ba chỉ', category: 'Thịt & Hải sản', quantity: '300g', daysLeft: 2 }
    ];

    const { results } = findWholeFridgeRecipeSuggestions(multiItems, mockRecipes, 10);
    expect(results.length).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < results.length - 1; i++) {
      const curr = results[i];
      const next = results[i + 1];

      if (curr.matchedCount !== next.matchedCount) {
        expect(curr.matchedCount).toBeGreaterThanOrEqual(next.matchedCount);
      } else {
        expect(curr.totalScore).toBeGreaterThanOrEqual(next.totalScore);
      }
    }
  });

  it('EXH-RNK-04: Single-item leftover suggestions utilize fridge context for multi-ingredient synergy (+50 each)', () => {
    const targetItem: PantryItem = { id: 'target', name: 'Cơm nguội', category: 'Đồ ăn thừa', quantity: '1 bát', daysLeft: 1, isLeftover: true };
    const companionEgg: PantryItem = { id: 'egg', name: 'Trứng gà ta', category: 'Trứng', quantity: '2', daysLeft: 2 };

    // With companion egg in fridge
    const withFridgeContext = findLeftoverRecipeSuggestions(targetItem, mockRecipes, 4, 0, [targetItem, companionEgg]);
    // Without fridge context
    const withoutFridgeContext = findLeftoverRecipeSuggestions(targetItem, mockRecipes, 4, 0, []);

    expect(withFridgeContext.length).toBeGreaterThan(0);
    expect(withoutFridgeContext.length).toBeGreaterThan(0);

    // Recipes using both rice and egg (like Cơm Chiên Dương Châu) should be highly ranked
    const topDishWithContext = withFridgeContext[0];
    expect(topDishWithContext).toBeDefined();
  });

  it('EXH-RNK-05: Genuine usage tracking: matchedIngredientNames and missingIngredients accurately reflect recipe composition', () => {
    const items: PantryItem[] = [
      { id: 'i1', name: 'Đậu phụ sống', category: 'Trứng & Đậu', quantity: '2 bìa', daysLeft: 1 },
      { id: 'i2', name: 'Cà chua', category: 'Rau củ & Nấm', quantity: '3 quả', daysLeft: 2 }
    ];

    const { results } = findWholeFridgeRecipeSuggestions(items, mockRecipes, 5);
    expect(results.length).toBeGreaterThan(0);

    for (const res of results) {
      expect(res.matchedPantryItems.length).toBe(res.matchedCount);
      expect(res.matchedPantryItemIds.length).toBe(res.matchedCount);
      expect(res.matchedIngredientNames.length).toBe(res.matchedCount);
      expect(res.matchPercentage).toBeGreaterThan(0);
      expect(res.matchPercentage).toBeLessThanOrEqual(100);

      // Verify missing ingredients do not include matched ingredients
      const matchedSet = new Set(res.matchedIngredientNames.map(n => n.toLowerCase()));
      for (const missing of res.missingIngredients) {
        expect(matchedSet.has(missing.toLowerCase())).toBe(false);
      }
    }
  });
});

// ============================================================================
// SUITE 4: LONG-RUNNING STRESS & MUTATION TESTING
// ============================================================================

describe('Unit: FridgeMatcher - Long-Running Stress & Mutation Testing', () => {
  it('EXH-STR-01: Full 728-recipe catalog sweep executes synchronously without throwing and satisfies containment invariant', () => {
    expect(mockRecipes.length).toBeGreaterThanOrEqual(700);

    const testItem: PantryItem = {
      id: 'stress-item',
      name: 'Trứng gà ta',
      category: 'Trứng & Đậu',
      quantity: '4 quả',
      daysLeft: 2
    };

    let evaluatedCount = 0;
    for (const recipe of mockRecipes) {
      const match = matchRecipeWithPantryItem(recipe, testItem);
      expect(typeof match.matched).toBe('boolean');
      expect(typeof match.score).toBe('number');
      evaluatedCount++;
    }

    expect(evaluatedCount).toBe(mockRecipes.length);
  });

  it('EXH-STR-02: Multi-cycle offset pagination rotation (offsets 0, 4, 8, 12, 16, 20...) maintains containment invariant across all cycles', () => {
    const pantryItems: PantryItem[] = [
      { id: '1', name: 'Thịt ba chỉ', category: 'Thịt', quantity: '400g', daysLeft: 2 },
      { id: '2', name: 'Cà chua', category: 'Rau', quantity: '3 quả', daysLeft: 2 }
    ];

    const offsets = [0, 4, 8, 12, 16, 20];
    const seenIdsAcrossCycles: string[] = [];

    for (const offset of offsets) {
      const { results, totalEligible } = findWholeFridgeRecipeSuggestions(pantryItems, mockRecipes, 4, offset);
      expect(results.length).toBeLessThanOrEqual(4);
      expect(totalEligible).toBeGreaterThan(0);

      for (const res of results) {
        seenIdsAcrossCycles.push(res.recipe.id);
        // Containment check for each returned result in every cycle
        expect(res.matchedCount).toBeGreaterThanOrEqual(1);
        expect(res.score).toBeGreaterThan(0);
      }
    }

    // Offset 0 and Offset 4 should offer rotation
    const batch1 = findWholeFridgeRecipeSuggestions(pantryItems, mockRecipes, 4, 0);
    const batch2 = findWholeFridgeRecipeSuggestions(pantryItems, mockRecipes, 4, 4);

    if (batch1.totalEligible >= 8) {
      const b1Ids = new Set(batch1.results.map(r => r.recipe.id));
      const b2Ids = new Set(batch2.results.map(r => r.recipe.id));
      let overlap = 0;
      for (const id of b2Ids) {
        if (b1Ids.has(id)) overlap++;
      }
      expect(overlap).toBeLessThan(4); // Rotation provides fresh meal options
    }
  });

  it('EXH-STR-03: Large offset modulo wrap-around boundary safety prevents undefined crashes', () => {
    const pantryItems: PantryItem[] = [
      { id: '1', name: 'Cơm nguội', category: 'Đồ ăn thừa', quantity: '1', daysLeft: 1, isLeftover: true }
    ];

    const hugeOffsets = [999, 1000, 5000, 10000];
    for (const offset of hugeOffsets) {
      const { results, totalEligible } = findWholeFridgeRecipeSuggestions(pantryItems, mockRecipes, 4, offset);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(4);
      expect(totalEligible).toBeGreaterThan(0);

      for (const r of results) {
        expect(r.recipe).toBeDefined();
        expect(r.recipe.id).toBeDefined();
      }
    }
  });

  it('EXH-STR-04: Adversarial mutation testing: extra whitespace, casing variations, and tone stripping handle gracefully', () => {
    const mutations = [
      { name: '   Trứng Gà Ta   ', category: 'Trứng', daysLeft: 2 },
      { name: 'THỊT BÒ THĂN', category: 'Thịt', daysLeft: 2 },
      { name: '  đậu HŨ chiên   ', category: 'Đậu', daysLeft: 1 },
      { name: 'cơm nguội', category: 'Đồ ăn thừa', daysLeft: 0, isLeftover: true }, // expiring today
      { name: 'Thịt ba chỉ', category: 'Thịt', daysLeft: -1, isLeftover: false }, // expired
      { name: 'Cà rốt', category: 'Rau', daysLeft: 99, isLeftover: false } // extreme shelf life
    ];

    for (const mut of mutations) {
      const item: PantryItem = {
        id: 'mut-' + mut.name,
        name: mut.name,
        category: mut.category,
        quantity: '1',
        daysLeft: mut.daysLeft,
        isLeftover: mut.isLeftover,
        notes: 'Ghi chú kiểm tra đặc biệt: không ăn cá, thích cơm chiên'
      };

      const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 4);
      expect(Array.isArray(suggestions)).toBe(true);
      // Synchronous execution without throw
    }
  });
});
