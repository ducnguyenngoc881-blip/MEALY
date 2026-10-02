# Mobile Ergonomics Codex: Thumb-Zone Geometry, Safe Area Insets & Responsive Viewports

## 1. Executive Overview & The Native Smartphone Imperative

MealWise is engineered strictly as a high-performance **native-feeling mobile application** for Android and iOS smartphones, rather than a conventional desktop website. Over 85% of culinary planning, grocery shopping, and recipe consultation occurs in dynamic, single-handed physical contexts: standing in a crowded grocery aisle, holding a spatula in the kitchen, or glancing at a phone while commuting.

Designing for native mobile devices requires uncompromising adherence to human hand biomechanics, touch physiology, environmental safe area insets, and strict viewport responsiveness across diverse device form factors.

```
+---------------------------------------------------------------------------------------+
|                                MOBILE ERGONOMIC MATRIX                                |
+-------------------+-------------------+-------------------+---------------------------+
| Thumb Zones       | Touch Targets     | Safe Area Insets  | Zero Overflow             |
| Natural (40%)     | >= 44x44px (iOS)  | env(top): notch   | W_scroll <= W_viewport    |
| Reach (35%)       | >= 48x48px (And)  | env(bottom): home | min-w-0 flex fix          |
| Hard (25%)        | >= 8px spacing    | calc() formulas   | truncate on titles        |
+-------------------+-------------------+-------------------+---------------------------+
```

---

## 2. Thumb-Zone Spatial Hierarchy

Human thumb movement across a mobile touchscreen follows an asymmetric polar arc anchored at the carpometacarpal (CMC) joint of the thumb. When users hold a phone in one hand (left or right), the screen naturally bifurcates into three vertical reach zones:

```
+---------------------------------------+  0% Top
|                                       |
|             HARD ZONE                 |  Top 25% of Viewport
|     (Requires hand shift / 2 hands)   |  Headers, Status, Back button
|                                       |
+---------------------------------------+  25%
|                                       |
|             REACH ZONE                |  Middle 35% of Viewport
|    (Accessible with thumb stretch)    |  Feed cards, list items, sliders
|                                       |
+---------------------------------------+  60%
|                                       |
|            NATURAL ZONE               |  Bottom 40% of Viewport
|     (Effortless radial sweep)         |  Primary CTAs, Tabs, Sheet actions
|                                       |
+---------------------------------------+  100% Bottom
```

### 2.1 Zone Breakdown & Component Placement Invariants

#### 1. Natural Zone (Bottom 40% of Viewport)
- **Ergonomic Profile**: Effortless radial thumb sweep requiring zero grip adjustment. Maximum tap accuracy and speed.
- **Mandatory Placements**:
  - Primary conversion buttons and Call-to-Actions (e.g., "Gán vào thực đơn", "Thêm vào giỏ", "Nấu ngay").
  - Fixed / sticky bottom action bars (`fixed bottom-0 inset-x-0`).
  - Bottom navigation bar tabs (`Trang chủ`, `Mâm cơm`, `Đi chợ`, `Tủ lạnh`, `Tài khoản`).
  - Modal bottom sheet interactive triggers and confirmation CTAs.
  - Floating Action Buttons (FAB).

#### 2. Reach Zone (Middle 35% of Viewport)
- **Ergonomic Profile**: Reachable with moderate thumb extension. Suitable for browsing and content evaluation.
- **Mandatory Placements**:
  - Scrollable recipe and meal set cards.
  - Form input fields and search input triggers.
  - Servings stepper controls (`-` / `+` count adjustments).
  - Segmented control pills and category filter chips.

#### 3. Hard Zone (Top 25% of Viewport)
- **Ergonomic Profile**: Requires either shifting the phone grip downward (increasing drop risk) or using the second hand.
- **Mandatory Placements**:
  - Passive elements: App title, screen header labels, step progress indicators.
  - Low-frequency navigation controls: Back arrow icon, settings gear, search bar (when passive).
  - Telemetry & status indicators: Battery, connectivity toast, sync badge.
- **Strict Prohibition**: NEVER place primary conversion buttons, frequently tapped action triggers, or modal confirmation buttons in the Hard Zone.

---

## 3. Touch Target Standards & Bounding Box Mechanics

Finger touch interactions on glass differ fundamentally from mouse cursor clicks. The physiological contact area of an adult human thumb pad measures approximately $10\text{mm} \times 10\text{mm}$ to $12\text{mm} \times 12\text{mm}$, which corresponds to $44\text{px}$ to $48\text{px}$ on standard high-DPI displays.

### 3.1 Minimum Dimension Standards

| Standard / OS | Minimum Target Size | Hit Area Area | Minimum Inter-Target Spacing |
| :--- | :--- | :--- | :--- |
| **Apple iOS HIG** | **$44 \times 44\text{px}$** | $1,936\text{ px}^2$ | $\ge 8\text{px}$ |
| **Google Android Material** | **$48 \times 48\text{px}$** | $2,304\text{ px}^2$ | $\ge 8\text{px}$ |
| **MealWise Unified Target** | **$\ge 44 \times 44\text{px}$** (iOS) / **$\ge 48 \times 48\text{px}$** (Android) | $\ge 1,936\text{ px}^2$ | $\ge 8\text{px}$ |

