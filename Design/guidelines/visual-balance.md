# Visual Balance Codex: Optical Weight Distribution, Asymmetric Tension & Whitespace Budgets

## 1. Executive Overview: Perceptual Physics in Mobile Interfaces

In graphic and mobile interface engineering, visual balance is the systematic distribution of **perceptual mass** across a two-dimensional surface. While geometric balance concerns physical pixel measurements, human vision does not perceive pixels uniformly: a $40 \times 40\text{px}$ solid black block exerts substantially more visual attraction than a $40 \times 40\text{px}$ pale gray outline.

When users interact with MealWise on a mobile screen ($320\text{px}$–$428\text{px}$ width), unbalanced visual mass induces cognitive fatigue, disorients the thumb's motor targeting, and degrades information comprehension.

This codex defines the mathematical formulas for calculating **Normalized Visual Weight ($VW$)**, the mechanics of asymmetric tension, whitespace budgeting, and dark-mode optical compensation.

```
+---------------------------------------------------------------------------------------+
|                            OPTICAL BALANCE & MASS FORMULAS                            |
+-------------------+-------------------+-------------------+---------------------------+
| Visual Weight VW  | Center of Gravity | Asymmetric Tension| Whitespace Ratio          |
| 100 * sum(w_i*f_i)| CVG = sum(VW*P)   | A1 * C1 = A2 * C2 | R_white = Area_w / Area_v |
| 5 weighted factors| / sum(VW)         | Counter-balancing | 0.35 - 0.45 (Culinary)    |
+-------------------+-------------------+-------------------+---------------------------+
```

---

## 2. Quantitative Visual Weight Formula ($VW$)

Every visual node in a mobile layout (card, button, headline, image, badge) exerts an objective visual gravitational pull modeled by the **Normalized Visual Weight Model**:

$$VW = 100 \times \sum_{i} w_i f_i = 100 \times \left( w_A f_A + w_C f_C + w_S f_S + w_P f_P + w_I f_I \right)$$

Where the factor weights satisfy:
$$\sum_{i} w_i = w_A + w_C + w_S + w_P + w_I = 0.25 + 0.30 + 0.15 + 0.15 + 0.15 = 1.00$$

### 2.1 The Five Factor Equations

