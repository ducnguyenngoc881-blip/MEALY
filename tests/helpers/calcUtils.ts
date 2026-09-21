import { Recipe, VietnameseMealSet, DailyMealPlan, PartyDishItem, Ingredient, StoreChannel } from '../../src/types';

// ==================== CATERING MATH ====================

export function sanitizeGuestCount(raw: any, fallback = 10): number {
  const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 500);
}

export function calculateTables(guestCount: number, tableSize: 6 | 8 | 10): number {
  const safeCount = Math.max(1, guestCount);
  return Math.ceil(safeCount / tableSize);
}

export function calculateCateringFinancials(params: {
  guestCount: number;
  tableSize: 6 | 8 | 10;
  budgetPerHead: number;
  dishes: PartyDishItem[];
  recipeLookup: (id: string) => Recipe | undefined;
}) {
  const safeGuests = sanitizeGuestCount(params.guestCount);
  const numTables = calculateTables(safeGuests, params.tableSize);
  const budgetPerHead = Math.max(0, params.budgetPerHead);
  const totalRevenue = safeGuests * budgetPerHead;

  let rawDishesCost = 0;
  for (const item of params.dishes) {
    const r = params.recipeLookup(item.recipeId);
    if (r) {
      const servings = r.servings || 4;
      const factor = safeGuests / servings;
      const cost = (r.estimatedCostVnd || 40000) * factor;
      rawDishesCost += cost;
    }
  }

  const roundedFoodCost = Math.round(rawDishesCost);
  const grossProfit = totalRevenue - roundedFoodCost;

  const profitMarginPercent =
    totalRevenue > 0 && params.dishes.length > 0 && roundedFoodCost > 0
      ? Math.round((grossProfit / totalRevenue) * 100)
      : 0;

  const foodCostPerHead = Math.round(roundedFoodCost / safeGuests);
  const foodCostPerTable = numTables > 0 ? Math.round(roundedFoodCost / numTables) : 0;
  const revenuePerTable = numTables > 0 ? Math.round(totalRevenue / numTables) : 0;

  return {
    safeGuests,
    numTables,
    totalRevenue,
    roundedFoodCost,
    grossProfit,
    profitMarginPercent,
    foodCostPerHead,
    foodCostPerTable,
    revenuePerTable
  };
}

// ==================== GROCERY MATH ====================

export interface GroceryItemAggregate {
  name: string;
  normalizedName: string;
  amount: number;
  unit: string;
  category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
  cost: number;
  type: 'fresh' | 'pantry';
  suggestedStore?: StoreChannel;
}

export function normalizeUnitAndAmount(amount: number, unit: string): { amount: number; unit: string } {
  const cleanUnit = unit.toLowerCase().trim();

  if (cleanUnit === 'kg' || cleanUnit === 'kilogram') {
    return { amount: amount * 1000, unit: 'g' };
  }
  if (cleanUnit === 'l' || cleanUnit === 'lít' || cleanUnit === 'lit') {
    return { amount: amount * 1000, unit: 'ml' };
  }
  if (cleanUnit === 'muỗng' || cleanUnit === 'muỗng canh' || cleanUnit === 'thìa canh') {
    return { amount, unit: 'thìa canh' };
  }
  if (cleanUnit === 'muỗng cà phê' || cleanUnit === 'thìa cà phê' || cleanUnit === 'muỗng cafe') {
    return { amount, unit: 'thìa cà phê' };
  }

  return { amount, unit: cleanUnit };
}

export function aggregateIngredients(
  recipeIngredients: Array<{ ingredient: Ingredient; recipeCost: number; totalIngredientsCount: number }>
): {
  items: GroceryItemAggregate[];
  totalCostEstimate: number;
} {
  const map = new Map<string, GroceryItemAggregate>();
  let totalCostEstimate = 0;

  for (const { ingredient, recipeCost, totalIngredientsCount } of recipeIngredients) {
    const rawAmount = typeof ingredient.amount === 'number'
      ? ingredient.amount
      : parseFloat(ingredient.amount as string) || 1;

    const { amount, unit } = normalizeUnitAndAmount(rawAmount, ingredient.unit);
    const normName = ingredient.name.toLowerCase().trim();
    const key = `${normName}-${unit}`;

    const isFresh = ingredient.category === 'thit-ca' || ingredient.category === 'rau-cu';
    const itemCostPortion = Math.round((recipeCost || 30000) / Math.max(1, totalIngredientsCount));

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        name: ingredient.name,
        normalizedName: normName,
        amount: Math.round(amount * 10) / 10,
        unit,
        category: ingredient.category,
        cost: itemCostPortion,
        type: isFresh ? 'fresh' : 'pantry',
        suggestedStore: isFresh ? 'cho-dan-sinh' : 'winmart'
      });
    } else {
      existing.amount = Math.round((existing.amount + amount) * 10) / 10;
      existing.cost += itemCostPortion;
    }
    totalCostEstimate += itemCostPortion;
  }

  return {
    items: Array.from(map.values()),
    totalCostEstimate
  };
}

