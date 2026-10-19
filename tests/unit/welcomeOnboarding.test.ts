import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, registry } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import { useMealWise } from '../../src/context/MealWiseContext';
import { WelcomeOnboardingModal } from '../../src/components/WelcomeOnboardingModal';

describe('Unit: First-Launch Welcome Onboarding Modal (Dribbble 3-Slide Visual Mobile Onboarding)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('WELCOME-01: WelcomeOnboardingModal exists and follows React Rules of Hooks (early return strictly after hooks)', () => {
    const modalPath = path.join(srcDir, 'components', 'WelcomeOnboardingModal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);

    const content = fs.readFileSync(modalPath, 'utf-8');
    const earlyReturnIdx = content.indexOf('if (!showWelcomeModal && !forceOpen) return null;');
    expect(earlyReturnIdx).toBeGreaterThan(0);

    // Ensure no React hooks are called after the early return
    const afterEarlyReturn = content.slice(earlyReturnIdx);
    expect(/use(State|Effect|Callback|Memo|Ref)\s*\(/.test(afterEarlyReturn)).toBe(false);
  });

  it('WELCOME-02: Implements Dribbble 3-Slide Visual Hero Stage with SafeImage food photography and floating tilted UI collage', () => {
    const modalPath = path.join(srcDir, 'components', 'WelcomeOnboardingModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // Full-screen native mobile onboarding canvas
    expect(content).toContain('min-h-[100dvh]');
    expect(content).toContain('sm:rounded-[36px]');
    expect(content).toContain('SafeImage');
    expect(content).toContain('-rotate-3');
    expect(content).toContain('rotate-2');

    // Slide 1: Mealy intro & 3-dish Vietnamese meal sets
    expect(content).toContain('Chào Mừng Đến Với Mealy');
    expect(content).toContain('Hết Đau Đầu Nghĩ');
    expect(content).toContain('"Hôm Nay Ăn Gì?"');
    expect(content).toContain('Mặn • Canh • Rau');
    expect(content).toContain('2.200+ Món Việt');

    // Slide 2: 7-Day Smart Weekly Planner
    expect(content).toContain('Thực Đơn Tuần Thông Minh');
    expect(content).toContain('Lên Thực Đơn 7 Ngày');
    expect(content).toContain('Chỉ Với 1 Chạm');
    expect(content).toContain('Ngân sách 120k/ngày');
    expect(content).toContain('Tự động 1 chạm');

    // Slide 3: Smart Grocery Aggregation & Collaborative Shopping
    expect(content).toContain('Đi Chợ Nhanh & Mua Chung');
    expect(content).toContain('Gom Nguyên Liệu &');
    expect(content).toContain('Lọc Sẵn Gia Vị Bếp');
    expect(content).toContain('Giỏ Đi Chợ Thông Minh');
    expect(content).toContain('Đã lọc sẵn gia vị bếp');
    expect(content).toContain('Đi Chợ Chung');

    // Zero walls of text: problemSolved and highlights arrays removed
    expect(content).not.toContain('problemSolved');
  });

  it('WELCOME-03: Implements thumb-zone ergonomics, swipe gestures, expanding pill dots, and Slide 3 frictionless explore CTA without pushing sign-up', () => {
    const modalPath = path.join(srcDir, 'components', 'WelcomeOnboardingModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // 44px+/54px tap targets and swipe handlers
    expect(content).toContain('min-h-[44px]');
    expect(content).toContain('min-h-[54px]');
    expect(content).toContain('w-7 h-2 rounded-full bg-[#1D4ED8]');
    expect(content).toContain("width: isCurrent ? '28px' : '8px'");
    expect(content).toContain('cubic-bezier(0.22, 1, 0.36, 1)');
    expect(content).toContain('getSlideStageStyle');
    expect(content).toContain('getFloatingBadgeStyle');
    expect(content).toContain('onTouchStart');
    expect(content).toContain('onTouchEnd');
    expect(content).toContain('Bỏ qua');
    expect(content).toContain('Quay Lại');
    expect(content).toContain('Tiếp Theo');

    // Source-level verification: sign-up push CTA and handler strictly absent
    expect(content).toContain('welcome-start-explore-btn');
    expect(content).toContain('Bắt Đầu Khám Phá Ngay');
    expect(content).not.toContain('welcome-register-personalize-btn');
    expect(content).not.toContain('Đăng Ký & Cá Nhân Hóa Khẩu Vị');
    expect(content).not.toContain('handlePersonalizeCta');
    expect(content).not.toContain('openAuthModal');

    // Rendered DOM verification across Closed, Slide 1, Slide 2, Slide 3, and boundary slides
    const closedHtml = renderToStaticMarkup(React.createElement(WelcomeOnboardingModal));
    expect(closedHtml).toBe('');

    const slide1Html = renderToStaticMarkup(
      React.createElement(WelcomeOnboardingModal, { forceOpen: true, initialSlide: 0 })
    );
    expect(slide1Html).toContain('data-testid="welcome-visual-slide-1"');
    expect(slide1Html).toContain('data-testid="welcome-skip-btn"');
    expect(slide1Html).toContain('data-testid="welcome-next-btn"');
    expect(slide1Html).not.toContain('data-testid="welcome-prev-btn"');
    expect(slide1Html).not.toContain('data-testid="welcome-start-explore-btn"');
    expect(slide1Html).not.toContain('welcome-register-personalize-btn');

    const slide2Html = renderToStaticMarkup(
      React.createElement(WelcomeOnboardingModal, { forceOpen: true, initialSlide: 1 })
    );
    expect(slide2Html).toContain('data-testid="welcome-visual-slide-2"');
    expect(slide2Html).toContain('data-testid="welcome-prev-btn"');
    expect(slide2Html).toContain('data-testid="welcome-next-btn"');
    expect(slide2Html).not.toContain('data-testid="welcome-start-explore-btn"');
    expect(slide2Html).not.toContain('welcome-register-personalize-btn');

    const slide3Html = renderToStaticMarkup(
      React.createElement(WelcomeOnboardingModal, { forceOpen: true, initialSlide: 2 })
    );
    expect(slide3Html).toContain('data-testid="welcome-visual-slide-3"');
    expect(slide3Html).toContain('data-testid="welcome-prev-btn"');
    expect(slide3Html).toContain('Quay Lại');
    expect(slide3Html).toContain('data-testid="welcome-start-explore-btn"');
    expect(slide3Html).toContain('Bắt Đầu Khám Phá Ngay');
    expect(slide3Html).not.toContain('data-testid="welcome-next-btn"');
    expect(slide3Html).not.toContain('welcome-register-personalize-btn');
    expect(slide3Html).not.toContain('Đăng Ký &amp; Cá Nhân Hóa Khẩu Vị');
    expect(slide3Html).not.toContain('Đăng Ký & Cá Nhân Hóa Khẩu Vị');

    // Out-of-bounds slide indices clamp safely without throwing
    const clampedHighHtml = renderToStaticMarkup(
      React.createElement(WelcomeOnboardingModal, { forceOpen: true, initialSlide: 99 })
    );
    expect(clampedHighHtml).toContain('data-testid="welcome-visual-slide-3"');
    expect(clampedHighHtml).toContain('data-testid="welcome-start-explore-btn"');
  });

  it('WELCOME-04: Enforces strict Vietnamese UI cleanliness (no English explanations in parentheses)', () => {
    const modalPath = path.join(srcDir, 'components', 'WelcomeOnboardingModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    expect(content).not.toContain('(Onboarding)');
    expect(content).not.toContain('(Tutorial)');
    expect(content).not.toContain('(Lobby)');
    expect(content).not.toContain('(Live Sync)');
  });

  it('WELCOME-05: MealWiseContext manages showWelcomeModal state, v2 persistence key, and resilient fallback methods', () => {
    const contextPath = path.join(srcDir, 'context', 'MealWiseContext.tsx');
    const content = fs.readFileSync(contextPath, 'utf-8');

    expect(content).toContain('showWelcomeModal: boolean;');
    expect(content).toContain('setShowWelcomeModal: (show: boolean) => void;');
    expect(content).toContain('openWelcomeModal: () => void;');
    expect(content).toContain('completeWelcomeModal: () => void;');
    expect(content).toContain("localStorage.getItem('mealwise_welcome_onboarding_seen_v2')");
    expect(content).toContain("localStorage.setItem('mealwise_welcome_onboarding_seen_v2', 'true')");
    expect(content).toContain('navigator.webdriver');

    // Fallback context resilience verification inside a valid React functional component
    let capturedFallback: ReturnType<typeof useMealWise> | null = null;
    const ContextProbe: React.FC = () => {
      capturedFallback = useMealWise();
      return null;
    };
    renderToStaticMarkup(React.createElement(ContextProbe));
    expect(capturedFallback).toBeDefined();
    expect(capturedFallback!.showWelcomeModal).toBe(false);
    expect(typeof capturedFallback!.openWelcomeModal).toBe('function');
    expect(typeof capturedFallback!.completeWelcomeModal).toBe('function');
    expect(() => capturedFallback!.openWelcomeModal()).not.toThrow();
    expect(() => capturedFallback!.completeWelcomeModal()).not.toThrow();
  });

  it('WELCOME-06: App.tsx mounts WelcomeOnboardingModal and MealSetExplorer/AccountView/OnboardingModal provide replay triggers', () => {
    const appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    expect(appContent).toContain("import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';");
    expect(appContent).toContain('<WelcomeOnboardingModal />');

    const explorerContent = fs.readFileSync(path.join(srcDir, 'components', 'MealSetExplorer.tsx'), 'utf-8');
    expect(explorerContent).toContain('openWelcomeModal');
    expect(explorerContent).toContain('hero-open-welcome-btn');

    const accountContent = fs.readFileSync(path.join(srcDir, 'components', 'AccountView.tsx'), 'utf-8');
    expect(accountContent).toContain('openWelcomeModal');
    expect(accountContent).toContain('Giới Thiệu Ứng Dụng');

    const onboardingContent = fs.readFileSync(path.join(srcDir, 'components', 'OnboardingModal.tsx'), 'utf-8');
    expect(onboardingContent).toContain('openWelcomeModal');
    expect(onboardingContent).toContain('Giới Thiệu Mealy');
  });
});

// Support standalone execution via `tsx tests/unit/welcomeOnboarding.test.ts`
const invokedScript = (process.argv[1] || '').replace(/\\/g, '/');
if (invokedScript.endsWith('tests/unit/welcomeOnboarding.test.ts')) {
  registry.executeAll().then(({ failed }) => {
    registry.printSummary();
    if (failed > 0) process.exit(1);
  });
}
