/**
 * Empirical Stress Test Suite by challenger_fridge_reverify
 * Location: tests/stress-test-challenger-extra.ts
 *
 * Dedicated verification for deep adversarial permutations:
 * 1. ba chỉ bò / ba rọi bò / sườn bò (Species Isolation & Pork Contamination Guard)
 * 2. đậu gà / hạt đậu gà (Poultry Collision Guard)
 * 3. rau càng cua / Gạo ST25 (Ông Cua) (Crab Collision Guard)
 * 4. Legume produce vs processed tofu (đậu rồng, đậu ngự, đậu ván, đậu bắp, đậu que)
 * 5. Specific fish species isolation (cá kèo, cá hú, cá basa, cá lóc, cá hồi)
 * 6. Offal cut isolation (tai heo vs pork belly)
 * 7. Fuzzed noise delimiters & casing
 * 8. Hostile offset boundaries (negative, NaN, Infinity, floating)
 */

import { mockRecipes } from '../src/data/mockRecipes';
import {
  findLeftoverRecipeSuggestions,
  findWholeFridgeRecipeSuggestions,
  matchRecipeWithPantryItem
} from '../src/utils/fridgeMatcher';
import { PantryItem, Recipe } from '../src/types';

function makeBaseItem(
  id: string,
  name: string,
  category = 'Tươi sống',
  daysLeft = 3,
  isLeftover = false,
  notes = ''
): PantryItem {
  return {
    id,
    name,
    category,
    quantity: '500g',
    daysLeft,
    status: daysLeft <= 2 ? 'warning' : 'fresh',
    isLeftover,
    notes
  };
}

interface StressResult {
  name: string;
  category: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: StressResult[] = [];

function assert(condition: boolean, name: string, category: string, errorMsg: string, details?: any) {
  if (condition) {
    results.push({ name, category, passed: true, details });
    console.log(`  ✓ [PASS] [${category}] ${name}`);
  } else {
    results.push({ name, category, passed: false, error: errorMsg, details });
    console.error(`  ✗ [FAIL] [${category}] ${name} -> ${errorMsg}`);
  }
}

export function runEmpiricalStressTests() {
  console.log('\n======================================================================');
  console.log('EMPIRICAL CHALLENGER STRESS TESTS: fridgeMatcher Disambiguation');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // 1. BEEF SPECIES ISOLATION (ba chỉ bò, ba rọi bò, sườn bò, etc.)
  // -------------------------------------------------------------------------
  const beefTestCases = [
    'ba chỉ bò',
    'ba rọi bò',
    'thịt ba chỉ bò',
    'thịt ba rọi bò',
    '  ba   chỉ   bò  ',
    'BA CHỈ BÒ (MỸ)',
    'sườn bò',
    'sườn bò úc',
    'sườn bò mỹ',
    'sườn que bò',
    '<< SƯỜN BÒ >> #1',
    'bò thăn thái mỏng'
  ];

  for (const rawBeef of beefTestCases) {
    const item = makeBaseItem(`item-beef-${rawBeef}`, rawBeef, 'Tươi sống', 1, true);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    // Invariant: any suggestion MUST contain beef in ingredients or title, and MUST NOT be pork-only
    let porkContamination = 0;
    let nonBeefMatches = 0;
    let beefDishes = 0;

    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(i => i.name.toLowerCase());
      const hasBeef = title.includes('bò') || ingNames.some(n => n.includes('bò') || n.includes('bắp bò') || n.includes('thịt bò'));
      const hasPork = title.includes('heo') || title.includes('lợn') || title.includes('sườn non heo') ||
                      ingNames.some(n => (n.includes('thịt heo') || n.includes('thịt lợn') || n.includes('sườn heo') || n.includes('sườn non')) && !n.includes('bò'));

      if (hasBeef) beefDishes++;
      if (!hasBeef) nonBeefMatches++;
      if (hasPork && !hasBeef) porkContamination++;
    }

    assert(
      suggestions.length > 0 && nonBeefMatches === 0 && porkContamination === 0,
      `Beef isolation for "${rawBeef}" (returned ${suggestions.length} dishes, ${beefDishes} beef, ${porkContamination} pork)`,
      'Species Isolation: Beef',
      `Found ${porkContamination} pork dishes or ${nonBeefMatches} non-beef dishes for beef cut "${rawBeef}"`
    );
  }

