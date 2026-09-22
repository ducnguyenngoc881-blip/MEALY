# Original User Request

## 2026-09-15T16:08:39Z

Deploy a comprehensive multi-agent engineering and QA team to thoroughly inspect every screen, component, user interaction, data calculation, and gesture in MealWise, uncovering and resolving all bugs, calculation flaws, layout regressions, and edge cases until the application is 100% bug-free and polished in both Light and Dark modes.

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Exhaustive Multi-Screen Functional Audit
Deploy specialized auditors across all 6 application domains:
1. **Mâm Cơm 3 Món (MealSetExplorer)**:
   - Verify region filtering ('bac', 'trung', 'nam', 'chay') and tag matching.
   - Verify 1-click slot assignment to the weekly plan for all days and meal slots.
   - Test bottom sheet opening, drag-to-dismiss gesture, and scroll boundaries.
2. **Thực Đơn Tuần (WeeklyBoard & Day Detail)**:
   - Audit horizontal 7-day strip navigation, active indicator tracking, and touch swipe gestures (left/right).
   - Test servings stepper for bounds, negative values, and NaN inputs.
   - Verify nutrition accumulation (Calories, Protein) and single-day budget warning indicators.
   - Test dish replacement, removal, and custom meal selection bottom sheets.
3. **Tiệc & Catering (CateringPartyPlanner)**:
   - Test custom headcount input and stepper across edge cases (0, negative, arbitrary odd numbers, 100+ guests).
   - Verify table size calculations (6, 8, 10 guests/table) and total table counts.
   - Test course-by-course dish adding, dish removal, per-dish kitchen notes, and empty course handling.
   - Audit financial formulas: Food Cost, Quoted Price per head/table, and Gross Margin % calculations.
   - Test equipment checklist toggle, custom item additions via Enter key, and deletions.
   - Test 1-click Zalo quotation generation and clipboard fallback under non-secure contexts.
   - Test ingredient push to the grocery list with scaled quantities.
4. **Đi Chợ Tự Động (GroceryList)**:
   - Verify ingredient quantity aggregation math across multiple recipes (combining identical items without NaN or unit collisions).
   - Test item checkoff toggling, persistent purchase state, and completion percentage.
   - Verify store filtering (Chợ Dân Sinh, WinMart, Bách Hóa Xanh, Sạp Đối Tác).
   - Test online price simulation button and Zalo shopping list export.
5. **Sổ Tay Công Thức (RecipeCatalog & RecipeDetailModal)**:
   - Test multi-criteria search (title, ingredients, diacritics, and tags).
   - Test recipe detail bottom sheet layout, cooking steps accordion, and ingredient scaling.
6. **Tài Khoản & Khảo Sát (AccountView & OnboardingModal)**:
   - Test theme switching between Light and Dark modes across all screens, verifying WCAG AA text contrast.
   - Test Onboarding wizard steps (1 to 4) on low-height and small-width screens, verifying no button clipping.

### R2. Systematic Defect Remediation & Polish
- Fix all detected runtime errors, uncaught exceptions, and console warnings.
- Resolve any layout overflow, text clipping, sticky element z-index collisions, or touch lag.
- Ensure all inputs have proper sanitization, bounds checking, and graceful fallbacks.

### R3. Adversarial Multi-Agent Cross-Verification & Build Integrity
- Continuously verify that `npx tsc --noEmit` exits with 0 errors.
- Run `npm run build` to verify clean production compilation.
- Re-sync built bundles to the live showcase (`C:\Users\EXIA\Downloads\MealWise-Portable-Showcase\assets`) and confirm live HTTP 200 serving.

## Acceptance Criteria

### Static & Build Health
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run build` succeeds without bundling errors or missing exports.

### Zero-Defect Functional Execution
- [ ] All 6 tabs navigate smoothly with zero console errors or blank screens.
- [ ] All bottom sheets (Dish detail, Meal set detail, Slot picker) open, scroll, drag-to-dismiss, and close cleanly.
- [ ] Headcount scaling correctly updates ingredient quantities and financial margins in Catering Planner.
- [ ] Grocery List sums ingredients accurately across all active weekly meals and catering plans.
- [ ] Light mode and Dark mode maintain high-contrast readability across all text, inputs, cards, and badges.
- [ ] Clipboard copying functions reliably on all browsers and HTTP connections with fallback support.
- [ ] Live application running at `http://localhost:5173/` reflects all fixes and passes verification.

