/**
 * MealWise Adversarial Fridge Challenger 1 Test Suite
 * Location: tests/adversarial-fridge-challenger1.ts
 *
 * Empirical verification harness executing adversarial stress-tests against:
 * 1. Casing, excessive whitespace, noise delimiters, and fuzzing
 * 2. Punctuation-delimited ingredient names (trứng (gà), thịt heo - ba chỉ, etc.)
 * 3. Cross-species & cross-domain collision traps (ba chỉ bò, sườn bò, đậu gà, rau càng cua, đậu rồng)
 * 4. Condiment traps, brand traps (Gạo ST25 Ông Cua), and non-food negative invariants
 * 5. Obscure Vietnamese ingredients and semantic integrity
 * 6. Strict Ingredient Containment Invariant across findLeftoverRecipeSuggestions & findWholeFridgeRecipeSuggestions
 * 7. Multi-ingredient whole-fridge synergy, urgency bonuses, and pagination modulo rotation
 */

import { mockRecipes } from '../src/data/mockRecipes';
import {
  matchRecipeWithPantryItem,
  findLeftoverRecipeSuggestions,
  findWholeFridgeRecipeSuggestions,
  hasExactSyllable,
  isCondiment,
  BASE_CONDIMENTS
} from '../src/utils/fridgeMatcher';
import { PantryItem, Recipe } from '../src/types';

export interface AdversarialTestRecord {
  id: string;
  name: string;
  suite: string;
  passed: boolean;
  error?: string;
  details?: Record<string, any>;
}

export const adversarialResults: AdversarialTestRecord[] = [];

function recordPass(id: string, name: string, suite: string, details?: Record<string, any>) {
  adversarialResults.push({ id, name, suite, passed: true, details });
  console.log(`  ✓ [PASS] [${suite}] ${id}: ${name}`);
}

function recordFail(id: string, name: string, suite: string, error: string, details?: Record<string, any>) {
  adversarialResults.push({ id, name, suite, passed: false, error, details });
  console.error(`  ✗ [FAIL] [${suite}] ${id}: ${name} -> ${error}`);
}

