# Component Hierarchy Codex: Mobile UI Anatomy, Z-Index Strata & Guest Feature Gating

## 1. Executive Overview

In a native mobile application, visual depth and interaction priority are defined by a strict **layering architecture**. Because mobile viewports offer limited screen area ($320\text{px}$–$428\text{px}$ width), overlapping surfaces—such as bottom sheets, sticky bars, modals, and toasts—must coexist without z-index collisions, focus trapping bugs, or gesture conflicts.

This codex specifies the definitive **Z-Index Stacking Strata**, standard component anatomy for eight core UI primitives, guest account feature gating rules (`Đi Chợ Chung 🔒`), and component implementation rules.

```
+---------------------------------------------------------------------------------------+
|                                 Z-INDEX STRATA SYSTEM                                 |
+-------------------+-------------------+-------------------+---------------------------+
| Layer 6 (z: 1100) | Layer 5 (z: 1000) | Layer 4 (z: 900)  | Layer 3 (z: 500)          |
| Toasts, Alerts    | Full Modals       | Bottom Sheets     | Sticky Bottom CTAs        |
+-------------------+-------------------+-------------------+---------------------------+
|                   | Layer 2 (z: 100)  | Layer 1 (z: 0)    |                           |
|                   | Sticky Top Header | Screen Canvas     |                           |
+-------------------+-------------------+-------------------+---------------------------+
```

---

## 2. Z-Index Strata & Stacking Context Hierarchy

To avoid arbitrary z-index values (such as `z-[99999]`), the MealWise design system formalizes six canonical elevation strata:

| Layer Level | Z-Index Token | Component Types | Backdrop / Shield Behavior | Event Propagation Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 6: Ephemeral Overlays** | `z-index: 1100` | Toast notifications, snackbars, global network alerts | No backdrop; non-blocking to lower layers | Pointer events pass through outside toast box |
| **Layer 5: Critical Modals** | `z-index: 1000` | Fullscreen dialogs, auth modals, destructive confirms | Full backdrop (`bg-black/60 backdrop-blur-sm`); body scroll locked | Traps keyboard focus and touch scroll within modal |
| **Layer 4: Bottom Sheets** | `z-index: 900` | Detail drawers, dish assignment sheets, filter trays | Medium backdrop (`bg-black/40 backdrop-blur-sm`); tap outside dismisses | Gesture drag downward dismisses; body scroll locked |
| **Layer 3: Sticky Bottom Bars** | `z-index: 500` | Bottom navigation bar, floating action buttons, sticky CTAs | No backdrop; elevates above scrolling feed via shadow | Fully interactive; reserves `pb-[calc(...)]` in feed |
| **Layer 2: Sticky Top Headers** | `z-index: 100` | App bar, search header, category tabs, filter pill bar | Translucent backdrop (`bg-stone-50/90 backdrop-blur-md`) | Sticky pinned to top; respects `env(safe-area-inset-top)` |
| **Layer 1: Base Canvas** | `z-index: 0` | Scrollable feed, card grids, recipe lists, empty states | Base canvas surface (`bg-stone-50` / `bg-stone-900`) | Standard document flow scrollable area |

---

## 3. Core Component Anatomy & Specifications

### 3.1 Button Component (`<Button />`)

The primary interactive primitive. Must satisfy touch target standards on all mobile devices.

- **Variants**:
  - `Primary`: `bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-medium shadow-sm`
  - `Secondary / Outline`: `border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200`
  - `Ghost`: `text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30`
  - `Destructive`: `bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-medium`
- **Sizes**:
  - `Large (Primary CTA)`: Height $52\text{px}$, font size $16\text{px}$ ($1\text{rem}$), horizontal padding $24\text{px}$.
  - `Standard`: Height $44\text{px}$–$48\text{px}$, font size $14\text{px}$–$15\text{px}$, horizontal padding $16\text{px}$. Meets HIG/Material touch target minimum.
  - `Compact / Pill`: Height $36\text{px}$ visual, but hit target expanded via bounding container to $\ge 44 \times 44\text{px}$.
- **State Invariants**:
  - Pressed State: Subtle tactile feedback `active:scale-[0.98]` ($100\text{ms}$ ease-out).
  - Disabled State: `opacity-50 cursor-not-allowed pointer-events-none`.
  - Loading State: Replaces icon/label with an inline spinner while maintaining the exact bounding box width to prevent layout jump.

---

### 3.2 Card Component (`<Card />`)

