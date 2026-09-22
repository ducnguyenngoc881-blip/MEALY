import React, { useState, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { X, Sparkles, Utensils, DollarSign, Flame, ChevronRight, Calendar, PlusCircle, Check } from 'lucide-react';
import { MealSlot } from '../types';
import { SafeImage } from './SafeImage';

export const MealSetDetailModal: React.FC = () => {
  const { 
    selectedMealSet, 
    setSelectedMealSet, 
    setSelectedRecipe, 
    setActiveTab,
    weeklyPlan,
    addMealSetToSlot 
  } = useMealWise();

  const [dragY, setDragY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  // Quick slot assignment inside modal
  const [showAssignPanel, setShowAssignPanel] = useState<boolean>(false);
  const [assignDay, setAssignDay] = useState<string>('mon');
  const [assignSlot, setAssignSlot] = useState<MealSlot>('lunch');

  if (!selectedMealSet) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    setDragY(Math.max(0, diff));
  };

  const handleTouchEnd = () => {
    if (dragY > 75) {
      setSelectedMealSet(null);
    }
    setDragY(0);
    touchStartY.current = null;
  };

  const handleConfirmAssign = () => {
    addMealSetToSlot(assignDay, assignSlot, selectedMealSet.id);
    setShowAssignPanel(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedMealSet(null)}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up border-t border-slate-200 dark:border-slate-800 relative overflow-hidden"
      >
        {/* Swipe Handle Bar & Drag Zone */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-3 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Top Header Bar with Close Button */}
        <div className="px-4 pb-2 flex items-center justify-between shrink-0 select-none gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate min-w-0 flex-1">
            {selectedMealSet.region === 'bac' ? 'Mâm Cơm Miền Bắc'
              : selectedMealSet.region === 'nam' ? 'Mâm Cơm Miền Nam'
              : selectedMealSet.region === 'trung' ? 'Mâm Cơm Miền Trung'
              : selectedMealSet.region === 'chay' ? 'Mâm Cơm Chay Thanh Tịnh'
              : 'Mâm Cơm Gia Đình 3 Món'}
          </span>
          <button
            onClick={() => setSelectedMealSet(null)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-4">
          
          {/* Hero Image & Title */}
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-md shrink-0">
            <SafeImage 
              src={selectedMealSet.imageUrl} 
              alt={selectedMealSet.title} 
              fallbackTitle={selectedMealSet.title}
              category="Mâm Cơm"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute bottom-3 left-4 right-4">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold mb-1 inline-block">
                Mâm 3 Món Gia Đình
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                {selectedMealSet.title}
              </h2>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Tổng chi phí 3 món:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm whitespace-nowrap">
              {selectedMealSet.totalCostVnd.toLocaleString('vi-VN')} đ • {selectedMealSet.totalCalories} kcal
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedMealSet.description}
          </p>

          {/* 3 Dishes List (Clickable to view detail) */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Chi Tiết 3 Món Trong Mâm Cơm</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Chạm để xem công thức</span>
            </h3>

            {/* Món Mặn */}
            <div 
              onClick={() => {
                setSelectedRecipe(selectedMealSet.mainDish);
              }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-black shrink-0 whitespace-nowrap">
                    MÓN MẶN
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate" title={selectedMealSet.mainDish.title}>
                    {selectedMealSet.mainDish.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1 truncate">
                  {selectedMealSet.mainDish.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {selectedMealSet.mainDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Món Canh */}
            <div 
              onClick={() => {
                setSelectedRecipe(selectedMealSet.soupDish);
              }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px] font-black shrink-0 whitespace-nowrap">
                    MÓN CANH
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate" title={selectedMealSet.soupDish.title}>
                    {selectedMealSet.soupDish.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1 truncate">
                  {selectedMealSet.soupDish.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {selectedMealSet.soupDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Món Rau */}
            <div 
              onClick={() => {
                setSelectedRecipe(selectedMealSet.sideDish);
              }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[52px]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black shrink-0 whitespace-nowrap">
                    MÓN RAU
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate" title={selectedMealSet.sideDish.title}>
                    {selectedMealSet.sideDish.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1 truncate">
                  {selectedMealSet.sideDish.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {selectedMealSet.sideDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* Condiment Note */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs space-y-0.5">
            <span className="font-extrabold uppercase block text-[10px] tracking-wider text-amber-700 dark:text-amber-400">
              ĐỒ KÈM CHUẨN VỊ:
            </span>
            <p className="font-semibold">{selectedMealSet.condimentNote}</p>
          </div>

          {/* Consolidated 3-Course Ingredient Checklist */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Nguyên Liệu Cả Mâm (Gom 3 Món)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {(selectedMealSet.mainDish.ingredients.length + selectedMealSet.soupDish.ingredients.length + selectedMealSet.sideDish.ingredients.length)} món đi chợ
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {[
                ...selectedMealSet.mainDish.ingredients.map(i => ({ ...i, course: 'Mặn' })),
                ...selectedMealSet.soupDish.ingredients.map(i => ({ ...i, course: 'Canh' })),
                ...selectedMealSet.sideDish.ingredients.map(i => ({ ...i, course: 'Rau' }))
              ].map((ing, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs min-h-[36px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                      {ing.course}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={ing.name}>
                      {ing.name}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] shrink-0 whitespace-nowrap">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Slot Assignment Subpanel */}
          {showAssignPanel ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Chọn Ngày & Bữa Ăn:
                </span>
                <button
                  onClick={() => setShowAssignPanel(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Thu gọn
                </button>
              </div>

              {/* Day Selector */}
              <select
                value={assignDay}
                onChange={e => setAssignDay(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {weeklyPlan.map(d => (
                  <option key={d.dayId} value={d.dayId}>{d.dayName}</option>
                ))}
              </select>

              {/* Slot Selector: 3 options */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'breakfast', label: '☀️ Sáng' },
                  { id: 'lunch', label: '🌤️ Trưa' },
                  { id: 'dinner', label: '🌙 Tối' }
                ].map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setAssignSlot(slot.id as MealSlot)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      assignSlot === slot.id
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirmAssign}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xác Nhận Xếp Vào {weeklyPlan.find(d => d.dayId === assignDay)?.dayName}</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 items-stretch">
              <button
                type="button"
                onClick={() => setShowAssignPanel(true)}
                className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-[11.5px] sm:text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all leading-tight"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Thêm Vào Thực Đơn</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMealSet(null);
                  setActiveTab('weekly');
                }}
                className="py-3 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Xem Tuần</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
