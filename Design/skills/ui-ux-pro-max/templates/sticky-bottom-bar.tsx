import React from 'react';

export interface StickyBottomBarProps {
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  primaryActionDisabled?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  summaryLabel?: string;
  summaryValue?: string;
  summarySubtext?: string;
  className?: string;
}

/**
 * StickyBottomBar
 * Production-ready Fixed Bottom Action Bar anchored in the Natural Thumb Zone (bottom 40%).
 * Strictly accounts for safe-area-inset-bottom and guarantees 44px+ tap targets.
 */
export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  primaryActionLabel,
  onPrimaryAction,
  primaryActionDisabled = false,
  secondaryActionLabel,
  onSecondaryAction,
  summaryLabel,
  summaryValue,
  summarySubtext,
  className = '',
}) => {
  // REACT RULES OF HOOKS INVARIANT: All hooks placed unconditionally at top of component

  return (
    <aside
      aria-label="Thanh tác vụ chính"
      className={`fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#1A1918]/95 backdrop-blur-md border-t border-[#E8E2D8] dark:border-[#252220] shadow-lg ${className}`}
    >
      <div className="max-w-lg mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-4">
        {/* Summary Info (e.g. Item Count / Estimated Total Price) */}
        {(summaryLabel || summaryValue) && (
          <div className="min-w-0 flex flex-col justify-center">
            {summaryLabel && (
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] truncate">
                {summaryLabel}
              </span>
            )}
            {summaryValue && (
              <span className="text-base font-bold text-[#1C1917] dark:text-[#FAF8F5] truncate">
                {summaryValue}
              </span>
            )}
            {summarySubtext && (
              <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                {summarySubtext}
              </span>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-3 min-h-[44px] text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-xl transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {secondaryActionLabel}
            </button>
          )}

          <button
            type="button"
            disabled={primaryActionDisabled}
            onClick={onPrimaryAction}
            className="flex-1 max-w-[220px] px-6 py-3 min-h-[44px] text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md transition-colors text-center truncate"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </aside>
  );
};
