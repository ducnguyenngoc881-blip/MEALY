import { describe, it, expect } from '../helpers/testRunner';
import {
  canonicalizeIngredientName,
  decomposeBundledIngredients,
  normalizeIngredientUnitAndAmount,
  formatDisplayAmountAndUnit,
  PRODUCE_UNIT_WEIGHTS
} from '../../src/utils/ingredientNormalizer';
import { Recipe } from '../../src/types';

describe('Unit: Grocery Aggregation & Consolidated Ingredient Counting', () => {

  it('canonicalizes diverse culinary adjectives and preparation descriptors to standard entities', () => {
    expect(canonicalizeIngredientName('Cà chua chín đỏ mọng')).toBe('Cà chua');
    expect(canonicalizeIngredientName('Cà chua chín tới hoặc cà chua bi')).toBe('Cà chua');
    expect(canonicalizeIngredientName('Cà chua bi tươi')).toBe('Cà chua');
    expect(canonicalizeIngredientName('Cà chua tươi')).toBe('Cà chua');

    expect(canonicalizeIngredientName('Thịt ba chỉ rút sườn')).toBe('Thịt ba chỉ');
    expect(canonicalizeIngredientName('Thịt ba chỉ heo tươi')).toBe('Thịt ba chỉ');
    expect(canonicalizeIngredientName('Thịt ba rọi')).toBe('Thịt ba chỉ');

    expect(canonicalizeIngredientName('Trứng gà tươi')).toBe('Trứng gà');
    expect(canonicalizeIngredientName('Trứng gà ta')).toBe('Trứng gà');

    expect(canonicalizeIngredientName('Hành khô băm')).toBe('Hành tím (hành khô)');
    expect(canonicalizeIngredientName('Hành hoa thái nhỏ')).toBe('Hành lá');
    expect(canonicalizeIngredientName('Tỏi khô băm nhuyễn')).toBe('Tỏi');
    expect(canonicalizeIngredientName('Dứa (Thơm) chín gọt sạch mắt')).toBe('Dứa (thơm)');
  });

  it('decomposes bundled ingredients with & or và into individual items with proportional quantities', () => {
    const decomposed = decomposeBundledIngredients('Cà rốt & Khoai tây cắt miếng lớn', 300, 'g', 'rau-cu', 30000);
    expect(decomposed.length).toBe(2);
    expect(decomposed[0].name).toBe('Cà rốt');
    expect(decomposed[0].amount).toBe(150);
    expect(decomposed[0].unit).toBe('g');
    expect(decomposed[0].cost).toBe(15000);

    expect(decomposed[1].name).toBe('Khoai tây cắt miếng lớn');
    expect(decomposed[1].amount).toBe(150);
    expect(decomposed[1].unit).toBe('g');
    expect(decomposed[1].cost).toBe(15000);

    // After canonicalization, the second item becomes "Khoai tây"
    expect(canonicalizeIngredientName(decomposed[1].name)).toBe('Khoai tây');
  });

  it('solves user scenario: merges 4 distinct tomato dish requirements into 1 unified 3.3 kg Cà chua item', () => {
    // 4 inputs matching the user screenshot exactly:
    const rawItems = [
      { name: 'Cà chua bi tươi', amount: 500, unit: 'g', cost: 45000, dish: 'Salad Địa Trung Hải' },
      { name: 'Cà chua chín đỏ mọng', amount: 2, unit: 'kg', cost: 36000, dish: 'Súp Cà Chua Nướng' },
      { name: 'Cà chua chín đỏ mọng', amount: 6, unit: 'quả', cost: 77054, dish: 'Canh Ngao Nấu Chua' },
      { name: 'Cà chua chín tới hoặc cà chua bi', amount: 200, unit: 'g', cost: 8400, dish: 'Salad Hy Lạp' }
    ];

    const itemsMap: Record<string, {
      cleanName: string;
      baseAmount: number;
      baseUnit: string;
      family: any;
      cost: number;
      dishNames: string[];
      dishCount: number;
    }> = {};

    rawItems.forEach(item => {
      const norm = normalizeIngredientUnitAndAmount(item.name, item.amount, item.unit);
      
      // All 4 must share the identical groupKey
      expect(norm.cleanName).toBe('Cà chua');
      expect(norm.groupKey).toBe('cà chua__weight');

      if (!itemsMap[norm.groupKey]) {
        itemsMap[norm.groupKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          cost: item.cost,
          dishNames: [item.dish],
          dishCount: 1
        };
      } else {
        itemsMap[norm.groupKey].baseAmount += norm.baseAmount;
        itemsMap[norm.groupKey].cost += item.cost;
        if (!itemsMap[norm.groupKey].dishNames.includes(item.dish)) {
          itemsMap[norm.groupKey].dishNames.push(item.dish);
        }
        itemsMap[norm.groupKey].dishCount += 1;
      }
    });

    // There must be EXACTLY 1 consolidated entry
    const entries = Object.values(itemsMap);
    expect(entries.length).toBe(1);

    const tomatoEntry = entries[0];
    expect(tomatoEntry.cleanName).toBe('Cà chua');
    // 500g + 2000g + (6 * 100g = 600g) + 200g = 3300g = 3.3 kg
    expect(tomatoEntry.baseAmount).toBe(3300);
    expect(tomatoEntry.dishCount).toBe(4);
    expect(tomatoEntry.dishNames.length).toBe(4);
    expect(tomatoEntry.cost).toBe(45000 + 36000 + 77054 + 8400);

    const formatted = formatDisplayAmountAndUnit(tomatoEntry.baseAmount, tomatoEntry.family, tomatoEntry.baseUnit);
    expect(formatted.amount).toBe(3.3);
    expect(formatted.unit).toBe('kg');
    expect(formatted.displayStr).toBe('3.3 kg');
  });

  it('aggregates shared pork belly ingredients across multiple dishes into a single item with count badge', () => {
    const rawPork = [
      { name: 'Thịt ba chỉ rút sườn', amount: 500, unit: 'g', cost: 70000, dish: 'Thịt Kho Tàu' },
      { name: 'Thịt ba chỉ heo tươi', amount: 0.4, unit: 'kg', cost: 56000, dish: 'Thịt Rang Cháy Cạnh' },
      { name: 'Thịt ba rọi', amount: 3, unit: 'lạng', cost: 42000, dish: 'Canh Cải Nấu Thịt' }
    ];

    const itemsMap: Record<string, any> = {};

    rawPork.forEach(item => {
      const norm = normalizeIngredientUnitAndAmount(item.name, item.amount, item.unit);
      expect(norm.cleanName).toBe('Thịt ba chỉ');
      expect(norm.groupKey).toBe('thịt ba chỉ__weight');

      if (!itemsMap[norm.groupKey]) {
        itemsMap[norm.groupKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          cost: item.cost,
          dishNames: [item.dish],
          dishCount: 1
        };
      } else {
        itemsMap[norm.groupKey].baseAmount += norm.baseAmount;
        itemsMap[norm.groupKey].cost += item.cost;
        if (!itemsMap[norm.groupKey].dishNames.includes(item.dish)) {
          itemsMap[norm.groupKey].dishNames.push(item.dish);
        }
        itemsMap[norm.groupKey].dishCount += 1;
      }
    });

    const entries = Object.values(itemsMap);
    expect(entries.length).toBe(1);
    expect(entries[0].cleanName).toBe('Thịt ba chỉ');
    // 500g + 400g + 300g = 1200g = 1.2 kg
    expect(entries[0].baseAmount).toBe(1200);
    expect(entries[0].dishCount).toBe(3);

    const formatted = formatDisplayAmountAndUnit(entries[0].baseAmount, entries[0].family, entries[0].baseUnit);
    expect(formatted.displayStr).toBe('1.2 kg');
  });

  it('aggregates shared egg requirements preserving natural egg count units', () => {
    const rawEggs = [
      { name: 'Trứng gà tươi', amount: 3, unit: 'quả', cost: 15000, dish: 'Thịt Kho Trứng' },
      { name: 'Trứng gà ta', amount: 4, unit: 'quả', cost: 20000, dish: 'Trứng Chiên Cuộn' }
    ];

    const itemsMap: Record<string, any> = {};

    rawEggs.forEach(item => {
      const norm = normalizeIngredientUnitAndAmount(item.name, item.amount, item.unit);
      expect(norm.cleanName).toBe('Trứng gà');
      expect(norm.family).toBe('count');
      expect(norm.groupKey).toBe('trứng gà__count');

      if (!itemsMap[norm.groupKey]) {
        itemsMap[norm.groupKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          cost: item.cost,
          dishNames: [item.dish],
          dishCount: 1
        };
      } else {
        itemsMap[norm.groupKey].baseAmount += norm.baseAmount;
        itemsMap[norm.groupKey].cost += item.cost;
        if (!itemsMap[norm.groupKey].dishNames.includes(item.dish)) {
          itemsMap[norm.groupKey].dishNames.push(item.dish);
        }
        itemsMap[norm.groupKey].dishCount += 1;
      }
    });

    const entries = Object.values(itemsMap);
    expect(entries.length).toBe(1);
    expect(entries[0].cleanName).toBe('Trứng gà');
    expect(entries[0].baseAmount).toBe(7);
    expect(entries[0].dishCount).toBe(2);

    const formatted = formatDisplayAmountAndUnit(entries[0].baseAmount, entries[0].family, entries[0].baseUnit);
    expect(formatted.displayStr).toBe('7 quả');
  });

  it('correctly integrates bundled ingredients and merges with standalone ingredients', () => {
    // Dish 1 has bundled "Cà rốt & Khoai tây cắt miếng lớn" (300g)
    const bundled = decomposeBundledIngredients('Cà rốt & Khoai tây cắt miếng lớn', 300, 'g', 'rau-cu', 30000);
    // Dish 2 has standalone "Cà rốt tươi" (200g)
    const standaloneCarrot = { name: 'Cà rốt tươi', amount: 200, unit: 'g', category: 'rau-cu', cost: 10000 };

    const itemsMap: Record<string, any> = {};

    [...bundled, standaloneCarrot].forEach(item => {
      const norm = normalizeIngredientUnitAndAmount(item.name, item.amount, item.unit);

      if (!itemsMap[norm.groupKey]) {
        itemsMap[norm.groupKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          cost: item.cost,
          dishCount: 1
        };
      } else {
        itemsMap[norm.groupKey].baseAmount += norm.baseAmount;
        itemsMap[norm.groupKey].cost += item.cost;
        itemsMap[norm.groupKey].dishCount += 1;
      }
    });

    // Cà rốt should have 150g (from bundled) + 200g (from standalone) = 350g, dishCount = 2
    const carrot = itemsMap['cà rốt__weight'];
    expect(carrot).toBeDefined();
    expect(carrot.cleanName).toBe('Cà rốt');
    expect(carrot.baseAmount).toBe(350);
    expect(carrot.dishCount).toBe(2);

    // Khoai tây should have 150g, dishCount = 1
    const potato = itemsMap['khoai tây__weight'];
    expect(potato).toBeDefined();
    expect(potato.cleanName).toBe('Khoai tây');
    expect(potato.baseAmount).toBe(150);
    expect(potato.dishCount).toBe(1);
  });

});
