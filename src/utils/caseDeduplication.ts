// src/utils/caseDeduplication.ts
// MealWise Account-Level Zero-Duplication Gacha Engine for Apex Case Opening

import { ApexCaseTier, FastMealPreferenceMode } from '../types';
import { FastDishItem, EXPRESS_POOL_BLUE, EXPRESS_POOL_PURPLE, EXPRESS_POOL_GOLD, EXPRESS_EXCLUSIVE_POOL } from '../data/casePools/expressPool';
import { SNACK_POOL_BLUE, SNACK_POOL_PURPLE, SNACK_POOL_GOLD, SNACK_EXCLUSIVE_POOL } from '../data/casePools/snackPool';
import { COMBO_POOL_BLUE, COMBO_POOL_PURPLE, COMBO_POOL_GOLD, COMBO_EXCLUSIVE_POOL } from '../data/casePools/comboPool';
import { BIZARRE_POOL_BLUE, BIZARRE_POOL_PURPLE, BIZARRE_POOL_GOLD, BIZARRE_EXCLUSIVE_POOL } from '../data/casePools/bizarrePool';

const STORAGE_KEY = 'mealwise_account_unlocked_cases_v1';

export interface UnlockedDishRecord {
  dishId: string;
  mode: FastMealPreferenceMode;
  tier: ApexCaseTier;
  unlockedAt: string;
  prestigeCycle: number;
}

export interface AccountCaseCollectionState {
  unlockedIds: string[];
  records: Record<string, UnlockedDishRecord>;
  prestigeCycles: Record<string, number>;
}

// Get the master pool for a given mode and tier
export function getCasePool(mode: FastMealPreferenceMode, tier: ApexCaseTier): FastDishItem[] {
  if (mode === 'express-1dish') {
    return tier === 'gold' ? EXPRESS_POOL_GOLD : tier === 'purple' ? EXPRESS_POOL_PURPLE : EXPRESS_POOL_BLUE;
  }
  if (mode === 'snack-genz') {
    return tier === 'gold' ? SNACK_POOL_GOLD : tier === 'purple' ? SNACK_POOL_PURPLE : SNACK_POOL_BLUE;
  }
  if (mode === 'combo') {
    return tier === 'gold' ? COMBO_POOL_GOLD : tier === 'purple' ? COMBO_POOL_PURPLE : COMBO_POOL_BLUE;
  }
  // bizarre-dare
  return tier === 'gold' ? BIZARRE_POOL_GOLD : tier === 'purple' ? BIZARRE_POOL_PURPLE : BIZARRE_POOL_BLUE;
}

// Get the full ~200 pool for a mode
export function getFullModePool(mode: FastMealPreferenceMode): FastDishItem[] {
  if (mode === 'express-1dish') return EXPRESS_EXCLUSIVE_POOL;
  if (mode === 'snack-genz') return SNACK_EXCLUSIVE_POOL;
  if (mode === 'combo') return COMBO_EXCLUSIVE_POOL;
  return BIZARRE_EXCLUSIVE_POOL;
}

// Safely read account collection from localStorage
export function getAccountCaseState(): AccountCaseCollectionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { unlockedIds: [], records: {}, prestigeCycles: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      unlockedIds: Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [],
      records: parsed.records && typeof parsed.records === 'object' ? parsed.records : {},
      prestigeCycles: parsed.prestigeCycles && typeof parsed.prestigeCycles === 'object' ? parsed.prestigeCycles : {}
    };
  } catch {
    return { unlockedIds: [], records: {}, prestigeCycles: {} };
  }
}

// Save account collection to localStorage
function saveAccountCaseState(state: AccountCaseCollectionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to persist case opening state to localStorage:', err);
  }
}

