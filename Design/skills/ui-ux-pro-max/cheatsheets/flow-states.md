# Cheat-Sheet: The 5 Invariant View States Architecture

## 1. Overview & Core Invariant

Every interactive screen, view container, bottom drawer, or modal dialog in a mobile interface MUST account for all 5 lifecycle states:

```
+---------------------------------------------------------------------------------------+
|                                5 INVARIANT VIEW STATES                                |
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

---

## 2. State Breakdown & Specifications

### State 1: Initial / Empty State (`STATE_EMPTY`)
- **Trigger**: Data collection has 0 records ($N = 0$) upon initial view load.
- **Rule**: NEVER display an empty white screen or raw unstyled text.
- **Components**:
  1. *Illustration*: Visual metaphor (e.g. outline refrigerator, empty cart, culinary icon). Food purity invariant: no human faces.
  2. *Headline*: Empathetic, clear title (e.g., "Tủ Lạnh Chưa Có Món Nào").
  3. *Subtext*: 1–2 sentences explaining value and next steps.
  4. *Primary CTA*: Placed in Natural Thumb Zone, minimum touch target $\ge 44 \times 44\text{px}$.

### State 2: Loading / Skeleton State (`STATE_LOADING`)
- **Trigger**: Asynchronous network fetch, cache hydration, or query debouncing ($t_{\text{wait}} > 100\text{ms}$).
- **Rule**: NEVER use an isolated spinning wheel centered on a blank screen.
- **CLS = 0 Invariant**: Skeleton boxes must match exact width, height, aspect ratio, border-radius, and margins of the loaded cards.
- **Animation**: CSS shimmer pulse (`animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`).
  - Light mode base: `#E7E5E4` (Stone 200) | Shimmer: `#F5F5F4` (Stone 100)
  - Dark mode base: `#292524` (Stone 800) | Shimmer: `#44403C` (Stone 700)

### State 3: Active / Populated State (`STATE_ACTIVE`)
- **Trigger**: Data successfully retrieved ($N \ge 1$).
- **Rule**: High visual scannability, clear typography hierarchy, 60fps scrolling.
- **Ergonomics**: Primary actions in Natural Zone (bottom 40%), secondary info in Reach Zone (middle 35%). Lists exceeding 50 items must be virtualized.

### State 4: Error / Retry State (`STATE_ERROR`)
- **Trigger**: Network rejection, offline status (`!navigator.onLine`), HTTP 4xx/5xx, parse failure.
- **Rule**: NEVER display stack traces, tech jargon, or dead-end alerts.
- **Components**:
  1. *Alert Icon*: Semantic Rose/Amber badge (`#E11D48` / `#D97706`).
  2. *Human Diagnostic*: Clear Vietnamese/English explanation (e.g., "Không thể tải danh sách thực đơn. Vui lòng kiểm tra kết nối mạng.").
  3. *Recovery Action*: Prominent "Thử lại" (Retry) button ($\ge 44 \times 44\text{px}$) wired to idempotency fetch function.
  4. *Secondary Action*: Offline fallback or return home button.

### State 5: Partial / Filtered State (`STATE_PARTIAL`)
- **Trigger**: Search query or active filter tags return 0 matching items ($N_{\text{matched}} = 0$ while $N_{\text{total}} > 0$).
- **Rule**: Distinct from Initial Empty State. Acknowledge user criteria.
- **Components**:
  1. *Filter Chips*: Display active filter pills with dismiss '×' icons.
  2. *Informative Headline*: "Không tìm thấy món ăn phù hợp" (No matching recipes).
  3. *1-Tap Reset CTA*: Prominent button "Xóa bộ lọc" (Clear filters) to immediately restore full catalog.

---

## 3. State Transition Matrix

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

---

## 4. React Component Architecture Pattern

```tsx
export function ViewContainer<T>({ 
  state, 
  data, 
  error, 
  onRetry, 
  onClearFilters 
}: ViewContainerProps<T>) {
  // Hooks MUST remain unconditionally at the top
  const [activeItem, setActiveItem] = useState<T | null>(null);

  switch (state) {
    case 'loading':
      return <SkeletonView />;
    case 'error':
      return <ErrorStateCard error={error} onRetry={onRetry} />;
    case 'empty':
      return <EmptyStateCard onAction={() => navigate('/add')} />;
    case 'partial':
      return <PartialFilteredCard onClearFilters={onClearFilters} />;
    case 'active':
      return <ActiveListView data={data} onSelect={setActiveItem} />;
    default:
      return null;
  }
}
```