## 2026-09-18T04:53:19Z

Deploy a specialized multi-agent engineering and market research team to scour the internet (ShopeeFood, GrabFood, Baemin archives, street vendor price guides) for authentic Vietnamese food and drink market pricing, calculate realistic blended average prices for all dishes across all case databases, and calibrate the pricing data to eliminate disproportionate values.

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Comprehensive Web Price Scouring & Blended Averaging
Scour and cross-reference real-world pricing data across Vietnamese urban food vendors, street stalls, and delivery apps (GrabFood, ShopeeFood) for all items in:
- `d:\New folder\Remotion\src\data\casePools\comboPool.ts` (200 3-course combos)
- `d:\New folder\Remotion\src\data\casePools\expressPool.ts` (201 fast meal dishes)
- `d:\New folder\Remotion\src\data\casePools\snackPool.ts` (201 Gen Z snacks & drinks)
- `d:\New folder\Remotion\src\data\casePools\bizarrePool.ts` (200 dare & novelty items)
- `d:\New folder\Remotion\src\data\fastMealData.ts` (fallback items, sides, and drinks)

Where dish prices vary across regions, street vendors, and delivery apps, calculate the blended average market price:
$$\text{Average Price} \approx \frac{\text{Street/Eatery Price} + \text{Delivery App Listed Price}}{2}$$
All prices must be cleanly rounded to sensible Vietnamese currency increments (multiples of 1,000₫).

### R2. Tier Alignment & Outlier Elimination
Audit and calibrate every single dish so that:
- **No overly cheap items**: Dishes with premium ingredients or substantial portion sizes must not be priced unrealistically low (e.g. 5,000₫ for a full lunch).
- **No overly expensive items**: Street foods or simple snacks must not have exorbitant prices (e.g. 150,000₫ for a simple bánh mì).
- **Tier Bracket Compliance**:
  - **Blue (Tiết Kiệm / Nhanh Rẻ / Thử Nghiệm)**: 18,000₫ – 35,000₫
  - **Purple (Bình Dân / Vừa Vặn / Cay Đắng)**: 35,000₫ – 65,000₫
  - **Gold (Ăn Sang / Đặc Biệt / Liều Mạng)**: 65,000₫ – 120,000₫+ (Mâm 3 món chất lượng cao or đặc sản quý)
- Rebalance or reassign any items whose realistic market prices cross tier boundaries appropriately.

### R3. Automated Validation & Live Showcase Deployment
- Create an automated price auditing script (`scripts/audit-dish-prices.cjs`) that parses all pools, validates price bounds, checks for NaN/negative/outlier prices, and reports pricing distribution statistics.
- Verify TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.
- Run deduplication verification (`npx vite-node scripts/test-deduplication.ts`) to ensure 600 rolls across 4 modes maintain 0% duplicate items.
- Run production build (`npm run build`) and synchronize to the live showcase (`node scripts/sync-showcase.js`).
- Repackage the standalone offline bundle (`node scripts/package-portable.js`).

## Acceptance Criteria

### Pricing Authenticity & Integrity
- [ ] 100% of dishes in `comboPool.ts`, `expressPool.ts`, `snackPool.ts`, `bizarrePool.ts`, and `fastMealData.ts` reflect authentic Vietnamese market averages.
- [ ] No dish has an extreme outlier price (neither underpriced nor overpriced).
- [ ] All prices are clean integers rounded to multiples of 1,000₫.
- [ ] Blue tier dishes fall within 18k–35k, Purple tier within 35k–65k, Gold tier within 65k–120k+.

### Code Health & Deployment
- [ ] `tsc --noEmit` exits with 0 errors.
- [ ] Deduplication test suite completes 600 rolls with 0 duplicate items.
- [ ] Production build succeeds and is deployed to `http://localhost:5173/`.
- [ ] Portable zip package `MealWise-Portable-PC.zip` is updated.

## 2026-09-18T07:01:23Z

