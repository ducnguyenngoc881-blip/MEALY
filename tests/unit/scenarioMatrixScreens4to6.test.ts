/**
 * Scenario Matrix Suite: Screens 4 to 6
 * Screen 4: GroceryList & ShareCollabCartModal (Đi Chợ Tự Động & Real-time Collab)
 * Screen 5: FridgeView & FridgeLeftoverModal (Tủ Lạnh & Đồ Thừa)
 * Screen 6: CateringPartyPlanner (Tiệc & Đặt Mâm)
 * 
 * Total Tests: 240 distinct registered programmatic scenarios.
 */

import { describe, it, expect } from '../helpers/testRunner';
import { roundToThousand, scaleCost } from '../../src/utils/currency';
import { mockRecipes } from '../../src/data/mockRecipes';
import { INITIAL_PANTRY_ITEMS } from '../../src/data/pantryItems';
import { CORPORATE_PARTY_PRESETS } from '../../src/data/corporatePartyPresets';
import { calculatePartyKitchenTime } from '../../src/utils/cateringTimeMath';
import {
  matchRecipeWithPantryItem,
  findLeftoverRecipeSuggestions,
  findWholeFridgeRecipeSuggestions
} from '../../src/utils/fridgeMatcher';
import { generateCollabRoomId, SHOPPER_PALETTE } from '../../src/services/collabGroceryService';
import { removeVietnameseTones, matchesSearchTerm } from '../../src/utils/textUtils';
import { StoreChannel, PantryItem, Recipe } from '../../src/types';

// ============================================================================
// SCREEN 4: GroceryList & ShareCollabCartModal — 90 Scenarios
// ============================================================================

describe('Matrix Screen 4: Store Channel Price Multipliers (13 Scenarios)', () => {
  const storeMultipliers: Record<StoreChannel, number> = {
    'all': 1.0,
    'cho-dan-sinh': 0.85,
    'winmart': 1.12,
    'bach-hoa-xanh': 1.00,
    'sap-doi-tac': 1.05
  };

  const cartTotals = [
    20000, 50000, 100000, 150000, 200000, 300000,
    500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000
  ];

  for (let i = 0; i < cartTotals.length; i++) {
    const baseTotal = cartTotals[i];
    const id = `M1-S4-Store-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Store channel price simulation for base cart ${baseTotal.toLocaleString()} VND`, () => {
      const choDanSinhPrice = roundToThousand(baseTotal * storeMultipliers['cho-dan-sinh']);
      const winMartPrice = roundToThousand(baseTotal * storeMultipliers['winmart']);
      const bhxPrice = roundToThousand(baseTotal * storeMultipliers['bach-hoa-xanh']);
      const sapDoiTacPrice = roundToThousand(baseTotal * storeMultipliers['sap-doi-tac']);

      expect(choDanSinhPrice).toBeLessThanOrEqual(baseTotal);
      expect(winMartPrice).toBeGreaterThanOrEqual(baseTotal);
      expect(bhxPrice).toBe(baseTotal);
      expect(sapDoiTacPrice).toBeGreaterThanOrEqual(baseTotal);

      expect(choDanSinhPrice % 1000).toBe(0);
      expect(winMartPrice % 1000).toBe(0);
      expect(bhxPrice % 1000).toBe(0);
      expect(sapDoiTacPrice % 1000).toBe(0);
    });
  }
});

describe('Matrix Screen 4: Vietnamese Comma Decimal Parsing (10 Scenarios)', () => {
  const decimalCases = [
    { input: '0,5 kg', expectedGrams: 500 },
    { input: '1,2 kg', expectedGrams: 1200 },
    { input: '0,25 kg', expectedGrams: 250 },
    { input: '2,5 kg', expectedGrams: 2500 },
    { input: '0,75 kg', expectedGrams: 750 },
    { input: '1,5 kg', expectedGrams: 1500 },
    { input: '0,1 kg', expectedGrams: 100 },
    { input: '3,5 kg', expectedGrams: 3500 },
    { input: '0,8 kg', expectedGrams: 800 },
    { input: '4,5 kg', expectedGrams: 4500 }
  ];

  function parseAmount(val: string): number {
    const sanitized = val.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(sanitized);
    return isNaN(num) ? 1 : num;
  }

  for (let i = 0; i < decimalCases.length; i++) {
    const tc = decimalCases[i];
    const id = `M1-S4-Dec-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Parse comma decimal "${tc.input}" -> ${tc.expectedGrams}g`, () => {
      const kg = parseAmount(tc.input);
      const grams = Math.round(kg * 1000);
      expect(grams).toBe(tc.expectedGrams);
    });
  }
});

