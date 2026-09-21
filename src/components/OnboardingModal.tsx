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
  const { showOnboarding, completeOnboarding, setShowOnboarding, onboardingData } = useMealWise();
  const [step, setStep] = useState<number>(1);

  const [tempData, setTempData] = useState<OnboardingData>(() => {
    return onboardingData || {
      regionPreference: 'bac',
      familySize: 4,
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

  if (!showOnboarding) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding(tempData);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header progress bar (shrink-0) */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Top Header Bar (shrink-0) */}
        <div className="px-4 sm:px-6 pt-3.5 pb-2.5 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-white font-bold" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Cấu Hình Mâm Cơm Việt
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Bước {step} / {totalSteps}
              </h2>
            </div>
          </div>

          {/* High-contrast "Bỏ qua" button (WCAG AA >= 4.5:1) */}
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            Bỏ qua
          </button>
        </div>

        {/* Scrollable Question Content (flex-1 overflow-y-auto) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* STEP 1: REGIONAL PREFERENCE */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  Khẩu vị Vùng Miền Gia Đình
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
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
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">{opt.title}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
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
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  Số Lượng Thành Viên
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  MealWise sẽ tính toán định lượng nguyên liệu và khẩu phần đi chợ phù hợp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { size: 1, label: '1 Người', desc: 'Độc thân / Sống một mình / Sinh viên' },
                  { size: 2, label: '2 Người', desc: 'Vợ chồng trẻ / Bạn ở ghép' },
                  { size: 4, label: '4 Người', desc: 'Gia đình chuẩn 2 con' },
                  { size: 6, label: '6+ Người', desc: 'Gia đình 3 thế hệ' }
                ].map((opt) => {
                  const isSelected = tempData.familySize === opt.size;
                  return (
                    <button
                      key={opt.size}
                      type="button"
                      onClick={() => setTempData({ 
                        ...tempData, 
                        familySize: opt.size,
                        singleMealFormat: opt.size === 1 ? (tempData.singleMealFormat || 'single-dish') : undefined
                      })}
                      className={`p-4 sm:p-5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">{opt.label}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Single Person Meal Format Choice (Single Dish vs 3-Dish Set) */}
              {tempData.familySize === 1 && (
                <div className="mt-4 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-850/80 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍳</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-sky-950 dark:text-sky-100">
                        Hình thức nấu nướng cho 1 người ăn
                      </h4>
                      <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
                        Bạn muốn nấu món đơn gọn nhẹ hay nấu mâm cơm 3 món?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTempData({ ...tempData, singleMealFormat: 'single-dish' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        (tempData.singleMealFormat || 'single-dish') === 'single-dish'
                          ? 'border-sky-500 bg-white dark:bg-slate-900 ring-2 ring-sky-500/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          🍲 Món Đơn Gọn Nhẹ
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          (tempData.singleMealFormat || 'single-dish') === 'single-dish'
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {(tempData.singleMealFormat || 'single-dish') === 'single-dish' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Khuyên dùng cho 1 người
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Nấu 1 món đĩa/tô đủ chất (mì, bún, phở, cơm đĩa, món xào/kho). Nhanh, tiện lợi, không phải nấu 3 món rườm rà.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTempData({ ...tempData, singleMealFormat: 'meal-set' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        tempData.singleMealFormat === 'meal-set'
                          ? 'border-sky-500 bg-white dark:bg-slate-900 ring-2 ring-sky-500/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          🍱 Mâm Cơm 3 Món
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          tempData.singleMealFormat === 'meal-set'
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {tempData.singleMealFormat === 'meal-set' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Truyền thống
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Vẫn muốn nấu đủ 3 món (mặn + canh + rau) chuẩn mâm cơm nhưng thu nhỏ lượng cho 1 người ăn.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MEAL BUDGET */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  Ngân Sách Cho Mỗi Mâm Cơm
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  Ứng dụng sẽ tự động chọn các món mặn - canh - rau tối ưu với ví tiền của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {(() => {
                  const size = tempData.familySize || 4;
                  const isSingle = size === 1;

                  const budgetOptions = [
                    {
                      id: 'tiet-kiem',
                      title: 'Tiết Kiệm',
                      mealRate: isSingle ? '~25.000đ / bữa' : '~100.000đ / mâm',
                      dailyRate: `~${getDailyBudgetTarget('tiet-kiem', size).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~60k/người/ngày',
                      desc: isSingle 
                        ? 'Cơm thịt rang, trứng chiên, canh rau thanh đạm.' 
                        : 'Mâm cơm dân dã thịt ba chỉ, canh cá, rau luộc.'
                    },
                    {
                      id: 'vua-phai',
                      title: 'Vừa Phải',
                      mealRate: isSingle ? '~35k – 40k / bữa' : '120k – 160k / mâm',
                      dailyRate: `~${getDailyBudgetTarget('vua-phai', size).toLocaleString('vi-VN')}đ / ngày`,
                      perHead: '~95k/người/ngày',
                      desc: isSingle
                        ? 'Phở bò, sườn ram, gà xào, cá kho tộ đậm đà.'
                        : 'Đầy đủ sườn rim, tôm, cá tươi & canh ngọt.'
                    },
                    {
                      id: 'thoai-mai',
                      title: 'Thoải Mái',
                      mealRate: isSingle ? '~55k – 60k / bữa' : '> 200.000đ / mâm',
                      dailyRate: `~${getDailyBudgetTarget('thoai-mai', size).toLocaleString('vi-VN')}đ / ngày`,
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
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-extrabold text-slate-900 dark:text-white">{opt.title}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                            {opt.mealRate}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                            Cả ngày 3 bữa: <span className="whitespace-nowrap">{opt.dailyRate}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">💡</span>
                <p className="leading-relaxed">
                  <strong>Cách tính ngân sách của MealWise:</strong> Giá trên mâm là chi phí cho 1 bữa ăn chính (trưa hoặc tối). Hạn mức tính cho cả ngày gồm <strong>trọn gói 3 bữa (1 bữa sáng & 2 mâm cơm trưa + tối)</strong> cho {tempData.familySize || 4} người ăn.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SPECIAL NEEDS & HEALTH GOALS */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  Yêu Cầu Ăn Uống & Mục Tiêu Sức Khỏe
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  Tùy chỉnh chế độ ăn phù hợp lối sống: tập gym tăng cơ, eat clean giữ dáng, hoặc meal prep độc thân.
                </p>
              </div>

              {tempData.familySize === 1 && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  <span className="text-base">💡</span>
                  <span>Gợi ý cho bạn sống một mình: Hãy bật thêm <strong>Tập Gym</strong>, <strong>Eat Clean</strong> hoặc <strong>Meal Prep 1 Người</strong> để tự động chia chuẩn 1 suất ăn!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { id: 'gym-protein', title: '🏋️ Tập Gym / Giàu Đạm (Protein)', desc: 'Tối ưu ức gà, bò, cá nạc, đạm cao tăng cơ & kiểm soát calo.' },
                  { id: 'eat-clean', title: '🥗 Eat Clean / Ăn Healthy', desc: 'Ít dầu mỡ, nhiều rau củ luộc, thanh lọc cơ thể & giữ dáng.' },
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
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">{opt.title}</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Dedicated Sticky Action Footer outside scrollable body */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between backdrop-blur-md gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
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
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all ml-auto shrink-0"
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
