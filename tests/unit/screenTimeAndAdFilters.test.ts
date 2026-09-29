import { describe, it, expect } from '../helpers/testRunner';
import {
  loadScreenTimeState,
  saveScreenTimeState,
  getScreenTimeStats,
  formatDuration,
  formatDurationShort,
  recordActiveSeconds,
  ScreenTimeTimeframe
} from '../../src/utils/screenTimeService';
import {
  recordAdImpression,
  getAdMetricsByTimeframe,
  loadAdTrackingState,
  TimeframeFilter
} from '../../src/utils/adTrackingService';

describe('Unit: Screen Time & Ad Tracking Multi-Timeframe Engine', () => {
  it('STA-01: formatDuration correctly formats seconds into human-readable strings', () => {
    expect(formatDuration(0)).toBe('0 giây');
    expect(formatDuration(45)).toBe('45 giây');
    expect(formatDuration(60)).toBe('1 phút');
    expect(formatDuration(125)).toBe('2p 5s');
    expect(formatDuration(3600)).toBe('1 giờ');
    expect(formatDuration(3665)).toBe('1h 1m');
    expect(formatDuration(7325)).toBe('2h 2m');
  });

  it('STA-02: formatDurationShort formats compact duration labels', () => {
    expect(formatDurationShort(0)).toBe('0s');
    expect(formatDurationShort(45)).toBe('45s');
    expect(formatDurationShort(120)).toBe('2m');
    expect(formatDurationShort(3600)).toBe('1h');
    expect(formatDurationShort(5400)).toBe('1h 30m');
  });

  it('STA-03: recordActiveSeconds accumulates session, daily, and history seconds correctly', () => {
    // Reset/seed state
    const initial = loadScreenTimeState();
    const today = new Date().toISOString().split('T')[0];

    const state = {
      ...initial,
      currentSessionSeconds: 10,
      dailyLogs: {
        ...initial.dailyLogs,
        [today]: {
          date: today,
          activeSeconds: 100,
          sessionCount: 1
        }
      },
      lifetimeSeconds: 100
    };
    saveScreenTimeState(state);

    const updated = recordActiveSeconds(15);
    expect(updated.currentSessionSeconds).toBe(25);
    expect(updated.dailyLogs[today].activeSeconds).toBe(115);
    expect(updated.lifetimeSeconds).toBe(115);
  });

  it('STA-04: getScreenTimeStats calculates correct duration for day, month, year, and lifetime', () => {
    const today = new Date().toISOString().split('T')[0];
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
    const twoHundredDaysAgo = new Date(Date.now() - 200 * 86400000).toISOString().split('T')[0];
    const fiveHundredDaysAgo = new Date(Date.now() - 500 * 86400000).toISOString().split('T')[0];

    const mockState = {
      currentSessionStart: Date.now(),
      currentSessionSeconds: 0,
      dailyLogs: {
        [today]: { date: today, activeSeconds: 600, sessionCount: 1 },
        [tenDaysAgo]: { date: tenDaysAgo, activeSeconds: 1200, sessionCount: 2 },
        [twoHundredDaysAgo]: { date: twoHundredDaysAgo, activeSeconds: 1800, sessionCount: 3 },
        [fiveHundredDaysAgo]: { date: fiveHundredDaysAgo, activeSeconds: 2400, sessionCount: 4 }
      },
      lifetimeSeconds: 6000
    };
    saveScreenTimeState(mockState);

    const dayStats = getScreenTimeStats('day');
    expect(dayStats.totalSeconds).toBe(600);

    const monthStats = getScreenTimeStats('month');
    expect(monthStats.totalSeconds).toBe(600 + 1200);

    const yearStats = getScreenTimeStats('year');
    expect(yearStats.totalSeconds).toBe(600 + 1200 + 1800);

    const lifetimeStats = getScreenTimeStats('lifetime');
    expect(lifetimeStats.totalSeconds).toBe(6000);
  });

  it('STA-05: recordAdImpression logs impressions and computes metrics across all 4 timeframe filters', () => {
    // Record various impressions with positional arguments
    recordAdImpression(
      'rewarded_video',
      'Test Rewarded Ad (30s)',
      30,
      8,
      'Test User'
    );

    recordAdImpression(
      'interstitial',
      'Test Interstitial Ad (15s)',
      15,
      0,
      'Test User'
    );

    recordAdImpression(
      'banner',
      'Test Banner Ad (5s)',
      5,
      0,
      'Test User'
    );

    // Verify 'day' filter
    const dayMetrics = getAdMetricsByTimeframe('day');
    expect(dayMetrics.totalAds).toBeGreaterThanOrEqual(3);
    expect(dayMetrics.rewardedVideoAds).toBeGreaterThanOrEqual(1);
    expect(dayMetrics.interstitialAds).toBeGreaterThanOrEqual(1);
    expect(dayMetrics.bannerImpressions).toBeGreaterThanOrEqual(1);

    // Verify 'month' filter captures at least all today's ads
    const monthMetrics = getAdMetricsByTimeframe('month');
    expect(monthMetrics.totalAds).toBeGreaterThanOrEqual(dayMetrics.totalAds);

    // Verify 'year' filter captures at least month ads
    const yearMetrics = getAdMetricsByTimeframe('year');
    expect(yearMetrics.totalAds).toBeGreaterThanOrEqual(monthMetrics.totalAds);

    // Verify 'lifetime' filter captures at least year ads
    const lifetimeMetrics = getAdMetricsByTimeframe('lifetime');
    expect(lifetimeMetrics.totalAds).toBeGreaterThanOrEqual(yearMetrics.totalAds);

    // Completion rate, revenue, and ad-free hours calculation
    expect(lifetimeMetrics.completionRate).toBeGreaterThan(0);
    expect(lifetimeMetrics.completionRate).toBeLessThanOrEqual(100);
    expect(lifetimeMetrics.estimatedRevenueVnd).toBeGreaterThan(0);
    expect(lifetimeMetrics.totalAdFreeHours).toBeGreaterThan(0);
  });

  it('STA-06: Admin account is NEVER tracked for screen time', () => {
    // Simulate admin login
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mealwise_registered_user', JSON.stringify({
        name: 'MealWise Administrator',
        email: 'admin@mealwise.vn',
        role: 'admin',
        isRegistered: true
      }));
    }

    const stateBefore = loadScreenTimeState();
    const lifetimeBefore = stateBefore.lifetimeSeconds;

    // Attempt to record active seconds while admin is active
    const result = recordActiveSeconds(120);

    // Assert that screen time was NOT accumulated for admin
    expect(result.lifetimeSeconds).toBe(lifetimeBefore);

    // Clean up admin login
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mealwise_registered_user');
    }
  });

  it('STA-07: Admin account is NEVER tracked for ad watches', () => {
    const beforeMetrics = getAdMetricsByTimeframe('day');

    // Attempt to record ad watched by Admin
    const record = recordAdImpression(
      'rewarded_video',
      'Admin Internal Preview Ad',
      30,
      8,
      'Admin'
    );

    // Should return skipped record and NOT be added to history/metrics
    expect(record.id.includes('admin-skipped')).toBe(true);

    const afterMetrics = getAdMetricsByTimeframe('day');
    expect(afterMetrics.totalAds).toBe(beforeMetrics.totalAds);
  });
});
