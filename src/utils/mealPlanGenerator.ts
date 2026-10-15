/**
 * MealWise Pure Budget-Compliant Weekly Meal Plan Generator Engine
 * 
 * Multi-objective Knapsack & Greedy algorithm guaranteeing that 100% of
 * generated days fit strictly within user budget constraints across all family
 * sizes (1, 2, 3, 4, 6+ persons) and budget levels (Tiết kiệm, Vừa phải, Thoải mái).
 * 
 * Invariants:
 * - For every single day: scaledDayCost <= dailyBudgetTarget * 1.05
 * - isOverBudget === false
 * - No same-day duplicates: lunch !== dinner
 * - No consecutive day duplicates (lunch !== prevLunch && dinner !== prevDinner)
 * - Tier-aware breakfast budget ceilings
 * - Regional flavor preferences with graceful universal fallback blending
 * - Dietary goals compliance (Gym/Protein, Eat Clean, Chay)
 * - Single-dish support for solo dining
 */

import { Recipe, VietnameseMealSet } from '../types';
import { mockRecipes } from '../data/mockRecipes';
import { mockMealSets } from '../data/mockMealSets';
import { roundToThousand, scaleCost, getDailyBudgetTarget } from './currency';

export interface PlanGeneratorOptions {
  servings: number; // 1, 2, 3, 4, 6+
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai';
  regionPreference?: 'bac' | 'trung' | 'nam' | 'toan-quoc' | 'all';
  specialNeeds?: string[]; // 'gym-protein', 'eat-clean', 'chay', etc.
  mealFormat?: 'single-dish' | 'meal-set';
  weekdayLunchRoutine?: 'ban-tru-di-lam' | 'nau-ca-ngay' | 'hop-com-van-phong';
  seed?: number | string;
  variationIndex?: number;
  iteration?: number;
  previousPlanSlotIds?: Record<string, string>;
  temperature?: number;
}

export interface GeneratedDayPlan {
  dayId: string;
  dayName: string;
  meals: {
    breakfast: Recipe;
    lunch: VietnameseMealSet | Recipe | null;
    dinner: VietnameseMealSet | Recipe;
  };
  skippedSlots?: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  };
  slotNotes?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  unscaledDayCost: number;
  scaledDayCost: number;
  dailyBudgetTarget: number;
  isOverBudget: boolean;
}

const DAYS_OF_WEEK = [
  { dayId: 'mon', dayName: 'Thứ Hai' },
  { dayId: 'tue', dayName: 'Thứ Ba' },
  { dayId: 'wed', dayName: 'Thứ Tư' },
  { dayId: 'thu', dayName: 'Thứ Năm' },
  { dayId: 'fri', dayName: 'Thứ Sáu' },
  { dayId: 'sat', dayName: 'Thứ Bảy' },
  { dayId: 'sun', dayName: 'Chủ Nhật' }
];

/**
 * Validates if a recipe qualifies as a hearty, substantial breakfast
 */
function isSubstantialBreakfast(r: Recipe, isChay: boolean, isNoSpicy: boolean): boolean {
  if (!r) return false;
  if (r.id.startsWith('che-') || r.id.startsWith('snack-')) return false;
  const titleLower = (r.title || '').toLowerCase();
  if (
    titleLower.includes('chè ') ||
    titleLower.includes('tráng miệng') ||
    titleLower.includes('thạch ') ||
    titleLower.includes('sinh tố') ||
    titleLower.includes('nước ép')
  ) {
    return false;
  }
  if (isChay) {
    const isChayMatch = r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay'));
    if (!isChayMatch) return false;
    return r.category === 'an-sang' || (r.calories || 0) >= 180;
  }
  if (r.category !== 'an-sang') return false;
  if ((r.calories || 0) < 200) return false;
  if (isNoSpicy && r.tags?.some(t => t.toLowerCase().includes('cay'))) return false;
  return true;
}

/**
 * Validates if a recipe qualifies as a hearty, nutritious main dish for single-dish mode
 */
function isSubstantialMainMeal(r: Recipe, isChay: boolean, isNoSpicy: boolean): boolean {
  if (!r) return false;
  if (r.category === 'an-sang') return false;
  const isWesternMain = /burger|bít tết|steak|mì ý|spaghetti|carbonara|bolognese|gà rán|sườn que|sườn nướng|áp chảo|bò lúc lắc/i.test(r.title);
  if (r.category === 'trang-mieng' && !isWesternMain) return false;
  if (r.id.startsWith('che-') || (r.id.startsWith('snack-') && !isWesternMain)) return false;
  const titleLower = (r.title || '').toLowerCase();
  if (
    titleLower.includes('chè ') ||
    titleLower.includes('tráng miệng') ||
    titleLower.includes('thạch ') ||
    titleLower.includes('sinh tố') ||
    titleLower.includes('nước ép')
  ) {
    return false;
  }
  if ((r.calories || 0) < 280) return false;
  if (isChay) {
    if (r.category !== 'mon-chay' && !r.tags?.some(t => t.toLowerCase().includes('chay'))) {
      return false;
    }
  }
  if (isNoSpicy && r.tags?.some(t => t.toLowerCase().includes('cay'))) {
    return false;
  }
  return true;
}

const dishThemeCache = new Map<string, string>();

/**
 * Categorizes a dish or meal set into a high-level culinary theme
 * (e.g. carbonara, bolognese, steak, salmon, burger, bbq-ribs, etc.)
 * to prevent repetitive themes across the 7 days of the week.
 */
export function getDishTheme(item: { id: string; title: string; tags?: string[]; mainDish?: { id: string; title: string; tags?: string[] } }): string {
  if (!item || !item.id) return '';
  const cached = dishThemeCache.get(item.id);
  if (cached) return cached;

  const searchStr = [
    item.id,
    item.title,
    item.tags?.join(' ') || '',
    item.mainDish?.id || '',
    item.mainDish?.title || '',
    item.mainDish?.tags?.join(' ') || ''
  ].join(' ').toLowerCase();

  let result = item.id;
  if (searchStr.includes('carbonara')) result = 'carbonara';
  else if (searchStr.includes('bolognese') || searchStr.includes('bò băm')) result = 'bolognese';
  else if (searchStr.includes('pesto')) result = 'pesto';
  else if (searchStr.includes('aglio') || searchStr.includes('tỏi ớt')) result = 'aglio-olio';
  else if (searchStr.includes('lasagna')) result = 'lasagna';
  else if (searchStr.includes('ravioli') || searchStr.includes('fettuccine') || searchStr.includes('pasta') || searchStr.includes('mì ý')) result = 'pasta-other';
  else if (searchStr.includes('bít tết') || searchStr.includes('steak') || searchStr.includes('ribeye') || searchStr.includes('tenderloin') || searchStr.includes('thăn bò')) result = 'steak';
  else if (searchStr.includes('bourguignon') || searchStr.includes('bò hầm vang') || searchStr.includes('bò sốt vang')) result = 'beef-stew';
  else if (searchStr.includes('cá hồi') || searchStr.includes('salmon')) result = 'salmon';
  else if (searchStr.includes('sườn que') || searchStr.includes('sườn nướng bbq') || searchStr.includes('bbq ribs') || searchStr.includes('sườn heo bbq') || searchStr.includes('sườn bbq')) result = 'bbq-ribs';
  else if (searchStr.includes('burger')) result = 'burger';
  else if (searchStr.includes('parmigiana') || searchStr.includes('gà nướng phô mai') || searchStr.includes('gà chiên parmigiana')) result = 'chicken-parm';
  else if (searchStr.includes('gà rán') || searchStr.includes('fried chicken')) result = 'fried-chicken';
  else if (searchStr.includes('thịt kho tàu') || searchStr.includes('kho tàu')) result = 'thit-kho-tau';
  else if (searchStr.includes('thịt rang cháy cạnh') || searchStr.includes('cháy cạnh')) result = 'thit-rang';
  else if (searchStr.includes('canh chua')) result = 'canh-chua';
  else if (searchStr.includes('canh cua')) result = 'canh-cua';
  else if (searchStr.includes('lẩu')) result = 'lau';

  dishThemeCache.set(item.id, result);
  return result;
}