The foundational content container for recipes, meal sets, ingredients, and catering packages.

- **Surface Tokens**:
  - Light mode: `#FFFFFF` on `#FAF8F5` canvas; border `#E7E5E4` (Stone 200).
  - Dark mode: `#1A1918` on `#121110` canvas; border `#292524` (Stone 800).
- **Corner Radii**: Standard `rounded-2xl` ($16\text{px}$) for primary cards; `rounded-xl` ($12\text{px}$) for nested chips or compact items.
- **Elevation**: Elevation-1 subtle key shadow (`0 1px 3px rgba(0,0,0,0.06)`).
- **Food Photography Purity Invariant**:
  - Image header aspect ratio: $16:9$ or $4:3$ with `object-cover rounded-t-2xl`.
  - **Purity Mandate**: Images must exclusively depict appetizing food, ingredients, beverages, or culinary preparation. Never use images featuring human faces or non-culinary subjects.
  - Dish image resolution fallback: When an image URL fails to load, gracefully transition to an appetizing vector food placeholder rather than broken image icons.

---

### 3.3 BottomSheet Component (`<BottomSheet />`)

Native draggable modal drawer used for detailed inspections and secondary actions without losing screen context.

```
       [ Drag Handle Pill (36 x 4px) ]
+-----------------------------------------------+
|  Header: Title + Icon + 44px Close Button     |
+-----------------------------------------------+
|                                               |
|  Scrollable Body: max-h-[75vh]                |
|  - Dish description & ingredients             |
|  - Macro-nutrients (Cal, Carb, Pro, Fat)      |
|                                               |
+-----------------------------------------------+
|  Sticky Bottom CTA:                           |
|  pb-[calc(1rem+env(safe-area-inset-bottom))]  |
+-----------------------------------------------+
```

- **Drag Handle**: Centered pill $36 \times 4\text{px}$, `bg-stone-300 dark:bg-stone-700 rounded-full my-3`.
- **Dismissal Threshold**: Downward touch drag $> 75\text{px}$ dismisses the sheet; $\le 75\text{px}$ snaps back to rest position ($0\text{px}$) with spring transition `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Safe Area Inset**: Bottom action bar incorporates `pb-[calc(1rem+env(safe-area-inset-bottom,0px))]`.

---

### 3.4 Modal Dialog Component (`<ModalDialog />`)

Centered dialog shield for irreversible, destructive, or critical user decisions (e.g., clearing weekly plan, account deletion, session timeout).

- **Screen Clamping**: Maximum width `max-w-sm` ($384\text{px}$) on mobile, with $16\text{px}$ margin on each side.
- **Button Orientation**:
  - On viewports $< 414\text{px}$, action buttons are stacked vertically: Primary Confirm on top, Secondary Cancel below.
  - On viewports $\ge 414\text{px}$, buttons may be rendered side-by-side with equal width ($1:1$).
- **In-App Shield Invariant**: Never use browser-native `window.confirm()` or `window.alert()`. All confirmations must render custom in-app styled modals.

---

### 3.5 Floating Action Button (FAB) / Sticky Bottom Bar

Used for high-priority global actions (e.g., "Tạo mâm cơm nhanh", "Xem giỏ hàng (12)").

- **Positioning**: Fixed to bottom viewport: `fixed bottom-0 inset-x-0 z-[500]`.
- **Bottom Clearance**: Must incorporate safe area padding `pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]`.
- **Visual Separation**: Background blur `backdrop-blur-md bg-stone-50/90 dark:bg-stone-900/90` with top border `border-t border-stone-200 dark:border-stone-800` and elevation-3 shadow.

---

### 3.6 Badge & Filter Pill Component (`<Badge />`)

Visual chips for status indicators, meal categories, regional tags, and filter states.

- **Touch Target Compliance**:
  - When non-interactive (static label): Minimum padding `px-2 py-0.5`, font size `text-xs`.
  - When interactive (filter toggle chip): Container hit box MUST satisfy $\ge 44 \times 44\text{px}$ bounding box or maintain $\ge 8\text{px}$ inter-target clearance.
- **States**:
  - Active: `bg-brand-600 text-white font-medium shadow-xs`.
  - Inactive: `bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700`.

---

### 3.7 Toast Notification Component (`<Toast />`)

Non-blocking feedback message communicating success, warning, or network disconnection.

- **Stacking Position**: Fixed top (`top-4 inset-x-4 max-w-sm mx-auto z-[1100]`) or bottom (`bottom-20`). Top placement respects `env(safe-area-inset-top)`.
- **Auto-Dismiss**: Automatically transitions out after $3500\text{ms}$.
- **Gesture Support**: User can swipe upward or rightward to immediately dismiss the notification.

---

### 3.8 Skeleton Placeholder Component (`<Skeleton />`)

Content placeholder rendering during `STATE_LOADING`.

- **Geometry Matching**: Rectangular skeletons for images (`aspect-video rounded-xl`), pill skeletons for titles (`h-5 w-3/4 rounded-md`), and line skeletons for body text (`h-3.5 w-full rounded-md`).
- **Animation**: Continuous shimmer pulse `animate-pulse` with `bg-stone-200 dark:bg-stone-800`.
- **Zero CLS**: Guarantees zero Cumulative Layout Shift when real content hydrates.

---

## 4. Guest Account Feature Gating Architecture

MealWise allows unregistered users (guests) to explore recipes, construct meal plans, and review grocery estimates. However, features requiring real-time server resources or multi-user state synchronization are strictly gated.

### 4.1 Gated Feature: Collaborative Grocery Sharing (`Đi Chợ Chung`)

- **Feature Description**: Real-time collaborative shopping room where multiple household members join via room code to check off ingredients concurrently.
- **Guest State Rule (`!isRegistered`)**:
  1. The entry button in the grocery interface MUST display a lock badge:
     $$\text{ButtonLabel} = \text{"Đi Chợ Chung 🔒"}$$
  2. Unregistered guests cannot create or host collaborative shopping rooms.
  3. When an unregistered guest taps the button:
     - The application MUST NOT throw an unhandled exception or fail silently.
     - The application MUST immediately present the `AuthModal` in registration/login mode.
     - An informational prompt must explain the benefit:
       > *"Đăng ký tài khoản MealWise để tạo phòng Đi Chợ Chung và chia sẻ danh sách mua sắm với người thân theo thời gian thực."*
4. **Plan Retention Upon Registration**:
   When a guest completes registration, any existing meal plan or grocery items created during the guest session must be preserved (`hasExistingMeals` check) rather than wiped.

```tsx
// Canonical Guest Gating Implementation
<button
  onClick={() => {
    if (!isRegistered) {
      setShowAuthModal(true);
      return;
    }
    handleOpenCollaborativeRoom();
  }}
  className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-xl font-medium min-h-[44px]"
