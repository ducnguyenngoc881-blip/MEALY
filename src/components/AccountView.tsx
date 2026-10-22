import React, { useState, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { User, RotateCcw, Sun, Moon, CheckCircle2, PlayCircle, UserPlus, LogOut, ShieldCheck, Sparkles, KeyRound, Mail, UserCheck, Eye, EyeOff, X, Clock, Tv, Lock, LayoutDashboard, ArrowRight, Gamepad2, ShoppingCart, PartyPopper, ChevronRight, HelpCircle } from 'lucide-react';
import { VolunteerAdSequenceModal } from './VolunteerAdSequenceModal';
import { getDailyBudgetTarget } from '../utils/currency';
import { 
  loadAdTrackingState, 
  recordVolunteerAdWatched, 
  getAdFreeRemainingMs, 
  formatAdFreeTime,
  AdTrackingState 
} from '../utils/adTrackingService';
import {
  getAttConsentStatus,
  requestAttPermission,
  AttConsentStatus,
  getSkanConversionState,
  SkanConversionState,
  CPP_CSL_CAMPAIGNS,
  getActiveCampaign,
  setActiveCampaignBySlug,
  hasClaimedNewUserGift,
  claimNewUserGift,
  trackMmpEvent,
  CppCslCampaignConfig
} from '../services/mmpTrackingService';

export interface MealWiseStateBackup {
  version: 1;
  exportedAt: string; // ISO string
  state: {
    weeklyPlan?: unknown;
    onboardingData?: unknown;
    theme?: string;
    partyPlan?: unknown;
    pantryItems?: unknown;
    extraGroceryItems?: unknown;
    groceryCheckedItems?: unknown;
    unlockedCases?: unknown;
    [key: string]: unknown;
  };
}

export const BACKUP_CORE_STORAGE_KEYS = [
  'mealwise_weekly_plan',
  'mealwise_onboarding',
  'mealwise_theme',
  'mealwise_party_plan',
  'mealwise_pantry_items_v2',
  'mealwise_extra_grocery',
  'mealwise_extra_grocery_v1',
  'mealwise_grocery_checked',
  'mealwise_grocery_buyer_counts',
  'mealwise_account_unlocked_cases_v1',
  'mealwise_servings',
  'mealwise_custom_party_plans',
  'mealwise_collab_room',
  'mealwise_collab_checked',
  'mealwise_collab_shopper_profile',
  'mealwise_collab_user',
] as const;

export function exportMealWiseBackup(): string {
  const state: Record<string, unknown> = {};

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    // 1. Core 15+ defined keys
    for (const key of BACKUP_CORE_STORAGE_KEYS) {
      const rawVal = localStorage.getItem(key);
      if (rawVal !== null) {
        try {
          state[key] = JSON.parse(rawVal);
        } catch {
          state[key] = rawVal;
        }
      }
    }

    // Friendly alias mappings matching MealWiseStateBackup interface
    if (state.mealwise_weekly_plan !== undefined) state.weeklyPlan = state.mealwise_weekly_plan;
    if (state.mealwise_onboarding !== undefined) state.onboardingData = state.mealwise_onboarding;
    if (state.mealwise_theme !== undefined) state.theme = String(state.mealwise_theme);
    if (state.mealwise_party_plan !== undefined) state.partyPlan = state.mealwise_party_plan;
    if (state.mealwise_pantry_items_v2 !== undefined) state.pantryItems = state.mealwise_pantry_items_v2;
    if (state.mealwise_extra_grocery !== undefined) state.extraGroceryItems = state.mealwise_extra_grocery;
    else if (state.mealwise_extra_grocery_v1 !== undefined) state.extraGroceryItems = state.mealwise_extra_grocery_v1;
    if (state.mealwise_grocery_checked !== undefined) state.groceryCheckedItems = state.mealwise_grocery_checked;
    if (state.mealwise_account_unlocked_cases_v1 !== undefined) state.unlockedCases = state.mealwise_account_unlocked_cases_v1;
    if (state.mealwise_servings !== undefined) state.servings = state.mealwise_servings;
    if (state.mealwise_grocery_buyer_counts !== undefined) state.groceryBuyerCounts = state.mealwise_grocery_buyer_counts;
    if (state.mealwise_custom_party_plans !== undefined) state.customPartyPlans = state.mealwise_custom_party_plans;

    // 2. Dynamic discovery: Any additional keys in localStorage matching /^mealwise_/
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mealwise_') && !(key in state)) {
        const rawVal = localStorage.getItem(key);
        if (rawVal !== null) {
          try {
            state[key] = JSON.parse(rawVal);
          } catch {
            state[key] = rawVal;
          }
        }
      }
    }
  }

  const backup: MealWiseStateBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
  };

  return JSON.stringify(backup, null, 2);
}

