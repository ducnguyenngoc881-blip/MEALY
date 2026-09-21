# Color Theory & Contrast Accessibility Codex: Colorimetry, Harmony & WCAG 2.1 Engineering

## 1. Executive Overview

Color in digital product architecture and motion design serves two non-negotiable functions: it communicates semantic hierarchy and encodes visual meaning. When color choices rely on subjective aesthetic tastes or uncalibrated RGB hex picking, the resulting interfaces inevitably suffer from perceptual distortion (the Abney effect), muddy color ramps, and catastrophic accessibility violations that exclude individuals with visual impairments.

This codex replaces subjective color selection with formal colorimetry: cylindrical trigonometric harmony equations, perceptual OKLCH lightness ramps, and exact WCAG 2.1 relative luminance proofs across a pre-verified 21-token production palette.

---

## 2. Cylindrical Trigonometric Color Harmony Models

Color harmonies represent geometric symmetries within a cylindrical polar color coordinate space:
$$\text{Color Point } P = (L, C, \theta) \quad \text{where } L \in [0, 1] \text{ (Lightness)}, \; C \in [0, 0.4] \text{ (Chroma)}, \; \theta \in [0^\circ, 360^\circ) \text{ (Hue Angle)}$$

```
                            0° / 360° (Red)
                                 |
           300° (Magenta)        |        60° (Yellow)
                   \             |             /
                     \           |           /
                       \         |         /
        240° (Blue) ----+--------+--------+---- 120° (Green)
                       /         |         \
                     /           |           \
                   /             |             \
            210° (Cyan-Blue)     |        150° (Cyan-Green)
                                180° (Cyan)
```

### 2.1 Mathematical Formulations of Harmonies

Given a primary brand anchor hue $\theta_0 \in [0^\circ, 360^\circ)$:

1. **Monochromatic Harmony**:
   Zero angular variance. Cohesion is achieved strictly via modulation of Lightness $L$ and Chroma $C$:
   $$\theta_k = \theta_0, \quad L_k = \text{ramp}(k), \quad C_k = \text{ramp}(k)$$
   *Use case*: High-density analytical dashboards, minimalist SaaS, neutral workflows.

2. **Analogous Harmony**:
   Adjacent angular shifts of $\pm 30^\circ$:
   $$\Theta_{\text{analogous}} = \{\theta_0 - 30^\circ, \; \theta_0, \; \theta_0 + 30^\circ\}$$
   *Use case*: Nature themes, serene calm visual branding, continuous background gradients.

3. **Complementary Harmony**:
   Direct diameter opposition across the color circle ($180^\circ$ separation):
   $$\Theta_{\text{comp}} = \{\theta_0, \; (\theta_0 + 180^\circ) \bmod 360^\circ\}$$
   *Use case*: Highest visual tension. Primary brand vs. conversion CTA button.

4. **Split-Complementary Harmony**:
   Reduces visual tension by flanking the true complement by $\pm 30^\circ$ ($150^\circ$ and $210^\circ$ shifts):
   $$\Theta_{\text{split}} = \{\theta_0, \; (\theta_0 + 150^\circ) \bmod 360^\circ, \; (\theta_0 + 210^\circ) \bmod 360^\circ\}$$
   *Use case*: Balanced multi-category tagging, feature cards, and motion infographic palettes.

5. **Triadic Harmony**:
   Equilateral triangle division ($120^\circ$ intervals):
   $$\Theta_{\text{triad}} = \{\theta_0, \; (\theta_0 + 120^\circ) \bmod 360^\circ, \; (\theta_0 + 240^\circ) \bmod 360^\circ\}$$
   *Use case*: High-energy marketing, celebratory Remotion animations, dynamic charts.

6. **Tetradic / Square Harmony**:
   Four orthogonal nodes separated by $90^\circ$:
   $$\Theta_{\text{square}} = \{\theta_0, \; (\theta_0 + 90^\circ) \bmod 360^\circ, \; (\theta_0 + 180^\circ) \bmod 360^\circ, \; (\theta_0 + 270^\circ) \bmod 360^\circ\}$$
   *Use case*: Multi-tenant interfaces, complex four-status data matrices.

---