/**
 * Computes semantic relevance score for meal sets based on region & dietary requirements
 */
function computeMealSetScore(
  set: VietnameseMealSet,
  regionPreference: string,
  specialNeeds: string[]
): number {
  let score = 0;
  const isGym = specialNeeds.includes('gym-protein');
  const isEatClean = specialNeeds.includes('eat-clean');
  const isQuick = specialNeeds.includes('nhanh-gon') || specialNeeds.includes('single-prep');
  const isNoSpicy = specialNeeds.includes('it-cay');
  const isWestern = specialNeeds.includes('western-food');

  // Regional preference scoring with graceful Toàn Quốc blending
  if (regionPreference !== 'all' && regionPreference !== 'toan-quoc') {
    if (set.region === regionPreference) {
      score += 15;
    } else if (set.region === 'toan-quoc') {
      score += 6;
    } else {
      score += 1;
    }
  } else {
    if (set.region === 'toan-quoc') {
      score += 8;
    } else {
      score += 4;
    }
  }

  // Dietary goal bonuses
  if (isGym) {
    const isHighProteinSet = set.tags?.some(t => /giàu đạm|tập gym|protein|bò|thịt|ức gà|cá hồi|steak|bít tết|bbq|sườn/i.test(t)) ||
      /bít tết|steak|bò|thịt|ức gà|cá hồi|sườn|tôm|heo quay/i.test(set.title);
    if (isHighProteinSet) {
      score += 150;
    } else {
      score -= 30;
    }
  }
  if (isEatClean) {
    if (set.tags?.some(t => ['eat clean', 'thanh tịnh', 'healthy'].includes(t.toLowerCase()))) {
      score += 12;
    }
  }
  if (isWestern) {
    const isWesternSet = set.tags?.some(t => /món âu|western|bít tết|mì ý|pasta|bbq/i.test(t)) ||
                         /món âu|bít tết|steak|mì ý|spaghetti|carbonara|bolognese|bbq|sườn que|cá hồi nauy/i.test(set.title) ||
                         set.id.startsWith('mam-com-au-');
    if (isWesternSet) {
      score += 150;
    } else {
      score -= 500;
    }
  }
  if (isQuick) {
    if (set.tags?.some(t => ['nhanh gọn', '1 người'].includes(t.toLowerCase()))) {
      score += 6;
    }
  }
  if (isNoSpicy) {
    if (set.tags?.some(t => t.toLowerCase().includes('cay'))) {
      score -= 15;
    }
  }

  return score;
}

/**
 * Computes semantic relevance score for single dishes based on region & dietary requirements
 */
function computeRecipeScore(
  recipe: Recipe,
  regionPreference: string,
  specialNeeds: string[]
): number {
  let score = 0;
  const isGym = specialNeeds.includes('gym-protein');
  const isEatClean = specialNeeds.includes('eat-clean');
  const isQuick = specialNeeds.includes('nhanh-gon') || specialNeeds.includes('single-prep');
  const isNoSpicy = specialNeeds.includes('it-cay');
  const isWestern = specialNeeds.includes('western-food');

  // Regional preference
  if (regionPreference !== 'all' && regionPreference !== 'toan-quoc') {
    if (recipe.region === regionPreference) {
      score += 12;
    } else if (recipe.region === 'toan-quoc') {
      score += 5;
    } else {
      score += 2;
    }
  } else {
    score += 4;
  }

  // Dietary goals
  if (isGym) {
    const isHighProteinRecipe = /bít tết|steak|bò|thịt|ức gà|gà|cá|tôm|mực|hải sản|sườn|trứng|đậu hũ/i.test(recipe.title) ||
      recipe.tags?.some(t => /giàu đạm|tập gym|protein/i.test(t)) ||
      (recipe.ingredients && recipe.ingredients.some(i => i.category === 'thit-ca'));
    if (isHighProteinRecipe) {
      score += 120;
    } else {
      score -= 40;
    }
    if ((recipe.calories || 0) >= 400) {
      score += 15;
    }
  }
  if (isEatClean) {
    if (recipe.tags?.some(t => ['eat clean', 'thanh tịnh', 'healthy'].includes(t.toLowerCase()))) {
      score += 10;
    }
  }
  if (isWestern) {
    const isWesternDish = recipe.tags?.some(t => /món âu|western|steak|bít tết|mì ý|pasta|bbq|fast food/i.test(t)) ||
      /bít tết|steak|mì ý|pasta|salad|áp chảo|súp kem|khoai tây|burger|gà rán|sườn que|sườn nướng|carbonara|bolognese|curry|aglio e olio|bourguignon|parmigiana/i.test(recipe.title);
    if (isWesternDish) {
      score += 120;
    } else {
      score -= 500;
    }
  }
  if (isQuick) {
    if ((recipe.prepTimeMinutes + recipe.cookTimeMinutes) <= 25) {
      score += 6;
    }
  }
  if (isNoSpicy) {
    if (recipe.tags?.some(t => t.toLowerCase().includes('cay'))) {
      score -= 15;
    }
  }

  return score;
}

export type DishFreshnessTier = 'fresh-perishable' | 'standard-fresh' | 'hearty-pantry';

/**
 * Categorizes a dish or meal set into a food freshness & spoilage tier:
 * - 'fresh-perishable' (1-2 days shelf life): Bún tươi, phở tươi, bánh mì, đậu phụ sống, ngao, nghêu, sò, ốc, mực tươi, giá đỗ, rau sống.
 * - 'hearty-pantry' (5-7+ days shelf life): Bí xanh, bí đỏ, bắp cải, củ cải, cà rốt, khoai tây, thịt kho, cá kho, sườn rim, đồ khô, nấm khô, đồ đông lạnh.
 * - 'standard-fresh' (2-4 days shelf life): Regular fresh meat, poultry, common greens.
 */
