import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { SafeImage } from './SafeImage';
import {
  Sparkles,
  UtensilsCrossed,
  CalendarCheck2,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  Check,
  Users
} from 'lucide-react';
import { MealyLogoMark } from './icons/MealWiseLogo';

interface WelcomeSlide {
  id: number;
  tag: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  subtitle: string;
}

const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: 1,
    tag: 'Chào Mừng Đến Với Mealy',
    titlePrefix: 'Hết Đau Đầu Nghĩ ',
    titleHighlight: '"Hôm Nay Ăn Gì?"',
    subtitle: 'Gợi ý mâm cơm 3 món Mặn • Canh • Rau cân bằng dinh dưỡng từ hơn 2.200 món ngon mỗi ngày.'
  },
  {
    id: 2,
    tag: 'Thực Đơn Tuần Thông Minh',
    titlePrefix: 'Lên Thực Đơn 7 Ngày ',
    titleHighlight: 'Chỉ Với 1 Chạm',
    subtitle: 'Tự động sắp xếp 21 bữa ăn cả tuần không trùng món và bám sát ngân sách gia đình.'
  },
  {
    id: 3,
    tag: 'Đi Chợ Nhanh & Mua Chung',
    titlePrefix: 'Gom Nguyên Liệu & ',
    titleHighlight: 'Lọc Sẵn Gia Vị Bếp',
    subtitle: 'Tự động cộng gộp giỏ đi chợ theo quầy, đồng bộ Đi Chợ Chung và quản lý tủ lạnh.'
  }
];

