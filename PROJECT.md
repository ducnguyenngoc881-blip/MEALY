# Project: MealWise 1000+ Scenario Audit, Defect Remediation & Quality Hardening

## Architecture
MealWise is a full-featured, mobile-first Vietnamese and international culinary management web application with 9 core screen domains:
1. **Screen 1: WeeklyBoard (Thực Đơn Tuần)** — 1-click stochastic Knapsack menu generation, budget compliance (60k/95k/140k/Western rates), meal swapping, 3-dish set dish replacement, slot selection, servings stepper (1-20+), macro calculation, zero over-budget days, local storage round-trip.
2. **Screen 2: MealSetExplorer (Mâm Cơm 3 Món)** — Regional filtering (Bắc, Trung, Nam, Toàn quốc, Tây Âu/Western), taste tags, budget levels, pagination, instant slot assignment to 21 slots, dish preview drawer.
3. **Screen 3: RecipeCatalog & RecipeDetailModal (Sổ Tay Công Thức)** — Diacritic-insensitive Vietnamese search, ingredient scaling, cooking step accordion, single-dish vs set conversion, add-to-grocery with unit merging.
4. **Screen 4: GroceryList & ShareCollabCartModal (Đi Chợ Tự Động & Real-time Collab)** — Channel filtering (Chợ dân sinh, Bách Hóa Xanh, Co.opmart, WinMart), item aggregation, unit normalizations (kg, g, lạng, bó, quả, muỗng), check-off persistence, collaborative cart code sync, export to text/Zalo.
5. **Screen 5: FridgeView & FridgeLeftoverModal (Tủ Lạnh & Đồ Thừa)** — Expiry warning thresholds, 7-category inventory matrix (thịt, cá, rau, trứng, gia vị...), multi-ingredient recipe matching, negative brand-trap filtering, quick add/remove.
6. **Screen 6: CateringPartyPlanner (Tiệc & Đặt Mâm)** — Guest count stepper (1 to 200+ guests), table division, preset banquet configurations, profit margin/cost calculation, quotation generation, export to Zalo.
7. **Screen 7: Minigames & Arcades (DrinkRoulette, FastMealApexModal, RouletteWheel)** — Probability distributions, pointer wheel angle synchronization, "Cả Bàn!" rule, "Uống Hộ" sub-wheel delegation, loot box rarity rolls, zero negative balances.
8. **Screen 8: OnboardingModal & AccountView (Khảo Sát & Tài Khoản)** — Flow ordering (Preferences -> Budget), Western food integration, family size multiplier, dietary restrictions (Gym, Eat Clean, Chay, Ít cay), JSON backup/restore.
9. **Screen 9: Global Shell, Navigation & System Dialogs (Navbar, Sidebar, ConfirmModal, Toast, SafeImage)** — Mobile drawer responsiveness, dark/light theme toggle, broken image fallback, safe area insets on mobile viewports.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Test Runner Telemetry Counter | Add assertion-level atomic counter to `tests/helpers/testRunner.ts` to explicitly report total programmatic assertions (>5,000) alongside test counts | M1 | Survey (explorer_survey_3) |
| 2 | Scenario Matrix Expansion to >1,000 Tests | Expand registered test cases from 377 to 1,025+ covering all 9 screens with concrete edge cases and parametric sweeps | M1 | Survey (explorer_survey_1, 2, 3) |
| 3 | Screen 1 WeeklyBoard Breakfast Meal Set Picker | Enable meal sets in Breakfast slot picker bottom sheet so users can assign 3-dish sets to breakfast directly from the board | M2 | Survey (explorer_survey_1) |
| 4 | Screen 1 Weekly Total Cost Arithmetic Alignment | Sum displayed `scaledDayCost` across 7 days for `scaledTotalWeeklyCost` to eliminate 1k–3k VND rounding variance | M2 | Survey (explorer_survey_1) |
| 5 | Screen 2 MealSetExplorer Western Region Tab | Add `{ id: 'western', label: 'Món Âu' }` to region tab bar in `MealSetExplorer.tsx` to surface Western meal sets | M2 | Survey (explorer_survey_1) |
| 6 | Screen 3 RecipeDetailModal 1-Click Grocery Push | Add "🛒 Đi Chợ Món Này" button to push scaled ingredients into `extraGroceryItems` in `MealWiseContext` | M2 | Survey (explorer_survey_1) |
| 7 | Screen 3 RecipeDetailModal Numeric Stepper Input | Add direct number input alongside +/- buttons in servings stepper for typing arbitrary headcounts [1..20] | M2 | Survey (explorer_survey_1) |
| 8 | Screen 4 GroceryList Comma Decimal Parsing | Fix `parseAmount` in `GroceryList.tsx` to handle Vietnamese comma decimals (e.g., `"0,5"`) without falling back to `1` | M3 | Survey (explorer_survey_2) |
| 9 | Screen 4 GroceryList 'lạng' Unit Normalization | Add `lạng` (100g) to weight family in `normalizeIngredientUnitAndAmount` so it merges with `g` and `kg` | M3 | Survey (explorer_survey_2) |
| 10 | Screen 5 FridgeView Leftover & Rotation Validation | Verify quick add leftover items, 2-day expiry warnings, and whole-fridge rotation | M3 | Survey (explorer_survey_2) |
| 11 | Screen 6 CateringPartyPlanner Parametric Stability | Verify financial formulas, table division, and quotation generation across guest counts 1 to 500+ | M3 | Survey (explorer_survey_2) |
| 12 | Screen 7 Minigame Wheel Math & Headless Safety | Verify pointer-center alignment across infinite spins and ensure Web Audio mock does not throw | M4 | Survey (explorer_survey_3) |
| 13 | Screen 8 AccountView 1-Click JSON Backup & Restore | Implement export/import of all 15 localStorage state keys in `AccountView.tsx` with schema validation | M4 | Survey (explorer_survey_3) |
| 14 | Screen 9 Global Shell Safe Area & Broken Image Fallback | Verify top/bottom safe area insets on mobile viewports and category-matched SVG fallbacks in SafeImage | M4 | Survey (explorer_survey_3) |
| 15 | Multi-Agent Code Review & Challenger Stress | Independent Reviewers and Challengers auditing algorithm correctness and stress-testing edge cases | M5 | Project Architecture |
| 16 | Forensic Integrity Audit | Zero-tolerance Forensic Integrity Audit (`teamwork_preview_auditor`) verifying authentic implementation | M5 | Project Architecture |
| 17 | Final Verification (Build, Tests, TSC, Live Server) | Verify 100% test pass, 0 TS compiler errors, clean production build, and live HTTP 200 on port 5173 | M5 | Project Architecture |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Test Infrastructure & Scenario Matrix Expansion (>1000 Scenarios) | `tests/helpers/testRunner.ts`, `tests/unit/`, `tests/run-all-tests.ts` | Survey | DONE |
| M2 | Bug Remediation & UX Optimization: Screens 1 to 3 | `src/components/WeeklyBoard.tsx`, `src/components/MealSetExplorer.tsx`, `src/components/RecipeDetailModal.tsx` | Survey | DONE |
| M3 | Bug Remediation & UX Optimization: Screens 4 to 6 | `src/components/GroceryList.tsx`, `src/components/FridgeView.tsx`, `src/components/CateringPartyPlanner.tsx` | Survey | DONE |
| M4 | Bug Remediation & UX Optimization: Screens 7 to 9 | `src/components/AccountView.tsx`, `src/components/DrinkRouletteModal.tsx`, `src/components/SafeImage.tsx` | Survey | DONE |
| M5 | Gate Verification, Multi-Agent Review, Adversarial Challenge & Forensic Audit | Reviewers, Challengers, Forensic Auditor, Build, Showcase Sync, Port 5173 HTTP 200 | M1, M2, M3, M4 | DONE |

