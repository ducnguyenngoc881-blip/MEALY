import React, { useState, useMemo } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Repeat, 
  Bell, 
  BellOff, 
  Trash2, 
  Edit3, 
  Utensils, 
  Users, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { ScheduledPartyEvent, ConfirmDialogState } from '../types';
import { 
  formatDateISO, 
  formatVietnameseDate, 
  getMonthCalendarGrid, 
  isEventOnCalendarDate, 
  getUpcomingPartyNotifications,
  calculateDaysUntilEvent,
  resolvePartyNotificationTier
} from '../utils/partyCalendarUtils';

interface PartyCalendarViewProps {
  onOpenScheduleModal: (date?: string) => void;
  onEditEvent: (event: ScheduledPartyEvent) => void;
  onSwitchToBuilder: () => void;
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const WEEKDAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const PartyCalendarView: React.FC<PartyCalendarViewProps> = ({
  onOpenScheduleModal,
  onEditEvent,
  onSwitchToBuilder
}) => {
  const { 
    scheduledPartyEvents, 
    deleteScheduledPartyEvent, 
    togglePartyEventNotification,
    loadEventIntoPartyPlan,
    showToast 
  } = useMealWise();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateISO(today), [today]);

  // Calendar view month & year state
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewYear(prev => prev - 1);
      setViewMonthIndex(11);
    } else {
      setViewMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewYear(prev => prev + 1);
      setViewMonthIndex(0);
    } else {
      setViewMonthIndex(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonthIndex(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Build grid cells for the current view month
  const calendarCells = useMemo(() => {
    return getMonthCalendarGrid(viewYear, viewMonthIndex, today);
  }, [viewYear, viewMonthIndex, today]);

  // Active notifications for events within 30 days
  const activeNotifications = useMemo(() => {
    return getUpcomingPartyNotifications(scheduledPartyEvents, today);
  }, [scheduledPartyEvents, today]);

  // Events that occur on the currently selected date
  const selectedDateEvents = useMemo(() => {
    return scheduledPartyEvents.filter(evt => 
      isEventOnCalendarDate(evt, selectedDateStr, viewYear, viewMonthIndex)
    );
  }, [scheduledPartyEvents, selectedDateStr, viewYear, viewMonthIndex]);

  // Map of date string -> count of events for fast badge rendering in calendar grid
  const dateEventMap = useMemo(() => {
    const map = new Map<string, ScheduledPartyEvent[]>();
    calendarCells.forEach(cell => {
      const evts = scheduledPartyEvents.filter(evt => 
        isEventOnCalendarDate(evt, cell.dateStr, cell.year, cell.monthIndex)
      );
      if (evts.length > 0) {
        map.set(cell.dateStr, evts);
      }
    });
    return map;
  }, [calendarCells, scheduledPartyEvents]);

  const handleLoadAndCook = (event: ScheduledPartyEvent) => {
    loadEventIntoPartyPlan(event);
    onSwitchToBuilder();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* 1. Top Active Reminder Notification Banner (If any upcoming within 30 days) */}
      {activeNotifications.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Nhắc Nhở Lịch Tiệc Sắp Diễn Ra ({activeNotifications.length})</span>
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
              Tự động: 30 ngày ➔ Tuần ➔ Hàng ngày
            </span>
          </div>

          <div className="space-y-1.5">
            {activeNotifications.slice(0, 3).map((notif, i) => (
              <div 
                key={i}
                className="p-2.5 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${
                    notif.tier === 'today'
                      ? 'bg-rose-500 text-white'
                      : notif.tier === 'daily'
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300'
                  }`}>
                    {notif.tier === 'today'
                      ? 'HÔM NAY'
                      : notif.tier === 'daily'
                        ? `Còn ${notif.daysRemaining} ngày`
                        : `Còn ${notif.daysRemaining} ngày`}
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-white truncate">
                    {notif.message}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1.5 shrink-0 pl-7 sm:pl-0">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                    {notif.targetDateFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const matched = scheduledPartyEvents.find(e => e.id === notif.eventId);
                      if (matched) {
                        setSelectedDateStr(matched.targetDate);
                        handleLoadAndCook(matched);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Vào Bếp</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Calendar Header Card with Month Controls & "Make a Plan" Button */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-4">
        
        {/* Navigation & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              aria-label="Tháng trước"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-left min-w-[130px]">
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-tight">
                {MONTH_NAMES[viewMonthIndex]}, {viewYear}
              </h2>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                {dateEventMap.size} ngày có lịch tiệc
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              aria-label="Tháng sau"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-200 dark:bg-[#121110] dark:hover:bg-[#252220] text-stone-700 dark:text-stone-300 text-xs font-bold border border-stone-200 dark:border-[#252220] transition-colors cursor-pointer ml-1"
            >
              Hôm Nay
            </button>
          </div>

          {/* "Make a Plan" Primary Button */}
          <button
            type="button"
            onClick={() => onOpenScheduleModal(selectedDateStr)}
            className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer self-stretch sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Lên Kế Hoạch Tiệc</span>
          </button>
        </div>

        {/* 3. Month Grid */}
        <div className="space-y-1">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center pb-1 border-b border-[#E8E2D8] dark:border-[#252220]">
            {WEEKDAY_NAMES.map((w, idx) => (
              <span 
                key={w} 
                className={`text-[11px] font-black uppercase ${
                  idx >= 5 ? 'text-amber-800 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid Cells (35 or 42) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
            {calendarCells.map(cell => {
              const isSelected = cell.dateStr === selectedDateStr;
              const eventsOnCell = dateEventMap.get(cell.dateStr) || [];
              const hasEvents = eventsOnCell.length > 0;
              const hasYearly = eventsOnCell.some(e => e.recurrence === 'yearly');
              const hasMonthly = eventsOnCell.some(e => e.recurrence === 'monthly');

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[52px] sm:min-h-[64px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/50 font-black'
                      : cell.isCurrentMonth
                        ? cell.isToday
                          ? 'bg-[#FAF8F5] dark:bg-[#121110] text-stone-950 dark:text-white font-black border-2 border-amber-500/60 shadow-2xs'
                          : 'bg-[#FAF8F5] hover:bg-stone-100 dark:bg-[#121110] dark:hover:bg-[#252220] text-stone-900 dark:text-white border border-[#E8E2D8] dark:border-[#252220]'
                        : 'bg-transparent text-stone-400 dark:text-stone-600 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Day Number */}
                  <span className={`text-xs sm:text-sm font-black ${
                    isSelected ? 'text-stone-950' : cell.isToday ? 'text-amber-800 dark:text-amber-400' : ''
                  }`}>
                    {cell.dayNumber}
                  </span>

                  {/* Event Badges / Dots */}
                  {hasEvents && (
                    <div className="w-full flex items-center justify-center gap-0.5 mt-0.5">
                      {eventsOnCell.slice(0, 3).map((evt, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-stone-950'
                              : evt.recurrence === 'yearly'
                                ? 'bg-orange-500'
                                : evt.recurrence === 'monthly'
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                          }`}
                          title={`${evt.title} (${evt.guestCount} khách)`}
                        />
                      ))}
                      {eventsOnCell.length > 3 && (
                        <span className={`text-[8px] font-black ${isSelected ? 'text-stone-950' : 'text-amber-700 dark:text-amber-300'}`}>
                          +{eventsOnCell.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Recurrence micro-icon */}
                  {hasYearly && (
                    <span className={`text-[8px] absolute top-0.5 right-1 ${isSelected ? 'text-stone-950' : 'text-amber-800 dark:text-amber-400'}`}>
                      🔁
                    </span>
                  )}
                  {!hasYearly && hasMonthly && (
                    <span className={`text-[8px] absolute top-0.5 right-1 ${isSelected ? 'text-stone-950' : 'text-blue-600 dark:text-blue-400'}`}>
                      🔄
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E2D8] dark:border-[#252220] text-[10px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>🔁 Hàng năm (Sinh nhật, Giỗ)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>🔄 Hàng tháng (Định kỳ)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Tiệc 1 lần</span>
            </span>
          </div>

          <span className="font-semibold">
            {calendarCells.find(c => c.dateStr === selectedDateStr)?.dayNumber ? `Đang chọn: ${formatVietnameseDate(selectedDateStr)}` : ''}
          </span>
        </div>

      </div>

      {/* 4. Selected Day's Scheduled Events Drawer / List */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E2D8] dark:border-[#252220] pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-black text-stone-900 dark:text-white">
              Sự Kiện Ngày {formatVietnameseDate(selectedDateStr)}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onOpenScheduleModal(selectedDateStr)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đặt Lịch Ngày Này</span>
          </button>
        </div>

        {/* Events on this date */}
        {selectedDateEvents.length === 0 ? (
          <div className="py-8 text-center rounded-2xl border border-dashed border-[#E8E2D8] dark:border-[#252220] text-stone-500 dark:text-stone-400 space-y-2">
            <CalendarIcon className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs">Chưa có tiệc nào được lên lịch cho ngày này.</p>
            <button
              type="button"
              onClick={() => onOpenScheduleModal(selectedDateStr)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lên Kế Hoạch Cho Ngày Này</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateEvents.map(event => {
              const daysRemaining = calculateDaysUntilEvent(event.targetDate, event.recurrence, today);
              const notifTier = resolvePartyNotificationTier(daysRemaining);

              return (
                <div 
                  key={event.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] hover:border-amber-500/40 transition-all space-y-3 shadow-2xs"
                >
                  {/* Top Tags & Proximity Alert */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {event.recurrence === 'yearly' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/30 text-[10px] font-black flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          <span>Hàng Năm</span>
                        </span>
                      )}
                      {event.recurrence === 'monthly' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 text-[10px] font-black flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          <span>Hàng Tháng</span>
                        </span>
                      )}
                      {event.recurrence === 'none' && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-[#252220] text-stone-700 dark:text-stone-300 text-[10px] font-bold">
                          1 Lần
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-[#252220] text-stone-800 dark:text-stone-200 text-[10px] font-bold">
                        👥 {event.guestCount} khách ({Math.ceil(event.guestCount / event.tableSize)} bàn)
                      </span>
                    </div>

                    {/* Proximity / Countdown Tag */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      daysRemaining === 0
                        ? 'bg-rose-500 text-white animate-pulse'
                        : daysRemaining > 0 && daysRemaining <= 7
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-200 dark:bg-[#252220] text-stone-700 dark:text-stone-300'
                    }`}>
                      {daysRemaining === 0 
                        ? '🎉 Diễn ra hôm nay!' 
                        : daysRemaining > 0 
                          ? `Còn ${daysRemaining} ngày`
                          : 'Đã qua'}
                    </span>
                  </div>

                  {/* Title & Notes */}
                  <div>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white">
                      {event.title}
                    </h4>
                    {event.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                        📝 {event.notes}
                      </p>
                    )}
                  </div>

                  {/* Financial & Menu Summary Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-[#E8E2D8] dark:border-[#252220]">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 block text-[10px]">Thực Đơn:</span>
                      <span className="font-bold text-stone-900 dark:text-white">
                        {event.dishesCount} món
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 dark:text-stone-400 block text-[10px]">Food Cost Dự Toán:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {event.totalFoodCostVnd.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-stone-500 dark:text-stone-400 block text-[10px]">Tổng Dự Kiến:</span>
                      <span className="font-bold text-stone-900 dark:text-white">
                        ~{event.totalEstimateVnd.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E2D8] dark:border-[#252220]">
                    {/* Notification Toggle Button */}
                    <button
                      type="button"
                      onClick={() => togglePartyEventNotification(event.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        event.enableNotifications
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-stone-100 dark:bg-[#252220] text-stone-500 dark:text-stone-400'
                      }`}
                      title={event.enableNotifications ? 'Nhắc nhở đang BẬT (30 ngày -> Tuần -> Hàng ngày)' : 'Nhắc nhở đang TẮT'}
                    >
                      {event.enableNotifications ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{event.enableNotifications ? 'Nhắc nhở: BẬT' : 'Nhắc nhở: TẮT'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Load into Kitchen Builder Button */}
                      <button
                        type="button"
                        onClick={() => handleLoadAndCook(event)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        title="Nạp thực đơn này vào bếp để chuẩn bị nấu và đi chợ"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Nạp Vào Bếp</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditEvent(event)}
                        className="p-1.5 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        title="Chỉnh sửa lịch tiệc"
                        aria-label="Chỉnh sửa lịch tiệc"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Xóa Sự Kiện Lịch Tiệc',
                            message: `Bạn có chắc chắn muốn xóa sự kiện "${event.title}" khỏi Lịch Tiệc không?`,
                            confirmLabel: 'Xác Nhận Xóa',
                            isDanger: true,
                            onConfirm: () => {
                              deleteScheduledPartyEvent(event.id);
                            }
                          });
                        }}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Xóa sự kiện"
                        aria-label="Xóa sự kiện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setConfirmDialog(null)}
        >
          <div 
            className="bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-stone-900 dark:text-white leading-snug">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span>{confirmDialog.confirmLabel || 'Đồng ý'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
