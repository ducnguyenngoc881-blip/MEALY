/**
 * MealWise Ad Tracking & Ad-Free Reward Service
 * Manages daily volunteer ad counters and ad-free experience time-to-live (TTL).
 */

export interface AdTrackingState {
  todayDate: string; // 'YYYY-MM-DD'
  adsWatchedToday: number;
  dailyTarget: number;
  adFreeUntilTimestamp: number; // epoch ms
}

const STORAGE_KEY = 'mealwise_ad_tracking_v1';
export const DEFAULT_DAILY_TARGET = 3;
export const HOURS_REWARD_PER_SEQUENCE = 24; // Premium until midnight

export function getMidnightTonightTimestamp(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0); // 00:00:00 of tomorrow (12:00 AM midnight tonight)
  return d.getTime();
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadAdTrackingState(): AdTrackingState {
  const today = getTodayDateString();
  const defaultState: AdTrackingState = {
    todayDate: today,
    adsWatchedToday: 0,
    dailyTarget: DEFAULT_DAILY_TARGET,
    adFreeUntilTimestamp: 0
  };

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return defaultState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed: Partial<AdTrackingState> = JSON.parse(raw);
    const isNewDay = parsed.todayDate !== today;

    const state: AdTrackingState = {
      todayDate: today,
      // Reset daily count if a new calendar day has arrived
      adsWatchedToday: isNewDay ? 0 : (typeof parsed.adsWatchedToday === 'number' ? Math.min(DEFAULT_DAILY_TARGET, parsed.adsWatchedToday) : 0),
      dailyTarget: DEFAULT_DAILY_TARGET,
      // Preserve ad-free time even across midnight if it hasn't expired yet
      adFreeUntilTimestamp: typeof parsed.adFreeUntilTimestamp === 'number' ? parsed.adFreeUntilTimestamp : 0
    };

    if (isNewDay) {
      saveAdTrackingState(state);
    }

    return state;
  } catch {
    return defaultState;
  }
}

export function saveAdTrackingState(state: AdTrackingState): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function recordVolunteerAdWatched(adsCount = 3): AdTrackingState {
  const current = loadAdTrackingState();
  const midnightTonight = getMidnightTonightTimestamp();
  
  // Set ad-free / premium expiration time to midnight tonight (12:00 AM)
  const newExpiration = Math.max(midnightTonight, current.adFreeUntilTimestamp);

  const updated: AdTrackingState = {
    ...current,
    adsWatchedToday: Math.min(DEFAULT_DAILY_TARGET, current.adsWatchedToday + adsCount),
    adFreeUntilTimestamp: newExpiration
  };

  saveAdTrackingState(updated);
  return updated;
}

export function getAdFreeRemainingMs(adFreeUntilTimestamp: number): number {
  const now = Date.now();
  return Math.max(0, adFreeUntilTimestamp - now);
}

export function formatAdFreeTime(remainingMs: number): string {
  if (remainingMs <= 0) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function formatAdFreeShort(remainingMs: number): string {
  if (remainingMs <= 0) {
    return 'Hết hạn';
  }

  const totalMinutes = Math.floor(remainingMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
}