Deploy a specialized multi-agent engineering and QA audit team to conduct a comprehensive, screen-by-screen audit across every single tab, modal, bottom sheet, and card in MealWise, detecting and eliminating all layout bugs, text collisions, button overlaps, and squished responsive containers (such as the "Mục tiêu / Đổi mục tiêu" text overlap).

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Comprehensive Multi-Screen Layout Collision & Overflow Audit
Exhaustively inspect all 6 application domains, sub-screens, modals, and bottom sheets under mobile (360px–420px) and tablet/desktop viewports:
1. **WeeklyBoard (`src/components/WeeklyBoard.tsx`)**:
   - Header banner: Fix the "Mục tiêu" and "Đổi mục tiêu" collision where the button background pill overlaps the goal description text. Ensure two-line goals wrap cleanly with proper spacing and no overlap under all viewport sizes.
   - Day strip & serving steppers: Verify headcount stepper and date pills never clip or wrap awkwardly.
   - Dish cards & slot actions: Check replace/delete action icons, prices, and dish names.
2. **MealSetExplorer (`src/components/MealSetExplorer.tsx`)**:
   - Region filter chips & search input: Ensure chips wrap or scroll smoothly without text truncations.
   - 3-course meal cards: Ensure course tags, prices, calories, and "Chọn Mâm Này" action buttons never collide or clip text.
   - Bottom sheet detail: Verify modal header, ingredient checklist, and "Thêm Vào Thực Đơn" button.
3. **CateringPartyPlanner (`src/components/CateringPartyPlanner.tsx`)**:
   - Event summary header: Audit headcount inputs, table calculation pills, and cost breakdown pills.
   - Course items: Audit dish selectors, scaled ingredient counts, and kitchen notes.
   - Equipment checklist & Zalo quote export buttons.
4. **GroceryList (`src/components/GroceryList.tsx`)**:
   - Supermarket/market tabs: Ensure store pills wrap or scroll without clipping.
   - Item rows: Check checkbox, ingredient name, quantity badge, price, and delete icon alignment.
   - Sticky bottom action bar: Ensure total price and "Xuất Zalo Đi Chợ" button maintain proper spacing.
5. **RecipeCatalog & RecipeDetailModal (`src/components/RecipeCatalog.tsx`, `src/components/RecipeDetailModal.tsx`)**:
   - Filter tags, cooking time badges, serving steppers, and ingredient rows.
6. **FastMealApexModal & OnboardingModal (`src/components/FastMealApexModal.tsx`, `src/components/OnboardingModal.tsx`)**:
   - Preference selection cards: Ensure title, badge, and sample text are well-spaced.
   - Case opening stage: Ensure tier cards, roll buttons, reward modal, and banner text never clip or overlap.
   - Onboarding wizard steps: Ensure options, steppers, and next/back buttons never clip or overflow.
7. **AccountView, Navbar & Sidebar (`src/components/AccountView.tsx`, `src/components/Navbar.tsx`, `src/components/Sidebar.tsx`)**:
   - Profile summary, dark mode toggle, and navigation tab labels.

### R2. Systematic Layout Remediation
- Replace fragile flex/absolute position collisions with robust responsive containers (`flex-wrap`, `min-w-0`, `shrink-0`, gap utilities, or grid templates).
- Ensure all interactive buttons have clear boundary margins and sufficient touch targets.
- Ensure text elements wrap naturally or truncate with tooltips where appropriate, never overlapping neighbouring buttons or badges.

### R3. Verification, Regression Testing & Deployment
- Verify TypeScript compilation (`cmd /c npx tsc --noEmit`) passes with 0 errors.
- Run unit test suite (`cmd /c npm test`) to confirm 138/138 tests pass with 0 regressions.
- Build production bundle (`cmd /c npm run build`) and synchronize to the live showcase (`node scripts/sync-showcase.js`).
- Repack the portable standalone zip (`node scripts/package-portable.js`).
- Verify live HTTP 200 serving on `http://localhost:5173/`.

## Acceptance Criteria

### Visual & Responsive Layout Health
- [ ] In `WeeklyBoard`, the "Mục tiêu" text and "Đổi mục tiêu" button are properly separated with zero overlap across all possible goal lengths and screen sizes.
- [ ] Zero text-on-button or text-on-text collisions across all 6 main tabs, modals, and bottom sheets on 360px–420px mobile viewports.
- [ ] All badges, buttons, and steppers have appropriate padding, spacing, and legible text.

### Code Health & Deployment
- [ ] `tsc --noEmit` exits with 0 errors.
- [ ] `npm test` passes all tests with 0 failures.
- [ ] Live application running at `http://localhost:5173/` reflects all fixes.
- [ ] Portable zip package `MealWise-Portable-PC.zip` is updated.

## 2026-09-19T15:41:13Z