### 2.2 The 60-30-10 Distribution Rule
Harmonious color application requires proportional discipline across the physical viewport area:
- **60% Dominant Base**: Neutral canvas, card backgrounds, and whitespace (`white`, `gray-50`, `gray-900`).
- **30% Structural Secondary**: Typography, divider lines, secondary action buttons, card borders (`gray-600`, `gray-700`, `gray-200`).
- **10% High-Energy Accent**: High-chroma interactive triggers, primary conversion buttons, and active status indicators (`blue-600`, `rose-600`).

$$\text{Area}_{\text{accent}} \le 0.10 \times \text{Area}_{\text{viewport}}$$
Exceeding $10\%$ accent saturation degrades visual hierarchy and causes cognitive fatigue.

---

## 3. Perceptual OKLCH Ramp Generation Algorithms

### 3.1 The Flaws of Legacy HSL & RGB Color Spaces
In standard sRGB and HSL spaces, numerical coordinates fail to reflect human optical perception:
- Pure yellow (`#FFFF00`) has HSL lightness $L=50\%$, yet its actual relative luminance is $0.927$ (nearly white).
- Pure blue (`#0000FF`) also has HSL lightness $L=50\%$, yet its actual relative luminance is $0.072$ (nearly black).
- In traditional RGB tinting, blending with white or black creates "muddy" desaturation and shifts the perceived hue (the Abney effect).

### 3.2 The OKLCH Perceptual Model
The **OKLCH** color space (CIE Oklab in cylindrical coordinates) provides perceptual uniformity:
- $L$ (Lightness): Matches human perceived brightness ($0.0 = \text{pure black}$, $1.0 = \text{pure white}$).
- $C$ (Chroma): Saturation distance from neutral gray ($0.0 = \text{grayscale}$, $\approx 0.37 = \text{maximum gamut}$).
- $h$ (Hue): Cylindrical angle in degrees ($0^\circ - 360^\circ$).

### 3.3 The Sine Chroma Envelope Algorithm
To generate an 11-step monotonic color ramp (steps 50, 100, 200, ... 900, 950) around base hue $\theta_0$:
$$L(k) = 0.98 - 0.09 \cdot k \quad \text{for } k \in [0, 9], \quad L(950) = 0.03$$
$$C(k) = C_{\text{max}} \cdot \sin(\pi \cdot L(k))$$

```
Chroma (C)
  ^
  |               ***** Peak Chroma (Midtones L ≈ 0.55)
  |            **       **
  |          *             *
  |        *                 *
  |       *                   *
  |      *                     *
  +-------------------------------------> Lightness (L)
      0.0 (Black)               1.0 (White)
```

#### Why the Sine Envelope is Essential:
1. **Highlight Preservation**: As $L \to 1.0$, Chroma naturally tapers toward $0$, preventing neon-tinted chalkiness in subtle background tints (`50` and `100`).
2. **Shadow Preservation**: As $L \to 0.0$, Chroma tapers toward $0$, avoiding out-of-gamut clipping and muddy dark tones (`900` and `950`).
3. **Midtone Vibrancy**: Chroma peaks at $L \approx 0.5 - 0.6$, delivering punchy, high-impact buttons (`500` and `600`).

---

## 4. Exact WCAG 2.1 Luminance & Contrast Mathematics

The W3C Web Content Accessibility Guidelines (WCAG) 2.1 establish legal and ethical standards for digital legibility based on physical light intensity emitted by display phosphors.

### 4.1 Step 1: Piecewise sRGB Gamma Expansion (Linearization)
Given 8-bit integer channel coordinates $R_8, G_8, B_8 \in [0, 255]$:
$$C_{\text{sRGB}} = \frac{C_8}{255} \quad \text{for } C \in \{R, G, B\}$$

Convert non-linear gamma-encoded sRGB values to linear photometric light output:
$$C_{\text{linear}} = \begin{cases} 
\frac{C_{\text{sRGB}}}{12.92} & \text{if } C_{\text{sRGB}} \le 0.04045 \\ 
\left( \frac{C_{\text{sRGB}} + 0.055}{1.055} \right)^{2.4} & \text{if } C_{\text{sRGB}} > 0.04045 
\end{cases}$$

