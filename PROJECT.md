# Project: MealWise 1-Click Stochastic Knapsack Weekly Meal Plan Variation Engine

## Architecture
MealWise is a Vietnamese meal planning and smart grocery web application built with React, Vite, Tailwind CSS, and TypeScript.
This project upgrades the 1-click weekly meal plan generator with stochastic Knapsack optimization to guarantee that clicking "Gợi Ý 1-Click Cả Tuần" repeatedly generates a distinctly different 7-day meal plan (altering >=40% of slots across consecutive runs) while strictly maintaining zero over-budget days and 100% onboarding rule compliance across all household configurations, verified across a 10-iteration repeated execution matrix (1,080 generations).

## Feature Inventory
Every feature from the Survey phase appears here with its assigned milestone.
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Seedable PRNG & Dynamic Entropy Parameter | Add Mulberry32 PRNG and `seed`, `variationIndex`, `iteration` options to `PlanGeneratorOptions` in `src/utils/mealPlanGenerator.ts` | M1 | Survey (explorer_variation_1, 2) |
| 2 | Stochastic Breakfast Candidate Jitter & Rotation | Introduce dynamic candidate jitter, rotation offsets, and non-consecutive day rotation for breakfasts | M1 | Survey (explorer_variation_1) |
| 3 | Stochastic Knapsack Pair Selection | Filter valid pairs meeting budget ceiling, group top candidate pairs into elite pool, and select via weighted stochastic distribution | M1 | Survey (explorer_variation_1) |
| 4 | Quad-Layer >=40% Novelty Guarantee | Enforce that consecutive generations alter >=9 of 21 meal slots (>=40%) with slot-specific novelty avoidance penalties | M1 | Survey (explorer_variation_1, 3) |
| 5 | Strict Budget Ceiling Invariant Preservation | Guarantee `scaledDayCost <= dailyBudgetTarget * 1.05` on 100% of days out-of-the-box across all household sizes (1, 2, 4, 6+) and budget tiers | M1 | Survey (explorer_variation_1, 2, 3) |
| 6 | Onboarding Dietary & Regional Compliance | Strictly preserve regional taste preferences (Bắc, Trung, Nam), dietary goals (Gym, Eat Clean, Chay), and solo formats | M1 | Survey (explorer_variation_1, 3) |
| 7 | Deduplication Invariant Enforcement | Guarantee no same-day duplicates (`lunch !== dinner`) and no consecutive-day duplicates across all 7 days | M1 | Survey (explorer_variation_1, 3) |
| 8 | Context State & Generation Counter | Add `generationCount` state to `MealWiseContext.tsx` and derive entropy seed `(Date.now() ^ (nextCount * 2654435761))` | M2 | Survey (explorer_variation_2) |
| 9 | 1-Click UI Wiring & Loading State | Wire "Gợi Ý 1-Click Cả Tuần" in `WeeklyBoard.tsx` to `autoFillWeeklyMenu()` with 250ms spinning icon and smooth card fade-in | M2 | Survey (explorer_variation_2) |
| 10 | Complete Onboarding & Recalibration Wiring | Pass dynamic entropy seeds in `completeOnboarding()` and `recalibrateWeeklyMenu()` | M2 | Survey (explorer_variation_2) |
| 11 | 10-Iteration Repetition Test Matrix Suite | Implement `tests/unit/weeklyPlanVariation.test.ts` covering 108 combinations x 10 runs = 1,080 generations | M3 | Survey (explorer_variation_3) |
| 12 | Test Runner Integration & Metric Registry | Register variation suite in `tests/run-all-tests.ts` under prefix `Unit:` for automated npm test execution | M3 | Survey (explorer_variation_3) |
| 13 | Multi-Agent Code Review & Adversarial Stress | Independent Reviewers and Challengers auditing code quality, randomness properties, and edge cases | M4 | Project Architecture |
| 14 | Forensic Integrity Audit | Zero-tolerance Forensic Integrity Audit (`teamwork_preview_auditor`) verifying genuine algorithmic implementation | M4 | Project Architecture |
| 15 | Production Build, APK, Showcase Sync & HTTP 200 | TypeScript compilation (`tsc --noEmit`), `npm test`, `sync-showcase.js`, `package-portable.js`, and live port 5173 verification | M4 | Project Architecture |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Stochastic Knapsack Generator Engine | `src/utils/mealPlanGenerator.ts` | Survey | DONE |
| M2 | Context Integration & 1-Click UI Wiring | `src/context/MealWiseContext.tsx`, `src/components/WeeklyBoard.tsx` | M1 | DONE |
| M3 | 10-Iteration Repetition Test Matrix Suite | `tests/unit/weeklyPlanVariation.test.ts`, `tests/run-all-tests.ts` | M1 | DONE |
| M4 | Gate Verification, Review, Adversarial Hardening, Forensic Audit & Showcase Deployment | Reviewers, Challengers, Forensic Auditor, Build, APK, Showcase Sync | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts

### Generator Options (`src/utils/mealPlanGenerator.ts`)
```typescript
export interface PlanGeneratorOptions {
  servings: number; // 1, 2, 3, 4, 6+
  budgetLevel: 'tiet-kiem' | 'vua-phai' | 'thoai-mai';
  regionPreference?: 'bac' | 'trung' | 'nam' | 'toan-quoc' | 'all';
  specialNeeds?: string[]; // 'gym-protein', 'eat-clean', 'chay', etc.
  mealFormat?: 'single-dish' | 'meal-set';
  seed?: number | string;
  variationIndex?: number;
  iteration?: number;
  previousPlanSlotIds?: Record<string, string>;
}
```

### Context API (`src/context/MealWiseContext.tsx`)
```typescript
export interface MealWiseContextType {
  ...
  generationCount: number;
  autoFillWeeklyMenu: (
    customPreferences?: OnboardingData,
    options?: { seed?: number; cycleIndex?: number }
  ) => void;
  ...
}
```

## Code Layout
- `src/utils/mealPlanGenerator.ts` (Owned by Worker M1)
- `src/context/MealWiseContext.tsx` (Owned by Worker M2)
- `src/components/WeeklyBoard.tsx` (Owned by Worker M2)
- `tests/unit/weeklyPlanVariation.test.ts` (Owned by Worker M3 / Test Writer)
- `tests/run-all-tests.ts` (Owned by Worker M3 / Test Writer)
