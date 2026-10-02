import React, { useMemo } from 'react';

export interface SkeletonCardProps {
  aspectRatio?: 'square' | 'video' | 'portrait';
  lines?: number;
  showBadge?: boolean;
  showAction?: boolean;
  className?: string;
}

/**
 * SkeletonCard
 * Production-ready Loading / Skeleton State (STATE_LOADING) component.
 * Strictly adheres to CLS = 0 (Cumulative Layout Shift) by matching loaded card layout geometry.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  aspectRatio = 'video',
  lines = 2,
  showBadge = true,
  showAction = true,
  className = '',
}) => {
  // REACT RULES OF HOOKS INVARIANT: All hooks placed unconditionally at top of component
  const aspectClass = useMemo(() => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'video':
      default:
        return 'aspect-[16/9]';
    }
  }, [aspectRatio]);

  const lineElements = useMemo(() => {
    return Array.from({ length: lines }).map((_, idx) => (
      <div
        key={idx}
        style={{ width: `${Math.max(45, 100 - idx * 25)}%` }}
        className="h-3.5 bg-stone-200 dark:bg-stone-800 rounded-md"
      />
    ));
  }, [lines]);

  return (
    <div
      role="status"
      aria-label="Đang tải dữ liệu..."
      className={`relative w-full rounded-2xl bg-[#FFFFFF] dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] p-4 shadow-sm animate-pulse overflow-hidden ${className}`}
    >
      {/* Media Placeholder with Exact Aspect Ratio (CLS = 0) */}
      <div className={`w-full ${aspectClass} rounded-xl bg-stone-200 dark:bg-stone-800 mb-4 relative`}>
        {showBadge && (
          <div className="absolute top-3 left-3 w-16 h-6 rounded-full bg-stone-300 dark:bg-stone-700" />
        )}
      </div>

      {/* Title Placeholder */}
      <div className="w-3/4 h-5 bg-stone-300 dark:bg-stone-700 rounded-lg mb-3" />

      {/* Body Line Placeholders */}
      <div className="space-y-2 mb-4">
        {lineElements}
      </div>

      {/* Bottom Action Footer Placeholder */}
      {showAction && (
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/60">
          <div className="w-20 h-4 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="w-24 h-9 bg-stone-300 dark:bg-stone-700 rounded-xl" />
        </div>
      )}

      {/* Screen Reader Accessible Status */}
      <span className="sr-only">Nội dung đang được tải, vui lòng chờ...</span>
    </div>
  );
};
