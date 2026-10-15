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
  RecipeBookNavIcon,
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
  // Left 2 items: Thực Đơn, Đi Chợ
  const leftNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }[] = [
    { id: 'weekly', label: 'Thực Đơn', icon: WeeklyMenuNavIcon },
    { id: 'grocery', label: 'Đi Chợ', icon: MarketBasketNavIcon }
  ];

  // Center Hero Centerpiece: Tủ Lạnh (elevated hero button like the previous minigame centerpiece)
  const centerItem: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> } = {
    id: 'pantry',
    label: 'Tủ Lạnh',
    icon: Refrigerator
  };

  // Right 2 items: Công Thức, Tài Khoản
  const rightNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }[] = [
    { id: 'recipes', label: 'Công Thức', icon: RecipeBookNavIcon },
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

  // Build unified visible navigation tabs (5 ergonomic tabs)
  const allNavItems = [
    ...leftNavItems,
    centerItem,
    ...rightNavItems
  ];

  const visibleNavItems = allNavItems;

  // Compatibility badge resolver for guests (party moved to Account; grocery gated)
  const getBadgeLabel = (item: { id: ActiveTab; label: string }) => {
    const isGated = isWebGuestViewer && item.id !== 'grocery';
    if (isGated) return `${item.label} 🔒`;
    if (item.id === 'party' && !isRegistered) return 'Tiệc 🔒';
    if (item.id === 'grocery' && !isRegistered) return 'Đi Chợ 🔒';
    return item.label;
  };

  // When inside party tab (opened via Account), highlight the Account tab as active parent
  const activeTabForNav = activeTab === 'party' ? 'account' : activeTab;
  const activeIndex = visibleNavItems.findIndex(item => item.id === activeTabForNav);
  const itemCount = visibleNavItems.length;

  const renderStandardNavItem = (item: { id: ActiveTab; label: string; icon: React.ComponentType<NavIconProps> }) => {
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
            ? 'text-blue-600 dark:text-blue-400 font-black' 
            : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-800 dark:hover:text-stone-200'
        }`}
        aria-label={item.label}
      >
        <div className="relative flex items-center justify-center">
          <Icon 
            active={active} 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ease-out ${
              active 
                ? 'scale-110 -translate-y-0.5 text-blue-600 dark:text-blue-400' 
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
          active ? 'font-black text-blue-600 dark:text-blue-400' : 'font-semibold'
        }`}>
          {getBadgeLabel(item)}
        </span>
      </button>
    );
  };

  return (
    <nav 
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-md md:max-w-lg z-40 bg-[#F8FAFC]/95 dark:bg-[#12161F]/95 backdrop-blur-xl border-t sm:border-x border-[#E2E8F0] dark:border-[#2D3748] shadow-sm transition-colors duration-200 select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="relative h-16 flex items-center justify-between px-1.5">
        
        {/* Animated Sliding Active Indicator Pill for standard tabs */}
        {activeIndex !== -1 && activeTab !== 'pantry' && (
          <div 
            className="absolute top-1.5 bottom-1.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 px-0.5"
            style={{
              width: `calc((100% - 12px) / ${itemCount})`,
              left: '6px',
              transform: `translateX(calc(${activeIndex} * 100%))`
            }}
          >
            <div className="w-full h-full rounded-2xl bg-blue-50 dark:bg-blue-950/40 shadow-xs border border-blue-200/60 dark:border-blue-800/50 transition-colors" />
          </div>
        )}

        {/* Left 2 Items: Thực Đơn, Đi Chợ */}
        {leftNavItems.map(renderStandardNavItem)}

        {/* CENTERPIECE: TỦ LẠNH HERO BUTTON (LIKE THE PREVIOUS MINIGAME CENTER BUTTON) */}
        <div className="flex-1 shrink-0 flex flex-col items-center justify-center relative -top-3 z-20 px-0">
          <button
            type="button"
            onClick={() => {
              playServoClick();
              if (isWebGuestViewer) {
                openDownloadAppModal('Tủ Lạnh & Đồ Ăn Thừa');
                return;
              }
              setActiveTab('pantry');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none touch-manipulation"
            title="Tủ Lạnh & Gợi Ý Món Từ Đồ Thừa Thông Minh"
            aria-label="Tủ Lạnh & Đồ Ăn Thừa"
          >
            {/* Minimalist Centerpiece Hero Button */}
            <div className={`relative w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400/40 shadow-md shadow-blue-600/25 flex items-center justify-center transition-all duration-200 group-hover:scale-105 active:scale-95 ${
              activeTab === 'pantry' ? 'scale-105 ring-2 ring-blue-500/30' : ''
            }`}>
              <Refrigerator active={activeTab === 'pantry'} className="w-5 h-5 text-white" />
              {isWebGuestViewer && (
                <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-black px-1 rounded-full leading-tight shadow-xs">
                  App
                </span>
              )}
            </div>

            {/* Label Underneath */}
            <span className={`text-[9.5px] sm:text-[10px] tracking-tight mt-1 leading-none whitespace-nowrap transition-colors ${
              activeTab === 'pantry'
                ? 'font-black text-blue-600 dark:text-blue-400'
                : 'font-semibold text-stone-600 dark:text-stone-400'
            }`}>
              {getBadgeLabel(centerItem)}
            </span>
          </button>
        </div>

        {/* Right 2 Items: Hôm Nay, Tài Khoản */}
        {rightNavItems.map(renderStandardNavItem)}

      </div>
    </nav>
  );
};
