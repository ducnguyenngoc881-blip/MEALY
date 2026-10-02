# Cheat-Sheet: Mobile Ergonomics & Viewport Geometry

## 1. Ergonomic Spatial Mapping

Native smartphone usage is predominantly single-handed. Thumb reach follows a radial sweep across three vertical zones:

```
+---------------------------------------+  0% Top
|             HARD ZONE                 |  Top 25% of Viewport
|     (Requires grip shift / 2 hands)   |  Headers, Status, Back icon
+---------------------------------------+  25%
|             REACH ZONE                |  Middle 35% of Viewport
|    (Accessible with thumb stretch)    |  Feed cards, list items, sliders
+---------------------------------------+  60%
|            NATURAL ZONE               |  Bottom 40% of Viewport
|     (Effortless radial sweep)         |  Primary CTAs, Tabs, Sheet actions
+---------------------------------------+  100% Bottom
```

---

## 2. Zone Component Placement Invariants

### 1. Natural Zone (Bottom 40% of Screen)
- **Controls**: Primary conversion buttons, tabs, sticky bottom bars, sheet dismiss/confirm actions.
- **Rule**: Users must be able to complete 90% of regular daily tasks without shifting hand grip or reaching into the top half of the device.

### 2. Reach Zone (Middle 35% of Screen)
- **Controls**: Content cards, scrollable list items, quantity steppers, filter pills.
- **Rule**: Content cards must be tall enough and spaced with $\ge 8\text{px}$ clearance to avoid mis-taps during scrolling.

### 3. Hard Zone (Top 25% of Screen)
- **Controls**: Passive title headers, breadcrumbs, status indicators, secondary settings icons.
- **Prohibition**: NEVER place critical conversion buttons (e.g., "Gán vào thực đơn", "Đặt hàng", "Tiếp tục") in the Hard Zone.

---

## 3. Safe Area Insets & CSS Environment Variables

Smartphones have hardware obstructions: top notches, Dynamic Islands, pill punch-holes, and bottom home indicator swipe bars.

### Safe Area CSS Rules
```css
/* Container with safe area padding */
.screen-container {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

/* Fixed sticky bottom action bar */
.sticky-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  padding-top: 12px;
}
```

### Standard Device Inset Dimensions

| Device Type | Status / Notch (Top) | Home Indicator (Bottom) | Viewport Width |
|:---|:---:|:---:|:---:|
| iPhone 13 / 14 / 15 (Standard) | `47px` | `34px` | `390px` |
| iPhone 14 Pro / 15 Pro (Dynamic Island) | `54px` | `34px` | `393px` |
| iPhone SE / Older (Home button) | `20px` | `0px` | `375px` |
| Android Flagship (Samsung Galaxy S23) | `24px`–`32px` | `16px`–`24px` | `360px`–`412px` |
| iPad / Tablet | `24px` | `20px` | `768px`–`1024px` |

---

## 4. Zero Horizontal Overflow Invariant

Horizontal page scrolling on mobile is a critical UX defect ($W_{\text{scroll}} > W_{\text{viewport}}$).

### Invariant Rules & Tailwind Fixes
1. **Flex Rows with Dynamic Text**:
   - MUST add `min-w-0` to the flex child holding the text.
   - MUST add `truncate` (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`) to the text element.
2. **Fixed Padding + Full Width**:
   - Never combine `w-screen` with `px-4`. Use `w-full max-w-lg mx-auto px-4 box-border`.
3. **Modal Dialogs & Drawers**:
   - Set `max-w-md w-full` with `overflow-hidden` on the sheet wrapper.

```tsx
// Anti-Overflow Flex Recipe
<div className="flex items-center justify-between gap-3 w-full min-w-0">
  <div className="flex items-center gap-2 min-w-0">
    <Icon className="w-5 h-5 shrink-0" />
    <span className="text-sm font-medium truncate">
      Tên món ăn rất dài không bao giờ làm tràn màn hình
    </span>
  </div>
  <button className="shrink-0 min-h-[44px] min-w-[44px] px-3 py-2 bg-stone-900 text-white rounded-lg">
    Chọn
  </button>
</div>
```
