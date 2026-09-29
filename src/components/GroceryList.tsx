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
  Lock
} from 'lucide-react';
import { VietnameseMealSet, Recipe, StoreChannel, CollabCartItem, CollabShopper } from '../types';
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

// Pure Helper: Safely parse numerical amount from number, string, or fraction
export function parseAmount(val: number | string | undefined | null): number {
  if (val === null || val === undefined) return 1;
  if (typeof val === 'number') {
    return Number.isFinite(val) && val > 0 ? val : 1;
  }
  if (typeof val === 'string') {
    const sanitized = val.trim().replace(',', '.');
    if (sanitized.includes('/')) {
      const parts = sanitized.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        return Math.max(0.01, num / den);
      }
    }
    const parsed = parseFloat(sanitized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
  return 1;
}

// Pure Helper: Normalize convertible Vietnamese units and identify grouping families
export interface NormalizedIngredientInfo {
  cleanName: string;
  baseAmount: number;
  baseUnit: string;
  family: 'weight' | 'volume' | 'spoon_soup' | 'spoon_tea' | 'spoon' | 'count' | 'other';
  groupKey: string;
}

export function normalizeIngredientUnitAndAmount(
  rawName: string,
  rawAmount: number | string | undefined | null,
  rawUnit: string | undefined | null
): NormalizedIngredientInfo {
  const cleanName = (rawName || '').trim();
  const parsedAmt = parseAmount(rawAmount);
  const u = (rawUnit || '').trim().toLowerCase();

  // 1. Weight family: g, gram, gam, kg, kilogram, kí, ký, lạng, lang
  if (u === 'kg' || u === 'kilogram' || u === 'kí' || u === 'ký') {
    return {
      cleanName,
      baseAmount: parsedAmt * 1000,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${cleanName.toLowerCase()}__weight`
    };
  }
  if (u === 'lạng' || u === 'lang') {
    return {
      cleanName,
      baseAmount: parsedAmt * 100,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${cleanName.toLowerCase()}__weight`
    };
  }
  if (u === 'g' || u === 'gram' || u === 'gam' || u === 'gr') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'g',
      family: 'weight',
      groupKey: `${cleanName.toLowerCase()}__weight`
    };
  }

  // 2. Volume family: l, lít, lit, ml, mililit
  if (u === 'l' || u === 'lít' || u === 'lit') {
    return {
      cleanName,
      baseAmount: parsedAmt * 1000,
      baseUnit: 'ml',
      family: 'volume',
      groupKey: `${cleanName.toLowerCase()}__volume`
    };
  }
  if (u === 'ml' || u === 'mililit') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'ml',
      family: 'volume',
      groupKey: `${cleanName.toLowerCase()}__volume`
    };
  }

  // 3. Spoons family: muỗng canh vs thìa canh
  if (u === 'muỗng canh' || u === 'thìa canh' || u === 'muong canh' || u === 'thia canh' || u === 'tbsp') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'muỗng canh',
      family: 'spoon_soup',
      groupKey: `${cleanName.toLowerCase()}__spoon_soup`
    };
  }
  if (u === 'muỗng cà phê' || u === 'thìa cà phê' || u === 'muỗng cafe' || u === 'thìa cafe' || u === 'tsp') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'muỗng cà phê',
      family: 'spoon_tea',
      groupKey: `${cleanName.toLowerCase()}__spoon_tea`
    };
  }
  if (u === 'muỗng' || u === 'thìa') {
    return {
      cleanName,
      baseAmount: parsedAmt,
      baseUnit: 'muỗng',
      family: 'spoon',
      groupKey: `${cleanName.toLowerCase()}__spoon`
    };
  }

  // 4. Default / Other units: quả, củ, bó, miếng, tép, nhánh, bát, gói, ít...
  const safeUnit = rawUnit && rawUnit.trim() ? rawUnit.trim() : 'phần';
  return {
    cleanName,
    baseAmount: parsedAmt,
    baseUnit: safeUnit,
    family: 'other',
    groupKey: `${cleanName.toLowerCase()}__${safeUnit.toLowerCase()}`
  };
}

