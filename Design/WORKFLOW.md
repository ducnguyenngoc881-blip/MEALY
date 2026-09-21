# Master Operational Workflow Handbook: Asset Pipeline, SVG Standards & Remotion Motion System

- **Document Version**: 2.0.0
- **Status**: Production Standard
- **Target Working Directory**: `d:\New folder\Remotion\Design`
- **Scope**: Requirement R2 (Unified Master Workflow Handbook, SVG Clean-Code Standards, Generative Prompt Engineering, Remotion Motion Graphics Engine)

---

## Table of Contents
1. [Architectural Overview & Workflow Matrix](#1-architectural-overview--workflow-matrix)
2. [The 6-Phase Operational Workflow Pipeline](#2-the-6-phase-operational-workflow-pipeline)
   - [Phase 1: Conceptualization & Requirements Definition](#phase-1-conceptualization--requirements-definition)
   - [Phase 2: Direction Exploration & Generative Prompting](#phase-2-direction-exploration--generative-prompting)
   - [Phase 3: Vector Asset Drafting & Clean SVG Standards](#phase-3-vector-asset-drafting--clean-svg-standards)
   - [Phase 4: Motion Design & Remotion Scene Assembly](#phase-4-motion-design--remotion-scene-assembly)
   - [Phase 5: Quality Audit & Rubric Verification](#phase-5-quality-audit--rubric-verification)
   - [Phase 6: Production Export, Bundling & Distribution](#phase-6-production-export-bundling--distribution)
3. [SVG Vector Clean-Code Standards](#3-svg-vector-clean-code-standards)
   - [Clean-Code Architectural Criteria](#clean-code-architectural-criteria)
   - [Semantic Hierarchy & DOM Organization](#semantic-hierarchy--dom-organization)
   - [Node Optimization & Coordinate Precision Constraints](#node-optimization--coordinate-precision-constraints)
   - [Elimination of Inline Styles & Token Wiring](#elimination-of-inline-styles--token-wiring)
   - [Single-Tone `currentColor` & Multi-Tone Adaptive Theming](#single-tone-currentcolor--multi-tone-adaptive-theming)
   - [Production SVGO Configuration (`svgo.config.js`)](#production-svgo-configuration-svgoconfigjs)
   - [Reference SVG Walkthrough (`sample-logo.svg`)](#reference-svg-walkthrough-sample-logosvg)
4. [Generative Prompt Engineering Framework](#4-generative-prompt-engineering-framework)
   - [The 6-Part Structured Formula Schema](#the-6-part-structured-formula-schema)
   - [Aspect Ratio & Isolation Controls](#aspect-ratio--isolation-controls)
   - [Comprehensive Negative Prompt Dictionary](#comprehensive-negative-prompt-dictionary)
   - [6 Production-Ready Prompt Recipes](#6-production-ready-prompt-recipes)
5. [Remotion Motion Graphics Specifications](#5-remotion-motion-graphics-specifications)
   - [Harmonic Oscillator Spring Physics & Derivations](#harmonic-oscillator-spring-physics--derivations)
   - [The 4 Canonical Spring Presets Matrix](#the-4-canonical-spring-presets-matrix)
   - [Standardized Bézier Easing Curves & Clamp Extrapolation](#standardized-b%C3%A9zier-easing-curves--clamp-extrapolation)
   - [The 3-Phase Animation Lifecycle & Choreography](#the-3-phase-animation-lifecycle--choreography)
   - [Kinetic Typography Reading Budget (200-250 WPM)](#kinetic-typography-reading-budget-200-250-wpm)
   - [Multi-Format Canvas Standards & Safe Zone Mathematics](#multi-format-canvas-standards--safe-zone-mathematics)
   - [Mobile Social UI Overlay Obstruction Zones (9:16)](#mobile-social-ui-overlay-obstruction-zones-916)
6. [TypeScript Motion Engine (`src/motion/motion-engine.ts`) Integration](#6-typescript-motion-engine-srcmotionmotion-enginets-integration)

---

## 1. Architectural Overview & Workflow Matrix

The visual asset and motion graphics creation pipeline transforms creative ideas into mathematically deterministic, production-grade video compositions and vector systems. Every asset moves through six strictly governed phases.

```
+-------------------------------------------------------------------------------------------------------------+
|                                         6-PHASE OPERATIONAL WORKFLOW PIPELINE                                |
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|  +-------------------+       +-------------------+       +-------------------+                              |
|  |      PHASE 1      |       |      PHASE 2      |       |      PHASE 3      |                              |
|  | Conceptualization | ----> | Direction Explore | ----> |  Vector Drafting  |                              |
|  |   & Requirements  |       |  (Stitch / Logo)  |       |   & SVG Build     |                              |
|  +-------------------+       +-------------------+       +-------------------+                              |
|           |                           |                           |                                         |
|           v                           v                           v                                         |
|  +-------------------+       +-------------------+       +-------------------+                              |
|  |      PHASE 4      |       |      PHASE 5      |       |      PHASE 6      |                              |
|  |   Motion Design   | ----> |   Quality Audit   | ----> | Production Export |                              |
|  |    & Remotion     |       |   (100-Pt Rubric) |       |  & Distribution   |                              |
|  +-------------------+       +-------------------+       +-------------------+                              |
|                                                                                                             |
+-------------------------------------------------------------------------------------------------------------+
```

### Phase Transition & Governance Matrix

| Phase | Input Prerequisite | Primary Owner | Core Deliverable | Mandatory Exit Gate Criteria |
|:---|:---|:---|:---|:---|
| **Phase 1: Conceptualization** | Feature request or stakeholder brief | Product Designer / Strategist | Creative Brief Spec | Duration, FPS, aspect ratios, and design tokens locked |
| **Phase 2: Direction Exploration** | Approved Creative Brief | Art Director / Prompt Engineer | Concept Frames & B&W Silhouettes | Monochrome 16px/24px test passed; 6-part prompt validated |
| **Phase 3: Vector Asset Drafting** | Locked Visual Direction | Vector Specialist / UI Engineer | Production Clean SVG (`.svg`) | `viewBox` set; <= 2 dec coords; 0 inline styles; SVGO pass |
| **Phase 4: Motion Assembly** | Clean SVGs & Asset Files | Motion Designer / Remotion Dev | Scene Compositions (`.tsx`) | 100% frame determinism; springs tuned; safe zones enforced |
| **Phase 5: Quality Audit** | Assembled Compositions & Assets | QA Lead / Forensic Auditor | Completed Audit Scorecard | Automated tests pass (0 errors); Rubric score >= 90/100 |
| **Phase 6: Production Export** | Signed QA Audit Report | Release Engineer / DevOps | Encoded MP4s & Vector Sprites | Clean renders; manifest generated; zero visual defects |

---

## 2. The 6-Phase Operational Workflow Pipeline

### Phase 1: Conceptualization & Requirements Definition

#### Objective
Translate raw creative requests into an unambiguous, mathematically constrained specification before producing any graphic or motion artifacts.

#### Operational Steps
1. **Context & Intent Extraction**:
   - Deconstruct stakeholder goals: brand launch, product UI walk-through, social ad hook, or micro-interaction.
   - Establish emotional valence (e.g. authoritative enterprise, vibrant youth, clinical precision).
2. **Format & Temporal Boundary Formulation**:
   - Select primary target aspect ratio: 16:9 Landscape (`1920x1080`), 9:16 Vertical (`1080x1920`), or 1:1 Square (`1080x1080`).
   - Lock frame rate: 30 fps (standard web/mobile) or 60 fps (ultra-smooth UI interactions).
   - Set total scene frame budget: $\text{Duration (frames)} = \text{Duration (seconds)} \times \text{FPS}$.
3. **Design Token & Accessibility Mapping**:
   - Map theme colors directly from design tokens (`tokens.json` / `tokens.ts`).
   - Establish WCAG 2.1 contrast targets: $\ge 4.5:1$ for normal text (AA), $\ge 7.0:1$ for headers (AAA), $\ge 3.0:1$ for graphical UI components.

#### Phase Gate 1 Checklist
- [ ] Creative brief defines target audience, primary narrative, and tone.
- [ ] Aspect ratio, frame rate (30/60 fps), and duration budget strictly locked.
- [ ] Theme tokens and WCAG contrast targets referenced from design system.

---

### Phase 2: Direction Exploration & Generative Prompting

#### Objective
Explore divergent aesthetic concepts, validate monochrome silhouette memorability, and scaffold visual mockups using generative AI and specialized design skills.

#### Operational Steps
1. **Multi-Direction Divergence (Google Stitch Workflow)**:
   - Develop 2 to 3 distinct visual hypotheses:
     * *Direction A (Modern Minimalist)*: Strict 8pt/4pt grids, high-contrast monochrome, Stark sans-serif typography, generous whitespace.
     * *Direction B (Clean Tech / Enterprise SaaS)*: Slate navy backgrounds, electric indigo charts, glowing cyan status pills, subtle borders.
     * *Direction C (Organic Playful)*: Rounded geometries, warm terracotta and sage accents, friendly micro-illustrations.
2. **Monochrome-First Silhouette Validation (from `logo-design/SKILL.md`)**:
   - Strip all colors, gradients, and drop shadows.
   - Evaluate the mark or core UI silhouette in pure 100% black (`#000000`) on pure white (`#FFFFFF`), and inverted white on black.
   - Test legibility at 16x16px and 24x24px favicon resolutions. If geometric details blur or collapse, refine the underlying contour before adding color.
3. **Generative Concept Synthesis (`generate_image`)**:
   - Construct prompt using the standardized 6-Part Schema (Section 4).
   - Enforce negative prompt filters to eliminate raster fuzz, pseudo-text, and asymmetric distortions.
4. **Style Frame Lock & Component Breakdown**:
   - Choose winning direction with stakeholder.
   - Break design down into modular frontend vector components and layout coordinates.

#### Phase Gate 2 Checklist
- [ ] 2 to 3 distinct directions explored with documented trade-offs.
- [ ] Core mark or icon silhouette passes 16px/24px monochrome legibility test.
- [ ] Generative mockups produced using the 6-part prompt formula.
- [ ] Style frame locked and signed off.

---

### Phase 3: Vector Asset Drafting & Clean SVG Standards

#### Objective
Produce production-ready, hand-crafted or programmatic SVG vectors adhering strictly to clean-code standards, mathematical coordinate precision, and dynamic token integration.

#### Operational Steps
1. **Grid-Snapped Vector Construction**:
   - Draw all geometry snapped to a pixel grid: 24x24 for icons, 48x48 for badges, 120x120 for brand marks.
   - Eliminate subpixel blur by aligning straight lines and outer bounds to integer pixels.
2. **Path Optimization & Node Reduction**:
   - Minimize anchor points. Replace cubic Béziers with clean primitives (`<circle>`, `<rect>`, `<polygon>`) where appropriate.
   - Round all coordinates and control points in `d="..."` to a maximum of 2 decimal places.
3. **Semantic Hierarchy & Accessibility**:
   - Structure DOM into `<g id="..." class="...">` containers matching the Painter's Algorithm layer order.
   - Embed accessibility tags (`role="img"`, `<title>`, `<desc>`, `aria-labelledby`) for meaningful graphics, or `aria-hidden="true"` for decorative icons.
4. **Token Wiring & Inline Style Stripping**:
   - Strip all inline `style="..."` attributes completely.
   - Wire colors to `currentColor` or CSS custom properties (`var(--token-color-primary, #4F46E5)`).
5. **Automated SVGO Pass**:
   - Run SVGO with the production configuration to strip editor metadata while preserving `viewBox`, `title`, `desc`, and layer `id`s.

#### Phase Gate 3 Checklist
- [ ] Root SVG contains valid `viewBox="0 0 W H"` and `preserveAspectRatio="xMidYMid meet"`.
- [ ] Zero inline `style="..."` attributes present anywhere in the document.
- [ ] All coordinates rounded to $\le 2$ decimal places.
- [ ] Semantic grouping with clean layer `<g id="...">` containers.
- [ ] Asset tested in both Light and Dark mode themes.

---

### Phase 4: Motion Design & Remotion Scene Assembly

#### Objective
Assemble static vector assets, UI mockups, and typography into programmatic video scenes in Remotion using deterministic spring physics, easing curves, and kinetic choreography.

#### Operational Steps
1. **Scene Composition Hierarchy Setup**:
   - Structure scenes using Remotion's core components: `<Composition>`, `<Folder>`, `<Sequence>`, `<Series>`, `<AbsoluteFill>`.
   - Ensure all animations are 100% deterministic functions of `useCurrentFrame()` and `useVideoConfig()`.
2. **Physics Parameter Selection**:
   - Select canonical spring presets from `motion-engine.ts`:
     * `Snappy` for UI buttons, toggles, card expands.
     * `Smooth` for camera pans, ambient drifts, editorial text.
     * `Bouncy` for achievement stars, notifications, celebration badges.
     * `Heavy` for impactful modals and brand lockup impacts.
3. **Interpolation & Extrapolation Clamp Rules**:
   - All `interpolate()` operations must enforce `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'`.
4. **Kinetic Typography & Reading Budget**:
   - Reveal text via staggered character, word, or line animations.
   - Enforce reading budget formula: $\text{Hold Frames} \ge \max(45, \text{Word Count} \times 9)$ to guarantee legibility at 200-250 WPM.
5. **Safe Zone Verification**:
   - Test layout against Title Safe (80%) and Action Safe (90%) boundaries across target aspect ratios (16:9, 9:16, 1:1).

#### Phase Gate 4 Checklist
- [ ] All animations are pure deterministic functions of frame and fps.
- [ ] Interpolations use mandatory clamp extrapolation on both bounds.
- [ ] Timing respects the 3-phase lifecycle (Entrance, Hold, Exit).
- [ ] Kinetic typography meets minimum reading hold duration.
- [ ] All vital text and UI elements reside within Title Safe boundaries.

---

### Phase 5: Quality Audit & Rubric Verification

#### Objective
Perform an objective, dual-layer audit—combining automated static analysis with the 100-point scoreable rubric—to ensure total compliance before production release.

#### Operational Steps
1. **Automated Validation Suite**:
   - Run automated test runner: `node tests/run-all.js`.
   - Verify SVG clean-code checks (`test-svg-standards.js`).
   - Verify Remotion spring physics and safe zone constraints (`test-remotion-motion.js`).
   - Verify WCAG relative luminance and contrast calculations (`test-contrast-math.js`).
2. **100-Point Human Audit Evaluation (`DESIGN_AUDIT_RUBRIC.md`)**:
   - Dimension 1: Layout & Grid Compliance (20 pts)
   - Dimension 2: Visual Hierarchy & Gestalt Balance (20 pts)
   - Dimension 3: Typography & Readability (20 pts)
   - Dimension 4: Color Harmony & WCAG Contrast (20 pts) — **[ACCESSIBILITY HARD VETO GATE]**
   - Dimension 5: Asset Engineering & Code Quality (20 pts)
3. **Gate Verdict**:
   - **Score >= 95**: Exemplary (Direct Pass).
   - **Score 85 - 94**: Standard Pass (Admitted with observations).
   - **Score 70 - 84**: Conditional Revision (Returned to Phase 3 or 4).
   - **Score < 70 or ANY Contrast Veto**: Immediate Rejection (Hard Veto overrides total score to 0).

#### Phase Gate 5 Checklist
- [ ] Automated test runner exits with code 0 (all test suites pass).
- [ ] Rubric score $\ge 90/100$ recorded on audit sheet.
- [ ] Zero WCAG accessibility contrast veto violations.

---

### Phase 6: Production Export, Bundling & Distribution

#### Objective
Render final video compositions with production encoding parameters, bundle optimized vector packages, and generate deployment manifests.

#### Operational Steps
1. **Remotion Headless Rendering Pipeline**:
   - Execute CLI render with high-fidelity encoding settings:
     ```powershell
     npx remotion render src/index.ts <CompositionId> out/<CompositionId>_1080p.mp4 `
       --codec=h264 `
       --crf=18 `
       --pixel-format=yuv420p `
       --concurrency=4 `
       --gl=angle
     ```
   - Render all required multi-format variants (16:9, 9:16, 1:1).
2. **Vector Sprite & Icon Packaging**:
   - Export optimized SVGs into asset directories (`assets/samples/`, `assets/icons/`).
   - Generate React component wrappers with forwardRef and SVG attribute pass-through.
3. **Release Manifest & Audit Trail**:
   - Generate `manifest.json` cataloging SHA-256 hashes, resolutions, durations, token versions, and audit scores.

#### Phase Gate 6 Checklist
- [ ] Video render completes with 0 dropped frames.
- [ ] Video codec output verified (`h264`, `crf=18`, `yuv420p`).
- [ ] Release manifest contains hashes, metadata, and token version links.

---

## 3. SVG Vector Clean-Code Standards

SVG files are first-class software artifacts in this system. They must be maintained with the same architectural cleanliness, formatting precision, and token discipline as TypeScript code.

### Clean-Code Architectural Criteria

1. **Responsive Viewport & Scaling**:
   - Every SVG root element **must** declare an explicit `viewBox` formatted as:
     ```xml
     viewBox="0 0 <width> <height>"
     ```
   - Root elements **must** specify:
     ```xml
     preserveAspectRatio="xMidYMid meet"
     ```
   - Root elements intended for responsive UI or motion embedding must **not** include absolute hardcoded `width="...px"` or `height="...px"` attributes that block container scaling.
2. **Standard XML Namespace**:
   - Root must declare `xmlns="http://www.w3.org/2000/svg"`.
   - Deprecated namespaces like `xmlns:xlink` and editor namespaces (`xmlns:sodipodi`, `xmlns:inkscape`, `xmlns:i`) are strictly forbidden.

### Semantic Hierarchy & DOM Organization

Assets must be structured as clear, human-readable semantic trees:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="asset-title asset-desc">
  <!-- 1. Accessibility Metadata -->
  <title id="asset-title">Descriptive Title</title>
  <desc id="asset-desc">Technical description of visual geometry.</desc>

  <!-- 2. Reusable Gradients & Masks -->
  <defs>
    <linearGradient id="gradient-primary" ...> ... </linearGradient>
  </defs>

  <!-- 3. Semantic Group Layers (Painter's Order: Base to Foreground) -->
  <g id="layer-backdrop" class="layer-bg"> ... </g>
  <g id="layer-primary-geometry" class="layer-core"> ... </g>
  <g id="layer-accent-highlights" class="layer-accents"> ... </g>
</svg>
```

#### Accessibility (a11y) Rules
- **Informative Assets**: Must contain `role="img"`, `<title id="...">`, `<desc id="...">`, and `aria-labelledby="... ..."`.
- **Purely Decorative Assets**: Must declare `aria-hidden="true"` and `focusable="false"`.

### Node Optimization & Coordinate Precision Constraints

1. **Coordinate Precision Limit**:
   - All numbers in path coordinates (`d="..."`), transforms, and points must be rounded to a **maximum of 2 decimal places** (`0.01` unit precision).
   - *Prohibited*: `M 12.3847291 4.1928472 C 14.1928374 ...`
   - *Required*: `M 12.38 4.19 C 14.19 ...`
   - *Rationale*: At standard resolutions, 0.01 units represents less than 0.04 device pixels. Precision past 2 decimals wastes bandwidth with zero optical benefit.
2. **Node Minimization**:
   - Collinear anchor points must be collapsed: if three points lie along a straight line, remove the intermediate point.
   - Use shorthand Bézier commands (`S`/`s`, `T`/`t`) to preserve smooth $C^1$ tangency.
   - Use geometric primitives (`<circle>`, `<rect>`) rather than complex multi-point Bézier approximations.

### Elimination of Inline Styles & Token Wiring

1. **Absolute Prohibition of Inline Styles**:
   - Attributes formatted as `style="fill: #fff; stroke: #000;"` are **strictly forbidden**.
   - Inline styles prevent CSS class overrides, block dark-mode dynamic switching, and interfere with Remotion animation props.
2. **Presentation Attributes Bound to Design Tokens**:
   - Use standard SVG presentation attributes (`fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `opacity`).
   - Wire colors to CSS custom properties with hardcoded fallback values:
     ```xml
     <path
       d="M10 10L50 50"
       stroke="var(--token-color-primary, #4F46E5)"
       stroke-width="2"
       stroke-linecap="round"
     />
     ```

### Single-Tone `currentColor` & Multi-Tone Adaptive Theming

1. **Monochrome Icons**:
   - Set `fill="currentColor"` (for glyphs) or `stroke="currentColor"` (for line icons).
   - This guarantees that the vector inherits the active text color in both Light and Dark mode without extra CSS classes:
     ```tsx
     <div className="text-slate-900 dark:text-slate-100">
       <Icon className="w-6 h-6" />
     </div>
     ```
2. **Dual-Tone and Multi-Tone Illustrations**:
   - Utilize layered opacities (`opacity="0.15"`, `opacity="0.85"`) over `currentColor` or paired design token CSS variables (`--token-color-brand-600`, `--token-color-accent`).

### Production SVGO Configuration (`svgo.config.js`)

```javascript
/**
 * Production SVGO Configuration
 * Enforces clean-code standards, coordinate rounding, and removes editor cruft.
 */
export default {
  multipass: true,
  precision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,        // MANDATORY: Never remove viewBox
          removeTitle: false,          // MANDATORY: Preserve accessible title
          removeDesc: false,           // MANDATORY: Preserve accessible desc
          cleanupIds: false,           // MANDATORY: Preserve semantic layer IDs
        },
      },
    },
    'removeDimensions',                // Remove root width/height in favor of viewBox
    'sortAttrs',                      // Alphabetize attributes for clean version control diffs
    {
      name: 'removeUnknownsAndDefaults',
      params: {
        keepRoleAttr: true,            // Retain role="img"
        keepAriaAttrs: true,           // Retain ARIA accessibility tags
      },
    },
    {
      name: 'removeAttrs',
      params: {
        attrs: ['style', 'data-name'], // Strip inline style and editor attributes
      },
    },
  ],
};
```

### Reference SVG Walkthrough (`sample-logo.svg`)

The system includes a production reference implementation in `assets/samples/sample-logo.svg`:

```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 120 120"
  preserveAspectRatio="xMidYMid meet"
  role="img"
  aria-labelledby="sample-logo-title sample-logo-desc"
  class="design-system-sample-logo"
>
  <title id="sample-logo-title">Apex Geometric Prism Brandmark</title>
  <desc id="sample-logo-desc">An isometric interlocking geometric prism symbolizing precision, motion, and design system harmony.</desc>

  <defs>
    <linearGradient id="facet-gradient-alpha" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--token-color-accent, #06B6D4)" stop-opacity="1" />
      <stop offset="100%" stop-color="var(--token-color-brand-600, #4F46E5)" stop-opacity="1" />
    </linearGradient>
    <linearGradient id="facet-gradient-beta" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--token-color-brand-600, #4F46E5)" stop-opacity="1" />
      <stop offset="100%" stop-color="var(--token-color-brand-800, #312E81)" stop-opacity="1" />
    </linearGradient>
    <linearGradient id="facet-gradient-gamma" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="var(--token-color-brand-800, #312E81)" stop-opacity="1" />
      <stop offset="100%" stop-color="var(--token-color-accent, #06B6D4)" stop-opacity="1" />
    </linearGradient>
  </defs>

  <g id="layer-ambient-frame" class="logo-ambient-frame" opacity="0.06">
    <circle cx="60" cy="60" r="54" fill="currentColor" />
  </g>

  <g id="layer-prism-core" class="logo-prism-core">
    <g id="facet-alpha" class="logo-facet logo-facet--alpha">
      <path d="M60 16L98.11 38V70L79.06 59V43L60 32L40.94 43L60 16z" fill="url(#facet-gradient-alpha)" fill-opacity="0.95" />
    </g>
    <g id="facet-beta" class="logo-facet logo-facet--beta">
      <path d="M98.11 70L60 92L60 70L79.06 59L98.11 70z" fill="url(#facet-gradient-beta)" fill-opacity="0.85" />
      <path d="M60 92L60 104L21.89 82L21.89 50L40.94 61L40.94 77L60 88V92z" fill="url(#facet-gradient-beta)" fill-opacity="0.75" />
    </g>
    <g id="facet-gamma" class="logo-facet logo-facet--gamma">
      <path d="M21.89 50L60 16L40.94 43L21.89 50z" fill="url(#facet-gradient-gamma)" fill-opacity="0.90" />
      <path d="M40.94 61L60 50L79.06 59L60 70L40.94 61z" fill="var(--token-color-accent, #06B6D4)" fill-opacity="0.65" />
    </g>
  </g>

  <g id="layer-keyline-contours" class="logo-keyline-contours" opacity="0.4">
    <path d="M60 16L98.11 38V82L60 104L21.89 82V38L60 16z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M60 50L79.06 59V77L60 88L40.94 77V59L60 50z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </g>

  <g id="layer-focal-core" class="logo-focal-core">
    <circle cx="60" cy="68" r="4" fill="var(--token-color-accent, #06B6D4)" />
  </g>
</svg>
```

#### Clean-Code Audit Verification for `sample-logo.svg`:
- **viewBox**: `0 0 120 120` (Explicit square viewport).
- **preserveAspectRatio**: `xMidYMid meet` (Uniform scaling).
- **Inline styles**: 0 occurrences.
- **Node precision**: Max 2 decimals (`98.11`, `79.06`, `21.89`, `40.94`).
- **Token variables**: Uses `var(--token-color-accent, #06B6D4)`, `var(--token-color-brand-600, #4F46E5)`, and `currentColor`.
- **Monochrome compatibility**: Layered opacity ensures strong contrast in pure black/white.

---

## 4. Generative Prompt Engineering Framework

Generative image tools (such as `generate_image`, Midjourney, and Google Stitch) accelerate visual ideation. To guarantee that generated mockups align with our design tokens, layout grids, and motion pipelines, all prompts must follow a strict 6-part schema.

### The 6-Part Structured Formula Schema

The canonical 6-part generative prompt schema is formulated as:
`[Style] + [Subject] + [Palette] + [Lighting] + [Tone] + [Flags]`

$$\text{Prompt} = [\text{Style}] + [\text{Subject}] + [\text{Palette}] + [\text{Lighting}] + [\text{Tone}] + [\text{Flags}]$$

$$\text{Prompt} = [\text{Style}] + [\text{Subject / Geometry}] + [\text{Color Palette}] + [\text{Lighting / Atmosphere}] + [\text{Tone / Mood}] + [\text{Technical Flags}]$$

```
+-------------------+---------------------------------------------------------------------------------------+
| Component         | Definition & Production Constraints                                                   |
+-------------------+---------------------------------------------------------------------------------------+
| 1. [Style]        | Medium, aesthetic paradigm, rendering technique (e.g. "Flat vector UI component")     |
| 2. [Subject/Geom] | Core visual geometry, hierarchy of elements, layout structure, corner radii           |
| 3. [Palette]      | Specific design tokens, hex codes, or harmony models (e.g. "Slate #0F172A and Indigo") |
| 4. [Lighting]     | Illumination direction, shadow type (diffuse ambient, orthographic, soft occlusion)   |
| 5. [Tone/Mood]    | Emotional voice (e.g. "Authoritative, modern enterprise, surgical precision")          |
| 6. [Flags]        | Isolation directives, negative flags, resolution tags (e.g. "white background, no text")|
+-------------------+---------------------------------------------------------------------------------------+
```

### Aspect Ratio & Isolation Controls

| Asset Category | Target Ratio Flag | Pixel Canvas Target | Primary Use Case |
|:---|:---|:---|:---|
| **UI Components & Desktop Banners** | `AspectRatio: '16:9'` | $1920 \times 1080$ | Dashboard cards, hero illustrations, wide compositions |
| **Mobile Interfaces & Stories** | `AspectRatio: '9:16'` | $1080 \times 1920$ | Mobile app flows, vertical video backgrounds, Reels |
| **Logos, Icons & Avatars** | `AspectRatio: '1:1'` | $1080 \times 1080$ | Brand marks, system icons, social profile assets |
| **Editorial Content Cards** | `AspectRatio: '4:3'` | $1440 \times 1080$ | Feature cards, blog headers, modular grid units |

### Comprehensive Negative Prompt Dictionary

To prevent common generative hallucinations (illegible pseudo-text, noisy gradients, raster artifacts), append this standardized negative prompt to generation calls:

```
NEGATIVE PROMPT:
blurry, low resolution, raster compression artifacts, jpeg noise, illegible pseudo text, fake letters, gibberish typography, watermark, logo signature, handwriting, photo-realistic human faces, random photographic clutter, asymmetrical warping, heavy grain, messy ragged edges, dithering artifacts, unintended 3D bevels on flat marks.
```

### 6 Production-Ready Prompt Recipes

#### Recipe 1: SaaS Cloud Analytics Metric Card (Google Stitch UI Workflow)
- **Style**: Flat vector modern UI component mockup.
- **Subject**: A high-tech SaaS analytics dashboard card showing a smooth exponential growth line chart with circular node points, two metric pill badges ('+24.8% Active' and '99.9% SLA'), crisp card border with 16px corner radius.
- **Color Palette**: Deep slate navy background (`#0F172A`), electric indigo line graph (`#4F46E5`), glowing cyan accent pill (`#06B6D4`).
- **Lighting / Atmosphere**: Subtle top-down diffuse ambient illumination, gentle soft occlusion drop shadow below card.
- **Tone / Mood**: Modern enterprise, high precision, clean, professional.
- **Technical Flags**: Isolated on pure white background (`#FFFFFF`), clean crisp vector contours, no text, centered composition, 8k resolution, UI design mockup.

#### Recipe 2: MealWise Culinary Nutrition Planning Card (Mobile UI Workflow)
- **Style**: Clean modern mobile UI card mockup.
- **Subject**: A recipe card featuring a minimalist stylized Vietnamese Pho noodle bowl graphic, three nutritional breakdown indicator rings (Protein, Carbs, Calories), rounded container with subtle border.
- **Color Palette**: Fresh sage green (`#16A34A`), warm terracotta (`#EA580C`), clean crisp white surface (`#FFFFFF`), subtle warm grey background (`#F8FAFC`).
- **Lighting / Atmosphere**: Soft diffused studio daylight, minimal soft shadow.
- **Tone / Mood**: Fresh, wholesome, appetizing, friendly, modern health-tech.
- **Technical Flags**: Isolated on white background, no text, clean geometric vector paths, UI card design, high contrast.

#### Recipe 3: Abstract Geometric Enterprise Mark (Monochrome-First Logo Workflow)
- **Style**: Flat vector style logo mark.
- **Subject**: An abstract continuous geometric ribbon forming an isometric Möbius loop with three clean interlocking facets, mathematically precise bevels.
- **Color Palette**: High-contrast monochrome pure black (`#000000`) and stark white (`#FFFFFF`).
- **Lighting / Atmosphere**: Flat orthographic projection, no shadows, high graphic contrast.
- **Tone / Mood**: Minimalist, architectural, powerful, timeless, modern enterprise.
- **Technical Flags**: Isolated on pure white background (`#FFFFFF`), vector style logo, clean geometric paths, perfectly centered, no text, no watermark, scalable mark.

#### Recipe 4: Minimalist Tech Lettermark 'M' (Modern Branding Workflow)
- **Style**: Minimalist vector lettermark logo.
- **Subject**: The letter 'M' constructed from two intersecting 45-degree folded geometric polygons, clean origami-inspired silhouettes.
- **Color Palette**: Vibrant gradient transition from royal cobalt blue (`#1D4ED8`) to radiant cyan (`#06B6D4`) on stark white.
- **Lighting / Atmosphere**: Subtle internal tonal shading between polygonal planes, zero external cast shadow.
- **Tone / Mood**: Authoritative, forward-looking, innovative, precision engineering.
- **Technical Flags**: Isolated on white background, clean vector paths, sharp vertices, centered, no text, logo asset.

#### Recipe 5: Cloud Architecture & Event-Driven Pipeline (Enterprise Hero Graphic)
- **Style**: Isometric tech vector hero illustration.
- **Subject**: A distributed cloud architecture diagram depicting modular computing nodes, floating database cylinders, glowing data packets moving along structured circuit conduits, and a central security shield vault.
- **Color Palette**: Deep indigo (`#312E81`), cybernetic violet (`#7C3AED`), luminous teal (`#14B8A6`), on a crisp light grey surface (`#F1F5F9`).
- **Lighting / Atmosphere**: 30-degree isometric orthographic projection, clean ambient studio fill, crisp rim highlights on node vertices.
- **Tone / Mood**: Scalable, enterprise-grade, sophisticated, highly organized.
- **Technical Flags**: Isolated on pure white background, clean hard vector edges, no text, 8k resolution, hero graphic.

#### Recipe 6: Fluid Generative Mesh Gradient Plate (Remotion Motion Backdrop)
- **Style**: Abstract smooth generative mesh gradient texture.
- **Subject**: Undulating liquid silk waves forming broad organic curves across the full frame, continuous flowing contour lines.
- **Color Palette**: Deep midnight navy (`#0B0F19`) blending smoothly into royal indigo (`#4338CA`) and subtle ultraviolet (`#581C87`) with soft turquoise highlights (`#0D9488`).
- **Lighting / Atmosphere**: Volumetric ambient luminescence, deep velvety shadows, smooth tonal gradients with zero color banding.
- **Tone / Mood**: Cinematic, immersive, elegant, calm, premium.
- **Technical Flags**: Full canvas coverage, seamless motion backdrop plate, no harsh grain, high dynamic range, no text, 16:9 widescreen composition.

---

## 5. Remotion Motion Graphics Specifications

Remotion models visual animations programmatically where every visual property is an exact, deterministic mathematical function of time: $\text{Visual State} = f(\text{frame}, \text{fps})$.

### Harmonic Oscillator Spring Physics & Derivations

Spring motion is governed by the second-order linear ordinary differential equation (ODE) for a damped harmonic oscillator:

$$m \frac{d^2 x(t)}{dt^2} + c \frac{dx(t)}{dt} + k x(t) = 0$$

Where:
- $m$: Mass of the element (inertia / resistance to acceleration).
- $c$: Damping coefficient (viscous friction / deceleration).
- $k$: Spring stiffness constant (restoring force tension).

#### Characteristic Equations & Physical Regimes

1. **Undamped Natural Angular Frequency ($\omega_0$)**:
   $$\omega_0 = \sqrt{\frac{k}{m}} \quad (\text{rad/s})$$
2. **Damping Ratio ($\zeta$)**:
   $$\zeta = \frac{c}{2 \sqrt{m \cdot k}}$$
3. **Three Characteristic Regimes**:
   - **Underdamped ($\zeta < 1.0$)**: The system oscillates around equilibrium with exponentially decaying amplitude. Damped angular frequency is $\omega_d = \omega_0 \sqrt{1 - \zeta^2}$.
     $$x(t) = 1 - e^{-\zeta \omega_0 t} \left( \cos(\omega_d t) + \frac{\zeta}{\sqrt{1 - \zeta^2}} \sin(\omega_d t) \right)$$
   - **Critically Damped ($\zeta = 1.0$)**: The fastest return to equilibrium without any overshoot:
     $$x(t) = 1 - (1 + \omega_0 t) e^{-\omega_0 t}$$
   - **Overdamped ($\zeta > 1.0$)**: No oscillation; gentle, viscous exponential easing:
     $$\gamma = \omega_0 \sqrt{\zeta^2 - 1}, \quad x(t) = 1 - e^{-\zeta \omega_0 t} \left( \cosh(\gamma t) + \frac{\zeta \omega_0}{\gamma} \sinh(\gamma t) \right)$$

---

### The 4 Canonical Spring Presets Matrix

The system standardizes four canonical presets to eliminate guesswork and maintain visual consistency across all motion compositions:

| Preset Name | Mass ($m$) | Stiffness ($k$) | Damping ($c$) | Overshoot Clamping | Damping Ratio ($\zeta$) | Nat. Freq ($\omega_0$) | Settle Frames (30fps) | Canonical Use Cases |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Snappy** | 0.5 | 200 | 15 | `false` | **0.75** | $20.00\text{ rad/s}$ | ~18 frames (0.60s) | UI button clicks, modal popups, tab switches, dropdown reveals |
| **Smooth** | 1.0 | 100 | 30 | `false` | **1.50** | $10.00\text{ rad/s}$ | ~35 frames (1.17s) | Editorial copy, narrative transitions, subtle camera pans |
| **Bouncy** | 0.8 | 150 | 8 | `false` | **0.365** | $13.69\text{ rad/s}$ | ~45 frames (1.50s) | Gamified badges, celebration stars, notification pings, emojis |
| **Heavy** | 2.0 | 300 | 40 | `true` | **0.816** | $12.25\text{ rad/s}$ | ~22 frames (0.73s) | Impactful stat counters, heavy modal drop-ins, brand lockup slams |

#### Mathematical Verification of Presets:
- **Snappy**: $\zeta = \frac{15}{2 \sqrt{0.5 \times 200}} = \frac{15}{20} = 0.75$.
- **Smooth**: $\zeta = \frac{30}{2 \sqrt{1.0 \times 100}} = \frac{30}{20} = 1.50$.
- **Bouncy**: $\zeta = \frac{8}{2 \sqrt{0.8 \times 150}} = \frac{8}{2 \sqrt{120}} = \frac{8}{21.909} \approx 0.365$.
- **Heavy**: $\zeta = \frac{40}{2 \sqrt{2.0 \times 300}} = \frac{40}{2 \sqrt{600}} = \frac{40}{48.990} \approx 0.816$.

---

### Standardized Bézier Easing Curves & Clamp Extrapolation

For non-spring animations (e.g. constant opacity fades, linear progress tracks), standardize on Remotion `Easing` curves:

| Curve Name | Bézier Parameters | Character | Motion Application |
|:---|:---|:---|:---|
| `standardEaseOut` | `(0.0, 0.0, 0.2, 1.0)` | Decelerating ease | Elements entering screen resting into final coordinates |
| `dramaticDecel` | `(0.05, 0.7, 0.1, 1.0)` | Sharp brake | Fast entrance followed by prolonged settle |
| `standardEaseInOut`| `(0.4, 0.0, 0.2, 1.0)` | Symmetric ease | Loops, orbital motions, camera drift |
| `sharpEaseIn` | `(0.4, 0.0, 1.0, 1.0)` | Accelerating exit | Elements exiting the stage off-screen |

#### Mandatory Clamp Extrapolation Rule
Unclamped interpolations produce layout glitches and negative opacities. All Remotion `interpolate()` calls must enforce clamping:
```typescript
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.bezier(0.0, 0.0, 0.2, 1.0),
});
```

---

### The 3-Phase Animation Lifecycle & Choreography

Every visual scene follows a structured 3-phase temporal budget:

```
+----------------------------------------------------------------------------------------------------+
|                                    3-PHASE ANIMATION LIFECYCLE                                     |
+------------------------------------+-----------------------------------+---------------------------+
| 1. ENTRANCE PHASE                  | 2. HOLD & ABSORPTION PHASE        | 3. EXIT PHASE             |
| 15 - 25 frames (0.50s - 0.83s)     | 30 - 90 frames (1.00s - 3.00s)    | 10 - 20 frames (0.33s - 0.67s)
| High momentum, spring settle       | Stationary or subtle micro-drift  | Fast acceleration out     |
+------------------------------------+-----------------------------------+---------------------------+
```

#### Hierarchical Stagger Delays
Never reveal multiple items simultaneously. Apply index-based stagger offsets:
$$\text{Element Start Frame} = \text{Scene Base Frame} + (\text{Index} \times \Delta_{\text{stagger}})$$
Where $\Delta_{\text{stagger}} = 2 \text{ to } 5\text{ frames}$ (optimal: 3 frames at 30 fps).

#### Standard Arrival Sequence:
1. **Frames 0–10**: Canvas background & ambient gradients fade in.
2. **Frames 5–20**: Structural card containers expand into view.
3. **Frames 10–28**: Primary visual hero (chart or illustration) springs into place.
4. **Frames 15–32**: Primary headline typography reveals.
5. **Frames 18–35**: Supporting metrics and subtext reveal.
6. **Frames 22–38**: Accent badges and CTA buttons bounce in.

---

### Kinetic Typography Reading Budget (200-250 WPM)

Text in video must respect the human eye's cognitive processing limits:
- Standard dynamic reading velocity: **200 to 250 Words Per Minute (WPM)**.
- At 30 fps:
  $$\text{Reading Rate} = \frac{250\text{ words}}{60\text{ s}} = 4.17\text{ words/s} \implies \frac{30\text{ fps}}{4.17\text{ words/s}} \approx 7.2\text{ frames/word}$$

#### Mandatory Hold Duration Constraint:
$$\text{Hold Duration (frames)} \ge \max\left(45, \; \left\lceil \frac{\text{Word Count}}{\text{WPM}} \times 60 \times \text{fps} \right\rceil \right)$$

*Example*: A 7-word headline at 225 WPM requires:
$$\text{Hold Frames} = \max\left(45, \; \left\lceil \frac{7}{225} \times 60 \times 30 \right\rceil \right) = \max(45, \; 56) = 56\text{ frames} \quad (1.87\text{ seconds}).$$

---

### Multi-Format Canvas Standards & Safe Zone Mathematics

To eliminate edge clipping (overscan) and accommodate varying display screens, the motion system enforces Action Safe (90%) and Title Safe (80%) zones across all canonical aspect ratios:

#### Canonical Canvas Dimensions

| Canvas Format | Aspect Ratio | Resolution ($W \times H$) | Standard FPS | Dominant Platforms |
|:---|:---:|:---:|:---:|:---|
| **Landscape** | **16:9** | **$1920 \times 1080$** | 30 / 60 | YouTube, Desktop Web, TV Displays |
| **Vertical** | **9:16** | **$1080 \times 1920$** | 30 / 60 | TikTok, Instagram Reels, YouTube Shorts |
| **Square** | **1:1** | **$1080 \times 1080$** | 30 | Instagram Feed, LinkedIn, Twitter/X cards |
| **Portrait Feed** | **4:5** | **$1080 \times 1350$** | 30 | Instagram In-Feed optimized vertical |
| **Ultrawide** | **21:9** | **$2560 \times 1080$** | 30 / 60 | Ultra-widescreen monitors, cinematic headers |

#### Safe Zone Coordinate Formulas

1. **Action Safe Zone (90% Canvas Width & Height)**:
   - Margin: $M_{x} = 0.05 \cdot W$, $M_{y} = 0.05 \cdot H$
   - $X \in [0.05 \cdot W, \; 0.95 \cdot W], \quad \text{Width} = 0.90 \cdot W$
   - $Y \in [0.05 \cdot H, \; 0.95 \cdot H], \quad \text{Height} = 0.90 \cdot H$
2. **Title Safe Zone (80% Canvas Width & Height)**:
   - Margin: $M_{x} = 0.10 \cdot W$, $M_{y} = 0.10 \cdot H$
   - $X \in [0.10 \cdot W, \; 0.90 \cdot W], \quad \text{Width} = 0.80 \cdot W$
   - $Y \in [0.10 \cdot H, \; 0.90 \cdot H], \quad \text{Height} = 0.80 \cdot H$

#### Concrete Coordinate Matrix:

| Format | Canvas ($W \times H$) | Action Safe (90%) Coordinates | Title Safe (80%) Coordinates |
|:---|:---:|:---|:---|
| **16:9 Landscape** | $1920 \times 1080$ | $X \in [96, 1824]$ (Width: 1728px)<br>$Y \in [54, 1026]$ (Height: 972px) | $X \in [192, 1728]$ (Width: 1536px)<br>$Y \in [108, 972]$ (Height: 864px) |
| **9:16 Vertical** | $1080 \times 1920$ | $X \in [54, 1026]$ (Width: 972px)<br>$Y \in [96, 1824]$ (Height: 1728px) | $X \in [108, 972]$ (Width: 864px)<br>$Y \in [192, 1728]$ (Height: 1536px) |
| **1:1 Square** | $1080 \times 1080$ | $X \in [54, 1026]$ (Width: 972px)<br>$Y \in [54, 1026]$ (Height: 972px) | $X \in [108, 972]$ (Width: 864px)<br>$Y \in [108, 972]$ (Height: 864px) |

---

### Mobile Social UI Overlay Obstruction Zones (9:16)

In vertical formats (TikTok, Reels, Shorts), platform UI elements cover large parts of the screen.

```
+-------------------------------------------------------------+ (Y = 0)
|  TOP OBSTRUCTION: Status bar, search icon, audio link       |
|  Y in [0, 288px] (15% height)                               |
+-------------------------------------------------------------+ (Y = 288)
|                                           |                 |
|                                           | RIGHT EDGE:     |
|         ULTRA-SAFE MOBILE CONTENT         | Avatar follow,  |
|                 CORE WINDOW               | like heart,     |
|                                           | comment icon,   |
|         X in [108px, 864px] (Width: 756)  | share arrow     |
|         Y in [288px, 1440px] (Height: 1152)|                |
|                                           | X in [864, 1080]|
|                                           |                 |
+-------------------------------------------------------------+ (Y = 1440)
|  BOTTOM OBSTRUCTION: Username, caption text, sound ticker,  |
|  comment bar. Y in [1440, 1920px] (25% height)              |
+-------------------------------------------------------------+ (Y = 1920)
```

- **Ultra-Safe Core Box**:
  - Horizontal: $X \in [108, 864]$ (Width: 756px)
  - Vertical: $Y \in [288, 1440]$ (Height: 1152px)
- **Hard Rule**: In 9:16 vertical videos, **all** vital headlines, logos, face shots, and call-to-action cards must be centered within this 756x1152 window.

---

## 6. TypeScript Motion Engine (`src/motion/motion-engine.ts`) Integration

The formulas, presets, and safe zone calculators defined in this handbook are fully implemented in `src/motion/motion-engine.ts`.

### Key Module Exports:
1. `SPRING_PRESETS`: Canonical physics constants (`snappy`, `smooth`, `bouncy`, `heavy`).
2. `computeNaturalFrequency(mass, stiffness)`: Computes $\omega_0 = \sqrt{k/m}$.
3. `computeDampingRatio(mass, stiffness, damping)`: Computes $\zeta = c / (2\sqrt{mk})$.
4. `evaluateHarmonicOscillator(t, mass, stiffness, damping, overshootClamping)`: Analytical ODE solver returning exact progress at time $t$.
5. `computeSpringAtFrame(frame, fps, preset, delayFrames)`: Frame-accurate spring progress computation.
6. `getRemotionSpringConfig(preset)`: Remotion native `spring()` config generator.
7. `computeSafeZones(width, height)`: Exact pixel boundaries for Action Safe, Title Safe, and Social UI Safe zones.
8. `isWithinSafeZone(x, y, w, h, zone)`: Geometric intersection checker.
9. `calculateReadingHoldFrames(wordCount, fps, wpm)`: Cognitive typography hold frame calculator.
10. `staggerDelay(index, staggerFrames, baseDelay)`: Temporal cascade calculator.
11. `evaluateCubicBezier(x, x1, y1, x2, y2)`: High-performance Bézier curve solver.
12. `interpolateClamped(input, inRange, outRange, easingFn)`: Clamp-enforced linear interpolator.
13. `getSafeZoneStyles(width, height)`: CSS preview guide overlay generator.

---
*Codified and approved for production use across all visual asset creation and Remotion motion pipelines.*
