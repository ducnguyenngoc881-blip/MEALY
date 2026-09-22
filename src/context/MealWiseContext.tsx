import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Recipe, 
  VietnameseMealSet, 
  DailyMealPlan, 
  MealSlot, 
  OnboardingData, 
  ActiveTab, 
  ViewMode,
  ThemeMode,
  CustomPartyPlan,
  PartyDishItem,
  PartyEquipmentItem,
  SavedPartyPreset,
  PantryItem,
  ConfirmDialogState,
  CollabRoom,
  CollabCartItem,
  CollabCheckState,
  CollabShopper
} from '../types';
import { 
  generateCollabRoomId, 
  createOrSyncCollabRoom, 
  fetchCollabRoom, 
  toggleCollabItemOnServer, 
  subscribeToCollabRoom, 
  broadcastLocalCollabUpdate,
  decodeRoomDataFromUrl,
  getOrCreateCollabUser,
  saveCollabShopper,
  registerParticipantOnServer,
  SHOPPER_PALETTE,
  getShopperStyle
} from '../services/collabGroceryService';
import { mockRecipes } from '../data/mockRecipes';
import { mockMealSets } from '../data/mockMealSets';
import { CORPORATE_PARTY_PRESETS } from '../data/corporatePartyPresets';
import { INITIAL_PANTRY_ITEMS } from '../data/pantryItems';
import { calculatePartyKitchenTime } from '../utils/cateringTimeMath';
import { generateBudgetCompliantWeeklyPlan } from '../utils/mealPlanGenerator';
import { roundToThousand, scaleCost, getDailyBudgetTarget, DAILY_BUDGET_RATES } from '../utils/currency';

export interface ExtraGroceryItem {
  name: string;
  amount: number;
  unit: string;
  category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
  cost: number;
}