// Pure Helper: Format accumulated base quantity back to smart readable Vietnamese units
export function formatDisplayAmountAndUnit(
  baseAmount: number,
  family: NormalizedIngredientInfo['family'],
  baseUnit: string
): { amount: number; unit: string; displayStr: string } {
  if (family === 'weight') {
    if (baseAmount >= 1000) {
      const kg = Math.round((baseAmount / 1000) * 100) / 100;
      return {
        amount: kg,
        unit: 'kg',
        displayStr: `${kg} kg`
      };
    }
    const g = Math.round(baseAmount * 10) / 10;
    return {
      amount: g,
      unit: 'g',
      displayStr: `${g} g`
    };
  }

  if (family === 'volume') {
    if (baseAmount >= 1000) {
      const l = Math.round((baseAmount / 1000) * 100) / 100;
      return {
        amount: l,
        unit: 'lít',
        displayStr: `${l} lít`
      };
    }
    const ml = Math.round(baseAmount * 10) / 10;
    return {
      amount: ml,
      unit: 'ml',
      displayStr: `${ml} ml`
    };
  }

  const rounded = Math.round(baseAmount * 100) / 100;
  return {
    amount: rounded,
    unit: baseUnit,
    displayStr: `${rounded} ${baseUnit}`
  };
}

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
      text += `• ${item.name}: ${item.displayAmount} [${store.shortName}]\n`;
    });
  }

  // Section 2: Cần mua
  text += `\n[ ] CẦN MUA (${uncheckedList.length} món):\n`;
  if (uncheckedList.length === 0) {
    text += "🎉 ĐÃ GOM ĐỦ TOÀN BỘ NGUYÊN LIỆU!\n";
  } else {
    uncheckedList.forEach(item => {
      const store = STORE_CHANNELS[item.storeChannel];
      text += `• ${item.name}: ${item.displayAmount} [${store.shortName}]\n`;
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
    extraGroceryItems, 
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
    openConfirmModal
  } = useMealWise();

  const [copied, setCopied] = useState<boolean>(false);
  const [storeFilter, setStoreFilter] = useState<StoreChannel>('all');
  const [collabFilter, setCollabFilter] = useState<'all' | 'unclaimed' | 'mine' | 'others'>('all');
  const [showPriceSimulation, setShowPriceSimulation] = useState<boolean>(false);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [customShopperName, setCustomShopperName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
  const lobbyRef = useRef<HTMLDivElement | null>(null);

  // Accumulate ingredients with unit normalization & mathematically correct cost tracking
  interface AccumulatorEntry {
    cleanName: string;
    baseAmount: number;
    baseUnit: string;
    family: NormalizedIngredientInfo['family'];
    category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
    cost: number;
    storeChannel: Exclude<StoreChannel, 'all'>;
  }

  const itemsMap: Record<string, AccumulatorEntry> = {};

  const processRecipe = (recipe: Recipe) => {
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) return;
    const ingCount = Math.max(1, recipe.ingredients.length);
    const costPerIng = Math.round((recipe.estimatedCostVnd || 30000) / ingCount);

    recipe.ingredients.forEach(ing => {
      const norm = normalizeIngredientUnitAndAmount(ing.name, ing.amount, ing.unit);
      const isFresh = ing.category === 'thit-ca' || ing.category === 'rau-cu';
      const channel = getOptimalStoreChannel(norm.cleanName, ing.category);

      if (!itemsMap[norm.groupKey]) {
        itemsMap[norm.groupKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          category: (ing.category || (isFresh ? 'rau-cu' : 'do-kho')) as any,
          cost: costPerIng,
          storeChannel: channel
        };
      } else {
        // Mathematically correct aggregation: add additional amount and its corresponding recipe cost fraction
        itemsMap[norm.groupKey].baseAmount += norm.baseAmount;
        itemsMap[norm.groupKey].cost += costPerIng;
      }
    });
  };

  // Traverse weekly plan
  weeklyPlan.forEach(day => {
    if (!day || !day.meals) return;
    Object.values(day.meals).forEach(meal => {
      if (!meal) return;
      if ('mainDish' in meal) {
        const set = meal as VietnameseMealSet;
        if (set.mainDish) processRecipe(set.mainDish);
        if (set.soupDish) processRecipe(set.soupDish);
        if (set.sideDish) processRecipe(set.sideDish);
      } else {
        processRecipe(meal as Recipe);
      }
    });
  });

  // Also include extra ingredients (from Catering Party Planner)
  if (extraGroceryItems && Array.isArray(extraGroceryItems)) {
    extraGroceryItems.forEach(item => {
      const norm = normalizeIngredientUnitAndAmount(item.name, item.amount, item.unit);
      const channel = getOptimalStoreChannel(norm.cleanName, item.category);

      if (!itemsMap[norm.groupKey]) {
        itemsMap[norm.groupKey] = {
          cleanName: norm.cleanName,
          baseAmount: norm.baseAmount,
          baseUnit: norm.baseUnit,
          family: norm.family,
          category: item.category,
          cost: item.cost || 0,
          storeChannel: channel
        };
      } else {
        itemsMap[norm.groupKey].baseAmount += norm.baseAmount;
        itemsMap[norm.groupKey].cost += (item.cost || 0);
      }
    });
  }

  // Convert accumulated map into clean processed grocery item list
  const allList: ProcessedGroceryItem[] = Object.values(itemsMap).map(entry => {
    const formatted = formatDisplayAmountAndUnit(entry.baseAmount, entry.family, entry.baseUnit);
    const isFresh = entry.category === 'thit-ca' || entry.category === 'rau-cu';
    return {
      id: entry.cleanName,
      name: entry.cleanName,
      amount: formatted.amount,
      unit: formatted.unit,
      displayAmount: formatted.displayStr,
      category: entry.category,
      type: isFresh ? 'fresh' : 'pantry',
      cost: entry.cost,
      storeChannel: entry.storeChannel
    };
  });

  // Sort list: keep stable order by category and name
  allList.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'fresh' ? -1 : 1;
    return a.name.localeCompare(b.name, 'vi');
  });

  // Effective list: if connected to a collaborative room, use room items (preserves items for User B)
  const isCollabActive = Boolean(isRegistered && collabRoom?.roomId);
  const effectiveList: ProcessedGroceryItem[] = (isCollabActive && collabRoom?.items && collabRoom.items.length > 0)
    ? collabRoom.items.map(it => ({
        ...it,
        storeChannel: (it.storeChannel as any) || 'cho-dan-sinh'
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

  // Filter by store channel AND collaborative assignment
  const displayedList = effectiveList.filter(item => {
    const channelMatch = storeFilter === 'all' || item.storeChannel === storeFilter;
    if (!channelMatch) return false;

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

  // Store channel counts
  const channelCounts = {
    'all': totalCount,
    'cho-dan-sinh': effectiveList.filter(i => i.storeChannel === 'cho-dan-sinh').length,
    'winmart': effectiveList.filter(i => i.storeChannel === 'winmart').length,
    'bach-hoa-xanh': effectiveList.filter(i => i.storeChannel === 'bach-hoa-xanh').length,
    'sap-doi-tac': effectiveList.filter(i => i.storeChannel === 'sap-doi-tac').length,
  };

  return (
    <div className="space-y-4">
      
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
              onClick={() => setActiveTab('pantry')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
              title="Xem tủ lạnh, kiểm tra đồ thừa và nguyên liệu sẵn có"
            >
              <span className="text-xs">🧊</span>
              <span>Tủ Lạnh & Đồ Thừa</span>
              <span className="px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-black">
                {pantryItems.length}
              </span>
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
          </div>
        </div>

        <div>
          <h1 className="text-lg font-black tracking-tight text-stone-900 dark:text-white">
            Danh Sách Đi Chợ Thông Minh
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
            Tự động gộp nguyên liệu trùng lặp, chuẩn hóa đơn vị và phân luồng theo 4 kênh mua sắm tối ưu.
          </p>
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

      {/* Catering Sync Notification Banner */}
      {extraGroceryItems && extraGroceryItems.length > 0 && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300 truncate">
                Gồm {extraGroceryItems.length} nguyên liệu tiệc / catering
              </p>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 truncate">
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
          onClick={() => {
            setIsLobbyOpen(true);
            setTimeout(() => {
              lobbyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }}
          className="p-3 px-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-500/25 transition-all text-xs shadow-xs animate-fade-in"
          title="Bấm để mở sảnh phòng mua chung"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="min-w-0">
              <span className="font-extrabold text-amber-950 dark:text-amber-200 truncate block">
                Phòng Mua Chung: #{collabRoom.roomId} (Live Sync • {formatTtlRemaining(collabRoom.expiresAt, collabRoom.createdAt)})
              </span>
              <span className="text-[10.5px] text-amber-800/80 dark:text-amber-300/80 truncate block">
                Chủ phòng: {collabRoom.hostName} • Đang kết nối
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 shrink-0">
            Mở Sảnh ▼
          </span>
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

      {/* 4-CHANNEL STORE FILTERING TABS (R1.4) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Lọc Theo Kênh Mua Hàng ({displayedList.length} món)
          </span>

          {overallCheckedCount > 0 && (
            <button
              onClick={clearGroceryCheckedItems}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
              title="Đặt lại toàn bộ trạng thái đã mua"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bỏ chọn tất cả</span>
            </button>
          )}
        </div>

        {/* Horizontal scrollable channel tabs */}
        <div className="flex items-center gap-1 p-1 overflow-x-auto scrollbar-none sm:grid sm:grid-cols-5 sm:gap-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          {/* Tất Cả */}
          <button
            onClick={() => setStoreFilter('all')}
            className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] flex-1 min-w-[62px] sm:min-w-0 cursor-pointer ${
              storeFilter === 'all'
                ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-black border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 font-semibold border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">Tất Cả</span>
            </div>
            <span className={`text-[10px] ${storeFilter === 'all' ? 'text-stone-900 dark:text-white font-extrabold' : 'text-stone-400 dark:text-stone-500'}`}>
              ({channelCounts['all']})
            </span>
          </button>

          {/* Chợ Dân Sinh */}
          <button
            onClick={() => setStoreFilter('cho-dan-sinh')}
            className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] flex-1 min-w-[62px] sm:min-w-0 cursor-pointer ${
              storeFilter === 'cho-dan-sinh'
                ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-black border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 font-semibold border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">
                <span className="sm:hidden">Chợ Tươi</span>
                <span className="hidden sm:inline">Chợ Dân Sinh</span>
              </span>
            </div>
            <span className={`text-[10px] ${storeFilter === 'cho-dan-sinh' ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-stone-400 dark:text-stone-500'}`}>
              ({channelCounts['cho-dan-sinh']})
            </span>
          </button>

          {/* WinMart */}
          <button
            onClick={() => setStoreFilter('winmart')}
            className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] flex-1 min-w-[62px] sm:min-w-0 cursor-pointer ${
              storeFilter === 'winmart'
                ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-black border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 font-semibold border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">WinMart</span>
            </div>
            <span className={`text-[10px] ${storeFilter === 'winmart' ? 'text-rose-700 dark:text-rose-400 font-extrabold' : 'text-stone-400 dark:text-stone-500'}`}>
              ({channelCounts['winmart']})
            </span>
          </button>

          {/* Bách Hóa Xanh */}
          <button
            onClick={() => setStoreFilter('bach-hoa-xanh')}
            className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] flex-1 min-w-[62px] sm:min-w-0 cursor-pointer ${
              storeFilter === 'bach-hoa-xanh'
                ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-black border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 font-semibold border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">
                <span className="sm:hidden">BHX</span>
                <span className="hidden sm:inline">Bách Hóa Xanh</span>
              </span>
            </div>
            <span className={`text-[10px] ${storeFilter === 'bach-hoa-xanh' ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-stone-400 dark:text-stone-500'}`}>
              ({channelCounts['bach-hoa-xanh']})
            </span>
          </button>

          {/* Sạp Đối Tác */}
          <button
            onClick={() => setStoreFilter('sap-doi-tac')}
            className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] flex-1 min-w-[62px] sm:min-w-0 cursor-pointer ${
              storeFilter === 'sap-doi-tac'
                ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-black border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 font-semibold border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">
                <span className="sm:hidden">Sạp ĐT</span>
                <span className="hidden sm:inline">Sạp Đối Tác</span>
              </span>
            </div>
            <span className={`text-[10px] ${storeFilter === 'sap-doi-tac' ? 'text-purple-700 dark:text-purple-400 font-extrabold' : 'text-stone-400 dark:text-stone-500'}`}>
              ({channelCounts['sap-doi-tac']})
            </span>
          </button>
        </div>
      </div>

      {/* CHECKLIST ITEMS WITH GENEROUS TOUCH TARGETS (MIN 48PX) */}
      <div className="space-y-4">
        
        {/* SECTION 1: CHỢ TƯƠI (THỊT, CÁ, RAU CỦ) */}
        {freshList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Chợ Tươi (Thịt, Cá, Rau Củ)
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {freshList.filter(i => getItemCheckInfo(i).isChecked).length}/{freshList.length} đã gom
              </span>
            </div>

            <div className="space-y-1.5">
              {freshList.map((item) => {
                const checkInfo = getItemCheckInfo(item);
                const isChecked = checkInfo.isChecked;
                const store = STORE_CHANNELS[item.storeChannel];
                const inFridge = pantryItems.find(p => 
                  p.name.toLowerCase().includes(item.name.toLowerCase()) || 
                  item.name.toLowerCase().includes(p.name.toLowerCase())
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[52px] active:scale-[0.99] select-none ${
                      isChecked
                        ? 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/60 opacity-60'
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
                          <span className={`text-xs font-extrabold block truncate ${isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-white'}`}>
                            {item.name}
                          </span>
                          {isChecked && (
                            <span className={`inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border ${
                              checkInfo.isMine 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                                : `${checkInfo.style.badgeBg} ${checkInfo.style.badgeText} ${checkInfo.style.badgeBorder}`
                            }`}>
                              <UserCheck className="w-2.5 h-2.5 shrink-0" />
                              <span>{checkInfo.isMine ? 'Bạn đã nhặt' : `${checkInfo.checkedBy || 'Đã mua'}`}</span>
                            </span>
                          )}
                          {checkInfo.buyerCount > 1 && (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/35 animate-pulse">
                              <Users className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span>{checkInfo.buyerCount} người mua trùng!</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                            ~{(item.cost || 0).toLocaleString('vi-VN')} đ
                          </span>
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
                      {/* Store channel badge: compact icon on mobile, full text on tablet+ */}
                      <span className={`text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg border ${store.badgeBg} ${store.badgeText} ${store.badgeBorder}`}>
                        <span>{store.icon}</span>
                        <span className="hidden sm:inline ml-1">{store.shortName}</span>
                      </span>

                      {/* Normalized Quantity badge */}
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 sm:px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 whitespace-nowrap">
                        {item.displayAmount}
                      </span>

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
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: SIÊU THỊ & ĐỒ KHO (GIA VỊ, ĐỒ KHÔ) */}
        {pantryList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Siêu Thị & Gia Vị Khô
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {pantryList.filter(i => getItemCheckInfo(i).isChecked).length}/{pantryList.length} đã gom
              </span>
            </div>

            <div className="space-y-1.5">
              {pantryList.map((item) => {
                const checkInfo = getItemCheckInfo(item);
                const isChecked = checkInfo.isChecked;
                const store = STORE_CHANNELS[item.storeChannel];
                const inFridge = pantryItems.find(p => 
                  p.name.toLowerCase().includes(item.name.toLowerCase()) || 
                  item.name.toLowerCase().includes(p.name.toLowerCase())
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[52px] active:scale-[0.99] select-none ${
                      isChecked
                        ? 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/60 opacity-60'
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
                          <span className={`text-xs font-extrabold block truncate ${isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-white'}`}>
                            {item.name}
                          </span>
                          {isChecked && (
                            <span className={`inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border ${
                              checkInfo.isMine 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                                : `${checkInfo.style.badgeBg} ${checkInfo.style.badgeText} ${checkInfo.style.badgeBorder}`
                            }`}>
                              <UserCheck className="w-2.5 h-2.5 shrink-0" />
                              <span>{checkInfo.isMine ? 'Bạn đã nhặt' : `${checkInfo.checkedBy || 'Đã mua'}`}</span>
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
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                            ~{(item.cost || 0).toLocaleString('vi-VN')} đ
                          </span>
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
                      {/* Store channel badge: compact icon on mobile, full text on tablet+ */}
                      <span className={`text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg border ${store.badgeBg} ${store.badgeText} ${store.badgeBorder}`}>
                        <span>{store.icon}</span>
                        <span className="hidden sm:inline ml-1">{store.shortName}</span>
                      </span>

                      {/* Normalized Quantity badge */}
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 sm:px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 whitespace-nowrap">
                        {item.displayAmount}
                      </span>

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
              })}
            </div>
          </div>
        )}

        {/* Empty state for current filter */}
        {displayedList.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 italic rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            {totalCount === 0 
              ? 'Chưa có món nào trong thực đơn tuần hoặc kế hoạch tiệc.' 
              : `Không có nguyên liệu nào thuộc kênh "${storeFilter === 'all' ? 'Tất Cả' : STORE_CHANNELS[storeFilter].name}".`}
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
              if (!isRegistered) {
                openConfirmModal({
                  title: 'Tính Năng Dành Cho Thành Viên',
                  message: 'Tính năng chia sẻ giỏ hàng đi chợ và cùng người thân tích chọn thời gian thực chỉ dành cho tài khoản thành viên. Đăng ký tài khoản miễn phí chỉ mất 10 giây!',
                  confirmLabel: 'Đăng Ký / Đăng Nhập',
                  cancelLabel: 'Để sau',
                  onConfirm: () => openAuthModal('register')
                });
                return;
              }
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
            className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px] cursor-pointer ${
              !isRegistered
                ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 shadow-2xs'
                : 'bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-950 shadow-md font-black'
            }`}
            title={!isRegistered ? 'Tính năng dành cho thành viên' : (collabRoom ? (isLobbyOpen ? 'Đóng sảnh mua chung' : 'Mở sảnh mua chung') : 'Tạo phòng mua chung')}
          >
            {!isRegistered ? (
              <Lock className="w-4 h-4 shrink-0 text-stone-500 dark:text-stone-400" />
            ) : (
              <Users className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">
              {!isRegistered
                ? 'Chia Sẻ Mua Chung 🔒'
                : collabRoom
                ? (isLobbyOpen ? 'Đóng Sảnh (Live)' : 'Mua Chung (Live)')
                : 'Chia Sẻ Mua Chung'}
            </span>
            {isRegistered && (
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
