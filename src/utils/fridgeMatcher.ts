import { PantryItem, Recipe } from '../types';

/**
 * Intelligent Leftover & Whole-Fridge Recipe Matcher
 * 
 * - Multi-ingredient synthesis: Scans ALL items in the fridge and recommends dishes
 *   that utilize the maximum number of in-fridge ingredients simultaneously.
 * - Anti-carb clashing: Never recommends bread or noodle soup when the user has leftover rice.
 * - Strips condiment false-positives: Ignores 'nước mắm cá cơm' when matching 'cơm'.
 * - Reload & Shuffle support: Users can cycle through batches of dishes from over 700+ recipes.
 */

// Conflicting carb terms that must NEVER be recommended when user has leftover rice
const RICE_INCOMPATIBLE_TERMS = [
  'bánh mì', 'banh mi', 'sandwich', 'toast', 'burger',
  'bún', 'bun ', 'phở', 'pho ', 'hủ tiếu', 'hu tieu',
  'miến', 'mien ', 'mì ý', 'spaghetti', 'mì tôm', 'mì xào',
  'bánh canh', 'bánh cuốn', 'bánh ướt', 'bánh bèo'
];

// Filler words to strip when extracting the core ingredient
const FILLER_WORDS = [
  'bữa trước', 'bua truoc', 'tối qua', 'toi qua', 'hôm qua', 'hom qua',
  'thừa', 'thua', 'còn thừa', 'con thua', 'dư', 'con lai', 'còn lại',
  'sẵn có', 'san co', 'ngăn mát', 'ngan mat', 'tươi sống', 'tuoi song'
];

// Seasoning / Condiment patterns that should NOT trigger false-positive ingredient matches
const FALSE_POSITIVE_CONDIMENTS = [
  'nước mắm cá cơm', 'nuoc mam ca com',
  'cá cơm', 'ca com',
  'nước tương đậu nành', 'nuoc tuong dau nanh',
  'dầu ăn', 'dau an', 'muối', 'muoi', 'tiêu', 'tieu', 'đường', 'duong'
];

export interface ItemMatchInfo {
  matched: boolean;
  score: number;
  matchedAs: string;
}

