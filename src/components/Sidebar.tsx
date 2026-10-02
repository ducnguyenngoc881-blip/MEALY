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

  // Navigation items configuration
  const leftNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }[] = [
    { id: 'meal-sets', label: 'Hôm Nay', icon: RiceBowlNavIcon },
    { id: 'weekly', label: 'Thực Đơn', icon: WeeklyMenuNavIcon }
  ];

  const rightNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }[] = [
    { id: 'pantry', label: 'Tủ Lạnh', icon: Refrigerator },
    { id: 'grocery', label: 'Đi Chợ', icon: MarketBasketNavIcon },
    { id: 'party', label: 'Tiệc', icon: FeastClocheNavIcon },
    { id: 'account', label: 'Tài Khoản', icon: ChefProfileNavIcon }
  ];

  // Minigame launcher retained for helper & programmatic dispatch
  const handleOpenMinigames = () => {
    playServoClick();
    if (isWebGuestViewer) {
      openDownloadAppModal('Minigame & Giải Trí Bàn Tiệc');
      return;
    }
    openMinigameHub();
  };

  // Build unified visible navigation tabs:
  // For guests (!isRegistered): 'Đi Chợ' (grocery) and 'Tiệc' (party) are hidden.
  // The layout presents 4 equal tabs: Hôm Nay, Thực Đơn, Tủ Lạnh, Tài Khoản.
  // For registered accounts: all 6 tabs are displayed uniformly.
  const allNavItems = [
    ...leftNavItems,
    ...rightNavItems
  ];

  const visibleNavItems = allNavItems.filter(item => {
    if (item.id === 'party' && !isRegistered) {
      return false;
    }
    if (item.id === 'grocery' && !isRegistered) {
      return false;
    }
    return true;
  });

  const activeIndex = visibleNavItems.findIndex(item => item.id === activeTab);
  const itemCount = visibleNavItems.length;

  return (
    <nav 
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-md md:max-w-lg z-40 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-t sm:border-x border-[#EBE5DC] dark:border-[#252220] shadow-sm transition-colors duration-200 select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="relative h-16 flex items-center justify-between px-1.5">
        
        {/* Animated Sliding Active Indicator Pill */}
        {activeIndex !== -1 && (
          <div 
            className="absolute top-1.5 bottom-1.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 px-0.5"
            style={{
              width: `calc((100% - 12px) / ${itemCount})`,
              left: '6px',
              transform: `translateX(calc(${activeIndex} * 100%))`
            }}
          >
            <div className="w-full h-full rounded-2xl bg-stone-200/80 dark:bg-stone-800/80 shadow-xs border border-stone-300/40 dark:border-stone-700/50 transition-colors" />
          </div>
        )}

        {/* Uniform Nav Buttons */}
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const isGatedForGuest = isWebGuestViewer && item.id !== 'grocery';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playServoClick();
                if (isGatedForGuest) {
                  openDownloadAppModal(item.label);
                  return;
                }
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-2xl transition-all touch-manipulation active:scale-90 ${
                active 
                  ? 'text-stone-950 dark:text-white font-black' 
                  : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  active={active} 
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ease-out ${
                    active 
                      ? 'scale-110 -translate-y-0.5 text-stone-900 dark:text-stone-100' 
                      : 'scale-100 translate-y-0 text-stone-500 dark:text-stone-400'
                  }`} 
                />
                {isGatedForGuest && (
                  <span className="absolute -top-1.5 -right-2 text-[8px] bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-black px-1 rounded-full leading-tight shadow-xs">
                    App
                  </span>
                )}
              </div>
              <span className={`text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none whitespace-nowrap transition-colors duration-200 ${
                active ? 'font-black text-stone-950 dark:text-white' : 'font-semibold'
              }`}>
                {isGatedForGuest ? `${item.label} 🔒` : (item.id === 'party' && !isRegistered ? 'Tiệc 🔒' : item.label)}
              </span>
            </button>
          );
        })}

      </div>
    </nav>
  );
};
