/**
 * Remotion Motion Engine & Animation Mathematics Specification
 * Requirement R2.4 & Milestone M2
 * 
 * Provides:
 * 1. Standardized harmonic oscillator spring physics (m x'' + c x' + k x = 0).
 * 2. 4 canonical spring presets: Snappy (zeta=0.75), Smooth (zeta=1.50), Bouncy (zeta=0.365), Heavy (zeta=0.816).
 * 3. Analytical spring evaluator for deterministic standalone computation.
 * 4. Multi-format canvas presets (16:9, 9:16, 1:1, 4:5, 21:9).
 * 5. Action Safe (90%) and Title Safe (80%) boundary calculations.
 * 6. Kinetic typography reading speed budget (200-250 WPM) and stagger offsets.
 * 7. Standardized cubic Bézier curve solvers and clamped interpolation.
 */

// ----------------------------------------------------------------------------
// 1. Spring Physics Presets & Interfaces
// ----------------------------------------------------------------------------

export interface SpringConfigPreset {
  readonly damping: number;          // Frictional resistance (c)
  readonly mass: number;             // Inertia (m)
  readonly stiffness: number;        // Restoring force tension (k)
  readonly overshootClamping: boolean; // Clamp at target equilibrium
  readonly zeta: number;             // Damping ratio: c / (2 * sqrt(m * k))
  readonly omega0: number;           // Undamped angular frequency: sqrt(k / m) in rad/s
  readonly settleFrames: number;     // Approximate frames to settle within 1% threshold at 30 fps
  readonly description: string;      // Recommended use-cases
}

export const SPRING_PRESETS = {
  snappy: {
    damping: 15,
    mass: 0.5,
    stiffness: 200,
    overshootClamping: false,
    zeta: 0.75,
    omega0: 20.0,
    settleFrames: 18,
    description: 'Crisp underdamped response for UI button taps, card reveals, dropdowns, and modals.',
  },
  smooth: {
    damping: 30,
    mass: 1.0,
    stiffness: 100,
    overshootClamping: false,
    zeta: 1.50,
    omega0: 10.0,
    settleFrames: 35,
    description: 'Overdamped gentle ease for editorial copy, camera panning, and elegant transitions.',
  },
  bouncy: {
    damping: 8,
    mass: 0.8,
    stiffness: 150,
    overshootClamping: false,
    zeta: 0.365,
    omega0: 13.69,
    settleFrames: 45,
    description: 'High elasticity bounce for achievement badges, celebration stars, emojis, and notifications.',
  },
  heavy: {
    damping: 40,
    mass: 2.0,
    stiffness: 300,
    overshootClamping: true,
    zeta: 0.816,
    omega0: 12.25,
    settleFrames: 22,
    description: 'Clamped high-impact momentum for modal drop-ins, stat counter slams, and brand lockups.',
  },
} as const;

export type SpringPresetName = keyof typeof SPRING_PRESETS;

// ----------------------------------------------------------------------------
// 2. Harmonic Oscillator Physics Mathematics
// ----------------------------------------------------------------------------

/**
 * Computes undamped natural angular frequency: omega0 = sqrt(k / m)
 */
export function computeNaturalFrequency(mass: number, stiffness: number): number {
  if (mass <= 0) throw new Error(`Mass must be strictly positive (> 0), received ${mass}`);
  if (stiffness <= 0) throw new Error(`Stiffness must be strictly positive (> 0), received ${stiffness}`);
  return Math.sqrt(stiffness / mass);
}

/**
 * Computes damping ratio: zeta = c / (2 * sqrt(m * k))
 */
export function computeDampingRatio(mass: number, stiffness: number, damping: number): number {
  if (mass <= 0) throw new Error(`Mass must be strictly positive (> 0), received ${mass}`);
  if (stiffness <= 0) throw new Error(`Stiffness must be strictly positive (> 0), received ${stiffness}`);
  if (damping < 0) throw new Error(`Damping cannot be negative (< 0), received ${damping}`);
  return damping / (2 * Math.sqrt(mass * stiffness));
}

