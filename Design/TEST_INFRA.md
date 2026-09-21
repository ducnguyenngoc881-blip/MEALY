# Test Infrastructure Specification: Graphic Design & Remotion Motion System

**Document Version**: 1.0.0  
**Project**: Graphic Design Knowledge Base, Design Tokens & Remotion Motion System  
**Track**: E2E Testing Track  
**Engine**: Node.js Built-in Modules (`node:assert`, `node:fs`, `node:path`, `node:process`)  
**External Dependencies**: `0` (Zero npm dependencies required)

---

## 1. Test Philosophy & Architecture

The testing harness provides automated, mathematically rigorous, and objective quality verification across the entire graphic design system. In accordance with strict software and visual engineering standards, subjective self-certification is prohibited. Every visual rule, design token, color ramp, and kinetic animation is verified through programmatic proofs and automated validators.

### Core Architectural Principles
1. **Zero External Dependencies**: The test runner and all 6 validator suites run on standard Node.js without requiring third-party testing frameworks or build tools. This guarantees instant execution, zero vulnerability surface, and complete offline reliability.
2. **Dual Execution Architecture**:
   - **Modular Isolation**: Each validator module (e.g. `tests/test-contrast-math.js`) can be executed independently directly via Node.js for rapid feedback during module development.
   - **Master Aggregation**: `tests/run-all.js` orchestrates all suites, collects fine-grained telemetry across 4 tiers, checks live repository artifacts, and formats a production-grade execution report.
3. **Deterministic Mathematical Oracles**: Contrast ratios, relative luminance ($L$), harmonic spring damping ratios ($\zeta$), modular scale progressions ($\phi$), and reading speeds (WPM) are calculated from first principles using standard ITU-R BT.709, W3C WCAG 2.1, and classical mechanics differential equations.
4. **Anti-Facade Integrity**: Tests do not use dummy stubs or trivial boolean assertions. Tests execute real parser engines, integrate physical simulation loops, and enforce boundary constraints.

---

## 2. Directory Layout & Module Index

```
d:\New folder\Remotion\Design/
├── package.json                   # Defines "test": "node tests/run-all.js"
├── TEST_INFRA.md                  # Test architecture, philosophy & coverage matrix (This file)
├── TEST_READY.md                  # Test suite delivery certificate & telemetry summary
├── tests/
│   ├── run-all.js                 # Master test runner, CLI reporter & live repo discovery auditor
│   ├── test-contrast-math.js      # WCAG 2.1 relative luminance and contrast ratio validation suite
│   ├── test-token-schema.js       # W3C DTCG token schema, typography & spacing validation suite
│   ├── test-guidelines-codex.js   # Guidelines rules engine, 8pt grid, Gestalt & typography validator
│   ├── test-svg-standards.js      # SVG clean-code, viewBox scaling, and hygiene validator
│   ├── test-remotion-motion.js    # Remotion spring physics, safe zones, and kinetic pacing validator
│   └── test-e2e-integration.js    # Cross-feature combinations and real-world asset audit scenarios
```

---

## 3. The 4-Tier Testing Hierarchy

The test harness categorizes all verification checks into 4 distinct operational tiers:

```
+-------------------------------------------------------------------------------+
| TIER 4: Real-World Workload Scenarios                                         |
| (E-commerce card 100-pt audit, video ad title choreography, theme switch)     |
+-------------------------------------------------------------------------------+
| TIER 3: Cross-Feature Combinations                                            |
| (Tokens in SVG, Remotion springs on typography, safe zones multi-aspect)      |
+-------------------------------------------------------------------------------+
| TIER 2: Boundary & Corner Cases                                               |
| (Pure black/white, invalid hexes, negative spacing/damping, extreme viewBox)  |
+-------------------------------------------------------------------------------+
| TIER 1: Feature Coverage                                                      |
| (Relative luminance, DTCG schemas, 8pt grid math, spring physics, safe zones) |
+-------------------------------------------------------------------------------+
```

### Tier 1: Feature Coverage (>=5 test cases per domain)
- **Contrast Math**: Piecewise sRGB gamma expansion, BT.709 luminance ($L = 0.2126R + 0.7152G + 0.0722B$), contrast ratio formula $((L_1+0.05)/(L_2+0.05))$, Neutral Slate ramp monotonicity, Indigo brand contrast, semantic status colors, surface-to-text pairings.
- **Token Schemas**: W3C DTCG structure ($value, $type, $description), 14-step base-4/base-8 spacing scale, Major Third (1.250) typography scale, radii progression, 5-tier elevation shadows, motion spring presets.
- **Guidelines Codex**: 8pt/4pt grid integer pixel proofs ($offset \pmod 4 = 0$), responsive column definitions (4/8/12 cols), Golden Ratio ($\phi \approx 1.618$) & Fibonacci series, 6 Gestalt laws with quantitative proximity ($S_{internal} \le 0.5 S_{external}$), color harmony models, 6-phase master workflow, 100-point rubric.
- **SVG Standards**: Valid responsive vector icons, viewBox enforcement, relative dimensions, semantic `<g id="...">` layers, `<defs>` for gradients/masks, decimal precision analysis ($\le 2$ decimals).
- **Remotion Motion**: Harmonic spring oscillator damping ratio equation ($\zeta = c / 2\sqrt{km}$), 5 canonical presets, numerical convergence simulation, 16:9 / 9:16 / 1:1 dimensions, Action Safe (90%) and Title Safe (80%) zones, kinetic typography reading speed budget (200–250 WPM).

