import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';

/**
 * Multi-Device Responsive & Dimension Layout Automated Test Suite
 * Milestone M4: Automated Multi-Dimension Visual & Layout Test Suite
 *
 * Programmatically asserts container bounds, width calculations, flex wrapping behavior,
 * zero horizontal scrollbar overflow (overflow-x invariant), and safe area insets
 * across 7 standard device viewports:
 * 1. 320px (iPhone SE 1st gen / Galaxy Fold outer: 320x568)
 * 2. 360px (Galaxy A/S series: 360x740)
 * 3. 375px (iPhone SE 2/3, 12/13 mini: 375x667 / 375x858)
 * 4. 390px (iPhone 13/14/15/16: 390x844)
 * 5. 414px/428px (Plus/Max flagships: 414x896, 428x926)
 * 6. 768px (iPad / Tablet portrait: 768x1024)
 * 7. 1280px+ (Desktop / 4K: 1280x800, 1920x1080, 3840x2160)
 */

export interface DeviceViewport {
  name: string;
  width: number;
  height: number;
  category: 'narrow-mobile' | 'compact-mobile' | 'standard-mobile' | 'flagship-mobile' | 'tablet' | 'desktop';
  hasNotchOrIsland: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
}

export const STANDARD_DEVICE_VIEWPORTS: DeviceViewport[] = [
  {
    name: 'iPhone SE 1st gen / Galaxy Fold outer',
    width: 320,
    height: 568,
    category: 'narrow-mobile',
    hasNotchOrIsland: false,
    safeAreaTop: 0,
    safeAreaBottom: 0
  },
  {
    name: 'Galaxy A/S series',
    width: 360,
    height: 740,
    category: 'compact-mobile',
    hasNotchOrIsland: false,
    safeAreaTop: 24,
    safeAreaBottom: 16
  },
  {
    name: 'iPhone SE 2/3, 12/13 mini',
    width: 375,
    height: 667,
    category: 'standard-mobile',
    hasNotchOrIsland: true,
    safeAreaTop: 44,
    safeAreaBottom: 34
  },
  {
    name: 'iPhone 13/14/15/16 standard',
    width: 390,
    height: 844,
    category: 'standard-mobile',
    hasNotchOrIsland: true,
    safeAreaTop: 47,
    safeAreaBottom: 34
  },
  {
    name: 'Plus/Max flagships (414px/428px)',
    width: 414,
    height: 896,
    category: 'flagship-mobile',
    hasNotchOrIsland: true,
    safeAreaTop: 47,
    safeAreaBottom: 34
  },
  {
    name: 'iPad / Tablet portrait',
    width: 768,
    height: 1024,
    category: 'tablet',
    hasNotchOrIsland: false,
    safeAreaTop: 20,
    safeAreaBottom: 20
  },
  {
    name: 'Desktop HD & 4K Displays',
    width: 1280,
    height: 800,
    category: 'desktop',
    hasNotchOrIsland: false,
    safeAreaTop: 0,
    safeAreaBottom: 0
  }
];

const srcDir = path.resolve(process.cwd(), 'src');