/**
 * Computes damped angular frequency: omega_d = omega0 * sqrt(1 - zeta^2) for underdamped systems (zeta < 1).
 */
export function computeDampedFrequency(omega0: number, zeta: number): number {
  if (zeta >= 1.0) return 0;
  return omega0 * Math.sqrt(1 - zeta * zeta);
}

/**
 * Analytical closed-form evaluation of the damped harmonic oscillator ODE:
 *   m * x''(t) + c * x'(t) + k * x(t) = 0
 * 
 * Target boundary conditions:
 *   x(0) = 0 (starting position)
 *   x(inf) = 1 (target equilibrium position)
 *   x'(0) = 0 (starting from rest)
 * 
 * @param t Time in seconds (t >= 0)
 * @param mass Inertia mass m (> 0)
 * @param stiffness Spring tension k (> 0)
 * @param damping Damping coefficient c (>= 0)
 * @param overshootClamping If true, clamps output to 1.0 once it first reaches or exceeds 1.0
 * @returns Progress value starting at 0 and settling towards 1.0
 */
export function evaluateHarmonicOscillator(
  t: number,
  mass: number,
  stiffness: number,
  damping: number,
  overshootClamping: boolean = false
): number {
  if (t <= 0) return 0;

  const omega0 = computeNaturalFrequency(mass, stiffness);
  const zeta = computeDampingRatio(mass, stiffness, damping);

  let position: number;

  if (Math.abs(zeta - 1.0) < 1e-6) {
    // Critically damped (zeta = 1.0):
    // x(t) = 1 - (1 + omega0 * t) * exp(-omega0 * t)
    position = 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
  } else if (zeta < 1.0) {
    // Underdamped (zeta < 1.0):
    // x(t) = 1 - exp(-zeta * omega0 * t) * [cos(omega_d * t) + (zeta / sqrt(1 - zeta^2)) * sin(omega_d * t)]
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega0 * t);
    const envelope = Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t);
    position = 1 - decay * envelope;
  } else {
    // Overdamped (zeta > 1.0): Both r1 and r2 are strictly negative real roots
    const gamma = omega0 * Math.sqrt(zeta * zeta - 1);
    const r1 = -zeta * omega0 + gamma; // < 0
    const r2 = -zeta * omega0 - gamma; // < 0
    const coeff1 = 0.5 * (1 + (zeta * omega0) / gamma);
    const coeff2 = 0.5 * (1 - (zeta * omega0) / gamma);
    const term = coeff1 * Math.exp(r1 * t) + coeff2 * Math.exp(r2 * t);
    position = 1 - term;
  }

  if (overshootClamping && position >= 1.0) {
    return 1.0;
  }

  return position;
}

/**
 * Computes spring animation progress at a given frame number using the canonical presets.
 * 
 * @param frame Current animation frame (e.g. from Remotion useCurrentFrame())
 * @param fps Video framerate (typically 30 or 60)
 * @param preset Canonical preset name ('snappy' | 'smooth' | 'bouncy' | 'heavy')
 * @param delayFrames Optional initial frame delay before spring activates
 * @returns Progress value (0 -> 1+)
 */
export function computeSpringAtFrame(
  frame: number,
  fps: number,
  preset: SpringPresetName = 'snappy',
  delayFrames: number = 0
): number {
  const activeFrame = frame - delayFrames;
  if (activeFrame <= 0) return 0;
  const t = activeFrame / fps;
  const cfg = SPRING_PRESETS[preset];
  return evaluateHarmonicOscillator(t, cfg.mass, cfg.stiffness, cfg.damping, cfg.overshootClamping);
}

/**
 * Bridge configuration object compatible with Remotion's native `spring()` API.
 */
export function getRemotionSpringConfig(preset: SpringPresetName = 'snappy') {
  const cfg = SPRING_PRESETS[preset];
  return {
    damping: cfg.damping,
    mass: cfg.mass,
    stiffness: cfg.stiffness,
    overshootClamping: cfg.overshootClamping,
  };
}

