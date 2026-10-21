import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  ScheduledPartyEvent,
  PantryItem,
  ConfirmDialogState,
  CollabRoom,
  CollabCartItem,
  CollabCheckState,
  CollabShopper,
  isMealSet,
  RegisteredUser,
  GuestUserSession
} from '../types';
import { 
  getOrCreateGuestSession,
  loadGuestPartition,
  saveGuestPartition,
  hasCustomGuestData,
  getRegisteredUserByEmail,
  registerUserInDatabase,
  loadUserPartition,
  saveUserPartition,
  updateGuestSession,
  getMemberCodeForEmail,
  syncAccountPartitionWithServer,
  fetchAccountFromServer
} from '../services/userDatabase';
import {
  checkLoginRateLimit,
  recordLoginAttempt,
  sanitizeUserInput
} from '../services/otpSecurityService';
import {
  loadAccountCustomRecipes,
  saveAccountCustomRecipes,
  enqueueRecipeCloudMutation,
  syncAccountRecipesWithCloud,
  getRecipeCloudAdapter
} from '../services/recipeCloudSyncService';
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
  getShopperStyle,
  isRoomExpired,
  ROOM_TTL_MS
} from '../services/collabGroceryService';
import { mockRecipes } from '../data/mockRecipes';
import { mockMealSets, extendedMealSets } from '../data/mockMealSets';
import { CORPORATE_PARTY_PRESETS } from '../data/corporatePartyPresets';
import { INITIAL_PANTRY_ITEMS } from '../data/pantryItems';
import { calculatePartyKitchenTime } from '../utils/cateringTimeMath';
import { generateBudgetCompliantWeeklyPlan } from '../utils/mealPlanGenerator';
import { roundToThousand, scaleCost, getDailyBudgetTarget, DAILY_BUDGET_RATES } from '../utils/currency';
import { isHotpotOrFeast } from '../utils/textUtils';
import { 
  recordTelemetryEvent, 
  heartbeatSession, 
  removeCurrentSession, 
  recordUserInRegistry 
} from '../utils/telemetryEngine';
import { initScreenTimeTracker } from '../utils/screenTimeService';
import { canonicalizeIngredientName, isGroceryItemMatch } from '../utils/ingredientNormalizer';
import {
  AdminRecipeImageOverride,
  getAdminRecipeImageOverrides,
  syncAdminRecipeImageOverridesFromServer,
  applyAdminOverrideToRecipe,
  applyAdminOverridesToRecipeList,
  applyAdminOverridesToMealSet,
  applyAdminOverridesToDailyPlan
} from '../utils/dishImageResolver';

export interface ExtraGroceryItem {
  name: string;
  amount: number;
  unit: string;
  category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
  cost: number;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface MealWiseContextType {
  guestSession: GuestUserSession | null;
  recipes: Recipe[];
  customRecipes: Recipe[];
  addCustomRecipe: (recipe: Recipe) => void;
  deleteCustomRecipe: (recipeId: string) => void;
  mealSets: VietnameseMealSet[];
  weeklyPlan: DailyMealPlan[];
  setWeeklyPlan: React.Dispatch<React.SetStateAction<DailyMealPlan[]>>;
  activePlanScope: 'current' | 'next';
  setActivePlanScope: (scope: 'current' | 'next') => void;
  currentWeekPlan: DailyMealPlan[];
  nextWeekPlan: DailyMealPlan[];
  promoteNextWeekToCurrent: () => void;
  previousWeeklyPlan: DailyMealPlan[] | null;
  previousPlanSavedAt: string | null;
  restorePreviousWeeklyPlan: (onlyWeekend?: boolean) => void;
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
  completeOnboarding: (data: Partial<OnboardingData>, options?: { regeneratePlan?: boolean }) => void;
  resetOnboarding: () => void;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  openWelcomeModal: () => void;
  completeWelcomeModal: () => void;
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  startTutorial: () => void;
  
  // Selection modals
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  selectedMealSet: VietnameseMealSet | null;
  setSelectedMealSet: (mealSet: VietnameseMealSet | null) => void;

  // Actions
  addMealSetToSlot: (dayId: string, slot: MealSlot, mealSetId: string | VietnameseMealSet) => void;
  assignMealSetToSlot: (dayId: string, slot: MealSlot, mealSetId: string | VietnameseMealSet) => void;
  swapDishInMealSet: (mealSet: VietnameseMealSet, dishType: 'mainDish' | 'soupDish' | 'sideDish', replacementRecipeId?: string) => VietnameseMealSet;
  swapDishInWeeklySlot: (dayId: string, slot: MealSlot, dishType: 'mainDish' | 'soupDish' | 'sideDish') => void;
  addRecipeToSlot: (dayId: string, slot: MealSlot, recipeId: string) => void;
  assignRecipeToSlot: (dayId: string, slot: MealSlot, recipeId: string) => void;
  removeMealFromSlot: (dayId: string, slot: MealSlot) => void;
  toggleSkipSlot: (dayId: string, slot: MealSlot, customNote?: string) => void;
  generationCount: number;
  autoFillWeeklyMenu: (customPreferences?: OnboardingData, options?: { seed?: number; cycleIndex?: number; preserveWeekend?: boolean }) => void;
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
  isWeeklyShoppingCompleted: boolean;
  setIsWeeklyShoppingCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  groceryItemBuyerCounts: Record<string, number>;
  incrementGroceryItemBuyer: (key: string) => void;
  decrementGroceryItemBuyer: (key: string) => void;

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

  // Scheduled Party Calendar Events
  scheduledPartyEvents: ScheduledPartyEvent[];
  schedulePartyEvent: (event: Omit<ScheduledPartyEvent, 'id' | 'createdAt'>) => ScheduledPartyEvent;
  updateScheduledPartyEvent: (id: string, updates: Partial<ScheduledPartyEvent>) => void;
  deleteScheduledPartyEvent: (id: string) => void;
  togglePartyEventNotification: (id: string) => void;
  loadEventIntoPartyPlan: (event: ScheduledPartyEvent) => void;

  // Extra grocery items
  extraGroceryItems: ExtraGroceryItem[];
  addExtraGroceryItems: (items: ExtraGroceryItem[]) => void;
  removeExtraGroceryItem: (name: string | string[]) => void;
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
  toastType: ToastType;
  showToast: (msg: string, type?: ToastType) => void;
  hideToast: () => void;

  // Pantry / Fridge state
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  addPantryItems: (items: Array<Omit<PantryItem, 'id'>>) => void;
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
  incrementCollabItemBuyer: (itemId: string) => void;
  decrementCollabItemBuyer: (itemId: string) => void;

  // User Authentication & Membership State
  user: RegisteredUser | null;
  isRegistered: boolean;
  loginUser: (profile: { name: string; email: string; password?: string; otpVerified?: boolean }, isNewRegistration?: boolean) => boolean;
  logoutUser: () => void;
  deleteAccount: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  // Web Guest Viewer Mode (Restricts access exclusively to Grocery List, prompts app download for other tabs)
  isWebGuestViewer: boolean;
  setIsWebGuestViewer: (val: boolean) => void;
  isDownloadAppModalOpen: boolean;
  setIsDownloadAppModalOpen: (open: boolean) => void;
  downloadAppFeatureName: string;
  openDownloadAppModal: (featureName?: string) => void;
  closeDownloadAppModal: () => void;
}

const MealWiseContext: React.Context<MealWiseContextType | undefined> = 
  (typeof globalThis !== 'undefined' && (globalThis as any).__MEALWISE_REACT_CONTEXT__) ||
  createContext<MealWiseContextType | undefined>(undefined);

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__MEALWISE_REACT_CONTEXT__ = MealWiseContext;
}

export const INITIAL_ONBOARDING: OnboardingData = {
  regionPreference: 'toan-quoc',
  familySize: 4,
  singleMealFormat: 'single-dish',
  weekdayLunchRoutine: 'ban-tru-di-lam',
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

const getStoredUserEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mealwise_registered_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email || null;
  } catch {
    return null;
  }
};

const loadCustomRecipesFromStorage = (email?: string | null): Recipe[] => {
  const targetEmail = email !== undefined ? email : getStoredUserEmail();
  return loadAccountCustomRecipes(targetEmail);
};