export function makePantryItem(
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

// ============================================================================
// SUITE 1: WEIRD CASING, EXCESSIVE WHITESPACE & NOISE PUNCTUATION
// ============================================================================
export function runSuite1CasingWhitespaceNoise() {
  console.log('\n======================================================================');
  console.log('SUITE 1: Weird Casing, Excessive Whitespace & Noise Delimiters');
  console.log('======================================================================');

  const noisyCases = [
    { raw: '  tRứNg   (GÀ)   ', expectedCore: 'egg', label: 'Egg with erratic casing and whitespace' },
    { raw: '\t\n  thịt heo  -   ba chỉ   \r\n', expectedCore: 'pork', label: 'Pork belly with tabs and newlines' },
    { raw: '   CÁ   (THU) !?!  ', expectedCore: 'fish', label: 'Fish with uppercase and punctuation' },
    { raw: 'nấm [đùi gà]  ', expectedCore: 'mushroom', label: 'Mushroom with square brackets' },
    { raw: '  <<THỊT BÒ (THĂN)>>  ', expectedCore: 'beef', label: 'Beef with angle brackets and parentheses' },
    { raw: 'ĐẬU   PHỤ  /  ĐẬU   HŨ', expectedCore: 'tofu', label: 'Tofu with slash and spaces' },
    { raw: '  bắp   cải   ...   ', expectedCore: 'cabbage', label: 'Cabbage with internal excessive spaces' },
    { raw: 'Cơm (Nguội) #1', expectedCore: 'rice', label: 'Leftover rice with hash and parentheses' },
    { raw: '  RAU   MUỐNG  ---  TƯƠI  ', expectedCore: 'water-spinach', label: 'Water spinach with dashes and filler' }
  ];

  for (let i = 0; i < noisyCases.length; i++) {
    const c = noisyCases[i];
    const testId = `ADV-NOISE-${String(i + 1).padStart(2, '0')}`;
    const item = makePantryItem(`item-noise-${i}`, c.raw);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 6);

    if (suggestions.length === 0) {
      recordFail(testId, c.label, 'Suite 1: Casing & Noise', `Expected suggestions but received 0 for "${c.raw}"`);
      continue;
    }

    let allContainIngredient = true;
    let failedDish = '';

    for (const r of suggestions) {
      const title = r.title.toLowerCase();
      const ingNames = r.ingredients.map(ing => ing.name.toLowerCase());

      let matches = false;
      if (c.expectedCore === 'egg') {
        matches = title.includes('trứng') || title.includes('ốp la') || ingNames.some(n => n.includes('trứng') || n.includes('ốp la'));
      } else if (c.expectedCore === 'pork') {
        matches = title.includes('ba chỉ') || title.includes('ba rọi') || title.includes('thịt heo') || title.includes('thịt lợn') || title.includes('thịt băm') || ingNames.some(n => n.includes('ba chỉ') || n.includes('ba rọi') || n.includes('thịt heo') || n.includes('thịt lợn') || n.includes('thịt nạc') || n.includes('thịt băm'));
      } else if (c.expectedCore === 'fish') {
        matches = title.includes('cá') || ingNames.some(n => n.includes('cá'));
      } else if (c.expectedCore === 'mushroom') {
        matches = title.includes('nấm') || ingNames.some(n => n.includes('nấm') && !n.includes('hạt nêm'));
      } else if (c.expectedCore === 'beef') {
        matches = title.includes('bò') || ingNames.some(n => n.includes('bò'));
      } else if (c.expectedCore === 'tofu') {
        matches = title.includes('đậu') || title.includes('tàu hũ') || ingNames.some(n => n.includes('đậu phụ') || n.includes('đậu hũ') || n.includes('tàu hũ'));
      } else if (c.expectedCore === 'cabbage') {
        matches = title.includes('bắp cải') || title.includes('cải bắp') || ingNames.some(n => n.includes('bắp cải') || n.includes('cải bắp'));
      } else if (c.expectedCore === 'rice') {
        matches = title.includes('cơm') || title.includes('cháo') || ingNames.some(n => n.includes('cơm'));
      } else if (c.expectedCore === 'water-spinach') {
        matches = title.includes('rau muống') || ingNames.some(n => n.includes('rau muống'));
      }

      if (!matches) {
        allContainIngredient = false;
        failedDish = r.title;
        break;
      }
    }

    if (allContainIngredient) {
      recordPass(testId, `${c.label} -> ${suggestions.length} valid recipes`, 'Suite 1: Casing & Noise');
    } else {
      recordFail(testId, c.label, 'Suite 1: Casing & Noise', `Returned dish "${failedDish}" does not contain expected ingredient`);
    }
  }
}

