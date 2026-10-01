import React, { useState, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  ShoppingCart, 
  Store, 
  ShoppingBag, 
  Sparkles, 
  Copy, 
  Check, 
  PartyPopper,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Building2,
  ChevronDown,
  ChevronUp,
  Truck,
  Gift,
  Clock,
  Flame,
  Users,
  UserCheck,
  QrCode,
  X,
  Edit3,
  Palette,
  Smile,
  Plus,
  Minus,
  AlertCircle,
  Smartphone,
  Trash2
} from 'lucide-react';
import { VietnameseMealSet, Recipe, StoreChannel, CollabCartItem, CollabShopper } from '../types';
import { scaleCost } from '../utils/currency';
import { copyTextToClipboard } from './CateringPartyPlanner';
import { FridgeLeftoverModal } from './FridgeLeftoverModal';
import { SHOPPER_PALETTE, getShopperStyle, formatTtlRemaining } from '../services/collabGroceryService';

// Store Channel Configuration for the 4 Vietnamese retail channels
export interface StoreChannelConfig {
  id: StoreChannel;
  name: string;
  shortName: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  multiplier: number;
  shippingFee: number;
  freeShippingThreshold: number;
  onlineVoucher: number;
  deliveryEstimate: string;
  tagline: string;
  description: string;
}

export const STORE_CHANNELS: Record<Exclude<StoreChannel, 'all'>, StoreChannelConfig> = {
  'cho-dan-sinh': {
    id: 'cho-dan-sinh',
    name: 'Chợ Dân Sinh',
    shortName: 'Chợ Dân Sinh',
    icon: '🏪',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200/60 dark:border-emerald-800/50',
    multiplier: 1.0,
    shippingFee: 0,
    freeShippingThreshold: 0,
    onlineVoucher: 0,
    deliveryEstimate: 'Tự đi chợ (~45 phút)',
    tagline: 'Tươi sống nhất • Giá gốc truyền thống',
    description: 'Thịt tươi mổ sớm, cá sông tươi, rau củ quả vừa hái từ vườn.'
  },
  'winmart': {
    id: 'winmart',
    name: 'WinMart',
    shortName: 'WinMart',
    icon: '🔴',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200/60 dark:border-rose-800/50',
    multiplier: 1.15,
    shippingFee: 25000,
    freeShippingThreshold: 300000,
    onlineVoucher: 20000,
    deliveryEstimate: 'Giao siêu tốc 1 - 2h',
    tagline: 'Thịt mát MEATDeli • Chuẩn VSATTP',
    description: 'Thực phẩm có nguồn gốc rõ ràng, chuỗi lạnh bảo quản quốc tế.'
  },
  'bach-hoa-xanh': {
    id: 'bach-hoa-xanh',
    name: 'Bách Hóa Xanh',
    shortName: 'BHX',
    icon: '🟢',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-200/60 dark:border-amber-800/50',
    multiplier: 1.05,
    shippingFee: 15000,
    freeShippingThreshold: 250000,
    onlineVoucher: 10000,
    deliveryEstimate: 'Giao hẹn giờ trong ngày',
    tagline: 'Gia vị đồ khô • Giá bình ổn',
    description: 'Chuyên gia vị, đồ hộp, gạo ngon và thực phẩm khô giá tốt.'
  },
  'sap-doi-tac': {
    id: 'sap-doi-tac',
    name: 'Sạp Đối Tác',
    shortName: 'Sạp Đối Tác',
    icon: '🏮',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200/60 dark:border-purple-800/50',
    multiplier: 1.10,
    shippingFee: 20000,
    freeShippingThreshold: 350000,
    onlineVoucher: 0,
    deliveryEstimate: 'Giao trong ngày',
    tagline: 'Đặc sản 3 miền • Gia truyền thủ công',
    description: 'Gia vị gia truyền chính gốc: mắm tôm Bắc, tương Bần, tỏi Lý Sơn.'
  }
};

import {
  canonicalizeIngredientName,
  decomposeBundledIngredients,
  parseAmount,
  normalizeIngredientUnitAndAmount,
  formatDisplayAmountAndUnit,
  PRODUCE_UNIT_WEIGHTS,
  NormalizedIngredientInfo,
  isCommonPantryStaple,
  isGroceryItemMatch
} from '../utils/ingredientNormalizer';

export {
  canonicalizeIngredientName,
  decomposeBundledIngredients,
  parseAmount,
  normalizeIngredientUnitAndAmount,
  formatDisplayAmountAndUnit,
  PRODUCE_UNIT_WEIGHTS,
  isCommonPantryStaple
};
export type { NormalizedIngredientInfo };




// Pure Helper: Assign optimal store channel based on Vietnamese culinary market reality
export function getOptimalStoreChannel(name: string, category: string): Exclude<StoreChannel, 'all'> {
  const lowerName = (name || '').toLowerCase();

  // 1. Regional artisanal specialty -> Sạp Đối Tác
  if (
    lowerName.includes('mắm tôm') ||
    lowerName.includes('mắm tép') ||
    lowerName.includes('mắm ruốc') ||
    lowerName.includes('mắm nhĩ') ||
    lowerName.includes('nước màu dừa') ||
    lowerName.includes('sấu') ||
    lowerName.includes('lý sơn') ||
    lowerName.includes('chẩm chéo') ||
    lowerName.includes('tương bần') ||
    lowerName.includes('đặc sản') ||
    lowerName.includes('tiêu sọ')
  ) {
    return 'sap-doi-tac';
  }

  // 2. Modern supermarket brands, cooking oil, dairy, chilled meats -> WinMart
  if (
    lowerName.includes('dầu ăn') ||
    lowerName.includes('sữa') ||
    lowerName.includes('bơ') ||
    lowerName.includes('xúc xích') ||
    lowerName.includes('nước mắm phú quốc') ||
    lowerName.includes('thịt mát')
  ) {
    return 'winmart';
  }

  // 3. Dry pantry, common seasonings, sugar, coconut, vinegar -> Bách Hóa Xanh
  if (
    category === 'gia-vi' || 
    category === 'do-kho' ||
    lowerName.includes('đường') ||
    lowerName.includes('nước dừa') ||
    lowerName.includes('nước tương') ||
    lowerName.includes('giấm') ||
    lowerName.includes('muối') ||
    lowerName.includes('tiêu') ||
    lowerName.includes('hạt nêm') ||
    lowerName.includes('bột chiên') ||
    lowerName.includes('trứng')
  ) {
    return 'bach-hoa-xanh';
  }

  // 4. Fresh meats, seafood, fresh greens, herbs -> Chợ Dân Sinh
  return 'cho-dan-sinh';
}

// Grocery Aisle Categories for intuitive real-world shopping navigation
export type GroceryAisleCategory = 'all' | 'thit' | 'hai-san' | 'rau-cu' | 'trai-cay' | 'gia-vi-kho';

export interface AisleCategoryConfig {
  id: GroceryAisleCategory;
  name: string;
  shortName: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  tagline: string;
}

export const GROCERY_AISLES: Record<Exclude<GroceryAisleCategory, 'all'>, AisleCategoryConfig> = {
  'thit': {
    id: 'thit',
    name: 'Thịt & Trứng',
    shortName: 'Thịt/Trứng',
    icon: '🥩',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200/60 dark:border-rose-800/50',
    tagline: 'Thịt heo, bò, gà, vịt, trứng'
  },
  'hai-san': {
    id: 'hai-san',
    name: 'Hải Sản',
    shortName: 'Hải Sản',
    icon: '🦐',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200/60 dark:border-sky-800/50',
    tagline: 'Cá tươi, tôm, cua, mực, nghêu'
  },
  'rau-cu': {
    id: 'rau-cu',
    name: 'Rau Củ & Nấm',
    shortName: 'Rau Củ',
    icon: '🥬',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200/60 dark:border-emerald-800/50',
    tagline: 'Rau tươi, củ quả, hành tỏi, nấm'
  },
  'trai-cay': {
    id: 'trai-cay',
    name: 'Trái Cây',
    shortName: 'Trái Cây',
    icon: '🍎',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200/60 dark:border-amber-800/50',
    tagline: 'Hoa quả tươi, dứa, sấu, tráng miệng'
  },
  'gia-vi-kho': {
    id: 'gia-vi-kho',
    name: 'Gia Vị & Đồ Khô',
    shortName: 'Gia Vị/Khô',
    icon: '🧂',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200/60 dark:border-purple-800/50',
    tagline: 'Gia vị, dầu ăn, bún khô, gạo, đồ hộp'
  }
};