export function importMealWiseBackup(jsonContent: string): { success: boolean; error?: string } {
  if (!jsonContent || typeof jsonContent !== 'string' || !jsonContent.trim()) {
    return { success: false, error: 'Tệp sao lưu trống hoặc không hợp lệ.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    return { success: false, error: 'Tệp sao lưu bị lỗi định dạng JSON hoặc bị hỏng.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'Cấu trúc tệp sao lưu không đúng định dạng đối tượng JSON.' };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.version !== 1) {
    return {
      success: false,
      error: `Phiên bản tệp sao lưu không tương thích (chỉ hỗ trợ phiên bản 1, nhận được: ${obj.version ?? 'không có'}).`,
    };
  }

  if (!obj.exportedAt || typeof obj.exportedAt !== 'string' || isNaN(Date.parse(obj.exportedAt))) {
    return { success: false, error: 'Tệp sao lưu thiếu hoặc sai định dạng thời gian xuất (exportedAt).' };
  }

  if (!obj.state || typeof obj.state !== 'object' || Array.isArray(obj.state)) {
    return { success: false, error: 'Tệp sao lưu thiếu trường dữ liệu trạng thái (state).' };
  }

  const state = obj.state as Record<string, unknown>;
  const keys = Object.keys(state);
  if (keys.length === 0) {
    return { success: false, error: 'Dữ liệu trạng thái (state) trong tệp sao lưu trống.' };
  }

  const recognizedFriendlyKeys = [
    'weeklyPlan',
    'onboardingData',
    'theme',
    'partyPlan',
    'pantryItems',
    'extraGroceryItems',
    'groceryCheckedItems',
    'unlockedCases',
    'servings',
    'groceryBuyerCounts',
    'customPartyPlans',
  ];

  const hasRecognizedKey = keys.some(
    k => k.startsWith('mealwise_') || recognizedFriendlyKeys.includes(k)
  );

  if (!hasRecognizedKey) {
    return { success: false, error: 'Tệp sao lưu không chứa bất kỳ khóa dữ liệu MealWise hợp lệ nào.' };
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const writeKey = (storageKey: string, val: unknown) => {
        if (val === undefined || val === null) return;
        const strVal = typeof val === 'string' ? val : JSON.stringify(val);
        localStorage.setItem(storageKey, strVal);
      };

      // Restore friendly keys
      if (state.weeklyPlan !== undefined) writeKey('mealwise_weekly_plan', state.weeklyPlan);
      if (state.onboardingData !== undefined) writeKey('mealwise_onboarding', state.onboardingData);
      if (state.theme !== undefined && (state.theme === 'light' || state.theme === 'dark')) {
        writeKey('mealwise_theme', state.theme);
      }
      if (state.partyPlan !== undefined) writeKey('mealwise_party_plan', state.partyPlan);
      if (state.pantryItems !== undefined) writeKey('mealwise_pantry_items_v2', state.pantryItems);
      if (state.extraGroceryItems !== undefined) {
        writeKey('mealwise_extra_grocery', state.extraGroceryItems);
        writeKey('mealwise_extra_grocery_v1', state.extraGroceryItems);
      }
      if (state.groceryCheckedItems !== undefined) writeKey('mealwise_grocery_checked', state.groceryCheckedItems);
      if (state.unlockedCases !== undefined) writeKey('mealwise_account_unlocked_cases_v1', state.unlockedCases);
      if (state.servings !== undefined) writeKey('mealwise_servings', String(state.servings));
      if (state.groceryBuyerCounts !== undefined) writeKey('mealwise_grocery_buyer_counts', state.groceryBuyerCounts);
      if (state.customPartyPlans !== undefined) writeKey('mealwise_custom_party_plans', state.customPartyPlans);

      // Restore any key starting with 'mealwise_'
      for (const k of keys) {
        if (k.startsWith('mealwise_') && state[k] !== undefined && state[k] !== null) {
          writeKey(k, state[k]);
        }
      }
    } catch (err: unknown) {
      return {
        success: false,
        error: `Không thể ghi dữ liệu vào localStorage: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return { success: true };
}

export const AccountView: React.FC = () => {
  const { 
    onboardingData, 
    resetOnboarding, 
    theme, 
    toggleTheme, 
    openConfirmModal, 
    showToast,
    user,
    isRegistered,
    logoutUser,
    deleteAccount,
    openAuthModal,
    guestSession,
    setActiveTab,
    openMinigameHub,
    startTutorial,
    openWelcomeModal
  } = useMealWise();
  const [isAdSequenceOpen, setIsAdSequenceOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const isLight = theme === 'light';

  // Volunteer Ads & Ad-Free Tracking State
  const [adTracking, setAdTracking] = useState<AdTrackingState>(loadAdTrackingState);
  const [adFreeRemainingMs, setAdFreeRemainingMs] = useState<number>(() =>
    getAdFreeRemainingMs(adTracking.adFreeUntilTimestamp)
  );
  const [attStatus, setAttStatus] = useState<AttConsentStatus>(() => getAttConsentStatus());
  const [skanState, setSkanState] = useState<SkanConversionState>(() => getSkanConversionState());
  const [activeCampaign, setActiveCampaignState] = useState<CppCslCampaignConfig>(() => getActiveCampaign());
  const [giftClaimed, setGiftClaimed] = useState<boolean>(() => hasClaimedNewUserGift(user?.email));

  useEffect(() => {
    setGiftClaimed(hasClaimedNewUserGift(user?.email));
    setSkanState(getSkanConversionState());
  }, [user?.email]);

  useEffect(() => {
    const handleAttChanged = (e: Event) => {
      const custom = e as CustomEvent<{ status?: AttConsentStatus }>;
      if (custom.detail?.status) {
        setAttStatus(custom.detail.status);
      } else {
        setAttStatus(getAttConsentStatus());
      }
      setSkanState(getSkanConversionState());
    };
    window.addEventListener('mealwise:att_status_changed', handleAttChanged);
    return () => window.removeEventListener('mealwise:att_status_changed', handleAttChanged);
  }, []);

  // Live real-time countdown timer tick
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = getAdFreeRemainingMs(adTracking.adFreeUntilTimestamp);
      setAdFreeRemainingMs(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [adTracking.adFreeUntilTimestamp]);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      
      {/* Profile Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs shrink-0">
            <User className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-black text-slate-900 dark:text-white truncate">
                {user?.name || 'Tài Khoản Khách'}
              </h1>
              {isRegistered ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Đã Đăng Ký
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" /> Khách
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
              {user?.email 
                ? `${user.email}` 
                : `Phiên dùng thử (${guestSession?.guestId.slice(0, 10) || 'guest'}...)`}
            </p>
          </div>
        </div>

        {/* Sign In / Sign Up Button in Header */}
        {isRegistered ? (
          <button
            type="button"
            onClick={() => {
              openConfirmModal({
                title: 'Đăng Xuất Tài Khoản',
                message: 'Bạn có chắc chắn muốn đăng xuất? Thiết bị này sẽ chuyển về chế độ khách.',
                confirmLabel: 'Đăng Xuất',
                cancelLabel: 'Hủy',
                onConfirm: logoutUser
              });
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Đăng Xuất</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            title="Đăng Nhập / Đăng Ký"
            className="px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>Đăng Nhập</span>
          </button>
        )}
      </div>

      {/* Admin Portal Gateway for Administrator Account */}
      {user?.role === 'admin' && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 text-white shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white">Website Quản Trị</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Giám sát dữ liệu thời gian thực trên màn hình lớn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
          >
            <span>Mở Quản Trị</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compact 2-Column Hub Row: Minigame + Catering */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Minigame Arcade Hub */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                Khu Vực Minigame
              </h2>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                Hòm may mắn & vòng quay bàn nhậu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openMinigameHub}
            className="w-full py-2 px-3 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-[11px] shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
            <span>Chơi Minigame</span>
          </button>
        </div>

        {/* Catering & Party Planner Hub */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                Thực Đơn Tiệc
              </h2>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                50+ mâm cỗ 10–200 khách & báo giá
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isRegistered) {
                openAuthModal('register');
                return;
              }
              setActiveTab('party');
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <PartyPopper className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{isRegistered ? 'Lên Thực Đơn Tiệc' : 'Mở Khóa Tiệc 🔒'}</span>
          </button>
        </div>
      </div>

      {/* Theme Mode Preference: Compact Single-Row Toggle */}
      <div 
        onClick={toggleTheme}
        className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Giao Diện Hiển Thị: {isLight ? 'Chế Độ Sáng' : 'Chế Độ Tối'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isLight ? 'Nền sáng thanh lịch, dễ nhìn ban ngày' : 'Tông tối dịu mắt ban đêm'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isLight}
          aria-label="Chuyển đổi giao diện Sáng / Tối"
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
            isLight ? 'bg-[#1D4ED8]' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
              isLight ? 'translate-x-5 text-[#1D4ED8]' : 'translate-x-0 text-slate-600'
            }`}
          >
            {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </span>
        </button>
      </div>

      {/* Preferences Overview for Members vs Locked Features Showcase for Guests */}
      {!isRegistered ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Tính Năng Dành Cho Thành Viên</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[9.5px] font-black uppercase">
              Chế độ Khách 🔒
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Sổ Bếp & Ghi Âm</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  Lưu công thức gia truyền & ghi âm lời dặn của mẹ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                title="Mở Khóa Sổ Bếp Gia Đình"
                className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-black text-[10.5px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Mở Khóa Sổ Bếp</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <PartyPopper className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Lên Thực Đơn Tiệc</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  50+ mâm tiệc chuẩn 5 món & báo giá Zalo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                title="Mở Khóa Thực Đơn Tiệc"
                className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-black text-[10.5px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Mở Khóa Thực Đơn Tiệc</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={openWelcomeModal}
              title="Giới Thiệu Ứng Dụng"
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
              <span>Giới Thiệu Ứng Dụng</span>
            </button>
          </div>
        </div>
      ) : (
        /* Compact Preferences + Quick Actions Card for Registered Users */
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Cấu Hình & Hướng Dẫn
            </h2>
            <span className="text-[10.5px] text-slate-400 font-medium">
              Tùy chỉnh nhanh
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Khẩu vị vùng miền</span>
              <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                {onboardingData.regionPreference === 'bac' && 'Miền Bắc'}
                {onboardingData.regionPreference === 'nam' && 'Miền Nam'}
                {onboardingData.regionPreference === 'trung' && 'Miền Trung'}
                {onboardingData.regionPreference === 'toan-quoc' && 'Đa Dạng 3 Miền'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Khẩu phần gia đình</span>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                {onboardingData.familySize === 1 
                  ? (onboardingData.singleMealFormat === 'meal-set' ? '1 người • Mâm 3 món' : '1 người • Món đơn') 
                  : `${onboardingData.familySize} người ăn`}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase block">LỊCH BỮA TRƯA NGÀY THƯỜNG</span>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                {onboardingData.weekdayLunchRoutine === 'nau-ca-ngay'
                  ? '🏠 Nấu đủ cả ngày'
                  : onboardingData.weekdayLunchRoutine === 'hop-com-van-phong'
                  ? '🍱 Mang cơm hộp văn phòng'
                  : '🏫 Bán trú & Đi làm (T2 - T6 ăn ngoài)'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Ngân sách ngày</span>
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400 mt-0.5 truncate">
                {onboardingData.budgetLevel === 'tiet-kiem' && `Tiết kiệm • ~${(getDailyBudgetTarget('tiet-kiem', onboardingData.familySize || 4, onboardingData.specialNeeds) / 1000).toFixed(0)}k/ngày`}
                {onboardingData.budgetLevel === 'vua-phai' && `Vừa phải • ~${(getDailyBudgetTarget('vua-phai', onboardingData.familySize || 4, onboardingData.specialNeeds) / 1000).toFixed(0)}k/ngày`}
                {onboardingData.budgetLevel === 'thoai-mai' && `Thoải mái • ~${(getDailyBudgetTarget('thoai-mai', onboardingData.familySize || 4, onboardingData.specialNeeds) / 1000).toFixed(0)}k/ngày`}
              </p>
            </div>
          </div>

          {onboardingData.specialNeeds && onboardingData.specialNeeds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {onboardingData.specialNeeds.map(need => {
                const labelMap: Record<string, string> = {
                  'gym-protein': '🏋️ Tập Gym / Giàu Đạm',
                  'eat-clean': '🥗 Eat Clean / Ăn Healthy',
                  'western-food': '🥩 Món Âu / Kiểu Tây',
                  'single-prep': '🍱 Meal Prep 1 Người',
                  'nhieu-rau': 'Nhiều rau xanh',
                  'it-cay': 'Ít cay / Không ớt',
                  'chay': 'Mâm cơm ăn chay',
                  'nhanh-gon': 'Nấu nhanh < 30 phút'
                };
                return (
                  <span
                    key={need}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10.5px] font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#1D4ED8] dark:text-blue-400" />
                    <span>{labelMap[need] || need}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Compact Side-by-Side Action Buttons for Onboarding Reset & Tutorial Replay */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={resetOnboarding}
              className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Xem Lại Khảo Sát Khẩu Vị"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Đổi Khẩu Vị</span>
            </button>

            <button
              type="button"
              onClick={startTutorial}
              className="py-2 px-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Xem Lại Hướng Dẫn"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Hướng Dẫn</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openWelcomeModal}
            title="Giới Thiệu Ứng Dụng"
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
            <span>Giới Thiệu Ứng Dụng</span>
          </button>
        </div>
      )}

      {/* Compact Support Developer & Ad-Free Reward Hub */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        {/* Compact Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              Ủng Hộ & Không Quảng Cáo
            </span>
          </div>
          {adFreeRemainingMs > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Premium</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-bold shrink-0">
              Bản Tiêu Chuẩn
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Xem 3 video ngắn (~30s) để mở khóa trải nghiệm <strong>không quảng cáo</strong> hết hôm nay.
        </p>

        {/* Compact Side-by-Side 2-Column Counters */}
        <div className="grid grid-cols-2 gap-2">
          {/* Counter 1: Ads Watched Today */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase truncate">
                Tiến Độ Hôm Nay
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-baseline gap-1 mt-0.5">
                <span>{adTracking.adsWatchedToday}/{adTracking.dailyTarget}</span>
                <span className="text-[10px] font-medium text-slate-400">video</span>
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: adTracking.dailyTarget }).map((_, idx) => {
                const isFilled = idx < adTracking.adsWatchedToday;
                return (
                  <div
                    key={idx}
                    className={`w-2 h-4 rounded-xs transition-all ${
                      isFilled ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Counter 2: Ad-Free Time Remaining */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
            adFreeRemainingMs > 0
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
          }`}>
            <div className="min-w-0">
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase truncate">
                Không Quảng Cáo
              </span>
              <span className={`text-xs font-black tracking-tight flex items-center gap-1 mt-0.5 ${
                adFreeRemainingMs > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <Clock className="w-3 h-3 shrink-0" />
                <span className="tabular-nums font-mono">
                  {adFreeRemainingMs > 0 ? formatAdFreeTime(adFreeRemainingMs) : '00:00:00'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Compact Action Button */}
        <button
          type="button"
          onClick={() => {
            if (adTracking.adsWatchedToday >= adTracking.dailyTarget && adFreeRemainingMs > 0) {
              showToast('✨ Bạn đã xem đủ 3 video và kích hoạt trải nghiệm không quảng cáo hôm nay!');
              return;
            }
            openConfirmModal({
              title: 'Xem Video Nhận Trải Nghiệm Không Quảng Cáo',
              message: 'Xem 3 video ngắn (mỗi video ~30 giây, tổng khoảng 1,5 phút) để mở khóa trải nghiệm không quảng cáo đến hết ngày hôm nay. Bạn có muốn bắt đầu không?',
              confirmLabel: 'Bắt đầu xem (3 video • ~30s)',
              cancelLabel: 'Để sau',
              onConfirm: () => {
                setIsAdSequenceOpen(true);
              }
            });
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 shrink-0" />
          <span>
            {adTracking.adsWatchedToday >= adTracking.dailyTarget && adFreeRemainingMs > 0
              ? 'Đã Kích Hoạt Không Quảng Cáo'
              : 'Ủng Hộ Nhà Phát Triển'}
          </span>
        </button>
      </div>

      {/* Bảo Mật & Quyền Riêng Tư */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              Bảo Mật & Quyền Riêng Tư
            </span>
          </div>
        </div>

        <div className={`grid gap-2 ${isRegistered && user?.role !== 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button
            type="button"
            onClick={() => openAuthModal(isRegistered ? 'login' : 'register')}
            className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">
              {isRegistered ? 'Đổi Mật Khẩu' : 'Đăng Ký Tài Khoản'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Chính Sách Bảo Mật</span>
          </button>

          {isRegistered && user?.role !== 'admin' && (
            <button
              type="button"
              onClick={() => {
                openConfirmModal({
                  title: 'Xóa Tài Khoản Vĩnh Viễn',
                  message: 'Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân (thực đơn tuần, tủ lạnh, công thức đã lưu) trên thiết bị này? Hành động này không thể hoàn tác.',
                  confirmLabel: 'Xóa Tài Khoản',
                  cancelLabel: 'Giữ Lại',
                  isDanger: true,
                  onConfirm: deleteAccount
                });
              }}
              className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Xóa Tài Khoản</span>
            </button>
          )}
        </div>

        {/* iOS ATT & Privacy-Safe Personalization Control */}
        <div
          data-testid="account-att-privacy-row"
          className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
        >
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 block truncate">
              Quyền Cá Nhân Hóa Ưu Đãi
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
              {attStatus === 'authorized'
                ? 'Đã bật cá nhân hóa mâm cơm & quà tặng theo vùng miền'
                : 'Đang bật chế độ bảo vệ ẩn danh tuyệt đối trên thiết bị'}
            </span>
          </div>

          <button
            type="button"
            data-testid="toggle-att-consent-btn"
            onClick={() => {
              const nextChoice = attStatus === 'authorized' ? 'denied' : 'authorized';
              const updatedStatus = requestAttPermission(nextChoice);
              setAttStatus(updatedStatus);
              setSkanState(getSkanConversionState());
              showToast(
                updatedStatus === 'authorized'
                  ? '✅ Đã bật quyền cá nhân hóa thực đơn và ưu đãi!'
                  : '🛡️ Đã chuyển sang chế độ đo lường ẩn danh bảo vệ quyền riêng tư!'
              );
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
              attStatus === 'authorized'
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {attStatus === 'authorized' ? 'Đang Cho Phép' : 'Chế Độ Ẩn Danh'}
          </button>
        </div>
      </div>

      {/* Quà Tặng Người Mới & Đồng Bộ Trang Tải Tùy Chỉnh */}
      <div
        data-testid="account-cpp-campaign-hub"
        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              Quà Tặng & Thông Điệp Trang Tải
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-black shrink-0">
            Điểm Chuyển Đổi: {skanState.fineValue}/63 • {skanState.coarseLabelVi}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Đồng bộ giao diện ứng dụng khớp với từng thông điệp trang tải trên kho ứng dụng.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {CPP_CSL_CAMPAIGNS.map(camp => {
            const isSelected = activeCampaign.slug === camp.slug;
            return (
              <button
                key={camp.id}
                type="button"
                onClick={() => {
                  const next = setActiveCampaignBySlug(camp.slug, user?.email, user?.role);
                  setActiveCampaignState(next);
                  showToast(`🎯 Đã đồng bộ thông điệp: ${next.nameVi}`);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {camp.nameVi}
              </button>
            );
          })}
        </div>

        <div className="pt-1 flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 truncate min-w-0">
            {giftClaimed ? '🎁 Đã mở khóa Quà Tặng Người Mới (24h Không Quảng Cáo)' : '🎁 Quà Tặng Người Mới đang sẵn sàng'}
          </span>

          <button
            type="button"
            data-testid="account-claim-gift-btn"
            onClick={() => {
              claimNewUserGift(user?.email, user?.name || 'Thành viên mới', user?.role);
              const refreshedAd = loadAdTrackingState();
              setAdTracking(refreshedAd);
              setAdFreeRemainingMs(getAdFreeRemainingMs(refreshedAd.adFreeUntilTimestamp));
              setGiftClaimed(true);
              setSkanState(getSkanConversionState());
              showToast('🎁 Đã kích hoạt Quà Tặng Người Mới: 24 Giờ Không Quảng Cáo & Bộ Thực Đơn Đặc Quyền!');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shrink-0 whitespace-nowrap cursor-pointer transition-all active:scale-95"
          >
            {giftClaimed ? 'Đã Nhận Quà' : 'Nhận Quà Ngay'}
          </button>
        </div>
      </div>

      {/* In-App Privacy Policy & Terms Modal */}
      {isPrivacyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPrivacyModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 max-h-[85dvh] overflow-y-auto text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-base font-black">Chính Sách Bảo Mật & Điều Khoản</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Lưu trữ dữ liệu ưu tiên trên thiết bị:</strong> Thực đơn tuần, nguyên liệu tủ lạnh, giỏ đi chợ và sổ bếp gia đình của bạn được lưu trữ cục bộ an toàn ngay trên thiết bị di động.
              </p>
              <p>
                <strong>2. Quyền truy cập Micro:</strong> Mealy chỉ sử dụng quyền ghi âm khi bạn chủ động bấm nút thu âm lời dặn nấu ăn trong Sổ Bếp Gia Đình. Bản ghi âm chỉ phục vụ cho công thức của bạn.
              </p>
              <p>
                <strong>3. Chia sẻ giỏ đi chợ mua chung:</strong> Khi bạn tạo phòng đi chợ chung, danh sách nguyên liệu trong phòng đó sẽ tự động hủy sau tối đa 1 giờ để bảo vệ quyền riêng tư.
              </p>
              <p>
                <strong>4. Quyền xóa tài khoản & dữ liệu:</strong> Bạn có toàn quyền xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân bất kỳ lúc nào ngay trong mục Tài Khoản mà không cần liên hệ bộ phận hỗ trợ.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs cursor-pointer"
            >
              Đã Hiểu & Đóng
            </button>
          </div>
        </div>
      )}

      {/* 3-Video Sequence Player Modal */}
      <VolunteerAdSequenceModal
        isOpen={isAdSequenceOpen}
        onClose={() => setIsAdSequenceOpen(false)}
        onComplete={() => {
          const updated = recordVolunteerAdWatched(3);
          setAdTracking(updated);
          setAdFreeRemainingMs(getAdFreeRemainingMs(updated.adFreeUntilTimestamp));
          trackMmpEvent(
            'complete_rewarded_ad_sequence',
            { videos_watched: 3, reward_hours: 24 },
            user?.name || 'Thành viên',
            user?.email,
            user?.role
          );
          setSkanState(getSkanConversionState());
          showToast('👑 Chúc mừng! Bạn đã hoàn thành 3 video và mở khóa trải nghiệm không quảng cáo đến hết ngày hôm nay.');
        }}
      />
    </div>
  );
};
