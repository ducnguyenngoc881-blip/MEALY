import React, { useState, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Wallet, 
  HeartHandshake, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  UtensilsCrossed
} from 'lucide-react';
import { OnboardingData } from '../types';
import { getDailyBudgetTarget } from '../utils/currency';

export const OnboardingModal: React.FC = () => {
  const { 
    showOnboarding, 
    completeOnboarding, 
    setShowOnboarding, 
    onboardingData, 
    weeklyPlan, 
    isRegistered,
    setIsTutorialOpen,
    openWelcomeModal,
    user 
  } = useMealWise();
  const [step, setStep] = useState<number>(1);
  const [regeneratePlan, setRegeneratePlan] = useState<boolean>(true);

  const hasExistingMeals = Boolean(
    weeklyPlan &&
    Array.isArray(weeklyPlan) &&
    weeklyPlan.some(day => day.meals?.breakfast || day.meals?.lunch || day.meals?.dinner)
  );

  const [tempData, setTempData] = useState<OnboardingData>(() => {
    return onboardingData || {
      regionPreference: 'bac',
      familySize: 4,
      weekdayLunchRoutine: 'ban-tru-di-lam',
      budgetLevel: 'vua-phai',
      specialNeeds: ['nhieu-rau'],
      completed: false
    };
  });

  useEffect(() => {
    if (onboardingData) {
      setTempData(onboardingData);
      setStep(1);
    }
  }, [showOnboarding, onboardingData]);

  if (!showOnboarding || !isRegistered) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding(tempData, { regeneratePlan });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleSpecialNeed = (needId: string) => {
    setTempData(prev => {
      const exists = prev.specialNeeds.includes(needId);
      const updated = exists 
        ? prev.specialNeeds.filter(n => n !== needId)
        : [...prev.specialNeeds, needId];
      return { ...prev, specialNeeds: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/60 dark:bg-stone-950/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header progress bar (shrink-0) */}
        <div className="h-1.5 bg-stone-100 dark:bg-stone-800 w-full shrink-0">
          <div 
            className="h-full bg-stone-900 dark:bg-white transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Top Header Bar (shrink-0) */}
        <div className="px-4 sm:px-6 pt-3.5 pb-2.5 flex items-center justify-between shrink-0 border-b border-stone-100 dark:border-stone-800/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-950 flex items-center justify-center shadow-xs shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                Cấu Hình Mâm Cơm Việt
              </span>
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                Bước {step} / {totalSteps}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openWelcomeModal}
              title="Giới Thiệu MealWise"
              className="text-xs font-bold text-[#1D4ED8] dark:text-blue-400 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 transition-colors border border-blue-200/70 dark:border-blue-800/60 cursor-pointer"
            >
              Giới Thiệu MealWise
            </button>

            {/* High-contrast "Bỏ qua" button (WCAG AA >= 4.5:1) */}
            <button
              onClick={() => {
                setShowOnboarding(false);
                try {
                  // If user was already onboarded and was just editing/reviewing config, never launch tutorial
                  if (onboardingData?.completed || user?.onboardingCompleted) {
                    return;
                  }
                  let emailLower = user?.email?.toLowerCase().trim();
                  const userTutorialKey = emailLower ? `mealwise_tutorial_completed_${emailLower}` : null;
                  const isUserTutorialDone = userTutorialKey
                    ? localStorage.getItem(userTutorialKey) === 'true'
                    : localStorage.getItem('mealwise_tutorial_completed') === 'true';
                  if (!isUserTutorialDone) {
                    setTimeout(() => {
                      setIsTutorialOpen(true);
                    }, 500);
                  }
                } catch {}
              }}
              className="text-xs font-bold text-stone-700 hover:text-stone-900 dark:text-stone-200 dark:hover:text-white px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700"
            >
              Bỏ qua
            </button>
          </div>
        </div>

        {/* Scrollable Question Content (flex-1 overflow-y-auto) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* STEP 1: REGIONAL PREFERENCE */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-stone-700 dark:text-stone-300 shrink-0" />
                  Khẩu vị Vùng Miền Gia Đình
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Chọn vị chuẩn gu của gia đình bạn để MealWise gợi ý mâm cơm tròn vị nhất.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    id: 'bac',
                    title: 'Miền Bắc',
                    subtitle: 'Thanh nhẹ, mặn mòi, ưu tiên vị chua thanh tự nhiên (sấu, bỗng).'
                  },
                  {
                    id: 'nam',
                    title: 'Miền Nam',
                    subtitle: 'Đậm đà, béo ngậy nước dừa, ngọt thơm dưa muối xổi.'
                  },
                  {
                    id: 'trung',
                    title: 'Miền Trung',
                    subtitle: 'Đậm vị, kho rục cay nồng, mặn mòi hương biển.'
                  },
                  {
                    id: 'toan-quoc',
                    title: 'Đa Dạng 3 Miền',
                    subtitle: 'Đổi món linh hoạt cả 3 miền cho bữa ăn thêm phong phú.'
                  }
                ].map((opt) => {
                  const isSelected = tempData.regionPreference === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTempData({ ...tempData, regionPreference: opt.id as any })}
                      className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[105px] relative ${
                        isSelected
                          ? 'border-stone-900 bg-[#FAF8F5] dark:bg-[#121110] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-md'
                          : 'border-[#E8E2D8] dark:border-[#252220] bg-white dark:bg-[#1A1918] hover:bg-stone-50 dark:hover:bg-[#252220] hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base font-extrabold text-stone-900 dark:text-white">{opt.title}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black' : 'border-stone-300 dark:border-stone-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                        {opt.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: FAMILY SIZE */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-stone-700 dark:text-stone-300 shrink-0" />
                  Số Lượng Thành Viên
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  MealWise sẽ tính toán định lượng nguyên liệu và khẩu phần đi chợ phù hợp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start pt-1">
                {[
                  { size: 1, label: '1 Người', desc: 'Độc thân / Sống một mình / Sinh viên' },
                  { size: 2, label: '2 Người', desc: 'Vợ chồng trẻ / Bạn ở ghép' },
                  { size: 4, label: '4 Người', desc: 'Gia đình chuẩn 2 con' },
                  { size: 6, label: '6+ Người', desc: 'Gia đình 3 thế hệ' }
                ].map((opt) => {
                  const isSelected = tempData.familySize === opt.size;
                  return (
                    <div
                      key={opt.size}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-stone-900 bg-[#FAF8F5] dark:bg-[#121110] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-md'
                          : 'border-[#E8E2D8] dark:border-[#252220] bg-white dark:bg-[#1A1918] hover:bg-stone-50 dark:hover:bg-[#252220] hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setTempData({ 
                          ...tempData, 
                          familySize: opt.size,
                          singleMealFormat: opt.size === 1 ? (tempData.singleMealFormat || 'single-dish') : undefined
                        })}
                        className="w-full p-4 sm:p-5 text-left flex flex-col justify-between cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-extrabold text-stone-900 dark:text-white">{opt.label}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black' : 'border-stone-300 dark:border-stone-600'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2.5">{opt.desc}</p>
                      </button>

                      {/* Dropdown Box for 4 Người (and 6+ Người): Weekday Lunch Routine */}
                      {isSelected && (opt.size === 4 || opt.size === 6) && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 animate-fade-in">
                          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-base shrink-0">🏫</span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-stone-900 dark:text-white truncate">
                                  Lịch Nấu Bữa Trưa Ngày Thường (T2 - T6)
                                </h4>
                                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 truncate">
                                  Bỏ bữa trưa đi làm/bán trú để ngân sách chuẩn 100%
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-0.5">
                              {[
                                {
                                  id: 'ban-tru-di-lam',
                                  title: '🏫 Bán Trú & Đi Làm (Khuyên dùng)',
                                  badge: 'Phổ biến nhất',
                                  desc: 'Con ăn bán trú ở trường, bố mẹ ăn trưa công sở. Chỉ lên món bữa tối ngày thường; cuối tuần (T7, CN) lên đủ trưa + tối.'
                                },
                                {
                                  id: 'nau-ca-ngay',
                                  title: '🏠 Nấu Đủ Cả Ngày (Trưa & Tối)',
                                  badge: 'Ở nhà / WFH',
                                  desc: 'Gia đình có người ở nhà nấu cơm hoặc làm việc từ xa. Lên thực đơn trưa và tối cho tất cả các ngày trong tuần.'
                                },
                                {
                                  id: 'hop-com-van-phong',
                                  title: '🍱 Nấu Dư Mang Cơm Hộp Đi Làm',
                                  badge: 'Cơm trưa hộp',
                                  desc: 'Bữa tối nấu thêm phần để bố mẹ mang cơm trưa đi làm ngày hôm sau, không cần lên món trưa mới.'
                                }
                              ].map((routine) => {
                                const isRoutineSelected = (tempData.weekdayLunchRoutine || 'ban-tru-di-lam') === routine.id;
                                return (
                                  <button
                                    key={routine.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTempData({ ...tempData, weekdayLunchRoutine: routine.id as any });
                                    }}
                                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                      isRoutineSelected
                                        ? 'border-stone-900 bg-white dark:bg-[#1A1918] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-xs'
                                        : 'border-[#E8E2D8] dark:border-[#252220] bg-white/70 dark:bg-[#1A1918]/60 hover:bg-white dark:hover:bg-[#1A1918]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                        <span>{routine.title}</span>
                                        {routine.badge && (
                                          <span className="text-[9.5px] font-black px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                            {routine.badge}
                                          </span>
                                        )}
                                      </span>
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                        isRoutineSelected
                                          ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black'
                                          : 'border-stone-300 dark:border-stone-700'
                                      }`}>
                                        {isRoutineSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                    </div>
                                    <p className="text-[10.5px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                      {routine.desc}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dropdown Box for 1 Người: Single Dish vs 3-Dish Set */}
                      {isSelected && opt.size === 1 && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 animate-fade-in">
                          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base shrink-0">🍳</span>
                              <div>
                                <h4 className="text-xs font-black text-stone-900 dark:text-white">
                                  Hình thức nấu cho 1 người
                                </h4>
                                <p className="text-[10.5px] text-stone-500 dark:text-stone-400">
                                  Món đơn gọn nhẹ hay mâm cơm 3 món?
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTempData({ ...tempData, singleMealFormat: 'single-dish' });
                                }}
                                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  (tempData.singleMealFormat || 'single-dish') === 'single-dish'
                                    ? 'border-stone-900 bg-white dark:bg-[#1A1918] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-xs'
                                    : 'border-[#E8E2D8] dark:border-[#252220] bg-white/70 dark:bg-[#1A1918]/60 hover:bg-white dark:hover:bg-[#1A1918]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                                    🍲 Món Đơn Gọn Nhẹ
                                  </span>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    (tempData.singleMealFormat || 'single-dish') === 'single-dish'
                                      ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black'
                                      : 'border-stone-300 dark:border-stone-700'
                                  }`}>
                                    {(tempData.singleMealFormat || 'single-dish') === 'single-dish' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>
                                <span className="inline-block mt-1 text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                                  Khuyên dùng cho 1 người
                                </span>
                                <p className="text-[10.5px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                  Nấu 1 món đĩa/tô đủ chất (mì, bún, phở, cơm đĩa). Nhanh, không phải nấu 3 món rườm rà.
                                </p>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTempData({ ...tempData, singleMealFormat: 'meal-set' });
                                }}
                                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  tempData.singleMealFormat === 'meal-set'
                                    ? 'border-stone-900 bg-white dark:bg-[#1A1918] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-xs'
                                    : 'border-[#E8E2D8] dark:border-[#252220] bg-white/70 dark:bg-[#1A1918]/60 hover:bg-white dark:hover:bg-[#1A1918]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                                    🍱 Mâm Cơm 3 Món
                                  </span>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    tempData.singleMealFormat === 'meal-set'
                                      ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black'
                                      : 'border-stone-300 dark:border-stone-700'
                                  }`}>
                                    {tempData.singleMealFormat === 'meal-set' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>
                                <span className="inline-block mt-1 text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                  Truyền thống
                                </span>
                                <p className="text-[10.5px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                  Nấu đủ 3 món (mặn + canh + rau) chuẩn mâm cơm nhưng thu nhỏ lượng cho 1 người ăn.
                                </p>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SPECIAL NEEDS & HEALTH GOALS (Placed before budget to adapt budget tiers) */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-stone-700 dark:text-stone-300 shrink-0" />
                  Yêu Cầu Ăn Uống & Mục Tiêu Sức Khỏe
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Tùy chỉnh chế độ ăn phù hợp lối sống. <span className="inline-block mt-0.5 text-stone-900 dark:text-white font-extrabold">💡 Mẹo: Nếu bạn không có sở thích đặc biệt, hãy để trống (không chọn mục nào) để thực đơn được hệ thống tự do ngẫu nhiên đa dạng nhất!</span>
                </p>
              </div>

              {tempData.familySize === 1 && (
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-bold">
                  <span className="text-base">💡</span>
                  <span>Gợi ý cho bạn sống một mình: Hãy bật thêm <strong>Tập Gym</strong>, <strong>Eat Clean</strong> hoặc <strong>Meal Prep 1 Người</strong> để tự động chia chuẩn 1 suất ăn!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { id: 'gym-protein', title: '🏋️ Tập Gym / Giàu Đạm', desc: 'Tối ưu ức gà, bò, cá nạc, đạm cao tăng cơ & kiểm soát calo.' },
                  { id: 'eat-clean', title: '🥗 Eat Clean / Ăn Healthy', desc: 'Ít dầu mỡ, nhiều rau củ luộc, thanh lọc cơ thể & giữ dáng.' },
                  { id: 'western-food', title: '🥩 Món Âu / Đổi Vị Phương Tây', desc: 'Bít tết thăn bò, mì Ý, súp kem béo ngậy, salad kiểu Âu đổi gió.' },
                  { id: 'single-prep', title: '🍱 Meal Prep Độc Thân', desc: 'Nấu 1 lần ăn 2 bữa, hộp cơm văn phòng, tiết kiệm nguyên liệu.' },
                  { id: 'nhieu-rau', title: '🥦 Nhiều Rau Xanh', desc: 'Bổ sung canh rau thanh mát & salad tươi giòn.' },
                  { id: 'it-cay', title: '🌿 Ít Cay / Không Dùng Ớt', desc: 'Phù hợp dạ dày nhạy cảm, vị thanh nhẹ dễ ăn.' },
                  { id: 'chay', title: '🌱 Mâm Cơm Ăn Chay', desc: '100% nguyên liệu thuần thực vật thanh tịnh.' },
                  { id: 'nhanh-gon', title: '⚡ Nấu Nhanh < 30 Phút', desc: 'Món ngon đơn giản, tối ưu thời gian cho ngày bận rộn.' }
                ].map((opt) => {
                  const isSelected = tempData.specialNeeds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleSpecialNeed(opt.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[100px] ${
                        isSelected
                          ? 'border-stone-900 bg-[#FAF8F5] dark:bg-[#121110] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-md'
                          : 'border-[#E8E2D8] dark:border-[#252220] bg-white dark:bg-[#1A1918] hover:bg-stone-50 dark:hover:bg-[#252220] hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base font-extrabold text-stone-900 dark:text-white">{opt.title}</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black' : 'border-stone-300 dark:border-stone-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: MEAL BUDGET (Adapted to preferences chosen in Step 3) */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-stone-700 dark:text-stone-300 shrink-0" />
                  Ngân Sách Cho Mỗi Mâm Cơm
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Ứng dụng sẽ tự động chọn các món ăn tối ưu phù hợp với định mức chi tiêu của bạn.
                </p>
              </div>

              {/* Dynamic notice if Western food is selected */}
              {tempData.specialNeeds.includes('western-food') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] flex items-start gap-2.5 text-xs text-stone-800 dark:text-stone-200 animate-fade-in">
                  <span className="text-base shrink-0 mt-0.5">🥩</span>
                  <p className="leading-relaxed">
                    <strong>Đã chọn Món Âu / Đổi Vị Phương Tây:</strong> Định mức ngân sách được tự động tính toán phù hợp với chi phí nguyên liệu đặc trưng (thăn bò, cá hồi, phô mai, bơ sữa, mì Ý).
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {(() => {
                  const size = tempData.familySize || 4;
                  const isSingle = size === 1;
                  const isWestern = tempData.specialNeeds.includes('western-food');

                  const budgetOptions = isWestern ? [
                    {
                      id: 'tiet-kiem',
                      title: 'Tiết Kiệm (Món Âu)',
                      mealRate: isSingle ? '~40.000đ / bữa' : '~140.000đ / mâm',
                      dailyRate: `~${getDailyBudgetTarget('tiet-kiem', size, true).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~85k/người/ngày',
                      desc: isSingle
                        ? 'Mì Ý sốt bò băm, gà nướng mật ong, súp bí đỏ.'
                        : 'Mâm cơm Âu chuẩn vị: Mì Ý Bolognese, súp kem bí đỏ, bánh mì bơ tỏi.'
                    },
                    {
                      id: 'vua-phai',
                      title: 'Vừa Phải (Món Âu)',
                      mealRate: isSingle ? '~55k – 60k / bữa' : '160k – 200k / mâm',
                      dailyRate: `~${getDailyBudgetTarget('vua-phai', size, true).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~120k/người/ngày',
                      desc: isSingle
                        ? 'Burger bò cheddar, sườn que BBQ, mì Ý sốt pesto tôm mực.'
                        : 'Sườn que BBQ, bít tết sốt tiêu, mì Ý hải sản, súp kem nấm.'
                    },
                    {
                      id: 'thoai-mai',
                      title: 'Thoải Mái (Món Âu)',
                      mealRate: isSingle ? '~80k – 90k / bữa' : '> 260.000đ / mâm',
                      dailyRate: `~${getDailyBudgetTarget('thoai-mai', size, true).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~180k/người/ngày',
                      desc: isSingle
                        ? 'Bít tết thăn lưng Ribeye, cá hồi áp chảo bơ chanh, bò hầm vang Pháp.'
                        : 'Steakhouse cao cấp: Thăn bò ribeye, cá hồi Nauy, rượu vang, phô mai thượng hạng.'
                    }
                  ] : [
                    {
                      id: 'tiet-kiem',
                      title: 'Tiết Kiệm',
                      mealRate: isSingle ? '~25.000đ / bữa' : '~100.000đ / mâm',
                      dailyRate: `~${getDailyBudgetTarget('tiet-kiem', size, false).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~60k/người/ngày',
                      desc: isSingle 
                        ? 'Cơm thịt rang, trứng chiên, canh rau thanh đạm.' 
                        : 'Mâm cơm dân dã thịt ba chỉ, canh cá, rau luộc.'
                    },
                    {
                      id: 'vua-phai',
                      title: 'Vừa Phải',
                      mealRate: isSingle ? '~35k – 40k / bữa' : '120k – 160k / mâm',
                      dailyRate: `~${getDailyBudgetTarget('vua-phai', size, false).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~95k/người/ngày',
                      desc: isSingle
                        ? 'Phở bò, sườn ram, gà xào, cá kho tộ đậm đà.'
                        : 'Đầy đủ sườn rim, tôm, cá tươi & canh ngọt.'
                    },
                    {
                      id: 'thoai-mai',
                      title: 'Thoải Mái',
                      mealRate: isSingle ? '~55k – 60k / bữa' : '> 200.000đ / mâm',
                      dailyRate: `~${getDailyBudgetTarget('thoai-mai', size, false).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~140k/người/ngày',
                      desc: isSingle
                        ? 'Bít tết thăn bò, cá hồi áp chảo, mì Ý cao cấp.'
                        : 'Hải sản, bò mềm, nấm quý & món chiêu đãi.'
                    }
                  ];

                  return budgetOptions.map((opt) => {
                    const isSelected = tempData.budgetLevel === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTempData({ ...tempData, budgetLevel: opt.id as any })}
                        className={`p-4 sm:p-5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[140px] ${
                          isSelected
                            ? 'border-stone-900 bg-[#FAF8F5] dark:bg-[#121110] dark:border-white ring-2 ring-stone-900/10 dark:ring-white/20 shadow-md'
                            : 'border-[#E8E2D8] dark:border-[#252220] bg-white dark:bg-[#1A1918] hover:bg-stone-50 dark:hover:bg-[#252220] hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-extrabold text-stone-900 dark:text-white">{opt.title}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black' : 'border-stone-300 dark:border-stone-600'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className="text-xs font-black text-stone-900 dark:text-white mt-1 block">
                            {opt.mealRate}
                          </span>
                          <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 block mt-0.5 leading-snug">
                            Cả ngày 3 bữa: <span className="whitespace-nowrap">{opt.dailyRate}</span>
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2.5 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">💡</span>
                <p className="leading-relaxed">
                  <strong>Cách tính ngân sách của MealWise:</strong> Giá trên mâm là chi phí cho 1 bữa ăn chính (trưa hoặc tối). Hạn mức tính cho cả ngày gồm <strong>trọn gói 3 bữa (1 bữa sáng & 2 mâm cơm trưa + tối)</strong> cho {tempData.familySize || 4} người ăn.
                </p>
              </div>

              {hasExistingMeals && (
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/25 text-xs text-stone-800 dark:text-stone-200 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={regeneratePlan}
                      onChange={(e) => setRegeneratePlan(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 accent-stone-900 dark:accent-amber-500 cursor-pointer"
                    />
                    <span>Tạo mới thực đơn tuần theo mục tiêu vừa chọn (Khuyến nghị)</span>
                  </label>
                  {!regeneratePlan && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 pl-6 leading-tight">
                      ✓ Giữ nguyên các món ăn và mâm cơm bạn đã lên trước đó trong tuần.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Dedicated Sticky Action Footer outside scrollable body */}
        <div className="shrink-0 border-t border-[#E8E2D8] dark:border-[#252220] bg-white/95 dark:bg-[#1A1918]/95 px-4 sm:px-6 py-3 sm:py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between backdrop-blur-md gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm transition-colors border border-stone-200 dark:border-stone-700 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay Lại</span>
            </button>
          ) : (
            <div className="w-1" />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all ml-auto shrink-0"
          >
            <span>
              {step === totalSteps ? (
                <>
                  <span className="sm:hidden">Hoàn Tất Thực Đơn</span>
                  <span className="hidden sm:inline">Hoàn Tất & Tạo Thực Đơn Gợi Ý</span>
                </>
              ) : (
                'Tiếp Theo'
              )}
            </span>
            {step === totalSteps ? <Sparkles className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
          </button>
        </div>

      </div>
    </div>
  );
};