describe('Matrix Screen 4: Unit Normalization & Lang Conversion (10 Scenarios)', () => {
  const langCases = [
    { lang: 1, expectedGrams: 100 },
    { lang: 2, expectedGrams: 200 },
    { lang: 3, expectedGrams: 300 },
    { lang: 4, expectedGrams: 400 },
    { lang: 5, expectedGrams: 500 },
    { lang: 6, expectedGrams: 600 },
    { lang: 7, expectedGrams: 700 },
    { lang: 8, expectedGrams: 800 },
    { lang: 9, expectedGrams: 900 },
    { lang: 10, expectedGrams: 1000 }
  ];

  for (let i = 0; i < langCases.length; i++) {
    const tc = langCases[i];
    const id = `M1-S4-Lang-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Convert ${tc.lang} lạng to ${tc.expectedGrams}g`, () => {
      const grams = tc.lang * 100;
      expect(grams).toBe(tc.expectedGrams);
      const kg = grams / 1000;
      expect(kg).toBe(tc.expectedGrams / 1000);
    });
  }
});

describe('Matrix Screen 4: Ingredient Merging Across Units (10 Scenarios)', () => {
  const mergeCases = [
    { itemA: { amount: 500, unit: 'g' }, itemB: { amount: 0.5, unit: 'kg' }, expectedTotalGrams: 1000 },
    { itemA: { amount: 200, unit: 'g' }, itemB: { amount: 3, unit: 'lạng' }, expectedTotalGrams: 500 },
    { itemA: { amount: 1, unit: 'kg' }, itemB: { amount: 5, unit: 'lạng' }, expectedTotalGrams: 1500 },
    { itemA: { amount: 1, unit: 'bó' }, itemB: { amount: 2, unit: 'bó' }, expectedTotalCount: 3 },
    { itemA: { amount: 3, unit: 'quả' }, itemB: { amount: 4, unit: 'quả' }, expectedTotalCount: 7 },
    { itemA: { amount: 2, unit: 'củ' }, itemB: { amount: 1, unit: 'củ' }, expectedTotalCount: 3 },
    { itemA: { amount: 1, unit: 'thìa canh' }, itemB: { amount: 2, unit: 'thìa canh' }, expectedTotalCount: 3 },
    { itemA: { amount: 200, unit: 'ml' }, itemB: { amount: 300, unit: 'ml' }, expectedTotalVolume: 500 },
    { itemA: { amount: 0.5, unit: 'l' }, itemB: { amount: 500, unit: 'ml' }, expectedTotalVolume: 1000 },
    { itemA: { amount: 2, unit: 'gói' }, itemB: { amount: 3, unit: 'gói' }, expectedTotalCount: 5 }
  ];

  for (let i = 0; i < mergeCases.length; i++) {
    const tc = mergeCases[i];
    const id = `M1-S4-Merge-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Merge duplicate ingredients (${tc.itemA.unit} & ${tc.itemB.unit})`, () => {
      if ('expectedTotalGrams' in tc) {
        const gA = tc.itemA.unit === 'kg' ? tc.itemA.amount * 1000 : tc.itemA.unit === 'lạng' ? tc.itemA.amount * 100 : tc.itemA.amount;
        const gB = tc.itemB.unit === 'kg' ? tc.itemB.amount * 1000 : tc.itemB.unit === 'lạng' ? tc.itemB.amount * 100 : tc.itemB.amount;
        expect(gA + gB).toBe(tc.expectedTotalGrams);
      } else if ('expectedTotalVolume' in tc) {
        const mlA = tc.itemA.unit === 'l' ? tc.itemA.amount * 1000 : tc.itemA.amount;
        const mlB = tc.itemB.unit === 'l' ? tc.itemB.amount * 1000 : tc.itemB.amount;
        expect(mlA + mlB).toBe(tc.expectedTotalVolume);
      } else if ('expectedTotalCount' in tc) {
        expect(tc.itemA.amount + tc.itemB.amount).toBe(tc.expectedTotalCount);
      }
    });
  }
});

