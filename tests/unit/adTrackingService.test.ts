import { describe, it, expect } from '../helpers/testRunner';
import {
  getTodayDateString,
  loadAdTrackingState,
  saveAdTrackingState,
  recordVolunteerAdWatched,
  getAdFreeRemainingMs,
  formatAdFreeTime,
  formatAdFreeShort,
  HOURS_REWARD_PER_SEQUENCE
} from '../../src/utils/adTrackingService';

describe('Unit: AdTracking & Ad-Free Timer Service', () => {
  it('ATS-01: getTodayDateString returns valid YYYY-MM-DD format', () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('ATS-02: loadAdTrackingState returns clean default state on initial load', () => {
    const state = loadAdTrackingState();
    expect(typeof state.todayDate).toBe('string');
    expect(typeof state.adsWatchedToday).toBe('number');
    expect(state.adsWatchedToday).toBeGreaterThanOrEqual(0);
    expect(state.dailyTarget).toBe(3);
  });

  it('ATS-03: recordVolunteerAdWatched increments watched count and adds reward time until midnight', () => {
    const before = loadAdTrackingState();
    const updated = recordVolunteerAdWatched(3);

    expect(updated.adsWatchedToday).toBe(3);
    expect(updated.adFreeUntilTimestamp).toBeGreaterThan(Date.now());

    const remainingMs = getAdFreeRemainingMs(updated.adFreeUntilTimestamp);
    // Should be positive countdown until midnight
    expect(remainingMs).toBeGreaterThan(0);
  });

  it('ATS-04: getAdFreeRemainingMs clamps past timestamps to 0', () => {
    const past = Date.now() - 50000;
    expect(getAdFreeRemainingMs(past)).toBe(0);
  });

  it('ATS-05: formatAdFreeTime formats hours, minutes, seconds and zero states', () => {
    expect(formatAdFreeTime(0)).toBe('00:00:00');
    expect(formatAdFreeTime(-1000)).toBe('00:00:00');

    // 1 hour 15 min 30 sec = (3600 + 900 + 30) * 1000 ms = 4530000 ms
    const formatted = formatAdFreeTime(4530000);
    expect(formatted).toBe('1h 15m 30s');

    // 45 min 10 sec = (2700 + 10) * 1000 = 2710000 ms
    const subHour = formatAdFreeTime(2710000);
    expect(subHour).toBe('45m 10s');
  });

  it('ATS-06: formatAdFreeShort outputs human-readable Vietnamese time descriptions', () => {
    expect(formatAdFreeShort(0)).toBe('Hết hạn');

    const twoHours = 2 * 60 * 60 * 1000 + 15 * 60 * 1000;
    expect(formatAdFreeShort(twoHours)).toBe('2 giờ 15 phút');

    const thirtyMins = 30 * 60 * 1000;
    expect(formatAdFreeShort(thirtyMins)).toBe('30 phút');
  });
});