export const MealWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => loadCustomRecipesFromStorage());
  const [adminDishOverrides, setAdminDishOverrides] = useState<Record<string, AdminRecipeImageOverride>>(() =>
    getAdminRecipeImageOverrides()
  );

  useEffect(() => {
    syncAdminRecipeImageOverridesFromServer().then((synced) => {
      setAdminDishOverrides({ ...synced });
    });
    const handleAdminDishUpdate = () => {
      setAdminDishOverrides({ ...getAdminRecipeImageOverrides() });
    };
    window.addEventListener('mealwise:recipe_images_updated', handleAdminDishUpdate);
    return () => {
      window.removeEventListener('mealwise:recipe_images_updated', handleAdminDishUpdate);
    };
  }, []);

  const recipes = useMemo(
    () => applyAdminOverridesToRecipeList([...customRecipes, ...mockRecipes], adminDishOverrides),
    [customRecipes, adminDishOverrides]
  );

  const addCustomRecipe = useCallback((newRecipe: Recipe) => {
    const activeEmail = getStoredUserEmail();
    setCustomRecipes(prev => {
      const updated = [newRecipe, ...prev.filter(r => r.id !== newRecipe.id)];
      saveAccountCustomRecipes(activeEmail, updated);
      enqueueRecipeCloudMutation(activeEmail, {
        type: 'upsert',
        recipeId: newRecipe.id,
        recipe: newRecipe,
        timestamp: Date.now()
      });
      void syncAccountRecipesWithCloud(activeEmail, updated);
      return updated;
    });
  }, []);

  const deleteCustomRecipe = useCallback((recipeId: string) => {
    const activeEmail = getStoredUserEmail();
    setCustomRecipes(prev => {
      const updated = prev.filter(r => r.id !== recipeId);
      saveAccountCustomRecipes(activeEmail, updated);
      enqueueRecipeCloudMutation(activeEmail, {
        type: 'delete',
        recipeId,
        timestamp: Date.now()
      });
      const adapter = getRecipeCloudAdapter();
      if (activeEmail && adapter.isConfigured()) {
        if (adapter.deleteUserRecipe) {
          void adapter.deleteUserRecipe(activeEmail, recipeId);
        } else {
          void adapter.pushUserRecipes(activeEmail, updated);
        }
      }
      return updated;
    });
  }, []);

  const [mealSets, setMealSets] = useState<VietnameseMealSet[]>(extendedMealSets);

  // Web Guest Viewer Mode: accessed via shared grocery link (?collab_cart=...) or web guest parameter
  const [isWebGuestViewer, setIsWebGuestViewerState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const url = new URL(window.location.href);
      const isCollab = Boolean(url.searchParams.get('collab_cart') || url.searchParams.get('collab') || url.searchParams.get('shared_cart'));
      const isGuestParam = url.searchParams.get('guest_viewer') === '1';
      const stored = localStorage.getItem('mealwise_web_guest_viewer') === 'true';
      return isCollab || isGuestParam || stored;
    } catch {
      return false;
    }
  });

  const setIsWebGuestViewer = useCallback((val: boolean) => {
    setIsWebGuestViewerState(val);
    try {
      if (val) localStorage.setItem('mealwise_web_guest_viewer', 'true');
      else localStorage.removeItem('mealwise_web_guest_viewer');
    } catch {}
  }, []);

  const [isDownloadAppModalOpen, setIsDownloadAppModalOpen] = useState<boolean>(false);
  const [downloadAppFeatureName, setDownloadAppFeatureName] = useState<string>('');

  const openDownloadAppModal = useCallback((featureName?: string) => {
    setDownloadAppFeatureName(featureName || 'Lên Thực Đơn & Tủ Lạnh Thông Minh');
    setIsDownloadAppModalOpen(true);
  }, []);

  const closeDownloadAppModal = useCallback(() => {
    setIsDownloadAppModalOpen(false);
  }, []);

  const [activeTabState, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const isCollab = Boolean(url.searchParams.get('collab_cart') || url.searchParams.get('collab') || url.searchParams.get('shared_cart') || url.searchParams.get('guest_viewer') === '1');
        const stored = localStorage.getItem('mealwise_web_guest_viewer') === 'true';
        if (isCollab || stored) return 'grocery';
      } catch {}
    }
    return 'weekly';
  });

  const setActiveTab = useCallback((tab: ActiveTab) => {
    if (isWebGuestViewer && tab !== 'grocery') {
      const featureNames: Record<ActiveTab, string> = {
        'meal-sets': 'Mâm Cơm 3 Món Chuẩn Vị Việt',
        'weekly': 'Lên Thực Đơn Tuần & Cân Đối Dinh Dưỡng',
        'party': 'Đặt Tiệc & Lập Dự Toán Catering',
        'grocery': 'Đi Chợ Tự Động',
        'pantry': 'Tủ Lạnh & Gợi Ý Món Vét Tủ',
        'recipes': 'Sổ Tay Công Thức Nấu Ăn',
        'account': 'Tài Khoản & Cá Nhân Hóa Dinh Dưỡng',
        'admin': 'Bảng Điều Khiển Quản Trị',
        'fast-meal': 'Món Nhanh Tốc Biến'
      };
      openDownloadAppModal(featureNames[tab] || 'Tính năng này');
      return;
    }
    setActiveTabState(tab);
  }, [isWebGuestViewer, openDownloadAppModal]);

  const activeTab = activeTabState;
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

  // User Authentication & Membership State
  const [user, setUser] = useState<RegisteredUser | null>(() => {
    try {
      const saved = localStorage.getItem('mealwise_registered_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const emailLower = (parsed?.email || '').trim().toLowerCase();
      if (emailLower === 'admin@mealwise.vn' || emailLower === 'admin@mealwise.com' || emailLower === 'mealwise@admin.com' || emailLower === 'admin') {
        parsed.role = 'admin';
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const isRegistered = Boolean(user && user.isRegistered);
  const [guestSession, setGuestSession] = useState<GuestUserSession | null>(() => getOrCreateGuestSession());

  useEffect(() => {
    setGuestSession(getOrCreateGuestSession());
  }, []);

  // Account-Scoped Custom Recipes & Cloud Sync Hydration on Login / Logout
  useEffect(() => {
    const email = user?.email || null;
    const localAccountRecipes = loadAccountCustomRecipes(email);
    setCustomRecipes(localAccountRecipes);

    if (email) {
      let cancelled = false;
      syncAccountRecipesWithCloud(email, localAccountRecipes, user?.id).then(res => {
        if (!cancelled && res.recipes) {
          setCustomRecipes(res.recipes);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [user?.email, user?.id]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Onboarding screen logic:
  // ONLY appears when a new user registers for the first time via AuthModal.
  // Guests and returning users NEVER see this popup automatically upon opening the app!
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const hasUser = typeof window !== 'undefined' && Boolean(localStorage.getItem('mealwise_registered_user'));
    if (!hasUser) {
      return false; // Guest account: NEVER show onboarding modal on launch!
    }
    return false; // Registered users: never auto-open on launch!
  });

  // First-Launch Welcome Onboarding Modal (Dribbble 3-Slide Visual Onboarding v2)
  // Auto-opens on launch when mealwise_welcome_onboarding_seen_v2 !== 'true'
  // (including when upgrading from v1 even if a user session exists),
  // unless a deep-link query/hash is active or running in headless WebDriver.
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const search = window.location.search || '';
      if (search.includes('welcome=1')) {
        return true;
      }
      const seenV2 = localStorage.getItem('mealwise_welcome_onboarding_seen_v2') === 'true';
      if (seenV2) return false;
      const hasDeepLink = Boolean(search || window.location.hash);
      if (hasDeepLink) return false;
      const isWebDriver = typeof navigator !== 'undefined' && Boolean(navigator.webdriver);
      if (isWebDriver) return false;
      return true;
    } catch {
      return false;
    }
  });

  const openWelcomeModal = useCallback(() => {
    setShowWelcomeModal(true);
  }, []);

  const completeWelcomeModal = useCallback(() => {
    try {
      localStorage.setItem('mealwise_welcome_onboarding_seen_v2', 'true');
      localStorage.setItem('mealwise_welcome_onboarding_seen_v1', 'true');
    } catch {}
    setShowWelcomeModal(false);

    // Chain directly to Onboarding Preference (Step 2 of flow: App Onboarding -> Onboarding Preference -> Tutorial -> Explore App)
    try {
      let emailLower = user?.email?.toLowerCase().trim();
      if (!emailLower) {
        const savedUserStr = localStorage.getItem('mealwise_registered_user');
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          emailLower = parsed.email?.toLowerCase().trim();
        }
      }
      const userOnboardingKey = emailLower ? `mealwise_onboarding_completed_${emailLower}` : null;
      const isUserOnboarded = userOnboardingKey
        ? localStorage.getItem(userOnboardingKey) === 'true'
        : localStorage.getItem('mealwise_onboarding_completed_guest') === 'true';

      if (!onboardingData?.completed && !user?.onboardingCompleted && !isUserOnboarded) {
        setShowOnboarding(true);
      }
    } catch {
      if (!onboardingData?.completed) {
        setShowOnboarding(true);
      }
    }
  }, [user, onboardingData]);


  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedMealSet, setSelectedMealSet] = useState<VietnameseMealSet | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const openConfirmModal = useCallback((state: ConfirmDialogState) => {
    setConfirmDialog(state);
  }, []);
  const closeConfirmModal = useCallback(() => {
    setConfirmDialog(null);
  }, []);
  const [isApexModalOpen, setIsApexModalOpen] = useState<boolean>(false);
  const openApexModal = useCallback(() => {
    if (isWebGuestViewer) {
      openDownloadAppModal('Món Nhanh Tốc Biến');
      return;
    }
    setIsApexModalOpen(true);
  }, [isWebGuestViewer, openDownloadAppModal]);
  const closeApexModal = useCallback(() => setIsApexModalOpen(false), []);

  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const startTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const [isMinigameHubOpen, setIsMinigameHubOpen] = useState<boolean>(false);
  const openMinigameHub = useCallback(() => {
    if (isWebGuestViewer) {
      openDownloadAppModal('Minigame & Giải Trí Bàn Tiệc');
      return;
    }
    setIsMinigameHubOpen(true);
  }, [isWebGuestViewer, openDownloadAppModal]);
  const closeMinigameHub = useCallback(() => setIsMinigameHubOpen(false), []);

  const [isDrinkRouletteOpen, setIsDrinkRouletteOpen] = useState<boolean>(false);
  const openDrinkRoulette = useCallback(() => {
    if (isWebGuestViewer) {
      openDownloadAppModal('Vòng Quay Bàn Nhậu');
      return;
    }
    setIsDrinkRouletteOpen(true);
  }, [isWebGuestViewer, openDownloadAppModal]);
  const closeDrinkRoulette = useCallback(() => setIsDrinkRouletteOpen(false), []);

  // Synchronize activeTab and modals with URL hash, query params, and parent iframe postMessages
  useEffect(() => {
    const handleUrlSync = () => {
      try {
        const hash = window.location.hash.replace('#', '');
        const validTabs: ActiveTab[] = ['meal-sets', 'weekly', 'party', 'grocery', 'recipes', 'pantry', 'account', 'admin'];
        if (validTabs.includes(hash as ActiveTab)) {
          setActiveTab(hash as ActiveTab);
        }
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && validTabs.includes(tabParam as ActiveTab)) {
          setActiveTab(tabParam as ActiveTab);
        }
        const modalParam = params.get('modal') || hash;
        if (modalParam === 'minigames') setIsMinigameHubOpen(true);
        if (modalParam === 'roulette') setIsDrinkRouletteOpen(true);
        if (modalParam === 'apex') setIsApexModalOpen(true);
        if (modalParam === 'welcome' || params.get('welcome') === '1') setShowWelcomeModal(true);
      } catch {}
    };

    handleUrlSync();
    window.addEventListener('hashchange', handleUrlSync);

    const handlePostMessage = (e: MessageEvent) => {
      try {
        if (e.data && typeof e.data === 'object') {
          if (e.data.type === 'SET_TAB' && e.data.tab) {
            setActiveTab(e.data.tab);
          }
          if (e.data.type === 'OPEN_MODAL') {
            if (e.data.modal === 'minigames') setIsMinigameHubOpen(true);
            if (e.data.modal === 'roulette') setIsDrinkRouletteOpen(true);
            if (e.data.modal === 'apex') setIsApexModalOpen(true);
            if (e.data.modal === 'welcome') setShowWelcomeModal(true);
          }
        }
      } catch {}
    };
    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('hashchange', handleUrlSync);
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

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

  // Scheduled Party Calendar Events
  const [scheduledPartyEvents, setScheduledPartyEvents] = useState<ScheduledPartyEvent[]>(() => {
    try {
      const saved = localStorage.getItem('mealwise_scheduled_party_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mealwise_scheduled_party_events', JSON.stringify(scheduledPartyEvents));
  }, [scheduledPartyEvents]);

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
    if (user?.id) {
      saveUserPartition(user.id, { pantryItems });
    } else {
      saveGuestPartition({ pantryItems });
    }
  }, [pantryItems, user?.id]);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToastMessage(null);
  }, []);

  const showToast = useCallback((msg: string, type?: ToastType) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    // Smart auto-detection of semantic type if not explicitly provided
    let resolvedType: ToastType = type || 'info';
    if (!type) {
      if (/🔒|⚠️|cảnh báo|hết hạn|khóa|chỉ dành cho|chưa nhập|vui lòng nhập|yêu cầu/i.test(msg)) {
        resolvedType = 'warning';
      } else if (/❌|lỗi|thất bại|không thể/i.test(msg)) {
        resolvedType = 'error';
      } else if (/✅|🎉|✨|đã lưu|thành công|hoàn tất|áp dụng/i.test(msg)) {
        resolvedType = 'success';
      }
    }
    setToastType(resolvedType);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    const handleCustomConfirm = (e: Event) => {
      const customEvent = e as CustomEvent<ConfirmDialogState>;
      if (customEvent.detail) {
        openConfirmModal(customEvent.detail);
      }
    };
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<string | { message: string; type?: ToastType }>;
      if (customEvent.detail) {
        if (typeof customEvent.detail === 'string') {
          showToast(customEvent.detail);
        } else if (customEvent.detail && typeof customEvent.detail === 'object' && customEvent.detail.message) {
          showToast(customEvent.detail.message, customEvent.detail.type);
        }
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
    recordTelemetryEvent('fridge', `Lưu "${newItem.name}" vào tủ lạnh (Hạn ${newItem.daysLeft} ngày)`, user?.name || 'Người dùng');
    showToast(`Đã lưu "${newItem.name}" vào tủ lạnh!`);
  }, [user, showToast]);

  const addPantryItems = useCallback((items: Array<Omit<PantryItem, 'id'>>) => {
    if (!items || items.length === 0) return;
    const now = Date.now();
    const newItems: PantryItem[] = items.map((item, idx) => ({
      ...item,
      id: `pantry-${now}-${idx}-${Math.random().toString(36).substring(2, 7)}`
    }));
    setPantryItems(prev => [...newItems, ...prev]);
    recordTelemetryEvent('fridge', `Lưu ${newItems.length} món vào tủ lạnh`, user?.name || 'Người dùng');
    showToast(`Đã lưu ${newItems.length} món vào tủ lạnh!`);
  }, [user, showToast]);

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

  const addExtraGroceryItems = useCallback((items: ExtraGroceryItem[]) => {
    setExtraGroceryItems(prev => {
      const next = [...prev, ...items];
      try {
        localStorage.setItem('mealwise_extra_grocery', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist mealwise_extra_grocery', e);
      }
      return next;
    });
  }, []);

  const removeExtraGroceryItem = useCallback((name: string | string[]) => {
    const targets = Array.isArray(name) ? name : [name];
    setExtraGroceryItems(prev => {
      const next = prev.filter(it => {
        return !targets.some(t => isGroceryItemMatch(t, it.name));
      });
      try {
        localStorage.setItem('mealwise_extra_grocery', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist mealwise_extra_grocery', e);
      }
      return next;
    });
  }, []);

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

  const schedulePartyEvent = (event: Omit<ScheduledPartyEvent, 'id' | 'createdAt'>): ScheduledPartyEvent => {
    const newEvent: ScheduledPartyEvent = {
      ...event,
      id: `party-evt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setScheduledPartyEvents(prev => [newEvent, ...prev]);
    showToast(`📅 Đã lưu lịch tiệc "${newEvent.title}" vào Lịch Tiệc!`);
    return newEvent;
  };

  const updateScheduledPartyEvent = (id: string, updates: Partial<ScheduledPartyEvent>) => {
    setScheduledPartyEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    showToast('✏️ Đã cập nhật kế hoạch lịch tiệc.');
  };

  const deleteScheduledPartyEvent = (id: string) => {
    setScheduledPartyEvents(prev => prev.filter(e => e.id !== id));
    showToast('🗑️ Đã xóa sự kiện khỏi Lịch Tiệc.');
  };

  const togglePartyEventNotification = (id: string) => {
    setScheduledPartyEvents(prev => prev.map(e => {
      if (e.id === id) {
        const nextState = !e.enableNotifications;
        showToast(nextState ? `🔔 Đã bật nhắc nhở cho "${e.title}"!` : `🔕 Đã tắt nhắc nhở cho "${e.title}".`);
        return { ...e, enableNotifications: nextState };
      }
      return e;
    }));
  };

  const loadEventIntoPartyPlan = (event: ScheduledPartyEvent) => {
    setPartyPlan({
      id: `party-${Date.now()}`,
      title: event.title,
      clientName: 'Khách Hàng Đặt Tiệc',
      eventType: event.eventType,
      guestCount: event.guestCount,
      tableSize: event.tableSize,
      budgetPerHeadVnd: Math.max(50000, Math.round(event.totalEstimateVnd / Math.max(1, event.guestCount))),
      dishes: event.attachedDishes ? event.attachedDishes.map(d => ({ ...d })) : [],
      recommendedDrinks: [],
      equipmentChecklist: [],
      staffNotes: event.notes || `Kế hoạch theo lịch: ${event.title} (${event.targetDate})`
    });
    showToast(`✨ Đã nạp thực đơn của "${event.title}" vào Bếp!`);
  };

  // Helper to build default weekly plan with authentic preset Mâm Cơm sets
  const buildDefaultWeeklyPlan = (customSeed?: number): DailyMealPlan[] => {
    const routine = onboardingData?.weekdayLunchRoutine || 'ban-tru-di-lam';
    const generated = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'toan-quoc',
      specialNeeds: [],
      mealFormat: 'meal-set',
      weekdayLunchRoutine: routine,
      seed: customSeed
    });
    return generated.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: {
        breakfast: d.meals.breakfast,
        lunch: d.meals.lunch,
        dinner: d.meals.dinner
      },
      skippedSlots: d.skippedSlots,
      slotNotes: d.slotNotes,
      totalCost: d.unscaledDayCost
    }));
  };

  // Helper to build a blank weekly plan for first-time app downloads
  const buildEmptyWeeklyPlan = (): DailyMealPlan[] => {
    return INITIAL_DAYS.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null
      },
      totalCost: 0
    }));
  };

  const hasAnyMealsInPlan = (plan: DailyMealPlan[] | null | undefined): boolean => {
    if (!Array.isArray(plan)) return false;
    return plan.some(d => Boolean(d?.meals?.breakfast || d?.meals?.lunch || d?.meals?.dinner));
  };

  // Current Week Plan ('Tuần Này') — starts blank until user clicks "Gợi ý"
  const [currentWeekPlan, setCurrentWeekPlan] = useState<DailyMealPlan[]>(() => {
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
    return buildEmptyWeeklyPlan();
  });

  // Next Week Plan ('Tuần Sau') — starts blank until user clicks "Gợi ý"
  const [nextWeekPlan, setNextWeekPlan] = useState<DailyMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem('mealwise_next_weekly_plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load mealwise_next_weekly_plan from localStorage', e);
    }
    return buildEmptyWeeklyPlan();
  });

  // Active Plan Scope ('current' = Tuần Này, 'next' = Tuần Sau)
  const [activePlanScope, setActivePlanScopeState] = useState<'current' | 'next'>(() => {
    try {
      const saved = localStorage.getItem('mealwise_active_plan_scope');
      if (saved === 'next' || saved === 'current') return saved;
    } catch {}
    return 'current';
  });

  const setActivePlanScope = useCallback((scope: 'current' | 'next') => {
    setActivePlanScopeState(scope);
    try {
      localStorage.setItem('mealwise_active_plan_scope', scope);
    } catch {}
  }, []);

  // Previous Weekly Plan Snapshot (for 1-Tap Undo / Viewing This Weekend's Old Recipes)
  const [previousWeeklyPlanState, setPreviousWeeklyPlanState] = useState<{
    plan: DailyMealPlan[];
    savedAt: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('mealwise_previous_weekly_plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.plan) && parsed.plan.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const savePlanSnapshot = useCallback((planToBackup: DailyMealPlan[]) => {
    if (!hasAnyMealsInPlan(planToBackup)) return;
    const now = new Date();
    const savedAt = `${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • ${now.toLocaleDateString('vi-VN')}`;
    const snapshot = {
      plan: JSON.parse(JSON.stringify(planToBackup)) as DailyMealPlan[],
      savedAt
    };
    setPreviousWeeklyPlanState(snapshot);
    try {
      localStorage.setItem('mealwise_previous_weekly_plan', JSON.stringify(snapshot));
    } catch {}
  }, []);

  const previousWeeklyPlan = previousWeeklyPlanState?.plan || null;
  const previousPlanSavedAt = previousWeeklyPlanState?.savedAt || null;

  // Unified weeklyPlan & setWeeklyPlan that delegate to the active scope ('current' vs 'next')
  const weeklyPlan = activePlanScope === 'next' ? nextWeekPlan : currentWeekPlan;

  const setWeeklyPlan: React.Dispatch<React.SetStateAction<DailyMealPlan[]>> = useCallback((action) => {
    if (activePlanScope === 'next') {
      setNextWeekPlan(action);
    } else {
      setCurrentWeekPlan(action);
    }
  }, [activePlanScope]);

  const restorePreviousWeeklyPlan = useCallback((onlyWeekend?: boolean) => {
    if (!previousWeeklyPlanState?.plan || previousWeeklyPlanState.plan.length === 0) return;
    const backup = previousWeeklyPlanState.plan;

    if (onlyWeekend) {
      const satBackup = backup.find(d => d.dayId === 'sat');
      const sunBackup = backup.find(d => d.dayId === 'sun');
      setWeeklyPlan(prev => prev.map(d => {
        if (d.dayId === 'sat' && satBackup) return JSON.parse(JSON.stringify(satBackup));
        if (d.dayId === 'sun' && sunBackup) return JSON.parse(JSON.stringify(sunBackup));
        return d;
      }));
      showToast('🎉 Đã khôi phục thực đơn Thứ Bảy & Chủ Nhật từ bản lưu vừa rồi!');
    } else {
      const restored = JSON.parse(JSON.stringify(backup)) as DailyMealPlan[];
      setWeeklyPlan(restored);
      showToast('🎉 Đã khôi phục lại toàn bộ thực đơn 7 ngày vừa rồi!');
    }
  }, [previousWeeklyPlanState, setWeeklyPlan, showToast]);

  // Promote Next Week Plan ('Tuần Sau') into Current Week Plan ('Tuần Này')
  const promoteNextWeekToCurrent = useCallback(() => {
    if (hasAnyMealsInPlan(currentWeekPlan)) {
      savePlanSnapshot(currentWeekPlan);
    }
    const promoted = JSON.parse(JSON.stringify(nextWeekPlan)) as DailyMealPlan[];
    setCurrentWeekPlan(promoted);
    const freshNext = buildEmptyWeeklyPlan();
    setNextWeekPlan(freshNext);
    setActivePlanScope('current');
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(promoted));
      localStorage.setItem('mealwise_next_weekly_plan', JSON.stringify(freshNext));
    } catch {}
    showToast('🎉 Đã chuyển thực đơn Tuần Sau sang Tuần Này (Thực đơn cũ đã được lưu vào Thực Đơn Cũ)!');
  }, [currentWeekPlan, nextWeekPlan, savePlanSnapshot, setActivePlanScope]);

  // Auto-Rollover on Monday: When a new calendar week starts on Monday and user was on 'next' scope, promote automatically
  useEffect(() => {
    try {
      const now = new Date();
      const day = now.getDay(); // 1 = Monday
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      const mondayKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      const lastMondayKey = localStorage.getItem('mealwise_current_week_monday');

      if (lastMondayKey && lastMondayKey !== mondayKey && activePlanScope === 'next' && hasAnyMealsInPlan(nextWeekPlan)) {
        if (hasAnyMealsInPlan(currentWeekPlan)) {
          savePlanSnapshot(currentWeekPlan);
        }
        setCurrentWeekPlan(nextWeekPlan);
        setActivePlanScope('current');
      }
      localStorage.setItem('mealwise_current_week_monday', mondayKey);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_weekly_plan', JSON.stringify(currentWeekPlan));
      if (user?.id) {
        saveUserPartition(user.id, { weeklyPlan: currentWeekPlan as any });
      } else {
        saveGuestPartition({ weeklyPlan: currentWeekPlan as any });
      }
    } catch (e) {
      console.error('Failed to persist mealwise_weekly_plan to localStorage', e);
    }
  }, [currentWeekPlan, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_next_weekly_plan', JSON.stringify(nextWeekPlan));
    } catch (e) {
      console.error('Failed to persist mealwise_next_weekly_plan to localStorage', e);
    }
  }, [nextWeekPlan]);

  // Reconcile existing stored weekly plan with user weekday lunch routine
  useEffect(() => {
    const routine = onboardingData?.weekdayLunchRoutine;
    const isSkipRoutine = routine === 'ban-tru-di-lam' || routine === 'hop-com-van-phong';
    if (!isSkipRoutine) return;
    const noteText = routine === 'hop-com-van-phong' ? 'Mang cơm hộp văn phòng' : 'Con học bán trú • Bố mẹ ăn ngoài';

    const applySkipRoutine = (prev: DailyMealPlan[]) => {
      let changed = false;
      const nextPlan = prev.map(day => {
        const isWkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day.dayId);
        if (isWkday && !day.skippedSlots?.lunch && day.meals.lunch) {
          changed = true;
          return {
            ...day,
            meals: { ...day.meals, lunch: null },
            skippedSlots: { ...day.skippedSlots, lunch: true },
            slotNotes: { ...day.slotNotes, lunch: noteText }
          };
        }
        return day;
      });
      return changed ? nextPlan : prev;
    };

    setCurrentWeekPlan(applySkipRoutine);
    setNextWeekPlan(applySkipRoutine);
  }, [onboardingData?.weekdayLunchRoutine]);

  const loginUser = useCallback((profile: { name: string; email: string; password?: string; otpVerified?: boolean }, isNewRegistration?: boolean): boolean => {
    const rawEmail = sanitizeUserInput(profile.email, 120);
    const emailLower = rawEmail.toLowerCase();
    const isAdmin = emailLower === 'admin@mealwise.vn' || emailLower === 'admin@mealwise.com' || emailLower === 'mealwise@admin.com' || emailLower === 'admin';
    const defaultDisplayName = isAdmin ? 'Mealy Administrator' : (profile.name.trim() || rawEmail.split('@')[0] || 'Thành Viên Mealy');
    const displayName = profile.name.trim() || defaultDisplayName;

    const isNew = Boolean(isNewRegistration);
    const userOnboardingKey = `mealwise_onboarding_completed_${emailLower}`;

    // Enforce brute-force login rate limiting on returning password logins
    if (!isNew) {
      const rateLimit = checkLoginRateLimit(emailLower);
      if (!rateLimit.allowed) {
        showToast(`🔒 Tài khoản tạm khóa ${rateLimit.lockedRemainingSeconds} giây do nhập sai mật khẩu quá 5 lần. Hãy thử đăng nhập bằng Mã OTP!`, 'error');
        return false;
      }
    }

    // Verify password on returning login if the account has a stored passwordHash
    if (!isNew && profile.password !== undefined && !profile.otpVerified) {
      const check = verifyUserPassword(emailLower, profile.password);
      if (!check.valid) {
        recordLoginAttempt(emailLower, false);
        showToast('❌ Mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc dùng Mã OTP!', 'error');
        return false;
      }
      recordLoginAttempt(emailLower, true);
    }

    // Admin never gets onboarding. For members, onboarding is ONLY triggered on first-time registration!
    const needsOnboarding = !isAdmin && isNew;

    // Save current guest state if this is a new registration to migrate
    const guestHadData = hasCustomGuestData();

    // Check if user already exists in DB to preserve their onboarding status if returning
    const existingDbUser = getRegisteredUserByEmail(emailLower);
    const existingOnboardingCompleted = existingDbUser?.onboardingCompleted ?? true;

    // Register or retrieve in user database
    const { user: dbUser, migrated } = registerUserInDatabase(
      { name: displayName, email: rawEmail, role: isAdmin ? 'admin' : 'user', password: profile.password },
      { 
        migrateGuestData: Boolean(isNew && guestHadData),
        guestData: {
          weeklyPlan: weeklyPlan as any,
          pantryItems,
          updatedAt: Date.now()
        },
        onboardingCompleted: isNew ? false : existingOnboardingCompleted 
      }
    );

    const newProfile: RegisteredUser = {
      id: dbUser.id,
      name: displayName,
      email: rawEmail,
      isRegistered: true,
      role: isAdmin ? 'admin' : 'user',
      registeredAt: dbUser.registeredAt || new Date().toLocaleDateString('vi-VN'),
      lastLoginAt: dbUser.lastLoginAt || new Date().toLocaleDateString('vi-VN'),
      onboardingCompleted: isNew ? false : (dbUser.onboardingCompleted ?? true),
      otpVerified: Boolean(profile.otpVerified || dbUser.otpVerified || existingDbUser?.otpVerified),
      otpVerifiedAt: dbUser.otpVerifiedAt || existingDbUser?.otpVerifiedAt || (profile.otpVerified ? new Date().toLocaleDateString('vi-VN') : undefined),
      ...(dbUser.passwordHash ? { passwordHash: dbUser.passwordHash } : {})
    };

    try {
      localStorage.setItem('mealwise_registered_user', JSON.stringify(newProfile));
    } catch {}

    if (!isAdmin) {
      recordTelemetryEvent('auth', isNew ? 'Đăng ký thành viên mới thành công' : 'Đăng nhập thành viên thành công', displayName);
    }
    setUser(newProfile);
    setIsWebGuestViewer(false);
    setIsAuthModalOpen(false);

    // If returning user has existing partition, restore their saved weekly plan, fridge, and onboarding preferences
    if (!isNew && dbUser.id) {
      const userPartition = loadUserPartition(dbUser.id);
      if (userPartition?.weeklyPlan && Array.isArray(userPartition.weeklyPlan) && userPartition.weeklyPlan.length > 0) {
        setWeeklyPlan(userPartition.weeklyPlan);
      }
      if (userPartition?.pantryItems && Array.isArray(userPartition.pantryItems) && userPartition.pantryItems.length > 0) {
        setPantryItems(userPartition.pantryItems);
      }
      if (userPartition?.onboardingData) {
        setOnboardingData(userPartition.onboardingData);
        if (userPartition.onboardingData.familySize) {
          setServings(userPartition.onboardingData.familySize);
        }
      }

      // Also pull latest account & partition from hosted server database for cross-device continuity
      void fetchAccountFromServer(rawEmail).then(remote => {
        if (remote.ok && remote.user) {
          setUser(prev => prev ? { ...prev, name: remote.user!.name || prev.name, registeredAt: remote.user!.registeredAt || prev.registeredAt } : prev);
          if (remote.partition?.weeklyPlan && Array.isArray(remote.partition.weeklyPlan) && remote.partition.weeklyPlan.length > 0) {
            setWeeklyPlan(remote.partition.weeklyPlan);
          }
          if (remote.partition?.pantryItems && Array.isArray(remote.partition.pantryItems) && remote.partition.pantryItems.length > 0) {
            setPantryItems(remote.partition.pantryItems);
          }
          if (remote.partition?.onboardingData) {
            setOnboardingData(remote.partition.onboardingData);
          }
        }
      });
    } else if (isNew) {
      void syncAccountPartitionWithServer(newProfile, {
        weeklyPlan: weeklyPlan as any,
        pantryItems,
        onboardingData,
        updatedAt: Date.now()
      });
    }

    if (isAdmin) {
      setActiveTab('admin');
      setShowOnboarding(false);
      showToast('🔐 Xin chào Quản Trị Viên! Đã kích hoạt Trung Tâm Dữ Liệu SteamDB Telemetry.');
      return true;
    }

    // Trigger onboarding ONLY on brand new registration! Returning logins are NEVER interrupted.
    if (needsOnboarding) {
      setOnboardingData(prev => ({ ...prev, completed: false }));
      try {
        localStorage.setItem(userOnboardingKey, 'false');
        if (emailLower) {
          localStorage.removeItem(`mealwise_tutorial_completed_${emailLower}`);
        }
        localStorage.removeItem('mealwise_tutorial_completed');
        const savedOnboarding = localStorage.getItem('mealwise_onboarding');
        const parsed = savedOnboarding ? JSON.parse(savedOnboarding) : INITIAL_ONBOARDING;
        parsed.completed = false;
        localStorage.setItem('mealwise_onboarding', JSON.stringify(parsed));
      } catch {}
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }

    if (migrated) {
      showToast(`🎉 Chào mừng ${displayName}! Đã giữ lại thực đơn tuần và tủ lạnh từ phiên dùng thử!`);
    } else {
      showToast(isNew ? `🎉 Chào mừng ${displayName} gia nhập Mealy!` : `👋 Xin chào mừng trở lại, ${displayName}!`);
    }
  }, [weeklyPlan, pantryItems, onboardingData, showToast]);

  // Background Auto-Sync to Hosted Server Database whenever logged-in user modifies meal plan, fridge, or onboarding
  useEffect(() => {
    if (!user?.email || !user?.isRegistered) return;
    const timer = setTimeout(() => {
      void syncAccountPartitionWithServer(user, {
        weeklyPlan: currentWeekPlan as any,
        pantryItems,
        onboardingData,
        updatedAt: Date.now()
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [user, currentWeekPlan, pantryItems, onboardingData]);

  const logoutUser = useCallback(() => {
    const actorName = user?.name || 'Người dùng';
    if (user?.id) {
      saveUserPartition(user.id, {
        weeklyPlan: weeklyPlan as any,
        pantryItems
      });
    }

    try {
      localStorage.removeItem('mealwise_registered_user');
      localStorage.removeItem('mealwise_collab_room');
      localStorage.removeItem('mealwise_collab_checked');
    } catch {}

    recordTelemetryEvent('auth', 'Đăng xuất tài khoản', actorName);
    setUser(null);
    setCollabRoom(null);
    setCollabCheckedMap({});
    setShowOnboarding(false);
    setOnboardingData(INITIAL_ONBOARDING);

    // Restore guest session and guest partition if available
    const guestData = loadGuestPartition();
    if (guestData?.weeklyPlan && Array.isArray(guestData.weeklyPlan) && guestData.weeklyPlan.length > 0) {
      setWeeklyPlan(guestData.weeklyPlan);
    }
    if (guestData?.pantryItems && Array.isArray(guestData.pantryItems) && guestData.pantryItems.length > 0) {
      setPantryItems(guestData.pantryItems);
    }

    setActiveTab('meal-sets');
    showToast('Đã đăng xuất tài khoản. Dữ liệu thành viên được lưu an toàn; chuyển về chế độ khách.');
  }, [user, weeklyPlan, pantryItems, showToast]);

  const deleteAccount = useCallback(() => {
    const emailLower = user?.email?.toLowerCase().trim() || '';
    if (user?.id) {
      deleteUserAccountFromDatabase(user.id);
    }
    try {
      localStorage.removeItem('mealwise_registered_user');
      localStorage.removeItem('mealwise_collab_room');
      localStorage.removeItem('mealwise_collab_checked');
      if (emailLower) {
        localStorage.removeItem(`mealwise_onboarding_completed_${emailLower}`);
        localStorage.removeItem(`mealwise_tutorial_completed_${emailLower}`);
        localStorage.removeItem(`mealwise_custom_recipes_${emailLower}`);
      }
    } catch {}

    setUser(null);
    setCollabRoom(null);
    setCollabCheckedMap({});
    setShowOnboarding(false);
    setOnboardingData(INITIAL_ONBOARDING);
    setCustomRecipes([]);
    setActiveTab('meal-sets');
    showToast('🗑️ Đã xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân trên thiết bị này.');
  }, [user, showToast]);


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

  // Effective onboarding data:
  // Unlocked for both Guests and Registered users so guest preferences from OnboardingModal work seamlessly.
  const effectiveOnboardingData = useMemo<OnboardingData>(() => {
    return {
      ...INITIAL_ONBOARDING,
      ...onboardingData,
      familySize: Number.isFinite(servings) && servings > 0 ? Math.min(20, Math.max(1, Math.round(servings))) : (onboardingData?.familySize || 4)
    };
  }, [onboardingData, servings]);

  const setShowOnboardingSafe = useCallback((show: boolean) => {
    setShowOnboarding(show);
  }, []);

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

  // Persistent grocery buyer counts (tracks multiple people buying the same item)
  const [groceryItemBuyerCounts, setGroceryItemBuyerCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('mealwise_grocery_buyer_counts');
      return saved ? JSON.parse(saved) : {};
    } catch {
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

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_grocery_buyer_counts', JSON.stringify(groceryItemBuyerCounts));
    } catch (e) {
      console.error('Failed to persist mealwise_grocery_buyer_counts to localStorage', e);
    }
  }, [groceryItemBuyerCounts]);

  const [isWeeklyShoppingCompleted, setIsWeeklyShoppingCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mealwise_weekly_shopping_completed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mealwise_weekly_shopping_completed', String(isWeeklyShoppingCompleted));
    } catch (e) {
      console.error('Failed to persist mealwise_weekly_shopping_completed', e);
    }
  }, [isWeeklyShoppingCompleted]);

  const toggleGroceryItemChecked = (key: string) => {
    setGroceryCheckedItems(prev => {
      const nextChecked = !prev[key];
      if (!nextChecked) {
        setGroceryItemBuyerCounts(b => {
          const next = { ...b };
          delete next[key];
          return next;
        });
      } else {
        setGroceryItemBuyerCounts(b => ({
          ...b,
          [key]: 1
        }));
      }
      return {
        ...prev,
        [key]: nextChecked
      };
    });
  };

  const incrementGroceryItemBuyer = (key: string) => {
    setGroceryCheckedItems(prev => ({
      ...prev,
      [key]: true
    }));
    setGroceryItemBuyerCounts(prev => {
      const current = prev[key] || 1;
      return {
        ...prev,
        [key]: current + 1
      };
    });
  };

  const decrementGroceryItemBuyer = (key: string) => {
    setGroceryItemBuyerCounts(prev => {
      const current = prev[key] || 1;
      if (current <= 1) {
        const next = { ...prev };
        delete next[key];
        setGroceryCheckedItems(c => {
          const updated = { ...c };
          delete updated[key];
          return updated;
        });
        return next;
      }
      return {
        ...prev,
        [key]: current - 1
      };
    });
  };

  const clearGroceryCheckedItems = () => {
    setGroceryCheckedItems({});
    setGroceryItemBuyerCounts({});
    try {
      localStorage.removeItem('mealwise_grocery_checked');
      localStorage.removeItem('mealwise_grocery_buyer_counts');
    } catch (e) {
      console.error('Failed to remove mealwise_grocery_checked from localStorage', e);
    }
  };

  // Real-time Collaborative Grocery Sharing State & Logic
  const [collabRoom, setCollabRoom] = useState<CollabRoom | null>(() => {
    try {
      const savedUser = localStorage.getItem('mealwise_registered_user');
      const hasUser = savedUser ? Boolean(JSON.parse(savedUser).isRegistered) : false;
      if (!hasUser) {
        return null;
      }
      const saved = localStorage.getItem('mealwise_collab_room');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && isRoomExpired(parsed)) {
          localStorage.removeItem('mealwise_collab_room');
          localStorage.removeItem('mealwise_collab_checked');
          return null;
        }
        return parsed;
      }
      return null;
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

  // Sync logged-in user display name to collaborative shopper profile
  useEffect(() => {
    if (user?.name && collabUser.name !== user.name) {
      updateCollabUserProfile(user.name);
    }
  }, [user?.name, collabUser.name, updateCollabUserProfile]);

  // Session Heartbeat for real concurrent active users telemetry
  useEffect(() => {
    const role = user?.role === 'admin' ? 'admin' : (user?.isRegistered ? 'user' : 'guest');
    const name = user?.name || collabUserName || 'Khách';
    heartbeatSession(name, role, activeTab);
    const interval = setInterval(() => {
      heartbeatSession(name, role, activeTab);
    }, 3500);
    const handleUnload = () => {
      removeCurrentSession();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, collabUserName, activeTab]);

  // User active screen time tracking engine
  useEffect(() => {
    const cleanup = initScreenTimeTracker();
    return cleanup;
  }, []);

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
      } else if (event.type === 'room_expired') {
        showToast('⚠️ Phòng đi chợ đã hết hạn (tối đa 1 giờ).');
        setCollabRoom(null);
        setCollabCheckedMap({});
        setCollabParticipants({});
        try {
          localStorage.removeItem('mealwise_collab_room');
          localStorage.removeItem('mealwise_collab_checked');
        } catch {}
      }
    });

    return () => {
      unsubscribe();
    };
  }, [collabRoom?.roomId, showToast]);

  // Check periodically for 1-hour room expiration
  useEffect(() => {
    if (!collabRoom) return;
    const interval = setInterval(() => {
      if (isRoomExpired(collabRoom)) {
        showToast('⚠️ Phòng đi chợ đã hết hạn sau 1 giờ.');
        setCollabRoom(null);
        setCollabCheckedMap({});
        setCollabParticipants({});
        try {
          localStorage.removeItem('mealwise_collab_room');
          localStorage.removeItem('mealwise_collab_checked');
        } catch {}
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [collabRoom, showToast]);

  // Start a new collaborative room (unlocked for both guests and registered members)
  const startCollabRoom = useCallback(async (items: CollabCartItem[], title?: string): Promise<string> => {
    const roomId = generateCollabRoomId();
    const initialChecked: Record<string, CollabCheckState> = {};

    // Ensure creator is marked as host with host styling
    const hostName = user?.name || collabUser.name || 'Bạn (Chủ phòng)';
    const hostProfile: CollabShopper = {
      ...collabUser,
      name: hostName,
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

    const now = Date.now();
    const newRoom: CollabRoom = {
      roomId,
      title: title || `Giỏ Đi Chợ Tuần (${items.length} món)`,
      hostName: hostProfile.name,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + ROOM_TTL_MS,
      ttlMs: ROOM_TTL_MS,
      items,
      checkedMap: initialChecked,
      participants: initialParticipants
    };

    const synced = await createOrSyncCollabRoom(newRoom);
    setCollabRoom(synced);
    setCollabCheckedMap(synced.checkedMap || initialChecked);
    setCollabParticipants(synced.participants || initialParticipants);
    setIsShareModalOpen(true);
    recordTelemetryEvent('collab', `Tạo phòng mua chung #${roomId} (${items.length} món)`, hostProfile.name);
    showToast(`🎉 Đã tạo phòng mua chung #${roomId}!`);
    return roomId;
  }, [isRegistered, openAuthModal, user?.name, collabUser, groceryCheckedItems, showToast]);

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
    if (room && isRoomExpired(room)) {
      showToast('⚠️ Phòng đi chợ này đã hết hạn sau 1 giờ. Vui lòng tạo phòng mới.');
      return false;
    }

    if (!room && initialPayload && initialPayload.items && initialPayload.items.length > 0) {
      if (initialPayload.expiresAt && Date.now() > initialPayload.expiresAt) {
        showToast('⚠️ Phòng đi chợ này đã hết hạn sau 1 giờ. Vui lòng tạo phòng mới.');
        return false;
      }
      const now = Date.now();
      const fallbackRoom: CollabRoom = {
        roomId,
        title: initialPayload.title || 'Giỏ Đi Chợ Tuần',
        hostName: initialPayload.hostName || 'Chủ phòng',
        createdAt: initialPayload.createdAt || now,
        updatedAt: now,
        expiresAt: initialPayload.expiresAt || (now + ROOM_TTL_MS),
        ttlMs: ROOM_TTL_MS,
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
      // Strictly isolated: Do NOT merge room.checkedMap into personal groceryCheckedItems
      // so the joining user's personal grocery check-off state is 100% preserved.
      registerParticipantOnServer(roomId, currentShopper);
      recordTelemetryEvent('collab', `Tham gia phòng mua chung #${roomId}`, currentShopper.name);
      return true;
    }
    return false;
  }, [collabUser]);

  // Leave collaborative room
  const leaveCollabRoom = useCallback(() => {
    const actorName = collabUser.name || 'Người dùng';
    setCollabRoom(null);
    setCollabCheckedMap({});
    setCollabParticipants({});
    try {
      localStorage.removeItem('mealwise_collab_room');
      localStorage.removeItem('mealwise_collab_checked');
    } catch {}
    recordTelemetryEvent('collab', 'Rời phòng mua chung', actorName);
    showToast('👋 Đã rời phòng mua chung.');
  }, [collabUser, showToast]);

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
      checkedAt: Date.now(),
      buyerCount: nextChecked ? 1 : 0
    };

    setCollabCheckedMap(prev => ({
      ...prev,
      [itemId]: newState
    }));

    broadcastLocalCollabUpdate(collabRoom.roomId, {
      type: 'toggle',
      roomId: collabRoom.roomId,
      itemId,
      state: newState
    });

    const targetItem = collabRoom.items.find(i => i.id === itemId);
    const itemLabel = targetItem ? targetItem.name : itemId;
    recordTelemetryEvent(
      'collab', 
      `${nextChecked ? 'Đã nhặt' : 'Bỏ chọn'}: "${itemLabel}" (#${collabRoom.roomId})`, 
      collabUser.name
    );

    toggleCollabItemOnServer(
      collabRoom.roomId, 
      itemId, 
      nextChecked, 
      collabUser.name, 
      collabUser.id, 
      collabUser.color
    );
  }, [collabRoom?.roomId, collabCheckedMap, collabUser]);

  // Increment buyer count for collaborative room item
  const incrementCollabItemBuyer = useCallback((itemId: string) => {
    if (!collabRoom?.roomId) {
      incrementGroceryItemBuyer(itemId);
      return;
    }

    const current = collabCheckedMap[itemId];
    const currentCount = current?.buyerCount || (current?.checked ? 1 : 0);
    const nextCount = currentCount + 1;

    const newState: CollabCheckState = {
      checked: true,
      checkedBy: current?.checkedBy || collabUser.name,
      checkedById: current?.checkedById || collabUser.id,
      checkedByColor: current?.checkedByColor || collabUser.color,
      checkedAt: Date.now(),
      buyerCount: nextCount
    };

    setCollabCheckedMap(prev => ({
      ...prev,
      [itemId]: newState
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
      true, 
      collabUser.name, 
      collabUser.id, 
      collabUser.color
    );
  }, [collabRoom?.roomId, collabCheckedMap, collabUser]);

  // Decrement buyer count for collaborative room item
  const decrementCollabItemBuyer = useCallback((itemId: string) => {
    if (!collabRoom?.roomId) {
      decrementGroceryItemBuyer(itemId);
      return;
    }

    const current = collabCheckedMap[itemId];
    const currentCount = current?.buyerCount || 1;
    if (currentCount <= 1) {
      toggleCollabChecked(itemId);
      return;
    }

    const nextCount = currentCount - 1;
    const newState: CollabCheckState = {
      ...current,
      checked: true,
      buyerCount: nextCount
    };

    setCollabCheckedMap(prev => ({
      ...prev,
      [itemId]: newState
    }));

    broadcastLocalCollabUpdate(collabRoom.roomId, {
      type: 'toggle',
      roomId: collabRoom.roomId,
      itemId,
      state: newState
    });
  }, [collabRoom?.roomId, collabCheckedMap, toggleCollabChecked]);

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

  const completeOnboarding = (data: Partial<OnboardingData>, options?: { regeneratePlan?: boolean }) => {
    let emailLower = user?.email?.toLowerCase().trim();
    if (!emailLower) {
      const savedUserStr = localStorage.getItem('mealwise_registered_user');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          emailLower = parsed.email?.toLowerCase().trim();
        } catch {}
      }
    }
    const userOnboardingKey = emailLower ? `mealwise_onboarding_completed_${emailLower}` : null;
    const isAlreadyOnboarded = Boolean(
      onboardingData?.completed ||
      user?.onboardingCompleted ||
      (userOnboardingKey
        ? localStorage.getItem(userOnboardingKey) === 'true'
        : localStorage.getItem('mealwise_onboarding_completed_guest') === 'true')
    );
    const isFirstTimeOnboarding = !isAlreadyOnboarded;

    const updated: OnboardingData = { ...onboardingData, ...data, completed: true };
    setOnboardingData(updated);
    if (updated.familySize && updated.familySize > 0) {
      setServings(updated.familySize);
    }
    try {
      localStorage.setItem('mealwise_onboarding', JSON.stringify(updated));
      localStorage.setItem('mealwise_onboarding_completed_guest', 'true');
    } catch (e) {
      console.error('Failed to save onboardingData to localStorage', e);
    }

    // Persist per-user or guest onboarding completed flag
    if (user?.email) {
      try {
        localStorage.setItem(`mealwise_onboarding_completed_${emailLower}`, 'true');
      } catch {}
      setUser(prev => prev ? { ...prev, onboardingCompleted: true } : prev);
      try {
        const savedUser = localStorage.getItem('mealwise_registered_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.onboardingCompleted = true;
          localStorage.setItem('mealwise_registered_user', JSON.stringify(parsed));
        }
      } catch {}

      if (user.id) {
        saveUserPartition(user.id, {
          onboardingData: updated,
          updatedAt: Date.now()
        });
        registerUserInDatabase(
          { name: user.name, email: user.email, role: user.role },
          { onboardingCompleted: true }
        );
      }
    } else {
      saveGuestPartition({
        onboardingData: updated,
        updatedAt: Date.now()
      });
    }

    setShowOnboarding(false);

    const isSkipRoutine = updated.weekdayLunchRoutine === 'ban-tru-di-lam' || updated.weekdayLunchRoutine === 'hop-com-van-phong';
    const noteText = updated.weekdayLunchRoutine === 'hop-com-van-phong' ? 'Mang cơm hộp văn phòng' : 'Con học bán trú • Bố mẹ ăn ngoài';
    const hasCurrentMeals = hasAnyMealsInPlan(weeklyPlan);

    // Keep weekly plan blank on first download until user clicks "Gợi ý";
    // only auto-regenerate if the user already had meals and explicitly opted to regenerate
    if (hasCurrentMeals && options?.regeneratePlan !== false) {
      autoFillWeeklyMenu(updated, { seed: Date.now() });
    } else if (hasCurrentMeals && isSkipRoutine) {
      // User kept their existing plan, but chose a lunch-skip routine:
      // Update weekday lunches to reflect the chosen routine immediately
      setWeeklyPlan(prev => {
        const nextPlan = prev.map(day => {
          const isWkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day.dayId);
          if (isWkday) {
            return {
              ...day,
              meals: { ...day.meals, lunch: null },
              skippedSlots: { ...day.skippedSlots, lunch: true },
              slotNotes: { ...day.slotNotes, lunch: noteText }
            };
          }
          return day;
        });
        try {
          localStorage.setItem('mealwise_weekly_plan', JSON.stringify(nextPlan));
        } catch {}
        return nextPlan;
      });
    }

    // Switch to weekly tab so user immediately sees their tailored plan
    setActiveTab('weekly');

    // Automatically begin interactive tutorial ONLY for newly registered users on initial onboarding!
    // When existing users change/update their configuration, the tutorial must NEVER trigger.
    if (isFirstTimeOnboarding) {
      try {
        const userTutorialKey = emailLower ? `mealwise_tutorial_completed_${emailLower}` : null;
        const isUserTutorialDone = userTutorialKey
          ? localStorage.getItem(userTutorialKey) === 'true'
          : (localStorage.getItem('mealwise_tutorial_completed') === 'true');

        if (!isUserTutorialDone) {
          setTimeout(() => {
            setIsTutorialOpen(true);
          }, 500);
        }
      } catch {}
    }
  };

  const resetOnboarding = () => {
    // Re-open onboarding for both Guest and Registered users to review/adjust preferences.
    setShowOnboarding(true);
    showToast('🔄 Đang mở lại khảo sát khẩu vị & mục tiêu!');
  };

  const swapDishInMealSet = useCallback((
    mealSet: VietnameseMealSet,
    dishType: 'mainDish' | 'soupDish' | 'sideDish',
    replacementRecipeId?: string,
    maxAllowedCostVnd?: number
  ): VietnameseMealSet => {
    const isVegetarian = mealSet.region === 'chay' || 
      (mealSet.tags && mealSet.tags.some(t => /chay|thanh tịnh/i.test(t))) ||
      mealSet[dishType]?.category === 'mon-chay';

    const categoryMap: Record<'mainDish' | 'soupDish' | 'sideDish', string> = {
      mainDish: 'mon-man',
      soupDish: 'mon-canh',
      sideDish: 'mon-rau'
    };
    const targetCategory = categoryMap[dishType];

    let candidateRecipes: Recipe[] = [];

    if (replacementRecipeId) {
      const found = recipes.find(r => r.id === replacementRecipeId);
      if (found) {
        candidateRecipes = [found];
      }
    }

    if (candidateRecipes.length === 0) {
      if (isVegetarian) {
        const isVegRecipe = (r: Recipe) =>
          (r.category === 'mon-chay' || (r.tags && r.tags.some(t => /chay|thanh tịnh/i.test(t))) || r.category === 'mon-rau') &&
          !(r.ingredients && r.ingredients.some(i => i.category === 'thit-ca'));

        candidateRecipes = recipes.filter(r => {
          if (!isVegRecipe(r)) return false;
          if (
            r.id === mealSet[dishType]?.id ||
            r.id === mealSet.mainDish?.id ||
            r.id === mealSet.soupDish?.id ||
            r.id === mealSet.sideDish?.id
          ) {
            return false;
          }
          if (dishType === 'soupDish') {
            return /canh|súp|soup|riêu/i.test(r.title) || r.category === 'mon-canh';
          }
          if (dishType === 'sideDish') {
            return r.category === 'mon-rau' || /rau|luộc|xào|nộm|gỏi|củ/i.test(r.title);
          }
          return !/canh|súp|soup/i.test(r.title);
        });
        if (candidateRecipes.length === 0) {
          candidateRecipes = recipes.filter(r => isVegRecipe(r) && r.id !== mealSet[dishType]?.id);
        }
      } else {
        candidateRecipes = recipes.filter(r => 
          r.category === targetCategory &&
          r.id !== mealSet[dishType]?.id &&
          r.id !== mealSet.mainDish?.id &&
          r.id !== mealSet.soupDish?.id &&
          r.id !== mealSet.sideDish?.id
        );
      }
    }

    if (candidateRecipes.length === 0) {
      candidateRecipes = recipes.filter(r => r.category === targetCategory && r.id !== mealSet[dishType]?.id);
    }

    // Filter out combo sets, hotpots, and banquet feasts from individual meal set dish slots
    const isSingleDish = (r: Recipe) => !r.title.startsWith('Mâm Cơm') && !r.id.startsWith('mam-com') && !isHotpotOrFeast(r);
    const isAppropriateForSlot = (r: Recipe) => {
      // Hotpot / party feast is NEVER allowed in a meal set
      if (isHotpotOrFeast(r)) return false;
      if (dishType === 'soupDish') {
        const hasSoupKeyword = /canh|súp|soup|riêu/i.test(r.title);
        const hasDryKeyword = /chiên|nướng|kho|rang|xào lăn|bít tết|steak|lẩu|hotpot/i.test(r.title);
        if (hasDryKeyword && !hasSoupKeyword) return false;
      }
      return true;
    };

    const refinedCandidates = candidateRecipes.filter(r => isSingleDish(r) && isAppropriateForSlot(r));
    if (refinedCandidates.length > 0) {
      candidateRecipes = refinedCandidates;
    }

    if (candidateRecipes.length === 0) {
      candidateRecipes = recipes.filter(r => r.id !== mealSet[dishType]?.id && !isHotpotOrFeast(r) && isSingleDish(r));
    }

    // Strict Budget Invariant: Guarantee replacement dish stays within remaining room
    if (maxAllowedCostVnd !== undefined) {
      const budgetFitting = maxAllowedCostVnd > 0 
        ? candidateRecipes.filter(r => (r.estimatedCostVnd || 35000) <= maxAllowedCostVnd)
        : [];
      if (budgetFitting.length > 0) {
        candidateRecipes = budgetFitting;
      } else {
        // Fallback to lowest-cost dishes if remaining budget is extremely tight or exceeded
        candidateRecipes = [...candidateRecipes].sort((a, b) => (a.estimatedCostVnd || 0) - (b.estimatedCostVnd || 0)).slice(0, 5);
      }
    }

    const chosenRecipe = candidateRecipes[Math.floor(Math.random() * candidateRecipes.length)] || mealSet[dishType];

    const newMain = dishType === 'mainDish' ? chosenRecipe : mealSet.mainDish;
    const newSoup = dishType === 'soupDish' ? chosenRecipe : mealSet.soupDish;
    const newSide = dishType === 'sideDish' ? chosenRecipe : mealSet.sideDish;

    const newTotalCost = (newMain?.estimatedCostVnd || 0) + (newSoup?.estimatedCostVnd || 0) + (newSide?.estimatedCostVnd || 0);
    const newTotalCalories = (newMain?.calories || 400) + (newSoup?.calories || 150) + (newSide?.calories || 100);

    const updatedMealSet: VietnameseMealSet = {
      ...mealSet,
      [dishType]: chosenRecipe,
      imageUrl: dishType === 'mainDish' && chosenRecipe?.imageUrl ? chosenRecipe.imageUrl : mealSet.imageUrl,
      totalCostVnd: newTotalCost,
      totalCalories: newTotalCalories,
    };

    setMealSets(prev => prev.map(ms => (ms.id === updatedMealSet.id ? updatedMealSet : ms)));

    return updatedMealSet;
  }, [recipes]);

  const swapDishInWeeklySlot = useCallback((
    dayId: string, 
    slot: MealSlot, 
    dishType: 'mainDish' | 'soupDish' | 'sideDish'
  ) => {
    let newChosenTitle = '';
    let updatedSet: VietnameseMealSet | null = null;

    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayId !== dayId) return day;
      const currentMeal = day.meals[slot];
      if (!currentMeal || !isMealSet(currentMeal)) return day;

      // Calculate budget room for this day
      const safeServings = Number.isFinite(servings) && servings > 0 ? Math.min(20, Math.max(1, Math.round(servings))) : 4;
      const currentBudgetLevel = onboardingData?.budgetLevel || 'vua-phai';
      const dailyBudgetTarget = getDailyBudgetTarget(currentBudgetLevel, safeServings, onboardingData?.specialNeeds);
      
      let otherSlotsScaledCost = 0;
      (Object.keys(day.meals) as MealSlot[]).forEach(s => {
        if (s === slot) return;
        const m = day.meals[s];
        const isUserSkipLunch = onboardingData?.weekdayLunchRoutine === 'ban-tru-di-lam' || onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong';
        const isBantruLunch = s === 'lunch' && Boolean(day.skippedSlots?.lunch ?? (isUserSkipLunch && ['mon','tue','wed','thu','fri'].includes(day.dayId)));
        if (m && !day.skippedSlots?.[s] && !isBantruLunch) {
          if (isMealSet(m)) otherSlotsScaledCost += scaleCost(m.totalCostVnd, safeServings);
          else otherSlotsScaledCost += scaleCost(m.estimatedCostVnd || 35000, safeServings);
        }
      });

      const otherDish1 = dishType === 'mainDish' ? currentMeal.soupDish : currentMeal.mainDish;
      const otherDish2 = dishType === 'sideDish' ? currentMeal.soupDish : currentMeal.sideDish;
      const otherTwoDishesUnscaled = (otherDish1?.estimatedCostVnd || 0) + (otherDish2?.estimatedCostVnd || 0);
      const otherTwoDishesScaled = scaleCost(otherTwoDishesUnscaled, safeServings);

      const remainingScaled = Math.max(0, dailyBudgetTarget - (otherSlotsScaledCost + otherTwoDishesScaled));
      const scale = safeServings / 4;
      const maxAllowedDishCostUnscaled = Math.floor(remainingScaled / scale);

      const updated = swapDishInMealSet(currentMeal, dishType, undefined, maxAllowedDishCostUnscaled);
      updatedSet = updated;
      newChosenTitle = updated[dishType]?.title || '';
      return {
        ...day,
        meals: {
          ...day.meals,
          [slot]: updated
        }
      };
    }));

    if (updatedSet && selectedMealSet && isMealSet(selectedMealSet) && selectedMealSet.id === (updatedSet as VietnameseMealSet).id) {
      setSelectedMealSet(updatedSet);
    }

    const slotLabel = slot === 'breakfast' ? 'Bữa Sáng' : slot === 'lunch' ? 'Bữa Trưa' : slot === 'dinner' ? 'Bữa Tối' : 'Xế';
    const dishLabel = dishType === 'mainDish' ? 'món mặn' : dishType === 'soupDish' ? 'món canh' : 'món rau';
    if (newChosenTitle) {
      recordTelemetryEvent('weekly', `Đổi ${dishLabel} sang "${newChosenTitle}" (${slotLabel})`, user?.name || 'Người dùng');
      showToast(`🔄 Đã đổi ${dishLabel} sang "${newChosenTitle}" (${slotLabel}) chuẩn ngân sách!`);
    }
  }, [user, swapDishInMealSet, selectedMealSet, showToast, servings, onboardingData]);

  const addMealSetToSlot = (dayId: string, slot: MealSlot, mealSetIdOrObj: string | VietnameseMealSet) => {
    let targetSet: VietnameseMealSet | undefined;
    if (typeof mealSetIdOrObj === 'string') {
      targetSet = mealSets.find(m => m.id === mealSetIdOrObj);
    } else {
      targetSet = mealSetIdOrObj;
    }
    if (!targetSet) return;

    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayId === dayId) {
        return {
          ...day,
          meals: {
            ...day.meals,
            [slot]: targetSet
          },
          skippedSlots: day.skippedSlots ? { ...day.skippedSlots, [slot]: false } : undefined,
          slotNotes: day.slotNotes ? { ...day.slotNotes, [slot]: undefined } : undefined
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
          },
          skippedSlots: day.skippedSlots ? { ...day.skippedSlots, [slot]: false } : undefined,
          slotNotes: day.slotNotes ? { ...day.slotNotes, [slot]: undefined } : undefined
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

  const toggleSkipSlot = (dayId: string, slot: MealSlot, customNote?: string) => {
    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayId !== dayId) return day;
      const isCurrentlySkipped = Boolean(day.skippedSlots?.[slot]);
      if (isCurrentlySkipped) {
        // Re-enable cooking for this slot
        const updatedSkipped = { ...day.skippedSlots, [slot]: false };
        const updatedNotes = { ...day.slotNotes, [slot]: undefined };
        const isSingleDish = servings === 1 && onboardingData?.singleMealFormat !== 'meal-set';
        let suggestedMeal: Recipe | VietnameseMealSet | null = null;
        if (slot === 'breakfast') {
          const bfastPool = recipes.filter(r => r.category === 'an-sang');
          suggestedMeal = bfastPool[Math.floor(Math.random() * bfastPool.length)] || recipes[0];
        } else if (isSingleDish) {
          const eligibleRecipes = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng' && !isHotpotOrFeast(r));
          suggestedMeal = eligibleRecipes[Math.floor(Math.random() * eligibleRecipes.length)] || recipes[0];
        } else {
          const eligibleSets = mealSets.filter(s => !isHotpotOrFeast(s.mainDish) && !isHotpotOrFeast(s.soupDish) && !isHotpotOrFeast(s.sideDish));
          suggestedMeal = eligibleSets[Math.floor(Math.random() * eligibleSets.length)] || mealSets[0];
        }
        return {
          ...day,
          meals: {
            ...day.meals,
            [slot]: suggestedMeal
          },
          skippedSlots: updatedSkipped,
          slotNotes: updatedNotes
        };
      } else {
        // Mark as skipped / bán trú
        const updatedSkipped = { ...day.skippedSlots, [slot]: true };
        const updatedNotes = { ...day.slotNotes, [slot]: customNote || 'Con học bán trú • Bố mẹ ăn ngoài' };
        return {
          ...day,
          meals: {
            ...day.meals,
            [slot]: null
          },
          skippedSlots: updatedSkipped,
          slotNotes: updatedNotes
        };
      }
    }));
    showToast('🔄 Đã cập nhật lịch nấu bữa này.');
  };

  const autoFillWeeklyMenu = (
    customPreferences?: OnboardingData,
    options?: { seed?: number; cycleIndex?: number; preserveWeekend?: boolean }
  ) => {
    // Save snapshot of current plan before overwriting (for 1-tap undo & weekend recipe viewing)
    savePlanSnapshot(weeklyPlan);

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
      weekdayLunchRoutine: prefs.weekdayLunchRoutine,
      seed: dynamicSeed,
      variationIndex: nextCount,
      previousPlanSlotIds
    });

    let suggestedPlan: DailyMealPlan[] = generatedDays.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: {
        breakfast: d.meals.breakfast,
        lunch: d.meals.lunch,
        dinner: d.meals.dinner
      },
      skippedSlots: d.skippedSlots,
      slotNotes: d.slotNotes,
      totalCost: d.unscaledDayCost
    }));

    // Weave user's own custom recipes ("Món Của Tôi" / saved community chef dishes) into the 7-day schedule
    if (customRecipes.length > 0 && suggestedPlan.length > 0) {
      const maxCustomToInject = Math.min(2, customRecipes.length);
      for (let i = 0; i < maxCustomToInject; i++) {
        const customDish = customRecipes[(nextCount + i) % customRecipes.length];
        const targetDayIdx = ((nextCount * 2) + i * 3) % suggestedPlan.length;
        const dayObj = suggestedPlan[targetDayIdx];
        if (!dayObj) continue;

        if (customDish.category === 'an-sang' && !dayObj.skippedSlots?.breakfast) {
          dayObj.meals.breakfast = {
            id: `custom-set-${customDish.id}`,
            title: customDish.title,
            description: customDish.authorNote || customDish.description || 'Món ngon từ Sổ Bếp Gia Đình',
            region: customDish.region || 'toan-quoc',
            totalCost: customDish.estimatedCostVnd || 45000,
            totalCalories: customDish.calories || 420,
            prepTimeMinutes: (customDish.prepTimeMinutes || 10) + (customDish.cookTimeMinutes || 20),
            servings: safeServings,
            tags: ['Món Bếp Nhà ⭐️', ...(customDish.tags || [])],
            imageUrl: customDish.imageUrl,
            dishes: { main: customDish }
          };
        } else {
          const targetSlotKey: 'dinner' | 'lunch' = !dayObj.skippedSlots?.dinner ? 'dinner' : 'lunch';
          const existingMeal = dayObj.meals[targetSlotKey];
          if (existingMeal) {
            const updatedDishes = { ...existingMeal.dishes };
            if (customDish.category === 'mon-canh') {
              updatedDishes.soup = customDish;
            } else if (customDish.category === 'mon-rau') {
              updatedDishes.veggie = customDish;
            } else {
              updatedDishes.main = customDish;
            }
            const newDishesArr = [updatedDishes.main, updatedDishes.soup, updatedDishes.veggie].filter(Boolean) as Recipe[];
            const recomputedCost = newDishesArr.reduce((sum, r) => sum + (r.estimatedCostVnd || 45000), 0);
            const recomputedCal = newDishesArr.reduce((sum, r) => sum + (r.calories || 350), 0);
            dayObj.meals[targetSlotKey] = {
              ...existingMeal,
              title: updatedDishes.main ? `Mâm Cơm Bếp Nhà: ${updatedDishes.main.title}` : existingMeal.title,
              totalCost: recomputedCost,
              totalCalories: recomputedCal,
              imageUrl: customDish.imageUrl || existingMeal.imageUrl,
              tags: Array.from(new Set(['Món Bếp Nhà ⭐️', ...(existingMeal.tags || [])])),
              dishes: updatedDishes
            };
          }
        }
      }
    }

    // If preserveWeekend is enabled, keep existing Saturday ('sat') and Sunday ('sun') meals untouched
    if (options?.preserveWeekend && Array.isArray(weeklyPlan)) {
      const existingSat = weeklyPlan.find(d => d.dayId === 'sat');
      const existingSun = weeklyPlan.find(d => d.dayId === 'sun');
      suggestedPlan = suggestedPlan.map(d => {
        if (d.dayId === 'sat' && existingSat && (existingSat.meals.breakfast || existingSat.meals.lunch || existingSat.meals.dinner)) {
          return JSON.parse(JSON.stringify(existingSat));
        }
        if (d.dayId === 'sun' && existingSun && (existingSun.meals.breakfast || existingSun.meals.lunch || existingSun.meals.dinner)) {
          return JSON.parse(JSON.stringify(existingSun));
        }
        return d;
      });
    }

    setWeeklyPlan(suggestedPlan);
    setIsWeeklyShoppingCompleted(false);
    try {
      const storageKey = activePlanScope === 'next' ? 'mealwise_next_weekly_plan' : 'mealwise_weekly_plan';
      localStorage.setItem(storageKey, JSON.stringify(suggestedPlan));
      localStorage.removeItem('mealwise_weekly_shopping_completed');
      localStorage.removeItem('mealwise_deleted_grocery_items');
    } catch (e) {
      console.error('Failed to save autoFill weekly plan to localStorage', e);
    }

    const isGym = specialNeeds.includes('gym-protein');
    const isEatClean = specialNeeds.includes('eat-clean');
    const isChay = specialNeeds.includes('chay');

    if (options?.preserveWeekend) {
      showToast('📌 Đã đổi mới Thứ 2 → Thứ 6 và giữ nguyên thực đơn Thứ 7 & Chủ Nhật!');
    } else if (isGym) {
      showToast(`🏋️ Đã tạo thực đơn 7 ngày Giàu Đạm chuẩn Gym cho ${safeServings} người (chuẩn ngân sách)!`);
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
    savePlanSnapshot(weeklyPlan);
    const emptyPlan = INITIAL_DAYS.map(d => ({
      dayId: d.dayId,
      dayName: d.dayName,
      meals: { breakfast: null, lunch: null, dinner: null }
    }));
    setWeeklyPlan(emptyPlan);
    setIsWeeklyShoppingCompleted(false);
    try {
      const storageKey = activePlanScope === 'next' ? 'mealwise_next_weekly_plan' : 'mealwise_weekly_plan';
      localStorage.setItem(storageKey, JSON.stringify(emptyPlan));
      localStorage.removeItem('mealwise_weekly_shopping_completed');
      localStorage.removeItem('mealwise_deleted_grocery_items');
    } catch (e) {
      console.error('Failed to clear mealwise_weekly_plan in localStorage', e);
    }
    showToast('🧹 Đã xóa thực đơn (Đã lưu bản sao trong Thực Đơn Cũ để xem lại bất kỳ lúc nào).');
  };

  const resetWeeklyMenu = () => {
    savePlanSnapshot(weeklyPlan);
    const defaults = buildDefaultWeeklyPlan();
    setWeeklyPlan(defaults);
    setIsWeeklyShoppingCompleted(false);
    try {
      const storageKey = activePlanScope === 'next' ? 'mealwise_next_weekly_plan' : 'mealwise_weekly_plan';
      localStorage.setItem(storageKey, JSON.stringify(defaults));
      localStorage.removeItem('mealwise_weekly_shopping_completed');
      localStorage.removeItem('mealwise_deleted_grocery_items');
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
    const specialNeeds = onboardingData?.specialNeeds || [];
    const dailyBudgetTarget = getDailyBudgetTarget(currentBudgetLevel, safeServings, specialNeeds);
    const budgetCeiling = dailyBudgetTarget;
    const isChay = specialNeeds.includes('chay');
    const isNoSpicy = specialNeeds.includes('it-cay');
    const isWestern = specialNeeds.includes('western-food');
    const isGym = specialNeeds.includes('gym-protein');
    const isSingle = safeServings === 1;
    const isSingleDish = isSingle && onboardingData?.singleMealFormat !== 'meal-set';

    const isWkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayId);
    const isUserBantru = onboardingData?.weekdayLunchRoutine === 'ban-tru-di-lam' || onboardingData?.weekdayLunchRoutine === 'hop-com-van-phong';
    const isLunchSkipped = Boolean(targetDay.skippedSlots?.lunch) || (isUserBantru && isWkday && !targetDay.meals.lunch);

    // Current meal IDs on this day to avoid repeating the exact same dishes
    const currentMealIds = new Set<string>();
    Object.values(targetDay.meals).forEach(m => {
      if (m && m.id) currentMealIds.add(m.id);
    });

    // Tier-aware breakfast budget ceiling: Tiết kiệm <= 25%, Vừa phải <= 32%, Thoải mái <= 38%
    const bfastCapRatio = currentBudgetLevel === 'tiet-kiem' ? 0.25 : currentBudgetLevel === 'vua-phai' ? 0.32 : 0.38;
    const maxBfastCost = Math.floor(dailyBudgetTarget * bfastCapRatio);

    // 1. Gather recipe IDs and meal set IDs used on OTHER 6 days
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

    // Helper to shuffle an array
    function shuffle<T>(array: T[]): T[] {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

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

      if (isWestern) {
        const westernBfast = rawBfastPool.filter(r => /pancake|sandwich|omelette|bơ tỏi|trứng khuấy|french toast|avocado|yến mạch/i.test(r.title) || (r.tags || []).some(t => /món âu|western/i.test(t)));
        if (westernBfast.length > 0) rawBfastPool = westernBfast;
      }
      if (isGym) {
        const gymBfast = rawBfastPool.filter(r =>
          /trứng|bò|thịt|ức gà|cá|hải sản|phô mai|omelet|chả|pate|bít tết|steak|phở bò|bún bò|hủ tiếu/i.test(r.title) ||
          (r.tags || []).some(t => /đạm|protein|gym|thịt|bò|gà|trứng/i.test(t)) ||
          (r.ingredients && r.ingredients.some(i => i.category === 'thit-ca'))
        );
        if (gymBfast.length > 0) rawBfastPool = gymBfast;
      }

      let affordableBfast = rawBfastPool.filter(r => scaleCost(r.estimatedCostVnd || 25000, safeServings) <= maxBfastCost);
      if (affordableBfast.length === 0) {
        affordableBfast = [...rawBfastPool].sort((a, b) =>
          scaleCost(a.estimatedCostVnd || 25000, safeServings) - scaleCost(b.estimatedCostVnd || 25000, safeServings)
        ).slice(0, 5);
      }

      // Prioritize breakfasts not on current day and not used on other days
      const freshBfast = affordableBfast.filter(b => !currentMealIds.has(b.id) && !usedRecipeIds.has(b.id));
      const backupBfast = affordableBfast.filter(b => !currentMealIds.has(b.id));
      const bfastCandidatePool = freshBfast.length > 0 ? freshBfast : backupBfast.length > 0 ? backupBfast : affordableBfast;
      const shuffledBfast = shuffle(bfastCandidatePool);
      const chosenBreakfast = shuffledBfast[0] || affordableBfast[0];
      const bfastCost = scaleCost(chosenBreakfast.estimatedCostVnd || 25000, safeServings);
      const remBudget = budgetCeiling - bfastCost;

      let singleDishPool = recipes.filter(r => isSubstantialMainMeal(r, isChay, isNoSpicy));
      if (singleDishPool.length < 14) {
        singleDishPool = recipes.filter(r => r.category !== 'an-sang' && r.category !== 'trang-mieng' && !r.id.startsWith('che-') && !r.id.startsWith('snack-'));
      }
      if (isWestern) {
        const westernMains = singleDishPool.filter(r => /bít tết|steak|mì ý|pasta|salad|áp chảo|súp kem|khoai tây|burger|gà rán|sườn que|sườn nướng|carbonara|bolognese|curry|aglio e olio|bourguignon|parmigiana/i.test(r.title) || (r.tags || []).some(t => /món âu|western/i.test(t)));
        if (westernMains.length >= 2) singleDishPool = westernMains;
      }
      if (isGym) {
        const gymMains = singleDishPool.filter(r =>
          /bít tết|steak|bò|thịt|ức gà|gà|cá|tôm|mực|hải sản|sườn|trứng|đậu hũ/i.test(r.title) ||
          (r.tags || []).some(t => /giàu đạm|tập gym|protein/i.test(t)) ||
          (r.ingredients && r.ingredients.some(i => i.category === 'thit-ca'))
        );
        if (gymMains.length >= 2) singleDishPool = gymMains;
      }

      let chosenLunch: Recipe | null = null;
      let chosenDinner: Recipe | null = null;
      let chosenCost = bfastCost;

      if (isLunchSkipped) {
        // Lunch is bán trú • Only dinner is cooked
        const dinnerCandidates = singleDishPool.filter(r => r.id !== chosenBreakfast.id && !currentMealIds.has(r.id) && !usedRecipeIds.has(r.id));
        const pool = dinnerCandidates.length > 0 ? dinnerCandidates : singleDishPool.filter(r => r.id !== chosenBreakfast.id);
        const affordableDinner = pool.filter(r => scaleCost(r.estimatedCostVnd || 35000, safeServings) <= remBudget);
        const dinnerPool = affordableDinner.length > 0 ? affordableDinner : pool;
        chosenDinner = shuffle(dinnerPool)[0] || singleDishPool[0];
        chosenLunch = null;
        chosenCost += scaleCost(chosenDinner.estimatedCostVnd || 35000, safeServings);
      } else {
        // Both lunch & dinner
        const candidateMains = singleDishPool.filter(r => r.id !== chosenBreakfast.id);
        const freshMains = candidateMains.filter(r => !currentMealIds.has(r.id) && !usedRecipeIds.has(r.id));
        const pool = freshMains.length >= 4 ? freshMains : candidateMains.filter(r => !currentMealIds.has(r.id));
        const finalPool = pool.length >= 2 ? pool : candidateMains;

        const shuffledMains = shuffle(finalPool);
        const validPairs: [Recipe, Recipe][] = [];

        for (let i = 0; i < shuffledMains.length; i++) {
          const costI = scaleCost(shuffledMains[i].estimatedCostVnd || 35000, safeServings);
          for (let j = i + 1; j < shuffledMains.length; j++) {
            const costJ = scaleCost(shuffledMains[j].estimatedCostVnd || 35000, safeServings);
            if (costI + costJ <= remBudget) {
              validPairs.push([shuffledMains[i], shuffledMains[j]]);
              if (validPairs.length >= 8) break;
            }
          }
          if (validPairs.length >= 8) break;
        }

        if (validPairs.length > 0) {
          const randomPair = validPairs[Math.floor(Math.random() * validPairs.length)];
          chosenLunch = randomPair[0];
          chosenDinner = randomPair[1];
          chosenCost += scaleCost((chosenLunch.estimatedCostVnd || 35000) + (chosenDinner.estimatedCostVnd || 35000), safeServings);
        } else {
          const sorted = [...candidateMains].sort((a, b) => (a.estimatedCostVnd || 35000) - (b.estimatedCostVnd || 35000));
          chosenLunch = sorted[0];
          chosenDinner = sorted[1] || sorted[0];
          chosenCost += scaleCost((chosenLunch.estimatedCostVnd || 35000) + (chosenDinner.estimatedCostVnd || 35000), safeServings);
        }
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
              skippedSlots: isLunchSkipped ? { ...d.skippedSlots, lunch: true } : d.skippedSlots,
              slotNotes: isLunchSkipped ? { ...d.slotNotes, lunch: d.slotNotes?.lunch || 'Bán trú • Ăn ngoài' } : d.slotNotes,
              totalCost: (chosenBreakfast.estimatedCostVnd || 25000) + (chosenLunch ? (chosenLunch.estimatedCostVnd || 35000) : 0) + (chosenDinner ? (chosenDinner.estimatedCostVnd || 35000) : 0)
            };
          }
          return d;
        });
        try {
          localStorage.setItem('mealwise_weekly_plan', JSON.stringify(nextPlan));
        } catch {}
        return nextPlan;
      });

      setGenerationCount(prev => prev + 1);
      showToast(`🎲 Đã đổi mới thực đơn ${targetDay.dayName} (${chosenCost.toLocaleString('vi-VN')} đ, chuẩn ngân sách)!`);
      return true;
    } else {
      // Family Meal Sets Mode
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

      if (isWestern) {
        const westernBfast = rawBfastPool.filter(r => /pancake|sandwich|omelette|bơ tỏi|trứng khuấy|french toast|avocado|yến mạch/i.test(r.title) || (r.tags || []).some(t => /món âu|western/i.test(t)));
        if (westernBfast.length > 0) rawBfastPool = westernBfast;
      }
      if (isGym) {
        const gymBfast = rawBfastPool.filter(r =>
          /trứng|bò|thịt|ức gà|cá|hải sản|phô mai|omelet|chả|pate|bít tết|steak|phở bò|bún bò|hủ tiếu/i.test(r.title) ||
          (r.tags || []).some(t => /đạm|protein|gym|thịt|bò|gà|trứng/i.test(t)) ||
          (r.ingredients && r.ingredients.some(i => i.category === 'thit-ca'))
        );
        if (gymBfast.length > 0) rawBfastPool = gymBfast;
      }

      let affordableBfast = rawBfastPool.filter(r => scaleCost(r.estimatedCostVnd || 25000, safeServings) <= maxBfastCost);
      if (affordableBfast.length === 0) {
        affordableBfast = [...rawBfastPool].sort((a, b) =>
          scaleCost(a.estimatedCostVnd || 25000, safeServings) - scaleCost(b.estimatedCostVnd || 25000, safeServings)
        ).slice(0, 5);
      }

      const freshBfast = affordableBfast.filter(b => !currentMealIds.has(b.id) && !usedRecipeIds.has(b.id));
      const backupBfast = affordableBfast.filter(b => !currentMealIds.has(b.id));
      const bfastCandidatePool = freshBfast.length > 0 ? freshBfast : backupBfast.length > 0 ? backupBfast : affordableBfast;
      const chosenBreakfast = shuffle(bfastCandidatePool)[0] || affordableBfast[0];
      const bfastCost = scaleCost(chosenBreakfast.estimatedCostVnd || 25000, safeServings);
      const remBudget = budgetCeiling - bfastCost;

      let candidateSets = [...mealSets];
      if (isChay) {
        candidateSets = candidateSets.filter(s => s.region === 'chay' || s.tags?.some(t => t.toLowerCase().includes('chay')));
      } else if (isWestern) {
        candidateSets = candidateSets.filter(s => s.id.startsWith('mam-com-au-') || s.tags?.some(t => /món âu|western/i.test(t)));
      }
      if (isGym) {
        const gymSets = candidateSets.filter(s =>
          s.tags?.some(t => /giàu đạm|tập gym|protein|bò|thịt|ức gà|cá hồi|steak|bít tết|bbq|sườn/i.test(t)) ||
          /bít tết|steak|bò|thịt|ức gà|cá hồi|sườn|tôm|heo quay/i.test(s.title)
        );
        if (gymSets.length >= 2) candidateSets = gymSets;
      }

      let chosenLunchSet: VietnameseMealSet | null = null;
      let chosenDinnerSet: VietnameseMealSet | null = null;
      let chosenCost = bfastCost;

      if (isLunchSkipped) {
        // Lunch is bán trú • Only dinner is a meal set
        const dinnerCandidates = candidateSets.filter(s => !currentMealIds.has(s.id) && !usedMealSetIds.has(s.id));
        const pool = dinnerCandidates.length > 0 ? dinnerCandidates : candidateSets.filter(s => !currentMealIds.has(s.id));
        const finalPool = pool.length > 0 ? pool : candidateSets;
        const affordableDinner = finalPool.filter(s => scaleCost(s.totalCostVnd, safeServings) <= remBudget);
        const dinnerPool = affordableDinner.length > 0 ? affordableDinner : finalPool;
        chosenDinnerSet = shuffle(dinnerPool)[0] || candidateSets[0];
        chosenLunchSet = null;
        chosenCost += scaleCost(chosenDinnerSet.totalCostVnd, safeServings);
      } else {
        const unusedSets = candidateSets.filter(s => !currentMealIds.has(s.id) && !usedMealSetIds.has(s.id));
        const pool = unusedSets.length >= 3 ? unusedSets : candidateSets.filter(s => !currentMealIds.has(s.id));
        const finalPool = pool.length >= 2 ? pool : candidateSets;

        const shuffledSets = shuffle(finalPool);
        const validPairs: [VietnameseMealSet, VietnameseMealSet][] = [];

        for (let i = 0; i < shuffledSets.length; i++) {
          const costI = scaleCost(shuffledSets[i].totalCostVnd, safeServings);
          for (let j = i + 1; j < shuffledSets.length; j++) {
            const costJ = scaleCost(shuffledSets[j].totalCostVnd, safeServings);
            if (costI + costJ <= remBudget) {
              validPairs.push([shuffledSets[i], shuffledSets[j]]);
              if (validPairs.length >= 8) break;
            }
          }
          if (validPairs.length >= 8) break;
        }

        if (validPairs.length > 0) {
          const randomPair = validPairs[Math.floor(Math.random() * validPairs.length)];
          chosenLunchSet = randomPair[0];
          chosenDinnerSet = randomPair[1];
          chosenCost += scaleCost(chosenLunchSet.totalCostVnd + chosenDinnerSet.totalCostVnd, safeServings);
        } else {
          const sorted = [...candidateSets].sort((a, b) => a.totalCostVnd - b.totalCostVnd);
          chosenLunchSet = sorted[0];
          chosenDinnerSet = sorted[1] || sorted[0];
          chosenCost += scaleCost(chosenLunchSet.totalCostVnd + chosenDinnerSet.totalCostVnd, safeServings);
        }
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
              skippedSlots: isLunchSkipped ? { ...d.skippedSlots, lunch: true } : d.skippedSlots,
              slotNotes: isLunchSkipped ? { ...d.slotNotes, lunch: d.slotNotes?.lunch || 'Bán trú • Ăn ngoài' } : d.slotNotes,
              totalCost: (chosenBreakfast.estimatedCostVnd || 25000) + (chosenLunchSet ? chosenLunchSet.totalCostVnd : 0) + (chosenDinnerSet ? chosenDinnerSet.totalCostVnd : 0)
            };
          }
          return d;
        });
        try {
          localStorage.setItem('mealwise_weekly_plan', JSON.stringify(nextPlan));
        } catch {}
        return nextPlan;
      });

      setGenerationCount(prev => prev + 1);
      showToast(`🎲 Đã đổi mới mâm cơm ${targetDay.dayName} (${chosenCost.toLocaleString('vi-VN')} đ, chuẩn ngân sách)!`);
      return true;
    }
  };

  const recalibrateWeeklyMenu = () => {
    savePlanSnapshot(weeklyPlan);
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
      const storageKey = activePlanScope === 'next' ? 'mealwise_next_weekly_plan' : 'mealwise_weekly_plan';
      localStorage.setItem(storageKey, JSON.stringify(updatedPlan));
    } catch {}

    const dailyBudgetTarget = getDailyBudgetTarget(budgetLevel, safeServings, onboardingData?.specialNeeds);
    recordTelemetryEvent(
      'weekly',
      `Tạo thực đơn 7 ngày vị ${regionPreference.toUpperCase()} (~${dailyBudgetTarget.toLocaleString('vi-VN')} đ/ngày, ${safeServings} người)`,
      user?.name || 'Người dùng'
    );
    if (isSingleDish) {
      showToast(`⚡ Đã cân chỉnh toàn bộ 7 ngày thành 14 món ăn đầy đặn, đủ chất không trùng lặp (~${dailyBudgetTarget.toLocaleString('vi-VN')} đ/ngày)!`);
    } else {
      showToast(`⚡ Đã cân chỉnh toàn bộ 7 ngày thành 14 mâm cơm đầy đặn không trùng lặp (~${dailyBudgetTarget.toLocaleString('vi-VN')} đ/ngày)!`);
    }
  };

  const resolvedMealSets = useMemo(
    () => mealSets.map(ms => applyAdminOverridesToMealSet(ms, adminDishOverrides)),
    [mealSets, adminDishOverrides]
  );
  const resolvedCurrentWeekPlan = useMemo(
    () => applyAdminOverridesToDailyPlan(currentWeekPlan, adminDishOverrides),
    [currentWeekPlan, adminDishOverrides]
  );
  const resolvedNextWeekPlan = useMemo(
    () => applyAdminOverridesToDailyPlan(nextWeekPlan, adminDishOverrides),
    [nextWeekPlan, adminDishOverrides]
  );
  const resolvedWeeklyPlan = useMemo(
    () => applyAdminOverridesToDailyPlan(weeklyPlan, adminDishOverrides),
    [weeklyPlan, adminDishOverrides]
  );
  const resolvedSelectedRecipe = useMemo(
    () => (selectedRecipe ? applyAdminOverrideToRecipe(selectedRecipe, adminDishOverrides) : null),
    [selectedRecipe, adminDishOverrides]
  );
  const resolvedSelectedMealSet = useMemo(
    () => (selectedMealSet ? applyAdminOverridesToMealSet(selectedMealSet, adminDishOverrides) : null),
    [selectedMealSet, adminDishOverrides]
  );

  const contextValue: MealWiseContextType = {
        guestSession,
        recipes,
        customRecipes,
        addCustomRecipe,
        deleteCustomRecipe,
        mealSets: resolvedMealSets,
        weeklyPlan: resolvedWeeklyPlan,
        setWeeklyPlan,
        activePlanScope,
        setActivePlanScope,
        currentWeekPlan: resolvedCurrentWeekPlan,
        nextWeekPlan: resolvedNextWeekPlan,
        promoteNextWeekToCurrent,
        previousWeeklyPlan,
        previousPlanSavedAt,
        restorePreviousWeeklyPlan,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        theme,
        setTheme,
        toggleTheme,
        onboardingData: effectiveOnboardingData,
        setOnboardingData,
        showOnboarding,
        setShowOnboarding: setShowOnboardingSafe,
        completeOnboarding,
        resetOnboarding,
        showWelcomeModal,
        setShowWelcomeModal,
        openWelcomeModal,
        completeWelcomeModal,
        isTutorialOpen,
        setIsTutorialOpen,
        startTutorial,
        selectedRecipe: resolvedSelectedRecipe,
        setSelectedRecipe,
        selectedMealSet: resolvedSelectedMealSet,
        setSelectedMealSet,
        addMealSetToSlot,
        assignMealSetToSlot,
        swapDishInMealSet,
        swapDishInWeeklySlot,
        addRecipeToSlot,
        assignRecipeToSlot,
        removeMealFromSlot,
        toggleSkipSlot,
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
        isWeeklyShoppingCompleted,
        setIsWeeklyShoppingCompleted,
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
        schedulePartyEvent,
        updateScheduledPartyEvent,
        deleteScheduledPartyEvent,
        togglePartyEventNotification,
        loadEventIntoPartyPlan,
        extraGroceryItems,
        addExtraGroceryItems,
        removeExtraGroceryItem,
        clearExtraGrocery,
        toastMessage,
        toastType,
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
        addPantryItems,
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
        toggleCollabChecked,
        groceryItemBuyerCounts,
        incrementGroceryItemBuyer,
        decrementGroceryItemBuyer,
        incrementCollabItemBuyer,
        decrementCollabItemBuyer,
        user,
        isRegistered,
        loginUser,
        logoutUser,
        deleteAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
        isWebGuestViewer,
        setIsWebGuestViewer,
        isDownloadAppModalOpen,
        setIsDownloadAppModalOpen,
        downloadAppFeatureName,
        openDownloadAppModal,
        closeDownloadAppModal
  };

  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__LAST_MEALWISE_CONTEXT_VALUE__ = contextValue;
  }

  return (
    <MealWiseContext.Provider value={contextValue}>
      {children}
    </MealWiseContext.Provider>
  );
};

