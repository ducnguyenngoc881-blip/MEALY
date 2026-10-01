import { ScheduledPartyEvent, PartyRecurrenceType, PartyCalendarNotificationTier, PartyEventNotification } from '../types';

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a Date or date string to readable Vietnamese date (e.g. "15/10/2026" or "15 Th10, 2026")
 */
export function formatVietnameseDate(dateOrStr: Date | string, includeYear = true): string {
  const d = typeof dateOrStr === 'string' ? parseDateISO(dateOrStr) : dateOrStr;
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  if (includeYear) {
    return `${day} Th${month}, ${year}`;
  }
  return `${day} Th${month}`;
}

/**
 * Parse YYYY-MM-DD string into a local Date with time set to 00:00:00
 */
export function parseDateISO(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const d = parseInt(dayStr, 10);
  return new Date(y, m, d, 0, 0, 0, 0);
}

/**
 * Get total days in a given month (monthIndex: 0 = January, 11 = December)
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Get weekday of the 1st of the month, adjusted for Monday-first (0 = Monday, 6 = Sunday)
 */
export function getFirstDayOfWeekInMonth(year: number, monthIndex: number): number {
  const day = new Date(year, monthIndex, 1).getDay(); // 0 = Sun, 1 = Mon ...
  return day === 0 ? 6 : day - 1;
}

export interface CalendarDayCell {
  dateStr: string;
  dayNumber: number;
  monthIndex: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Build 35 or 42 grid cells for the monthly calendar view (Monday-first)
 */
export function getMonthCalendarGrid(year: number, monthIndex: number, todayRef = new Date()): CalendarDayCell[] {
  const todayStr = formatDateISO(todayRef);
  const daysInCurrentMonth = getDaysInMonth(year, monthIndex);
  const firstDayWeekday = getFirstDayOfWeekInMonth(year, monthIndex);

  // Previous month padding
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex);

  const cells: CalendarDayCell[] = [];

  // 1. Pad previous month trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateStr = formatDateISO(new Date(prevYear, prevMonthIndex, dayNum));
    cells.push({
      dateStr,
      dayNumber: dayNum,
      monthIndex: prevMonthIndex,
      year: prevYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = formatDateISO(new Date(year, monthIndex, d));
    cells.push({
      dateStr,
      dayNumber: d,
      monthIndex,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr
    });
  }

  // 3. Next month leading days (to complete 5 or 6 full weeks: 35 or 42 cells)
  const remainingCells = cells.length <= 35 ? 35 - cells.length : 42 - cells.length;
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;

  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = formatDateISO(new Date(nextYear, nextMonthIndex, d));
    cells.push({
      dateStr,
      dayNumber: d,
      monthIndex: nextMonthIndex,
      year: nextYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    });
  }

  return cells;
}

/**
 * Calculate the next calendar occurrence of an event relative to a reference date (today).
 * Handles:
 * - 'none': Return target date as is.
 * - 'monthly': Finds the next occurrence on target day-of-month (this month or next).
 * - 'yearly': Finds the next occurrence on target month-and-day (this year or next year).
 */
export function getNextOccurrenceDate(
  targetDateStr: string,
  recurrence: PartyRecurrenceType,
  referenceDate = new Date()
): Date {
  const orig = parseDateISO(targetDateStr);
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0, 0);

  if (recurrence === 'none') {
    return orig;
  }

  if (recurrence === 'monthly') {
    const targetDay = orig.getDate();
    // Try current month
    const curYear = ref.getFullYear();
    const curMonth = ref.getMonth();
    const maxDaysCurMonth = getDaysInMonth(curYear, curMonth);
    const dayInCurMonth = Math.min(targetDay, maxDaysCurMonth);
    const candidateThisMonth = new Date(curYear, curMonth, dayInCurMonth, 0, 0, 0, 0);

    if (candidateThisMonth.getTime() >= ref.getTime()) {
      return candidateThisMonth;
    }

    // Try next month
    const nextYear = curMonth === 11 ? curYear + 1 : curYear;
    const nextMonth = curMonth === 11 ? 0 : curMonth + 1;
    const maxDaysNextMonth = getDaysInMonth(nextYear, nextMonth);
    const dayInNextMonth = Math.min(targetDay, maxDaysNextMonth);
    return new Date(nextYear, nextMonth, dayInNextMonth, 0, 0, 0, 0);
  }

  if (recurrence === 'yearly') {
    const targetMonth = orig.getMonth();
    const targetDay = orig.getDate();
    const curYear = ref.getFullYear();
    const maxDaysThisYear = getDaysInMonth(curYear, targetMonth);
    const dayThisYear = Math.min(targetDay, maxDaysThisYear);
    const candidateThisYear = new Date(curYear, targetMonth, dayThisYear, 0, 0, 0, 0);

    if (candidateThisYear.getTime() >= ref.getTime()) {
      return candidateThisYear;
    }

    const nextYear = curYear + 1;
    const maxDaysNextYear = getDaysInMonth(nextYear, targetMonth);
    const dayNextYear = Math.min(targetDay, maxDaysNextYear);
    return new Date(nextYear, targetMonth, dayNextYear, 0, 0, 0, 0);
  }

  return orig;
}