export function matchRecipeWithPantryItem(
  recipe: Recipe,
  item: PantryItem,
  contextNote = ''
): ItemMatchInfo {
  if (!item || !item.name) return { matched: false, score: 0, matchedAs: '' };

  const rawName = item.name.toLowerCase().trim();
  const rawNote = `${item.notes || ''} ${contextNote}`.toLowerCase().trim();
  const titleLower = recipe.title.toLowerCase();

  const isRiceLeftover = 
    rawName.includes('cơm') || 
    rawName.includes('com ') ||
    rawName.includes('xôi') ||
    rawNote.includes('cơm rang') ||
    rawNote.includes('cơm chiên');

  if (isRiceLeftover) {
    // If recipe contains bread or noodle soups, strictly reject!
    if (RICE_INCOMPATIBLE_TERMS.some(term => titleLower.includes(term))) {
      return { matched: false, score: 0, matchedAs: '' };
    }

    if (titleLower.includes('cơm rang') || titleLower.includes('cơm chiên') || titleLower.includes('cơm cháy')) {
      let score = 150;
      if (titleLower.includes('dưa bò') && rawNote.includes('dưa bò')) score += 80;
      if (titleLower.includes('kim chi') && rawNote.includes('kim chi')) score += 80;
      if (titleLower.includes('trứng') && (rawNote.includes('trứng') || rawNote.includes('chiên'))) score += 60;
      if (titleLower.includes('dương châu')) score += 50;
      return { matched: true, score, matchedAs: 'Cơm chiên / Cơm rang' };
    }

    if (titleLower.includes('cháo') && !titleLower.includes('bột')) {
      return { matched: true, score: 90, matchedAs: 'Cháo nóng từ cơm nguội' };
    }

    if (titleLower.includes('cơm') && !titleLower.includes('cá cơm')) {
      return { matched: true, score: 40, matchedAs: 'Món ăn kèm cơm' };
    }

    // Check ingredients
    const hasRiceIng = recipe.ingredients.some(ing => {
      const ingName = ing.name.toLowerCase();
      if (FALSE_POSITIVE_CONDIMENTS.some(c => ingName.includes(c))) return false;
      return ingName.includes('cơm nguội') || ingName.includes('cơm trắng') || ingName.includes('gạo st');
    });

    if (hasRiceIng) {
      return { matched: true, score: 60, matchedAs: 'Nguyên liệu cơm' };
    }

    return { matched: false, score: 0, matchedAs: '' };
  }

  // Chicken
  if (rawName.includes('gà') || rawName.includes('ga ')) {
    if (titleLower.includes('thịt bò') || titleLower.includes('sườn non') || titleLower.includes('cá basa') || titleLower.includes('cá hồi')) {
      return { matched: false, score: 0, matchedAs: '' };
    }
    if (titleLower.includes('gỏi gà') || titleLower.includes('nộm gà') || titleLower.includes('gà xé')) {
      return { matched: true, score: 150, matchedAs: 'Gỏi gà xé phay' };
    }
    if (titleLower.includes('cháo gà') || titleLower.includes('miến gà') || titleLower.includes('phở gà')) {
      return { matched: true, score: 120, matchedAs: 'Món nước/cháo gà' };
    }
    if (titleLower.includes('gà')) {
      return { matched: true, score: 80, matchedAs: 'Món gà' };
    }
    const hasChickenIng = recipe.ingredients.some(i => i.name.toLowerCase().includes('gà'));
    if (hasChickenIng) {
      return { matched: true, score: 70, matchedAs: 'Thịt gà' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // Braised pork
  if (rawName.includes('kho tàu') || rawName.includes('kho tiêu') || rawName.includes('thịt kho')) {
    if (titleLower.includes('thịt kho') || titleLower.includes('kho tàu') || titleLower.includes('kho tiêu')) {
      return { matched: true, score: 150, matchedAs: 'Thịt kho' };
    }
    if (titleLower.includes('dưa chua') || titleLower.includes('dưa cải')) {
      return { matched: true, score: 70, matchedAs: 'Dưa chua ăn kèm thịt kho' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // Boiled pork
  if ((rawName.includes('luộc') && (rawName.includes('thịt') || rawName.includes('heo') || rawName.includes('ba chỉ'))) || rawName.includes('thịt heo luộc')) {
    if (titleLower.includes('cuốn bánh tráng') || titleLower.includes('thịt luộc')) {
      return { matched: true, score: 150, matchedAs: 'Thịt luộc cuốn bánh tráng' };
    }
    if (titleLower.includes('rang sả ớt') || titleLower.includes('cháy cạnh') || titleLower.includes('rang cháy')) {
      return { matched: true, score: 120, matchedAs: 'Thịt rang cháy cạnh' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // Egg
  if (rawName.includes('trứng') || rawName.includes('trung')) {
    if (titleLower.includes('trứng chiên') || titleLower.includes('trứng cuộn') || titleLower.includes('trứng đúc') || titleLower.includes('trứng ốp')) {
      return { matched: true, score: 140, matchedAs: 'Món trứng' };
    }
    if (titleLower.includes('canh cà chua trứng')) {
      return { matched: true, score: 110, matchedAs: 'Canh trứng mây' };
    }
    if (titleLower.includes('cơm chiên') || titleLower.includes('cơm rang')) {
      return { matched: true, score: 85, matchedAs: 'Cơm rang trứng' };
    }
    if (titleLower.includes('trứng')) {
      return { matched: true, score: 70, matchedAs: 'Món trứng' };
    }
    const hasEggIng = recipe.ingredients.some(i => i.name.toLowerCase().includes('trứng'));
    if (hasEggIng) {
      return { matched: true, score: 60, matchedAs: 'Trứng' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // Tofu
  if (rawName.includes('đậu phụ') || rawName.includes('đậu hũ') || rawName.includes('dau phu') || rawName.includes('dau hu')) {
    if (titleLower.includes('đậu hũ') || titleLower.includes('đậu phụ') || titleLower.includes('đậu rán')) {
      return { matched: true, score: 140, matchedAs: 'Món đậu hũ' };
    }
    const hasTofuIng = recipe.ingredients.some(i => i.name.toLowerCase().includes('đậu hũ') || i.name.toLowerCase().includes('đậu phụ'));
    if (hasTofuIng) {
      return { matched: true, score: 80, matchedAs: 'Đậu phụ' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // Tomato
  if (rawName.includes('cà chua') || rawName.includes('ca chua')) {
    if (titleLower.includes('sốt cà chua') || titleLower.includes('canh cà chua') || titleLower.includes('cà chua')) {
      return { matched: true, score: 140, matchedAs: 'Món cà chua' };
    }
    const hasTomatoIng = recipe.ingredients.some(i => i.name.toLowerCase().includes('cà chua'));
    if (hasTomatoIng) {
      return { matched: true, score: 80, matchedAs: 'Cà chua' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // Cabbage
  if (rawName.includes('bắp cải') || rawName.includes('bap cai') || rawName.includes('cải bắp')) {
    if (titleLower.includes('bắp cải') || titleLower.includes('cải bắp')) {
      return { matched: true, score: 140, matchedAs: 'Món bắp cải' };
    }
    const hasCabbageIng = recipe.ingredients.some(i => i.name.toLowerCase().includes('bắp cải'));
    if (hasCabbageIng) {
      return { matched: true, score: 80, matchedAs: 'Bắp cải' };
    }
    return { matched: false, score: 0, matchedAs: '' };
  }

  // General item matching
  let coreName = rawName;
  FILLER_WORDS.forEach(filler => {
    coreName = coreName.replace(new RegExp(filler, 'gi'), '');
  });
  coreName = coreName.trim();

  if (coreName && titleLower.includes(coreName)) {
    return { matched: true, score: 100, matchedAs: coreName };
  }

  const matchIng = recipe.ingredients.find(ing => {
    const ingLower = ing.name.toLowerCase();
    if (FALSE_POSITIVE_CONDIMENTS.some(c => ingLower.includes(c))) return false;
    return coreName && (ingLower.includes(coreName) || coreName.includes(ingLower));
  });

  if (matchIng) {
    return { matched: true, score: 70, matchedAs: matchIng.name };
  }

  return { matched: false, score: 0, matchedAs: '' };
}

export interface WholeFridgeRecipeResult {
  recipe: Recipe;
  score: number;
  matchedPantryItems: PantryItem[];
  matchedCount: number;
  urgentMatchedCount: number;
  summary: string;
}

/**
 * Multi-ingredient Whole-Fridge Matcher:
 * Recommends recipes that combine the maximum number of items currently in the fridge.
 */
export function findWholeFridgeRecipeSuggestions(
  pantryItems: PantryItem[],
  allRecipes: Recipe[],
  limit = 4,
  offset = 0
): {
  results: WholeFridgeRecipeResult[];
  totalEligible: number;
} {
  if (!pantryItems || pantryItems.length === 0 || !allRecipes || allRecipes.length === 0) {
    return { results: [], totalEligible: 0 };
  }

  // Check if any fridge item is rice
  const hasRiceInFridge = pantryItems.some(item => {
    const n = item.name.toLowerCase();
    return n.includes('cơm') || n.includes('xôi');
  });

  // Check if user also has bread or noodles in fridge
  const hasBreadOrNoodles = pantryItems.some(item => {
    const n = item.name.toLowerCase();
    return n.includes('bánh mì') || n.includes('bún') || n.includes('phở') || n.includes('miến');
  });

  const candidates: WholeFridgeRecipeResult[] = [];

  for (const recipe of allRecipes) {
    const titleLower = recipe.title.toLowerCase();

    // If fridge has rice and NO bread/noodles, avoid carb clash
    if (hasRiceInFridge && !hasBreadOrNoodles) {
      if (RICE_INCOMPATIBLE_TERMS.some(t => titleLower.includes(t))) {
        continue;
      }
    }

    const matchedPantryItems: PantryItem[] = [];
    let totalScore = 0;
    let urgentCount = 0;

    for (const item of pantryItems) {
      const match = matchRecipeWithPantryItem(recipe, item);
      if (match.matched) {
        matchedPantryItems.push(item);
        totalScore += match.score;
        if (item.daysLeft <= 2) {
          urgentCount++;
          totalScore += 50; // Urgency boost
        }
        if (item.isLeftover) {
          totalScore += 40; // Leftover repurposing boost
        }
      }
    }

    if (matchedPantryItems.length > 0) {
      // Synergy bonuses for using multiple fridge items at once
      if (matchedPantryItems.length >= 2) totalScore += 120;
      if (matchedPantryItems.length >= 3) totalScore += 250;

      const itemNames = matchedPantryItems.map(i => i.name).slice(0, 3).join(', ');
      const summary = `Có sẵn ${matchedPantryItems.length} món trong tủ: ${itemNames}${matchedPantryItems.length > 3 ? '...' : ''}`;

      candidates.push({
        recipe,
        score: totalScore,
        matchedPantryItems,
        matchedCount: matchedPantryItems.length,
        urgentMatchedCount: urgentCount,
        summary
      });
    }
  }

  // Sort descending by matchedCount, then by score
  candidates.sort((a, b) => {
    if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount;
    return b.score - a.score;
  });

  const totalEligible = candidates.length;
  if (totalEligible === 0) return { results: [], totalEligible: 0 };

  const start = offset % totalEligible;
  const results: WholeFridgeRecipeResult[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < totalEligible && results.length < limit; i++) {
    const candidate = candidates[(start + i) % totalEligible];
    if (!seenIds.has(candidate.recipe.id)) {
      seenIds.add(candidate.recipe.id);
      results.push(candidate);
    }
  }

  return { results, totalEligible };
}

/**
 * Single-Item Matcher with Reload & Synergy support:
 * Recommends recipes for a specific item, prioritizing synergy with other fridge items.
 */
export function findLeftoverRecipeSuggestions(
  item: PantryItem,
  allRecipes: Recipe[],
  limit = 4,
  offset = 0,
  allPantryItems: PantryItem[] = []
): Recipe[] {
  if (!item || !item.name) return [];

  const candidates: { recipe: Recipe; score: number }[] = [];

  for (const recipe of allRecipes) {
    const match = matchRecipeWithPantryItem(recipe, item);
    if (match.matched) {
      let score = match.score;

      // Synergy: check if other items in fridge can also be used in this recipe
      for (const otherItem of allPantryItems) {
        if (otherItem.id !== item.id) {
          const otherMatch = matchRecipeWithPantryItem(recipe, otherItem);
          if (otherMatch.matched) {
            score += 50; // Synergy bonus
          }
        }
      }

      candidates.push({ recipe, score });
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  const total = candidates.length;
  if (total === 0) return [];

  const start = offset % total;
  const results: Recipe[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < total && results.length < limit; i++) {
    const c = candidates[(start + i) % total];
    if (!seenIds.has(c.recipe.id)) {
      seenIds.add(c.recipe.id);
      results.push(c.recipe);
    }
  }

  return results;
}
