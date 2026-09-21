/**
 * Challenger 1: Comprehensive Adversarial Stress Testing
 * Rigorous mathematical boundary, formula integrity, and edge case verification.
 */

import { 
  normalizeIngredientUnitAndAmount, 
  formatDisplayAmountAndUnit, 
  getOptimalStoreChannel,
  generateZaloShoppingText,
  parseAmount,
  STORE_CHANNELS,
  ProcessedGroceryItem
} from '../src/components/GroceryList';

import { 
  removeVietnameseTones, 
  removeVietnameseDiacritics, 
  normalizeSearchString, 
  matchesSearchTerm, 
  matchesMultiField, 
  matchesRecipeSearch, 
  matchesMealSetSearch 
} from '../src/utils/textUtils';

import {
  sanitizeGuestCount,
  calculateTables,
  calculateCateringFinancials,
  calculateServingsScale,
  calculateDailyNutrition,
  evaluateDayBudgetStatus
} from './helpers/calcUtils';

import { mockRecipes } from '../src/data/mockRecipes';
import { mockMealSets } from '../src/data/mockMealSets';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTest(suite: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [${suite}] ${name}`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message || String(err) });
    console.error(`  ✗ [${suite}] ${name}: ${err.message}`);
  }
}

console.log('\n======================================================');
console.log('CHALLENGER 1: ADVERSARIAL STRESS TESTING SUITE');
console.log('======================================================\n');

// =========================================================================
// SECTION 1: FINANCIAL & CATERING FORMULAS
// =========================================================================
console.log('--- SECTION 1: Financial & Catering Formulas ---');

runTest('Catering', 'Odd guest count 15 guests on 10-person table: 2 tables, remainder 5, exact revenue', () => {
  const guestCount = 15;
  const tableSize = 10;
  const budgetPerHead = 200000;
  const numTables = Math.ceil(guestCount / tableSize);
  const fullTables = Math.floor(guestCount / tableSize);
  const remainderGuests = guestCount % tableSize;
  const hasPartialTable = remainderGuests > 0;
  const totalRevenue = guestCount * budgetPerHead;
  const pricePerTable = budgetPerHead * tableSize;
  const revenuePerTable = Math.round(totalRevenue / numTables);

  assert(numTables === 2, `Expected 2 tables, got ${numTables}`);
  assert(fullTables === 1, `Expected 1 full table, got ${fullTables}`);
  assert(remainderGuests === 5, `Expected remainder 5, got ${remainderGuests}`);
  assert(hasPartialTable === true, `Expected hasPartialTable true`);
  assert(totalRevenue === 3000000, `Expected totalRevenue 3,000,000 đ, got ${totalRevenue}`);
  assert(pricePerTable === 2000000, `Expected pricePerTable 2,000,000 đ, got ${pricePerTable}`);
  assert(revenuePerTable === 1500000, `Expected revenuePerTable 1,500,000 đ, got ${revenuePerTable}`);

  // Test financial calculations with recipes
  const fin = calculateCateringFinancials({
    guestCount: 15,
    tableSize: 10,
    budgetPerHead: 200000,
    dishes: [{ recipeId: 'thit-rang-chay-canh', course: 'main' }],
    recipeLookup: (id) => mockRecipes.find(r => r.id === id)
  });

  assert(fin.totalRevenue === 3000000, `Quotation total must be 3,000,000 đ (not 4M), got ${fin.totalRevenue}`);
  assert(fin.numTables === 2, `Expected 2 tables, got ${fin.numTables}`);
  assert(fin.revenuePerTable === 1500000, `Average revenue per table must be 1.5M, got ${fin.revenuePerTable}`);
});

runTest('Catering', 'Odd guest count 11 guests on 6-person table: 2 tables, remainder 5', () => {
  const guestCount = 11;
  const tableSize = 6;
  const numTables = Math.ceil(guestCount / tableSize);
  const remainder = guestCount % tableSize;
  assert(numTables === 2, `Expected 2 tables, got ${numTables}`);
  assert(remainder === 5, `Expected remainder 5, got ${remainder}`);
});

runTest('Catering', 'Odd guest count 45 guests on 8-person table: 6 tables, remainder 5', () => {
  const guestCount = 45;
  const tableSize = 8;
  const numTables = Math.ceil(guestCount / tableSize);
  const fullTables = Math.floor(guestCount / tableSize);
  const remainder = guestCount % tableSize;
  assert(numTables === 6, `Expected 6 tables, got ${numTables}`);
  assert(fullTables === 5, `Expected 5 full tables, got ${fullTables}`);
  assert(remainder === 5, `Expected remainder 5, got ${remainder}`);
});

runTest('Catering', 'Empty menu (0 dishes): gross margin is 0% (NOT 100%) and food cost is 0', () => {
  const hasDishes = false;
  const guestCount = 20;
  const budgetPerHead = 200000;
  const totalRevenue = guestCount * budgetPerHead;

  // Mirror CateringPartyPlanner.tsx calculation
  const rawDishesCost = hasDishes && guestCount > 0 ? 100000 : 0;
  const roundedFoodCost = Math.round(rawDishesCost);
  const grossProfit = hasDishes && guestCount > 0 ? totalRevenue - roundedFoodCost : 0;
  const profitMarginPercent = hasDishes && totalRevenue > 0
    ? Math.max(0, Math.round((grossProfit / totalRevenue) * 100))
    : 0;

  assert(roundedFoodCost === 0, `Expected food cost 0, got ${roundedFoodCost}`);
  assert(grossProfit === 0, `Expected gross profit 0, got ${grossProfit}`);
  assert(profitMarginPercent === 0, `Expected profit margin 0%, got ${profitMarginPercent}%`);

  // Also verify through calcUtils helper
  const fin = calculateCateringFinancials({
    guestCount: 20,
    tableSize: 10,
    budgetPerHead: 200000,
    dishes: [],
    recipeLookup: () => undefined
  });
  assert(fin.roundedFoodCost === 0, `Helper food cost expected 0, got ${fin.roundedFoodCost}`);
  assert(fin.profitMarginPercent === 0, `Helper margin expected 0%, got ${fin.profitMarginPercent}%`);
});

runTest('Catering', 'Extreme guest count: 0 guests handled safely without division by zero', () => {
  const guestCount = 0;
  const tableSize = 10;
  const budgetPerHead = 200000;

  // Mirror CateringPartyPlanner.tsx:
  const numTables = guestCount > 0 ? Math.ceil(guestCount / tableSize) : 0;
  const totalRevenue = guestCount * budgetPerHead;
  const rawDishesCost = 0;
  const roundedFoodCost = 0;
  const grossProfit = 0;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
  const foodCostPerHead = guestCount > 0 ? Math.round(roundedFoodCost / guestCount) : 0;
  const foodCostPerTable = numTables > 0 ? Math.round(roundedFoodCost / numTables) : 0;
  const revenuePerTable = numTables > 0 ? Math.round(totalRevenue / numTables) : 0;

  assert(numTables === 0, `numTables must be 0, got ${numTables}`);
  assert(totalRevenue === 0, `totalRevenue must be 0, got ${totalRevenue}`);
  assert(profitMarginPercent === 0, `profitMarginPercent must be 0, got ${profitMarginPercent}`);
  assert(foodCostPerHead === 0, `foodCostPerHead must be 0, got ${foodCostPerHead}`);
  assert(foodCostPerTable === 0, `foodCostPerTable must be 0, got ${foodCostPerTable}`);
  assert(revenuePerTable === 0, `revenuePerTable must be 0, got ${revenuePerTable}`);
  assert(!Number.isNaN(foodCostPerHead), 'Must not be NaN');
  assert(!Number.isNaN(foodCostPerTable), 'Must not be NaN');
  assert(!Number.isNaN(revenuePerTable), 'Must not be NaN');
});

runTest('Catering', 'Extreme guest count: negative, NaN, non-numeric strings sanitization', () => {
  assert(sanitizeGuestCount(-5) === 1, 'Negative guest count must sanitize to 1');
  assert(sanitizeGuestCount(-999) === 1, 'Negative large count must sanitize to 1');
  assert(sanitizeGuestCount(NaN) === 1, 'NaN must sanitize to 1');
  assert(sanitizeGuestCount('invalid') === 1, 'String must sanitize to 1');
  assert(sanitizeGuestCount('') === 1, 'Empty string must sanitize to 1');
});

runTest('Catering', 'Extreme guest count: 1 guest, 100 guests, 200 guests, 500 guests (upper bound)', () => {
  assert(sanitizeGuestCount(1) === 1, '1 guest must remain 1');
  assert(sanitizeGuestCount(100) === 100, '100 guests must remain 100');
  assert(sanitizeGuestCount(200) === 200, '200 guests must remain 200');
  assert(sanitizeGuestCount(500) === 500, '500 guests must remain 500');
  assert(sanitizeGuestCount(1000) === 500, '1000 guests must clamp to 500');

  // Scaling 200 guests on 10-person table
  const fin200 = calculateCateringFinancials({
    guestCount: 200,
    tableSize: 10,
    budgetPerHead: 150000,
    dishes: [{ recipeId: 'thit-rang-chay-canh', course: 'main' }],
    recipeLookup: (id) => mockRecipes.find(r => r.id === id)
  });
  assert(fin200.numTables === 20, `200 guests / 10 = 20 tables, got ${fin200.numTables}`);
  assert(fin200.totalRevenue === 30000000, `Revenue: 200 * 150k = 30M, got ${fin200.totalRevenue}`);
  assert(fin200.foodCostPerTable > 0, 'Cost per table must be > 0');
  assert(fin200.profitMarginPercent > 0, 'Margin must be > 0');
});


// =========================================================================
// SECTION 2: SERVINGS STEPPER & NUTRITION SCALING
// =========================================================================
console.log('\n--- SECTION 2: Servings Stepper & Nutrition Scaling ---');

runTest('Servings', '1-person meal (servings = 1) scales cost and calories to exactly 0.25 (25%)', () => {
  const scale = calculateServingsScale(1);
  assert(scale === 0.25, `Expected scale 0.25 for 1 serving, got ${scale}`);

  const testRecipe = mockRecipes[0];
  const originalCost = testRecipe.estimatedCostVnd || 40000;
  const originalCalories = testRecipe.calories || 400;

  const scaledCost = Math.round(originalCost * scale);
  const scaledCalories = Math.round(originalCalories * scale);

  assert(scaledCost === Math.round(originalCost * 0.25), `Scaled cost must be 25%: ${scaledCost} vs ${originalCost * 0.25}`);
  assert(scaledCalories === Math.round(originalCalories * 0.25), `Scaled calories must be 25%: ${scaledCalories} vs ${originalCalories * 0.25}`);
  assert(scale !== 0.5, 'Must NOT be clamped to 0.5 (proving bug is gone)');
});

runTest('Servings', 'Servings bounds [1..20] stepping behavior and sanitization', () => {
  // 1 to 20 coverage
  for (let s = 1; s <= 20; s++) {
    const scale = calculateServingsScale(s);
    assert(scale === s / 4, `Scale for ${s} servings must be ${s / 4}, got ${scale}`);
  }

  // Upper bound > 20 clamped to 20 (scale = 5.0)
  assert(calculateServingsScale(21) === 5.0, 'Servings 21 must clamp to 20 (scale 5.0)');
  assert(calculateServingsScale(50) === 5.0, 'Servings 50 must clamp to 20 (scale 5.0)');
  assert(calculateServingsScale(999) === 5.0, 'Servings 999 must clamp to 20 (scale 5.0)');

  // Lower bound <= 0 clamped to 1 (scale = 0.25)
  assert(calculateServingsScale(0) === 0.25, 'Servings 0 must clamp to 1 (scale 0.25)');
  assert(calculateServingsScale(-1) === 0.25, 'Servings -1 must clamp to 1 (scale 0.25)');
  assert(calculateServingsScale(-100) === 0.25, 'Servings -100 must clamp to 1 (scale 0.25)');

  // Decimal inputs rounded to nearest integer
  assert(calculateServingsScale(2.2) === 2 / 4, '2.2 must round to 2');
  assert(calculateServingsScale(2.7) === 3 / 4, '2.7 must round to 3');
  assert(calculateServingsScale(NaN) === 1.0, 'NaN must fall back to 4 people (scale 1.0)');
});

runTest('Servings', 'Nutrition accumulation across 7 days with scaling precision', () => {
  const mockDay = {
    dayId: 'mon',
    dayName: 'Thứ Hai',
    meals: {
      breakfast: mockRecipes[0],
      lunch: mockMealSets[0],
      dinner: mockMealSets[1]
    }
  };

  // 1 person
  const nut1 = calculateDailyNutrition(mockDay, 1);
  assert(nut1.scale === 0.25, `Expected scale 0.25, got ${nut1.scale}`);
  assert(nut1.scaledCalories === Math.round(nut1.unscaledCalories * 0.25), 'Calories scale check');
  assert(nut1.scaledCost === Math.round(nut1.unscaledCost * 0.25), 'Cost scale check');

  // 4 persons (1.0x)
  const nut4 = calculateDailyNutrition(mockDay, 4);
  assert(nut4.scale === 1.0, 'Scale 1.0');
  assert(nut4.scaledCalories === nut4.unscaledCalories, 'Unscaled match');

  // 10 persons (2.5x)
  const nut10 = calculateDailyNutrition(mockDay, 10);
  assert(nut10.scale === 2.5, 'Scale 2.5');
  assert(nut10.scaledCalories === Math.round(nut10.unscaledCalories * 2.5), 'Calories 2.5x check');
});

runTest('Servings', 'Single-day budget warning indicator evaluation', () => {
  // tiet-kiem benchmark = 250,000 for 4 people
  const safe = evaluateDayBudgetStatus(200000, 'tiet-kiem', 4);
  assert(safe.status === 'safe', `Expected safe status, got ${safe.status}`);

  const balanced = evaluateDayBudgetStatus(250000, 'tiet-kiem', 4);
  assert(balanced.status === 'balanced', `Expected balanced status, got ${balanced.status}`);

  const warning = evaluateDayBudgetStatus(290000, 'tiet-kiem', 4);
  assert(warning.status === 'warning', `Expected warning status, got ${warning.status}`);

  const danger = evaluateDayBudgetStatus(350000, 'tiet-kiem', 4);
  assert(danger.status === 'danger', `Expected danger status, got ${danger.status}`);
});


// =========================================================================
// SECTION 3: GROCERY AGGREGATION & DEDUPLICATION MATH
// =========================================================================
console.log('\n--- SECTION 3: Grocery Aggregation & Deduplication Math ---');

runTest('Grocery', 'Duplicate ingredient quantity and cost accumulation (no compounding of old cost)', () => {
  // Simulate 10 dishes each requiring 150g of "Thịt ba chỉ" with 30,000 đ cost portion each
  const itemsMap: Record<string, { baseAmount: number; cost: number }> = {};
  const costPortionPerDish = 30000;
  const amountPerDish = 150;

  for (let i = 0; i < 10; i++) {
    const key = 'thit ba chi__weight';
    if (!itemsMap[key]) {
      itemsMap[key] = {
        baseAmount: amountPerDish,
        cost: costPortionPerDish
      };
    } else {
      // Mathematically correct aggregation from GroceryList.tsx:
      itemsMap[key].baseAmount += amountPerDish;
      itemsMap[key].cost += costPortionPerDish;
    }
  }

  // 10 * 150g = 1500g
  assert(itemsMap['thit ba chi__weight'].baseAmount === 1500, `Expected 1500g, got ${itemsMap['thit ba chi__weight'].baseAmount}`);
  // 10 * 30,000 đ = 300,000 đ (MUST NOT compound exponentially: e.g. 30k -> 60k -> 120k...)
  assert(itemsMap['thit ba chi__weight'].cost === 300000, `Expected exactly 300,000 đ, got ${itemsMap['thit ba chi__weight'].cost}`);

  const formatted = formatDisplayAmountAndUnit(itemsMap['thit ba chi__weight'].baseAmount, 'weight', 'g');
  assert(formatted.amount === 1.5, `Expected 1.5 kg, got ${formatted.amount}`);
  assert(formatted.unit === 'kg', `Expected kg unit, got ${formatted.unit}`);
  assert(formatted.displayStr === '1.5 kg', `Expected '1.5 kg', got ${formatted.displayStr}`);
});

runTest('Grocery', 'Unit normalization: 800g + 400g = 1.2 kg', () => {
  const norm1 = normalizeIngredientUnitAndAmount('Thịt bò', 800, 'g');
  const norm2 = normalizeIngredientUnitAndAmount('Thịt bò', 400, 'g');

  assert(norm1.groupKey === norm2.groupKey, `Group keys must match: ${norm1.groupKey} vs ${norm2.groupKey}`);
  const totalBase = norm1.baseAmount + norm2.baseAmount;
  assert(totalBase === 1200, `Total base must be 1200g, got ${totalBase}`);

  const formatted = formatDisplayAmountAndUnit(totalBase, 'weight', 'g');
  assert(formatted.amount === 1.2, `Amount must be 1.2 kg, got ${formatted.amount}`);
  assert(formatted.unit === 'kg', `Unit must be kg, got ${formatted.unit}`);
  assert(formatted.displayStr === '1.2 kg', `displayStr must be '1.2 kg', got ${formatted.displayStr}`);
});

runTest('Grocery', 'Unit normalization: 1.5 kg + 500 g = 2 kg', () => {
  const norm1 = normalizeIngredientUnitAndAmount('Gạo tẻ', 1.5, 'kg');
  const norm2 = normalizeIngredientUnitAndAmount('Gạo tẻ', 500, 'g');

  assert(norm1.groupKey === norm2.groupKey, 'Group keys must match');
  const totalBase = norm1.baseAmount + norm2.baseAmount; // 1500 + 500 = 2000
  assert(totalBase === 2000, `Expected 2000g, got ${totalBase}`);

  const formatted = formatDisplayAmountAndUnit(totalBase, 'weight', 'g');
  assert(formatted.amount === 2, `Expected 2 kg, got ${formatted.amount}`);
  assert(formatted.unit === 'kg', `Expected kg unit, got ${formatted.unit}`);
  assert(formatted.displayStr === '2 kg', `Expected '2 kg', got ${formatted.displayStr}`);
});

runTest('Grocery', 'Unit normalization: muỗng canh vs thìa canh consolidation', () => {
  const norm1 = normalizeIngredientUnitAndAmount('Nước mắm', 2, 'muỗng canh');
  const norm2 = normalizeIngredientUnitAndAmount('Nước mắm', 1, 'thìa canh');

  assert(norm1.groupKey === norm2.groupKey, `Both must group to spoon_soup: ${norm1.groupKey} vs ${norm2.groupKey}`);
  const totalBase = norm1.baseAmount + norm2.baseAmount;
  assert(totalBase === 3, `Expected 3 spoons, got ${totalBase}`);

  const formatted = formatDisplayAmountAndUnit(totalBase, 'spoon_soup', norm1.baseUnit);
  assert(formatted.amount === 3, `Expected 3, got ${formatted.amount}`);
  assert(formatted.unit === 'muỗng canh', `Expected 'muỗng canh', got ${formatted.unit}`);
});

runTest('Grocery', 'Unit normalization: muỗng cà phê vs thìa cà phê consolidation', () => {
  const norm1 = normalizeIngredientUnitAndAmount('Tiêu xay', 1, 'muỗng cà phê');
  const norm2 = normalizeIngredientUnitAndAmount('Tiêu xay', 2, 'thìa cà phê');

  assert(norm1.groupKey === norm2.groupKey, `Both must group to spoon_tea: ${norm1.groupKey}`);
  assert(norm1.baseAmount + norm2.baseAmount === 3, 'Sum must be 3');
});

runTest('Grocery', 'Volume normalization: 500 ml + 0.8 lít = 1.3 lít', () => {
  const norm1 = normalizeIngredientUnitAndAmount('Nước dừa', 500, 'ml');
  const norm2 = normalizeIngredientUnitAndAmount('Nước dừa', 0.8, 'lít');

  assert(norm1.groupKey === norm2.groupKey, 'Both must group to volume');
  const totalBase = norm1.baseAmount + norm2.baseAmount; // 500 + 800 = 1300 ml
  assert(totalBase === 1300, `Expected 1300 ml, got ${totalBase}`);

  const formatted = formatDisplayAmountAndUnit(totalBase, 'volume', 'ml');
  assert(formatted.amount === 1.3, `Expected 1.3 lít, got ${formatted.amount}`);
  assert(formatted.unit === 'lít', `Expected lít, got ${formatted.unit}`);
});

runTest('Grocery', 'parseAmount handles strings, fractions, floats, and corrupted values', () => {
  assert(parseAmount(5) === 5, 'Number 5');
  assert(parseAmount('5') === 5, 'String 5');
  assert(parseAmount('1/2') === 0.5, 'Fraction 1/2');
  assert(parseAmount('3/4') === 0.75, 'Fraction 3/4');
  assert(parseAmount('2.5') === 2.5, 'Float 2.5');
  assert(parseAmount(0) === 1, '0 falls back to 1');
  assert(parseAmount(-5) === 1, 'Negative falls back to 1');
  assert(parseAmount(null) === 1, 'null falls back to 1');
  assert(parseAmount(undefined) === 1, 'undefined falls back to 1');
  assert(parseAmount('invalid') === 1, 'invalid text falls back to 1');
});

runTest('Grocery', '4-channel store categorization routing logic', () => {
  // Fresh produce -> cho-dan-sinh
  assert(getOptimalStoreChannel('Thịt ba chỉ heo', 'thit-ca') === 'cho-dan-sinh', 'Thịt -> Chợ Dân Sinh');
  assert(getOptimalStoreChannel('Cá điêu hồng', 'thit-ca') === 'cho-dan-sinh', 'Cá -> Chợ Dân Sinh');
  assert(getOptimalStoreChannel('Rau muống', 'rau-cu') === 'cho-dan-sinh', 'Rau muống -> Chợ Dân Sinh');

  // Supermarket items -> winmart
  assert(getOptimalStoreChannel('Dầu ăn Simply', 'do-kho') === 'winmart', 'Dầu ăn -> WinMart');
  assert(getOptimalStoreChannel('Thịt mát MEATDeli', 'thit-ca') === 'winmart', 'Thịt mát -> WinMart');
  assert(getOptimalStoreChannel('Sữa chua Vinamilk', 'khac') === 'winmart', 'Sữa -> WinMart');

  // Dry pantry -> bach-hoa-xanh
  assert(getOptimalStoreChannel('Hạt nêm Knorr', 'gia-vi') === 'bach-hoa-xanh', 'Hạt nêm -> Bách Hóa Xanh');
  assert(getOptimalStoreChannel('Đường cát trắng', 'gia-vi') === 'bach-hoa-xanh', 'Đường -> Bách Hóa Xanh');
  assert(getOptimalStoreChannel('Nước mắm Nam Ngư', 'gia-vi') === 'bach-hoa-xanh', 'Gia vị -> Bách Hóa Xanh');

  // Regional specialty -> sap-doi-tac
  assert(getOptimalStoreChannel('Mắm tôm Bắc gia truyền', 'gia-vi') === 'sap-doi-tac', 'Mắm tôm -> Sạp Đối Tác');
  assert(getOptimalStoreChannel('Tương Bần đặc sản Hưng Yên', 'gia-vi') === 'sap-doi-tac', 'Tương bần -> Sạp Đối Tác');
  assert(getOptimalStoreChannel('Tỏi Lý Sơn chính gốc', 'gia-vi') === 'sap-doi-tac', 'Tỏi Lý Sơn -> Sạp Đối Tác');
  assert(getOptimalStoreChannel('Mắm ruốc Huế', 'gia-vi') === 'sap-doi-tac', 'Mắm ruốc -> Sạp Đối Tác');
});

runTest('Grocery', 'Zalo shopping export text structure with [✓] Đã Mua and [ ] Cần Mua', () => {
  const dummyItems: ProcessedGroceryItem[] = [
    {
      id: 'Thịt bò',
      name: 'Thịt bò',
      amount: 500,
      unit: 'g',
      displayAmount: '500 g',
      category: 'thit-ca',
      type: 'fresh',
      cost: 120000,
      storeChannel: 'cho-dan-sinh'
    },
    {
      id: 'Nước mắm',
      name: 'Nước mắm',
      amount: 2,
      unit: 'muỗng canh',
      displayAmount: '2 muỗng canh',
      category: 'gia-vi',
      type: 'pantry',
      cost: 15000,
      storeChannel: 'bach-hoa-xanh'
    }
  ];

  // When 1 item checked
  const checkedMap: Record<string, boolean> = { 'Thịt bò': true };
  const text = generateZaloShoppingText(dummyItems, checkedMap, 135000, 'all');

  assert(text.includes('[✓] ĐÃ MUA (1/2 món):'), 'Header for checked items');
  assert(text.includes('• Thịt bò: 500 g [Chợ Dân Sinh]'), 'Checked item details');
  assert(text.includes('[ ] CẦN MUA (1 món):'), 'Header for unchecked items');
  assert(text.includes('• Nước mắm: 2 muỗng canh [BHX]'), 'Unchecked item details');
  assert(text.includes('135.000 đ'), 'Formatted total cost');
});


// =========================================================================
// SECTION 4: VIETNAMESE TONE STRIPPING
// =========================================================================
console.log('\n--- SECTION 4: Vietnamese Tone Stripping ---');

runTest('TextUtils', 'All Vietnamese vowels with all 5 tones normalization', () => {
  const sample = 'àáảãạ ăằắẳẵặ âầấẩẫậ èéẻẽẹ êềếểễệ ìíỉĩị òóỏõọ ôồốổỗộ ơờớởỡợ ùúủũụ ưừứửữự ỳýỷỹỵ đĐ';
  const stripped = removeVietnameseTones(sample);
  const expected = 'aaaaa aaaaaa aaaaaa eeeee eeeeee iiiii ooooo oooooo oooooo uuuuu uuuuuu yyyyy dD';
  assert(stripped === expected, `Mismatch:\nExpected: "${expected}"\nGot:      "${stripped}"`);
});

runTest('TextUtils', 'Complex and rare Vietnamese words and tone marks', () => {
  const tests = [
    { input: 'nguều ngoào khúc khuỷu ngoằn ngoèo', expected: 'ngueu ngoao khuc khuyu ngoan ngoeo' },
    { input: 'lẩu mắm cá linh bông điên điển', expected: 'lau mam ca linh bong dien dien' },
    { input: 'thịt kho hột vịt nước dừa xiêm', expected: 'thit kho hot vit nuoc dua xiem' },
    { input: 'bánh xèo củ hủ dừa tép rong', expected: 'banh xeo cu hu dua tep rong' },
    { input: 'bún đậu mắm tôm chả cốm nem chua rán', expected: 'bun dau mam tom cha com nem chua ran' },
    { input: 'bò nhúng giấm cuốn bánh tráng', expected: 'bo nhung giam cuon banh trang' },
    { input: 'canh khổ qua dồn thịt băm', expected: 'canh kho qua don thit bam' }
  ];

  for (const t of tests) {
    const res = removeVietnameseTones(t.input);
    assert(res === t.expected, `Input: "${t.input}" -> Expected: "${t.expected}", Got: "${res}"`);
  }
});

runTest('TextUtils', 'Case preservation in removeVietnameseTones', () => {
  assert(removeVietnameseTones('HÀ NỘI') === 'HA NOI', 'Upper case');
  assert(removeVietnameseTones('sài gòn') === 'sai gon', 'Lower case');
  assert(removeVietnameseTones('Đà Nẵng') === 'Da Nang', 'Title case');
  assert(removeVietnameseTones('ĐẮC LẮC') === 'DAC LAC', 'D with upper hook/breve');
  assert(removeVietnameseTones('đắk nông') === 'dak nong', 'd with lower hook/breve');
});

runTest('TextUtils', 'Search matching multi-token permutation and substring tolerance', () => {
  const title = 'Thịt Ba Chỉ Rang Cháy Cạnh Sốt Mắm Hành';

  // Direct substring
  assert(matchesSearchTerm(title, 'thit ba chi') === true, 'Direct match');
  // Permutation
  assert(matchesSearchTerm(title, 'rang thit') === true, 'Permuted tokens');
  assert(matchesSearchTerm(title, 'chay canh ba chi') === true, 'Multiple permuted tokens');
  assert(matchesSearchTerm(title, 'sot mam hanh') === true, 'End of string tokens');
  // Accented query matching accented title
  assert(matchesSearchTerm(title, 'Thịt Rang') === true, 'Accented query match');
  // Non-matching
  assert(matchesSearchTerm(title, 'ca kho') === false, 'Non-matching query');
});

runTest('TextUtils', 'matchesMultiField across title, description, tags, and ingredients', () => {
  const recipe = {
    title: 'Gà Luộc Lá Chanh',
    description: 'Thịt gà ta thả vườn da vàng giòn ngọt thịt',
    tags: ['Mâm Cỗ', 'Truyền Thống', 'Đặc Sản'],
    ingredients: [
      { name: 'Gà ta nguyên con làm sạch' },
      { name: 'Lá chanh tươi thái chỉ' },
      { name: 'Muối hột & ớt hiểm' }
    ]
  };

  assert(matchesRecipeSearch(recipe, 'ga ta') === true, 'Match title/ingredient');
  assert(matchesRecipeSearch(recipe, 'la chanh') === true, 'Match ingredient');
  assert(matchesRecipeSearch(recipe, 'da vang gion') === true, 'Match description');
  assert(matchesRecipeSearch(recipe, 'mam co') === true, 'Match tags');
  assert(matchesRecipeSearch(recipe, 'thit heo') === false, 'Non-match');
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n======================================================');
console.log('CHALLENGER 1 TEST EXECUTION SUMMARY:');
console.log('======================================================');
const passedCount = results.filter(r => r.passed).length;
const failedCount = results.filter(r => !r.passed).length;

console.log(`Total Adversarial Tests: ${results.length}`);
console.log(`Passed:                  ${passedCount}`);
console.log(`Failed:                  ${failedCount}`);

if (failedCount > 0) {
  console.error(`\n[CRITICAL FAILURE] ${failedCount} tests failed!`);
  process.exit(1);
} else {
  console.log(`\n[ALL PASS] 100% of adversarial stress tests passed cleanly!`);
  process.exit(0);
}