/**
 * Calculate days remaining until the next occurrence of an event.
 * Returns negative if 'none' and already in the past.
 */
export function calculateDaysUntilEvent(
  targetDateStr: string,
  recurrence: PartyRecurrenceType,
  referenceDate = new Date()
): number {
  const nextDate = getNextOccurrenceDate(targetDateStr, recurrence, referenceDate);
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0, 0);
  const diffMs = nextDate.getTime() - ref.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine the notification milestone tier:
 * - 0 days: 'today' (Diễn ra hôm nay)
 * - 1..7 days: 'daily' (Tuần diễn ra sự kiện -> nhắc hàng ngày)
 * - 8..30 days: 'weekly' (Trước 30 ngày -> nhắc hàng tuần)
 * - Exactly 30 days: '30_days' (Cột mốc tròn 30 ngày)
 * - Other: 'none'
 */
export function resolvePartyNotificationTier(daysRemaining: number): PartyCalendarNotificationTier {
  if (daysRemaining === 0) return 'today';
  if (daysRemaining > 0 && daysRemaining <= 7) return 'daily';
  if (daysRemaining === 30) return '30_days';
  if (daysRemaining > 7 && daysRemaining <= 30) return 'weekly';
  return 'none';
}

/**
 * Generate human-friendly reminder message in Vietnamese
 */
export function getEventReminderMessage(
  title: string,
  daysRemaining: number,
  tier: PartyCalendarNotificationTier,
  recurrence: PartyRecurrenceType
): string {
  const recurrenceSuffix = recurrence === 'yearly' ? ' (Hàng năm)' : recurrence === 'monthly' ? ' (Hàng tháng)' : '';
  
  switch (tier) {
    case 'today':
      return `🎉 Hôm nay diễn ra sự kiện: "${title}"${recurrenceSuffix}! Chúc bạn có bữa tiệc trọn vẹn và ấm cúng.`;
    case 'daily':
      return `⚡ Còn ${daysRemaining} ngày tới "${title}"${recurrenceSuffix}! Kiểm tra số lượng khách, dụng cụ tiệc và danh sách đi chợ.`;
    case '30_days':
      return `📅 Tròn 30 ngày tới "${title}"${recurrenceSuffix}! Đã đến lúc lên ý tưởng thực đơn và chốt danh sách khách mời.`;
    case 'weekly':
      return `🔔 Nhắc nhở tuần: Còn ${daysRemaining} ngày (${Math.ceil(daysRemaining / 7)} tuần) tới "${title}"${recurrenceSuffix}.`;
    default:
      if (daysRemaining > 30) {
        return `🗓️ Còn ${daysRemaining} ngày tới "${title}".`;
      }
      return `"${title}"`;
  }
}

/**
 * Check if a scheduled event occurs on a specific calendar day in a given view month
 */
export function isEventOnCalendarDate(
  event: ScheduledPartyEvent,
  dateStr: string,
  viewYear: number,
  viewMonthIndex: number
): boolean {
  const [cellYStr, cellMStr, cellDStr] = dateStr.split('-');
  const cellY = parseInt(cellYStr, 10);
  const cellM = parseInt(cellMStr, 10) - 1;
  const cellD = parseInt(cellDStr, 10);

  const orig = parseDateISO(event.targetDate);
  const origY = orig.getFullYear();
  const origM = orig.getMonth();
  const origD = orig.getDate();

  if (event.recurrence === 'none') {
    return event.targetDate === dateStr;
  }

  if (event.recurrence === 'monthly') {
    // If original day is 31, and cell month has only 30 days, clamp to 30
    const maxDaysInCellMonth = getDaysInMonth(cellY, cellM);
    const effectiveDay = Math.min(origD, maxDaysInCellMonth);
    return cellD === effectiveDay;
  }

  if (event.recurrence === 'yearly') {
    if (cellM !== origM) return false;
    const maxDaysInCellMonth = getDaysInMonth(cellY, cellM);
    const effectiveDay = Math.min(origD, maxDaysInCellMonth);
    return cellD === effectiveDay;
  }

  return false;
}

/**
 * Get all active notifications sorted by urgency (closest events first)
 */
export function getUpcomingPartyNotifications(
  events: ScheduledPartyEvent[],
  referenceDate = new Date()
): PartyEventNotification[] {
  const notifications: PartyEventNotification[] = [];

  for (const evt of events) {
    if (evt.enableNotifications === false) continue;

    const daysRemaining = calculateDaysUntilEvent(evt.targetDate, evt.recurrence, referenceDate);
    const tier = resolvePartyNotificationTier(daysRemaining);

    if (tier !== 'none') {
      const nextDate = getNextOccurrenceDate(evt.targetDate, evt.recurrence, referenceDate);
      notifications.push({
        eventId: evt.id,
        eventTitle: evt.title,
        daysRemaining,
        tier,
        message: getEventReminderMessage(evt.title, daysRemaining, tier, evt.recurrence),
        targetDateFormatted: formatVietnameseDate(nextDate),
        recurrence: evt.recurrence,
        enableNotifications: true
      });
    }
  }

  // Sort: today first (0), then daily (1-7), then weekly (8-30)
  return notifications.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
