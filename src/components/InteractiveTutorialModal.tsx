import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { ActiveTab } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, Lightbulb } from 'lucide-react';

interface TutorialStep {
  id: string;
  tab: ActiveTab;
  targetSelector: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  tip?: string;
  cardPlacement?: 'above' | 'below' | 'auto';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'weekly-menu',
    tab: 'weekly',
    targetSelector: '[data-tutorial-target="weekly-autofill-btn"]',
    icon: '✨',
    cardPlacement: 'below',
    badge: 'Bước 1 / 8 • Thực Đơn Tuần',
    title: 'Gợi Ý Thực Đơn 1-Click Cả Tuần',
    description: 'Mealy tự động lên thực đơn 7 ngày chuẩn dinh dưỡng và ngân sách. Bấm "Gợi ý 1-click" để đổi mới toàn bộ 21 bữa ăn bất cứ lúc nào!',
    tip: 'Chi phí và calo được tự động tính toán chuẩn theo số người ăn.'
  },
  {
    id: 'weekly-grocery',
    tab: 'weekly',
    targetSelector: '[data-tutorial-target="weekly-grocery-btn"]',
    icon: '🛒',
    cardPlacement: 'below',
    badge: 'Bước 2 / 8 • Chuyển Sang Đi Chợ',
    title: 'Gom Danh Sách Đi Chợ Tự Động',
    description: 'Bấm nút "Đi Chợ" để gom toàn bộ nguyên liệu của tuần, cộng gộp định lượng và phân chia theo quầy mua sắm tối ưu!',
    tip: 'Tiết kiệm thời gian tính toán và không lo mua thiếu nguyên liệu.'
  },
  {
    id: 'grocery-spices',
    tab: 'grocery',
    targetSelector: '[data-tutorial-target="spices-cabinet-btn"]',
    icon: '🧂',
    cardPlacement: 'below',
    badge: 'Bước 3 / 8 • Tủ Gia Vị Bếp',
    title: 'Gia Vị Đã Được Lọc Tự Động',
    description: 'Gia vị cơ bản (muối, mắm, đường, dầu ăn...) tự động ẩn khỏi danh mục mua để tránh trùng lặp. Bấm vào đây để kiểm tra tủ gia vị bếp.',
    tip: 'Kiểm tra nhanh tủ bếp trước khi đi chợ giúp tiết kiệm 15-20% chi phí.'
  },
  {
    id: 'grocery-aisles',
    tab: 'grocery',
    targetSelector: '[data-tutorial-target="grocery-first-three-items"]',
    icon: '📋',
    cardPlacement: 'below',
    badge: 'Bước 4 / 8 • Danh Sách Đi Chợ',
    title: 'Danh Sách Phân Quầy & Gom Món',
    description: '• Toàn bộ nguyên liệu được phân loại theo quầy siêu thị thực tế (Thịt & Trứng, Hải sản, Rau củ...).\n• Tự động cộng gộp định lượng (gam, kg, quả...) và hiển thị số lượng bữa ăn sử dụng!',
    tip: 'Mỗi món hiển thị số bữa ăn trong tuần cần dùng (ví dụ: 6 món, 9 món) kèm giá ước tính.'
  },
  {
    id: 'grocery-checklist',
    tab: 'grocery',
    targetSelector: '[data-tutorial-target="grocery-select-all-btn"], [data-tutorial-target="grocery-checklist-section"]',
    icon: '📋',
    cardPlacement: 'below',
    badge: 'Bước 5 / 8 • Tích Chọn & Chọn Tất Cả',
    title: 'Tích Chọn Mua & Chọn Tất Cả 1 Chạm',
    description: '• Bấm vào ô vuông (✓) để đánh dấu món đã nhặt vào giỏ.\n• Bấm "Chọn tất cả" tại góc quầy để tích nhanh toàn bộ món chỉ 1 chạm!',
    tip: 'Món đã tích sẽ tự động chuyển xuống mục "Đã cho vào giỏ" ở cuối quầy.'
  },
  {
    id: 'grocery-lobby',
    tab: 'grocery',
    targetSelector: '[data-tutorial-target="collab-lobby-btn"]',
    icon: '👥',
    cardPlacement: 'above',
    badge: 'Bước 6 / 8 • Sảnh Đi Chợ Chung',
    title: 'Phòng Mua Chung',
    description: '• Bấm nút này để tạo hoặc mở Sảnh Đi Chợ Chung.\n• Mời người thân qua mã phòng hoặc QR để cùng mua trên 1 giỏ hàng.\n• Phân chia món và cập nhật tức thì theo thời gian thực!',
    tip: 'Thực đơn riêng của bạn vẫn được lưu giữ an toàn 100%.'
  },
  {
    id: 'grocery-fridge',
    tab: 'grocery',
    targetSelector: '[data-tutorial-target="stock-fridge-btn"]',
    icon: '🧊',
    cardPlacement: 'above',
    badge: 'Bước 7 / 8 • Cất Vào Tủ Lạnh',
    title: 'Đi Chợ Xong - Chuyển Vào Tủ Lạnh',
    description: 'Bấm nút này để cất toàn bộ các món đã mua (✓) vào tủ lạnh ảo, giúp theo dõi hạn sử dụng và độ tươi ngon mỗi ngày!',
    tip: 'Chỉ những món đã tích chọn mới được cất vào tủ lạnh.'
  },
  {
    id: 'fridge-compartments',
    tab: 'pantry',
    targetSelector: '[data-tutorial-target="fridge-compartments-tab"]',
    icon: '❄️',
    cardPlacement: 'below',
    badge: 'Bước 8 / 8 • Tủ Lạnh Thông Minh',
    title: 'Phân Loại 3 Ngăn & Nấu Tận Dụng Đồ Thừa',
    description: 'Thực phẩm được tự động phân vào 3 ngăn (Đông, Mát, Rau củ). Mealy sẽ nhắc bạn ăn đồ sắp hết hạn và gợi ý nấu đồ thừa không lãng phí!',
    tip: 'Bấm vào món đồ thừa để xem công thức biến tấu bữa ăn siêu ngon.'
  }
];