// Pure Helper: Classify ingredients into real-life grocery aisles
export function getGroceryAisleCategory(name: string, rawCategory?: string): Exclude<GroceryAisleCategory, 'all'> {
  const lower = (name || '').toLowerCase().trim();

  // 1. Trái Cây (Fruits)
  if (
    lower.includes('dứa') ||
    lower.includes('thơm') ||
    lower.includes('chuối') ||
    lower.includes('sấu') ||
    lower.includes('xoài') ||
    lower.includes('bưởi') ||
    lower.includes('cam') ||
    lower.includes('táo') ||
    lower.includes('dưa hấu') ||
    lower.includes('thanh long') ||
    lower.includes('đu đủ') ||
    lower.includes('chanh dây') ||
    lower.includes('quýt') ||
    lower.includes('chôm chôm') ||
    lower.includes('nhãn') ||
    lower.includes('vải') ||
    lower.includes('nho') ||
    lower.includes('dâu') ||
    lower.includes('bơ sáp') ||
    lower.includes('dừa tươi') ||
    lower.includes('dừa xiêm')
  ) {
    return 'trai-cay';
  }

  // 2. Hải Sản (Seafood & Fish)
  const isFish = (lower.includes('cá ') || lower.startsWith('cá') || lower.endsWith(' cá') || lower === 'cá') &&
    !lower.includes('cà chua') && !lower.includes('cà pháo') && !lower.includes('cà tím');
  
  if (
    isFish ||
    lower.includes('tôm') ||
    lower.includes('tép') ||
    lower.includes('mực') ||
    lower.includes('bạch tuộc') ||
    lower.includes('cua') ||
    lower.includes('ghẹ') ||
    lower.includes('rạm') ||
    lower.includes('nghêu') ||
    lower.includes('ngao') ||
    lower.includes('sò') ||
    lower.includes('hàu') ||
    lower.includes('ốc') ||
    lower.includes('hến') ||
    lower.includes('chả cá') ||
    lower.includes('chả mực') ||
    lower.includes('lươn') ||
    lower.includes('bào ngư')
  ) {
    return 'hai-san';
  }

  // 3. Thịt & Trứng (Meat, Poultry, Eggs)
  const isChicken = (lower.includes('gà') || lower.includes('vịt') || lower.includes('chim') || lower.includes('ngan')) &&
    !lower.includes('nấm');

  if (
    lower.includes('thịt') ||
    lower.includes('heo') ||
    lower.includes('lợn') ||
    lower.includes('bò') ||
    isChicken ||
    lower.includes('sườn') ||
    lower.includes('ba chỉ') ||
    lower.includes('ba rọi') ||
    lower.includes('nạc') ||
    lower.includes('thăn') ||
    lower.includes('chân giò') ||
    lower.includes('móng giò') ||
    lower.includes('giò lụa') ||
    lower.includes('chả lụa') ||
    lower.includes('xúc xích') ||
    lower.includes('lạp xưởng') ||
    lower.includes('pate') ||
    lower.includes('trứng')
  ) {
    return 'thit';
  }

  // 4. Gia Vị & Đồ Khô (Sauces, Spices & Dry Pantry)
  if (
    rawCategory === 'gia-vi' ||
    rawCategory === 'do-kho' ||
    lower.includes('nước mắm') ||
    lower.includes('dầu hào') ||
    lower.includes('dầu mè') ||
    lower.includes('dầu ăn') ||
    lower.includes('nước tương') ||
    lower.includes('xì dầu') ||
    lower.includes('sa tế') ||
    lower.includes('mắm tôm') ||
    lower.includes('mắm nêm') ||
    lower.includes('mắm tép') ||
    lower.includes('mắm ruốc') ||
    lower.includes('tương bần') ||
    lower.includes('tương ớt') ||
    lower.includes('tương cà') ||
    lower.includes('hạt nêm') ||
    lower.includes('bột ngọt') ||
    lower.includes('mì chính') ||
    lower.includes('muối') ||
    lower.includes('đường') ||
    lower.includes('tiêu') ||
    lower.includes('giấm') ||
    lower.includes('ngũ vị hương') ||
    lower.includes('bột cà ri') ||
    lower.includes('bột nghệ') ||
    lower.includes('hoa hồi') ||
    lower.includes('quế') ||
    lower.includes('mè rang') ||
    lower.includes('vừng') ||
    lower.includes('lạc rang') ||
    lower.includes('đậu phộng') ||
    lower.includes('bột năng') ||
    lower.includes('bột bắp') ||
    lower.includes('bột chiên') ||
    lower.includes('bột mì') ||
    lower.includes('bún khô') ||
    lower.includes('miến') ||
    lower.includes('phở khô') ||
    lower.includes('mì gói') ||
    lower.includes('bánh tráng') ||
    lower.includes('bánh mì') ||
    lower.includes('gạo') ||
    lower.includes('nếp') ||
    lower.includes('nước cốt dừa')
  ) {
    return 'gia-vi-kho';
  }

  // 5. Default everything else (fresh vegetables, herbs, aromatics, mushrooms, tofu) -> 'rau-cu'
  return 'rau-cu';
}

export interface ProcessedGroceryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  displayAmount: string;
  category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
  type: 'fresh' | 'pantry';
  cost: number;
  storeChannel: Exclude<StoreChannel, 'all'>;
  aisleCategory: Exclude<GroceryAisleCategory, 'all'>;
  dishCount?: number;
  dishNames?: string[];
  isCustom?: boolean;
  extraOriginalNames?: string[];
}

// Pure Helper: Generate formatted Zalo shopping export text
export function generateZaloShoppingText(
  items: ProcessedGroceryItem[],
  checkedMap: Record<string, boolean>,
  totalCost: number,
  activeFilter: StoreChannel
): string {
  const checkedList = items.filter(i => !!checkedMap[i.id] || !!checkedMap[i.name]);
  const uncheckedList = items.filter(i => !checkedMap[i.id] && !checkedMap[i.name]);

  let text = "🛒 DANH SÁCH ĐI CHỢ MEALWISE (MÂM CƠM VIỆT)\n";
  if (activeFilter !== 'all') {
    const storeInfo = STORE_CHANNELS[activeFilter];
    text += `📍 Kênh mua sắm: ${storeInfo.name} (${storeInfo.tagline})\n`;
  }
  text += "━━━━━━━━━━━━━━━━━━━━\n\n";

  // Section 1: Đã mua
  text += `[✓] ĐÃ MUA (${checkedList.length}/${items.length} món):\n`;
  if (checkedList.length === 0) {
    text += "• (Chưa đánh dấu món nào)\n";
  } else {
    checkedList.forEach(item => {
      const store = STORE_CHANNELS[item.storeChannel];
      const countSuffix = item.dishCount && item.dishCount > 1 ? ` (${item.dishCount} món)` : '';
      text += `• ${item.name}${countSuffix}: ${item.displayAmount} [${store.shortName}]\n`;
    });
  }

  // Section 2: Cần mua
  text += `\n[ ] CẦN MUA (${uncheckedList.length} món):\n`;
  if (uncheckedList.length === 0) {
    text += "🎉 ĐÃ GOM ĐỦ TOÀN BỘ NGUYÊN LIỆU!\n";
  } else {
    uncheckedList.forEach(item => {
      const store = STORE_CHANNELS[item.storeChannel];
      const countSuffix = item.dishCount && item.dishCount > 1 ? ` (${item.dishCount} món)` : '';
      text += `• ${item.name}${countSuffix}: ${item.displayAmount} [${store.shortName}]\n`;
    });
  }

  text += "\n━━━━━━━━━━━━━━━━━━━━\n";
  text += `💰 TỔNG CHI PHÍ DỰ KIẾN: ${totalCost.toLocaleString('vi-VN')} đ\n\n`;

  // Store distribution summary
  text += "🏪 PHÂN BỔ KÊNH MUA ĐỀ XUẤT:\n";
  const channelCounts: Record<string, number> = {};
  items.forEach(i => {
    channelCounts[i.storeChannel] = (channelCounts[i.storeChannel] || 0) + 1;
  });

  (['cho-dan-sinh', 'winmart', 'bach-hoa-xanh', 'sap-doi-tac'] as const).forEach(ch => {
    const count = channelCounts[ch] || 0;
    if (count > 0) {
      const store = STORE_CHANNELS[ch];
      text += `- ${store.icon} ${store.name}: ${count} món (${store.tagline})\n`;
    }
  });

  text += "\n✨ Xuất tự động từ MealWise — Trợ Lý Đi Chợ Mâm Cơm Việt";
  return text;
}