// ============================================================================
// SUITE 2: CROSS-SPECIES & CROSS-DOMAIN COLLISION TRAPS
// ============================================================================
export function runSuite2CompoundPunctuationAndTraps() {
  console.log('\n======================================================================');
  console.log('SUITE 2: Punctuation-Delimited Compound Inversions & Species Traps');
  console.log('======================================================================');

  // Test 1: trứng (gà) vs thịt gà (ta)
  {
    const eggItem = makePantryItem('egg-ga', 'trứng (gà)');
    const eggSuggestions = findLeftoverRecipeSuggestions(eggItem, mockRecipes, 10);
    let falseChicken = 0;
    for (const r of eggSuggestions) {
      const hasEgg = r.ingredients.some(i => i.name.toLowerCase().includes('trứng') || i.name.toLowerCase().includes('ốp la')) || r.title.toLowerCase().includes('trứng') || r.title.toLowerCase().includes('ốp la');
      if (!hasEgg) falseChicken++;
    }
    if (eggSuggestions.length > 0 && falseChicken === 0) {
      recordPass('ADV-TRAP-01', 'trứng (gà) strictly yields egg dishes (0 chicken hallucinations)', 'Suite 2: Inversion Traps');
    } else {
      recordFail('ADV-TRAP-01', 'trứng (gà)', 'Suite 2: Inversion Traps', `Found ${falseChicken} dishes without egg`);
    }
  }

  // Test 2: nấm (đùi gà) vs đùi gà (nấm)
  {
    const kingOyster = makePantryItem('mushroom-king', 'nấm (đùi gà)');
    const shroomSuggestions = findLeftoverRecipeSuggestions(kingOyster, mockRecipes, 10);
    let falseChickenMeat = 0;
    for (const r of shroomSuggestions) {
      const hasShroom = r.ingredients.some(i => i.name.toLowerCase().includes('nấm') && !i.name.toLowerCase().includes('hạt nêm')) || r.title.toLowerCase().includes('nấm');
      if (!hasShroom) falseChickenMeat++;
    }
    if (shroomSuggestions.length > 0 && falseChickenMeat === 0) {
      recordPass('ADV-TRAP-02', 'nấm (đùi gà) strictly yields mushroom dishes (0 poultry collisions)', 'Suite 2: Inversion Traps');
    } else {
      recordFail('ADV-TRAP-02', 'nấm (đùi gà)', 'Suite 2: Inversion Traps', `Found ${falseChickenMeat} dishes without mushroom`);
    }
  }

  // Test 3: thịt heo - ba chỉ strictly yields pork dishes
  {
    const porkItem = makePantryItem('pork-belly', 'thịt heo - ba chỉ');
    const porkSuggestions = findLeftoverRecipeSuggestions(porkItem, mockRecipes, 10);
    let falsePork = 0;
    for (const r of porkSuggestions) {
      const hasPork = r.ingredients.some(i => {
        const n = i.name.toLowerCase();
        return n.includes('ba chỉ') || n.includes('ba rọi') || n.includes('thịt heo') || n.includes('thịt lợn') || n.includes('thịt nạc') || n.includes('thịt băm');
      }) || /ba chỉ|ba rọi|thịt heo|thịt lợn|thịt băm|thịt rang|thịt nướng|thịt kho/i.test(r.title);
      if (!hasPork) falsePork++;
    }
    if (porkSuggestions.length > 0 && falsePork === 0) {
      recordPass('ADV-TRAP-03', 'thịt heo - ba chỉ strictly yields pork dishes', 'Suite 2: Inversion Traps');
    } else {
      recordFail('ADV-TRAP-03', 'thịt heo - ba chỉ', 'Suite 2: Inversion Traps', `Found ${falsePork} dishes without pork`);
    }
  }

  // Test 4: ba chỉ bò / ba chỉ - bò species isolation test (Beef vs Pork)
  {
    const beefBelly = makePantryItem('beef-belly', 'ba chỉ bò');
    const beefSuggestions = findLeftoverRecipeSuggestions(beefBelly, mockRecipes, 10);
    let porkOnlyCount = 0;
    const porkOnlyTitles: string[] = [];

    for (const r of beefSuggestions) {
      const hasBeef = r.ingredients.some(i => i.name.toLowerCase().includes('bò')) || /thịt bò|bò/i.test(r.title);
      const hasPork = r.ingredients.some(i => i.name.toLowerCase().includes('heo') || i.name.toLowerCase().includes('lợn')) || /thịt heo|thịt lợn/i.test(r.title);
      if (hasPork && !hasBeef) {
        porkOnlyCount++;
        porkOnlyTitles.push(r.title);
      }
    }

    if (porkOnlyCount === 0 && beefSuggestions.length > 0) {
      recordPass('ADV-TRAP-04', 'ba chỉ bò strictly yields beef dishes without pork contamination', 'Suite 2: Inversion Traps');
    } else {
      recordFail(
        'ADV-TRAP-04',
        'ba chỉ bò species isolation',
        'Suite 2: Inversion Traps',
        `Pork contamination detected! ${porkOnlyCount} of ${beefSuggestions.length} suggestions are pork-only dishes: ${porkOnlyTitles.slice(0, 3).join('; ')}`
      );
    }
  }

  // Test 5: sườn bò (beef ribs) species isolation test
  {
    const beefRibs = makePantryItem('beef-ribs', 'sườn bò');
    const ribSuggestions = findLeftoverRecipeSuggestions(beefRibs, mockRecipes, 10);
    let porkRibOnlyCount = 0;
    const porkRibTitles: string[] = [];

    for (const r of ribSuggestions) {
      const hasBeef = r.ingredients.some(i => i.name.toLowerCase().includes('bò')) || /thịt bò|bò/i.test(r.title);
      const hasPork = r.ingredients.some(i => i.name.toLowerCase().includes('heo') || i.name.toLowerCase().includes('lợn')) || /sườn heo|sườn non/i.test(r.title);
      if (hasPork && !hasBeef) {
        porkRibOnlyCount++;
        porkRibTitles.push(r.title);
      }
    }

    if (porkRibOnlyCount === 0 && ribSuggestions.length > 0) {
      recordPass('ADV-TRAP-05', 'sườn bò strictly yields beef dishes without pork rib contamination', 'Suite 2: Inversion Traps');
    } else {
      recordFail(
        'ADV-TRAP-05',
        'sườn bò species isolation',
        'Suite 2: Inversion Traps',
        `Pork rib contamination detected! ${porkRibOnlyCount} of ${ribSuggestions.length} suggestions are pork-only dishes: ${porkRibTitles.slice(0, 3).join('; ')}`
      );
    }
  }

  // Test 6: xoài cát vs cá (fruit vs fish syllable boundary)
  {
    const mango = makePantryItem('mango', 'xoài (cát)');
    let fishDishMatched = 0;
    for (const r of mockRecipes) {
      if (matchRecipeWithPantryItem(r, mango).matched) {
        if (/cá |cá lóc|cá nục|cá hồi|cá basa/i.test(r.title) && !/xoài/i.test(r.title)) {
          fishDishMatched++;
        }
      }
    }
    if (fishDishMatched === 0) {
      recordPass('ADV-TRAP-06', 'xoài (cát) does NOT match fish dishes (syllable boundary holding)', 'Suite 2: Inversion Traps');
    } else {
      recordFail('ADV-TRAP-06', 'xoài (cát)', 'Suite 2: Inversion Traps', `Matched ${fishDishMatched} fish dishes`);
    }
  }

  // Test 7: nấm mèo vs mè (mushroom vs sesame)
  {
    const woodEar = makePantryItem('woodear', 'nấm mèo');
    let sesameDishMatched = 0;
    for (const r of mockRecipes) {
      if (matchRecipeWithPantryItem(r, woodEar).matched) {
        if (/vừng|dầu mè|mè rang/i.test(r.title) && !/nấm|mộc nhĩ/i.test(r.title)) {
          sesameDishMatched++;
        }
      }
    }
    if (sesameDishMatched === 0) {
      recordPass('ADV-TRAP-07', 'nấm mèo does NOT match sesame dishes (syllable boundary holding)', 'Suite 2: Inversion Traps');
    } else {
      recordFail('ADV-TRAP-07', 'nấm mèo', 'Suite 2: Inversion Traps', `Matched ${sesameDishMatched} sesame dishes`);
    }
  }

  // Test 8: gạo ST25 (ông cua) vs cua (đồng) brand trap
  {
    const riceOngCua = makePantryItem('rice-ong-cua', 'Gạo ST25 (Ông Cua)');
    let crabDishes = 0;
    for (const r of mockRecipes) {
      if (matchRecipeWithPantryItem(r, riceOngCua).matched) {
        if (/cua|ghẹ|riêu cua/i.test(r.title)) crabDishes++;
      }
    }
    if (crabDishes === 0) {
      recordPass('ADV-TRAP-08', 'Gạo ST25 (Ông Cua) does NOT match crab dishes (brand filter holding)', 'Suite 2: Inversion Traps');
    } else {
      recordFail('ADV-TRAP-08', 'Gạo ST25 (Ông Cua)', 'Suite 2: Inversion Traps', `Matched ${crabDishes} crab dishes due to missing brand filter on pantry item!`);
    }
  }

  // Test 9: đậu gà (chickpeas) vs thịt gà (vegan legume vs poultry meat)
  {
    const chickpea = makePantryItem('chickpea', 'đậu gà');
    const suggestions = findLeftoverRecipeSuggestions(chickpea, mockRecipes, 10);
    let chickenMeatCount = 0;
    const chickenTitles: string[] = [];

    for (const r of suggestions) {
      const hasChickenMeat = r.ingredients.some(i => i.name.toLowerCase().includes('thịt gà') || i.name.toLowerCase().includes('ức gà') || i.name.toLowerCase().includes('cánh gà') || i.name.toLowerCase().includes('gà ta')) || /gà luộc|gà rán|gà kho|gà chiên|cháo gà|phở gà/i.test(r.title);
      const hasChickpea = r.ingredients.some(i => i.name.toLowerCase().includes('đậu gà')) || r.title.toLowerCase().includes('đậu gà');
      if (hasChickenMeat && !hasChickpea) {
        chickenMeatCount++;
        chickenTitles.push(r.title);
      }
    }

    if (chickenMeatCount === 0) {
      recordPass('ADV-TRAP-09', 'đậu gà (chickpea) strictly isolates from poultry meat dishes', 'Suite 2: Inversion Traps');
    } else {
      recordFail(
        'ADV-TRAP-09',
        'đậu gà poultry collision',
        'Suite 2: Inversion Traps',
        `Poultry meat collision! ${chickenMeatCount} chicken dishes suggested for vegan chickpea: ${chickenTitles.slice(0, 3).join('; ')}`
      );
    }
  }

  // Test 10: rau càng cua vs cua đồng (salad herb vs crustacean crab)
  {
    const cangCuaHerb = makePantryItem('cang-cua', 'rau càng cua');
    const suggestions = findLeftoverRecipeSuggestions(cangCuaHerb, mockRecipes, 10);
    let crabCount = 0;
    const crabTitles: string[] = [];

    for (const r of suggestions) {
      const hasCrustacean = r.ingredients.some(i => i.name.toLowerCase().includes('cua đồng') || i.name.toLowerCase().includes('riêu cua')) || /canh cua|bún riêu/i.test(r.title);
      const hasHerb = r.ingredients.some(i => i.name.toLowerCase().includes('càng cua')) || r.title.toLowerCase().includes('càng cua');
      if (hasCrustacean && !hasHerb) {
        crabCount++;
        crabTitles.push(r.title);
      }
    }

    if (crabCount === 0) {
      recordPass('ADV-TRAP-10', 'rau càng cua strictly isolates from crustacean crab dishes', 'Suite 2: Inversion Traps');
    } else {
      recordFail(
        'ADV-TRAP-10',
        'rau càng cua crab collision',
        'Suite 2: Inversion Traps',
        `Crustacean collision! ${crabCount} crab dishes suggested for herb vegetable: ${crabTitles.slice(0, 3).join('; ')}`
      );
    }
  }
}