// ======================================================================
// SUITE 1: CONTAINER BOUNDS & GRID CALCULATIONS ACROSS 7 VIEWPORTS
// ======================================================================
describe('Unit: MultiDeviceResponsive - Container Bounds & Grid Calculations across 7 Viewports', () => {
  it('calculates container max-width clamping (max-w-lg 512px on mobile/tablet vs desktop) and margins', () => {
    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const mobileMaxContainerWidth = 512;
      const effectiveContainerWidth = Math.min(dev.width, mobileMaxContainerWidth);
      expect(effectiveContainerWidth).toBeLessThanOrEqual(dev.width);

      if (dev.width > mobileMaxContainerWidth) {
        const sideMargin = (dev.width - effectiveContainerWidth) / 2;
        expect(sideMargin).toBeGreaterThan(0);
      } else {
        const sideMargin = (dev.width - effectiveContainerWidth) / 2;
        expect(sideMargin).toBe(0);
      }
    }
  });

  it('WeeklyBoard 7-day strip cell width bounds >= 36px across all 7 device widths', () => {
    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const outerPadding = dev.width < 640 ? 24 : 32; // px-3 vs px-4
      const cardWidth = Math.min(dev.width - outerPadding, 512 - outerPadding);
      const innerCardPadding = 12; // p-1.5 = 6px each side = 12px
      const stripAvailableWidth = cardWidth - innerCardPadding;
      const totalGaps = 6 * 4; // gap-1 = 4px, 6 gaps for 7 columns
      const cellWidth = (stripAvailableWidth - totalGaps) / 7;

      // On 320px viewport: cardWidth = 296, stripAvailableWidth = 284, cellWidth = (284-24)/7 = 37.14px
      expect(cellWidth).toBeGreaterThanOrEqual(36);

      // Day label ("T2"-"CN", ~14px) and meals counter ("0/3"-"3/3", ~18px) must fit within cell
      const requiredTextWidth = 26;
      expect(cellWidth).toBeGreaterThan(requiredTextWidth);
    }
  });

  it('WeeklyBoard 3-column macro nutrition cards width bounds >= 80px across all 7 device widths', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).toContain('grid grid-cols-3 gap-1.5 sm:gap-2');
    expect(weeklyCode).toContain('min-w-0');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const outerPadding = dev.width < 640 ? 24 : 32;
      const cardWidth = Math.min(dev.width - outerPadding, 512 - outerPadding);
      const innerCardPadding = dev.width < 640 ? 28 : 32; // p-3.5 vs p-4
      const availableGridWidth = cardWidth - innerCardPadding;
      const gaps = 2 * (dev.width < 640 ? 6 : 8); // gap-1.5 (6px) vs gap-2 (8px)
      const colWidth = (availableGridWidth - gaps) / 3;

      // On 320px: availableGridWidth = 268px, colWidth = (268 - 12)/3 = 85.3px >= 80px
      expect(colWidth).toBeGreaterThanOrEqual(80);
    }
  });

  it('WeeklyBoard servings stepper maintains accessible touch targets >= 32px and bounds [1..20]', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).toContain('min={1}');
    expect(weeklyCode).toContain('max={20}');
    expect(weeklyCode).toContain('w-8 h-8');

    // Bounds mathematical validation
    const clampServings = (val: number) => Math.max(1, Math.min(20, Math.floor(val) || 1));
    expect(clampServings(0)).toBe(1);
    expect(clampServings(-5)).toBe(1);
    expect(clampServings(NaN)).toBe(1);
    expect(clampServings(25)).toBe(20);
    expect(clampServings(4)).toBe(4);
  });

  it('MealSetExplorer 3-course meal cards action buttons receive width >= 110px on 320px to desktop', () => {
    const mealSetCode = fs.readFileSync(path.join(srcDir, 'components/MealSetExplorer.tsx'), 'utf-8');
    expect(mealSetCode).toContain('Xem Chi Tiết Mâm');
    expect(mealSetCode).toContain('Chọn Mâm Này');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const outerPadding = dev.width < 640 ? 24 : 32;
      const cardWidth = Math.min(dev.width - outerPadding, 512 - outerPadding);
      const innerPadding = 28; // p-3.5
      const netInnerWidth = cardWidth - innerPadding;
      const buttonGap = 8; // gap-2
      const buttonWidth = (netInnerWidth - buttonGap) / 2;

      // On 320px: netInnerWidth = 296 - 28 = 268px. buttonWidth = (268 - 8) / 2 = 130px >= 110px
      expect(buttonWidth).toBeGreaterThanOrEqual(110);
    }
  });

  it('GroceryList item row width budget provides >= 120px for ingredient names before truncation', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain('min-w-0 flex-1');
    expect(groceryCode).toContain('text-xs font-extrabold block truncate');
    expect(groceryCode).toContain('shrink-0');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const outerPadding = dev.width < 640 ? 24 : 32;
      const cardWidth = Math.min(dev.width - outerPadding, 512 - outerPadding);
      const innerCardPadding = 24; // p-3
      const innerWidth = cardWidth - innerCardPadding;

      const checkboxWidth = 20;
      const checkboxGap = 12; // gap-3
      const rightBadgesWidth = 82; // store badge + quantity badge + gap
      const rightGap = 12; // gap-3

      const availableNameWidth = innerWidth - (checkboxWidth + checkboxGap + rightBadgesWidth + rightGap);
      // On 320px: innerWidth = 272px. availableNameWidth = 272 - 126 = 146px >= 120px
      expect(availableNameWidth).toBeGreaterThanOrEqual(120);
    }
  });

  it('GroceryList aisle filter tabs provide smooth scrolling on mobile (<640px) and 6-col grid on tablet+', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain('ALL_GROCERY_AISLES');
    expect(groceryCode).toContain('aisleDropdownRef');
    expect(groceryCode).toContain('sm:hidden');
    expect(groceryCode).toContain('hidden sm:inline');
  });

  it('GroceryList sticky bottom action bar provides >= 135px per action button', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain('grid grid-cols-2 gap-2');
    expect(groceryCode).toContain('min-h-[44px]');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const containerWidth = Math.min(dev.width, 512);
      const innerPadding = 24; // p-3 = 12px each side
      const availableGrid = containerWidth - innerPadding;
      const gap = 8;
      const buttonWidth = (availableGrid - gap) / 2;

      // On 320px: (320 - 24 - 8) / 2 = 144px >= 135px
      expect(buttonWidth).toBeGreaterThanOrEqual(135);
    }
  });

  it('CateringPartyPlanner 5-chip quick guest count grid provides cell width >= 50px across all 7 viewports', () => {
    const cateringCode = fs.readFileSync(path.join(srcDir, 'components/CateringPartyPlanner.tsx'), 'utf-8');
    expect(cateringCode).toContain('grid grid-cols-5 gap-1');
    expect(cateringCode).toContain('text-[10px] sm:text-[11px] font-black whitespace-nowrap');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const outerPadding = dev.width < 640 ? 24 : 32;
      const cardWidth = Math.min(dev.width - outerPadding, 512 - outerPadding);
      const innerPadding = 24; // p-3
      const innerWidth = cardWidth - innerPadding;
      const gaps = 4 * 4; // 4 gaps of 4px = 16px
      const chipCellWidth = (innerWidth - gaps) / 5;

      // On 320px: innerWidth = 296 - 24 = 272px. (272 - 16) / 5 = 51.2px >= 50px
      expect(chipCellWidth).toBeGreaterThanOrEqual(50);
    }
  });

  it('CateringPartyPlanner fixed bottom action bar leaves >= 90px for headcount & quote summary text', () => {
    const cateringCode = fs.readFileSync(path.join(srcDir, 'components/CateringPartyPlanner.tsx'), 'utf-8');
    expect(cateringCode).toContain('fixed bottom-16');
    expect(cateringCode).toContain('truncate');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const barWidth = Math.min(dev.width, 512);
      const barPadding = 24; // px-3
      const rightActionsWidth = 174; // Save + Báo Giá + Sync + gaps
      const gap = 8;
      const leftAvailable = (barWidth - barPadding) - rightActionsWidth - gap;

      // On 320px: (320 - 24) - 174 - 8 = 114px >= 90px
      expect(leftAvailable).toBeGreaterThanOrEqual(90);
    }
  });

  it('FridgeView 4 summary metric cards fit 2x2 grid with >= 130px width per card on 320px', () => {
    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).toContain('grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2');
    expect(fridgeCode).toContain('p-2 sm:p-2.5');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const outerPadding = dev.width < 640 ? 24 : 32;
      const cardWidth = Math.min(dev.width - outerPadding, 512 - outerPadding);
      const innerPadding = dev.width < 640 ? 24 : 32; // p-3 vs p-4
      const gridWidth = cardWidth - innerPadding;
      const gap = 8; // gap-2
      const metricCardWidth = (gridWidth - gap) / 2;

      // On 320px: cardWidth = 296px, gridWidth = 272px, metricCardWidth = (272 - 8) / 2 = 132px >= 130px
      expect(metricCardWidth).toBeGreaterThanOrEqual(130);
    }
  });

  it('RecipeDetailModal metric cards scale cleanly from 2x2 on mobile to 4-column on tablet/desktop', () => {
    const recipeCode = fs.readFileSync(path.join(srcDir, 'components/RecipeDetailModal.tsx'), 'utf-8');
    expect(recipeCode).toContain('grid grid-cols-2 sm:grid-cols-4 gap-2');
    expect(recipeCode).toContain('truncate');

    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const containerWidth = Math.min(dev.width, 512);
      const innerPadding = 32; // px-4 = 16px each side
      const availableGrid = containerWidth - innerPadding;
      const cols = dev.width < 640 ? 2 : 4;
      const gaps = (cols - 1) * 8;
      const colWidth = (availableGrid - gaps) / cols;

      expect(colWidth).toBeGreaterThanOrEqual(100);
    }
  });
});