### 4.2 Step 2: Relative Luminance ($L$)
Relative luminance represents the linear photometric brightness of a color relative to standard white ($1.0$), weighted by the human eye's spectral sensitivity curve according to **ITU-R Recommendation BT.709**:
$$L = 0.2126 \cdot R_{\text{linear}} + 0.7152 \cdot G_{\text{linear}} + 0.0722 \cdot B_{\text{linear}}$$
Where $L \in [0.00000, 1.00000]$ ($L=0.0$ for `#000000`, $L=1.0$ for `#FFFFFF`).
The green channel contributes $71.52\%$ of perceived brightness, red contributes $21.26\%$, and blue contributes only $7.22\%$.

### 4.3 Step 3: Contrast Ratio ($CR$)
Let $L_1$ be the relative luminance of the lighter surface and $L_2$ be the relative luminance of the darker surface ($L_1 \ge L_2$):
$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$

The constant offset $+0.05$ represents the ambient room light reflecting off typical glass display surfaces (display flare).
- Minimum possible contrast: $1.00:1$ (identical colors).
- Maximum possible contrast: $\frac{1.00 + 0.05}{0.00 + 0.05} = \frac{1.05}{0.05} = 21.00:1$ (pure black on pure white).

---

### 4.4 WCAG 2.1 Compliance Thresholds

| Compliance Level | Target Element Type | Minimum Contrast ($CR$) | Notes |
| :--- | :--- | :--- | :--- |
| **WCAG AA** | Normal Text ($< 18\text{pt} / 24\text{px}$ regular, $< 14\text{pt} / 18.66\text{px}$ bold) | **$\ge 4.5:1$** | Legal baseline for web accessibility |
| **WCAG AA** | Large Text ($\ge 18\text{pt} / 24\text{px}$ regular, $\ge 14\text{pt} / 18.66\text{px}$ bold) | **$\ge 3.0:1$** | Reduced threshold for large glyphs |
| **WCAG AA** | Non-text UI Components (Icons, Borders, Focus Rings) | **$\ge 3.0:1$** | Mandatory for input borders and action icons |
| **WCAG AAA** | Normal Reading Text | **$\ge 7.0:1$** | Gold standard; optimal for high ambient light |
| **WCAG AAA** | Large Text | **$\ge 4.5:1$** | Enhanced readability for display titles |

---

## 5. Pre-Calculated, Verified Production Color Token Palette

Every token in this 21-token production palette has been evaluated using standard ITU-R BT.709 linear sRGB expansions.

### 5.1 The 21 Production Core Tokens

| # | Token Name | Hex Code | Relative Luminance ($L$) | Contrast vs. Light Canvas (`#FFFFFF`, $L=1.0$) | WCAG Light Rating | Contrast vs. Dark Canvas (`#0F172A`, $L=0.00919$) | WCAG Dark Rating |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `color-white` | `#FFFFFF` | 1.00000 | 1.00:1 | Base Canvas (Light) | **17.74:1** | **AAA Normal** |
| 2 | `color-black` | `#000000` | 0.00000 | **21.00:1** | **AAA Normal** | 1.18:1 | Low-contrast ground |
| 3 | `gray-50` | `#F9FAFB` | 0.95476 | 1.05:1 | Subtle Surface | **16.98:1** | **AAA Normal** |
| 4 | `gray-100` | `#F3F4F6` | 0.90410 | 1.10:1 | Card Surface / Border | **16.12:1** | **AAA Normal** |
| 5 | `gray-200` | `#E5E7EB` | 0.79808 | 1.24:1 | Divider / Border | **14.33:1** | **AAA Normal** |
| 6 | `gray-300` | `#D1D5DB` | 0.66258 | 1.47:1 | Disabled Control | **12.04:1** | **AAA Normal** |
| 7 | `gray-400` | `#9CA3AF` | 0.36357 | 2.54:1 | Non-text Border | **6.99:1** | **AA Normal / AAA Large** |
| 8 | `gray-500` | `#6B7280` | 0.16719 | **4.83:1** | **AA Normal** | 3.67:1 | **AA Large / Graphic** |
| 9 | `gray-600` | `#4B5563` | 0.08894 | **7.56:1** | **AAA Normal** | 2.35:1 | Subtle graphic |
| 10 | `gray-700` | `#374151` | 0.05187 | **10.31:1** | **AAA Normal** | 1.72:1 | Subdued card |
| 11 | `gray-800` | `#1F2937` | 0.02153 | **14.68:1** | **AAA Normal** | 1.21:1 | Dark surface tier 2 |
| 12 | `gray-900` | `#111827` | 0.00919 | **17.74:1** | **AAA Normal** | 1.00:1 | Base Canvas (Dark) |
| 13 | `gray-950` | `#030712` | 0.00215 | **20.13:1** | **AAA Normal** | 1.13:1 | Deep canvas backdrop |
| 14 | `blue-500` | `#3B82F6` | 0.23549 | 3.68:1 | **AA Large / Graphic** | **4.82:1** | **AA Normal** |
| 15 | `blue-600` | `#2563EB` | 0.15315 | **5.17:1** | **AA Normal** | 3.43:1 | **AA Large / Graphic** |
| 16 | `blue-700` | `#1D4ED8` | 0.10668 | **6.70:1** | **AA Normal** | 2.65:1 | Dark card accent |
| 17 | `blue-800` | `#1E40AF` | 0.07038 | **8.72:1** | **AAA Normal** | 2.03:1 | Deep brand accent |
| 18 | `emerald-600`| `#059669` | 0.22865 | 3.77:1 | **AA Large / Graphic** | **4.71:1** | **AA Normal** |
| 19 | `emerald-700`| `#047857` | 0.14147 | **5.48:1** | **AA Normal** | 3.23:1 | **AA Large / Graphic** |
| 20 | `rose-600` | `#E11D48` | 0.17354 | **4.70:1** | **AA Normal** | 3.78:1 | **AA Large / Graphic** |
| 21 | `amber-600` | `#D97706` | 0.27959 | 3.19:1 | **AA Large / Graphic** | **5.57:1** | **AA Normal** |

