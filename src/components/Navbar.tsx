import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  UtensilsCrossed, 
  RotateCcw,
  Sun,
  Moon,
  Lock,
  Sparkles,
  Smartphone
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
    openAuthModal,
    isWebGuestViewer,
    openDownloadAppModal
  } = useMealWise();

  const getScreenTitle = (tab: ActiveTab): { short: string; full: string } => {
    switch (tab) {
      case 'meal-sets':
        return { short: 'Hôm Nay', full: 'Mâm Cơm Hôm Nay' };
      case 'weekly':
        return { short: 'Thực Đơn', full: 'Thực Đơn Tuần' };
      case 'party':
        return { 
          short: isRegistered ? 'Tiệc Tùng' : 'Tiệc 🔒', 
          full: isRegistered ? 'Tiệc & Catering' : 'Tiệc & Catering 🔒' 
        };
      case 'fast-meal':
        return { short: 'Gợi Ý', full: 'Gợi Ý Bữa Cơm' };
      case 'grocery':
        return { short: 'Đi Chợ', full: 'Đi Chợ Tự Động' };
      case 'recipes':
        return { short: 'Công Thức', full: 'Sổ Tay Công Thức' };
      case 'pantry':
        return { short: 'Tủ Lạnh', full: 'Tủ Lạnh & Đồ Thừa' };
      case 'account':
        return { short: 'Cá Nhân', full: 'Tài Khoản Cá Nhân' };
      case 'admin':
        return { short: 'Quản Trị', full: 'Bảng Quản Trị' };
      default:
        return { short: 'MealWise', full: 'MealWise' };
    }
  };

  const currentTitle = isWebGuestViewer 
    ? { short: 'Khách Web', full: 'Khách Xem Đi Chợ' }
    : getScreenTitle(activeTab);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 dark:bg-[#121110]/90 backdrop-blur-xl border-b border-[#E8E2D8]/70 dark:border-[#252220]/70 shadow-xs transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
      <div className={`h-14 px-2 min-[360px]:px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 max-w-lg mx-auto ${activeTab === 'admin' ? '!max-w-7xl' : ''}`}>
        
        {/* Left: Brand Logo & Title */}
        <button
          type="button"
          onClick={() => {
            if (isWebGuestViewer) {
              openDownloadAppModal('Mâm Cơm 3 Món Chuẩn Vị');
              return;
            }
            setActiveTab('meal-sets');
          }} 
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0 text-left focus:outline-none"
          title="Trang chủ: Mâm Cơm Việt"
          aria-label="MealWise - Về trang Hôm Nay"
        >
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-950 border border-stone-800 dark:border-stone-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-xs">
            <UtensilsCrossed className="w-4 h-4 stroke-[2.2px]" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-black text-stone-900 dark:text-white tracking-tight block whitespace-nowrap">
              MealWise
            </span>
            <span className="text-[9px] text-stone-500 dark:text-stone-400 font-extrabold block -mt-0.5 whitespace-nowrap tracking-wide uppercase">
              Mâm Cơm Việt
            </span>
          </div>
        </button>

        {/* Center: Active Screen Badge Pill */}
        <div 
          className="px-2.5 min-[360px]:px-3 py-1 rounded-full bg-stone-100/90 dark:bg-stone-850/90 text-[10.5px] min-[360px]:text-[11px] sm:text-xs font-black text-stone-800 dark:text-stone-200 max-w-[115px] min-[360px]:max-w-[150px] min-[390px]:max-w-[185px] sm:max-w-[240px] text-center min-w-0 shrink whitespace-nowrap overflow-hidden text-ellipsis border border-stone-200/80 dark:border-stone-700/60 shadow-2xs"
          title={currentTitle.full}
        >
          <span className="sm:hidden">{currentTitle.short}</span>
          <span className="hidden sm:inline">{currentTitle.full}</span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Download App CTA for Web Guests */}
          {isWebGuestViewer && (
            <button
              type="button"
              onClick={() => openDownloadAppModal()}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10.5px] font-black flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Tải ứng dụng điện thoại MealWise"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tải App</span>
            </button>
          )}
          {/* Guest / Member Account Status Badge */}
          {isRegistered ? (
            user?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'admin' ? 'meal-sets' : 'admin')}
                className="px-2.5 py-1 rounded-full bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-950 border border-stone-800 dark:border-white text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Bảng Quản Trị"
              >
                <Sparkles className="w-3 h-3 text-stone-300 dark:text-stone-700" />
                <span>{activeTab === 'admin' ? 'App Mobile' : 'Admin'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className="px-2.5 py-1 rounded-full bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-950 border border-stone-800 dark:border-white text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Tài khoản thành viên (Đã đăng nhập)"
              >
                <Sparkles className="w-3 h-3 text-stone-300 dark:text-stone-700" />
                <span className="hidden min-[360px]:inline">Thành Viên</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/25 text-[10px] font-black flex items-center gap-1 hover:bg-amber-500/15 dark:hover:bg-amber-400/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="Bạn đang ở chế độ khách. Bấm để đăng ký mở khóa toàn bộ tính năng."
            >
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Khách 🔒</span>
            </button>
          )}

          {/* Theme Mode Toggle (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-stone-100/90 hover:bg-stone-200/90 dark:bg-stone-850/90 dark:hover:bg-stone-800 border border-stone-200/70 dark:border-stone-700/60 text-stone-700 dark:text-stone-200 transition-all flex items-center justify-center active:scale-95 focus:outline-none shadow-2xs"
            title={theme === 'light' ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-stone-700" />
            ) : (
              <Sun className="w-4 h-4 text-stone-200" />
            )}
          </button>

          {/* Reset Onboarding / Quick Settings */}
          <button
            type="button"
            onClick={resetOnboarding}
            className="w-8 h-8 rounded-full bg-stone-100/90 hover:bg-stone-200/90 dark:bg-stone-850/90 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 border border-stone-200/70 dark:border-stone-700/60 transition-all flex items-center justify-center active:scale-95 focus:outline-none shadow-2xs"
            title="Cài đặt lại khẩu vị"
            aria-label="Cài đặt lại khẩu vị"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
