/**
 * MealWise Adversarial Stress Test Suite — Challenger Fridge 2
 * Domain Focus: Pagination Rotation Modulo Logic, Zero Out-of-Bounds Invariant,
 * and Multi-Pantry Whole-Fridge Synergy Ranking.
 */

import { mockRecipes } from '../src/data/mockRecipes';
import {
  findWholeFridgeRecipeSuggestions,
  findLeftoverRecipeSuggestions,
  matchRecipeWithPantryItem,
  WholeFridgeSuggestionResult
} from '../src/utils/fridgeMatcher';
import { PantryItem, Recipe } from '../src/types';

console.log('\n======================================================================');
console.log('       CHALLENGER FRIDGE 2: ADVERSARIAL STRESS-TESTING & AUDIT         ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, msg: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${msg}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] ${msg}`);
  }
}

// Helper to create synthetic dummy recipes
function createDummyRecipe(id: string, title: string, ingredientNames: string[]): Recipe {
  return {
    id,
    title,
    description: `Mô tả cho ${title}`,
    cookTimeMinutes: 20,
    calories: 350,
    category: 'Món Mặn',
    imageUrl: 'https://images.unsplash.com/photo-example',
    ingredients: ingredientNames.map((name, idx) => ({
      name,
      amount: '100g',
      category: 'thit'
    })),
    instructions: ['Bước 1', 'Bước 2']
  };
}

// ======================================================================
// SECTION 1: MODULO ROTATION ACROSS CONTROLLED totalEligible (0, 1, 2, 3, 4, 5, 20)
// ======================================================================
console.log('\n--- 1. MODULO ROTATION MATRIX ACROSS totalEligible (0, 1, 2, 3, 4, 5, 20) ---');

// We construct controlled sets of recipes that match a single ingredient
const basePantryItem: PantryItem = {
  id: 'p-egg',
  name: 'Trứng gà',
  category: 'Trứng & Đậu',
  quantity: '4 quả',
  daysLeft: 2,
  isLeftover: false
};

const eligibleCounts = [0, 1, 2, 3, 4, 5, 20];
const testOffsets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 500, 1000, 10000];

for (const targetCount of eligibleCounts) {
  // Generate exact targetCount recipes that contain 'Trứng'
  const dummyCatalog: Recipe[] = [];
  for (let k = 0; k < targetCount; k++) {
    dummyCatalog.push(createDummyRecipe(`rec-egg-${k}`, `Món Trứng Số ${k}`, ['Trứng gà', 'Hành lá']));
  }
  // Add some irrelevant recipes that don't match
  dummyCatalog.push(createDummyRecipe('rec-other-1', 'Thịt bò xào cần', ['Thịt bò', 'Cần tây']));
  dummyCatalog.push(createDummyRecipe('rec-other-2', 'Cá hồi sốt cam', ['Cá hồi', 'Cam']));

  for (const offset of testOffsets) {
    const { results, totalEligible } = findWholeFridgeRecipeSuggestions([basePantryItem], dummyCatalog, 4, offset);

    assert(
      totalEligible === targetCount,
      `[totalEligible=${targetCount}, offset=${offset}] Expected totalEligible=${targetCount}, got ${totalEligible}`
    );

    // Assert zero out-of-bounds or undefined in results
    const hasUndefined = results.some(r => r === undefined || r === null || r.recipe === undefined || r.recipe === null);
    assert(
      !hasUndefined,
      `[totalEligible=${targetCount}, offset=${offset}] Zero undefined or null in results`
    );

    // Length check
    const expectedLen = Math.min(4, targetCount);
    assert(
      results.length === expectedLen,
      `[totalEligible=${targetCount}, offset=${offset}] Results length expected ${expectedLen}, got ${results.length}`
    );

    // Duplicate check: all returned recipes must have distinct IDs
    const idSet = new Set(results.map(r => r.recipe.id));
    assert(
      idSet.size === results.length,
      `[totalEligible=${targetCount}, offset=${offset}] Zero duplicate recipes in returned array (size ${idSet.size} === ${results.length})`
    );

    // Exact index rotation verification when targetCount > 0
    if (targetCount > 0) {
      const expectedStartIndex = offset % targetCount;
      const expectedFirstId = `rec-egg-${expectedStartIndex}`;
      assert(
        results[0].recipe.id === expectedFirstId,
        `[totalEligible=${targetCount}, offset=${offset}] Modulo start index: expected ${expectedFirstId}, got ${results[0].recipe.id}`
      );

      // Verify consecutive circular items
      for (let i = 0; i < expectedLen; i++) {
        const expectedIndex = (expectedStartIndex + i) % targetCount;
        assert(
          results[i].recipe.id === `rec-egg-${expectedIndex}`,
          `[totalEligible=${targetCount}, offset=${offset}] Item at index ${i} matches circular sequence (expected rec-egg-${expectedIndex})`
        );
      }
    }
  }
}

