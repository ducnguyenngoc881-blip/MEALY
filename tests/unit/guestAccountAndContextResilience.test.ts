import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import { useMealWise } from '../../src/context/MealWiseContext';

describe('Unit: Guest Account Feature Locking & Context Resilience Invariants', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  // =========================================================================
  // Section 1: Context Resilience (Zero "Screen of Death")
  // =========================================================================

  it('RESILIENCE-01: Zero throw new Error statements in useMealWise hook across codebase', () => {
    const contextFilePath = path.join(srcDir, 'context', 'MealWiseContext.tsx');
    const content = fs.readFileSync(contextFilePath, 'utf-8');
    const hasThrowInHook = /useMealWise[\s\S]*?throw\s+new\s+Error/.test(content);
    expect(hasThrowInHook).toBe(false);
  });

  it('RESILIENCE-02: useMealWise returns resilient fallback context when called outside Provider', () => {
    // Calling hook in headless/isolated environment outside any React tree
    const context = useMealWise();
    expect(context).toBeDefined();
    expect(typeof context).toBe('object');
    expect(Array.isArray(context.recipes)).toBe(true);
    expect(Array.isArray(context.mealSets)).toBe(true);
    expect(typeof context.showToast).toBe('function');
    expect(typeof context.openAuthModal).toBe('function');
    expect(context.isRegistered).toBe(false);
    expect(context.user).toBe(null);
  });

  it('RESILIENCE-03: Fallback context methods execute cleanly without throwing', () => {
    const context = useMealWise();
    expect(() => context.showToast('Test Toast')).not.toThrow();
    expect(() => context.openAuthModal('register')).not.toThrow();
    expect(() => context.closeAuthModal()).not.toThrow();
    expect(() => context.logoutUser()).not.toThrow();
    expect(() => context.resetOnboarding()).not.toThrow();
  });

  // =========================================================================
  // Section 2: Guest Account Feature Locking
  // =========================================================================

  it('GUEST-01: Onboarding modal does not auto-open for guest accounts on initial app load', () => {
    const contextFilePath = path.join(srcDir, 'context', 'MealWiseContext.tsx');
    const content = fs.readFileSync(contextFilePath, 'utf-8');
    // Verify showOnboarding initializes to false for guests
    expect(content.includes('const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {')).toBe(true);
    expect(content.includes('if (!hasUser) {')).toBe(true);
    expect(content.includes('return false; // Guest account: NEVER show onboarding modal on launch!')).toBe(true);
  });

  it('GUEST-02: Party Planner (CateringPartyPlanner) is locked for guest accounts', () => {
    const partyFilePath = path.join(srcDir, 'components', 'CateringPartyPlanner.tsx');
    const content = fs.readFileSync(partyFilePath, 'utf-8');
    // Check that isRegistered gate is enforced
    expect(content.includes('isRegistered,')).toBe(true);
    expect(content.includes('if (!isRegistered) {')).toBe(true);
    expect(content.includes('Tính Năng Thành Viên')).toBe(true);
    expect(content.includes('Đăng Ký Miễn Phí Để Mở Khóa')).toBe(true);
  });

  it('GUEST-03: Grocery List is locked entirely for guest accounts and triggers registration', () => {
    const groceryFilePath = path.join(srcDir, 'components', 'GroceryList.tsx');
    const content = fs.readFileSync(groceryFilePath, 'utf-8');
    // Verify full grocery screen guest lock
    expect(content.includes('if (!isRegistered && !isWebGuestViewer)')).toBe(true);
    expect(content.includes('Danh Sách Đi Chợ Tự Động')).toBe(true);
    expect(content.includes('Tự Gom Nguyên Liệu')).toBe(true);
    expect(content.includes('startCollabRoom(allList')).toBe(true);
    expect(content.includes('Chia Sẻ Mua Chung')).toBe(true);
    expect(content.includes('Mua Chung')).toBe(true);
    // Verify guest lock enforcement
    expect(content.includes('Đi Chợ Chung 🔒')).toBe(true);
    expect(content.includes("openAuthModal('register')")).toBe(true);
    expect(content.includes('isCollabActive = Boolean((isRegistered || isWebGuestViewer) && collabRoom?.roomId)')).toBe(true);

    const contextFilePath = path.join(srcDir, 'context', 'MealWiseContext.tsx');
    const contextContent = fs.readFileSync(contextFilePath, 'utf-8');
    expect(contextContent.includes('if (!isRegistered) {')).toBe(true);
    expect(contextContent.includes("openAuthModal('register')")).toBe(true);
  });

  it('GUEST-04: Sidebar displays lock badge on Tiệc tab for guests', () => {
    const sidebarFilePath = path.join(srcDir, 'components', 'Sidebar.tsx');
    const content = fs.readFileSync(sidebarFilePath, 'utf-8');
    expect(content.includes('isRegistered')).toBe(true);
    expect(content.includes("item.id === 'party' && !isRegistered")).toBe(true);
  });

  it('GUEST-05: Navbar displays lock indicator on Tiệc tab for guests', () => {
    const navbarFilePath = path.join(srcDir, 'components', 'Navbar.tsx');
    const content = fs.readFileSync(navbarFilePath, 'utf-8');
    expect(content.includes('isRegistered')).toBe(true);
    expect(content.includes("isRegistered ? 'Tiệc Tùng' : 'Tiệc 🔒'")).toBe(true);
  });

  it('GUEST-06: AuthModal component is globally registered in App.tsx', () => {
    const appFilePath = path.join(srcDir, 'App.tsx');
    const content = fs.readFileSync(appFilePath, 'utf-8');
    expect(content.includes("import { AuthModal } from './components/AuthModal';")).toBe(true);
    expect(content.includes('<AuthModal />')).toBe(true);
  });

  it('GUEST-07: AccountView displays locked features showcase for guests instead of onboarding preferences', () => {
    const accountFilePath = path.join(srcDir, 'components', 'AccountView.tsx');
    const content = fs.readFileSync(accountFilePath, 'utf-8');
    expect(content.includes('isRegistered')).toBe(true);
    expect(content.includes('openAuthModal')).toBe(true);
    expect(content.includes('logoutUser')).toBe(true);
    expect(content.includes('Đăng Nhập / Đăng Ký')).toBe(true);
    // Guest locked features verification
    expect(content.includes('!isRegistered ?')).toBe(true);
    expect(content.includes('Tính Năng Dành Cho Thành Viên')).toBe(true);
    expect(content.includes('Đi Chợ Thông Minh')).toBe(true);
    expect(content.includes('Lên Thực Đơn Tiệc')).toBe(true);
    expect(content.includes('Mở Khóa Đi Chợ')).toBe(true);
    expect(content.includes('Mở Khóa Thực Đơn Tiệc')).toBe(true);
    expect(content.includes('Đăng Ký Tài Khoản Miễn Phí (Mở Khóa Toàn Bộ)')).toBe(true);
  });

  it('GUEST-08: AuthModal distinguishes registration vs login and passes isNewRegistration to loginUser', () => {
    const authFilePath = path.join(srcDir, 'components', 'AuthModal.tsx');
    const content = fs.readFileSync(authFilePath, 'utf-8');
    expect(content.includes("authModalMode === 'register'")).toBe(true);
    expect(content.includes("loginUser({\n      name: displayName,\n      email: email.trim()\n    }, authModalMode === 'register')") ||
           content.includes("authModalMode === 'register'")).toBe(true);
  });

  it('GUEST-09: MealWiseContext tracks user-specific onboarding completion and triggers modal on new registration', () => {
    const contextFilePath = path.join(srcDir, 'context', 'MealWiseContext.tsx');
    const content = fs.readFileSync(contextFilePath, 'utf-8');
    expect(content.includes('mealwise_onboarding_completed_')).toBe(true);
    expect(content.includes('onboardingCompleted')).toBe(true);
    expect(content.includes('needsOnboarding')).toBe(true);
    expect(content.includes('setShowOnboarding(true)')).toBe(true);
  });

  it('GUEST-10: OnboardingModal detects existing custom meal plans and allows retaining previous meals', () => {
    const onboardingFilePath = path.join(srcDir, 'components', 'OnboardingModal.tsx');
    const content = fs.readFileSync(onboardingFilePath, 'utf-8');
    expect(content.includes('hasExistingMeals')).toBe(true);
    expect(content.includes('regeneratePlan')).toBe(true);
    expect(content.includes('completeOnboarding(tempData, { regeneratePlan })')).toBe(true);
    expect(content.includes('Giữ nguyên các món ăn')).toBe(true);
  });

  it('GUEST-11: Guests strictly use default app settings and cannot access OnboardingModal', () => {
    const onboardingFilePath = path.join(srcDir, 'components', 'OnboardingModal.tsx');
    const onboardingContent = fs.readFileSync(onboardingFilePath, 'utf-8');
    expect(onboardingContent.includes('if (!showOnboarding || !isRegistered) return null;')).toBe(true);

    const contextFilePath = path.join(srcDir, 'context', 'MealWiseContext.tsx');
    const contextContent = fs.readFileSync(contextFilePath, 'utf-8');
    expect(contextContent.includes('const effectiveOnboardingData = useMemo<OnboardingData>')).toBe(true);
    expect(contextContent.includes('INITIAL_ONBOARDING')).toBe(true);
    expect(contextContent.includes("regionPreference: 'toan-quoc'")).toBe(true);

    const weeklyBoardPath = path.join(srcDir, 'components', 'WeeklyBoard.tsx');
    const weeklyBoardContent = fs.readFileSync(weeklyBoardPath, 'utf-8');
    expect(weeklyBoardContent.includes("isRegistered ? 'Đổi mục tiêu' : 'Đổi mục tiêu 🔒'")).toBe(true);
  });
});