export const InteractiveTutorialModal: React.FC = () => {
  const { isTutorialOpen, setIsTutorialOpen, activeTab, setActiveTab, showToast, user } = useMealWise();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [isScrollLocked, setIsScrollLocked] = useState<boolean>(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const scrollLockTimeoutRef = useRef<number | null>(null);
  const lastActionTimeRef = useRef<number>(0);
  const isFinishingRef = useRef<boolean>(false);

  const currentStep = TUTORIAL_STEPS[currentStepIndex] || TUTORIAL_STEPS[0];

  // Update target rect and perform smooth scroll animation to bring target into optimal view
  const updateTargetRect = useCallback(() => {
    if (!isTutorialOpen) return;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Allow scrolling during the transition so browser can run smooth scroll animation
    setIsScrollLocked(false);

    const scrollTargetIntoOptimalPosition = (targetElement: HTMLElement) => {
      const vh = window.innerHeight || 800;
      const placement = currentStep.cardPlacement || 'auto';
      const elRect = targetElement.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteTop = elRect.top + currentScrollY;

      if (placement === 'below') {
        // Position element near the top (leaving 75px for top navbar)
        window.scrollTo({ top: Math.max(0, absoluteTop - 75), behavior: 'smooth' });
      } else if (placement === 'above') {
        // Position element near the bottom (leaving 85px for bottom bar)
        window.scrollTo({ top: Math.max(0, absoluteTop - (vh - elRect.height - 85)), behavior: 'smooth' });
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    };

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (el) {
      scrollTargetIntoOptimalPosition(el);
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        setIsMeasuring(false);
      }

      // Lock scrolling once the smooth scroll animation completes (~500ms)
      if (scrollLockTimeoutRef.current) {
        window.clearTimeout(scrollLockTimeoutRef.current);
      }
      scrollLockTimeoutRef.current = window.setTimeout(() => {
        setIsScrollLocked(true);
        const finalEl = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
        if (finalEl) {
          setTargetRect(finalEl.getBoundingClientRect());
        }
      }, 500);
      return;
    }

    // If not found yet, retry after short intervals
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts++;
      const retryEl = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (retryEl) {
        scrollTargetIntoOptimalPosition(retryEl);
        const rect = retryEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
          setIsMeasuring(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (scrollLockTimeoutRef.current) {
            window.clearTimeout(scrollLockTimeoutRef.current);
          }
          scrollLockTimeoutRef.current = window.setTimeout(() => {
            setIsScrollLocked(true);
            const finalEl = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
            if (finalEl) {
              setTargetRect(finalEl.getBoundingClientRect());
            }
          }, 500);
          return;
        }
      }
      if (attempts >= 15) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Fallback: clear targetRect so modal gracefully centers on screen
        setTargetRect(null);
        setIsMeasuring(false);
        setIsScrollLocked(true);
      }
    }, 100);
    intervalRef.current = interval;
  }, [isTutorialOpen, currentStep]);

  // Synchronize step tab and trigger animated scroll
  useEffect(() => {
    if (!isTutorialOpen) {
      isFinishingRef.current = false;
      setCurrentStepIndex(0);
      setTargetRect(null);
      setIsScrollLocked(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (scrollLockTimeoutRef.current) {
        clearTimeout(scrollLockTimeoutRef.current);
        scrollLockTimeoutRef.current = null;
      }
      return;
    }

    isFinishingRef.current = false;
    setIsMeasuring(true);
    setIsScrollLocked(false);

    // Switch tab if step belongs to a different tab
    if (activeTab !== currentStep.tab) {
      setActiveTab(currentStep.tab);
    }

    // Delay measurement slightly to let DOM mount & transitions settle
    const timer = window.setTimeout(() => {
      updateTargetRect();
    }, 140);

    return () => {
      window.clearTimeout(timer);
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (scrollLockTimeoutRef.current) {
        window.clearTimeout(scrollLockTimeoutRef.current);
        scrollLockTimeoutRef.current = null;
      }
    };
  }, [isTutorialOpen, currentStepIndex, currentStep, activeTab, setActiveTab, updateTargetRect]);

  // Recalculate spotlight dynamically on window resize or during scroll animation
  useEffect(() => {
    if (!isTutorialOpen) return;

    const handleWindowChange = () => {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleWindowChange, { passive: true });
    window.addEventListener('scroll', handleWindowChange, { passive: true, capture: true });

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, { capture: true });
    };
  }, [isTutorialOpen, currentStep]);

  const handleFinishTutorial = useCallback((isSkipped: boolean = false) => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    try {
      localStorage.setItem('mealwise_tutorial_completed', 'true');
      if (user?.email) {
        const emailLower = user.email.toLowerCase().trim();
        localStorage.setItem(`mealwise_tutorial_completed_${emailLower}`, 'true');
      }
    } catch {}
    setIsScrollLocked(false);
    setIsTutorialOpen(false);
    // Explicitly revert to the "Thực Đơn" screen upon completion/dismissal
    setActiveTab('weekly');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (isSkipped) {
      showToast('Đã đóng hướng dẫn. Bạn có thể xem lại bất kỳ lúc nào tại mục Tài Khoản.');
    } else {
      showToast('🎉 Chúc mừng bạn đã hoàn thành hướng dẫn cơ bản của Mealy!');
    }
  }, [user, setIsTutorialOpen, setActiveTab, showToast]);

  const handleNextStep = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 250) return;
    lastActionTimeRef.current = now;
    if (currentStepIndex >= TUTORIAL_STEPS.length - 1) {
      handleFinishTutorial(false);
      return;
    }
    setIsScrollLocked(false);
    setCurrentStepIndex(prev => prev + 1);
  }, [currentStepIndex, handleFinishTutorial]);

  const handlePrevStep = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 250) return;
    lastActionTimeRef.current = now;
    if (currentStepIndex > 0) {
      setIsScrollLocked(false);
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Scroll Lock: Lock document scrolling strictly once the step scroll animation has finished
  useEffect(() => {
    if (!isTutorialOpen) return;

    // Snapshot existing styles
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    // Prevent accidental gesture/wheel scrolling anywhere outside designated card scroll container
    const preventScroll = (e: TouchEvent | WheelEvent) => {
      const target = e.target as HTMLElement | null;
      // If user is interacting with any button or tutorial card element, never block touch gestures
      if (target && target.closest('[data-tutorial-card-content], button, a, input, [role="button"]')) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // Prevent keyboard scroll navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleFinishTutorial(true);
        return;
      }
      if (isScrollLocked) {
        const scrollKeys = ['Space', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'];
        if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key)) {
          const target = e.target as HTMLElement | null;
          if (target && target.closest('input, textarea, select')) return;
          e.preventDefault();
        }
      }
    };

    if (isScrollLocked) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overflow = 'hidden';

      window.addEventListener('touchmove', preventScroll, { passive: false });
      window.addEventListener('wheel', preventScroll, { passive: false });
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Restore styles upon modal closing
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.documentElement.style.overflow = prevHtmlOverflow;

      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTutorialOpen, isScrollLocked, handleFinishTutorial]);

  // Early return strictly AFTER all React hooks are executed
  if (!isTutorialOpen) return null;

  const padding = 8;
  const gap = 12;
  const safeEdge = 16;
  const hasTarget = targetRect && targetRect.width > 0 && targetRect.height > 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const preferPlacement = currentStep.cardPlacement || 'auto';
  // Space available above and below target inside viewport
  const spaceAbove = hasTarget ? targetRect.top - padding : vh / 2;
  const spaceBelow = hasTarget ? vh - (targetRect.bottom + padding) : vh / 2;

  // Minimum vertical height needed for the floating tutorial card (badge, title, description, buttons)
  const MIN_CARD_HEIGHT = 220;

  // Smart placement: auto-flip if requested placement doesn't have sufficient space
  let placeAbove = false;
  if (preferPlacement === 'above') {
    placeAbove = spaceAbove >= MIN_CARD_HEIGHT || spaceAbove >= spaceBelow;
  } else if (preferPlacement === 'below') {
    // If prefer below, only place below if spaceBelow has enough room, otherwise flip above
    placeAbove = spaceBelow < MIN_CARD_HEIGHT && spaceAbove >= MIN_CARD_HEIGHT;
  } else {
    placeAbove = hasTarget && (spaceBelow < 280 || spaceAbove > spaceBelow);
  }

  const cardStyle: React.CSSProperties = hasTarget
    ? {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 24px)',
        width: '420px',
        zIndex: 9996,
        ...(placeAbove
          ? {
              bottom: Math.min(vh - safeEdge - MIN_CARD_HEIGHT, Math.max(safeEdge, vh - targetRect.top + padding + gap)),
              maxHeight: Math.min(vh - safeEdge * 2, Math.max(MIN_CARD_HEIGHT, targetRect.top - padding - gap - safeEdge))
            }
          : {
              top: Math.min(vh - safeEdge - MIN_CARD_HEIGHT, Math.max(safeEdge, targetRect.bottom + padding + gap)),
              maxHeight: Math.min(vh - safeEdge * 2, Math.max(MIN_CARD_HEIGHT, vh - targetRect.bottom - padding - gap - safeEdge))
            })
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 'calc(100vw - 24px)',
        width: '420px',
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 9996,
        touchAction: 'manipulation'
      };

  return (
    <aside
      aria-label="Hướng Dẫn Sử Dụng Ứng Dụng"
      className="fixed inset-0 z-[9990] overflow-hidden select-none overscroll-none"
    >
      {/* 1. Backdrop with SVG Spotlight cutout - Captures pointer & touch events to block accidental background interaction & scrolling */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto select-none z-[9991]"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <defs>
          <mask id="tutorial-spotlight-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            {/* White covers entire screen (opaque) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black hole cuts out target element (transparent) */}
            {hasTarget && (
              <rect
                x={Math.max(0, targetRect.left - padding)}
                y={Math.max(0, targetRect.top - padding)}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={20}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop color masked with cutout */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 12, 10, 0.78)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* 2. Glowing pulse highlight ring around the spotlighted element */}
      {hasTarget && (
        <div
          style={{
            top: Math.max(0, targetRect.top - padding),
            left: Math.max(0, targetRect.left - padding),
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2
          }}
          className="fixed pointer-events-none z-[9993] rounded-[20px] ring-4 ring-amber-400 ring-offset-2 ring-offset-transparent shadow-[0_0_35px_rgba(251,191,36,0.85),0_0_15px_rgba(251,191,36,0.5)] transition-all duration-300"
        >
          {/* Subtle pulse ring around the button */}
          <div className="absolute inset-0 rounded-[20px] ring-2 ring-amber-300/80 animate-pulse pointer-events-none" />
        </div>
      )}

      {/* 3. Interactive Floating Step Card - Dynamically placed without screen cutoffs */}
      <div
        data-tutorial-card-content="true"
        style={{
          ...cardStyle,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="pointer-events-auto bg-white dark:bg-[#1A1918] border-2 border-amber-500/80 dark:border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-none overflow-y-auto overscroll-contain touch-pan-y flex flex-col justify-between [&::-webkit-scrollbar]:hidden"
      >
        {/* Header: Badge & Skip */}
        <div className="flex items-center justify-between gap-2 mb-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 text-[11px] font-black tracking-wide uppercase shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {currentStep.badge}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleFinishTutorial(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95"
            title="Bỏ qua hướng dẫn"
          >
            <span>Bỏ qua</span>
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-3 mb-2 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-xl shrink-0 shadow-xs">
            {currentStep.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black text-stone-950 dark:text-white leading-snug tracking-tight">
              {currentStep.title}
            </h3>
            <div className="text-xs sm:text-[13px] text-stone-800 dark:text-stone-200 font-semibold leading-relaxed mt-1 space-y-1">
              {currentStep.description.split('\n').map((line, lIdx) => (
                <p key={lIdx}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Pro-Tip box */}
        {currentStep.tip && (
          <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-stone-800 dark:text-stone-200 text-[11.5px] sm:text-xs leading-relaxed mb-3 shrink-0 shadow-2xs">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">{currentStep.tip}</span>
          </div>
        )}

        {/* Footer: Progress Dots & Navigation */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-stone-200 dark:border-stone-800 shrink-0">
          {/* Step Dots & Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1">
              {TUTORIAL_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setIsScrollLocked(false);
                    setCurrentStepIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer touch-manipulation ${
                    idx === currentStepIndex
                      ? 'w-5 bg-amber-500 shadow-xs'
                      : 'w-2 bg-stone-200 dark:bg-stone-700 hover:bg-amber-400/60'
                  }`}
                  aria-label={`Chuyển đến bước ${idx + 1}`}
                />
              ))}
            </div>
            <span className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10.5px] font-black text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 shrink-0">
              {currentStepIndex + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Actions: Always balanced secondary + primary buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStep();
                }}
                className="h-10 px-3 sm:px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/90 active:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 dark:active:bg-stone-600 text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white border border-stone-200/90 dark:border-stone-700 font-bold text-xs sm:text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs select-none shrink-0"
                aria-label="Quay lại bước trước"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="whitespace-nowrap">Lùi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFinishTutorial(true);
                }}
                className="h-10 px-3 sm:px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/90 active:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 dark:active:bg-stone-600 text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white border border-stone-200/90 dark:border-stone-700 font-bold text-xs sm:text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs select-none shrink-0"
                aria-label="Bỏ qua hướng dẫn"
              >
                <span className="whitespace-nowrap">Bỏ qua</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextStep();
              }}
              className={`h-10 px-3.5 sm:px-4 rounded-xl font-black text-xs sm:text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center justify-center gap-1.5 group select-none shrink-0 ${
                currentStepIndex === TUTORIAL_STEPS.length - 1
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 border border-emerald-400/50'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-md shadow-amber-500/25 hover:shadow-amber-500/35 border border-amber-300/80'
              }`}
              aria-label={currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Khám Phá Ngay' : 'Bước tiếp theo'}
            >
              <span className="whitespace-nowrap">
                {currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Khám Phá Ngay' : 'Tiếp Theo'}
              </span>
              {currentStepIndex === TUTORIAL_STEPS.length - 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default InteractiveTutorialModal;

