import React, { useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  X, 
  Lock, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, toastType, hideToast, openAuthModal, isRegistered } = useMealWise();

  // Defensive auto-dismiss fallback: guarantees toast will never stay stuck on screen
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage, hideToast]);

  if (!toastMessage) return null;

  const isLockOrWarning = toastType === 'warning' || /🔒|khóa|chỉ dành cho|cảnh báo/i.test(toastMessage);
  const isError = toastType === 'error';
  const isSuccess = toastType === 'success';
  const hasRegisterPrompt = !isRegistered && /đăng ký|thành viên|tài khoản/i.test(toastMessage);

  return (
    <aside 
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-[max(0.75rem,env(safe-area-inset-top,0.75rem))] left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-1.5rem)] max-w-sm sm:max-w-md pointer-events-none"
    >
      <div 
        className={`pointer-events-auto w-full p-3 sm:p-3.5 rounded-[24px] bg-stone-900/95 dark:bg-[#151413]/95 text-white backdrop-blur-2xl border shadow-2xl animate-island-in flex flex-col gap-2.5 ${
          isLockOrWarning 
            ? 'border-amber-500/40 shadow-[0_16px_40px_-6px_rgba(245,158,11,0.28),0_0_0_1px_rgba(245,158,11,0.2)]' 
            : isError 
              ? 'border-rose-500/40 shadow-[0_16px_40px_-6px_rgba(244,63,94,0.28),0_0_0_1px_rgba(244,63,94,0.2)]' 
              : isSuccess 
                ? 'border-emerald-500/40 shadow-[0_16px_40px_-6px_rgba(16,185,129,0.28),0_0_0_1px_rgba(16,185,129,0.2)]' 
                : 'border-stone-700/50 dark:border-stone-800/80 shadow-[0_16px_40px_-6px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Leading Icon Badge */}
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 ${
            isLockOrWarning 
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
              : isError 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                : isSuccess 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
          }`}>
            {isLockOrWarning ? (
              /🔒|khóa/i.test(toastMessage) ? <Lock className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLockOrWarning 
                  ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' 
                  : isError 
                    ? 'text-rose-400 bg-rose-500/15 border-rose-500/30' 
                    : isSuccess 
                      ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' 
                      : 'text-sky-400 bg-sky-500/15 border-sky-500/30'
              }`}>
                {isLockOrWarning ? (/🔒|khóa/i.test(toastMessage) ? 'Khóa Tính Năng' : 'Cảnh Báo') : isError ? 'Lưu Ý' : isSuccess ? 'Thành Công' : 'MealWise'}
              </span>
              <span className="text-[10px] font-medium text-stone-400">Vừa xong</span>
            </div>
            <p className="text-xs sm:text-[13px] font-medium text-stone-100 leading-snug break-words">
              {toastMessage.replace(/^([🔒⚠️✅❌🎉✨🍽️🗑️🧹🔄📦🛒💾📅🔔🔕⚡🏋️🥗🌿👤👋🟢])\s*/u, '')}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={hideToast}
            aria-label="Đóng thông báo"
            className="shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action button if registration prompt */}
        {hasRegisterPrompt && (
          <div className="pt-2 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => {
                hideToast();
                openAuthModal('register');
              }}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Đăng Ký Mở Khóa Miễn Phí</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