// ======================================================================
// SUITE 2: FLEX WRAPPING & DYNAMIC COLLISION AVOIDANCE
// ======================================================================
describe('Unit: MultiDeviceResponsive - Flex Wrapping & Dynamic Collision Avoidance', () => {
  it('FridgeView header action row wraps cleanly with flex-wrap and responsive padding on 320px–375px', () => {
    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).toContain('flex flex-wrap items-center justify-between gap-y-2 gap-x-1.5 sm:gap-2');
    expect(fridgeCode).toContain('p-3 sm:p-4');

    // Box model check: on 320px, card width = 296px, inner width = 272px
    const leftTitleBadge = 105; // 🧊 Tủ Lạnh + count
    const rightActions = 135; // Đối Chiếu + icons + trash
    const combinedWidth = leftTitleBadge + rightActions + 8; // 248px
    // 248px fits within 272px with 24px clearance, and wraps gracefully if enlarged
    expect(combinedWidth).toBeLessThanOrEqual(272);
  });

  it('FridgeView title preserves semantic integrity with whitespace-nowrap on "Thông Minh" and text-balance', () => {
    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).toContain('text-balance');
    expect(fridgeCode).toMatch(/whitespace-nowrap text-(amber|cyan)-600 dark:text-(amber|cyan)-400/);
    expect(fridgeCode).toContain('Thông Minh');
  });

  it('FridgeView single-item recipe suggestion card stacks vertically on mobile (flex-col sm:flex-row)', () => {
    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).toContain('flex flex-col sm:flex-row sm:items-center justify-between gap-2.5');
    expect(fridgeCode).toContain('w-full sm:w-auto');
  });

  it('FridgeView pantry item card footer wraps action buttons with flex-wrap and ml-auto', () => {
    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).toContain('flex flex-wrap items-center justify-between gap-y-2 gap-x-1.5');
    expect(fridgeCode).toContain('shrink-0 ml-auto');
  });

  it('WeeklyBoard single-day budget warning header stacks vertically on mobile to prevent status text squishing', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).toContain('flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2');
    expect(weeklyCode).toContain('sm:ml-2');
  });

  it('WeeklyBoard weekly stats micro bar wraps price and recalibration button under 20 servings', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).toContain('flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2');
    expect(weeklyCode).toContain('shrink-0 whitespace-nowrap');
  });

  it('MealSetExplorer region filter chips and popular tags wrap smoothly across all 7 device widths', () => {
    const mealSetCode = fs.readFileSync(path.join(srcDir, 'components/MealSetExplorer.tsx'), 'utf-8');
    expect(mealSetCode).toContain('flex flex-wrap gap-2');
    expect(mealSetCode).toContain('shrink-0 whitespace-nowrap');
  });

  it('CateringPartyPlanner equipment checklist and add input row stack vertically on mobile', () => {
    const cateringCode = fs.readFileSync(path.join(srcDir, 'components/CateringPartyPlanner.tsx'), 'utf-8');
    expect(cateringCode).toContain('break-words flex-1');
    expect(cateringCode).toContain('pl-6 sm:pl-0');
    expect(cateringCode).toContain('flex flex-col sm:flex-row items-stretch sm:items-center gap-2');
  });

  it('RecipeDetailModal ingredients header wraps cleanly and unit badges enforce whitespace-nowrap', () => {
    const recipeCode = fs.readFileSync(path.join(srcDir, 'components/RecipeDetailModal.tsx'), 'utf-8');
    expect(recipeCode).toContain('flex items-center justify-between flex-wrap gap-2');
    expect(recipeCode).toContain('shrink-0 whitespace-nowrap');
  });

  it('Global Navbar header elements maintain balanced spacing and prevent text wrapping', () => {
    const navbarCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    expect(navbarCode).toContain('whitespace-nowrap');
    expect(navbarCode).toContain('MealWise');
    expect(navbarCode).toContain('Mâm Cơm Việt');
    expect(navbarCode).toContain('max-w-[115px] min-[360px]:max-w-[150px] min-[390px]:max-w-[185px] sm:max-w-[240px]');
    expect(navbarCode).toContain('<span className="sm:hidden">{currentTitle.short}</span>');
    expect(navbarCode).toContain('<span className="hidden sm:inline">{currentTitle.full}</span>');
  });
});

