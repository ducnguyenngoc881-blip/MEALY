# Visual Hierarchy & Gestalt Principles Codex: Perceptual Psychology & Mathematical Weight Models

## 1. Executive Overview

Visual hierarchy is the systematic orchestration of user attention across a two-dimensional visual field or temporal motion sequence. Rather than leaving focal progression to chance, professional design engineering leverages the perceptual mechanics of the human visual cortex—formalized by **Gestalt psychology**, eye-tracking scanpath models, and quantitative visual weight metrics.

This codex establishes the mathematical and behavioral specifications for constructing unambiguous visual focal flows in digital products, marketing compositions, and Remotion motion sequences.

---

## 2. The Six Core Gestalt Laws in UI and Motion Design

Gestalt psychology identifies fundamental principles that determine how human perception organizes chaotic visual stimuli into coherent, unified structures.

```
+-------------------------------------------------------------------------------+
|                             SIX GESTALT LAWS                                  |
+-------------------+-------------------+-------------------+-------------------+
| 1. Proximity      | 2. Similarity     | 3. Continuity     | 4. Closure        |
| Spacing ratios    | Shared visual     | Linear contours   | Edge completion   |
| define grouping   | feature mapping   | and align axes    | and peeking       |
+-------------------+-------------------+-------------------+-------------------+
|                   | 5. Figure-Ground  | 6. Common Region  |                   |
|                   | Contrast, depth,  | Enclosed borders  |                   |
|                   | elevation shadows | override space    |                   |
+-------------------+-------------------+-------------------+-------------------+
```

### 2.1 Law of Proximity (Spatial Closeness)
Objects situated close to one another are perceived as belonging to a single semantic unit, while distant objects are perceived as unrelated.

#### Quantitative Spatial Hierarchy Model
Spatial distance must increase monotonically across semantic levels:
$$d_{\text{intra-group}} < d_{\text{inter-group}} < d_{\text{inter-section}}$$

To prevent cognitive ambiguity, adjacent tiers must maintain an expansion ratio of at least $2.0\times$:
$$d_{\text{inter-group}} \ge 2 \cdot d_{\text{intra-group}}$$
$$d_{\text{inter-section}} \ge 2 \cdot d_{\text{inter-group}}$$

#### Standardized Spacing Progression in Practice
- **Micro Intra-item Spacing** ($d_{\text{intra-group}} = 4\text{px} - 8\text{px}$): Distance between icon and label, or between headline and sub-copy inside a card.
- **Inter-item Spacing** ($d_{\text{inter-group}} = 16\text{px} - 24\text{px}$): Distance separating distinct cards within a grid or form input rows.
- **Macro Inter-section Spacing** ($d_{\text{inter-section}} = 48\text{px} - 80\text{px}$): Distance between distinct functional sections of a screen or video scene.

*Failure Mode*: When the distance between a section heading and its preceding content is smaller than or equal to its distance to its following body copy, readers perceive the heading as the footer of the previous section.

---

### 2.2 Law of Similarity (Feature Equivalence)
Visual elements sharing identical intrinsic properties—such as color hue, luminance, typography, border-radius, scale, or motion velocity—are instantly classified as performing identical functions.

#### The Interaction Invariant
All interactive primary elements across an interface or video composition must maintain invariant characteristics:
$$\text{Style}(\text{Button}_{\text{primary}}) = \{\text{Color}: \text{brand-600}, \; \text{Radius}: 8\text{px}, \; \text{Weight}: 600, \; \text{Elevation}: 2\}$$

#### Law of Common Fate (Motion Similarity)
In kinetic video and Remotion animations, elements that move simultaneously with identical velocity vectors $\vec{v} = (v_x, v_y)$ and acceleration curves are grouped into a single unified object by the viewer:
$$\vec{v}_i(t) = \vec{v}_j(t) \implies \text{Group}(E_i, E_j)$$
Conversely, to isolate a hero element, apply a distinct entry vector or spring damping ratio ($\zeta$) that contrasts with the background ensemble.

---

### 2.3 Law of Continuity (Linear Alignment)
The visual cortex naturally continues along established trajectories, smooth lines, and aligned axes rather than making abrupt angular deviations.