## Interface Contracts

### JSON Backup & Restore Schema (`AccountView.tsx` & `MealWiseContext.tsx`)
```typescript
export interface MealWiseStateBackup {
  version: 1;
  exportedAt: string; // ISO string
  state: {
    weeklyPlan?: unknown;
    onboardingData?: unknown;
    theme?: string;
    partyPlan?: unknown;
    pantryItems?: unknown;
    extraGroceryItems?: unknown;
    groceryCheckedItems?: unknown;
    unlockedCases?: unknown;
    [key: string]: unknown;
  };
}

export function exportMealWiseBackup(): string;
export function importMealWiseBackup(jsonContent: string): { success: boolean; error?: string };
```

### Grocery Unit Normalization (`GroceryList.tsx`)
```typescript
// Support 'lạng' -> 100g in base grams
// Support comma decimal parsing: parseAmount("0,5 kg") -> 0.5 kg -> 500g
```

## Code Layout
- `tests/helpers/testRunner.ts`, `tests/run-all-tests.ts`, `tests/unit/` (Owned by Worker M1 / Test Writers)
- `src/components/WeeklyBoard.tsx`, `src/components/MealSetExplorer.tsx`, `src/components/RecipeDetailModal.tsx` (Owned by Worker M2)
- `src/components/GroceryList.tsx`, `src/components/FridgeView.tsx`, `src/components/CateringPartyPlanner.tsx` (Owned by Worker M3)
- `src/components/AccountView.tsx`, `src/components/DrinkRouletteModal.tsx`, `src/components/SafeImage.tsx` (Owned by Worker M4)
