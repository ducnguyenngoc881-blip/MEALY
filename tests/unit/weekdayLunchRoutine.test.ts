import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import { generateBudgetCompliantWeeklyPlan } from '../../src/utils/mealPlanGenerator';
import { INITIAL_ONBOARDING } from '../../src/context/MealWiseContext';

describe('Unit: Weekday Lunch Routine & School Bán Trú Optimization', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('ROUTINE-01: INITIAL_ONBOARDING defaults to ban-tru-di-lam for urban families', () => {
    expect(INITIAL_ONBOARDING.weekdayLunchRoutine).toBe('ban-tru-di-lam');
    expect(INITIAL_ONBOARDING.familySize).toBe(4);
  });

  it('ROUTINE-02: Generator skips Mon-Fri lunches when weekdayLunchRoutine is ban-tru-di-lam', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'bac',
      weekdayLunchRoutine: 'ban-tru-di-lam',
      seed: 12345
    });

    expect(plan.length).toBe(7);

    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const weekends = ['sat', 'sun'];

    // Monday through Friday: Lunch is strictly null and marked as skipped
    for (const d of plan) {
      if (weekdays.includes(d.dayId)) {
        expect(d.meals.lunch).toBeNull();
        expect(d.skippedSlots?.lunch).toBe(true);
        expect(d.slotNotes?.lunch).toContain('bán trú');
        // Dinner is always present
        expect(d.meals.dinner).toBeDefined();
        expect(d.meals.dinner).not.toBeNull();
      } else if (weekends.includes(d.dayId)) {
        // Weekend lunches are home cooked family meals
        expect(d.meals.lunch).toBeDefined();
        expect(d.meals.lunch).not.toBeNull();
        expect(d.meals.dinner).toBeDefined();
        expect(d.meals.dinner).not.toBeNull();
      }
    }
  });

  it('ROUTINE-03: Generator includes all 7 lunches when weekdayLunchRoutine is nau-ca-ngay or undefined', () => {
    const planFull = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'nam',
      weekdayLunchRoutine: 'nau-ca-ngay',
      seed: 9999
    });

    for (const d of planFull) {
      expect(d.meals.lunch).toBeDefined();
      expect(d.meals.lunch).not.toBeNull();
      expect(d.meals.dinner).toBeDefined();
      expect(d.meals.dinner).not.toBeNull();
    }

    // Default backward compatibility test (undefined routine)
    const planDefault = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'thoai-mai',
      seed: 8888
    });

    for (const d of planDefault) {
      expect(d.meals.lunch).toBeDefined();
      expect(d.meals.lunch).not.toBeNull();
    }
  });

  it('ROUTINE-04: OnboardingModal renders the Weekday Lunch Routine question in Step 2', () => {
    const onboardingCode = fs.readFileSync(path.join(srcDir, 'components/OnboardingModal.tsx'), 'utf-8');
    expect(onboardingCode).toContain('Lịch Nấu Bữa Trưa Ngày Thường (T2 - T6)');
    expect(onboardingCode).toContain('ban-tru-di-lam');
    expect(onboardingCode).toContain('Bán Trú & Đi Làm (Khuyên dùng)');
    expect(onboardingCode).toContain('nau-ca-ngay');
    expect(onboardingCode).toContain('Nấu Đủ Cả Ngày (Trưa & Tối)');
    expect(onboardingCode).toContain('hop-com-van-phong');
  });

  it('ROUTINE-05: WeeklyBoard provides 1-tap Bán Trú / Cơm Hộp card and quick toggle action', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    // Check toggleSkipSlot destructuring
    expect(weeklyCode).toContain('toggleSkipSlot');
    // Check dedicated Bán Trú & Cơm Hộp Card rendering
    expect(weeklyCode).toContain('activeDay.skippedSlots?.lunch');
    expect(weeklyCode).toContain('Lên món');
    expect(weeklyCode).toContain('Bữa Trưa (Bán Trú)');
    expect(weeklyCode).toContain('Bữa Trưa (Cơm Hộp)');
    expect(weeklyCode).toContain('Không nấu trưa');
  });

  it('ROUTINE-06: AccountView displays user Weekday Lunch Routine preference', () => {
    const accountCode = fs.readFileSync(path.join(srcDir, 'components/AccountView.tsx'), 'utf-8');
    expect(accountCode).toContain('LỊCH BỮA TRƯA NGÀY THƯỜNG');
    expect(accountCode).toContain('Bán trú & Đi làm (T2 - T6 ăn ngoài)');
  });

  it('ROUTINE-07: Generator skips Mon-Fri lunches when weekdayLunchRoutine is hop-com-van-phong', () => {
    const plan = generateBudgetCompliantWeeklyPlan({
      servings: 4,
      budgetLevel: 'vua-phai',
      regionPreference: 'bac',
      weekdayLunchRoutine: 'hop-com-van-phong',
      seed: 54321
    });

    expect(plan.length).toBe(7);

    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const weekends = ['sat', 'sun'];

    // Monday through Friday: Lunch is strictly null and marked as skipped with bento note
    for (const d of plan) {
      if (weekdays.includes(d.dayId)) {
        expect(d.meals.lunch).toBeNull();
        expect(d.skippedSlots?.lunch).toBe(true);
        expect(d.slotNotes?.lunch).toContain('Mang cơm hộp văn phòng');
        expect(d.meals.dinner).toBeDefined();
        expect(d.meals.dinner).not.toBeNull();
      } else if (weekends.includes(d.dayId)) {
        expect(d.meals.lunch).toBeDefined();
        expect(d.meals.lunch).not.toBeNull();
        expect(d.meals.dinner).toBeDefined();
        expect(d.meals.dinner).not.toBeNull();
      }
    }
  });

  it('ROUTINE-08: AccountView displays Mang cơm hộp văn phòng for hop-com-van-phong', () => {
    const accountCode = fs.readFileSync(path.join(srcDir, 'components/AccountView.tsx'), 'utf-8');
    expect(accountCode).toContain('Mang cơm hộp văn phòng');
  });
});