// ============================================================================
// SUITE 3: CONDIMENTS, BRAND TRAPS & NON-FOOD PANTRY JUNK
// ============================================================================
export function runSuite3CondimentsAndNonFood() {
  console.log('\n======================================================================');
  console.log('SUITE 3: Condiment Blacklist & Non-Food Pantry Junk (Zero Matches)');
  console.log('======================================================================');

  const condiments = [
    'nước mắm', 'nước tương', 'dầu mè', 'dầu ăn', 'mắm tôm',
    'mắm nêm', 'bột ngọt', 'hạt nêm', 'muối', 'đường',
    'hạt tiêu', 'tiêu đen', 'ớt bột', 'sa tế', 'giấm'
  ];

  for (let i = 0; i < condiments.length; i++) {
    const c = condiments[i];
    const testId = `ADV-COND-${String(i + 1).padStart(2, '0')}`;
    const item = makePantryItem(`cond-${i}`, c);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    if (suggestions.length === 0) {
      recordPass(testId, `Condiment "${c}" yields 0 staple meal suggestions`, 'Suite 3: Condiments');
    } else {
      recordFail(testId, `Condiment "${c}"`, 'Suite 3: Condiments', `Yielded ${suggestions.length} suggestions: ${suggestions.map(s => s.title).slice(0, 3).join('; ')}`);
    }
  }

  const junkItems = [
    'bột giặt Omo', 'nước rửa chén Sunlight', 'pin AA con thỏ',
    'khăn giấy lau bếp', 'thuốc lá Thăng Long', 'bàn chải đánh răng',
    'nước tẩy bồn cầu', 'giấy bạc nướng', 'màng bọc thực phẩm', 'dầu gió xanh Con Én'
  ];

  for (let i = 0; i < junkItems.length; i++) {
    const j = junkItems[i];
    const testId = `ADV-JUNK-${String(i + 1).padStart(2, '0')}`;
    const item = makePantryItem(`junk-${i}`, j);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    if (suggestions.length === 0) {
      recordPass(testId, `Non-food junk "${j}" yields 0 suggestions`, 'Suite 3: Non-Food Junk');
    } else {
      recordFail(testId, `Non-food junk "${j}"`, 'Suite 3: Non-Food Junk', `Hallucinated ${suggestions.length} suggestions: ${suggestions.map(s => s.title).slice(0, 3).join('; ')}`);
    }
  }
}

