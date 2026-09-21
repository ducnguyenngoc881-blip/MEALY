import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { getDailyBudgetTarget } from '../utils/currency';
import { User, RotateCcw, Sun, Moon, CheckCircle2 } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { onboardingData, resetOnboarding, theme, toggleTheme } = useMealWise();
  const isLight = theme === 'light';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Profile Header */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-950/10 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/20 shrink-0">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">Gia Đình Việt Tròn Vị</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Khẩu vị đã thiết lập theo triết lý Mâm Cơm 3 Món</p>
        </div>
      </div>

      {/* Theme Mode Preference: Sleek Interactive Toggle Switch */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Giao Diện Hiển Thị
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Tùy chỉnh tông màu sáng hoặc tối phù hợp cho mắt
          </p>
        </div>

        <div 
          onClick={toggleTheme}
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none ${
            isLight
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/40 shadow-sm hover:border-emerald-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              isLight
                ? 'bg-amber-100 text-amber-600 border border-amber-300 shadow-sm shadow-amber-500/15'
                : 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
            }`}>
              {isLight ? (
                <Sun className="w-5 h-5 transition-transform hover:rotate-45 duration-300 fill-amber-400/20" />
              ) : (
                <Moon className="w-5 h-5 transition-transform hover:-rotate-12 duration-300 fill-amber-400/20" />
              )}
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isLight ? 'Chế Độ Sáng' : 'Chế Độ Tối'}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isLight ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {isLight 
                  ? 'Nền sáng thanh lịch, dễ nhìn ban ngày' 
                  : 'Tông đen sang trọng, dịu mắt ban đêm'}
              </p>
            </div>
          </div>

          {/* iOS-Style Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isLight}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              isLight ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40' : 'bg-slate-700 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isLight ? 'translate-x-6 text-amber-500' : 'translate-x-0 text-slate-600'
              }`}
            >
              {isLight ? (
                <Sun className="h-4 w-4 fill-amber-500 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 fill-slate-600 text-slate-600" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Preferences Overview */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Thông Tin Cấu Hình Hiện Tại
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1 min-h-[105px]">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">KHẨU VỊ VÙNG MIỀN</span>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {onboardingData.regionPreference === 'bac' && 'Miền Bắc'}
              {onboardingData.regionPreference === 'nam' && 'Miền Nam'}
              {onboardingData.regionPreference === 'trung' && 'Miền Trung'}
              {onboardingData.regionPreference === 'toan-quoc' && 'Đa Dạng 3 Miền'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1 min-h-[105px]">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">KHẨU PHẦN GIA ĐÌNH</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {onboardingData.familySize === 1 
                ? (onboardingData.singleMealFormat === 'meal-set' 
                    ? '1 người (Mâm cơm 3 món)' 
                    : '1 người (Món đơn gọn nhẹ)') 
                : `${onboardingData.familySize} người ăn`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1 min-h-[105px]">
            <div>
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">NGÂN SÁCH DỰ KIẾN</span>
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                {onboardingData.budgetLevel === 'tiet-kiem' && (
                  onboardingData.familySize === 1
                    ? `Tiết kiệm (~${getDailyBudgetTarget('tiet-kiem', 1).toLocaleString('vi-VN')} đ/ngày • 3 bữa)`
                    : `Tiết kiệm (~100k/mâm • ${getDailyBudgetTarget('tiet-kiem', onboardingData.familySize || 4).toLocaleString('vi-VN')} đ/ngày cả nhà)`
                )}
                {onboardingData.budgetLevel === 'vua-phai' && (
                  onboardingData.familySize === 1
                    ? `Vừa phải (~${getDailyBudgetTarget('vua-phai', 1).toLocaleString('vi-VN')} đ/ngày • 3 bữa)`
                    : `Vừa phải (~140k/mâm • ${getDailyBudgetTarget('vua-phai', onboardingData.familySize || 4).toLocaleString('vi-VN')} đ/ngày cả nhà)`
                )}
                {onboardingData.budgetLevel === 'thoai-mai' && (
                  onboardingData.familySize === 1
                    ? `Thoải mái (~${getDailyBudgetTarget('thoai-mai', 1).toLocaleString('vi-VN')} đ/ngày • 3 bữa)`
                    : `Thoải mái (>200k/mâm • ${getDailyBudgetTarget('thoai-mai', onboardingData.familySize || 4).toLocaleString('vi-VN')} đ/ngày cả nhà)`
                )}
              </p>
            </div>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block font-medium">
              {onboardingData.familySize === 1
                ? 'Đã bao gồm 3 bữa ăn (sáng + trưa + tối) cho 1 người.'
                : `Hạn mức 1 ngày gồm 3 bữa: bữa sáng & 2 mâm cơm trưa + tối cho ${onboardingData.familySize || 4} người.`}
            </span>
          </div>
        </div>

        {onboardingData.specialNeeds && onboardingData.specialNeeds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
              TIÊU CHÍ ƯU TIÊN ĐÃ CHỌN
            </span>
            <div className="flex flex-wrap gap-2">
              {onboardingData.specialNeeds.map(need => {
                const labelMap: Record<string, string> = {
                  'gym-protein': '🏋️ Tập Gym / Giàu Đạm',
                  'eat-clean': '🥗 Eat Clean / Ăn Healthy',
                  'single-prep': '🍱 Meal Prep 1 Người',
                  'nhieu-rau': 'Nhiều rau xanh',
                  'it-cay': 'Ít cay / Không ớt',
                  'chay': 'Mâm cơm ăn chay',
                  'nhanh-gon': 'Nấu nhanh < 30 phút'
                };
                return (
                  <span
                    key={need}
                    className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{labelMap[need] || need}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reset Onboarding Action */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Thiết Lập Lại Khẩu Vị & Khẩu Phần
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Bạn có thể nhấn nút dưới đây để kích hoạt lại toàn bộ bảng câu hỏi Onboarding (chọn khẩu vị, số người, ngân sách).
        </p>

        <button
          onClick={resetOnboarding}
          className="mt-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xem Lại Khảo Sát Khẩu Vị (Onboarding)</span>
        </button>
      </div>

    </div>
  );
};
