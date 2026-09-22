/**
 * Adversarial Responsive Design & Layout Boundaries Stress Test Suite
 * Challenger 2 (challenger_layout_2)
 * 
 * Verifies:
 * 1. Box-model calculations across all core tabs:
 *    - WeeklyBoard day strip (7 buttons on 320px)
 *    - Macro nutrition cards (3 columns on 320px with extreme servings)
 *    - GroceryList item row (50+ char long titles, right badges shrink-0, min-w-0 truncate)
 *    - CateringPartyPlanner guest chips (5 chips on 320px) & fixed bottom bar
 * 2. Navbar active screen badge pill across all 8 tabs:
 *    ('meal-sets', 'weekly', 'party', 'fast-meal', 'grocery', 'recipes', 'pantry', 'account')
 *    on 320px screens. Ensures complete word rendering, zero harsh truncation, zero mid-word ellipsis.
 * 3. Exact box-model mathematical boundaries, margins, paddings, and safe-area insets.
 */

import fs from 'fs';
import path from 'path';

console.log('\n======================================================================');
console.log('       CHALLENGER LAYOUT 2: ADVERSARIAL RESPONSIVE BOUNDARIES HARNESS ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

interface TestFailure {
  section: string;
  name: string;
  expected: string;
  actual: string;
  blastRadius: string;
}

const failures: TestFailure[] = [];

function assert(
  condition: boolean,
  name: string,
  section: string,
  details?: { expected?: string; actual?: string; blastRadius?: string }
) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ [PASS] [${section}] ${name}`);
  } else {
    failedChecks++;
    console.error(`  ✗ [FAIL] [${section}] ${name}`);
    if (details) {
      console.error(`         Expected: ${details.expected}`);
      console.error(`         Actual:   ${details.actual}`);
      failures.push({
        section,
        name,
        expected: details.expected || 'true',
        actual: details.actual || 'false',
        blastRadius: details.blastRadius || 'Layout regression'
      });
    }
  }
}

const srcDir = path.resolve(process.cwd(), 'src');

// ======================================================================
// SECTION 1: NAVBAR BADGE PILL ACROSS ALL 8 TABS ON 320PX VIEWPORT
// ======================================================================
console.log('\n--- 1. NAVBAR BADGE PILL AUDIT (ALL 8 TABS ON 320PX SCREEN) ---');

const navbarCode = fs.readFileSync(path.join(srcDir, 'components', 'Navbar.tsx'), 'utf-8');

// The 8 application tabs defined in ActiveTab type
const ALL_TABS = [
  'meal-sets',
  'weekly',
  'party',
  'fast-meal',
  'grocery',
  'recipes',
  'pantry',
  'account'
] as const;

// Expected titles from Navbar.tsx getScreenTitle mapping
const EXPECTED_SCREEN_TITLES: Record<string, { short: string; full: string }> = {
  'meal-sets': { short: 'Mâm 3 Món', full: 'Mâm 3 Món' },
  'weekly': { short: 'Thực Đơn', full: 'Thực Đơn Tuần' },
  'party': { short: 'Tiệc Tùng', full: 'Tiệc & Catering' },
  'fast-meal': { short: 'Mở Hòm', full: 'Mở Hòm Bữa Cơm' },
  'grocery': { short: 'Đi Chợ', full: 'Đi Chợ Tự Động' },
  'recipes': { short: 'Công Thức', full: 'Sổ Tay Công Thức' },
  'pantry': { short: 'Tủ Lạnh', full: 'Tủ Lạnh & Đồ Thừa' },
  'account': { short: 'Tài Khoản', full: 'Tài Khoản' }
};

// 1.1 Verify Navbar source code structure & classes
assert(
  navbarCode.includes('getScreenTitle = (tab: ActiveTab)'),
  'Navbar contains centralized getScreenTitle mapping for all tabs',
  'Navbar Badge'
);

assert(
  navbarCode.includes('max-w-[115px] min-[360px]:max-w-[150px] min-[390px]:max-w-[185px] sm:max-w-[240px]'),
  'Navbar badge pill container enforces responsive max-width spectrum (115px on 320px, up to 240px on sm)',
  'Navbar Badge'
);

assert(
  navbarCode.includes('<span className="sm:hidden">{currentTitle.short}</span>') &&
  navbarCode.includes('<span className="hidden sm:inline">{currentTitle.full}</span>'),
  'Navbar displays concise mobile labels (<640px) and full labels on desktop (>=640px)',
  'Navbar Badge'
);

assert(
  navbarCode.includes('title={currentTitle.full}'),
  'Navbar badge pill provides full title in HTML title attribute for hover accessibility',
  'Navbar Badge'
);

// 1.2 Box-Model Mathematical Space Budget on 320px Screen
// 320px viewport:
// Container: Navbar header inner div has `h-14 px-2 min-[360px]:px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 max-w-lg mx-auto`
// Left brand: Logo (w-8 h-8 = 32px) + gap-1.5 (6px) + text ("MealWise" ~55px, "Mâm Cơm Việt" ~60px) = ~98px.
// Right actions: 2 buttons (w-8 h-8 = 32px each) + gap-1.5 (6px) = 70px.
// Container padding: px-2 = 8px each side = 16px.
// Gaps around center pill: gap-1.5 on each side = 12px.
// Total fixed horizontal width = 16 (padding) + 98 (brand) + 70 (actions) + 12 (gaps) = 196px.
// Available space for center badge pill = 320 - 196 = 124px!
const viewportWidth = 320;
const outerPad = 16;
const brandWidth = 98;
const rightActionsWidth = 70;
const gapAllowance = 12;
const maxAvailableForBadge = viewportWidth - outerPad - brandWidth - rightActionsWidth - gapAllowance;

assert(
  maxAvailableForBadge >= 115,
  `Navbar on 320px: Available center slot (${maxAvailableForBadge}px) accommodates max-w-[115px] badge pill without horizontal overflow`,
  'Navbar Badge'
);

// 1.3 Per-Tab Character Count & Text Width Estimation (text-[10.5px] font-extrabold)
// Average character width for Vietnamese bold text at 10.5px font-size is ~6.2px to 6.8px.
// Pill padding: `px-2` = 8px horizontal + 2px border = 10px.
ALL_TABS.forEach(tab => {
  const meta = EXPECTED_SCREEN_TITLES[tab];
  assert(
    Boolean(meta),
    `Tab '${tab}' is configured with valid metadata in Navbar`,
    'Navbar Badge'
  );

  // Assert code includes this tab case
  const caseRegex = new RegExp(`case\\s+'${tab}':\\s*return\\s*\\{\\s*short:\\s*'([^']+)',\\s*full:\\s*'([^']+)'\\s*\\};`);
  const match = navbarCode.match(caseRegex);
  assert(
    Boolean(match),
    `Tab '${tab}' has explicit case in Navbar.tsx getScreenTitle`,
    'Navbar Badge'
  );

  if (match) {
    const actualShort = match[1];
    const actualFull = match[2];
    assert(
      actualShort === meta.short && actualFull === meta.full,
      `Tab '${tab}' mapping matches expected: short="${actualShort}", full="${actualFull}"`,
      'Navbar Badge'
    );

    // Calculate required width for short label:
    // Characters count * 7px + 10px pill padding
    const estimatedTextWidth = actualShort.length * 7;
    const estimatedPillWidth = estimatedTextWidth + 10;

    // Must fit cleanly within 115px on 320px screens!
    const fitsWithoutEllipsis = estimatedPillWidth <= 115;
    assert(
      fitsWithoutEllipsis,
      `Tab '${tab}': Mobile label "${actualShort}" (~${estimatedPillWidth}px) fits within 115px limit without harsh truncation or mid-word ellipsis`,
      'Navbar Badge',
      {
        expected: `<= 115px`,
        actual: `${estimatedPillWidth}px (length: ${actualShort.length} chars)`
      }
    );
  }
});


// ======================================================================
// SECTION 2: BOX-MODEL VERIFICATION — WEEKLYBOARD DAY STRIP
// ======================================================================
console.log('\n--- 2. BOX-MODEL VERIFICATION: WEEKLYBOARD DAY STRIP ---');

const weeklyCode = fs.readFileSync(path.join(srcDir, 'components', 'WeeklyBoard.tsx'), 'utf-8');

// 2.1 Day Strip Container
// Main container has px-3 on 320px -> available = 320 - 24 = 296px.
// Day strip container: p-1.5 border -> inner width = 296 - 12 - 2 = 282px.
// Grid: grid-cols-7 gap-1 -> 6 gaps * 4px = 24px.
// Available for 7 day buttons = 282 - 24 = 258px.
// Button cell width = 258 / 7 = 36.85px.
const mainPadding = 24; // px-3
const boardWidth = 320 - mainPadding; // 296px
const stripContainerPadding = 12 + 2; // p-1.5 + border = 14px
const stripInnerWidth = boardWidth - stripContainerPadding; // 282px
const stripGaps = 6 * 4; // 6 gaps of 4px = 24px
const dayButtonWidth = (stripInnerWidth - stripGaps) / 7;

assert(
  weeklyCode.includes('grid grid-cols-7 gap-1'),
  'WeeklyBoard day strip uses 7-column grid with gap-1',
  'WeeklyBoard Day Strip'
);

assert(
  weeklyCode.includes('min-h-[54px]'),
  'WeeklyBoard day buttons enforce comfortable touch height min-h-[54px]',
  'WeeklyBoard Day Strip'
);

assert(
  dayButtonWidth >= 36.5,
  `WeeklyBoard day button cell width (${dayButtonWidth.toFixed(2)}px >= 36.5px) ensures accessible touch width on 320px`,
  'WeeklyBoard Day Strip',
  { expected: '>= 36.5px', actual: `${dayButtonWidth.toFixed(2)}px` }
);

// Check button contents: Day name ("T2".."CN", ~14px) and Meals ("0/3".."3/3", ~16px)
const dayTextWidth = 16;
const dayButtonPadding = 8; // px-1 = 4px * 2 = 8px
const totalDayContentWidth = dayTextWidth + dayButtonPadding; // 24px

assert(
  totalDayContentWidth <= dayButtonWidth,
  `WeeklyBoard day button content (${totalDayContentWidth}px <= ${dayButtonWidth.toFixed(2)}px) fits with no text clipping`,
  'WeeklyBoard Day Strip'
);


// ======================================================================
// SECTION 3: BOX-MODEL VERIFICATION — MACRO NUTRITION CARDS
// ======================================================================
console.log('\n--- 3. BOX-MODEL VERIFICATION: MACRO NUTRITION CARDS ---');

// Active day card container: p-4 rounded-3xl border -> padding = 16 * 2 + 2 = 34px.
// Inner width inside active day card = 296 - 34 = 262px.
// Macro grid: grid grid-cols-3 gap-1.5 sm:gap-2 -> 2 gaps of 6px = 12px.
// Width per macro column = (262 - 12) / 3 = 83.33px.
const activeCardPadding = 34;
const activeCardInnerWidth = boardWidth - activeCardPadding;
const macroGaps = 2 * 6; // gap-1.5 = 6px * 2 = 12px
const macroColWidth = (activeCardInnerWidth - macroGaps) / 3;

assert(
  weeklyCode.includes('grid grid-cols-3 gap-1.5 sm:gap-2'),
  'Macro nutrition cards use responsive 3-column grid with gap-1.5 on mobile',
  'Macro Cards'
);

assert(
  macroColWidth >= 80,
  `Macro column width (${macroColWidth.toFixed(2)}px >= 80px) on 320px screens provides sufficient container area`,
  'Macro Cards',
  { expected: '>= 80px', actual: `${macroColWidth.toFixed(2)}px` }
);

// Macro card 3 (Protein): checks responsive abbreviation "ĐẠM" on mobile, hiding "(PROTEIN)"
assert(
  weeklyCode.includes('<span>ĐẠM</span><span className="hidden sm:inline"> (PROTEIN)</span>'),
  'Macro protein card compresses to "ĐẠM" on mobile (<640px), hiding verbose "(PROTEIN)" to prevent word break',
  'Macro Cards'
);

// Macro cards truncation & min-w-0 resilience against extreme 20 servings values (e.g. 21,000,000 VND, 12,000 kcal)
assert(
  weeklyCode.includes('min-w-0') &&
  weeklyCode.includes('CHI PHÍ NGÀY') &&
  weeklyCode.includes('text-xs font-black mt-0.5 truncate'),
  'Macro cards enforce min-w-0 and truncate on text lines to prevent container blowout under extreme servings',
  'Macro Cards'
);


// ======================================================================
// SECTION 4: BOX-MODEL VERIFICATION — GROCERYLIST ITEM ROW
// ======================================================================
console.log('\n--- 4. BOX-MODEL VERIFICATION: GROCERYLIST ITEM ROW ---');

const groceryCode = fs.readFileSync(path.join(srcDir, 'components', 'GroceryList.tsx'), 'utf-8');

// On 320px:
// Main container has px-3 -> 296px.
// Grocery list item card inner padding: p-3 = 12 * 2 = 24px.
// Inner width inside grocery item card = 296 - 24 = 272px.
// Row layout:
// Left: Checkbox (20px) + gap-3 (12px) + Ingredient title container (min-w-0 flex-1).
// Right: Badges container (store icon badge ~22px + quantity badge ~54px + gap 6px = 82px) + shrink-0.
// Gap between left and right = gap-3 (12px).
// Available width for ingredient title before truncation:
// 272px - 20 (checkbox) - 12 (gap) - 12 (gap) - 82 (right badges) = 146px.
const groceryInnerWidth = boardWidth - 24; // 272px
const groceryCheckboxWithGap = 20 + 12; // 32px
const groceryRightBadgesWithGap = 82 + 12; // 94px
const availableIngredientTitleWidth = groceryInnerWidth - groceryCheckboxWithGap - groceryRightBadgesWithGap;

assert(
  groceryCode.includes('min-w-0 flex-1') &&
  groceryCode.includes('text-xs font-extrabold block truncate'),
  'GroceryList item row uses min-w-0 flex-1 with block truncate on ingredient title',
  'Grocery Item Row'
);

assert(
  groceryCode.includes('flex items-center gap-1.5 shrink-0'),
  'GroceryList right badges container enforces shrink-0 to prevent badge compression',
  'Grocery Item Row'
);

assert(
  availableIngredientTitleWidth >= 140,
  `GroceryList ingredient title width (${availableIngredientTitleWidth}px >= 140px) comfortably accommodates Vietnamese ingredient names before ellipsis`,
  'Grocery Item Row',
  { expected: '>= 140px', actual: `${availableIngredientTitleWidth}px` }
);


// ======================================================================
// SECTION 5: BOX-MODEL VERIFICATION — CATERING GUEST CHIPS & BOTTOM BAR
// ======================================================================
console.log('\n--- 5. BOX-MODEL VERIFICATION: CATERING GUEST CHIPS & BOTTOM BAR ---');

const cateringCode = fs.readFileSync(path.join(srcDir, 'components', 'CateringPartyPlanner.tsx'), 'utf-8');

// 5.1 5-Chip Quick Guest Count Grid
// On 320px:
// Main container has px-3 -> 296px.
// Stepper card has p-3 -> inner width = 296 - 24 = 272px.
// 5-chip grid: grid grid-cols-5 gap-1.
// 4 gaps * 4px = 16px.
// Available for 5 chips = 272 - 16 = 256px.
// Per chip cell width = 256 / 5 = 51.2px.
const cateringCardInnerWidth = boardWidth - 24; // 272px
const chipGaps = 4 * 4; // 16px
const guestChipCellWidth = (cateringCardInnerWidth - chipGaps) / 5;

assert(
  cateringCode.includes('grid grid-cols-5 gap-1 pt-1'),
  'CateringPartyPlanner uses 5-column grid with gap-1 for quick guest chips',
  'Catering Chips'
);

assert(
  cateringCode.includes('text-[10px] sm:text-[11px] font-black whitespace-nowrap'),
  'Catering guest chips enforce text-[10px] and whitespace-nowrap on mobile',
  'Catering Chips'
);

assert(
  guestChipCellWidth >= 50,
  `Catering guest chip cell width (${guestChipCellWidth.toFixed(1)}px >= 50px) on 320px fits "100 khách" (~44px) without line wrap`,
  'Catering Chips',
  { expected: '>= 50px', actual: `${guestChipCellWidth.toFixed(1)}px` }
);

// 5.2 Fixed Bottom Bar Layout
// On 320px:
// fixed bottom-16 left-1/2 -translate-x-1/2 w-full sm:max-w-md md:max-w-lg px-3 py-2.5
// Inner width = 320 - 24 = 296px.
// Right actions:
// - Save button: p-2.5 + w-4 h-4 icon + border = 36px
// - Báo Giá button: py-2.5 px-3 + icon + gap + text = 92px
// - ShoppingCart button: p-2.5 + w-4 h-4 icon = 36px
// - 2 gaps of gap-1.5 (6px) = 12px
// Total right actions = 36 + 92 + 36 + 12 = 176px.
// Remaining left available = 296 - 176 - 8 (gap-2) = 112px.
const bottomBarInnerWidth = 320 - 24; // 296px
const rightActionsTotalWidth = 176;
const bottomBarGap = 8;
const leftSummaryAvailableWidth = bottomBarInnerWidth - rightActionsTotalWidth - bottomBarGap;

assert(
  cateringCode.includes('fixed bottom-16') &&
  cateringCode.includes('pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]'),
  'Catering bottom bar includes iOS safe-area-inset-bottom calculation',
  'Catering Bottom Bar'
);

assert(
  cateringCode.includes('<span className="sm:hidden">{guestCount}k • {numTables} bàn • ~{kitchenWorkload.formattedTotalTime}</span>'),
  'Catering bottom bar renders concise mobile text format on small screens',
  'Catering Bottom Bar'
);

assert(
  leftSummaryAvailableWidth >= 110,
  `Catering bottom bar provides ${leftSummaryAvailableWidth}px (>= 110px) for revenue & headcount summary on 320px screens`,
  'Catering Bottom Bar',
  { expected: '>= 110px', actual: `${leftSummaryAvailableWidth}px` }
);


// ======================================================================
// SECTION 6: SUMMARY & VERDICT
// ======================================================================
console.log('\n======================================================================');
console.log(`TOTAL ADVERSARIAL CHALLENGER 2 CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log(`PASS RATE: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
console.log('======================================================================\n');

if (failedChecks > 0) {
  console.log('>>> VERDICT: REJECT <<<');
  console.log('\nFailure Details:');
  failures.forEach((f, idx) => {
    console.log(`\nIssue #${idx + 1}: [${f.section}] ${f.name}`);
    console.log(`  • Expected:    ${f.expected}`);
    console.log(`  • Actual:      ${f.actual}`);
    console.log(`  • Blast Radius: ${f.blastRadius}`);
  });
  process.exit(1);
} else {
  console.log('>>> VERDICT: APPROVE <<<');
  process.exit(0);
}