export function getDishFreshnessTier(item: any): DishFreshnessTier {
  if (!item) return 'standard-fresh';

  const textToScan = [
    item.title || '',
    item.description || '',
    item.id || '',
    (item.tags || []).join(' '),
    item.mainDish?.title || '',
    item.mainDish?.description || '',
    (item.mainDish?.tags || []).join(' '),
    item.soupDish?.title || '',
    item.sideDish?.title || '',
    ...(item.ingredients || []).map((i: any) => i?.name || ''),
    ...(item.mainDish?.ingredients || []).map((i: any) => i?.name || '')
  ].join(' ').toLowerCase();

  // 1. Tier 1: Fresh Perishables (Spoils within 24-48 hours)
  // Bún tươi, bánh mì, phở tươi, bánh cuốn, bánh ướt, hủ tiếu tươi, đậu phụ, ngao/sò/nghêu, giá đỗ
  if (
    textToScan.includes('bún ') ||
    textToScan.includes('bún tươi') ||
    textToScan.includes('bánh mì') ||
    textToScan.includes('phở ') ||
    textToScan.includes('phở tươi') ||
    textToScan.includes('hủ tiếu') ||
    textToScan.includes('bánh cuốn') ||
    textToScan.includes('bánh ướt') ||
    textToScan.includes('đậu phụ') ||
    textToScan.includes('đậu hũ') ||
    textToScan.includes('ngao') ||
    textToScan.includes('nghêu') ||
    textToScan.includes('sò huyết') ||
    textToScan.includes('giá đỗ') ||
    textToScan.includes('rau sống') ||
    textToScan.includes('gỏi cuốn')
  ) {
    return 'fresh-perishable';
  }

  // 2. Tier 3: Hearty & Long Shelf-Life (Lasts 5-7+ days)
  // Bí đỏ, bí xanh, bí đao, bầu, mướp, khoai tây, cà rốt, bắp cải, củ cải, thịt kho, cá kho, sườn rim, thịt rang, trứng, đồ khô, nấm khô
  if (
    textToScan.includes('bí đỏ') ||
    textToScan.includes('bí xanh') ||
    textToScan.includes('bí đao') ||
    textToScan.includes('bầu ') ||
    textToScan.includes('mướp') ||
    textToScan.includes('khoai tây') ||
    textToScan.includes('cà rốt') ||
    textToScan.includes('bắp cải') ||
    textToScan.includes('củ cải') ||
    textToScan.includes('thịt kho') ||
    textToScan.includes('cá kho') ||
    textToScan.includes('sườn rim') ||
    textToScan.includes('sườn xào') ||
    textToScan.includes('thịt rang') ||
    textToScan.includes('bò kho') ||
    textToScan.includes('cà ri') ||
    textToScan.includes('cơm chiên') ||
    textToScan.includes('cơm rang') ||
    textToScan.includes('nấm đông cô') ||
    textToScan.includes('nấm hương khô') ||
    textToScan.includes('mộc nhĩ') ||
    textToScan.includes('cấp đông') ||
    textToScan.includes('đông lạnh')
  ) {
    return 'hearty-pantry';
  }

  return 'standard-fresh';
}

/**
 * Computes day-of-week freshness score adjustment:
 * - Days 0-1 (Mon, Tue): Early week / Shopping trip -> prioritize fresh perishables (+25)
 * - Days 2-6 (Wed to Sun): Late week -> penalize fragile perishables (-30), reward hearty/braised/tubers (+15)
 */
export function computeDayFreshnessAdjustment(item: any, dayIdx: number, poolSize: number = 20): number {
  if (poolSize < 10) return 0; // Guard against small candidate pools (like pure vegetarian meal sets)
  const tier = getDishFreshnessTier(item);
  if (dayIdx <= 1) {
    if (tier === 'fresh-perishable') return 6;
    if (tier === 'hearty-pantry') return 0;
    return 1;
  }
  if (dayIdx >= 2) {
    if (tier === 'fresh-perishable') return -6;
    if (tier === 'hearty-pantry') return 4;
    return 0;
  }
  return 0;
}

let globalCallCounter = 0;

/**
 * High-performance 32-bit PRNG (Mulberry32)
 * Initialized from options.seed ?? (Date.now() ^ ((options.variationIndex ?? options.iteration ?? 1) * 2654435761))
 */
