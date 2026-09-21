import React, { useState, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { MealSlot, Recipe, VietnameseMealSet } from '../types';
import { 
  Calendar, 
  Sparkles, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Utensils, 
  Sun, 
  Moon, 
  Coffee,
  X,
  PlusCircle,
  RefreshCw,
  Flame,
  Dumbbell,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Apple
} from 'lucide-react';
import { matchesSearchTerm, matchesMealSetSearch, matchesRecipeSearch } from '../utils/textUtils';
import { SafeImage } from './SafeImage';
import { roundToThousand, scaleCost, getDailyBudgetTarget } from '../utils/currency';

const DAY_LABELS: { [key: string]: { short: string; full: string } } = {
  mon: { short: 'T2', full: 'Thứ Hai' },
  tue: { short: 'T3', full: 'Thứ Ba' },
  wed: { short: 'T4', full: 'Thứ Tư' },
  thu: { short: 'T5', full: 'Thứ Năm' },
  fri: { short: 'T6', full: 'Thứ Sáu' },
  sat: { short: 'T7', full: 'Thứ Bảy' },
  sun: { short: 'CN', full: 'Chủ Nhật' }
};

export const WeeklyBoard: React.FC = () => {
  const { 
    weeklyPlan, 
    recipes, 
    mealSets,
    autoFillWeeklyMenu, 
    recalibrateDayMenu,
    recalibrateWeeklyMenu,
    clearWeeklyMenu, 
    addMealSetToSlot,
    addRecipeToSlot,
    removeMealFromSlot,
    setSelectedRecipe,
    setSelectedMealSet,
    setActiveTab,
    showToast,
    servings,
    setServings,
    onboardingData,
    setOnboardingData,
    setShowOnboarding,
    generationCount,
    openConfirmModal
  } = useMealWise();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeSlotPicker, setActiveSlotPicker] = useState<{ dayId: string; slot: MealSlot } | null>(null);
  const [pickerTab, setPickerTab] = useState<'meal-sets' | 'single-recipes'>('meal-sets');
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleAutoFillWeekly = () => {
    setIsGenerating(true);
    autoFillWeeklyMenu();
    setTimeout(() => {
      setIsGenerating(false);
    }, 250);
  };

  // Servings sanitization & scale (bounds [1..20], NaN protection, removing 0.5 floor distortion)
  const safeServings = Number.isFinite(servings) && servings > 0 
    ? Math.min(20, Math.max(1, Math.round(servings))) 
    : (onboardingData?.familySize || 4);
  const scale = safeServings / 4;

  // Bi-directional servings & onboardingData.familySize state synchronization
  const handleServingsChange = (newServings: number) => {
    const safe = Math.min(20, Math.max(1, Math.round(newServings)));
    setServings(safe);
    setOnboardingData(prev => {
      const updated = { ...prev, familySize: safe };
      try {
        localStorage.setItem('mealwise_onboarding', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save onboardingData to localStorage', e);
      }
      return updated;
    });
  };

  // Touch Swipe Gestures with vertical scroll collision prevention
  const dayTouchStartX = useRef<number | null>(null);
  const dayTouchStartY = useRef<number | null>(null);
  const [pickerDragY, setPickerDragY] = useState<number>(0);
  const pickerTouchStartY = useRef<number | null>(null);

  const handleDayTouchStart = (e: React.TouchEvent) => {
    dayTouchStartX.current = e.touches[0].clientX;
    dayTouchStartY.current = e.touches[0].clientY;
  };

  const handleDayTouchEnd = (e: React.TouchEvent) => {
    if (dayTouchStartX.current === null || dayTouchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - dayTouchStartX.current;
    const diffY = endY - dayTouchStartY.current;

    // Only switch days if horizontal swipe is clearly dominant over vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped right -> go to previous day
        setSelectedDayIndex(prev => Math.max(0, prev - 1));
      } else {
        // Swiped left -> go to next day
        setSelectedDayIndex(prev => Math.min(weeklyPlan.length - 1, prev + 1));
      }
    }
    dayTouchStartX.current = null;
    dayTouchStartY.current = null;
  };

  const activeDay = weeklyPlan[selectedDayIndex] || weeklyPlan[0];

  // Calculate overall weekly totals
  let totalWeeklyCost = 0;
  let totalWeeklyMeals = 0;

  weeklyPlan.forEach(day => {
    Object.values(day.meals).forEach(meal => {
      if (meal) {
        totalWeeklyMeals += 1;
        if ('totalCostVnd' in meal) {
          totalWeeklyCost += meal.totalCostVnd;
        } else {
          totalWeeklyCost += meal.estimatedCostVnd || 0;
        }
      }
    });
  });

  const scaledTotalWeeklyCost = scaleCost(totalWeeklyCost, safeServings);

  const isMealSet = (item: any): item is VietnameseMealSet => {
    return item && 'mainDish' in item;
  };

  // Active day nutrition & cost calculation
  let dayCalories = 0;
  let dayCost = 0;
  let dayProtein = 0;

  Object.values(activeDay.meals).forEach(meal => {
    if (meal) {
      if (isMealSet(meal)) {
        dayCalories += meal.totalCalories;
        dayCost += meal.totalCostVnd;
        dayProtein += Math.round(meal.totalCalories * 0.045);
      } else {
        dayCalories += meal.calories || 450;
        dayCost += meal.estimatedCostVnd || 35000;
        dayProtein += Math.round((meal.calories || 450) * 0.045);
      }
    }
  });

  const scaledDayCalories = Math.round(dayCalories * scale);
  const scaledDayCost = scaleCost(dayCost, safeServings);
  const scaledDayProtein = Math.round(dayProtein * scale);

  // Single-day budget target calculation from onboardingData.budgetLevel
  // tiet-kiem: 60,000 VND/person/day
  // vua-phai: 95,000 VND/person/day
  // thoai-mai: 140,000 VND/person/day
  const currentBudgetLevel = onboardingData?.budgetLevel || 'vua-phai';
  const dailyBudgetTarget = getDailyBudgetTarget(currentBudgetLevel, safeServings);

  const isOverBudget = scaledDayCost > dailyBudgetTarget * 1.1; // Exceeds by >10%
  const budgetExcess = scaledDayCost - dailyBudgetTarget;
  const isSingleDishMode = safeServings === 1 && onboardingData?.singleMealFormat !== 'meal-set';

  const getDayCost = (day: typeof weeklyPlan[0]) => {
    let cost = 0;
    Object.values(day.meals).forEach(m => {
      if (m) {
        if (isMealSet(m)) cost += m.totalCostVnd;
        else cost += m.estimatedCostVnd || 35000;
      }
    });
    return scaleCost(cost, safeServings);
  };

  const hasAnyOverBudgetDay = weeklyPlan.some(d => getDayCost(d) > dailyBudgetTarget * 1.1);

  const handleOpenSlotPicker = (dayId: string, slot: MealSlot) => {
    if (slot === 'breakfast' || isSingleDishMode) {
      setPickerTab('single-recipes');
    } else {
      setPickerTab('meal-sets');
    }
    setActiveSlotPicker({ dayId, slot });
  };

  // 1-Click Swap Meal
  const handleRandomSwap = (dayId: string, slot: MealSlot) => {
    if (slot === 'breakfast') {
      const breakfastList = recipes.filter(r => r.category === 'an-sang');
      const randomBreakfast = breakfastList[Math.floor(Math.random() * breakfastList.length)] || recipes[0];
      addRecipeToSlot(dayId, slot, randomBreakfast.id);
      showToast(`🔄 Đã đổi sang món "${randomBreakfast.title}"!`);
    } else {
      if (isSingleDishMode) {
        const eligibleRecipes = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
        const randomRecipe = eligibleRecipes[Math.floor(Math.random() * eligibleRecipes.length)] || recipes[0];
        addRecipeToSlot(dayId, slot, randomRecipe.id);
        showToast(`🔄 Đã đổi sang món "${randomRecipe.title}"!`);
      } else {
        const randomSet = mealSets[Math.floor(Math.random() * mealSets.length)];
        addMealSetToSlot(dayId, slot, randomSet.id);
        showToast(`🔄 Đã đổi sang mâm "${randomSet.title}"!`);
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Quick Controls */}
      <div className="p-4 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-950/10 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 text-[11px] font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Thực Đơn 7 Ngày Mâm Cơm Việt</span>
          </div>

          <button
            type="button"
            onClick={() => {
              openConfirmModal({
                title: 'Xóa Thực Đơn Tuần',
                message: 'Bạn có chắc chắn muốn xóa toàn bộ các món ăn đã lên kế hoạch cho cả tuần không?',
                confirmLabel: 'Xóa thực đơn',
                cancelLabel: 'Giữ lại',
                isDanger: true,
                onConfirm: () => {
                  clearWeeklyMenu();
                }
              });
            }}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-white/10 dark:hover:bg-rose-500/20 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            title="Xóa thực đơn tuần"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Kế Hoạch Ăn Uống Tròn Vị
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            Mâm cơm 3 món chuẩn vị gia đình, tự động cân đối chi phí và dinh dưỡng.
          </p>
        </div>

        {/* Active User Goal Summary Chip */}
        {onboardingData && onboardingData.completed && (
          <div className="flex items-start sm:items-center justify-between gap-2.5 px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-850/80 border border-emerald-500/20 shadow-sm text-xs">
            <div className="flex items-start gap-1.5 min-w-0 flex-1">
              <span className="text-sm shrink-0 leading-none mt-0.5 sm:mt-0">🎯</span>
              <div className="min-w-0 flex-1 leading-snug">
                <span className="font-extrabold text-slate-900 dark:text-white shrink-0">Mục tiêu: </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold break-words">
                  {onboardingData.specialNeeds?.includes('gym-protein') ? 'Tập Gym / Giàu Đạm'
                    : onboardingData.specialNeeds?.includes('eat-clean') ? 'Eat Clean / Lành Mạnh'
                    : onboardingData.specialNeeds?.includes('chay') ? 'Ăn Chay Thanh Tịnh'
                    : onboardingData.specialNeeds?.includes('nhieu-rau') ? 'Nhiều Rau Xanh'
                    : onboardingData.familySize === 1 
                      ? (onboardingData.singleMealFormat === 'meal-set' ? 'Độc Thân • Mâm 3 Món' : 'Độc Thân • Món Đơn')
                    : 'Gia Đình Cân Bằng'}
                  {' • '}
                  {onboardingData.regionPreference === 'bac' ? 'Vị Bắc'
                    : onboardingData.regionPreference === 'nam' ? 'Vị Nam'
                    : onboardingData.regionPreference === 'trung' ? 'Vị Trung'
                    : '3 Miền'}
                  {' • '}
                  {safeServings} người{safeServings === 1 && onboardingData.singleMealFormat !== 'meal-set' ? ' (Món đơn)' : ''}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 shrink-0 transition-colors self-start sm:self-center whitespace-nowrap"
            >
              Đổi mục tiêu
            </button>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAutoFillWeekly}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-3.5 h-3.5 text-slate-950 fill-slate-950 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Đang Tạo Thực Đơn...' : 'Gợi Ý 1-Click Cả Tuần'}</span>
          </button>

          <button
            onClick={() => setActiveTab('grocery')}
            className="flex items-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 text-xs font-bold rounded-xl transition-all active:scale-95 shrink-0"
          >
            <span>Đi Chợ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekly Stats Micro Bar */}
        <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 pt-2 border-t border-slate-200/80 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
          <span className="shrink-0">{totalWeeklyMeals} / 21 bữa đã xếp</span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`font-extrabold whitespace-nowrap ${
              hasAnyOverBudgetDay ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {scaledTotalWeeklyCost.toLocaleString('vi-VN')} đ / {(dailyBudgetTarget * 7).toLocaleString('vi-VN')} đ/tuần
            </span>
            {hasAnyOverBudgetDay && (
              <button
                type="button"
                onClick={() => recalibrateWeeklyMenu()}
                className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Tự động cân chỉnh cả tuần về ngân sách"
              >
                <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                <span>Cân chỉnh tuần</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NATIVE MOBILE HORIZONTAL DAY PICKER STRIP (T2 -> CN) */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-7 gap-1">
          {weeklyPlan.map((day, index) => {
            const active = selectedDayIndex === index;
            const dayMeta = DAY_LABELS[day.dayId] || { short: `T${index + 2}`, full: day.dayName };
            const mealsCount = Object.values(day.meals).filter(Boolean).length;
            const isFull = mealsCount >= 3;
            const thisDayCost = getDayCost(day);
            const thisDayOverBudget = thisDayCost > dailyBudgetTarget * 1.1;

            return (
              <button
                key={day.dayId}
                onClick={() => setSelectedDayIndex(index)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all min-h-[54px] relative ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-black tracking-tight leading-none">
                  {dayMeta.short}
                </span>
                
                <span className={`text-[10px] mt-1 font-bold leading-none ${active ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}>
                  {mealsCount}/3
                </span>

                {thisDayOverBudget && !active ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1 ring-2 ring-white dark:ring-slate-900" title="Vượt ngân sách ngày" />
                ) : isFull && !active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE DAY CARD CONTAINER (Supports swipe left/right between days) */}
      <div 
        key={`${activeDay.dayId}-${generationCount}`}
        onTouchStart={handleDayTouchStart}
        onTouchEnd={handleDayTouchEnd}
        className="p-4 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4 transition-all duration-200 animate-fade-in"
      >
        
        {/* Day Header & Servings Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {activeDay.dayName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold">
                {Object.values(activeDay.meals).filter(Boolean).length} / 3 bữa
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
              Thực đơn mâm cơm gia đình Việt
            </span>
          </div>

          {/* Servings Stepper: [ - ] [ input ] [ + ] bounded [1..20] */}
          <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-100 dark:bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Khẩu phần:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleServingsChange(safeServings - 1)}
                disabled={safeServings <= 1}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
                aria-label="Giảm khẩu phần"
              >
                -
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={safeServings}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) {
                      handleServingsChange(parsed);
                    } else if (e.target.value === '') {
                      handleServingsChange(1);
                    }
                  }}
                  className="w-9 sm:w-10 text-center text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Số người ăn"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">người</span>
              </div>
              <button
                type="button"
                onClick={() => handleServingsChange(safeServings + 1)}
                disabled={safeServings >= 20}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
                aria-label="Tăng khẩu phần"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Nutrition & Budget Pills for Active Day */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all min-w-0 ${
            isOverBudget
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-emerald-500/10 border-emerald-500/20'
          }`}>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider block truncate ${
              isOverBudget ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
            }`}>
              CHI PHÍ NGÀY
            </span>
            <p className={`text-xs font-black mt-0.5 truncate ${
              isOverBudget ? 'text-rose-800 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-300'
            }`}>
              {scaledDayCost.toLocaleString('vi-VN')} đ
            </p>
            <span className="text-[8.5px] sm:text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5 font-semibold truncate" title={`Hạn mức: ${dailyBudgetTarget.toLocaleString('vi-VN')} đ`}>
              Mức: {dailyBudgetTarget.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-0">
            <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider block flex items-center justify-center gap-0.5 truncate">
              <Flame className="w-2.5 h-2.5 shrink-0" /> CALO
            </span>
            <p className="text-xs font-black text-amber-800 dark:text-amber-300 mt-0.5 truncate">
              {scaledDayCalories} kcal
            </p>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center min-w-0">
            <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider block flex items-center justify-center gap-0.5 truncate">
              <Dumbbell className="w-2.5 h-2.5 shrink-0" /> <span>ĐẠM</span><span className="hidden sm:inline"> (PROTEIN)</span>
            </span>
            <p className="text-xs font-black text-blue-800 dark:text-blue-300 mt-0.5 truncate">
              ~{scaledDayProtein}g
            </p>
          </div>
        </div>

        {/* Single-day Budget Warning Indicator against onboardingData.budgetLevel */}
        <div className={`p-3 rounded-2xl border text-xs transition-all ${
          isOverBudget
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-sm shadow-rose-500/10'
            : scaledDayCost > 0
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {isOverBudget ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : scaledDayCost > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Utensils className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="font-black truncate">
                {isOverBudget
                  ? `⚠️ Vượt ngân sách: +${budgetExcess.toLocaleString('vi-VN')} đ`
                  : scaledDayCost > 0
                  ? `✓ Trong ngân sách: ${scaledDayCost.toLocaleString('vi-VN')} đ / ${dailyBudgetTarget.toLocaleString('vi-VN')} đ/ngày`
                  : 'Chưa xếp món cho ngày này'}
              </span>
            </div>
            <span className="text-[10px] font-bold opacity-80 shrink-0 ml-2">
              Mức: {currentBudgetLevel === 'tiet-kiem' ? 'Tiết Kiệm' : currentBudgetLevel === 'thoai-mai' ? 'Thoải Mái' : 'Vừa Phải'} ({safeServings} người)
            </span>
          </div>

          {/* Subtext clarifying 3-meal budget calculation */}
          {scaledDayCost > 0 && (
            <div className="mt-2 pt-2 border-t border-current/10 text-[10.5px] font-medium opacity-90 flex flex-wrap items-center justify-between gap-1">
              <span>
                Gồm 3 bữa ăn (sáng + trưa + tối) cho {safeServings} người • Hạn mức cả ngày: {dailyBudgetTarget.toLocaleString('vi-VN')} đ
              </span>
              {dailyBudgetTarget >= scaledDayCost && (
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  Dư: {(dailyBudgetTarget - scaledDayCost).toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>
          )}

          {/* Recalibrate Call-To-Action buttons when over budget */}
          {isOverBudget && (
            <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => recalibrateDayMenu(activeDay.dayId)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs shadow-sm shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>⚡ Cân Chỉnh Lại Ngày Này (Dưới {dailyBudgetTarget.toLocaleString('vi-VN')} đ)</span>
              </button>

              <button
                type="button"
                onClick={() => recalibrateWeeklyMenu()}
                className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 border border-rose-500/30 font-bold text-[11px] active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                title="Cân chỉnh toàn bộ các ngày trong tuần về đúng ngân sách"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Cân Chỉnh Cả Tuần</span>
              </button>
            </div>
          )}
        </div>

        {/* Single-Person / Gym / Eat Clean Contextual Lifestyle Indicators */}
        {safeServings === 1 && (
          <div className="px-3 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between text-xs font-bold text-sky-800 dark:text-sky-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">👤</span>
              <span className="truncate">
                {isSingleDishMode
                  ? 'Khẩu phần 1 người (Món đơn): Tinh gọn 1 món trọn vị, nấu nhanh & không lo nấu thừa.'
                  : 'Khẩu phần 1 người (Mâm 3 món): Định lượng & chi phí thu nhỏ chuẩn mâm cơm truyền thống.'}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-200 shrink-0 ml-2 font-extrabold">
              {isSingleDishMode ? 'Món Đơn' : 'Mâm 3 Món'}
            </span>
          </div>
        )}

        {onboardingData?.specialNeeds?.includes('gym-protein') && (
          <div className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏋️</span>
              <div>
                <p className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Mục Tiêu Tập Gym:</span>
                  <span className="text-blue-700 dark:text-blue-400">~{scaledDayProtein}g / {safeServings * 70}g Đạm</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tăng cơ giảm mỡ, ưu tiên món thịt nạc, ức gà, trứng và đậu hũ.
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 self-start sm:self-center ${
              scaledDayProtein >= safeServings * 65
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
            }`}>
              {scaledDayProtein >= safeServings * 65 ? '✓ Đạt Chuẩn Gym' : `Cần Thêm ~${Math.max(0, safeServings * 70 - scaledDayProtein)}g Đạm`}
            </span>
          </div>
        )}

        {onboardingData?.specialNeeds?.includes('eat-clean') && (
          <div className="px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🥗</span>
              <span className="truncate">Lối sống Eat Clean: Kiểm soát calo ({scaledDayCalories} kcal) & ưu tiên món luộc, hấp thanh nhẹ.</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 shrink-0 ml-2 font-extrabold">
              Eat Clean
            </span>
          </div>
        )}

        {onboardingData?.specialNeeds?.includes('single-prep') && (
          <div className="px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🍱</span>
              <span className="truncate">Meal Prep Độc Thân: Nấu 1 lần cho hộp cơm mang đi làm hoặc bảo quản ngăn mát.</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-200 shrink-0 ml-2 font-extrabold">
              Meal Prep
            </span>
          </div>
        )}

        {/* MEAL SLOTS LIST FOR ACTIVE DAY */}
        <div className="space-y-3 pt-1">
          
          {/* SLOT 1: BỮA SÁNG */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Bữa Sáng Năng Lượng
                </span>
              </div>
              {activeDay.meals.breakfast && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRandomSwap(activeDay.dayId, 'breakfast')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 transition-colors shrink-0"
                    title="Đổi món sáng ngẫu nhiên"
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>Đổi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMealFromSlot(activeDay.dayId, 'breakfast')}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 font-bold transition-colors shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {activeDay.meals.breakfast ? (
              isMealSet(activeDay.meals.breakfast) ? (
                /* Rich 3-Dish Set Card for Breakfast */
                <div 
                  onClick={() => setSelectedMealSet(activeDay.meals.breakfast as VietnameseMealSet)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 cursor-pointer space-y-2 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate min-w-0 flex-1">
                      {(activeDay.meals.breakfast as VietnameseMealSet).title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold shrink-0 whitespace-nowrap">
                      Mâm 3 Món
                    </span>
                  </div>

                  {/* 3 Dishes Details */}
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <p className="truncate">🔴 <strong className="text-rose-600 dark:text-rose-400">Mặn:</strong> {(activeDay.meals.breakfast as VietnameseMealSet).mainDish.title}</p>
                    <p className="truncate">🔵 <strong className="text-sky-600 dark:text-sky-400">Canh:</strong> {(activeDay.meals.breakfast as VietnameseMealSet).soupDish.title}</p>
                    <p className="truncate">🟢 <strong className="text-emerald-600 dark:text-emerald-400">Rau:</strong> {(activeDay.meals.breakfast as VietnameseMealSet).sideDish.title}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {scaleCost((activeDay.meals.breakfast as VietnameseMealSet).totalCostVnd, safeServings).toLocaleString('vi-VN')} đ
                    </span>
                    <span>{Math.round((activeDay.meals.breakfast as VietnameseMealSet).totalCalories * scale)} kcal</span>
                  </div>
                </div>
              ) : (
                /* Single Dish for Breakfast */
                <div 
                  onClick={() => setSelectedRecipe(activeDay.meals.breakfast as Recipe)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SafeImage 
                      src={(activeDay.meals.breakfast as Recipe).imageUrl} 
                      alt={(activeDay.meals.breakfast as Recipe).title} 
                      fallbackTitle={(activeDay.meals.breakfast as Recipe).title}
                      category="Bữa Sáng"
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                        {(activeDay.meals.breakfast as Recipe).title}
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                        {scaleCost((activeDay.meals.breakfast as Recipe).estimatedCostVnd || 30000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.breakfast as Recipe).calories || 400) * scale)} kcal
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              )
            ) : (
              <button
                onClick={() => handleOpenSlotPicker(activeDay.dayId, 'breakfast')}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm món ăn sáng (Phở, Bún chả, Xôi...)</span>
              </button>
            )}
          </div>

          {/* SLOT 2: BỮA TRƯA */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {isSingleDishMode ? 'Bữa Trưa Gọn Nhẹ (Món Đơn)' : 'Bữa Trưa Tròn Vị (3 Món)'}
                </span>
              </div>
              {activeDay.meals.lunch && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRandomSwap(activeDay.dayId, 'lunch')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 transition-colors shrink-0"
                    title={isSingleDishMode ? 'Đổi món trưa ngẫu nhiên' : 'Đổi mâm cơm trưa ngẫu nhiên'}
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>{isSingleDishMode ? 'Đổi món' : 'Đổi mâm'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMealFromSlot(activeDay.dayId, 'lunch')}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 font-bold transition-colors shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {activeDay.meals.lunch ? (
              isMealSet(activeDay.meals.lunch) ? (
                /* Rich 3-Dish Set Card */
                <div 
                  onClick={() => setSelectedMealSet(activeDay.meals.lunch as VietnameseMealSet)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 cursor-pointer space-y-2 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate min-w-0 flex-1">
                      {activeDay.meals.lunch.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold shrink-0 whitespace-nowrap">
                      Mâm 3 Món
                    </span>
                  </div>

                  {/* 3 Dishes Details */}
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <p className="truncate">🔴 <strong className="text-rose-600 dark:text-rose-400">Mặn:</strong> {activeDay.meals.lunch.mainDish.title}</p>
                    <p className="truncate">🔵 <strong className="text-sky-600 dark:text-sky-400">Canh:</strong> {activeDay.meals.lunch.soupDish.title}</p>
                    <p className="truncate">🟢 <strong className="text-emerald-600 dark:text-emerald-400">Rau:</strong> {activeDay.meals.lunch.sideDish.title}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {scaleCost(activeDay.meals.lunch.totalCostVnd, safeServings).toLocaleString('vi-VN')} đ
                    </span>
                    <span>{Math.round(activeDay.meals.lunch.totalCalories * scale)} kcal</span>
                  </div>
                </div>
              ) : (
                /* Single Dish */
                <div 
                  onClick={() => setSelectedRecipe(activeDay.meals.lunch as Recipe)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SafeImage 
                      src={(activeDay.meals.lunch as Recipe).imageUrl} 
                      alt={(activeDay.meals.lunch as Recipe).title} 
                      fallbackTitle={(activeDay.meals.lunch as Recipe).title}
                      category="Bữa Trưa"
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                        {(activeDay.meals.lunch as Recipe).title}
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                        {scaleCost((activeDay.meals.lunch as Recipe).estimatedCostVnd || 35000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.lunch as Recipe).calories || 400) * scale)} kcal
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              )
            ) : (
              <button
                onClick={() => handleOpenSlotPicker(activeDay.dayId, 'lunch')}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isSingleDishMode ? 'Thêm Món Ăn Trưa Gọn Nhẹ' : 'Thêm Mâm Cơm 3 Món Trưa'}</span>
              </button>
            )}
          </div>

          {/* SLOT 3: BỮA TỐI */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {isSingleDishMode ? 'Bữa Tối Gọn Nhẹ (Món Đơn)' : 'Bữa Tối Sum Họp (3 Món)'}
                </span>
              </div>
              {activeDay.meals.dinner && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRandomSwap(activeDay.dayId, 'dinner')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 transition-colors shrink-0"
                    title={isSingleDishMode ? 'Đổi món tối ngẫu nhiên' : 'Đổi mâm cơm tối ngẫu nhiên'}
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>{isSingleDishMode ? 'Đổi món' : 'Đổi mâm'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMealFromSlot(activeDay.dayId, 'dinner')}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 font-bold transition-colors shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {activeDay.meals.dinner ? (
              isMealSet(activeDay.meals.dinner) ? (
                /* Rich 3-Dish Set Card */
                <div 
                  onClick={() => setSelectedMealSet(activeDay.meals.dinner as VietnameseMealSet)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 cursor-pointer space-y-2 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate min-w-0 flex-1">
                      {activeDay.meals.dinner.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold shrink-0 whitespace-nowrap">
                      Mâm 3 Món
                    </span>
                  </div>

                  {/* 3 Dishes Details */}
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <p className="truncate">🔴 <strong className="text-rose-600 dark:text-rose-400">Mặn:</strong> {activeDay.meals.dinner.mainDish.title}</p>
                    <p className="truncate">🔵 <strong className="text-sky-600 dark:text-sky-400">Canh:</strong> {activeDay.meals.dinner.soupDish.title}</p>
                    <p className="truncate">🟢 <strong className="text-emerald-600 dark:text-emerald-400">Rau:</strong> {activeDay.meals.dinner.sideDish.title}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {scaleCost(activeDay.meals.dinner.totalCostVnd, safeServings).toLocaleString('vi-VN')} đ
                    </span>
                    <span>{Math.round(activeDay.meals.dinner.totalCalories * scale)} kcal</span>
                  </div>
                </div>
              ) : (
                /* Single Dish */
                <div 
                  onClick={() => setSelectedRecipe(activeDay.meals.dinner as Recipe)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SafeImage 
                      src={(activeDay.meals.dinner as Recipe).imageUrl} 
                      alt={(activeDay.meals.dinner as Recipe).title} 
                      fallbackTitle={(activeDay.meals.dinner as Recipe).title}
                      category="Bữa Tối"
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                        {(activeDay.meals.dinner as Recipe).title}
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                        {scaleCost((activeDay.meals.dinner as Recipe).estimatedCostVnd || 35000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.dinner as Recipe).calories || 400) * scale)} kcal
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              )
            ) : (
              <button
                onClick={() => handleOpenSlotPicker(activeDay.dayId, 'dinner')}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isSingleDishMode ? 'Thêm Món Ăn Tối Gọn Nhẹ' : 'Thêm Mâm Cơm 3 Món Tối'}</span>
              </button>
            )}
          </div>

          {/* SLOT 4: BỮA PHỤ / XẾ / TRÁNG MIỆNG */}
          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <Apple className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  Xế / Tráng Miệng Gợi Ý
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                  Chè bưởi An Giang • Sâm bổ lượng hạt sen
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('recipes')}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline shrink-0 whitespace-nowrap"
            >
              Chọn món
            </button>
          </div>

        </div>

      </div>

      {/* SLOT PICKER AS NATIVE MOBILE BOTTOM SHEET */}
      {activeSlotPicker && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveSlotPicker(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              transform: pickerDragY > 0 ? `translateY(${pickerDragY}px)` : undefined,
              transition: pickerDragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up border-t border-slate-200 dark:border-slate-800"
          >
            {/* Swipe Handle Bar & Drag Zone */}
            <div 
              onTouchStart={(e) => { pickerTouchStartY.current = e.touches[0].clientY; }}
              onTouchMove={(e) => {
                if (pickerTouchStartY.current === null) return;
                const diff = e.touches[0].clientY - pickerTouchStartY.current;
                setPickerDragY(Math.max(0, diff));
              }}
              onTouchEnd={() => {
                if (pickerDragY > 75) setActiveSlotPicker(null);
                setPickerDragY(0);
                pickerTouchStartY.current = null;
              }}
              className="w-full py-3 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center touch-none select-none"
            >
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header with Title & Close Button */}
            <div className="px-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 select-none gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Chọn Món Cho {weeklyPlan.find(d => d.dayId === activeSlotPicker.dayId)?.dayName} ({activeSlotPicker.slot === 'breakfast' ? 'Bữa Sáng' : activeSlotPicker.slot === 'lunch' ? 'Bữa Trưa' : 'Bữa Tối'})</span>
                </h3>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate block">
                  Chạm để gán trực tiếp vào thực đơn ngày
                </span>
              </div>
              <button 
                onClick={() => setActiveSlotPicker(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selector: Mâm Cơm 3 Món vs Món Lẻ */}
            <div className="p-3 pb-2 flex gap-2 shrink-0">
              <button
                onClick={() => setPickerTab('meal-sets')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  pickerTab === 'meal-sets'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Bộ Mâm 3 Món ({mealSets.length})
              </button>
              <button
                onClick={() => setPickerTab('single-recipes')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  pickerTab === 'single-recipes'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Món Lẻ ({recipes.length})
              </button>
            </div>

            {/* Search filter in bottom sheet with diacritic tolerance */}
            <div className="px-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Tìm kiếm mâm cơm hoặc món ăn..."
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {pickerSearch && (
                  <button
                    onClick={() => setPickerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable list of items with diacritic-insensitive search */}
            <div className="overflow-y-auto p-3 space-y-2 flex-1 pb-8">
              {pickerTab === 'meal-sets' ? (
                (() => {
                  const filteredMealSets = mealSets.filter(set => matchesMealSetSearch(set, pickerSearch));
                  if (filteredMealSets.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400">
                        Không tìm thấy mâm cơm phù hợp với &quot;{pickerSearch}&quot;.
                      </div>
                    );
                  }
                  return filteredMealSets.map(set => (
                    <div
                      key={set.id}
                      onClick={() => {
                        addMealSetToSlot(activeSlotPicker.dayId, activeSlotPicker.slot, set.id);
                        setActiveSlotPicker(null);
                      }}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px]"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                          {set.title}
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                          {set.mainDish.title} + {set.soupDish.title} + {set.sideDish.title}
                        </p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                          {scaleCost(set.totalCostVnd, safeServings).toLocaleString('vi-VN')} đ • {Math.round(set.totalCalories * scale)} kcal
                        </span>
                      </div>
                      <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                  ));
                })()
              ) : (
                (() => {
                  const filteredRecipes = recipes.filter(recipe => 
                    matchesRecipeSearch(recipe, pickerSearch) || matchesSearchTerm(recipe.title, pickerSearch)
                  );
                  if (filteredRecipes.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400">
                        Không tìm thấy món ăn phù hợp với &quot;{pickerSearch}&quot;.
                      </div>
                    );
                  }
                  return filteredRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        addRecipeToSlot(activeSlotPicker.dayId, activeSlotPicker.slot, recipe.id);
                        setActiveSlotPicker(null);
                      }}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px]"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {recipe.title}
                        </span>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          {scaleCost(recipe.estimatedCostVnd || 35000, safeServings).toLocaleString('vi-VN')} đ • {Math.round((recipe.calories || 400) * scale)} kcal
                        </p>
                      </div>
                      <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                  ));
                })()
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
