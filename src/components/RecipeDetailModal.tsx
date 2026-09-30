import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMealWise, ExtraGroceryItem } from '../context/MealWiseContext';
import { 
  X, 
  Clock, 
  Flame, 
  Users, 
  Utensils, 
  ChefHat, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Sparkles,
  Timer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Play,
  Pause,
  Bell,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { Ingredient, CookingInstruction } from '../types';

interface CategorizedGroup {
  key: 'thit-ca' | 'rau-cu' | 'gia-vi';
  title: string;
  badgeLabel: string;
  badgeClass: string;
  dotClass: string;
  items: { ingredient: Ingredient; originalIndex: number }[];
}

export const RecipeDetailModal: React.FC = () => {
  const { selectedRecipe, setSelectedRecipe, selectedMealSet, addExtraGroceryItems, showToast } = useMealWise();
  const [dragY, setDragY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  // Servings Stepper State
  const [servings, setServings] = useState<number>(selectedRecipe?.servings || 4);

  // Interactive Ingredient Checklist State
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Cooking Steps Accordion & Progress State
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Hands-Free Step-by-Step Cooking Mode State
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showHandsFreeIngredients, setShowHandsFreeIngredients] = useState<boolean>(false);

  // Actionable Countdown Timer State
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>('Hẹn giờ nấu');

  // Play audio alert safely using Web Audio API
  const playTimerAlarm = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Fallback if browser audio policy prevents sound
    }
  };

  // Sync state when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      setServings(selectedRecipe.servings || 4);
      setIsHandsFreeMode(false);
      setActiveStepIndex(0);
      setShowHandsFreeIngredients(false);

      // Restore saved ingredient checklist from localStorage
      try {
        const savedIng = localStorage.getItem(`mealwise_recipe_ing_${selectedRecipe.id}`);
        if (savedIng) {
          setCheckedIngredients(JSON.parse(savedIng));
        } else {
          setCheckedIngredients({});
        }
      } catch {
        setCheckedIngredients({});
      }

      // Restore saved step completion from localStorage
      try {
        const savedProgress = localStorage.getItem(`mealwise_recipe_progress_${selectedRecipe.id}`);
        if (savedProgress) {
          setCompletedSteps(JSON.parse(savedProgress));
        } else {
          setCompletedSteps({});
        }
      } catch {
        setCompletedSteps({});
      }

      // Default expand all steps for easy scanning
      const allOpen: Record<number, boolean> = {};
      selectedRecipe.instructions.forEach(inst => {
        allOpen[inst.step] = true;
      });
      setExpandedSteps(allOpen);
    }
  }, [selectedRecipe?.id]);

  // Actionable Countdown Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerIsRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            playTimerAlarm();
            showToast(`⏰ Hết giờ! Thời gian nấu cho "${timerLabel}" đã hoàn tất!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerIsRunning) {
      setTimerIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timerSecondsLeft, timerLabel]);

  // Touch Drag-to-dismiss gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragY(Math.min(diff, 200));
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 75) {
      setSelectedRecipe(null);
      setIsHandsFreeMode(false);
      setIsTimerOpen(false);
    }
    setDragY(0);
    touchStartY.current = null;
  };

  // Dynamic ingredient scaling
  const formatScaledAmount = (amount: number | string): string => {
    if (!selectedRecipe || (selectedRecipe.servings || 4) <= 0) return String(amount);
    const ratio = servings / (selectedRecipe.servings || 4);

    if (typeof amount === 'number') {
      const scaled = amount * ratio;
      if (Number.isInteger(scaled)) {
        return scaled.toString();
      }
      const rounded = Math.round(scaled * 100) / 100;
      return rounded.toString().replace('.', ',');
    }

    const str = String(amount).trim();

    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0].trim());
        const den = parseFloat(parts[1].trim());
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          const scaled = (num / den) * ratio;
          if (Number.isInteger(scaled)) {
            return scaled.toString();
          }
          const rounded = Math.round(scaled * 100) / 100;
          return rounded.toString().replace('.', ',');
        }
      }
    }

    const parsed = parseFloat(str.replace(',', '.'));
    if (!isNaN(parsed) && isFinite(parsed)) {
      const scaled = parsed * ratio;
      if (Number.isInteger(scaled)) {
        return scaled.toString();
      }
      const rounded = Math.round(scaled * 100) / 100;
      return rounded.toString().replace('.', ',');
    }

    return str;
  };

  // Categorize ingredient list into clean visual sections (MUST be called before any early return)
  const categorizedGroups = useMemo<CategorizedGroup[]>(() => {
    if (!selectedRecipe?.ingredients) return [];

    const groups: Record<'thit-ca' | 'rau-cu' | 'gia-vi', { ingredient: Ingredient; originalIndex: number }[]> = {
      'thit-ca': [],
      'rau-cu': [],
      'gia-vi': []
    };

    selectedRecipe.ingredients.forEach((ing, originalIndex) => {
      const cat = ing.category;
      if (cat === 'rau-cu') {
        groups['rau-cu'].push({ ingredient: ing, originalIndex });
      } else if (cat === 'gia-vi' || cat === 'do-kho') {
        groups['gia-vi'].push({ ingredient: ing, originalIndex });
      } else if (cat === 'thit-ca') {
        groups['thit-ca'].push({ ingredient: ing, originalIndex });
      } else {
        // Fallback heuristic based on common Vietnamese culinary keywords
        const lower = (ing.name || '').toLowerCase();
        if (/rau|cải|cà chua|dưa|nấm|hành|tỏi|ớt|gừng|sả|chanh|mướp|bầu|bí|giá|ngò|thì là|chuối|đậu bắp|đậu cô ve|bắp/.test(lower)) {
          groups['rau-cu'].push({ ingredient: ing, originalIndex });
        } else if (/nước mắm|nước tương|muối|tiêu|đường|hạt nêm|mì chính|bột ngọt|dầu|dầu hào|giấm|rượu|sa tế|ngũ vị|bột|mắm|tương|mè|vừng|quế|hồi/.test(lower)) {
          groups['gia-vi'].push({ ingredient: ing, originalIndex });
        } else {
          groups['thit-ca'].push({ ingredient: ing, originalIndex });
        }
      }
    });

    const result: CategorizedGroup[] = [];

    if (groups['thit-ca'].length > 0) {
      result.push({
        key: 'thit-ca',
        title: 'Nguyên liệu chính',
        badgeLabel: 'Đạm & Cốt lõi',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        dotClass: 'bg-rose-500',
        items: groups['thit-ca']
      });
    }

    if (groups['rau-cu'].length > 0) {
      result.push({
        key: 'rau-cu',
        title: 'Rau củ',
        badgeLabel: 'Rau củ tươi',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
        dotClass: 'bg-emerald-500',
        items: groups['rau-cu']
      });
    }

    if (groups['gia-vi'].length > 0) {
      result.push({
        key: 'gia-vi',
        title: 'Gia vị & Ướp',
        badgeLabel: 'Gia vị & Đồ ướp',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        dotClass: 'bg-amber-500',
        items: groups['gia-vi']
      });
    }

    return result;
  }, [selectedRecipe?.ingredients]);

  if (!selectedRecipe) return null;

  const scaledCost = Math.round(((selectedRecipe.estimatedCostVnd || 30000) * servings) / (selectedRecipe.servings || 4));
  const scaledCalories = Math.round(((selectedRecipe.calories || 400) * servings) / (selectedRecipe.servings || 4));

  // Checklist controls
  const totalIngredients = selectedRecipe.ingredients.length;
  const checkedIngredientsCount = selectedRecipe.ingredients.filter((ing, idx) => checkedIngredients[`${ing.name}_${idx}`]).length;
  const isAllIngredientsChecked = totalIngredients > 0 && checkedIngredientsCount === totalIngredients;
  const ingredientsPrepPercent = totalIngredients > 0 ? Math.round((checkedIngredientsCount / totalIngredients) * 100) : 0;

  const toggleIngredientChecked = (key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCheckedIngredients(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`mealwise_recipe_ing_${selectedRecipe.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const checkAllIngredients = () => {
    const all: Record<string, boolean> = {};
    selectedRecipe.ingredients.forEach((ing, idx) => {
      all[`${ing.name}_${idx}`] = true;
    });
    setCheckedIngredients(all);
    try {
      localStorage.setItem(`mealwise_recipe_ing_${selectedRecipe.id}`, JSON.stringify(all));
    } catch {}
  };

  const resetIngredientsChecklist = () => {
    setCheckedIngredients({});
    try {
      localStorage.removeItem(`mealwise_recipe_ing_${selectedRecipe.id}`);
    } catch {}
  };

  // Timer controls
  const formatTimerDisplay = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimerWithDuration = (seconds: number, label: string = 'Hẹn giờ') => {
    setTimerTotalDuration(seconds);
    setTimerSecondsLeft(seconds);
    setTimerLabel(label);
    setTimerIsRunning(true);
    setIsTimerOpen(true);
  };

  const toggleTimerPlayPause = () => {
    if (timerSecondsLeft === 0 && timerTotalDuration > 0) {
      setTimerSecondsLeft(timerTotalDuration);
      setTimerIsRunning(true);
    } else {
      setTimerIsRunning(prev => !prev);
    }
  };

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerSecondsLeft(timerTotalDuration || 300);
  };

  const clearTimer = () => {
    setTimerIsRunning(false);
    setTimerSecondsLeft(0);
    setTimerTotalDuration(0);
    setIsTimerOpen(false);
  };

  // Accordion controls
  const toggleStepExpanded = (stepNum: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const expandAllSteps = () => {
    const all: Record<number, boolean> = {};
    selectedRecipe.instructions.forEach(inst => {
      all[inst.step] = true;
    });
    setExpandedSteps(all);
  };

  const collapseAllSteps = () => {
    setExpandedSteps({});
  };

  const toggleStepCompleted = (stepNum: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompletedSteps(prev => {
      const next = { ...prev, [stepNum]: !prev[stepNum] };
      try {
        localStorage.setItem(`mealwise_recipe_progress_${selectedRecipe.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetCookingProgress = () => {
    setCompletedSteps({});
    try {
      localStorage.removeItem(`mealwise_recipe_progress_${selectedRecipe.id}`);
    } catch {}
  };

  // Hands-free mode navigation
  const enterHandsFreeMode = (stepIndex: number = 0) => {
    setActiveStepIndex(Math.max(0, Math.min(stepIndex, selectedRecipe.instructions.length - 1)));
    setIsHandsFreeMode(true);
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      showToast(`🎉 Chúc mừng! Bạn đã hoàn thành nấu món "${selectedRecipe.title}"!`);
      setIsHandsFreeMode(false);
    }
  };

  // 1-Click push scaled ingredients to extraGroceryItems
  const handlePushToGrocery = () => {
    if (!selectedRecipe) return;
    const factor = Math.max(0.1, servings / (selectedRecipe.servings || 4));
    const newItems: ExtraGroceryItem[] = selectedRecipe.ingredients.map(ing => {
      const numAmount = typeof ing.amount === 'number' ? ing.amount : parseFloat(String(ing.amount).replace(',', '.')) || 1;
      const scaledAmount = Math.round(numAmount * factor * 10) / 10;
      const costPortion = Math.round(((selectedRecipe.estimatedCostVnd || 30000) * factor) / (selectedRecipe.ingredients.length || 1));
      return {
        name: ing.name,
        amount: scaledAmount,
        unit: ing.unit,
        category: (ing.category as any) || 'thit-ca',
        cost: costPortion
      };
    });

    if (typeof addExtraGroceryItems === 'function') {
      addExtraGroceryItems(newItems);
    } else {
      try {
        const saved = localStorage.getItem('mealwise_extra_grocery');
        const existing: ExtraGroceryItem[] = saved ? JSON.parse(saved) : [];
        localStorage.setItem('mealwise_extra_grocery', JSON.stringify([...existing, ...newItems]));
      } catch (e) {
        console.error('Failed to update mealwise_extra_grocery in localStorage', e);
      }
    }

    showToast(`🛒 Đã thêm ${newItems.length} nguyên liệu món "${selectedRecipe.title}" (${servings} người) vào danh sách Đi Chợ!`);
  };

  const totalSteps = selectedRecipe.instructions.length;
  const completedCount = selectedRecipe.instructions.filter(inst => completedSteps[inst.step]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllCompleted = totalSteps > 0 && completedCount === totalSteps;

  const currentInstruction = selectedRecipe.instructions[activeStepIndex] || selectedRecipe.instructions[0];
  const isCurrentStepCompleted = currentInstruction ? !!completedSteps[currentInstruction.step] : false;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        setSelectedRecipe(null);
        setIsHandsFreeMode(false);
        setIsTimerOpen(false);
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="w-full max-w-lg sm:max-w-xl bg-white dark:bg-[#1A1918] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up border border-[#E8E2D8] dark:border-[#252220] relative overflow-hidden"
      >
        {/* Swipe Handle Bar (Mobile Drag Zone) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-2.5 cursor-grab active:cursor-grabbing shrink-0 flex sm:hidden items-center justify-center touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
        </div>

        {/* Top Header Bar */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-4 pt-2 sm:pt-4 pb-2 flex items-center justify-between shrink-0 select-none border-b border-stone-100 dark:border-stone-800/80 gap-2"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isHandsFreeMode ? (
              <button
                type="button"
                onClick={() => setIsHandsFreeMode(false)}
                className="flex items-center gap-1.5 text-xs font-black text-stone-900 dark:text-white hover:text-stone-700 transition-colors truncate min-h-[36px]"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">Thoát chế độ nấu từng bước</span>
              </button>
            ) : selectedMealSet ? (
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="flex items-center gap-1.5 text-xs font-black text-stone-900 dark:text-white hover:text-stone-700 dark:hover:text-stone-300 transition-colors truncate group min-h-[36px]"
                title={`Trở lại mâm ${selectedMealSet.title}`}
              >
                <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span className="truncate">Về mâm: {selectedMealSet.title}</span>
              </button>
            ) : (
              <>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
                  {selectedRecipe.category === 'mon-man' && 'Món Mặn Gia Đình'}
                  {selectedRecipe.category === 'mon-canh' && 'Món Canh Thanh Mát'}
                  {selectedRecipe.category === 'mon-rau' && 'Món Rau Xào / Luộc'}
                  {selectedRecipe.category === 'mon-chay' && 'Món Chay Thanh Đạm'}
                  {selectedRecipe.category === 'an-sang' && 'Bữa Sáng Năng Lượng'}
                </span>
                <span className="text-stone-300 dark:text-stone-700 shrink-0">•</span>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 shrink-0">
                  {selectedRecipe.region === 'bac' ? 'Miền Bắc' : selectedRecipe.region === 'nam' ? 'Miền Nam' : selectedRecipe.region === 'trung' ? 'Miền Trung' : 'Toàn Quốc'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Actionable Countdown Timer Quick Trigger Button */}
            <button
              type="button"
              onClick={() => setIsTimerOpen(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer min-h-[36px] ${
                timerSecondsLeft > 0
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 border-stone-800 dark:border-white animate-pulse font-black shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="Bộ đếm giờ nấu ăn"
              aria-label="Bộ đếm giờ nấu ăn"
            >
              <Timer className="w-3.5 h-3.5 shrink-0 text-stone-700 dark:text-stone-300" />
              <span className="text-[11px]">
                {timerSecondsLeft > 0 ? formatTimerDisplay(timerSecondsLeft) : 'Hẹn giờ'}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedRecipe(null);
                setIsHandsFreeMode(false);
                setIsTimerOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white transition-colors flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700 cursor-pointer min-h-[36px] min-w-[36px]"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actionable Cooking Timer Drawer / Banner (Expandable) */}
        {isTimerOpen && (
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1A1918] border-b border-[#E8E2D8] dark:border-[#252220] shrink-0 space-y-3 animate-fade-in select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 dark:text-stone-200 uppercase tracking-wide">
                <Timer className="w-4 h-4 text-stone-800 dark:text-stone-300" />
                <span>Bộ Đếm Giờ Nấu Ăn (Cooking Timer)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerOpen(false)}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-white p-1 cursor-pointer"
                aria-label="Thu nhỏ hẹn giờ"
              >
                Thu nhỏ
              </button>
            </div>

            {/* Digital Display & Timer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121110] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#252220]">
              <div className="text-center sm:text-left min-w-0">
                <div className="text-3xl font-black font-mono tracking-wider text-stone-950 dark:text-white">
                  {formatTimerDisplay(timerSecondsLeft)}
                </div>
                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
                  {timerLabel}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleTimerPlayPause}
                  disabled={timerSecondsLeft === 0 && timerTotalDuration === 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[44px] ${
                    timerIsRunning
                      ? 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {timerIsRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{timerSecondsLeft > 0 ? 'Tiếp tục' : 'Bắt đầu'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  disabled={timerTotalDuration === 0}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-[#E8E2D8] dark:border-[#252220] transition-colors disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Đặt lại bộ đếm"
                  aria-label="Đặt lại bộ đếm"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={clearTimer}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-rose-500 transition-colors cursor-pointer min-h-[44px]"
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Quick Timer Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase mr-1">
                Phím nhanh:
              </span>
              {[
                { label: '2 phút', sec: 120 },
                { label: '5 phút', sec: 300 },
                { label: '15 phút', sec: 900 },
                { label: '30 phút', sec: 1800 }
              ].map(p => (
                <button
                  key={p.sec}
                  type="button"
                  onClick={() => startTimerWithDuration(p.sec, `Hẹn giờ ${p.label}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-300 hover:border-stone-900 dark:hover:border-stone-400 hover:text-stone-950 dark:hover:text-white text-xs font-bold transition-all shadow-xs min-h-[36px] cursor-pointer"
                >
                  +{p.label}
                </button>
              ))}
              {selectedRecipe.cookTimeMinutes > 0 && (
                <button
                  type="button"
                  onClick={() => startTimerWithDuration(selectedRecipe.cookTimeMinutes * 60, `Nấu ${selectedRecipe.title}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-200/70 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-black transition-all shadow-xs min-h-[36px] cursor-pointer"
                >
                  +{selectedRecipe.cookTimeMinutes}p (Tổng nấu)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating Mini Timer Indicator (When Timer is running but drawer is minimized) */}
        {!isTimerOpen && timerSecondsLeft > 0 && (
          <div 
            onClick={() => setIsTimerOpen(true)}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-black text-xs flex items-center justify-between cursor-pointer shadow-md select-none shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Timer className="w-4 h-4 animate-spin shrink-0 text-amber-400 dark:text-amber-600" />
              <span className="truncate">Đang hẹn giờ: {timerLabel}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-sm tracking-wider">{formatTimerDisplay(timerSecondsLeft)}</span>
              <span className="text-[10px] underline uppercase">Mở</span>
            </div>
          </div>
        )}

        {/* Scrollable Sheet Content */}
        <div className="overflow-y-auto px-4 py-4 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] space-y-4">
          
          {/* ============================================================ */}
          {/* HANDS-FREE STEP-BY-STEP COOKING MODE VIEW                    */}
          {/* ============================================================ */}
          {isHandsFreeMode ? (
            <div className="space-y-4 animate-fade-in">
              {/* Step Mode Header & Switcher */}
              <div className="p-4 rounded-3xl bg-[#FAF8F5] dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950">
                      <ChefHat className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-200">
                        Chế Độ Nấu Từng Bước (Hands-Free)
                      </h3>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400">
                        Theo dõi công đoạn nấu dễ dàng trong gian bếp
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs font-black text-stone-800 dark:text-stone-200 shadow-xs">
                    Bước {activeStepIndex + 1} / {totalSteps}
                  </span>
                </div>

                {/* Step Dots Progress Strip */}
                <div className="flex items-center gap-1.5 pt-1">
                  {selectedRecipe.instructions.map((inst, idx) => {
                    const isStepDone = !!completedSteps[inst.step];
                    const isStepActive = idx === activeStepIndex;
                    return (
                      <button
                        key={inst.step}
                        type="button"
                        onClick={() => setActiveStepIndex(idx)}
                        className={`h-2.5 rounded-full transition-all cursor-pointer flex-1 min-h-[24px] ${
                          isStepActive 
                            ? 'bg-stone-900 dark:bg-white ring-2 ring-stone-400/50 shadow-sm' 
                            : isStepDone 
                            ? 'bg-emerald-600/80 hover:bg-emerald-600' 
                            : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600'
                        }`}
                        title={`Bước ${inst.step}: ${inst.title}`}
                        aria-label={`Chuyển tới bước ${inst.step}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Active Step Card with Large Typography */}
              {currentInstruction && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-4">
                  {/* Step Title & Flame / Timer Meta Badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-stone-900 dark:bg-white text-white dark:text-stone-950">
                        Bước {currentInstruction.step}
                      </span>
                      {currentInstruction.heatLevel && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Canh lửa: {currentInstruction.heatLevel}
                        </span>
                      )}
                      {currentInstruction.durationMinutes && (
                        <button
                          type="button"
                          onClick={() => startTimerWithDuration(currentInstruction.durationMinutes! * 60, `Bước ${currentInstruction.step}: ${currentInstruction.title}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer min-h-[32px]"
                        >
                          <Timer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Hẹn giờ: {currentInstruction.durationMinutes} phút
                        </button>
                      )}
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white leading-snug">
                      {currentInstruction.title}
                    </h4>
                  </div>

                  {/* Large Pedagogical Instruction Body */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-800 dark:text-stone-100 text-base leading-relaxed font-normal">
                    <p>{currentInstruction.content}</p>
                  </div>

                  {/* Step Micro-Tip (if present) */}
                  {currentInstruction.tip && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-stone-800 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-900 dark:text-amber-300">Mẹo nhỏ:</strong> {currentInstruction.tip}
                      </div>
                    </div>
                  )}

                  {/* Step Completion Toggle (48px+ tap target) */}
                  <button
                    type="button"
                    onClick={(e) => toggleStepCompleted(currentInstruction.step, e)}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer min-h-[48px] ${
                      isCurrentStepCompleted 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                        : 'bg-white dark:bg-[#121110] text-stone-700 dark:text-stone-200 border-[#E8E2D8] dark:border-[#252220] hover:border-stone-400'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${isCurrentStepCompleted ? 'text-white' : 'text-stone-400'}`} />
                    <span>{isCurrentStepCompleted ? 'Đã hoàn thành bước này ✓' : 'Đánh dấu đã hoàn thành bước này'}</span>
                  </button>
                </div>
              )}

              {/* Navigation Action Buttons (48px+ tap targets) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={activeStepIndex === 0}
                  className="py-3 px-4 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-200 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer min-h-[48px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Bước trước</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-stone-900/10 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
                >
                  <span>{activeStepIndex === totalSteps - 1 ? 'Hoàn tất nấu ăn 🎉' : 'Bước tiếp theo'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Peek Ingredients in Hands-Free Mode */}
              <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#252220]">
                <button
                  type="button"
                  onClick={() => setShowHandsFreeIngredients(prev => !prev)}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-between transition-colors min-h-[44px] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    Xem nhanh định lượng nguyên liệu ({selectedRecipe.ingredients.length})
                  </span>
                  {showHandsFreeIngredients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHandsFreeIngredients && (
                  <div className="mt-2 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-1.5 max-h-56 overflow-y-auto animate-fade-in">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60 dark:border-stone-800/60 last:border-none">
                        <span className="font-medium text-stone-800 dark:text-stone-200">{ing.name}</span>
                        <span className="font-extrabold text-stone-900 dark:text-white">
                          {formatScaledAmount(ing.amount)} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* STANDARD OVERVIEW MODE                                       */
            /* ============================================================ */
            <>
              {/* Hero Image & Title */}
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-md shrink-0">
                <SafeImage 
                  src={selectedRecipe.imageUrl} 
                  alt={selectedRecipe.title} 
                  fallbackTitle={selectedRecipe.title}
                  category={selectedRecipe.category}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 text-white border border-stone-700/60 text-[10px] font-extrabold inline-block backdrop-blur-sm">
                      {selectedRecipe.region === 'bac' ? 'Vị Bắc' : selectedRecipe.region === 'nam' ? 'Vị Nam' : selectedRecipe.region === 'trung' ? 'Vị Trung' : 'Toàn Quốc'}
                    </span>
                    {selectedRecipe.tags && selectedRecipe.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-stone-900/70 text-stone-200 text-[10px] font-semibold backdrop-blur-sm border border-stone-700/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {selectedRecipe.title}
                  </h2>
                </div>
              </div>

              {/* Metrics & Servings Stepper Grid (Preserving exact grid class for layout tests) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-center">
                
                {/* Metric 1: Time */}
                <div className="flex flex-col items-center justify-center p-1">
                  <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                    THỜI GIAN
                  </span>
                  <span className="text-xs font-black text-stone-900 dark:text-white flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    {selectedRecipe.cookTimeMinutes} phút
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Chuẩn bị: {selectedRecipe.prepTimeMinutes}p
                  </span>
                </div>

                {/* Metric 2: Interactive Servings Stepper */}
                <div className="flex flex-col items-center justify-center p-1">
                  <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                    KHẨU PHẦN
                  </span>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    <button
                      type="button"
                      onClick={() => setServings(s => Math.max(1, s - 1))}
                      disabled={servings <= 1}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-200 flex items-center justify-center font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer min-h-[36px] min-w-[36px]"
                      aria-label="Giảm khẩu phần"
                    >
                      -
                    </button>
                    <div className="flex items-center bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-lg px-1.5 py-0.5 shadow-xs">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={servings}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            setServings(Math.max(1, Math.min(20, val)));
                          } else if (e.target.value === '') {
                            setServings(1);
                          }
                        }}
                        className="w-7 text-center text-xs font-black text-stone-900 dark:text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Số người ăn"
                      />
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 select-none">
                        người
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setServings(s => Math.min(20, s + 1))}
                      disabled={servings >= 20}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-200 flex items-center justify-center font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer min-h-[36px] min-w-[36px]"
                      aria-label="Tăng khẩu phần"
                    >
                      +
                    </button>
                  </div>
                  {servings !== selectedRecipe.servings ? (
                    <button
                      type="button"
                      onClick={() => setServings(selectedRecipe.servings)}
                      className="text-[10px] text-stone-700 dark:text-stone-300 font-bold hover:underline mt-0.5 truncate cursor-pointer"
                    >
                      Gốc: {selectedRecipe.servings} người
                    </button>
                  ) : (
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Chuẩn vị gốc</span>
                  )}
                </div>

                {/* Metric 3: Scaled Cost */}
                <div className="flex flex-col items-center justify-center p-1">
                  <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                    CHI PHÍ DỰ KIẾN
                  </span>
                  <span className="text-xs font-black text-stone-900 dark:text-white block mt-1">
                    {scaledCost.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    ~{Math.round(scaledCost / servings).toLocaleString('vi-VN')} đ/người
                  </span>
                </div>

                {/* Metric 4: Scaled Calories */}
                <div className="flex flex-col items-center justify-center p-1">
                  <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                    CALO
                  </span>
                  <span className="text-xs font-black text-stone-900 dark:text-white flex items-center justify-center gap-0.5 mt-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {scaledCalories} kcal
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    ~{Math.round(scaledCalories / servings)} kcal/người
                  </span>
                </div>

              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {selectedRecipe.description}
              </p>

              {/* ============================================================ */}
              {/* CATEGORIZED INGREDIENT CHECKLIST SECTION                     */}
              {/* ============================================================ */}
              <div className="space-y-3 pt-1">
                {/* Header (Preserving exact flex string for layout tests) */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    Nguyên Liệu Cần Chuẩn Bị
                  </h3>
                  {servings !== selectedRecipe.servings && (
                    <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full border border-[#E8E2D8] dark:border-[#252220] shrink-0">
                      Đã tự động nhân tỉ lệ ({servings}/{selectedRecipe.servings})
                    </span>
                  )}
                </div>

                {/* Interactive Ingredient Checklist Progress Bar & Actions */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      Sơ chế sẵn sàng: <strong className="text-stone-950 dark:text-white font-extrabold">{checkedIngredientsCount}/{totalIngredients}</strong> nguyên liệu ({ingredientsPrepPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={isAllIngredientsChecked ? resetIngredientsChecklist : checkAllIngredients}
                      className="text-[11px] font-extrabold text-stone-900 dark:text-stone-100 hover:underline min-h-[32px] flex items-center cursor-pointer"
                    >
                      {isAllIngredientsChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 ease-out"
                      style={{ width: `${ingredientsPrepPercent}%` }}
                    />
                  </div>
                </div>

                {/* Categorized Sections: "Nguyên liệu chính", "Rau củ", "Gia vị & Ướp" */}
                <div className="space-y-3">
                  {categorizedGroups.map(group => (
                    <div key={group.key} className="space-y-1.5">
                      {/* Section Title with Badge and Count */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${group.dotClass}`} />
                          <h4 className="text-xs font-black text-stone-900 dark:text-white">
                            {group.title}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${group.badgeClass}`}>
                          {group.items.length} nguyên liệu
                        </span>
                      </div>

                      {/* Ingredient Checklist Rows */}
                      <div className="space-y-1.5">
                        {group.items.map(({ ingredient: ing, originalIndex }) => {
                          const key = `${ing.name}_${originalIndex}`;
                          const isChecked = !!checkedIngredients[key];
                          const scaledAmountStr = formatScaledAmount(ing.amount);

                          return (
                            <div 
                              key={originalIndex} 
                              onClick={() => toggleIngredientChecked(key)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs min-h-[44px] cursor-pointer transition-all select-none ${
                                isChecked 
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 dark:border-emerald-800/40 text-stone-400 dark:text-stone-500' 
                                  : 'bg-white dark:bg-[#1A1918] border-[#E8E2D8] dark:border-[#252220] hover:border-stone-300 dark:hover:border-stone-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => toggleIngredientChecked(key, e)}
                                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 min-h-[24px] min-w-[24px] cursor-pointer ${
                                    isChecked 
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                      : 'bg-white dark:bg-[#121110] border-stone-300 dark:border-stone-600 text-transparent hover:border-stone-500'
                                  }`}
                                  aria-label={`Đánh dấu nguyên liệu ${ing.name}`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <span className={`font-semibold min-w-0 leading-relaxed transition-all ${
                                  isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                                }`}>
                                  {ing.name}
                                </span>
                              </div>

                              {/* Preserving exact shrink-0 whitespace-nowrap for test suite */}
                              <span className="font-extrabold text-stone-900 dark:text-stone-100 bg-[#FAF8F5] dark:bg-[#121110] px-2.5 py-1 rounded-lg border border-[#E8E2D8] dark:border-[#252220] text-[11px] shadow-xs shrink-0 whitespace-nowrap">
                                {scaledAmountStr} {ing.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 1-Click Push to Grocery List (min 44px tap target) */}
                <button
                  type="button"
                  onClick={handlePushToGrocery}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs shadow-md shadow-stone-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 min-h-[44px]"
                >
                  <ShoppingCart className="w-4 h-4 text-white dark:text-stone-950 shrink-0" />
                  <span>🛒 Đi Chợ Món Này ({servings} người • {selectedRecipe.ingredients.length} nguyên liệu)</span>
                </button>
              </div>

              {/* ============================================================ */}
              {/* COOKING STEPS ACCORDION WITH PROGRESS TRACKING               */}
              {/* ============================================================ */}
              <div className="space-y-3 pt-3 border-t border-[#E8E2D8] dark:border-[#252220]">
                
                {/* Header with Title & Action Controls */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    Các Bước Chế Biến & Tiến Độ
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => enterHandsFreeMode(0)}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-black text-[11px] flex items-center gap-1 shadow-xs hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors min-h-[32px] cursor-pointer"
                    >
                      <ChefHat className="w-3 h-3" />
                      <span>Chế Độ Nấu Từng Bước</span>
                    </button>
                    <button
                      type="button"
                      onClick={expandAllSteps}
                      className="text-[10px] font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Mở tất cả
                    </button>
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                    <button
                      type="button"
                      onClick={collapseAllSteps}
                      className="text-[10px] font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Thu gọn
                    </button>
                    {completedCount > 0 && (
                      <>
                        <span className="text-stone-300 dark:text-stone-700">•</span>
                        <button
                          type="button"
                          onClick={resetCookingProgress}
                          className="text-[10px] font-bold text-stone-700 dark:text-stone-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Đặt lại
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      Tiến độ nấu: <strong className="text-stone-950 dark:text-white font-extrabold">{completedCount}/{totalSteps}</strong> bước
                    </span>
                    <span className="text-xs font-black text-stone-900 dark:text-white">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Completion Banner */}
                {isAllCompleted && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold animate-fade-in">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Tuyệt vời! Bạn đã hoàn thành tất cả các bước chế biến món {selectedRecipe.title}! Chúc cả nhà ngon miệng!</span>
                  </div>
                )}

                {/* Accordion Steps List */}
                <div className="space-y-2">
                  {selectedRecipe.instructions.map(inst => {
                    const isExpanded = expandedSteps[inst.step] ?? true;
                    const isCompleted = !!completedSteps[inst.step];

                    return (
                      <div 
                        key={inst.step} 
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isCompleted 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 dark:border-emerald-800/40' 
                            : 'bg-white dark:bg-[#1A1918] border-[#E8E2D8] dark:border-[#252220]'
                        }`}
                      >
                        {/* Step Accordion Header */}
                        <div 
                          onClick={() => toggleStepExpanded(inst.step)}
                          className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors min-h-[44px]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Checkbox button */}
                            <button
                              type="button"
                              onClick={(e) => toggleStepCompleted(inst.step, e)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 min-h-[24px] min-w-[24px] cursor-pointer ${
                                isCompleted 
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                  : 'bg-white dark:bg-[#121110] border-stone-300 dark:border-stone-600 text-transparent hover:border-stone-500'
                              }`}
                              aria-label={`Đánh dấu hoàn thành bước ${inst.step}`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-extrabold transition-colors truncate ${
                                isCompleted 
                                  ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80' 
                                  : 'text-stone-900 dark:text-white'
                              }`}>
                                Bước {inst.step}: {inst.title.replace(/^bước\s*\d+\s*:\s*/i, '').trim()}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-1">
                            {isCompleted && (
                              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                                Đã xong
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Step Accordion Content */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3 pt-0 text-xs text-stone-600 dark:text-stone-300 pl-11 leading-relaxed border-t border-[#E8E2D8]/60 dark:border-[#252220]/60 mt-1 space-y-2">
                            <p>{inst.content}</p>

                            {/* Badges & Actions row - aligned together with consistent spacing, no wide gap */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {inst.heatLevel && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 min-h-[28px]">
                                  <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>{inst.heatLevel}</span>
                                </span>
                              )}
                              {inst.durationMinutes && (
                                <button
                                  type="button"
                                  onClick={() => startTimerWithDuration(inst.durationMinutes! * 60, `Bước ${inst.step}: ${inst.title.replace(/^bước\s*\d+\s*:\s*/i, '').trim()}`)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer min-h-[28px]"
                                  title={`Hẹn giờ ${inst.durationMinutes} phút`}
                                >
                                  <Timer className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                                  <span>Hẹn giờ {inst.durationMinutes}p</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => enterHandsFreeMode(inst.step - 1)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer min-h-[28px]"
                                title="Bật chế độ rảnh tay cho bước này"
                              >
                                <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Nấu rảnh tay</span>
                              </button>
                            </div>

                            {inst.tip && (
                              <div className="mt-2 p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-stone-800 dark:text-amber-200 text-[11px] flex items-start gap-1.5 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <span><strong className="text-stone-900 dark:text-amber-300">Mẹo nhỏ:</strong> {inst.tip}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chef's Secret / Mẹo Bếp Vàng */}
                {selectedRecipe.chefTip && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1918] border border-amber-300/60 dark:border-amber-700/40 text-xs sm:text-sm text-stone-900 dark:text-stone-100 space-y-1.5 mt-3 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 font-black uppercase text-xs text-amber-900 dark:text-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Bí Quyết Đầu Bếp (Chef's Secret)</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Chuẩn Vị Cơm Nhà
                      </span>
                    </div>
                    <p className="leading-relaxed pl-5 font-medium text-stone-700 dark:text-stone-300">
                      {selectedRecipe.chefTip}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
