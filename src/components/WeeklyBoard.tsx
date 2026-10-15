import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { MealSlot, Recipe, VietnameseMealSet } from '../types';
import { 
  Calendar, 
  Sparkles, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
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
  Apple,
  Eye,
  Lock
} from 'lucide-react';
import { matchesSearchTerm, matchesMealSetSearch, matchesRecipeSearch, isHotpotOrFeast } from '../utils/textUtils';
import { SafeImage } from './SafeImage';
import { roundToThousand, scaleCost, getDailyBudgetTarget } from '../utils/currency';
import { estimateRecipeProtein, estimateMealSetProtein, calculateGymProteinTarget } from '../utils/nutritionMath';

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
    swapDishInWeeklySlot,
    addRecipeToSlot,
    removeMealFromSlot,
    toggleSkipSlot,
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
    openConfirmModal,
    isRegistered,
    openAuthModal,
    isWeeklyShoppingCompleted
  } = useMealWise();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeSlotPicker, setActiveSlotPicker] = useState<{ dayId: string; slot: MealSlot } | null>(null);
  const [pickerTab, setPickerTab] = useState<'meal-sets' | 'single-recipes'>('meal-sets');
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [onlyWithinBudget, setOnlyWithinBudget] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [revealedLunchDays, setRevealedLunchDays] = useState<Record<string, boolean>>({});
  const [lunchPickModeModalDayId, setLunchPickModeModalDayId] = useState<string | null>(null);


  // Servings sanitization & scale (bounds [1..20], NaN protection, removing 0.5 floor distortion)
  const safeServings = Number.isFinite(servings) && servings > 0 
    ? Math.min(20, Math.max(1, Math.round(servings))) 
    : (onboardingData?.familySize || 4);
  const scale = safeServings / 4;


  // Touch Swipe Gestures with vertical scroll collision prevention
  const dayTouchStartX = useRef<number | null>(null);
  const dayTouchStartY = useRef<number | null>(null);
  const [pickerDragY, setPickerDragY] = useState<number>(0);
  const pickerTouchStartY = useRef<number | null>(null);

  // Infinite Snack Carousel refs & kinetic drag detection
  const snackCarouselRef = useRef<HTMLDivElement>(null);
  const isSnackPointerDown = useRef<boolean>(false);
  const snackPointerStartX = useRef<number>(0);
  const snackStartScrollLeft = useRef<number>(0);
  const snackLastPointerX = useRef<number>(0);
  const snackLastPointerTime = useRef<number>(0);
  const snackVelocityX = useRef<number>(0);
  const snackMomentumRaf = useRef<number | null>(null);
  const isSnackDragging = useRef<boolean>(false);

  const handleDayTouchStart = (e: React.TouchEvent) => {
    // If the touch originated from an element marked no-swipe, a carousel, horizontal scroll, or interactive element, ignore it completely
    const target = e.target as HTMLElement | null;
    if (target && target.closest('[data-no-swipe], .overflow-x-auto, [data-carousel], button, a, select, input')) {
      dayTouchStartX.current = null;
      dayTouchStartY.current = null;
      return;
    }
    dayTouchStartX.current = e.touches[0].clientX;
    dayTouchStartY.current = e.touches[0].clientY;
  };

  const handleDayTouchEnd = (e: React.TouchEvent) => {
    if (dayTouchStartX.current === null || dayTouchStartY.current === null) return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest('[data-no-swipe], .overflow-x-auto, [data-carousel], button, a, select, input')) {
      dayTouchStartX.current = null;
      dayTouchStartY.current = null;
      return;
    }
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

  const isMealSet = (item: any): item is VietnameseMealSet => {
    return item && 'mainDish' in item;
  };

  const isBantruDay = (day: typeof weeklyPlan[0]) => {
    const isWkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day.dayId);
    const isUserSkipLunch = onboardingData?.weekdayLunchRoutine === 'ban-tru-di-lam' || onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong';
    return Boolean(day.skippedSlots?.lunch ?? (isUserSkipLunch && isWkday));
  };

  const isSlotCountedInBudget = (day: typeof weeklyPlan[0], slot: MealSlot) => {
    if (!day.meals[slot]) return false;
    if (slot === 'lunch' && isBantruDay(day) && !revealedLunchDays[day.dayId]) {
      return false;
    }
    if (day.skippedSlots?.[slot]) return false;
    return true;
  };

  const getDayCost = (day: typeof weeklyPlan[0]) => {
    let cost = 0;
    (Object.keys(day.meals) as MealSlot[]).forEach(slot => {
      const m = day.meals[slot];
      if (m && isSlotCountedInBudget(day, slot)) {
        if (isMealSet(m)) cost += m.totalCostVnd;
        else cost += m.estimatedCostVnd || 35000;
      }
    });
    return scaleCost(cost, safeServings);
  };

  // Count only the 3 main meals (breakfast, lunch, dinner) — dessert/snack does not count toward the 3 daily or 21 weekly meals
  const getDayMainMealsCount = (day: typeof weeklyPlan[0]) => {
    return (['breakfast', 'lunch', 'dinner'] as MealSlot[]).filter(
      slot => Boolean(day.meals[slot]) && isSlotCountedInBudget(day, slot)
    ).length;
  };

  // Calculate overall weekly totals
  const totalWeeklyMeals = weeklyPlan.reduce((sum, day) => sum + getDayMainMealsCount(day), 0);

  const isWeeklyShoppingDone = useMemo(() => {
    if (totalWeeklyMeals === 0) return false;
    if (isWeeklyShoppingCompleted) return true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.getItem('mealwise_weekly_shopping_completed') === 'true') return true;
        const deletedRaw = localStorage.getItem('mealwise_deleted_grocery_items');
        if (deletedRaw) {
          const deleted = JSON.parse(deletedRaw);
          if (Array.isArray(deleted) && deleted.length > 0) {
            return true;
          }
        }
      }
    } catch {
      // Fallback
    }
    return false;
  }, [totalWeeklyMeals, isWeeklyShoppingCompleted, generationCount]);

  const isWeekendDay = (): boolean => {
    const day = new Date().getDay(); // 0 = Chủ Nhật, 6 = Thứ Bảy
    return day === 0 || day === 6;
  };

  const isPlanSoftLocked = isWeeklyShoppingDone && !isWeekendDay();

  const getSlotVietnameseName = (slot: MealSlot): string => {
    switch (slot) {
      case 'breakfast': return 'bữa sáng';
      case 'lunch': return 'bữa trưa';
      case 'dinner': return 'bữa tối';
      case 'snack': return 'bữa xế';
      default: return 'bữa ăn';
    }
  };

  const getDishTypeVietnameseName = (dishType: 'mainDish' | 'soupDish' | 'sideDish'): string => {
    switch (dishType) {
      case 'mainDish': return 'món mặn';
      case 'soupDish': return 'món canh';
      case 'sideDish': return 'món rau';
      default: return 'món ăn';
    }
  };

  const executeAutoFillWeekly = () => {
    setIsGenerating(true);
    autoFillWeeklyMenu();
    setTimeout(() => {
      setIsGenerating(false);
    }, 250);
  };

  const handleAutoFillWeekly = () => {
    if (isPlanSoftLocked) {
      openConfirmModal({
        title: 'Thực Đơn Đang Khóa An Toàn',
        message: 'Bạn đã hoàn thành đi chợ và cất nguyên liệu tuần này vào tủ lạnh. Việc tạo lại toàn bộ thực đơn sẽ thay thế các bữa ăn hiện tại và có thể không khớp với thực phẩm bạn đã mua. Bạn có chắc chắn muốn tạo lại không?',
        confirmLabel: 'Vẫn Tạo Mới',
        cancelLabel: 'Giữ Thực Đơn',
        isDanger: true,
        onConfirm: () => {
          executeAutoFillWeekly();
        }
      });
      return;
    }
    executeAutoFillWeekly();
  };

  // Sum the 7 displayed scaledDayCost values for exact arithmetic alignment with the day pills
  const scaledTotalWeeklyCost = weeklyPlan.reduce((sum, d) => sum + getDayCost(d), 0);

  // Active day nutrition & cost calculation
  let dayCalories = 0;
  let dayCost = 0;
  let dayProtein = 0;

  (Object.keys(activeDay.meals) as MealSlot[]).forEach(slot => {
    const meal = activeDay.meals[slot];
    if (meal && isSlotCountedInBudget(activeDay, slot)) {
      if (isMealSet(meal)) {
        dayCalories += meal.totalCalories;
        dayCost += meal.totalCostVnd;
        dayProtein += estimateMealSetProtein(meal);
      } else {
        dayCalories += meal.calories || 450;
        dayCost += meal.estimatedCostVnd || 35000;
        dayProtein += estimateRecipeProtein(meal);
      }
    }
  });

  const scaledDayCalories = Math.round(dayCalories * scale);
  const scaledDayCost = scaleCost(dayCost, safeServings);
  const scaledDayProtein = Math.round(dayProtein * scale);

  const activeMealSlots = (['breakfast', 'lunch', 'dinner'] as MealSlot[]).filter(s => isSlotCountedInBudget(activeDay, s) && activeDay.meals[s]);
  const activeMealCount = activeMealSlots.length;
  const targetGymProtein = calculateGymProteinTarget(safeServings, activeMealCount);
  const isGymGoalAchieved = scaledDayProtein >= targetGymProtein * 0.85;

  // Single-day budget target calculation from onboardingData.budgetLevel
  // tiet-kiem: 60,000 VND/person/day
  // vua-phai: 95,000 VND/person/day
  // thoai-mai: 140,000 VND/person/day
  const currentBudgetLevel = onboardingData?.budgetLevel || 'vua-phai';
  const dailyBudgetTarget = getDailyBudgetTarget(currentBudgetLevel, safeServings, onboardingData?.specialNeeds);

  const isOverBudget = scaledDayCost > dailyBudgetTarget * 1.1; // Exceeds by >10%
  const budgetExcess = scaledDayCost - dailyBudgetTarget;
  const isSingleDishMode = safeServings === 1 && onboardingData?.singleMealFormat !== 'meal-set';

  const hasAnyOverBudgetDay = weeklyPlan.some(d => getDayCost(d) > dailyBudgetTarget * 1.1);

  const dayRemainingBudget = Math.max(0, dailyBudgetTarget - scaledDayCost);

  // Quick snack suggestions that strictly fit within remaining budget room, or lowest-cost fallback
  const quickSnackSuggestions = useMemo(() => {
    const desserts = recipes.filter(r => r.category === 'trang-mieng');
    if (dayRemainingBudget > 0) {
      const affordable = desserts.filter(r => scaleCost(r.estimatedCostVnd || 25000, safeServings) <= dayRemainingBudget);
      if (affordable.length > 0) return affordable;
    }
    return [...desserts].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0));
  }, [recipes, dayRemainingBudget, safeServings]);

  // Looped snack suggestions (3 cloned sets: starts at the beginning, loops forward infinitely with plenty of runway)
  const loopedSnackSuggestions = useMemo(() => {
    const baseItems = quickSnackSuggestions.slice(0, 8);
    if (baseItems.length === 0) return [];
    return [
      ...baseItems.map(item => ({ ...item, _loopKey: `set1-${item.id}` })),
      ...baseItems.map(item => ({ ...item, _loopKey: `set2-${item.id}` })),
      ...baseItems.map(item => ({ ...item, _loopKey: `set3-${item.id}` }))
    ];
  }, [quickSnackSuggestions]);

  // Carousel starts at the beginning (item 1) on mount or day change
  useEffect(() => {
    const el = snackCarouselRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
    return () => {
      if (snackMomentumRaf.current !== null) {
        cancelAnimationFrame(snackMomentumRaf.current);
        snackMomentumRaf.current = null;
      }
    };
  }, [activeDay.dayId, quickSnackSuggestions.length]);

  // Forward infinite scroll loop handler: starts at the beginning, loops forward seamlessly
  const handleSnackCarouselScroll = () => {
    const el = snackCarouselRef.current;
    if (!el || quickSnackSuggestions.length === 0) return;
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    // Do not normalize while user is actively holding down/dragging to prevent any touch-momentum hitching
    if (isSnackPointerDown.current) return;

    // When scrolling forward past the second set, loop back seamlessly by one set width
    if (el.scrollLeft >= singleSetWidth * 2) {
      el.scrollLeft -= singleSetWidth;
    }
  };

  const handlePrevSnack = () => {
    const el = snackCarouselRef.current;
    if (!el) return;
    if (el.scrollLeft > 0) {
      el.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const handleNextSnack = () => {
    const el = snackCarouselRef.current;
    if (!el) return;
    el.scrollBy({ left: 160, behavior: 'smooth' });
  };

  const handleSnackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = snackCarouselRef.current;
    if (!el) return;

    if (snackMomentumRaf.current !== null) {
      cancelAnimationFrame(snackMomentumRaf.current);
      snackMomentumRaf.current = null;
    }

    isSnackPointerDown.current = true;
    isSnackDragging.current = false;
    snackPointerStartX.current = e.clientX;
    snackStartScrollLeft.current = el.scrollLeft;
    snackLastPointerX.current = e.clientX;
    snackLastPointerTime.current = performance.now();
    snackVelocityX.current = 0;
  };

  const handleSnackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSnackPointerDown.current) return;
    const el = snackCarouselRef.current;
    if (!el) return;

    const dx = e.clientX - snackPointerStartX.current;
    if (Math.abs(dx) > 5) {
      isSnackDragging.current = true;
    }

    // Only manually scroll for mouse pointers (touch devices use native momentum scrolling)
    if (e.pointerType === 'mouse') {
      el.scrollLeft = snackStartScrollLeft.current - dx;
      const now = performance.now();
      const dt = now - snackLastPointerTime.current;
      if (dt > 0) {
        snackVelocityX.current = (e.clientX - snackLastPointerX.current) / dt;
      }
      snackLastPointerX.current = e.clientX;
      snackLastPointerTime.current = now;
    }
  };

  const handleSnackPointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isSnackPointerDown.current = false;
    const el = snackCarouselRef.current;

    // For mouse, apply kinetic momentum glide
    if (el && e.pointerType === 'mouse' && Math.abs(snackVelocityX.current) > 0.15) {
      let v = snackVelocityX.current * 16;
      const glide = () => {
        if (!el || Math.abs(v) < 0.4) {
          snackMomentumRaf.current = null;
          handleSnackCarouselScroll();
          return;
        }
        el.scrollLeft -= v;
        v *= 0.92;
        handleSnackCarouselScroll();
        snackMomentumRaf.current = requestAnimationFrame(glide);
      };
      snackMomentumRaf.current = requestAnimationFrame(glide);
    } else {
      handleSnackCarouselScroll();
    }

    setTimeout(() => {
      isSnackDragging.current = false;
    }, 60);
  };

  // Safe snack selection: prevents click during drag/scroll
  const handleSelectSnack = (snackId: string) => {
    if (isSnackDragging.current) {
      return;
    }
    addRecipeToSlot(activeDay.dayId, 'snack', snackId);
  };

  const openSlotPickerInternal = (dayId: string, slot: MealSlot) => {
    const targetDay = weeklyPlan.find(d => d.dayId === dayId) || activeDay;
    const currentMeal = targetDay.meals[slot];
    if (slot === 'snack' || isSingleDishMode) {
      setPickerTab('single-recipes');
    } else if (slot === 'breakfast') {
      if (currentMeal && isMealSet(currentMeal)) {
        setPickerTab('meal-sets');
      } else {
        setPickerTab('single-recipes');
      }
    } else {
      setPickerTab('meal-sets');
    }
    setPickerSearch('');

    const currentMealCost = currentMeal
      ? (isMealSet(currentMeal)
          ? scaleCost(currentMeal.totalCostVnd, safeServings)
          : scaleCost(currentMeal.estimatedCostVnd || 35000, safeServings))
      : 0;
    const dayCostWithoutThisSlot = getDayCost(targetDay) - currentMealCost;
    const room = Math.max(0, dailyBudgetTarget - dayCostWithoutThisSlot);

    // Only default to filtering within budget if affordable items actually exist!
    let hasAffordable = false;
    if (room > 0) {
      if (slot === 'snack') {
        hasAffordable = recipes.some(r => r.category === 'trang-mieng' && scaleCost(r.estimatedCostVnd || 25000, safeServings) <= room);
      } else if (slot === 'breakfast') {
        hasAffordable = recipes.some(r => r.category === 'an-sang' && scaleCost(r.estimatedCostVnd || 30000, safeServings) <= room) ||
                        mealSets.some(s => scaleCost(s.totalCostVnd, safeServings) <= room);
      } else {
        hasAffordable = isSingleDishMode
          ? recipes.some(r => r.category !== 'an-sang' && r.category !== 'trang-mieng' && scaleCost(r.estimatedCostVnd || 35000, safeServings) <= room)
          : mealSets.some(s => scaleCost(s.totalCostVnd, safeServings) <= room);
      }
    }
    setOnlyWithinBudget(hasAffordable);
    setActiveSlotPicker({ dayId, slot });
  };

  const handleOpenSlotPicker = (dayId: string, slot: MealSlot) => {
    const targetDay = weeklyPlan.find(d => d.dayId === dayId) || activeDay;
    const currentMeal = targetDay.meals[slot];
    if (isPlanSoftLocked && currentMeal) {
      const slotName = getSlotVietnameseName(slot);
      openConfirmModal({
        title: 'Thực Đơn Đang Khóa An Toàn',
        message: `Bạn đã hoàn thành đi chợ tuần này và cất vào tủ lạnh. Việc chọn món khác thay thế cho ${slotName} có thể không khớp với nguyên liệu bạn đã mua. Bạn có chắc chắn muốn thay đổi không?`,
        confirmLabel: 'Vẫn Đổi Món',
        cancelLabel: 'Giữ Nguyên',
        isDanger: true,
        onConfirm: () => {
          openSlotPickerInternal(dayId, slot);
        }
      });
      return;
    }
    openSlotPickerInternal(dayId, slot);
  };

  const handleAutoSuggestLunch = (dayId: string) => {
    setLunchPickModeModalDayId(null);
    setRevealedLunchDays(prev => ({ ...prev, [dayId]: true }));

    const targetDay = weeklyPlan.find(d => d.dayId === dayId);
    if (!targetDay) return;

    // Calculate available room for lunch on this day
    let otherSlotsScaledCost = 0;
    (Object.keys(targetDay.meals) as MealSlot[]).forEach(s => {
      if (s === 'lunch') return;
      const m = targetDay.meals[s];
      if (m && isSlotCountedInBudget(targetDay, s)) {
        if (isMealSet(m)) otherSlotsScaledCost += scaleCost(m.totalCostVnd, safeServings);
        else otherSlotsScaledCost += scaleCost(m.estimatedCostVnd || 35000, safeServings);
      }
    });
    const availableRoomScaled = Math.max(0, dailyBudgetTarget - otherSlotsScaledCost);

    if (isSingleDishMode) {
      const eligible = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng' && !isHotpotOrFeast(r));
      const affordable = eligible.filter(r => scaleCost(r.estimatedCostVnd || 35000, safeServings) <= availableRoomScaled);
      const pool = affordable.length > 0 ? affordable : [...eligible].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0)).slice(0, 5);
      const pick = pool[Math.floor(Math.random() * pool.length)] || recipes[0];
      if (pick) {
        addRecipeToSlot(dayId, 'lunch', pick.id);
        showToast(`✨ Đã thêm món: ${pick.title}`);
      }
    } else {
      const eligibleSets = mealSets.filter(s => s && s.mainDish && !isHotpotOrFeast(s.mainDish) && !isHotpotOrFeast(s.soupDish) && !isHotpotOrFeast(s.sideDish));
      const affordable = eligibleSets.filter(s => scaleCost(s.totalCostVnd, safeServings) <= availableRoomScaled);
      const pool = affordable.length > 0 ? affordable : [...eligibleSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd).slice(0, 5);
      const pick = pool[Math.floor(Math.random() * pool.length)] || mealSets[0];
      if (pick) {
        addMealSetToSlot(dayId, 'lunch', pick.id);
        showToast(`✨ Đã xếp mâm: ${pick.title}`);
      }
    }
  };

  // 1-Click Swap Meal - Strictly budget constrained!
  const executeRandomSwap = (dayId: string, slot: MealSlot) => {
    // Calculate available room for this slot on this day
    let otherSlotsScaledCost = 0;
    (Object.keys(activeDay.meals) as MealSlot[]).forEach(s => {
      if (s === slot) return;
      const m = activeDay.meals[s];
      if (m && isSlotCountedInBudget(activeDay, s)) {
        if (isMealSet(m)) otherSlotsScaledCost += scaleCost(m.totalCostVnd, safeServings);
        else otherSlotsScaledCost += scaleCost(m.estimatedCostVnd || 35000, safeServings);
      }
    });
    const availableRoomScaled = Math.max(0, dailyBudgetTarget - otherSlotsScaledCost);

    if (slot === 'breakfast') {
      const breakfastList = recipes.filter(r => r.category === 'an-sang');
      const affordable = breakfastList.filter(r => scaleCost(r.estimatedCostVnd || 30000, safeServings) <= availableRoomScaled);
      const pool = affordable.length > 0 ? affordable : [...breakfastList].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0)).slice(0, 5);
      const randomBreakfast = pool[Math.floor(Math.random() * pool.length)] || recipes[0];
      addRecipeToSlot(dayId, slot, randomBreakfast.id);
      showToast(`🔄 Đã đổi sang món "${randomBreakfast.title}" (chuẩn ngân sách)!`);
    } else if (slot === 'snack') {
      const snackList = recipes.filter(r => r.category === 'trang-mieng');
      const affordableSnacks = snackList.filter(r => scaleCost(r.estimatedCostVnd || 25000, safeServings) <= availableRoomScaled);
      const pool = affordableSnacks.length > 0 ? affordableSnacks : [...snackList].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0)).slice(0, 5);
      const randomSnack = pool[Math.floor(Math.random() * pool.length)] || snackList[0];
      addRecipeToSlot(dayId, slot, randomSnack.id);
      showToast(`🔄 Đã đổi sang món xế "${randomSnack.title}" (chuẩn ngân sách)!`);
    } else {
      if (isSingleDishMode) {
        const eligibleRecipes = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng' && !isHotpotOrFeast(r));
        const affordable = eligibleRecipes.filter(r => scaleCost(r.estimatedCostVnd || 35000, safeServings) <= availableRoomScaled);
        const pool = affordable.length > 0 ? affordable : [...eligibleRecipes].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0)).slice(0, 5);
        const randomRecipe = pool[Math.floor(Math.random() * pool.length)] || recipes[0];
        addRecipeToSlot(dayId, slot, randomRecipe.id);
        showToast(`🔄 Đã đổi sang món "${randomRecipe.title}" (chuẩn ngân sách)!`);
      } else {
        const eligibleSets = mealSets.filter(s => !isHotpotOrFeast(s.mainDish) && !isHotpotOrFeast(s.soupDish) && !isHotpotOrFeast(s.sideDish));
        const affordable = eligibleSets.filter(s => scaleCost(s.totalCostVnd, safeServings) <= availableRoomScaled);
        const pool = affordable.length > 0 ? affordable : [...eligibleSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd).slice(0, 5);
        const randomSet = pool[Math.floor(Math.random() * pool.length)] || mealSets[0];
        addMealSetToSlot(dayId, slot, randomSet.id);
        showToast(`🔄 Đã đổi sang mâm "${randomSet.title}" (chuẩn ngân sách)!`);
      }
    }
  };

  const handleRandomSwap = (dayId: string, slot: MealSlot) => {
    if (isPlanSoftLocked) {
      const slotName = getSlotVietnameseName(slot);
      openConfirmModal({
        title: 'Thực Đơn Đang Khóa An Toàn',
        message: `Bạn đã mua đủ nguyên liệu trong tủ lạnh cho tuần này. Việc đổi món cho ${slotName} có thể làm lệch với thực phẩm đã chuẩn bị sẵn. Bạn có chắc chắn muốn đổi không?`,
        confirmLabel: 'Vẫn Đổi Món',
        cancelLabel: 'Giữ Nguyên',
        isDanger: true,
        onConfirm: () => {
          executeRandomSwap(dayId, slot);
        }
      });
      return;
    }
    executeRandomSwap(dayId, slot);
  };

  const handleSwapDishInWeeklySlot = (dayId: string, slot: MealSlot, dishType: 'mainDish' | 'soupDish' | 'sideDish') => {
    if (isPlanSoftLocked) {
      const dishTypeName = getDishTypeVietnameseName(dishType);
      openConfirmModal({
        title: 'Thực Đơn Đang Khóa An Toàn',
        message: `Bạn đã mua đủ nguyên liệu tuần này và cất vào tủ lạnh. Việc đổi riêng ${dishTypeName} có thể làm lệch thực phẩm đã mua. Bạn có chắc chắn muốn đổi không?`,
        confirmLabel: 'Vẫn Đổi Món',
        cancelLabel: 'Giữ Nguyên',
        isDanger: true,
        onConfirm: () => {
          swapDishInWeeklySlot(dayId, slot, dishType);
        }
      });
      return;
    }
    swapDishInWeeklySlot(dayId, slot, dishType);
  };

  const handleRemoveMealFromSlot = (dayId: string, slot: MealSlot) => {
    const doRemove = () => {
      removeMealFromSlot(dayId, slot);
      const isWkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayId);
      const isUserSkipLunch = onboardingData?.weekdayLunchRoutine === 'ban-tru-di-lam' || onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong';
      if (slot === 'lunch' && isUserSkipLunch && isWkday) {
        setRevealedLunchDays(prev => ({ ...prev, [dayId]: false }));
        const note = onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong' ? 'Mang cơm hộp văn phòng' : 'Bán trú • Ăn ngoài';
        toggleSkipSlot(dayId, 'lunch', note);
      }
    };

    if (isPlanSoftLocked) {
      const slotName = getSlotVietnameseName(slot);
      openConfirmModal({
        title: 'Thực Đơn Đang Khóa An Toàn',
        message: `Bạn đã mua đủ nguyên liệu cho ${slotName} trong tủ lạnh. Việc xóa bữa ăn có thể dẫn đến tồn đọng thực phẩm thừa. Bạn có chắc chắn muốn xóa không?`,
        confirmLabel: 'Vẫn Xóa',
        cancelLabel: 'Giữ Bữa Ăn',
        isDanger: true,
        onConfirm: doRemove
      });
      return;
    }
    doRemove();
  };

  const handleRecalibrateDay = (dayId: string) => {
    if (isPlanSoftLocked) {
      const dayLabel = DAY_LABELS[dayId]?.full || 'ngày này';
      openConfirmModal({
        title: 'Thực Đơn Đang Khóa An Toàn',
        message: `Bạn đã mua đủ nguyên liệu trong tủ lạnh cho tuần này. Việc đổi mới toàn bộ thực đơn cho ${dayLabel} có thể làm lệch thực phẩm đã chuẩn bị sẵn. Bạn có chắc chắn muốn đổi không?`,
        confirmLabel: 'Vẫn Đổi Ngày',
        cancelLabel: 'Giữ Nguyên',
        isDanger: true,
        onConfirm: () => {
          recalibrateDayMenu(dayId);
        }
      });
      return;
    }
    recalibrateDayMenu(dayId);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Quick Controls - Cohesive Native Mobile Hierarchy */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* 1. Header Bar: Eyebrow + Title on Left, Goal Pill & Clear Action on Right */}
        <div className="p-3.5 sm:p-4 pb-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">
                  Kế Hoạch 7 Ngày
                </span>
                {isPlanSoftLocked ? (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[9.5px] font-bold shrink-0"
                    title="Thực đơn đang khóa an toàn để bảo vệ nguyên liệu đã mua trong tủ lạnh."
                  >
                    <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                    <span>Khóa An Toàn</span>
                  </span>
                ) : isWeeklyShoppingDone && isWeekendDay() ? (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[9.5px] font-bold shrink-0"
                    title="Cuối tuần: bạn có thể tự do lên thực đơn mới cho tuần sau."
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Mở Đổi Tuần Mới</span>
                  </span>
                ) : null}
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                Thực Đơn Tuần
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Target Chip (Clickable to change goal) */}
            {onboardingData && onboardingData.completed && (
              <button
                type="button"
                onClick={() => {
                  if (!isRegistered) {
                    openAuthModal('register');
                    return;
                  }
                  setShowOnboarding(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer truncate max-w-[155px]"
                title={isRegistered ? 'Đổi mục tiêu' : 'Đổi mục tiêu 🔒'}
                aria-label={isRegistered ? 'Đổi mục tiêu' : 'Đổi mục tiêu 🔒'}
              >
                <span className="text-[11px] shrink-0">🎯</span>
                <span className="truncate">
                  {onboardingData.regionPreference === 'bac' ? 'Vị Bắc' : onboardingData.regionPreference === 'nam' ? 'Vị Nam' : onboardingData.regionPreference === 'trung' ? 'Vị Trung' : '3 Miền'}
                </span>
                {!isRegistered && <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold shrink-0">🔒</span>}
              </button>
            )}

            {/* Delete Menu Button */}
            <button
              type="button"
              onClick={() => {
                if (isPlanSoftLocked) {
                  openConfirmModal({
                    title: 'Thực Đơn Đang Khóa An Toàn',
                    message: 'Bạn đã hoàn thành đi chợ và cất đầy đủ nguyên liệu tuần này vào tủ lạnh. Việc xóa toàn bộ thực đơn sẽ làm mất kế hoạch nấu nướng khớp với thực phẩm trong tủ. Bạn có chắc chắn muốn xóa không?',
                    confirmLabel: 'Vẫn Xóa Thực Đơn',
                    cancelLabel: 'Giữ Lại',
                    isDanger: true,
                    onConfirm: () => {
                      clearWeeklyMenu();
                    }
                  });
                  return;
                }
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
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Xóa thực đơn tuần"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Body: Unified Servings & Weekly Budget Telemetry Sub-Card + Action Row */}
        <div className="p-3.5 sm:p-4 pt-3 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            
            {/* Row A: Servings Stepper Control */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block leading-tight truncate">
                    Khẩu phần gia đình
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block leading-tight truncate">
                    Tự động tính định lượng & ngân sách
                  </span>
                </div>
              </div>

              {/* Servings Stepper with accessible touch targets >= 32px (w-8 h-8) and bounds [1..20] */}
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setServings(Math.max(1, safeServings - 1))}
                  disabled={safeServings <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer font-black text-sm"
                  aria-label="Giảm khẩu phần"
                  title="Giảm 1 người"
                >
                  -
                </button>
                <div className="flex items-baseline px-1">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={safeServings}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setServings(Math.max(1, Math.min(20, val)));
                    }}
                    className="w-6 h-8 text-center text-xs font-black text-slate-900 dark:text-white bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Số người ăn"
                  />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pr-0.5 select-none">
                    người
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setServings(Math.min(20, safeServings + 1))}
                  disabled={safeServings >= 20}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer font-black text-sm"
                  aria-label="Tăng khẩu phần"
                  title="Tăng 1 người"
                >
                  +
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200/70 dark:border-slate-700/60" />

            {/* Row B: Compact Progress & Financial Health Strip */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 text-xs">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${totalWeeklyMeals === 21 ? 'bg-emerald-500' : 'bg-[#1D4ED8] animate-pulse'}`} />
                  <span>{totalWeeklyMeals} / 21 bữa đã xếp</span>
                </span>

                <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <span className={`font-black ${
                    hasAnyOverBudgetDay || scaledTotalWeeklyCost > (dailyBudgetTarget * 7) 
                      ? 'text-rose-600 dark:text-rose-400' 
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {scaledTotalWeeklyCost.toLocaleString('vi-VN')} đ <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">/ {(dailyBudgetTarget * 7).toLocaleString('vi-VN')} đ</span>
                  </span>

                  {(hasAnyOverBudgetDay || scaledTotalWeeklyCost > (dailyBudgetTarget * 7)) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlanSoftLocked) {
                          openConfirmModal({
                            title: 'Thực Đơn Đang Khóa An Toàn',
                            message: 'Bạn đã hoàn thành đi chợ và cất nguyên liệu tuần này vào tủ lạnh. Việc tự động cân chỉnh sẽ đổi các món ăn hiện tại và có thể không khớp với thực phẩm đã mua. Bạn có chắc chắn muốn cân chỉnh không?',
                            confirmLabel: 'Vẫn Cân Chỉnh',
                            cancelLabel: 'Giữ Nguyên',
                            isDanger: true,
                            onConfirm: () => {
                              recalibrateWeeklyMenu();
                            }
                          });
                          return;
                        }
                        recalibrateWeeklyMenu();
                      }}
                      className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                      title="Tự động cân chỉnh các món đắt tiền để về lại dưới trần ngân sách"
                    >
                      Cân chỉnh
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Progress Bar (21 meals) */}
              <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    totalWeeklyMeals === 21 ? 'bg-emerald-500' : 'bg-[#1D4ED8]'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((totalWeeklyMeals / 21) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-tutorial-target="weekly-autofill-btn"
              onClick={handleAutoFillWeekly}
              disabled={isGenerating}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs rounded-2xl shadow-xs active:scale-95 transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Đang Tạo Thực Đơn...' : 'Gợi Ý 1-Click Cả Tuần'}</span>
            </button>

            <button
              type="button"
              data-tutorial-target="weekly-grocery-btn"
              onClick={() => {
                setActiveTab('grocery');
                if (isWeeklyShoppingDone) {
                  showToast('✓ Bạn đã hoàn thành đi chợ cho thực đơn tuần này và cất vào tủ lạnh!', 'success');
                }
              }}
              className={`min-h-[44px] flex items-center gap-1.5 py-2.5 px-4 text-xs font-extrabold rounded-2xl transition-all active:scale-95 shrink-0 cursor-pointer border ${
                isWeeklyShoppingDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
              title={isWeeklyShoppingDone ? 'Đã hoàn thành đi chợ tuần này (Bấm để xem danh sách)' : 'Đi chợ theo thực đơn tuần'}
            >
              {isWeeklyShoppingDone ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Đi Chợ</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black leading-tight">
                    Đã xong
                  </span>
                </>
              ) : (
                <>
                  <span>Đi Chợ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* NATIVE MOBILE HORIZONTAL DAY PICKER STRIP (T2 -> CN) */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-7 gap-1">
          {weeklyPlan.map((day, index) => {
            const active = selectedDayIndex === index;
            const dayMeta = DAY_LABELS[day.dayId] || { short: `T${index + 2}`, full: day.dayName };
            const mealsCount = getDayMainMealsCount(day);
            const isFull = mealsCount >= 3;
            const thisDayCost = getDayCost(day);
            const thisDayOverBudget = thisDayCost > dailyBudgetTarget * 1.1;

            return (
              <button
                key={day.dayId}
                onClick={() => setSelectedDayIndex(index)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all min-h-[54px] relative cursor-pointer ${
                  active
                    ? 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white font-black shadow-xs scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xs font-black tracking-tight leading-none">
                  {dayMeta.short}
                </span>
                
                <span className={`text-[10px] mt-1 font-bold leading-none ${active ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {mealsCount}/3
                </span>

                {thisDayOverBudget && !active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5" title="Vượt ngân sách ngày" />
                ) : isFull && !active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
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
        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 animate-fade-in"
      >
        
        {/* Day Header & Quick Day Refresh Action */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                {activeDay.dayName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-slate-700">
                {getDayMainMealsCount(activeDay)}/3 bữa
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate block">
              {isSingleDishMode ? 'Thực đơn món đơn tiện lợi' : 'Mâm cơm gia đình chuẩn vị'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleRecalibrateDay(activeDay.dayId)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700/60 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            title="Đổi lại toàn bộ món ăn trong ngày này"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
            <span>Đổi Ngày</span>
          </button>
        </div>

        {/* Nutrition & Budget Metrics — Uniform 60% Slate/White surface, 10% semantic numbers */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* Card 1: Chi Phí */}
          <div className="p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all min-w-0 flex flex-col justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
              CHI PHÍ
            </span>
            <p className={`text-xs sm:text-sm font-black mt-0.5 truncate ${
              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}>
              {scaledDayCost.toLocaleString('vi-VN')} đ
            </p>
            <div className="mt-1 truncate">
              {isOverBudget ? (
                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400">
                  +{budgetExcess.toLocaleString('vi-VN')} đ
                </span>
              ) : scaledDayCost > 0 ? (
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  {dailyBudgetTarget >= scaledDayCost 
                    ? `✓ Dư ${(dailyBudgetTarget - scaledDayCost).toLocaleString('vi-VN')} đ` 
                    : `Mức ${dailyBudgetTarget.toLocaleString('vi-VN')} đ`}
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-semibold">Chưa xếp món</span>
              )}
            </div>
          </div>

          {/* Card 2: Calo */}
          <div className="p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center min-w-0 flex flex-col justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-0.5 truncate">
              <Flame className="w-2.5 h-2.5 shrink-0 text-amber-500" /> CALO
            </span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              {scaledDayCalories} kcal
            </p>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold truncate block">
              Năng lượng ngày
            </span>
          </div>

          {/* Card 3: Đạm */}
          <div className="p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center min-w-0 flex flex-col justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-0.5 truncate">
              <Dumbbell className="w-2.5 h-2.5 shrink-0 text-[#1D4ED8] dark:text-blue-400" /> ĐẠM
            </span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              ~{scaledDayProtein}g
            </p>
            <span className={`text-[9px] mt-1 font-semibold truncate block ${
              onboardingData?.specialNeeds?.includes('gym-protein')
                ? (isGymGoalAchieved ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold')
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              {onboardingData?.specialNeeds?.includes('gym-protein')
                ? (isGymGoalAchieved ? '✓ Đạt chuẩn Gym' : `Cần +${Math.max(0, targetGymProtein - scaledDayProtein)}g`)
                : 'Dinh dưỡng cân đối'}
            </span>
          </div>
        </div>

        {/* Over-budget Action Strip */}
        {isOverBudget && (
          <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-black truncate">
                Vượt ngân sách: +{budgetExcess.toLocaleString('vi-VN')} đ (Hạn mức: {dailyBudgetTarget.toLocaleString('vi-VN')} đ)
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:ml-2">
              <button
                type="button"
                onClick={() => handleRecalibrateDay(activeDay.dayId)}
                className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Cân Chỉnh Ngày</span>
              </button>
              <button
                type="button"
                onClick={() => recalibrateWeeklyMenu()}
                className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-[11px] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                title="Cân chỉnh toàn bộ các ngày trong tuần về đúng ngân sách"
              >
                <Sparkles className="w-3 h-3 text-[#1D4ED8]" />
                <span>Cả Tuần</span>
              </button>
            </div>
          </div>
        )}


        {/* Single-Person / Gym / Eat Clean Contextual Lifestyle Indicators */}
        {safeServings === 1 && (
          <div className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">👤</span>
              <span className="truncate">
                {isSingleDishMode
                  ? 'Khẩu phần 1 người (Món đơn): Tinh gọn 1 món trọn vị, nấu nhanh & không lo nấu thừa.'
                  : 'Khẩu phần 1 người (Mâm 3 món): Định lượng & chi phí thu nhỏ chuẩn mâm cơm truyền thống.'}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 ml-2 font-extrabold">
              {isSingleDishMode ? 'Món Đơn' : 'Mâm 3 Món'}
            </span>
          </div>
        )}

        {onboardingData?.specialNeeds?.includes('gym-protein') && (
          <div className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏋️</span>
              <div>
                <p className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Mục Tiêu Tập Gym:</span>
                  <span className="text-[#1D4ED8] dark:text-blue-400">~{scaledDayProtein}g / {targetGymProtein}g Đạm</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tăng cơ giảm mỡ, ưu tiên món thịt nạc, ức gà, trứng và đậu hũ.
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 self-start sm:self-center border ${
              isGymGoalAchieved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              {isGymGoalAchieved ? '✓ Đạt Chuẩn Gym' : `Cần Thêm ~${Math.max(0, targetGymProtein - scaledDayProtein)}g Đạm`}
            </span>
          </div>
        )}

        {/* MEAL SLOTS LIST FOR ACTIVE DAY */}
        <div className="space-y-3 pt-1">
          
          {/* SLOT 1: BỮA SÁNG */}
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                  Bữa Sáng Năng Lượng
                </span>
              </div>
              {activeDay.meals.breakfast && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRandomSwap(activeDay.dayId, 'breakfast')}
                    className="px-2 py-0.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 text-[11px] text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 font-bold flex items-center gap-1 transition-colors shrink-0"
                    title="Đổi món sáng ngẫu nhiên"
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>Đổi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMealFromSlot(activeDay.dayId, 'breakfast')}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-[11px] text-stone-500 hover:text-rose-600 dark:bg-stone-800/80 dark:hover:bg-rose-950/40 dark:text-stone-400 dark:hover:text-rose-400 font-bold transition-colors shrink-0"
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
                  className="p-3 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer space-y-2 shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100 truncate min-w-0 flex-1 hover:text-amber-600 transition-colors">
                      {(activeDay.meals.breakfast as VietnameseMealSet).title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold shrink-0 whitespace-nowrap border border-stone-200/80 dark:border-stone-700/80">
                      Mâm 3 Món
                    </span>
                  </div>

                  {/* 3 Dishes Details */}
                  <div className="space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40">Mặn</span>
                        <span className="truncate text-stone-800 dark:text-stone-200">{(activeDay.meals.breakfast as VietnameseMealSet).mainDish.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapDishInWeeklySlot(activeDay.dayId, 'breakfast', 'mainDish');
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                        title="Đổi riêng món mặn này"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>Đổi</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/40">Canh</span>
                        <span className="truncate text-stone-800 dark:text-stone-200">{(activeDay.meals.breakfast as VietnameseMealSet).soupDish.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapDishInWeeklySlot(activeDay.dayId, 'breakfast', 'soupDish');
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                        title="Đổi riêng món canh này"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>Đổi</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">Rau</span>
                        <span className="truncate text-stone-800 dark:text-stone-200">{(activeDay.meals.breakfast as VietnameseMealSet).sideDish.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapDishInWeeklySlot(activeDay.dayId, 'breakfast', 'sideDish');
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                        title="Đổi riêng món rau này"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>Đổi</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {scaleCost((activeDay.meals.breakfast as VietnameseMealSet).totalCostVnd, safeServings).toLocaleString('vi-VN')} đ
                    </span>
                    <span>{Math.round((activeDay.meals.breakfast as VietnameseMealSet).totalCalories * scale)} kcal</span>
                  </div>
                </div>
              ) : (
                /* Single Dish for Breakfast */
                <div 
                  onClick={() => setSelectedRecipe(activeDay.meals.breakfast as Recipe)}
                  className="p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer flex items-center justify-between gap-3 shadow-xs transition-all"
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
                      <p className="text-xs font-extrabold text-stone-900 dark:text-white leading-tight truncate">
                        {(activeDay.meals.breakfast as Recipe).title}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                        {scaleCost((activeDay.meals.breakfast as Recipe).estimatedCostVnd || 30000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.breakfast as Recipe).calories || 400) * scale)} kcal
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              )
            ) : (
              <button
                onClick={() => handleOpenSlotPicker(activeDay.dayId, 'breakfast')}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm món ăn sáng (Phở, Bún chả, Xôi...)</span>
              </button>
            )}
          </div>

          {/* SLOT 2: BỮA TRƯA */}
          {(() => {
            const isWkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(activeDay.dayId);
            const isUserSkipLunch = onboardingData?.weekdayLunchRoutine === 'ban-tru-di-lam' || onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong';
            const hasMeal = Boolean(activeDay.meals.lunch);
            const isBantruSlot = activeDay.skippedSlots?.lunch === true || (isUserSkipLunch && isWkday && (!hasMeal || activeDay.skippedSlots?.lunch !== false));
            const isLunchRevealed = Boolean(revealedLunchDays[activeDay.dayId]);
            const shouldShowBantruCompact = isBantruSlot && (!hasMeal || !isLunchRevealed);
            const routineIcon = onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong' ? '🍱' : '🏫';
            const defaultRoutineNote = onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong' ? 'Mang cơm hộp văn phòng' : 'Bán trú • Ăn ngoài';
            const routineSlotTitle = onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong' ? 'Bữa Trưa (Cơm Hộp)' : 'Bữa Trưa (Bán Trú)';

            return (
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                      {isBantruSlot 
                        ? routineSlotTitle 
                        : (isSingleDishMode ? 'Bữa Trưa Gọn Nhẹ' : 'Bữa Trưa Tròn Vị')}
                    </span>
                  </div>
                  
                  {shouldShowBantruCompact ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-300/50 shrink-0 whitespace-nowrap">
                      Không nấu trưa
                    </span>
                  ) : hasMeal ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRandomSwap(activeDay.dayId, 'lunch')}
                        className="px-2 py-0.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 text-[11px] text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 font-bold flex items-center gap-1 transition-colors shrink-0"
                        title={isSingleDishMode ? 'Đổi món trưa ngẫu nhiên' : 'Đổi mâm cơm trưa ngẫu nhiên'}
                      >
                        <RefreshCw className="w-3 h-3 shrink-0" />
                        <span>{isSingleDishMode ? 'Đổi món' : 'Đổi mâm'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveMealFromSlot(activeDay.dayId, 'lunch');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-[11px] text-stone-500 hover:text-rose-600 dark:bg-stone-800/80 dark:hover:bg-rose-950/40 dark:text-stone-400 dark:hover:text-rose-400 font-bold transition-colors shrink-0"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : null}
                </div>

                {shouldShowBantruCompact ? (
                  /* Compact Bán Trú / Cơm Hộp Card: NEVER truncated with ..., clean wrapping, single CTA */
                  <div 
                    onClick={() => {
                      if (hasMeal) {
                        setRevealedLunchDays(prev => ({ ...prev, [activeDay.dayId]: true }));
                      } else {
                        setLunchPickModeModalDayId(activeDay.dayId);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer flex items-center justify-between gap-2.5 shadow-2xs transition-all group select-none active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                        {routineIcon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-stone-900 dark:text-stone-100 leading-snug">
                          {activeDay.slotNotes?.lunch || defaultRoutineNote}
                        </p>
                        <p className="text-[10.5px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
                          {hasMeal 
                            ? 'Món trưa đang ẩn • Nhấn để xem món' 
                            : 'Đã loại trừ khỏi giỏ chợ & ngân sách'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasMeal) {
                          setRevealedLunchDays(prev => ({ ...prev, [activeDay.dayId]: true }));
                        } else {
                          setLunchPickModeModalDayId(activeDay.dayId);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 border border-amber-300/80 dark:border-stone-700 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {hasMeal ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Xem món</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Lên món</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : hasMeal ? (
                  isMealSet(activeDay.meals.lunch) ? (
                    /* Rich 3-Dish Set Card */
                    <div 
                      onClick={() => setSelectedMealSet(activeDay.meals.lunch as VietnameseMealSet)}
                      className="p-3 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer space-y-2 shadow-xs transition-all"
                    >
                      {isBantruSlot && (
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-300">
                          <span>{routineIcon} {onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong' ? 'Đang mở xem cơm hộp văn phòng' : 'Đang mở xem món trưa bán trú'}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedLunchDays(prev => ({ ...prev, [activeDay.dayId]: false }));
                            }}
                            className="font-black text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                          >
                            Ẩn lại ✕
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100 truncate min-w-0 flex-1 hover:text-amber-600 transition-colors">
                          {activeDay.meals.lunch.title}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold shrink-0 whitespace-nowrap border border-stone-200/80 dark:border-stone-700/80">
                          Mâm 3 Món
                        </span>
                      </div>

                      {/* 3 Dishes Details */}
                      <div className="space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                            <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40">Mặn</span>
                            <span className="truncate text-stone-800 dark:text-stone-200">{activeDay.meals.lunch.mainDish.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwapDishInWeeklySlot(activeDay.dayId, 'lunch', 'mainDish');
                            }}
                            className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                            title="Đổi riêng món mặn này (luôn chuẩn ngân sách)"
                          >
                            <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                            <span>Đổi</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                            <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/40">Canh</span>
                            <span className="truncate text-stone-800 dark:text-stone-200">{activeDay.meals.lunch.soupDish.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwapDishInWeeklySlot(activeDay.dayId, 'lunch', 'soupDish');
                            }}
                            className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                            title="Đổi riêng món canh này (luôn chuẩn ngân sách)"
                          >
                            <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                            <span>Đổi</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                            <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">Rau</span>
                            <span className="truncate text-stone-800 dark:text-stone-200">{activeDay.meals.lunch.sideDish.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwapDishInWeeklySlot(activeDay.dayId, 'lunch', 'sideDish');
                            }}
                            className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                            title="Đổi riêng món rau này (luôn chuẩn ngân sách)"
                          >
                            <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                            <span>Đổi</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {scaleCost(activeDay.meals.lunch.totalCostVnd, safeServings).toLocaleString('vi-VN')} đ
                        </span>
                        <span>{Math.round(activeDay.meals.lunch.totalCalories * scale)} kcal</span>
                      </div>
                    </div>
                  ) : (
                    /* Single Dish for Lunch */
                    <div className="space-y-1.5">
                      {isBantruSlot && (
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-300">
                          <span>🏫 Đang mở xem món trưa bán trú</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedLunchDays(prev => ({ ...prev, [activeDay.dayId]: false }));
                            }}
                            className="font-black text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                          >
                            Ẩn lại ✕
                          </button>
                        </div>
                      )}
                      <div 
                        onClick={() => setSelectedRecipe(activeDay.meals.lunch as Recipe)}
                        className="p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer flex items-center justify-between gap-3 shadow-xs transition-all"
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
                          <p className="text-xs font-extrabold text-stone-900 dark:text-white leading-tight truncate">
                            {(activeDay.meals.lunch as Recipe).title}
                          </p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                            {scaleCost((activeDay.meals.lunch as Recipe).estimatedCostVnd || 35000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.lunch as Recipe).calories || 400) * scale)} kcal
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </div>
                  </div>
                )
                ) : (
                  /* Non-Bán Trú Empty Lunch State */
                  <button
                    type="button"
                    onClick={() => setLunchPickModeModalDayId(activeDay.dayId)}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSingleDishMode ? 'Thêm món ăn trưa' : 'Thêm mâm cơm 3 món trưa'}</span>
                  </button>
                )}
              </div>
            );
          })()}

          {/* SLOT 3: BỮA TỐI */}
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                  {isSingleDishMode ? 'Bữa Tối Gọn Nhẹ (Món Đơn)' : 'Bữa Tối Sum Họp (3 Món)'}
                </span>
              </div>
              {activeDay.meals.dinner && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRandomSwap(activeDay.dayId, 'dinner')}
                    className="px-2 py-0.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 text-[11px] text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 font-bold flex items-center gap-1 transition-colors shrink-0"
                    title={isSingleDishMode ? 'Đổi món tối ngẫu nhiên' : 'Đổi mâm cơm tối ngẫu nhiên'}
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>{isSingleDishMode ? 'Đổi món' : 'Đổi mâm'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMealFromSlot(activeDay.dayId, 'dinner')}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-[11px] text-stone-500 hover:text-rose-600 dark:bg-stone-800/80 dark:hover:bg-rose-950/40 dark:text-stone-400 dark:hover:text-rose-400 font-bold transition-colors shrink-0"
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
                  className="p-3 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer space-y-2 shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100 truncate min-w-0 flex-1 hover:text-amber-600 transition-colors">
                      {activeDay.meals.dinner.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold shrink-0 whitespace-nowrap border border-stone-200/80 dark:border-stone-700/80">
                      Mâm 3 Món
                    </span>
                  </div>

                  {/* 3 Dishes Details */}
                  <div className="space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40">Mặn</span>
                        <span className="truncate text-stone-800 dark:text-stone-200">{activeDay.meals.dinner.mainDish.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapDishInWeeklySlot(activeDay.dayId, 'dinner', 'mainDish');
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                        title="Đổi riêng món mặn này"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>Đổi</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/40">Canh</span>
                        <span className="truncate text-stone-800 dark:text-stone-200">{activeDay.meals.dinner.soupDish.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapDishInWeeklySlot(activeDay.dayId, 'dinner', 'soupDish');
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                        title="Đổi riêng món canh này"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>Đổi</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="w-14 shrink-0 font-extrabold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">Rau</span>
                        <span className="truncate text-stone-800 dark:text-stone-200">{activeDay.meals.dinner.sideDish.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapDishInWeeklySlot(activeDay.dayId, 'dinner', 'sideDish');
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-400 dark:hover:text-stone-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                        title="Đổi riêng món rau này"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>Đổi</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {scaleCost(activeDay.meals.dinner.totalCostVnd, safeServings).toLocaleString('vi-VN')} đ
                    </span>
                    <span>{Math.round(activeDay.meals.dinner.totalCalories * scale)} kcal</span>
                  </div>
                </div>
              ) : (
                /* Single Dish */
                <div 
                  onClick={() => setSelectedRecipe(activeDay.meals.dinner as Recipe)}
                  className="p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer flex items-center justify-between gap-3 shadow-xs transition-all"
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
                      <p className="text-xs font-extrabold text-stone-900 dark:text-white leading-tight truncate">
                        {(activeDay.meals.dinner as Recipe).title}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                        {scaleCost((activeDay.meals.dinner as Recipe).estimatedCostVnd || 35000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.dinner as Recipe).calories || 400) * scale)} kcal
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              )
            ) : (
              <button
                onClick={() => handleOpenSlotPicker(activeDay.dayId, 'dinner')}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isSingleDishMode ? 'Thêm Món Ăn Tối Gọn Nhẹ' : 'Thêm Mâm Cơm 3 Món Tối'}</span>
              </button>
            )}
          </div>

          {/* SLOT 4: BỮA PHỤ / XẾ / TRÁNG MIỆNG */}
          {activeDay.meals.snack ? (
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                    Xế / Tráng Miệng ({safeServings} người)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRandomSwap(activeDay.dayId, 'snack')}
                    className="px-2 py-0.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 text-[11px] text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 font-bold flex items-center gap-1 transition-colors shrink-0"
                    title="Đổi món xế ngẫu nhiên"
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>Đổi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMealFromSlot(activeDay.dayId, 'snack')}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-[11px] text-stone-500 hover:text-rose-600 dark:bg-stone-800/80 dark:hover:bg-rose-950/40 dark:text-stone-400 dark:hover:text-rose-400 font-bold transition-colors shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Single dish presentation for snack */}
              <div 
                onClick={() => setSelectedRecipe(activeDay.meals.snack as Recipe)}
                className="p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer flex items-center justify-between gap-3 shadow-xs transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <SafeImage 
                    src={(activeDay.meals.snack as Recipe).imageUrl} 
                    alt={(activeDay.meals.snack as Recipe).title} 
                    fallbackTitle={(activeDay.meals.snack as Recipe).title}
                    category="Tráng Miệng"
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-stone-900 dark:text-white leading-tight truncate">
                      {(activeDay.meals.snack as Recipe).title}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                      {scaleCost((activeDay.meals.snack as Recipe).estimatedCostVnd || 25000, safeServings).toLocaleString('vi-VN')} đ • {Math.round(((activeDay.meals.snack as Recipe).calories || 200) * scale)} kcal
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300 shrink-0">
                    <Apple className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">
                      Xế / Tráng Miệng Gợi Ý
                    </span>
                    <span className="text-[10.5px] text-stone-500 dark:text-stone-400 truncate block">
                      {dayRemainingBudget > 0
                        ? `Ví còn dư ${dayRemainingBudget.toLocaleString('vi-VN')} đ • Gợi ý món xế vừa vặn ví:`
                        : 'Món tráng miệng thanh mát chuẩn vị:'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevSnack}
                    className="p-1 rounded-lg bg-stone-200/60 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                    title="Xem món trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSnack}
                    className="p-1 rounded-lg bg-stone-200/60 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                    title="Xem món tiếp theo"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSlotPicker(activeDay.dayId, 'snack')}
                    className="px-2.5 py-1 rounded-xl bg-stone-200/80 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ml-0.5"
                  >
                    Chọn món
                  </button>
                </div>
              </div>

              {/* Featured Food Slide Banner: Seamless Infinite Loop Carousel */}
              <div
                ref={snackCarouselRef}
                data-no-swipe="true"
                data-carousel="true"
                onScroll={handleSnackCarouselScroll}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleSnackCarouselScroll();
                }}
                onPointerDown={handleSnackPointerDown}
                onPointerMove={handleSnackPointerMove}
                onPointerUp={handleSnackPointerUpOrCancel}
                onPointerCancel={handleSnackPointerUpOrCancel}
                style={{
                  touchAction: 'pan-x',
                  overscrollBehaviorX: 'contain',
                  overscrollBehaviorY: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
                className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar snap-x snap-proximity -mx-1 px-1 select-none cursor-grab active:cursor-grabbing"
              >
                {loopedSnackSuggestions.map((item) => {
                  const itemCost = scaleCost(item.estimatedCostVnd || 25000, safeServings);
                  return (
                    <div
                      key={item._loopKey}
                      onClick={() => handleSelectSnack(item.id)}
                      className="w-[142px] sm:w-[155px] shrink-0 snap-start p-2 rounded-2xl bg-white dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between group cursor-pointer shadow-xs active:scale-97 select-none"
                      title={`Thêm ${item.title} (${itemCost.toLocaleString('vi-VN')} đ)`}
                    >
                      <div>
                        {/* Food Image with Calories Badge */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-1.5 bg-stone-100 dark:bg-stone-850 shrink-0 pointer-events-none">
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.title}
                            fallbackTitle={item.title}
                            category="Tráng Miệng"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-stone-950/75 backdrop-blur-xs text-[9px] font-bold text-white">
                            {Math.round((item.calories || 150) * scale)} kcal
                          </span>
                        </div>

                        {/* Title - 2 lines full name without cutting off */}
                        <h5 className="text-[11px] font-extrabold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug pointer-events-none">
                          {item.title}
                        </h5>
                      </div>

                      {/* Bottom Bar: Price & Add Button */}
                      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-stone-100 dark:border-stone-850/80">
                        <span className="text-[10.5px] font-black text-amber-600 dark:text-amber-400">
                          {itemCost.toLocaleString('vi-VN')} đ
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSnack(item.id);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-amber-500 group-hover:bg-amber-600 text-white text-[9.5px] font-black flex items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <span>+</span>
                          <span>Thêm</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SLOT PICKER AS NATIVE MOBILE BOTTOM SHEET */}
      {activeSlotPicker && (() => {
        const activeDayForPicker = weeklyPlan.find(d => d.dayId === activeSlotPicker.dayId) || activeDay;
        const currentMealInSlot = activeDayForPicker.meals[activeSlotPicker.slot];
        const currentMealCost = currentMealInSlot
          ? (isMealSet(currentMealInSlot)
              ? scaleCost(currentMealInSlot.totalCostVnd, safeServings)
              : scaleCost(currentMealInSlot.estimatedCostVnd || 35000, safeServings))
          : 0;

        const dayCostWithoutThisSlot = getDayCost(activeDayForPicker) - currentMealCost;
        const availableBudgetRoom = Math.max(0, dailyBudgetTarget - dayCostWithoutThisSlot);

        const slotTitle = activeSlotPicker.slot === 'breakfast'
          ? 'Bữa Sáng'
          : activeSlotPicker.slot === 'lunch'
          ? 'Bữa Trưa'
          : activeSlotPicker.slot === 'dinner'
          ? 'Bữa Tối'
          : 'Xế / Tráng Miệng';

        // Allow meal sets for breakfast, lunch, and dinner when not in single-dish mode (snack is single dish only)
        const showMealSetsTab = activeSlotPicker.slot !== 'snack' && !isSingleDishMode;

        // Filter recipes strictly by category
        let eligibleRecipes: Recipe[] = [];
        if (activeSlotPicker.slot === 'breakfast') {
          eligibleRecipes = recipes.filter(r => r.category === 'an-sang');
        } else if (activeSlotPicker.slot === 'snack') {
          eligibleRecipes = recipes.filter(r => r.category === 'trang-mieng');
        } else {
          eligibleRecipes = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng');
        }

        const affordableRecipes = eligibleRecipes.filter(r => 
          scaleCost(r.estimatedCostVnd || 30000, safeServings) <= availableBudgetRoom
        );
        const affordableMealSets = mealSets.filter(s => 
          scaleCost(s.totalCostVnd, safeServings) <= availableBudgetRoom
        );

        const activeAffordableCount = showMealSetsTab && pickerTab === 'meal-sets'
          ? affordableMealSets.length
          : affordableRecipes.length;

        const minCostInList = showMealSetsTab && pickerTab === 'meal-sets'
          ? (mealSets.length > 0 ? Math.min(...mealSets.map(s => scaleCost(s.totalCostVnd, safeServings))) : 0)
          : (eligibleRecipes.length > 0 ? Math.min(...eligibleRecipes.map(r => scaleCost(r.estimatedCostVnd || 30000, safeServings))) : 0);

        // When onlyWithinBudget is active, strictly filter to items within budget.
        // No fake fallbacks that dump 11,000đ items under "≤ 3,000đ"!
        const recipesToDisplay = onlyWithinBudget && availableBudgetRoom > 0
          ? affordableRecipes
          : [...eligibleRecipes].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0));

        const mealSetsToDisplay = onlyWithinBudget && availableBudgetRoom > 0
          ? affordableMealSets
          : [...mealSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd);

        const filteredMealSets = mealSetsToDisplay.filter(set => matchesMealSetSearch(set, pickerSearch));
        const filteredRecipes = recipesToDisplay.filter(recipe => 
          matchesRecipeSearch(recipe, pickerSearch) || matchesSearchTerm(recipe.title, pickerSearch)
        );

        return (
          <div 
            className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setActiveSlotPicker(null)}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{
                transform: pickerDragY > 0 ? `translateY(${pickerDragY}px)` : undefined,
                transition: pickerDragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
              }}
              className="w-full max-w-lg bg-white dark:bg-[#1A1918] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up border-t border-[#E8E2D8] dark:border-[#252220]"
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
                <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
              </div>

              {/* Header with Title & Close Button */}
              <div className="px-4 pb-3 flex items-center justify-between border-b border-[#E8E2D8] dark:border-[#252220] shrink-0 select-none gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5 truncate">
                    <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">Chọn Món Cho {activeDayForPicker.dayName} ({slotTitle})</span>
                  </h3>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium truncate block">
                    Chỉ hiển thị các món phù hợp với {slotTitle}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveSlotPicker(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#252220] flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors shrink-0"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector: only when meal sets are applicable */}
              {showMealSetsTab ? (
                <div className="p-3 pb-2 flex gap-2 shrink-0">
                  <button
                    onClick={() => setPickerTab('meal-sets')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      pickerTab === 'meal-sets'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-black shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    Bộ Mâm 3 Món ({mealSetsToDisplay.length})
                  </button>
                  <button
                    onClick={() => setPickerTab('single-recipes')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      pickerTab === 'single-recipes'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-black shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {activeSlotPicker.slot === 'breakfast' ? 'Món Ăn Sáng' : 'Món Lẻ Trưa/Tối'} ({recipesToDisplay.length})
                  </button>
                </div>
              ) : (
                <div className="px-4 pt-2.5 pb-1 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0">
                  <span className="text-stone-900 dark:text-stone-100 font-extrabold flex items-center gap-1.5">
                    <span>Danh mục:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] border border-stone-200 dark:border-stone-700">
                      {activeSlotPicker.slot === 'breakfast' ? 'Món Ăn Sáng' : 'Món Xế & Tráng Miệng'}
                    </span>
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    ({recipesToDisplay.length} món {onlyWithinBudget && availableBudgetRoom > 0 ? 'vừa ví' : 'phù hợp'})
                  </span>
                </div>
              )}

              {/* Budget Room Suggestion Bar */}
              {availableBudgetRoom > 0 && (
                <div className="mx-3 my-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 min-w-0">
                    <span>💰 Hạn mức còn dư:</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                      ≤ {availableBudgetRoom.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyWithinBudget(!onlyWithinBudget)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all shrink-0 cursor-pointer ${
                      onlyWithinBudget
                        ? 'bg-emerald-600 text-white font-black shadow-xs'
                        : 'bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {onlyWithinBudget 
                      ? `✓ Đang lọc vừa ví (${activeAffordableCount})` 
                      : 'Xem tất cả giá'}
                  </button>
                </div>
              )}

              {/* Informative notice when viewing all prices because budget is below minimum dish cost */}
              {!onlyWithinBudget && availableBudgetRoom > 0 && activeAffordableCount === 0 && (
                <div className="mx-3 mb-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-[10.5px] text-amber-900 dark:text-amber-200 font-medium shrink-0 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>
                    Hạn mức còn dư ({availableBudgetRoom.toLocaleString('vi-VN')} đ) thấp hơn món rẻ nhất ({minCostInList.toLocaleString('vi-VN')} đ). Đang hiển thị tất cả theo giá tăng dần:
                  </span>
                </div>
              )}

              {/* Search filter in bottom sheet with diacritic tolerance */}
              <div className="px-3 py-1 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    placeholder="Tìm kiếm mâm cơm hoặc món ăn..."
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                  {pickerSearch && (
                    <button
                      onClick={() => setPickerSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable list of items with diacritic-insensitive search */}
              <div className="overflow-y-auto p-3 space-y-2 flex-1 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
                {showMealSetsTab && pickerTab === 'meal-sets' ? (
                  filteredMealSets.length === 0 ? (
                    onlyWithinBudget && availableBudgetRoom > 0 && affordableMealSets.length === 0 ? (
                      <div className="p-6 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 my-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl">
                          💰
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-stone-900 dark:text-white">
                            Không có mâm cơm nào trong hạn mức ≤ {availableBudgetRoom.toLocaleString('vi-VN')} đ
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
                            Mâm cơm có giá từ {minCostInList.toLocaleString('vi-VN')} đ. Bấm bên dưới để xem toàn bộ danh sách mâm.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOnlyWithinBudget(false)}
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-black transition-all active:scale-95 shadow-xs cursor-pointer"
                        >
                          Xem tất cả {mealSets.length} mâm (từ {minCostInList.toLocaleString('vi-VN')} đ)
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400">
                        {pickerSearch
                          ? `Không tìm thấy mâm cơm phù hợp với "${pickerSearch}".`
                          : `Không có mâm cơm nào phù hợp với bộ lọc hiện tại.`}
                      </div>
                    )
                  ) : (
                    filteredMealSets.map(set => {
                      const setCost = scaleCost(set.totalCostVnd, safeServings);
                      const isOverBudgetRoom = availableBudgetRoom > 0 && setCost > availableBudgetRoom;
                      return (
                        <div
                          key={set.id}
                          onClick={() => {
                            addMealSetToSlot(activeSlotPicker.dayId, activeSlotPicker.slot, set.id);
                            setActiveSlotPicker(null);
                          }}
                          className={`p-3 rounded-2xl border hover:border-stone-300 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px] ${
                            isOverBudgetRoom && !onlyWithinBudget
                              ? 'bg-stone-50/80 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/50'
                              : 'bg-stone-50 hover:bg-stone-100/80 dark:bg-stone-800/60 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-stone-900 dark:text-white block truncate">
                              {set.title}
                            </span>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                              {set.mainDish.title} + {set.soupDish.title} + {set.sideDish.title}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-[10px] text-stone-900 dark:text-stone-200 font-bold">
                                {setCost.toLocaleString('vi-VN')} đ • {Math.round(set.totalCalories * scale)} kcal
                              </span>
                              {isOverBudgetRoom && !onlyWithinBudget && (
                                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                                  +{ (setCost - availableBudgetRoom).toLocaleString('vi-VN') } đ
                                </span>
                              )}
                            </div>
                          </div>
                          <PlusCircle className="w-5 h-5 text-stone-600 dark:text-stone-400 shrink-0" />
                        </div>
                      );
                    })
                  )
                ) : (
                  filteredRecipes.length === 0 ? (
                    onlyWithinBudget && availableBudgetRoom > 0 && affordableRecipes.length === 0 ? (
                      <div className="p-6 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 my-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl">
                          💰
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-stone-900 dark:text-white">
                            Không có món nào trong hạn mức ≤ {availableBudgetRoom.toLocaleString('vi-VN')} đ
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
                            Món trong danh mục này có giá từ {minCostInList.toLocaleString('vi-VN')} đ. Bấm bên dưới để xem toàn bộ danh sách món.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOnlyWithinBudget(false)}
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-black transition-all active:scale-95 shadow-xs cursor-pointer"
                        >
                          Xem tất cả {eligibleRecipes.length} món (từ {minCostInList.toLocaleString('vi-VN')} đ)
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400">
                        {pickerSearch 
                          ? `Không tìm thấy món ăn phù hợp với "${pickerSearch}".`
                          : `Không có món nào phù hợp với bộ lọc hiện tại.`}
                      </div>
                    )
                  ) : (
                    filteredRecipes.map(recipe => {
                      const recipeCost = scaleCost(recipe.estimatedCostVnd || 30000, safeServings);
                      const isOverBudgetRoom = availableBudgetRoom > 0 && recipeCost > availableBudgetRoom;
                      return (
                        <div
                          key={recipe.id}
                          onClick={() => {
                            addRecipeToSlot(activeSlotPicker.dayId, activeSlotPicker.slot, recipe.id);
                            setActiveSlotPicker(null);
                          }}
                          className={`p-3 rounded-2xl border hover:border-stone-300 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px] ${
                            isOverBudgetRoom && !onlyWithinBudget
                              ? 'bg-stone-50/80 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/50'
                              : 'bg-stone-50 hover:bg-stone-100/80 dark:bg-stone-800/60 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-stone-900 dark:text-white block truncate">
                              {recipe.title}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[10px] text-stone-800 dark:text-stone-200 font-bold">
                                {recipeCost.toLocaleString('vi-VN')} đ • {Math.round((recipe.calories || 300) * scale)} kcal
                              </span>
                              {isOverBudgetRoom && !onlyWithinBudget && (
                                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                                  +{ (recipeCost - availableBudgetRoom).toLocaleString('vi-VN') } đ
                                </span>
                              )}
                            </div>
                          </div>
                          <PlusCircle className="w-5 h-5 text-stone-600 dark:text-stone-400 shrink-0" />
                        </div>
                      );
                    })
                  )
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* Lunch Pick Mode Modal (Tự Chọn Món vs Để Hệ Thống Gợi Ý) */}
      {lunchPickModeModalDayId && (() => {
        const targetDayLabel = DAY_LABELS[lunchPickModeModalDayId]?.full || 'Hôm Nay';
        return (
          <div 
            onClick={() => setLunchPickModeModalDayId(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white dark:bg-[#1E1C1A] rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Lên Món Bữa Trưa • {targetDayLabel}</span>
                  </div>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    Bạn muốn lên món theo cách nào?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Chọn cách lên món phù hợp với quỹ thời gian của bạn hôm nay.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLunchPickModeModalDayId(null)}
                  className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer shrink-0"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {/* Option 1: Tự chọn món */}
                <button
                  type="button"
                  onClick={() => {
                    const dayId = lunchPickModeModalDayId;
                    setLunchPickModeModalDayId(null);
                    if (!dayId) return;
                    setRevealedLunchDays(prev => ({ ...prev, [dayId]: true }));
                    handleOpenSlotPicker(dayId, 'lunch');
                  }}
                  className="w-full p-3.5 rounded-2xl border-2 border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-stone-900 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition-all group cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Tự Chọn Món
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                        Duyệt danh sách món lẻ hoặc mâm cơm 3 món theo khẩu vị
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* Option 2: Để hệ thống gợi ý */}
                <button
                  type="button"
                  onClick={() => {
                    const dayId = lunchPickModeModalDayId;
                    if (!dayId) return;
                    handleAutoSuggestLunch(dayId);
                  }}
                  className="w-full p-3.5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 hover:border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 text-left transition-all group cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span>Để Hệ Thống Gợi Ý</span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          Nhanh
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-snug">
                        Tự động chọn món cân đối dinh dưỡng và chuẩn ngân sách ngày
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>

              {/* Close footer */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setLunchPickModeModalDayId(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Để Sau
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
