import { describe, it, expect } from '../helpers/testRunner';
import { 
  APEX_TIERS, 
  generateApexLootDrop, 
  formatZaloOfficeInvite 
} from '../../src/data/fastMealData';
import { 
  setApexMuted, 
  getApexMuted, 
  playServoClick, 
  playChargingHum, 
  playUnlatchSnap, 
  playRarityFanfare,
  playHeavyImpact,
  playCardFlip,
  playSparkleChime
} from '../../src/utils/audioSynth';
import { ApexCaseTier } from '../../src/types';

describe('Unit: Apex Legends Case Opening & Fast Suggestion Meal (Office Worker Gamification)', () => {

  it('APEX-01: APEX_TIERS config defines all 3 distinct tiers (Blue, Purple, Gold) with accurate budgets and colors', () => {
    const tiers: ApexCaseTier[] = ['blue', 'purple', 'gold'];
    
    tiers.forEach(t => {
      const cfg = APEX_TIERS[t];
      expect(cfg).toBeDefined();
      expect(cfg.tier).toBe(t);
      expect(cfg.name.length).toBeGreaterThan(0);
      expect(cfg.badge.length).toBeGreaterThan(0);
      expect(cfg.priceRange.length).toBeGreaterThan(0);
      expect(cfg.colorHex.startsWith('#')).toBe(true);
      expect(cfg.description.length).toBeGreaterThan(0);
      expect(cfg.vibeQuote.length).toBeGreaterThan(0);
    });

    // Verify specific tier traits
    expect(APEX_TIERS.blue.colorHex).toBe('#00d4ff');
    expect(APEX_TIERS.blue.targetBudgetVnd).toBe(35000);
    expect(APEX_TIERS.blue.badge).toContain('TIẾT KIỆM');

    expect(APEX_TIERS.purple.colorHex).toBe('#a855f7');
    expect(APEX_TIERS.purple.targetBudgetVnd).toBe(65000);
    expect(APEX_TIERS.purple.badge).toContain('BÌNH DÂN');
    expect(APEX_TIERS.purple.name).toBe('Hộp Bình Dân');

    expect(APEX_TIERS.gold.colorHex).toBe('#f59e0b');
    expect(APEX_TIERS.gold.targetBudgetVnd).toBe(120000);
    expect(APEX_TIERS.gold.badge).toContain('ĂN SANG');
  });

  it('APEX-02: generateApexLootDrop generates valid 3-card drops (Main, Side, Office Drink) with accurate stats', () => {
    const blueDrop = generateApexLootDrop('blue');
    expect(blueDrop.tier).toBe('blue');
    expect(blueDrop.mainDish).toBeDefined();
    expect(blueDrop.mainDish.title.length).toBeGreaterThan(0);
    expect(blueDrop.mainDish.estimatedCostVnd).toBeGreaterThan(0);
    expect(blueDrop.mainDish.calories).toBeGreaterThan(0);

    expect(blueDrop.sideDish).toBeDefined();
    expect(blueDrop.sideDish.title.length).toBeGreaterThan(0);
    expect(blueDrop.sideDish.estimatedCostVnd).toBeGreaterThan(0);

    expect(blueDrop.officeDrink).toBeDefined();
    expect(blueDrop.officeDrink.title.length).toBeGreaterThan(0);
    expect(blueDrop.officeDrink.officeBuff.length).toBeGreaterThan(0);

    // Cost and calories aggregation
    const expectedCost = blueDrop.mainDish.estimatedCostVnd + blueDrop.sideDish.estimatedCostVnd + blueDrop.officeDrink.estimatedCostVnd;
    const expectedCalories = blueDrop.mainDish.calories + blueDrop.sideDish.calories + blueDrop.officeDrink.calories;
    expect(blueDrop.totalCostVnd).toBe(expectedCost);
    expect(blueDrop.totalCalories).toBe(expectedCalories);
  });

  it('APEX-03: Blue Tier (Tiết Kiệm) stays affordable for budget office lunch (<= 45,000 VND)', () => {
    for (let i = 0; i < 20; i++) {
      const drop = generateApexLootDrop('blue');
      expect(drop.tier).toBe('blue');
      expect(drop.totalCostVnd).toBeLessThanOrEqual(45000);
      expect(drop.totalCostVnd).toBeGreaterThanOrEqual(25000);
      expect(drop.totalCalories).toBeGreaterThanOrEqual(400);
    }
  });

  it('APEX-04: Purple Tier (Vừa Phải) reflects balanced standard office lunch (45,000 - 85,000 VND)', () => {
    for (let i = 0; i < 20; i++) {
      const drop = generateApexLootDrop('purple');
      expect(drop.tier).toBe('purple');
      expect(drop.totalCostVnd).toBeGreaterThanOrEqual(45000);
      expect(drop.totalCostVnd).toBeLessThanOrEqual(85000);
      expect(drop.totalCalories).toBeGreaterThanOrEqual(500);
    }
  });

  it('APEX-05: Gold Tier (Legendary Ăn Sang) offers premium luxury office treats (80,000 - 200,000 VND)', () => {
    for (let i = 0; i < 20; i++) {
      const drop = generateApexLootDrop('gold');
      expect(drop.tier).toBe('gold');
      expect(drop.totalCostVnd).toBeGreaterThanOrEqual(80000);
      expect(drop.totalCostVnd).toBeLessThanOrEqual(200000);
      expect(drop.totalCalories).toBeGreaterThanOrEqual(600);
    }
  });

  it('APEX-06: Office drinks include delightful office buffs for deadline fighters', () => {
    const drops = [
      generateApexLootDrop('blue'),
      generateApexLootDrop('purple'),
      generateApexLootDrop('gold')
    ];

    drops.forEach(d => {
      expect(d.officeDrink.officeBuff.length).toBeGreaterThan(0);
      expect(d.officeDrink.title.length).toBeGreaterThan(0);
    });
  });

  it('APEX-07: formatZaloOfficeInvite generates ready-to-share office chat text with dish names and price', () => {
    const sampleDrop = generateApexLootDrop('purple');
    const inviteText = formatZaloOfficeInvite(sampleDrop);

    expect(inviteText).toContain('KÈO ĂN TRƯA VĂN PHÒNG');
    expect(inviteText).toContain(sampleDrop.mainDish.title);
    expect(inviteText).toContain(sampleDrop.sideDish.title);
    expect(inviteText).toContain(sampleDrop.officeDrink.title);
    expect(inviteText).toContain(sampleDrop.totalCostVnd.toLocaleString('vi-VN'));
    expect(inviteText).toContain('11h30');
  });

  it('APEX-08: Web Audio Synthesizer handles headless environments and mute states safely without throwing', () => {
    // Test mute toggle
    setApexMuted(true);
    expect(getApexMuted()).toBe(true);

    // Calling sound functions while muted is safe
    expect(() => playServoClick()).not.toThrow();
    expect(() => playChargingHum(100)).not.toThrow();
    expect(() => playUnlatchSnap()).not.toThrow();
    expect(() => playHeavyImpact()).not.toThrow();
    expect(() => playCardFlip(0)).not.toThrow();
    expect(() => playCardFlip(1)).not.toThrow();
    expect(() => playCardFlip(2)).not.toThrow();
    expect(() => playSparkleChime()).not.toThrow();
    expect(() => playRarityFanfare('blue')).not.toThrow();
    expect(() => playRarityFanfare('purple')).not.toThrow();
    expect(() => playRarityFanfare('gold')).not.toThrow();

    // Unmute
    setApexMuted(false);
    expect(getApexMuted()).toBe(false);

    // Calling sound functions unmuted in headless node environment is also safe (AudioContext gracefully guarded)
    expect(() => playServoClick()).not.toThrow();
    expect(() => playChargingHum(100)).not.toThrow();
    expect(() => playUnlatchSnap()).not.toThrow();
    expect(() => playHeavyImpact()).not.toThrow();
    expect(() => playCardFlip(0)).not.toThrow();
    expect(() => playSparkleChime()).not.toThrow();
    expect(() => playRarityFanfare('gold')).not.toThrow();
  });

});