#### Layout Application
1. **Left-Rail Anchor**: Aligning all headings, body paragraphs, and action buttons along a crisp, single vertical axis ($x = c$) creates a high-speed downward scanning lane.
2. **Horizontal Card Alignment**: Card headers and action footers must align horizontally across columns to allow rapid lateral cross-comparisons.

#### Motion Application
In Remotion camera movements and kinetic typography transitions, spatial trajectories must follow smooth continuous Bézier paths $C^1$ (continuous velocity) and $C^2$ (continuous acceleration), avoiding instantaneous direction inversions without natural deceleration.

---

### 2.4 Law of Closure (Incomplete Contours & Peeking)
When visual information is incomplete or partially obstructed, the brain automatically interpolates the missing contours if sufficient boundary geometry is provided ($\ge 60\%$ contour definition).

#### Application: The Carousel Peeking Invariant
To communicate horizontal scrollability or swipe gestures on mobile viewports without cluttering the interface with explicit pagination buttons:
$$\text{Peek Ratio} = \frac{W_{\text{visible of off-screen card}}}{W_{\text{card}}} \approx 0.15 - 0.25 \quad (15\% \text{ to } 25\% \text{ exposed})$$
Exposing $20\%$ of an adjacent card breaks visual symmetry, activating the Law of Closure and prompting the user to mentally complete the card and scroll horizontally.

---

### 2.5 Law of Figure-Ground (Depth & Contrast Separation)
The human perceptual system segments any visual scene into a prominent focal subject ("Figure") and a supporting background canvas ("Ground").

#### Mechanisms of Separation
1. **Luminance & Color Contrast**: A figure must maintain at least $3.0:1$ (graphical) or $4.5:1$ (text) contrast against its surrounding ground.
2. **Elevation Shadows ($Z_k$)**: Elevation depth creates physical separation via light occlusion.
   For elevation level $Z_k$ ($k \in \{1, 2, 3, 4, 5\}$):
   $$y_{\text{offset}} = 2^{k-1} \cdot 2\text{px}, \quad \text{Blur } B = 2^k \cdot 2\text{px}, \quad \alpha_{\text{shadow}} = 0.06 + 0.03 \cdot k$$
3. **Motion Parallax (Remotion)**:
   In multi-plane video compositions, background ground planes translate at fractional velocity relative to foreground figure planes:
   $$v_{\text{ground}} = \alpha \cdot v_{\text{figure}} \quad \text{where } 0.2 \le \alpha \le 0.4$$

---

### 2.6 Law of Common Region (Contained Enclosures)
When visual elements are bounded within a shared closed border or uniform background fill, they are perceived as tightly coupled into a single entity, overriding the Law of Proximity.

#### Bounding Strength Principle
A distinct background card fill (e.g. `gray-100` on `white`) or container border overrides loose spatial proximity:
$$\text{Grouping Power}(\text{Common Region}) > \text{Grouping Power}(\text{Proximity})$$
*Design Application*: In dashboard widgets, wrapping disparate metrics inside a unified bordered card allows tighter internal layout without confusing the user about which metrics belong together.

---

## 3. Visual Focal Flow & Eye-Tracking Paradigms

Eye-tracking research (Nielsen Norman Group, Poynter Institute) reveals deterministic reading and scanning trajectories. Interfaces and video scenes must be structured to guide attention along these natural scanpaths.

### 3.1 The F-Pattern (Information-Dense Layouts)
Used primarily on text-heavy web pages, search results, documentation, and data feeds.

```
1. Sweep 1: [========================================] 100% Width (Title / Lead)
            |
2. Drop:    | (Vertical saccade down left rail)
            |
3. Sweep 2: [====================] 50% - 70% Width (Subheading / Key Benefit)
            |
4. Drop:    | (Further vertical scan)
            |
5. Sweep 3: [======] 15% - 25% Width (Bullet Points / Left-Rail Anchors)
```

#### Architectural Design Rule (The 3-Word Rule)
Because users scan predominantly down the vertical left margin, the **first 3 words** of any heading, bullet point, or paragraph must carry the critical conceptual anchor. Never bury key keywords at the end of a line.

---

### 3.2 The Z-Pattern (Marketing, Landing Pages, Dashboards)
Used on pages with low text density, visual banners, and conversion-focused landing experiences where visual processing dominates text reading.

