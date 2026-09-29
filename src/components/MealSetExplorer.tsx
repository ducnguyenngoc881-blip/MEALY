import React, { useState, useRef, useMemo } from 'react';
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
  Utensils
} from 'lucide-react';
import { VietnameseMealSet, MealSlot } from '../types';
import { matchesMealSetSearch } from '../utils/textUtils';
import { SafeImage } from './SafeImage';

const POPULAR_TAGS = ['Tất Cả', 'Giàu Đạm', 'Eat Clean', '1 Người', 'Bán Chạy', 'Đồng Quê', 'Ăn Chay', 'Thanh Tịnh', 'Đậm Đà', 'Cay Nồng'];

const cleanDishTitle = (title: string) => {
  if (!title) return '';
  return title.replace(/^Mâm Cơm[:\s-]+/i, '').trim();
};

export const MealSetExplorer: React.FC = () => {
  const { 
    mealSets, 
    addMealSetToSlot, 
    weeklyPlan, 
    setSelectedMealSet,
    openMinigameHub
  } = useMealWise();

  const [regionFilter, setRegionFilter] = useState<'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('Tất Cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assigningMealSet, setAssigningMealSet] = useState<VietnameseMealSet | null>(null);
  const [targetDay, setTargetDay] = useState<string>('mon');
  const [targetSlot, setTargetSlot] = useState<MealSlot>('lunch');
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [assignDragY, setAssignDragY] = useState<number>(0);
  const assignTouchStartY = useRef<number | null>(null);

  const filteredSets = useMemo(() => {
    return mealSets.filter(set => {
      // 1. Region filter
      if (regionFilter !== 'all') {
        if (regionFilter === 'western') {
          const isWestern = (set.region as string) === 'western' || 
            (set.region as string) === 'au' || 
            set.id.startsWith('mam-com-au') || 
            (set.tags && set.tags.some(t => t.toLowerCase().includes('âu') || t.toLowerCase().includes('western')));
          if (!isWestern) return false;
        } else if (set.region !== regionFilter) {
          return false;
        }
      }
      // 2. Tag filter
      if (selectedTag !== 'Tất Cả') {
        const hasTag = set.tags && set.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }
      // 3. Diacritic-insensitive multi-field search
      if (searchQuery.trim()) {
        if (!matchesMealSetSearch(set, searchQuery)) {
          return false;
        }
      }
      return true;
    });
  }, [mealSets, regionFilter, selectedTag, searchQuery]);

  // Current featured hero meal set
  const featuredSet = useMemo(() => {
    if (filteredSets.length === 0) return null;
    return filteredSets[featuredIndex % filteredSets.length];
  }, [filteredSets, featuredIndex]);

  const handleShuffleHero = () => {
    if (filteredSets.length <= 1) return;
    setFeaturedIndex(prev => (prev + 1) % filteredSets.length);
  };

  const handleApplySet = () => {
    if (!assigningMealSet) return;
    addMealSetToSlot(targetDay, targetSlot, assigningMealSet);
    setAssigningMealSet(null);
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      
      {/* 1. HERO CARD: "HÔM NAY ĂN GÌ?" */}
      {featuredSet && (
        <div className="bg-white dark:bg-[#1A1918] rounded-3xl border border-[#E8E2D8] dark:border-[#252220] overflow-hidden shadow-xs hover:shadow-sm transition-all">
          <div className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                  Gợi Ý Cho Bạn
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                  Hôm nay ăn gì?
                </h2>
              </div>

              {/* Minigame roulette trigger button */}
              <button
                type="button"
                onClick={openMinigameHub}
                className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                title="Vòng quay ẩm thực giải trí"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Quay ngẫu nhiên</span>
              </button>
            </div>

            {/* Featured Image */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden mt-3 group cursor-pointer" onClick={() => setSelectedMealSet(featuredSet)}>
              <SafeImage 
                src={featuredSet.imageUrl} 
                alt={featuredSet.title} 
                fallbackTitle={featuredSet.title}
                category="Mâm Cơm"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                {featuredSet.region === 'bac' && 'Miền Bắc'}
                {featuredSet.region === 'nam' && 'Miền Nam'}
                {featuredSet.region === 'trung' && 'Miền Trung'}
                {featuredSet.region === 'chay' && 'Món Chay'}
                {(featuredSet.region as string) === 'western' && 'Món Âu'}
                {featuredSet.region === 'toan-quoc' && 'Truyền Thống'}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                  {featuredSet.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-200 mt-1">
                  <span className="text-white font-black tracking-tight">{featuredSet.totalCostVnd.toLocaleString('vi-VN')} đ</span>
                  <span>•</span>
                  <span>{featuredSet.totalCalories} kcal</span>
                </div>
              </div>
            </div>

            {/* 3 Dishes Mini Bar */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] text-center">
                <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 block uppercase">Món Mặn</span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate block mt-0.5" title={featuredSet.mainDish.title}>
                  {cleanDishTitle(featuredSet.mainDish.title)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] text-center">
                <span className="text-[9px] font-extrabold text-sky-600 dark:text-sky-400 block uppercase">Món Canh</span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate block mt-0.5" title={featuredSet.soupDish.title}>
                  {cleanDishTitle(featuredSet.soupDish.title)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] text-center">
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">Món Rau</span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate block mt-0.5" title={featuredSet.sideDish.title}>
                  {cleanDishTitle(featuredSet.sideDish.title)}
                </span>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleShuffleHero}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="Đổi sang mâm cơm khác"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Đổi Mâm</span>
              </button>
              
              <button
                type="button"
                onClick={() => setAssigningMealSet(featuredSet)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Chọn Mâm Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MINIMALIST SEARCH & FILTER BAR */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm mâm cơm, món mặn, canh, rau..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#1A1918] text-stone-900 dark:text-white placeholder-stone-400 text-xs font-medium border border-[#E8E2D8] dark:border-[#252220] focus:outline-none focus:border-stone-500 dark:focus:border-stone-400 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

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
                onClick={() => setRegionFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  active
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-extrabold shadow-xs'
                    : 'bg-white dark:bg-[#1A1918] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-[#E8E2D8] dark:border-[#252220]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tag Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1 mr-1 shrink-0">
            <Tag className="w-3 h-3" />
          </span>
          {POPULAR_TAGS.map(tag => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 whitespace-nowrap ${
                  active
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-black shadow-xs'
                    : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80 dark:hover:bg-stone-800/80'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MINIMALIST MEAL SET CARDS LIST */}
      <div className="space-y-4">
        {filteredSets.map(set => (
          <div 
            key={set.id}
            className="bg-white dark:bg-[#1A1918] rounded-2xl border border-[#E8E2D8] dark:border-[#252220] overflow-hidden shadow-xs hover:shadow-sm transition-all"
          >
            {/* Card Header with Image */}
            <div className="relative h-40 sm:h-44 overflow-hidden cursor-pointer" onClick={() => setSelectedMealSet(set)}>
              <SafeImage 
                src={set.imageUrl} 
                alt={set.title} 
                fallbackTitle={set.title}
                category="Mâm Cơm"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              
              <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-end justify-between">
                <div>
                  <h4 className="text-base font-extrabold leading-tight">
                    {set.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5">
                    <span className="text-white font-black">{set.totalCostVnd.toLocaleString('vi-VN')} đ</span>
                    <span>•</span>
                    <span>{set.totalCalories} kcal</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMealSet(set);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-bold hover:bg-white/30"
                >
                  Xem Mâm
                </button>
              </div>
            </div>

            {/* 3 Dish Breakdown */}
            <div className="p-3 sm:p-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110]">
                  <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 block uppercase">Mặn</span>
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate block mt-0.5" title={set.mainDish.title}>
                    {cleanDishTitle(set.mainDish.title)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110]">
                  <span className="text-[9px] font-extrabold text-sky-600 dark:text-sky-400 block uppercase">Canh</span>
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate block mt-0.5" title={set.soupDish.title}>
                    {cleanDishTitle(set.soupDish.title)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110]">
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">Rau</span>
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate block mt-0.5" title={set.sideDish.title}>
                    {cleanDishTitle(set.sideDish.title)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMealSet(set)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs text-center transition-all"
                >
                  Xem Chi Tiết Mâm
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningMealSet(set)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Chọn Mâm Này</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSets.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-[#1A1918] rounded-3xl border border-[#E8E2D8] dark:border-[#252220] space-y-3">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
            Không tìm thấy mâm cơm phù hợp
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Không có kết quả nào cho &quot;{searchQuery}&quot; với bộ lọc hiện tại.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('Tất Cả');
              setRegionFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-black text-xs shadow-xs"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* NATIVE MOBILE BOTTOM SHEET TO ASSIGN MEAL SET TO WEEKLY SLOT */}
      {assigningMealSet && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setAssigningMealSet(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              transform: assignDragY > 0 ? `translateY(${assignDragY}px)` : undefined,
              transition: assignDragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
            className="w-full max-w-lg bg-white dark:bg-[#1A1918] rounded-t-3xl shadow-2xl p-4 sm:p-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-4 animate-slide-up border-t border-[#E8E2D8] dark:border-[#252220] max-h-[90vh] overflow-y-auto"
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
              <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full" />
            </div>

            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                <span>Xếp Vào Thực Đơn Tuần</span>
              </h3>
              <button 
                onClick={() => setAssigningMealSet(null)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Gán <strong className="text-stone-900 dark:text-white">{assigningMealSet.title}</strong> vào thực đơn tuần để chuẩn bị nguyên liệu đi chợ.
            </p>

            {/* Day Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Chọn Ngày:</label>
              <select
                value={targetDay}
                onChange={e => setTargetDay(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-bold text-xs focus:outline-none"
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
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Bữa Ăn:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetSlot('breakfast')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'breakfast'
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
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
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
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
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-950 font-black shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
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
                className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleApplySet}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs shadow-xs"
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
