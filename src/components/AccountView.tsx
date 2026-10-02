import React, { useState, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { User, RotateCcw, Sun, Moon, CheckCircle2, PlayCircle, UserPlus, LogOut, ShieldCheck, Sparkles, KeyRound, Mail, UserCheck, Eye, EyeOff, X, Clock, Tv, Lock, LayoutDashboard, ArrowRight, Gamepad2 } from 'lucide-react';
import { VolunteerAdSequenceModal } from './VolunteerAdSequenceModal';
import { getDailyBudgetTarget } from '../utils/currency';
import { 
  loadAdTrackingState, 
  recordVolunteerAdWatched, 
  getAdFreeRemainingMs, 
  formatAdFreeTime,
  AdTrackingState 
} from '../utils/adTrackingService';

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
    openAuthModal,
    guestSession,
    setActiveTab,
    openMinigameHub
  } = useMealWise();
  const [isAdSequenceOpen, setIsAdSequenceOpen] = useState(false);
  const isLight = theme === 'light';

  // Volunteer Ads & Ad-Free Tracking State
  const [adTracking, setAdTracking] = useState<AdTrackingState>(loadAdTrackingState);
  const [adFreeRemainingMs, setAdFreeRemainingMs] = useState<number>(() =>
    getAdFreeRemainingMs(adTracking.adFreeUntilTimestamp)
  );

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
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Profile Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-2xs shrink-0">
            <User className="w-7 h-7 text-stone-700 dark:text-stone-300" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-stone-900 dark:text-white truncate">
                {user?.name || 'Tài Khoản Khách'}
              </h1>
              {isRegistered ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Đã Đăng Ký
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-500" /> Chế Độ Dùng Thử (Khách)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
              {user?.email 
                ? `Tài khoản: ${user.email} • ID: ${user.id || 'usr_registered'}` 
                : `Phiên dùng thử đang được lưu tự động (ID: ${guestSession?.guestId.slice(0, 14) || 'guest'}...). Đăng ký sẽ giữ nguyên toàn bộ thực đơn tuần!`}
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
            className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-rose-600 dark:text-rose-400 font-bold text-xs border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap self-stretch sm:self-auto"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Đăng Xuất</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap self-stretch sm:self-auto"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Đăng Nhập / Đăng Ký</span>
          </button>
        )}
      </div>

      {/* Admin Portal Gateway for Administrator Account */}
      {user?.role === 'admin' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-amber-500/40 text-white shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Website Quản Trị (Desktop Web Portal)</h3>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Dành riêng cho máy tính & màn hình lớn
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
              Admin
            </span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Hệ thống giám sát dữ liệu telemetry thời gian thực, quản lý cơ sở dữ liệu tài khoản, phân tích quảng cáo và phòng mua chung được phát triển chuyên biệt dưới dạng Website Desktop.
          </p>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <span>Mở Website Quản Trị Desktop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Minigame Arcade Hub (Moved from navbar to Account settings per user request) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border border-stone-800 dark:border-stone-200 flex items-center justify-center shrink-0 shadow-xs">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-stone-900 dark:text-white">
                  Khu Vực Minigame & Giải Trí
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Arcade Hub
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                Gợi ý món nhanh bằng hòm may mắn, vòng quay bàn nhậu và trò chơi tiệc tùng vui nhộn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openMinigameHub}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs shadow-md shadow-stone-900/10 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 whitespace-nowrap self-stretch sm:self-center cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span>Chơi Minigame</span>
          </button>
        </div>
      </div>

      {/* Theme Mode Preference: Sleek Interactive Toggle Switch */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
          <h2 className="text-base font-black text-stone-900 dark:text-white">
            Giao Diện Hiển Thị
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
            Tùy chỉnh tông màu sáng hoặc tối phù hợp cho mắt
          </p>
        </div>

        <div 
          onClick={toggleTheme}
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none ${
            isLight
              ? 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-stone-400 shadow-2xs'
              : 'bg-[#121110] border-[#252220] hover:border-stone-600 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              isLight
                ? 'bg-stone-100 text-stone-900 border border-stone-200 shadow-2xs'
                : 'bg-stone-800 text-stone-100 border border-stone-700 shadow-2xs'
            }`}>
              {isLight ? (
                <Sun className="w-5 h-5 transition-transform hover:rotate-45 duration-300" />
              ) : (
                <Moon className="w-5 h-5 transition-transform hover:-rotate-12 duration-300" />
              )}
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white tracking-tight">
                  {isLight ? 'Chế Độ Sáng' : 'Chế Độ Tối'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {isLight ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                {isLight 
                  ? 'Nền sáng thanh lịch, dễ nhìn ban ngày' 
                  : 'Tông đen sang trọng, dịu mắt ban đêm'}
              </p>
            </div>
          </div>

          {/* iOS-Style Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isLight}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-400 ${
              isLight ? 'bg-stone-900' : 'bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isLight ? 'translate-x-6 text-stone-900' : 'translate-x-0 text-stone-600'
              }`}
            >
              {isLight ? (
                <Sun className="h-4 w-4 text-stone-900" />
              ) : (
                <Moon className="h-4 w-4 text-stone-600" />
              )}
            </span>
          </button>
        </div>
      </div>


      {/* Preferences Overview */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Thông Tin Cấu Hình Hiện Tại
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1 min-h-[105px]">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">KHẨU VỊ VÙNG MIỀN</span>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {onboardingData.regionPreference === 'bac' && 'Miền Bắc'}
              {onboardingData.regionPreference === 'nam' && 'Miền Nam'}
              {onboardingData.regionPreference === 'trung' && 'Miền Trung'}
              {onboardingData.regionPreference === 'toan-quoc' && 'Đa Dạng 3 Miền'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1 min-h-[105px]">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">KHẨU PHẦN GIA ĐÌNH</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {onboardingData.familySize === 1 
                ? (onboardingData.singleMealFormat === 'meal-set' 
                    ? '1 người (Mâm cơm 3 món)' 
                    : '1 người (Món đơn gọn nhẹ)') 
                : `${onboardingData.familySize} người ăn`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1 min-h-[105px]">
            <div>
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">NGÂN SÁCH DỰ KIẾN</span>
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                {onboardingData.budgetLevel === 'tiet-kiem' && (
                  onboardingData.familySize === 1
                    ? `Tiết kiệm (~${getDailyBudgetTarget('tiet-kiem', 1, onboardingData.specialNeeds).toLocaleString('vi-VN')} đ/ngày • 3 bữa)`
                    : `Tiết kiệm (${onboardingData.specialNeeds?.includes('western-food') ? '~140k/mâm' : '~100k/mâm'} • ${getDailyBudgetTarget('tiet-kiem', onboardingData.familySize || 4, onboardingData.specialNeeds).toLocaleString('vi-VN')} đ/ngày cả nhà)`
                )}
                {onboardingData.budgetLevel === 'vua-phai' && (
                  onboardingData.familySize === 1
                    ? `Vừa phải (~${getDailyBudgetTarget('vua-phai', 1, onboardingData.specialNeeds).toLocaleString('vi-VN')} đ/ngày • 3 bữa)`
                    : `Vừa phải (${onboardingData.specialNeeds?.includes('western-food') ? '~180k/mâm' : '~140k/mâm'} • ${getDailyBudgetTarget('vua-phai', onboardingData.familySize || 4, onboardingData.specialNeeds).toLocaleString('vi-VN')} đ/ngày cả nhà)`
                )}
                {onboardingData.budgetLevel === 'thoai-mai' && (
                  onboardingData.familySize === 1
                    ? `Thoải mái (~${getDailyBudgetTarget('thoai-mai', 1, onboardingData.specialNeeds).toLocaleString('vi-VN')} đ/ngày • 3 bữa)`
                    : `Thoải mái (${onboardingData.specialNeeds?.includes('western-food') ? '>260k/mâm' : '>200k/mâm'} • ${getDailyBudgetTarget('thoai-mai', onboardingData.familySize || 4, onboardingData.specialNeeds).toLocaleString('vi-VN')} đ/ngày cả nhà)`
                )}
              </p>
            </div>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block font-medium">
              {onboardingData.familySize === 1
                ? 'Đã bao gồm 3 bữa ăn (sáng + trưa + tối) cho 1 người.'
                : `Hạn mức 1 ngày gồm 3 bữa: bữa sáng & 2 mâm cơm trưa + tối cho ${onboardingData.familySize || 4} người.`}
            </span>
          </div>
        </div>

        {onboardingData.specialNeeds && onboardingData.specialNeeds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
              TIÊU CHÍ ƯU TIÊN ĐÃ CHỌN
            </span>
            <div className="flex flex-wrap gap-2">
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
                    className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{labelMap[need] || need}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>






      {/* Reset Onboarding Action (Only for registered members) */}
      {isRegistered && (
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Thiết Lập Lại Khẩu Vị & Khẩu Phần
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Bạn có thể nhấn nút dưới đây để kích hoạt lại toàn bộ bảng câu hỏi Onboarding (chọn khẩu vị, số người, ngân sách).
              </p>
            </div>

            <button
              type="button"
              onClick={resetOnboarding}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 whitespace-nowrap self-stretch sm:self-center cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Xem Lại Khảo Sát Khẩu Vị (Onboarding)</span>
            </button>
          </div>
        </div>
      )}

      {/* Support Developer & Ad-Free Reward Hub */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-amber-500/25 dark:border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-ceramic-50 to-orange-500/5 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/30 shadow-sm space-y-4">
        {/* Header & Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 dark:border-white/5 pb-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Ủng Hộ & Trải Nghiệm Không Quảng Cáo</span>
              </span>
              {adFreeRemainingMs > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[10.5px] font-extrabold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Tài Khoản Premium</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/40 dark:border-stone-700 text-[10px] font-extrabold">
                  Bản Tiêu Chuẩn
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              Mỗi ngày xem 3 video ngắn (90s) để nâng cấp lên <strong>Tài Khoản Premium</strong>, trải nghiệm trọn vẹn không quảng cáo đến <strong>12h đêm (24:00)</strong>.
            </p>
          </div>
        </div>

        {/* 2 Live Counters: Daily Ads Watched & Ad-Free Usage Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Counter 1: Ads Watched Today */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 block uppercase tracking-wider">
                  Số Quảng Cáo Hôm Nay
                </span>
                <span className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>{adTracking.adsWatchedToday}</span>
                  <span className="text-xs font-semibold text-stone-400">/ {adTracking.dailyTarget} video mục tiêu</span>
                </span>
              </div>
            </div>

            {/* Visual Pips (3 pips) */}
            <div className="flex items-center gap-1 shrink-0" title={`Mục tiêu hàng ngày: ${adTracking.adsWatchedToday}/${adTracking.dailyTarget}`}>
              {Array.from({ length: adTracking.dailyTarget }).map((_, idx) => {
                const isFilled = idx < adTracking.adsWatchedToday;
                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-6 rounded-md transition-all ${
                      isFilled
                        ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-xs'
                        : 'bg-stone-200 dark:bg-stone-700/60'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Counter 2: Ad-Free App Usage Time Remaining */}
          <div className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between gap-3 transition-all ${
            adFreeRemainingMs > 0
              ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/35'
              : 'bg-white dark:bg-[#1A1918] border-[#E8E2D8] dark:border-[#252220]'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                adFreeRemainingMs > 0
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
              }`}>
                <ShieldCheck className="w-5 h-5 font-bold" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 block uppercase tracking-wider">
                  Thời Gian Không Quảng Cáo
                </span>
                <span className={`text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 ${
                  adFreeRemainingMs > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-stone-400 dark:text-stone-500'
                }`}>
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="tabular-nums font-mono">
                    {adFreeRemainingMs > 0 ? formatAdFreeTime(adFreeRemainingMs) : '00:00:00'}
                  </span>
                </span>
              </div>
            </div>

            <span className={`text-[10.5px] font-black px-2 py-1 rounded-xl shrink-0 ${
              adFreeRemainingMs > 0
                ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
            }`}>
              {adFreeRemainingMs > 0 ? 'Đến 12h đêm' : 'Chưa kích hoạt'}
            </span>
          </div>
        </div>

        {/* Redesigned Button */}
        <button
          type="button"
          onClick={() => {
            if (adTracking.adsWatchedToday >= adTracking.dailyTarget && adFreeRemainingMs > 0) {
              showToast('✨ Bạn đã xem đủ 3 video và kích hoạt Premium đến 12h đêm nay!');
              return;
            }
            openConfirmModal({
              title: 'Cam Kết Xem Chuỗi 3 Video Tự Nguyện',
              message: 'Quảng cáo tự nguyện bao gồm chuỗi 3 video ngắn (mỗi video 30 giây không thể bỏ qua, tổng cộng 90 giây). Hoàn thành sẽ tự động nâng cấp tài khoản của bạn lên Premium không quảng cáo đến 12h đêm nay (24:00). Bạn có muốn bắt đầu không?',
              confirmLabel: 'Tôi cam kết xem (3 video • 30s)',
              cancelLabel: 'Để sau',
              onConfirm: () => {
                setIsAdSequenceOpen(true);
              }
            });
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <PlayCircle className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          <span>
            {adTracking.adsWatchedToday >= adTracking.dailyTarget && adFreeRemainingMs > 0
              ? 'Đã Kích Hoạt Premium Hôm Nay'
              : 'Ủng Hộ Nhà Phát Triển'}
          </span>
        </button>
      </div>

      {/* 3-Video Sequence Player Modal */}
      <VolunteerAdSequenceModal
        isOpen={isAdSequenceOpen}
        onClose={() => setIsAdSequenceOpen(false)}
        onComplete={() => {
          const updated = recordVolunteerAdWatched(3);
          setAdTracking(updated);
          setAdFreeRemainingMs(getAdFreeRemainingMs(updated.adFreeUntilTimestamp));
          showToast('👑 Chúc mừng! Bạn đã hoàn thành 3 video và được nâng cấp Premium không quảng cáo đến 12h đêm nay.');
        }}
      />
    </div>
  );
};