---

### 5.2 Semantic Status System (4-Role Matrix)

To guarantee accessible notification banners, modal alerts, and Remotion badge animations, every status category implements a strict 4-token set: `base`, `background`, `text`, and `border`.

| Semantic State | Token Role | Hex Code | Luminance ($L$) | Primary Target Background | Contrast Ratio | WCAG Compliance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Success** | `base` | `#10B981` | 0.4357 | Canvas (`#FFFFFF`) | 2.54:1 | Graphic Icon / UI |
| | `background` | `#ECFDF5` | 0.9572 | Canvas (`#FFFFFF`) | 1.05:1 | Container Tint |
| | `text` | `#064E3B` | 0.0573 | Container (`#ECFDF5`)| **9.39:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `text` | `#064E3B` | 0.0573 | Canvas (`#FFFFFF`) | **9.79:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `border` | `#6EE7B7` | 0.6974 | Container (`#ECFDF5`)| 1.35:1 | Subtle Container Stroke |
| **Warning** | `base` | `#F59E0B` | 0.4439 | Canvas (`#FFFFFF`) | 2.13:1 | Graphic Icon / UI |
| | `background` | `#FFFBEB` | 0.9634 | Canvas (`#FFFFFF`) | 1.04:1 | Container Tint |
| | `text` | `#78350F` | 0.0658 | Container (`#FFFBEB`)| **8.75:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `text` | `#78350F` | 0.0658 | Canvas (`#FFFFFF`) | **9.07:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `border` | `#FCD34D` | 0.6948 | Container (`#FFFBEB`)| 1.36:1 | Subtle Container Stroke |
| **Error** | `base` | `#EF4444` | 0.2294 | Canvas (`#FFFFFF`) | 3.76:1 | Graphic Icon / UI |
| | `background` | `#FEF2F2` | 0.9238 | Canvas (`#FFFFFF`) | 1.08:1 | Container Tint |
| | `text` | `#7F1D1D` | 0.0549 | Container (`#FEF2F2`)| **9.28:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `text` | `#7F1D1D` | 0.0549 | Canvas (`#FFFFFF`) | **10.01:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `border` | `#FCA5A5` | 0.5367 | Container (`#FEF2F2`)| 1.66:1 | Subtle Container Stroke |
| **Info** | `base` | `#0EA5E9` | 0.3283 | Canvas (`#FFFFFF`) | 2.78:1 | Graphic Icon / UI |
| | `background` | `#F0F9FF` | 0.9421 | Canvas (`#FFFFFF`) | 1.06:1 | Container Tint |
| | `text` | `#0C4A6E` | 0.0617 | Container (`#F0F9FF`)| **8.88:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `text` | `#0C4A6E` | 0.0617 | Canvas (`#FFFFFF`) | **9.40:1** | **WCAG AAA** ($\ge 7.0:1$) |
| | `border` | `#7DD3FC` | 0.6094 | Container (`#F0F9FF`)| 1.51:1 | Subtle Container Stroke |

