import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Sparkles, 
  ChevronRight, 
  PlusCircle, 
  Clock, 
  Search, 
  Tag, 
  X,
  Shuffle,
  Gamepad2,
  Calendar,
  Utensils,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { VietnameseMealSet, MealSlot } from '../types';
import { matchesMealSetSearch } from '../utils/textUtils';
import { SafeImage } from './SafeImage';

export const POPULAR_TAGS = ['Tất Cả', 'Giàu Đạm', 'Eat Clean', '1 Người', 'Yêu Thích', 'Tiết Kiệm', 'Đổi Vị', 'Đồng Quê', 'Ăn Chay', 'Thanh Tịnh', 'Đậm Đà', 'Cay Nồng'];

export const TAG_DETAILS: Record<string, { icon: string; desc: string }> = {
  'Tất Cả': { icon: '🍽️', desc: 'Toàn bộ mâm cơm tuyển chọn' },
  'Giàu Đạm': { icon: '💪', desc: 'Nhiều thịt cá, năng lượng cao' },
  'Eat Clean': { icon: '🥗', desc: 'Ít dầu mỡ, thanh lành nhẹ bụng' },
  '1 Người': { icon: '👤', desc: 'Khẩu phần nhanh gọn, tiết kiệm' },
  'Yêu Thích': { icon: '❤️', desc: 'Mâm cơm gia đình yêu thích nhất' },
  'Bán Chạy': { icon: '❤️', desc: 'Mâm cơm gia đình yêu thích nhất' },
  'Tiết Kiệm': { icon: '💰', desc: 'Chi phí bình dân, hợp túi tiền' },
  'Đổi Vị': { icon: '🌟', desc: 'Món mới lạ miệng, không ngấy' },
  'Đồng Quê': { icon: '🌾', desc: 'Chuẩn vị cơm nhà dân dã' },
  'Ăn Chay': { icon: '🌱', desc: 'Thực đơn thuần chay thanh khiết' },
  'Thanh Tịnh': { icon: '🍵', desc: 'Hương vị nhẹ nhàng, thư thái' },
  'Đậm Đà': { icon: '🍲', desc: 'Kho rim chuẩn vị đưa cơm' },
  'Cay Nồng': { icon: '🌶️', desc: 'Đậm vị ớt tiêu, cay ấm nồng' },
};

const cleanDishTitle = (title: string) => {
  if (!title) return '';
  return title.replace(/^Mâm Cơm[:\s-]+/i, '').trim();
};

export const matchesRegionFilter = (
  set: VietnameseMealSet, 
  filter: 'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western'
): boolean => {
  if (filter === 'all') return true;
  if (filter === 'western') {
    return (set.region as string) === 'western' || 
      (set.region as string) === 'au' || 
      set.id.startsWith('mam-com-au') || 
      Boolean(set.tags && set.tags.some(t => t.toLowerCase().includes('âu') || t.toLowerCase().includes('western')));
  } else if (filter === 'chay') {
    return set.region === 'chay' || Boolean(set.tags && set.tags.some(t => /món chay|ăn chay|thuần chay/i.test(t)));
  } else if (filter === 'bac') {
    return set.region === 'bac' || Boolean(set.tags && set.tags.some(t => /miền bắc/i.test(t)));
  } else if (filter === 'nam') {
    return set.region === 'nam' || Boolean(set.tags && set.tags.some(t => /miền nam/i.test(t)));
  } else if (filter === 'trung') {
    return set.region === 'trung' || Boolean(set.tags && set.tags.some(t => /miền trung/i.test(t)));
  }
  return set.region === filter;
};

