import React, { useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useMealWise();

  // Defensive auto-dismiss fallback: guarantees toast will never stay stuck on screen
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage, hideToast]);

  if (!toastMessage) return null;

  return (
    <aside 
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-18 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-sm pointer-events-none"
    >
      <div className="pointer-events-auto w-full px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white dark:text-slate-100 border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-toast-in">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <p className="text-xs sm:text-[13px] font-bold text-slate-100 leading-snug break-words">
            {toastMessage}
          </p>
        </div>
        <button
          type="button"
          onClick={hideToast}
          aria-label="Đóng thông báo"
          className="shrink-0 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