export const GroceryList: React.FC = () => {
  const { 
    weeklyPlan, 
    servings,
    extraGroceryItems, 
    addExtraGroceryItems,
    removeExtraGroceryItem,
    clearExtraGrocery, 
    showToast,
    groceryCheckedItems,
    toggleGroceryItemChecked,
    clearGroceryCheckedItems,
    pantryItems,
    setActiveTab,
    collabRoom,
    collabCheckedMap,
    collabUser,
    collabUserName,
    updateCollabUserProfile,
    collabParticipants,
    startCollabRoom,
    leaveCollabRoom,
    toggleCollabChecked,
    setIsShareModalOpen,
    groceryItemBuyerCounts,
    incrementGroceryItemBuyer,
    decrementGroceryItemBuyer,
    incrementCollabItemBuyer,
    decrementCollabItemBuyer,
    isRegistered,
    openAuthModal,
    openConfirmModal,
    isWebGuestViewer,
    openDownloadAppModal
  } = useMealWise();

  const [copied, setCopied] = useState<boolean>(false);
  const [aisleFilter, setAisleFilter] = useState<GroceryAisleCategory>('all');
  const [storeFilter, setStoreFilter] = useState<StoreChannel>('all'); // Retained for online price simulation & Zalo export
  const [collabFilter, setCollabFilter] = useState<'all' | 'unclaimed' | 'mine' | 'others'>('all');
  const [showPriceSimulation, setShowPriceSimulation] = useState<boolean>(false);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [customShopperName, setCustomShopperName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
  const lobbyRef = useRef<HTMLDivElement | null>(null);

  // In-cart items expansion states per aisle category (pushed to bottom)
  const [expandedAisleCarts, setExpandedAisleCarts] = useState<Record<string, boolean>>({
    thit: true,
    'hai-san': true,
    'rau-cu': true,
    'trai-cay': true,
    'gia-vi-kho': true
  });

  const toggleAisleCart = (aisleId: string) => {
    setExpandedAisleCarts(prev => ({ ...prev, [aisleId]: prev[aisleId] === false ? true : false }));
  };

  // Quick-Add custom grocery item state (for when household runs out of staples)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemAmount, setCustomItemAmount] = useState<number | string>(1);
  const [customItemUnit, setCustomItemUnit] = useState<string>('chai');
  const [customItemCost, setCustomItemCost] = useState<number>(30000);
  const [customItemStore, setCustomItemStore] = useState<Exclude<StoreChannel, 'all'>>('winmart');

  // Quick 1-tap presets for depleted household pantry essentials
  const DEPLETED_PANTRY_PRESETS: Array<{ name: string; amount: number; unit: string; cost: number; store: Exclude<StoreChannel, 'all'>; category: 'gia-vi' | 'thit-ca' | 'rau-cu' | 'do-kho' | 'khac' }> = [
    { name: 'Nước mắm cá cơm', amount: 1, unit: 'chai', cost: 35000, store: 'winmart', category: 'gia-vi' },
    { name: 'Dầu ăn thực vật', amount: 1, unit: 'chai', cost: 45000, store: 'winmart', category: 'gia-vi' },
    { name: 'Hạt nêm thịt thăn', amount: 1, unit: 'gói', cost: 25000, store: 'winmart', category: 'gia-vi' },
    { name: 'Đường cát trắng', amount: 1, unit: 'kg', cost: 24000, store: 'winmart', category: 'gia-vi' },
    { name: 'Muối tinh sấy', amount: 1, unit: 'gói', cost: 8000, store: 'winmart', category: 'gia-vi' },
    { name: 'Tiêu đen xay', amount: 1, unit: 'lọ', cost: 22000, store: 'winmart', category: 'gia-vi' },
    { name: 'Nước tương đậu nành', amount: 1, unit: 'chai', cost: 20000, store: 'winmart', category: 'gia-vi' },
    { name: 'Tương ớt', amount: 1, unit: 'chai', cost: 16000, store: 'winmart', category: 'gia-vi' },
    { name: 'Trứng gà (vỉ 10 quả)', amount: 10, unit: 'quả', cost: 32000, store: 'cho-dan-sinh', category: 'thit-ca' },
    { name: 'Gạo tẻ thơm ST25', amount: 5, unit: 'kg', cost: 160000, store: 'winmart', category: 'do-kho' }
  ];

  // Local state for deleted/hidden grocery items in current plan
  const [deletedItemNames, setDeletedItemNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mealwise_deleted_grocery_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isItemDeleted = (name: string, extraNames?: string[]): boolean => {
    if (deletedItemNames.length === 0) return false;
    const candidates = [name, ...(extraNames || [])].filter(Boolean);
    return deletedItemNames.some(del =>
      candidates.some(cand => isGroceryItemMatch(del, cand))
    );
  };

  const handleDeleteItem = (item: ProcessedGroceryItem) => {
    const namesToDelete = Array.from(new Set([
      item.name,
      item.id,
      ...(item.extraOriginalNames || []),
      canonicalizeIngredientName(item.name)
    ].filter(Boolean)));

    // 1. Remove from extraGroceryItems in context
    removeExtraGroceryItem(namesToDelete);

    // 2. Add to deletedItemNames to guarantee it disappears from allList even if recipes referenced it!
    setDeletedItemNames(prev => {
      const updated = Array.from(new Set([...prev, ...namesToDelete]));
      try {
        localStorage.setItem('mealwise_deleted_grocery_items', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save deleted grocery items', e);
      }
      return updated;
    });

    // 3. Clear checked or buyer states for this item if any
    if (groceryCheckedItems[item.id] || groceryCheckedItems[item.name]) {
      toggleGroceryItemChecked(item.id);
    }

    showToast(`🗑️ Đã xóa "${item.name}" khỏi danh sách đi chợ!`);
  };

  const handleAddPreset = (preset: typeof DEPLETED_PANTRY_PRESETS[0]) => {
    // Un-delete if previously deleted
    setDeletedItemNames(prev => {
      const filtered = prev.filter(d => !isGroceryItemMatch(d, preset.name) && !isGroceryItemMatch(d, canonicalizeIngredientName(preset.name)));
      try {
        localStorage.setItem('mealwise_deleted_grocery_items', JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });

    addExtraGroceryItems([{
      name: preset.name,
      amount: preset.amount,
      unit: preset.unit,
      category: preset.category,
      cost: preset.cost
    }]);
    showToast(`🛒 Đã thêm "${preset.name}" (${preset.amount} ${preset.unit}) vào giỏ đi chợ!`);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) {
      showToast('⚠️ Vui lòng nhập tên món cần mua!');
      return;
    }
    const cleanName = customItemName.trim();

    // Un-delete if previously deleted
    setDeletedItemNames(prev => {
      const filtered = prev.filter(d => !isGroceryItemMatch(d, cleanName) && !isGroceryItemMatch(d, canonicalizeIngredientName(cleanName)));
      try {
        localStorage.setItem('mealwise_deleted_grocery_items', JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });

    const numericAmount = typeof customItemAmount === 'number' 
      ? customItemAmount 
      : (parseFloat(customItemAmount) || 1);

    addExtraGroceryItems([{
      name: cleanName,
      amount: Math.max(0.01, numericAmount),
      unit: customItemUnit.trim() || 'phần',
      category: 'khac',
      cost: Math.max(0, customItemCost || 0)
    }]);
    showToast(`🛒 Đã thêm "${cleanName}" vào giỏ đi chợ tuần!`);
    setCustomItemName('');
    setCustomItemAmount(1);
    setIsQuickAddOpen(false);
  };

  // Household Servings sanitization & scale (matches WeeklyBoard 100%)
  const safeServings = Number.isFinite(servings) && (servings as number) > 0 
    ? Math.min(20, Math.max(1, Math.round(servings as number))) 
    : 4;
  const scale = safeServings / 4;

  const isMealSet = (item: any): item is VietnameseMealSet => {
    return item && 'mainDish' in item;
  };

  const getDayCost = (day: typeof weeklyPlan[0]) => {
    let cost = 0;
    Object.values(day.meals).forEach(m => {
      if (m) {
        if (isMealSet(m)) cost += m.totalCostVnd;
        else cost += m.estimatedCostVnd || 35000;
      }
    });
    return scaleCost(cost, safeServings);
  };

  // The definitive target weekly budget from Weekly Plan
  const expectedWeeklyPlanCost = weeklyPlan.reduce((sum, d) => sum + getDayCost(d), 0);
  const extraItemsCost = (extraGroceryItems || []).reduce((sum, it) => sum + (it.cost || 0), 0);
  const targetTotalGroceryCost = expectedWeeklyPlanCost + extraItemsCost;

  // Accumulate ingredients with unit normalization & mathematically correct cost tracking
  interface AccumulatorEntry {
    cleanName: string;
    baseAmount: number;
    baseUnit: string;
    family: NormalizedIngredientInfo['family'];
    category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
    cost: number;
    storeChannel: Exclude<StoreChannel, 'all'>;
    dishNames: string[];
    dishCount: number;
    isCustom?: boolean;
    extraOriginalNames?: string[];
  }

  const itemsMap: Record<string, AccumulatorEntry> = {};

  const addIngredientToAccumulator = (
    rawName: string,
    rawAmount: number | string,
    rawUnit: string,
    rawCategory: any,
    allocatedCost: number,
    recipeTitle: string,
    isExtra: boolean = false
  ) => {
    // Exclude common household pantry staples (sugar, salt, fish sauce, cooking oil, etc.)
    // as ordinary families already keep these stocked in bulk.
    // However, if the user explicitly added this item (e.g. ran out of fish sauce), allow it!
    if (!isExtra && isCommonPantryStaple(rawName, rawCategory)) {
      return;
    }

    // Scale amount by safeServings (base recipes are 4 servings; custom additions are preserved as-is)
    const baseNumeric = typeof rawAmount === 'number' ? rawAmount : (parseFloat(rawAmount as string) || 1);
    const scaledAmount = isExtra ? baseNumeric : baseNumeric * scale;
    const subItems = decomposeBundledIngredients(rawName, scaledAmount, rawUnit, rawCategory, allocatedCost);

    subItems.forEach(ing => {
      const norm = normalizeIngredientUnitAndAmount(ing.name, ing.amount, ing.unit);
      const isFresh = ing.category === 'thit-ca' || ing.category === 'rau-cu';
      const channel = getOptimalStoreChannel(norm.cleanName, ing.category);

      const canonicalNameLower = norm.cleanName.toLowerCase();
      let targetKey = norm.groupKey;
      if (!itemsMap[targetKey]) {
        const matchKey = Object.keys(itemsMap).find(k => itemsMap[k].cleanName.toLowerCase() === canonicalNameLower);
        if (matchKey) {
          targetKey = matchKey;
        }
      }

      if (!itemsMap[targetKey]) {
        itemsMap[targetKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          category: (ing.category || (isFresh ? 'rau-cu' : 'do-kho')) as any,
          cost: ing.cost,
          storeChannel: channel,
          dishNames: [recipeTitle],
          dishCount: 1,
          isCustom: isExtra,
          extraOriginalNames: isExtra ? [rawName] : []
        };
      } else {
        itemsMap[targetKey].baseAmount += norm.baseAmount;
        itemsMap[targetKey].cost += ing.cost;
        if (isExtra) {
          itemsMap[targetKey].isCustom = true;
          if (!itemsMap[targetKey].extraOriginalNames) itemsMap[targetKey].extraOriginalNames = [];
          if (!itemsMap[targetKey].extraOriginalNames!.includes(rawName)) {
            itemsMap[targetKey].extraOriginalNames!.push(rawName);
          }
        }
        if (!itemsMap[targetKey].dishNames.includes(recipeTitle)) {
          itemsMap[targetKey].dishNames.push(recipeTitle);
        }
        itemsMap[targetKey].dishCount += 1;
      }
    });
  };

  // Traverse weekly plan by meal slot to ensure 100% budget harmonization with WeeklyBoard
  weeklyPlan.forEach(day => {
    if (!day || !day.meals) return;
    Object.values(day.meals).forEach(meal => {
      if (!meal) return;
      if (isMealSet(meal)) {
        const set = meal as VietnameseMealSet;
        const scaledSetBudget = scaleCost(set.totalCostVnd, safeServings);
        const dishes = [set.mainDish, set.soupDish, set.sideDish].filter(Boolean) as Recipe[];
        if (dishes.length === 0) return;

        const sumDishEstimated = dishes.reduce((sum, d) => sum + (d.estimatedCostVnd || 35000), 0);
        dishes.forEach(dish => {
          const dishWeight = sumDishEstimated > 0 ? (dish.estimatedCostVnd || 35000) / sumDishEstimated : (1 / dishes.length);
          const dishAllocatedBudget = scaledSetBudget * dishWeight;
          const ingCount = Math.max(1, dish.ingredients?.length || 1);
          const costPerIng = dishAllocatedBudget / ingCount;
          const dishTitle = dish.title || set.title || 'Món ăn';

          (dish.ingredients || []).forEach(rawIng => {
            addIngredientToAccumulator(rawIng.name, rawIng.amount, rawIng.unit, rawIng.category, costPerIng, dishTitle, false);
          });
        });
      } else {
        const recipe = meal as Recipe;
        const scaledRecipeBudget = scaleCost(recipe.estimatedCostVnd || 35000, safeServings);
        const ingCount = Math.max(1, recipe.ingredients?.length || 1);
        const costPerIng = scaledRecipeBudget / ingCount;
        const recipeTitle = recipe.title || 'Món ăn';

        (recipe.ingredients || []).forEach(rawIng => {
          addIngredientToAccumulator(rawIng.name, rawIng.amount, rawIng.unit, rawIng.category, costPerIng, recipeTitle, false);
        });
      }
    });
  });

  // Also include extra ingredients (from Catering Party Planner or User Quick-Add)
  if (extraGroceryItems && Array.isArray(extraGroceryItems)) {
    extraGroceryItems.forEach(item => {
      addIngredientToAccumulator(item.name, item.amount, item.unit, item.category, item.cost || 0, 'Tự thêm', true);
    });
  }

  // Convert accumulated map into clean processed grocery item list with 1,000 VND rounding
  const allList: ProcessedGroceryItem[] = Object.values(itemsMap)
    .filter(entry => !isItemDeleted(entry.cleanName, entry.extraOriginalNames))
    .map(entry => {
    const formatted = formatDisplayAmountAndUnit(entry.baseAmount, entry.family, entry.baseUnit);
    const isFresh = entry.category === 'thit-ca' || entry.category === 'rau-cu';
    const roundedCost = Math.round(entry.cost / 1000) * 1000 || (entry.cost > 0 ? 1000 : 0);
    const aisleCat = getGroceryAisleCategory(entry.cleanName, entry.category);
    return {
      id: entry.cleanName,
      name: entry.cleanName,
      amount: formatted.amount,
      unit: formatted.unit,
      displayAmount: formatted.displayStr,
      category: entry.category,
      type: isFresh ? 'fresh' : 'pantry',
      cost: roundedCost,
      storeChannel: entry.storeChannel,
      aisleCategory: aisleCat,
      dishCount: entry.dishCount,
      dishNames: entry.dishNames,
      isCustom: entry.isCustom,
      extraOriginalNames: entry.extraOriginalNames
    };
  });

  // Reconcile rounding remainder against targetTotalGroceryCost to guarantee 100% exact match
  if (allList.length > 0 && targetTotalGroceryCost > 0) {
    const sumAll = allList.reduce((sum, it) => sum + it.cost, 0);
    const remainder = targetTotalGroceryCost - sumAll;
    if (remainder !== 0) {
      // Find the highest cost item (e.g. main protein) and absorb rounding remainder
      let maxItemIndex = 0;
      for (let i = 1; i < allList.length; i++) {
        if (allList[i].cost > allList[maxItemIndex].cost) {
          maxItemIndex = i;
        }
      }
      allList[maxItemIndex].cost += remainder;
    }
  }

  // Sort list: Natural shopping aisle progression (Meat -> Seafood -> Vegetables -> Fruits -> Spices/Dry goods), then by Vietnamese name
  const AISLE_ORDER: Record<Exclude<GroceryAisleCategory, 'all'>, number> = {
    'thit': 1,
    'hai-san': 2,
    'rau-cu': 3,
    'trai-cay': 4,
    'gia-vi-kho': 5
  };

  allList.sort((a, b) => {
    const orderDiff = (AISLE_ORDER[a.aisleCategory] || 99) - (AISLE_ORDER[b.aisleCategory] || 99);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name, 'vi');
  });

  // Effective list: if connected to a collaborative room, use room items (preserves items for User B)
  const isCollabActive = Boolean(collabRoom?.roomId);
  const effectiveList: ProcessedGroceryItem[] = (isCollabActive && collabRoom?.items && collabRoom.items.length > 0)
    ? collabRoom.items
        .filter(it => !isItemDeleted(it.name, (it as any).extraOriginalNames))
        .map(it => ({
          ...it,
          storeChannel: (it.storeChannel as any) || 'cho-dan-sinh',
          aisleCategory: (it as any).aisleCategory || getGroceryAisleCategory(it.name, it.category)
        }))
    : allList;

  // Helper to determine check status, user attribution, and multi-buyer count
  const getItemCheckInfo = (item: ProcessedGroceryItem) => {
    if (isCollabActive && collabRoom?.roomId) {
      const state = collabCheckedMap[item.id] || collabCheckedMap[item.name];
      const isChecked = !!state?.checked;
      const checkedBy = state?.checked ? (state.checkedBy || 'Người mua cùng') : '';
      const checkedById = state?.checkedById || '';
      const isMine = isChecked && (checkedById ? checkedById === collabUser.id : checkedBy === collabUser.name);
      const checkedByColor = state?.checkedByColor || (isMine ? (collabUser.color || '#10b981') : '#8b5cf6');
      const style = getShopperStyle(checkedByColor);
      const buyerCount = state?.buyerCount !== undefined ? state.buyerCount : (isChecked ? 1 : 0);
      return { isChecked, checkedBy, checkedById, checkedByColor, isMine, style, buyerCount };
    }
    const isChecked = Boolean(groceryCheckedItems[item.id] || groceryCheckedItems[item.name]);
    const buyerCount = groceryItemBuyerCounts[item.id] || groceryItemBuyerCounts[item.name] || (isChecked ? 1 : 0);
    return { 
      isChecked, 
      checkedBy: '', 
      checkedById: '', 
      checkedByColor: '#10b981', 
      isMine: isChecked, 
      style: getShopperStyle('#10b981'),
      buyerCount
    };
  };

  // Increment buyer count for an item (indicates another person bought this item too)
  const handleIncrementBuyer = (item: ProcessedGroceryItem) => {
    if (isCollabActive && collabRoom?.roomId) {
      incrementCollabItemBuyer(item.id);
    } else {
      incrementGroceryItemBuyer(item.id);
    }
    const current = getItemCheckInfo(item).buyerCount;
    showToast(`👥 Đã ghi nhận thêm 1 người mua "${item.name}"! (Tổng: ${current + 1} người mua)`);
  };

  // Decrement buyer count for an item
  const handleDecrementBuyer = (item: ProcessedGroceryItem) => {
    if (isCollabActive && collabRoom?.roomId) {
      decrementCollabItemBuyer(item.id);
    } else {
      decrementGroceryItemBuyer(item.id);
    }
  };

  // Total items & cost
  const totalCount = effectiveList.length;
  const totalCostEstimate = effectiveList.reduce((sum, item) => sum + item.cost, 0);

  // Filter by grocery aisle AND collaborative assignment
  const displayedList = effectiveList.filter(item => {
    const aisleMatch = aisleFilter === 'all' || item.aisleCategory === aisleFilter;
    if (!aisleMatch) return false;

    if (isCollabActive && collabRoom?.roomId && collabFilter !== 'all') {
      const info = getItemCheckInfo(item);
      if (collabFilter === 'unclaimed') return !info.isChecked;
      if (collabFilter === 'mine') return info.isChecked && info.isMine;
      if (collabFilter === 'others') return info.isChecked && !info.isMine;
    }
    return true;
  });

  // Fresh & pantry breakdown for currently displayed items
  const freshList = displayedList.filter(i => i.type === 'fresh');
  const pantryList = displayedList.filter(i => i.type === 'pantry');

  // Checked counts
  const overallCheckedCount = effectiveList.filter(i => getItemCheckInfo(i).isChecked).length;
  const myCheckedCount = effectiveList.filter(i => {
    const info = getItemCheckInfo(i);
    return info.isChecked && info.isMine;
  }).length;
  const othersCheckedCount = effectiveList.filter(i => {
    const info = getItemCheckInfo(i);
    return info.isChecked && !info.isMine;
  }).length;
  const unclaimedCount = totalCount - overallCheckedCount;
  const progressPercent = totalCount > 0 ? Math.round((overallCheckedCount / totalCount) * 100) : 0;

  // Toggle item checkoff (supports both local and collaborative real-time sync)
  const handleToggle = (item: ProcessedGroceryItem) => {
    if (collabRoom?.roomId) {
      toggleCollabChecked(item.id);
    } else {
      toggleGroceryItemChecked(item.id);
    }
  };

  // Copy to Zalo handler
  const handleCopy = async () => {
    const activeCheckedRecord: Record<string, boolean> = {};
    effectiveList.forEach(item => {
      activeCheckedRecord[item.id] = getItemCheckInfo(item).isChecked;
    });
    const text = generateZaloShoppingText(effectiveList, activeCheckedRecord, totalCostEstimate, storeFilter);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      showToast('📋 Đã sao chép danh sách đi chợ Zalo với trạng thái đã mua!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      showToast('⚠️ Không thể tự động sao chép. Vui lòng kiểm tra quyền trình duyệt.');
    }
  };

  // Grocery aisle counts
  const aisleCounts: Record<GroceryAisleCategory, number> = {
    'all': totalCount,
    'thit': effectiveList.filter(i => i.aisleCategory === 'thit').length,
    'hai-san': effectiveList.filter(i => i.aisleCategory === 'hai-san').length,
    'rau-cu': effectiveList.filter(i => i.aisleCategory === 'rau-cu').length,
    'trai-cay': effectiveList.filter(i => i.aisleCategory === 'trai-cay').length,
    'gia-vi-kho': effectiveList.filter(i => i.aisleCategory === 'gia-vi-kho').length,
  };

  // Store channel counts (preserved for simulation & external exports)
  const channelCounts = {
    'all': totalCount,
    'cho-dan-sinh': effectiveList.filter(i => i.storeChannel === 'cho-dan-sinh').length,
    'winmart': effectiveList.filter(i => i.storeChannel === 'winmart').length,
    'bach-hoa-xanh': effectiveList.filter(i => i.storeChannel === 'bach-hoa-xanh').length,
    'sap-doi-tac': effectiveList.filter(i => i.storeChannel === 'sap-doi-tac').length,
  };

  // Pure Component Helper: Render an individual grocery row with crisp styling (no blur/opacity wash)
  const renderGroceryItemRow = (item: ProcessedGroceryItem) => {
    const checkInfo = getItemCheckInfo(item);
    const isChecked = checkInfo.isChecked;
    const store = STORE_CHANNELS[item.storeChannel];
    const aisle = GROCERY_AISLES[item.aisleCategory];
    const inFridge = pantryItems.find(p => 
      p.name.toLowerCase().includes(item.name.toLowerCase()) || 
      item.name.toLowerCase().includes(p.name.toLowerCase())
    );

    return (
      <div
        key={item.id}
        onClick={() => handleToggle(item)}
        className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 min-h-[52px] active:scale-[0.99] select-none ${
          isChecked
            ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="shrink-0">
            {isChecked ? (
              <div 
                className="w-5 h-5 rounded-lg flex items-center justify-center shadow-xs text-white transition-colors"
                style={{ backgroundColor: checkInfo.checkedByColor || (checkInfo.isMine ? (collabUser.color || '#10b981') : '#8b5cf6') }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-extrabold block truncate ${
                isChecked ? 'text-stone-700 dark:text-stone-200' : 'text-stone-900 dark:text-white'
              }`}>
                {item.name}
              </span>

              {item.isCustom && (
                <span 
                  className="inline-flex items-center gap-0.5 text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30 shrink-0" 
                  title="Món bổ sung do bạn tự thêm"
                >
                  <span>✨ Tự thêm</span>
                </span>
              )}

              {item.dishCount && item.dishCount > 1 && (
                <span 
                  className="inline-flex items-center gap-0.5 text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0" 
                  title={`Dùng cho ${item.dishCount} món: ${item.dishNames?.join(', ')}`}
                >
                  <span>{item.dishCount} món</span>
                </span>
              )}

              {isChecked && (
                <span className={`inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border ${
                  checkInfo.isMine 
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' 
                    : `${checkInfo.style.badgeBg} ${checkInfo.style.badgeText} ${checkInfo.style.badgeBorder}`
                }`}>
                  <UserCheck className="w-2.5 h-2.5 shrink-0" />
                  <span>{checkInfo.isMine ? '✓ Đã vào giỏ' : `${checkInfo.checkedBy || 'Đã mua'}`}</span>
                </span>
              )}

              {checkInfo.buyerCount > 1 && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/35 animate-pulse">
                  <Users className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{checkInfo.buyerCount} người mua trùng!</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className={`text-[10px] font-semibold ${
                isChecked ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
              }`}>
                ~{(item.cost || 0).toLocaleString('vi-VN')} đ
              </span>

              {item.dishNames && item.dishNames.length > 1 && (
                <span 
                  className="text-[9.5px] text-stone-400 dark:text-stone-500 truncate max-w-[170px] sm:max-w-xs" 
                  title={`Dùng cho: ${item.dishNames.join(', ')}`}
                >
                  • {item.dishCount} món ({item.dishNames.slice(0, 2).join(', ')})
                </span>
              )}

              {inFridge && (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFridgeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 px-1.5 py-0.2 rounded-md border border-sky-200 dark:border-sky-800 transition-colors shrink-0"
                  title="Bấm để xem chi tiết trong tủ lạnh"
                >
                  <span>🧊 Có sẵn: {inFridge.quantity}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Grocery aisle category badge: compact icon on mobile, full text on tablet+ */}
          <span className={`text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg border ${aisle.badgeBg} ${aisle.badgeText} ${aisle.badgeBorder}`}>
            <span>{aisle.icon}</span>
            <span className="hidden sm:inline ml-1">{aisle.shortName}</span>
          </span>

          {/* Normalized Quantity badge */}
          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 sm:px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 whitespace-nowrap">
            {item.displayAmount}
          </span>

          {/* Custom Item Delete Button */}
          {item.isCustom && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteItem(item);
              }}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-90"
              title="Xóa món này khỏi giỏ đi chợ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Multi-buyer Plus Button & Counter */}
          <div className="flex items-center gap-1">
            {checkInfo.buyerCount > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecrementBuyer(item);
                }}
                className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-black flex items-center justify-center border border-slate-300 dark:border-slate-700 transition-all active:scale-90 cursor-pointer"
                title="Bỏ bớt 1 người mua trùng"
              >
                <Minus className="w-3 h-3 stroke-[3]" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrementBuyer(item);
              }}
              className={`h-7 px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] font-black transition-all active:scale-90 border shadow-xs cursor-pointer ${
                checkInfo.buyerCount > 1
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/20'
                  : isChecked
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
              title="Đánh dấu thêm người mua món này (nhiều người cùng mua)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              {checkInfo.buyerCount > 1 && (
                <span className="flex items-center gap-0.5 font-black">
                  <Users className="w-2.5 h-2.5" />
                  <span>{checkInfo.buyerCount}</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      
      {/* Web Guest Viewer Mode Callout Banner */}
      {isWebGuestViewer && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-2xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-stone-900 dark:text-white text-xs">
                  Chế Độ Khách Xem Đi Chợ (Web Sheet)
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-snug">
                Bạn đang xem & cùng tích chọn mua chung. Để tự động lên thực đơn 7 ngày, mâm cơm 3 món & quản lý tủ lạnh, hãy cài app MealWise.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openDownloadAppModal()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Tải App MealWise</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[11px] font-bold shrink-0">
            <ShoppingCart className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
            <span>Tự Động Gom Nguyên Liệu</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Smart Fridge & Leftovers Button */}
            <button
              type="button"
              onClick={() => {
                if (isWebGuestViewer) {
                  openDownloadAppModal('Tủ Lạnh & Gợi Ý Món Vét Tủ');
                  return;
                }
                setActiveTab('pantry');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
              title="Xem tủ lạnh, kiểm tra đồ thừa và nguyên liệu sẵn có"
            >
              <span className="text-xs">🧊</span>
              <span>Tủ Lạnh & Đồ Thừa</span>
              {isWebGuestViewer && <span className="text-[9px] text-amber-600 dark:text-amber-400 font-black">🔒 App</span>}
              {!isWebGuestViewer && (
                <span className="px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-black">
                  {pantryItems.length}
                </span>
              )}
            </button>

            {/* Online Price Simulation Button */}
            <button
              type="button"
              onClick={() => setShowPriceSimulation(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shrink-0"
              title="Mô phỏng và so sánh giỏ hàng online giữa các chuỗi siêu thị"
            >
              <TrendingUp className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>Mô Phỏng Giá Online</span>
              {showPriceSimulation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Quick-Add Depleted Pantry Essentials Button */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-black transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
              title="Bổ sung món hoặc gia vị bếp vừa hết vào danh sách đi chợ tuần"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Thêm Món / Gia Vị Hết</span>
              {(extraGroceryItems || []).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-stone-900 text-white text-[10px] font-black">
                  +{(extraGroceryItems || []).length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-lg font-black tracking-tight text-stone-900 dark:text-white">
            Danh Sách Đi Chợ Thông Minh
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
            Tự động gộp nguyên liệu trùng lặp, chuẩn hóa đơn vị và phân luồng theo quầy mua sắm tối ưu.
          </p>
        </div>

        {/* Smart Pantry Exemption Reassurance Banner with direct pop-up trigger */}
        <div className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-900 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <span className="text-base shrink-0 mt-0.5 sm:mt-0">✨</span>
            <p className="text-xs leading-snug font-medium text-amber-900 dark:text-amber-200 break-words">
              Đã tự động <strong className="font-bold">ẩn gia vị phổ thông có sẵn</strong> trong bếp gồm nước mắm, muối, đường và dầu ăn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shrink-0 transition-all active:scale-95 shadow-2xs cursor-pointer whitespace-nowrap min-h-[36px] flex items-center justify-center"
            title="Bổ sung gia vị hoặc món ngoài kế hoạch"
          >
            + Bổ sung
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 font-medium">
          <span>{totalCount} nguyên liệu ({overallCheckedCount} đã mua)</span>
          <span className="font-extrabold text-stone-900 dark:text-white">
            Ước tính: {totalCostEstimate.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Online Price Simulation Card (Expandable) */}
      {showPriceSimulation && (
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1A1918] border-2 border-amber-500/40 shadow-xl space-y-3.5 text-stone-900 dark:text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Mô Phỏng Giá Đi Chợ Online 4 Kênh
                </h3>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  Dự toán giỏ hàng tuần ({totalCount} món) khi đặt giao tận nhà
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPriceSimulation(false)}
              className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-stone-100 dark:bg-[#252220]"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Chợ Dân Sinh */}
            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span>🏪</span> Chợ Dân Sinh
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                  Tiết kiệm nhất
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[11px] text-stone-600 dark:text-stone-300">Tổng giỏ hàng:</span>
                <span className="text-sm font-black text-stone-900 dark:text-white">
                  {totalCostEstimate.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                Phí ship: 0 đ • Tự tay chọn thịt cá tươi ngon nhất.
              </p>
            </div>

            {/* WinMart Online */}
            {(() => {
              const base = Math.round(totalCostEstimate * STORE_CHANNELS['winmart'].multiplier);
              const ship = totalCostEstimate >= STORE_CHANNELS['winmart'].freeShippingThreshold ? 0 : STORE_CHANNELS['winmart'].shippingFee;
              const voucher = totalCostEstimate >= 200000 ? STORE_CHANNELS['winmart'].onlineVoucher : 0;
              const finalPrice = base + ship - voucher;
              const diff = finalPrice - totalCostEstimate;

              return (
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span>🔴</span> WinMart Online
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold">
                      Giao 1-2h
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">Tổng giỏ online:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-300">
                        {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="block text-[10px] text-stone-500 dark:text-stone-400">
                        ({diff >= 0 ? `+${diff.toLocaleString('vi-VN')} đ` : `-${Math.abs(diff).toLocaleString('vi-VN')} đ`})
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                    Thịt mát MEATDeli chuẩn sạch • {ship === 0 ? 'Freeship đơn > 300k' : `Ship ${ship.toLocaleString('vi-VN')} đ`}.
                  </p>
                </div>
              );
            })()}

            {/* Bách Hóa Xanh Online */}
            {(() => {
              const base = Math.round(totalCostEstimate * STORE_CHANNELS['bach-hoa-xanh'].multiplier);
              const ship = totalCostEstimate >= STORE_CHANNELS['bach-hoa-xanh'].freeShippingThreshold ? 0 : STORE_CHANNELS['bach-hoa-xanh'].shippingFee;
              const voucher = totalCostEstimate >= 200000 ? STORE_CHANNELS['bach-hoa-xanh'].onlineVoucher : 0;
              const finalPrice = base + ship - voucher;
              const diff = finalPrice - totalCostEstimate;

              return (
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span>🟢</span> Bách Hóa Xanh
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                      Giao hẹn giờ
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">Tổng giỏ online:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-700 dark:text-amber-400">
                        {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="block text-[10px] text-stone-500 dark:text-stone-400">
                        ({diff >= 0 ? `+${diff.toLocaleString('vi-VN')} đ` : `-${Math.abs(diff).toLocaleString('vi-VN')} đ`})
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                    Gia vị đồ khô giá sỉ • {ship === 0 ? 'Freeship đơn > 250k' : `Ship ${ship.toLocaleString('vi-VN')} đ`}.
                  </p>
                </div>
              );
            })()}

            {/* Sạp Đối Tác */}
            {(() => {
              const base = Math.round(totalCostEstimate * STORE_CHANNELS['sap-doi-tac'].multiplier);
              const ship = totalCostEstimate >= STORE_CHANNELS['sap-doi-tac'].freeShippingThreshold ? 0 : STORE_CHANNELS['sap-doi-tac'].shippingFee;
              const finalPrice = base + ship;
              const diff = finalPrice - totalCostEstimate;

              return (
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <span>🏮</span> Sạp Đối Tác
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold">
                      Đặc sản 3 miền
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">Tổng giỏ hàng:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-purple-700 dark:text-purple-300">
                        {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="block text-[10px] text-stone-500 dark:text-stone-400">
                        (+{diff.toLocaleString('vi-VN')} đ)
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                    Mắm tôm Bắc, sấu tươi, tương bần truyền thống không phụ gia.
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              💡 <strong>Mẹo tiết kiệm MealWise:</strong> Đi chợ dân sinh cho thịt cá tươi, và đặt Bách Hóa Xanh/WinMart cho gia vị đồ khô để vừa tươi ngon vừa tiết kiệm tối đa!
            </span>
          </div>
        </div>
      )}

      {/* STREAMLINED POP-UP BANNER / MODAL: QUICK ADD DEPLETED ESSENTIALS & CUSTOM ITEMS */}
      {isQuickAddOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsQuickAddOpen(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[88vh] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl rounded-t-[28px] sm:rounded-3xl flex flex-col overflow-hidden animate-slideUp sm:animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="pt-2.5 pb-1 sm:hidden flex justify-center">
              <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
            </div>

            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-2xs">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider truncate">
                    Bổ Sung Nhu Yếu Phẩm & Gia Vị Hết
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    Gom tất cả vào 1 chuyến đi chợ tuần duy nhất, không lo quên đồ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              
              {/* SECTION 1: CUSTOM ITEM INPUT (QUICK FORM) */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <span>✍️</span> Tự nhập món / đồ gia dụng bất kỳ
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    Thêm tự do
                  </span>
                </div>

                <form onSubmit={handleAddCustomItem} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ví dụ: Giấy ăn, Cà phê lon, Nước rửa chén, Bánh mì..."
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-white placeholder:text-stone-400 shadow-2xs"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        placeholder="Số lượng"
                        value={customItemAmount}
                        onChange={(e) => setCustomItemAmount(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-white text-center shadow-2xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        placeholder="Đơn vị (chai, gói...)"
                        value={customItemUnit}
                        onChange={(e) => setCustomItemUnit(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-white text-center shadow-2xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="submit"
                        className="w-full h-full min-h-[36px] px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Thêm Vào Giỏ</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* SECTION 2: 1-TAP QUICK ADD FOR DEPLETED PANTRY STAPLES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <span>⚡</span> Bổ sung nhanh 1 chạm (gia vị hay hết):
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    Chạm để thêm
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {DEPLETED_PANTRY_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-amber-50/80 dark:bg-stone-800/60 dark:hover:bg-amber-950/40 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 text-stone-900 dark:text-stone-100 text-left transition-all active:scale-95 cursor-pointer shadow-2xs group"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-xs font-bold block truncate group-hover:text-amber-800 dark:group-hover:text-amber-300">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                          {preset.amount} {preset.unit} • ~{(preset.cost / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 text-amber-700 group-hover:text-stone-950 flex items-center justify-center shrink-0 transition-colors">
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Added Custom Items notification */}
              {(extraGroceryItems || []).length > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                  <span>
                    ✓ Đã thêm <strong>{(extraGroceryItems || []).length} món bổ sung</strong> vào giỏ tuần này!
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="font-bold underline cursor-pointer"
                  >
                    Xem giỏ hàng
                  </button>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-3 sm:p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between gap-2 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {(extraGroceryItems || []).length > 0 
                  ? `Đang có ${(extraGroceryItems || []).length} món tự thêm`
                  : 'Chưa thêm món bổ sung nào'}
              </span>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-bold text-xs hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                Xong & Xem Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catering Sync Notification Banner */}
      {extraGroceryItems && extraGroceryItems.length > 0 && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Gồm {extraGroceryItems.length} nguyên liệu tiệc / catering
              </p>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                Đã nhân hệ số khách tiệc tự động
              </p>
            </div>
          </div>
          <button
            onClick={clearExtraGrocery}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 text-[11px] font-bold shrink-0 transition-colors"
          >
            Gỡ tiệc
          </button>
        </div>
      )}

      {/* COMPACT COLLAB STATUS PILL (WHEN LOBBY IS CLOSED) */}
      {isCollabActive && collabRoom && !isLobbyOpen && (
        <div 
          className="p-3 px-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-2 text-xs shadow-xs animate-fade-in"
        >
          <div 
            onClick={() => {
              setIsLobbyOpen(true);
              setTimeout(() => {
                lobbyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            title="Bấm để mở sảnh phòng mua chung"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="min-w-0">
              <span className="font-extrabold text-amber-950 dark:text-amber-200 truncate block">
                Phòng Mua Chung: #{collabRoom.roomId} (Live Sync • {formatTtlRemaining(collabRoom.expiresAt, collabRoom.createdAt)})
              </span>
              <span className="text-[10.5px] text-amber-800/80 dark:text-amber-300/80 truncate block">
                Chủ phòng: {collabRoom.hostName} • Danh sách riêng của bạn được lưu an toàn 🛡️
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                openConfirmModal({
                  title: 'Quay Lại Danh Sách Cá Nhân',
                  message: 'Rời phòng mua chung để quay lại danh sách đi chợ và thực đơn riêng của bạn?',
                  confirmLabel: 'Quay Lại Của Tôi',
                  cancelLabel: 'Ở Lại Phòng',
                  isDanger: false,
                  onConfirm: () => {
                    leaveCollabRoom();
                    setIsLobbyOpen(false);
                  }
                });
              }}
              className="text-[10.5px] font-bold text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              title="Quay lại danh sách riêng"
            >
              Quay lại của tôi
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLobbyOpen(true);
                setTimeout(() => {
                  lobbyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
              className="text-[11px] font-black text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              Mở Sảnh ▼
            </button>
          </div>
        </div>
      )}

      {/* COLLABORATIVE ROOM ACTIVE LOBBY: ONLY OPEN IF USER CLICKS ON THE BUTTON */}
      {isCollabActive && collabRoom && isLobbyOpen && (
        <div ref={lobbyRef} className="p-3.5 sm:p-4 rounded-3xl bg-amber-50/50 dark:bg-stone-900 border border-amber-500/30 dark:border-amber-500/30 text-slate-900 dark:text-white space-y-3 shadow-sm animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Phòng Mua Chung: #{collabRoom.roomId}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-300/60 dark:border-amber-500/30">
                    Live Sync
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/60 dark:border-amber-500/30 flex items-center gap-1" title="Thời hạn phòng tối đa 1 giờ">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTtlRemaining(collabRoom.expiresAt, collabRoom.createdAt)}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                  Chủ phòng: <strong className="text-slate-800 dark:text-slate-200">{collabRoom.hostName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-[11.5px] font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Xem liên kết & mã QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mời / QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openConfirmModal({
                    title: 'Rời Phòng Mua Chung',
                    message: 'Bạn có chắc chắn muốn rời khỏi phòng mua chung này?',
                    confirmLabel: 'Rời Phòng',
                    cancelLabel: 'Ở Lại',
                    isDanger: true,
                    onConfirm: () => {
                      leaveCollabRoom();
                      setIsLobbyOpen(false);
                    }
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-[11px] font-bold transition-colors cursor-pointer"
                title="Rời phòng mua chung"
              >
                Rời phòng
              </button>

              <button
                type="button"
                onClick={() => setIsLobbyOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Đóng sảnh mua chung (Thu gọn)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Personal Data Protection Reassurance */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 text-xs text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🛡️</span>
              <div className="min-w-0">
                <p className="font-extrabold text-[11px] leading-tight text-emerald-900 dark:text-emerald-200">
                  Thực đơn & danh sách riêng của bạn vẫn an toàn 100%
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                  Bạn đang xem giỏ đi chợ chung của phòng. Rời phòng để quay về danh sách cá nhân bất kỳ lúc nào.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                openConfirmModal({
                  title: 'Quay Lại Danh Sách Cá Nhân',
                  message: 'Rời phòng mua chung để quay lại danh sách đi chợ và thực đơn riêng của bạn?',
                  confirmLabel: 'Quay Lại Của Tôi',
                  cancelLabel: 'Ở Lại Phòng',
                  isDanger: false,
                  onConfirm: () => {
                    leaveCollabRoom();
                    setIsLobbyOpen(false);
                  }
                });
              }}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-bold text-[10.5px] border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              Quay Lại Của Tôi
            </button>
          </div>

          {/* Shoppers in room Roster Bar */}
          <div className="pt-2.5 border-t border-emerald-200/60 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Người đi chợ trong phòng:
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomShopperName(collabUser.name);
                  setSelectedColor(collabUser.color || '#10b981');
                  setIsProfileModalOpen(true);
                }}
                className="text-[11px] font-black text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Đổi tên & màu của bạn</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Current User Chip */}
              <div
                onClick={() => {
                  setCustomShopperName(collabUser.name);
                  setSelectedColor(collabUser.color || '#10b981');
                  setIsProfileModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black border bg-white dark:bg-slate-800 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs"
                style={{
                  borderColor: collabUser.color || '#10b981',
                  color: collabUser.color || '#10b981'
                }}
                title="Bấm để đổi tên hoặc màu của bạn"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: collabUser.color || '#10b981' }} />
                <span>{collabUser.name} (Bạn)</span>
                <span 
                  className="px-1.5 py-0.2 rounded-md text-[10px] font-bold"
                  style={{
                    backgroundColor: `${collabUser.color || '#10b981'}20`,
                    color: collabUser.color || '#10b981'
                  }}
                >
                  {myCheckedCount} món
                </span>
                <Edit3 className="w-2.5 h-2.5 opacity-60" />
              </div>

              {/* Other Active Shoppers */}
              {Object.values(collabParticipants || {})
                .filter(p => p.id !== collabUser.id)
                .map(p => {
                  const pCount = effectiveList.filter(it => {
                    const info = getItemCheckInfo(it);
                    return info.isChecked && (info.checkedById ? info.checkedById === p.id : info.checkedBy === p.name);
                  }).length;
                  return (
                    <div
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black border bg-white dark:bg-slate-800 transition-all shadow-xs"
                      style={{
                        borderColor: p.color || '#8b5cf6',
                        color: p.color || '#8b5cf6'
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#8b5cf6' }} />
                      <span>{p.name}</span>
                      <span 
                        className="px-1.5 py-0.2 rounded-md text-[10px] font-bold"
                        style={{
                          backgroundColor: `${p.color || '#8b5cf6'}20`,
                          color: p.color || '#8b5cf6'
                        }}
                      >
                        {pCount} món
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Collaborative breakdown stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
            <div className="p-2 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-xs">
              <span className="block text-stone-500 dark:text-stone-400 font-semibold text-[10px]">Chưa ai mua</span>
              <strong className="text-stone-900 dark:text-stone-100 text-sm font-black">{unclaimedCount} món</strong>
            </div>
            
            <div 
              className="p-2 rounded-2xl bg-white dark:bg-[#1A1918] border shadow-xs transition-all"
              style={{
                borderColor: `${collabUser.color || '#10b981'}50`
              }}
            >
              <span className="block font-semibold text-[10px]" style={{ color: collabUser.color || '#10b981' }}>
                Bạn đã nhặt
              </span>
              <strong className="text-sm font-black" style={{ color: collabUser.color || '#10b981' }}>
                {myCheckedCount} món
              </strong>
            </div>

            <div className="p-2 rounded-2xl bg-white dark:bg-[#1A1918] border border-violet-200 dark:border-violet-800/60 shadow-xs">
              <span className="block text-violet-700 dark:text-violet-400 font-semibold text-[10px]">
                Người khác nhặt
              </span>
              <strong className="text-violet-700 dark:text-violet-300 text-sm font-black">{othersCheckedCount} món</strong>
            </div>
          </div>

          {/* Collaborative filter tabs */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-stone-500 dark:text-stone-400 font-bold shrink-0 text-[10px]">Lọc theo người mua:</span>
            {[
              { id: 'all', label: `Tất cả (${totalCount})` },
              { id: 'unclaimed', label: `Chưa mua (${unclaimedCount})` },
              { id: 'mine', label: `Tôi nhặt (${myCheckedCount})` },
              { id: 'others', label: `Người khác (${othersCheckedCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCollabFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  collabFilter === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                    : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#252220] border border-[#E8E2D8] dark:border-[#252220]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Collapse Lobby Button */}
          <button
            type="button"
            onClick={() => setIsLobbyOpen(false)}
            className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>▲ Thu Gọn Sảnh Mua Chung</span>
          </button>
        </div>
      )}

      {/* REAL-LIFE GROCERY AISLE FILTERING TABS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Quầy Thực Phẩm</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700/50">
              {displayedList.length} món
            </span>
          </div>

          <div className="flex items-center gap-2">
            {deletedItemNames.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDeletedItemNames([]);
                  localStorage.removeItem('mealwise_deleted_grocery_items');
                  showToast('🔄 Đã khôi phục các món đã xóa!');
                }}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                title="Khôi phục lại các nguyên liệu đã xóa"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Khôi phục ({deletedItemNames.length})</span>
              </button>
            )}

            {overallCheckedCount > 0 && (
              <button
                onClick={clearGroceryCheckedItems}
                className="text-[11px] font-bold text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Đặt lại toàn bộ trạng thái đã mua"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Bỏ chọn tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal scrollable aisle tabs (6 aisles) */}
        <div className="flex items-center gap-1 p-1 overflow-x-auto scrollbar-none sm:grid sm:grid-cols-6 sm:gap-1.5 rounded-2xl bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800/70 shadow-2xs">
          {/* Tất Cả */}
          <button
            onClick={() => setAisleFilter('all')}
            className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 min-h-[40px] flex-1 shrink-0 cursor-pointer active:scale-95 select-none ${
              aisleFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm font-black'
                : 'bg-white/80 hover:bg-white dark:bg-stone-850/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-800/60 shadow-2xs'
            }`}
          >
            <span className="text-xs">🧺</span>
            <span className="text-[11px] whitespace-nowrap">Tất Cả</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
              aisleFilter === 'all'
                ? 'bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-950'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>
              {aisleCounts['all']}
            </span>
          </button>

          {/* Thịt & Trứng */}
          <button
            onClick={() => setAisleFilter('thit')}
            className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 min-h-[40px] flex-1 shrink-0 cursor-pointer active:scale-95 select-none ${
              aisleFilter === 'thit'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm font-black'
                : 'bg-white/80 hover:bg-white dark:bg-stone-850/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-800/60 shadow-2xs'
            }`}
          >
            <span className="text-xs">🥩</span>
            <span className="text-[11px] whitespace-nowrap">
              <span className="sm:hidden">Thịt/Trứng</span>
              <span className="hidden sm:inline">Thịt & Trứng</span>
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
              aisleFilter === 'thit'
                ? 'bg-rose-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>
              {aisleCounts['thit']}
            </span>
          </button>

          {/* Hải Sản */}
          <button
            onClick={() => setAisleFilter('hai-san')}
            className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 min-h-[40px] flex-1 shrink-0 cursor-pointer active:scale-95 select-none ${
              aisleFilter === 'hai-san'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm font-black'
                : 'bg-white/80 hover:bg-white dark:bg-stone-850/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-800/60 shadow-2xs'
            }`}
          >
            <span className="text-xs">🦐</span>
            <span className="text-[11px] whitespace-nowrap">Hải Sản</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
              aisleFilter === 'hai-san'
                ? 'bg-sky-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>
              {aisleCounts['hai-san']}
            </span>
          </button>

          {/* Rau Củ & Nấm */}
          <button
            onClick={() => setAisleFilter('rau-cu')}
            className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 min-h-[40px] flex-1 shrink-0 cursor-pointer active:scale-95 select-none ${
              aisleFilter === 'rau-cu'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm font-black'
                : 'bg-white/80 hover:bg-white dark:bg-stone-850/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-800/60 shadow-2xs'
            }`}
          >
            <span className="text-xs">🥬</span>
            <span className="text-[11px] whitespace-nowrap">
              <span className="sm:hidden">Rau Củ</span>
              <span className="hidden sm:inline">Rau Củ & Nấm</span>
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
              aisleFilter === 'rau-cu'
                ? 'bg-emerald-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>
              {aisleCounts['rau-cu']}
            </span>
          </button>

          {/* Trái Cây */}
          <button
            onClick={() => setAisleFilter('trai-cay')}
            className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 min-h-[40px] flex-1 shrink-0 cursor-pointer active:scale-95 select-none ${
              aisleFilter === 'trai-cay'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm font-black'
                : 'bg-white/80 hover:bg-white dark:bg-stone-850/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-800/60 shadow-2xs'
            }`}
          >
            <span className="text-xs">🍎</span>
            <span className="text-[11px] whitespace-nowrap">Trái Cây</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
              aisleFilter === 'trai-cay'
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>
              {aisleCounts['trai-cay']}
            </span>
          </button>

          {/* Gia Vị & Đồ Khô */}
          <button
            onClick={() => setAisleFilter('gia-vi-kho')}
            className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 min-h-[40px] flex-1 shrink-0 cursor-pointer active:scale-95 select-none ${
              aisleFilter === 'gia-vi-kho'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm font-black'
                : 'bg-white/80 hover:bg-white dark:bg-stone-850/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-800/60 shadow-2xs'
            }`}
          >
            <span className="text-xs">🧂</span>
            <span className="text-[11px] whitespace-nowrap">
              <span className="sm:hidden">Gia Vị</span>
              <span className="hidden sm:inline">Gia Vị & Khô</span>
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
              aisleFilter === 'gia-vi-kho'
                ? 'bg-purple-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>
              {aisleCounts['gia-vi-kho']}
            </span>
          </button>
        </div>
      </div>

      {/* CHECKLIST ITEMS ORGANIZED BY REAL-LIFE SHOPPING AISLE */}
      <div className="space-y-4">
        {(['thit', 'hai-san', 'rau-cu', 'trai-cay', 'gia-vi-kho'] as const).map(aisleKey => {
          const aisle = GROCERY_AISLES[aisleKey];
          const aisleItems = displayedList.filter(i => i.aisleCategory === aisleKey);
          if (aisleItems.length === 0) return null;

          const pendingItems = aisleItems.filter(i => !getItemCheckInfo(i).isChecked);
          const cartedItems = aisleItems.filter(i => getItemCheckInfo(i).isChecked);
          const isCartExpanded = expandedAisleCarts[aisleKey] !== false;

          return (
            <div key={aisleKey} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="text-sm">{aisle.icon}</span>
                  <span>Quầy {aisle.name}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {cartedItems.length}/{aisleItems.length} đã vào giỏ
                </span>
              </div>

              {/* Pending Items to buy: ALWAYS at the top */}
              <div className="space-y-1.5">
                {pendingItems.map(renderGroceryItemRow)}
                {pendingItems.length === 0 && cartedItems.length > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                    <span>🎉</span>
                    <span>Đã gom đủ toàn bộ nguyên liệu quầy {aisle.name.toLowerCase()}!</span>
                  </div>
                )}
              </div>

              {/* In-Cart Items: Pushed to bottom of the aisle section */}
              {cartedItems.length > 0 && (
                <div className="pt-2 mt-2 border-t border-dashed border-emerald-300/60 dark:border-emerald-800/60 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleAisleCart(aisleKey)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-[11px] font-black text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <span>🛒</span>
                      <span>Đã Cho Vào Giỏ ({cartedItems.length} món)</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300">
                      <span>{isCartExpanded ? 'Thu gọn' : 'Xem món đã nhặt'}</span>
                      {isCartExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </span>
                  </button>

                  {isCartExpanded && (
                    <div className="space-y-1.5 animate-fadeIn">
                      {cartedItems.map(renderGroceryItemRow)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state for current filter */}
        {displayedList.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 italic rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            {totalCount === 0 
              ? 'Chưa có món nào trong thực đơn tuần hoặc kế hoạch tiệc.' 
              : `Không có nguyên liệu nào thuộc quầy "${aisleFilter === 'all' ? 'Tất Cả' : GROCERY_AISLES[aisleFilter].name}".`}
          </div>
        )}
      </div>

      {/* STICKY BOTTOM PROGRESS BAR (STICKY ABOVE BOTTOM TAB BAR AT bottom-16) */}
      <div className="sticky bottom-16 z-30 -mx-3 sm:-mx-4 -mb-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 shadow-2xl space-y-2">
        
        {/* Progress status & percentage */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-white">
            {progressPercent === 100 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã gom đủ {totalCount} món!
              </span>
            ) : (
              <span>Đã mua: {overallCheckedCount} / {totalCount} món ({progressPercent}%)</span>
            )}
          </div>
          <span className="text-xs font-black text-stone-900 dark:text-white">
            {totalCostEstimate.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-stone-900 dark:bg-stone-100 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Collaborative Share & Zalo Export Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Button 1: Collaborative Live Share */}
          <button
            type="button"
            onClick={async () => {
              if (collabRoom) {
                const nextState = !isLobbyOpen;
                setIsLobbyOpen(nextState);
                if (nextState) {
                  setTimeout(() => {
                    lobbyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }
              } else {
                await startCollabRoom(allList, `Giỏ Đi Chợ Tuần Này (${allList.length} món)`);
                setIsLobbyOpen(true);
                setTimeout(() => {
                  lobbyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }
            }}
            className="py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px] cursor-pointer bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-950 shadow-md font-black"
            title={collabRoom ? (isLobbyOpen ? 'Đóng sảnh mua chung' : 'Mở sảnh mua chung') : 'Tạo phòng mua chung'}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {collabRoom
                ? (isLobbyOpen ? 'Đóng Sảnh (Live)' : 'Mua Chung (Live)')
                : 'Chia Sẻ Mua Chung'}
            </span>
            {collabRoom && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            )}
          </button>

          {/* Button 2: Quick Zalo Export */}
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px] cursor-pointer"
            title="Sao chép toàn bộ danh sách dạng văn bản gửi Zalo"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-500" />}
            <span className="truncate">
              {copied ? 'Đã Chép Zalo' : (
                <>
                  <span className="sm:hidden">Xuất Zalo Đi Chợ</span>
                  <span className="hidden sm:inline">Xuất Zalo Đi Chợ</span>
                </>
              )}
            </span>
          </button>
        </div>

      </div>

      {/* Smart Fridge & Leftover Modal */}
      <FridgeLeftoverModal
        isOpen={isFridgeModalOpen}
        onClose={() => setIsFridgeModalOpen(false)}
      />

      {/* Shopper Profile Customization Modal */}
      {isProfileModalOpen && (
        <div 
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsProfileModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scale-up text-stone-900 dark:text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#252220]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Hồ Sơ Người Đi Chợ</h4>
                  <p className="text-[10.5px] text-stone-500 dark:text-stone-400">Phân biệt rõ ràng giữa bạn và người mua cùng</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#252220]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                Tên hiển thị của bạn:
              </label>
              <input
                type="text"
                value={customShopperName}
                onChange={e => setCustomShopperName(e.target.value)}
                placeholder="VD: Tuấn, Lan, Mẹ, Bố..."
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                maxLength={25}
              />
              {/* Quick role preset chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  { label: '👨 Bố', name: 'Bố' },
                  { label: '👩 Mẹ', name: 'Mẹ' },
                  { label: '🌸 Vợ', name: 'Vợ' },
                  { label: '💼 Chồng', name: 'Chồng' },
                  { label: '🛒 Bạn đi chợ', name: 'Bạn đi chợ' },
                  { label: '👑 Chủ phòng', name: 'Chủ phòng' }
                ].map(chip => (
                  <button
                    key={chip.name}
                    type="button"
                    onClick={() => setCustomShopperName(chip.name)}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#252220] hover:bg-stone-200 dark:hover:bg-stone-700 text-[10px] font-bold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                Màu sắc đại diện cho các món bạn nhặt:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SHOPPER_PALETTE.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedColor(p.hex)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor.toLowerCase() === p.hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-stone-900 dark:ring-white scale-105' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: p.hex }}
                    title={p.label}
                  >
                    {selectedColor.toLowerCase() === p.hex.toLowerCase() && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-[#252220] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalName = customShopperName.trim() || collabUser.name || 'Người đi chợ';
                  const finalColor = selectedColor || collabUser.color || '#10b981';
                  updateCollabUserProfile(finalName, finalColor);
                  setIsProfileModalOpen(false);
                  showToast(`✓ Đã lưu hồ sơ: ${finalName}!`);
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black shadow-sm transition-all cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