```
Node 1: [Logo / Identity] ------------------------> Node 2: [Navigation / Secondary CTA]
           \                                              
            \  (Diagonal gaze shift traversing Hero)      
             \                                            
Node 3: [Social Proof / Value] --------------------> Node 4: [PRIMARY CONVERSION CTA]
```

#### Trajectory Milestones
1. **Node 1 (Top-Left)**: Immediate orientation, brand recognition, and category confirmation.
2. **Node 2 (Top-Right)**: Peripheral awareness of secondary pathways or login options.
3. **Diagonal Sweep**: Traverses the high-impact visual illustration, hero video, or central value statement.
4. **Node 3 (Bottom-Left)**: Trust anchors, customer logos, testimonials, or feature summary.
5. **Node 4 (Bottom-Right)**: The conclusive focal destination where the primary action button (CTA) must reside.

---

### 3.3 The Gutenberg Diagram & Reading Gravity

The Gutenberg Diagram models visual traversal across a uniformly distributed display divided into four quadrants:

```
+-----------------------------------+-----------------------------------+
|  Primary Optical Area (POA)       |  Strong Fallow Area               |
|  - Initial Entry Point            |  - Secondary Attention            |
|  - Maximum Visual Attention       |  - Ignored on rapid sweep         |
+-----------------------------------+-----------------------------------+
|  Weak Fallow Area                 |  Terminal Area (TA)               |
|  - Visual Blind Spot              |  - Concluding Focal Rest Point    |
|  - Lowest Spontaneous Recall      |  - Mandatory Action Placement     |
+-----------------------------------+-----------------------------------+
```

#### The Reading Gravity Vector ($\vec{G}$)
Human scanning is pulled inexorably by western reading habits diagonally downward and rightward:
$$\vec{G} = [1, 1]$$
- **Primary Optical Area (Top-Left)**: Natural entry point; critical headline and value proposition must appear here.
- **Terminal Area (Bottom-Right)**: Natural resting point; primary interactive submit buttons, checkout triggers, or final Remotion closing logos must reside here.
- **Weak Fallow (Bottom-Left)**: The visual dead zone. Avoid placing solitary mission-critical actions here without high visual weight counter-stimuli.

---

## 4. Quantitative Visual Weight Formula ($VW$)

To eliminate subjective debates regarding visual prominence, Explorer 1 formulated the **Normalized Visual Weight Model** ($VW \in [0, 100]$). Every visual node on screen or in a video frame receives an objective score based on physical stimulus attributes:

$$VW = 100 \times \sum_{i} w_i f_i = 100 \times \left( w_A f_A + w_C f_C + w_S f_S + w_P f_P + w_I f_I \right)$$

Where the dimensional weights satisfy:
$$\sum_{i} w_i = w_A + w_C + w_S + w_P + w_I = 0.25 + 0.30 + 0.15 + 0.15 + 0.15 = 1.00$$

### 4.1 Parameter Definitions & Factor Equations

#### 1. Area Factor ($w_A = 0.25$)
Measures the proportion of the viewport or container occupied by the element bounding box:
$$f_A = \min\left(1.0, \sqrt{\frac{\text{Area}_{\text{element}}}{\text{Area}_{\text{viewport}} \times 0.25}}\right)$$

#### 2. Luminance Contrast Factor ($w_C = 0.30$)
Measures the photometric contrast of the element against its immediate background:
$$f_C = \frac{|L_{\text{element}} - L_{\text{background}}|}{\max(L_{\text{element}}, L_{\text{background}}, 0.05)}$$
Where $L \in [0.0, 1.0]$ is the relative luminance computed via standard ITU-R BT.709 formulas.

#### 3. Chromatic Saturation Factor ($w_S = 0.15$)
High-chroma colors draw immediate involuntary foveal attention:
$$f_S = \min\left(1.0, \frac{C_{\text{OKLCH}}}{0.22}\right)$$
Where $C_{\text{OKLCH}} \in [0.0, 0.4]$ is the perceptual chroma coordinate in OKLCH color space.

