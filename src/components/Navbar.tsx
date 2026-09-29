import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  UtensilsCrossed, 
  RotateCcw,
  Sun,
  Moon,
  Lock,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    resetOnboarding,
    theme,
    toggleTheme,
    isRegistered,
    user,
    openAuthModal
  } = useMealWise();

  const getScreenTitle = (tab: ActiveTab): { short: string; full: string } => {
    switch (tab) {
      case 'meal-sets':
        return { short: 'Mâm 3 Món', full: 'Mâm 3 Món' };
      case 'weekly':
        return { short: 'Thực Đơn', full: 'Thực Đơn Tuần' };
      case 'party':
        return { 
          short: isRegistered ? 'Tiệc Tùng' : 'Tiệc 🔒', 
          full: isRegistered ? 'Tiệc & Catering' : 'Tiệc & Catering 🔒' 
        };
      case 'fast-meal':
        return { short: 'Mở Hòm', full: 'Mở Hòm Bữa Cơm' };
      case 'grocery':
        return { short: 'Đi Chợ', full: 'Đi Chợ Tự Động' };
      case 'recipes':
        return { short: 'Công Thức', full: 'Sổ Tay Công Thức' };
      case 'pantry':
        return { short: 'Tủ Lạnh', full: 'Tủ Lạnh & Đồ Thừa' };
      case 'account':
        return { short: 'Tài Khoản', full: 'Tài Khoản' };
      case 'admin':
        return { short: 'Telemetry', full: 'SteamDB Telemetry Hub' };
      default:
        return { short: 'MealWise', full: 'MealWise' };
    }
  };

  const currentTitle = getScreenTitle(activeTab);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-b border-[#EBE5DC] dark:border-[#252220] shadow-sm transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
      <div className={`h-14 px-2 min-[360px]:px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 max-w-lg mx-auto ${activeTab === 'admin' ? '!max-w-7xl' : ''}`}>
        
        {/* Left: Brand Logo & Title */}
        <button
          type="button"
          onClick={() => setActiveTab('meal-sets')} 
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0 text-left focus:outline-none"
          title="Trang chủ: Mâm Cơm Việt"
          aria-label="MealWise - Về trang Mâm Cơm 3 Món"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-white font-bold" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-black text-stone-900 dark:text-white tracking-tight block whitespace-nowrap">
              MealWise
            </span>
            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-extrabold block -mt-0.5 whitespace-nowrap">
              Mâm Cơm Việt
            </span>
          </div>
        </button>

        {/* Center: Active Screen Badge Pill */}
        <div 
          className="px-2 min-[360px]:px-2.5 py-1 rounded-full bg-[#F3EFEA] dark:bg-[#1C1A18] border border-[#E5DFD5] dark:border-[#292524] text-[10.5px] min-[360px]:text-[11px] sm:text-xs font-extrabold text-stone-800 dark:text-stone-200 max-w-[115px] min-[360px]:max-w-[150px] min-[390px]:max-w-[185px] sm:max-w-[240px] text-center min-w-0 shrink whitespace-nowrap overflow-hidden text-ellipsis"
          title={currentTitle.full}
        >
          <span className="sm:hidden">{currentTitle.short}</span>
          <span className="hidden sm:inline">{currentTitle.full}</span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Guest / Member Account Status Badge */}
          {isRegistered ? (
            user?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'admin' ? 'meal-sets' : 'admin')}
                className="px-2 py-1 rounded-xl bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40 text-[10px] font-black flex items-center gap-1 hover:bg-purple-500/30 transition-all cursor-pointer shadow-xs"
                title="Bảng Quản Trị SteamDB Telemetry (Chỉ hiển thị cho tài khoản Quản trị viên)"
              >
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>{activeTab === 'admin' ? 'App Mobile' : 'Admin ⚡'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className="px-2 py-1 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1 hover:bg-emerald-500/25 transition-all cursor-pointer"
                title="Tài khoản thành viên (Đã đăng nhập)"
              >
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden min-[360px]:inline">Thành Viên</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-2 py-1 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black flex items-center gap-1 hover:bg-amber-500/25 transition-all cursor-pointer"
              title="Bạn đang ở chế độ khách (Chưa đăng nhập). Bấm để đăng ký mở khóa toàn bộ tính năng."
            >
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Khách 🔒</span>
            </button>
          )}

          {/* Theme Mode Toggle (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-[#F3EFEA] hover:bg-[#EBE5DC] dark:bg-[#1C1A18] dark:hover:bg-[#292524] border border-[#E5DFD5] dark:border-[#292524] text-stone-700 dark:text-amber-400 transition-all flex items-center justify-center shadow-sm active:scale-90 focus:outline-none"
            title={theme === 'light' ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-stone-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Reset Onboarding / Quick Settings */}
          <button
            type="button"
            onClick={resetOnboarding}
            className="w-8 h-8 rounded-xl bg-[#F3EFEA] hover:bg-[#EBE5DC] dark:bg-[#1C1A18] dark:hover:bg-[#292524] text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 border border-[#E5DFD5] dark:border-[#292524] transition-all flex items-center justify-center shadow-sm active:scale-90 focus:outline-none"
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
