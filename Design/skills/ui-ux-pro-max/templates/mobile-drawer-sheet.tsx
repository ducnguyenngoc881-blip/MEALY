import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export interface MobileDrawerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
}

/**
 * MobileDrawerSheet
 * Production-ready touch-draggable bottom sheet modal for native mobile devices.
 * Adheres strictly to thumb-zone ergonomics, safe-area-inset-bottom, and 44px+ tap targets.
 */
export const MobileDrawerSheet: React.FC<MobileDrawerSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85vh]',
  showCloseButton = true,
}) => {
  // REACT RULES OF HOOKS INVARIANT: All hooks placed unconditionally at top of component
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: ESC key dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    currentYRef.current = touch.clientY;
    const deltaY = currentYRef.current - startYRef.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    // Dismiss threshold: swipe down > 75px closes the drawer
    if (dragOffset > 75) {
      onClose();
    }
    setDragOffset(0);
  }, [dragOffset, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-sheet-title"
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`w-full max-w-lg ${maxHeight} flex flex-col bg-[#FFFFFF] dark:bg-[#1A1918] text-[#1C1917] dark:text-[#FAF8F5] rounded-t-3xl shadow-2xl border-t border-[#E8E2D8] dark:border-[#252220] overflow-hidden`}
      >
        {/* Grab Handle Header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 mb-2" />
        </div>

        {/* Sheet Title Bar */}
        <div className="flex items-center justify-between px-6 pb-3 border-b border-[#E8E2D8] dark:border-[#252220]">
          <div className="min-w-0 pr-4">
            <h2 id="drawer-sheet-title" className="text-lg font-semibold truncate text-[#1C1917] dark:text-[#FAF8F5]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng chi tiết"
              className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
          {children}
        </div>

        {/* Safe Area Inset Bottom Spacer */}
        <div className="pb-[calc(1rem+env(safe-area-inset-bottom))]" />
      </div>
    </div>
  );
};
