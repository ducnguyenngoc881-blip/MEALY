import React, { useId } from 'react';
import { UtensilsCrossed, Plus } from 'lucide-react';

export interface EmptyStateCardProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * EmptyStateCard
 * Production-ready Initial / Empty State (STATE_EMPTY) component.
 * Features an empathetic headline, culinary icon placeholder, and 44px+ primary action CTA.
 */
export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title = 'Chưa Có Món Ăn Nào',
  description = 'Bắt đầu thêm nguyên liệu hoặc chọn thực đơn yêu thích để MealWise tự động gợi ý mâm cơm ngon.',
  actionLabel = '+ Thêm Món Ngay',
  onAction,
  secondaryLabel,
  onSecondaryAction,
  icon,
  className = '',
}) => {
  // REACT RULES OF HOOKS INVARIANT: All hooks placed unconditionally at top of component
  const headingId = useId();

  return (
    <div
      role="region"
      aria-labelledby={headingId}
      className={`flex flex-col items-center justify-center p-8 text-center min-h-[320px] rounded-3xl bg-[#FFFFFF] dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm max-w-md mx-auto w-full ${className}`}
    >
      {/* Icon Graphic Container */}
      <div 
        aria-hidden="true"
        className="w-20 h-20 mb-5 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 shadow-inner"
      >
        {icon || <UtensilsCrossed className="w-10 h-10" />}
      </div>

      {/* Empathetic Headline */}
      <h3 
        id={headingId} 
        className="text-lg font-semibold text-[#1C1917] dark:text-[#FAF8F5] mb-2 px-2"
      >
        {title}
      </h3>

      {/* Explanatory Body Copy */}
      <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-xs mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Buttons in Natural Thumb Zone */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        {onAction && actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        )}

        {onSecondaryAction && secondaryLabel && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full flex items-center justify-center px-4 py-3 min-h-[44px] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-medium rounded-xl transition-colors text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};
