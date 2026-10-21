import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Eye,
  Wine
} from 'lucide-react';
import { PartyRecurrenceType, ScheduledPartyEvent, Recipe } from '../types';
import { CORPORATE_PARTY_PRESETS } from '../data/corporatePartyPresets';
import { formatDateISO, formatVietnameseDate, parseDateISO } from '../utils/partyCalendarUtils';
import { SafeImage } from './SafeImage';

interface SchedulePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD
  editingEvent?: ScheduledPartyEvent | null;
}

const EVENT_TYPES = [
  { id: 'family', label: 'Gia Đình', icon: '👨‍👩‍👧‍👦', defaultTitle: 'Tiệc Họp Mặt Gia Đình' },
  { id: 'birthday', label: 'Sinh Nhật', icon: '🎂', defaultTitle: 'Tiệc Sinh Nhật Ấm Cúng' },
  { id: 'corporate', label: 'Công Ty', icon: '🏢', defaultTitle: 'Tiệc Liên Hoan Công Ty' },
  { id: 'bbq', label: 'Dã Ngoại BBQ', icon: '🍖', defaultTitle: 'Tiệc Nướng BBQ Ngoài Trời' },
  { id: 'wedding', label: 'Cưới Hỏi', icon: '💍', defaultTitle: 'Tiệc Đám Cưới & Kỷ Niệm' },
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
    showToast 
  } = useMealWise();

  const todayStr = formatDateISO(new Date());

  // Form states - React hooks MUST be declared unconditionally at top
  const [step, setStep] = useState<1 | 2>(1);
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
  const [previewPresetId, setPreviewPresetId] = useState<string | null>(
    CORPORATE_PARTY_PRESETS[0]?.id || null
  );

  // Sync state whenever editingEvent or initialDate changes
  useEffect(() => {
    if (editingEvent) {
      setTargetDate(editingEvent.targetDate);
      setRecurrence(editingEvent.recurrence);
      setTitle(editingEvent.title);
      setEventType(editingEvent.eventType);
      setGuestCount(editingEvent.guestCount);
      setTableSize(editingEvent.tableSize);
      setEnableNotifications(editingEvent.enableNotifications);
      setNotes(editingEvent.notes || '');
      if (editingEvent.presetId) {
        setMenuSource('preset');
        setSelectedPresetId(editingEvent.presetId);
      } else {
        setMenuSource('current_builder');
      }
    } else {
      setTargetDate(initialDate || todayStr);
      setStep(1);
    }
  }, [editingEvent, initialDate, isOpen]);

  // Hook invariant: return null strictly AFTER all hooks
  if (!isOpen) return null;

  // Calculate scaled food cost of active builder dishes
  const currentDishesCost = partyPlan.dishes.reduce((sum, item) => {
    const r = recipes.find(rec => rec.id === item.recipeId);
    if (!r) return sum;
    const s = r.servings && r.servings > 0 ? r.servings : 4;
    return sum + ((r.estimatedCostVnd || 40000) * (guestCount / s));
  }, 0);

  const numTables = Math.ceil(guestCount / tableSize);

  const handleEventTypeSelect = (typeId: string) => {
    setEventType(typeId);
    const matched = EVENT_TYPES.find(t => t.id === typeId);
    if (matched && (!title.trim() || EVENT_TYPES.some(t => t.defaultTitle === title.trim()))) {
      setTitle(matched.defaultTitle);
    }
  };

  const handleStepGuestCount = (delta: number) => {
    setGuestCount(prev => Math.max(1, Math.min(500, prev + delta)));
  };

  const goToStep2 = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('⚠️ Vui lòng nhập tên cho sự kiện tiệc!');
      return;
    }
    if (!targetDate) {
      showToast('⚠️ Vui lòng chọn ngày diễn ra sự kiện!');
      return;
    }
    setStep(2);
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('⚠️ Vui lòng nhập tên cho sự kiện tiệc!');
      setStep(1);
      return;
    }
    if (!targetDate) {
      showToast('⚠️ Vui lòng chọn ngày diễn ra sự kiện!');
      setStep(1);
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
      showToast('✅ Đã cập nhật kế hoạch tiệc thành công!');
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
      showToast('🎉 Đã thêm tiệc mới vào Lịch Tiệc thành công!');
    }

    setStep(1);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl max-w-lg sm:max-w-xl md:max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#E8E2D8] dark:border-[#252220] flex items-center justify-between shrink-0 bg-[#FAF8F5] dark:bg-[#121110]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white leading-tight">
                {editingEvent ? 'Chỉnh Sửa Lịch Tiệc' : 'Lên Kế Hoạch Đặt Tiệc'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                {step === 1 ? 'Bước 1/2: Thời gian, loại tiệc & số lượng khách' : 'Bước 2/2: Thực đơn món ăn & nhắc nhở thông minh'}
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

        {/* 2-Step Modern Flow Progress Indicator */}
        <div className="px-5 py-2.5 bg-stone-50/70 dark:bg-[#161514] border-b border-[#E8E2D8] dark:border-[#252220] flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              step === 1
                ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                : 'bg-white dark:bg-[#1A1918] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
              step === 1 ? 'bg-stone-950 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
            }`}>
              1
            </span>
            <span>Thời Gian & Khách</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

          <button
            type="button"
            onClick={goToStep2}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              step === 2
                ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                : 'bg-white dark:bg-[#1A1918] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
              step === 2 ? 'bg-stone-950 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
            }`}>
              2
            </span>
            <span>Thực Đơn & Nhắc Nhở</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* ================= STEP 1: DATE, OCCASION & GUEST COUNT ================= */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              
              {/* 1. Date & Recurrence Unified Card */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Ngày Diễn Ra Sự Kiện</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    {targetDate ? formatVietnameseDate(targetDate) : ''}
                  </span>
                </div>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-white dark:bg-[#1A1918] border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
                />

                {/* Recurrence Segmented Control */}
                <div className="space-y-1.5 pt-1 border-t border-stone-200/80 dark:border-stone-800">
                  <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                    Chu Kỳ Lặp Lại
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRecurrence('none')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        recurrence === 'none'
                          ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                          : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      1 Lần
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurrence('yearly')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        recurrence === 'yearly'
                          ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                          : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      🔁 Hàng Năm
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurrence('monthly')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        recurrence === 'monthly'
                          ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                          : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      🔄 Hàng Tháng
                    </button>
                  </div>

                  <p className="text-[10px] text-stone-500 dark:text-stone-400 italic pt-0.5">
                    {recurrence === 'yearly' && '🎂 Nhắc lại vào ngày này mỗi năm (thích hợp cho sinh nhật, kỷ niệm, cúng giỗ).'}
                    {recurrence === 'monthly' && '🔄 Tự động nhắc lại vào ngày này mỗi tháng (thích hợp cho họp mặt định kỳ).'}
                    {recurrence === 'none' && '🗓️ Sự kiện diễn ra 1 lần duy nhất theo ngày đã chọn.'}
                  </p>
                </div>
              </div>

              {/* 2. Title & Occasion */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Tên Sự Kiện / Tiệc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Sinh Nhật Bé An, Liên Hoan Cuối Năm..."
                    className="w-full bg-white dark:bg-[#1A1918] border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                </div>

                <div>
                  <span className="block text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                    Hình Thức Tiệc
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {EVENT_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleEventTypeSelect(type.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                          eventType === type.id
                            ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                            : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Guests & Table Layout */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Quy Mô Khách & Bố Trí Bàn</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/25">
                    = {numTables} bàn ({tableSize} khách/bàn)
                  </span>
                </div>

                {/* Headcount Stepper Row */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Số Lượng Khách:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepGuestCount(-5)}
                      className="w-8 h-8 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-900 dark:text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      title="Giảm 5 khách"
                      aria-label="Giảm 5 khách"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-8 text-center font-black text-xs bg-white dark:bg-[#1A1918] text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepGuestCount(5)}
                      className="w-8 h-8 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-900 dark:text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      title="Tăng 5 khách"
                      aria-label="Tăng 5 khách"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Table capacity chips */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/80 dark:border-stone-800">
                  <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Quy Cách Bàn:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {([6, 8, 10] as const).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTableSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          tableSize === size
                            ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                            : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {size} khách/bàn
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 2: MENU & SMART NOTIFICATIONS ================= */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              
              {/* 1. Menu Selection */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Gắn Thực Đơn Cho Tiệc</span>
                </span>

                {/* Segmented Source Switch */}
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

                {/* Source A: Current Builder Summary */}
                {menuSource === 'current_builder' && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1918] border border-stone-200 dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold border-b border-stone-100 dark:border-stone-800 pb-2">
                      <span className="text-stone-800 dark:text-stone-200">
                        {partyPlan.dishes.length > 0 ? `Đang có ${partyPlan.dishes.length} món trong mâm` : 'Chưa có món nào trong mâm'}
                      </span>
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/25">
                        ~{Math.round(currentDishesCost).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {partyPlan.dishes.length > 0 ? (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5 scrollbar-thin">
                        {partyPlan.dishes.map((item, idx) => {
                          const r = recipes.find(rec => rec.id === item.recipeId);
                          if (!r) return null;
                          return (
                            <div 
                              key={`${item.recipeId}-${idx}`} 
                              className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#161514] border border-stone-200/60 dark:border-stone-800"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800">
                                <SafeImage
                                  src={r.imageUrl}
                                  alt={r.title}
                                  dishTitle={r.title}
                                  category={r.category}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-extrabold text-stone-900 dark:text-white truncate">
                                  {r.title}
                                </div>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                                  <span className="font-semibold text-amber-700 dark:text-amber-400">{r.category || 'Món tiệc'}</span>
                                  <span>•</span>
                                  <span>~{((r.estimatedCostVnd || 40000) * (guestCount / (r.servings || 4))).toLocaleString('vi-VN')} đ</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic py-2 text-center">
                        Mâm tiệc chưa có món ăn. Bạn có thể chọn "Thư Viện Mẫu Chuẩn" bên cạnh để chọn thực đơn có sẵn hoặc thêm món từ Sổ Tay Công Thức sau.
                      </p>
                    )}
                  </div>
                )}

                {/* Source B: Custom Styled Preset Cards with Expandable Dish Details */}
                {menuSource === 'preset' && (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
                    {CORPORATE_PARTY_PRESETS.map(preset => {
                      const isSelected = selectedPresetId === preset.id;
                      const isExpanded = previewPresetId === preset.id;

                      return (
                        <div
                          key={preset.id}
                          className={`p-3 rounded-2xl border transition-all text-left space-y-2.5 ${
                            isSelected
                              ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/80 shadow-2xs'
                              : 'bg-white dark:bg-[#1A1918] border-stone-200/90 dark:border-stone-800 hover:border-amber-400'
                          }`}
                        >
                          {/* Card Header Row (Click to select & auto-expand) */}
                          <div 
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedPresetId(preset.id);
                              setPreviewPresetId(preset.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedPresetId(preset.id);
                                setPreviewPresetId(preset.id);
                              }
                            }}
                            className="flex items-start justify-between gap-2.5 cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-stone-900 dark:text-white leading-snug">
                                {preset.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 dark:text-stone-400 flex-wrap">
                                <span className="font-extrabold text-amber-800 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-500/25">
                                  ~{preset.suggestedPerHeadBudgetVnd.toLocaleString('vi-VN')} đ/khách
                                </span>
                                <span>•</span>
                                <span className="font-medium text-stone-600 dark:text-stone-300">
                                  {preset.menuRecipes.length} món tiệc chuẩn
                                </span>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 shadow-2xs'
                                : 'border-2 border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Quick Actions Row: Toggle View Details */}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800/80">
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                              {isSelected ? 'Đang chọn mẫu này' : 'Chạm để chọn mẫu'}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPresetId(prev => (prev === preset.id ? null : preset.id));
                              }}
                              className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-amber-500/15 dark:bg-amber-950/40 hover:bg-amber-500/25 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isExpanded ? 'Thu gọn' : `Xem món (${preset.menuRecipes.length})`}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Expandable Dish Breakdown */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80 space-y-2.5 animate-fade-in">
                              {preset.description && (
                                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed italic bg-stone-50 dark:bg-[#161514] p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
                                  {preset.description}
                                </p>
                              )}

                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                                  Danh sách món trong thực đơn ({preset.menuRecipes.length} món):
                                </span>
                                <div className="space-y-1.5">
                                  {preset.menuRecipes.map((recipe, rIdx) => (
                                    <div 
                                      key={`${recipe.id}-${rIdx}`}
                                      className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-[#161514] border border-stone-200/60 dark:border-stone-800"
                                    >
                                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800">
                                        <SafeImage
                                          src={recipe.imageUrl}
                                          alt={recipe.title}
                                          dishTitle={recipe.title}
                                          category={recipe.category}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs font-black text-stone-900 dark:text-white leading-tight truncate">
                                          {recipe.title}
                                        </div>
                                        <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                                          <span className="font-semibold text-amber-700 dark:text-amber-400">{recipe.category || 'Món chính'}</span>
                                          {recipe.servings && <span>• {recipe.servings} phần</span>}
                                          {recipe.cookTimeMinutes && <span>• ~{recipe.cookTimeMinutes}p</span>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {preset.recommendedDrinks && preset.recommendedDrinks.length > 0 && (
                                <div className="pt-1 flex items-start gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                                  <Wine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  <span className="leading-snug">
                                    <strong className="text-stone-700 dark:text-stone-300">Đồ uống gợi ý:</strong> {preset.recommendedDrinks.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Smart Notification Switch Row */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                    {enableNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-stone-900 dark:text-white">
                      Nhắc Nhở Kế Hoạch Thông Minh
                    </h4>
                    <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-snug">
                      Nhắc trước 30 ngày • Hàng tuần • Đếm ngược mỗi ngày trong tuần tiệc
                    </p>
                  </div>
                </div>

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

              {/* 3. Optional Notes */}
              <div>
                <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Ghi Chú Riêng (Khách mời, địa điểm, yêu cầu đặc biệt)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Khách yêu cầu chuẩn bị đồ ăn trước 11:30 trưa. Bố trí bàn tiệc gần cửa sổ..."
                  className="w-full bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                />
              </div>

            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-[#E8E2D8] dark:border-[#252220] bg-[#FAF8F5] dark:bg-[#121110] flex items-center justify-between gap-2 shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={goToStep2}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span>Tiếp Theo: Chọn Thực Đơn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Bước 1</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingEvent ? 'Cập Nhật Lịch Tiệc' : 'Lưu Vào Lịch Tiệc'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