// ----------------------------------------------------------------------------
// 3. Multi-Format Canvas & Safe Zone Mathematics
// ----------------------------------------------------------------------------

export type VideoFormat = 'landscape' | 'vertical' | 'square' | 'portrait_feed' | 'ultrawide';

export interface CanvasDimensions {
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: string;
  readonly description: string;
}

export const FORMAT_DIMENSIONS: Record<VideoFormat, CanvasDimensions> = {
  landscape: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: '16:9 Landscape (YouTube longform, desktop web, TV displays, pitch decks)',
  },
  vertical: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: '9:16 Vertical (TikTok, Instagram Reels, YouTube Shorts, mobile fullscreen)',
  },
  square: {
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: '1:1 Square (Instagram Feed, LinkedIn, Twitter/X timeline cards)',
  },
  portrait_feed: {
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: '4:5 Portrait Feed (Instagram in-feed optimal vertical canvas)',
  },
  ultrawide: {
    width: 2560,
    height: 1080,
    aspectRatio: '21:9',
    description: '21:9 Ultrawide (Cinematic banners, ultra-widescreen monitors)',
  },
} as const;

export interface SafeZoneBox {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly width: number;
  readonly height: number;
}

export interface CanvasSafeZones {
  readonly actionSafe: SafeZoneBox;       // 90% boundary: all critical visual actions & animations
  readonly titleSafe: SafeZoneBox;        // 80% boundary: all typographic copy, badges, and logos
  readonly mobileSocialSafe?: SafeZoneBox; // Vertical 9:16 center-safe zone clearing platform UI controls
}

/**
 * Computes exact pixel coordinates for Action Safe (90%) and Title Safe (80%) zones,
 * plus mobile social platform UI exclusion windows for 9:16 vertical layouts.
 */
export function computeSafeZones(width: number, height: number): CanvasSafeZones {
  if (width <= 0 || height <= 0) {
    throw new Error(`Dimensions must be positive integers, received ${width}x${height}`);
  }

  // Action Safe: 90% dimension (5% margin on each side)
  const actionMarginX = Math.round(width * 0.05);
  const actionMarginY = Math.round(height * 0.05);
  const actionSafe: SafeZoneBox = {
    xMin: actionMarginX,
    xMax: width - actionMarginX,
    yMin: actionMarginY,
    yMax: height - actionMarginY,
    width: width - actionMarginX * 2,
    height: height - actionMarginY * 2,
  };

  // Title Safe: 80% dimension (10% margin on each side)
  const titleMarginX = Math.round(width * 0.10);
  const titleMarginY = Math.round(height * 0.10);
  const titleSafe: SafeZoneBox = {
    xMin: titleMarginX,
    xMax: width - titleMarginX,
    yMin: titleMarginY,
    yMax: height - titleMarginY,
    width: width - titleMarginX * 2,
    height: height - titleMarginY * 2,
  };

  // 9:16 Vertical Mobile Social Safe Core:
  // Clears top navigation bar (0-288px / 15%), right-hand engagement column (864-1080px),
  // and bottom caption/audio ticker bar (1440-1920px / 25%).
  let mobileSocialSafe: SafeZoneBox | undefined = undefined;
  if (width === 1080 && height === 1920) {
    mobileSocialSafe = {
      xMin: 108,
      xMax: 864,
      yMin: 288,
      yMax: 1440,
      width: 756,
      height: 1152,
    };
  }

  return { actionSafe, titleSafe, mobileSocialSafe };
}

/**
 * Checks if a given rectangular bounding box is strictly contained within a safe zone.
 */
export function isWithinSafeZone(
  x: number,
  y: number,
  w: number,
  h: number,
  zone: SafeZoneBox
): boolean {
  return x >= zone.xMin && (x + w) <= zone.xMax && y >= zone.yMin && (y + h) <= zone.yMax;
}

// ----------------------------------------------------------------------------
// 4. Kinetic Typography & Temporal Budgeting
// ----------------------------------------------------------------------------

