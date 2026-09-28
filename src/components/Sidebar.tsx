import React from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  UtensilsCrossed, 
  Calendar, 
  Refrigerator, 
  ShoppingCart, 
  User,
  PartyPopper,
  Zap,
  Sparkles,
  Package,
  Flame,
  Gamepad2
} from 'lucide-react';
import { ActiveTab } from '../types';
import { playServoClick } from '../utils/audioSynth';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, openMinigameHub, isRegistered } = useMealWise();

  const leftNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'meal-sets', label: 'Mâm 3 Món', icon: UtensilsCrossed },
    { id: 'weekly', label: 'Thực Đơn', icon: Calendar },
    { id: 'party', label: 'Tiệc', icon: PartyPopper }
  ];

  const rightNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'grocery', label: 'Đi Chợ', icon: ShoppingCart },
    { id: 'pantry', label: 'Tủ Lạnh', icon: Refrigerator },
    { id: 'account', label: 'Tài Khoản', icon: User }
  ];

  const handleOpenMinigames = () => {
    playServoClick();
    openMinigameHub();
  };

  return (
    <nav 
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-md md:max-w-lg z-40 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-t sm:border-x border-[#EBE5DC] dark:border-[#252220] shadow-dribbble transition-colors duration-200 select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="h-16 flex items-center justify-between px-1.5">
        
        {/* LEFT 3 ITEMS: Mâm 3 Món, Thực Đơn, Tiệc */}
        {leftNavItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-2xl transition-all relative ${
                active 
                  ? 'text-amber-700 dark:text-amber-400 font-extrabold' 
                  : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all relative ${active ? 'bg-amber-500/15 dark:bg-amber-500/20 -translate-y-0.5 shadow-sm' : ''}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] tracking-tighter sm:tracking-tight mt-0.5 leading-none whitespace-nowrap ${active ? 'font-extrabold text-amber-700 dark:text-amber-400' : 'font-semibold'}`}>
                {item.id === 'party' && !isRegistered ? 'Tiệc 🔒' : item.label}
              </span>
            </button>
          );
        })}

        {/* CENTERPIECE: MINIGAME ARCADE HUB (MỞ HÒM, VÒNG QUAY BÀN NHẬU...) */}
        <div className="flex-1 shrink-0 flex flex-col items-center justify-center relative -top-3.5 z-10 px-0">
          <button
            type="button"
            onClick={handleOpenMinigames}
            className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none touch-manipulation"
            title="Minigame Giải Trí: Mở Hòm, Vòng Quay Bàn Nhậu & Nhiều Hơn Nữa"
            aria-label="Minigame giải trí mở hòm và vòng quay bàn nhậu"
          >
            {/* Outer Glowing Energy Pulse */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400/80 via-orange-500/80 to-emerald-500/80 opacity-70 blur-sm group-hover:opacity-100 transition-opacity animate-pulse" />
            
            {/* Main Cyber Orb Button */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-400/80 dark:border-amber-400/90 shadow-xl flex items-center justify-center group-hover:scale-105 active:scale-90 transition-transform">
              
              {/* Flame Icon on Top-Right Corner (Indicates HOT feature) */}
              <div className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 border-2 border-slate-950 shadow-md flex items-center justify-center pointer-events-none">
                <Flame className="w-3 h-3 text-white fill-amber-200" />
              </div>

              {/* Gamepad Arcade Icon */}
              <div className="relative">
                <Gamepad2 className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <Sparkles className="w-2 h-2 text-rose-300 absolute -top-1 -right-1 animate-ping" />
              </div>

              {/* Mini Color Dots */}
              <div className="absolute bottom-1 flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-rose-400" />
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Label Underneath */}
            <span className="text-[9.5px] sm:text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-tight mt-1 leading-tight whitespace-nowrap">
              Minigame
            </span>
          </button>
        </div>

        {/* RIGHT 3 ITEMS: Đi Chợ, Món Ngon, Tài Khoản */}
        {rightNavItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-2xl transition-all relative ${
                active 
                  ? 'text-amber-700 dark:text-amber-400 font-extrabold' 
                  : 'text-stone-500 dark:text-stone-400 font-medium hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-amber-500/15 dark:bg-amber-500/20 -translate-y-0.5 shadow-sm' : ''}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] tracking-tighter sm:tracking-tight mt-0.5 leading-none whitespace-nowrap ${active ? 'font-extrabold text-amber-700 dark:text-amber-400' : 'font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

      </div>
    </nav>
  );
};