### 3.2 Visual vs. Hit Target Decoupling

A common design error is constraining the interactive hit area to match a small visual icon (e.g., a $20 \times 20\text{px}$ bookmark star or close button). 

**The Decoupling Rule**: The visual representation of an icon may be compact ($18\text{px}$–$24\text{px}$), but its surrounding interactive touch box MUST expand to meet or exceed $44 \times 44\text{px}$.

```tsx
// ❌ INCORRECT: Hit box matches 20px icon; misses fail WCAG / audit
<button className="w-5 h-5 text-stone-500">
  <CloseIcon className="w-5 h-5" />
</button>

// ✅ CORRECT: Visual icon is 20px, hit box is 44x44px with centering
<button className="min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-full active:bg-stone-100 dark:active:bg-stone-800">
  <CloseIcon className="w-5 h-5" />
</button>
```

### 3.3 Inter-Target Spacing & Fat-Finger Protection

When two interactive controls are placed adjacent to one another (e.g., quantity stepper `-` and `+` buttons, or filter chips), they must maintain a minimum physical separation:
$$d_{\text{gap}} \ge 8\text{px}$$

Placing interactive touch targets with $d_{\text{gap}} < 8\text{px}$ induces "fat-finger" selection errors, frustrating users during fast interactions.

---

## 4. Safe Area Inset Geometry & Mathematical Formulas

Modern smartphones incorporate physical display intrusions: top camera notches, Dynamic Islands, pill punch-holes, rounded screen corners, and bottom gesture indicator swipe bars. Interfaces must dynamically accommodate these hardware features via CSS Environmental Variables: `env(safe-area-inset-*)`.

```
+---------------------------------------+
|  Top Safe Area (env(safe-area-inset-top))  |  Notch / Dynamic Island (44-47px)
+---------------------------------------+
|                                       |
|             VIEWPORT                  |
|          CONTENT CANVAS               |
|                                       |
+---------------------------------------+
| Bottom Safe Area (env(safe-area-inset-bottom)) |  Home Gesture Bar (34px)
+---------------------------------------+
```

### 4.1 Canonical Hardware Inset Values

| Device Architecture | `env(safe-area-inset-top)` | `env(safe-area-inset-bottom)` | Typical Hardware Feature |
| :--- | :--- | :--- | :--- |
| **iPhone 14 / 15 / 16 (Pro & Std)** | $47\text{px} - 59\text{px}$ | $34\text{px}$ | Dynamic Island / FaceID |
| **iPhone X / 11 / 12 / 13** | $44\text{px} - 47\text{px}$ | $34\text{px}$ | Display Sensor Notch |
| **iPhone SE (1st / 2nd / 3rd Gen)** | $0\text{px}$ (status 20px) | $0\text{px}$ | Physical Home Button |
| **Modern Android (Pixel, Galaxy)** | $24\text{px} - 36\text{px}$ | $16\text{px} - 24\text{px}$ | Punch-hole camera & Gesture bar |

### 4.2 Concrete CSS Calc Recipes

#### 1. Sticky Top Navigation Bar
To prevent header titles and back buttons from colliding with the Dynamic Island or status bar:
```css
/* Tailwind Class Recipe */
.header-navbar {
  padding-top: max(16px, env(safe-area-inset-top, 0px));
}
/* Tailwind Arbitrary Value */
pt-[env(safe-area-inset-top,0px)]
```

#### 2. Sticky Bottom Action Bar
To ensure primary action buttons remain comfortably clear of the iOS home swipe bar:
```css
/* CSS Calc Recipe */
.bottom-action-bar {
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
/* Tailwind Arbitrary Value */
pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]
```

#### 3. Modal Bottom Sheet Container
Draggable modal drawers require extended bottom breathing room to prevent dismiss swipe gestures from conflicting with the OS home indicator:
```css
/* Bottom Sheet Padding */
.modal-bottom-sheet {
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
}
/* Tailwind Arbitrary Value */
pb-[calc(2rem+env(safe-area-inset-bottom,0px))]
```

#### 4. Fullscreen Viewport Budgeting
```css
/* Dynamic Viewport Height with Insets */
.mobile-app-screen {
  min-height: 100vh;
  min-height: 100dvh;
  height: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
}
```

---

## 5. The 7 Canonical Device Viewports & Responsive Architecture

MealWise interfaces are validated across seven standardized viewport widths spanning ultra-compact smartphones to large-screen displays:

```
320px         360px         375px         390px         414px         768px         1280px+
[ Fold/SE ]   [ Galaxy ]    [ SE 2/3 ]    [ iPhone 15 ] [ Pro Max ]   [ Tablet ]    [ Desktop HD ]
|------------- 1 Column Mobile Core -------------|             |-- 2 Col --| |-- Max-w-lg --|
```