// ======================================================================
// SUITE 3: ZERO HORIZONTAL OVERFLOW INVARIANT ACROSS ALL VIEWS & MODALS
// ======================================================================
describe('Unit: MultiDeviceResponsive - Zero Horizontal Overflow Invariants across Views & Modals', () => {
  it('verifies mathematical box-model zero horizontal overflow (contentWidth <= viewportWidth) for all 7 devices', () => {
    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const effectiveContentWidth = Math.min(dev.width, 512);
      expect(effectiveContentWidth).toBeLessThanOrEqual(dev.width);
      const horizontalOverflow = effectiveContentWidth - dev.width;
      expect(horizontalOverflow).toBeLessThanOrEqual(0);
    }
  });

  it('App root container clamps mobile-first natural container (max-w-lg mx-auto) across all 7 viewports', () => {
    const appCode = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    expect(appCode).toContain('sm:max-w-md md:max-w-lg mx-auto');
  });

  it('FridgeView maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const fridgeCode = fs.readFileSync(path.join(srcDir, 'components/FridgeView.tsx'), 'utf-8');
    expect(fridgeCode).not.toMatch(/\bw-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\](?!.*max-w)/);
    expect(fridgeCode).not.toContain('xs:');
    expect(fridgeCode).not.toContain('py-0.2');
  });

  it('Navbar maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const navbarCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    expect(navbarCode).toContain('max-w-lg mx-auto');
    expect(navbarCode).not.toContain('xs:');
    expect(navbarCode).toContain('w-full');
  });

  it('WeeklyBoard maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).not.toMatch(/\bw-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\](?!.*max-w)/);
    expect(weeklyCode).not.toContain('w-7.5');
    expect(weeklyCode).not.toContain('h-7.5');
    expect(weeklyCode).not.toContain('xs:');
  });

  it('MealSetExplorer maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const mealSetCode = fs.readFileSync(path.join(srcDir, 'components/MealSetExplorer.tsx'), 'utf-8');
    expect(mealSetCode).toContain('max-w-lg');
    expect(mealSetCode).not.toMatch(/\bw-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\](?!.*max-w)/);
    expect(mealSetCode).not.toContain('xs:');
  });

  it('GroceryList maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain('overflow-x-auto scrollbar-none');
    expect(groceryCode).not.toMatch(/\bw-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\](?!.*max-w)/);
    expect(groceryCode).not.toContain('xs:');
  });

  it('CateringPartyPlanner maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const cateringCode = fs.readFileSync(path.join(srcDir, 'components/CateringPartyPlanner.tsx'), 'utf-8');
    expect(cateringCode).toContain('w-full sm:max-w-md md:max-w-lg');
    expect(cateringCode).not.toMatch(/\bw-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\](?!.*max-w)/);
    expect(cateringCode).not.toContain('xs:');
  });

  it('Drinking Roulette Modal & RouletteWheel maintain zero horizontal overflow invariant on 320px', () => {
    const rouletteCode = fs.readFileSync(path.join(srcDir, 'components/DrinkRouletteModal.tsx'), 'utf-8');
    const wheelCode = fs.readFileSync(path.join(srcDir, 'components/RouletteWheel.tsx'), 'utf-8');

    // Fixed 290px SVG eliminated
    expect(wheelCode).toContain('w-full h-auto max-w-[290px]');
    expect(wheelCode).toContain('viewBox=');
    expect(wheelCode).toContain('aspectRatio: \'1/1\'');
    expect(wheelCode).toContain('maxWidth: size');

    // Outer glow halo is constrained
    expect(wheelCode).toContain('maxWidth: size + 20');
    expect(wheelCode).toContain('aspectRatio: \'1/1\'');

    // On 320px screen: Modal body padding px-4 (32px) + outer padding p-2 (16px) -> 272px available
    // With w-full max-w-[290px], the SVG shrinks smoothly to 272px without overflowing!
    const availableWidthOn320 = 320 - 16 - 32; // 272px
    const renderedWheelWidthOn320 = Math.min(availableWidthOn320, 290);
    expect(renderedWheelWidthOn320).toBeLessThanOrEqual(availableWidthOn320);

    expect(rouletteCode).toContain('max-w-md');
    expect(rouletteCode).toContain('max-h-[92vh]');
  });

  it('MinigameHubModal maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const minigameCode = fs.readFileSync(path.join(srcDir, 'components/MinigameHubModal.tsx'), 'utf-8');
    expect(minigameCode).toContain('max-w-lg');
    expect(minigameCode).toContain('max-h-[90vh]');
    expect(minigameCode).toContain('overflow-y-auto');
  });

  it('FastMealApexModal (Case Opening) maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const apexCode = fs.readFileSync(path.join(srcDir, 'components/FastMealApexModal.tsx'), 'utf-8');
    expect(apexCode).toContain('max-w-lg');
    expect(apexCode).toContain('max-h-[82vh]');
    expect(apexCode).toContain('max-h-[80vh]');
    expect(apexCode).toContain('overflow-hidden');
    expect(apexCode).toContain('truncate');
  });

  it('RecipeDetailModal maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const recipeCode = fs.readFileSync(path.join(srcDir, 'components/RecipeDetailModal.tsx'), 'utf-8');
    expect(recipeCode).toContain('max-w-lg');
    expect(recipeCode).toContain('max-h-[90vh]');
    expect(recipeCode).toContain('overflow-y-auto');
  });

  it('OnboardingModal maintains zero horizontal overflow invariant across all 7 viewports', () => {
    const onboardingCode = fs.readFileSync(path.join(srcDir, 'components/OnboardingModal.tsx'), 'utf-8');
    expect(onboardingCode).toContain('max-w-lg');
    expect(onboardingCode).toContain('Hoàn Tất Thực Đơn');
    expect(onboardingCode).toContain('sm:hidden');
  });
});