---

## 6. Programmatic Implementation (TypeScript & CSS)

### 6.1 Programmatic Luminance & Contrast Calculator (TypeScript)
```typescript
/**
 * De-compands an sRGB 8-bit channel to linear photometric light output
 */
export function sRGBToLinear(channel8Bit: number): number {
  const c = channel8Bit / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculates WCAG 2.1 relative luminance according to ITU-R BT.709
 */
export function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const rLin = sRGBToLinear(r);
  const gLin = sRGBToLinear(g);
  const bLin = sRGBToLinear(b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Computes the WCAG 2.1 contrast ratio between two hex colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

### 6.2 CSS Custom Properties Implementation
```css
:root {
  /* Core Base Colors */
  --color-white: #FFFFFF;
  --color-black: #000000;

  /* Grayscale Neutral Palette */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  --gray-950: #030712;

  /* Primary Brand Interactive (Blue) */
  --blue-500: #3B82F6;
  --blue-600: #2563EB;
  --blue-700: #1D4ED8;
  --blue-800: #1E40AF;

  /* Accents & Status */
  --emerald-600: #059669;
  --emerald-700: #047857;
  --rose-600: #E11D48;
  --amber-600: #D97706;

  /* Semantic Status Tokens */
  --status-success-bg: #ECFDF5;
  --status-success-text: #064E3B;
  --status-warning-bg: #FFFBEB;
  --status-warning-text: #78350F;
  --status-error-bg: #FEF2F2;
  --status-error-text: #7F1D1D;
  --status-info-bg: #F0F9FF;
  --status-info-text: #0C4A6E;
}
```

---

## 7. Anti-Patterns & The Hard Accessibility Gate

### 7.1 The Hard Accessibility Gate
> **Mandatory Quality Invariant**: If any normal reading text or interactive control fails WCAG 2.1 AA contrast ($CR < 4.5:1$ for normal text, $CR < 3.0:1$ for large text and controls), the design asset is **immediately rejected (HARD VETO)**. Zero points are awarded.

### 7.2 Prohibited Anti-Patterns
1. **The Light Gray on White Fallacy**:
   - *Anti-pattern*: Using `gray-400` (`#9CA3AF`) or `gray-300` (`#D1D5DB`) for body text or form inputs on white surfaces.
   - *Failure*: `gray-400` on white yields only $2.54:1$, drastically failing the $4.5:1$ threshold.
   - *Rule*: On light surfaces, body text must never be lighter than `gray-600` ($7.56:1$, AAA) or `gray-500` ($4.83:1$, AA).
2. **Color as the Sole Information Carrier (Color-Blindness Trap)**:
   - *Anti-pattern*: Indicating form validation errors solely by coloring the input border red (`#EF4444`).
   - *Failure*: Protanopia and Deuteranopia sufferers cannot reliably distinguish red from dark green or brown.
   - *Rule*: Always pair color changes with an explicit icon (e.g. alert triangle) or descriptive text label.
3. **The Unverified Gradient Contrast Trap**:
   - *Anti-pattern*: Placing white text over a gradient that transitions from dark navy to bright cyan.
   - *Failure*: While the text passes contrast on the navy side, it washes out completely against cyan.
   - *Rule*: Contrast must be verified against the worst-case (lowest contrast) endpoint of any gradient.

---

## 8. Quality Audit Verification Checkpoints

- [ ] **CP-COL-1**: 100% of body text, form labels, and primary UI copy achieve $CR \ge 4.5:1$ against their immediate background surface.
- [ ] **CP-COL-2**: Large headings ($\ge 24\text{px}$ regular, $\ge 18.66\text{px}$ bold) achieve $CR \ge 3.0:1$.
- [ ] **CP-COL-3**: All interactive form borders and essential graphical icons achieve $CR \ge 3.0:1$.
- [ ] **CP-COL-4**: Palette distribution conforms to the 60-30-10 ratio (accent area $\le 10\%$).
- [ ] **CP-COL-5**: Status notifications include both semantic color and an icon/text label.
- [ ] **CP-COL-6**: Dark mode surfaces maintain monotonic luminance progression without inverted elevations.
