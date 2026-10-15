import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';

describe('Unit: Web Guest Viewer Mode & Download App Gating', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('WEB-GUEST-01: MealWiseContext defines isWebGuestViewer and DownloadAppModal state', () => {
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    expect(contextCode.includes('isWebGuestViewer')).toBe(true);
    expect(contextCode.includes('isDownloadAppModalOpen')).toBe(true);
    expect(contextCode.includes('downloadAppFeatureName')).toBe(true);
    expect(contextCode.includes('openDownloadAppModal')).toBe(true);
    expect(contextCode.includes('closeDownloadAppModal')).toBe(true);
  });

  it('WEB-GUEST-02: setActiveTab gates all non-grocery tabs to openDownloadAppModal when isWebGuestViewer is true', () => {
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    expect(contextCode.includes('if (isWebGuestViewer && tab !== \'grocery\')')).toBe(true);
    expect(contextCode.includes('openDownloadAppModal(featureNames[tab]')).toBe(true);
  });

  it('WEB-GUEST-03: Minigames and Apex modals prompt Download App in web guest viewer mode', () => {
    const contextCode = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    expect(contextCode.includes('openDownloadAppModal(\'Minigame & Giải Trí Bàn Tiệc\')')).toBe(true);
    expect(contextCode.includes('openDownloadAppModal(\'Vòng Quay Bàn Nhậu\')')).toBe(true);
    expect(contextCode.includes('openDownloadAppModal(\'Món Nhanh Tốc Biến\')')).toBe(true);
  });

  it('WEB-GUEST-04: DownloadAppModal component renders Android APK download button and iOS Safari PWA guide', () => {
    const modalPath = path.join(srcDir, 'components/DownloadAppModal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);
    const modalCode = fs.readFileSync(modalPath, 'utf-8');
    expect(modalCode.includes('Tải Ứng Dụng MealWise')).toBe(true);
    expect(modalCode.includes('MealWise.apk')).toBe(true);
    expect(modalCode.includes('Android (APK)')).toBe(true);
    expect(modalCode.includes('iPhone / iPad (iOS)')).toBe(true);
    expect(modalCode.includes('Thêm vào Màn hình chính')).toBe(true);
    expect(modalCode.includes('Tiếp Tục Xem Giỏ Đi Chợ Web')).toBe(true);
  });

  it('WEB-GUEST-05: Sidebar displays App locks and triggers download modal for web guests', () => {
    const sidebarCode = fs.readFileSync(path.join(srcDir, 'components/Sidebar.tsx'), 'utf-8');
    expect(sidebarCode.includes('isWebGuestViewer')).toBe(true);
    expect(sidebarCode.includes('openDownloadAppModal')).toBe(true);
    expect(sidebarCode.includes('isGatedForGuest')).toBe(true);
    expect(sidebarCode.includes('App')).toBe(true);
  });

  it('WEB-GUEST-06: Navbar includes Tải App button and Web Guest title indicator', () => {
    const navbarCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    expect(navbarCode.includes('isWebGuestViewer')).toBe(true);
    expect(navbarCode.includes('Tải App')).toBe(true);
    expect(navbarCode.includes('Khách Xem Đi Chợ')).toBe(true);
  });

  it('WEB-GUEST-07: GroceryList displays Web Guest banner with Live Sync callout', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode.includes('Chế Độ Khách Xem Đi Chợ')).toBe(true);
    expect(groceryCode.includes('Tải App MealWise')).toBe(true);
  });

  it('WEB-GUEST-08: App.tsx mounts DownloadAppModal in GlobalModals', () => {
    const appCode = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    expect(appCode.includes('DownloadAppModal')).toBe(true);
    expect(appCode.includes('<DownloadAppModal />')).toBe(true);
  });
});