const getSafeFallbackMealWiseContext = (): MealWiseContextType => {
  const defaultCollabUser = getOrCreateCollabUser();
  const defaultWeeklyPlan: DailyMealPlan[] = INITIAL_DAYS.map(day => ({
    dayId: day.dayId,
    dayName: day.dayName,
    meals: {
      breakfast: mockRecipes[0],
      lunch: mockMealSets[0],
      dinner: mockMealSets[1] || mockMealSets[0]
    },
    totalCost: 150000
  }));

  return {
    guestSession: null,
    recipes: mockRecipes,
    customRecipes: [],
    addCustomRecipe: () => {},
    deleteCustomRecipe: () => {},
    mealSets: mockMealSets,
    weeklyPlan: defaultWeeklyPlan,
    setWeeklyPlan: () => {},
    activePlanScope: 'current',
    setActivePlanScope: () => {},
    currentWeekPlan: defaultWeeklyPlan,
    nextWeekPlan: defaultWeeklyPlan,
    promoteNextWeekToCurrent: () => {},
    previousWeeklyPlan: null,
    previousPlanSavedAt: null,
    restorePreviousWeeklyPlan: () => {},
    activeTab: 'meal-sets',
    setActiveTab: () => {},
    viewMode: 'mobile',
    setViewMode: () => {},
    theme: 'light',
    setTheme: () => {},
    toggleTheme: () => {},
    onboardingData: INITIAL_ONBOARDING,
    setOnboardingData: () => {},
    showOnboarding: false,
    setShowOnboarding: () => {},
    completeOnboarding: () => {},
    resetOnboarding: () => {},
    showWelcomeModal: false,
    setShowWelcomeModal: () => {},
    openWelcomeModal: () => {},
    completeWelcomeModal: () => {},
    isTutorialOpen: false,
    setIsTutorialOpen: () => {},
    startTutorial: () => {},
    selectedRecipe: null,
    setSelectedRecipe: () => {},
    selectedMealSet: null,
    setSelectedMealSet: () => {},
    addMealSetToSlot: () => {},
    assignMealSetToSlot: () => {},
    swapDishInMealSet: (m) => m,
    swapDishInWeeklySlot: () => {},
    addRecipeToSlot: () => {},
    assignRecipeToSlot: () => {},
    removeMealFromSlot: () => {},
    toggleSkipSlot: () => {},
    generationCount: 0,
    autoFillWeeklyMenu: () => {},
    recalibrateDayMenu: () => true,
    recalibrateWeeklyMenu: () => {},
    clearWeeklyMenu: () => {},
    resetWeeklyMenu: () => {},
    servings: 4,
    setServings: () => {},
    groceryCheckedItems: {},
    setGroceryCheckedItems: () => {},
    toggleGroceryItemChecked: () => {},
    clearGroceryCheckedItems: () => {},
    isWeeklyShoppingCompleted: false,
    setIsWeeklyShoppingCompleted: () => {},
    groceryItemBuyerCounts: {},
    incrementGroceryItemBuyer: () => {},
    decrementGroceryItemBuyer: () => {},
    partyPlan: DEFAULT_PARTY_PLAN,
    updatePartyPlan: () => {},
    addDishToParty: () => {},
    removeDishFromParty: () => {},
    updatePartyDishNote: () => {},
    clearPartyDishes: () => {},
    applyPresetToParty: () => {},
    resetPartyPlan: () => {},
    togglePartyEquipment: () => {},
    addPartyEquipment: () => {},
    removePartyEquipment: () => {},
    syncPartyToGrocery: () => {},
    userPartyPlans: [],
    saveCurrentPlanAsPreset: () => ({
      id: 'fallback-preset',
      title: 'Mẫu Tiệc Mặc Định',
      eventType: 'corporate',
      guestCount: 20,
      tableSize: 10,
      budgetPerHeadVnd: 220000,
      dishes: [],
      recommendedDrinks: [],
      equipmentChecklist: [],
      estimatedPrepMinutes: 60,
      estimatedCookMinutes: 60,
      totalTimeMinutes: 120,
      totalFoodCostVnd: 4400000,
      createdAt: new Date().toISOString()
    }),
    deleteUserPartyPlan: () => {},
    loadUserPartyPlan: () => {},
    scheduledPartyEvents: [],
    schedulePartyEvent: () => ({
      id: 'fallback-evt',
      title: 'Tiệc Mặc Định',
      eventType: 'family',
      targetDate: '2026-10-15',
      recurrence: 'none',
      guestCount: 10,
      tableSize: 10,
      dishesCount: 0,
      totalFoodCostVnd: 0,
      totalEstimateVnd: 0,
      attachedDishes: [],
      enableNotifications: true,
      createdAt: new Date().toISOString()
    }),
    updateScheduledPartyEvent: () => {},
    deleteScheduledPartyEvent: () => {},
    togglePartyEventNotification: () => {},
    loadEventIntoPartyPlan: () => {},
    extraGroceryItems: [],
    addExtraGroceryItems: () => {},
    removeExtraGroceryItem: () => {},
    clearExtraGrocery: () => {},
    isApexModalOpen: false,
    setIsApexModalOpen: () => {},
    openApexModal: () => {},
    closeApexModal: () => {},
    isMinigameHubOpen: false,
    setIsMinigameHubOpen: () => {},
    openMinigameHub: () => {},
    closeMinigameHub: () => {},
    isDrinkRouletteOpen: false,
    setIsDrinkRouletteOpen: () => {},
    openDrinkRoulette: () => {},
    closeDrinkRoulette: () => {},
    toastMessage: null,
    toastType: 'info',
    showToast: () => {},
    hideToast: () => {},
    pantryItems: INITIAL_PANTRY_ITEMS,
    addPantryItem: () => {},
    addPantryItems: () => {},
    removePantryItem: () => {},
    updatePantryItem: () => {},
    clearPantryItems: () => {},
    confirmDialog: null,
    openConfirmModal: () => {},
    closeConfirmModal: () => {},
    collabRoom: null,
    collabCheckedMap: {},
    collabUser: defaultCollabUser,
    collabUserName: defaultCollabUser.name,
    setCollabUserName: () => {},
    updateCollabUserProfile: () => {},
    collabParticipants: {},
    isShareModalOpen: false,
    setIsShareModalOpen: () => {},
    startCollabRoom: async () => '',
    joinCollabRoom: async () => true,
    leaveCollabRoom: () => {},
    toggleCollabChecked: () => {},
    incrementCollabItemBuyer: () => {},
    decrementCollabItemBuyer: () => {},
    user: null,
    isRegistered: false,
    loginUser: () => true,
    logoutUser: () => {},
    deleteAccount: () => {},
    isAuthModalOpen: false,
    setIsAuthModalOpen: () => {},
    openAuthModal: () => {},
    closeAuthModal: () => {},
    authModalMode: 'register',
    setAuthModalMode: () => {},
    isWebGuestViewer: false,
    setIsWebGuestViewer: () => {},
    isDownloadAppModalOpen: false,
    setIsDownloadAppModalOpen: () => {},
    downloadAppFeatureName: '',
    openDownloadAppModal: () => {},
    closeDownloadAppModal: () => {}
  };
};

export const useMealWise = (): MealWiseContextType => {
  try {
    const context = useContext(MealWiseContext);
    if (context) {
      return context;
    }
  } catch {}
  if (typeof globalThis !== 'undefined' && (globalThis as any).__LAST_MEALWISE_CONTEXT_VALUE__) {
    return (globalThis as any).__LAST_MEALWISE_CONTEXT_VALUE__;
  }
  return getSafeFallbackMealWiseContext();
};