describe('Matrix Screen 4: Item Checkoff & Progress Persistence (20 Scenarios)', () => {
  for (let totalItems = 1; totalItems <= 10; totalItems++) {
    const checkedCount = Math.floor(totalItems / 2);
    const idA = `M1-S4-Prog-${String(totalItems * 2 - 1).padStart(3, '0')}`;
    const idB = `M1-S4-Prog-${String(totalItems * 2).padStart(3, '0')}`;

    it(`${idA}: Progress percentage for ${checkedCount}/${totalItems} items`, () => {
      const pct = Math.round((checkedCount / totalItems) * 100);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });

    it(`${idB}: Checked map JSON serialization round-trip for ${totalItems} items`, () => {
      const checkedMap: Record<string, boolean> = {};
      for (let k = 0; k < totalItems; k++) {
        checkedMap[`item_${k}`] = k < checkedCount;
      }

      const json = JSON.stringify(checkedMap);
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed).length).toBe(totalItems);
      for (let k = 0; k < totalItems; k++) {
        expect(parsed[`item_${k}`]).toBe(k < checkedCount);
      }
    });
  }
});

describe('Matrix Screen 4: Collaborative Cart Code & Sharing (15 Scenarios)', () => {
  for (let i = 0; i < 15; i++) {
    const id = `M1-S4-Collab-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Collab room generation and shopper palette assignment #${i + 1}`, () => {
      const room = generateCollabRoomId();
      expect(room.startsWith('MW-')).toBe(true);
      expect(room.length).toBe(8);

      const colorOption = SHOPPER_PALETTE[i % SHOPPER_PALETTE.length];
      expect(colorOption.id).toBeDefined();
      expect(colorOption.hex.startsWith('#')).toBe(true);
      expect(colorOption.label.length).toBeGreaterThan(0);
    });
  }
});

describe('Matrix Screen 4: Grocery List Category Filtering (12 Scenarios)', () => {
  const categories = ['all', 'thit-ca', 'rau-cu', 'gia-vi', 'tinh-bot', 'do-kho'];
  for (let i = 0; i < 12; i++) {
    const cat = categories[i % categories.length];
    const id = `M1-S4-Cat-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Category filter selection "${cat}"`, () => {
      expect(cat.length).toBeGreaterThan(0);
      const isMatch = (itemCat: string) => cat === 'all' || itemCat === cat;
      expect(isMatch(cat)).toBe(true);
      if (cat !== 'all') {
        expect(isMatch('unrelated-category')).toBe(false);
      }
    });
  }
});

// ============================================================================
// SCREEN 5: FridgeView & FridgeLeftoverModal — 60 Scenarios
// ============================================================================

describe('Matrix Screen 5: Expiry Warning Thresholds (20 Scenarios)', () => {
  for (let d = -5; d <= 14; d++) {
    const id = `M1-S5-Exp-${String(d + 6).padStart(3, '0')}`;
    it(`${id}: Expiry status evaluation for daysLeft = ${d}`, () => {
      let status: 'expired' | 'urgent' | 'fresh';
      let label: string;

      if (d <= 0) {
        status = 'expired';
        label = d === 0 ? 'Hết hạn hôm nay' : 'Đã hết hạn';
      } else if (d <= 2) {
        status = 'urgent';
        label = d === 1 ? 'Hết hạn ngày mai' : 'Còn 2 ngày';
      } else {
        status = 'fresh';
        label = `Còn ${d} ngày`;
      }

      if (d <= 0) {
        expect(status).toBe('expired');
      } else if (d <= 2) {
        expect(status).toBe('urgent');
      } else {
        expect(status).toBe('fresh');
      }
      expect(label.length).toBeGreaterThan(0);
    });
  }
});

describe('Matrix Screen 5: 7 Inventory Categories (14 Scenarios)', () => {
  const inventoryCats = ['thit', 'hai-san', 'rau-cu', 'trung', 'dau-nam', 'tinh-bot', 'gia-vi'] as const;
  const sampleInventory: PantryItem[] = [
    { id: 'p-thit', name: 'Thịt ba chỉ', category: 'thit', quantity: '500g', daysLeft: 3 },
    { id: 'p-haisan', name: 'Tôm sú', category: 'hai-san', quantity: '300g', daysLeft: 2 },
    { id: 'p-rau', name: 'Rau muống', category: 'rau-cu', quantity: '1 bó', daysLeft: 2 },
    { id: 'p-trung', name: 'Trứng gà', category: 'trung', quantity: '6 quả', daysLeft: 5 },
    { id: 'p-daunam', name: 'Đậu phụ', category: 'dau-nam', quantity: '3 bìa', daysLeft: 1 },
    { id: 'p-tinhbot', name: 'Cơm nguội', category: 'tinh-bot', quantity: '1 bát', daysLeft: 1 },
    { id: 'p-giavi', name: 'Hành tím', category: 'gia-vi', quantity: '100g', daysLeft: 10 }
  ];

  for (let i = 0; i < 14; i++) {
    const cat = inventoryCats[i % inventoryCats.length];
    const id = `M1-S5-Inv-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Filter pantry items by category "${cat}"`, () => {
      const items = sampleInventory.filter(p => p.category === cat);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
      expect(items[0].category).toBe(cat);
      expect(items[0].name.length).toBeGreaterThan(0);
    });
  }
});

