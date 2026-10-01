import React, { useState, useRef } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Sparkles, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShoppingCart, 
  RotateCcw, 
  Layers, 
  Utensils, 
  Soup, 
  Beef, 
  PieChart, 
  CheckSquare, 
  Square, 
  Search, 
  X, 
  ArrowRight,
  Clock,
  Flame,
  ChefHat,
  BookmarkPlus,
  BookmarkCheck,
  Truck,
  Wine,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  FolderHeart,
  Timer,
  Lock,
  Receipt,
  ShieldAlert,
  Calendar as CalendarIcon
} from 'lucide-react';
import { PartyDishItem, Recipe, SavedPartyPreset, ScheduledPartyEvent } from '../types';
import { CORPORATE_PARTY_PRESETS } from '../data/corporatePartyPresets';
import { matchesRecipeSearch } from '../utils/textUtils';
import { calculatePartyKitchenTime, DishTimingInput } from '../utils/cateringTimeMath';
import { SafeImage } from './SafeImage';
import { PartyCalendarView } from './PartyCalendarView';
import { SchedulePartyModal } from './SchedulePartyModal';

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

interface CourseDefinition {
  id: PartyDishItem['course'];
  name: string;
  subtitle: string;
  icon: any;
  colorClass: string;
}

const COURSES: CourseDefinition[] = [
  { 
    id: 'appetizer', 
    name: '1. Khai Vị & Món Nhắm', 
    subtitle: 'Kích thích vị giác, gỏi, nem rán, salad đầu tiệc', 
    icon: Utensils,
    colorClass: 'text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  { 
    id: 'main', 
    name: '2. Món Chính Đậm Đà', 
    subtitle: 'Thịt cá, hải sản chế biến đậm đà trung tâm mâm tiệc', 
    icon: Beef,
    colorClass: 'text-orange-700 dark:text-orange-400 border-orange-500/30 bg-orange-500/10'
  },
  { 
    id: 'soup_hotpot', 
    name: '3. Lẩu & Canh Nóng', 
    subtitle: 'Húp nước ngọt thanh, giữ ấm nóng suốt bữa tiệc', 
    icon: Soup,
    colorClass: 'text-amber-600 dark:text-amber-300 border-amber-600/30 bg-amber-600/10'
  },
  { 
    id: 'staple', 
    name: '4. Tinh Bột & No Bụng', 
    subtitle: 'Cơm thơm, xôi dẻo nếp cái hoa vàng, bún miến hoặc bánh mì', 
    icon: Layers,
    colorClass: 'text-stone-700 dark:text-stone-300 border-stone-500/30 bg-stone-500/10'
  },
  { 
    id: 'dessert_drink', 
    name: '5. Tráng Miệng & Giải Khát', 
    subtitle: 'Chè ngọt thanh, hoa quả bốn mùa hoặc nước mát tráng miệng', 
    icon: Wine,
    colorClass: 'text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10'
  }
];

export const matchRecipeToPartyCourse = (r: Recipe, course: PartyDishItem['course']): boolean => {
  const text = (r.title + ' ' + (r.description || '') + ' ' + (r.tags || []).join(' ')).toLowerCase();
  const id = r.id.toLowerCase();

  switch (course) {
    case 'appetizer':
      // Khai vị (Appetizer/salad/nem/snack)
      return (
        r.category === 'mon-rau' ||
        id.startsWith('snack-') ||
        text.includes('khai vị') ||
        text.includes('salad') ||
        text.includes('gỏi') ||
        text.includes('nộm') ||
        text.includes('nem ') ||
        text.includes('nem rán') ||
        text.includes('nem lụi') ||
        text.includes('nem nướng') ||
        text.includes('chả giò') ||
        text.includes('chả ram') ||
        text.includes('chạo tôm') ||
        text.includes('cuốn') ||
        text.includes('nhắm') ||
        text.includes('snack') ||
        text.includes('khoai tây chiên') ||
        text.includes('khoai lang kén') ||
        text.includes('ngô chiên') ||
        text.includes('dưa leo') ||
        text.includes('dưa chua') ||
        text.includes('dưa giá') ||
        text.includes('dưa góp') ||
        text.includes('dưa leo muối') ||
        text.includes('kim chi') ||
        text.includes('phồng tôm') ||
        text.includes('đậu phộng')
      );

    case 'main':
      // Món chính (Món mặn, thịt, bò, cá, hải sản, gà, BBQ)
      if (r.category === 'trang-mieng') return false;
      return (
        r.category === 'mon-man' ||
        r.tags.some(t => ['BBQ', 'Giàu Đạm', 'Steak', 'Bít Tết', 'Món Mặn', 'Món Chay'].includes(t)) ||
        text.includes('thịt') ||
        text.includes('bò') ||
        text.includes('cá') ||
        text.includes('hải sản') ||
        text.includes('gà') ||
        text.includes('vịt') ||
        text.includes('heo') ||
        text.includes('sườn') ||
        text.includes('tôm') ||
        text.includes('mực') ||
        text.includes('cua') ||
        text.includes('chả ốc') ||
        text.includes(' ốc ') ||
        text.includes('bún ốc') ||
        text.includes('món ốc') ||
        text.includes('lươn') ||
        text.includes('bbq') ||
        text.includes('nướng') ||
        text.includes('kho ') ||
        text.includes('áp chảo') ||
        text.includes('rang ') ||
        text.includes('rim ') ||
        text.includes('xào ') ||
        text.includes('chiên') ||
        text.includes(' rán') ||
        text.includes('chiên rán') ||
        text.includes('rán giòn') ||
        text.includes('đậu hũ') ||
        text.includes('đậu phụ') ||
        text.includes('steak') ||
        text.includes('bít tết') ||
        text.includes('chả cá') ||
        text.includes('chả lá lốt') ||
        id.startsWith('party-bbq') ||
        id.startsWith('party-korean') ||
        id.startsWith('party-steakhouse') ||
        id.startsWith('party-hai-san') ||
        id.startsWith('party-sinh-nhat')
      );

    case 'soup_hotpot':
      // Lẩu & Canh (Món canh, lẩu Thái, lẩu riêu cua, lẩu nấm)
      return (
        r.category === 'mon-canh' ||
        r.tags.includes('Món Lẩu') ||
        r.tags.includes('Món Canh') ||
        text.includes('canh') ||
        text.includes('lẩu') ||
        text.includes('súp') ||
        text.includes('soup') ||
        text.includes('riêu') ||
        text.includes('tiềm') ||
        text.includes('hầm') ||
        id.startsWith('canh-') ||
        id.startsWith('party-lau')
      );

    case 'staple':
      // Tinh bột (Cơm, xôi, bún, mì, bánh mì, pizza)
      return (
        r.category === 'an-sang' ||
        id.startsWith('banh-mi-') ||
        id.startsWith('xoi-') ||
        id.startsWith('chao-') ||
        id.startsWith('noodle-') ||
        id.startsWith('pho-') ||
        id.startsWith('bun-') ||
        id.startsWith('mi-') ||
        id.startsWith('mien-') ||
        id.startsWith('com-') ||
        text.includes('cơm') ||
        text.includes('xôi') ||
        text.includes('bún') ||
        text.includes('mì') ||
        text.includes('phở') ||
        text.includes('miến') ||
        text.includes('cháo') ||
        text.includes('bánh mì') ||
        text.includes('pizza') ||
        text.includes('burger') ||
        text.includes('pasta') ||
        text.includes('spaghetti') ||
        text.includes('nui') ||
        text.includes('bánh hỏi') ||
        text.includes('bánh cuốn') ||
        text.includes('tinh bột')
      );

    case 'dessert_drink':
      // Tráng miệng & Đồ uống (Chè, hoa quả, sữa chua, đồ uống)
      return (
        r.category === 'trang-mieng' ||
        id.startsWith('snack-') ||
        id.startsWith('che-') ||
        id.startsWith('sua-chua-') ||
        text.includes('chè') ||
        text.includes('hoa quả') ||
        text.includes('trái cây') ||
        text.includes('dưa lưới') ||
        text.includes('dưa hấu') ||
        text.includes('xoài') ||
        text.includes('sữa chua') ||
        text.includes('thạch') ||
        text.includes('kem') ||
        text.includes('đồ uống') ||
        text.includes('nước ép') ||
        text.includes('sinh tố') ||
        text.includes('trà') ||
        text.includes('bánh ngọt') ||
        text.includes('bánh flan') ||
        text.includes('rau câu')
      );

    default:
      return true;
  }
};

/**
 * Intelligently resolve the target course for a recipe depending on the active modal course tab.
 * If user is on a specific course tab (e.g. 'main', 'appetizer'), that course is strictly used.
 * If user is on 'all' tab, it prefers the opened course if the recipe matches it, otherwise detects the best fit.
 */
export const resolveTargetCourse = (
  recipe: Recipe,
  selectedTab: 'all' | PartyDishItem['course'],
  openedCourse: PartyDishItem['course'] | null
): PartyDishItem['course'] => {
  if (selectedTab !== 'all') {
    return selectedTab;
  }
  if (openedCourse && matchRecipeToPartyCourse(recipe, openedCourse)) {
    return openedCourse;
  }
  if (matchRecipeToPartyCourse(recipe, 'dessert_drink')) return 'dessert_drink';
  if (matchRecipeToPartyCourse(recipe, 'soup_hotpot')) return 'soup_hotpot';
  if (matchRecipeToPartyCourse(recipe, 'staple')) return 'staple';
  if (matchRecipeToPartyCourse(recipe, 'appetizer')) return 'appetizer';
  return openedCourse || 'main';
};

