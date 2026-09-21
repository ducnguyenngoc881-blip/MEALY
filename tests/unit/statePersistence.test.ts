import { describe, it, expect } from '../helpers/testRunner';
import { DailyMealPlan, StoreChannel, StoreChannelInfo, Recipe, VietnameseMealSet } from '../../src/types';
import { mockRecipes } from '../../src/data/mockRecipes';
import { mockMealSets } from '../../src/data/mockMealSets';

describe('Unit: State Models & Persistence Contracts', () => {
  it('should allow DailyMealPlan.meals.breakfast to accept VietnameseMealSet alongside Recipe', () => {
    const mealSetBreakfast: DailyMealPlan = {
      dayId: 'mon',
      dayName: 'Thứ Hai',
      meals: {
        breakfast: mockMealSets[0], // VietnameseMealSet in breakfast slot
        lunch: mockMealSets[1],
        dinner: mockRecipes[0]
      }
    };

    expect(mealSetBreakfast.meals.breakfast).toBeDefined();
    expect((mealSetBreakfast.meals.breakfast as VietnameseMealSet).id).toBe(mockMealSets[0].id);
    expect((mealSetBreakfast.meals.breakfast as VietnameseMealSet).title).toBe(mockMealSets[0].title);
  });

  it('should allow DailyMealPlan.meals.breakfast to accept null', () => {
    const emptyBreakfast: DailyMealPlan = {
      dayId: 'tue',
      dayName: 'Thứ Ba',
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null
      }
    };

    expect(emptyBreakfast.meals.breakfast).toBeNull();
  });

  it('should support optional date, dayOfWeek, totalCalories, totalCost on DailyMealPlan', () => {
    const richPlan: DailyMealPlan = {
      dayId: 'wed',
      dayName: 'Thứ Tư',
      date: '2026-09-16',
      dayOfWeek: 'Wednesday',
      meals: {
        breakfast: mockRecipes[1],
        lunch: mockMealSets[0],
        dinner: null
      },
      totalCalories: 1850,
      totalCost: 180000
    };

    expect(richPlan.date).toBe('2026-09-16');
    expect(richPlan.totalCalories).toBe(1850);
    expect(richPlan.totalCost).toBe(180000);
  });

  it('should validate 4-channel store filter types', () => {
    const validChannels: StoreChannel[] = [
      'all',
      'cho-dan-sinh',
      'winmart',
      'bach-hoa-xanh',
      'sap-doi-tac'
    ];

    expect(validChannels.length).toBe(5);
    expect(validChannels.includes('cho-dan-sinh')).toBe(true);
    expect(validChannels.includes('winmart')).toBe(true);
    expect(validChannels.includes('bach-hoa-xanh')).toBe(true);
    expect(validChannels.includes('sap-doi-tac')).toBe(true);
  });

  it('should correctly serialize and deserialize weeklyPlan JSON', () => {
    const samplePlan: DailyMealPlan[] = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: mockRecipes[0],
          lunch: mockMealSets[0],
          dinner: mockMealSets[1]
        }
      }
    ];

    const json = JSON.stringify(samplePlan);
    const restored: DailyMealPlan[] = JSON.parse(json);

    expect(restored.length).toBe(1);
    expect(restored[0].dayId).toBe('mon');
    expect(restored[0].meals.breakfast?.title).toBe(mockRecipes[0].title);
    expect(restored[0].meals.lunch?.title).toBe(mockMealSets[0].title);
  });

  it('should verify grocery checked state dictionary logic', () => {
    let checked: Record<string, boolean> = {};

    // Toggle on
    checked = { ...checked, ['thit-ba-chi-g']: !checked['thit-ba-chi-g'] };
    expect(checked['thit-ba-chi-g']).toBe(true);

    // Toggle off
    checked = { ...checked, ['thit-ba-chi-g']: !checked['thit-ba-chi-g'] };
    expect(checked['thit-ba-chi-g']).toBe(false);

    // Multiple items
    checked = {
      'thit-ba-chi-g': true,
      'hanh-kho-cu': true,
      'nuoc-mam-ml': false
    };

    const savedJson = JSON.stringify(checked);
    const loaded: Record<string, boolean> = JSON.parse(savedJson);

    expect(loaded['thit-ba-chi-g']).toBe(true);
    expect(loaded['hanh-kho-cu']).toBe(true);
    expect(loaded['nuoc-mam-ml']).toBe(false);
  });
});