#### 4. Positional Prominence Factor ($w_P = 0.15$)
Weights the element based on its placement relative to eye-tracking scanpaths:
- **POA (Top-Left)**: $f_P = 0.95$
- **Terminal Area (Bottom-Right)**: $f_P = 0.90$
- **Geometric Center**: $f_P = 0.85$
- **Strong Fallow (Top-Right)**: $f_P = 0.70$
- **Weak Fallow (Bottom-Left)**: $f_P = 0.40$

#### 5. Isolation / Negative Space Factor ($w_I = 0.15$)
Empty space insulating an element magnifies its visual gravity:
$$f_I = \min\left(1.0, \frac{\text{Margin}_{\text{clear}}}{\min(\text{Width}_{\text{element}}, \text{Height}_{\text{element}})}\right)$$
Where $\text{Margin}_{\text{clear}}$ is the minimum distance to the nearest visual neighbor.

---

### 4.2 Calibrated Scoring Tiers

| Score Range ($VW$) | Architectural Role | UI Components | Remotion Motion Behavior |
| :--- | :--- | :--- | :--- |
| **80 – 100** | **Hero Focal Point** | Primary CTA button, Hero title, Key conversion metric | Enters first, highest scale, snaps attention |
| **55 – 80** | **Secondary Nodes** | Section titles (H2), Feature cards, Active navigation tabs | Enters $+4\text{ to } 8\text{ frames}$ later, smooth spring |
| **30 – 55** | **Tertiary Content**| Body text, input field borders, list icons, metadata | Enters $+12\text{ to } 16\text{ frames}$ later, subtle fade |
| **0 – 30** | **Background Ground**| Dividers, canvas backdrops, watermark textures, card outlines | Static canvas, zero animated displacement |

#### The Focal Dominance Rule
A well-engineered viewport or video frame must contain **exactly one Hero Focal Point** ($VW \ge 80$). Having two competing elements with $VW \ge 80$ induces cognitive dissonance and elevates decision latency by over $40\%$.

---

## 5. Typographic 3-Level Hierarchy Rules

Typography establishes the conceptual spine of an interface. A valid typographic system enforces three distinct tiers with mathematical separation.

```
+-------------------------------------------------------------------------------+
|  TIER 1: PRIMARY (Display / H1 / Hero)                                        |
|  Scale: 2.0x - 3.5x Base | Weight: 700 - 800 | VW Target: 85 - 100            |
+-------------------------------------------------------------------------------+
|  TIER 2: SECONDARY (H2, H3, Section Titles, Card Headers)                    |
|  Scale: 1.25x - 1.75x Base | Weight: 500 - 600 | VW Target: 55 - 75           |
+-------------------------------------------------------------------------------+
|  TIER 3: TERTIARY (Body Copy, Metadata, Labels, Footnotes)                    |
|  Scale: 0.75x - 1.0x Base | Weight: 400 - 500 | VW Target: 20 - 45            |
+-------------------------------------------------------------------------------+
```

### 5.1 Tier Specifications

1. **Tier 1: Primary (Display / H1 / Hero Title)**:
   - **Font Size**: $2.0\times - 3.5\times$ base font size ($32\text{px} - 56\text{px}$).
   - **Font Weight**: Bold (700) or Extra Bold (800).
   - **Color**: `gray-900` on light ($CR = 17.74:1$), `color-white` on dark ($CR = 17.85:1$).
   - **Tracking**: Negative tracking ($-0.02\text{em}$ to $-0.04\text{em}$).
   - **Target $VW$**: $85 - 100$.
2. **Tier 2: Secondary (H2, H3, Section Titles, Card Headers)**:
   - **Font Size**: $1.25\times - 1.75\times$ base font size ($20\text{px} - 28\text{px}$).
   - **Font Weight**: Semi-bold (600) or Medium (500).
   - **Color**: `gray-700` ($CR = 10.31:1$) or `gray-600` ($CR = 7.56:1$).
   - **Tracking**: Slight negative ($-0.01\text{em}$).
   - **Target $VW$**: $55 - 75$.