Deploy a coordinated multi-agent engineering, data calibration, and visual QA team to optimize and semantically match every dish across MealWise with accurate, high-definition, appetizing food and drink photography (e.g. burgers show authentic burgers, fried chicken shows crispy fried chicken, phở shows steaming beef noodle bowls, bánh mì shows crusty stuffed baguettes, boba/coffee shows real iced drinks), eliminating all repetitive generic placeholders across all 6 application domains and 1,000+ dishes.

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Semantic Dish Classification & Curated Food Image Library
Build a comprehensive Vietnamese & International culinary image taxonomy covering all culinary categories:
- **Fast Food & Snacks**: Burgers, fried chicken (gà rán/gà xối mỡ), pizza, french fries, hotdogs, tacos, bánh tráng nướng, nem chua rán, xiên que, cá viên chiên.
- **Vietnamese Noodle & Rice Classics**: Phở bò/gà, bún chả, bún bò Huế, bún riêu, bún đậu mắm tôm, hủ tiếu, mì Quảng, cơm tấm sườn bì chả, cơm rang dưa bò, xôi xéo/xôi gà.
- **Home-cooked Meal Sets (Mâm Cơm 3 Món)**:
  - *Món Mặn (Proteins)*: Thịt kho tàu/kho trứng, thịt rang cháy cạnh, cá kho tộ, sườn ram mặn ngọt, gà kho gừng sả, bò xào cần tỏi, tôm rim mặn, đậu sốt cà chua.
  - *Món Canh (Soups)*: Canh chua cá lóc, canh cua mồng tơi rêu cua, canh sườn nấu sấu, canh rau ngót thịt băm, canh bí đỏ thịt bằm, canh khổ qua nhồi thịt.
  - *Món Rau/Xào/Luộc*: Rau muống xào tỏi, bắp cải luộc chấm trứng, đậu que xào thịt bò, mướp đắng xào trứng.
- **Beverages & Desserts**: Cà phê sữa đá, cà phê muối, trà đào cam sả, trà sữa trân châu, sinh tố bơ, chè dưỡng nhan, flan caramen, chè khúc bạch.
- **Dare & Street Novelty**: Authentic imagery for regional delicacies and exotic challenge items (mắm tôm, sầu riêng, trứng vịt lộn, dế mèn, đồ cay nồng).

Every image asset must use verified, high-performance, responsive Unsplash CDN URLs (`auto=format&fit=crop&w=600&q=80`) featuring crisp lighting, professional food styling, and zero broken links.

### R2. Core Database Image Calibration
Audit and update all static recipe and dish databases:
- `src/data/mockRecipes.ts` (All home cooking recipes)
- `src/data/mockMealSets.ts` (All 3-dish meal sets)
- `src/data/fastMealData.ts` (Fast suggestion dishes, sides, and drinks)
- `src/data/corporatePartyPresets.ts` (Catering banquet courses)
- `src/data/casePools/comboPool.ts` (200 3-course lunch combos)
- `src/data/casePools/expressPool.ts` (201 quick lunch dishes)
- `src/data/casePools/snackPool.ts` (201 afternoon snacks & artisan drinks)
- `src/data/casePools/bizarrePool.ts` (200 challenge & novelty dishes)

Replace all repetitive, duplicate image IDs (such as the overused rib image `1544025162-d76694265947`) with accurate, distinct, semantically tailored food photography.

### R3. Resilient Runtime Dynamic Image Resolver (`getDishImageUrl`)
Implement a centralized image resolver utility `src/utils/dishImageResolver.ts` that:
- Accepts a dish title, category, description, and optional existing URL.
- Uses tokenized diacritic-insensitive Vietnamese & English semantic keyword matching with weighted scoring to always select the most specific dish photo (e.g., distinguishing "gà chiên / gà rán" from "gà kho" or "cơm gà").
- Provides graceful, categorized fallbacks with `onError` handling on all `<img>` tags throughout the UI so no card ever displays a broken image icon.
- Integrates seamlessly into all components rendering dish photos (`WeeklyBoard`, `MealSetExplorer`, `MealSetDetailModal`, `RecipeCatalog`, `RecipeDetailModal`, `FastMealApexModal`, `CateringPartyPlanner`).

### R4. Multi-Screen Visual Audit & Build Verification
Verify that:
- Every dish card across all 6 tabs displays a photo that directly matches its name.
- No duplicate placeholder photos dominate screens.
- `npx tsc --noEmit` compiles with 0 errors.
- All automated tests (`npm test`) pass 100%.
- Production bundle builds (`npm run build`) and syncs to showcase with live HTTP 200 verification.