interface MealWiseContextType {
  recipes: Recipe[];
  mealSets: VietnameseMealSet[];
  weeklyPlan: DailyMealPlan[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  
  // Selection modals
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  selectedMealSet: VietnameseMealSet | null;
  setSelectedMealSet: (mealSet: VietnameseMealSet | null) => void;

  // Actions
  addMealSetToSlot: (dayId: string, slot: MealSlot, mealSetId: string) => void;
  assignMealSetToSlot: (dayId: string, slot: MealSlot, mealSetId: string) => void;
  addRecipeToSlot: (dayId: string, slot: MealSlot, recipeId: string) => void;
  assignRecipeToSlot: (dayId: string, slot: MealSlot, recipeId: string) => void;
  removeMealFromSlot: (dayId: string, slot: MealSlot) => void;
  generationCount: number;
  autoFillWeeklyMenu: (customPreferences?: OnboardingData, options?: { seed?: number; cycleIndex?: number }) => void;
  recalibrateDayMenu: (dayId: string) => boolean;
  recalibrateWeeklyMenu: () => void;
  clearWeeklyMenu: () => void;
  resetWeeklyMenu: () => void;

  // Servings state
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;

  // Grocery checked state
  groceryCheckedItems: Record<string, boolean>;
  setGroceryCheckedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  toggleGroceryItemChecked: (key: string) => void;
  clearGroceryCheckedItems: () => void;

  // Party / Catering actions
  partyPlan: CustomPartyPlan;
  updatePartyPlan: (plan: Partial<CustomPartyPlan>) => void;
  addDishToParty: (recipeId: string, course: PartyDishItem['course']) => void;
  removeDishFromParty: (recipeId: string) => void;
  updatePartyDishNote: (recipeId: string, customNotes: string) => void;
  clearPartyDishes: () => void;
  applyPresetToParty: (presetId: string) => void;
  resetPartyPlan: () => void;
  togglePartyEquipment: (id: string) => void;
  addPartyEquipment: (text: string, category: string) => void;
  removePartyEquipment: (id: string) => void;
  syncPartyToGrocery: () => void;
  userPartyPlans: SavedPartyPreset[];
  saveCurrentPlanAsPreset: (title: string, description?: string) => SavedPartyPreset;
  deleteUserPartyPlan: (id: string) => void;
  loadUserPartyPlan: (preset: SavedPartyPreset) => void;

  // Extra grocery items
  extraGroceryItems: ExtraGroceryItem[];
  clearExtraGrocery: () => void;

  // Apex Fast Meal Modal
  isApexModalOpen: boolean;
  setIsApexModalOpen: (open: boolean) => void;
  openApexModal: () => void;
  closeApexModal: () => void;

  // Minigame Hub & Drink Roulette Modals
  isMinigameHubOpen: boolean;
  setIsMinigameHubOpen: (open: boolean) => void;
  openMinigameHub: () => void;
  closeMinigameHub: () => void;

  isDrinkRouletteOpen: boolean;
  setIsDrinkRouletteOpen: (open: boolean) => void;
  openDrinkRoulette: () => void;
  closeDrinkRoulette: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;

  // Pantry / Fridge state
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  removePantryItem: (id: string) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  clearPantryItems: () => void;

  // Confirm Dialog Modal
  confirmDialog: ConfirmDialogState | null;
  openConfirmModal: (state: ConfirmDialogState) => void;
  closeConfirmModal: () => void;

  // Real-Time Collaborative Grocery Sharing
  collabRoom: CollabRoom | null;
  collabCheckedMap: Record<string, CollabCheckState>;
  collabUser: CollabShopper;
  collabUserName: string;
  setCollabUserName: (name: string) => void;
  updateCollabUserProfile: (name: string, color?: string, role?: 'host' | 'shopper', avatar?: string) => void;
  collabParticipants: Record<string, CollabShopper>;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  startCollabRoom: (items: CollabCartItem[], title?: string) => Promise<string>;
  joinCollabRoom: (roomId: string, initialPayload?: Partial<CollabRoom>) => Promise<boolean>;
  leaveCollabRoom: () => void;
  toggleCollabChecked: (itemId: string) => void;
}

const MealWiseContext = createContext<MealWiseContextType | undefined>(undefined);

const INITIAL_ONBOARDING: OnboardingData = {
  regionPreference: 'bac',
  familySize: 4,
  singleMealFormat: 'single-dish',
  budgetLevel: 'vua-phai',
  specialNeeds: [],
  completed: false
};

const INITIAL_DAYS = [
  { dayId: 'mon', dayName: 'Thứ Hai' },
  { dayId: 'tue', dayName: 'Thứ Ba' },
  { dayId: 'wed', dayName: 'Thứ Tư' },
  { dayId: 'thu', dayName: 'Thứ Năm' },
  { dayId: 'fri', dayName: 'Thứ Sáu' },
  { dayId: 'sat', dayName: 'Thứ Bảy' },
  { dayId: 'sun', dayName: 'Chủ Nhật' }
];

export const isSubstantialMainMeal = (r: Recipe, isChay: boolean = false, isNoSpicy: boolean = false): boolean => {
  if (!r) return false;
  if (r.category === 'an-sang' || r.category === 'trang-mieng') return false;
  if (r.id.startsWith('che-') || r.id.startsWith('snack-')) return false;
  const titleLower = (r.title || '').toLowerCase();
  if (
    titleLower.includes('chè ') ||
    titleLower.includes('tráng miệng') ||
    titleLower.includes('thạch ') ||
    titleLower.includes('sinh tố') ||
    titleLower.includes('nước ép')
  ) {
    return false;
  }
  if ((r.calories || 0) < 280) return false;
  if (isChay) {
    if (r.category !== 'mon-chay' && !r.tags?.some(t => t.toLowerCase().includes('chay'))) {
      return false;
    }
  }
  if (isNoSpicy && r.tags?.some(t => t.toLowerCase().includes('cay'))) {
    return false;
  }
  return true;
};

export const isSubstantialBreakfast = (r: Recipe, isChay: boolean = false, isNoSpicy: boolean = false): boolean => {
  if (!r) return false;
  if (r.id.startsWith('che-') || r.id.startsWith('snack-')) return false;
  const titleLower = (r.title || '').toLowerCase();
  if (
    titleLower.includes('chè ') ||
    titleLower.includes('tráng miệng') ||
    titleLower.includes('thạch ') ||
    titleLower.includes('sinh tố') ||
    titleLower.includes('nước ép')
  ) {
    return false;
  }
  if (isChay) {
    const isChayMatch = r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay'));
    if (!isChayMatch) return false;
    return r.category === 'an-sang' || (r.calories || 0) >= 180;
  }
  if (r.category !== 'an-sang') return false;
  if ((r.calories || 0) < 200) return false;
  if (isNoSpicy && r.tags?.some(t => t.toLowerCase().includes('cay'))) return false;
  return true;
};

const DEFAULT_PARTY_PLAN: CustomPartyPlan = {
  id: 'custom-party-plan-1',
  title: 'Tiệc Liên Hoan & Catering Công Ty / Gia Đình',
  clientName: 'Anh Tuấn - Khách Hàng VIP',
  eventType: 'corporate',
  guestCount: 20,
  tableSize: 10,
  budgetPerHeadVnd: 220000,
  dishes: [
    { recipeId: 'thit-rang-chay-canh', course: 'main' },
    { recipeId: 'canh-cua-rau-day', course: 'soup_hotpot' },
    { recipeId: 'nem-ran-ha-noi', course: 'appetizer' },
    { recipeId: 'che-buoi-an-giang', course: 'dessert_drink' }
  ],
  recommendedDrinks: ['Bia tươi / Heineken Silver', 'Nước ngọt có gas', 'Trà hoa cúc lạnh'],
  equipmentChecklist: [
    { id: 'eq-init-1', text: 'Khay inox giữ nhiệt tiệc buffet (4 bộ)', category: 'Dụng cụ tiệc', done: true },
    { id: 'eq-init-2', text: 'Bếp từ đơn & Nồi lẩu inox (2 bộ)', category: 'Dụng cụ tiệc', done: true },
    { id: 'eq-init-3', text: 'Bát đĩa sứ & Ly uống bia (30 bộ)', category: 'Dụng cụ tiệc', done: false },
    { id: 'eq-init-4', text: 'Thùng đá ướp lạnh & Kẹp gắp thức ăn', category: 'Dụng cụ tiệc', done: true },
    { id: 'eq-init-5', text: 'Khăn trải bàn & Khăn ướt tiệc (25 cái)', category: 'Dụng cụ tiệc', done: false },
    { id: 'eq-init-6', text: '2 Nhân viên phục vụ hỗ trợ dọn mâm', category: 'Nhân sự', done: false }
  ],
  staffNotes: 'Khách yêu cầu chuẩn bị đồ ăn trước 11:30 trưa. Bố trí bàn tiệc gần cửa sổ thoáng mát.'
};

export const MealWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes] = useState<Recipe[]>(mockRecipes);
  const [mealSets] = useState<VietnameseMealSet[]>(mockMealSets);
  const [activeTab, setActiveTab] = useState<ActiveTab>('meal-sets');
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('mealwise_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('mealwise_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem('mealwise_onboarding');
      return saved ? JSON.parse(saved) : INITIAL_ONBOARDING;
    } catch {
      return INITIAL_ONBOARDING;
    }
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mealwise_onboarding');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !parsed.completed;
      }
    } catch {}
    return true;
  });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedMealSet, setSelectedMealSet] = useState<VietnameseMealSet | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const openConfirmModal = useCallback((state: ConfirmDialogState) => {
    setConfirmDialog(state);
  }, []);
  const closeConfirmModal = useCallback(() => {
    setConfirmDialog(null);
  }, []);
  const [isApexModalOpen, setIsApexModalOpen] = useState<boolean>(false);
  const openApexModal = useCallback(() => setIsApexModalOpen(true), []);
  const closeApexModal = useCallback(() => setIsApexModalOpen(false), []);

  const [isMinigameHubOpen, setIsMinigameHubOpen] = useState<boolean>(false);
  const openMinigameHub = useCallback(() => setIsMinigameHubOpen(true), []);
  const closeMinigameHub = useCallback(() => setIsMinigameHubOpen(false), []);

  const [isDrinkRouletteOpen, setIsDrinkRouletteOpen] = useState<boolean>(false);
  const openDrinkRoulette = useCallback(() => setIsDrinkRouletteOpen(true), []);
  const closeDrinkRoulette = useCallback(() => setIsDrinkRouletteOpen(false), []);

  // Custom Catering Party Planner State
  const [partyPlan, setPartyPlan] = useState<CustomPartyPlan>(() => {
    const saved = localStorage.getItem('mealwise_party_plan');
    return saved ? JSON.parse(saved) : DEFAULT_PARTY_PLAN;
  });

  // Extra grocery items (e.g. from Catering Planner)
  const [extraGroceryItems, setExtraGroceryItems] = useState<ExtraGroceryItem[]>(() => {
    const saved = localStorage.getItem('mealwise_extra_grocery');
    return saved ? JSON.parse(saved) : [];
  });

  // User saved custom party plans
  const [userPartyPlans, setUserPartyPlans] = useState<SavedPartyPreset[]>(() => {
    try {
      const saved = localStorage.getItem('mealwise_custom_party_plans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mealwise_party_plan', JSON.stringify(partyPlan));
  }, [partyPlan]);

  useEffect(() => {
    localStorage.setItem('mealwise_extra_grocery', JSON.stringify(extraGroceryItems));
  }, [extraGroceryItems]);

  useEffect(() => {
    localStorage.setItem('mealwise_custom_party_plans', JSON.stringify(userPartyPlans));
  }, [userPartyPlans]);

  // Pantry / Fridge state (leftover & in-fridge ingredients)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mealwise_pantry_items_v2');
      return saved ? JSON.parse(saved) : INITIAL_PANTRY_ITEMS;
    } catch {
      return INITIAL_PANTRY_ITEMS;
    }
  });

  useEffect(() => {
    localStorage.setItem('mealwise_pantry_items_v2', JSON.stringify(pantryItems));
  }, [pantryItems]);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToastMessage(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    const handleCustomConfirm = (e: Event) => {
      const customEvent = e as CustomEvent<ConfirmDialogState>;
      if (customEvent.detail) {
        openConfirmModal(customEvent.detail);
      }
    };
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };
    window.addEventListener('mealwise:confirm', handleCustomConfirm);
    window.addEventListener('mealwise:toast', handleCustomToast);
    return () => {
      window.removeEventListener('mealwise:confirm', handleCustomConfirm);
      window.removeEventListener('mealwise:toast', handleCustomToast);
    };
  }, [openConfirmModal, showToast]);

  const addPantryItem = useCallback((item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...item,
      id: `pantry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    setPantryItems(prev => [newItem, ...prev]);
    showToast(`Đã lưu "${newItem.name}" vào tủ lạnh!`);
  }, [showToast]);

  const removePantryItem = useCallback((id: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
    showToast('Đã xóa món khỏi tủ lạnh!');
  }, [showToast]);

  const updatePantryItem = useCallback((id: string, updates: Partial<PantryItem>) => {
    setPantryItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const clearPantryItems = useCallback(() => {
    setPantryItems([]);
    showToast('Đã dọn sạch tủ lạnh!');
  }, [showToast]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Party Actions
  const updatePartyPlan = (plan: Partial<CustomPartyPlan>) => {
    setPartyPlan(prev => ({ ...prev, ...plan }));
  };

  const addDishToParty = (recipeId: string, course: PartyDishItem['course']) => {
    setPartyPlan(prev => {
      const existingIndex = prev.dishes.findIndex(d => d.recipeId === recipeId);
      if (existingIndex >= 0) {
        const updated = [...prev.dishes];
        updated[existingIndex] = { ...updated[existingIndex], course };
        return { ...prev, dishes: updated };
      }
      return { ...prev, dishes: [...prev.dishes, { recipeId, course }] };
    });
    const targetRecipe = recipes.find(r => r.id === recipeId);
    showToast(`🍽️ Đã thêm món "${targetRecipe ? targetRecipe.title : 'món tiệc'}" vào thực đơn!`);
  };

  const removeDishFromParty = (recipeId: string) => {
    setPartyPlan(prev => ({
      ...prev,
      dishes: prev.dishes.filter(d => d.recipeId !== recipeId)
    }));
    showToast('🗑️ Đã xóa món khỏi thực đơn tiệc.');
  };

  const updatePartyDishNote = (recipeId: string, customNotes: string) => {
    setPartyPlan(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.recipeId === recipeId ? { ...d, customNotes } : d)
    }));
  };

  const clearPartyDishes = () => {
    setPartyPlan(prev => ({
      ...prev,
      dishes: []
    }));
    showToast('🧹 Đã dọn trống thực đơn mâm tiệc.');
  };

  const applyPresetToParty = (presetId: string) => {
    const preset = CORPORATE_PARTY_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const mappedDishes: PartyDishItem[] = preset.menuRecipes.map((r, idx) => {
      let course: PartyDishItem['course'] = 'main';
      if (r.category === 'an-sang') course = 'appetizer';
      else if (r.category === 'mon-canh') course = 'soup_hotpot';
      else if (r.category === 'mon-rau') course = 'appetizer';
      else if (r.category === 'trang-mieng') course = 'dessert_drink';
      else if (idx === 0) course = 'appetizer';
      else if (idx === 1) course = 'main';
      else course = 'soup_hotpot';
      return { recipeId: r.id, course };
    });

    setPartyPlan({
      id: `party-${Date.now()}`,
      title: preset.title.replace(/^[^\w\s\u00C0-\u1EF9]+/, '').trim(),
      clientName: 'Khách Hàng Đặt Tiệc',
      eventType: preset.id.includes('bbq') ? 'bbq' : preset.id.includes('birthday') ? 'birthday' : 'corporate',
      guestCount: preset.defaultGuestCount,
      tableSize: preset.defaultGuestCount >= 20 ? 10 : 6,
      budgetPerHeadVnd: preset.suggestedPerHeadBudgetVnd,
      dishes: mappedDishes,
      recommendedDrinks: [...preset.recommendedDrinks],
      equipmentChecklist: preset.equipmentChecklist.map(eq => ({ ...eq })),
      staffNotes: `Áp dụng mẫu tiệc: ${preset.title}. Chuẩn bị theo tiêu chuẩn catering chuyên nghiệp.`
    });

    showToast(`✨ Đã áp dụng mẫu "${preset.title}" vào kế hoạch tiệc!`);
  };

  const resetPartyPlan = () => {
    setPartyPlan(DEFAULT_PARTY_PLAN);
    localStorage.removeItem('mealwise_party_plan');
    showToast('🔄 Đã đặt lại kế hoạch tiệc về mặc định!');
  };

  const togglePartyEquipment = (id: string) => {
    setPartyPlan(prev => ({
      ...prev,
      equipmentChecklist: prev.equipmentChecklist.map(item => 
        item.id === id ? { ...item, done: !item.done } : item
      )
    }));
  };

  const addPartyEquipment = (text: string, category: string) => {
    if (!text.trim()) return;
    const newItem = {
      id: `eq-${Date.now()}`,
      text: text.trim(),
      category: category || 'Dụng cụ tiệc',
      done: false
    };
    setPartyPlan(prev => ({
      ...prev,
      equipmentChecklist: [...prev.equipmentChecklist, newItem]
    }));
    showToast(`📦 Đã thêm thiết bị "${text.trim()}"!`);
  };

  const removePartyEquipment = (id: string) => {
    setPartyPlan(prev => ({
      ...prev,
      equipmentChecklist: prev.equipmentChecklist.filter(item => item.id !== id)
    }));
    showToast('🗑️ Đã xóa thiết bị khỏi danh sách.');
  };

  const syncPartyToGrocery = () => {
    const scaledItems: ExtraGroceryItem[] = [];

    partyPlan.dishes.forEach(dish => {
      const r = recipes.find(rec => rec.id === dish.recipeId);
      if (!r) return;
      const factor = Math.max(0.1, partyPlan.guestCount / (r.servings || 4));
      r.ingredients.forEach(ing => {
        const numAmount = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount as string) || 1;
        const scaledAmount = Math.round(numAmount * factor * 10) / 10;
        const costPortion = Math.round(((r.estimatedCostVnd || 30000) * factor) / r.ingredients.length);
        scaledItems.push({
          name: `[Tiệc] ${ing.name}`,
          amount: scaledAmount,
          unit: ing.unit,
          category: ing.category,
          cost: costPortion
        });
      });
    });

    setExtraGroceryItems(scaledItems);
    setActiveTab('grocery');
    showToast(`🛒 Đã chuyển ${scaledItems.length} nguyên liệu tiệc (${partyPlan.guestCount} khách) vào Đi Chợ!`);
  };

  const clearExtraGrocery = () => {
    setExtraGroceryItems([]);
    localStorage.removeItem('mealwise_extra_grocery');
    showToast('🧹 Đã xóa danh sách nguyên liệu tiệc bổ sung.');
  };

  const saveCurrentPlanAsPreset = (title: string, description?: string): SavedPartyPreset => {
    const safeGuests = Math.max(1, partyPlan.guestCount || 10);
    const timingInputs = partyPlan.dishes.map(d => {
      const r = recipes.find(rec => rec.id === d.recipeId);
      return {
        title: r?.title,
        prepTimeMinutes: r?.prepTimeMinutes || 15,
        cookTimeMinutes: r?.cookTimeMinutes || 20,
        servings: r?.servings || 4
      };
    });
    const workload = calculatePartyKitchenTime(timingInputs, safeGuests);

    const totalCost = partyPlan.dishes.reduce((sum, item) => {
      const recipe = recipes.find(r => r.id === item.recipeId);
      if (!recipe) return sum;
      const servings = recipe.servings && recipe.servings > 0 ? recipe.servings : 4;
      const factor = safeGuests / servings;
      return sum + ((recipe.estimatedCostVnd || 40000) * factor);
    }, 0);

    const newPreset: SavedPartyPreset = {
      id: `custom-preset-${Date.now()}`,
      title: title.trim() || 'Mẫu Tiệc Tùy Chọn',
      description: description?.trim() || undefined,
      eventType: partyPlan.eventType,
      guestCount: safeGuests,
      tableSize: partyPlan.tableSize,
      budgetPerHeadVnd: partyPlan.budgetPerHeadVnd,
      dishes: partyPlan.dishes.map(d => ({ ...d })),
      recommendedDrinks: [...partyPlan.recommendedDrinks],
      equipmentChecklist: partyPlan.equipmentChecklist.map(e => ({ ...e })),
      staffNotes: partyPlan.staffNotes,
      estimatedPrepMinutes: workload.prepTimeMinutes,
      estimatedCookMinutes: workload.cookTimeMinutes,
      totalTimeMinutes: workload.totalTimeMinutes,
      totalFoodCostVnd: Math.round(totalCost),
      createdAt: new Date().toISOString()
    };

    setUserPartyPlans(prev => [newPreset, ...prev.filter(p => p.id !== newPreset.id)]);
    showToast(`💾 Đã lưu mẫu tiệc "${newPreset.title}" vào Thư Viện Mẫu!`);
    return newPreset;
  };

  const deleteUserPartyPlan = (id: string) => {
    setUserPartyPlans(prev => prev.filter(p => p.id !== id));
    showToast('🗑️ Đã xóa mẫu tiệc khỏi thư viện.');
  };

  const loadUserPartyPlan = (preset: SavedPartyPreset) => {
    setPartyPlan({
      id: `party-${Date.now()}`,
      title: preset.title,
      clientName: 'Khách Hàng Đặt Tiệc',
      eventType: preset.eventType,
      guestCount: preset.guestCount,
      tableSize: preset.tableSize,
      budgetPerHeadVnd: preset.budgetPerHeadVnd,
      dishes: preset.dishes.map(d => ({ ...d })),
      recommendedDrinks: [...preset.recommendedDrinks],
      equipmentChecklist: preset.equipmentChecklist.map(e => ({ ...e })),
      staffNotes: preset.staffNotes || `Áp dụng mẫu tiệc của tôi: ${preset.title}`
    });
    showToast(`✨ Đã áp dụng mẫu "${preset.title}" vào kế hoạch tiệc!`);
  };

  // Helper to build default weekly plan with authentic preset Mâm Cơm sets
  const buildDefaultWeeklyPlan = (): DailyMealPlan[] => {
    const generated = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: [],
      mealFormat: 'meal-set'
    });
    return generated.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: {
        breakfast: d.meals.breakfast,
        lunch: d.meals.lunch,
        dinner: d.meals.dinner
      },
      totalCost: d.unscaledDayCost
    }));
  };

  // Build weekly plan with localStorage persistence & hydration
  const [weeklyPlan, setWeeklyPlan] = useState<DailyMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem('mealwise_weekly_plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load mealwise_weekly_plan from localStorage', e);
    }
    return buildDefaultWeeklyPlan();
  });

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(weeklyPlan));
    } catch (e) {
      console.error('Failed to persist mealwise_weekly_plan to localStorage', e);
    }
  }, [weeklyPlan]);

  // Generation counter for stochastic variation tracking
  const [generationCount, setGenerationCount] = useState<number>(0);

  // Household servings state with localStorage persistence
  const [servings, setServings] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mealwise_servings');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load mealwise_servings from localStorage', e);
    }
    return onboardingData.familySize || 4;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_servings', servings.toString());
    } catch (e) {
      console.error('Failed to persist mealwise_servings to localStorage', e);
    }
  }, [servings]);

  // Persistent grocery checked state
  const [groceryCheckedItems, setGroceryCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mealwise_grocery_checked');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load mealwise_grocery_checked from localStorage', e);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_grocery_checked', JSON.stringify(groceryCheckedItems));
    } catch (e) {
      console.error('Failed to persist mealwise_grocery_checked to localStorage', e);
    }
  }, [groceryCheckedItems]);

  const toggleGroceryItemChecked = (key: string) => {
    setGroceryCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearGroceryCheckedItems = () => {
    setGroceryCheckedItems({});
    try {
      localStorage.removeItem('mealwise_grocery_checked');
    } catch (e) {
      console.error('Failed to remove mealwise_grocery_checked from localStorage', e);
    }
  };

  // Real-time Collaborative Grocery Sharing State & Logic
  const [collabRoom, setCollabRoom] = useState<CollabRoom | null>(() => {
    try {
      const saved = localStorage.getItem('mealwise_collab_room');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [collabCheckedMap, setCollabCheckedMap] = useState<Record<string, CollabCheckState>>(() => {
    try {
      const saved = localStorage.getItem('mealwise_collab_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Shopper Identity Profile (unique id, name, color, role)
  const [collabUser, setCollabUserState] = useState<CollabShopper>(() => {
    return getOrCreateCollabUser(false);
  });

  const [collabParticipants, setCollabParticipants] = useState<Record<string, CollabShopper>>({});

  const updateCollabUserProfile = useCallback((name: string, color?: string, role?: 'host' | 'shopper', avatar?: string) => {
    setCollabUserState(prev => {
      const updated: CollabShopper = {
        ...prev,
        name: name.trim() || prev.name,
        color: color || prev.color,
        role: role || prev.role,
        avatar: avatar !== undefined ? avatar : prev.avatar
      };
      saveCollabShopper(updated);
      return updated;
    });
  }, []);

  const collabUserName = collabUser.name;
  const setCollabUserName = useCallback((name: string) => {
    updateCollabUserProfile(name);
  }, [updateCollabUserProfile]);

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Register participant with server whenever room is active or user profile changes
  useEffect(() => {
    if (collabRoom?.roomId && collabUser.id) {
      registerParticipantOnServer(collabRoom.roomId, collabUser);
    }
  }, [collabRoom?.roomId, collabUser]);

  // Sync collabRoom to localStorage
  useEffect(() => {
    try {
      if (collabRoom) {
        localStorage.setItem('mealwise_collab_room', JSON.stringify(collabRoom));
      } else {
        localStorage.removeItem('mealwise_collab_room');
      }
    } catch {}
  }, [collabRoom]);

  // Sync collabCheckedMap to localStorage
  useEffect(() => {
    try {
      if (collabCheckedMap && Object.keys(collabCheckedMap).length > 0) {
        localStorage.setItem('mealwise_collab_checked', JSON.stringify(collabCheckedMap));
      } else {
        localStorage.removeItem('mealwise_collab_checked');
      }
    } catch {}
  }, [collabCheckedMap]);

  // Real-time subscription to room events (SSE + BroadcastChannel + Polling)
  useEffect(() => {
    if (!collabRoom?.roomId) return;

    const unsubscribe = subscribeToCollabRoom(collabRoom.roomId, (event: any) => {
      if (event.type === 'toggle' && event.itemId && event.state) {
        setCollabCheckedMap(prev => ({
          ...prev,
          [event.itemId!]: event.state!
        }));
        // Also reflect into standard grocery checked items
        setGroceryCheckedItems(prev => ({
          ...prev,
          [event.itemId!]: event.state!.checked
        }));
        if (event.participants) {
          setCollabParticipants(event.participants);
        }
      } else if (event.type === 'participant_update' && event.participant) {
        setCollabParticipants(prev => ({
          ...prev,
          [event.participant.id]: event.participant
        }));
      } else if ((event.type === 'room_sync' || event.type === 'connected') && event.room) {
        setCollabRoom(event.room);
        if (event.room.checkedMap) {
          setCollabCheckedMap(event.room.checkedMap);
        }
        if (event.room.participants) {
          setCollabParticipants(event.room.participants);
        }
      } else if (event.type === 'polling_sync' && event.checkedMap) {
        setCollabCheckedMap(event.checkedMap);
        if (event.room?.participants) {
          setCollabParticipants(event.room.participants);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [collabRoom?.roomId]);

  // Start a new collaborative room
  const startCollabRoom = useCallback(async (items: CollabCartItem[], title?: string): Promise<string> => {
    const roomId = generateCollabRoomId();
    const initialChecked: Record<string, CollabCheckState> = {};

    // Ensure creator is marked as host with host styling
    const hostProfile: CollabShopper = {
      ...collabUser,
      role: 'host',
      color: collabUser.color || '#10b981'
    };
    setCollabUserState(hostProfile);
    saveCollabShopper(hostProfile);

    items.forEach(it => {
      if (groceryCheckedItems[it.id] || groceryCheckedItems[it.name]) {
        initialChecked[it.id] = {
          checked: true,
          checkedBy: hostProfile.name,
          checkedById: hostProfile.id,
          checkedByColor: hostProfile.color,
          checkedAt: Date.now()
        };
      }
    });

    const initialParticipants: Record<string, CollabShopper> = {
      [hostProfile.id]: hostProfile
    };

    const newRoom: CollabRoom = {
      roomId,
      title: title || `Giỏ Đi Chợ Tuần (${items.length} món)`,
      hostName: hostProfile.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items,
      checkedMap: initialChecked,
      participants: initialParticipants
    };

    const synced = await createOrSyncCollabRoom(newRoom);
    setCollabRoom(synced);
    setCollabCheckedMap(synced.checkedMap || initialChecked);
    setCollabParticipants(synced.participants || initialParticipants);
    setIsShareModalOpen(true);
    showToast(`🎉 Đã tạo phòng mua chung #${roomId}!`);
    return roomId;
  }, [collabUser, groceryCheckedItems, showToast]);

  // Join an existing collaborative room
  const joinCollabRoom = useCallback(async (roomId: string, initialPayload?: Partial<CollabRoom>): Promise<boolean> => {
    // Determine if joining device should be initialized as a guest shopper
    let currentShopper = collabUser;
    if (currentShopper.role === 'host' && (!currentShopper.name || currentShopper.name.includes('Chủ phòng'))) {
      currentShopper = getOrCreateCollabUser(true);
      setCollabUserState(currentShopper);
      saveCollabShopper(currentShopper);
    }

    let room = await fetchCollabRoom(roomId);
    if (!room && initialPayload && initialPayload.items && initialPayload.items.length > 0) {
      const fallbackRoom: CollabRoom = {
        roomId,
        title: initialPayload.title || 'Giỏ Đi Chợ Tuần',
        hostName: initialPayload.hostName || 'Chủ phòng',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: initialPayload.items,
        checkedMap: initialPayload.checkedMap || {},
        participants: {
          [currentShopper.id]: currentShopper
        }
      };
      room = await createOrSyncCollabRoom(fallbackRoom);
    }

    if (room) {
      setCollabRoom(room);
      setCollabCheckedMap(room.checkedMap || {});
      if (room.participants) {
        setCollabParticipants(room.participants);
      }
      if (room.checkedMap) {
        const localChecks: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(room.checkedMap)) {
          localChecks[k] = v.checked;
        }
        setGroceryCheckedItems(prev => ({ ...prev, ...localChecks }));
      }
      registerParticipantOnServer(roomId, currentShopper);
      return true;
    }
    return false;
  }, [collabUser]);

  // Leave collaborative room
  const leaveCollabRoom = useCallback(() => {
    setCollabRoom(null);
    setCollabCheckedMap({});
    setCollabParticipants({});
    try {
      localStorage.removeItem('mealwise_collab_room');
      localStorage.removeItem('mealwise_collab_checked');
    } catch {}
    showToast('👋 Đã rời phòng mua chung.');
  }, [showToast]);

  // Toggle item check in collaborative room
  const toggleCollabChecked = useCallback((itemId: string) => {
    if (!collabRoom?.roomId) return;

    const currentChecked = !!collabCheckedMap[itemId]?.checked;
    const nextChecked = !currentChecked;

    const newState: CollabCheckState = {
      checked: nextChecked,
      checkedBy: collabUser.name,
      checkedById: collabUser.id,
      checkedByColor: collabUser.color,
      checkedAt: Date.now()
    };

    setCollabCheckedMap(prev => ({
      ...prev,
      [itemId]: newState
    }));

    setGroceryCheckedItems(prev => ({
      ...prev,
      [itemId]: nextChecked
    }));

    broadcastLocalCollabUpdate(collabRoom.roomId, {
      type: 'toggle',
      roomId: collabRoom.roomId,
      itemId,
      state: newState
    });

    toggleCollabItemOnServer(
      collabRoom.roomId, 
      itemId, 
      nextChecked, 
      collabUser.name, 
      collabUser.id, 
      collabUser.color
    );
  }, [collabRoom?.roomId, collabCheckedMap, collabUser]);

  // Auto-detect URL query params (?collab_cart=XYZ or ?collab=XYZ) ONCE on mount
  const processedCollabParamRef = useRef<string | null>(null);
  const joinCollabRoomRef = useRef(joinCollabRoom);
  joinCollabRoomRef.current = joinCollabRoom;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      const collabParam = url.searchParams.get('collab_cart') || url.searchParams.get('collab') || url.searchParams.get('shared_cart');
      const payloadParam = url.searchParams.get('payload') || (window.location.hash ? window.location.hash.replace(/^#/, '') : null);

      if (collabParam && processedCollabParamRef.current !== collabParam) {
        processedCollabParamRef.current = collabParam;

        let decodedPayload: Partial<CollabRoom> | null = null;
        if (payloadParam) {
          decodedPayload = decodeRoomDataFromUrl(payloadParam);
        }

        // Navigate to grocery tab only on initial deep link entry
        setActiveTab('grocery');

        // Clean up query params from URL address bar so user can freely navigate to other tabs without getting kicked back
        try {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('collab_cart');
          cleanUrl.searchParams.delete('collab');
          cleanUrl.searchParams.delete('shared_cart');
          cleanUrl.searchParams.delete('payload');
          cleanUrl.hash = '';
          const newRelativeUrl = cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '');
          window.history.replaceState({}, document.title, newRelativeUrl);
        } catch {}

        joinCollabRoomRef.current(collabParam, decodedPayload || undefined).then((success) => {
          if (success) {
            showToastRef.current(`🟢 Đã tham gia phòng mua chung #${collabParam}!`);
          }
        });
      }
    } catch {}
  }, []);

  const completeOnboarding = (data: Partial<OnboardingData>) => {
    const updated: OnboardingData = { ...onboardingData, ...data, completed: true };
    setOnboardingData(updated);
    if (updated.familySize && updated.familySize > 0) {
      setServings(updated.familySize);
    }
    try {
      localStorage.setItem('mealwise_onboarding', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save onboardingData to localStorage', e);
    }
    setShowOnboarding(false);

    // Immediately generate the tailored suggested weekly meal plan fitting the user's goal
    autoFillWeeklyMenu(updated, { seed: Date.now() });

    // Switch to weekly tab so user immediately sees their tailored plan
    setActiveTab('weekly');
  };

  const resetOnboarding = () => {
    const resetData: OnboardingData = { ...onboardingData, completed: false };
    setOnboardingData(resetData);
    setShowOnboarding(true);
    showToast('🔄 Đang mở lại khảo sát khẩu vị & mục tiêu!');
  };

  const addMealSetToSlot = (dayId: string, slot: MealSlot, mealSetId: string) => {
    const targetSet = mealSets.find(m => m.id === mealSetId);
    if (!targetSet) return;

    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayId === dayId) {
        return {
          ...day,
          meals: {
            ...day.meals,
            [slot]: targetSet
          }
        };
      }
      return day;
    }));
    const slotLabel = slot === 'breakfast' ? 'Bữa Sáng' : slot === 'lunch' ? 'Bữa Trưa' : slot === 'dinner' ? 'Bữa Tối' : 'Xế / Tráng Miệng';
    showToast(`✅ Đã gán "${targetSet.title}" vào ${slotLabel}!`);
  };

  const assignMealSetToSlot = addMealSetToSlot;

  const addRecipeToSlot = (dayId: string, slot: MealSlot, recipeId: string) => {
    const targetRecipe = recipes.find(r => r.id === recipeId);
    if (!targetRecipe) return;

    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayId === dayId) {
        return {
          ...day,
          meals: {
            ...day.meals,
            [slot]: targetRecipe
          }
        };
      }
      return day;
    }));
    const slotLabel = slot === 'breakfast' ? 'Bữa Sáng' : slot === 'lunch' ? 'Bữa Trưa' : slot === 'dinner' ? 'Bữa Tối' : 'Xế / Tráng Miệng';
    showToast(`✅ Đã thêm món "${targetRecipe.title}" vào ${slotLabel}!`);
  };

  const assignRecipeToSlot = addRecipeToSlot;

  const removeMealFromSlot = (dayId: string, slot: MealSlot) => {
    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayId === dayId) {
        return {
          ...day,
          meals: {
            ...day.meals,
            [slot]: null
          }
        };
      }
      return day;
    }));
    showToast('🗑️ Đã xóa món khỏi thực đơn.');
  };

  const autoFillWeeklyMenu = (
    customPreferences?: OnboardingData,
    options?: { seed?: number; cycleIndex?: number }
  ) => {
    const nextCount = (options?.cycleIndex ?? generationCount) + 1;
    setGenerationCount(nextCount);

    const dynamicSeed = options?.seed ?? (Date.now() ^ (nextCount * 2654435761));

    const prefs = customPreferences || onboardingData;
    const safeServings = (customPreferences && customPreferences.familySize && customPreferences.familySize > 0)
      ? customPreferences.familySize
      : (Number.isFinite(servings) && servings > 0 ? Math.min(20, Math.max(1, Math.round(servings))) : (prefs.familySize || 4));

    const validBudgetLevels: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
    const budgetLevel = validBudgetLevels.includes(prefs.budgetLevel) ? prefs.budgetLevel : 'vua-phai';
    const regionPreference = prefs.regionPreference || 'toan-quoc';
    const specialNeeds = prefs.specialNeeds || [];
    const isSingle = safeServings === 1;
    const isSingleDish = isSingle && prefs.singleMealFormat !== 'meal-set';
    const mealFormat = isSingleDish ? 'single-dish' : 'meal-set';

    const previousPlanSlotIds: Record<string, string> = {};
    if (Array.isArray(weeklyPlan)) {
      weeklyPlan.forEach(day => {
        if (day && day.dayId && day.meals) {
          if (day.meals.breakfast?.id) {
            previousPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
          }
          if (day.meals.lunch?.id) {
            previousPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
          }
          if (day.meals.dinner?.id) {
            previousPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
          }
        }
      });
    }

    const generatedDays = generateBudgetCompliantWeeklyPlan({
      servings: safeServings,
      budgetLevel,
      regionPreference,
      specialNeeds,
      mealFormat,
      seed: dynamicSeed,
      variationIndex: nextCount,
      previousPlanSlotIds
    });

    const suggestedPlan: DailyMealPlan[] = generatedDays.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: {
        breakfast: d.meals.breakfast,
        lunch: d.meals.lunch,
        dinner: d.meals.dinner
      },
      totalCost: d.unscaledDayCost
    }));

    setWeeklyPlan(suggestedPlan);
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(suggestedPlan));
    } catch (e) {
      console.error('Failed to save autoFill weekly plan to localStorage', e);
    }

    const isGym = specialNeeds.includes('gym-protein');
    const isEatClean = specialNeeds.includes('eat-clean');
    const isChay = specialNeeds.includes('chay');

    if (isGym) {
      showToast(`🏋️ Đã tạo thực đơn 7 ngày Giàu Đạm (Protein) chuẩn Gym cho ${safeServings} người (chuẩn ngân sách)!`);
    } else if (isEatClean) {
      showToast(`🥗 Đã tạo thực đơn 7 ngày Eat Clean thanh lành & kiểm soát calo cho ${safeServings} người (chuẩn ngân sách)!`);
    } else if (isChay) {
      showToast(`🌿 Đã tạo thực đơn 7 ngày Mâm Cơm Chay thanh tịnh & cân bằng dinh dưỡng cho ${safeServings} người (chuẩn ngân sách)!`);
    } else if (isSingle) {
      if (isSingleDish) {
        showToast('👤 Đã tạo thực đơn 7 ngày Món Đơn Gọn Nhẹ cho 1 người (chuẩn ngân sách)!');
      } else {
        showToast('👤 Đã tạo thực đơn 7 ngày Mâm Cơm 3 Món cho 1 người (chuẩn ngân sách)!');
      }
    } else {
      const regionLabel = regionPreference === 'bac' ? 'Miền Bắc' : regionPreference === 'nam' ? 'Miền Nam' : regionPreference === 'trung' ? 'Miền Trung' : 'Việt Nam';
      showToast(`✨ Đã gợi ý tự động thực đơn 7 ngày chuẩn vị ${regionLabel} cho ${safeServings} người (chuẩn ngân sách)!`);
    }
  };

  const clearWeeklyMenu = () => {
    const emptyPlan = INITIAL_DAYS.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: { breakfast: null, lunch: null, dinner: null }
    }));
    setWeeklyPlan(emptyPlan);
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(emptyPlan));
    } catch (e) {
      console.error('Failed to clear mealwise_weekly_plan in localStorage', e);
    }
    showToast('🧹 Đã xóa toàn bộ thực đơn tuần.');
  };

  const resetWeeklyMenu = () => {
    const defaults = buildDefaultWeeklyPlan();
    setWeeklyPlan(defaults);
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(defaults));
    } catch (e) {
      console.error('Failed to reset mealwise_weekly_plan in localStorage', e);
    }
    showToast('🔄 Đã đặt lại thực đơn tuần về mặc định!');
  };

  const recalibrateDayMenu = (dayId: string): boolean => {
    const targetDay = weeklyPlan.find(d => d.dayId === dayId);
    if (!targetDay) return false;

    const safeServings = Number.isFinite(servings) && servings > 0 
      ? Math.min(20, Math.max(1, Math.round(servings))) 
      : (onboardingData?.familySize || 4);

    const validBudgetLevels: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
    const currentBudgetLevel = validBudgetLevels.includes(onboardingData?.budgetLevel) ? onboardingData.budgetLevel : 'vua-phai';
    const dailyBudgetTarget = getDailyBudgetTarget(currentBudgetLevel, safeServings);
    const budgetCeiling = Math.floor(dailyBudgetTarget * 1.05);

    const specialNeeds = onboardingData?.specialNeeds || [];
    const isChay = specialNeeds.includes('chay');
    const isNoSpicy = specialNeeds.includes('it-cay');
    const isSingle = safeServings === 1;
    const isSingleDish = isSingle && onboardingData?.singleMealFormat !== 'meal-set';

    // Tier-aware breakfast budget ceiling: Tiết kiệm <= 25%, Vừa phải <= 32%, Thoải mái <= 38%
    const bfastCapRatio = currentBudgetLevel === 'tiet-kiem' ? 0.25 : currentBudgetLevel === 'vua-phai' ? 0.32 : 0.38;
    const maxBfastCost = Math.floor(dailyBudgetTarget * bfastCapRatio);

    // 1. Gather all recipe IDs and meal set IDs used on the OTHER 6 days to prevent duplicates
    const otherDays = weeklyPlan.filter(d => d.dayId !== dayId);
    const usedRecipeIds = new Set<string>();
    const usedMealSetIds = new Set<string>();

    otherDays.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (!meal) return;
        if ('mainDish' in meal) {
          usedMealSetIds.add(meal.id);
        } else {
          usedRecipeIds.add(meal.id);
        }
      });
    });

    if (isSingleDish) {
      let rawBfastPool = recipes.filter(r => isSubstantialBreakfast(r, isChay, isNoSpicy));
      if (rawBfastPool.length === 0) {
        if (isChay) {
          rawBfastPool = recipes.filter(r =>
            (r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay'))) &&
            !r.id.startsWith('che-') && !r.id.startsWith('snack-')
          );
        } else {
          rawBfastPool = recipes.filter(r => r.category === 'an-sang');
        }
      }
      if (rawBfastPool.length === 0) rawBfastPool = [recipes[0]];

      let affordableBfast = rawBfastPool.filter(r => scaleCost(r.estimatedCostVnd || 25000, safeServings) <= maxBfastCost);
      if (affordableBfast.length === 0) {
        affordableBfast = [...rawBfastPool].sort((a, b) =>
          scaleCost(a.estimatedCostVnd || 25000, safeServings) - scaleCost(b.estimatedCostVnd || 25000, safeServings)
        ).slice(0, 5);
      }

      // Sort breakfasts: unused on other days first, then lowest cost
      affordableBfast.sort((a, b) => {
        const aUsed = usedRecipeIds.has(a.id) ? 1 : 0;
        const bUsed = usedRecipeIds.has(b.id) ? 1 : 0;
        if (aUsed !== bUsed) return aUsed - bUsed;
        return (a.estimatedCostVnd || 25000) - (b.estimatedCostVnd || 25000);
      });

      let singleDishPool = recipes.filter(r => isSubstantialMainMeal(r, isChay, isNoSpicy));
      if (singleDishPool.length < 14) {
        singleDishPool = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng' && !r.id.startsWith('che-') && !r.id.startsWith('snack-'));
      }

      let chosenBreakfast = affordableBfast[0];
      let chosenLunch: Recipe | null = null;
      let chosenDinner: Recipe | null = null;
      let chosenCost = 0;

      for (const bfastCandidate of affordableBfast) {
        const bfastCost = scaleCost(bfastCandidate.estimatedCostVnd || 25000, safeServings);
        const remBudget = budgetCeiling - bfastCost;

        const candidateMains = singleDishPool.filter(r => r.id !== bfastCandidate.id);
        const unusedMains = candidateMains.filter(r => !usedRecipeIds.has(r.id));
        const pool = unusedMains.length >= 2 ? unusedMains : candidateMains;

        pool.sort((a, b) => (b.estimatedCostVnd || 35000) - (a.estimatedCostVnd || 35000));

        let bestSum = 0;
        let bestPair: [Recipe, Recipe] | null = null;

        for (let i = 0; i < pool.length; i++) {
          const costI = scaleCost(pool[i].estimatedCostVnd || 35000, safeServings);
          for (let j = i + 1; j < pool.length; j++) {
            const costJ = scaleCost(pool[j].estimatedCostVnd || 35000, safeServings);
            const sum = costI + costJ;
            if (sum <= remBudget && sum > bestSum) {
              bestSum = sum;
              bestPair = [pool[i], pool[j]];
              if (sum >= remBudget * 0.95) break;
            }
          }
          if (bestPair && bestSum >= remBudget * 0.95) break;
        }

        if (bestPair) {
          chosenBreakfast = bfastCandidate;
          chosenLunch = bestPair[0];
          chosenDinner = bestPair[1];
          chosenCost = bfastCost + bestSum;
          break;
        }
      }

      if (!chosenLunch || !chosenDinner) {
        chosenBreakfast = affordableBfast[0];
        const sorted = [...singleDishPool].sort((a, b) => (a.estimatedCostVnd || 35000) - (b.estimatedCostVnd || 35000));
        chosenLunch = sorted[0];
        chosenDinner = sorted[1] || sorted[0];
        chosenCost = scaleCost((chosenBreakfast.estimatedCostVnd || 25000) + (chosenLunch.estimatedCostVnd || 35000) + (chosenDinner.estimatedCostVnd || 35000), safeServings);
      }

      setWeeklyPlan(prev => {
        const nextPlan = prev.map(d => {
          if (d.dayId === dayId) {
            return {
              ...d,
              meals: {
                breakfast: chosenBreakfast,
                lunch: chosenLunch,
                dinner: chosenDinner
              },
              totalCost: (chosenBreakfast.estimatedCostVnd || 25000) + (chosenLunch!.estimatedCostVnd || 35000) + (chosenDinner!.estimatedCostVnd || 35000)
            };
          }
          return d;
        });
        try {
          localStorage.setItem('mealwise_weekly_plan', JSON.stringify(nextPlan));
        } catch {}
        return nextPlan;
      });

      showToast(`⚡ Đã cân chỉnh thực đơn ${targetDay.dayName} đầy đặn, đủ chất: ${chosenCost.toLocaleString('vi-VN')} đ (chuẩn ngân sách ${dailyBudgetTarget.toLocaleString('vi-VN')} đ)!`);
      return true;
    } else {
      let rawBfastPool = recipes.filter(r => isSubstantialBreakfast(r, isChay, isNoSpicy));
      if (rawBfastPool.length === 0) {
        if (isChay) {
          rawBfastPool = recipes.filter(r =>
            (r.category === 'mon-chay' || r.tags?.some(t => t.toLowerCase().includes('chay'))) &&
            !r.id.startsWith('che-') && !r.id.startsWith('snack-')
          );
        } else {
          rawBfastPool = recipes.filter(r => r.category === 'an-sang');
        }
      }
      if (rawBfastPool.length === 0) rawBfastPool = [recipes[0]];

      let affordableBfast = rawBfastPool.filter(r => scaleCost(r.estimatedCostVnd || 25000, safeServings) <= maxBfastCost);
      if (affordableBfast.length === 0) {
        affordableBfast = [...rawBfastPool].sort((a, b) =>
          scaleCost(a.estimatedCostVnd || 25000, safeServings) - scaleCost(b.estimatedCostVnd || 25000, safeServings)
        ).slice(0, 5);
      }

      affordableBfast.sort((a, b) => {
        const aUsed = usedRecipeIds.has(a.id) ? 1 : 0;
        const bUsed = usedRecipeIds.has(b.id) ? 1 : 0;
        if (aUsed !== bUsed) return aUsed - bUsed;
        return (a.estimatedCostVnd || 25000) - (b.estimatedCostVnd || 25000);
      });

      let candidateSets = [...mealSets];
      if (isChay) {
        candidateSets = candidateSets.filter(s => s.region === 'chay' || s.tags?.some(t => t.toLowerCase().includes('chay')));
      }

      let chosenBreakfast = affordableBfast[0];
      let chosenLunchSet: VietnameseMealSet | null = null;
      let chosenDinnerSet: VietnameseMealSet | null = null;
      let chosenCost = 0;

      for (const bfastCandidate of affordableBfast) {
        const bfastCost = scaleCost(bfastCandidate.estimatedCostVnd || 25000, safeServings);
        const remBudget = budgetCeiling - bfastCost;

        const unusedSets = candidateSets.filter(s => !usedMealSetIds.has(s.id));
        const pool = unusedSets.length >= 2 ? unusedSets : candidateSets;

        pool.sort((a, b) => b.totalCostVnd - a.totalCostVnd);

        let bestSum = 0;
        let bestPair: [VietnameseMealSet, VietnameseMealSet] | null = null;

        for (let i = 0; i < pool.length; i++) {
          const costI = scaleCost(pool[i].totalCostVnd, safeServings);
          for (let j = 0; j < pool.length; j++) {
            if (i === j) continue;
            const costJ = scaleCost(pool[j].totalCostVnd, safeServings);
            const sum = costI + costJ;
            if (sum <= remBudget && sum > bestSum) {
              bestSum = sum;
              bestPair = [pool[i], pool[j]];
              if (sum >= remBudget * 0.95) break;
            }
          }
          if (bestPair && bestSum >= remBudget * 0.95) break;
        }

        if (bestPair) {
          chosenBreakfast = bfastCandidate;
          chosenLunchSet = bestPair[0];
          chosenDinnerSet = bestPair[1];
          chosenCost = bfastCost + bestSum;
          break;
        }
      }

      if (!chosenLunchSet || !chosenDinnerSet) {
        chosenBreakfast = affordableBfast[0];
        const sorted = [...candidateSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd);
        chosenLunchSet = sorted[0];
        chosenDinnerSet = sorted[1] || sorted[0];
        chosenCost = scaleCost((chosenBreakfast.estimatedCostVnd || 25000) + chosenLunchSet.totalCostVnd + chosenDinnerSet.totalCostVnd, safeServings);
      }

      setWeeklyPlan(prev => {
        const nextPlan = prev.map(d => {
          if (d.dayId === dayId) {
            return {
              ...d,
              meals: {
                breakfast: chosenBreakfast,
                lunch: chosenLunchSet,
                dinner: chosenDinnerSet
              },
              totalCost: (chosenBreakfast.estimatedCostVnd || 25000) + chosenLunchSet!.totalCostVnd + chosenDinnerSet!.totalCostVnd
            };
          }
          return d;
        });
        try {
          localStorage.setItem('mealwise_weekly_plan', JSON.stringify(nextPlan));
        } catch {}
        return nextPlan;
      });

      showToast(`⚡ Đã cân chỉnh mâm cơm ${targetDay.dayName} đầy đặn, chuẩn vị: ${chosenCost.toLocaleString('vi-VN')} đ (chuẩn ngân sách ${dailyBudgetTarget.toLocaleString('vi-VN')} đ)!`);
      return true;
    }
  };

  const recalibrateWeeklyMenu = () => {
    const safeServings = Number.isFinite(servings) && servings > 0 
      ? Math.min(20, Math.max(1, Math.round(servings))) 
      : (onboardingData?.familySize || 4);

    const validBudgetLevels: Array<'tiet-kiem' | 'vua-phai' | 'thoai-mai'> = ['tiet-kiem', 'vua-phai', 'thoai-mai'];
    const budgetLevel = validBudgetLevels.includes(onboardingData?.budgetLevel) ? onboardingData.budgetLevel : 'vua-phai';
    const regionPreference = onboardingData?.regionPreference || 'toan-quoc';
    const specialNeeds = onboardingData?.specialNeeds || [];
    const isSingle = safeServings === 1;
    const isSingleDish = isSingle && onboardingData?.singleMealFormat !== 'meal-set';
    const mealFormat = isSingleDish ? 'single-dish' : 'meal-set';

    const nextCount = generationCount + 1;
    setGenerationCount(nextCount);
    const dynamicSeed = Date.now() ^ (nextCount * 2654435761);

    const previousPlanSlotIds: Record<string, string> = {};
    if (Array.isArray(weeklyPlan)) {
      weeklyPlan.forEach(day => {
        if (day && day.dayId && day.meals) {
          if (day.meals.breakfast?.id) {
            previousPlanSlotIds[`${day.dayId}-breakfast`] = day.meals.breakfast.id;
          }
          if (day.meals.lunch?.id) {
            previousPlanSlotIds[`${day.dayId}-lunch`] = day.meals.lunch.id;
          }
          if (day.meals.dinner?.id) {
            previousPlanSlotIds[`${day.dayId}-dinner`] = day.meals.dinner.id;
          }
        }
      });
    }

    const generated = generateBudgetCompliantWeeklyPlan({
      servings: safeServings,
      budgetLevel,
      regionPreference,
      specialNeeds,
      mealFormat,
      seed: dynamicSeed,
      variationIndex: nextCount,
      previousPlanSlotIds
    });

    const updatedPlan: DailyMealPlan[] = generated.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: {
        breakfast: d.meals.breakfast,
        lunch: d.meals.lunch,
        dinner: d.meals.dinner
      },
      totalCost: d.unscaledDayCost
    }));

    setWeeklyPlan(updatedPlan);
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(updatedPlan));
    } catch {}

    const dailyBudgetTarget = getDailyBudgetTarget(budgetLevel, safeServings);
    if (isSingleDish) {
      showToast(`⚡ Đã cân chỉnh toàn bộ 7 ngày thành 14 món ăn đầy đặn, đủ chất không trùng lặp (~${dailyBudgetTarget.toLocaleString('vi-VN')} đ/ngày)!`);
    } else {
      showToast(`⚡ Đã cân chỉnh toàn bộ 7 ngày thành 14 mâm cơm đầy đặn không trùng lặp (~${dailyBudgetTarget.toLocaleString('vi-VN')} đ/ngày)!`);
    }
  };

  return (
    <MealWiseContext.Provider
      value={{
        recipes,
        mealSets,
        weeklyPlan,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        theme,
        setTheme,
        toggleTheme,
        onboardingData,
        setOnboardingData,
        showOnboarding,
        setShowOnboarding,
        completeOnboarding,
        resetOnboarding,
        selectedRecipe,
        setSelectedRecipe,
        selectedMealSet,
        setSelectedMealSet,
        addMealSetToSlot,
        assignMealSetToSlot,
        addRecipeToSlot,
        assignRecipeToSlot,
        removeMealFromSlot,
        generationCount,
        autoFillWeeklyMenu,
        recalibrateDayMenu,
        recalibrateWeeklyMenu,
        clearWeeklyMenu,
        resetWeeklyMenu,
        servings,
        setServings,
        groceryCheckedItems,
        setGroceryCheckedItems,
        toggleGroceryItemChecked,
        clearGroceryCheckedItems,
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
        extraGroceryItems,
        clearExtraGrocery,
        toastMessage,
        showToast,
        hideToast,
        isApexModalOpen,
        setIsApexModalOpen,
        openApexModal,
        closeApexModal,
        isMinigameHubOpen,
        setIsMinigameHubOpen,
        openMinigameHub,
        closeMinigameHub,
        isDrinkRouletteOpen,
        setIsDrinkRouletteOpen,
        openDrinkRoulette,
        closeDrinkRoulette,
        pantryItems,
        addPantryItem,
        removePantryItem,
        updatePantryItem,
        clearPantryItems,
        confirmDialog,
        openConfirmModal,
        closeConfirmModal,
        collabRoom,
        collabCheckedMap,
        collabUser,
        collabUserName,
        setCollabUserName,
        updateCollabUserProfile,
        collabParticipants,
        isShareModalOpen,
        setIsShareModalOpen,
        startCollabRoom,
        joinCollabRoom,
        leaveCollabRoom,
        toggleCollabChecked
      }}
    >
      {children}
    </MealWiseContext.Provider>
  );
};

export const useMealWise = () => {
  const context = useContext(MealWiseContext);
  if (!context) {
    throw new Error('useMealWise must be used within a MealWiseProvider');
  }
  return context;
};
