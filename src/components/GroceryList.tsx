import React, { useState } from 'react';
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
  Smile
} from 'lucide-react';
import { VietnameseMealSet, Recipe, StoreChannel, CollabCartItem, CollabShopper } from '../types';
import { copyTextToClipboard } from './CateringPartyPlanner';
import { FridgeLeftoverModal } from './FridgeLeftoverModal';
import { SHOPPER_PALETTE, getShopperStyle } from '../services/collabGroceryService';

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
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-900 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800',
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
    badgeBg: 'bg-rose-100 dark:bg-rose-950/70',
    badgeText: 'text-rose-900 dark:text-rose-300',
    badgeBorder: 'border-rose-300 dark:border-rose-800',
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
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-950 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
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
    badgeBg: 'bg-purple-100 dark:bg-purple-950/70',
    badgeText: 'text-purple-900 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
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
    const trimmed = val.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        return Math.max(0.01, num / den);
      }
    }
    const parsed = parseFloat(trimmed);
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

  // 1. Weight family: g, gram, gam, kg, kilogram, kí, ký
  if (u === 'kg' || u === 'kilogram' || u === 'kí' || u === 'ký') {
    return {
      cleanName,
      baseAmount: parsedAmt * 1000,
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
    setIsShareModalOpen
  } = useMealWise();

  const [copied, setCopied] = useState<boolean>(false);
  const [storeFilter, setStoreFilter] = useState<StoreChannel>('all');
  const [collabFilter, setCollabFilter] = useState<'all' | 'unclaimed' | 'mine' | 'others'>('all');
  const [showPriceSimulation, setShowPriceSimulation] = useState<boolean>(false);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [customShopperName, setCustomShopperName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

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
  const effectiveList: ProcessedGroceryItem[] = (collabRoom?.items && collabRoom.items.length > 0)
    ? collabRoom.items.map(it => ({
        ...it,
        storeChannel: (it.storeChannel as any) || 'cho-dan-sinh'
      }))
    : allList;

  // Helper to determine check status & user attribution
  const getItemCheckInfo = (item: ProcessedGroceryItem) => {
    if (collabRoom?.roomId) {
      const state = collabCheckedMap[item.id] || collabCheckedMap[item.name];
      const isChecked = !!state?.checked;
      const checkedBy = state?.checked ? (state.checkedBy || 'Người mua cùng') : '';
      const checkedById = state?.checkedById || '';
      const isMine = isChecked && (checkedById ? checkedById === collabUser.id : checkedBy === collabUser.name);
      const checkedByColor = state?.checkedByColor || (isMine ? (collabUser.color || '#10b981') : '#8b5cf6');
      const style = getShopperStyle(checkedByColor);
      return { isChecked, checkedBy, checkedById, checkedByColor, isMine, style };
    }
    const isChecked = Boolean(groceryCheckedItems[item.id] || groceryCheckedItems[item.name]);
    return { 
      isChecked, 
      checkedBy: '', 
      checkedById: '', 
      checkedByColor: '#10b981', 
      isMine: isChecked, 
      style: getShopperStyle('#10b981') 
    };
  };

  // Total items & cost
  const totalCount = effectiveList.length;
  const totalCostEstimate = effectiveList.reduce((sum, item) => sum + item.cost, 0);

  // Filter by store channel AND collaborative assignment
  const displayedList = effectiveList.filter(item => {
    const channelMatch = storeFilter === 'all' || item.storeChannel === storeFilter;
    if (!channelMatch) return false;

    if (collabRoom?.roomId && collabFilter !== 'all') {
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
      <div className="p-4 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-950/10 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 text-[11px] font-bold shrink-0">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Tự Động Gom Nguyên Liệu</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Smart Fridge & Leftovers Button */}
            <button
              type="button"
              onClick={() => setActiveTab('pantry')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-black transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
              title="Xem tủ lạnh, kiểm tra đồ thừa và nguyên liệu sẵn có"
            >
              <span className="text-xs">🧊</span>
              <span>Tủ Lạnh & Đồ Thừa</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 text-[10px] font-black">
                {pantryItems.length}
              </span>
            </button>

            {/* Online Price Simulation Button */}
            <button
              type="button"
              onClick={() => setShowPriceSimulation(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-black transition-all active:scale-95 cursor-pointer shrink-0"
              title="Mô phỏng và so sánh giỏ hàng online giữa các chuỗi siêu thị"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Mô Phỏng Giá Online</span>
              {showPriceSimulation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Danh Sách Đi Chợ Thông Minh
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
            Tự động gộp nguyên liệu trùng lặp, chuẩn hóa đơn vị và phân luồng theo 4 kênh mua sắm tối ưu.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/80 dark:border-white/10 font-medium">
          <span>{totalCount} nguyên liệu ({overallCheckedCount} đã mua)</span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
            Ước tính: {totalCostEstimate.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Online Price Simulation Card (Expandable) */}
      {showPriceSimulation && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/95 border-2 border-amber-500/40 shadow-xl space-y-3.5 text-slate-900 dark:text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Mô Phỏng Giá Đi Chợ Online 4 Kênh
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Dự toán giỏ hàng tuần ({totalCount} món) khi đặt giao tận nhà
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPriceSimulation(false)}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Chợ Dân Sinh */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>🏪</span> Chợ Dân Sinh
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                  Tiết kiệm nhất
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[11px] text-slate-600 dark:text-slate-300">Tổng giỏ hàng:</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {totalCostEstimate.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
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
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span>🔴</span> WinMart Online
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold">
                      Giao 1-2h
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">Tổng giỏ online:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-300">
                        {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        ({diff >= 0 ? `+${diff.toLocaleString('vi-VN')} đ` : `-${Math.abs(diff).toLocaleString('vi-VN')} đ`})
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
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
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span>🟢</span> Bách Hóa Xanh
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                      Giao hẹn giờ
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">Tổng giỏ online:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                        {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        ({diff >= 0 ? `+${diff.toLocaleString('vi-VN')} đ` : `-${Math.abs(diff).toLocaleString('vi-VN')} đ`})
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
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
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <span>🏮</span> Sạp Đối Tác
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold">
                      Đặc sản 3 miền
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">Tổng giỏ hàng:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-purple-700 dark:text-purple-300">
                        {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        (+{diff.toLocaleString('vi-VN')} đ)
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
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

      {/* COLLABORATIVE ROOM ACTIVE BANNER */}
      {collabRoom && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-emerald-50/70 dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 text-slate-900 dark:text-white space-y-3 shadow-sm animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Phòng Mua Chung: #{collabRoom.roomId}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/60 dark:border-emerald-500/30">
                    Live Sync
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
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11.5px] font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Xem liên kết & mã QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mời / QR</span>
              </button>

              <button
                type="button"
                onClick={leaveCollabRoom}
                className="p-1.5 rounded-xl bg-white hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Rời phòng mua chung"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Shoppers in room Roster Bar */}
          <div className="pt-2.5 border-t border-emerald-200/60 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Người đi chợ trong phòng:
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomShopperName(collabUser.name);
                  setSelectedColor(collabUser.color || '#10b981');
                  setIsProfileModalOpen(true);
                }}
                className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
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
            <div className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="block text-slate-500 dark:text-slate-400 font-semibold text-[10px]">Chưa ai mua</span>
              <strong className="text-slate-900 dark:text-slate-100 text-sm font-black">{unclaimedCount} món</strong>
            </div>
            
            <div 
              className="p-2 rounded-2xl bg-white dark:bg-slate-800 border shadow-xs transition-all"
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

            <div className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-800/60 shadow-xs">
              <span className="block text-violet-700 dark:text-violet-400 font-semibold text-[10px]">
                Người khác nhặt
              </span>
              <strong className="text-violet-700 dark:text-violet-300 text-sm font-black">{othersCheckedCount} món</strong>
            </div>
          </div>

          {/* Collaborative filter tabs */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0 text-[10px]">Lọc theo người mua:</span>
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
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4-CHANNEL STORE FILTERING TABS (R1.4) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <div className="flex items-center gap-1 p-1 overflow-x-auto scrollbar-none sm:grid sm:grid-cols-5 sm:gap-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Tất Cả */}
          <button
            onClick={() => setStoreFilter('all')}
            className={`py-2 px-2 sm:px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] shrink-0 sm:shrink cursor-pointer ${
              storeFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">Tất Cả</span>
            <span className={`text-[10px] ${storeFilter === 'all' ? 'text-slate-900 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
              ({channelCounts['all']})
            </span>
          </button>

          {/* Chợ Dân Sinh */}
          <button
            onClick={() => setStoreFilter('cho-dan-sinh')}
            className={`py-2 px-2 sm:px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] shrink-0 sm:shrink cursor-pointer ${
              storeFilter === 'cho-dan-sinh'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">
              <span className="sm:hidden">Chợ Tươi</span>
              <span className="hidden sm:inline">Chợ Dân Sinh</span>
            </span>
            <span className={`text-[10px] ${storeFilter === 'cho-dan-sinh' ? 'text-emerald-100 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
              ({channelCounts['cho-dan-sinh']})
            </span>
          </button>

          {/* WinMart */}
          <button
            onClick={() => setStoreFilter('winmart')}
            className={`py-2 px-2 sm:px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] shrink-0 sm:shrink cursor-pointer ${
              storeFilter === 'winmart'
                ? 'bg-rose-600 text-white shadow-sm font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">WinMart</span>
            <span className={`text-[10px] ${storeFilter === 'winmart' ? 'text-rose-100 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
              ({channelCounts['winmart']})
            </span>
          </button>

          {/* Bách Hóa Xanh */}
          <button
            onClick={() => setStoreFilter('bach-hoa-xanh')}
            className={`py-2 px-2 sm:px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] shrink-0 sm:shrink cursor-pointer ${
              storeFilter === 'bach-hoa-xanh'
                ? 'bg-amber-600 text-white shadow-sm font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">
              <span className="sm:hidden">BHX</span>
              <span className="hidden sm:inline">Bách Hóa Xanh</span>
            </span>
            <span className={`text-[10px] ${storeFilter === 'bach-hoa-xanh' ? 'text-amber-100 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
              ({channelCounts['bach-hoa-xanh']})
            </span>
          </button>

          {/* Sạp Đối Tác */}
          <button
            onClick={() => setStoreFilter('sap-doi-tac')}
            className={`py-2 px-2 sm:px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[44px] shrink-0 sm:shrink cursor-pointer ${
              storeFilter === 'sap-doi-tac'
                ? 'bg-purple-600 text-white shadow-sm font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap sm:truncate">
              <span className="sm:hidden">Sạp ĐT</span>
              <span className="hidden sm:inline">Sạp Đối Tác</span>
            </span>
            <span className={`text-[10px] ${storeFilter === 'sap-doi-tac' ? 'text-purple-100 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
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
                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                        ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">
                        {isChecked ? (
                          <div 
                            className="w-5 h-5 rounded-lg flex items-center justify-center shadow-sm text-white transition-colors"
                            style={{ backgroundColor: checkInfo.checkedByColor || (checkInfo.isMine ? (collabUser.color || '#10b981') : '#8b5cf6') }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-extrabold truncate ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.name}
                          </span>
                          {isChecked && checkInfo.checkedBy && (
                            <span className={`inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border ${
                              checkInfo.isMine 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                                : `${checkInfo.style.badgeBg} ${checkInfo.style.badgeText} ${checkInfo.style.badgeBorder}`
                            }`}>
                              <UserCheck className="w-2.5 h-2.5 shrink-0" />
                              <span>{checkInfo.isMine ? 'Bạn đã nhặt' : `${checkInfo.checkedBy} đã nhặt`}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            ~{(item.cost || 0).toLocaleString('vi-VN')} đ
                          </span>
                          {inFridge && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFridgeModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 px-1.5 py-0.2 rounded-md border border-cyan-500/30 transition-colors shrink-0"
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
                      <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 sm:px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                        {item.displayAmount}
                      </span>
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
                        ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">
                        {isChecked ? (
                          <div 
                            className="w-5 h-5 rounded-lg flex items-center justify-center shadow-sm text-white transition-colors"
                            style={{ backgroundColor: checkInfo.checkedByColor || (checkInfo.isMine ? (collabUser.color || '#10b981') : '#8b5cf6') }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-extrabold truncate ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.name}
                          </span>
                          {isChecked && checkInfo.checkedBy && (
                            <span className={`inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border ${
                              checkInfo.isMine 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                                : `${checkInfo.style.badgeBg} ${checkInfo.style.badgeText} ${checkInfo.style.badgeBorder}`
                            }`}>
                              <UserCheck className="w-2.5 h-2.5 shrink-0" />
                              <span>{checkInfo.isMine ? 'Bạn đã nhặt' : `${checkInfo.checkedBy} đã nhặt`}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            ~{(item.cost || 0).toLocaleString('vi-VN')} đ
                          </span>
                          {inFridge && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFridgeModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 px-1.5 py-0.2 rounded-md border border-cyan-500/30 transition-colors shrink-0"
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
                      <span className="text-[11px] font-black text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 sm:px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-800 whitespace-nowrap">
                        {item.displayAmount}
                      </span>
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
      <div className="sticky bottom-16 z-30 -mx-3 sm:-mx-4 -mb-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl space-y-2">
        
        {/* Progress status & percentage */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
            {progressPercent === 100 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã gom đủ {totalCount} món!
              </span>
            ) : (
              <span>Đã mua: {overallCheckedCount} / {totalCount} món ({progressPercent}%)</span>
            )}
          </div>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
            {totalCostEstimate.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
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
                setIsShareModalOpen(true);
              } else {
                await startCollabRoom(allList, `Giỏ Đi Chợ Tuần Này (${allList.length} món)`);
              }
            }}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px] cursor-pointer"
            title="Tạo liên kết chia sẻ danh sách để nhiều người cùng tick chọn thời gian thực"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {collabRoom ? 'Mua Chung (Live)' : 'Chia Sẻ Mua Chung'}
            </span>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
          </button>

          {/* Button 2: Quick Zalo Export */}
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px] cursor-pointer"
            title="Sao chép toàn bộ danh sách dạng văn bản gửi Zalo"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span className="truncate">
              {copied ? 'Đã Chép Zalo' : 'Xuất Zalo Đi Chợ'}
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
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsProfileModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scale-up text-slate-900 dark:text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Hồ Sơ Người Đi Chợ</h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Phân biệt rõ ràng giữa bạn và người mua cùng</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Tên hiển thị của bạn:
              </label>
              <input
                type="text"
                value={customShopperName}
                onChange={e => setCustomShopperName(e.target.value)}
                placeholder="VD: Tuấn, Lan, Mẹ, Bố..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Màu sắc đại diện cho các món bạn nhặt:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SHOPPER_PALETTE.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedColor(p.hex)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor.toLowerCase() === p.hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105' : 'hover:scale-105'
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer"
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