### 5.1 Canonical Viewport Matrix

| Width ($W$) | Representative Devices | Grid Columns | Content Strategy & Insets |
| :--- | :--- | :--- | :--- |
| **320px** | iPhone SE 1st Gen, Galaxy Fold (outer) | 1 Column | Ultra-compact mode: reduce margins to `px-3`, clamp card height, ensure zero text clipping. |
| **360px** | Samsung Galaxy A & S series | 1 Column | Standard Android base: 16px screen padding, standard typography scale. |
| **375px** | iPhone SE 2/3, iPhone 12/13 mini | 1 Column | Baseline compact iOS: full touch target compliance, standard cards. |
| **390px** | iPhone 12 / 13 / 14 / 15 / 16 | 1 Column | Modern iOS reference standard: 16px horizontal margins, optimal line measure. |
| **414px / 428px** | iPhone Plus, Pro Max, Galaxy Ultra | 1 Column | Flagship mobile: comfortable breathing room, rich metadata display. |
| **768px** | iPad portrait, Android Tablets | 2 Columns | Tablet layout: 2-column dish grid, split master-detail sheets. |
| **1280px+** | Desktop HD, 4K Monitors | Max-w-lg | **Mobile Clamping Invariant**: App frame clamped to `max-w-lg` ($512\text{px}$) centered horizontally with subtle drop shadow. |

### 5.2 Desktop & Tablet Clamping Invariant

Because MealWise is strictly optimized as a mobile smartphone experience, viewing the application on desktop or widescreen displays must NEVER stretch content full-width across 1280px.

**The Clamping Rule**:
```tsx
<div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex justify-center">
  {/* Smartphone Frame Container: strictly clamped to max 512px */}
  <main className="w-full max-w-lg bg-stone-50 dark:bg-stone-900 shadow-2xl min-h-screen relative flex flex-col overflow-x-hidden">
    {children}
  </main>
</div>
```

---

## 6. Zero Horizontal Overflow Invariant

Horizontal scrolling on a mobile smartphone is a catastrophic UX defect that disorients users, interferes with native edge-swipe navigation, and clips interface elements.

### 6.1 Mathematical Invariant
At every screen width $W \in [320\text{px}, \infty)$, the maximum content scroll width $W_{\text{scroll}}$ must strictly not exceed the viewport width $W_{\text{viewport}}$:
$$W_{\text{scroll}} \le W_{\text{viewport}}$$

### 6.2 The Flexbox Width Collapse Phenomenon & Remedy
By default in CSS Flexbox, flex items have `min-width: auto`. When a flex row contains a long title string (e.g., Vietnamese dishes such as *"Bánh Mì Nướng Bơ Tỏi Sốt Phô Mai Kẹp Thịt Xông Khói"*), the text container refuses to shrink below its minimum content width, blowing out the container and inducing horizontal overflow.

**The Mandatory Invariant Trifecta**:
Every flex container enclosing text strings must include:
1. `min-w-0` on the flex child to override `min-width: auto`.
2. `truncate` or `break-words` on the text string.
3. `overflow-hidden` on the outer card wrapper.

```tsx
// ❌ OVERFLOW BUG: Long text expands flex child beyond screen width
<div className="flex items-center space-x-3">
  <img src={foodImg} className="w-12 h-12" />
  <div className="flex-1">
    <h4 className="text-base font-medium">{dishTitle}</h4> {/* Blows out */}
  </div>
</div>

// ✅ ZERO OVERFLOW INVARIANT: min-w-0 + truncate guarantees container fit
<div className="flex items-center space-x-3 min-w-0 overflow-hidden">
  <img src={foodImg} className="w-12 h-12 flex-shrink-0 rounded-lg object-cover" />
  <div className="flex-1 min-w-0">
    <h4 className="text-base font-medium text-stone-900 dark:text-stone-100 truncate">
      {dishTitle}
    </h4>
    <p className="text-xs text-stone-500 truncate">{ingredientsList}</p>
  </div>
</div>
```

---

## 7. Ergonomic Evaluation & Audit Protocol

Any new component or view must satisfy the following scoreable criteria before production deployment:

1. **Touch Target Dimensions**: All clickable nodes measure $\ge 44 \times 44\text{px}$ ($\ge 48 \times 48\text{px}$ for Android controls). *Hard Veto if failed.*
2. **Inter-Target Clearance**: Minimum distance between adjacent interactive elements is $\ge 8\text{px}$.
3. **Safe Area Insets**: Top navbar and bottom floating action bars incorporate `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
4. **Thumb-Zone Compliance**: Primary conversion actions are strictly situated within the Natural Zone (bottom 40%).
5. **Zero Horizontal Overflow**: Page scroll width $W_{\text{scroll}} = W_{\text{viewport}}$ on all 7 canonical viewports.