export const STORE_PRICE_MULTIPLIERS: Record<StoreChannel, { label: string; multiplier: number }> = {
  'all': { label: 'Tất Cả Kênh', multiplier: 1.0 },
  'cho-dan-sinh': { label: 'Chợ Dân Sinh', multiplier: 0.95 },
  'winmart': { label: 'WinMart', multiplier: 1.15 },
  'bach-hoa-xanh': { label: 'Bách Hóa Xanh', multiplier: 1.05 },
  'sap-doi-tac': { label: 'Sạp Đối Tác', multiplier: 0.90 }
};

export function simulateStorePrice(baseCost: number, store: StoreChannel): number {
  const config = STORE_PRICE_MULTIPLIERS[store] || STORE_PRICE_MULTIPLIERS['all'];
  return Math.round(baseCost * config.multiplier);
}

export function formatZaloShoppingList(
  items: GroceryItemAggregate[],
  checkedMap: Record<string, boolean>,
  totalCost: number
): string {
  const checkedItems = items.filter(i => !!checkedMap[i.name]);
  const uncheckedItems = items.filter(i => !checkedMap[i.name]);

  let text = '🛒 DANH SÁCH ĐI CHỢ MEALWISE\n';
  text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  if (uncheckedItems.length > 0) {
    text += '📦 [ ] CẦN MUA:\n';
    uncheckedItems.forEach(i => {
      text += `  [ ] ${i.name}: ${i.amount} ${i.unit}\n`;
    });
    text += '\n';
  }

  if (checkedItems.length > 0) {
    text += '✅ [✓] ĐÃ MUA:\n';
    checkedItems.forEach(i => {
      text += `  [✓] ${i.name}: ${i.amount} ${i.unit}\n`;
    });
    text += '\n';
  }

  text += `💰 TỔNG CHI PHÍ DỰ KIẾN: ${totalCost.toLocaleString('vi-VN')} đ\n`;
  const completion = items.length > 0 ? Math.round((checkedItems.length / items.length) * 100) : 0;
  text += `📊 TIẾN ĐỘ HOÀN TẤT: ${completion}% (${checkedItems.length}/${items.length} món)`;

  return text;
}

// ==================== NUTRITION & BUDGET MATH ====================

export function calculateServingsScale(servings: number): number {
  const num = Number(servings);
  const safeServings = isNaN(num) ? 4 : Math.max(1, Math.min(20, Math.round(num)));
  return safeServings / 4;
}

export function calculateDailyNutrition(
  day: DailyMealPlan,
  servings = 4
): {
  unscaledCalories: number;
  unscaledCost: number;
  unscaledProtein: number;
  scale: number;
  scaledCalories: number;
  scaledCost: number;
  scaledProtein: number;
} {
  const scale = calculateServingsScale(servings);
  let unscaledCalories = 0;
  let unscaledCost = 0;
  let unscaledProtein = 0;

  const meals = Object.values(day.meals);
  for (const meal of meals) {
    if (!meal) continue;
    if ('mainDish' in meal) {
      const set = meal as VietnameseMealSet;
      unscaledCalories += set.totalCalories;
      unscaledCost += set.totalCostVnd;
      unscaledProtein += Math.round(set.totalCalories * 0.045);
    } else {
      const rec = meal as Recipe;
      const cals = rec.calories || 450;
      const cost = rec.estimatedCostVnd || 35000;
      unscaledCalories += cals;
      unscaledCost += cost;
      unscaledProtein += Math.round(cals * 0.045);
    }
  }

  return {
    unscaledCalories,
    unscaledCost,
    unscaledProtein,
    scale,
    scaledCalories: Math.round(unscaledCalories * scale),
    scaledCost: Math.round(unscaledCost * scale),
    scaledProtein: Math.round(unscaledProtein * scale)
  };
}

export const BUDGET_LEVEL_BENCHMARKS = {
  'tiet-kiem': 250000,
  'vua-phai': 380000,
  'thoai-mai': 550000
};

export type BudgetStatus = 'safe' | 'balanced' | 'warning' | 'danger';

export function evaluateDayBudgetStatus(
  dayCost: number,
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai',
  servings = 4
): {
  thresholdVnd: number;
  ratio: number;
  status: BudgetStatus;
  label: string;
} {
  const base = BUDGET_LEVEL_BENCHMARKS[budgetLevel] || BUDGET_LEVEL_BENCHMARKS['vua-phai'];
  const scale = calculateServingsScale(servings);
  const thresholdVnd = Math.round(base * scale);

  const ratio = thresholdVnd > 0 ? dayCost / thresholdVnd : 1;

  if (ratio <= 0.85) {
    return { thresholdVnd, ratio, status: 'safe', label: 'Tiết Kiệm Tốt' };
  } else if (ratio <= 1.05) {
    return { thresholdVnd, ratio, status: 'balanced', label: 'Cân Đối Đúng Mục Tiêu' };
  } else if (ratio <= 1.25) {
    return { thresholdVnd, ratio, status: 'warning', label: 'Hơi Cao So Với Mục Tiêu' };
  } else {
    return { thresholdVnd, ratio, status: 'danger', label: 'Vượt Ngân Sách Đáng Kể' };
  }
}
