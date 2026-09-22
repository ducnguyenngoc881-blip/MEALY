import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  ChefHat, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShoppingCart, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Info,
  RotateCcw
} from 'lucide-react';
import { useMealWise } from '../context/MealWiseContext';
import { PantryItem, Recipe } from '../types';
import { SafeImage } from './SafeImage';
import { 
  findLeftoverRecipeSuggestions, 
  findWholeFridgeRecipeSuggestions 
} from '../utils/fridgeMatcher';

const QUICK_LEFTOVER_SUGGESTIONS = [
  { name: 'Cơm nguội bữa trước', category: 'Đồ ăn thừa', qty: '1 tô to', days: 1, isLeftover: true, note: 'Chiên cơm rang dưa bò, cơm chiên trứng hoặc cơm rang kim chi' },
  { name: 'Thịt kho tàu thừa', category: 'Đồ ăn thừa', qty: '250 g', days: 2, isLeftover: true, note: 'Hâm nóng ăn với dưa cải chua hoặc kho thêm trứng' },
  { name: 'Thịt gà luộc thừa', category: 'Đồ ăn thừa', qty: '300 g', days: 1, isLeftover: true, note: 'Xé phay làm gỏi bắp cải hoặc nấu cháo gà nấm thơm lừng' },
  { name: 'Thịt heo luộc thừa', category: 'Đồ ăn thừa', qty: '200 g', days: 1, isLeftover: true, note: 'Thái mỏng cuốn bánh tráng hoặc rang sả ớt giòn cay' },
  { name: 'Canh rau thừa', category: 'Đồ ăn thừa', qty: '1 bát', days: 1, isLeftover: true, note: 'Nên đun sôi lại kỹ trước khi dùng' },
  { name: 'Trứng gà ta', category: 'Trứng & Đậu', qty: '4 quả', days: 5, isLeftover: false, note: 'Ngăn mát cánh tủ - chiên trứng thịt băm hoặc cuộn hành' },
  { name: 'Cà chua chín', category: 'Rau củ quả', qty: '3 quả', days: 3, isLeftover: false, note: 'Làm sốt cà chua đậu hũ hoặc nấu canh trứng' },
  { name: 'Hành lá & Rau thơm', category: 'Rau củ quả', qty: '1 bó nhỏ', days: 2, isLeftover: false, note: 'Gia vị nêm nếm các món canh và xào' },
  { name: 'Đậu phụ sống', category: 'Trứng & Đậu', qty: '2 bìa', days: 1, isLeftover: false, note: 'Rán lướt ván giòn tan hoặc sốt cà chua' },
  { name: 'Bắp cải / Cà rốt', category: 'Rau củ quả', qty: '1/2 bắp', days: 4, isLeftover: false, note: 'Luộc chấm trứng hoặc xào thịt bò giòn ngọt' }
];

const CATEGORIES = [
  'Đồ ăn thừa',
  'Thịt / Hải sản',
  'Rau củ quả',
  'Trứng & Đậu',
  'Đồ khô & Gia vị',
  'Đồ uống',
  'Khác'
];

