import React, { useState } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { BookOpen, Search, Filter, Clock, Flame, Utensils, ChevronRight, X, MapPin, Tag } from 'lucide-react';
import { MealCategory, Region } from '../types';
import { matchesRecipeSearch } from '../utils/textUtils';
import { SafeImage } from './SafeImage';

export const RecipeCatalog: React.FC = () => {
  const { recipes, setSelectedRecipe, viewMode } = useMealWise();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = matchesRecipeSearch(recipe, searchQuery);
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || recipe.region === selectedRegion;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const isMobile = viewMode === 'mobile';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedRegion !== 'all';

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
          <span>Sổ Tay Công Thức Món Việt</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
          Khám Phá Món Ăn Truyền Thống
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Tuyển tập công thức chuẩn vị 3 miền từ thịt rang cháy cạnh, canh cua đồng tới thịt kho tàu.
        </p>

        {/* Search bar */}
        <div className="mt-4 relative max-w-lg">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên món, nguyên liệu, tag (thịt rang, cua đồng, cay...)..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 min-h-[44px] rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-stone-400 shadow-2xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-white flex items-center justify-center transition-colors cursor-pointer min-h-[32px] min-w-[32px]"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Container */}
      <div className="space-y-3">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Tất Cả Món' },
            { id: 'mon-man', label: 'Món Mặn' },
            { id: 'mon-canh', label: 'Món Canh' },
            { id: 'mon-rau', label: 'Món Rau' },
            { id: 'mon-chay', label: 'Món Chay' },
            { id: 'an-sang', label: 'Ăn Sáng' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs font-black'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white font-semibold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mr-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>Vùng Miền:</span>
          </div>
          {[
            { id: 'all', label: 'Tất Cả Miền' },
            { id: 'bac', label: 'Miền Bắc' },
            { id: 'trung', label: 'Miền Trung' },
            { id: 'nam', label: 'Miền Nam' },
            { id: 'toan-quoc', label: 'Toàn Quốc' }
          ].map(reg => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRegion === reg.id
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-2xs font-black'
                  : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

      </div>

      {/* Result Count and Reset Action */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 px-1">
        <span>
          Tìm thấy <strong className="text-stone-900 dark:text-white font-black">{filteredRecipes.length}</strong> món ngon phù hợp
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-stone-900 dark:text-white hover:underline font-bold shrink-0 cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Utensils className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Không tìm thấy món ăn phù hợp
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Thử tìm kiếm không dấu (ví dụ: &quot;thit rang&quot;, &quot;canh rau&quot;) hoặc đặt lại tiêu chí lọc vùng miền/thể loại.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Xem tất cả công thức
          </button>
        </div>
      ) : (
        /* Recipe Grid (responsive 1 -> 2 -> 3 columns) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <SafeImage 
                    src={recipe.imageUrl} 
                    alt={recipe.title} 
                    fallbackTitle={recipe.title}
                    category={recipe.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-stone-900/90 text-white text-[10px] font-bold border border-stone-700">
                    {recipe.region === 'bac' ? 'Miền Bắc' : recipe.region === 'nam' ? 'Miền Nam' : recipe.region === 'trung' ? 'Miền Trung' : 'Toàn Quốc'}
                  </span>

                  {recipe.calories && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-stone-900/90 text-stone-200 text-[10px] font-bold border border-stone-700 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {recipe.calories} kcal
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 mt-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
                <span className="text-stone-900 dark:text-white font-extrabold">{recipe.estimatedCostVnd.toLocaleString('vi-VN')} đ</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {recipe.cookTimeMinutes} phút
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

