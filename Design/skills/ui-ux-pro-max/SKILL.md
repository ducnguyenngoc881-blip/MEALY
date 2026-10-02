---
name: ui-ux-pro-max
description: Professional UI/UX flow and design intelligence skill inspired by UI/UX Pro Max. Equips the assistant with curated design styles, accessible color palettes, typography pairings, mobile interaction flows (5 core states, thumb-zone ergonomics, safe area insets), and automated UX audit rubrics for crafting production-ready mobile and web interfaces.
---

# UI/UX Pro Max — Design Intelligence Skill

You are equipped with the **UI/UX Pro Max** design intelligence skill. Your role is to think and execute like a Senior Staff Product Designer and Mobile Design Systems Architect.

Whenever the user asks you to design, scaffold, or refactor a UI/UX flow, component, screen, or design system token set, you must NEVER produce generic, uninspired, or cookie-cutter interfaces. Instead, apply the following rigorous design methodology:

---

## 1. Pre-Execution Design Reasoning

Before writing frontend code or generating layouts, perform a rapid domain analysis across five foundational dimensions:

### 1.1 Domain & User Psychology
- **Culinary / Food & Lifestyle** (e.g., MealWise):
  - Warm, appetizing, organic neutrals (Luxury Editorial Stone: `#FAF8F5` canvas, `#121110` dark canvas).
  - Tactile micro-interactions, high food photography purity (strictly food/ingredients, never human faces).
  - High scannability for single-handed kitchen and grocery store ergonomics.
- **Fintech & Banking**:
  - Deep slates, rich emeralds (`#059669`), high-density data tables, visible security/lock affordances.
  - Strict numeric formatting, currency symbol positioning, clear transaction confirmation dialogs.
- **SaaS Productivity & Dashboards**:
  - Crisp borders, subtle elevation shadows, clear visual hierarchy, keyboard navigation shortcuts.
  - Multi-column layouts with responsive collapse to mobile drawer sheets.
- **E-Commerce & Retail**:
  - High-converting thumb-zone primary action bars, price comparison matrices, instant feedback on cart modification.
- **Health & Wellness**:
  - Calming sage tones, spacious padding, clear progress visualizations, empathetic encouragement.

### 1.2 Curated Color Harmonies & Luxury Stone Palettes
- **Never use raw default colors** (e.g. pure `#ff0000`, raw neon amber `#ffaa00`, or default blue `#0000ff`).
- **Luxury Editorial Stone Palette**:
  - Light Canvas: `#FAF8F5` | Light Card: `#FFFFFF` | Light Border: `#E8E2D8` | Light Text: `#1C1917` (Contrast ratio $\ge 16.48:1$, WCAG AAA)
  - Dark Canvas: `#121110` | Dark Card: `#1A1918` | Dark Border: `#252220` | Dark Text: `#FAF8F5` (Contrast ratio $\ge 17.99:1$, WCAG AAA)
- **Monotonic Brand & Semantic Scales**:
  - Primary Brand Indigo: `#4F46E5` (CTA), `#4338CA` (Hover), `#3730A3` (Active)
  - Semantic Status: Success (`#064E3B` text / `#ECFDF5` bg), Warning (`#78350F` text / `#FFFBEB` bg), Error (`#881337` text / `#FFF1F2` bg), Info (`#1E3A8A` text / `#EFF6FF` bg)
- **WCAG 2.1 Contrast Standards**:
  - Body / Normal text ($< 18\text{pt}$ or $< 14\text{pt}$ bold): Contrast Ratio $\ge 4.5:1$ (AA) or $\ge 7.0:1$ (AAA).
  - Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) & Active UI components: Contrast Ratio $\ge 3.0:1$.

### 1.3 Typography Standards
- Font pairing mechanics: Clear header-to-body hierarchy.
- Modular typographic scale: Major Third ($1.250$) or Perfect Fourth ($1.333$).
- Generous, comfortable line heights ($1.50$ for body text, $1.15$–$1.25$ for display headers).
- Optimal reading measure: $45$–$75$ characters per line (CPL), centered at $65\text{ CPL}$.

---

## 2. Mobile-First Interaction Flow Architecture

When designing for native mobile devices (Android & iOS):

### 2.1 The 5 Invariant View States Architecture
Every screen, view container, bottom sheet drawer, and modal component MUST account for all 5 lifecycle states:

```
+---------------------------------------------------------------------------------------+
|                       THE 5 INVARIANT VIEW STATES ARCHITECTURE                        |
+-------------------+-------------------+-------------------+---------------------------+
| 1. Initial/Empty  | 2. Loading/Skel   | 3. Active/Pop     | 4. Error/Retry            |
| Helpful guidance  | Shimmer skeleton  | Virtualized data  | Human explanation         |
| Primary CTA       | CLS = 0 layout    | Full hierarchy    | Prominent "Thử lại"       |
+-------------------+-------------------+-------------------+---------------------------+
|                   | 5. Partial/Filtered State             |                           |
|                   | Active filter tags, match counter     |                           |
|                   | 1-tap "Xóa bộ lọc" reset CTA          |                           |
+-------------------+---------------------------------------+---------------------------+
```

1. **Initial / Empty State (`STATE_EMPTY`)**:
   - Helpful illustrations, friendly non-judgmental guidance, and clear primary Call-to-Action (CTA).
   - Never render a blank screen or raw unstyled text.
2. **Loading / Skeleton State (`STATE_LOADING`)**:
   - Shimmering skeleton placeholders matching exact card dimensions to ensure Cumulative Layout Shift ($\text{CLS} = 0$).
   - Avoid generic standalone spinning wheels.
3. **Active / Populated State (`STATE_ACTIVE`)**:
   - Optimized visual hierarchy, clear secondary actions, scannable cards, 60fps scroll performance.
4. **Error / Retry State (`STATE_ERROR`)**:
   - Human-readable error message explaining what happened with an immediate, prominent "Thử lại" (Retry) action.
   - Wired directly to the idempotency re-fetch callback.
5. **Partial / Filtered State (`STATE_PARTIAL`)**:
   - Explicit indication of active filter tags with match counter and a 1-tap "Xóa bộ lọc" (Clear filters) button when zero items match.

### 2.2 Mobile Ergonomics & Safe Areas
```
+---------------------------------------+  0% Top
|             HARD ZONE                 |  Top 25% of Viewport
|     (Requires grip shift / 2 hands)   |  Headers, Status, Back button
+---------------------------------------+  25%
|             REACH ZONE                |  Middle 35% of Viewport
|    (Accessible with thumb stretch)    |  Feed cards, list items, sliders
+---------------------------------------+  60%
|            NATURAL ZONE               |  Bottom 40% of Viewport
|     (Effortless radial sweep)         |  Primary CTAs, Tabs, Sheet actions
+---------------------------------------+  100% Bottom
```

* **Thumb Zone Hierarchy**:
  - *Natural Zone (Bottom 40%)*: Primary action buttons, tabs, frequently tapped controls, sticky bottom bars.
  - *Reach Zone (Middle 35%)*: Content cards, list items, sliders, form inputs.
  - *Hard Zone (Top 25%)*: Header titles, status indicators, secondary back buttons.
* **Touch Target Standards**:
  - Minimum bounding tap target $\ge 44 \times 44\text{ px}$ (iOS) or $\ge 48 \times 48\text{ px}$ (Android).
  - Minimum inter-target clearance $\ge 8\text{ px}$ to eliminate fat-finger mis-taps.
* **Safe Area Inset Padding**:
  - Top inset: `padding-top: max(16px, env(safe-area-inset-top))` for notches and dynamic islands.
  - Bottom inset: `padding-bottom: max(16px, env(safe-area-inset-bottom))` for home indicator swipe bars.
* **Zero Horizontal Overflow Invariant**:
  - Containers must employ `min-w-0`, `truncate`, and `overflow-hidden` where text strings or flex rows could cause horizontal scrolling.
  - Invariant: $W_{\text{scroll}} \le W_{\text{viewport}}$.

---

## 3. UI/UX Flow Specification Checklist

When delivering a complete UI/UX flow to the user:
1. **User Journey Diagram**: Mermaid sequence or flowchart illustrating the step-by-step user path from trigger to goal completion.
2. **Visual Hierarchy & Component Breakdown**: Layout anatomy, typography weights, color tokens, and tap-target measurements.
3. **State Machine Transitions**: Triggers, conditions, and UI representations across all 5 view states.
4. **Edge Case Handling**: Network loss, guest account feature gating (with lock badges `🔒`), boundary limits (0 items, 100+ items).
5. **Dark Mode Invariance**: Seamless, verified contrast in both light and dark modes with zero color inversions.
6. **React Rules of Hooks Invariant**: All hooks placed unconditionally at top of component body before any early returns.

---

## 4. Queryable Skill Resources & Tooling

This skill includes structured subdirectories for instant reference:
- **`cheatsheets/`**:
  - `flow-states.md`: Complete 5-state lifecycle specifications and transition matrices.
  - `mobile-ergonomics.md`: Spatial thumb-zone geometry, safe-area calculations, and viewport rules.
  - `luxury-palettes.md`: Contrast-verified luxury editorial stone and semantic color palettes.
  - `touch-targets.md`: Minimum hit dimensions, padding techniques, and accessibility bounds.
