import React, { useState, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { X, Sparkles, Utensils, DollarSign, Flame, Calendar, PlusCircle, Check, RefreshCw } from 'lucide-react';
import { MealSlot, isMealSet } from '../types';
import { SafeImage } from './SafeImage';
import { isHotpotOrFeast } from '../utils/textUtils';
import { scaleCost, getDailyBudgetTarget } from '../utils/currency';

const cleanDishTitle = (title: string) => {
  if (!title) return '';
  return title.replace(/^Mâm Cơm[:\s-]+/i, '').trim();
};

export const MealSetDetailModal: React.FC = () => {
  const { 
    selectedMealSet, 
    setSelectedMealSet, 
    setSelectedRecipe, 
    setActiveTab,
    weeklyPlan,
    setWeeklyPlan,
    addMealSetToSlot,
    swapDishInMealSet,
    showToast,
    servings,
    onboardingData
  } = useMealWise();

  const [dragY, setDragY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  // Quick slot assignment inside modal
  const [showAssignPanel, setShowAssignPanel] = useState<boolean>(false);
  const [assignDay, setAssignDay] = useState<string>('mon');
  const [assignSlot, setAssignSlot] = useState<MealSlot>('lunch');

  // Strict invariant: Hotpot or banquet feasts are NEVER allowed in everyday 3-dish meal sets
  React.useEffect(() => {
    if (!selectedMealSet) return;
    if (isHotpotOrFeast(selectedMealSet.soupDish)) {
      const sanitized = swapDishInMealSet(selectedMealSet, 'soupDish');
      setSelectedMealSet(sanitized);
    } else if (isHotpotOrFeast(selectedMealSet.mainDish)) {
      const sanitized = swapDishInMealSet(selectedMealSet, 'mainDish');
      setSelectedMealSet(sanitized);
    } else if (isHotpotOrFeast(selectedMealSet.sideDish)) {
      const sanitized = swapDishInMealSet(selectedMealSet, 'sideDish');
      setSelectedMealSet(sanitized);
    }
  }, [selectedMealSet, setSelectedMealSet, swapDishInMealSet]);

  if (!selectedMealSet) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    setDragY(Math.max(0, diff));
  };

  const handleTouchEnd = () => {
    if (dragY > 75) {
      setSelectedMealSet(null);
    }
    setDragY(0);
    touchStartY.current = null;
  };

  const handleConfirmAssign = () => {
    addMealSetToSlot(assignDay, assignSlot, selectedMealSet);
    setShowAssignPanel(false);
  };

  const handleSwapSpecificDish = (dishType: 'mainDish' | 'soupDish' | 'sideDish', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedMealSet) return;

    // Calculate budget limit based on assigned day or general target
    const safeServings = Number.isFinite(servings) && servings > 0 ? Math.min(20, Math.max(1, Math.round(servings))) : 4;
    const currentBudgetLevel = onboardingData?.budgetLevel || 'vua-phai';
    const dailyBudgetTarget = getDailyBudgetTarget(currentBudgetLevel, safeServings, onboardingData?.specialNeeds);
    
    // Find if assigned to any day in weekly plan
    const assignedDay = weeklyPlan.find(day => 
      (['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).some(s => {
        const m = day.meals[s];
        return m && isMealSet(m) && m.id === selectedMealSet.id;
      })
    );

    let maxAllowedDishCostUnscaled: number | undefined;
    if (assignedDay) {
      let otherSlotsScaledCost = 0;
      (['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).forEach(s => {
        const m = assignedDay.meals[s];
        const isSkipLunch = onboardingData?.weekdayLunchRoutine === 'ban-tru-di-lam' || onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong';
        const isBantruLunch = s === 'lunch' && Boolean(assignedDay.skippedSlots?.lunch ?? (isSkipLunch && ['mon','tue','wed','thu','fri'].includes(assignedDay.dayId)));
        if (m && !assignedDay.skippedSlots?.[s] && !isBantruLunch) {
          if (isMealSet(m)) otherSlotsScaledCost += scaleCost(m.totalCostVnd, safeServings);
          else otherSlotsScaledCost += scaleCost(m.estimatedCostVnd || 35000, safeServings);
        }
      });
      const otherDish1 = dishType === 'mainDish' ? selectedMealSet.soupDish : selectedMealSet.mainDish;
      const otherDish2 = dishType === 'sideDish' ? selectedMealSet.soupDish : selectedMealSet.sideDish;
      const otherTwoDishesScaled = scaleCost((otherDish1?.estimatedCostVnd || 0) + (otherDish2?.estimatedCostVnd || 0), safeServings);
      const remainingScaled = Math.max(0, dailyBudgetTarget - (otherSlotsScaledCost + otherTwoDishesScaled));
      maxAllowedDishCostUnscaled = Math.floor(remainingScaled / (safeServings / 4));
    }

    const updated = swapDishInMealSet(selectedMealSet, dishType, undefined, maxAllowedDishCostUnscaled);
    setSelectedMealSet(updated);

    // Synchronize with weekly plan if this meal set is assigned in any slot
    setWeeklyPlan(prev => prev.map(day => {
      let changed = false;
      const newMeals = { ...day.meals };
      (['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).forEach(slotKey => {
        const m = newMeals[slotKey];
        if (m && isMealSet(m) && m.id === selectedMealSet.id) {
          newMeals[slotKey] = updated;
          changed = true;
        }
      });
      return changed ? { ...day, meals: newMeals } : day;
    }));

    const dishLabel = dishType === 'mainDish' ? 'Món Mặn' : dishType === 'soupDish' ? 'Món Canh' : 'Món Rau';
    showToast(`🔄 Đã đổi ${dishLabel} thành "${updated[dishType].title}" chuẩn ngân sách!`);
  };

  const calculatedTotalCost = (selectedMealSet.mainDish?.estimatedCostVnd || 0) + 
                             (selectedMealSet.soupDish?.estimatedCostVnd || 0) + 
                             (selectedMealSet.sideDish?.estimatedCostVnd || 0);

  const calculatedTotalCalories = (selectedMealSet.mainDish?.calories || 0) + 
                                 (selectedMealSet.soupDish?.calories || 0) + 
                                 (selectedMealSet.sideDish?.calories || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedMealSet(null)}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="w-full max-w-lg bg-white dark:bg-[#1A1918] rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up border-t border-[#E8E2D8] dark:border-[#252220] relative overflow-hidden"
      >
        {/* Swipe Handle Bar & Drag Zone */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-3 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
        </div>

        {/* Top Header Bar with Close Button */}
        <div className="px-4 pb-2 flex items-center justify-between shrink-0 select-none gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate min-w-0 flex-1">
            {selectedMealSet.region === 'bac' ? 'Mâm Cơm Miền Bắc'
              : selectedMealSet.region === 'nam' ? 'Mâm Cơm Miền Nam'
              : selectedMealSet.region === 'trung' ? 'Mâm Cơm Miền Trung'
              : selectedMealSet.region === 'chay' ? 'Mâm Cơm Chay Thanh Tịnh'
              : 'Mâm Cơm Gia Đình 3 Món'}
          </span>
          <button
            onClick={() => setSelectedMealSet(null)}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-4">
          
          {/* Hero Image & Title */}
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-md shrink-0">
            <SafeImage 
              src={selectedMealSet.imageUrl} 
              alt={selectedMealSet.title} 
              fallbackTitle={selectedMealSet.title}
              category="Mâm Cơm"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            <div className="absolute bottom-3 left-4 right-4">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-950/70 backdrop-blur-md text-white border border-white/20 text-[10px] font-black mb-1 inline-block">
                Mâm 3 Món Gia Đình
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                {selectedMealSet.title}
              </h2>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <span className="text-stone-700 dark:text-stone-300 font-bold">Tổng chi phí 3 món:</span>
            <span className="text-stone-900 dark:text-white font-black text-sm whitespace-nowrap">
              {calculatedTotalCost.toLocaleString('vi-VN')} đ • {calculatedTotalCalories} kcal
            </span>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            {selectedMealSet.description}
          </p>

          {/* 3 Dishes List (Clickable to view detail) */}
          <div className="space-y-2">
            <div>
              <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                Chi Tiết 3 Món Trong Mâm Cơm
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Chạm để xem công thức
              </p>
            </div>

            {/* Món Mặn */}
            <div 
              onClick={() => {
                setSelectedRecipe(selectedMealSet.mainDish);
              }}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] hover:border-stone-400 dark:hover:border-stone-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="w-[72px] py-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-black shrink-0 whitespace-nowrap inline-flex items-center justify-center text-center tracking-wide">
                  MÓN MẶN
                </span>
                <span className="text-[12px] font-extrabold text-stone-900 dark:text-white whitespace-nowrap shrink-0 tabular-nums">
                  {selectedMealSet.mainDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white leading-snug break-words">
                {cleanDishTitle(selectedMealSet.mainDish.title)}
              </h4>

              {selectedMealSet.mainDish.description && (
                <p className="text-[11.5px] text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                  {selectedMealSet.mainDish.description}
                </p>
              )}

              <div className="flex items-center justify-end pt-1 border-t border-stone-200/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={(e) => handleSwapSpecificDish('mainDish', e)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5 border border-rose-500/25 transition-all shrink-0 select-none shadow-xs"
                  title="Đổi riêng món mặn này"
                >
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  <span>Đổi món</span>
                </button>
              </div>
            </div>

            {/* Món Canh */}
            <div 
              onClick={() => {
                setSelectedRecipe(selectedMealSet.soupDish);
              }}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] hover:border-stone-400 dark:hover:border-stone-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="w-[72px] py-1 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px] font-black shrink-0 whitespace-nowrap inline-flex items-center justify-center text-center tracking-wide">
                  MÓN CANH
                </span>
                <span className="text-[12px] font-extrabold text-stone-900 dark:text-white whitespace-nowrap shrink-0 tabular-nums">
                  {selectedMealSet.soupDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white leading-snug break-words">
                {cleanDishTitle(selectedMealSet.soupDish.title)}
              </h4>

              {selectedMealSet.soupDish.description && (
                <p className="text-[11.5px] text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                  {selectedMealSet.soupDish.description}
                </p>
              )}

              <div className="flex items-center justify-end pt-1 border-t border-stone-200/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={(e) => handleSwapSpecificDish('soupDish', e)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 text-sky-700 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1.5 border border-sky-500/25 transition-all shrink-0 select-none shadow-xs"
                  title="Đổi riêng món canh này"
                >
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  <span>Đổi món</span>
                </button>
              </div>
            </div>

            {/* Món Rau */}
            <div 
              onClick={() => {
                setSelectedRecipe(selectedMealSet.sideDish);
              }}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] hover:border-stone-400 dark:hover:border-stone-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="w-[72px] py-1 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-black shrink-0 whitespace-nowrap inline-flex items-center justify-center text-center tracking-wide">
                  MÓN RAU
                </span>
                <span className="text-[12px] font-extrabold text-stone-900 dark:text-white whitespace-nowrap shrink-0 tabular-nums">
                  {selectedMealSet.sideDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white leading-snug break-words">
                {cleanDishTitle(selectedMealSet.sideDish.title)}
              </h4>

              {selectedMealSet.sideDish.description && (
                <p className="text-[11.5px] text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                  {selectedMealSet.sideDish.description}
                </p>
              )}

              <div className="flex items-center justify-end pt-1 border-t border-stone-200/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={(e) => handleSwapSpecificDish('sideDish', e)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 border border-emerald-500/25 transition-all shrink-0 select-none shadow-xs"
                  title="Đổi riêng món rau này"
                >
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  <span>Đổi món</span>
                </button>
              </div>
            </div>
          </div>

          {/* Condiment Note */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-300 text-xs space-y-0.5">
            <span className="font-extrabold uppercase block text-[10px] tracking-wider text-stone-500 dark:text-stone-400">
              ĐỒ KÈM CHUẨN VỊ:
            </span>
            <p className="font-semibold">{selectedMealSet.condimentNote}</p>
          </div>

          {/* Consolidated 3-Course Ingredient Checklist (Hidden universally per user request) */}
          <div className="hidden space-y-2 pt-1 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                Nguyên Liệu Cả Mâm (Gom 3 Món)
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                {(selectedMealSet.mainDish.ingredients.length + selectedMealSet.soupDish.ingredients.length + selectedMealSet.sideDish.ingredients.length)} món đi chợ
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {[
                ...selectedMealSet.mainDish.ingredients.map(i => ({ ...i, course: 'Mặn' })),
                ...selectedMealSet.soupDish.ingredients.map(i => ({ ...i, course: 'Canh' })),
                ...selectedMealSet.sideDish.ingredients.map(i => ({ ...i, course: 'Rau' }))
              ].map((ing, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] flex items-center justify-between text-xs min-h-[36px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold shrink-0">
                      {ing.course}
                    </span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 truncate" title={ing.name}>
                      {ing.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-stone-900 dark:text-white text-[11px] shrink-0 whitespace-nowrap">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Slot Assignment Subpanel */}
          {showAssignPanel ? (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 dark:text-white">
                  Chọn Ngày & Bữa Ăn:
                </span>
                <button
                  onClick={() => setShowAssignPanel(false)}
                  className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white font-medium"
                >
                  Thu gọn
                </button>
              </div>

              {/* Day Selector */}
              <select
                value={assignDay}
                onChange={e => setAssignDay(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-white"
              >
                {weeklyPlan.map(d => (
                  <option key={d.dayId} value={d.dayId}>{d.dayName}</option>
                ))}
              </select>

              {/* Slot Selector: 3 options */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'breakfast', label: '☀️ Sáng' },
                  { id: 'lunch', label: '🌤️ Trưa' },
                  { id: 'dinner', label: '🌙 Tối' }
                ].map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setAssignSlot(slot.id as MealSlot)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      assignSlot === slot.id
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-black shadow-xs'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirmAssign}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xác Nhận Xếp Vào {weeklyPlan.find(d => d.dayId === assignDay)?.dayName}</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 items-stretch">
              <button
                type="button"
                onClick={() => setShowAssignPanel(true)}
                className="flex-1 py-3 px-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-[11.5px] sm:text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all leading-tight"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Thêm Vào Thực Đơn</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMealSet(null);
                  setActiveTab('weekly');
                }}
                className="py-3 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-stone-700 dark:text-stone-300 shrink-0" />
                <span>Xem Tuần</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