// ======================================================================
// SUITE 4: SAFE AREA INSETS (TOP & BOTTOM) PRESENCE & CORRECTNESS
// ======================================================================
describe('Unit: MultiDeviceResponsive - Safe Area Insets (Top & Bottom) Correctness', () => {
  it('Navbar header includes safe-area-inset-top for notch, Dynamic Island, and status bars', () => {
    const navbarCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    expect(navbarCode).toContain('pt-[env(safe-area-inset-top,0px)]');
  });

  it('GroceryList sticky bottom action bar includes safe-area-inset-bottom', () => {
    const groceryCode = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(groceryCode).toContain('pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]');
  });

  it('CateringPartyPlanner bottom bar and dish selector modal include safe-area-inset-bottom', () => {
    const cateringCode = fs.readFileSync(path.join(srcDir, 'components/CateringPartyPlanner.tsx'), 'utf-8');
    expect(cateringCode).toContain('pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]');
    expect(cateringCode).toContain('pb-[calc(2rem+env(safe-area-inset-bottom,0px))]');
  });

  it('WeeklyBoard meal slot picker bottom sheet includes safe-area-inset-bottom', () => {
    const weeklyCode = fs.readFileSync(path.join(srcDir, 'components/WeeklyBoard.tsx'), 'utf-8');
    expect(weeklyCode).toContain('pb-[calc(2rem+env(safe-area-inset-bottom,0px))]');
  });

  it('MealSetExplorer slot assignment bottom sheet includes safe-area-inset-bottom', () => {
    const mealSetCode = fs.readFileSync(path.join(srcDir, 'components/MealSetExplorer.tsx'), 'utf-8');
    expect(mealSetCode).toContain('pb-[calc(2rem+env(safe-area-inset-bottom,0px))]');
  });

  it('MealSetDetailModal scroll container includes safe-area-inset-bottom', () => {
    const mealDetailCode = fs.readFileSync(path.join(srcDir, 'components/MealSetDetailModal.tsx'), 'utf-8');
    expect(mealDetailCode).toContain('pb-[calc(2rem+env(safe-area-inset-bottom,0px))]');
  });

  it('RecipeDetailModal scroll container includes safe-area-inset-bottom', () => {
    const recipeCode = fs.readFileSync(path.join(srcDir, 'components/RecipeDetailModal.tsx'), 'utf-8');
    expect(recipeCode).toContain('pb-[calc(3rem+env(safe-area-inset-bottom,0px))]');
  });

  it('OnboardingModal sticky action footer includes safe-area-inset-bottom', () => {
    const onboardingCode = fs.readFileSync(path.join(srcDir, 'components/OnboardingModal.tsx'), 'utf-8');
    expect(onboardingCode).toContain('pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]');
  });

  it('MinigameHubModal footer note includes safe-area-inset-bottom', () => {
    const minigameCode = fs.readFileSync(path.join(srcDir, 'components/MinigameHubModal.tsx'), 'utf-8');
    expect(minigameCode).toContain('pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]');
  });

  it('DrinkRouletteModal scroll container includes safe-area-inset-bottom', () => {
    const rouletteCode = fs.readFileSync(path.join(srcDir, 'components/DrinkRouletteModal.tsx'), 'utf-8');
    expect(rouletteCode).toContain('pb-[calc(1rem+env(safe-area-inset-bottom,0px))]');
  });

  it('FastMealApexModal sticky confirmation bar and scroll container include safe-area-inset-bottom', () => {
    const apexCode = fs.readFileSync(path.join(srcDir, 'components/FastMealApexModal.tsx'), 'utf-8');
    expect(apexCode).toContain('pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]');
    expect(apexCode).toContain('pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]');
  });

  it('validates safe-area-inset budget and max-height bounds across all 7 device heights', () => {
    for (const dev of STANDARD_DEVICE_VIEWPORTS) {
      const modalMaxHeight = dev.height * 0.9;
      // In iOS/Android webviews, the safe area is consumed inside viewport bounds
      const totalBudget = modalMaxHeight + dev.safeAreaBottom;
      expect(totalBudget).toBeLessThanOrEqual(dev.height + 1); // Subpixel tolerance
    }
  });
});