3. **Tier 3: Tertiary (Body Copy, Metadata, Form Labels, Captions)**:
   - **Font Size**: $0.75\times - 1.0\times$ base font size ($12\text{px} - 16\text{px}$).
   - **Font Weight**: Regular (400) or Medium (500).
   - **Color**: `gray-600` ($CR = 7.56:1$) or `gray-500` ($CR = 4.83:1$).
   - **Tracking**: Neutral ($0\text{em}$) or positive ($+0.01\text{em}$ to $+0.02\text{em}$).
   - **Target $VW$**: $20 - 45$.

### 5.2 The Non-Ambiguity Invariant
To prevent ambiguous typographic transitions where users cannot differentiate hierarchy levels:
$$\text{Level}(k) \text{ and } \text{Level}(k+1) \text{ MUST satisfy:}$$
$$\Delta \text{Scale Steps} \ge 2 \quad \mathbf{OR} \quad (\Delta \text{Font Weight} \ge 200 \; \mathbf{AND} \; \Delta \text{Contrast Ratio} \ge 3.0:1)$$

---

## 6. Kinetic Choreography in Remotion Motion Design

When designing video motion graphics, visual hierarchy unfolds chronologically across frames.

### 6.1 Staggered Entrance Choreography
```
Frame 0:   Hero Title enters  (springSnappy: mass 0.8, damping 14, stiffness 180)
Frame 6:   Subhead follows    (springGentle: mass 1.0, damping 20, stiffness 100)
Frame 14:  CTA / Cards enter  (springGentle: mass 1.0, damping 20, stiffness 100)
Frame 22:  Background accents fade in
```

#### Choreography Rules
1. **Hierarchical Precedence**: High-$VW$ elements must lead the entrance sequence. Never have small tertiary badges animate in before the primary headline.
2. **Stagger Interval**: The canonical stagger delta between adjacent hierarchy tiers is:
   $$\Delta f_{\text{stagger}} = 6 - 8\text{ frames (at 30fps)} \quad (200\text{ms} - 267\text{ms})$$
   Delays shorter than 4 frames appear as accidental glitch stutter; delays longer than 12 frames break perceptual continuity.

---

## 7. Anti-Patterns & Common Traps

1. **The Visual Cacophony Trap (Multiple Heroes)**:
   - *Anti-pattern*: Giving high chromatic saturation and heavy borders to multiple adjacent cards simultaneously.
   - *Result*: Cognitive overload; eye wanders aimlessly without a clear focal entry point.
   - *Correction*: Designate one featured card with high $VW$ (e.g. `blue-600` border, elevation-3); keep peer cards subdued.
2. **The Disconnected Heading Trap**:
   - *Anti-pattern*: Placing equal top and bottom margins on section headings (`my-8`).
   - *Result*: Violates the Law of Proximity. Heading appears floating ambiguously between sections.
   - *Correction*: Enforce $M_{\text{top}} \ge 2 \cdot M_{\text{bottom}}$ (e.g. `mt-12 mb-4`).
3. **The Weak Fallow Trap**:
   - *Anti-pattern*: Placing the only primary conversion button in the bottom-left quadrant without surrounding visual weight.
   - *Result*: Bottom-left is the natural reading blind spot; conversion rates drop significantly.
   - *Correction*: Position primary CTAs in the Terminal Area (bottom-right) or horizontally centered along the reading axis.

---

## 8. Quality Audit Verification Checkpoints

- [ ] **CP-GES-1**: All spatial relationships adhere to $d_{\text{inter-group}} \ge 2 \cdot d_{\text{intra-group}}$ and $d_{\text{inter-section}} \ge 2 \cdot d_{\text{inter-group}}$.
- [ ] **CP-GES-2**: Exactly one focal element on the viewport/frame achieves $VW \ge 80$.
- [ ] **CP-GES-3**: Adjacent typographic tiers satisfy the Non-Ambiguity Invariant ($\ge 2$ scale steps OR $\Delta \text{weight} \ge 200$ with $\Delta CR \ge 3:1$).
- [ ] **CP-GES-4**: Landing pages and visual cards follow a verified Z-pattern or Gutenberg reading path with the primary action terminating in the Terminal Area.
- [ ] **CP-GES-5**: Headings in dense text layouts conform to the 3-word anchor rule for F-pattern scanning.
- [ ] **CP-GES-6**: Remotion kinetic entrance animations stagger hierarchically by $6-8\text{ frames}$, leading with the dominant hero node.
