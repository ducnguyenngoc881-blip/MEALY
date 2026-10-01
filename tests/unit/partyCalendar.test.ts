import { describe, it, expect } from '../helpers/testRunner';
import { 
  formatDateISO, 
  parseDateISO, 
  getDaysInMonth, 
  getFirstDayOfWeekInMonth, 
  getMonthCalendarGrid, 
  getNextOccurrenceDate, 
  calculateDaysUntilEvent, 
  resolvePartyNotificationTier, 
  getEventReminderMessage, 
  isEventOnCalendarDate, 
  getUpcomingPartyNotifications 
} from '../../src/utils/partyCalendarUtils';
import { ScheduledPartyEvent } from '../../src/types';

describe('Unit: Party Calendar & Recurrence Scheduler Math', () => {
  it('should format and parse ISO date strings consistently', () => {
    const d = new Date(2026, 9, 15, 0, 0, 0, 0); // October 15, 2026
    const str = formatDateISO(d);
    expect(str).toBe('2026-10-15');

    const parsed = parseDateISO('2026-10-15');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9); // 0-indexed month
    expect(parsed.getDate()).toBe(15);
  });

  it('should calculate days in month accurately including leap years', () => {
    expect(getDaysInMonth(2026, 9)).toBe(31); // Oct 2026
    expect(getDaysInMonth(2026, 10)).toBe(30); // Nov 2026
    expect(getDaysInMonth(2026, 11)).toBe(31); // Dec 2026
    expect(getDaysInMonth(2025, 1)).toBe(28); // Feb 2025 (non-leap)
    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap)
    expect(getDaysInMonth(2028, 1)).toBe(29); // Feb 2028 (leap)
  });

  it('should generate valid 35 or 42 grid cells with correct Monday-first day orientation', () => {
    // October 2026: Oct 1 is Thursday -> First day weekday index is 3 (Mon=0, Tue=1, Wed=2, Thu=3)
    const gridOct = getMonthCalendarGrid(2026, 9, new Date(2026, 9, 1));
    expect(gridOct.length === 35 || gridOct.length === 42).toBe(true);

    // 3 days padded from previous month (Sep 28, 29, 30)
    expect(gridOct[0].dayNumber).toBe(28);
    expect(gridOct[0].isCurrentMonth).toBe(false);
    expect(gridOct[1].dayNumber).toBe(29);
    expect(gridOct[2].dayNumber).toBe(30);

    // 4th cell is Oct 1st
    expect(gridOct[3].dayNumber).toBe(1);
    expect(gridOct[3].isCurrentMonth).toBe(true);
    expect(gridOct[3].dateStr).toBe('2026-10-01');

    // Day 15
    const oct15Cell = gridOct.find(c => c.dateStr === '2026-10-15');
    expect(oct15Cell).toBeDefined();
    expect(oct15Cell?.dayNumber).toBe(15);
    expect(oct15Cell?.isCurrentMonth).toBe(true);
  });

  it('should compute next occurrence date for yearly events (Birthdays, Anniversaries)', () => {
    // Case 1: Birthday is Oct 15. Today is Oct 1, 2026 -> Occurrence is Oct 15, 2026
    const refDate1 = new Date(2026, 9, 1);
    const next1 = getNextOccurrenceDate('2024-10-15', 'yearly', refDate1);
    expect(formatDateISO(next1)).toBe('2026-10-15');

    // Case 2: Birthday is Oct 15. Today is Oct 16, 2026 (already passed this year) -> Occurrence is Oct 15, 2027
    const refDate2 = new Date(2026, 9, 16);
    const next2 = getNextOccurrenceDate('2024-10-15', 'yearly', refDate2);
    expect(formatDateISO(next2)).toBe('2027-10-15');

    // Case 3: Birthday is today (Oct 15, 2026) -> Occurrence is today
    const refDate3 = new Date(2026, 9, 15);
    const next3 = getNextOccurrenceDate('2024-10-15', 'yearly', refDate3);
    expect(formatDateISO(next3)).toBe('2026-10-15');
  });

  it('should compute next occurrence date for monthly recurring events', () => {
    // Event is on the 25th of every month. Today is Oct 5, 2026 -> Occurrence is Oct 25, 2026
    const refDate1 = new Date(2026, 9, 5);
    const next1 = getNextOccurrenceDate('2026-01-25', 'monthly', refDate1);
    expect(formatDateISO(next1)).toBe('2026-10-25');

    // Event is on the 25th. Today is Oct 26, 2026 -> Occurrence is Nov 25, 2026
    const refDate2 = new Date(2026, 9, 26);
    const next2 = getNextOccurrenceDate('2026-01-25', 'monthly', refDate2);
    expect(formatDateISO(next2)).toBe('2026-11-25');

    // Edge case: Month-end clamping for 31st on a 30-day month (e.g. Nov 30)
    const refDate3 = new Date(2026, 10, 1); // Nov 1
    const next3 = getNextOccurrenceDate('2026-01-31', 'monthly', refDate3);
    expect(formatDateISO(next3)).toBe('2026-11-30');
  });

  it('should accurately calculate days until event', () => {
    const todayRef = new Date(2026, 9, 1); // Oct 1, 2026
    expect(calculateDaysUntilEvent('2026-10-01', 'none', todayRef)).toBe(0);
    expect(calculateDaysUntilEvent('2026-10-04', 'none', todayRef)).toBe(3);
    expect(calculateDaysUntilEvent('2026-10-08', 'none', todayRef)).toBe(7);
    expect(calculateDaysUntilEvent('2026-10-31', 'none', todayRef)).toBe(30);
  });

  it('should resolve tiered notification thresholds (30 days -> weekly -> daily in event week -> today)', () => {
    expect(resolvePartyNotificationTier(0)).toBe('today');
    expect(resolvePartyNotificationTier(1)).toBe('daily');
    expect(resolvePartyNotificationTier(3)).toBe('daily');
    expect(resolvePartyNotificationTier(7)).toBe('daily');
    expect(resolvePartyNotificationTier(8)).toBe('weekly');
    expect(resolvePartyNotificationTier(14)).toBe('weekly');
    expect(resolvePartyNotificationTier(21)).toBe('weekly');
    expect(resolvePartyNotificationTier(30)).toBe('30_days');
    expect(resolvePartyNotificationTier(31)).toBe('none');
    expect(resolvePartyNotificationTier(45)).toBe('none');
  });

  it('should format Vietnamese reminder messages with correct recurrence and countdowns', () => {
    const msgToday = getEventReminderMessage('Sinh Nhật Mẹ', 0, 'today', 'yearly');
    expect(msgToday.includes('Hôm nay')).toBe(true);
    expect(msgToday.includes('Sinh Nhật Mẹ')).toBe(true);

    const msgDaily = getEventReminderMessage('Tiệc Tất Niên', 3, 'daily', 'none');
    expect(msgDaily.includes('Còn 3 ngày')).toBe(true);
    expect(msgDaily.includes('Tiệc Tất Niên')).toBe(true);

    const msgWeekly = getEventReminderMessage('Happy Hour', 14, 'weekly', 'monthly');
    expect(msgWeekly.includes('14 ngày')).toBe(true);
    expect(msgWeekly.includes('2 tuần')).toBe(true);

    const msg30 = getEventReminderMessage('Kỷ Niệm Ngày Cưới', 30, '30_days', 'yearly');
    expect(msg30.includes('30 ngày')).toBe(true);
  });

  it('should detect if event occurs on calendar date for non-recurring, monthly, and yearly events', () => {
    const yearlyEvent: ScheduledPartyEvent = {
      id: 'evt-1',
      title: 'Sinh Nhật',
      eventType: 'birthday',
      targetDate: '2024-10-15',
      recurrence: 'yearly',
      guestCount: 20,
      tableSize: 10,
      dishesCount: 5,
      totalFoodCostVnd: 500000,
      totalEstimateVnd: 550000,
      attachedDishes: [],
      enableNotifications: true,
      createdAt: '2024-10-15T00:00:00Z'
    };

    // Should appear on Oct 15 in 2026, 2027, 2028
    expect(isEventOnCalendarDate(yearlyEvent, '2026-10-15', 2026, 9)).toBe(true);
    expect(isEventOnCalendarDate(yearlyEvent, '2027-10-15', 2027, 9)).toBe(true);
    // Should NOT appear on Oct 14 or Nov 15
    expect(isEventOnCalendarDate(yearlyEvent, '2026-10-14', 2026, 9)).toBe(false);
    expect(isEventOnCalendarDate(yearlyEvent, '2026-11-15', 2026, 10)).toBe(false);

    const monthlyEvent: ScheduledPartyEvent = {
      id: 'evt-2',
      title: 'Họp Mặt',
      eventType: 'corporate',
      targetDate: '2026-01-20',
      recurrence: 'monthly',
      guestCount: 15,
      tableSize: 8,
      dishesCount: 4,
      totalFoodCostVnd: 300000,
      totalEstimateVnd: 330000,
      attachedDishes: [],
      enableNotifications: true,
      createdAt: '2026-01-20T00:00:00Z'
    };

    // Should appear on the 20th of any month
    expect(isEventOnCalendarDate(monthlyEvent, '2026-10-20', 2026, 9)).toBe(true);
    expect(isEventOnCalendarDate(monthlyEvent, '2026-12-20', 2026, 11)).toBe(true);
    expect(isEventOnCalendarDate(monthlyEvent, '2026-10-21', 2026, 9)).toBe(false);

    const oneOffEvent: ScheduledPartyEvent = {
      id: 'evt-3',
      title: 'Tiệc Tân Gia',
      eventType: 'family',
      targetDate: '2026-10-28',
      recurrence: 'none',
      guestCount: 30,
      tableSize: 10,
      dishesCount: 6,
      totalFoodCostVnd: 800000,
      totalEstimateVnd: 880000,
      attachedDishes: [],
      enableNotifications: true,
      createdAt: '2026-10-01T00:00:00Z'
    };

    expect(isEventOnCalendarDate(oneOffEvent, '2026-10-28', 2026, 9)).toBe(true);
    expect(isEventOnCalendarDate(oneOffEvent, '2027-10-28', 2027, 9)).toBe(false);
  });

  it('should filter upcoming notifications by user toggle and sort by proximity', () => {
    const todayRef = new Date(2026, 9, 1); // Oct 1, 2026

    const events: ScheduledPartyEvent[] = [
      {
        id: 'evt-far',
        title: 'Tiệc Hè',
        eventType: 'bbq',
        targetDate: '2026-12-01', // 61 days away
        recurrence: 'none',
        guestCount: 10,
        tableSize: 10,
        dishesCount: 2,
        totalFoodCostVnd: 200000,
        totalEstimateVnd: 220000,
        attachedDishes: [],
        enableNotifications: true,
        createdAt: '2026-10-01T00:00:00Z'
      },
      {
        id: 'evt-weekly',
        title: 'Sinh Nhật Bạn',
        eventType: 'birthday',
        targetDate: '2026-10-15', // 14 days away -> weekly
        recurrence: 'none',
        guestCount: 15,
        tableSize: 10,
        dishesCount: 4,
        totalFoodCostVnd: 400000,
        totalEstimateVnd: 440000,
        attachedDishes: [],
        enableNotifications: true,
        createdAt: '2026-10-01T00:00:00Z'
      },
      {
        id: 'evt-daily',
        title: 'Cỗ Cuối Tuần',
        eventType: 'family',
        targetDate: '2026-10-04', // 3 days away -> daily
        recurrence: 'none',
        guestCount: 12,
        tableSize: 6,
        dishesCount: 5,
        totalFoodCostVnd: 500000,
        totalEstimateVnd: 550000,
        attachedDishes: [],
        enableNotifications: true,
        createdAt: '2026-10-01T00:00:00Z'
      },
      {
        id: 'evt-disabled',
        title: 'Tiệc Tắt Nhắc Nhở',
        eventType: 'family',
        targetDate: '2026-10-03', // 2 days away but notifications disabled
        recurrence: 'none',
        guestCount: 10,
        tableSize: 10,
        dishesCount: 3,
        totalFoodCostVnd: 300000,
        totalEstimateVnd: 330000,
        attachedDishes: [],
        enableNotifications: false, // user turned off
        createdAt: '2026-10-01T00:00:00Z'
      }
    ];

    const notifs = getUpcomingPartyNotifications(events, todayRef);

    // evt-far is >30 days -> excluded
    // evt-disabled has enableNotifications=false -> excluded
    expect(notifs.length).toBe(2);

    // Sorted by urgency: evt-daily (3 days) first, then evt-weekly (14 days)
    expect(notifs[0].eventId).toBe('evt-daily');
    expect(notifs[0].tier).toBe('daily');
    expect(notifs[0].daysRemaining).toBe(3);

    expect(notifs[1].eventId).toBe('evt-weekly');
    expect(notifs[1].tier).toBe('weekly');
    expect(notifs[1].daysRemaining).toBe(14);
  });
});