### Tier 2: Boundary & Corner Cases (>=5 test cases per domain)
- **Contrast Math**: Pure white vs white (1.0:1) and black vs black (1.0:1), maximum 21.0:1 boundary, shorthand 3-digit hex parsing, rejection of malformed hex strings, exact threshold boundary cutoffs (4.499 vs 4.500 AA, 6.999 vs 7.000 AAA), uppercase/whitespace insensitivity, near-zero luminance floats.
- **Token Schemas**: Negative spacing rejection ($value < 0$), non-multiple-of-4 spacing rejection, disallowed DTCG `$type` rejection, non-monotonic typography scale detection, extreme radius (`full` = 9999px) bounds check, live file validation hooks.
- **Guidelines Codex**: Grid offset validation rejecting fractional or non-4px values, container width fitting equations, line length (measure) boundary enforcement (too short <45, too long >75 CPL), Gestalt spacing inversion detection ($S_{internal} > 0.5 S_{external}$), markdown parsing and live file hooks.
- **SVG Standards**: Rejection of missing viewBox, rejection of hardcoded root px width/height locks, rejection of embedded base64 images (`data:image`), rejection of executable `<script>` and inline event handlers, rejection of proprietary editor metadata (Inkscape/Illustrator/Sketch), zero/negative viewBox rejection, file size budget overage (>50KB).
- **Remotion Motion**: Rejection of negative/zero damping ($c \le 0$), mass ($m \le 0$), stiffness ($k \le 0$), detection of sluggish overdamping ($\zeta > 2.0$), safe zone boundary clipping detection, rejection of non-standard frame rates and extreme aspect ratios.

### Tier 3: Cross-Feature Combinations (Pairwise Interactions)
- **Tokens in SVG**: Programmatic verification that vector graphic assets consume exact design tokens (`color.brand[600]`, `spacing[1]`, `radii.md`) rather than arbitrary hex strings or unconstrained dimensions.
- **Remotion Springs on Typography Scales**: Verifies that spring-driven animation values scale smoothly between typography tokens (e.g. `base` 16px to `2xl` 24px) while ensuring optical line-heights scale proportionally without text overflow.
- **Safe Zones on Multi-Aspect Ratios**: Verifies that responsive UI overlay components remain strictly bounded within Title Safe (80%) across 16:9 ($1920\times 1080$), 9:16 ($1080\times 1920$), and 1:1 ($1080\times 1080$).
- **Gestalt Proximity with 8pt Spacing Tokens**: Verifies that spacing tokens enforce $S_{internal} \le 0.5 \times S_{external}$ when grouping related and unrelated components.
- **Surface Contrast with Elevation Shadows**: Verifies that elevated cards (`elevation-2`, `elevation-3`) with background `surface-1` retain WCAG AAA contrast for `text-primary` and AA for `text-secondary` while casting calibrated dual-layer shadows.

### Tier 4: Real-World Workload Scenarios
- **Scenario 1: Full E-Commerce Product Card Audit**: Auditing an e-commerce product card (image container, badge, title, price, CTA button, review stars) against the 100-point rubric across all 5 dimensions (8pt grid, visual hierarchy $1.5\times$ primary focal weight, typography scale compliance, WCAG AA/AAA contrast, SVG clean-code icon).
- **Scenario 2: Video Ad Title Sequence Layout**: Auditing a Remotion video ad title composition (16:9 and 9:16 vertical reels) with kinetic typography (H1 title + subtitle), spring animation config (`springSnappy` entrance, `springGentle` subtitle), safe title zone bounds, and frame budget compliance.
- **Scenario 3: Brand Token Switch Audit (Light Mode / Dark Mode / High Contrast)**: Simulating a dynamic theme switch across tokens (changing primary brand from Indigo to Emerald or switching Light to Dark canvas) and auditing all semantic pairs, surface contrasts, and verifying no WCAG regression occurs during theme switching.

---

## 4. Feature Inventory Coverage Matrix