// ============================================================================
// SUITE 4: OBSCURE VIETNAMESE INGREDIENTS & SEMANTIC INTEGRITY
// ============================================================================
export function runSuite4ObscureVietnameseIngredients() {
  console.log('\n======================================================================');
  console.log('SUITE 4: Obscure Vietnamese Ingredients & Semantic Integrity');
  console.log('======================================================================');

  const obscureIngredients = [
    { name: 'bông so đũa', expectedDishSyllable: 'so đũa' },
    { name: 'cá kèo', expectedDishSyllable: 'cá kèo' },
    { name: 'bông điên điển', expectedDishSyllable: 'điên điển' },
    { name: 'măng chua', expectedDishSyllable: 'măng chua' },
    { name: 'lá lốt', expectedDishSyllable: 'lá lốt' },
    { name: 'hoa chuối', expectedDishSyllable: 'hoa chuối' },
    { name: 'bắp chuối', expectedDishSyllable: 'bắp chuối' },
    { name: 'tai heo', expectedDishSyllable: 'tai heo' },
    { name: 'ngó sen', expectedDishSyllable: 'ngó sen' },
    { name: 'củ hũ dừa', expectedDishSyllable: 'củ hũ dừa' },
    { name: 'đậu rồng', expectedDishSyllable: 'đậu rồng' },
    { name: 'đậu ngự', expectedDishSyllable: 'đậu ngự' },
    { name: 'rau đắng', expectedDishSyllable: 'rau đắng' },
    { name: 'rau ngổ', expectedDishSyllable: 'rau ngổ' },
    { name: 'hẹ lá', expectedDishSyllable: 'hẹ' },
    { name: 'sầu riêng', expectedDishSyllable: 'sầu riêng' }
  ];

  for (let i = 0; i < obscureIngredients.length; i++) {
    const ob = obscureIngredients[i];
    const testId = `ADV-OBSC-${String(i + 1).padStart(2, '0')}`;
    const item = makePantryItem(`obsc-${i}`, ob.name);
    const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 10);

    if (suggestions.length === 0) {
      // It's acceptable for an obscure item not to have recipes in mockRecipes,
      // as long as it does NOT hallucinate unrelated dishes!
      recordPass(testId, `Obscure ingredient "${ob.name}" -> 0 dishes (no hallucinations)`, 'Suite 4: Obscure Ingredients');
    } else {
      // If suggestions are returned, EVERY SINGLE ONE must genuinely contain the ingredient!
      let allValid = true;
      let invalidDish = '';

      for (const r of suggestions) {
        const titleLower = r.title.toLowerCase();
        const ingNames = r.ingredients.map(ing => ing.name.toLowerCase());
        const target = ob.expectedDishSyllable.toLowerCase();

        const matchesTitle = titleLower.includes(target);
        const matchesIng = ingNames.some(n => n.includes(target));

        if (!matchesTitle && !matchesIng) {
          allValid = false;
          invalidDish = r.title;
          break;
        }
      }

      if (allValid) {
        recordPass(testId, `Obscure ingredient "${ob.name}" -> ${suggestions.length} genuine matches`, 'Suite 4: Obscure Ingredients');
      } else {
        recordFail(testId, `Obscure ingredient "${ob.name}"`, 'Suite 4: Obscure Ingredients', `Returned dish "${invalidDish}" lacks "${ob.expectedDishSyllable}"`);
      }
    }
  }
}