## Acceptance Criteria

### Semantic Match Accuracy
- [ ] Burgers, sandwiches, and bánh mì show bread/burger/sandwich photography.
- [ ] Fried chicken dishes (gà rán, gà xối mỡ, gà chiên giòn) show crispy golden fried chicken.
- [ ] Noodle soups (phở, bún bò, bún chả, mì Quảng) show steaming noodle bowls with broth and toppings.
- [ ] Traditional rice dishes (cơm tấm, cơm rang, cơm thịt kho) show plated rice with matching protein.
- [ ] Vietnamese home soups (canh chua, canh cua, canh sườn) show authentic soup bowls with greens/broth.
- [ ] Drinks and boba teas show beverages with ice/straws/cups, never solid meats or dinners.
- [ ] Less than 5% duplicate image overlap across active views, eliminating the single placeholder syndrome.

### System & Build Integrity
- [ ] `dishImageResolver.ts` exports `getDishImageUrl(title, category, currentUrl)` with 50+ semantic food clusters.
- [ ] All components (`WeeklyBoard`, `MealSetExplorer`, `FastMealApexModal`, `RecipeCatalog`, `CateringPartyPlanner`) wrap image tags with fallback handling.
- [ ] `cmd /c npx tsc --noEmit` exits with code 0.
- [ ] `cmd /c npm test` passes 100% of test suites with new semantic image matching unit tests added.
- [ ] `node scripts/sync-showcase.js` builds clean production bundles and verifies live HTTP 200 serving on `http://localhost:5173/`.

## 2026-09-20T04:23:50Z

Deploy a full multi-agent QA and algorithmic engineering team to test, calibrate, and resolve the meal plan budget calculation across all family sizes (1 person, 2 persons, 4 persons, 6+ persons) and budget levels (Tiết kiệm, Vừa phải, Thoải mái), ensuring generated 7-day meal plans fit within budget targets out-of-the-box without requiring manual recalibration.

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Budget-Compliant Automatic 7-Day Meal Plan Generation
Upgrade the automatic weekly menu generator to guarantee that generated plans strictly respect the user's daily budget across any number of people:
- Compute exact daily budget targets based on family size and selected budget level (Tiết kiệm: 60,000 VND/person/day, Vừa phải: 95,000 VND/person/day, Thoải mái: 140,000 VND/person/day).
- For multi-person plans (>= 2 people), filter and select meal sets and breakfasts such that the scaled cost of every single day satisfies:
  scaledDayCost <= dailyBudgetTarget * 1.05
- Ensure that for economical tiers (e.g. 2 people on Tiết kiệm = 120,000 VND/day; 4 people = 240,000 VND/day), the generator selects affordable 3-dish sets and breakfasts rather than disproportionately expensive options that trigger immediate over-budget warnings.
- Preserve dietary goals (Eat Clean, Gym/Protein, Chay), regional taste preferences (Bắc / Trung / Nam / Toàn quốc), and meal variety (prevent identical sets on consecutive days).

### R2. Seamless Servings Scaling & Instant Dynamic Adjustment
- Ensure that when the user adjusts the number of people (e.g. from 1 to 2, 4, or 6 people) or modifies the budget level in Settings/Onboarding, all costs, nutrition metrics, and budget threshold indicators recalculate accurately with clean integer rounding.
- If existing meal selections exceed the budget ceiling after a family size or budget tier change, automatically rebalance or offer 1-click optimization to swap over-budget items with budget-compliant alternatives.

### R3. Comprehensive Multi-Scenario Test Matrix & Validation Suite
Build and execute an automated test suite covering all practical household dining configurations:
- Matrix Scenarios:
  - 1 Person: Tiết kiệm, Vừa phải, Thoải mái (both Single-dish and Meal-set formats)
  - 2 Persons: Tiết kiệm, Vừa phải, Thoải mái
  - 3 Persons: Tiết kiệm, Vừa phải, Thoải mái
  - 4 Persons: Tiết kiệm, Vừa phải, Thoải mái
  - 6 Persons: Tiết kiệm, Vừa phải, Thoải mái
  - Regional variations (Bắc, Trung, Nam) across all sizes
  - Dietary modes (Gym Protein, Eat Clean, Chay) across all sizes
- Verify that across every scenario:
  - 0 days trigger isOverBudget warnings.
  - Every day contains 3 complete meals (breakfast, lunch, dinner).
  - Variety score is verified (no back-to-back duplicate meal sets).

