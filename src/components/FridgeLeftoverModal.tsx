import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  ChefHat, 
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { useMealWise } from '../context/MealWiseContext';
import { PantryItem } from '../types';
import { 
  findLeftoverRecipeSuggestions,
  matchRecipeWithPantryItem,
  isCondiment
} from '../utils/fridgeMatcher';

interface FridgeLeftoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_LEFTOVER_SUGGESTIONS = [
  { name: 'Cơm nguội bữa trước', category: 'Đồ ăn thừa', qty: '1 tô to', days: 1, isLeftover: true, note: 'Chiên cơm rang trứng dưa bò hoặc cơm rang kim chi' },
  { name: 'Thịt kho tàu thừa', category: 'Đồ ăn thừa', qty: '250 g', days: 2, isLeftover: true, note: 'Hâm nóng ăn với dưa cải chua hoặc kho thêm trứng' },
  { name: 'Thịt gà luộc thừa', category: 'Đồ ăn thừa', qty: '300 g', days: 1, isLeftover: true, note: 'Xé phay làm gỏi bắp cải hoặc nấu cháo gà nấm' },
  { name: 'Thịt heo luộc thừa', category: 'Đồ ăn thừa', qty: '200 g', days: 1, isLeftover: true, note: 'Thái mỏng cuốn bánh tráng hoặc rang sả ớt' },
  { name: 'Canh rau thừa', category: 'Đồ ăn thừa', qty: '1 bát', days: 1, isLeftover: true, note: 'Nên đun sôi lại trước khi dùng' },
  { name: 'Trứng gà ta', category: 'Trứng & Đậu', qty: '4 quả', days: 4, isLeftover: false, note: 'Ngăn mát cánh tủ' },
  { name: 'Cà chua chín', category: 'Rau củ quả', qty: '3 quả', days: 3, isLeftover: false, note: 'Làm sốt cà chua hoặc nấu canh trứng' },
  { name: 'Hành lá & Rau thơm', category: 'Rau củ quả', qty: '1 bó nhỏ', days: 2, isLeftover: false, note: 'Gia vị nêm nếm các món canh' },
  { name: 'Đậu phụ sống', category: 'Trứng & Đậu', qty: '2 bìa', days: 1, isLeftover: false, note: 'Rán lướt ván hoặc sốt cà chua' }
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

export const FridgeLeftoverModal: React.FC<FridgeLeftoverModalProps> = ({ isOpen, onClose }) => {
  const { pantryItems, addPantryItem, removePantryItem, clearPantryItems, recipes, openConfirmModal, showToast } = useMealWise();

  const [activeFilter, setActiveFilter] = useState<'all' | 'leftovers' | 'warning' | 'fresh'>('all');
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<PantryItem | null>(null);
  const [modalReloadOffset, setModalReloadOffset] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Đồ ăn thừa');
  const [quantity, setQuantity] = useState('1 phần');
  const [daysLeft, setDaysLeft] = useState<number>(2);
  const [isLeftover, setIsLeftover] = useState(true);
  const [notes, setNotes] = useState('');
  const [discountVnd, setDiscountVnd] = useState<number>(20000);

  if (!isOpen) return null;

  // Calculations
  const leftoversList = pantryItems.filter(i => i.isLeftover || i.category === 'Đồ ăn thừa');
  const urgentList = pantryItems.filter(i => i.daysLeft <= 2);
  const totalPotentialSavings = pantryItems.reduce((acc, curr) => acc + (curr.discountOpportunityVnd || 15000), 0);

  // Filtered List
  const displayedItems = pantryItems.filter(item => {
    if (activeFilter === 'leftovers') return item.isLeftover || item.category === 'Đồ ăn thừa';
    if (activeFilter === 'warning') return item.daysLeft <= 2;
    if (activeFilter === 'fresh') return item.daysLeft > 2;
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

    // Reset Form
    setName('');
    setQuantity('1 phần');
    setDaysLeft(2);
    setNotes('');
    setIsAddingOpen(false);
  };

  // Find recipes that can use this ingredient
  const suggestedRecipes = selectedItemForRecipe 
    ? findLeftoverRecipeSuggestions(selectedItemForRecipe, recipes, 4, modalReloadOffset, pantryItems)
    : [];

  const modalTotalEligible = useMemo(() => {
    if (!selectedItemForRecipe) return 0;
    return findLeftoverRecipeSuggestions(selectedItemForRecipe, recipes, 9999, 0, pantryItems).length;
  }, [selectedItemForRecipe, recipes, pantryItems]);

  const handleReloadModalSuggestions = () => {
    if (modalTotalEligible <= 4) return;
    setIsReloading(true);
    setModalReloadOffset(prev => prev + 4);
    setTimeout(() => setIsReloading(false), 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
              🧊
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  Tủ Lạnh & Đồ Ăn Thừa
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-extrabold text-[10px] border border-cyan-500/30 shrink-0">
                  {pantryItems.length} món
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Nhập đồ thừa & thực phẩm sẵn có để trừ khỏi danh sách đi chợ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Summary Dashboard Card */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="text-center p-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Trong Tủ</span>
              <span className="text-base sm:text-lg font-black text-cyan-700 dark:text-cyan-300">
                {pantryItems.length} món
              </span>
            </div>
            <div className="text-center p-1.5 border-x border-cyan-500/20">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Ăn Gấp ≤ 2 Ngày</span>
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                {urgentList.length} món
              </span>
            </div>
            <div className="text-center p-1.5">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Tiết Kiệm Đi Chợ</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                ~{(totalPotentialSavings / 1000).toFixed(0)}k đ
              </span>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              💡 Gợi Ý Nhanh Đồ Thừa Phổ Biến (Bấm để điền nhanh):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LEFTOVER_SUGGESTIONS.slice(0, 6).map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySuggestion(sug)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/15 text-slate-700 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>{sug.isLeftover ? '🍲' : '🥬'}</span>
                  <span>{sug.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Item Trigger / Collapsible Form */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/20 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAddingOpen(prev => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-black text-cyan-800 dark:text-cyan-300 text-xs sm:text-sm hover:bg-cyan-500/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Nhập Thức Ăn Thừa / Nguyên Liệu Mới Vào Tủ</span>
              </div>
              {isAddingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isAddingOpen && (
              <form onSubmit={handleSaveItem} className="p-4 pt-1 space-y-3 border-t border-cyan-500/20 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Tên món / Đồ thừa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="VD: Cơm nguội, Thịt luộc thừa, Nửa bắp cải..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Số lượng
                    </label>
                    <input
                      type="text"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      placeholder="VD: 300g, 1 tô to, 2 quả, 1/2 củ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Phân loại
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Days left */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Hạn bảo quản còn lại
                    </label>
                    <select
                      value={daysLeft}
                      onChange={e => setDaysLeft(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value={1}>⚠️ 1 ngày (Cần ăn ngay hôm nay!)</option>
                      <option value={2}>⏳ 2 ngày (Ăn trong 48 giờ)</option>
                      <option value={3}>✨ 3 ngày (Còn tươi ngon)</option>
                      <option value={5}>❄️ 5 ngày (Bảo quản tốt)</option>
                      <option value={7}>🧊 7 ngày (Ngăn đông / đồ khô)</option>
                    </select>
                  </div>

                  {/* Value saved */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Ước tính tiết kiệm (đ)
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={discountVnd}
                      onChange={e => setDiscountVnd(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Notes & Leftover Checkbox */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isLeftoverCheckbox"
                      checked={isLeftover}
                      onChange={e => setIsLeftover(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="isLeftoverCheckbox" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                      🍲 Đây là thức ăn thừa từ bữa trước (Cần ưu tiên tận dụng để tránh lãng phí)
                    </label>
                  </div>

                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ghi chú: Để ngăn mát hộp thủy tinh, nên rang lại hoặc nấu canh..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 transition-colors"
                  >
                    Đóng lại
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-md hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lưu Vào Tủ Lạnh</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Filter Tabs Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeFilter === 'all'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Tất cả ({pantryItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('leftovers')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  activeFilter === 'leftovers'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>🍲</span>
                <span>Đồ Thừa ({leftoversList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('warning')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  activeFilter === 'warning'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>⚠️</span>
                <span>Ăn Gấp ≤ 2n ({urgentList.length})</span>
              </button>
            </div>

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
                      setSelectedItemForRecipe(null);
                      showToast('🧹 Đã dọn sạch thực phẩm trong tủ lạnh!');
                    }
                  });
                }}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline shrink-0"
              >
                Dọn sạch
              </button>
            )}
          </div>

          {/* Fridge Items List */}
          {displayedItems.length === 0 ? (
            <div className="text-center py-10 space-y-2 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <div className="text-4xl">🧊</div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Tủ lạnh đang trống ở mục này!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Bấm "Nhập Thức Ăn Thừa / Nguyên Liệu Mới" ở trên để ghi lại các món ăn có sẵn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {displayedItems.map((item) => {
                const isUrgent = item.daysLeft <= 2;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                      item.isLeftover
                        ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                        : isUrgent
                        ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-white/10 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm shrink-0">
                              {item.isLeftover ? '🍲' : item.category === 'Trứng & Đậu' ? '🥚' : item.category === 'Rau củ quả' ? '🥬' : '🥩'}
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {item.name}
                            </h4>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                          item.daysLeft <= 1 
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                            : item.daysLeft <= 2
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{item.daysLeft <= 1 ? 'Ăn hôm nay!' : `Còn ${item.daysLeft} ngày`}</span>
                        </span>
                      </div>

                      {/* Quantity & Category */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          📦 Số lượng: {item.quantity}
                        </span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg">
                          💡 {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItemForRecipe(item)}
                        className="text-[11px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                        title="Gợi ý món ăn có thể nấu từ nguyên liệu này"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Gợi ý món nấu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          removePantryItem(item.id);
                          if (selectedItemForRecipe?.id === item.id) {
                            setSelectedItemForRecipe(null);
                          }
                        }}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Đã nấu hết hoặc dọn đi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Đã dùng hết</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recipe Suggestion Dialog for Selected Item */}
          {selectedItemForRecipe && (
            <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-500/30 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ChefHat className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="text-xs font-black text-cyan-900 dark:text-cyan-200 truncate">
                    Món ngon gợi ý tận dụng "{selectedItemForRecipe.name}":
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleReloadModalSuggestions}
                    disabled={modalTotalEligible <= 4}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={modalTotalEligible <= 4 ? 'Chỉ có 4 món hoặc ít hơn phù hợp' : 'Đổi sang các món khác'}
                  >
                    <RotateCcw className={`w-3 h-3 ${isReloading ? 'animate-spin' : ''}`} />
                    <span>Đổi Món</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItemForRecipe(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              {suggestedRecipes.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn có thể linh hoạt xào, rang hoặc nấu canh với các loại gia vị cơ bản có sẵn trong bếp!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedRecipes.map(recipe => {
                    const matchDetail = matchRecipeWithPantryItem(recipe, selectedItemForRecipe);
                    const synergizedItems = pantryItems.filter(
                      p => p.id !== selectedItemForRecipe.id && !isCondiment(p.name) && matchRecipeWithPantryItem(recipe, p).matched
                    );
                    const synergyCount = synergizedItems.length;
                    const isUrgent = selectedItemForRecipe.daysLeft <= 2 || synergizedItems.some(p => p.daysLeft <= 2);

                    return (
                      <div key={recipe.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {recipe.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                            {recipe.cookTimeMinutes}p
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 truncate max-w-full">
                            ✓ Khớp: {matchDetail.matchedAs || selectedItemForRecipe.name}
                          </span>
                          {synergyCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 shrink-0">
                              ✨ +{synergyCount} món hợp
                            </span>
                          )}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
                              ⚠️ Ăn gấp
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            💡 Thực phẩm trong tủ lạnh sẽ tự động hiển thị gợi ý trên giỏ đi chợ.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-colors shadow-xs"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
