import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';

describe('Unit: Interactive Tutorial Walkthrough (Golden Loop)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('TUTORIAL-01: InteractiveTutorialModal component exists and implements blur, SVG spotlight cutout, and pulse ring', () => {
    const modalPath = path.join(srcDir, 'components/InteractiveTutorialModal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);

    const modalCode = fs.readFileSync(modalPath, 'utf-8');
    // Spotlight SVG mask with cutout
    expect(modalCode).toContain('mask id="tutorial-spotlight-mask"');
    expect(modalCode).toContain('backdrop-blur');
    expect(modalCode).toContain('fill="rgba(15, 12, 10,');
    // Animated glowing ring around target
    expect(modalCode).toContain('animate-pulse');
    expect(modalCode).toContain('ring-amber-400');
    // Rules of Hooks compliance: returns null strictly after all hooks
    expect(modalCode).toContain('if (!isTutorialOpen) return null;');
    // Persistence on completion
    expect(modalCode).toContain("localStorage.setItem('mealwise_tutorial_completed', 'true')");
  });

  it('TUTORIAL-02: Defines the 8-step Golden Loop sequence correctly', () => {
    const modalCode = fs.readFileSync(path.join(srcDir, 'components/InteractiveTutorialModal.tsx'), 'utf-8');
    // Step 1: WeeklyBoard - 1-Click Generator
    expect(modalCode).toContain("tab: 'weekly'");
    expect(modalCode).toContain('[data-tutorial-target="weekly-autofill-btn"]');
    // Step 2: WeeklyBoard - "Đi Chợ" Action Button
    expect(modalCode).toContain('[data-tutorial-target="weekly-grocery-btn"]');
    // Step 3: Spices Cabinet
    expect(modalCode).toContain("tab: 'grocery'");
    expect(modalCode).toContain('[data-tutorial-target="spices-cabinet-btn"]');
    // Step 4: Grocery List Showcase / Aisle Categorization
    expect(modalCode).toContain('[data-tutorial-target="grocery-first-three-items"]');
    // Step 5: Grocery List Checkboxes & Select All
    expect(modalCode).toContain('[data-tutorial-target="grocery-select-all-btn"]');
    // Step 6: Groceries Lobby / Collaborative Shopping
    expect(modalCode).toContain('[data-tutorial-target="collab-lobby-btn"]');
    // Step 7: Stock Fridge
    expect(modalCode).toContain('[data-tutorial-target="stock-fridge-btn"]');
    // Step 8: Fridge View & Leftovers
    expect(modalCode).toContain("tab: 'pantry'");
    expect(modalCode).toContain('[data-tutorial-target="fridge-compartments-tab"]');
  });

  it('TUTORIAL-03: MealWiseContext manages tutorial state and triggers after onboarding', () => {
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    expect(contextCode).toContain('isTutorialOpen: boolean;');
    expect(contextCode).toContain('setIsTutorialOpen: (open: boolean) => void;');
    expect(contextCode).toContain('startTutorial: () => void;');
    // Auto-trigger in completeOnboarding
    expect(contextCode).toContain("localStorage.getItem('mealwise_tutorial_completed')");
    expect(contextCode).toContain('setIsTutorialOpen(true)');
  });

  it('TUTORIAL-04: Target DOM elements in WeeklyBoard, GroceryList, and FridgeView have matching attributes', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).toContain('data-tutorial-target="weekly-autofill-btn"');

    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain('data-tutorial-target="spices-cabinet-btn"');
    expect(groceryCode).toContain('data-tutorial-target="grocery-first-three-items"');
    expect(groceryCode).toContain('data-tutorial-target="grocery-select-all-btn"');
    expect(groceryCode).toContain('data-tutorial-target="collab-lobby-btn"');
    expect(groceryCode).toContain('data-tutorial-target="stock-fridge-btn"');

    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).toContain('data-tutorial-target="fridge-compartments-tab"');
  });

  it('TUTORIAL-05: App mounts InteractiveTutorialModal in GlobalModals', () => {
    const appCode = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    expect(appCode).toContain("import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';");
    expect(appCode).toContain('<InteractiveTutorialModal />');
  });

  it('TUTORIAL-06: AccountView allows users to replay the tutorial walkthrough', () => {
    const accountCode = fs.readFileSync(path.join(srcDir, 'components/AccountView.tsx'), 'utf-8');
    expect(accountCode).toContain('startTutorial');
    expect(accountCode).toContain('Xem Lại Hướng Dẫn');
  });

  it('TUTORIAL-07: Scopes tutorial completed flag per user account to prevent guest session suppression', () => {
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    expect(contextCode).toContain('mealwise_tutorial_completed_');
    expect(contextCode).toContain('localStorage.removeItem(`mealwise_tutorial_completed_${emailLower}`)');

    const modalCode = fs.readFileSync(path.join(srcDir, 'components/InteractiveTutorialModal.tsx'), 'utf-8');
    expect(modalCode).toContain('mealwise_tutorial_completed_');
  });

  it('TUTORIAL-08: Onboarding skip option also triggers interactive tutorial for newly registered users', () => {
    const onboardingCode = fs.readFileSync(path.join(srcDir, 'components/OnboardingModal.tsx'), 'utf-8');
    expect(onboardingCode).toContain('setIsTutorialOpen(true)');
  });

  it('TUTORIAL-09: Implements strict scroll lock during tutorial walkthrough', () => {
    const modalCode = fs.readFileSync(path.join(srcDir, 'components/InteractiveTutorialModal.tsx'), 'utf-8');
    expect(modalCode).toContain("document.body.style.overflow = 'hidden'");
    expect(modalCode).toContain("document.documentElement.style.overflow = 'hidden'");
    expect(modalCode).toContain("document.body.style.touchAction = 'none'");
    expect(modalCode).toContain("window.addEventListener('touchmove', preventScroll");
    expect(modalCode).toContain("window.addEventListener('wheel', preventScroll");
  });

  it('TUTORIAL-10: Reverts activeTab back to weekly menu (Thực Đơn) upon completing or skipping tutorial', () => {
    const modalCode = fs.readFileSync(path.join(srcDir, 'components/InteractiveTutorialModal.tsx'), 'utf-8');
    expect(modalCode).toContain("setActiveTab('weekly')");
    expect(modalCode).toContain("window.scrollTo({ top: 0, left: 0, behavior: 'instant' })");
  });

  it('TUTORIAL-11: Suppresses tutorial on subsequent configuration edits for existing users', () => {
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    // Verifies guard checking isFirstTimeOnboarding or isAlreadyOnboarded
    expect(contextCode).toContain('isAlreadyOnboarded');
    expect(contextCode).toContain('isFirstTimeOnboarding');
    // Verifies resetOnboarding preserves completed flags instead of resetting tutorial
    expect(contextCode).not.toContain("localStorage.removeItem('mealwise_tutorial_completed');\n    }\n    setShowOnboarding(true);");
  });
});

