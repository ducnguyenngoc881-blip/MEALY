import React, { useState, useRef, useMemo } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Utensils, 
  Sparkles, 
  Flame, 
  Calendar, 
  ChevronRight, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Check,
  X,
  Search,
  Tag,
  Filter
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
    setActiveTab,
    viewMode
  } = useMealWise();

  const [regionFilter, setRegionFilter] = useState<'all' | 'bac' | 'trung' | 'nam' | 'chay' | 'western'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('Tất Cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assigningMealSet, setAssigningMealSet] = useState<VietnameseMealSet | null>(null);
  const [targetDay, setTargetDay] = useState<string>('mon');
  const [targetSlot, setTargetSlot] = useState<MealSlot>('lunch');
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

  const handleApplySet = () => {
    if (!assigningMealSet) return;
    addMealSetToSlot(targetDay, targetSlot, assigningMealSet);
    setAssigningMealSet(null);
  };

  const isMobile = viewMode === 'mobile';

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-7 rounded-3xl glass-card border border-[#EBE5DC] dark:border-[#252220] bg-gradient-to-r from-amber-950/10 via-stone-50 to-stone-100 dark:from-[#1C1A18] dark:via-amber-950/25 dark:to-[#1C1A18] relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/25 dark:border-amber-500/30 text-xs font-bold mb-3">
          <Utensils className="w-3.5 h-3.5" />
          <span>Văn Hóa Ẩm Thực Việt</span>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Bộ Mâm Cơm Gia Đình Tròn Vị (3 Món)
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl leading-relaxed">
          Người Việt không chỉ ăn 1 món duy nhất. Mỗi mâm cơm gia đình là sự kết hợp hoàn hảo giữa <strong className="text-amber-700 dark:text-amber-400 font-extrabold">Món Mặn + Canh Thanh Mát + Rau Xào Giòn</strong> cùng nước chấm chuẩn vị.
        </p>

        {/* Diacritic-Insensitive Search Bar */}
        <div className="relative mt-4 max-w-xl">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên mâm, món mặn, canh, rau..."
            className="w-full pl-10 pr-9 py-2 rounded-2xl bg-white dark:bg-[#1C1A18] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 text-xs font-medium border border-[#EBE5DC] dark:border-[#292524] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/20 dark:hover:bg-white/30 text-stone-600 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'all', label: 'Tất Cả Mâm Cơm' },
            { id: 'bac', label: 'Miền Bắc' },
            { id: 'nam', label: 'Miền Nam' },
            { id: 'trung', label: 'Miền Trung' },
            { id: 'chay', label: 'Mâm Cơm Chay' },
            { id: 'western', label: 'Món Âu' }
          ].map(tab => {
            const active = regionFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRegionFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 whitespace-nowrap ${
                  active
                    ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 font-black'
                    : 'bg-white dark:bg-[#1C1A18] text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#252220] border border-[#EBE5DC] dark:border-[#292524] shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tag Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mr-1 shrink-0 whitespace-nowrap">
            <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Chủ đề:
          </span>
          {POPULAR_TAGS.map(tag => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                    : 'bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 shadow-sm'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 3-Dish Meal Sets */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSets.map(set => {
          return (
            <div 
              key={set.id}
              className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-emerald-500/40 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner Header */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <SafeImage 
                    src={set.imageUrl} 
                    alt={set.title} 
                    fallbackTitle={set.title}
                    category="Mâm Cơm"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Region badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-400 text-xs font-bold">
                    {set.region === 'bac' && 'Mâm Cơm Miền Bắc'}
                    {set.region === 'nam' && 'Mâm Cơm Miền Nam'}
                    {set.region === 'trung' && 'Mâm Cơm Miền Trung'}
                    {set.region === 'chay' && 'Mâm Cơm Chay'}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {set.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-semibold">
                      <span className="text-emerald-400 font-bold">{set.totalCostVnd.toLocaleString('vi-VN')} đ / mâm</span>
                      <span>•</span>
                      <span>{set.totalCalories} kcal</span>
                    </div>
                  </div>
                </div>

                  {/* Tags badge list */}
                  {set.tags && set.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-4 sm:px-5 pt-3">
                      {set.tags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors shrink-0 whitespace-nowrap ${
                            selectedTag === tag
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-500 dark:hover:text-emerald-400'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                {/* 3-Dish Architecture List */}
                <div className="p-4 sm:p-5 space-y-3 pt-2">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {set.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                      CẤU TRÚC 3 MÓN KẾT HỢP HÀI HÒA:
                    </span>

                    {/* Món Mặn */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-[72px] py-1 rounded-md bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold shrink-0 whitespace-nowrap inline-flex items-center justify-center text-center tracking-wide">
                          MÓN MẶN
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white break-words leading-tight" title={set.mainDish.title}>
                          {cleanDishTitle(set.mainDish.title)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium shrink-0 whitespace-nowrap min-w-[64px] text-right tabular-nums">
                        {set.mainDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {/* Món Canh */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-[72px] py-1 rounded-md bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-[10px] font-extrabold shrink-0 whitespace-nowrap inline-flex items-center justify-center text-center tracking-wide">
                          MÓN CANH
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white break-words leading-tight" title={set.soupDish.title}>
                          {cleanDishTitle(set.soupDish.title)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium shrink-0 whitespace-nowrap min-w-[64px] text-right tabular-nums">
                        {set.soupDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {/* Món Rau */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-[72px] py-1 rounded-md bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold shrink-0 whitespace-nowrap inline-flex items-center justify-center text-center tracking-wide">
                          MÓN RAU
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white break-words leading-tight" title={set.sideDish.title}>
                          {cleanDishTitle(set.sideDish.title)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium shrink-0 whitespace-nowrap min-w-[64px] text-right tabular-nums">
                        {set.sideDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {/* Condiment note */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span><strong>Nước Chấm & Đồ Kèm:</strong> {set.condimentNote}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-4 sm:p-5 pt-0 flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMealSet(set)}
                  className="flex-1 py-2.5 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] sm:text-xs transition-colors text-center border border-slate-200 dark:border-transparent leading-tight flex items-center justify-center"
                >
                  <span>Xem Chi Tiết Mâm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssigningMealSet(set)}
                  className="flex-1 py-2.5 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-[11px] sm:text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 leading-tight"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Chọn Mâm Này</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State for Search or Tag Filters */}
      {filteredSets.length === 0 && (
        <div className="p-8 text-center glass-card rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Utensils className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy mâm cơm phù hợp
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Không có kết quả nào cho từ khóa &quot;{searchQuery}&quot; với bộ lọc đã chọn.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('Tất Cả');
              setRegionFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* NATIVE MOBILE BOTTOM SHEET TO ASSIGN MEAL SET TO WEEKLY SLOT */}
      {assigningMealSet && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
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
            {/* Swipe handle bar & Drag Zone */}
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
              className="w-full py-2 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center touch-none select-none -mt-2 mb-1"
            >
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 select-none gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 min-w-0 flex-1 truncate">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Xếp Mâm Cơm Vào Thực Đơn</span>
              </h3>
              <button 
                onClick={() => setAssigningMealSet(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Gán <strong className="text-emerald-600 dark:text-emerald-400">{assigningMealSet.title}</strong> vào ngày trong tuần để tự động gom nguyên liệu đi chợ.
            </p>

            {/* Day Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn Ngày Trong Tuần:</label>
              <select
                value={targetDay}
                onChange={e => setTargetDay(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn Bữa Ăn:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetSlot('breakfast')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'breakfast'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'border-[#EBE5DC] dark:border-[#292524] bg-stone-50 dark:bg-[#1C1A18] text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-sm">☀️</span>
                  <span>Bữa Sáng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetSlot('lunch')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'lunch'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'border-[#EBE5DC] dark:border-[#292524] bg-stone-50 dark:bg-[#1C1A18] text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-sm">🌤️</span>
                  <span>Bữa Trưa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetSlot('dinner')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    targetSlot === 'dinner'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'border-[#EBE5DC] dark:border-[#292524] bg-stone-50 dark:bg-[#1C1A18] text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-sm">🌙</span>
                  <span>Bữa Tối</span>
                </button>
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setAssigningMealSet(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#292524] dark:hover:bg-[#34302C] text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleApplySet}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
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
