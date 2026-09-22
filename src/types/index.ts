export type MealCategory = 'mon-man' | 'mon-canh' | 'mon-rau' | 'mon-chay' | 'an-sang' | 'trang-mieng';

export type Region = 'bac' | 'trung' | 'nam' | 'toan-quoc';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Ingredient {
  name: string;
  amount: number | string;
  unit: string;
  category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
}

export interface CookingInstruction {
  step: number;
  title: string;
  content: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: MealCategory;
  region: Region;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  estimatedCostVnd: number;
  imageUrl: string;
  ingredients: Ingredient[];
  instructions: CookingInstruction[];
  tags: string[];
}

export interface VietnameseMealSet {
  id: string;
  title: string;
  region: 'bac' | 'trung' | 'nam' | 'chay' | 'toan-quoc';
  description: string;
  mainDish: Recipe;
  soupDish: Recipe;
  sideDish: Recipe;
  condimentNote: string; // e.g. "Nước mắm tỏi ớt, Cà pháo muối giòn"
  totalCostVnd: number;
  totalCalories: number;
  imageUrl: string;
  tags: string[];
}

export interface DailyMealPlan {
  dayId: string; // e.g. 'mon', 'tue'
  dayName: string; // e.g. 'Thứ Hai'
  date?: string;
  dayOfWeek?: string;
  meals: {
    breakfast: Recipe | VietnameseMealSet | null;
    lunch: Recipe | VietnameseMealSet | null;
    dinner: Recipe | VietnameseMealSet | null;
    snack?: Recipe | VietnameseMealSet | null;
  };
  totalCalories?: number;
  totalCost?: number;
}

export type StoreChannel = 'all' | 'cho-dan-sinh' | 'winmart' | 'bach-hoa-xanh' | 'sap-doi-tac';

export interface StoreChannelInfo {
  id: StoreChannel;
  name: string;
  badge: string;
  multiplier: number;
  description: string;
}


export interface OnboardingData {
  regionPreference: 'bac' | 'trung' | 'nam' | 'toan-quoc';
  familySize: number; // 1, 2, 4, 6
  singleMealFormat?: 'single-dish' | 'meal-set'; // When familySize === 1: 'single-dish' vs 'meal-set'
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai';
  specialNeeds: string[]; // 'gym-protein', 'eat-clean', 'single-prep', 'nhieu-rau', 'it-cay', 'chay', 'nhanh-gon'
  completed: boolean;
}

export type ActiveTab = 'meal-sets' | 'weekly' | 'party' | 'fast-meal' | 'grocery' | 'recipes' | 'pantry' | 'account';

export type ApexCaseTier = 'blue' | 'purple' | 'gold';

export type FastMealPreferenceMode = 'combo' | 'express-1dish' | 'snack-genz' | 'bizarre-dare';

export interface OfficeDrink {
  id: string;
  title: string;
  estimatedCostVnd: number;
  calories: number;
  imageUrl: string;
  officeBuff: string; // e.g. "+100% Tỉnh táo chạy deadline"
}

export interface ApexLootDrop {
  id: string;
  tier: ApexCaseTier;
  tierName: string;
  mode: FastMealPreferenceMode;
  modeName: string;
  totalCostVnd: number;
  totalCalories: number;
  mainDish: {
    id: string;
    title: string;
    category?: string;
    estimatedCostVnd: number;
    calories: number;
    imageUrl: string;
    description: string;
  };
  sideDish?: {
    id: string;
    title: string;
    estimatedCostVnd: number;
    calories: number;
    imageUrl: string;
  };
  officeDrink?: OfficeDrink;
  quoteOffice: string;
  speedMinutes?: number;
  napBuff?: string;
  snackFeature?: string;
  dareLevel?: string;
  darePenalty?: string;
  isNewUnlock?: boolean;
  unlockedCount?: number;
  totalPoolCount?: number;
  prestigeCycle?: number;
}

export type ViewMode = 'desktop' | 'mobile';

export type ThemeMode = 'light' | 'dark';

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  daysLeft: number;
  status: 'fresh' | 'warning' | 'expired';
  discountOpportunityVnd?: number;
  isLeftover?: boolean;
  notes?: string;
  addedAt?: string;
}

export interface CorporatePartyPreset {
  id: string;
  title: string;
  categoryTag: string;
  description: string;
  image: string;
  suggestedPerHeadBudgetVnd: number;
  defaultGuestCount: number;
  menuRecipes: Recipe[];
  recommendedDrinks: string[];
  equipmentChecklist: Array<{ id: string; text: string; category: string; done: boolean }>;
}

export interface PartyDishItem {
  recipeId: string;
  course: 'appetizer' | 'main' | 'soup_hotpot' | 'staple' | 'dessert_drink';
  customNotes?: string;
}

export interface PartyEquipmentItem {
  id: string;
  text: string;
  category: string;
  done: boolean;
}

export interface CustomPartyPlan {
  id: string;
  title: string;
  clientName?: string;
  eventType: string; // 'corporate' | 'family' | 'birthday' | 'bbq' | 'wedding'
  guestCount: number;
  tableSize: 6 | 8 | 10;
  budgetPerHeadVnd: number;
  dishes: PartyDishItem[];
  recommendedDrinks: string[];
  equipmentChecklist: PartyEquipmentItem[];
  staffNotes?: string;
}

export interface SavedPartyPreset {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  guestCount: number;
  tableSize: 6 | 8 | 10;
  budgetPerHeadVnd: number;
  dishes: PartyDishItem[];
  recommendedDrinks: string[];
  equipmentChecklist: PartyEquipmentItem[];
  staffNotes?: string;
  estimatedPrepMinutes: number;
  estimatedCookMinutes: number;
  totalTimeMinutes: number;
  totalFoodCostVnd: number;
  createdAt: string;
}

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface CollabCartItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  displayAmount: string;
  category: 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho' | 'khac';
  type: 'fresh' | 'pantry';
  cost: number;
  storeChannel?: string;
}

export interface CollabShopper {
  id: string;
  name: string;
  color: string; // e.g. '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'
  role: 'host' | 'shopper';
  avatar?: string;
  lastActive?: number;
}

export interface CollabCheckState {
  checked: boolean;
  checkedBy: string; // e.g. "User A", "Mẹ", "Bạn (Chủ phòng)"
  checkedById?: string; // unique ID e.g. "usr_178997..."
  checkedByColor?: string; // shopper badge color
  checkedAt: number; // timestamp
}

export interface CollabRoom {
  roomId: string;
  title: string;
  hostName: string;
  createdAt: number;
  updatedAt: number;
  items: CollabCartItem[];
  checkedMap: Record<string, CollabCheckState>;
  participants?: Record<string, CollabShopper>;
}



