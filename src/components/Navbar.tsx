import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  RotateCcw,
  Sun,
  Moon,
  Lock,
  Sparkles,
  Smartphone,
  User,
  UserPlus,
  LogIn
} from 'lucide-react';
import { RiceBowlNavIcon } from './icons/NavIcons';
import { MealWiseLogoMark } from './icons/MealWiseLogo';
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
    <header className="sticky top-0 z-40 w-full bg-[#F8FAFC]/90 dark:bg-[#12161F]/90 backdrop-blur-xl border-b border-[#E2E8F0]/70 dark:border-[#2D3748]/70 shadow-xs transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
      <div className="h-14 px-2 min-[360px]:px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 max-w-lg mx-auto">
        
        {/* Left: Brand Logo & Wordmark (Mealy / MealWise • Mâm Cơm Việt) */}
        <button
          type="button"
          onClick={() => {
            if (isWebGuestViewer) {
              openDownloadAppModal('Mâm Cơm 3 Món Chuẩn Vị');
              return;
            }
            setActiveTab('meal-sets');
          }} 
          className="flex items-center gap-2 cursor-pointer group shrink-0 text-left focus:outline-none"
          title="Mealy • MealWise • Mâm Cơm Việt — Về trang Hôm Nay"
          aria-label="Mealy - Về trang Hôm Nay"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-xs overflow-hidden">
            <MealWiseLogoMark className="w-7 h-7" />
          </div>
          <span className="text-[15px] font-black text-stone-900 dark:text-white tracking-tight whitespace-nowrap">
            Mealy
          </span>
        </button>

        {/* Center: Active Screen Badge Pill (hidden on clean mobile feed) */}
        <div 
          className="hidden px-2.5 min-[360px]:px-3 py-1 rounded-full bg-stone-100/90 dark:bg-stone-850/90 text-[10.5px] min-[360px]:text-[11px] sm:text-xs font-black text-stone-800 dark:text-stone-200 max-w-[115px] min-[360px]:max-w-[150px] min-[390px]:max-w-[185px] sm:max-w-[240px] text-center min-w-0 shrink whitespace-nowrap overflow-hidden text-ellipsis border border-stone-200/80 dark:border-stone-700/60 shadow-2xs"
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
              className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-black flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Tải ứng dụng điện thoại MealWise"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tải App</span>
            </button>
          )}
          {/* Authentication & Profile Control */}
          {!isRegistered ? (
            activeTab !== 'account' ? (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="group relative flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/80 shadow-sm hover:shadow active:scale-95 transition-all duration-200 cursor-pointer select-none shrink-0"
                title="Đăng ký hoặc đăng nhập tài khoản MealWise"
                aria-label="Đăng ký hoặc đăng nhập tài khoản"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xs shrink-0 group-hover:rotate-12 transition-transform duration-200">
                  <UserPlus className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black tracking-tight whitespace-nowrap">Đăng Nhập</span>
                  <span className="text-[10px] font-bold text-amber-300 dark:text-amber-700 hidden min-[360px]:inline">/ Đăng Ký</span>
                </div>
              </button>
            ) : null
          ) : user?.role === 'admin' ? (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="group relative flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 border border-stone-800 dark:border-white shadow-sm active:scale-95 transition-all duration-200 cursor-pointer select-none shrink-0"
              title="Mở Website Quản Trị Viên"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-xs font-black tracking-tight">Web Admin</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'account') {
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } else {
                  setActiveTab('account');
                }
              }}
              className="group relative flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-stone-100/90 hover:bg-stone-200/90 dark:bg-stone-850/90 dark:hover:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/70 shadow-2xs active:scale-95 transition-all duration-200 cursor-pointer select-none shrink-0 max-w-[140px] sm:max-w-[170px]"
              title={`Tài khoản: ${user?.name || user?.email || 'Thành viên'}. Bấm để xem thông tin cá nhân`}
            >
              {/* Circular Avatar Monogram with Online Green Dot */}
              <div className="relative w-[26px] h-[26px] rounded-full bg-blue-600 text-white dark:bg-blue-600 dark:text-white flex items-center justify-center text-[11px] font-black shadow-xs shrink-0 ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-105 transition-transform duration-200">
                {user?.name ? user.name.trim().charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-stone-900" />
              </div>
              <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 truncate">
                {user?.name || 'Tài Khoản'}
              </span>
            </button>
          )}

          {/* Theme Mode Toggle (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden w-8 h-8 rounded-full bg-stone-100/90 hover:bg-stone-200/90 dark:bg-stone-850/90 dark:hover:bg-stone-800 border border-stone-200/70 dark:border-stone-700/60 text-stone-700 dark:text-stone-200 transition-all items-center justify-center active:scale-95 focus:outline-none shadow-2xs"
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
            className="hidden w-8 h-8 rounded-full bg-stone-100/90 hover:bg-stone-200/90 dark:bg-stone-850/90 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 border border-stone-200/70 dark:border-stone-700/60 transition-all items-center justify-center active:scale-95 focus:outline-none shadow-2xs"
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