const EVENT_TYPES = [
  { id: 'corporate', label: 'Công Ty', icon: '🏢' },
  { id: 'family', label: 'Gia Đình', icon: '👨‍👩‍👧‍👦' },
  { id: 'birthday', label: 'Sinh Nhật', icon: '🎂' },
  { id: 'bbq', label: 'Dã Ngoại BBQ', icon: '🍖' },
  { id: 'wedding', label: 'Cưới Hỏi', icon: '💍' },
];

const QUICK_DRINKS = [
  'Bia Heineken Silver',
  'Bia Tiger Crystal',
  'Bia Sài Gòn Special',
  'Nước ngọt lon (Coca/Pepsi)',
  'Nước sâm lá dứa hạt chia',
  'Nước suối tinh khiết Aquafina'
];

// Fallback-safe clipboard copy function with iOS Safari readonly & selection range
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.fontSize = '12pt';
    textArea.contentEditable = 'true';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
};

export const CateringPartyPlanner: React.FC = () => {
  const { 
    recipes, 
    partyPlan, 
    updatePartyPlan, 
    addDishToParty, 
    removeDishFromParty, 
    updatePartyDishNote, 
    clearPartyDishes, 
    applyPresetToParty, 
    resetPartyPlan, 
    togglePartyEquipment, 
    addPartyEquipment, 
    removePartyEquipment, 
    syncPartyToGrocery, 
    userPartyPlans,
    saveCurrentPlanAsPreset,
    deleteUserPartyPlan,
    loadUserPartyPlan,
    scheduledPartyEvents,
    setSelectedRecipe, 
    showToast,
    isRegistered,
    openAuthModal
  } = useMealWise();

  const [activeMode, setActiveMode] = useState<'builder' | 'calendar' | 'presets'>('builder');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [scheduleInitialDate, setScheduleInitialDate] = useState<string | undefined>(undefined);
  const [editingScheduleEvent, setEditingScheduleEvent] = useState<ScheduledPartyEvent | null>(null);
  const [presetSubTab, setPresetSubTab] = useState<'catalog' | 'my_presets'>('catalog');
  const [showSavePresetModal, setShowSavePresetModal] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [savePlanTitle, setSavePlanTitle] = useState<string>('');
  const [savePlanDesc, setSavePlanDesc] = useState<string>('');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);
  const [modalCourse, setModalCourse] = useState<PartyDishItem['course'] | null>(null);
  const [selectedModalCourseTab, setSelectedModalCourseTab] = useState<'all' | PartyDishItem['course']>('all');
  const [recipeSearch, setRecipeSearch] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [newEquipmentText, setNewEquipmentText] = useState<string>('');
  const [newEquipmentCategory, setNewEquipmentCategory] = useState<string>('Dụng cụ tiệc');
  const [newDrinkText, setNewDrinkText] = useState<string>('');
  const [editingNoteDishId, setEditingNoteDishId] = useState<string | null>(null);
  const [dishModalDragY, setDishModalDragY] = useState<number>(0);
  const dishModalTouchStartY = useRef<number | null>(null);
  const [visibleDishCount, setVisibleDishCount] = useState<number>(40);

  // Pricing model mode: 'cost_plus' (default: Food cost + seasonings + optional service) or 'fixed_quote' (target budget/head)
  const isCommercialEvent = partyPlan.eventType === 'corporate' || partyPlan.eventType === 'wedding';
  const [pricingMode, setPricingMode] = useState<'cost_plus' | 'fixed_quote'>('cost_plus');
  // Service labor fee per table (default 200k for corporate/wedding, 0 for family/birthday/bbq)
  const [laborPerTable, setLaborPerTable] = useState<number>(isCommercialEvent ? 200000 : 0);

  // Synchronize default labor fee when event type changes
  React.useEffect(() => {
    if (partyPlan.eventType === 'corporate' || partyPlan.eventType === 'wedding') {
      if (laborPerTable === 0) setLaborPerTable(200000);
    } else {
      if (laborPerTable === 200000) setLaborPerTable(0);
    }
  }, [partyPlan.eventType]);

  // Synchronize modal course filter tab when opening for a specific course
  React.useEffect(() => {
    if (modalCourse) {
      setSelectedModalCourseTab(modalCourse);
      setRecipeSearch('');
      setSelectedFilterCategory('all');
      setVisibleDishCount(40);
    }
  }, [modalCourse]);

  // Reset visible dish count on search/tab/filter changes for fast progressive rendering
  React.useEffect(() => {
    setVisibleDishCount(40);
  }, [recipeSearch, selectedModalCourseTab, selectedFilterCategory]);

  // Course accordion expansion state (default all expanded for discovery)
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({
    appetizer: true,
    main: true,
    soup_hotpot: true,
    staple: true,
    dessert_drink: true
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  const toggleCourseExpanded = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Local input state for smooth typing without falsy glitch
  const [guestInput, setGuestInput] = useState<string>(
    partyPlan.guestCount !== undefined && partyPlan.guestCount !== null
      ? String(partyPlan.guestCount)
      : '10'
  );

  // Synchronize local guestInput when external state changes (preset, reset, etc.)
  React.useEffect(() => {
    const num = parseInt(guestInput, 10);
    if (!isNaN(num) && num === partyPlan.guestCount) {
      return;
    }
    if (partyPlan.guestCount !== undefined && partyPlan.guestCount !== null) {
      setGuestInput(String(partyPlan.guestCount));
    }
  }, [partyPlan.guestCount]);

  // Sanitized calculations across all edge cases (0, negative, odd, 100+ guests)
  const guestCount = typeof partyPlan.guestCount === 'number' && !isNaN(partyPlan.guestCount)
    ? Math.max(0, partyPlan.guestCount)
    : 10;
  const tableSize = partyPlan.tableSize || 10;
  const numTables = guestCount > 0 ? Math.ceil(guestCount / tableSize) : 0;
  const fullTables = guestCount > 0 ? Math.floor(guestCount / tableSize) : 0;
  const remainderGuests = guestCount > 0 ? guestCount % tableSize : 0;
  const hasPartialTable = guestCount > 0 && remainderGuests > 0;

  const hasDishes = partyPlan.dishes.length > 0;

  // Calculate scaled raw food cost based directly on selected dishes and headcount
  const rawDishesCost = hasDishes && guestCount > 0
    ? partyPlan.dishes.reduce((sum, item) => {
        const recipe = recipes.find(r => r.id === item.recipeId);
        if (!recipe) return sum;
        const servings = recipe.servings && recipe.servings > 0 ? recipe.servings : 4;
        const factor = guestCount / servings;
        return sum + ((recipe.estimatedCostVnd || 40000) * factor);
      }, 0)
    : 0;

  const roundedFoodCost = Math.round(rawDishesCost);
  // Seasonings, spices, herbs, cooking oil and energy buffer: 10% of raw food cost
  const seasoningCost = hasDishes ? Math.round(roundedFoodCost * 0.1) : 0;
  // Cooking and table service labor cost
  const totalLaborCost = hasDishes && numTables > 0 ? laborPerTable * numTables : 0;

  // Total Party Cost (Cost-Plus): Strictly counts raw food cost + seasonings + optional labor
  const totalPartyCost = hasDishes ? roundedFoodCost + seasoningCost + totalLaborCost : 0;
  const partyCostPerHead = guestCount > 0 && hasDishes ? Math.round(totalPartyCost / guestCount) : 0;
  const partyCostPerTable = numTables > 0 && hasDishes ? Math.round(totalPartyCost / numTables) : 0;

  // Fixed Quotation calculations (if user selects fixed budget per head)
  const budgetPerHead = partyPlan.budgetPerHeadVnd && partyPlan.budgetPerHeadVnd > 0 ? partyPlan.budgetPerHeadVnd : 200000;
  const pricePerTable = budgetPerHead * tableSize;
  const totalQuotation = guestCount * budgetPerHead;
  const grossProfit = hasDishes && guestCount > 0 ? totalQuotation - roundedFoodCost : 0;
  const profitMarginPercent = hasDishes && totalQuotation > 0
    ? Math.max(0, Math.round((grossProfit / totalQuotation) * 100))
    : 0;

  // Unified displayed total: strictly reflects food cost in default Cost-Plus mode
  const displayTotal = pricingMode === 'cost_plus' ? totalPartyCost : totalQuotation;
  const displayPerHead = pricingMode === 'cost_plus' ? partyCostPerHead : budgetPerHead;
  const displayPerTable = pricingMode === 'cost_plus' ? partyCostPerTable : pricePerTable;
  const isBudgetWarning = pricingMode === 'fixed_quote' && hasDishes && roundedFoodCost > totalQuotation;

  const foodCostPerHead = guestCount > 0 && hasDishes ? Math.round(roundedFoodCost / guestCount) : 0;
  const foodCostPerTable = numTables > 0 && hasDishes ? Math.round(roundedFoodCost / numTables) : 0;
  const revenuePerTable = numTables > 0 ? Math.round(totalQuotation / numTables) : 0;

  // Dynamic kitchen workload and cooking time calculation
  const dishTimingInputs: DishTimingInput[] = partyPlan.dishes.map(d => {
    const r = recipes.find(rec => rec.id === d.recipeId);
    return {
      title: r?.title,
      prepTimeMinutes: r?.prepTimeMinutes || 15,
      cookTimeMinutes: r?.cookTimeMinutes || 20,
      servings: r?.servings || 4
    };
  });
  const kitchenWorkload = calculatePartyKitchenTime(dishTimingInputs, guestCount);

  // Guest count stepping and input sanitization
  const handleStepGuestCount = (delta: number) => {
    const current = typeof partyPlan.guestCount === 'number' ? partyPlan.guestCount : 10;
    let next: number;
    if (delta > 0) {
      next = Math.min(500, current + delta);
    } else {
      next = current > 5 ? Math.max(1, current - 5) : Math.max(1, current - 1);
    }
    setGuestInput(String(next));
    updatePartyPlan({ guestCount: next });
  };

  const handleSelectGuestChip = (count: number) => {
    setGuestInput(String(count));
    updatePartyPlan({ guestCount: count });
  };

  const handleGuestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setGuestInput(raw);
    if (raw === '') {
      updatePartyPlan({ guestCount: 0 });
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      updatePartyPlan({ guestCount: Math.max(0, Math.min(500, parsed)) });
    }
  };

  const handleGuestInputBlur = () => {
    let parsed = parseInt(guestInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      parsed = 1;
    } else if (parsed > 500) {
      parsed = 500;
    }
    setGuestInput(String(parsed));
    updatePartyPlan({ guestCount: parsed });
  };

  // Equipment item addition with trim and validation
  const handleAddEquipment = () => {
    const trimmed = newEquipmentText.trim();
    if (!trimmed) {
      showToast('⚠️ Vui lòng nhập tên trang thiết bị hoặc hạng mục hậu cần!');
      return;
    }
    addPartyEquipment(trimmed, newEquipmentCategory);
    setNewEquipmentText('');
    showToast(`📦 Đã thêm "${trimmed}" vào danh mục ${newEquipmentCategory}!`);
  };

  // Safe grocery sync handler
  const handleSyncToGrocery = () => {
    if (!hasDishes) {
      showToast('⚠️ Vui lòng thêm ít nhất một món vào thực đơn tiệc trước khi chuyển sang Đi Chợ!');
      return;
    }
    const validGuestCount = Math.max(1, Math.min(500, guestCount));
    if (partyPlan.guestCount !== validGuestCount) {
      updatePartyPlan({ guestCount: validGuestCount });
    }
    syncPartyToGrocery();
  };

  // Group dishes by course
  const dishesByCourse = (course: PartyDishItem['course']) => {
    return partyPlan.dishes
      .filter(d => d.course === course)
      .map(d => ({
        ...d,
        recipe: recipes.find(r => r.id === d.recipeId)
      }))
      .filter(d => d.recipe !== undefined);
  };

  // 1-Click Copy Zalo Quote with transparent food cost, seasonings & total quotation
  const handleCopyZaloQuote = async () => {
    if (!hasDishes) {
      showToast('⚠️ Vui lòng chọn ít nhất một món ăn trước khi xuất báo giá Zalo!');
      return;
    }

    let quote = `🎉 BẢNG BÁO GIÁ THỰC ĐƠN TIỆC & CATERING MEALWISE\n`;
    quote += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    quote += `📌 SỰ KIỆN: ${partyPlan.title || 'Tiệc Liên Hoan'}\n`;
    if (partyPlan.clientName) {
      quote += `👤 KHÁCH HÀNG: ${partyPlan.clientName}\n`;
    }
    const currentEventType = EVENT_TYPES.find(t => t.id === partyPlan.eventType);
    if (currentEventType) {
      quote += `🏷️ HÌNH THỨC: ${currentEventType.icon} ${currentEventType.label}\n`;
    }
    quote += `👥 QUY MÔ TIỆC: ${guestCount} khách\n`;
    quote += `🍽️ BỐ TRÍ BÀN: ${numTables} bàn (${tableSize} khách/bàn tiêu chuẩn)${hasPartialTable ? ` — gồm ${fullTables} bàn đủ + 1 bàn phụ (${remainderGuests} khách)` : ''}\n`;
    quote += `🛒 DỰ TOÁN NGUYÊN LIỆU (FOOD COST): ${roundedFoodCost.toLocaleString('vi-VN')} đ (~${foodCostPerHead.toLocaleString('vi-VN')} đ/khách)\n`;
    quote += `🧂 GIA VỊ & PHỤ LIỆU BẾP (10%): ${seasoningCost.toLocaleString('vi-VN')} đ\n`;
    if (totalLaborCost > 0) {
      quote += `👨‍🍳 CÔNG BẾP & PHỤC VỤ (${numTables} BÀN): ${totalLaborCost.toLocaleString('vi-VN')} đ (~${laborPerTable.toLocaleString('vi-VN')} đ/bàn)\n`;
    }
    quote += `💵 TỔNG DỰ TOÁN CHI PHÍ TRỌN GÓI: ${displayTotal.toLocaleString('vi-VN')} đ (~${displayPerHead.toLocaleString('vi-VN')} đ / khách, ~${displayPerTable.toLocaleString('vi-VN')} đ / bàn)\n`;
    quote += `⏱️ THỜI GIAN CHẾ BIẾN DỰ KIẾN: ~${kitchenWorkload.formattedTotalTime} (Sơ chế: ${kitchenWorkload.prepTimeMinutes}p • Bếp song song: ${kitchenWorkload.cookTimeMinutes}p)\n\n`;

    quote += `📋 THỰC ĐƠN CHI TIẾT THEO MÂM:\n`;
    COURSES.forEach(c => {
      const items = dishesByCourse(c.id);
      if (items.length > 0) {
        quote += `\n${c.name.toUpperCase()}:\n`;
        items.forEach((item, idx) => {
          const noteText = item.customNotes ? ` [Lưu ý: ${item.customNotes}]` : '';
          quote += `  ${idx + 1}. ${item.recipe?.title} (${item.recipe?.region === 'bac' ? 'Vị Bắc' : item.recipe?.region === 'nam' ? 'Vị Nam' : 'Vị Trung'})${noteText}\n`;
        });
      }
    });

    if (partyPlan.recommendedDrinks && partyPlan.recommendedDrinks.length > 0) {
      quote += `\n🍹 ĐỒ UỐNG GỢI Ý:\n`;
      partyPlan.recommendedDrinks.forEach(d => {
        quote += `  - ${d}\n`;
      });
    }

    if (partyPlan.equipmentChecklist && partyPlan.equipmentChecklist.length > 0) {
      quote += `\n📦 TRANG THIẾT BỊ & HẬU CẦN HỖ TRỢ:\n`;
      partyPlan.equipmentChecklist.forEach(eq => {
        quote += `  ${eq.done ? '✓' : '•'} [${eq.category}] ${eq.text}\n`;
      });
    }

    if (partyPlan.staffNotes) {
      quote += `\n📝 GHI CHÚ VẬN HÀNH: ${partyPlan.staffNotes}\n`;
    }

    quote += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    quote += `✨ Bếp MealWise hân hạnh đồng hành phục vụ sự kiện trọn vẹn!`;

    const success = await copyTextToClipboard(quote);
    if (success) {
      setCopiedQuote(true);
      showToast('📋 Đã sao chép bảng báo giá chuyên nghiệp để gửi Zalo cho khách!');
      setTimeout(() => setCopiedQuote(false), 3000);
    } else {
      showToast('⚠️ Không thể tự động sao chép. Vui lòng kiểm tra quyền trình duyệt.');
    }
  };

  // Add drink tag
  const handleAddDrink = (drinkToAdd?: string) => {
    const val = (drinkToAdd || newDrinkText).trim();
    if (!val) return;
    const current = partyPlan.recommendedDrinks || [];
    if (!current.includes(val)) {
      updatePartyPlan({ recommendedDrinks: [...current, val] });
      showToast(`🍹 Đã thêm đồ uống "${val}"!`);
    }
    if (!drinkToAdd) setNewDrinkText('');
  };

  const handleRemoveDrink = (drinkName: string) => {
    const current = partyPlan.recommendedDrinks || [];
    updatePartyPlan({ recommendedDrinks: current.filter(d => d !== drinkName) });
  };

  // Filter recipes for modal with Vietnamese diacritic-insensitive search & course filtering
  const filteredRecipes = React.useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = matchesRecipeSearch(r, recipeSearch);
      if (!matchesSearch) return false;

      // Filter by party course tab if not 'all'
      if (selectedModalCourseTab !== 'all') {
        if (!matchRecipeToPartyCourse(r, selectedModalCourseTab)) {
          return false;
        }
      }

      // Filter by meal category chips if not 'all'
      if (selectedFilterCategory !== 'all') {
        if (r.category !== selectedFilterCategory) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, recipeSearch, selectedModalCourseTab, selectedFilterCategory]);

  if (!isRegistered) {
    return (
      <div className="space-y-4 max-w-lg mx-auto pb-24 animate-in fade-in duration-300">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/5 dark:from-[#1A1918] dark:via-amber-950/20 dark:to-[#1A1918] border border-amber-500/30 text-center shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 mx-auto mb-3.5 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Tính Năng Thành Viên
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight mb-2">
            Lên Thực Đơn Tiệc & Catering
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed mb-6">
            Đăng ký tài khoản miễn phí để mở khóa hệ thống tính toán định lượng mâm tiệc cho <strong>10 đến 200+ khách</strong>, tự động chia bàn, danh mục thiết bị và xuất bảng báo giá chuyên nghiệp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left mb-6">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220]">
              <span className="text-lg block mb-1">🍗</span>
              <h4 className="text-xs font-black text-stone-900 dark:text-white mb-0.5">50+ Mâm Tiệc Chuẩn</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Đầy đủ 5 món: Khai vị, Món chính, Lẩu ấm, Tinh bột & Tráng miệng.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220]">
              <span className="text-lg block mb-1">👥</span>
              <h4 className="text-xs font-black text-stone-900 dark:text-white mb-0.5">Chia Bàn Tự Động</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Tự chia bàn 6, 8, 10 người và nhân suất ăn chuẩn xác từng gram.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220]">
              <span className="text-lg block mb-1">📋</span>
              <h4 className="text-xs font-black text-stone-900 dark:text-white mb-0.5">Báo Giá Zalo 1 Chạm</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Xuất bảng báo giá chi tiết, danh mục trang thiết bị gửi đối tác.</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Đăng Ký Miễn Phí Để Mở Khóa</span>
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-2.5 px-4 text-xs font-extrabold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
            >
              Đã có tài khoản? Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-36">
      
      {/* Top Banner & Mode Toggle */}
      <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold mb-1">
            <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Mâm Cỗ & Dịch Vụ Catering</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight">
            Quản Lý & Thiết Kế Thực Đơn Tiệc
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
            Lên mâm cỗ 5 món chuẩn vị, tự động tính food cost chính xác và xuất báo giá Zalo 1-chạm.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="w-full sm:w-auto flex items-center p-1 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('builder')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'builder'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-semibold'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Tự Lên Mâm</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('calendar')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'calendar'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-semibold'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Lịch Tiệc ({scheduledPartyEvents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('presets')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'presets'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-semibold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thư Viện Mẫu ({CORPORATE_PARTY_PRESETS.length + userPartyPlans.length})</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CUSTOM BUILDER */}
      {activeMode === 'builder' && (
        <div className="space-y-4">
          
          {/* Section 1: Event Setup & Headcount Stepper Header */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-3.5">
            {/* Event Type Chips Row & Actions */}
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                  Hình Thức Tiệc / Sự Kiện
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleInitialDate(undefined);
                      setEditingScheduleEvent(null);
                      setIsScheduleModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title="Đặt lịch tiệc cho thực đơn này"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Lên Lịch Tiệc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSavePlanTitle(partyPlan.title || 'Mâm Tiệc Gia Đình');
                      setSavePlanDesc(partyPlan.staffNotes || '');
                      setShowSavePresetModal(true);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Lưu kế hoạch hiện tại thành mẫu tiệc riêng của bạn"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Mẫu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        title: 'Tạo Mâm Tiệc Mới',
                        message: 'Bạn có muốn tạo một mâm tiệc mới từ đầu không? Các món đã chọn trong mâm hiện tại sẽ được làm mới.',
                        confirmLabel: 'Tạo Mâm Mới',
                        isDanger: false,
                        onConfirm: () => {
                          clearPartyDishes();
                          updatePartyPlan({
                            title: 'Mâm Tiệc Tự Lên Mới',
                            guestCount: 20,
                            tableSize: 10,
                            budgetPerHeadVnd: 200000,
                            staffNotes: ''
                          });
                          showToast('✨ Bắt đầu thiết kế mâm tiệc mới từ đầu!');
                        }
                      });
                    }}
                    className="px-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Bắt đầu tạo mâm tiệc mới từ đầu"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        title: 'Đặt Lại Thực Đơn',
                        message: 'Bạn có muốn khôi phục thực đơn tiệc về mẫu mặc định ban đầu không?',
                        confirmLabel: 'Đặt Lại Mặc Định',
                        isDanger: true,
                        onConfirm: () => {
                          resetPartyPlan();
                        }
                      });
                    }}
                    className="px-2 py-1.5 rounded-xl text-stone-500 hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                    title="Đặt lại thực đơn tiệc mặc định"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                </div>
              </div>

              {/* Responsive Event Type Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
                {EVENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updatePartyPlan({ eventType: type.id })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                      partyPlan.eventType === type.id
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-black shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-[#121110] text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-[#252220]'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span className="whitespace-nowrap">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Headcount Stepper & Table Calculation */}
            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-extrabold text-stone-900 dark:text-white truncate">
                    Số Lượng Khách:
                  </span>
                </div>

                {/* Thumb Stepper [-] [input] [+] */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStepGuestCount(-5)}
                    className="w-8 h-8 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-900 dark:text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95 shadow-2xs cursor-pointer border border-transparent dark:border-stone-700"
                    title="Giảm 5 khách"
                    aria-label="Giảm 5 khách"
                  >
                    -
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={guestInput}
                      onChange={handleGuestInputChange}
                      onBlur={handleGuestInputBlur}
                      className="w-16 h-8 text-center font-black text-sm bg-white dark:bg-[#1A1918] text-stone-900 dark:text-white border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStepGuestCount(5)}
                    className="w-8 h-8 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-900 dark:text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95 shadow-2xs cursor-pointer border border-transparent dark:border-stone-700"
                    title="Tăng 5 khách"
                    aria-label="Tăng 5 khách"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick count chips */}
              <div className="grid grid-cols-5 gap-1 pt-1 border-t border-[#E8E2D8] dark:border-[#252220]">
                {[10, 20, 30, 50, 100].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleSelectGuestChip(count)}
                    className={`py-1 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-black whitespace-nowrap transition-all flex items-center justify-center min-h-[32px] cursor-pointer ${
                      guestCount === count
                        ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                        : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-[#1A1918] border border-stone-200/80 dark:border-[#252220]'
                    }`}
                  >
                    {count} khách
                  </button>
                ))}
              </div>

              {/* Table count & Real Total Forecast */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-1 text-stone-600 dark:text-stone-300 font-semibold border-t border-[#E8E2D8] dark:border-[#252220]">
                <span className="text-amber-800 dark:text-amber-300 font-extrabold">
                  = {numTables} bàn {hasPartialTable ? `(${fullTables} bàn đủ + 1 bàn lẻ)` : `(${tableSize} khách/bàn)`}
                </span>
                <span className="text-stone-900 dark:text-white font-extrabold flex items-center gap-1">
                  <span>Dự toán:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-black text-xs">
                    ~{displayTotal.toLocaleString('vi-VN')} đ
                  </span>
                  {hasDishes && (
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                      (~{displayPerHead.toLocaleString('vi-VN')} đ/k)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Dynamic Cooking Time & Food Cost Estimation Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Ước Tính Chế Biến & Chi Phí Bữa Tiệc</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-200 dark:bg-[#252220] text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">
                  {guestCount} khách • {partyPlan.dishes.length} món
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left sm:text-center">
                {/* 1. Cooking Time */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-center shadow-2xs">
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                    ⏱️ Thời Gian Bếp
                  </span>
                  <span className="text-sm sm:text-base font-black text-stone-900 dark:text-white mt-0.5">
                    ~{kitchenWorkload.formattedTotalTime}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Sơ chế: {kitchenWorkload.prepTimeMinutes}p • Bếp song song: {kitchenWorkload.cookTimeMinutes}p
                  </span>
                </div>

                {/* 2. Raw Food Cost */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-center shadow-2xs">
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                    💵 Chi Phí Nguyên Liệu (Food Cost)
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-400 mt-0.5">
                    {roundedFoodCost.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    ~{foodCostPerHead.toLocaleString('vi-VN')} đ/khách ({foodCostPerTable.toLocaleString('vi-VN')} đ/bàn)
                  </span>
                </div>

                {/* 3. Total Final Party Cost */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-center shadow-2xs">
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                    🧾 Tổng Dự Toán Chi Phí
                  </span>
                  <span className="text-sm sm:text-base font-black text-stone-900 dark:text-white mt-0.5">
                    {displayTotal.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {hasDishes 
                      ? `Đã gồm nguyên liệu + ${seasoningCost.toLocaleString('vi-VN')} đ gia vị` 
                      : 'Chưa có món nào trong thực đơn'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expandable Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 dark:bg-[#121110] dark:hover:bg-[#252220] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Cài đặt báo giá, phụ phí & Hạch toán lợi nhuận</span>
              </span>
              {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Expandable Body */}
            {showAdvancedSettings && (
              <div className="space-y-3.5 pt-2 border-t border-stone-200 dark:border-stone-800 animate-fade-in">
                {/* Title & Client Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Tên Sự Kiện / Tiệc
                    </label>
                    <input
                      type="text"
                      value={partyPlan.title}
                      onChange={(e) => updatePartyPlan({ title: e.target.value })}
                      placeholder="VD: Tiệc Tất Niên Công Ty..."
                      className="w-full bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Tên Khách Hàng / Đơn Vị Đặt
                    </label>
                    <input
                      type="text"
                      value={partyPlan.clientName || ''}
                      onChange={(e) => updatePartyPlan({ clientName: e.target.value })}
                      placeholder="VD: Anh Minh (Phòng Marketing)..."
                      className="w-full bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Pricing Mode Selector & Labor Cost Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pricing Model Switch */}
                  <div className="bg-white dark:bg-[#121110] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-between">
                    <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Mô Hình Tính Giá
                    </label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setPricingMode('cost_plus')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          pricingMode === 'cost_plus'
                            ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                            : 'bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300 hover:text-stone-900'
                        }`}
                      >
                        Theo Món Thực Tế
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricingMode('fixed_quote')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          pricingMode === 'fixed_quote'
                            ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                            : 'bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300 hover:text-stone-900'
                        }`}
                      >
                        Khoán Theo Khách
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                      {pricingMode === 'cost_plus'
                        ? '✓ Tổng giá tự cập nhật chính xác khi thêm/bớt món'
                        : '✓ Đặt đơn giá khoán cố định theo suất ăn'}
                    </span>
                  </div>

                  {/* Labor / Cooking fee per table */}
                  <div className="bg-white dark:bg-[#121110] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-between">
                    <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Công Nấu & Phục Vụ / Bàn
                    </label>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {[0, 150000, 200000, 250000].map(fee => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setLaborPerTable(fee)}
                          className={`py-1 px-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                            laborPerTable === fee
                              ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                              : 'bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300 hover:text-stone-900'
                          }`}
                        >
                          {fee === 0 ? 'Tự nấu' : `${fee / 1000}k`}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                      {totalLaborCost > 0
                        ? `Tổng công: ${totalLaborCost.toLocaleString('vi-VN')} đ (${numTables} bàn)`
                        : 'Gia đình tự chuẩn bị (0 đ)'}
                    </span>
                  </div>
                </div>

                {/* Table Size & Budget Per Head (Fixed Quote Mode) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-[#121110] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-between">
                    <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Quy Cách Bàn Tiệc
                    </label>
                    <div className="flex items-center gap-1 mt-1">
                      {([6, 8, 10] as const).map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updatePartyPlan({ tableSize: size })}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                            tableSize === size
                              ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                              : 'bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        >
                          {size} người
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#121110] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#252220] flex flex-col justify-between">
                    <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Đơn Giá Khoán / Khách (VND)
                    </label>
                    <input
                      type="number"
                      step={10000}
                      value={partyPlan.budgetPerHeadVnd || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updatePartyPlan({ budgetPerHeadVnd: isNaN(val) ? 0 : val });
                      }}
                      onBlur={() => {
                        if (!partyPlan.budgetPerHeadVnd || partyPlan.budgetPerHeadVnd < 30000) {
                          updatePartyPlan({ budgetPerHeadVnd: 50000 });
                        }
                      }}
                      className="w-full mt-1 bg-[#FAF8F5] dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-lg px-2 py-1 text-xs font-black text-amber-700 dark:text-amber-400 text-center focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center justify-center gap-1 mt-1 pt-1 border-t border-[#E8E2D8] dark:border-[#252220]">
                      {[150000, 200000, 250000, 300000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updatePartyPlan({ budgetPerHeadVnd: val })}
                          className={`px-1 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                            budgetPerHead === val
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                              : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-[#252220]'
                          }`}
                        >
                          {val / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Operational Staff Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Ghi Chú Khách Hàng / Hướng Dẫn Bếp
                  </label>
                  <textarea
                    rows={2}
                    value={partyPlan.staffNotes || ''}
                    onChange={(e) => updatePartyPlan({ staffNotes: e.target.value })}
                    placeholder="Ghi chú về thời gian dọn cỗ, trẻ nhỏ, dị ứng thức ăn..."
                    className="w-full bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none transition-colors"
                  />
                </div>

                {/* Profit Margin & Financial Breakdown Card */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220]">
                      <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block uppercase">
                        Food Cost (Nguyên liệu)
                      </span>
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400 block mt-0.5">
                        {roundedFoodCost.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        ~{foodCostPerTable.toLocaleString('vi-VN')} đ/bàn
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220]">
                      <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block uppercase">
                        Tổng Dự Toán ({pricingMode === 'cost_plus' ? 'Thực tế' : 'Báo giá'})
                      </span>
                      <span className="text-sm font-black text-amber-700 dark:text-amber-400 block mt-0.5">
                        {displayTotal.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        ~{displayPerTable.toLocaleString('vi-VN')} đ/bàn
                      </span>
                    </div>
                  </div>

                  {pricingMode === 'fixed_quote' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-stone-900 dark:text-white">
                          Lợi Nhuận Gộp Ước Tính:
                        </span>
                        <span className={`font-black text-xs ${grossProfit >= 0 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {grossProfit.toLocaleString('vi-VN')} đ ({profitMarginPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-rose-500 h-full" style={{ width: `${hasDishes ? Math.min(100, Math.max(0, 100 - Math.max(0, profitMarginPercent))) : 0}%` }} />
                        <div className="bg-amber-500 h-full" style={{ width: `${hasDishes ? Math.min(100, Math.max(0, profitMarginPercent)) : 0}%` }} />
                      </div>
                    </div>
                  )}

                  {isBudgetWarning && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>Cảnh báo: Chi phí nguyên liệu thực phẩm ({roundedFoodCost.toLocaleString('vi-VN')} đ) đang vượt quá mức báo giá ({totalQuotation.toLocaleString('vi-VN')} đ)!</span>
                    </div>
                  )}

                  {/* Actions in Settings */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyZaloQuote}
                      className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      {copiedQuote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedQuote ? 'Đã Chép' : 'Copy Báo Giá'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSyncToGrocery}
                      className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#1A1918] dark:hover:bg-[#252220] text-stone-800 dark:text-white font-extrabold text-xs border border-stone-200 dark:border-[#252220] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Đẩy Đi Chợ</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Course-by-Course Menu Studio */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Thực Đơn Mâm Cỗ Theo Từng Món ({partyPlan.dishes.length} món)</span>
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Thực đơn chuẩn phong vị cỗ Việt: đủ đầy Khai vị, Đạm mặn, Lẩu ấm nóng, Tinh bột no bụng và Tráng miệng.
                </p>
              </div>

              {partyPlan.dishes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      title: 'Dọn Trống Thực Đơn',
                      message: 'Bạn có chắc chắn muốn dọn sạch tất cả món khỏi thực đơn mâm tiệc này không?',
                      confirmLabel: 'Dọn Sạch Món',
                      isDanger: true,
                      onConfirm: () => {
                        clearPartyDishes();
                      }
                    });
                  }}
                  className="text-xs text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors self-start sm:self-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dọn trống thực đơn</span>
                </button>
              )}
            </div>

            {/* Empty state card when 0 dishes */}
            {!hasDishes && (
              <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/15 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Utensils className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                    Thực Đơn Tiệc Đang Trống
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Hãy bấm nút <span className="font-bold text-amber-700 dark:text-amber-400">+ Thêm Món</span> ở từng nhóm bên dưới để lên mâm cỗ 5 món chuẩn vị, hoặc khám phá ngay các mâm tiệc mẫu định sẵn.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCourse('appetizer');
                      setRecipeSearch('');
                      setSelectedFilterCategory('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bắt Đầu Thêm Món Khai Vị</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('presets')}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#1A1918] hover:bg-stone-100 dark:hover:bg-[#252220] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-[#252220] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Xem Mâm Tiệc Mẫu</span>
                  </button>
                </div>
              </div>
            )}

            {/* Courses list with Accordion */}
            <div className="space-y-4">
              {COURSES.map(course => {
                const CourseIcon = course.icon;
                const items = dishesByCourse(course.id);
                const isExpanded = expandedCourses[course.id] ?? true;

                // Calculate total estimated cost for this specific course
                const courseTotalCost = items.reduce((sum, dish) => {
                  const r = dish.recipe;
                  if (!r) return sum;
                  const servings = r.servings && r.servings > 0 ? r.servings : 4;
                  const factor = guestCount / servings;
                  return sum + Math.round((r.estimatedCostVnd || 40000) * factor);
                }, 0);

                return (
                  <div 
                    key={course.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] transition-all shadow-xs space-y-3"
                  >
                    {/* Course Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div 
                        onClick={() => toggleCourseExpanded(course.id)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none group"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCourseExpanded(course.id); }}}
                        aria-expanded={isExpanded}
                      >
                        <div className={`p-2 rounded-xl border ${course.colorClass} shrink-0`}>
                          <CourseIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {course.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#252220] text-stone-700 dark:text-stone-300">
                              {items.length} món
                            </span>
                            {items.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                ~{courseTotalCost.toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">{course.subtitle}</p>
                        </div>
                      </div>

                      {/* Header Actions: Add dish + Accordion Toggle Chevron */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setModalCourse(course.id);
                            setRecipeSearch('');
                            setSelectedFilterCategory('all');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Thêm Món</span>
                          <span className="sm:hidden">Thêm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCourseExpanded(course.id)}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
                          aria-label={isExpanded ? `Thu gọn ${course.name}` : `Mở rộng ${course.name}`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Dishes in this course (Collapsible) */}
                    {isExpanded && (
                      <>
                        {items.length === 0 ? (
                          <div className="py-5 text-center rounded-2xl border border-dashed border-[#E8E2D8] dark:border-[#252220] text-stone-500 dark:text-stone-400 text-xs">
                            Chưa có món nào cho {course.name}. Nhấn <span className="text-stone-900 dark:text-white font-bold">+ Thêm Món</span> để chọn từ kho công thức.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {items.map(dish => {
                              const r = dish.recipe!;
                              const servings = r.servings && r.servings > 0 ? r.servings : 4;
                              const factor = guestCount / servings;
                              const scaledDishCost = Math.round((r.estimatedCostVnd || 40000) * factor);
                              const costPerTableForDish = numTables > 0 ? Math.round(scaledDishCost / numTables) : 0;
                              const isEditingNote = editingNoteDishId === dish.recipeId;

                              return (
                                <div 
                                  key={dish.recipeId}
                                  className="group relative p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2.5"
                                >
                                  <div className="flex items-start gap-3">
                                    <SafeImage
                                      src={r.imageUrl}
                                      alt={r.title}
                                      fallbackTitle={r.title}
                                      category="Món Tiệc"
                                      className="w-16 h-16 rounded-xl object-cover shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                                      onClick={() => setSelectedRecipe(r)}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 
                                        onClick={() => setSelectedRecipe(r)}
                                        className="text-xs font-extrabold text-stone-900 dark:text-white truncate cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                      >
                                        {r.title}
                                      </h4>
                                      <p className="text-[10px] text-stone-600 dark:text-stone-300 truncate mt-0.5">
                                        {r.description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1.5 text-[10px] flex-wrap">
                                        <span className="font-bold text-amber-800 dark:text-amber-300 bg-white dark:bg-[#1A1918] px-2 py-0.5 rounded-md border border-[#E8E2D8] dark:border-[#252220]">
                                          ~{costPerTableForDish.toLocaleString('vi-VN')} đ/bàn
                                        </span>
                                        <span className="text-stone-600 dark:text-stone-300 font-medium">
                                          Tổng: {scaledDishCost.toLocaleString('vi-VN')} đ
                                        </span>
                                      </div>
                                    </div>

                                    {/* Prominent remove dish button with 36px+ touch target */}
                                    <button
                                      type="button"
                                      onClick={() => removeDishFromParty(dish.recipeId)}
                                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 transition-colors shrink-0 active:scale-95 cursor-pointer"
                                      title="Bỏ món này khỏi thực đơn"
                                      aria-label={`Bỏ món ${r.title}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Custom kitchen / dish note */}
                                  <div className="pt-1.5 border-t border-[#E8E2D8] dark:border-[#252220]">
                                    {isEditingNote ? (
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          defaultValue={dish.customNotes || ''}
                                          autoFocus
                                          onBlur={(e) => {
                                            updatePartyDishNote(dish.recipeId, e.target.value);
                                            setEditingNoteDishId(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              updatePartyDishNote(dish.recipeId, (e.target as HTMLInputElement).value);
                                              setEditingNoteDishId(null);
                                            } else if (e.key === 'Escape') {
                                              setEditingNoteDishId(null);
                                            }
                                          }}
                                          placeholder="Lưu ý bếp (VD: ít cay, dọn đầu)..."
                                          className="flex-1 bg-white dark:bg-[#1A1918] border border-amber-500/50 rounded-lg px-2 py-1 text-[11px] text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none"
                                        />
                                      </div>
                                    ) : (
                                      <div 
                                        onClick={() => setEditingNoteDishId(dish.recipeId)}
                                        className="flex items-center gap-1.5 text-[10px] text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 cursor-pointer transition-colors min-w-0"
                                        title="Nhấp để thêm hoặc sửa ghi chú bếp cho món này"
                                      >
                                        <MessageSquare className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <span className="truncate min-w-0 flex-1">
                                          {dish.customNotes ? (
                                            <span className="text-amber-700 dark:text-amber-300 font-medium italic">"{dish.customNotes}"</span>
                                          ) : (
                                            <span className="text-stone-500 dark:text-stone-400 italic">+ Thêm ghi chú bếp...</span>
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Recommended Drinks & Equipment Logistics Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Drinks Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white">Đồ Uống Kèm Tiệc</h3>
                </div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  {(partyPlan.recommendedDrinks || []).length} loại
                </span>
              </div>

              {/* Drinks Chips */}
              <div className="flex flex-wrap gap-2">
                {(partyPlan.recommendedDrinks || []).map((drink, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs font-bold text-stone-800 dark:text-stone-200"
                  >
                    <span>{drink}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDrink(drink)}
                      className="text-stone-500 hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                      aria-label={`Bỏ đồ uống ${drink}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick suggestions */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block mb-1.5">
                  Gợi ý nhanh cho bàn tiệc:
                </span>
                <div className="flex flex-wrap gap-1">
                  {QUICK_DRINKS.map((quickD, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddDrink(quickD)}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-[#121110] dark:hover:bg-[#252220] text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white text-[10px] font-semibold border border-stone-200 dark:border-[#252220] transition-colors cursor-pointer"
                    >
                      + {quickD}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Drink Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newDrinkText}
                  onChange={(e) => setNewDrinkText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddDrink(); }}
                  placeholder="Thêm đồ uống (Rượu vang, Bia, Nước ép...)"
                  className="flex-1 bg-[#FAF8F5] dark:bg-[#121110] border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  aria-label="Tên đồ uống mới"
                />
                <button
                  type="button"
                  onClick={() => handleAddDrink()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>

            {/* Logistics & Equipment Checklist Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white">Dụng Cụ Tiệc & Hậu Cần Catering</h3>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {partyPlan.equipmentChecklist.filter(e => e.done).length} / {partyPlan.equipmentChecklist.length} xong
                </span>
              </div>

              {/* Checklist items */}
              {partyPlan.equipmentChecklist.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-600 dark:text-stone-300 border border-dashed border-[#E8E2D8] dark:border-[#252220] rounded-2xl">
                  Chưa có thiết bị nào trong checklist. Thêm thiết bị cần chuẩn bị bên dưới.
                </div>
              ) : (
                <div className="space-y-2">
                  {partyPlan.equipmentChecklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => togglePartyEquipment(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          togglePartyEquipment(item.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${item.done ? 'Đã chuẩn bị' : 'Chưa chuẩn bị'}: ${item.text}`}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 ${
                        item.done
                          ? 'bg-stone-100/60 dark:bg-[#121110]/60 border-[#E8E2D8] dark:border-[#252220] text-stone-500 dark:text-stone-400 line-through'
                          : 'bg-[#FAF8F5] dark:bg-[#121110] border-[#E8E2D8] dark:border-[#252220] hover:border-amber-500/40 text-stone-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 dark:text-stone-600 shrink-0 mt-0.5 sm:mt-0" />
                        )}
                        <span className="text-xs font-semibold leading-relaxed break-words flex-1">{item.text}</span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-6 sm:pl-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#1A1918] text-stone-600 dark:text-stone-300 border border-[#E8E2D8] dark:border-[#252220]">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePartyEquipment(item.id);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-rose-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                          title="Xóa thiết bị này"
                          aria-label={`Xóa ${item.text}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Equipment Item */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newEquipmentText}
                  onChange={(e) => setNewEquipmentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEquipment();
                    }
                  }}
                  placeholder="Thêm thiết bị (Bếp gas, Ly vang, Khăn bàn...)"
                  className="flex-1 min-w-0 bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  aria-label="Tên trang thiết bị mới"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={newEquipmentCategory}
                    onChange={(e) => setNewEquipmentCategory(e.target.value)}
                    className="flex-1 sm:flex-initial bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] rounded-xl px-2 py-2 text-xs text-stone-700 dark:text-stone-300 focus:outline-none"
                    aria-label="Danh mục thiết bị"
                  >
                    <option value="Dụng cụ tiệc">Dụng cụ tiệc</option>
                    <option value="Thiết bị âm thanh">Âm thanh</option>
                    <option value="Nhân sự">Nhân sự</option>
                    <option value="Nhà cung cấp">Nhà cung cấp</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 transition-colors shrink-0 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODE 2: PARTY CALENDAR VIEW */}
      {activeMode === 'calendar' && (
        <PartyCalendarView
          onOpenScheduleModal={(date) => {
            setScheduleInitialDate(date);
            setEditingScheduleEvent(null);
            setIsScheduleModalOpen(true);
          }}
          onEditEvent={(event) => {
            setEditingScheduleEvent(event);
            setIsScheduleModalOpen(true);
          }}
          onSwitchToBuilder={() => setActiveMode('builder')}
        />
      )}

      {/* MODE 3: PRESET LIBRARY */}
      {activeMode === 'presets' && (
        <div className="space-y-6">
          {/* Sub-tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Thư Viện Mẫu Tiệc & Thực Đơn Của Tôi</span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Chọn mẫu tiệc tối ưu sẵn hoặc xem và áp dụng lại các mẫu tiệc bạn đã tự lên và lưu lại.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setPresetSubTab('catalog')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  presetSubTab === 'catalog'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mẫu Có Sẵn ({CORPORATE_PARTY_PRESETS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetSubTab('my_presets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  presetSubTab === 'my_presets'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <FolderHeart className="w-3.5 h-3.5" />
                <span>Mẫu Của Tôi ({userPartyPlans.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MẪU CÓ SẴN (CATALOG) */}
          {presetSubTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CORPORATE_PARTY_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  className="group rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] hover:border-amber-500/40 overflow-hidden flex flex-col justify-between transition-all shadow-sm"
                >
                  <div>
                    {/* Preset Image & Tags */}
                    <div className="relative h-48 overflow-hidden">
                      <SafeImage
                        src={preset.image}
                        alt={preset.title}
                        fallbackTitle={preset.title}
                        category="Món Tiệc"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/30 text-xs font-extrabold backdrop-blur-md">
                          {preset.categoryTag}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="font-extrabold bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800">
                          👥 Mặc định: {preset.defaultGuestCount} khách
                        </span>
                        <span className="font-black text-amber-400 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800">
                          ~{preset.suggestedPerHeadBudgetVnd.toLocaleString('vi-VN')} đ/khách
                        </span>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                        {preset.description}
                      </p>

                      {/* Included recipes chips */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                          Các món tiêu biểu trong set:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {preset.menuRecipes.map((r, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#121110] text-stone-700 dark:text-stone-200 text-xs font-semibold border border-[#E8E2D8] dark:border-[#252220]"
                            >
                              🍽️ {r.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        applyPresetToParty(preset.id);
                        setActiveMode('builder');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        showToast(`🎉 Đã áp dụng mẫu "${preset.title}"!`);
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Áp Dụng & Tùy Biến Mẫu Này</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MẪU CỦA TÔI (USER CUSTOM SAVED PRESETS) */}
          {presetSubTab === 'my_presets' && (
            <div>
              {userPartyPlans.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <FolderHeart className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                      Chưa Có Mẫu Tiệc Tự Tạo Nào
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      Bạn có thể chọn món, chỉnh số khách, tính thời gian nấu và bấm nút <strong>"Lưu Mẫu Tiệc"</strong> trong tab "Tự Lên Mâm" để lưu lại vào đây.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMode('builder')}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md shadow-amber-500/25 inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tự Thiết Kế Mẫu Tiệc Đầu Tiên</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userPartyPlans.map(preset => {
                    const totalHours = Math.floor(preset.totalTimeMinutes / 60);
                    const totalMins = preset.totalTimeMinutes % 60;
                    const timeFormatted = totalHours > 0 
                      ? `${totalHours} giờ${totalMins > 0 ? ` ${totalMins} phút` : ''}`
                      : `${totalMins} phút`;

                    return (
                      <div
                        key={preset.id}
                        className="rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] hover:border-amber-500/40 p-5 flex flex-col justify-between space-y-4 transition-all shadow-sm"
                      >
                        <div className="space-y-3">
                          {/* Top Tag & Delete */}
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-black flex items-center gap-1.5">
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>Mẫu Tiệc Của Tôi</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDialog({
                                  title: 'Xóa Mẫu Tiệc',
                                  message: `Bạn có chắc chắn muốn xóa mẫu tiệc "${preset.title}" khỏi Thư Viện Mẫu của bạn không?`,
                                  confirmLabel: 'Xác Nhận Xóa',
                                  isDanger: true,
                                  onConfirm: () => {
                                    deleteUserPartyPlan(preset.id);
                                  }
                                });
                              }}
                              className="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Xóa mẫu tiệc này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h3 className="text-base font-black text-stone-900 dark:text-white leading-snug">
                              {preset.title}
                            </h3>
                            {preset.description && (
                              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                                {preset.description}
                              </p>
                            )}
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center pt-1">
                            <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
                              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block uppercase">
                                Quy Mô
                              </span>
                              <span className="text-xs font-black text-stone-900 dark:text-white block mt-0.5">
                                {preset.guestCount} khách
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
                              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block uppercase">
                                Nấu Nướng
                              </span>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                                ~{timeFormatted}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
                              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block uppercase">
                                Food Cost
                              </span>
                              <span className="text-xs font-black text-amber-700 dark:text-amber-400 block mt-0.5">
                                {preset.totalFoodCostVnd ? `${Math.round(preset.totalFoodCostVnd / 1000).toLocaleString('vi-VN')}k` : '0đ'}
                              </span>
                            </div>
                          </div>

                          {/* Included dishes chips */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                              Món ăn trong thực đơn ({preset.dishes.length} món):
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {preset.dishes.map((dish, i) => {
                                const recipe = recipes.find(r => r.id === dish.recipeId);
                                return (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#121110] text-stone-700 dark:text-stone-200 text-xs font-semibold border border-[#E8E2D8] dark:border-[#252220]"
                                  >
                                    🍽️ {recipe?.title || dish.recipeId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              loadUserPartyPlan(preset);
                              setActiveMode('builder');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Áp Dụng & Tùy Biến Mẫu Này</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FIXED BOTTOM ACTION BAR FOR ZALO QUOTATION, SAVE PRESET & GROCERY SYNC */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full sm:max-w-md md:max-w-lg z-30 px-3 py-2.5 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-t sm:border-x border-[#E8E2D8] dark:border-[#252220] shadow-lg flex items-center justify-between gap-2 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-stone-600 dark:text-stone-400 font-bold block uppercase tracking-wider leading-tight truncate">
            <span className="hidden sm:inline">{guestCount} khách • {numTables} bàn • ⏱️ ~{kitchenWorkload.formattedTotalTime}</span>
            <span className="sm:hidden">{guestCount}k • {numTables} bàn • ~{kitchenWorkload.formattedTotalTime}</span>
          </span>
          <p className="text-sm font-black text-stone-900 dark:text-white truncate">
            {displayTotal.toLocaleString('vi-VN')} đ
            {hasDishes && (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 ml-1.5">
                (Food Cost: {roundedFoodCost.toLocaleString('vi-VN')} đ)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setScheduleInitialDate(undefined);
              setEditingScheduleEvent(null);
              setIsScheduleModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 dark:bg-[#1A1918] dark:hover:bg-[#252220] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220] transition-colors shrink-0 cursor-pointer"
            title="Đặt lịch tiệc cho thực đơn này"
            aria-label="Đặt lịch tiệc cho thực đơn này"
          >
            <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSavePlanTitle(partyPlan.title || 'Mâm Tiệc Gia Đình');
              setSavePlanDesc(partyPlan.staffNotes || '');
              setShowSavePresetModal(true);
            }}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 dark:bg-[#1A1918] dark:hover:bg-[#252220] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220] transition-colors shrink-0 cursor-pointer"
            title="Lưu thành mẫu tiệc riêng"
            aria-label="Lưu thành mẫu tiệc riêng"
          >
            <Save className="w-4 h-4 text-stone-700 dark:text-stone-300" />
          </button>

          <button
            type="button"
            onClick={handleCopyZaloQuote}
            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            {copiedQuote ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedQuote ? 'Đã Chép' : 'Báo Giá'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncToGrocery}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 dark:bg-[#1A1918] dark:hover:bg-[#252220] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#252220] transition-colors shrink-0 cursor-pointer"
            title="Chuyển nguyên liệu tiệc sang Đi Chợ"
            aria-label="Chuyển nguyên liệu tiệc sang Đi Chợ"
          >
            <ShoppingCart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      </div>

      {/* SAVE CUSTOM PARTY PLAN MODAL */}
      {showSavePresetModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSavePresetModal(false)}
        >
          <div 
            className="bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 dark:text-white">
                    Lưu Thực Đơn Thành Mẫu Tiệc Riêng
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Lưu vào thư viện "Mẫu Của Tôi" để dễ dàng sử dụng lại bất cứ lúc nào
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                  Tên Mẫu Tiệc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={savePlanTitle}
                  onChange={(e) => setSavePlanTitle(e.target.value)}
                  placeholder="VD: Tiệc Tân Gia 30 Khách, Cỗ Giỗ Miền Bắc, BBQ Cuối Tuần..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs font-bold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                  Mô Tả / Ghi Chú Riêng (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={savePlanDesc}
                  onChange={(e) => setSavePlanDesc(e.target.value)}
                  placeholder="Ghi chú về khẩu vị, đối tượng khách hoặc các lưu ý khi nấu..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                />
              </div>

              {/* Real-time calculated specs preview inside modal */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/25 space-y-2 text-xs">
                <div className="font-extrabold text-stone-900 dark:text-white flex items-center justify-between">
                  <span>Thông số thực đơn được lưu:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-black">
                    {partyPlan.dishes.length} món
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#121110]/80 border border-[#E8E2D8] dark:border-[#252220]">
                    <span className="text-stone-500 dark:text-stone-400 block font-semibold">👥 Quy mô tiệc:</span>
                    <span className="font-black text-stone-900 dark:text-white text-xs">
                      {guestCount} khách ({numTables} bàn)
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#121110]/80 border border-[#E8E2D8] dark:border-[#252220]">
                    <span className="text-stone-500 dark:text-stone-400 block font-semibold">⏱️ Thời gian chế biến:</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                      ~{kitchenWorkload.formattedTotalTime}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#121110]/80 border border-[#E8E2D8] dark:border-[#252220]">
                    <span className="text-stone-500 dark:text-stone-400 block font-semibold">💵 Food Cost dự toán:</span>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-xs">
                      {roundedFoodCost.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#121110]/80 border border-[#E8E2D8] dark:border-[#252220]">
                    <span className="text-stone-500 dark:text-stone-400 block font-semibold">💰 Tổng dự toán:</span>
                    <span className="font-black text-amber-700 dark:text-amber-400 text-xs">
                      {displayTotal.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Dish names summary */}
                <div className="pt-1 text-[11px] text-stone-600 dark:text-stone-300">
                  <span className="font-bold block mb-1">Món ăn trong mâm:</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {partyPlan.dishes.map((item, idx) => {
                      const recipe = recipes.find(r => r.id === item.recipeId);
                      return (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#121110] text-stone-800 dark:text-stone-200 text-[10px] font-medium border border-[#E8E2D8] dark:border-[#252220]"
                        >
                          {recipe?.title || item.recipeId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!savePlanTitle.trim()) {
                    showToast('⚠️ Vui lòng nhập tên cho mẫu tiệc!');
                    return;
                  }
                  saveCurrentPlanAsPreset(savePlanTitle, savePlanDesc);
                  setShowSavePresetModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Thành Mẫu Tiệc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP NATIVE CONFIRMATION MODAL */}
      {confirmDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setConfirmDialog(null)}
        >
          <div 
            className="bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmDialog.isDanger
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}>
                {confirmDialog.isDanger ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-stone-900 dark:text-white leading-snug">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#252220] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Hủy bỏ'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
                className={`px-4 py-2 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  confirmDialog.isDanger
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/25'
                }`}
              >
                <span>{confirmDialog.confirmLabel || 'Đồng ý'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISH SELECTOR NATIVE MOBILE BOTTOM SHEET */}
      {modalCourse && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setModalCourse(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              transform: dishModalDragY > 0 ? `translateY(${dishModalDragY}px)` : undefined,
              transition: dishModalDragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
            className="bg-white dark:bg-[#1A1918] border-t border-[#E8E2D8] dark:border-[#252220] rounded-t-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
          >
            {/* Swipe Handle Bar & Drag Zone */}
            <div 
              onTouchStart={(e) => { dishModalTouchStartY.current = e.touches[0].clientY; }}
              onTouchMove={(e) => {
                if (dishModalTouchStartY.current === null) return;
                const diff = e.touches[0].clientY - dishModalTouchStartY.current;
                if (diff > 0) setDishModalDragY(diff);
              }}
              onTouchEnd={() => {
                if (dishModalDragY > 75) setModalCourse(null);
                setDishModalDragY(0);
                dishModalTouchStartY.current = null;
              }}
              className="w-full py-2.5 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center touch-none select-none"
            >
              <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
            </div>

            {/* Modal Header */}
            <div 
              onTouchStart={(e) => { dishModalTouchStartY.current = e.touches[0].clientY; }}
              onTouchMove={(e) => {
                if (dishModalTouchStartY.current === null) return;
                const diff = e.touches[0].clientY - dishModalTouchStartY.current;
                if (diff > 0) setDishModalDragY(diff);
              }}
              onTouchEnd={() => {
                if (dishModalDragY > 75) setModalCourse(null);
                setDishModalDragY(0);
                dishModalTouchStartY.current = null;
              }}
              className="px-4 pb-2.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 touch-none select-none"
            >
              <div className="min-w-0 flex-1 pr-2">
                <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5 truncate">
                  <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">
                    {selectedModalCourseTab === 'all'
                      ? `Chọn món từ Kho dữ liệu (${recipes.length} món Việt)`
                      : `Thêm vào "${COURSES.find(c => c.id === selectedModalCourseTab)?.name}"`}
                  </span>
                </h3>
                <p className="text-[10px] text-stone-600 dark:text-stone-300 truncate">
                  Kho dữ liệu chuẩn {recipes.length} món Việt — Chọn món bổ sung vào thực đơn tiệc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalCourse(null)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#252220] text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search & Filter Tabs */}
            <div className="p-3 border-b border-stone-100 dark:border-stone-800 space-y-2 bg-[#FAF8F5] dark:bg-[#121110] shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder={`Tìm kiếm trong ${recipes.length} món (tên món, nguyên liệu...)...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#1A1918] border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Course Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                {[
                  { id: 'all' as const, label: `Tất cả (${recipes.length})`, icon: '✨' },
                  { id: 'appetizer' as const, label: 'Khai Vị', icon: '🥗' },
                  { id: 'main' as const, label: 'Món Chính', icon: '🥩' },
                  { id: 'soup_hotpot' as const, label: 'Lẩu & Canh', icon: '🍲' },
                  { id: 'staple' as const, label: 'Tinh Bột', icon: '🍚' },
                  { id: 'dessert_drink' as const, label: 'Tráng Miệng', icon: '🍧' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedModalCourseTab(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl shrink-0 transition-all text-[11px] flex items-center gap-1.5 cursor-pointer ${
                      selectedModalCourseTab === tab.id
                        ? 'bg-amber-500 text-stone-950 font-black shadow-xs ring-1 ring-amber-400/50'
                        : 'bg-white dark:bg-[#1A1918] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-500/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] font-semibold scrollbar-none">
                {[
                  { id: 'all', label: 'Tất cả loại' },
                  { id: 'mon-man', label: 'Món Mặn' },
                  { id: 'mon-canh', label: 'Món Canh' },
                  { id: 'mon-rau', label: 'Rau / Gỏi' },
                  { id: 'mon-chay', label: 'Món Chay' },
                  { id: 'an-sang', label: 'Ăn Sáng' },
                  { id: 'trang-mieng', label: 'Tráng Miệng' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedFilterCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      selectedFilterCategory === cat.id
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold'
                        : 'bg-white dark:bg-[#1A1918] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-stone-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
                <span className="text-[10px] text-stone-400 dark:text-stone-500 ml-auto shrink-0 font-medium">
                  ({filteredRecipes.length} món)
                </span>
              </div>
            </div>

            {/* Modal Recipe List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
              {filteredRecipes.length === 0 ? (
                <div className="py-8 text-center text-stone-600 dark:text-stone-300 text-xs space-y-2">
                  <p>Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.</p>
                  {(selectedModalCourseTab !== 'all' || selectedFilterCategory !== 'all' || recipeSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModalCourseTab('all');
                        setSelectedFilterCategory('all');
                        setRecipeSearch('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                    >
                      Xem toàn bộ {recipes.length} món
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredRecipes.slice(0, visibleDishCount).map(recipe => {
                    const effectiveCourse = resolveTargetCourse(recipe, selectedModalCourseTab, modalCourse);
                    const existingDish = partyPlan.dishes.find(d => d.recipeId === recipe.id);
                    const isAdded = Boolean(existingDish);
                    const isSameCourse = existingDish?.course === effectiveCourse;
                    const courseShortNames: Record<PartyDishItem['course'], string> = {
                      appetizer: 'Khai Vị',
                      main: 'Món Chính',
                      soup_hotpot: 'Lẩu & Canh',
                      staple: 'Tinh Bột',
                      dessert_drink: 'Tráng Miệng'
                    };
                    const targetCourseShortName = courseShortNames[effectiveCourse] || 'Món tiệc';

                    return (
                      <div
                        key={recipe.id}
                        className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] hover:border-amber-500/50 flex flex-col justify-between space-y-2 transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <SafeImage
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            fallbackTitle={recipe.title}
                            category="Món Tiệc"
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-stone-900 dark:text-white truncate">
                              {recipe.title}
                            </h4>
                            <p className="text-[10px] text-stone-600 dark:text-stone-300 line-clamp-1 mt-0.5">
                              {recipe.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-600 dark:text-stone-300 font-semibold">
                              <span className="text-amber-700 dark:text-amber-400 font-bold">
                                ~{(recipe.estimatedCostVnd || 40000).toLocaleString('vi-VN')} đ
                              </span>
                              <span>•</span>
                              <span>{recipe.servings || 4} suất</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 border-t border-stone-200 dark:border-stone-800">
                          <button
                            type="button"
                            onClick={() => {
                              addDishToParty(recipe.id, effectiveCourse);
                              setModalCourse(null);
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSameCourse
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                                : isAdded
                                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-400 dark:border-amber-700/50 hover:bg-amber-200'
                                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs'
                            }`}
                          >
                            {isSameCourse ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã chọn ({targetCourseShortName})</span>
                              </>
                            ) : isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Chuyển sang {targetCourseShortName}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Chọn Món ({targetCourseShortName})</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredRecipes.length > visibleDishCount && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleDishCount(prev => prev + 40)}
                        className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#1A1918] dark:hover:bg-[#252220] text-xs font-bold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                      >
                        Xem thêm {Math.min(40, filteredRecipes.length - visibleDishCount)} món (còn {filteredRecipes.length - visibleDishCount} món)...
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SCHEDULE PARTY EVENT MODAL */}
      <SchedulePartyModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingScheduleEvent(null);
        }}
        initialDate={scheduleInitialDate}
        editingEvent={editingScheduleEvent}
      />

    </div>
  );
};
