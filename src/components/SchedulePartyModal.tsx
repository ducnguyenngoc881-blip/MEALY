import React, { useState } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Calendar as CalendarIcon, 
  X, 
  Check, 
  Sparkles, 
  Repeat, 
  CalendarDays, 
  Bell, 
  BellOff, 
  Users, 
  Utensils, 
  ChefHat, 
  AlertCircle 
} from 'lucide-react';
import { PartyRecurrenceType, ScheduledPartyEvent, Recipe } from '../types';
import { CORPORATE_PARTY_PRESETS } from '../data/corporatePartyPresets';
import { formatDateISO, formatVietnameseDate, parseDateISO } from '../utils/partyCalendarUtils';

interface SchedulePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD
  editingEvent?: ScheduledPartyEvent | null;
}

const EVENT_TYPES = [
  { id: 'family', label: 'Gia Đình', icon: '👨‍👩‍👧‍👦' },
  { id: 'birthday', label: 'Sinh Nhật', icon: '🎂' },
  { id: 'corporate', label: 'Công Ty', icon: '🏢' },
  { id: 'bbq', label: 'Dã Ngoại BBQ', icon: '🍖' },
  { id: 'wedding', label: 'Cưới Hỏi', icon: '💍' },
];

export const SchedulePartyModal: React.FC<SchedulePartyModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  editingEvent
}) => {
  const { 
    recipes, 
    partyPlan, 
    schedulePartyEvent, 
    updateScheduledPartyEvent, 
    userPartyPlans,
    showToast 
  } = useMealWise();

  const todayStr = formatDateISO(new Date());

  // Form states
  const [targetDate, setTargetDate] = useState<string>(
    editingEvent ? editingEvent.targetDate : (initialDate || todayStr)
  );
  const [recurrence, setRecurrence] = useState<PartyRecurrenceType>(
    editingEvent ? editingEvent.recurrence : 'none'
  );
  const [title, setTitle] = useState<string>(
    editingEvent ? editingEvent.title : (partyPlan.title || 'Tiệc Sinh Nhật Gia Đình')
  );
  const [eventType, setEventType] = useState<string>(
    editingEvent ? editingEvent.eventType : (partyPlan.eventType || 'family')
  );
  const [guestCount, setGuestCount] = useState<number>(
    editingEvent ? editingEvent.guestCount : (partyPlan.guestCount || 10)
  );
  const [tableSize, setTableSize] = useState<6 | 8 | 10>(
    editingEvent ? editingEvent.tableSize : (partyPlan.tableSize || 10)
  );
  const [enableNotifications, setEnableNotifications] = useState<boolean>(
    editingEvent ? editingEvent.enableNotifications : true
  );
  const [notes, setNotes] = useState<string>(
    editingEvent ? (editingEvent.notes || '') : (partyPlan.staffNotes || '')
  );

  // Menu source: 'current_builder' or 'preset'
  const [menuSource, setMenuSource] = useState<'current_builder' | 'preset'>('current_builder');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    CORPORATE_PARTY_PRESETS[0]?.id || ''
  );

  if (!isOpen) return null;

  // Calculate scaled food cost of active builder dishes
  const currentDishesCost = partyPlan.dishes.reduce((sum, item) => {
    const r = recipes.find(rec => rec.id === item.recipeId);
    if (!r) return sum;
    const s = r.servings && r.servings > 0 ? r.servings : 4;
    return sum + ((r.estimatedCostVnd || 40000) * (guestCount / s));
  }, 0);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('⚠️ Vui lòng nhập tên cho sự kiện tiệc!');
      return;
    }
    if (!targetDate) {
      showToast('⚠️ Vui lòng chọn ngày diễn ra sự kiện!');
      return;
    }

    let attachedDishes = partyPlan.dishes;
    let foodCost = Math.round(currentDishesCost);
    let dishesCount = partyPlan.dishes.length;
    let presetIdToSave: string | undefined = undefined;

    if (menuSource === 'preset') {
      const preset = CORPORATE_PARTY_PRESETS.find(p => p.id === selectedPresetId);
      if (preset) {
        presetIdToSave = preset.id;
        attachedDishes = preset.menuRecipes.map((r, i) => ({
          recipeId: r.id,
          course: (i === 0 ? 'appetizer' : i === 1 ? 'main' : 'staple') as any
        }));
        dishesCount = preset.menuRecipes.length;
        foodCost = Math.round(preset.suggestedPerHeadBudgetVnd * 0.4 * guestCount);
      }
    }

    const seasoningCost = Math.round(foodCost * 0.1);
    const totalEstimate = foodCost + seasoningCost;

    if (editingEvent) {
      updateScheduledPartyEvent(editingEvent.id, {
        title: trimmedTitle,
        eventType,
        targetDate,
        recurrence,
        guestCount,
        tableSize,
        dishesCount,
        totalFoodCostVnd: foodCost,
        totalEstimateVnd: totalEstimate,
        presetId: presetIdToSave,
        attachedDishes,
        enableNotifications,
        notes: notes.trim() || undefined
      });
    } else {
      schedulePartyEvent({
        title: trimmedTitle,
        eventType,
        targetDate,
        recurrence,
        guestCount,
        tableSize,
        dishesCount,
        totalFoodCostVnd: foodCost,
        totalEstimateVnd: totalEstimate,
        presetId: presetIdToSave,
        attachedDishes,
        enableNotifications,
        notes: notes.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E8E2D8] dark:border-[#252220] flex items-center justify-between shrink-0 bg-[#FAF8F5] dark:bg-[#121110]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                {editingEvent ? 'Chỉnh Sửa Lịch Tiệc' : 'Lên Kế Hoạch & Đặt Lịch Tiệc'}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Đặt lịch ngày tiệc, cài đặt lặp lại hàng năm/tháng và nhắc nhở
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. Recurrence Selector (Top Highlight) */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Tính Chất Lặp Lại Của Sự Kiện</span>
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                {recurrence === 'yearly' ? 'Sinh nhật / Kỷ niệm' : recurrence === 'monthly' ? 'Họp mặt định kỳ' : 'Tiệc riêng lẻ'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setRecurrence('none')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer ${
                  recurrence === 'none'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                    : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220] hover:border-amber-500/40'
                }`}
              >
                <span>1 Lần</span>
                <span className="text-[9px] opacity-80 font-normal">Không lặp lại</span>
              </button>

              <button
                type="button"
                onClick={() => setRecurrence('yearly')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer ${
                  recurrence === 'yearly'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                    : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220] hover:border-amber-500/40'
                }`}
              >
                <span>🔁 Hàng Năm</span>
                <span className="text-[9px] opacity-80 font-normal">Sinh nhật, cúng giỗ</span>
              </button>

              <button
                type="button"
                onClick={() => setRecurrence('monthly')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer ${
                  recurrence === 'monthly'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                    : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220] hover:border-amber-500/40'
                }`}
              >
                <span>🔄 Hàng Tháng</span>
                <span className="text-[9px] opacity-80 font-normal">Gặp mặt định kỳ</span>
              </button>
            </div>
          </div>

          {/* 2. Target Date Picker */}
          <div>
            <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
              Ngày Diễn Ra Sự Kiện <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            {targetDate && (
              <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-1 block">
                🗓️ {formatVietnameseDate(targetDate)}
                {recurrence === 'yearly' && ' (Sẽ tự động xuất hiện mỗi năm vào ngày này)'}
                {recurrence === 'monthly' && ' (Sẽ tự động xuất hiện mỗi tháng vào ngày này)'}
              </span>
            )}
          </div>

          {/* 3. Event Title & Event Type */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Tên Sự Kiện / Tiệc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Sinh Nhật Mẹ, Tiệc Tất Niên Công Ty, BBQ Cuối Tuần..."
                className="w-full bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Hình Thức Tiệc
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {EVENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEventType(type.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                      eventType === type.id
                        ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                        : 'bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300 hover:text-stone-900 border border-stone-200 dark:border-[#252220]'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Headcount & Table Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
              <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Số Lượng Khách
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-[#1A1918] border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-black text-center text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
              <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Quy Cách Bàn Tiệc
              </label>
              <div className="flex items-center gap-1">
                {([6, 8, 10] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTableSize(size)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      tableSize === size
                        ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                        : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {size}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Menu Attachment Selection */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Gắn Thực Đơn Món Ăn Cho Tiệc</span>
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setMenuSource('current_builder')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                  menuSource === 'current_builder'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                    : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220]'
                }`}
              >
                <span>Mâm Đang Lên Bếp</span>
                <span className="text-[10px] opacity-80 font-normal">
                  {partyPlan.dishes.length} món • ~{Math.round(currentDishesCost).toLocaleString('vi-VN')} đ
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMenuSource('preset')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                  menuSource === 'preset'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                    : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220]'
                }`}
              >
                <span>Thư Viện Mẫu Chuẩn</span>
                <span className="text-[10px] opacity-80 font-normal">
                  {CORPORATE_PARTY_PRESETS.length} mâm tiệc sẵn
                </span>
              </button>
            </div>

            {menuSource === 'preset' && (
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full bg-white dark:bg-[#1A1918] border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {CORPORATE_PARTY_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} (~{p.suggestedPerHeadBudgetVnd.toLocaleString('vi-VN')} đ/khách)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 6. Smart Notification Toggle */}
          <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                {enableNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-stone-900 dark:text-white">
                  Nhắc Nhở Kế Hoạch Thông Minh
                </h4>
                <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-snug">
                  Nhắc trước 30 ngày ➔ Nhắc hàng tuần ➔ Đếm ngược hàng ngày trong tuần tiệc
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setEnableNotifications(!enableNotifications)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                enableNotifications ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
              role="switch"
              aria-checked={enableNotifications}
              aria-label="Bật/Tắt nhắc nhở thông minh"
            >
              <span 
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  enableNotifications ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 7. Optional Notes */}
          <div>
            <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
              Ghi Chú Riêng (Khách mời, địa điểm, yêu cầu đặc biệt)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Nhà bác Hai tổ chức, cần chuẩn bị thêm 2 ghế trẻ em..."
              className="w-full bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 resize-none transition-colors"
            />
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-[#E8E2D8] dark:border-[#252220] bg-[#FAF8F5] dark:bg-[#121110] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{editingEvent ? 'Cập Nhật Lịch Tiệc' : 'Lưu Vào Lịch Tiệc'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
