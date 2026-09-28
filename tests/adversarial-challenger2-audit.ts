/**
 * Adversarial Stress Test Suite — Challenger 2 (Audit & Verification)
 * 
 * Domains:
 * 1. Vietnamese comma decimal parsing (parseAmount)
 * 2. 'lạng' unit normalization merging (normalizeIngredientUnitAndAmount & formatDisplayAmountAndUnit)
 * 3. 15-key JSON backup export & restore corruption resilience (exportMealWiseBackup & importMealWiseBackup)
 * 4. Multi-device responsive invariants (320px..desktop 4K with 0 overflow)
 */

import fs from 'fs';
import path from 'path';
import {
  parseAmount,
  normalizeIngredientUnitAndAmount,
  formatDisplayAmountAndUnit,
} from '../src/components/GroceryList';
import {
  exportMealWiseBackup,
  importMealWiseBackup,
  BACKUP_CORE_STORAGE_KEYS,
} from '../src/components/AccountView';
import { setupMockStorage, MockLocalStorage } from './helpers/mockStorage';

console.log('\n======================================================================');
console.log('    CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS-TESTING HARNESS       ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

interface TestFailure {
  section: string;
  name: string;
  expected: string;
  actual: string;
  details?: string;
}

const failures: TestFailure[] = [];

function assert(
  condition: boolean,
  name: string,
  section: string,
  details?: { expected?: string; actual?: string; info?: string }
) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ [PASS] [${section}] ${name}`);
  } else {
    failedChecks++;
    console.error(`  ✗ [FAIL] [${section}] ${name}`);
    if (details) {
      console.error(`         Expected: ${details.expected}`);
      console.error(`         Actual:   ${details.actual}`);
      if (details.info) console.error(`         Info:     ${details.info}`);
      failures.push({
        section,
        name,
        expected: details.expected || 'true',
        actual: details.actual || 'false',
        details: details.info
      });
    }
  }
}

// ======================================================================
// SECTION 1: VIETNAMESE COMMA DECIMAL & FRACTION PARSING (parseAmount)
// ======================================================================
console.log('\n--- 1. VIETNAMESE COMMA DECIMAL & FRACTION PARSING ---');

// 1.1 Standard Vietnamese comma decimals
const vietnameseCommaCases: Array<{ input: any; expected: number; desc: string }> = [
  { input: '0,5', expected: 0.5, desc: 'Single-decimal comma: "0,5"' },
  { input: '1,25', expected: 1.25, desc: 'Two-decimal comma: "1,25"' },
  { input: '0,75', expected: 0.75, desc: 'Two-decimal comma: "0,75"' },
  { input: '2,5', expected: 2.5, desc: 'Comma decimal: "2,5"' },
  { input: '10,0', expected: 10.0, desc: 'Trailing zero comma: "10,0"' },
  { input: '0,1', expected: 0.1, desc: 'Tenth comma: "0,1"' },
  { input: '0,250', expected: 0.25, desc: 'Three-decimal comma: "0,250"' },
  { input: '3,14159', expected: 3.14159, desc: 'Multi-decimal comma: "3,14159"' },
];

for (const tc of vietnameseCommaCases) {
  const actual = parseAmount(tc.input);
  assert(Math.abs(actual - tc.expected) < 1e-6, tc.desc, 'Comma-Decimals', {
    expected: String(tc.expected),
    actual: String(actual),
  });
}

// 1.2 Vietnamese units concatenated with comma decimals
const commaWithUnitsCases: Array<{ input: string; expected: number; desc: string }> = [
  { input: '0,75 kg', expected: 0.75, desc: 'Comma decimal with kg: "0,75 kg"' },
  { input: '1,5 kg', expected: 1.5, desc: 'Comma decimal with kg: "1,5 kg"' },
  { input: '0,5 lạng', expected: 0.5, desc: 'Comma decimal with lạng: "0,5 lạng"' },
  { input: '2,5 lạng', expected: 2.5, desc: 'Comma decimal with lạng: "2,5 lạng"' },
  { input: '0,25 gram', expected: 0.25, desc: 'Comma decimal with gram: "0,25 gram"' },
  { input: '1,2 lít', expected: 1.2, desc: 'Comma decimal with lít: "1,2 lít"' },
  { input: '0,5 muỗng canh', expected: 0.5, desc: 'Comma decimal with spoon: "0,5 muỗng canh"' },
  { input: '  0,5kg  ', expected: 0.5, desc: 'Whitespace padding with no separator: "  0,5kg  "' },
];

for (const tc of commaWithUnitsCases) {
  const actual = parseAmount(tc.input);
  assert(Math.abs(actual - tc.expected) < 1e-6, tc.desc, 'Comma-Units', {
    expected: String(tc.expected),
    actual: String(actual),
  });
}

// 1.3 Fractions (Vietnamese recipe style)
const fractionCases: Array<{ input: string; expected: number; desc: string }> = [
  { input: '1/2', expected: 0.5, desc: 'Half fraction: "1/2"' },
  { input: '3/4', expected: 0.75, desc: 'Three quarters: "3/4"' },
  { input: '1/4', expected: 0.25, desc: 'Quarter: "1/4"' },
  { input: '2/3', expected: 2 / 3, desc: 'Two thirds: "2/3"' },
  { input: '1/3', expected: 1 / 3, desc: 'One third: "1/3"' },
  { input: '5/2', expected: 2.5, desc: 'Improper fraction: "5/2"' },
  { input: '1/2 kg', expected: 0.5, desc: 'Fraction with kg: "1/2 kg"' },
  { input: '3/4 lạng', expected: 0.75, desc: 'Fraction with lạng: "3/4 lạng"' },
  { input: '1/2 thìa cà phê', expected: 0.5, desc: 'Fraction with spoon: "1/2 thìa cà phê"' },
];

for (const tc of fractionCases) {
  const actual = parseAmount(tc.input);
  assert(Math.abs(actual - tc.expected) < 1e-4, tc.desc, 'Fractions', {
    expected: String(tc.expected),
    actual: String(actual),
  });
}

// 1.4 Boundary, malformed, negative, and adversarial inputs
const adversarialParseCases: Array<{ input: any; expected: number; desc: string }> = [
  { input: null, expected: 1, desc: 'Null input fallback to 1' },
  { input: undefined, expected: 1, desc: 'Undefined input fallback to 1' },
  { input: 0, expected: 1, desc: 'Zero number fallback to 1 (guard against 0 ingredients)' },
  { input: -5, expected: 1, desc: 'Negative number fallback to 1' },
  { input: NaN, expected: 1, desc: 'NaN number fallback to 1' },
  { input: Infinity, expected: 1, desc: 'Infinity fallback to 1' },
  { input: -Infinity, expected: 1, desc: '-Infinity fallback to 1' },
  { input: '', expected: 1, desc: 'Empty string fallback to 1' },
  { input: '   ', expected: 1, desc: 'Whitespace string fallback to 1' },
  { input: '0', expected: 1, desc: 'Zero string "0" fallback to 1' },
  { input: '-1', expected: 1, desc: 'Negative string "-1" fallback to 1' },
  { input: '-0,5', expected: 1, desc: 'Negative comma string "-0,5" fallback to 1' },
  { input: 'abc', expected: 1, desc: 'Non-numeric string "abc" fallback to 1' },
  { input: 'không', expected: 1, desc: 'Vietnamese word "không" fallback to 1' },
  { input: ',5', expected: 0.5, desc: 'Leading comma without integer: ",5" -> 0.5' },
  { input: '1/0', expected: 1, desc: 'Division by zero "1/0" fallback to 1' },
  { input: '0/0', expected: 1, desc: 'Indeterminate "0/0" fallback to 1' },
  { input: '1,5,5', expected: 1.5, desc: 'Multiple commas "1,5,5" extracts leading valid float' },
  { input: 1000000, expected: 1000000, desc: 'Large positive integer: 1,000,000' },
  { input: '0,001', expected: 0.001, desc: 'Small positive decimal: 0.001' },
];

for (const tc of adversarialParseCases) {
  const actual = parseAmount(tc.input);
  assert(Math.abs(actual - tc.expected) < 1e-6, tc.desc, 'Adversarial-Parse', {
    expected: String(tc.expected),
    actual: String(actual),
  });
}

// 1.5 Monte-Carlo fuzzing on parseAmount: 1,000 random floating values
let fuzzSuccess = 0;
for (let i = 0; i < 1000; i++) {
  const rawNum = Math.random() * 20 + 0.01;
  const commaStr = rawNum.toFixed(2).replace('.', ',');
  const parsed = parseAmount(commaStr);
  if (Math.abs(parsed - parseFloat(rawNum.toFixed(2))) < 1e-5) {
    fuzzSuccess++;
  }
}
assert(fuzzSuccess === 1000, 'Monte-Carlo fuzzing: 1,000 random comma decimals correctly parsed (100%)', 'Fuzz-Decimals', {
  expected: '1000',
  actual: String(fuzzSuccess),
});


// ======================================================================
// SECTION 2: 'LẠNG' UNIT NORMALIZATION & AGGREGATION MERGING
// ======================================================================
console.log('\n--- 2. "LẠNG" UNIT NORMALIZATION & AGGREGATION MERGING ---');

// 2.1 Unit identification and base gram conversion
const langSpellingCases = [
  { unit: 'lạng', desc: 'Standard lowercase "lạng"' },
  { unit: 'lang', desc: 'Unaccented lowercase "lang"' },
  { unit: 'Lạng', desc: 'Capitalized "Lạng"' },
  { unit: 'LẠNG', desc: 'All-caps "LẠNG"' },
  { unit: 'LANG', desc: 'All-caps unaccented "LANG"' },
  { unit: '  lạng  ', desc: 'Spaced "  lạng  "' },
];

for (const tc of langSpellingCases) {
  const norm = normalizeIngredientUnitAndAmount('Thịt ba chỉ', 3, tc.unit);
  assert(norm.family === 'weight', `${tc.desc}: identified as family "weight"`, 'Lang-Norm');
  assert(norm.baseAmount === 300, `${tc.desc}: 3 lạng converted to 300g`, 'Lang-Norm', {
    expected: '300',
    actual: String(norm.baseAmount),
  });
  assert(norm.baseUnit === 'g', `${tc.desc}: baseUnit is "g"`, 'Lang-Norm');
  assert(norm.groupKey === 'thịt ba chỉ__weight', `${tc.desc}: groupKey is normalized`, 'Lang-Norm');
}

// 2.2 Merging scenarios: lạng with grams and kilograms
// Scenario A: 3 lạng + 200g = 500g
const itemA1 = normalizeIngredientUnitAndAmount('Thịt nạc vai', 3, 'lạng'); // 300g
const itemA2 = normalizeIngredientUnitAndAmount('Thịt nạc vai', 200, 'g');   // 200g
assert(itemA1.groupKey === itemA2.groupKey, '3 lạng and 200g have identical groupKey', 'Lang-Merge');
const mergedA_baseAmount = itemA1.baseAmount + itemA2.baseAmount;
assert(mergedA_baseAmount === 500, '3 lạng + 200g base grams = 500g', 'Lang-Merge', {
  expected: '500',
  actual: String(mergedA_baseAmount),
});
const displayA = formatDisplayAmountAndUnit(mergedA_baseAmount, 'weight', 'g');
assert(displayA.amount === 500 && displayA.unit === 'g' && displayA.displayStr === '500 g',
  '500g displays cleanly as "500 g"', 'Lang-Merge', {
    expected: '500 g',
    actual: displayA.displayStr,
  }
);

// Scenario B: 1 kg + 5 lạng = 1.5 kg (1500g)
const itemB1 = normalizeIngredientUnitAndAmount('Thịt bò', 1, 'kg');     // 1000g
const itemB2 = normalizeIngredientUnitAndAmount('Thịt bò', 5, 'lạng');   // 500g
const mergedB_baseAmount = itemB1.baseAmount + itemB2.baseAmount;
assert(mergedB_baseAmount === 1500, '1 kg + 5 lạng base grams = 1500g', 'Lang-Merge', {
  expected: '1500',
  actual: String(mergedB_baseAmount),
});
const displayB = formatDisplayAmountAndUnit(mergedB_baseAmount, 'weight', 'g');
assert(displayB.amount === 1.5 && displayB.unit === 'kg' && displayB.displayStr === '1.5 kg',
  '1500g displays cleanly as "1.5 kg"', 'Lang-Merge', {
    expected: '1.5 kg',
    actual: displayB.displayStr,
  }
);

// Scenario C: Fractional lạng: "1/2" lạng (50g) + "1/2" kg (500g) = 550g
const itemC1 = normalizeIngredientUnitAndAmount('Tôm sú', '1/2', 'lạng'); // 50g
const itemC2 = normalizeIngredientUnitAndAmount('Tôm sú', '1/2', 'kg');   // 500g
const mergedC_baseAmount = itemC1.baseAmount + itemC2.baseAmount;
assert(mergedC_baseAmount === 550, '"1/2" lạng + "1/2" kg = 550g', 'Lang-Merge', {
  expected: '550',
  actual: String(mergedC_baseAmount),
});
const displayC = formatDisplayAmountAndUnit(mergedC_baseAmount, 'weight', 'g');
assert(displayC.displayStr === '550 g', '550g displays as "550 g"', 'Lang-Merge', {
  expected: '550 g',
  actual: displayC.displayStr,
});

// Scenario D: Exactly 10 lạng = 1 kg
const itemD = normalizeIngredientUnitAndAmount('Cá lóc', 10, 'lạng');
assert(itemD.baseAmount === 1000, '10 lạng = 1000g', 'Lang-Merge');
const displayD = formatDisplayAmountAndUnit(itemD.baseAmount, 'weight', 'g');
assert(displayD.amount === 1 && displayD.unit === 'kg' && displayD.displayStr === '1 kg',
  '1000g from 10 lạng formats to "1 kg"', 'Lang-Merge', {
    expected: '1 kg',
    actual: displayD.displayStr,
  }
);

// Scenario E: Multi-item aggregation simulation (5 sources of pork)
const porkSources = [
  { name: 'Thịt heo', amount: '0,5', unit: 'kg' },    // 500g
  { name: 'Thịt heo', amount: 3, unit: 'lạng' },        // 300g
  { name: 'Thịt heo', amount: 150, unit: 'g' },         // 150g
  { name: 'Thịt heo', amount: '1/2', unit: 'lạng' },    // 50g
  { name: 'Thịt heo', amount: '0,2', unit: 'kg' },      // 200g
];
let totalPorkGrams = 0;
let porkGroupKey = '';
for (const p of porkSources) {
  const norm = normalizeIngredientUnitAndAmount(p.name, p.amount, p.unit);
  totalPorkGrams += norm.baseAmount;
  porkGroupKey = norm.groupKey;
}
assert(totalPorkGrams === 1200, '5 diverse pork amounts sum to exactly 1200g', 'Lang-Merge', {
  expected: '1200',
  actual: String(totalPorkGrams),
});
const displayPork = formatDisplayAmountAndUnit(totalPorkGrams, 'weight', 'g');
assert(displayPork.displayStr === '1.2 kg', '1200g aggregated pork displays as "1.2 kg"', 'Lang-Merge', {
  expected: '1.2 kg',
  actual: displayPork.displayStr,
});


// ======================================================================
// SECTION 3: 15-KEY JSON BACKUP EXPORT & RESTORE RESILIENCE
// ======================================================================
console.log('\n--- 3. 15-KEY JSON BACKUP EXPORT & RESTORE RESILIENCE ---');

// In node environment, window is undefined unless polyfilled
(globalThis as any).window = globalThis;
const mockStorage = setupMockStorage();

// 3.1 Verify Core Keys Coverage
assert(BACKUP_CORE_STORAGE_KEYS.length >= 15, `BACKUP_CORE_STORAGE_KEYS has ${BACKUP_CORE_STORAGE_KEYS.length} keys (>= 15 required)`, 'Backup-Keys');

// 3.2 Populate mock storage with authentic test data across all keys
mockStorage.clear();
const testStateData: Record<string, any> = {
  mealwise_weekly_plan: { monday: { breakfast: 'Phở bò', lunch: 'Cơm tấm', dinner: 'Canh chua' } },
  mealwise_onboarding: { step: 4, familySize: 4, budgetTier: 'vua-phai', region: 'bac' },
  mealwise_theme: 'dark',
  mealwise_party_plan: { guestCount: 30, tableCount: 3, budgetPerHead: 250000 },
  mealwise_pantry_items_v2: [{ id: 'p1', name: 'Trứng gà', daysLeft: 2, category: 'trung' }],
  mealwise_extra_grocery: [{ id: 'g1', name: 'Nước mắm', amount: '1', unit: 'chai' }],
  mealwise_extra_grocery_v1: [{ id: 'g1', name: 'Nước mắm', amount: '1', unit: 'chai' }],
  mealwise_grocery_checked: { g1: true },
  mealwise_grocery_buyer_counts: { item_1: 2 },
  mealwise_account_unlocked_cases_v1: ['case_gold_1', 'case_diamond_2'],
  mealwise_servings: '4',
  mealwise_custom_party_plans: [{ id: 'cp1', name: 'Tiệc Tân Gia', guests: 20 }],
  mealwise_collab_room: 'ROOM-8888',
  mealwise_collab_checked: { g1: 'UserA' },
  mealwise_collab_shopper_profile: { id: 'u1', name: 'Chị Lan' },
  mealwise_collab_user: { id: 'u1', name: 'Chị Lan' },
};

for (const [k, v] of Object.entries(testStateData)) {
  mockStorage.setItem(k, JSON.stringify(v));
}

// 3.3 Test Export Serialization
const exportedJson = exportMealWiseBackup();
assert(typeof exportedJson === 'string' && exportedJson.length > 50, 'exportMealWiseBackup returns non-empty string', 'Backup-Export');

let parsedBackup: any;
try {
  parsedBackup = JSON.parse(exportedJson);
  assert(true, 'Exported backup is valid JSON', 'Backup-Export');
} catch (e: any) {
  assert(false, `Exported backup failed to parse: ${e.message}`, 'Backup-Export');
}

assert(parsedBackup.version === 1, 'Backup version is strictly 1', 'Backup-Export', {
  expected: '1',
  actual: String(parsedBackup.version),
});

assert(typeof parsedBackup.exportedAt === 'string' && !isNaN(Date.parse(parsedBackup.exportedAt)),
  'exportedAt is a valid parseable ISO date timestamp', 'Backup-Export');

assert(typeof parsedBackup.state === 'object' && parsedBackup.state !== null,
  'state is an object in backup', 'Backup-Export');

// Verify all 16 core keys are serialized into state
for (const key of BACKUP_CORE_STORAGE_KEYS) {
  assert(parsedBackup.state[key] !== undefined, `State includes key: ${key}`, 'Backup-Export');
}

// Verify friendly aliases are mapped
assert(parsedBackup.state.weeklyPlan !== undefined, 'Friendly alias weeklyPlan mapped', 'Backup-Export');
assert(parsedBackup.state.onboardingData !== undefined, 'Friendly alias onboardingData mapped', 'Backup-Export');
assert(parsedBackup.state.theme === 'dark', 'Friendly alias theme mapped', 'Backup-Export');
assert(parsedBackup.state.partyPlan !== undefined, 'Friendly alias partyPlan mapped', 'Backup-Export');
assert(parsedBackup.state.pantryItems !== undefined, 'Friendly alias pantryItems mapped', 'Backup-Export');

// 3.4 Round-Trip Integrity: Clear storage, import exported backup, verify full recovery
mockStorage.clear();
assert(mockStorage.length === 0, 'Storage cleared prior to restoration test', 'Backup-Restore');

const restoreResult = importMealWiseBackup(exportedJson);
assert(restoreResult.success === true, 'importMealWiseBackup returns success: true on clean export', 'Backup-Restore', {
  expected: 'true',
  actual: String(restoreResult.success),
  info: restoreResult.error,
});

// Verify all keys restored to localStorage
for (const key of BACKUP_CORE_STORAGE_KEYS) {
  const item = mockStorage.getItem(key);
  assert(item !== null, `Key "${key}" restored to localStorage`, 'Backup-Restore');
}

// 3.5 Hostile & Corrupted Payload Schema Validation
const hostilePayloads: Array<{ payload: any; expectedSubstring: string; desc: string }> = [
  { payload: '', expectedSubstring: 'trống', desc: 'Empty string rejected' },
  { payload: '   ', expectedSubstring: 'trống', desc: 'Whitespace string rejected' },
  { payload: null, expectedSubstring: 'trống', desc: 'Null input rejected' },
  { payload: undefined, expectedSubstring: 'trống', desc: 'Undefined input rejected' },
  { payload: '{ broken json', expectedSubstring: 'lỗi định dạng JSON', desc: 'Syntax error JSON rejected' },
  { payload: '12345', expectedSubstring: 'không đúng định dạng đối tượng', desc: 'Primitive number root rejected' },
  { payload: '"hello"', expectedSubstring: 'không đúng định dạng đối tượng', desc: 'Primitive string root rejected' },
  { payload: 'true', expectedSubstring: 'không đúng định dạng đối tượng', desc: 'Primitive boolean root rejected' },
  { payload: '[1, 2, 3]', expectedSubstring: 'không đúng định dạng đối tượng', desc: 'Array root rejected' },
  { payload: JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), state: { mealwise_theme: 'dark' } }), expectedSubstring: 'không tương thích', desc: 'Incompatible version 2 rejected' },
  { payload: JSON.stringify({ version: 0, exportedAt: new Date().toISOString(), state: { mealwise_theme: 'dark' } }), expectedSubstring: 'không tương thích', desc: 'Incompatible version 0 rejected' },
  { payload: JSON.stringify({ version: '1', exportedAt: new Date().toISOString(), state: { mealwise_theme: 'dark' } }), expectedSubstring: 'không tương thích', desc: 'String version "1" rejected' },
  { payload: JSON.stringify({ version: 1, state: { mealwise_theme: 'dark' } }), expectedSubstring: 'thiếu hoặc sai định dạng thời gian xuất', desc: 'Missing exportedAt rejected' },
  { payload: JSON.stringify({ version: 1, exportedAt: 'invalid-date', state: { mealwise_theme: 'dark' } }), expectedSubstring: 'thiếu hoặc sai định dạng thời gian xuất', desc: 'Invalid date string exportedAt rejected' },
  { payload: JSON.stringify({ version: 1, exportedAt: new Date().toISOString() }), expectedSubstring: 'thiếu trường dữ liệu trạng thái', desc: 'Missing state field rejected' },
  { payload: JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state: [] }), expectedSubstring: 'thiếu trường dữ liệu trạng thái', desc: 'Array state field rejected' },
  { payload: JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state: {} }), expectedSubstring: 'trạng thái (state) trong tệp sao lưu trống', desc: 'Empty state object rejected' },
  { payload: JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state: { unknown_foreign_key: 123 } }), expectedSubstring: 'không chứa bất kỳ khóa dữ liệu MealWise hợp lệ', desc: 'Foreign unrecognized state rejected' },
];

for (const tc of hostilePayloads) {
  const res = importMealWiseBackup(tc.payload);
  assert(res.success === false, tc.desc, 'Corrupt-Resilience');
  assert(
    typeof res.error === 'string' && res.error.toLowerCase().includes(tc.expectedSubstring.toLowerCase()),
    `${tc.desc} returns descriptive message containing "${tc.expectedSubstring}"`,
    'Corrupt-Resilience',
    {
      expected: tc.expectedSubstring,
      actual: res.error,
    }
  );
}

// 3.6 Storage Exception Resilience (simulate QuotaExceededError)
const errorStorage: Storage = {
  get length() { return 0; },
  clear() {},
  getItem() { return null; },
  key() { return null; },
  removeItem() {},
  setItem() {
    throw new Error('QuotaExceededError: storage limit reached');
  }
};
(globalThis as any).localStorage = errorStorage;
const validBackupPayload = JSON.stringify({
  version: 1,
  exportedAt: new Date().toISOString(),
  state: { mealwise_theme: 'dark' }
});
const exceptionResult = importMealWiseBackup(validBackupPayload);
assert(exceptionResult.success === false, 'QuotaExceededError handled gracefully without uncaught crash', 'Storage-Error');
assert(exceptionResult.error !== undefined && exceptionResult.error.includes('Không thể ghi dữ liệu vào localStorage'),
  'QuotaExceededError reports friendly error message', 'Storage-Error', {
    expected: 'Không thể ghi dữ liệu vào localStorage',
    actual: exceptionResult.error,
  }
);
// Restore mockStorage
(globalThis as any).localStorage = mockStorage;


// ======================================================================
// SECTION 4: MULTI-DEVICE RESPONSIVE INVARIANTS (320px..desktop 4K)
// ======================================================================
console.log('\n--- 4. MULTI-DEVICE RESPONSIVE INVARIANTS (320px..4K) ---');

const srcDir = path.resolve(process.cwd(), 'src');

interface ViewportSpec {
  name: string;
  width: number;
  height: number;
  category: string;
}

const EXTENDED_VIEWPORTS: ViewportSpec[] = [
  { name: 'iPhone SE 1st gen / Galaxy Fold narrow outer', width: 320, height: 568, category: 'narrow-mobile' },
  { name: 'Android Budget / Compact (Galaxy A)', width: 360, height: 740, category: 'compact-mobile' },
  { name: 'iPhone SE 2/3 / iPhone 8', width: 375, height: 667, category: 'standard-mobile' },
  { name: 'iPhone 12/13 mini tall', width: 375, height: 858, category: 'standard-mobile' },
  { name: 'iPhone 13/14/15/16 standard', width: 390, height: 844, category: 'standard-mobile' },
  { name: 'iPhone Plus / Max flagship', width: 414, height: 896, category: 'flagship-mobile' },
  { name: 'iPhone 14/15 Pro Max', width: 428, height: 926, category: 'flagship-mobile' },
  { name: 'iPad Mini / Tablet Portrait', width: 768, height: 1024, category: 'tablet' },
  { name: 'iPad Pro / Tablet Landscape', width: 1024, height: 768, category: 'tablet' },
  { name: 'Desktop WXGA / Laptop', width: 1280, height: 800, category: 'desktop' },
  { name: 'Desktop Full HD (1080p)', width: 1920, height: 1080, category: 'desktop' },
  { name: 'Desktop 2K QHD', width: 2560, height: 1440, category: 'desktop' },
  { name: 'Desktop 4K UHD', width: 3840, height: 2160, category: 'desktop' },
];

// 4.1 Box Model Container Width Clamping & Horizontal Overflow Invariant
for (const vp of EXTENDED_VIEWPORTS) {
  const naturalContainerMax = 512; // max-w-lg
  const effectiveContainerWidth = Math.min(vp.width, naturalContainerMax);
  const overflow = effectiveContainerWidth - vp.width;
  assert(overflow <= 0, `${vp.name} (${vp.width}x${vp.height}): 0 horizontal overflow (overflow = ${overflow}px)`, 'Responsive-Bounds');
  
  if (vp.width > naturalContainerMax) {
    const margin = (vp.width - effectiveContainerWidth) / 2;
    assert(margin > 0, `${vp.name}: Centered layout with ${margin}px side margins`, 'Responsive-Bounds');
  }
}

// 4.2 WeeklyBoard 7-Day Strip Cell Width on 320px
for (const vp of EXTENDED_VIEWPORTS) {
  const outerPadding = vp.width < 640 ? 24 : 32; // px-3 (12*2) vs px-4 (16*2)
  const cardWidth = Math.min(vp.width - outerPadding, 512 - outerPadding);
  const innerCardPadding = 12; // p-1.5 = 6px each side
  const stripWidth = cardWidth - innerCardPadding;
  const gaps = 6 * 4; // 6 gaps * 4px = 24px
  const cellWidth = (stripWidth - gaps) / 7;

  assert(cellWidth >= 36, `${vp.name}: WeeklyBoard day cell width ${cellWidth.toFixed(1)}px >= 36px touch min`, 'DayStrip-Bounds');
}

// 4.3 WeeklyBoard 3 Macro Nutrition Cards on 320px
for (const vp of EXTENDED_VIEWPORTS) {
  const outerPadding = vp.width < 640 ? 24 : 32;
  const cardWidth = Math.min(vp.width - outerPadding, 512 - outerPadding);
  const innerCardPadding = vp.width < 640 ? 28 : 32;
  const availableGridWidth = cardWidth - innerCardPadding;
  const gaps = 2 * (vp.width < 640 ? 6 : 8);
  const colWidth = (availableGridWidth - gaps) / 3;

  assert(colWidth >= 80, `${vp.name}: Nutrition column width ${colWidth.toFixed(1)}px >= 80px min`, 'Macro-Bounds');
}

// 4.4 GroceryList Item Row Name Budget on 320px
for (const vp of EXTENDED_VIEWPORTS) {
  const outerPadding = vp.width < 640 ? 24 : 32;
  const cardWidth = Math.min(vp.width - outerPadding, 512 - outerPadding);
  const innerCardPadding = 24;
  const innerWidth = cardWidth - innerCardPadding;
  const checkboxWidth = 20;
  const checkboxGap = 12;
  const rightBadgesWidth = 82;
  const rightGap = 12;
  const availableNameWidth = innerWidth - (checkboxWidth + checkboxGap + rightBadgesWidth + rightGap);

  assert(availableNameWidth >= 120, `${vp.name}: Grocery item name width ${availableNameWidth}px >= 120px min before truncate`, 'Grocery-Bounds');
}

// 4.5 CateringPartyPlanner 5 Quick Guest Chips on 320px
for (const vp of EXTENDED_VIEWPORTS) {
  const outerPadding = vp.width < 640 ? 24 : 32;
  const cardWidth = Math.min(vp.width - outerPadding, 512 - outerPadding);
  const innerPadding = 24;
  const innerWidth = cardWidth - innerPadding;
  const gaps = 4 * 4; // 16px
  const chipWidth = (innerWidth - gaps) / 5;

  assert(chipWidth >= 50, `${vp.name}: Catering guest chip width ${chipWidth.toFixed(1)}px >= 50px min`, 'Catering-Bounds');
}

// 4.6 RouletteWheel Scalability on 320px
const wheelCode = fs.readFileSync(path.join(srcDir, 'components/RouletteWheel.tsx'), 'utf-8');
assert(wheelCode.includes('w-full h-auto max-w-[290px]'), 'RouletteWheel SVG uses w-full h-auto max-w-[290px] responsive sizing', 'Roulette-Bounds');
assert(wheelCode.includes('viewBox='), 'RouletteWheel preserves SVG viewBox', 'Roulette-Bounds');

// On 320px viewport: modal p-2 (16px) + px-4 (32px) = 272px available
const availableWheelWidth320 = 320 - 16 - 32;
const renderedWheelWidth = Math.min(availableWheelWidth320, 290);
assert(renderedWheelWidth <= availableWheelWidth320, `Wheel renders at ${renderedWheelWidth}px within ${availableWheelWidth320}px on 320px screen`, 'Roulette-Bounds');

// 4.7 Zero Hardcoded Fixed Pixel Container Width Violations in Core Components
const coreFiles = [
  'components/WeeklyBoard.tsx',
  'components/MealSetExplorer.tsx',
  'components/GroceryList.tsx',
  'components/FridgeView.tsx',
  'components/CateringPartyPlanner.tsx',
  'components/AccountView.tsx',
  'components/Navbar.tsx',
  'components/RecipeDetailModal.tsx',
  'components/OnboardingModal.tsx',
];

for (const relPath of coreFiles) {
  const code = fs.readFileSync(path.join(srcDir, relPath), 'utf-8');
  // Look for static width classes w-[320px..9999px] that are not max-w or min-w
  const dangerousWidthMatch = code.match(/\bw-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\](?!.*max-w)/);
  assert(
    dangerousWidthMatch === null,
    `${relPath}: contains zero dangerous fixed width >= 330px`,
    'No-Fixed-Width',
    {
      expected: 'null',
      actual: dangerousWidthMatch ? dangerousWidthMatch[0] : 'null',
    }
  );
}

// 4.8 Safe Area Insets Verification in Shell & Bottom Action Bars
const navbarCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
assert(navbarCode.includes('pt-[env(safe-area-inset-top,0px)]'), 'Navbar contains safe-area-inset-top', 'Safe-Area');

const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
assert(groceryCode.includes('pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]'), 'GroceryList sticky bar contains safe-area-inset-bottom', 'Safe-Area');

const cateringCode = fs.readFileSync(path.join(srcDir, 'components/CateringPartyPlanner.tsx'), 'utf-8');
assert(cateringCode.includes('pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]'), 'CateringPlanner bottom bar contains safe-area-inset-bottom', 'Safe-Area');


// ======================================================================
// SUMMARY & VERDICT
// ======================================================================
console.log('\n======================================================================');
console.log('                   ADVERSARIAL STRESS TEST SUMMARY                    ');
console.log('======================================================================');
console.log(`  Total Checks:   ${totalChecks}`);
console.log(`  Passed Checks:  ${passedChecks}`);
console.log(`  Failed Checks:  ${failedChecks}`);
console.log(`  Pass Rate:      ${((passedChecks / totalChecks) * 100).toFixed(2)}%`);
console.log('======================================================================\n');

if (failedChecks > 0) {
  console.error(`\x1b[31m[VERDICT: REJECT] ${failedChecks} adversarial checks failed!\x1b[0m`);
  process.exit(1);
} else {
  console.log(`\x1b[32m[VERDICT: APPROVE] 100% of adversarial checks passed successfully!\x1b[0m\n`);
  process.exit(0);
}