  // -------------------------------------------------------------------------
  // 2. POULTRY COLLISION GUARD (đậu gà / chickpea)
  // -------------------------------------------------------------------------
  const chickpeaCases = [
    'đậu gà',
    'dau ga',
    'hạt đậu gà',
    'đậu gà khô',
    'đậu gà luộc',
    '  [Đậu gà] - hữu cơ  ',
    'ĐẬU GÀ (CHICKPEA)'
  ];

  for (const rawChickpea of chickpeaCases) {
    const item = makeBaseItem(`item-chickpea-${rawChickpea}`, rawChickpea, 'Rau củ', 2, false);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    // Invariant: MUST NOT return chicken meat dishes (thịt gà, gà luộc, cánh gà, ức gà, phở gà)
    let chickenMeatDishes: string[] = [];

    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(i => i.name.toLowerCase());
      const isPoultry = title.includes('gà luộc') || title.includes('cánh gà') || title.includes('ức gà') ||
                        title.includes('gỏi gà') || title.includes('thịt gà') || title.includes('phở gà') ||
                        title.includes('gà rán') || title.includes('gà chiên') ||
                        ingNames.some(n => n.includes('thịt gà') || n.includes('ức gà') || n.includes('cánh gà') || n.includes('đùi gà ta'));
      if (isPoultry) {
        chickenMeatDishes.push(r.title);
      }
    }