export const matchesTagFilter = (set: VietnameseMealSet, tag: string): boolean => {
  if (tag === 'Tất Cả') return true;
  if (tag === 'Yêu Thích' || tag === 'Bán Chạy') {
    return Boolean(
      set.tags &&
        set.tags.some(t => {
          const lower = t.toLowerCase();
          return (
            lower === 'yêu thích' ||
            lower === 'yeu thich' ||
            lower === 'bán chạy' ||
            lower === 'ban chay' ||
            lower === 'phổ biến'
          );
        })
    );
  }
  return Boolean(set.tags && set.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
};

export const getRegionBadgeLabel = (set: VietnameseMealSet): string => {
  if (matchesRegionFilter(set, 'western')) return 'Món Âu';
  if (matchesRegionFilter(set, 'chay')) return 'Món Chay';
  if (set.region === 'bac') return 'Miền Bắc';
  if (set.region === 'trung') return 'Miền Trung';
  if (set.region === 'nam') return 'Miền Nam';
  return 'Cơm Gia Đình';
};

export const MealSetExplorer: React.FC = () => {
  const { 
    mealSets, 
    addMealSetToSlot, 
    weeklyPlan, 
    setSelectedMealSet,
    openMinigameHub,
    openWelcomeModal
  } = useMealWise();

  const [regionFilter, setRegionFilter] = useState<'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('Tất Cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assigningMealSet, setAssigningMealSet] = useState<VietnameseMealSet | null>(null);
  const [targetDay, setTargetDay] = useState<string>('mon');
  const [targetSlot, setTargetSlot] = useState<MealSlot>('lunch');
  const [featuredIndex, setFeaturedIndex] = useState<number>(() => Math.floor(Math.random() * 1000));
  const [assignDragY, setAssignDragY] = useState<number>(0);
  const [isHeroCollapsed, setIsHeroCollapsed] = useState<boolean>(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState<boolean>(false);
  const assignTouchStartY = useRef<number | null>(null);
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of POPULAR_TAGS) {
      if (tag === 'Tất Cả') {
        counts[tag] = mealSets.filter(s => matchesRegionFilter(s, regionFilter)).length;
      } else {
        counts[tag] = mealSets.filter(s => matchesRegionFilter(s, regionFilter) && matchesTagFilter(s, tag)).length;
      }
    }
    return counts;
  }, [mealSets, regionFilter]);

  const { strictMatches, fallbackMatches, displayedSets } = useMemo(() => {
    // 1. Strict filter
    const strict = mealSets.filter(set => {
      if (!matchesRegionFilter(set, regionFilter)) return false;
      if (!matchesTagFilter(set, selectedTag)) return false;
      if (searchQuery.trim() && !matchesMealSetSearch(set, searchQuery)) return false;
      return true;
    });

    // When active text search is being typed, return exact matching results
    if (searchQuery.trim()) {
      return {
        strictMatches: strict,
        fallbackMatches: [],
        displayedSets: strict
      };
    }

    // If strict matches are already at least 5, return them directly
    if (strict.length >= 5) {
      return {
        strictMatches: strict,
        fallbackMatches: [],
        displayedSets: strict
      };
    }

    // Dietary & Cuisine invariants
    const isVegetarianQuery = regionFilter === 'chay' || selectedTag === 'Ăn Chay' || selectedTag === 'Thanh Tịnh';
    const isWesternQuery = regionFilter === 'western';

    // Smart fallback buffer: pad to at least 5 sets so users never experience low selection
    const seenIds = new Set(strict.map(s => s.id));
    const fallbacks: VietnameseMealSet[] = [];

    if (regionFilter !== 'all') {
      // STRICT REGIONAL ISOLATION:
      // When a specific region is filtered, NEVER cross into other regions under any circumstances!
      // Fallbacks MUST come from the SAME region only!
      for (const set of mealSets) {
        if (strict.length + fallbacks.length >= 5) break;
        if (seenIds.has(set.id)) continue;
        if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
        if (matchesRegionFilter(set, regionFilter)) {
          seenIds.add(set.id);
          fallbacks.push(set);
        }
      }
    } else {
      // When regionFilter === 'all':
      // Step 1: Same tag across regions / nationwide
      if (selectedTag !== 'Tất Cả') {
        for (const set of mealSets) {
          if (strict.length + fallbacks.length >= 5) break;
          if (seenIds.has(set.id)) continue;
          if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
          if (matchesTagFilter(set, selectedTag)) {
            seenIds.add(set.id);
            fallbacks.push(set);
          }
        }
      }

      // Step 2: Popular nationwide / fallback sets
      for (const set of mealSets) {
        if (strict.length + fallbacks.length >= 5) break;
        if (seenIds.has(set.id)) continue;
        if (isVegetarianQuery && !matchesRegionFilter(set, 'chay')) continue;
        if (isWesternQuery && !matchesRegionFilter(set, 'western')) continue;
        seenIds.add(set.id);
        fallbacks.push(set);
      }

      // Final safety: if somehow still < 5 and not vegetarian query, pad from remaining sets
      if (strict.length + fallbacks.length < 5 && !isVegetarianQuery) {
        for (const set of mealSets) {
          if (strict.length + fallbacks.length >= 5) break;
          if (!seenIds.has(set.id)) {
            seenIds.add(set.id);
            fallbacks.push(set);
          }
        }
      }
    }

    return {
      strictMatches: strict,
      fallbackMatches: fallbacks,
      displayedSets: [...strict, ...fallbacks]
    };
  }, [mealSets, regionFilter, selectedTag, searchQuery]);

  const filteredSets = displayedSets;

  // Current featured hero meal set
  const featuredSet = useMemo(() => {
    if (filteredSets.length === 0) return null;
    return filteredSets[featuredIndex % filteredSets.length];
  }, [filteredSets, featuredIndex]);

  // Pick a fresh random suggestion whenever region or tag filter changes
  useEffect(() => {
    if (displayedSets.length > 0) {
      setFeaturedIndex(Math.floor(Math.random() * displayedSets.length));
    }
  }, [regionFilter, selectedTag]);

  // Reset to first match if user is specifically searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setFeaturedIndex(0);
    }
  }, [searchQuery]);

  const handleShuffleHero = () => {
    if (filteredSets.length <= 1) return;
    const currentIdx = featuredIndex % filteredSets.length;
    // Pick a random offset between 1 and filteredSets.length - 1 to guarantee a DIFFERENT random meal set
    const randomOffset = Math.floor(Math.random() * (filteredSets.length - 1)) + 1;
    const nextIdx = (currentIdx + randomOffset) % filteredSets.length;
    setFeaturedIndex(nextIdx);
  };

  const handleApplySet = () => {
    if (!assigningMealSet) return;
    addMealSetToSlot(targetDay, targetSlot, assigningMealSet);
    setAssigningMealSet(null);
  };

  const renderMealSetCard = (set: VietnameseMealSet, isFallback: boolean = false, index?: number) => (
    <div 
      key={`${set.id}-${isFallback ? 'fallback' : 'strict'}-${index ?? 0}`}
      className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group border border-[#E8E2D8] dark:border-[#252220] select-none"
      onClick={() => setSelectedMealSet(set)}
      title="Xem Chi Tiết Mâm"
      aria-label={`Xem Chi Tiết Mâm: ${set.title}`}
    >
      <SafeImage 
        src={set.imageUrl} 
        alt={set.title} 
        fallbackTitle={set.title}
        category="Mâm Cơm"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* High-contrast gradient overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent pointer-events-none" />
      
      {/* Top Left: Region Badge & Optional Fallback Pill */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
        <span className="px-2.5 py-0.5 rounded-full bg-stone-950/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-xs">
          {getRegionBadgeLabel(set)}
        </span>
        {isFallback && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs border border-white/20">
            <Sparkles className="w-3 h-3" />
            <span>Gợi ý thêm</span>
          </span>
        )}
      </div>

      {/* Top Right: Plus Button to choose/assign this meal set */}
      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAssigningMealSet(set);
          }}
          className="w-10 h-10 rounded-2xl bg-stone-950/60 hover:bg-stone-900/80 active:scale-90 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all shadow-md cursor-pointer touch-manipulation group/btn"
          title="Chọn Mâm Này"
          aria-label={`Chọn Mâm Này: ${set.title}`}
        >
          <PlusCircle className="w-5 h-5 text-white/90 group-hover/btn:text-white group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>

      {/* Bottom Content: Title and Price / Calories */}
      <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10 pointer-events-none">
        <h4 className="text-base sm:text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-xs">
          {set.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-stone-200 mt-0.5 font-semibold">
          <span className="text-white font-black">{set.totalCostVnd.toLocaleString('vi-VN')} đ</span>
          <span>•</span>
          <span>{set.totalCalories} kcal</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      
      {/* 1. HERO CARD: "HÔM NAY ĂN GÌ?" (WITH COLLAPSIBLE ACCORDION / TOGGLE) */}
      {featuredSet && !searchQuery.trim() && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-sm transition-all">
          {/* Header Bar with Title */}
          <div className="p-3.5 sm:p-4 pb-2.5 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block leading-tight">
                  Gợi Ý Cho Bạn
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Hôm nay ăn gì?
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={openWelcomeModal}
              data-testid="hero-open-welcome-btn"
              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 text-[#1D4ED8] dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-extrabold inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Xem giới thiệu Mealy"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Giới Thiệu</span>
            </button>
          </div>

          {/* Full View of Featured Set */}
          <div className="p-3.5 sm:p-4 pt-2.5">
            {/* Featured Image */}
            <div 
              key={featuredSet.id}
              className="relative aspect-video w-full rounded-2xl overflow-hidden group cursor-pointer animate-fade-in" 
              onClick={() => setSelectedMealSet(featuredSet)}
            >
              <SafeImage 
                src={featuredSet.imageUrl} 
                alt={featuredSet.title} 
                fallbackTitle={featuredSet.title}
                category="Mâm Cơm"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-transparent" />

              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/10">
                {getRegionBadgeLabel(featuredSet)}
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  {featuredSet.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mt-0.5">
                  <span className="text-white font-black tracking-tight">{featuredSet.totalCostVnd.toLocaleString('vi-VN')} đ</span>
                  <span>•</span>
                  <span>{featuredSet.totalCalories} kcal</span>
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleShuffleHero}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[44px]"
                title="Đổi sang mâm cơm khác"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Đổi Mâm</span>
              </button>
              
              <button
                type="button"
                onClick={() => setAssigningMealSet(featuredSet)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Chọn Mâm Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MINIMALIST FILTER BAR */}
      <div className="space-y-2.5">

        {/* Region Tabs (flex flex-wrap gap-2) */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'bac', label: 'Miền Bắc' },
            { id: 'nam', label: 'Miền Nam' },
            { id: 'trung', label: 'Miền Trung' },
            { id: 'chay', label: 'Món Chay' },
            { id: 'western', label: 'Món Âu' }
          ].map(tab => {
            const active = regionFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setRegionFilter(tab.id as any);
                  if (selectedTag !== 'Tất Cả') {
                    setSelectedTag('Tất Cả');
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer min-h-[36px] ${
                  active
                    ? 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white font-extrabold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. FLAVOR / TAG DROP DOWN BAR (Optimized for Mobile Ergonomics - No horizontal scrollbar cutoff) */}
        <div className="relative" ref={tagDropdownRef}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTagDropdownOpen(prev => !prev)}
              aria-expanded={isTagDropdownOpen}
              className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-xs min-h-[44px] cursor-pointer ${
                selectedTag !== 'Tất Cả'
                  ? 'bg-[#1D4ED8] text-white font-extrabold border-[#1D4ED8] shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm shrink-0">
                  {selectedTag !== 'Tất Cả' ? TAG_DETAILS[selectedTag]?.icon || '🏷️' : '🏷️'}
                </span>
                <span className={`text-[11px] font-semibold shrink-0 ${selectedTag !== 'Tất Cả' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  Khẩu vị:
                </span>
                <span className="font-extrabold truncate">
                  {selectedTag}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                  selectedTag !== 'Tất Cả'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {tagCounts[selectedTag] || 0} mâm
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className={`text-[10px] hidden min-[360px]:inline ${selectedTag !== 'Tất Cả' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isTagDropdownOpen ? 'Đóng' : 'Đổi vị'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Quick 1-tap Clear Filter Button if a specific tag is active */}
            {selectedTag !== 'Tất Cả' && (
              <button
                type="button"
                onClick={() => setSelectedTag('Tất Cả')}
                className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 min-h-[44px] transition-all shrink-0 cursor-pointer active:scale-95"
                title="Xóa lọc khẩu vị"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden min-[360px]:inline">Tất cả</span>
              </button>
            )}
          </div>

          {/* Dropdown Menu Panel */}
          {isTagDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 space-y-1 animate-fade-in max-h-72 overflow-y-auto">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span>Chọn khẩu vị & chủ đề mâm cơm</span>
                <span>{mealSets.filter(s => matchesRegionFilter(s, regionFilter)).length} mâm có sẵn</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {POPULAR_TAGS.map(tag => {
                  const active = selectedTag === tag;
                  const count = tagCounts[tag] || 0;
                  const detail = TAG_DETAILS[tag];
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsTagDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-left transition-all min-h-[44px] cursor-pointer ${
                        active
                          ? 'bg-[#1D4ED8] text-white font-black shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="text-sm shrink-0">{detail?.icon || '🏷️'}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{tag}</span>
                          <span className={`text-[9px] block truncate ${active ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {detail?.desc}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          active
                            ? 'bg-white/20 text-white'
                            : count > 0 
                              ? 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300'
                              : 'bg-transparent text-slate-400 opacity-50'
                        }`}>
                          {count}
                        </span>
                        {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MINIMALIST MEAL SET CARDS LIST */}
      <div className="space-y-4">
        {/* Subtle banner if all results are fallback suggestions */}
        {strictMatches.length === 0 && fallbackMatches.length > 0 && !searchQuery.trim() && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
            <span>
              Gợi ý mâm cơm {regionFilter !== 'all' ? (regionFilter === 'bac' ? 'Miền Bắc ' : regionFilter === 'nam' ? 'Miền Nam ' : regionFilter === 'trung' ? 'Miền Trung ' : regionFilter === 'chay' ? 'Chay ' : 'Âu ') : ''}phong vị tương tự {selectedTag !== 'Tất Cả' ? `(${selectedTag})` : ''} dành riêng cho bạn
            </span>
          </div>
        )}

        {/* Strict matches */}
        {strictMatches.map((set, idx) => renderMealSetCard(set, false, idx))}

        {/* Graceful divider if backfill suggestions are shown alongside strict matches */}
        {strictMatches.length > 0 && fallbackMatches.length > 0 && !searchQuery.trim() && (
          <div className="pt-3 pb-1 flex items-center gap-2.5">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-2">
              <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
              Gợi ý thêm cùng phong vị {selectedTag !== 'Tất Cả' ? `(${selectedTag})` : ''}
            </span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>
        )}

        {/* Fallback matches */}
        {fallbackMatches.map((set, idx) => renderMealSetCard(set, true, idx))}
      </div>

      {/* Empty State */}
      {filteredSets.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy mâm cơm phù hợp
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery.trim()
              ? `Không có kết quả nào cho "${searchQuery}" với bộ lọc hiện tại.`
              : 'Thử chuyển sang bộ lọc hoặc từ khóa khác để khám phá thêm mâm cơm.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('Tất Cả');
              setRegionFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs shadow-xs cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* NATIVE MOBILE BOTTOM SHEET TO ASSIGN MEAL SET TO WEEKLY SLOT */}
      {assigningMealSet && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setAssigningMealSet(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              transform: assignDragY > 0 ? `translateY(${assignDragY}px)` : undefined,
              transition: assignDragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-4 sm:p-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-4 animate-slide-up border-t border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Swipe handle bar */}
            <div 
              onTouchStart={(e) => { assignTouchStartY.current = e.touches[0].clientY; }}
              onTouchMove={(e) => {
                if (assignTouchStartY.current === null) return;
                const diff = e.touches[0].clientY - assignTouchStartY.current;
                setAssignDragY(Math.max(0, diff));
              }}
              onTouchEnd={() => {
                if (assignDragY > 75) setAssigningMealSet(null);
                setAssignDragY(0);
                assignTouchStartY.current = null;
              }}
              className="w-full py-2 cursor-grab active:cursor-grabbing flex items-center justify-center -mt-2 mb-1"
            >
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
                <span>Xếp Vào Thực Đơn Tuần</span>
              </h3>
              <button 
                onClick={() => setAssigningMealSet(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Gán <strong className="text-slate-900 dark:text-white">{assigningMealSet.title}</strong> vào thực đơn tuần để chuẩn bị nguyên liệu đi chợ.
            </p>

            {/* Day Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn Ngày:</label>
              <select
                value={targetDay}
                onChange={e => setTargetDay(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
              >
                {weeklyPlan.map(day => (
                  <option key={day.dayId} value={day.dayId}>
                    {day.dayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Meal Slot Selector: 3 Slots (Breakfast, Lunch, Dinner) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bữa Ăn:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetSlot('breakfast')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'breakfast'
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-black shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm">☀️</span>
                  <span>Sáng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetSlot('lunch')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'lunch'
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-black shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm">🌤️</span>
                  <span>Trưa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetSlot('dinner')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'dinner'
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-black shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm">🌙</span>
                  <span>Tối</span>
                </button>
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setAssigningMealSet(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleApplySet}
                className="flex-1 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs shadow-xs cursor-pointer"
              >
                Xác Nhận Gán
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