// ============================================================================
// SUITE 5: STRICT CONTAINMENT INVARIANT (SINGLE-ITEM & WHOLE-FRIDGE)
// ============================================================================
export function runSuite5StrictContainmentInvariant() {
  console.log('\n======================================================================');
  console.log('SUITE 5: Strict Containment Invariant Across 728 Recipes & Whole Fridge');
  console.log('======================================================================');

  // Test 1: Single item matchRecipeWithPantryItem containment sweep
  {
    const itemsToSweep = [
      'Trứng gà', 'Nấm rơm', 'Thịt heo ba chỉ', 'Cá lóc', 'Tôm sú',
      'Mực lá', 'Đậu hũ', 'Cà chua', 'Rau muống', 'Bắp cải',
      'Cơm nguội', 'Bánh mì', 'Bún tươi', 'Thịt bò thăn'
    ];

    let totalChecked = 0;
    let falsePositiveCount = 0;

    for (const itemName of itemsToSweep) {
      const item = makePantryItem('swp-' + itemName, itemName);
      const suggestions = findLeftoverRecipeSuggestions(item, mockRecipes, 20);

      for (const r of suggestions) {
        totalChecked++;
        const match = matchRecipeWithPantryItem(r, item);
        if (!match.matched) {
          falsePositiveCount++;
          console.error(`Inconsistency: suggestion "${r.title}" failed direct matchRecipeWithPantryItem for "${itemName}"`);
        }
      }
    }

    if (totalChecked > 50 && falsePositiveCount === 0) {
      recordPass('ADV-INV-01', `Swept ${totalChecked} suggested dishes: 100% matched item containment`, 'Suite 5: Containment Invariant');
    } else {
      recordFail('ADV-INV-01', 'Containment sweep', 'Suite 5: Containment Invariant', `Found ${falsePositiveCount} of ${totalChecked} dishes failing containment`);
    }
  }

  // Test 2: Whole fridge suggestion containment verification
  {
    const fridge = [
      makePantryItem('f1', 'Trứng gà', 'Trứng', 1), // urgent
      makePantryItem('f2', 'Cà chua', 'Rau củ', 2), // urgent
      makePantryItem('f3', 'Thịt heo ba chỉ', 'Thịt', 4),
      makePantryItem('f4', 'Đậu hũ non', 'Trứng & Đậu', 5)
    ];

    const { results, totalEligible } = findWholeFridgeRecipeSuggestions(fridge, mockRecipes, 10, 0);

    let allCandidatesValid = true;
    let failReason = '';

    for (const c of results) {
      if (c.matchedCount <= 0) {
        allCandidatesValid = false;
        failReason = `Dish "${c.recipe.title}" has matchedCount <= 0`;
        break;
      }
      if (c.matchedPantryItems.length !== c.matchedCount) {
        allCandidatesValid = false;
        failReason = `matchedPantryItems length (${c.matchedPantryItems.length}) != matchedCount (${c.matchedCount})`;
        break;
      }
      // Verify every matched pantry item is genuinely in the recipe
      for (const pItem of c.matchedPantryItems) {
        const directMatch = matchRecipeWithPantryItem(c.recipe, pItem);
        if (!directMatch.matched) {
          allCandidatesValid = false;
          failReason = `Pantry item "${pItem.name}" attributed to "${c.recipe.title}" failed direct match!`;
          break;
        }
      }
      if (!allCandidatesValid) break;
    }

    if (totalEligible > 0 && results.length > 0 && allCandidatesValid) {
      recordPass('ADV-INV-02', `Whole-fridge (${results.length} suggestions, ${totalEligible} eligible): all matched items verified`, 'Suite 5: Containment Invariant');
    } else {
      recordFail('ADV-INV-02', 'Whole-fridge verification', 'Suite 5: Containment Invariant', failReason || 'No suggestions returned');
    }
  }

  // Test 3: Whole fridge empty / only condiments yields 0 suggestions
  {
    const condimentFridge = [
      makePantryItem('c1', 'Nước mắm Nam Ngư', 'Gia vị', 30),
      makePantryItem('c2', 'Dầu ăn Simply', 'Gia vị', 30),
      makePantryItem('c3', 'Hạt nêm Knorr', 'Gia vị', 30)
    ];
    const { results, totalEligible } = findWholeFridgeRecipeSuggestions(condimentFridge, mockRecipes, 10);
    if (results.length === 0 && totalEligible === 0) {
      recordPass('ADV-INV-03', 'Condiment-only fridge yields 0 whole-fridge suggestions', 'Suite 5: Containment Invariant');
    } else {
      recordFail('ADV-INV-03', 'Condiment-only fridge', 'Suite 5: Containment Invariant', `Returned ${results.length} dishes for condiment fridge`);
    }
  }

  // Test 4: Pagination modulo rotation bounds
  {
    const fridge = [
      makePantryItem('f1', 'Trứng gà', 'Trứng', 2),
      makePantryItem('f2', 'Thịt heo ba chỉ', 'Thịt', 3)
    ];
    const page1 = findWholeFridgeRecipeSuggestions(fridge, mockRecipes, 4, 0);
    const page2 = findWholeFridgeRecipeSuggestions(fridge, mockRecipes, 4, 4);
    const pageLoop = findWholeFridgeRecipeSuggestions(fridge, mockRecipes, 4, page1.totalEligible);

    const hasDistinctAcrossPages = page1.results.length > 0 && page2.results.length > 0 && page1.results[0].recipe.id !== page2.results[0].recipe.id;
    const loopMatchesStart = page1.results.length > 0 && pageLoop.results.length > 0 && page1.results[0].recipe.id === pageLoop.results[0].recipe.id;

    if (hasDistinctAcrossPages && loopMatchesStart) {
      recordPass('ADV-INV-04', 'Whole-fridge pagination rotates cleanly without out-of-bounds crash', 'Suite 5: Containment Invariant');
    } else {
      recordFail('ADV-INV-04', 'Whole-fridge pagination rotation', 'Suite 5: Containment Invariant', 'Pagination rotation mismatch');
    }
  }
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
function main() {
  console.log('======================================================================');
  console.log('     MEALWISE ADVERSARIAL FRIDGE CHALLENGER 1 TEST SUITE              ');
  console.log('======================================================================');

  runSuite1CasingWhitespaceNoise();
  runSuite2CompoundPunctuationAndTraps();
  runSuite3CondimentsAndNonFood();
  runSuite4ObscureVietnameseIngredients();
  runSuite5StrictContainmentInvariant();

  console.log('\n======================================================================');
  console.log('ADVERSARIAL CHALLENGER 1 SUMMARY BREAKDOWN');
  console.log('======================================================================');

  const total = adversarialResults.length;
  const passed = adversarialResults.filter(t => t.passed).length;
  const failed = adversarialResults.filter(t => !t.passed).length;

  console.log(`Total Adversarial Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\nFAILURE DETAILS:');
    for (const f of adversarialResults.filter(t => !t.passed)) {
      console.log(`  [FAIL] [${f.suite}] ${f.id}: ${f.name} -> ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('\n[SUCCESS] All adversarial tests passed with 0% false positives!');
    process.exit(0);
  }
}

main();