/**
 * Calculates mandatory hold duration for on-screen kinetic typography based on
 * cognitive reading speed (standard 200 - 250 words per minute).
 * 
 * Formula:
 *   Hold Frames >= max(45, ceil((wordCount / WPM) * 60 * fps))
 * 
 * @param wordCount Number of words in the text sequence
 * @param fps Video framerate (default 30)
 * @param wpm Target words-per-minute (default 225, within 200-250 range)
 * @returns Minimum frames the text must remain fully visible and stationary
 */
export function calculateReadingHoldFrames(
  wordCount: number,
  fps: number = 30,
  wpm: number = 225
): number {
  if (wordCount <= 0) return 45;
  const clampedWpm = Math.max(150, Math.min(300, wpm));
  const readingSeconds = (wordCount / clampedWpm) * 60;
  const calculatedFrames = Math.ceil(readingSeconds * fps);
  // Enforce mandatory floor of 45 frames (1.5 seconds at 30 fps)
  return Math.max(45, calculatedFrames);
}

/**
 * Computes hierarchical stagger delay frame offset for multi-item sequences.
 * 
 * @param index 0-based element position in the sequence
 * @param staggerFrames Stagger interval (standard 2 to 5 frames, default 3)
 * @param baseDelay Initial scene entrance offset
 * @returns Frame at which the specific element animation should commence
 */
export function staggerDelay(
  index: number,
  staggerFrames: number = 3,
  baseDelay: number = 0
): number {
  return baseDelay + Math.max(0, index) * Math.max(1, staggerFrames);
}

export type LifecyclePhase = 'pre-entrance' | 'entrance' | 'hold' | 'exit' | 'completed';

/**
 * Determines current phase in the standardized 3-phase animation lifecycle:
 *   Entrance (15 - 25f) -> Hold (30 - 90f) -> Exit (10 - 20f)
 */
export function getLifecyclePhase(
  frame: number,
  entranceDuration: number = 20,
  holdDuration: number = 60,
  exitDuration: number = 15
): LifecyclePhase {
  if (frame < 0) return 'pre-entrance';
  if (frame < entranceDuration) return 'entrance';
  if (frame < entranceDuration + holdDuration) return 'hold';
  if (frame < entranceDuration + holdDuration + exitDuration) return 'exit';
  return 'completed';
}

// ----------------------------------------------------------------------------
// 5. Bézier Easing Curves & Clamped Interpolation
// ----------------------------------------------------------------------------

export interface BezierCurve {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly name: string;
}

export const BEZIER_PRESETS = {
  standardEaseOut: {
    x1: 0.0,
    y1: 0.0,
    x2: 0.2,
    y2: 1.0,
    name: 'standardEaseOut',
  },
  dramaticDecel: {
    x1: 0.05,
    y1: 0.7,
    x2: 0.1,
    y2: 1.0,
    name: 'dramaticDecel',
  },
  standardEaseInOut: {
    x1: 0.4,
    y1: 0.0,
    x2: 0.2,
    y2: 1.0,
    name: 'standardEaseInOut',
  },
  sharpEaseIn: {
    x1: 0.4,
    y1: 0.0,
    x2: 1.0,
    y2: 1.0,
    name: 'sharpEaseIn',
  },
} as const;

/**
 * Evaluates a 1D cubic Bézier coordinate at parameter u (0 <= u <= 1).
 */
function sampleBezier(p0: number, p1: number, p2: number, p3: number, u: number): number {
  const oneMinusU = 1 - u;
  return (
    oneMinusU * oneMinusU * oneMinusU * p0 +
    3 * oneMinusU * oneMinusU * u * p1 +
    3 * oneMinusU * u * u * p2 +
    u * u * u * p3
  );
}

/**
 * Evaluates derivative of cubic Bézier X coordinate with respect to u.
 */
function sampleBezierDerivative(p0: number, p1: number, p2: number, p3: number, u: number): number {
  const oneMinusU = 1 - u;
  return (
    3 * oneMinusU * oneMinusU * (p1 - p0) +
    6 * oneMinusU * u * (p2 - p1) +
    3 * u * u * (p3 - p2)
  );
}