### R4. Production Build & System Integrity
- All existing and new automated unit tests pass 100% (`cmd /c npm test`).
- TypeScript static analysis compiles cleanly with 0 errors (`cmd /c npx tsc --noEmit`).
- Production build succeeds and syncs cleanly (`cmd /c node scripts/sync-showcase.js`).

## Acceptance Criteria

### Budget Compliance
- [ ] 1 person plan (single-dish & meal-set) generates 7 days with 0 over-budget days across all 3 budget tiers.
- [ ] 2 persons plan generates 7 days with 0 over-budget days across all 3 budget tiers.
- [ ] 4 persons plan generates 7 days with 0 over-budget days across all 3 budget tiers.
- [ ] 6 persons plan generates 7 days with 0 over-budget days across all 3 budget tiers.
- [ ] After 1-click "Tự động gợi ý 7 ngày", hasAnyOverBudgetDay === false out-of-the-box without requiring manual recalibration.

### Culinary Variety & Preferences
- [ ] Meal selections respect regional preferences (Bắc / Trung / Nam) and special dietary tags (Gym, Eat Clean, Chay).
- [ ] No duplicate meal sets assigned to consecutive days.

### Verification & Automated Testing
- [ ] Automated test suite runs the complete scenario matrix and reports 100% pass rate.
- [ ] cmd /c npx tsc --noEmit exits with 0 errors.
- [ ] cmd /c npm test exits with 0 errors.
- [ ] Production showcase verified live with HTTP 200 on port 5173.

## 2026-09-20T16:49:19Z

Deploy a full multi-agent team to upgrade the 1-click weekly meal plan generator with stochastic Knapsack optimization and verify that every click on "Gợi Ý 1-Click Cả Tuần" produces a distinctly different 7-day meal plan while strictly adhering to all user onboarding rules (budget ceiling, family size, region preference, dietary goals, zero over-budget days), proven across a 10-iteration repeated execution matrix.

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Dynamic Refresh & Novelty on Every 1-Click Generation
Upgrade `generateBudgetCompliantWeeklyPlan` in `src/utils/mealPlanGenerator.ts` and `autoFillWeeklyMenu` in `src/context/MealWiseContext.tsx`:
- Introduce dynamic entropy / seed / rotation parameter on each generation call (e.g., timestamp, random seed, or cycle index) so that clicking "Gợi Ý 1-Click Cả Tuần" produces a different menu every single time.
- Implement diverse Knapsack selection (weighted stochastic tie-breaking among optimal budget-compliant candidate pairs) rather than a rigid deterministic alphabetical sort.
- Ensure noticeable variety: consecutive clicks must produce significant dish and meal set rotation across the week.

### R2. Strict Onboarding Rules & Budget Invariant Enforcement
Even with dynamic randomized selection, every generated plan must 100% adhere to all user onboarding rules:
- **Budget Ceiling**: Every single day must satisfy scaledDayCost <= dailyBudgetTarget * 1.05 across all family sizes (1, 2, 3, 4, 6+ people) and all tiers (Tiết kiệm 60k, Vừa phải 95k, Thoải mái 140k). 0 over-budget days out-of-the-box.
- **Regional Authenticity**: Respect user preference (Bắc, Trung, Nam, Toàn quốc).
- **Dietary Goals**: Respect special needs (Gym Protein, Eat Clean, Chay, Ít cay).
- **Solo Dining Format**: 1 person gets single-dish or meal-set according to onboarding choice.
- **Deduplication**: No same-day duplicates (lunch !== dinner) and no consecutive-day duplicates (lunch !== prevLunch, dinner !== prevDinner).

### R3. Comprehensive 10-Iteration Repetition Test Suite
Create automated test suite `tests/unit/weeklyPlanVariation.test.ts`:
- For every onboarding combination (1P, 2P, 4P, 6P * Tiết kiệm, Vừa phải, Thoải mái * Bắc, Trung, Nam * Gym, Eat Clean, Chay):
  - Execute 1-click generation at least 10 consecutive times.
  - Assert that across all 10 generations:
    - Every generated plan differs from the immediately preceding plan (novelty check).
    - 100% of days in all 10 generations have isOverBudget === false.
    - Every day has 3 complete meals.
    - All onboarding dietary and regional rules remain strictly intact across all 10 runs.

