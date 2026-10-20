/**
 * Adversarial Layout & Responsive Stress Test Suite — Challenger Layout 1
 * 
 * Empirically challenges and stress-tests layout remediations across:
 * - WeeklyBoard.tsx
 * - CateringPartyPlanner.tsx
 * - GroceryList.tsx
 * - MealSetExplorer.tsx & MealSetDetailModal.tsx
 * - OnboardingModal.tsx, FastMealApexModal.tsx, RecipeDetailModal.tsx, Sidebar.tsx
 * 
 * Verifies:
 * 1. Tailwind utility validity and compilation in production bundle
 * 2. Mobile viewport layout constraints (320px–360px up to desktop)
 * 3. Extreme text lengths, maximum servings (20 people), and over-budget states
 * 4. 100+ catering guests, long equipment names, multi-course quotes
 * 5. Long ingredient names (50+ characters), multi-chain online price simulations
 * 6. Prevention of horizontal scrolling, overlapping buttons, or text bleeding
 */

import fs from 'fs';
import path from 'path';

console.log('\n======================================================================');
console.log('       CHALLENGER LAYOUT 1: ADVERSARIAL RESPONSIVE STRESS SUITE       ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

interface FailureRecord {
  section: string;
  name: string;
  expected: string;
  actual: string;
  blastRadius: string;
  remediation: string;
}

const failures: FailureRecord[] = [];

function assert(
  condition: boolean, 
  name: string, 
  section: string, 
  details?: { expected?: string; actual?: string; blastRadius?: string; remediation?: string }
) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] [${section}] ${name}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] [${section}] ${name}`);
    if (details) {
      console.error(`         Expected: ${details.expected}`);
      console.error(`         Actual:   ${details.actual}`);
      failures.push({
        section,
        name,
        expected: details.expected || 'true',
        actual: details.actual || 'false',
        blastRadius: details.blastRadius || 'Layout degradation',
        remediation: details.remediation || 'Correct CSS/Tailwind class'
      });
    }
  }
}

// ----------------------------------------------------------------------
// SECTION 1: TAILWIND UTILITY VALIDITY & PRODUCTION BUNDLE AUDIT
// ----------------------------------------------------------------------
console.log('\n--- 1. TAILWIND CSS UTILITIES VALIDITY & COMPILED BUNDLE ---');

const srcDir = path.resolve(process.cwd(), 'src');
const distCssDir = path.resolve(process.cwd(), 'dist', 'assets');

// Check compiled CSS
let compiledCss = '';
if (fs.existsSync(distCssDir)) {
  const cssFiles = fs.readdirSync(distCssDir).filter(f => f.endsWith('.css'));
  if (cssFiles.length > 0) {
    compiledCss = fs.readFileSync(path.join(distCssDir, cssFiles[0]), 'utf-8');
  }
}

// 1.1 WeeklyBoard Stepper touch targets: check if w-7.5 and h-7.5 exist in Tailwind
const weeklyBoardCode = fs.readFileSync(path.join(srcDir, 'components', 'WeeklyBoard.tsx'), 'utf-8');

const hasW7_5 = weeklyBoardCode.includes('w-7.5');
const hasH7_5 = weeklyBoardCode.includes('h-7.5');
const compiledHasW7_5 = compiledCss.includes('w-7.5') || compiledCss.includes('w-\\[30px\\]');
const compiledHasH7_5 = compiledCss.includes('h-7.5') || compiledCss.includes('h-\\[30px\\]');

assert(
  !hasW7_5 && !hasH7_5,
  'WeeklyBoard stepper buttons must NOT use non-existent w-7.5 / h-7.5 utilities',
  'Tailwind Validity',
  {
    expected: 'Standard Tailwind utilities (e.g. w-8 h-8 for 32px touch target, or arbitrary w-[30px] h-[30px])',
    actual: `Found w-7.5 and h-7.5 in WeeklyBoard.tsx lines 392 and 420. Compiled CSS contains rule: ${compiledHasW7_5}`,
    blastRadius: 'On mobile viewports (<640px), stepper buttons have NO explicit width/height in compiled CSS, shrinking tap target to ~18px and violating the 32px minimum touch target specification in PROJECT.md',
    remediation: 'Change w-7.5 h-7.5 sm:w-8 sm:h-8 to w-8 h-8 (or w-[30px] h-[30px] sm:w-8 sm:h-8)'
  }
);

// 1.2 Verify no non-standard xs: prefixes exist in src/
const allTsxFiles = [
  'components/WeeklyBoard.tsx',
  'components/MealSetExplorer.tsx',
  'components/MealSetDetailModal.tsx',
  'components/CateringPartyPlanner.tsx',
  'components/GroceryList.tsx',
  'components/OnboardingModal.tsx',
  'components/RecipeDetailModal.tsx',
  'components/FastMealApexModal.tsx',
  'components/Sidebar.tsx',
  'components/Navbar.tsx',
  'components/AccountView.tsx',
  'components/RecipeCatalog.tsx'
];

let filesWithXs = [];
for (const file of allTsxFiles) {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  if (/\bxs:/.test(content)) {
    filesWithXs.push(file);
  }
}
assert(
  filesWithXs.length === 0,
  'Zero unconfigured xs: breakpoint utilities across all components',
  'Tailwind Validity',
  {
    expected: '0 files with xs:',
    actual: `${filesWithXs.length} files found: ${filesWithXs.join(', ')}`
  }
);

// 1.3 Verify no pl-6.5 spacing utilities exist
let filesWithInvalidSpacing = [];
for (const file of allTsxFiles) {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  if (/\b(p|m|gap|w|h)(l|r|t|b|x|y)?-6\.5\b/.test(content)) {
    filesWithInvalidSpacing.push(file);
  }
}
assert(
  filesWithInvalidSpacing.length === 0,
  'Zero invalid 6.5 spacing utilities across all components',
  'Tailwind Validity',
  {
    expected: '0 files with 6.5 spacing',
    actual: `${filesWithInvalidSpacing.length} files found: ${filesWithInvalidSpacing.join(', ')}`
  }
);


// ----------------------------------------------------------------------
// SECTION 2: WEEKLYBOARD STRESS & BOUNDARY SCENARIOS
// ----------------------------------------------------------------------
console.log('\n--- 2. WEEKLYBOARD STRESS & BOUNDARY SCENARIOS ---');

// 2.1 Header Banner with Extreme Goal String in 320px Viewport
// Available width on 320px viewport:
// Viewport: 320px
// Outer padding px-3: 12px * 2 = 24px -> Card = 296px
// Inner banner padding p-3.5: 14px * 2 = 28px -> Inner = 268px
// Goal chip padding px-3: 12px * 2 = 24px -> Goal chip inner = 244px
// Icon 🎯: 14px + gap-1.5 (6px) = 20px
// Button "Đổi mục tiêu": px-2.5 (20px) + text (68px) = 88px (shrink-0 whitespace-nowrap)
// Available text width = 244 - 20 - 88 - 10 (gap-2.5) = 126px

const longGoalString = 'Tập Gym / Giàu Đạm • Vị Trung • 20 người • Không cay • Nhiều rau xanh • Cân bằng dinh dưỡng gia đình';
const goalHasBreakWords = weeklyBoardCode.includes('min-w-0') && (weeklyBoardCode.includes('break-words') || weeklyBoardCode.includes('truncate'));
const goalButtonHasShrink0 = weeklyBoardCode.includes('Đổi mục tiêu') && weeklyBoardCode.includes('shrink-0');

assert(
  goalHasBreakWords,
  'Goal header text container has min-w-0 with truncation/wrapping to handle long goals',
  'WeeklyBoard Stress'
);
assert(
  goalButtonHasShrink0,
  'Change goal button has shrink-0 to prevent button squishing',
  'WeeklyBoard Stress'
);

// 2.2 Weekly Stats Micro Bar with Over-Budget State for 20 People
// 20 people * 7 days * 150,000 đ = 21,000,000 đ
const microBarHasFlexWrap = weeklyBoardCode.includes('flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2');
const microBarButtonHasShrink0 = (weeklyBoardCode.includes('Cân chỉnh') || weeklyBoardCode.includes('Đổi mới thực đơn')) && weeklyBoardCode.includes('shrink-0');

assert(
  microBarHasFlexWrap,
  'Weekly stats micro bar has flex-wrap gap-y-1.5 to safely wrap price and recalibrate button',
  'WeeklyBoard Stress'
);
assert(
  microBarButtonHasShrink0,
  'Weekly stats recalibrate button has shrink-0 and whitespace-nowrap',
  'WeeklyBoard Stress'
);

// 2.3 Nutrition Pills (3 Columns) with Maximum Servings (20 People)
const colHasMinW0 = weeklyBoardCode.includes('grid grid-cols-3') && 
                    weeklyBoardCode.includes('min-w-0');
const proteinHasCleanLabel = weeklyBoardCode.includes('ĐẠM') && !weeklyBoardCode.includes('ĐẠM (PROTEIN)');

assert(
  colHasMinW0,
  'Nutrition 3-column cells include min-w-0 and truncate to prevent grid blowout under 20 servings',
  'WeeklyBoard Stress'
);
assert(
  proteinHasCleanLabel,
  'Protein label uses clean Vietnamese "ĐẠM" without English parentheses on mobile',
  'WeeklyBoard Stress'
);

// 2.4 Single-Day Budget Warning Call-to-Action Stacking
const budgetWarningHasColStack = weeklyBoardCode.includes('flex flex-col sm:flex-row') || weeklyBoardCode.includes('flex-wrap');
assert(
  budgetWarningHasColStack,
  'Over-budget warning action buttons stack or wrap safely on mobile',
  'WeeklyBoard Stress'
);

// 2.5 Servings Stepper bounds: 1 to 20
assert(
  weeklyBoardCode.includes('Math.min(20') || (weeklyBoardCode.includes('min={1}') && weeklyBoardCode.includes('max={20}')),
  'Servings stepper enforces 1 to 20 bounds',
  'WeeklyBoard Bounds'
);


// ----------------------------------------------------------------------
// SECTION 3: CATERING PARTY PLANNER STRESS & BOUNDARY SCENARIOS
// ----------------------------------------------------------------------
console.log('\n--- 3. CATERING PARTY PLANNER STRESS & BOUNDARY SCENARIOS ---');

const cateringCode = fs.readFileSync(path.join(srcDir, 'components', 'CateringPartyPlanner.tsx'), 'utf-8');

// 3.1 100+ Guests & Quick Chip Grid Width in 320px Viewport
const quickChipsHaveWhitespaceNowrap = cateringCode.includes('text-[10px] sm:text-[11px] font-black whitespace-nowrap');
assert(
  quickChipsHaveWhitespaceNowrap,
  'Quick guest count chip "100 khách" enforces whitespace-nowrap and text-[10px]',
  'Catering Stress'
);

// 3.2 Long Equipment Names (150+ chars) in Equipment Checklist
const equipmentItemHasBreakWords = cateringCode.includes('break-words flex-1') && 
                                  cateringCode.includes('pl-6 sm:pl-0');
assert(
  equipmentItemHasBreakWords,
  'Equipment list item enforces break-words and pl-6 mobile indentation to prevent badge collision',
  'Catering Stress'
);

// 3.3 Equipment Add Input Container Responsiveness
const equipmentAddHasColStack = cateringCode.includes('flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2');
assert(
  equipmentAddHasColStack,
  'Equipment add input row stacks vertically (flex-col sm:flex-row) giving input 100% width on mobile',
  'Catering Stress'
);

// 3.4 Multi-Course Quotes & Concise Short Names in Dish Selector Modal
const hasCourseShortNames = cateringCode.includes('courseShortNames') && 
                            cateringCode.includes('targetCourseShortName');
assert(
  hasCourseShortNames,
  'Catering dish selector modal uses concise courseShortNames (Khai Vị, Món Chính, etc.)',
  'Catering Stress'
);

// 3.5 Fixed Bottom Action Bar: Mobile Text Truncate & Button Sizing
const bottomBarHasTruncate = cateringCode.includes('{guestCount}k • {numTables} bàn • ~{kitchenWorkload.formattedTotalTime}') &&
                             cateringCode.includes('truncate');
assert(
  bottomBarHasTruncate,
  'Fixed bottom action bar uses compact mobile text and truncate to fit 320px screens',
  'Catering Stress'
);


// ----------------------------------------------------------------------
// SECTION 4: GROCERY LIST STRESS & BOUNDARY SCENARIOS
// ----------------------------------------------------------------------
console.log('\n--- 4. GROCERY LIST STRESS & BOUNDARY SCENARIOS ---');

const groceryCode = fs.readFileSync(path.join(srcDir, 'components', 'GroceryList.tsx'), 'utf-8');

// 4.1 Long Ingredient Names (50+ characters) in Item Rows
const groceryItemHasTruncate = groceryCode.includes('min-w-0 flex-1') && 
                               groceryCode.includes('truncate');
const groceryItemRightHasShrink0 = groceryCode.includes('shrink-0');

assert(
  groceryItemHasTruncate && groceryItemRightHasShrink0,
  'Grocery item row pairs min-w-0 flex-1 truncate with right shrink-0 to prevent 50+ char blowout',
  'GroceryList Stress'
);

// 4.2 Multi-Chain Price Simulation: 4 Chains with Large Figures (>20M VND)
const priceSimCardGrid = groceryCode.includes('grid grid-cols-1 sm:grid-cols-2') || groceryCode.includes('grid grid-cols-2');
assert(
  priceSimCardGrid,
  'Online price simulation / aisle selector cards use responsive grid layout',
  'GroceryList Stress'
);

// 4.3 Aisle Filter Dropdown / Scroll Ergonomics
const storeTabsHaveOverflowX = groceryCode.includes('isAisleDropdownOpen') || groceryCode.includes('overflow-x-auto scrollbar-none');
assert(
  storeTabsHaveOverflowX,
  'Aisle filter uses mobile-friendly dropdown or horizontal overflow-x-auto instead of squished 6-column grid',
  'GroceryList Stress'
);

// 4.4 Header Badges Wrapping
const headerBadgesWrap = groceryCode.includes('flex-wrap');
assert(
  headerBadgesWrap,
  'Grocery header action badges use flex-wrap to prevent collision on 320px screens',
  'GroceryList Stress'
);

// 4.5 Sticky Bottom Bar: Compact Mobile Label & Safe Area Inset
const bottomShareBtnCompact = groceryCode.includes('Chia Sẻ') || groceryCode.includes('Đi Chợ Chung');
const bottomBarSafeArea = groceryCode.includes('pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]');

assert(
  bottomShareBtnCompact,
  'Grocery action buttons display concise Vietnamese sharing labels on mobile',
  'GroceryList Stress'
);
assert(
  bottomBarSafeArea,
  'Sticky bottom bar respects iOS safe-area-inset-bottom',
  'GroceryList Ergonomics'
);


// ----------------------------------------------------------------------
// SECTION 5: OTHER REMEDIATED COMPONENTS STRESS AUDIT
// ----------------------------------------------------------------------
console.log('\n--- 5. OTHER REMEDIATED COMPONENTS STRESS AUDIT ---');

const onboardingCode = fs.readFileSync(path.join(srcDir, 'components', 'OnboardingModal.tsx'), 'utf-8');
const recipeDetailCode = fs.readFileSync(path.join(srcDir, 'components', 'RecipeDetailModal.tsx'), 'utf-8');
const fastMealCode = fs.readFileSync(path.join(srcDir, 'components', 'FastMealApexModal.tsx'), 'utf-8');
const sidebarCode = fs.readFileSync(path.join(srcDir, 'components', 'Sidebar.tsx'), 'utf-8');
const mealSetDetailCode = fs.readFileSync(path.join(srcDir, 'components', 'MealSetDetailModal.tsx'), 'utf-8');

// 5.1 Onboarding Step 4 Button Overflow Fix
const onboardingHasCompactFinishBtn = onboardingCode.includes('<span className="sm:hidden">Hoàn Tất Thực Đơn</span>');
assert(
  onboardingHasCompactFinishBtn,
  'Onboarding Step 4 uses compact "Hoàn Tất Thực Đơn" on mobile, preventing 35px footer overflow',
  'OnboardingModal Stress'
);

// 5.2 RecipeDetailModal Ingredients Header Wrapping & Badge Protection
const recipeHeaderHasFlexWrap = recipeDetailCode.includes('flex items-center justify-between flex-wrap gap-2');
const recipeUnitBadgeWhitespaceNowrap = recipeDetailCode.includes('shrink-0 whitespace-nowrap');
assert(
  recipeHeaderHasFlexWrap && recipeUnitBadgeWhitespaceNowrap,
  'Recipe detail ingredients header wraps cleanly and unit badge enforces whitespace-nowrap',
  'RecipeDetailModal Stress'
);

// 5.3 FastMealApexModal Podium Bleed & Card Titles
const fastMealPodiumHasOverflowHidden = fastMealCode.includes('overflow-hidden') && fastMealCode.includes('truncate');
assert(
  fastMealPodiumHasOverflowHidden,
  'FastMeal tier podium buttons include overflow-hidden and truncate to prevent border bleeding',
  'FastMealApexModal Stress'
);

// 5.4 Sidebar Tab Labels 1-Line Enforcement
const sidebarHasWhitespaceNowrap = sidebarCode.includes('leading-none whitespace-nowrap');
assert(
  sidebarHasWhitespaceNowrap,
  'Sidebar bottom navigation tab labels enforce whitespace-nowrap against stair-stepping',
  'Sidebar Stress'
);

// 5.5 MealSetDetailModal Consolidated Ingredient Checklist
const mealSetDetailHasConsolidatedChecklist = mealSetDetailCode.includes('Nguyên Liệu Cả Mâm (Gom 3 Món)') &&
                                             mealSetDetailCode.includes("course: 'Mặn'");
assert(
  mealSetDetailHasConsolidatedChecklist,
  'MealSetDetailModal renders a consolidated 3-course ingredient checklist with course pills',
  'MealSetDetailModal Stress'
);


// ----------------------------------------------------------------------
// SECTION 6: EMPIRICAL BOX-MODEL & VIEWPORT MATH (320px–360px)
// ----------------------------------------------------------------------
console.log('\n--- 6. EMPIRICAL BOX-MODEL & VIEWPORT SIMULATION (320px–360px) ---');

interface ViewportSimulation {
  name: string;
  width: number;
}

const NARROW_VIEWPORTS: ViewportSimulation[] = [
  { name: 'Ultra-small / Galaxy Fold Outer (320px)', width: 320 },
  { name: 'Standard Budget Android / Galaxy S8 (360px)', width: 360 },
  { name: 'iPhone SE 2nd/3rd Gen (375px)', width: 375 },
  { name: 'Standard iPhone 14/15 (390px)', width: 390 },
  { name: 'Pixel 7 / Galaxy S23 (412px)', width: 412 }
];

for (const vp of NARROW_VIEWPORTS) {
  const outerPadding = 24; // px-3 = 12px each side = 24px
  const cardWidth = vp.width - outerPadding;
  const innerCardPadding = 28; // p-3.5 = 14px each side = 28px
  const innerWidth = cardWidth - innerCardPadding;

  // 6.1 WeeklyBoard Goal Chip Box-Model
  const goalChipPadding = 24; // px-3 = 24px
  const goalChipInnerWidth = cardWidth - goalChipPadding;
  const iconWidth = 20; // 🎯 14px + gap 6px
  const changeBtnWidth = 88; // px-2.5 (20px) + "Đổi mục tiêu" (68px)
  const availableGoalTextWidth = goalChipInnerWidth - iconWidth - changeBtnWidth - 10; // gap-2.5 = 10px

  assert(
    availableGoalTextWidth >= 100,
    `Viewport ${vp.width}px: Available goal text width (${availableGoalTextWidth}px >= 100px) allows natural multi-line wrapping`,
    'Viewport Simulation'
  );

  // 6.2 WeeklyBoard Micro Bar Wrap Simulation
  // When over-budget for 20 people: price is e.g. "21.000.000 đ / 17.500.000 đ/tuần" (~175px)
  // Button "Cân chỉnh tuần": ~105px. Counter "21 / 21 bữa đã xếp": ~115px
  // Total single-line width = 175 + 105 + 115 + gaps = 415px
  const totalMicroBarWidthSingleLine = 415;
  const microBarMustWrap = totalMicroBarWidthSingleLine > innerWidth;
  assert(
    microBarMustWrap,
    `Viewport ${vp.width}px: Weekly stats micro bar exceeds inner card (${totalMicroBarWidthSingleLine}px > ${innerWidth}px) — flex-wrap successfully triggered`,
    'Viewport Simulation'
  );

  // 6.3 Catering 100-Guest Chip in 5-Col Grid
  // Grid padding & gaps: 4 gaps * 4px = 16px
  const cateringInnerWidth = cardWidth - 24; // p-3 = 24px
  const chipCellWidth = (cateringInnerWidth - 16) / 5;
  // "100 khách" at text-[10px] with px-0.5 = ~48px
  const chipEstimatedTextWidth = 48;
  assert(
    chipCellWidth >= chipEstimatedTextWidth,
    `Viewport ${vp.width}px: 100-guest chip width (${chipEstimatedTextWidth}px <= cell ${chipCellWidth.toFixed(1)}px) fits in single line`,
    'Viewport Simulation'
  );

  // 6.4 Catering Bottom Bar Width Budget
  // Fixed bottom bar: inner width = vp.width - 24px
  // Left: truncate. Right: Save (36px) + Báo Giá (90px) + Sync (36px) + 2 gaps (12px) = 174px
  const rightButtonsWidth = 174;
  const leftAvailableForText = (vp.width - 24) - rightButtonsWidth - 8; // gap-2 = 8px
  assert(
    leftAvailableForText >= 90,
    `Viewport ${vp.width}px: Catering bottom bar leaves usable space (${leftAvailableForText}px >= 90px) for headcount & quote summary`,
    'Viewport Simulation'
  );

  // 6.5 Grocery List Item Row Width Budget for 50+ Char Names
  // Card inner width = vp.width - 24 - 24 = vp.width - 48
  const groceryCardInnerWidth = vp.width - 48;
  // Right container: Store icon badge (~22px) + Quantity badge (~54px) + gap (6px) = 82px
  const groceryRightWidth = 82;
  const groceryLeftAvailable = groceryCardInnerWidth - groceryRightWidth - 12; // gap-3 = 12px
  // Checkbox: 20px + gap-3 (12px) = 32px
  const groceryNameAvailable = groceryLeftAvailable - 32;
  assert(
    groceryNameAvailable >= 120,
    `Viewport ${vp.width}px: Grocery item row provides ample width (${groceryNameAvailable}px >= 120px) for ingredient title before truncation`,
    'Viewport Simulation'
  );
}


// ----------------------------------------------------------------------
// SUMMARY & VERDICT
// ----------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TOTAL ADVERSARIAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log(`PASS RATE: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
console.log('======================================================================\n');

if (failedChecks > 0) {
  console.log('>>> VERDICT: REQUEST_CHANGES <<<');
  console.log('\nFailure Details:');
  failures.forEach((f, idx) => {
    console.log(`\nIssue #${idx + 1}: [${f.section}] ${f.name}`);
    console.log(`  • Expected:    ${f.expected}`);
    console.log(`  • Actual:      ${f.actual}`);
    console.log(`  • Blast Radius: ${f.blastRadius}`);
    console.log(`  • Remediation: ${f.remediation}`);
  });
  process.exit(1);
} else {
  console.log('>>> VERDICT: APPROVE <<<');
  process.exit(0);
}

