# Cheat-Sheet: Touch Target Sizing & Spatial Clearance

## 1. Ergonomic Foundation & Human Physiology

The human thumb pad creates an elliptical contact area measuring between $10\text{mm} \times 10\text{mm}$ and $12\text{mm} \times 12\text{mm}$ when pressed against smartphone glass. At standard mobile display pixel densities ($326$–$460\text{ ppi}$), this physical footprint maps to a minimum virtual canvas target of:

- **Apple Human Interface Guidelines (HIG)**: $\ge 44 \times 44\text{ pt}$ ($44 \times 44\text{ px}$)
- **Google Material Design (Android)**: $\ge 48 \times 48\text{ dp}$ ($48 \times 48\text{ px}$)
- **WCAG 2.1 Success Criterion 2.5.5 (Target Size)**: $\ge 44 \times 44\text{ CSS px}$ (Level AAA)
- **WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum)**: $\ge 24 \times 24\text{ CSS px}$ with $\ge 24\text{px}$ clearance (Level AA)

---

## 2. Touch Target Standards & Clearance Matrix

| Component Type | Visual Size | Hit Target Size | Clearance | Placement Zone |
|:---|:---:|:---:|:---:|:---|
| **Primary Conversion Button** | Full width / $48\text{px}$ height | $\ge 48\text{px}$ height | $\ge 12\text{px}$ | Natural Zone (Bottom 40%) |
| **Secondary Button / Pill** | $36\text{px}$ height | $\ge 44\text{px}$ hit area | $\ge 8\text{px}$ | Reach / Natural Zone |
| **Icon Button (Back, Close, Fav)** | $24 \times 24\text{px}$ icon | $\ge 44 \times 44\text{px}$ container | $\ge 8\text{px}$ | Hard / Reach Zone |
| **List Row Tap Trigger** | Full width $\times 56\text{px}$ | Entire row bounds | $0\text{px}$ (stacked) | Reach Zone |
| **Filter Chip / Segmented Pill** | $32\text{px}$ height | $\ge 44\text{px}$ touch envelope | $\ge 8\text{px}$ | Reach Zone |
| **Quantity Stepper (`-` / `+`)** | $32 \times 32\text{px}$ button | $\ge 44 \times 44\text{px}$ hit envelope | $\ge 8\text{px}$ | Reach Zone |

---

## 3. Techniques for Hit Target Expansion

When visual design requires a compact element (e.g. a $20\text{px}$ close icon or a $16\text{px}$ radio dot), the bounding hit box MUST still measure at least $44 \times 44\text{px}$.

### Technique 1: Flex Centering Container (Recommended)
```tsx
// Visual icon is 20px, but clickable container is 44x44px
<button 
  type="button"
  aria-label="Đóng"
  className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-stone-500 hover:text-stone-900 active:bg-stone-100 transition-colors"
>
  <X className="w-5 h-5" />
</button>
```

### Technique 2: Invisible Pseudo-Element Hit Slop
```tsx
// Element appears 24px visually, but expands 10px outward in all directions
<button 
  type="button" 
  className="relative inline-flex items-center justify-center p-1 text-stone-600 before:absolute before:-inset-2.5 before:content-['']"
>
  <Heart className="w-5 h-5" />
</button>
```

### Technique 3: Negative Margin Hit Padding
```tsx
// Adds touch padding without disrupting layout flow
<button 
  type="button"
  className="p-3 -m-3 text-stone-700 hover:text-stone-900"
>
  <ChevronLeft className="w-5 h-5" />
</button>
```

---

## 4. Minimum Inter-Target Clearance Invariant

Adjacent touch targets positioned closer than $8\text{px}$ apart suffer from touch occlusion and accidental mis-taps.

```
WRONG (Mis-tap risk):
[ Button A ][ Button B ]  (gap = 0px)

RIGHT (Safe clearance):
[ Button A ]  8px  [ Button B ]
```

### Invariant Rules:
1. Always set `gap-2` ($8\text{px}$) or `gap-3` ($12\text{px}$) between horizontal button pairs or filter chips.
2. For quantity steppers (`[-]` `[ 4 ]` `[+]`), ensure each button has its own independent $\ge 44\text{px}$ hit envelope or separated by at least $8\text{px}$.
3. In table rows and list items, separate secondary actions (e.g. edit and delete) by at least $8\text{px}$ or consolidate them into a 3-dots action menu with a $44 \times 44\text{px}$ trigger.