### R4. Production Build, APK & Showcase Synchronization
- Compile TypeScript with 0 errors (`cmd /c npx tsc --noEmit`).
- Pass all automated unit & E2E tests (`cmd /c npm test`).
- Rebuild production showcase bundle and sync to `MealWise-Portable-Showcase` (`cmd /c node scripts/sync-showcase.js`).
- Rebuild APK (`MealWise.apk`) and update `MealWise-Portable-PC.zip` (`cmd /c node scripts/package-portable.js`).
- Verify live HTTP 200 serving on port 5173.

## Acceptance Criteria

### Click-to-Click Variation
- [ ] Clicking "Gợi Ý 1-Click Cả Tuần" repeatedly generates a distinctly different 7-day menu on each click.
- [ ] Consecutive generations alter at least 40% of the weekly meal slots.

### Onboarding Rule Compliance
- [ ] 0 over-budget days across all 10 consecutive generations for any family size (1, 2, 4, 6+).
- [ ] Regional, dietary, and format preferences strictly respected in all runs.
- [ ] No same-day duplicates (lunch !== dinner).

### Verification & Testing
- [ ] 10-iteration repetition test suite runs and passes 100% across all scenario combinations.
- [ ] cmd /c npx tsc --noEmit exits with 0 errors.
- [ ] cmd /c npm test exits with 0 errors.
- [ ] Live serving verified on port 5173 with HTTP 200.

## 2026-09-21T08:28:50Z

Deploy testing team to simulate repeated spins and verify drinking roulette rules

Fix the Drinking Roulette selection alignment bug where pointer lands on one player/shot but announces a different one across repeated spins, implement the "Cả Bàn!" rule (+1 tally for all players), and implement the "Uống Hộ" sub-wheel (spin among other players excluding the current victim).

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Exact Wheel Pointer Alignment Across Infinite Consecutive Spins
Fix angle calculation in `DrinkRouletteModal.tsx` and `RouletteWheel.tsx`:
- Compute `forwardDelta` from normalized current angle `(currentAngle % 360 + 360) % 360` so the landing angle is 100% mathematically locked to the target slice center regardless of previous spin count or player count.
- Eliminate random jitter that crosses segment boundaries.
- Ensure SVG rotation uses `transformBox: 'view-box'` and exact `(center, center)` transform origin.

### R2. "Cả Bàn!" Rule — All Players Tally Increment
When the shot wheel lands on "Cả Bàn!" (everyone drinks):
- Increment `shotsCount` by 1 for **EVERY** player in the session roster, not just the currently selected player.
- Display announcement card highlighting that everyone in the room has to take a drink.

### R3. "Uống Hộ" Rule — Delegate Drinker Sub-Wheel
When the shot wheel lands on "Uống Hộ" (drink on behalf):
- Transition to a dedicated sub-wheel containing all players **EXCEPT** the original spinner (`players.filter(p => p.id !== selectedPlayer.id)`).
- Interactively spin to select who must drink on their behalf.
- The chosen delegate player receives the penalty shot in the tally scoreboard.
- Announcement clearly states: "[Original Player] đã chỉ định [Delegate Player] uống hộ 1 shot!".

### R4. Automated Repetition Matrix & Regression Test Suite
Create automated test suite in `tests/unit/minigames.test.ts`:
- Simulate 100 consecutive spins across various player counts (2 to 10 players).
- Verify 0 angle-slice mismatches across all 100 spins.
- Verify "Cả Bàn!" increments every player's tally.
- Verify "Uống Hộ" generates a wheel without the original spinner and assigns penalty to the chosen delegate.

## Acceptance Criteria

### Wheel Alignment & Math
- [ ] 0 pointer-slice mismatches across 100 consecutive simulated spins for any roster size (2 to 10 players).
- [ ] Shot count wheel lands on the exact shot/penalty displayed in the result card.

### Rule Execution
- [ ] Landing on "Cả Bàn!" adds +1 shot to all active players in the scoreboard.
- [ ] Landing on "Uống Hộ" opens a sub-wheel excluding the current player and assigns the shot to the newly chosen player.

### Verification & Quality
- [ ] `cmd /c npx tsc --noEmit` exits with 0 errors.
- [ ] `cmd /c npm test` passes 100% of test suites.
- [ ] Live serving verified on ngrok tunnel and port 5173.

## 2026-09-22T02:42:16Z

Deploy full responsive design & QA team to audit and optimize all screen dimensions (320px to 4K desktop).