export interface WelcomeOnboardingModalProps {
  initialSlide?: number;
  forceOpen?: boolean;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  initialSlide = 0,
  forceOpen = false
}) => {
  const {
    showWelcomeModal,
    completeWelcomeModal,
    activeTab
  } = useMealWise();

  const [currentSlide, setCurrentSlide] = useState<number>(initialSlide);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    if (showWelcomeModal) {
      setCurrentSlide(initialSlide);
      setSlideDirection('next');
    }
  }, [showWelcomeModal, initialSlide]);

  const handleSkipOrExplore = useCallback(() => {
    completeWelcomeModal();
  }, [completeWelcomeModal]);

  const handleGoToSlide = useCallback((targetIdx: number) => {
    setCurrentSlide(prev => {
      const clampedTarget = Math.max(0, Math.min(WELCOME_SLIDES.length - 1, targetIdx));
      if (clampedTarget !== prev) {
        setSlideDirection(clampedTarget > prev ? 'next' : 'prev');
      }
      return clampedTarget;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev < WELCOME_SLIDES.length - 1) {
        setSlideDirection('next');
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev > 0) {
        setSlideDirection('prev');
        return prev - 1;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!showWelcomeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkipOrExplore();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcomeModal, handleSkipOrExplore, handleNext, handlePrev]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndXRef.current = null;
    touchStartXRef.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance && currentSlide < WELCOME_SLIDES.length - 1) {
      setSlideDirection('next');
      setCurrentSlide(prev => prev + 1);
    } else if (distance < -minSwipeDistance && currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide(prev => prev - 1);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  }, [currentSlide]);

  if (!showWelcomeModal && !forceOpen) return null;

  const safeSlideIndex = Math.max(0, Math.min(WELCOME_SLIDES.length - 1, currentSlide));
  const slide = WELCOME_SLIDES[safeSlideIndex];
  const isLastSlide = safeSlideIndex === WELCOME_SLIDES.length - 1;

  const getSlideStageStyle = (idx: number): React.CSSProperties => {
    const offset = idx - safeSlideIndex;
    const isActive = offset === 0;
    return {
      opacity: isActive ? 1 : 0,
      transform: isActive
        ? 'translate3d(0px, 0px, 0) scale(1)'
        : `translate3d(${offset * 48}px, 0px, 0) scale(0.92)`,
      transition:
        'transform 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)',
      pointerEvents: isActive ? 'auto' : 'none',
      zIndex: isActive ? 20 : 10
    };
  };

  const getFloatingBadgeStyle = (
    idx: number,
    delayMs: number,
    rotateDeg: number
  ): React.CSSProperties => {
    const isActive = idx === safeSlideIndex;
    return {
      opacity: isActive ? 1 : 0,
      transform: isActive
        ? `translate3d(0px, 0px, 0) rotate(${rotateDeg}deg) scale(1)`
        : `translate3d(0px, 14px, 0) rotate(${rotateDeg * 2}deg) scale(0.9)`,
      transition:
        'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)',
      transitionDelay: isActive ? `${delayMs}ms` : '0ms'
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-onboarding-title"
      data-testid="welcome-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      {/* Full-Screen Native Mobile Onboarding Canvas */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full sm:max-w-xl md:max-w-2xl min-h-[100dvh] sm:min-h-[680px] sm:max-h-[90dvh] sm:rounded-[36px] flex flex-col justify-between bg-[#FAF8F5] dark:bg-[#0F1420] sm:border sm:border-slate-200/80 sm:dark:border-slate-800 shadow-2xl overflow-hidden relative select-none"
      >
        {/* Subtle Editorial Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-blue-500/15 via-amber-400/10 to-emerald-400/15 blur-3xl"
        />

        {/* Floating Top-Left Brand Pill */}
        <div className="absolute top-4 left-4 z-30 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
          <span className="w-6 h-6 rounded-lg bg-[#0F172A] flex items-center justify-center shrink-0 overflow-hidden">
            <MealyLogoMark className="w-5 h-5" />
          </span>
          <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
            Mealy
          </span>
        </div>

        {/* Floating Top-Right Skip Pill */}
        <button
          type="button"
          onClick={handleSkipOrExplore}
          data-testid="welcome-skip-btn"
          className="absolute top-4 right-4 z-30 min-h-[44px] px-4 py-2 rounded-full bg-white/85 hover:bg-white dark:bg-slate-900/85 dark:hover:bg-slate-800 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 shadow-sm text-xs font-extrabold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          Bỏ qua
        </button>

        {/* TOP 62%: RICH VISUAL HERO STAGE (Photography + Floating Tilted UI Collage) */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[370px] pt-16 pb-2 px-5 flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-[340px] h-[315px] sm:h-[335px] flex items-center justify-center">
            {/* SLIDE 1 VISUAL */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={getSlideStageStyle(0)}
              aria-hidden={safeSlideIndex !== 0}
              data-testid={safeSlideIndex === 0 ? 'welcome-visual-slide-1' : undefined}
            >
              {/* Main Portrait Hero Food Card */}
              <div className="relative w-[240px] sm:w-[256px] h-[288px] sm:h-[308px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900">
                <SafeImage
                  src="https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
                  dishTitle="Bún Thịt Nướng Chả Giò"
                  category="mon-chinh"
                  alt="Mâm Cơm 3 Món Chuẩn Vị"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-14 left-3.5 right-3.5 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wide mb-1">
                    Mâm Cơm 3 Món Chuẩn Vị
                  </span>
                  <p className="text-xs sm:text-sm font-black leading-snug">
                    Thịt Kho Tàu • Canh Chua • Rau Muống
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9.5px] font-bold">
                      ⏱ 25 phút
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9.5px] font-bold">
                      🔥 620 kcal
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9.5px] font-bold">
                      💰 120k/mâm
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Tilted Pill 1: Top-Left (-rotate-3) */}
              <div
                style={getFloatingBadgeStyle(0, 70, -3)}
                className="absolute top-2 left-0 sm:-left-2 -rotate-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-xl flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[11px] font-black text-slate-900 dark:text-white block leading-none">
                    Mặn • Canh • Rau
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
                    Cân bằng 3 miền
                  </span>
                </div>
              </div>

              {/* Floating Tilted Card 2: Bottom-Right (rotate-2) */}
              <div
                style={getFloatingBadgeStyle(0, 130, 2)}
                className="absolute bottom-1 right-0 sm:-right-2 rotate-2 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-xl flex items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <SafeImage
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Caramelized_Pork_and_Eggs.jpg?auto=format&fit=crop&w=600&q=80"
                    dishTitle="Thịt Kho Tàu Hột Vịt"
                    category="mon-man"
                    alt="2.200+ Món Việt"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pr-1">
                  <span className="text-xs font-black text-[#1D4ED8] dark:text-blue-400 block leading-none">
                    2.200+ Món Việt
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mt-0.5">
                    Bắc • Trung • Nam
                  </span>
                </div>
              </div>
            </div>

            {/* SLIDE 2 VISUAL */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={getSlideStageStyle(1)}
              aria-hidden={safeSlideIndex !== 1}
              data-testid={safeSlideIndex === 1 ? 'welcome-visual-slide-2' : undefined}
            >
              {/* Editorial Food Background Portrait */}
              <div className="relative w-[240px] sm:w-[256px] h-[288px] sm:h-[308px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900">
                <SafeImage
                  src="https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg?auto=format&fit=crop&w=600&q=80"
                  dishTitle="Cơm Tấm Sườn Bì Chả"
                  category="mon-man"
                  alt="Thực Đơn Tuần Thông Minh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
              </div>

              {/* Floating Tilted Pill: Top-Right (rotate-2) */}
              <div
                style={getFloatingBadgeStyle(1, 70, 2)}
                className="absolute top-2 right-0 sm:-right-2 rotate-2 px-3.5 py-2 rounded-full bg-amber-400 text-slate-950 shadow-xl font-black text-[11px] flex items-center gap-1.5"
              >
                <span>💰 Ngân sách 120k/ngày</span>
              </div>

              {/* Floating Tilted 7-Day Weekly Planner Card (-rotate-2) */}
              <div
                style={getFloatingBadgeStyle(1, 130, -2)}
                className="absolute bottom-5 inset-x-2 sm:inset-x-1 -rotate-2 p-3.5 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 shadow-xl"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                    <CalendarCheck2 className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
                    <span>Thực Đơn Tuần (T2–CN)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[#1D4ED8] dark:text-blue-300 text-[10px] font-black">
                    21 bữa / tuần
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                    const isActive = idx === 0;
                    return (
                      <div
                        key={day}
                        className={`py-2 rounded-xl text-center flex flex-col items-center justify-center ${
                          isActive
                            ? 'bg-[#1D4ED8] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-black">{day}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            isActive ? 'bg-white' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Tilted Pill: Top-Left (-rotate-3) */}
              <div
                style={getFloatingBadgeStyle(1, 175, -3)}
                className="absolute top-12 left-0 sm:-left-2 -rotate-3 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-xl text-[11px] font-black text-[#1D4ED8] dark:text-blue-400 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động 1 chạm</span>
              </div>
            </div>

            {/* SLIDE 3 VISUAL */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={getSlideStageStyle(2)}
              aria-hidden={safeSlideIndex !== 2}
              data-testid={safeSlideIndex === 2 ? 'welcome-visual-slide-3' : undefined}
            >
              {/* Appetizing Fresh Produce & Cooking Portrait */}
              <div className="relative w-[240px] sm:w-[256px] h-[288px] sm:h-[308px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900">
                <SafeImage
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
                  dishTitle="Salad Rau Củ Quả Tươi"
                  category="mon-rau"
                  alt="Giỏ Đi Chợ Thông Minh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              </div>

              {/* Floating Tilted Pill: Top-Left (-rotate-3) */}
              <div
                style={getFloatingBadgeStyle(2, 70, -3)}
                className="absolute top-3 left-0 sm:-left-2 -rotate-3 px-3.5 py-2 rounded-full bg-emerald-500 text-white shadow-xl text-[11px] font-black flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Đã lọc sẵn gia vị bếp</span>
              </div>

              {/* Floating Tilted Pill: Top-Right (rotate-2) */}
              <div
                style={getFloatingBadgeStyle(2, 120, 2)}
                className="absolute top-14 right-0 sm:-right-2 rotate-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-xl text-[11px] font-black text-[#1D4ED8] dark:text-blue-400 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Đi Chợ Chung</span>
              </div>

              {/* Floating Tilted Smart Grocery Card (rotate-2) */}
              <div
                style={getFloatingBadgeStyle(2, 165, 2)}
                className="absolute bottom-4 inset-x-2 sm:inset-x-1 rotate-2 p-3.5 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 shadow-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                    <ShoppingCart className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
                    <span>Giỏ Đi Chợ Thông Minh</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    Theo quầy kệ
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 line-through flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      Thịt ba chỉ • 500g
                    </span>
                    <span className="text-[10px] font-black text-[#1D4ED8] dark:text-blue-300">Mẹ</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md border-2 border-[#1D4ED8]" />
                      Rau muống & Cà chua
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">Bố</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM 38%: ULTRA-MINIMAL DRIBBBLE TYPOGRAPHY & THUMB-ZONE CTA */}
        <div className="relative z-20 px-6 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] flex flex-col items-center text-center">
          {/* Synchronized Directional Copy Stage (Fixed min-height prevents vertical jump between slides 2 and 3) */}
          <div
            key={slide.id}
            className={`min-h-[132px] flex flex-col items-center justify-center text-center ${
              slideDirection === 'next' ? 'animate-welcome-copy-next' : 'animate-welcome-copy-prev'
            }`}
          >
            {/* Minimal Tag Pill */}
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#1D4ED8] dark:text-blue-300 text-[11px] font-black tracking-wide mb-2.5">
              {slide.tag}
            </span>

            {/* Big, Bold Display Headline with 1 Key Phrase Highlighted */}
            <h2
              id="welcome-onboarding-title"
              className="text-2xl sm:text-[28px] font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white max-w-[340px] mx-auto"
            >
              {slide.titlePrefix}
              <span className="text-[#1D4ED8] dark:text-blue-400">{slide.titleHighlight}</span>
              {slide.titleSuffix || ''}
            </h2>

            {/* Short 2-Line Subtitle Only (15-22 words max) */}
            <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[320px] mx-auto font-medium">
              {slide.subtitle}
            </p>
          </div>

          {/* Expanding Liquid Pill Pagination Dots (Fixed geometry track for zero jitter between 1 <-> 2 <-> 3) */}
          <div
            className="inline-flex items-center justify-center gap-2 my-4 px-3 py-2 rounded-full bg-slate-200/50 dark:bg-slate-800/60"
            role="tablist"
            aria-label="Các bước giới thiệu ứng dụng"
          >
            {WELCOME_SLIDES.map((s, idx) => {
              const isCurrent = idx === safeSlideIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`Trang giới thiệu ${idx + 1}`}
                  onClick={() => handleGoToSlide(idx)}
                  className="p-0 border-0 bg-transparent flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`block rounded-full ${
                      isCurrent
                        ? 'w-7 h-2 rounded-full bg-[#1D4ED8]'
                        : 'w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                    style={{
                      width: isCurrent ? '28px' : '8px',
                      height: '8px',
                      boxShadow: isCurrent ? '0 2px 8px rgba(29, 78, 216, 0.35)' : 'none',
                      transition:
                        'width 380ms cubic-bezier(0.22, 1, 0.36, 1), background-color 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Unified Persistent 54px Pill CTA & Back Navigation (Never unmounts between Slide 2 and Slide 3) */}
          <div className="w-full flex items-center gap-2.5">
            {safeSlideIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                data-testid="welcome-prev-btn"
                aria-label="Quay Lại"
                className="min-h-[54px] min-w-[54px] px-4 rounded-full bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="sr-only sm:not-sr-only">Quay Lại</span>
              </button>
            )}

            <button
              type="button"
              onClick={isLastSlide ? handleSkipOrExplore : handleNext}
              data-testid={isLastSlide ? 'welcome-start-explore-btn' : 'welcome-next-btn'}
              className="flex-1 min-h-[54px] pl-6 pr-2.5 py-2 rounded-full bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-black text-sm shadow-lg shadow-blue-600/25 flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 cursor-pointer"
            >
              <span className="mx-auto pl-3 transition-opacity duration-200">
                {isLastSlide ? 'Bắt Đầu Khám Phá Ngay' : 'Tiếp Theo'}
              </span>
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
