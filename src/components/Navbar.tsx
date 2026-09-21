import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  UtensilsCrossed, 
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    resetOnboarding,
    theme,
    toggleTheme
  } = useMealWise();

  const getScreenTitle = (tab: ActiveTab): string => {
    switch (tab) {
      case 'meal-sets':
        return 'Mâm 3 Món';
      case 'weekly':
        return 'Thực Đơn Tuần';
      case 'party':
        return 'Tiệc & Catering';
      case 'fast-meal':
        return 'Mở Hòm Bữa Cơm';
      case 'grocery':
        return 'Đi Chợ Tự Động';
      case 'recipes':
        return 'Sổ Tay Công Thức';
      case 'pantry':
        return 'Tủ Lạnh & Đồ Thừa';
      case 'account':
        return 'Tài Khoản';
      default:
        return 'MealWise';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-colors duration-200">
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        
        {/* Left: Brand Logo & Title */}
        <button
          onClick={() => setActiveTab('meal-sets')} 
          className="flex items-center gap-2 cursor-pointer group shrink-0 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-white font-bold" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight block">
              MealWise
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block -mt-0.5">
              Mâm Cơm Việt
            </span>
          </div>
        </button>

        {/* Center: Active Screen Badge */}
        <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 truncate max-w-[110px] sm:max-w-[160px] text-center min-w-0 shrink">
          {getScreenTitle(activeTab)}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Mode Toggle (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-400 transition-all flex items-center justify-center shadow-sm active:scale-90"
            title={theme === 'light' ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Reset Onboarding / Quick Settings */}
          <button
            onClick={resetOnboarding}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center shadow-sm active:scale-90"
            title="Cài đặt lại khẩu vị (Onboarding)"
            aria-label="Cài đặt lại khẩu vị"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