// Pick a guaranteed NON-DUPLICATE dish from the exclusive pool for this account
export function pickNonDuplicateDish(
  mode: FastMealPreferenceMode,
  tier: ApexCaseTier
): { dish: FastDishItem; isNew: boolean; unlockedCount: number; totalCount: number; prestigeCycle: number } {
  const pool = getCasePool(mode, tier);
  const state = getAccountCaseState();
  const poolKey = `${mode}:${tier}`;
  const currentPrestige = state.prestigeCycles[poolKey] || 0;

  // Filter out dishes that have already been opened in the current cycle
  const unlockedInCurrentCycle = new Set(
    Object.values(state.records)
      .filter(r => r.mode === mode && r.tier === tier && r.prestigeCycle === currentPrestige)
      .map(r => r.dishId)
  );

  let availableDishes = pool.filter(d => !unlockedInCurrentCycle.has(d.id));

  // If the entire pool has been discovered (all dishes unlocked without repetition):
  // Prestige level-up and refresh the active draw bag!
  let nextPrestige = currentPrestige;
  if (availableDishes.length === 0) {
    nextPrestige = currentPrestige + 1;
    state.prestigeCycles[poolKey] = nextPrestige;
    availableDishes = [...pool];
  }

  // Pick random dish from available pool
  const randomIndex = Math.floor(Math.random() * availableDishes.length);
  const pickedDish = availableDishes[randomIndex] || pool[0];

  // Record unlock
  const now = new Date().toISOString();
  const isFirstTimeEver = !state.unlockedIds.includes(pickedDish.id);

  if (isFirstTimeEver) {
    state.unlockedIds.push(pickedDish.id);
  }

  state.records[pickedDish.id] = {
    dishId: pickedDish.id,
    mode,
    tier,
    unlockedAt: now,
    prestigeCycle: nextPrestige
  };

  saveAccountCaseState(state);

  // Calculate stats for this tier
  const modePool = getFullModePool(mode);
  const totalModeUnlocked = state.unlockedIds.filter(id => modePool.some(d => d.id === id)).length;

  return {
    dish: pickedDish,
    isNew: isFirstTimeEver,
    unlockedCount: totalModeUnlocked,
    totalCount: modePool.length,
    prestigeCycle: nextPrestige
  };
}

// Get collection progress for a mode
export function getModeCollectionStats(mode: FastMealPreferenceMode): {
  unlockedCount: number;
  totalCount: number;
  percentage: number;
  blueCount: number;
  purpleCount: number;
  goldCount: number;
} {
  const state = getAccountCaseState();
  const modePool = getFullModePool(mode);
  const unlockedSet = new Set(state.unlockedIds);

  const unlockedDishes = modePool.filter(d => unlockedSet.has(d.id));
  const totalCount = modePool.length;
  const unlockedCount = unlockedDishes.length;
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const blueCount = unlockedDishes.filter(d => d.tier === 'blue').length;
  const purpleCount = unlockedDishes.filter(d => d.tier === 'purple').length;
  const goldCount = unlockedDishes.filter(d => d.tier === 'gold').length;

  return {
    unlockedCount,
    totalCount,
    percentage,
    blueCount,
    purpleCount,
    goldCount
  };
}

// Get all unlocked dishes for gallery inspection
export function getAllUnlockedDishes(): Array<FastDishItem & { unlockedAt: string; prestigeCycle: number; mode: FastMealPreferenceMode }> {
  const state = getAccountCaseState();
  const allPools = [
    ...EXPRESS_EXCLUSIVE_POOL.map(d => ({ ...d, mode: 'express-1dish' as FastMealPreferenceMode })),
    ...SNACK_EXCLUSIVE_POOL.map(d => ({ ...d, mode: 'snack-genz' as FastMealPreferenceMode })),
    ...COMBO_EXCLUSIVE_POOL.map(d => ({ ...d, mode: 'combo' as FastMealPreferenceMode })),
    ...BIZARRE_EXCLUSIVE_POOL.map(d => ({ ...d, mode: 'bizarre-dare' as FastMealPreferenceMode }))
  ];

  const map = new Map<string, typeof allPools[0]>();
  allPools.forEach(d => map.set(d.id, d));

  const result: Array<FastDishItem & { unlockedAt: string; prestigeCycle: number; mode: FastMealPreferenceMode }> = [];
  state.unlockedIds.forEach(id => {
    const dish = map.get(id);
    const rec = state.records[id];
    if (dish && rec) {
      result.push({
        ...dish,
        unlockedAt: rec.unlockedAt,
        prestigeCycle: rec.prestigeCycle,
        mode: rec.mode
      });
    }
  });

  return result.sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
}

// Reset account collection
export function resetAccountCaseCollection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing account case storage:', err);
  }
}