#### 1. Area Factor ($w_A = 0.25$)
Measures the proportion of the viewport occupied by the element bounding box:
$$f_A = \min\left(1.0, \sqrt{\frac{\text{Area}_{\text{element}}}{\text{Area}_{\text{viewport}} \times 0.25}}\right)$$
*Square root scaling models human non-linear area perception (Stevens' Power Law).*

#### 2. Luminance Contrast Factor ($w_C = 0.30$)
Measures the photometric contrast of the element relative to its background:
$$f_C = \frac{|L_{\text{element}} - L_{\text{background}}|}{\max(L_{\text{element}}, L_{\text{background}}, 0.05)}$$
Where $L \in [0.0, 1.0]$ is the relative luminance computed via standard ITU-R BT.709 formulas. Contrast carries the single highest individual weight ($0.30$).

#### 3. Chromatic Saturation Factor ($w_S = 0.15$)
High-chroma colors trigger involuntary foveal attention:
$$f_S = \min\left(1.0, \frac{C_{\text{OKLCH}}}{0.22}\right)$$
Where $C_{\text{OKLCH}} \in [0.0, 0.4]$ is perceptual chroma in the OKLCH color space.

#### 4. Positional Prominence Factor ($w_P = 0.15$)
Weights the element based on canonical eye-tracking scanning paths:
- **Primary Optical Area (Top-Left POA)**: $f_P = 0.95$
- **Terminal Action Area (Bottom-Right TA)**: $f_P = 0.90$
- **Geometric Viewport Center**: $f_P = 0.85$
- **Strong Fallow Area (Top-Right)**: $f_P = 0.70$
- **Weak Fallow Area (Bottom-Left)**: $f_P = 0.40$

#### 5. Isolation / Negative Space Factor ($w_I = 0.15$)
Empty space insulating an element magnifies its visual gravity:
$$f_I = \min\left(1.0, \frac{\text{Margin}_{\text{clear}}}{\min(\text{Width}_{\text{element}}, \text{Height}_{\text{element}})}\right)$$
Where $\text{Margin}_{\text{clear}}$ is the minimum distance to the nearest visual neighbor.

---

### 2.2 Calibrated Visual Weight Tiers

| Score Range ($VW$) | Architectural Role | Mobile UI Components | Focal Flow Priority |
| :--- | :--- | :--- | :--- |
| **80 – 100** | **Hero Focal Point** | Primary CTA button, Hero title, Key conversion metric | Enters first; single primary focal magnet per screen |
| **55 – 80** | **Secondary Nodes** | Recipe cards, Section headers (H2), Active filter tags | Supporting content; scannable groups |
| **30 – 55** | **Tertiary Content** | Body text, input borders, list icons, metadata labels | Contextual reading; low visual intrusion |
| **0 – 30** | **Background Ground** | Canvas backdrops, subtle dividers, inactive borders | Passive layout structure; zero distraction |

#### The Focal Dominance Rule
A well-engineered mobile view must contain **exactly one Hero Focal Point** ($VW \ge 80$). Having two competing elements with $VW \ge 80$ (e.g., two identically weighted saturated buttons on screen simultaneously) creates cognitive friction, elevating decision latency by over $40\%$.

---

## 3. Center of Visual Gravity (CVG) & Optical Center Displacement

### 3.1 The Center of Visual Gravity Formula
The Center of Visual Gravity ($\vec{C}_{\text{visual}}$) is the weighted centroid of all active visual nodes across the viewport:

$$\vec{C}_{\text{visual}} = \left( x_{\text{cvg}}, y_{\text{cvg}} \right) = \frac{\sum_{j=1}^{N} VW_j \cdot \vec{P}_j}{\sum_{j=1}^{N} VW_j}$$

Where $\vec{P}_j = (x_j, y_j)$ represents the normalized screen coordinates $[0, 1] \times [0, 1]$ of element $j$.

### 3.2 The Optical Center vs. Geometric Center
In visual perception, the **Optical Center** does not coincide with the mathematical geometric center ($y = 0.50$). Due to evolutionary scanning habits, the human brain perceives the true center of a vertical frame at approximately **45% from the top**:

$$y_{\text{optical}} \approx 0.45 \times H_{\text{viewport}}$$

If visual weight is distributed strictly around the geometric center ($y = 0.50$), the user experiences an uncomfortable sensation that the composition is "sinking" toward the bottom of the phone.

---

## 4. Asymmetric Visual Tension & Counter-Balancing Mechanics

While symmetrical layouts appear formal, modern mobile applications rely on **Asymmetrical Dynamic Balance** to guide user gaze through interaction funnels.

### 4.1 The Principle of Lever Arms in UI
In visual mechanics, an element with large area but subtle contrast balances a small element with intense chromatic saturation:

$$A_1 \times C_1 \approx A_2 \times C_2$$

```
+-------------------------------------------------------+
|  [ Large Recipe Photograph ]                          |
|  Area = 60%, Contrast = 0.35                          |
|  (Soft organic texture, large mass)                   |
|                                                       |
|  "Cá Hồi Nướng Măng Tây"                              |
|  350 kcal • 25 phút                                   |
|                                                       |
|                                  [ Nấu Ngay ]         |
|                          Area = 8%, Saturation = 0.95 |
|                          (Compact, ultra-high chroma) |
+-------------------------------------------------------+
```

In the dish card example above:
- The photographic header provides the large visual anchor ($A_1 = 0.60, C_1 = 0.35 \implies M_1 = 0.21$).
- The compact primary CTA button ("Nấu Ngay") on the bottom right counterbalances the image with high chroma and contrast ($A_2 = 0.08, C_2 = 0.95, S_2 = 0.90 \implies M_2 = 0.20$).
- Result: **Stable diagonal equilibrium** without symmetrical stiffness.

---

## 5. Breathing Room Rhythm & Whitespace Budgets

Whitespace (negative space) is not empty wasted space; it is an active structural element that isolates focal nodes, establishes reading rhythm, and prevents cognitive overload.

### 5.1 Whitespace Density Ratio ($R_{\text{white}}$)
The proportion of the viewport allocated to negative space:

$$R_{\text{white}} = \frac{\text{Area}_{\text{whitespace}}}{\text{Area}_{\text{viewport}}} = 1.0 - \frac{\sum \text{Area}_{\text{elements}}}{\text{Area}_{\text{viewport}}}$$

### 5.2 Domain-Specific Whitespace Budgets

| Screen Domain | Target $R_{\text{white}}$ Range | Cognitive Rationale | Concrete Spacing Rules |
| :--- | :--- | :--- | :--- |
| **Culinary & Recipe Browsing** | **$0.35 – 0.45$** | Appetite stimulation requires generous breathing room. Crowded dish layouts feel unappetizing. | Screen padding $16\text{px}$–$20\text{px}$; inter-card gap $20\text{px}$; internal card padding $16\text{px}$. |
| **Grocery Shopping Checklist** | **$0.25 – 0.35$** | High utility and scannability. Users need to compare multiple items quickly in a grocery store. | Row height $48\text{px}$; inter-row gap $8\text{px}$; aisle section margin $24\text{px}$. |
| **Onboarding Wizard** | **$0.40 – 0.50$** | High focus on a single decision at a time. Zero visual clutter. | Large centered radio cards with $16\text{px}$ gaps; bottom CTA anchored with $32\text{px}$ clearance. |

### 5.3 Proximity Ratio Invariant
To prevent visual grouping ambiguity (Gestalt Law of Proximity), adjacent structural tiers must observe the **$2.0\times$ Expansion Rule**:

$$d_{\text{inter-group}} \ge 2 \cdot d_{\text{intra-group}}$$

- Micro intra-item spacing ($d_{\text{intra}}$): $8\text{px}$ (e.g., between dish title and calorie pill).
- Inter-item spacing ($d_{\text{inter}}$): $16\text{px}$–$24\text{px}$ (e.g., between adjacent recipe cards).
- Macro inter-section spacing ($d_{\text{section}}$): $40\text{px}$–$48\text{px}$ (e.g., between "Món Nổi Bật" and "Thực Đơn Gợi Ý").

---

## 6. Dark-Mode Optical Density Compensation

Switching an interface from light mode to dark mode is not a simple RGB color inversion. Photometric perception creates optical illusions that require explicit compensation.

### 6.1 The Irradiation Phenomenon
Light text rendered on a pitch-black background bleeds outward into the surrounding dark pixels due to retinal scatter, making letterforms appear **10% to 15% bolder and larger** than identical dark text on a white canvas.

### 6.2 The Four Dark-Mode Compensation Invariants

#### 1. Typographic Weight Compensation
- In light mode: Primary headlines use `font-semibold` (weight 600) or `font-bold` (weight 700).
- In dark mode: Reduce headline font weight by 50–100 units (e.g., to `font-medium` 500) or widen letter-spacing by `+0.01em` (`tracking-wide`). This eliminates blur and preserves letterform counter-spaces.

#### 2. Elevation Through Luminance Inversion
In light mode, elevated cards cast dark drop shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.07)`). In dark mode, drop shadows are virtually invisible against dark backgrounds. Elevation MUST be communicated through **surface luminance lightening**:

```
Level 3: Floating Modal Dialog      -> #2E2A27 (Stone 800)  [Luminance = 0.055]
Level 2: Bottom Sheet Drawer        -> #252220 (Stone 850)  [Luminance = 0.040]
Level 1: Base Card Surface          -> #1A1918 (Stone 900)  [Luminance = 0.025]
Level 0: Deep Background Canvas     -> #121110 (Stone 950)  [Luminance = 0.015]
```

#### 3. 1px Perimeter Contrast Borders
In dark mode, cards and sheets must feature a subtle 1px border (`border border-stone-800` / `#292524`) to provide sharp edge definition where shadow contrast fails.