// ======================================================================
// SECTION 2: LARGE OFFSETS ON REAL 728-RECIPE CATALOG
// ======================================================================
console.log('\n--- 2. PAGINATION WITH LARGE OFFSETS ON REAL 728-RECIPE CATALOG ---');

const multiPantryFridge: PantryItem[] = [
  { id: '1', name: 'Cơm nguội', category: 'Đồ ăn thừa', quantity: '1 tô', daysLeft: 1, isLeftover: true },
  { id: '2', name: 'Trứng gà', category: 'Trứng & Đậu', quantity: '4 quả', daysLeft: 2, isLeftover: false },
  { id: '3', name: 'Thịt ba chỉ', category: 'Thịt', quantity: '300g', daysLeft: 2, isLeftover: false },
  { id: '4', name: 'Cà chua', category: 'Rau', quantity: '2 quả', daysLeft: 2, isLeftover: false },
  { id: '5', name: 'Đậu phụ', category: 'Trứng & Đậu', quantity: '2 bìa', daysLeft: 1, isLeftover: false }
];

const largeOffsets = [50, 100, 500, 1000, 10000, 50000, 100000, 1000000];

for (const offset of largeOffsets) {
  const { results, totalEligible } = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 4, offset);

  assert(totalEligible > 20, `[Real Catalog, offset=${offset}] totalEligible > 20 (got ${totalEligible})`);
  assert(results.length === 4, `[Real Catalog, offset=${offset}] Returned exactly 4 suggestions`);

  // Assert zero out of bounds or undefined
  const zeroUndefined = results.every(r => 
    r !== undefined &&
    r !== null &&
    r.recipe !== undefined &&
    r.recipe.id !== undefined &&
    typeof r.recipe.title === 'string' &&
    typeof r.totalScore === 'number' &&
    !isNaN(r.totalScore) &&
    typeof r.matchedCount === 'number' &&
    !isNaN(r.matchedCount) &&
    Array.isArray(r.matchedPantryItems) &&
    r.matchedPantryItems.length === r.matchedCount
  );
  assert(zeroUndefined, `[Real Catalog, offset=${offset}] Zero undefined or corrupted fields in returned results`);

  // Assert distinct IDs within page
  const uniqueIds = new Set(results.map(r => r.recipe.id));
  assert(uniqueIds.size === results.length, `[Real Catalog, offset=${offset}] Zero duplicates in 4-item window`);

  // Verify cyclic equivalence: offset vs (offset % totalEligible)
  const canonicalOffset = offset % totalEligible;
  const canonicalResult = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 4, canonicalOffset);
  const idsMatch = results.every((r, idx) => r.recipe.id === canonicalResult.results[idx].recipe.id);
  assert(
    idsMatch,
    `[Real Catalog, offset=${offset}] Output is identical to canonical offset (${offset} % ${totalEligible} = ${canonicalOffset})`
  );
}

// ======================================================================
// SECTION 3: MULTI-PANTRY WHOLE-FRIDGE SYNERGY SORTING ORACLE
// ======================================================================
console.log('\n--- 3. MULTI-PANTRY WHOLE-FRIDGE SYNERGY SORTING ORACLE ---');