Optimize MealWise layout, typography, navigation, cards, and modals for flawless responsive design across all device dimensions (narrow mobile 320px–375px, standard mobile 390px–428px, tablet 768px–1024px, and desktop). Eliminate all overlapping buttons, awkward multi-line word breaks, title collisions, and truncated header badges.

Working directory: `d:\New folder\Remotion`
Integrity mode: development

## Requirements

### R1. Fridge & Leftover View (Tủ Lạnh) Responsive Ergonomics
Eliminate element collision and awkward line breaks shown in `FridgeView.tsx`:
- Header action row: cleanly stack or refactor the "🧊 Tủ Lạnh", "🛒 Đối Chiếu Đi Chợ", and "🗑️ Dọn sạch" buttons so they never collide or overlap with the title below on 320px–375px viewports.
- Title & counter badge: streamline "Tủ Lạnh & Đồ Ăn Thừa Thông Minh" with responsive text scaling (`text-base sm:text-lg md:text-xl`) to prevent orphan word wrapping ("Thông" / "Minh").
- Metric cards & recipe suggestion grids: ensure 2x2 metric cards and recipe carousels fit comfortably without horizontal overflow on narrow viewports.

### R2. Global Navbar & Header Badge Adaptation
- Fix the active screen badge pill in `Navbar.tsx` (e.g. `Tủ Lạnh & Đồ T...`) so titles fit gracefully without harsh truncation on 320px–375px screens (use responsive font sizing, concise mobile labels, or auto-fit pills).
- Ensure brand title ("MealWise • Mâm Cơm Việt"), active badge, and action toggles maintain balanced horizontal spacing across all viewports.

### R3. Comprehensive Multi-Device Dimension Audit Across All Tabs & Modals
Audit and optimize all core application views across the full device spectrum:
- **WeeklyBoard (Thực Đơn Tuần)**: Day selector tabs, macro nutrition cards, meal slot cards, and 1-click action buttons must fit smoothly without clipping on 320px–375px.
- **MealSetExplorer (Mâm 3 Món)**: Filter chips, search bar, meal set cards, dish preview pills, and slot assignment drawer.
- **GroceryList (Đi Chợ Tự Động)**: Store channel filters, collaboration header, participant roster, shopping items, and sticky footer.
- **CateringPartyPlanner (Tiệc & Catering)**: Guest stepper, budget breakdown, course selection tabs, and quotation export bar.
- **Modals (Minigame Hub, Drinking Roulette, Apex Case, Recipe Detail, Onboarding)**: Ensure max-height, scrolling bounds, and safe-area insets (`pb-[env(safe-area-inset-bottom)]`) prevent off-screen cutoff on both short and tall phones.

### R4. Automated Multi-Dimension Visual & Layout Test Suite
Expand `tests/` with programmatic dimension layout assertions:
- Test container bounds, width calculations, and flex wrapping behavior across standard device widths: `320px` (iPhone SE 1st gen), `360px` (Galaxy S/A), `375px` (iPhone SE/mini), `390px` (iPhone 13/14/15/16), `414px/428px` (Plus/Max), `768px` (iPad/Tablet), and `1280px+` (Desktop).
- Assert zero horizontal scrollbar overflow (`overflow-x` invariant).
- Verify 100% test suite pass rate (241+ tests).

## Acceptance Criteria

### Layout & Spacing Integrity
- [ ] No overlapping buttons, text collisions, or clipped icons in `FridgeView` on 375px x 858px and 320px screens.
- [ ] Title "Tủ Lạnh & Đồ Ăn Thừa" does not wrap into an orphan single word on mobile.
- [ ] Navbar screen badge displays clean, legible titles without awkward mid-word truncation ellipsis.
- [ ] 0 horizontal scroll overflow on any tab across 320px, 360px, 375px, 390px, 414px, 768px, and desktop widths.

### Cross-Device Modal & Sheet Bounds
- [ ] Modals (Minigame Hub, Drinking Roulette, Case Opening, Recipe Details) fit within viewport height with smooth vertical scrolling and sticky action footers.
- [ ] Safe area insets respected for iOS notch/home indicator and Android navigation bars.

### Verification & Quality
- [ ] `cmd /c npx tsc --noEmit` exits with 0 errors.
- [ ] `cmd /c npm test` passes 100% of test suites with multi-dimension test coverage.
- [ ] Production build synced to showcase and verified on live ngrok tunnel.