#### 4. High-Chroma Damping
Pure saturated colors (e.g., neon emerald or pure indigo) painfully vibrate against dark surfaces. Saturated accents must be shifted toward pastel or muted shades:
- Light Mode CTA: `bg-brand-600` (`#0284c7`) with white text.
- Dark Mode CTA: `bg-brand-500` (`#0ea5e9`) with `#121110` dark text, or `bg-brand-600` with reduced brightness.

---

## 7. Visual Balance Evaluation Rubric

Every mobile screen must pass the following scoreable audit checks:

- [ ] **Focal Dominance**: Does the screen have exactly one Hero Focal Point with $VW \ge 80$?
- [ ] **Optical Center Alignment**: Is the Center of Visual Gravity ($\vec{C}_{\text{visual}}$) positioned within $y \in [0.42, 0.48]$?
- [ ] **Whitespace Ratio**: Does the screen meet its domain whitespace budget ($R_{\text{white}} \in [0.35, 0.45]$ for culinary cards)?
- [ ] **Proximity Expansion**: Does the spacing satisfy $d_{\text{inter-group}} \ge 2 \cdot d_{\text{intra-group}}$?
- [ ] **Dark-Mode Compensation**: In dark mode, is elevation expressed through surface lightening and does typography avoid optical blooming?