// 3.1 Controlled Synthetic Sort Invariant Test:
// Recipes with higher matchedCount MUST strictly precede lower ones.
// Recipes with equal matchedCount MUST be sorted by totalScore descending.
console.log('\n  [Sub-test 3.1: Synthetic Strict Sort Verification]');

const syntheticFridge: PantryItem[] = [
  { id: 'p1', name: 'Thịt heo', category: 'Thịt', quantity: '200g', daysLeft: 5, isLeftover: false },
  { id: 'p2', name: 'Nấm hương', category: 'Nấm', quantity: '100g', daysLeft: 5, isLeftover: false },
  { id: 'p3', name: 'Bắp cải', category: 'Rau', quantity: '1 bắp', daysLeft: 5, isLeftover: false },
  { id: 'p4', name: 'Cà rốt', category: 'Rau', quantity: '2 củ', daysLeft: 5, isLeftover: false }
];

// Recipe A: matches 1 item (Thịt heo)
const recipeA = createDummyRecipe('r-1match-low', 'Thịt Heo Luộc Đơn Giản', ['Thịt heo']);
// Recipe B: matches 1 item (Thịt heo), but artificially given a high score via urgent leftovers if tested in real matcher
const recipeB = createDummyRecipe('r-1match-high', 'Thịt Heo Kho Tàu Siêu Đậm', ['Thịt heo']);
// Recipe C: matches 2 items (Thịt heo + Bắp cải)
const recipeC = createDummyRecipe('r-2match', 'Bắp Cải Cuộn Thịt Heo', ['Thịt heo', 'Bắp cải']);
// Recipe D: matches 3 items (Thịt heo + Nấm hương + Cà rốt)
const recipeD = createDummyRecipe('r-3match', 'Thịt Heo Xào Nấm Hương Cà Rốt', ['Thịt heo', 'Nấm hương', 'Cà rốt']);
// Recipe E: matches 4 items (Thịt heo + Nấm hương + Bắp cải + Cà rốt)
const recipeE = createDummyRecipe('r-4match', 'Canh Thịt Heo Nấm Bắp Cải Cà Rốt', ['Thịt heo', 'Nấm hương', 'Bắp cải', 'Cà rốt']);

const syntheticCatalog = [recipeA, recipeB, recipeC, recipeD, recipeE];
const synthResult = findWholeFridgeRecipeSuggestions(syntheticFridge, syntheticCatalog, 10, 0);

assert(synthResult.results.length === 5, 'All 5 synthetic recipes matched');

// Check that matchedCount is strictly non-increasing
for (let i = 0; i < synthResult.results.length - 1; i++) {
  const current = synthResult.results[i];
  const next = synthResult.results[i + 1];

  const primaryValid = current.matchedCount > next.matchedCount;
  const tieValid = current.matchedCount === next.matchedCount && current.totalScore >= next.totalScore;

  assert(
    primaryValid || tieValid,
    `Sort invariant at [${i} -> ${i + 1}]: (${current.recipe.id}, matches=${current.matchedCount}, score=${current.totalScore}) precedes (${next.recipe.id}, matches=${next.matchedCount}, score=${next.totalScore})`
  );
}

// Check exact top recipe is the 4-match recipe
assert(
  synthResult.results[0].recipe.id === 'r-4match' && synthResult.results[0].matchedCount === 4,
  'Top synthetic recipe is r-4match with matchedCount=4'
);
assert(
  synthResult.results[1].recipe.id === 'r-3match' && synthResult.results[1].matchedCount === 3,
  'Second synthetic recipe is r-3match with matchedCount=3'
);
assert(
  synthResult.results[2].recipe.id === 'r-2match' && synthResult.results[2].matchedCount === 2,
  'Third synthetic recipe is r-2match with matchedCount=2'
);

// 3.2 Real Catalog Full Candidate Array Sorting Verification (offset=0, limit=9999)
console.log('\n  [Sub-test 3.2: Real 728-Recipe Catalog Full Candidate Array Sorting Audit]');