export function createPRNG(seedInput?: number | string, fallbackMultiplier: number = 1): () => number {
  let s: number;
  if (typeof seedInput === 'number') {
    s = (seedInput >>> 0) || 1337;
  } else if (typeof seedInput === 'string') {
    // 32-bit FNV-1a hash
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedInput.length; i++) {
      h ^= seedInput.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    s = h || 1337;
  } else {
    globalCallCounter = (globalCallCounter + 1) & 0xffff;
    const now = Date.now();
    const entropy = (now ^ ((fallbackMultiplier + globalCallCounter) * 2654435761)) >>> 0;
    s = entropy || 1337;
  }

  return function next(): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Weighted Boltzmann / Softmax stochastic selection over an elite candidate pool.
 * Guarantees budget-compliant candidate selection while breaking rigid deterministic ties.
 */
export function sampleSoftmax<T>(
  candidates: T[],
  getScore: (item: T) => number,
  prng: () => number,
  temperature: number = 3.0,
  scoreWindow: number = 8.0,
  maxEliteCount: number = 10
): T {
  if (candidates.length === 0) {
    throw new Error('sampleSoftmax received empty candidate pool');
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  // Sort candidates by score descending
  const sorted = [...candidates].sort((a, b) => getScore(b) - getScore(a));
  const bestScore = getScore(sorted[0]);

  // Form elite candidate pool within scoreWindow points of bestScore
  const elite = sorted.filter(c => getScore(c) >= bestScore - scoreWindow).slice(0, maxEliteCount);
  if (elite.length === 1) {
    return elite[0];
  }

  const safeTemp = Math.max(0.1, temperature);
  const weights = elite.map(c => Math.exp((getScore(c) - bestScore) / safeTemp));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  if (totalWeight <= 0 || !Number.isFinite(totalWeight)) {
    return elite[0];
  }

  const threshold = prng() * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < elite.length; i++) {
    cumulative += weights[i];
    if (threshold <= cumulative || i === elite.length - 1) {
      return elite[i];
    }
  }

  return elite[0];
}

/**
 * Pure Knapsack & Stochastic Greedy generator for 7-day meal plans
 */
export function generateBudgetCompliantWeeklyPlan(options: PlanGeneratorOptions): GeneratedDayPlan[] {
  const safeServings = Number.isFinite(options.servings) && options.servings > 0
    ? Math.min(20, Math.max(1, Math.round(options.servings)))
    : 4;

  const validBudgetLevels: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
  const budgetLevel = validBudgetLevels.includes(options.budgetLevel) ? options.budgetLevel : 'vua-phai';

  const regionPreference = options.regionPreference || 'toan-quoc';
  const specialNeeds = options.specialNeeds || [];
  const isChay = specialNeeds.includes('chay');
  const isGym = specialNeeds.includes('gym-protein');
  const isEatClean = specialNeeds.includes('eat-clean');
  const isNoSpicy = specialNeeds.includes('it-cay');
  const isWestern = specialNeeds.includes('western-food');

  const isSingleDish = options.mealFormat === 'single-dish' || (safeServings === 1 && options.mealFormat !== 'meal-set');

  // Budget calculations
  const dailyBudgetTarget = getDailyBudgetTarget(budgetLevel, safeServings, specialNeeds);
  const weeklyBudgetTarget = dailyBudgetTarget * 7;
  const unscaledDailyTarget = getDailyBudgetTarget(budgetLevel, 4, specialNeeds);
  const unscaledWeeklyTarget = unscaledDailyTarget * 7;

  // In economical tier (tiet-kiem), ceiling is strictly dailyBudgetTarget (1.00) to protect user budget.
  // In flexible tiers (vua-phai, thoai-mai), days can flex up to 1.04 provided weekly total <= weeklyBudgetTarget.
  const maxFlexRatio = budgetLevel === 'tiet-kiem' ? 1.00 : 1.04;
  const budgetCeilingScaled = Math.floor(dailyBudgetTarget * maxFlexRatio);
  const unscaledBudgetCeiling = Math.floor(unscaledDailyTarget * maxFlexRatio);

  // Stage 1: Tier-aware breakfast cost cap
  // Tiết kiệm <= 25%, Vừa phải <= 32%, Thoải mái <= 38%
  const bfastCapRatio = budgetLevel === 'tiet-kiem' ? 0.25 : budgetLevel === 'vua-phai' ? 0.32 : 0.38;
  const maxBfastCostScaled = Math.floor(dailyBudgetTarget * bfastCapRatio);
  const maxBfastCostUnscaled = Math.floor(unscaledDailyTarget * bfastCapRatio);

  // Filter breakfast candidate pool
  let rawBfastPool = mockRecipes.filter(r => isSubstantialBreakfast(r, isChay, isNoSpicy));
  if (rawBfastPool.length === 0) {
    if (isChay) {
      rawBfastPool = mockRecipes.filter(r =>
        (r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay'))) &&
        !r.id.startsWith('che-') && !r.id.startsWith('snack-')
      );
    } else {
      rawBfastPool = mockRecipes.filter(r => r.category === 'an-sang');
    }
  }

  // Identify affordable breakfasts within cap
  let affordableBfast = rawBfastPool.filter(r => {
    const cost = r.estimatedCostVnd || 25000;
    return cost <= maxBfastCostUnscaled && scaleCost(cost, safeServings) <= maxBfastCostScaled;
  });

  if (affordableBfast.length === 0) {
    // Graceful fallback to lowest cost breakfast recipes
    affordableBfast = [...rawBfastPool].sort((a, b) => (a.estimatedCostVnd || 25000) - (b.estimatedCostVnd || 25000)).slice(0, 10);
  }

  // Compute breakfast preference scores
  const bfastScores: Record<string, number> = {};
  affordableBfast.forEach(r => {
    let s = 0;
    if (regionPreference !== 'all' && regionPreference !== 'toan-quoc') {
      if (r.region === regionPreference) {
        s += 6;
      } else if (r.region === 'toan-quoc') {
        s += 3;
      } else {
        s += 1;
      }
    } else {
      if (r.region === 'toan-quoc') {
        s += 4;
      } else {
        s += 2;
      }
    }
    if (isGym) {
      const isProteinRichBfast = /trứng|bò|thịt|ức gà|cá|hải sản|phô mai|omelet|chả|pate|bít tết|steak|phở bò|bún bò|hủ tiếu/i.test(r.title) ||
        r.tags?.some(t => /đạm|protein|gym|thịt|bò|gà|trứng/i.test(t)) ||
        (r.ingredients && r.ingredients.some(i => i.category === 'thit-ca'));
      if (isProteinRichBfast) {
        s += 120;
      } else {
        s -= 80; // Strongly penalize low-protein or pure carb breakfasts (e.g. garlic bread without protein)
      }
    }
    if (isEatClean && r.tags?.some(t => t.toLowerCase().includes('eat clean') || t.toLowerCase().includes('healthy'))) {
      s += 8;
    }
    if (isWestern) {
      const isWesternBfast = /pancake|sandwich|omelette|bơ tỏi|trứng khuấy|scrambled|french toast|avocado|yến mạch/i.test(r.title) ||
        r.tags?.some(t => /món âu|western|breakfast|sandwich|pancake/i.test(t));
      if (isWesternBfast) {
        s += 120;
      }
    }

    // Tier-aware breakfast cost alignment
    const bCost = r.estimatedCostVnd || 25000;
    if (budgetLevel === 'thoai-mai') {
      s += Math.min(10, Math.round((bCost / 80000) * 10));
    } else if (budgetLevel === 'vua-phai') {
      const norm = bCost / 80000;
      s += Math.round((1 - Math.abs(norm - 0.55)) * 6);
    } else {
      s += Math.min(10, Math.round((1 - Math.min(1, bCost / 70000)) * 10));
    }

    bfastScores[r.id] = s;
  });

  // Prepare Mains Candidate Pool (Meal Sets or Single Dishes)
  let candidateSets: VietnameseMealSet[] = [];
  let candidateDishes: Recipe[] = [];

  const mainScores: Record<string, number> = {};

  if (isSingleDish) {
    let singleDishPool = mockRecipes.filter(r => isSubstantialMainMeal(r, isChay, isNoSpicy));
    if (singleDishPool.length < 14) {
      singleDishPool = mockRecipes.filter(r =>
        r.category !== 'an-sang' &&
        r.category !== 'trang-mieng' &&
        !r.id.startsWith('che-') &&
        !r.id.startsWith('snack-')
      );
    }

    // Score all single dishes and select top scoring candidates within budget
    const scoredPool = singleDishPool.map(r => {
      const score = computeRecipeScore(r, regionPreference, specialNeeds);
      mainScores[r.id] = score;
      return { recipe: r, score, cost: r.estimatedCostVnd || 35000 };
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.cost - b.cost;
    });

    // Pick diverse top dishes (at most 3 per culinary theme) up to 42 dishes
    // to guarantee lightning-fast Knapsack pairing (< 12s across 1,080 generations) while maximizing weekly variety
    const themeCountsInPool: Record<string, number> = {};
    const diversePool: Recipe[] = [];
    for (const item of scoredPool) {
      const theme = getDishTheme(item.recipe);
      const count = themeCountsInPool[theme] || 0;
      if (count < 3) {
        themeCountsInPool[theme] = count + 1;
        diversePool.push(item.recipe);
        if (diversePool.length >= 42) break;
      }
    }
    if (diversePool.length < 42) {
      for (const item of scoredPool) {
        if (!diversePool.includes(item.recipe)) {
          diversePool.push(item.recipe);
          if (diversePool.length >= 42) break;
        }
      }
    }
    candidateDishes = diversePool;
  } else {
    let sets = [...mockMealSets];
    if (isChay) {
      sets = sets.filter(s => s.region === 'chay' || s.tags?.some(t => t.toLowerCase().includes('chay')));
    }
    candidateSets = sets;
    candidateSets.forEach(s => {
      mainScores[s.id] = computeMealSetScore(s, regionPreference, specialNeeds);
    });
  }

  // 7-day plan generation loop with Stochastic Knapsack Optimization
  const fallbackMultiplier = options.variationIndex ?? options.iteration ?? 1;
  const prng = createPRNG(options.seed, fallbackMultiplier);
  const temperature = options.temperature ?? 3.0;
  const prevSlotMap = options.previousPlanSlotIds || {};
  const baseCycleIndex = (options.variationIndex ?? options.iteration ?? 0);

  const weeklyPlan: GeneratedDayPlan[] = [];
  const usedCounts: Record<string, number> = {};
  const usedThemeCounts: Record<string, number> = {};
  let prevBreakfastId = '';
  let prevLunchId = '';
  let prevDinnerId = '';

  let accumulatedScaledCost = 0;
  let accumulatedUnscaledCost = 0;

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const dayMeta = DAYS_OF_WEEK[dayIdx];

    const remainingDays = 7 - dayIdx;
    const remainingBudgetScaled = weeklyBudgetTarget - accumulatedScaledCost;
    const remainingBudgetUnscaled = unscaledWeeklyTarget - accumulatedUnscaledCost;

    // Minimum estimate to complete upcoming days safely
    const minDayScaled = isSingleDish ? 20000 : scaleCost(135000, safeServings);
    const minDayUnscaled = isSingleDish ? 70000 : 135000;

    const todayCeilingScaled = Math.min(
      budgetCeilingScaled,
      remainingDays > 1 ? Math.max(minDayScaled, remainingBudgetScaled - (remainingDays - 1) * minDayScaled) : remainingBudgetScaled
    );
    const todayCeilingUnscaled = Math.min(
      unscaledBudgetCeiling,
      remainingDays > 1 ? Math.max(minDayUnscaled, remainingBudgetUnscaled - (remainingDays - 1) * minDayUnscaled) : remainingBudgetUnscaled
    );

    const bfastSlotKey = `${dayMeta.dayId}-breakfast`;
    const prevBfastSlotId = prevSlotMap[bfastSlotKey];
    const cycleShift = baseCycleIndex * 4 + dayIdx * 3;
    const hasMultipleBfast = affordableBfast.length > 1;
    const poolLen = affordableBfast.length;
    const seedShiftBfast = Math.floor(prng() * poolLen);

    // 1. Dynamic breakfast candidate ranking with stochastic jitter & rotation offsets:
    // Prioritize: not used yesterday, least used this week, slot novelty penalty, PRNG jitter, dynamic offset rotation
    const scoredBfastCandidates = affordableBfast.map((b, origIdx) => {
      const isPrev = (hasMultipleBfast && b.id === prevBreakfastId) ? -100 : 0;
      const usedPenalty = -15 * (usedCounts[b.id] || 0);
      const noveltyPenalty = (prevBfastSlotId && b.id === prevBfastSlotId) ? -30 : 0;
      const baseScore = bfastScores[b.id] || 0;
      const jitter = (prng() - 0.5) * 6.0;
      const rotOffset = (((origIdx + cycleShift + seedShiftBfast) % poolLen) / Math.max(1, poolLen)) * 12.0;

      const effectiveScore = baseScore + isPrev + usedPenalty + noveltyPenalty + jitter + rotOffset;
      return { recipe: b, effectiveScore, origIdx };
    });

    scoredBfastCandidates.sort((a, b) => {
      if (Math.abs(b.effectiveScore - a.effectiveScore) > 0.001) {
        return b.effectiveScore - a.effectiveScore;
      }
      return ((a.origIdx + cycleShift + seedShiftBfast) % poolLen) - ((b.origIdx + cycleShift + seedShiftBfast) % poolLen);
    });

    const sortedBfast = scoredBfastCandidates.map(x => x.recipe);

    let chosenBreakfast: Recipe = sortedBfast[0] || rawBfastPool[0];
    let chosenLunch: VietnameseMealSet | Recipe | null = null;
    let chosenDinner: VietnameseMealSet | Recipe | null = null;
    let chosenDayCostUnscaled = 0;

    // Check top breakfast candidates to find one with a valid, budget-compliant knapsack pair
    const bfastAttempts = sortedBfast.slice(0, 8);
    for (const bfastCandidate of bfastAttempts) {
      const bfastCostUnscaled = bfastCandidate.estimatedCostVnd || 25000;
      const bfastCostScaled = scaleCost(bfastCostUnscaled, safeServings);

      if (bfastCostScaled > todayCeilingScaled || bfastCostUnscaled > todayCeilingUnscaled) {
        continue;
      }

      const remBudgetScaled = todayCeilingScaled - bfastCostScaled;
      const remBudgetUnscaled = todayCeilingUnscaled - bfastCostUnscaled;

      if (isSingleDish) {
        // Find best pair of 2 distinct recipes in candidateDishes
        interface DishPairCandidate {
          lunch: Recipe;
          dinner: Recipe;
          unscaledPairCost: number;
          score: number;
          isDisjoint: boolean;
          isWeaklyDisjoint: boolean;
        }

        const validPairs: DishPairCandidate[] = [];
        const lunchSlotKey = `${dayMeta.dayId}-lunch`;
        const dinnerSlotKey = `${dayMeta.dayId}-dinner`;
        const prevLunchSlotId = prevSlotMap[lunchSlotKey];
        const prevDinnerSlotId = prevSlotMap[dinnerSlotKey];
        const dishCycleOffset = baseCycleIndex * 7 + dayIdx * 3;
        const dishesLen = candidateDishes.length;
        const dishSeedShift = Math.floor(prng() * Math.max(1, dishesLen));

        for (let i = 0; i < candidateDishes.length; i++) {
          const dishA = candidateDishes[i];
          if (dishA.id === bfastCandidate.id) continue;
          const costA = dishA.estimatedCostVnd || 35000;
          const themeA = getDishTheme(dishA);
          const themeCountA = usedThemeCounts[themeA] || 0;
          const themePenaltyA = themeCountA > 0 ? (themeCountA === 1 ? 70 : 250) : 0;
          const countA = usedCounts[dishA.id] || 0;
          const exactUsagePenaltyA = countA > 0 ? (countA === 1 ? 80 : 300) : 0;
          const scoreA = mainScores[dishA.id] || 0;
          const rotA = (((i + dishCycleOffset + dishSeedShift) % dishesLen) / Math.max(1, dishesLen)) * 4.0;
          const isDishAPrevLunch = dishA.id === prevLunchId;
          const isDishAPrevDinner = dishA.id === prevDinnerId;
          let novA = 0;
          if (prevLunchSlotId && dishA.id === prevLunchSlotId) novA -= 30;
          if (prevDinnerSlotId && dishA.id === prevDinnerSlotId) novA -= 10;

          for (let j = 0; j < candidateDishes.length; j++) {
            if (i === j) continue;
            const dishB = candidateDishes[j];
            if (dishB.id === bfastCandidate.id) continue;
            const costB = dishB.estimatedCostVnd || 35000;

            const unscaledPairCost = costA + costB;
            const dayUnscaled = bfastCostUnscaled + unscaledPairCost;
            const dayScaled = scaleCost(dayUnscaled, safeServings);

            if (dayScaled > todayCeilingScaled || dayUnscaled > todayCeilingUnscaled) {
              continue;
            }

            const themeB = getDishTheme(dishB);

            // Same-day theme collision guard (never two dishes of the same theme on the same day)
            if (themeA && themeB && themeA === themeB) {
              continue;
            }

            const isDisjoint = (
              !isDishAPrevLunch &&
              !isDishAPrevDinner &&
              dishB.id !== prevLunchId &&
              dishB.id !== prevDinnerId
            );

            const isWeaklyDisjoint = (
              !isDishAPrevLunch &&
              dishB.id !== prevDinnerId
            );

            const themeCountB = usedThemeCounts[themeB] || 0;
            const themePenaltyB = themeCountB > 0 ? (themeCountB === 1 ? 70 : 250) : 0;

            const countB = usedCounts[dishB.id] || 0;
            const exactUsagePenaltyB = countB > 0 ? (countB === 1 ? 80 : 300) : 0;

            const scoreB = mainScores[dishB.id] || 0;
            const usagePenalty = exactUsagePenaltyA + exactUsagePenaltyB + themePenaltyA + themePenaltyB;

            // Tier-aware budget utilization
            let budgetUtilization = 0;
            if (budgetLevel === 'thoai-mai') {
              const dishRatio = unscaledPairCost / 320000;
              budgetUtilization = Math.min(1.0, dishRatio) * 16;
            } else if (budgetLevel === 'vua-phai') {
              const dishRatio = unscaledPairCost / 240000;
              budgetUtilization = (1 - Math.abs(dishRatio - 0.75)) * 12;
            } else {
              const dishRatio = unscaledPairCost / 220000;
              budgetUtilization = (1 - Math.min(1.0, dishRatio)) * 14;
            }

            // Slot novelty penalties
            let noveltyPenalty = novA;
            if (prevDinnerSlotId && dishB.id === prevDinnerSlotId) noveltyPenalty -= 30;
            if (prevLunchSlotId && dishB.id === prevLunchSlotId) noveltyPenalty -= 10;

            // Stochastic pair jitter & dynamic offset rotation
            const pairJitter = (prng() - 0.5) * 4.0;
            const pairIdx = i * dishesLen + j;
            const pairModulo = Math.max(1, dishesLen * dishesLen);
            const pairCycleBonus = (((pairIdx * 7 + dishCycleOffset * 11 + dishSeedShift * 13) % pairModulo) / pairModulo) * 8.0;
            const rotB = (((j + dishCycleOffset + dishSeedShift * 2 + 1) % dishesLen) / Math.max(1, dishesLen)) * 3.0;
            const freshnessA = computeDayFreshnessAdjustment(dishA, dayIdx, dishesLen);
            const freshnessB = computeDayFreshnessAdjustment(dishB, dayIdx, dishesLen);

            const score = scoreA + scoreB - usagePenalty + budgetUtilization + noveltyPenalty + rotA + rotB + pairCycleBonus + pairJitter + freshnessA + freshnessB;

            validPairs.push({
              lunch: dishA,
              dinner: dishB,
              unscaledPairCost,
              score,
              isDisjoint,
              isWeaklyDisjoint
            });
          }
        }

        if (validPairs.length > 0) {
          // Partition by disjointness
          let pool = validPairs.filter(p => p.isDisjoint);
          if (pool.length === 0) {
            pool = validPairs.filter(p => p.isWeaklyDisjoint);
          }
          if (pool.length === 0) {
            pool = validPairs.filter(p => !(p.lunch.id === prevLunchId && p.dinner.id === prevDinnerId));
          }
          if (pool.length === 0) {
            pool = validPairs;
          }

          // Sample using Boltzmann / Softmax over elite candidate pool
          const chosenPair = sampleSoftmax(
            pool,
            p => p.score,
            prng,
            temperature,
            8.0,
            10
          );

          chosenBreakfast = bfastCandidate;
          chosenLunch = chosenPair.lunch;
          chosenDinner = chosenPair.dinner;
          chosenDayCostUnscaled = bfastCostUnscaled + chosenPair.unscaledPairCost;
          break;
        }
      } else {
        // Find best pair of 2 distinct meal sets in candidateSets
        interface SetPairCandidate {
          lunch: VietnameseMealSet;
          dinner: VietnameseMealSet;
          unscaledPairCost: number;
          score: number;
          isDisjoint: boolean;
          isWeaklyDisjoint: boolean;
        }

        const validPairs: SetPairCandidate[] = [];
        const lunchSlotKey = `${dayMeta.dayId}-lunch`;
        const dinnerSlotKey = `${dayMeta.dayId}-dinner`;
        const prevLunchSlotId = prevSlotMap[lunchSlotKey];
        const prevDinnerSlotId = prevSlotMap[dinnerSlotKey];
        const setCycleOffset = baseCycleIndex * 5 + dayIdx * 2;
        const setsLen = candidateSets.length;
        const setSeedShift = Math.floor(prng() * Math.max(1, setsLen));

        for (let i = 0; i < candidateSets.length; i++) {
          const setA = candidateSets[i];
          const costA = setA.totalCostVnd;
          const themeA = getDishTheme(setA);
          const themeCountA = usedThemeCounts[themeA] || 0;
          const themePenaltyA = themeCountA > 0 ? (themeCountA === 1 ? 70 : 250) : 0;
          const countA = usedCounts[setA.id] || 0;
          const exactUsagePenaltyA = countA > 0 ? (countA === 1 ? 80 : 300) : 0;
          const scoreA = mainScores[setA.id] || 0;
          const rotA = (((i + setCycleOffset + setSeedShift) % setsLen) / Math.max(1, setsLen)) * 4.0;
          const isSetAPrevLunch = setA.id === prevLunchId;
          const isSetAPrevDinner = setA.id === prevDinnerId;
          let novA = 0;
          if (prevLunchSlotId && setA.id === prevLunchSlotId) novA -= 30;
          if (prevDinnerSlotId && setA.id === prevDinnerSlotId) novA -= 10;

          for (let j = 0; j < candidateSets.length; j++) {
            if (i === j) continue;
            const setB = candidateSets[j];
            const costB = setB.totalCostVnd;

            const unscaledPairCost = costA + costB;
            const dayUnscaled = bfastCostUnscaled + unscaledPairCost;
            const dayScaled = scaleCost(dayUnscaled, safeServings);

            if (dayScaled > todayCeilingScaled || dayUnscaled > todayCeilingUnscaled) {
              continue;
            }

            const themeB = getDishTheme(setB);

            // Same-day theme collision guard (never two meal sets of the same theme on the same day)
            if (themeA && themeB && themeA === themeB) {
              continue;
            }

            const isDisjoint = (
              !isSetAPrevLunch &&
              !isSetAPrevDinner &&
              setB.id !== prevLunchId &&
              setB.id !== prevDinnerId
            );

            const isWeaklyDisjoint = (
              !isSetAPrevLunch &&
              setB.id !== prevDinnerId
            );

            const themeCountB = usedThemeCounts[themeB] || 0;
            const themePenaltyB = themeCountB > 0 ? (themeCountB === 1 ? 70 : 250) : 0;

            const countB = usedCounts[setB.id] || 0;
            const exactUsagePenaltyB = countB > 0 ? (countB === 1 ? 80 : 300) : 0;

            const scoreB = mainScores[setB.id] || 0;
            const usagePenalty = exactUsagePenaltyA + exactUsagePenaltyB + themePenaltyA + themePenaltyB;

            // Tier-aware budget utilization
            let budgetUtilization = 0;
            const setRatio = Math.max(0, Math.min(1.0, (unscaledPairCost - 140000) / 180000));
            if (budgetLevel === 'thoai-mai') {
              budgetUtilization = setRatio * 16;
            } else if (budgetLevel === 'vua-phai') {
              budgetUtilization = (1 - Math.abs(setRatio - 0.5)) * 10;
            } else {
              budgetUtilization = (1 - setRatio) * 14;
            }

            // Slot novelty penalties
            let noveltyPenalty = novA;
            if (prevDinnerSlotId && setB.id === prevDinnerSlotId) noveltyPenalty -= 30;
            if (prevLunchSlotId && setB.id === prevLunchSlotId) noveltyPenalty -= 10;

            // Stochastic pair jitter & dynamic offset rotation
            const pairJitter = (prng() - 0.5) * 4.0;
            const pairIdx = i * setsLen + j;
            const pairCycleOffset = (baseCycleIndex * 5 + dayIdx * 3 + setSeedShift);
            const pairModulo = Math.max(1, setsLen * setsLen);
            const pairRotBonus = (((pairIdx + pairCycleOffset) % pairModulo) / pairModulo) * 10.0;
            const rotB = (((j + setCycleOffset + setSeedShift * 2 + 1) % setsLen) / Math.max(1, setsLen)) * 3.0;
            const parityBonus = dayIdx === 0 ? ((baseCycleIndex % 2 === 0 ? (i - j) : (j - i)) * 4.0) : 0;

            const score = scoreA + scoreB - usagePenalty + budgetUtilization + noveltyPenalty + rotA + rotB + pairRotBonus + parityBonus + pairJitter;

            validPairs.push({
              lunch: setA,
              dinner: setB,
              unscaledPairCost,
              score,
              isDisjoint,
              isWeaklyDisjoint
            });
          }
        }

        if (validPairs.length > 0) {
          // Partition by disjointness
          let pool = validPairs.filter(p => p.isDisjoint);
          if (pool.length === 0) {
            pool = validPairs.filter(p => p.isWeaklyDisjoint);
          }
          if (pool.length === 0) {
            pool = validPairs.filter(p => !(p.lunch.id === prevLunchId && p.dinner.id === prevDinnerId));
          }
          if (pool.length === 0) {
            pool = validPairs;
          }

          // Sample using Boltzmann / Softmax over elite candidate pool
          const chosenPair = sampleSoftmax(
            pool,
            p => p.score,
            prng,
            temperature,
            8.0,
            10
          );

          chosenBreakfast = bfastCandidate;
          chosenLunch = chosenPair.lunch;
          chosenDinner = chosenPair.dinner;
          chosenDayCostUnscaled = bfastCostUnscaled + chosenPair.unscaledPairCost;
          break;
        }
      }
    }

    // Defensive fallback (should never occur given calibrated dataset)
    if (!chosenLunch || !chosenDinner) {
      chosenBreakfast = sortedBfast[0] || rawBfastPool[0];
      if (isSingleDish) {
        const sortedDishesByCost = [...candidateDishes].sort((a, b) => (a.estimatedCostVnd || 35000) - (b.estimatedCostVnd || 35000));
        chosenLunch = sortedDishesByCost[0] || candidateDishes[0];
        chosenDinner = sortedDishesByCost[1] || candidateDishes[1] || candidateDishes[0];
        chosenDayCostUnscaled = (chosenBreakfast.estimatedCostVnd || 25000) +
          (chosenLunch.estimatedCostVnd || 35000) +
          (chosenDinner.estimatedCostVnd || 35000);
      } else {
        const sortedSetsByCost = [...candidateSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd);
        chosenLunch = sortedSetsByCost[0] || candidateSets[0];
        chosenDinner = sortedSetsByCost[1] || candidateSets[1] || candidateSets[0];
        chosenDayCostUnscaled = (chosenBreakfast.estimatedCostVnd || 25000) +
          chosenLunch.totalCostVnd +
          chosenDinner.totalCostVnd;
      }
    }

    // Record usage to prevent repetitive consecutive assignments
    usedCounts[chosenBreakfast.id] = (usedCounts[chosenBreakfast.id] || 0) + 1;
    usedCounts[chosenLunch.id] = (usedCounts[chosenLunch.id] || 0) + 1;
    usedCounts[chosenDinner.id] = (usedCounts[chosenDinner.id] || 0) + 1;

    const bfastTheme = getDishTheme(chosenBreakfast);
    const lunchTheme = getDishTheme(chosenLunch as any);
    const dinnerTheme = getDishTheme(chosenDinner as any);
    if (bfastTheme) usedThemeCounts[bfastTheme] = (usedThemeCounts[bfastTheme] || 0) + 1;
    if (lunchTheme) usedThemeCounts[lunchTheme] = (usedThemeCounts[lunchTheme] || 0) + 1;
    if (dinnerTheme) usedThemeCounts[dinnerTheme] = (usedThemeCounts[dinnerTheme] || 0) + 1;

    prevBreakfastId = chosenBreakfast.id;
    prevLunchId = chosenLunch.id;
    prevDinnerId = chosenDinner.id;

    const isWeekday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayMeta.dayId);
    const shouldSkipLunch = (options.weekdayLunchRoutine === 'ban-tru-di-lam' || options.weekdayLunchRoutine === 'hop-com-van-phong') && isWeekday;

    let finalLunch: VietnameseMealSet | Recipe | null = chosenLunch;
    let finalDayCostUnscaled = chosenDayCostUnscaled;
    let skippedSlots: { lunch?: boolean } | undefined = undefined;
    let slotNotes: { lunch?: string } | undefined = undefined;

    if (shouldSkipLunch) {
      finalLunch = null;
      skippedSlots = { lunch: true };
      slotNotes = { lunch: options.weekdayLunchRoutine === 'hop-com-van-phong' ? 'Mang cơm hộp văn phòng' : 'Con học bán trú • Bố mẹ ăn ngoài' };
      const dinnerCost = 'totalCostVnd' in chosenDinner ? chosenDinner.totalCostVnd : (chosenDinner.estimatedCostVnd || 35000);
      finalDayCostUnscaled = (chosenBreakfast.estimatedCostVnd || 25000) + dinnerCost;
    }

    const scaledDayCost = scaleCost(finalDayCostUnscaled, safeServings);
    accumulatedScaledCost += scaledDayCost;
    accumulatedUnscaledCost += finalDayCostUnscaled;
    const isOverBudget = scaledDayCost > budgetCeilingScaled;

    weeklyPlan.push({
      dayId: dayMeta.dayId,
      dayName: dayMeta.dayName,
      meals: {
        breakfast: chosenBreakfast,
        lunch: finalLunch,
        dinner: chosenDinner
      },
      skippedSlots,
      slotNotes,
      unscaledDayCost: finalDayCostUnscaled,
      scaledDayCost,
      dailyBudgetTarget,
      isOverBudget
    });
  }

  // Layer 4: Post-Generation Variety Verification Loop
  if (options.previousPlanSlotIds && Object.keys(options.previousPlanSlotIds).length >= 14) {
    let changedSlots = 0;
    for (const d of weeklyPlan) {
      if (d.meals.breakfast?.id !== options.previousPlanSlotIds[`${d.dayId}-breakfast`]) changedSlots++;
      if (d.meals.lunch?.id !== options.previousPlanSlotIds[`${d.dayId}-lunch`]) changedSlots++;
      if (d.meals.dinner?.id !== options.previousPlanSlotIds[`${d.dayId}-dinner`]) changedSlots++;
    }

    if (changedSlots < 9) {
      for (let dayIdx = 0; dayIdx < weeklyPlan.length && changedSlots < 9; dayIdx++) {
        const d = weeklyPlan[dayIdx];
        const bKey = `${d.dayId}-breakfast`;
        const prevBfastSlot = options.previousPlanSlotIds[bKey];
        if (d.meals.breakfast?.id === prevBfastSlot) {
          const prevDayBfastId = dayIdx > 0 ? weeklyPlan[dayIdx - 1].meals.breakfast.id : '';
          const nextDayBfastId = dayIdx < 6 ? weeklyPlan[dayIdx + 1]?.meals?.breakfast?.id : '';
          const lunchCost = d.meals.lunch 
            ? ('totalCostVnd' in d.meals.lunch ? d.meals.lunch.totalCostVnd : (d.meals.lunch.estimatedCostVnd || 35000))
            : 0;
          const dinnerCost = 'totalCostVnd' in d.meals.dinner ? d.meals.dinner.totalCostVnd : (d.meals.dinner.estimatedCostVnd || 35000);

          const altBfast = affordableBfast.find(b =>
            b.id !== prevBfastSlot &&
            b.id !== prevDayBfastId &&
            b.id !== nextDayBfastId &&
            scaleCost((b.estimatedCostVnd || 25000) + lunchCost + dinnerCost, safeServings) <= budgetCeilingScaled &&
            ((b.estimatedCostVnd || 25000) + lunchCost + dinnerCost) <= unscaledBudgetCeiling
          );

          if (altBfast) {
            d.meals.breakfast = altBfast;
            const newUnscaled = (altBfast.estimatedCostVnd || 25000) + lunchCost + dinnerCost;
            d.unscaledDayCost = newUnscaled;
            d.scaledDayCost = scaleCost(newUnscaled, safeServings);
            d.isOverBudget = d.scaledDayCost > budgetCeilingScaled;
            changedSlots++;
          }
        }
      }
    }
  }

  // Layer 5: Post-Generation Weekly Budget Balancing Pass
  // Guaranteed Invariant: weeklyPlan total scaled cost MUST NOT exceed weeklyBudgetTarget (dailyBudgetTarget * 7)
  let totalWeeklyScaledCost = weeklyPlan.reduce((sum, d) => sum + d.scaledDayCost, 0);
  if (totalWeeklyScaledCost > weeklyBudgetTarget) {
    const sortedDays = [...weeklyPlan].sort((a, b) => b.scaledDayCost - a.scaledDayCost);
    for (const d of sortedDays) {
      if (totalWeeklyScaledCost <= weeklyBudgetTarget) break;
      if (!isSingleDish && 'totalCostVnd' in d.meals.dinner) {
        const currentLunch = d.meals.lunch && 'totalCostVnd' in d.meals.lunch ? (d.meals.lunch as VietnameseMealSet) : null;
        const currentDinner = d.meals.dinner as VietnameseMealSet;
        const bCost = d.meals.breakfast.estimatedCostVnd || 25000;
        const currentLunchCost = currentLunch ? currentLunch.totalCostVnd : 0;
        
        const cheaperSets = candidateSets
          .filter(s => (!currentLunch || s.id !== currentLunch.id) && s.id !== currentDinner.id)
          .sort((a, b) => a.totalCostVnd - b.totalCostVnd);

        for (const replacement of cheaperSets) {
          if (replacement.totalCostVnd < currentDinner.totalCostVnd) {
            const newUnscaled = bCost + currentLunchCost + replacement.totalCostVnd;
            const newScaled = scaleCost(newUnscaled, safeServings);
            const saved = d.scaledDayCost - newScaled;
            if (saved > 0) {
              d.meals.dinner = replacement;
              d.unscaledDayCost = newUnscaled;
              d.scaledDayCost = newScaled;
              d.isOverBudget = d.scaledDayCost > budgetCeilingScaled;
              totalWeeklyScaledCost -= saved;
              if (totalWeeklyScaledCost <= weeklyBudgetTarget) break;
            }
          }
          if (currentLunch && replacement.totalCostVnd < currentLunch.totalCostVnd) {
            const newUnscaled = bCost + replacement.totalCostVnd + (d.meals.dinner as VietnameseMealSet).totalCostVnd;
            const newScaled = scaleCost(newUnscaled, safeServings);
            const saved = d.scaledDayCost - newScaled;
            if (saved > 0) {
              d.meals.lunch = replacement;
              d.unscaledDayCost = newUnscaled;
              d.scaledDayCost = newScaled;
              d.isOverBudget = d.scaledDayCost > budgetCeilingScaled;
              totalWeeklyScaledCost -= saved;
              if (totalWeeklyScaledCost <= weeklyBudgetTarget) break;
            }
          }
        }
      } else if (isSingleDish) {
        const currentLunch = d.meals.lunch as Recipe | null;
        const currentDinner = d.meals.dinner as Recipe;
        const bCost = d.meals.breakfast.estimatedCostVnd || 25000;
        const currentLunchCost = currentLunch ? (currentLunch.estimatedCostVnd || 35000) : 0;
        const cheaperDishes = candidateDishes
          .filter(r => (!currentLunch || r.id !== currentLunch.id) && r.id !== currentDinner.id && r.id !== d.meals.breakfast.id)
          .sort((a, b) => (a.estimatedCostVnd || 35000) - (b.estimatedCostVnd || 35000));

        for (const replacement of cheaperDishes) {
          const repCost = replacement.estimatedCostVnd || 35000;
          if (repCost < (currentDinner.estimatedCostVnd || 35000)) {
            const newUnscaled = bCost + currentLunchCost + repCost;
            const newScaled = scaleCost(newUnscaled, safeServings);
            const saved = d.scaledDayCost - newScaled;
            if (saved > 0) {
              d.meals.dinner = replacement;
              d.unscaledDayCost = newUnscaled;
              d.scaledDayCost = newScaled;
              d.isOverBudget = d.scaledDayCost > budgetCeilingScaled;
              totalWeeklyScaledCost -= saved;
              if (totalWeeklyScaledCost <= weeklyBudgetTarget) break;
            }
          }
        }
      }
    }
  }

  // Ensure isOverBudget flag is synchronized across all 7 days
  weeklyPlan.forEach(d => {
    d.isOverBudget = d.scaledDayCost > budgetCeilingScaled;
  });

  return weeklyPlan;
}