>
  <span>Đi Chợ Chung</span>
  {!isRegistered && <span className="text-sm">🔒</span>}
</button>
```

---

## 5. React Rules of Hooks Invariant for Components & Modals

In all React components, drawers, and modal containers, all React hooks (`useState`, `useMemo`, `useCallback`, `useEffect`, `useRef`) must be placed **unconditionally at the top** of the component body, strictly BEFORE any conditional checks or early returns:

```tsx
// ❌ HOOKS VIOLATION: Early return before hooks breaks React fiber reconciliation
export function RecipeModal({ isOpen, recipeId }: Props) {
  if (!isOpen) return null; // ❌ VIOLATION: Hooks below will not execute conditionally!
  const [data, setData] = useState(null);
  useEffect(() => { ... }, [recipeId]);
  return <div>...</div>;
}

// ✅ HOOKS INVARIANT: All hooks unconditionally at the top
export function RecipeModal({ isOpen, recipeId }: Props) {
  const [data, setData] = useState(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && recipeId) {
      // Fetch recipe payload
    }
  }, [isOpen, recipeId]);

  // Early returns strictly placed AFTER all hooks
  if (!isOpen) return null;

  return <div ref={scrollRef}>...</div>;
}
```

---

## 6. Component Quality Audit Rubric

- [ ] **Z-Index Compliance**: Are all elements assigned to their canonical strata (Modals 1000, Drawers 900, Sticky Bars 500, Headers 100)?
- [ ] **Touch Target Invariant**: Do all buttons, toggles, and icon buttons measure $\ge 44 \times 44\text{px}$?
- [ ] **Food Image Purity**: Do all dish cards exclusively depict appetizing food/culinary subjects (zero human faces)?
- [ ] **Guest Gating Verification**: Does the collaborative grocery button display `Đi Chợ Chung 🔒` for guests and open `AuthModal` on tap?
- [ ] **Hook Placement Invariant**: Are all React hooks positioned at the top of component bodies before any conditional returns?
