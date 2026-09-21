import React, { useState, useRef, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
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
  DollarSign
} from 'lucide-react';
import { SafeImage } from './SafeImage';

export const RecipeDetailModal: React.FC = () => {
  const { selectedRecipe, setSelectedRecipe, selectedMealSet } = useMealWise();
  const [dragY, setDragY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  // Servings Stepper State
  const [servings, setServings] = useState<number>(selectedRecipe?.servings || 4);

  // Cooking Steps Accordion & Progress State
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Sync state when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      setServings(selectedRecipe.servings);

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

  if (!selectedRecipe) return null;

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
    }
    setDragY(0);
    touchStartY.current = null;
  };

  // Dynamic ingredient scaling
  const formatScaledAmount = (amount: number | string): string => {
    if (!selectedRecipe || selectedRecipe.servings <= 0) return String(amount);
    const ratio = servings / selectedRecipe.servings;

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

  const scaledCost = Math.round((selectedRecipe.estimatedCostVnd * servings) / selectedRecipe.servings);
  const scaledCalories = Math.round((selectedRecipe.calories * servings) / selectedRecipe.servings);

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

  const totalSteps = selectedRecipe.instructions.length;
  const completedCount = selectedRecipe.instructions.filter(inst => completedSteps[inst.step]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllCompleted = totalSteps > 0 && completedCount === totalSteps;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedRecipe(null)}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="w-full max-w-lg sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up border border-slate-200 dark:border-slate-800 relative overflow-hidden"
      >
        {/* Swipe Handle Bar (Mobile Drag Zone) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-2.5 cursor-grab active:cursor-grabbing shrink-0 flex sm:hidden items-center justify-center touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Top Header Bar */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-4 pt-2 sm:pt-4 pb-2 flex items-center justify-between shrink-0 select-none border-b border-slate-100 dark:border-slate-800/80 gap-2"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedMealSet ? (
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors truncate group"
                title={`Trở lại mâm ${selectedMealSet.title}`}
              >
                <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span className="truncate">Về mâm: {selectedMealSet.title}</span>
              </button>
            ) : (
              <>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
                  {selectedRecipe.category === 'mon-man' && 'Món Mặn Gia Đình'}
                  {selectedRecipe.category === 'mon-canh' && 'Món Canh Thanh Mát'}
                  {selectedRecipe.category === 'mon-rau' && 'Món Rau Xào / Luộc'}
                  {selectedRecipe.category === 'mon-chay' && 'Món Chay Thanh Đạm'}
                  {selectedRecipe.category === 'an-sang' && 'Bữa Sáng Năng Lượng'}
                </span>
                <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                  {selectedRecipe.region === 'bac' ? 'Miền Bắc' : selectedRecipe.region === 'nam' ? 'Miền Nam' : selectedRecipe.region === 'trung' ? 'Miền Trung' : 'Toàn Quốc'}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setSelectedRecipe(null)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="overflow-y-auto px-4 py-4 pb-12 space-y-4">
          
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold inline-block backdrop-blur-sm">
                  {selectedRecipe.region === 'bac' ? 'Vị Bắc' : selectedRecipe.region === 'nam' ? 'Vị Nam' : selectedRecipe.region === 'trung' ? 'Vị Trung' : 'Toàn Quốc'}
                </span>
                {selectedRecipe.tags && selectedRecipe.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-200 text-[10px] font-semibold backdrop-blur-sm border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedRecipe.title}
              </h2>
            </div>
          </div>

          {/* Metrics & Servings Stepper Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            
            {/* Metric 1: Time */}
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block uppercase">
                THỜI GIAN
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {selectedRecipe.cookTimeMinutes} phút
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Chuẩn bị: {selectedRecipe.prepTimeMinutes}p
              </span>
            </div>

            {/* Metric 2: Interactive Servings Stepper */}
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block uppercase">
                KHẨU PHẦN
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setServings(s => Math.max(1, s - 1))}
                  disabled={servings <= 1}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
                  aria-label="Giảm khẩu phần"
                >
                  -
                </button>
                <span className="text-xs font-black text-slate-900 dark:text-white min-w-[52px]">
                  {servings} người
                </span>
                <button
                  type="button"
                  onClick={() => setServings(s => Math.min(20, s + 1))}
                  disabled={servings >= 20}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
                  aria-label="Tăng khẩu phần"
                >
                  +
                </button>
              </div>
              {servings !== selectedRecipe.servings ? (
                <button
                  type="button"
                  onClick={() => setServings(selectedRecipe.servings)}
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline mt-0.5"
                >
                  Gốc: {selectedRecipe.servings} người
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Chuẩn vị gốc</span>
              )}
            </div>

            {/* Metric 3: Scaled Cost */}
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block uppercase">
                CHI PHÍ DỰ KIẾN
              </span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block mt-1">
                {scaledCost.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                ~{Math.round(scaledCost / servings).toLocaleString('vi-VN')} đ/người
              </span>
            </div>

            {/* Metric 4: Scaled Calories */}
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block uppercase">
                CALO
              </span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center justify-center gap-0.5 mt-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {scaledCalories} kcal
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                ~{Math.round(scaledCalories / servings)} kcal/người
              </span>
            </div>

          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedRecipe.description}
          </p>

          {/* Dynamic Scaled Ingredients Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                Nguyên Liệu Cần Chuẩn Bị
              </h3>
              {servings !== selectedRecipe.servings && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  Đã tự động nhân tỉ lệ ({servings}/{selectedRecipe.servings})
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {selectedRecipe.ingredients.map((ing, idx) => {
                const scaledAmountStr = formatScaledAmount(ing.amount);
                return (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs min-h-[42px]"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-0 leading-relaxed">{ing.name}</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] shadow-xs shrink-0 whitespace-nowrap">
                      {scaledAmountStr} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible Cooking Steps Accordion with Progress Tracking */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            
            {/* Header with Title & Action Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                Các Bước Chế Biến & Tiến Độ
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAllSteps}
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Mở tất cả
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={collapseAllSteps}
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Thu gọn
                </button>
                {completedCount > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={resetCookingProgress}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Đặt lại
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar & Status */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Tiến độ nấu: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{completedCount}/{totalSteps}</strong> bước
                </span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Completion Banner */}
            {isAllCompleted && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-fade-in">
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
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400/40 dark:border-emerald-800/40' 
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {/* Step Accordion Header */}
                    <div 
                      onClick={() => toggleStepExpanded(inst.step)}
                      className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Checkbox button */}
                        <button
                          type="button"
                          onClick={(e) => toggleStepCompleted(inst.step, e)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-xs' 
                              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                          }`}
                          aria-label={`Đánh dấu hoàn thành bước ${inst.step}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs sm:text-sm font-extrabold transition-colors truncate ${
                            isCompleted 
                              ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80' 
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            Bước {inst.step}: {inst.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-1">
                        {isCompleted && (
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                            Đã xong
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Step Accordion Content */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3 pt-0 text-xs text-slate-700 dark:text-slate-300 pl-11 leading-relaxed border-t border-slate-100/60 dark:border-slate-800/40 mt-1">
                        <p>{inst.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

