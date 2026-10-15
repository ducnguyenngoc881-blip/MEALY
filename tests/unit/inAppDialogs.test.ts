import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import { ConfirmDialogState } from '../../src/types';

describe('Unit: In-App Confirmation Modal & Dialog Shield (Zero Chrome Popups)', () => {
  const componentsDir = path.resolve(process.cwd(), 'src/components');

  it('DIALOG-01: Zero browser-native window.confirm calls in src/components', () => {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      const hasWindowConfirm = /\bwindow\.confirm\s*\(/.test(content);
      expect(hasWindowConfirm).toBe(false);
    }
  });

  it('DIALOG-02: Zero browser-native window.alert calls in src/components', () => {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      const hasWindowAlert = /\bwindow\.alert\s*\(/.test(content);
      expect(hasWindowAlert).toBe(false);
    }
  });

  it('DIALOG-03: Zero bare alert() or confirm() calls in src/components', () => {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      // Match bare alert( or confirm( not preceded by a dot or property
      const hasBareAlert = /(?<!\.)\balert\s*\(/.test(content);
      const hasBareConfirm = /(?<!\.)\bconfirm\s*\(/.test(content);
      expect(hasBareAlert).toBe(false);
      expect(hasBareConfirm).toBe(false);
    }
  });

  it('DIALOG-04: ConfirmModal component exists and provides accessible in-app modal', () => {
    const modalPath = path.join(componentsDir, 'ConfirmModal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);
    const content = fs.readFileSync(modalPath, 'utf-8');
    expect(content.includes('role="dialog"')).toBe(true);
    expect(content.includes('aria-modal="true"')).toBe(true);
    expect(content.includes('Escape')).toBe(true);
    expect(content.includes('confirmDialog')).toBe(true);
  });

  it('DIALOG-05: App.tsx mounts ConfirmModal in GlobalModals', () => {
    const appPath = path.resolve(process.cwd(), 'src/App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    expect(content.includes("import { ConfirmModal } from './components/ConfirmModal';")).toBe(true);
    expect(content.includes('<ConfirmModal />')).toBe(true);
  });

  it('DIALOG-06: FridgeView uses openConfirmModal for clearing pantry', () => {
    const fridgeViewPath = path.join(componentsDir, 'FridgeView.tsx');
    const content = fs.readFileSync(fridgeViewPath, 'utf-8');
    expect(content.includes('openConfirmModal')).toBe(true);
    expect(content.includes('Dọn Sạch Tủ Lạnh')).toBe(true);
    expect(content.includes('isDanger: true')).toBe(true);
  });

  it('DIALOG-07: FridgeLeftoverModal uses openConfirmModal for clearing pantry', () => {
    const leftoverModalPath = path.join(componentsDir, 'FridgeLeftoverModal.tsx');
    const content = fs.readFileSync(leftoverModalPath, 'utf-8');
    expect(content.includes('openConfirmModal')).toBe(true);
    expect(content.includes('Dọn Sạch Tủ Lạnh')).toBe(true);
  });

  it('DIALOG-08: FastMealApexModal uses openConfirmModal for resetting dish collection', () => {
    const apexModalPath = path.join(componentsDir, 'FastMealApexModal.tsx');
    const content = fs.readFileSync(apexModalPath, 'utf-8');
    expect(content.includes('openConfirmModal')).toBe(true);
    expect(content.includes('Đặt Lại Kho Món Ăn')).toBe(true);
  });

  it('DIALOG-09: WeeklyBoard uses openConfirmModal for clearing weekly menu', () => {
    const weeklyBoardPath = path.join(componentsDir, 'WeeklyBoard.tsx');
    const content = fs.readFileSync(weeklyBoardPath, 'utf-8');
    expect(content.includes('openConfirmModal')).toBe(true);
    expect(content.includes('Xóa Thực Đơn Tuần')).toBe(true);
  });

  it('DIALOG-10: Main entry point installs Dialog Shield to block native popups', () => {
    const mainPath = path.resolve(process.cwd(), 'src/main.tsx');
    const content = fs.readFileSync(mainPath, 'utf-8');
    expect(content.includes('window.alert =')).toBe(true);
    expect(content.includes('window.confirm =')).toBe(true);
    expect(content.includes('window.prompt =')).toBe(true);
  });

  it('DIALOG-11: VolunteerAdSequenceModal provides non-skippable 3-video sequence player', () => {
    const adModalPath = path.join(componentsDir, 'VolunteerAdSequenceModal.tsx');
    expect(fs.existsSync(adModalPath)).toBe(true);
    const content = fs.readFileSync(adModalPath, 'utf-8');
    expect(content.includes('role="dialog"')).toBe(true);
    expect(content.includes('aria-modal="true"')).toBe(true);
    expect(content.includes('VIDEO_DURATION = 30')).toBe(true);
    expect(content.includes('Quảng Cáo Tự Nguyện')).toBe(true);
    expect(content.includes('Video ${currentVideoIndex + 1}/3')).toBe(true);
  });

  it('DIALOG-12: AccountView enforces 3-video sequence confirmation commitment', () => {
    const accountViewPath = path.join(componentsDir, 'AccountView.tsx');
    const content = fs.readFileSync(accountViewPath, 'utf-8');
    expect(content.includes('Xem Video Nhận Trải Nghiệm Không Quảng Cáo')).toBe(true);
    expect(content.includes('Bắt đầu xem (3 video • ~30s)')).toBe(true);
    expect(content.includes('VolunteerAdSequenceModal')).toBe(true);
  });
});

