export interface KitchenWorkload {
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  formattedTotalTime: string;
  parallelDishesCount: number;
}

export interface DishTimingInput {
  title?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
}

/**
 * Calculates preparation, cooking, and total kitchen time for a party menu
 * taking into account headcount scaling and kitchen parallel concurrency.
 */
export function calculatePartyKitchenTime(
  dishes: DishTimingInput[],
  guestCount: number
): KitchenWorkload {
  const safeGuests = Math.max(1, Number.isFinite(guestCount) ? Math.round(guestCount) : 10);

  if (!dishes || dishes.length === 0) {
    return {
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      totalTimeMinutes: 0,
      formattedTotalTime: '0 phút',
      parallelDishesCount: 0
    };
  }

  // Headcount prep scaling ratio relative to base family servings (4 persons)
  const scale = safeGuests / 4;
  // Sub-linear scaling factor for prep time (batch peeling, chopping, marinating)
  const prepFactor = scale <= 1 ? 1 : 1 + 0.4 * Math.log2(scale);

  let rawTotalPrep = 0;
  const cookTimes: number[] = [];

  for (const dish of dishes) {
    const prep = Math.max(5, dish.prepTimeMinutes || 15);
    const cook = Math.max(5, dish.cookTimeMinutes || 20);
    rawTotalPrep += prep;
    cookTimes.push(cook);
  }

  const scaledPrepTime = Math.round(rawTotalPrep * prepFactor);

  // Multi-burner concurrency calculation:
  // The slowest dish dictates the baseline cook time, with small staging/plating overhead for others
  cookTimes.sort((a, b) => b - a);
  const maxCookTime = cookTimes[0];
  const remainingCookSum = cookTimes.slice(1).reduce((sum, t) => sum + t, 0);

  // Batch multiplier for high guest volumes requiring multiple frying/steaming rounds
  const batchMultiplier = safeGuests >= 40 ? 1.35 : safeGuests >= 20 ? 1.2 : 1.0;
  const concurrentCookTime = Math.round((maxCookTime + remainingCookSum * 0.25) * batchMultiplier);

  const totalMinutes = scaledPrepTime + concurrentCookTime;

  // Format into clean Vietnamese time string
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  let formattedTotalTime = '';
  if (hours > 0) {
    formattedTotalTime = `${hours} giờ${mins > 0 ? ` ${mins} phút` : ''}`;
  } else {
    formattedTotalTime = `${mins} phút`;
  }

  return {
    prepTimeMinutes: scaledPrepTime,
    cookTimeMinutes: concurrentCookTime,
    totalTimeMinutes: totalMinutes,
    formattedTotalTime,
    parallelDishesCount: dishes.length
  };
}