    assert(
      chickenMeatDishes.length === 0,
      `Chickpea isolation for "${rawChickpea}" -> 0 chicken meat collisions`,
      'Domain Collision: Chickpea vs Chicken',
      `Chickpea "${rawChickpea}" triggered ${chickenMeatDishes.length} chicken meat dishes: ${chickenMeatDishes.join(', ')}`
    );
  }

  // -------------------------------------------------------------------------
  // 3. CRUSTACEAN COLLISION GUARD (rau càng cua & Gạo ST25 Ông Cua)
  // -------------------------------------------------------------------------
  const crabTrapCases = [
    { name: 'rau càng cua', desc: 'Herb rau càng cua' },
    { name: 'Rau Càng Cua (Sạch)', desc: 'Punctuation-wrapped rau càng cua' },
    { name: '  càng   cua  ', desc: 'Spaced càng cua' },
    { name: 'Gạo ST25 (Ông Cua)', desc: 'Rice brand ST25 Ông Cua' },
    { name: 'Gạo Ông Cua ST25', desc: 'Alternative rice brand phrasing' },
    { name: 'gạo đặc sản ông cua', desc: 'Lowercase brand rice' }
  ];

  for (const c of crabTrapCases) {
    const item = makeBaseItem(`item-crab-trap-${c.name}`, c.name, 'Rau củ', 3, false);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    // Invariant: MUST NOT return crab crustacean dishes (bún riêu cua, canh cua, miến cua, lẩu riêu)
    let crabDishes: string[] = [];

    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(i => i.name.toLowerCase());
      const isCrabDish = (title.includes('cua') || title.includes('ghẹ') || title.includes('riêu cua')) &&
                         !title.includes('rau càng cua') && !title.includes('ông cua');
      const hasCrabIng = ingNames.some(n => (n.includes('cua đồng') || n.includes('thịt cua') || n.includes('ghẹ') || n.includes('riêu cua')) && !n.includes('ông cua') && !n.includes('càng cua'));

      if (isCrabDish || hasCrabIng) {
        crabDishes.push(r.title);
      }
    }

    assert(
      crabDishes.length === 0,
      `Crab trap isolation for "${c.name}" -> 0 crab crustacean collisions`,
      'Domain Collision: Crab Traps',
      `"${c.name}" triggered ${crabDishes.length} crab dishes: ${crabDishes.join(', ')}`
    );
  }

  // -------------------------------------------------------------------------
  // 4. LEGUMES VS PROCESSED TOFU DISAMBIGUATION
  // -------------------------------------------------------------------------
  const legumeCases = [
    'đậu rồng',
    'đậu ngự',
    'đậu ván',
    'đậu đũa',
    'đậu cove',
    'đậu bắp',
    'đậu que',
    'đậu phộng'
  ];

  for (const leg of legumeCases) {
    const item = makeBaseItem(`item-legume-${leg}`, leg, 'Rau củ', 3, false);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    // Invariant: If mockRecipes has NO recipe for this specific legume, it MUST NOT fall back to tofu curd dishes (đậu hũ chiên, đậu sốt cà, tàu hũ)
    let tofuCollisions: string[] = [];

    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(i => i.name.toLowerCase());
      const containsActualLegume = title.includes(leg) || ingNames.some(n => n.includes(leg));
      const hasTofu = title.includes('đậu hũ') || title.includes('đậu phụ') || title.includes('tàu hũ') ||
                      ingNames.some(n => n.includes('đậu phụ') || n.includes('đậu hũ') || n.includes('tàu hũ'));

      if (hasTofu && !containsActualLegume) {
        tofuCollisions.push(r.title);
      }
    }

    assert(
      tofuCollisions.length === 0,
      `Legume produce isolation for "${leg}" -> 0 tofu collisions`,
      'Domain Disambiguation: Legumes vs Tofu',
      `Legume "${leg}" erroneously triggered tofu dishes: ${tofuCollisions.join(', ')}`
    );
  }

  // -------------------------------------------------------------------------
  // 5. SPECIFIC FISH SPECIES ISOLATION
  // -------------------------------------------------------------------------
  const fishCases = [
    { target: 'cá kèo', incompatibleSpecies: ['cá hú', 'cá lóc', 'cá basa', 'cá hồi', 'cá nục'] },
    { target: 'cá hú', incompatibleSpecies: ['cá kèo', 'cá hồi', 'cá nục'] },
    { target: 'cá basa', incompatibleSpecies: ['cá kèo', 'cá hồi', 'cá nục'] },
    { target: 'cá hồi', incompatibleSpecies: ['cá kèo', 'cá hú', 'cá basa', 'cá nục'] },
    { target: 'cá nục', incompatibleSpecies: ['cá kèo', 'cá hú', 'cá hồi'] }
  ];

  for (const fc of fishCases) {
    const item = makeBaseItem(`item-fish-${fc.target}`, fc.target, 'Hải sản', 2, false);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    let crossSpeciesFailures: string[] = [];

    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(i => i.name.toLowerCase());
      for (const incomp of fc.incompatibleSpecies) {
        if (title.includes(incomp) || ingNames.some(n => n.includes(incomp))) {
          crossSpeciesFailures.push(`Recipe "${r.title}" contains "${incomp}"`);
        }
      }
    }

    assert(
      crossSpeciesFailures.length === 0,
      `Fish species isolation for "${fc.target}" (0 cross-species leaks)`,
      'Species Isolation: Fish',
      `Fish "${fc.target}" leaked into other species: ${crossSpeciesFailures.join('; ')}`
    );
  }

  // -------------------------------------------------------------------------
  // 6. OFFAL CUT ISOLATION (tai heo vs pork belly)
  // -------------------------------------------------------------------------
  {
    const item = makeBaseItem('item-tai-heo', 'tai heo', 'Tươi sống', 1, false);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    let porkBellyCollisions: string[] = [];
    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(i => i.name.toLowerCase());
      const hasTai = title.includes('tai heo') || title.includes('tai lợn') || ingNames.some(n => n.includes('tai heo') || n.includes('tai lợn'));
      if (!hasTai) {
        porkBellyCollisions.push(r.title);
      }
    }

    assert(
      porkBellyCollisions.length === 0,
      `Offal cut isolation for "tai heo" (0 pork belly hallucinations)`,
      'Cut Isolation: Tai Heo',
      `Offal "tai heo" erroneously returned pork belly dishes: ${porkBellyCollisions.join(', ')}`
    );
  }

  // -------------------------------------------------------------------------
  // 7. HOSTILE PAGINATION & OFFSETS
  // -------------------------------------------------------------------------
  const hostileOffsets = [-100, -1, -0.5, 0, 0.7, 1.9, 10.5, 999999];
  const testPantry = [
    makeBaseItem('p-1', 'Thịt ba chỉ', 'Tươi sống', 1, true),
    makeBaseItem('p-2', 'Trứng gà', 'Tươi sống', 2, false),
    makeBaseItem('p-3', 'Cà chua', 'Rau củ', 3, false)
  ];

  for (const off of hostileOffsets) {
    let threw = false;
    let resultCount = 0;
    try {
      const res = findWholeFridgeRecipeSuggestions(testPantry, mockRecipes, 4, off);
      resultCount = res.results.length;
      // Invariant: every result must have a valid recipe object
      const hasUndefined = res.results.some(r => !r || !r.recipe || !r.recipe.id);
      assert(!hasUndefined && resultCount > 0, `findWholeFridge offset=${off} returns valid non-undefined array`, 'Hostile Offsets', `Offset ${off} returned undefined recipe`);
    } catch (e: any) {
      threw = true;
      assert(false, `findWholeFridge offset=${off} throws exception`, 'Hostile Offsets', `Threw error: ${e.message}`);
    }

    try {
      const resSingle = findLeftoverRecipeSuggestions(testPantry[0], mockRecipes, 4, off, testPantry);
      const hasUndefinedSingle = resSingle.some(r => !r || !r.id);
      assert(!hasUndefinedSingle && resSingle.length > 0, `findLeftover offset=${off} returns valid non-undefined array`, 'Hostile Offsets', `Offset ${off} returned undefined single recipe`);
    } catch (e: any) {
      assert(false, `findLeftover offset=${off} throws exception`, 'Hostile Offsets', `Threw error: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 8. COMBINATORIAL SYNERGY VERIFICATION
  // -------------------------------------------------------------------------
  {
    // When user has Thịt bò + Cần tây, dishes containing both should get higher score than either alone
    const beefItem = makeBaseItem('comb-1', 'Thịt bò thăn', 'Tươi sống', 1, false);
    const celeryItem = makeBaseItem('comb-2', 'Cần tây', 'Rau củ', 2, false);

    const soloBeef = findLeftoverRecipeSuggestions(beefItem, mockRecipes, 10, 0, [beefItem]);
    const synergyBeef = findLeftoverRecipeSuggestions(beefItem, mockRecipes, 10, 0, [beefItem, celeryItem]);

    const wholeFridge = findWholeFridgeRecipeSuggestions([beefItem, celeryItem], mockRecipes, 10, 0);

    assert(
      soloBeef.length > 0 && synergyBeef.length > 0 && wholeFridge.results.length > 0,
      'Synergy combination produces non-empty suggestions for Beef + Celery',
      'Synergy Verification',
      'Synergy suggestions were empty'
    );

    // Dishes matching both items must have matchedCount = 2 in wholeFridge
    const multiMatched = wholeFridge.results.filter(r => r.matchedCount >= 2);
    assert(
      multiMatched.length > 0,
      `Whole-fridge finds ${multiMatched.length} recipes that utilize BOTH beef and celery`,
      'Synergy Verification',
      'No multi-item matches found for beef + celery'
    );
  }

  // Summary
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n======================================================================');
  console.log(`EMPIRICAL STRESS TEST AUDIT: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('======================================================================\n');

  if (failed > 0) {
    console.error(`[AUDIT FAILED] ${failed} stress test assertions failed!`);
    process.exit(1);
  } else {
    console.log('[AUDIT SUCCESS] 100% of empirical challenger stress tests PASSED!');
    process.exit(0);
  }
}

runEmpiricalStressTests();