export const FridgeView: React.FC = () => {
  const { 
    pantryItems, 
    addPantryItem, 
    removePantryItem, 
    clearPantryItems, 
    recipes, 
    setSelectedRecipe, 
    setActiveTab, 
    showToast,
    openConfirmModal
  } = useMealWise();

  const [activeFilter, setActiveFilter] = useState<'all' | 'leftovers' | 'warning' | 'fresh'>('all');
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<PantryItem | null>(null);
  const [singleItemReloadOffset, setSingleItemReloadOffset] = useState<number>(0);
  const [isReloadingItem, setIsReloadingItem] = useState<boolean>(false);

  // Whole Fridge Suggestions state
  const [isWholeFridgeExpanded, setIsWholeFridgeExpanded] = useState<boolean>(true);
  const [wholeFridgeReloadOffset, setWholeFridgeReloadOffset] = useState<number>(0);
  const [isReloadingWholeFridge, setIsReloadingWholeFridge] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Đồ ăn thừa');
  const [quantity, setQuantity] = useState('1 phần');
  const [daysLeft, setDaysLeft] = useState<number>(2);
  const [isLeftover, setIsLeftover] = useState(true);
  const [notes, setNotes] = useState('');
  const [discountVnd, setDiscountVnd] = useState<number>(20000);

  // Filtered & computed lists
  const leftoversList = pantryItems.filter(i => i.isLeftover || i.category === 'Đồ ăn thừa');
  const urgentList = pantryItems.filter(i => i.daysLeft <= 2);
  const freshList = pantryItems.filter(i => i.daysLeft > 2 && !i.isLeftover && i.category !== 'Đồ ăn thừa');
  const totalPotentialSavings = pantryItems.reduce((acc, curr) => acc + (curr.discountOpportunityVnd || 15000), 0);

  const displayedItems = pantryItems.filter(item => {
    if (activeFilter === 'leftovers' && !(item.isLeftover || item.category === 'Đồ ăn thừa')) return false;
    if (activeFilter === 'warning' && item.daysLeft > 2) return false;
    if (activeFilter === 'fresh' && (item.daysLeft <= 2 || item.isLeftover || item.category === 'Đồ ăn thừa')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchNote = (item.notes || '').toLowerCase().includes(q);
      return matchName || matchCat || matchNote;
    }
    return true;
  });

  const handleApplySuggestion = (sug: typeof QUICK_LEFTOVER_SUGGESTIONS[0]) => {
    setName(sug.name);
    setCategory(sug.category);
    setQuantity(sug.qty);
    setDaysLeft(sug.days);
    setIsLeftover(sug.isLeftover);
    setNotes(sug.note);
    setIsAddingOpen(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const status: PantryItem['status'] = daysLeft <= 1 ? 'warning' : daysLeft <= 2 ? 'warning' : 'fresh';

    addPantryItem({
      name: name.trim(),
      category,
      quantity: quantity.trim() || '1 phần',
      daysLeft,
      status,
      discountOpportunityVnd: discountVnd,
      isLeftover,
      notes: notes.trim(),
      addedAt: new Date().toLocaleDateString('vi-VN')
    });

    setName('');
    setQuantity('1 phần');
    setDaysLeft(2);
    setNotes('');
    setIsAddingOpen(false);
  };

  const handleSelectItemForRecipe = (item: PantryItem) => {
    setSingleItemReloadOffset(0);
    setSelectedItemForRecipe(item);
  };

  const handleReloadItemSuggestions = () => {
    setIsReloadingItem(true);
    setSingleItemReloadOffset(prev => prev + 4);
    setTimeout(() => {
      setIsReloadingItem(false);
      showToast('Đã đổi sang 4 món gợi ý mới!');
    }, 250);
  };

  const handleReloadWholeFridgeSuggestions = () => {
    setIsReloadingWholeFridge(true);
    setWholeFridgeReloadOffset(prev => prev + 4);
    setTimeout(() => {
      setIsReloadingWholeFridge(false);
      showToast('Đã đổi sang 4 món mới từ cả tủ lạnh!');
    }, 250);
  };

  // Whole-fridge multi-ingredient suggestion
  const wholeFridgeData = findWholeFridgeRecipeSuggestions(pantryItems, recipes, 4, wholeFridgeReloadOffset);

  // Single-item suggestion with synergy and reload offset
  const suggestedRecipes: Recipe[] = selectedItemForRecipe 
    ? findLeftoverRecipeSuggestions(selectedItemForRecipe, recipes, 4, singleItemReloadOffset, pantryItems)
    : [];

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="p-3 sm:p-4 rounded-3xl glass-card border border-cyan-500/20 dark:border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-slate-50 to-blue-500/10 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/40 space-y-2.5 sm:space-y-3 shadow-sm">
        {/* Responsive Header Action Row: flex-wrap with gap-y-2 guarantees zero collision and zero overflow */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-1.5 sm:gap-2">
          {/* Status Counter Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25 dark:border-cyan-500/30 text-[10.5px] sm:text-[11px] font-bold shrink-0">
            <span className="text-xs sm:text-sm shrink-0">🧊</span>
            <span className="hidden sm:inline whitespace-nowrap">Tủ Lạnh & Đồ Thừa</span>
            <span className="sm:hidden whitespace-nowrap">Tủ Lạnh</span>
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-900 dark:text-cyan-200 text-[10px] font-black shrink-0">
              {pantryItems.length}
            </span>
          </div>

          {/* Action Buttons: Đối Chiếu Đi Chợ and Dọn Sạch */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('grocery')}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10.5px] sm:text-[11px] font-black transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              title="Chuyển sang danh sách đi chợ để đối chiếu nguyên liệu"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span>Đối Chiếu</span>
              <span className="hidden sm:inline">&nbsp;Đi Chợ</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </button>

            {pantryItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  openConfirmModal({
                    title: 'Dọn Sạch Tủ Lạnh',
                    message: 'Bạn có chắc chắn muốn dọn sạch toàn bộ thực phẩm và đồ ăn thừa trong tủ lạnh?',
                    confirmLabel: 'Dọn sạch',
                    cancelLabel: 'Giữ lại',
                    isDanger: true,
                    onConfirm: () => {
                      clearPantryItems();
                      showToast('🧹 Đã dọn sạch thực phẩm trong tủ lạnh!');
                    }
                  });
                }}
                className="p-1 sm:p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-white/10 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shrink-0"
                title="Dọn sạch tủ lạnh"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-0.5">
          <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug text-balance">
            <span>Tủ Lạnh & Đồ Ăn Thừa </span>
            <span className="inline-block whitespace-nowrap text-cyan-600 dark:text-cyan-400">Thông Minh</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
            Quản lý thức ăn thừa bữa trước, theo dõi hạn dùng và tận dụng nguyên liệu sẵn có để trừ bớt tiền đi chợ.
          </p>
        </div>

        {/* 4 Summary Metric Cards: 2x2 on mobile, 4 cols on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 shadow-xs min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
              <span className="shrink-0 text-[11px]">🧊</span>
              <span className="truncate">Trong Tủ Lạnh</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-cyan-700 dark:text-cyan-300 block mt-0.5 truncate">
              {pantryItems.length} món
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-500/30 shadow-xs min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 min-w-0">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">Ăn Gấp ≤ 2 Ngày</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5 truncate">
              {urgentList.length} món
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-purple-500/30 shadow-xs min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 min-w-0">
              <span className="shrink-0 text-[11px]">🍲</span>
              <span className="truncate">Đồ Ăn Thừa</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-purple-600 dark:text-purple-300 block mt-0.5 truncate">
              {leftoversList.length} món
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-emerald-500/30 shadow-xs min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 min-w-0">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">Tiết Kiệm Đi Chợ</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400 block mt-0.5 truncate">
              ~{(totalPotentialSavings / 1000).toFixed(0)}k đ
            </span>
          </div>
        </div>
      </div>

      {/* Whole-Fridge Multi-Ingredient Suggestions Section */}
      {pantryItems.length > 0 && (
        <div className="p-3 sm:p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-md space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                  <span className="truncate">Gợi Ý Nấu Từ Cả Tủ Lạnh</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                    {wholeFridgeData.totalEligible} món có thể nấu
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                  Đối chiếu toàn bộ {pantryItems.length} thực phẩm sẵn có trong tủ với hơn 700 công thức
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReloadWholeFridgeSuggestions}
                disabled={wholeFridgeData.totalEligible <= 1}
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Đổi sang các món khác từ kho hơn 700 món"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isReloadingWholeFridge ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Đổi Món Khác</span>
                <span className="sm:hidden">Đổi Món</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWholeFridgeExpanded(prev => !prev)}
                className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                title={isWholeFridgeExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isWholeFridgeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isWholeFridgeExpanded && (
            <>
              {wholeFridgeData.results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {wholeFridgeData.results.map((res, idx) => (
                    <div 
                      key={res.recipe.id + idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-500/30 shadow-xs flex flex-col justify-between gap-2.5 hover:border-emerald-500/60 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SafeImage
                          src={res.recipe.imageUrl}
                          alt={res.recipe.title}
                          dishTitle={res.recipe.title}
                          category={res.recipe.category}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {res.recipe.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {res.recipe.cookTimeMinutes} phút • {res.recipe.calories} kcal
                          </p>
                          <div className="mt-1 flex items-center gap-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 truncate max-w-full">
                              <span>✨</span>
                              <span className="truncate">{res.summary}</span>
                            </span>
                            {res.urgentMatchedCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                <span>⚠️ Ăn gấp</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRecipe(res.recipe)}
                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer text-center"
                      >
                        Xem Công Thức
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
                  Chưa tìm thấy công thức kết hợp trực tiếp. Hãy thử thêm nguyên liệu vào tủ lạnh!
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Quick Suggestions Chips */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <span>💡</span> Gợi Ý Nhanh Món Thừa Phổ Biến (Bấm 1 chạm để điền):
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Tiết kiệm thời gian gõ
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_LEFTOVER_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySuggestion(sug)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-cyan-500/15 text-slate-700 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
            >
              <span>{sug.isLeftover ? '🍲' : '🥬'}</span>
              <span>{sug.name}</span>
              <span className="text-[10px] text-slate-400">({sug.qty})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Item Form (Collapsible Card) */}
      <div className="rounded-3xl border border-cyan-500/30 bg-cyan-50/60 dark:bg-cyan-950/20 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsAddingOpen(prev => !prev)}
          className="w-full px-4 py-3 sm:py-3.5 flex items-center justify-between text-left font-black text-cyan-900 dark:text-cyan-200 text-xs sm:text-sm hover:bg-cyan-500/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-4 h-4 font-bold" />
            </div>
            <div>
              <span className="block font-black">Thêm Món Thừa / Nguyên Liệu Mới Vào Tủ Lạnh</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Tự động đánh dấu "Có sẵn" trong danh sách đi chợ
              </span>
            </div>
          </div>
          {isAddingOpen ? <ChevronUp className="w-4 h-4 text-cyan-600" /> : <ChevronDown className="w-4 h-4 text-cyan-600" />}
        </button>

        {isAddingOpen && (
          <form onSubmit={handleSaveItem} className="p-4 pt-1 space-y-3.5 border-t border-cyan-500/20 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Tên món / Thực phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="VD: Cơm nguội, Thịt luộc thừa, Nửa bắp cải..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Số lượng ước lượng
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="VD: 1 tô to, 300g, 2 quả, 1 đĩa..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Phân loại
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Hạn dùng còn lại:</span>
                  <span className={`font-black ${daysLeft <= 1 ? 'text-rose-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {daysLeft} ngày
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={daysLeft}
                    onChange={e => setDaysLeft(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Ước tính tiết kiệm đi chợ (đ)
                </label>
                <input
                  type="number"
                  step={5000}
                  min={0}
                  value={discountVnd}
                  onChange={e => setDiscountVnd(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLeftover}
                  onChange={e => setIsLeftover(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  🍲 Đây là thức ăn thừa bữa trước (cần ưu tiên nấu lại)
                </span>
              </label>

              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ghi chú bảo quản / gợi ý nấu..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-md shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
              >
                Lưu Vào Tủ Lạnh
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất Cả ({pantryItems.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('leftovers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'leftovers'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              🍲 Đồ Ăn Thừa ({leftoversList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('warning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'warning'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ⏰ Ăn Gấp ≤ 2 Ngày ({urgentList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('fresh')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'fresh'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              🥬 Tươi Mới ({freshList.length})
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trong tủ..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Active Leftover Recipe Suggestions Section */}
      {selectedItemForRecipe && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-2 border-indigo-500/40 shadow-lg space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wide truncate">
                  Gợi Ý Món Nấu Tận Dụng: "{selectedItemForRecipe.name}"
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                  Các công thức chuẩn vị Việt từ kho hơn 700 món ăn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleReloadItemSuggestions}
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                title="Đổi sang 4 món gợi ý khác từ kho hơn 700 món"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isReloadingItem ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Đổi Món Khác</span>
                <span className="sm:hidden">Đổi Món</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedItemForRecipe(null)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>

          {suggestedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestedRecipes.map(recipe => (
                <div 
                  key={recipe.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SafeImage
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      dishTitle={recipe.title}
                      category={recipe.category}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {recipe.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {recipe.cookTimeMinutes} phút • {recipe.calories} kcal
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipe(recipe);
                    }}
                    className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-[11px] font-extrabold shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Xem Công Thức
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
              Chưa có công thức trực tiếp tương thích. Bạn có thể dùng nguyên liệu này để chiên, xào, nấu canh hoặc làm món phụ!
            </div>
          )}
        </div>
      )}

      {/* Main Items Grid / List */}
      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedItems.map(item => {
            const isUrgent = item.daysLeft <= 2;
            const isEmergency = item.daysLeft <= 1;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-850 border shadow-xs transition-all hover:shadow-md space-y-3 ${
                  isEmergency 
                    ? 'border-rose-500/50 bg-rose-500/[0.03]' 
                    : isUrgent 
                    ? 'border-amber-500/40 bg-amber-500/[0.02]' 
                    : 'border-slate-200/90 dark:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      item.isLeftover 
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' 
                        : isEmergency 
                        ? 'bg-rose-500/15 text-rose-600' 
                        : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                    }`}>
                      {item.isLeftover ? '🍲' : item.category === 'Thịt / Hải sản' ? '🥩' : item.category === 'Rau củ quả' ? '🥬' : '🧊'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        {item.isLeftover && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300 text-[10px] font-black border border-purple-500/30">
                            Đồ ăn thừa
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Số lượng: <strong className="text-slate-800 dark:text-slate-200">{item.quantity}</strong> • {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                      isEmergency
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse'
                        : isUrgent
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isEmergency ? <AlertTriangle className="w-3 h-3 text-rose-500" /> : <Clock className="w-3 h-3" />}
                      <span>Còn {item.daysLeft} ngày</span>
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item.notes}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-y-2 gap-x-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>Tiết kiệm: ~{(item.discountOpportunityVnd || 15000).toLocaleString('vi-VN')} đ</span>
                  </span>

                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectItemForRecipe(item);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className="px-2 sm:px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 text-[10.5px] sm:text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Gợi ý món ăn có thể nấu từ nguyên liệu này"
                    >
                      <ChefHat className="w-3 h-3 shrink-0" />
                      <span>Nấu Món<span className="hidden sm:inline">&nbsp;Này</span></span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        removePantryItem(item.id);
                        showToast(`✓ Đã dùng hết món "${item.name}"!`);
                      }}
                      className="p-1 sm:p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-white/10 dark:hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
                      title="Đã dùng hết (xóa khỏi tủ)"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removePantryItem(item.id)}
                      className="p-1 sm:p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-white/10 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shrink-0"
                      title="Xóa khỏi tủ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-3xl mx-auto">
            🧊
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {searchQuery ? 'Không tìm thấy thực phẩm phù hợp' : 'Tủ Lạnh Chưa Có Món Nào'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm tab Tất Cả để xem danh sách đầy đủ.' 
                : 'Thêm thức ăn thừa hoặc nguyên liệu đang có trong nhà để MealWise tự động trừ khỏi danh sách đi chợ!'}
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsAddingOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              + Nhập Món Đầu Tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
};