const fullRun = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 9999, 0);
assert(fullRun.totalEligible > 0, `Full run found ${fullRun.totalEligible} eligible recipes`);
assert(fullRun.results.length === fullRun.totalEligible, 'Retrieved all eligible candidates');

let sortViolations = 0;
let highestMatchCount = fullRun.results[0]?.matchedCount || 0;

for (let i = 0; i < fullRun.results.length - 1; i++) {
  const cur = fullRun.results[i];
  const nxt = fullRun.results[i + 1];

  if (cur.matchedCount < nxt.matchedCount) {
    sortViolations++;
    console.error(`  VIOLATION: Index ${i} has matchedCount ${cur.matchedCount} < Index ${i + 1} with ${nxt.matchedCount}`);
  } else if (cur.matchedCount === nxt.matchedCount && cur.totalScore < nxt.totalScore) {
    sortViolations++;
    console.error(`  VIOLATION: Index ${i} has score ${cur.totalScore} < Index ${i + 1} with ${nxt.totalScore} for matchedCount ${cur.matchedCount}`);
  }
}

assert(sortViolations === 0, `Real catalog full candidates sorting: 0 violations found (total candidates: ${fullRun.totalEligible})`);
assert(highestMatchCount >= 2, `Highest matchedCount is ${highestMatchCount} (multi-ingredient synergy successfully triggered)`);

// 3.3 Synergy Bonus Verification
console.log('\n  [Sub-test 3.3: Synergy Multi-Item Bonus Quantification]');
const multiMatchRecipes = fullRun.results.filter(r => r.matchedCount >= 2);
assert(multiMatchRecipes.length > 0, `Found ${multiMatchRecipes.length} recipes matching 2+ ingredients`);

for (const r of multiMatchRecipes) {
  // Recipes with matchedCount >= 2 receive +120 bonus; matchedCount >= 3 receive +250 bonus
  assert(r.totalScore >= 120, `Recipe ${r.recipe.title} (matchedCount=${r.matchedCount}) score ${r.totalScore} reflects synergy`);
}

// ======================================================================
// SECTION 4: SINGLE-ITEM LEFTOVER MATCHER ROTATION & SYNERGY
// ======================================================================
console.log('\n--- 4. SINGLE-ITEM LEFTOVER MATCHER ROTATION & SYNERGY ---');

const leftoverRiceItem: PantryItem = {
  id: 'leftover-rice-test',
  name: 'Cơm nguội',
  category: 'Đồ ăn thừa',
  quantity: '1 tô',
  daysLeft: 1,
  isLeftover: true,
  notes: 'Cơm chiên trứng'
};

const singleItemOffsets = [0, 1, 2, 3, 4, 10, 50, 100, 500, 1000, 10000];

for (const off of singleItemOffsets) {
  const suggestions = findLeftoverRecipeSuggestions(
    leftoverRiceItem,
    mockRecipes,
    4,
    off,
    multiPantryFridge
  );

  assert(
    suggestions.length > 0 && suggestions.length <= 4,
    `[Single Item Leftover, offset=${off}] Returned valid array size (${suggestions.length})`
  );

  const zeroUndef = suggestions.every(s => s !== undefined && s !== null && typeof s.id === 'string');
  assert(zeroUndef, `[Single Item Leftover, offset=${off}] Zero undefined in returned recipes`);

  // Anti-carb clash invariant: never suggest noodle or bread for leftover rice
  const hasCarbClash = suggestions.some(s => {
    const t = s.title.toLowerCase();
    return t.includes('bánh mì') || t.includes('bún') || t.includes('phở') || t.includes('miến');
  });
  assert(!hasCarbClash, `[Single Item Leftover, offset=${off}] Zero carb-clashing bread/noodle dishes returned`);
}

// ======================================================================
// SECTION 5: HOSTILE / ADVERSARIAL EDGE CASE MINING
// ======================================================================
console.log('\n--- 5. HOSTILE / ADVERSARIAL EDGE CASE MINING ---');

// 5.1 Empty Inputs
console.log('\n  [Sub-test 5.1: Empty Inputs & Boundaries]');
const emptyPantryResult = findWholeFridgeRecipeSuggestions([], mockRecipes, 4, 0);
assert(
  emptyPantryResult.results.length === 0 && emptyPantryResult.totalEligible === 0,
  'Empty pantry returns empty results and totalEligible=0'
);