| # | Feature Inventory Item (from PROJECT.md) | Primary Test Suite | Specific Test Function / Verification Check | Tier |
|---|------------------------------------------|--------------------|---------------------------------------------|------|
| 1 | 8pt/4pt Grid System & Subgrid | `test-guidelines-codex.js` | `Layout & Grid: 8pt/4pt grid mathematics` | Tier 1 |
| 2 | Modular Spacing & Scale Ratios | `test-token-schema.js` | `Spacing Scale: Base-4 and Base-8 grid alignment` | Tier 1 |
| 3 | Golden Ratio & Fibonacci | `test-guidelines-codex.js` | `Layout & Grid: Golden Ratio and Fibonacci scale` | Tier 1 |
| 4 | Responsive Column Grids | `test-guidelines-codex.js` | `Responsive column mathematical container fit` | Tier 1 & 2 |
| 5 | Optical Balance & Alignment | `test-guidelines-codex.js` | `Curvature overshoot and optical balance` | Tier 1 |
| 6 | Gestalt Principles (6 Laws) | `test-guidelines-codex.js` | `Gestalt & Visual Hierarchy: 6 Laws` | Tier 1 |
| 7 | Scanpaths & Visual Focal Flow | `test-guidelines-codex.js` | `Gestalt & Visual Hierarchy: 6 Laws and scanpaths` | Tier 1 |
| 8 | Visual Weight Mathematical Model | `test-guidelines-codex.js` | `Focal point weight ratio proof` | Tier 1 |
| 9 | Typographic Hierarchy & Contrast | `test-token-schema.js` | `Typography Scale: Major Third progression` | Tier 1 |
| 10 | Font Pairing Classification Matrix | `test-guidelines-codex.js` | `Typography Standards: Font pairing criteria` | Tier 1 |
| 11 | Typography Modular Scale Multipliers | `test-token-schema.js` | `Typography Scale: Major Third line-heights` | Tier 1 |
| 12 | Kerning & Tracking Calibration | `test-guidelines-codex.js` | `Typography Standards: Tracking rules` | Tier 1 |
| 13 | Color Harmony Models | `test-guidelines-codex.js` | `Color Theory: Harmony models (triadic, etc.)` | Tier 1 |
| 14 | OKLCH Tint/Shade/Tone Algorithms | `test-contrast-math.js` | `Neutral Slate monotonic luminance decrease` | Tier 1 |
| 15 | Relative Luminance & WCAG Math | `test-contrast-math.js` | `sRGB gamma piecewise expansion & luminance` | Tier 1 |
| 16 | Pre-verified WCAG 2.1 AA/AAA Palette | `test-contrast-math.js` | `Neutral Slate & Indigo contrast proofs` | Tier 1 |
| 17 | 6-Phase Master Workflow Handbook | `test-guidelines-codex.js` | `Workflow Handbook & Audit Rubric: 6 phases` | Tier 1 |
| 18 | SVG Vector Clean-Code Standards | `test-svg-standards.js` | `Valid canonical responsive vector icon` | Tier 1 |
| 19 | Generative Prompt 6-Part Schema | `test-guidelines-codex.js` | `Workflow Handbook & Prompt recipes` | Tier 1 |
| 20 | Remotion Harmonic Spring Physics | `test-remotion-motion.js` | `Harmonic oscillator damping ratios` | Tier 1 |
| 21 | Multi-Format Parameters & Safe Zones | `test-remotion-motion.js` | `Multi-format video aspect ratio validation` | Tier 1 |
| 22 | Kinetic Typography & Choreography | `test-remotion-motion.js` | `Kinetic typography 3-phase timing` | Tier 1 |
| 23 | W3C DTCG Design Tokens (`tokens.json`) | `test-token-schema.js` | `W3C DTCG Token schema validation` | Tier 1 |
| 24 | Strongly Typed Tokens (`tokens.ts`) | `test-token-schema.js` | `Live file validation hook for tokens.ts` | Tier 1 & 2 |
| 25 | 100-Point Scoreable Audit Rubric | `test-e2e-integration.js` | `Scenario 1: Comprehensive 100-Point Audit` | Tier 4 |
| 26 | Automated E2E Test Suite Runner | `run-all.js` | `main() CLI runner and aggregator` | System |
| 27 | Contrast & Math Verification Suite | `test-contrast-math.js` | `13 total tests covering Tiers 1 and 2` | T1 & T2 |
| 28 | Token Schema & Consistency Suite | `test-token-schema.js` | `11 total tests covering Tiers 1 and 2` | T1 & T2 |
| 29 | Guidelines Content & Formula Suite | `test-guidelines-codex.js` | `11 total tests covering Tiers 1 and 2` | T1 & T2 |
| 30 | SVG & Motion Config Validation Suite | `test-svg-standards.js` & `test-remotion-motion.js` | `22 total tests across SVG and motion` | T1 & T2 |
| 31 | Full E2E Pass & Real-World Scenarios | `test-e2e-integration.js` | `8 tests across Tiers 3 and 4` | T3 & T4 |

---

## 5. Execution Instructions & Exit Code Protocol

### How to Run the Test Suite

Execute the master runner directly using Node.js:
```powershell
node tests/run-all.js
```

Or via the npm package script configured in `package.json`:
```powershell
npm.cmd test
```

### Individual Suite Execution
Any suite can be run independently:
```powershell
node tests/test-contrast-math.js
node tests/test-token-schema.js
node tests/test-guidelines-codex.js
node tests/test-svg-standards.js
node tests/test-remotion-motion.js
node tests/test-e2e-integration.js
```

### Exit Codes & CI/CD Gating
- **Exit Code 0**: 100% test pass across all tiers. Design system and motion assets conform to all mathematical and architectural specifications.
- **Exit Code 1**: One or more assertions failed. A detailed error stack, tier location, and reason are printed to `stderr`. Build/merge is immediately rejected.