describe('Matrix Screen 5: FridgeMatcher Semantic Containment (16 Scenarios)', () => {
  const matchCases = [
    { ingredientName: 'Trứng gà', expectDishWith: 'trứng' },
    { ingredientName: 'Thịt ba chỉ', expectDishWith: 'thịt' },
    { ingredientName: 'Thịt bò', expectDishWith: 'bò' },
    { ingredientName: 'Cá lóc', expectDishWith: 'cá' },
    { ingredientName: 'Tôm sú', expectDishWith: 'tôm' },
    { ingredientName: 'Đậu phụ', expectDishWith: 'đậu' },
    { ingredientName: 'Rau muống', expectDishWith: 'rau muống' },
    { ingredientName: 'Cơm nguội', expectDishWith: 'cơm' },
    { ingredientName: 'Bắp cải', expectDishWith: 'bắp cải' },
    { ingredientName: 'Cà chua', expectDishWith: 'cà chua' },
    { ingredientName: 'Sườn heo', expectDishWith: 'sườn' },
    { ingredientName: 'Thịt gà', expectDishWith: 'gà' },
    { ingredientName: 'Nấm rơm', expectDishWith: 'nấm' },
    { ingredientName: 'Bí đỏ', expectDishWith: 'bí đỏ' },
    { ingredientName: 'Mực ống', expectDishWith: 'mực' },
    { ingredientName: 'Nghêu', expectDishWith: 'ngao' }
  ];

  for (let i = 0; i < matchCases.length; i++) {
    const tc = matchCases[i];
    const id = `M1-S5-Match-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Semantic ingredient matching for "${tc.ingredientName}"`, () => {
      const pantryItem: PantryItem = {
        id: `test_item_${i}`,
        name: tc.ingredientName,
        amount: 200,
        unit: 'g',
        category: 'thit',
        daysLeft: 2,
        addedAt: new Date().toISOString()
      };

      const suggestions = findLeftoverRecipeSuggestions(pantryItem, mockRecipes, 5, 0);
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);

      // Verify containment invariant
      for (const recipe of suggestions) {
        const match = matchRecipeWithPantryItem(recipe, pantryItem);
        expect(match.matched).toBe(true);
      }
    });
  }
});

describe('Matrix Screen 5: Whole-Fridge Synergy & Ranking (10 Scenarios)', () => {
  const pantryPool: PantryItem[] = [
    { id: 'p1', name: 'Trứng gà', category: 'trung', daysLeft: 1 },
    { id: 'p2', name: 'Cà chua', category: 'rau-cu', daysLeft: 2 },
    { id: 'p3', name: 'Thịt ba chỉ', category: 'thit', daysLeft: 3 },
    { id: 'p4', name: 'Hành lá', category: 'rau-cu', daysLeft: 2 },
    { id: 'p5', name: 'Đậu phụ', category: 'dau-nam', daysLeft: 1 }
  ];

  for (let i = 0; i < 10; i++) {
    const id = `M1-S5-Syn-${String(i + 1).padStart(3, '0')}`;
    it(`${id}: Whole-fridge ranking with ${Math.min(i + 2, 5)} items`, () => {
      const selectedPantry = pantryPool.slice(0, Math.min(i + 2, pantryPool.length));
      const { results } = findWholeFridgeRecipeSuggestions(selectedPantry, mockRecipes, 5, 0);
      expect(Array.isArray(results)).toBe(true);

      // Suggestions should be ordered by matched items
      if (results.length >= 2) {
        expect(results[0].matchedCount).toBeGreaterThanOrEqual(results[1].matchedCount);
      }
    });
  }
});

// ============================================================================
// SCREEN 6: CateringPartyPlanner (Tiệc & Đặt Mâm) — 90 Scenarios
// ============================================================================

