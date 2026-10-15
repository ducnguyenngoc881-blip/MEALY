import React, { useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { AlertCircle, Sparkles, X } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirmModal } = useMealWise();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!confirmDialog) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        confirmDialog.onCancel?.();
        closeConfirmModal();
      }
    };

    if (confirmDialog) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmDialog, closeConfirmModal]);

  if (!confirmDialog) return null;

  const handleConfirm = () => {
    const action = confirmDialog.onConfirm;
    closeConfirmModal();
    action();
  };

  const handleCancel = () => {
    confirmDialog.onCancel?.();
    closeConfirmModal();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up text-slate-900 dark:text-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            confirmDialog.isDanger
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}>
            {confirmDialog.isDanger ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 
              id="confirm-modal-title"
              className="text-base font-black text-slate-900 dark:text-white leading-snug"
            >
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
              {confirmDialog.message}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            {confirmDialog.cancelLabel || 'Hủy bỏ'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              confirmDialog.isDanger
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            <span>{confirmDialog.confirmLabel || 'Đồng ý'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
