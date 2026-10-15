import { Recipe, VietnameseMealSet } from '../types';

/**
 * Accurately estimates protein (in grams) for a recipe based on its ingredients,
 * categorised meats/poultry/seafood/eggs/tofu, and nutritional density heuristics.
 */
export function estimateRecipeProtein(recipe: Recipe): number {
  if (!recipe) return 0;

  // 1. Calculate from concrete ingredients if available
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    let proteinGrams = 0;
    let hasProteinIngredients = false;

    for (const ing of recipe.ingredients) {
      const name = (ing.name || '').toLowerCase();
      const unit = (ing.unit || '').toLowerCase();
      const rawAmt = typeof ing.amount === 'number' ? ing.amount : parseFloat(String(ing.amount)) || 1;

      const isProteinCategory = ing.category === 'thit-ca' ||
        /thịt|bò|heo|lợn|gà|vịt|cá|tôm|mực|ngao|nghêu|cua|hải sản|trứng|đậu hũ|đậu phụ|chả|xúc xích|jambon|dăm bông|bít tết|steak|lươn|ếch|sườn/i.test(name);

      if (isProteinCategory) {
        hasProteinIngredients = true;
        if (/trứng/i.test(name) || unit.includes('quả') || unit.includes('trứng')) {
          proteinGrams += rawAmt * 6.5; // ~6.5g protein per whole egg
        } else if (/đậu hũ|đậu phụ/i.test(name)) {
          const gMatch = unit.match(/(\d+)\s*g/i);
          let grams = gMatch ? parseFloat(gMatch[1]) : (unit.includes('kg') ? rawAmt * 1000 : rawAmt);
          if (grams <= 10 && unit.includes('miếng')) grams = rawAmt * 125; // 1 piece of tofu is ~125g
          proteinGrams += (grams / 100) * 8.5; // ~8.5g protein per 100g tofu
        } else {
          // Lean beef, pork, poultry, fish, seafood
          const gMatch = unit.match(/(\d+)\s*g/i);
          let grams = gMatch ? parseFloat(gMatch[1]) : (unit.includes('kg') ? rawAmt * 1000 : rawAmt);
          if (grams <= 10 && (unit.includes('con') || unit.includes('miếng') || unit.includes('khúc') || unit.includes('lát'))) {
            grams = rawAmt * 150; // default 150g per fish/meat portion
          }
          proteinGrams += (grams / 100) * 22.0; // ~22g protein per 100g raw meat/fish
        }
      }
    }

    if (hasProteinIngredients && proteinGrams > 0) {
      return Math.round(proteinGrams);
    }
  }

  // 2. Calibrated heuristic based on calories and dish profile
  const titleAndTags = `${recipe.title} ${(recipe.tags || []).join(' ')}`.toLowerCase();
  const cals = recipe.calories || 450;

  if (/bít tết|steak|thịt bò|ức gà|cá hồi|sườn nướng|bbq|giàu đạm|tập gym|protein|xúc xích/i.test(titleAndTags)) {
    return Math.round(cals * 0.08); // ~80g protein per 1000 kcal for high-protein meals
  }
  if (/thịt|gà|cá|tôm|mực|hải sản|thịt kho|rang cháy cạnh|sườn|phở bò|bún bò/i.test(titleAndTags)) {
    return Math.round(cals * 0.065); // ~65g protein per 1000 kcal for standard meat/fish dishes
  }
  if (/đậu hũ|đậu phụ|trứng|chay/i.test(titleAndTags)) {
    return Math.round(cals * 0.05); // ~50g protein per 1000 kcal for plant/egg dishes
  }
  return Math.round(cals * 0.04);
}

/**
 * Estimates total protein for a Vietnamese 3-dish meal set
 */
export function estimateMealSetProtein(set: VietnameseMealSet): number {
  if (!set) return 0;

  const mainP = set.mainDish ? estimateRecipeProtein(set.mainDish) : 0;
  const soupP = set.soupDish ? estimateRecipeProtein(set.soupDish) : 0;
  const sideP = set.sideDish ? estimateRecipeProtein(set.sideDish) : 0;
  const total = mainP + soupP + sideP;

  if (total > 0) return total;
  return Math.round((set.totalCalories || 700) * 0.065);
}

/**
 * Calculates protein target for gym/bulking according to household servings and active meals cooked
 * (e.g. 2 home-cooked meals vs 3 full meals).
 */
export function calculateGymProteinTarget(servings: number, activeMealCount: number): number {
  const safeServings = Math.max(1, Math.round(servings));
  const perPersonTarget = activeMealCount >= 3 ? 70 : activeMealCount === 2 ? 50 : 25;
  return Math.round(safeServings * perPersonTarget);
}