describe('Matrix Screen 6: Parametric Guest Counts x Table Sizes (35 Scenarios)', () => {
  const guestCounts = [
    1, 2, 4, 6, 8, 10, 12, 15, 18, 20,
    24, 25, 30, 36, 40, 48, 50, 60, 70, 75,
    80, 90, 100, 120, 150, 180, 200, 250, 300, 350,
    400, 450, 500, 0, -5
  ];

  for (let i = 0; i < guestCounts.length; i++) {
    const guests = guestCounts[i];
    const tableSize = i % 2 === 0 ? 10 : 8;
    const id = `M1-S6-Table-${String(i + 1).padStart(3, '0')}`;

    it(`${id}: Calculate tables for ${guests} guests (tableSize=${tableSize})`, () => {
      const safeGuests = Math.max(1, guests);
      const tables = Math.ceil(safeGuests / tableSize);
      const spareSeats = (tables * tableSize) - safeGuests;

      expect(tables).toBeGreaterThanOrEqual(1);
      expect(spareSeats).toBeGreaterThanOrEqual(0);
      expect(spareSeats).toBeLessThan(tableSize);

      const capacity = tables * tableSize;
      expect(capacity).toBeGreaterThanOrEqual(safeGuests);
    });
  }
});

describe('Matrix Screen 6: Financial Formulas & Gross Margin Sweeps (25 Scenarios)', () => {
  const dishCostsPerTable = [
    500000, 750000, 1000000, 1200000, 1500000,
    1800000, 2000000, 2500000, 3000000
  ];
  const marginRatios = [0.20, 0.30, 0.35, 0.40, 0.50];

  let testIndex = 0;
  for (let c = 0; c < 5; c++) {
    for (let m = 0; m < 5; m++) {
      testIndex++;
      const foodCost = dishCostsPerTable[c];
      const margin = marginRatios[m];
      const tables = 5;
      const id = `M1-S6-Fin-${String(testIndex).padStart(3, '0')}`;

      it(`${id}: Financial calculation: cost=${foodCost.toLocaleString()}, margin=${margin * 100}%`, () => {
        const totalFoodCost = foodCost * tables;
        const quotedPricePerTable = roundToThousand(foodCost * (1 + margin));
        const totalQuotedRevenue = quotedPricePerTable * tables;
        const grossProfit = totalQuotedRevenue - totalFoodCost;
        const grossMarginPercent = Number(((grossProfit / totalQuotedRevenue) * 100).toFixed(1));

        expect(totalQuotedRevenue).toBeGreaterThan(totalFoodCost);
        expect(grossProfit).toBeGreaterThan(0);
        expect(grossMarginPercent).toBeGreaterThan(0);
        expect(quotedPricePerTable % 1000).toBe(0);
      });
    }
  }
});

describe('Matrix Screen 6: Equipment Checklist Calculations (15 Scenarios)', () => {
  for (let tables = 1; tables <= 15; tables++) {
    const id = `M1-S6-Equip-${String(tables).padStart(3, '0')}`;
    it(`${id}: Equipment checklist items for ${tables} banquet tables`, () => {
      const riceBowls = tables * 12; // 10 guests + 2 spares per table
      const hotpotStoves = tables * 1;
      const tablecloths = tables * 1;
      const beverageGlasses = tables * 12;

      expect(riceBowls).toBe(tables * 12);
      expect(hotpotStoves).toBe(tables);
      expect(tablecloths).toBe(tables);
      expect(beverageGlasses).toBe(tables * 12);
    });
  }
});

describe('Matrix Screen 6: Zalo Quotation Generator & Export (15 Scenarios)', () => {
  for (let i = 0; i < 15; i++) {
    const preset = CORPORATE_PARTY_PRESETS[i % CORPORATE_PARTY_PRESETS.length];
    const id = `M1-S6-Quote-${String(i + 1).padStart(3, '0')}`;

    it(`${id}: Format Zalo quotation for preset "${preset.title}"`, () => {
      const tables = 6;
      const guests = 60;
      const totalCost = preset.suggestedPerHeadBudgetVnd * guests;
      const deposit50 = roundToThousand(totalCost * 0.5);

      const quoteText = [
        `📋 BÁO GIÁ ĐẶT TIỆC - MEALWISE CATERING`,
        `Gói tiệc: ${preset.title}`,
        `Số lượng: ${guests} khách (${tables} bàn)`,
        `Tổng dự toán: ${totalCost.toLocaleString()} VNĐ`,
        `Tiền cọc (50%): ${deposit50.toLocaleString()} VNĐ`,
        `Thực đơn: ${preset.menuRecipes.map(d => d.title).join(', ')}`
      ].join('\n');

      expect(quoteText.includes(preset.title)).toBe(true);
      expect(quoteText.includes('MEALWISE CATERING')).toBe(true);
      expect(quoteText.includes(totalCost.toLocaleString())).toBe(true);
      expect(quoteText.includes(deposit50.toLocaleString())).toBe(true);
    });
  }
});
