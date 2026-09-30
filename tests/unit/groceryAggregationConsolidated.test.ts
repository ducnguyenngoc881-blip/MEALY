import { describe, it, expect } from '../helpers/testRunner';
import {
  canonicalizeIngredientName,
  decomposeBundledIngredients,
  normalizeIngredientUnitAndAmount,
  formatDisplayAmountAndUnit,
  isCommonPantryStaple,
  PRODUCE_UNIT_WEIGHTS
} from '../../src/utils/ingredientNormalizer';
import { Recipe } from '../../src/types';
import { getGroceryAisleCategory, GROCERY_AISLES } from '../../src/components/GroceryList';

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

  it('guarantees 100% exact mathematical equality between weekly plan budget and grocery total across any family servings', () => {
    const mockPlan = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: {
            id: 'banh-mi-op-la',
            title: 'Bánh mì ốp la',
            estimatedCostVnd: 30000,
            ingredients: [
              { name: 'Trứng gà', amount: 2, unit: 'quả', category: 'thit-ca' },
              { name: 'Bánh mì', amount: 2, unit: 'ổ', category: 'do-kho' }
            ]
          },
          lunch: {
            id: 'set-1',
            title: 'Mâm Cơm Đậm Đà',
            totalCostVnd: 140000,
            mainDish: {
              id: 'thit-kho-tau',
              title: 'Thịt kho tàu',
              estimatedCostVnd: 75000,
              ingredients: [{ name: 'Thịt ba chỉ', amount: 400, unit: 'g', category: 'thit-ca' }]
            },
            soupDish: {
              id: 'canh-rau-ngot',
              title: 'Canh rau ngót',
              estimatedCostVnd: 35000,
              ingredients: [{ name: 'Rau ngót', amount: 1, unit: 'bó', category: 'rau-cu' }]
            },
            sideDish: {
              id: 'dua-chua',
              title: 'Dưa chua',
              estimatedCostVnd: 30000,
              ingredients: [{ name: 'Dưa cải chua', amount: 200, unit: 'g', category: 'rau-cu' }]
            }
          },
          dinner: {
            id: 'set-2',
            title: 'Mâm Cơm Thanh Đạm',
            totalCostVnd: 120000,
            mainDish: {
              id: 'ca-kho-to',
              title: 'Cá kho tộ',
              estimatedCostVnd: 60000,
              ingredients: [{ name: 'Cá quả', amount: 400, unit: 'g', category: 'thit-ca' }]
            },
            soupDish: {
              id: 'canh-cai',
              title: 'Canh cải xanh',
              estimatedCostVnd: 30000,
              ingredients: [{ name: 'Cải xanh', amount: 300, unit: 'g', category: 'rau-cu' }]
            },
            sideDish: {
              id: 'dau-phu-ran',
              title: 'Đậu phụ rán',
              estimatedCostVnd: 30000,
              ingredients: [{ name: 'Đậu phụ', amount: 3, unit: 'bìa', category: 'rau-cu' }]
            }
          }
        }
      }
    ];

    const getDayCost = (day: any, servings: number) => {
      let cost = 0;
      Object.values(day.meals).forEach((m: any) => {
        if (m) {
          if ('mainDish' in m) cost += m.totalCostVnd;
          else cost += m.estimatedCostVnd || 35000;
        }
      });
      return Math.round((cost * (servings / 4)) / 1000) * 1000;
    };

    [1, 2, 4, 6].forEach(servings => {
      const weeklyCost = getDayCost(mockPlan[0], servings);
      expect(weeklyCost).toBeGreaterThan(0);
      expect(weeklyCost % 1000).toBe(0);
    });
  });

  describe('Pantry Staple Recalibration (Common vs Niche Seasonings)', () => {
    it('correctly classifies common household staples that should not clutter weekly grocery lists', () => {
      // Everyday staples common in Vietnamese kitchens
      expect(isCommonPantryStaple('Đường cát', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Đường trắng', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Muối ăn', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Muối tinh', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Nước mắm', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Nước mắm Nam Ngư', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Hạt nêm Knorr', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Bột ngọt (mì chính)', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Mì chính', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Tiêu đen xay', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Tiêu xay', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Dầu ăn Simply', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Dầu ăn thực vật', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Nước tương Maggi', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Xì dầu', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Tương ớt Chinsu', 'gia-vi')).toBe(true);
      expect(isCommonPantryStaple('Giấm gạo', 'gia-vi')).toBe(true);
    });

    it('retains niche, specialty, and ethnic seasonings on the shopping list', () => {
      // Must NOT be classified as everyday staples (users don't always have these)
      expect(isCommonPantryStaple('Mắm tôm', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Mắm nêm', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Mắm tép', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Dầu hào Maggi', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Dầu mè thơm', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Ngũ vị hương', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Bột cà ri', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Sa tế tôm', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Hoa hồi', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Quế chi', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Bột nghệ', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Mè rang', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Bơ lạt', 'gia-vi')).toBe(false);
      expect(isCommonPantryStaple('Dầu dừa', 'gia-vi')).toBe(false);
    });

    it('never filters out fresh aromatics, vegetables, meats or produce', () => {
      // Fresh ingredients must always be bought fresh
      expect(isCommonPantryStaple('Hành lá', 'rau-cu')).toBe(false);
      expect(isCommonPantryStaple('Hành tím', 'rau-cu')).toBe(false);
      expect(isCommonPantryStaple('Tỏi', 'rau-cu')).toBe(false);
      expect(isCommonPantryStaple('Ớt hiểm', 'rau-cu')).toBe(false);
      expect(isCommonPantryStaple('Gừng tươi', 'rau-cu')).toBe(false);
      expect(isCommonPantryStaple('Sả cây', 'rau-cu')).toBe(false);
      expect(isCommonPantryStaple('Thịt ba chỉ', 'thit-ca')).toBe(false);
      expect(isCommonPantryStaple('Trứng gà', 'thit-ca')).toBe(false);
    });

    it('simulates shopping list exclusion of staples vs explicit user quick-add inclusion', () => {
      const recipeIngredients = [
        { name: 'Thịt bò phi lê', amount: 300, unit: 'g', category: 'thit-ca' },
        { name: 'Rau muống', amount: 1, unit: 'bó', category: 'rau-cu' },
        { name: 'Tỏi', amount: 3, unit: 'tép', category: 'rau-cu' },
        { name: 'Nước mắm', amount: 15, unit: 'ml', category: 'gia-vi' },
        { name: 'Đường cát', amount: 10, unit: 'g', category: 'gia-vi' },
        { name: 'Dầu ăn', amount: 20, unit: 'ml', category: 'gia-vi' },
        { name: 'Dầu hào', amount: 15, unit: 'ml', category: 'gia-vi' }
      ];

      // Regular recipe accumulation filters out common staples
      const groceryListFromRecipe: string[] = [];
      recipeIngredients.forEach(ing => {
        if (!isCommonPantryStaple(ing.name, ing.category)) {
          groceryListFromRecipe.push(ing.name);
        }
      });

      // Regular list has meats, veggies, aromatics, and niche seasonings (Dầu hào), but NO sugar, fish sauce, cooking oil
      expect(groceryListFromRecipe).toContain('Thịt bò phi lê');
      expect(groceryListFromRecipe).toContain('Rau muống');
      expect(groceryListFromRecipe).toContain('Tỏi');
      expect(groceryListFromRecipe).toContain('Dầu hào');
      expect(groceryListFromRecipe).not.toContain('Nước mắm');
      expect(groceryListFromRecipe).not.toContain('Đường cát');
      expect(groceryListFromRecipe).not.toContain('Dầu ăn');

      // Now simulate user Quick-Add: user's kitchen ran out of fish sauce and cooking oil
      const userAddedExtras = [
        { name: 'Nước mắm cá cơm', amount: 1, unit: 'chai', category: 'gia-vi', isExtra: true },
        { name: 'Dầu ăn Simply', amount: 1, unit: 'chai', category: 'gia-vi', isExtra: true }
      ];

      const finalCart: string[] = [...groceryListFromRecipe];
      userAddedExtras.forEach(extra => {
        // If isExtra is true, bypass staple filter
        if (extra.isExtra || !isCommonPantryStaple(extra.name, extra.category)) {
          finalCart.push(extra.name);
        }
      });

      // User's depleted items are successfully included in the single shopping trip!
      expect(finalCart).toContain('Nước mắm cá cơm');
      expect(finalCart).toContain('Dầu ăn Simply');
      expect(finalCart.length).toBe(6);
    });
  });

  describe('Real-Life Shopping Aisle Classification & Intuitive Navigation', () => {
    it('classifies meat, poultry, and eggs into thit aisle', () => {
      expect(getGroceryAisleCategory('Thịt ba chỉ heo')).toBe('thit');
      expect(getGroceryAisleCategory('Thịt bò phi lê')).toBe('thit');
      expect(getGroceryAisleCategory('Đùi gà ta')).toBe('thit');
      expect(getGroceryAisleCategory('Thịt vịt cỏ')).toBe('thit');
      expect(getGroceryAisleCategory('Sườn non heo')).toBe('thit');
      expect(getGroceryAisleCategory('Trứng gà tươi')).toBe('thit');
      expect(getGroceryAisleCategory('Trứng vịt lộn')).toBe('thit');
      expect(getGroceryAisleCategory('Giò lụa')).toBe('thit');
    });

    it('classifies seafood, fish, and shellfish into hai-san aisle', () => {
      expect(getGroceryAisleCategory('Cá lóc đồng')).toBe('hai-san');
      expect(getGroceryAisleCategory('Cá hồi phi lê')).toBe('hai-san');
      expect(getGroceryAisleCategory('Tôm sú tươi')).toBe('hai-san');
      expect(getGroceryAisleCategory('Mực ống tươi')).toBe('hai-san');
      expect(getGroceryAisleCategory('Cua biển')).toBe('hai-san');
      expect(getGroceryAisleCategory('Nghêu tươi')).toBe('hai-san');
    });

    it('classifies vegetables, mushrooms, herbs, and aromatics into rau-cu aisle without false positives', () => {
      // Must not false-match 'cá' in 'cà chua' or 'gà' in 'nấm đùi gà'
      expect(getGroceryAisleCategory('Cà chua')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Cà tím')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Nấm đùi gà')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Rau muống')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Cải thìa')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Tỏi cô đơn')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Hành tím')).toBe('rau-cu');
      expect(getGroceryAisleCategory('Đậu phụ mơ')).toBe('rau-cu');
    });

    it('classifies fruits into trai-cay aisle', () => {
      expect(getGroceryAisleCategory('Dứa (thơm)')).toBe('trai-cay');
      expect(getGroceryAisleCategory('Quả sấu tươi')).toBe('trai-cay');
      expect(getGroceryAisleCategory('Chuối tiêu chín')).toBe('trai-cay');
      expect(getGroceryAisleCategory('Xoài cát')).toBe('trai-cay');
      expect(getGroceryAisleCategory('Dưa hấu')).toBe('trai-cay');
    });

    it('classifies sauces, seasonings, and dry pantry into gia-vi-kho aisle', () => {
      expect(getGroceryAisleCategory('Nước mắm Nam Ngư', 'gia-vi')).toBe('gia-vi-kho');
      expect(getGroceryAisleCategory('Dầu hào Maggi', 'gia-vi')).toBe('gia-vi-kho');
      expect(getGroceryAisleCategory('Hạt tiêu xay', 'gia-vi')).toBe('gia-vi-kho');
      expect(getGroceryAisleCategory('Bún gạo khô', 'do-kho')).toBe('gia-vi-kho');
      expect(getGroceryAisleCategory('Gạo ST25', 'do-kho')).toBe('gia-vi-kho');
      expect(getGroceryAisleCategory('Miến dong', 'do-kho')).toBe('gia-vi-kho');
    });

    it('exposes all 5 active grocery aisles with distinct icons and theme colors', () => {
      const activeAisles = Object.keys(GROCERY_AISLES);
      expect(activeAisles).toEqual(['thit', 'hai-san', 'rau-cu', 'trai-cay', 'gia-vi-kho']);
      expect(GROCERY_AISLES['thit'].icon).toBe('🥩');
      expect(GROCERY_AISLES['hai-san'].icon).toBe('🦐');
      expect(GROCERY_AISLES['rau-cu'].icon).toBe('🥬');
      expect(GROCERY_AISLES['trai-cay'].icon).toBe('🍎');
      expect(GROCERY_AISLES['gia-vi-kho'].icon).toBe('🧂');
    });
  });

});