const emptyCatalogResult = findWholeFridgeRecipeSuggestions(multiPantryFridge, [], 4, 0);
assert(
  emptyCatalogResult.results.length === 0 && emptyCatalogResult.totalEligible === 0,
  'Empty recipe catalog returns empty results and totalEligible=0'
);

// 5.2 All-Condiments Pantry (Zero staple matches expected)
console.log('\n  [Sub-test 5.2: All-Condiments Pantry]');
const condimentPantry: PantryItem[] = [
  { id: 'c1', name: 'Nước mắm Phú Quốc', category: 'Gia vị', quantity: '1 chai', daysLeft: 30 },
  { id: 'c2', name: 'Hạt tiêu đen', category: 'Gia vị', quantity: '1 hũ', daysLeft: 60 },
  { id: 'c3', name: 'Muối tinh', category: 'Gia vị', quantity: '1 gói', daysLeft: 100 },
  { id: 'c4', name: 'Dầu ăn Simply', category: 'Gia vị', quantity: '1 chai', daysLeft: 90 }
];

const condimentResult = findWholeFridgeRecipeSuggestions(condimentPantry, mockRecipes, 4, 0);
assert(
  condimentResult.results.length === 0 && condimentResult.totalEligible === 0,
  `Condiments pantry produces 0 eligible dishes (got ${condimentResult.totalEligible})`
);

// 5.3 Limit Boundaries: limit = 0, limit = -1, limit = 9999
console.log('\n  [Sub-test 5.3: Limit Boundaries]');
const limitZero = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 0, 0);
assert(limitZero.results.length === 0, 'limit=0 returns 0 results');
assert(limitZero.totalEligible > 0, `limit=0 still accurately calculates totalEligible (${limitZero.totalEligible})`);

const limitHuge = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 9999, 0);
assert(limitHuge.results.length === limitHuge.totalEligible, 'limit=9999 returns all eligible results');

// 5.4 Adversarial Offsets: Negative Offsets & Non-Integer Offsets
console.log('\n  [Sub-test 5.4: Adversarial Offsets]');
try {
  const negOffsetResult = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 4, -4);
  const hasNegUndef = negOffsetResult.results.some(r => r === undefined || r.recipe === undefined);
  if (hasNegUndef) {
    console.error('  [ADVERSARIAL VULNERABILITY DETECTED]: Negative offset (-4) produced undefined elements!');
  } else {
    console.log('  [PASS] Negative offset handled gracefully without undefined');
  }
} catch (err: any) {
  console.error(`  [ADVERSARIAL VULNERABILITY DETECTED]: Negative offset threw exception: ${err.message}`);
}

// 5.5 Float / Fractional Offsets
try {
  const floatOffsetResult = findWholeFridgeRecipeSuggestions(multiPantryFridge, mockRecipes, 4, 2.5);
  const hasFloatUndef = floatOffsetResult.results.some(r => r === undefined || r.recipe === undefined);
  if (hasFloatUndef) {
    console.error('  [ADVERSARIAL VULNERABILITY DETECTED]: Floating point offset (2.5) produced undefined elements!');
  } else {
    console.log('  [PASS] Float offset handled gracefully without undefined');
  }
} catch (err: any) {
  console.error(`  [ADVERSARIAL VULNERABILITY DETECTED]: Float offset threw exception: ${err.message}`);
}

// ======================================================================
// SUMMARY & VERDICT
// ======================================================================
console.log('\n======================================================================');
console.log(`STRESS AUDIT COMPLETED: Total Checks: ${totalChecks} | Passed: ${passedChecks} | Failed: ${failedChecks}`);
const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);
console.log(`Compliance Rate: ${passRate}%`);
console.log('======================================================================\n');

if (failedChecks === 0) {
  console.log('>>> VERDICT: APPROVE <<<\n');
} else {
  console.log('>>> VERDICT: REJECT <<<\n');
}