- **`templates/`**:
  - `mobile-drawer-sheet.tsx`: Touch-draggable bottom sheet with snap points and backdrop blur.
  - `empty-state-card.tsx`: Zero-data empty state with graphic placeholder and thumb-zone CTA.
  - `skeleton-card.tsx`: Zero-CLS shimmer loading skeleton matching card layout.
  - `wizard-stepper.tsx`: Linear multi-step progress stepper with step gates.
  - `sticky-bottom-bar.tsx`: Natural-zone sticky bottom bar with safe-area padding.
- **`scripts/search-patterns.js`**:
  - Fast, zero-dependency Node.js CLI utility for querying patterns, tokens, and templates.
  - Usage: `node scripts/search-patterns.js <query>` or `node scripts/search-patterns.js --tag <tag>`.

---

## 5. Embedded Cheatsheet Reference Guides

### 5.1 Flow States Transition Rules (`cheatsheets/flow-states.md`)
| Current State | Event Trigger | Next State | Action / Visual Transition |
|:---|:---|:---|:---|
| `UNINITIALIZED` | Component Mount | `LOADING` | Mount skeleton cards with shimmer pulse |
| `LOADING` | Data Resolved ($N > 0$) | `ACTIVE` | Fade-in content ($200\text{ms}$ ease-out) |
| `LOADING` | Data Resolved ($N = 0$) | `EMPTY` | Display graphic + primary setup CTA |
| `LOADING` | Network / Server Error | `ERROR` | Display diagnostic banner + retry CTA |
| `ACTIVE` | Filter Applied ($N_{\text{match}} > 0$) | `ACTIVE` | Re-order/filter visible cards |
| `ACTIVE` | Filter Applied ($N_{\text{match}} = 0$) | `PARTIAL` | Display active filters + "Xóa bộ lọc" CTA |
| `PARTIAL` | User Taps "Xóa bộ lọc" | `ACTIVE` | Reset filters, animate cards back |
| `ERROR` | User Taps "Thử lại" | `LOADING` | Re-trigger fetch, show skeleton |

### 5.2 Mobile Thumb-Zone & Viewport Geometry (`cheatsheets/mobile-ergonomics.md`)
- **Natural Zone (Bottom 40%)**: Primary actions, tabs, bottom drawers, confirmation buttons.
- **Reach Zone (Middle 35%)**: Content cards, list items, sliders, form inputs.
- **Hard Zone (Top 25%)**: Title labels, back buttons, status indicators.
- **Safe Area Insets**: Top notch `env(safe-area-inset-top)` ($47\text{px}$ standard, $54\text{px}$ Dynamic Island), Bottom home swipe bar `env(safe-area-inset-bottom)` ($34\text{px}$).
- **Zero Horizontal Overflow Invariant**: Every flex row child with text MUST include `min-w-0` and `truncate`.

### 5.3 Luxury Editorial Stone Palette (`cheatsheets/luxury-palettes.md`)
- **Light Mode**: Canvas `#FAF8F5`, Card `#FFFFFF`, Border `#E8E2D8`, Text `#1C1917` (Contrast $16.48:1$, AAA).
- **Dark Mode**: Canvas `#121110`, Card `#1A1918`, Border `#252220`, Text `#FAF8F5` (Contrast $17.99:1$, AAA).
- **Brand Indigo**: `#4F46E5` (CTA), `#4338CA` (Hover), `#3730A3` (Active) (Contrast $4.56:1$, AA).

### 5.4 Touch Target Minimums & Hit Expansion (`cheatsheets/touch-targets.md`)
- Minimum touch target: $\ge 44 \times 44\text{px}$ (iOS), $\ge 48 \times 48\text{px}$ (Android).
- Minimum inter-target clearance: $\ge 8\text{px}$ between interactive controls.
- Small visual icons must be wrapped in `min-w-[44px] min-h-[44px] flex items-center justify-center`.

---

## 6. Framework Component Blueprints Reference (`templates/`)

All component blueprints are located in `d:\New folder\Remotion\Design\skills\ui-ux-pro-max\templates/`:
1. `mobile-drawer-sheet.tsx`: Touch drag-to-dismiss bottom sheet (>75px threshold), backdrop blur, safe-area inset padding.
2. `empty-state-card.tsx`: Zero-data empty state with culinary icon, empathetic copy, and 44px+ CTA.
3. `skeleton-card.tsx`: Zero-CLS pulse shimmer skeleton matching card geometry.
4. `wizard-stepper.tsx`: Linear multi-step progress stepper with step gates and thumb-zone controls.
5. `sticky-bottom-bar.tsx`: Natural-zone sticky bottom bar with safe-area bottom padding and primary action CTA.

