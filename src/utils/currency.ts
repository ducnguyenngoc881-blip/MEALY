/**
 * MealWise Currency & Servings Scaling Utilities
 * Ensures standardized VND integer rounding (multiples of 1,000 VND)
 * across all household sizes and budget tiers.
 */

export const DAILY_BUDGET_RATES: Record<string, number> = {
  'tiet-kiem': 60000,
  'vua-phai': 95000,
  'thoai-mai': 140000
};

export const WESTERN_BUDGET_RATES: Record<string, number> = {
  'tiet-kiem': 85000,
  'vua-phai': 120000,
  'thoai-mai': 180000
};

/**
 * Rounds a VND monetary value to the nearest clean integer multiple of 1,000 VND.
 * E.g., 18,750 -> 19,000; 18,250 -> 18,000.
 * Handles non-finite, NaN, and negative values gracefully.
 */
export function roundToThousand(vnd: number): number {
  if (!Number.isFinite(vnd) || isNaN(vnd)) {
    return 0;
  }
  if (vnd <= 0) {
    return 0;
  }
  return Math.round(vnd / 1000) * 1000;
}

/**
 * Scales an unscaled cost (defined for standard 4 servings in recipes and meal sets)
 * to a target number of servings, rounded cleanly to multiples of 1,000 VND.
 * scaleCost(unscaledCost, servings) = roundToThousand(unscaledCost * (servings / 4))
 */
export function scaleCost(unscaledCost: number, servings: number): number {
  if (!Number.isFinite(unscaledCost) || unscaledCost <= 0) {
    return 0;
  }
  if (!Number.isFinite(servings) || servings <= 0) {
    return 0;
  }
  return roundToThousand(unscaledCost * (servings / 4));
}

/**
 * Computes the daily budget target for a household size based on budget level:
 * - Normal: 'tiet-kiem': 60k, 'vua-phai': 95k, 'thoai-mai': 140k
 * - Western: 'tiet-kiem': 85k, 'vua-phai': 120k, 'thoai-mai': 180k
 * Supports optional specialNeeds array or boolean flag for Western cuisine.
 * Returns a clean integer output.
 */
export function getDailyBudgetTarget(
  budgetLevel: string, 
  servings: number, 
  specialNeedsOrIsWestern?: string[] | boolean
): number {
  const isWestern = typeof specialNeedsOrIsWestern === 'boolean'
    ? specialNeedsOrIsWestern
    : Array.isArray(specialNeedsOrIsWestern)
      ? specialNeedsOrIsWestern.includes('western-food')
      : false;

  const rates = isWestern ? WESTERN_BUDGET_RATES : DAILY_BUDGET_RATES;
  const rate = rates[budgetLevel] || rates['vua-phai'];
  const safeServings = Number.isFinite(servings) && servings > 0 ? servings : 1;
  return roundToThousand(rate * safeServings);
}