/**
 * Solves for parameter u given input x using Newton-Raphson iteration with bisection fallback.
 */
export function solveCubicBezierU(x: number, x1: number, x2: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  let u = x; // Initial guess
  for (let i = 0; i < 8; i++) {
    const currentX = sampleBezier(0, x1, x2, 1, u) - x;
    if (Math.abs(currentX) < 1e-6) return u;
    const dx = sampleBezierDerivative(0, x1, x2, 1, u);
    if (Math.abs(dx) < 1e-6) break;
    u -= currentX / dx;
  }

  // Bisection fallback
  let low = 0;
  let high = 1;
  u = x;
  while (low < high) {
    const currentX = sampleBezier(0, x1, x2, 1, u);
    if (Math.abs(currentX - x) < 1e-5) return u;
    if (x > currentX) {
      low = u;
    } else {
      high = u;
    }
    u = (high + low) / 2;
  }
  return u;
}

/**
 * Evaluates output y of a cubic Bézier curve at normalized progress x (0 <= x <= 1).
 */
export function evaluateCubicBezier(x: number, x1: number, y1: number, x2: number, y2: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const u = solveCubicBezierU(x, x1, x2);
  return sampleBezier(0, y1, y2, 1, u);
}

/**
 * Clamps numerical value strictly between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deterministic linear interpolation with mandatory clamp extrapolation
 * and optional custom easing function.
 */
export function interpolateClamped(
  input: number,
  inputRange: readonly [number, number],
  outputRange: readonly [number, number],
  easingFn?: (t: number) => number
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;

  if (inMin === inMax) return outMin;

  const clampedInput = clamp(input, Math.min(inMin, inMax), Math.max(inMin, inMax));
  let progress = (clampedInput - inMin) / (inMax - inMin);

  if (easingFn) {
    progress = easingFn(progress);
  }

  return outMin + progress * (outMax - outMin);
}

// ----------------------------------------------------------------------------
// 6. Safe Zone Style Object Generator (for UI / Overlay Rendering)
// ----------------------------------------------------------------------------

export interface SafeZoneStyles {
  container: Record<string, string | number>;
  actionSafeBox: Record<string, string | number>;
  titleSafeBox: Record<string, string | number>;
  socialSafeBox?: Record<string, string | number>;
}

/**
 * Returns plain CSS style objects to render safe zone guide overlays in development previews.
 */
export function getSafeZoneStyles(width: number, height: number): SafeZoneStyles {
  const { actionSafe, titleSafe, mobileSocialSafe } = computeSafeZones(width, height);

  const container: Record<string, string | number> = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
    zIndex: 9999,
  };

  const actionSafeBox: Record<string, string | number> = {
    position: 'absolute',
    left: `${actionSafe.xMin}px`,
    top: `${actionSafe.yMin}px`,
    width: `${actionSafe.width}px`,
    height: `${actionSafe.height}px`,
    border: '1.5px dashed rgba(34, 197, 94, 0.75)',
    boxSizing: 'border-box',
  };

  const titleSafeBox: Record<string, string | number> = {
    position: 'absolute',
    left: `${titleSafe.xMin}px`,
    top: `${titleSafe.yMin}px`,
    width: `${titleSafe.width}px`,
    height: `${titleSafe.height}px`,
    border: '1.5px dashed rgba(245, 158, 11, 0.85)',
    boxSizing: 'border-box',
  };

  let socialSafeBox: Record<string, string | number> | undefined = undefined;
  if (mobileSocialSafe) {
    socialSafeBox = {
      position: 'absolute',
      left: `${mobileSocialSafe.xMin}px`,
      top: `${mobileSocialSafe.yMin}px`,
      width: `${mobileSocialSafe.width}px`,
      height: `${mobileSocialSafe.height}px`,
      border: '2px solid rgba(6, 182, 212, 0.90)',
      boxSizing: 'border-box',
    };
  }

  return { container, actionSafeBox, titleSafeBox, socialSafeBox };
}
