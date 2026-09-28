# E2E Test Infra: MealWise 1000+ Scenario Audit

## Test Philosophy
- Requirement-driven, opaque-box and programmatic scenario matrix validation.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Guarantees >1,000 distinct programmatic test scenarios executed cleanly via `npm test`.
- Real-time assertion-level telemetry counter tracking >5,000 assertions.

## Feature Inventory & Test Matrix Allocation
| Screen / Domain | Existing Tests | New Scenarios Target | Total Tests Target | Key Focus Areas |
|---|---|---|---|---|
| **Screen 1: WeeklyBoard** | 26 | +95 | **121** | Stochastic Knapsack variation (10 runs x 4 sizes x 3 tiers), servings stepper (1-20), meal swaps, macro calculations, 0 over-budget days. |
| **Screen 2: MealSetExplorer** | 23 | +85 | **108** | 5 regional filters, budget tiers, diacritics tone stripping, 21 slot assignments, dish preview drawer. |
| **Screen 3: RecipeCatalog & Modal** | 24 | +85 | **109** | Diacritic-insensitive search, ingredient scaling (1..100), cooking accordion toggling, unit merging. |
| **Screen 4: GroceryList & Collab** | 32 | +90 | **122** | 4 store channels, price simulation multipliers, unit normalization (kg/g/lạng/bó/quả), check-off persistence, collaborative cart code sync, Zalo export. |
| **Screen 5: FridgeView & Leftovers** | 68 | +60 | **128** | Expiry warning thresholds, 7 inventory categories, multi-item matching, negative brand traps, pagination rotation. |
| **Screen 6: CateringPartyPlanner** | 21 | +90 | **111** | Guest count stepper (1 to 200+), table division (6/8/10), preset banquet configurations, gross margin formulas, equipment checklist, Zalo quotation. |
| **Screen 7: Minigames & Arcades** | 23 | +100 | **123** | Continuous wheel angle math, 0 slice jitter across 2..10 players, "Cả Bàn!" rule, "Uống Hộ" delegation, loot box rarity rolls, zero negative balances, audio synth fallback. |
| **Screen 8: Onboarding & Account** | 30 | +85 | **115** | Flow ordering (Preferences -> Budget), Western food integration, family size multiplier, dietary tags, JSON backup/restore schema validation, theme toggle. |
| **Screen 9: Shell & Navigation** | 47 | +70 | **117** | 7 device viewports (320px..desktop), zero horizontal overflow, safe-area insets, broken image fallback, in-app confirm dialogs. |
| **Cross-Feature E2E Tiers 3 & 4** | 18 | +53 | **71** | Cross-screen state sync, reload hydration, full user journeys, offline resilience. |
| **TOTAL** | **377** | **+713** | **1,025** | **100% Pass Rate via `npm test`** |

## Test Architecture
- Test Runner: `tests/helpers/testRunner.ts` (custom registry-based harness with assertion telemetry)
- Test Entry Point: `tests/run-all-tests.ts` invoked via `npm test`
- Pass/Fail Semantics: 100% test pass rate (0 failures), 0 uncaught rejections
- Total Assertions: >5,000 programmatic checks executed across 1,025+ registered scenarios
