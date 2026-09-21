/**
 * tokens.ts
 * Strongly typed W3C DTCG Design Tokens and Zero-Dependency Mathematical Utilities
 * Remotion Graphic Design System — Milestone M3
 */

// ----------------------------------------------------------------------------
// 1. Deep Interfaces & Token Types
// ----------------------------------------------------------------------------

export type DTCGTokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'shadow'
  | 'motion'
  | 'typography';

export interface BaseToken<T = string> {
  readonly $value: T;
  readonly $type?: DTCGTokenType;
  readonly $description?: string;
}

export interface ColorToken extends BaseToken<string> {
  readonly $type: 'color';
}

export interface SpacingToken extends BaseToken<string> {
  readonly $type: 'dimension';
  readonly px: number;
  readonly rem: string;
}

export interface FontFamilyToken extends BaseToken<string> {
  readonly $type: 'fontFamily';
}

export interface FontWeightToken extends BaseToken<number> {
  readonly $type: 'fontWeight';
}

export interface TypographyScaleToken {
  readonly $value: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
  readonly px: number;
  readonly $type: 'typography';
  readonly $description?: string;
}

export interface RadiiToken extends BaseToken<string> {
  readonly $type: 'dimension';
  readonly px: number;
}

export interface ElevationToken extends BaseToken<string> {
  readonly $type: 'shadow';
}

export interface SpringMotionToken {
  readonly $value?: string;
  readonly mass: number;
  readonly damping: number;
  readonly stiffness: number;
  readonly dampingRatio: number;
  readonly $type: 'motion';
  readonly $description?: string;
}

export interface DurationToken extends BaseToken<string> {
  readonly $type: 'duration';
  readonly ms: number;
}

export interface EasingToken extends BaseToken<string> {
  readonly $type: 'cubicBezier';
}

// ----------------------------------------------------------------------------
// 2. Authoritative Canonical Tokens Definition (as const)
// ----------------------------------------------------------------------------

export const tokens = {
  $schema: 'https://design-tokens.github.io/community-group/format/',
  $description: 'Remotion Graphic Design System Design Tokens conforming to W3C DTCG format',
  color: {
    slate: {
      '50':  { $value: '#f8fafc', $type: 'color', $description: 'Light canvas background' },
      '100': { $value: '#f1f5f9', $type: 'color', $description: 'Surface-1 card fill' },
      '200': { $value: '#e2e8f0', $type: 'color', $description: 'Subdued border' },
      '300': { $value: '#cbd5e1', $type: 'color', $description: 'Standard card border' },
      '400': { $value: '#94a3b8', $type: 'color', $description: 'Placeholder text' },
      '500': { $value: '#64748b', $type: 'color', $description: 'Tertiary text' },
      '600': { $value: '#475569', $type: 'color', $description: 'Secondary text' },
      '700': { $value: '#334155', $type: 'color', $description: 'High-contrast secondary text' },
      '800': { $value: '#1e293b', $type: 'color', $description: 'Dark surface' },
      '900': { $value: '#0f172a', $type: 'color', $description: 'Primary text on light canvas' },
      '950': { $value: '#020617', $type: 'color', $description: 'Dark canvas background' }
    },
    brand: {
      '50':  { $value: '#eef2ff', $type: 'color', $description: 'Selected tint' },
      '100': { $value: '#e0e7ff', $type: 'color', $description: 'Hover highlight' },
      '200': { $value: '#c7d2fe', $type: 'color', $description: 'Brand border' },
      '300': { $value: '#a5b4fc', $type: 'color', $description: 'Focus outline' },
      '400': { $value: '#818cf8', $type: 'color', $description: 'Icon accent' },
      '500': { $value: '#6366f1', $type: 'color', $description: 'Large brand headings' },
      '600': { $value: '#4f46e5', $type: 'color', $description: 'Primary CTA button' },
      '700': { $value: '#4338ca', $type: 'color', $description: 'Primary CTA hover' },
      '800': { $value: '#3730a3', $type: 'color', $description: 'Primary CTA active' },
      '900': { $value: '#312e81', $type: 'color', $description: 'Dark brand header' },
      '950': { $value: '#1e1b4b', $type: 'color', $description: 'Midnight brand canvas' }
    },
    teal: {
      '50':  { $value: '#f0fdfa', $type: 'color', $description: 'Teal subtle background tint' },
      '100': { $value: '#ccfbf1', $type: 'color', $description: 'Teal light container fill' },
      '200': { $value: '#99f6e4', $type: 'color', $description: 'Teal light border' },
      '300': { $value: '#5eead4', $type: 'color', $description: 'Teal decorative accent' },
      '400': { $value: '#2dd4bf', $type: 'color', $description: 'Teal secondary icon accent' },
      '500': { $value: '#14b8a6', $type: 'color', $description: 'Teal secondary base' },
      '600': { $value: '#0d9488', $type: 'color', $description: 'Teal interactive button' },
      '700': { $value: '#0f766e', $type: 'color', $description: 'Teal interactive hover (AA text)' },
      '800': { $value: '#115e59', $type: 'color', $description: 'Teal high-contrast text (AAA)' },
      '900': { $value: '#134e4a', $type: 'color', $description: 'Teal dark container surface' },
      '950': { $value: '#042f2e', $type: 'color', $description: 'Teal deep dark backdrop' }
    },
    rose: {
      '50':  { $value: '#fff1f2', $type: 'color', $description: 'Rose subtle accent tint' },
      '100': { $value: '#ffe4e6', $type: 'color', $description: 'Rose light notification fill' },
      '200': { $value: '#fecdd3', $type: 'color', $description: 'Rose decorative border' },
      '300': { $value: '#fda4af', $type: 'color', $description: 'Rose soft indicator' },
      '400': { $value: '#fb7185', $type: 'color', $description: 'Rose badge accent' },
      '500': { $value: '#f43f5e', $type: 'color', $description: 'Rose vibrant accent base' },
      '600': { $value: '#e11d48', $type: 'color', $description: 'Rose critical CTA (AA text)' },
      '700': { $value: '#be123c', $type: 'color', $description: 'Rose critical CTA hover (AA text)' },
      '800': { $value: '#9f1239', $type: 'color', $description: 'Rose high-contrast text (AAA)' },
      '900': { $value: '#881337', $type: 'color', $description: 'Rose deep dark surface' },
      '950': { $value: '#4c0519', $type: 'color', $description: 'Rose midnight backdrop' }
    },
    semantic: {
      success: {
        text:       { $value: '#064e3b', $type: 'color', $description: 'Success high-contrast AAA text' },
        background: { $value: '#ecfdf5', $type: 'color', $description: 'Success container background tint' },
        base:       { $value: '#10b981', $type: 'color', $description: 'Success standard indicator base' },
        border:     { $value: '#6ee7b7', $type: 'color', $description: 'Success container boundary stroke' }
      },
      warning: {
        text:       { $value: '#78350f', $type: 'color', $description: 'Warning high-contrast AAA text' },
        background: { $value: '#fffbeb', $type: 'color', $description: 'Warning container background tint' },
        base:       { $value: '#f59e0b', $type: 'color', $description: 'Warning standard indicator base' },
        border:     { $value: '#fcd34d', $type: 'color', $description: 'Warning container boundary stroke' }
      },
      error: {
        text:       { $value: '#7f1d1d', $type: 'color', $description: 'Error high-contrast AAA text' },
        background: { $value: '#fef2f2', $type: 'color', $description: 'Error container background tint' },
        base:       { $value: '#ef4444', $type: 'color', $description: 'Error standard indicator base' },
        border:     { $value: '#fca5a5', $type: 'color', $description: 'Error container boundary stroke' }
      },
      info: {
        text:       { $value: '#0c4a6e', $type: 'color', $description: 'Info high-contrast AAA text' },
        background: { $value: '#f0f9ff', $type: 'color', $description: 'Info container background tint' },
        base:       { $value: '#0ea5e9', $type: 'color', $description: 'Info standard indicator base' },
        border:     { $value: '#7dd3fc', $type: 'color', $description: 'Info container boundary stroke' }
      }
    },
    surface: {
      light: {
        canvas:           { $value: '#ffffff', $type: 'color', $description: 'Base canvas ground in light mode' },
        'surface-1':       { $value: '#f8fafc', $type: 'color', $description: 'Card and pane surface level 1 in light mode' },
        'surface-2':       { $value: '#f1f5f9', $type: 'color', $description: 'Secondary container surface level 2 in light mode' },
        'surface-elevated': { $value: '#ffffff', $type: 'color', $description: 'Elevated modal/popover surface in light mode' }
      },
      dark: {
        canvas:           { $value: '#020617', $type: 'color', $description: 'Deep canvas ground in dark mode' },
        'surface-1':       { $value: '#0f172a', $type: 'color', $description: 'Card and pane surface level 1 in dark mode' },
        'surface-2':       { $value: '#1e293b', $type: 'color', $description: 'Secondary container surface level 2 in dark mode' },
        'surface-elevated': { $value: '#1e293b', $type: 'color', $description: 'Elevated modal/popover surface in dark mode' }
      }
    },
    text: {
      light: {
        primary:   { $value: '#0f172a', $type: 'color', $description: 'High-contrast primary body text in light mode' },
        secondary: { $value: '#475569', $type: 'color', $description: 'Secondary body copy and labels in light mode' },
        tertiary:  { $value: '#64748b', $type: 'color', $description: 'Muted tertiary copy and meta captions in light mode' },
        inverse:   { $value: '#ffffff', $type: 'color', $description: 'Inverse text for dark badges and primary CTAs' }
      },
      dark: {
        primary:   { $value: '#f8fafc', $type: 'color', $description: 'High-contrast primary body text in dark mode' },
        secondary: { $value: '#94a3b8', $type: 'color', $description: 'Secondary body copy and labels in dark mode' },
        tertiary:  { $value: '#64748b', $type: 'color', $description: 'Muted tertiary copy and meta captions in dark mode' },
        inverse:   { $value: '#020617', $type: 'color', $description: 'Inverse text for light accents in dark mode' }
      }
    }
  },
  spacing: {
    '0':  { $value: '0px',   $type: 'dimension', px: 0,   rem: '0rem',   $description: 'Reset spacing' },
    '1':  { $value: '4px',   $type: 'dimension', px: 4,   rem: '0.25rem', $description: 'Base-4 micro step: icon-label gap, tag padding' },
    '2':  { $value: '8px',   $type: 'dimension', px: 8,   rem: '0.5rem',  $description: 'Base-8 grid step: button padding, compact gap' },
    '3':  { $value: '12px',  $type: 'dimension', px: 12,  rem: '0.75rem', $description: 'Input vertical padding, compact card separation' },
    '4':  { $value: '16px',  $type: 'dimension', px: 16,  rem: '1rem',    $description: 'Default container padding, grid column gutter' },
    '5':  { $value: '20px',  $type: 'dimension', px: 20,  rem: '1.25rem', $description: 'Relaxed card padding, list item separation' },
    '6':  { $value: '24px',  $type: 'dimension', px: 24,  rem: '1.5rem',  $description: 'Dashboard section gutter, widget margin' },
    '8':  { $value: '32px',  $type: 'dimension', px: 32,  rem: '2rem',    $description: 'Modal dialog padding, page column gap' },
    '10': { $value: '40px',  $type: 'dimension', px: 40,  rem: '2.5rem',  $description: 'Large section separation, hero card gap' },
    '12': { $value: '48px',  $type: 'dimension', px: 48,  rem: '3rem',    $description: 'Standard mobile touch target minimum dimension (48x48)' },
    '16': { $value: '64px',  $type: 'dimension', px: 64,  rem: '4rem',    $description: 'Major page section division' },
    '20': { $value: '80px',  $type: 'dimension', px: 80,  rem: '5rem',    $description: 'Hero section vertical breathing room' },
    '24': { $value: '96px',  $type: 'dimension', px: 96,  rem: '6rem',    $description: 'Landing page banner margin' },
    '32': { $value: '128px', $type: 'dimension', px: 128, rem: '8rem',    $description: 'Extreme hero spacing, splash screen separation' }
  },
  typography: {
    fontFamily: {
      sans:  {
        $value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        $type: 'fontFamily',
        $description: 'Primary interface typeface family'
      },
      serif: {
        $value: '"Playfair Display", Merriweather, Georgia, Cambria, serif',
        $type: 'fontFamily',
        $description: 'Editorial and display headline typeface family'
      },
      mono:  {
        $value: '"JetBrains Mono", "Fira Code", Menlo, Monaco, monospace',
        $type: 'fontFamily',
        $description: 'Technical code and mathematical data typeface family'
      }
    },
    fontWeight: {
      regular:  { $value: 400, $type: 'fontWeight', $description: 'Regular body weight' },
      medium:   { $value: 500, $type: 'fontWeight', $description: 'Medium weight for badges and buttons' },
      semibold: { $value: 600, $type: 'fontWeight', $description: 'Semibold weight for section titles' },
      bold:     { $value: 700, $type: 'fontWeight', $description: 'Bold weight for primary page headlines' }
    },
    scale: {
      'xs':   { $value: '12px', fontSize: '12px', lineHeight: '16px', letterSpacing: '+0.01em', px: 12, $type: 'typography', $description: 'Micro badges, timestamps, captions' },
      'sm':   { $value: '14px', fontSize: '14px', lineHeight: '20px', letterSpacing: '0em',     px: 14, $type: 'typography', $description: 'Form labels, secondary copy' },
      'base': { $value: '16px', fontSize: '16px', lineHeight: '24px', letterSpacing: '0em',     px: 16, $type: 'typography', $description: 'Default body copy, standard inputs' },
      'lg':   { $value: '18px', fontSize: '18px', lineHeight: '28px', letterSpacing: '-0.01em', px: 18, $type: 'typography', $description: 'Lead body copy, card titles' },
      'xl':   { $value: '20px', fontSize: '20px', lineHeight: '28px', letterSpacing: '-0.01em', px: 20, $type: 'typography', $description: 'Subsections, modal dialog titles' },
      '2xl':  { $value: '24px', fontSize: '24px', lineHeight: '32px', letterSpacing: '-0.02em', px: 24, $type: 'typography', $description: 'Section H3 headers' },
      '3xl':  { $value: '30px', fontSize: '30px', lineHeight: '36px', letterSpacing: '-0.02em', px: 30, $type: 'typography', $description: 'Section H2 headers' },
      '4xl':  { $value: '36px', fontSize: '36px', lineHeight: '40px', letterSpacing: '-0.025em',px: 36, $type: 'typography', $description: 'Page H1 headlines' },
      '5xl':  { $value: '48px', fontSize: '48px', lineHeight: '48px', letterSpacing: '-0.03em', px: 48, $type: 'typography', $description: 'Marketing hero display titles' },
      '6xl':  { $value: '60px', fontSize: '60px', lineHeight: '60px', letterSpacing: '-0.03em', px: 60, $type: 'typography', $description: 'Remotion video title cards' }
    }
  },
  radii: {
    'none': { $value: '0px',    px: 0,    $type: 'dimension', $description: 'Square corner' },
    'sm':   { $value: '4px',    px: 4,    $type: 'dimension', $description: 'Subtle corner for tags and badges' },
    'md':   { $value: '8px',    px: 8,    $type: 'dimension', $description: 'Default button and input corner' },
    'lg':   { $value: '12px',   px: 12,   $type: 'dimension', $description: 'Card and container corner' },
    'xl':   { $value: '16px',   px: 16,   $type: 'dimension', $description: 'Modal dialog and sheet corner' },
    '2xl':  { $value: '24px',   px: 24,   $type: 'dimension', $description: 'Hero card corner' },
    'full': { $value: '9999px', px: 9999, $type: 'dimension', $description: 'Full pill or circular avatar' }
  },
  elevation: {
    'elevation-1': {
      $value: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
      $type: 'shadow',
      $description: 'Subtle elevation for cards and table row hover states'
    },
    'elevation-2': {
      $value: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
      $type: 'shadow',
      $description: 'Interactive popovers, select dropdown menus'
    },
    'elevation-3': {
      $value: '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.08)',
      $type: 'shadow',
      $description: 'Modal dialogs, sticky navigation headers'
    },
    'elevation-4': {
      $value: '0 20px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)',
      $type: 'shadow',
      $description: 'Floating notifications, contextual drawers'
    },
    'elevation-5': {
      $value: '0 25px 50px -12px rgba(0,0,0,0.22)',
      $type: 'shadow',
      $description: 'High-altitude modal backdrops, floating video overlays'
    }
  },
  motion: {
    spring: {
      springGentle: {
        $value: 'springGentle',
        mass: 1.0,
        damping: 20,
        stiffness: 100,
        dampingRatio: 1.000,
        $type: 'motion',
        $description: 'Silky smooth, critically damped motion with zero overshoot'
      },
      springSnappy: {
        $value: 'springSnappy',
        mass: 0.8,
        damping: 14,
        stiffness: 180,
        dampingRatio: 0.583,
        $type: 'motion',
        $description: 'Fast tactile response for UI buttons and toggles'
      },
      springBouncy: {
        $value: 'springBouncy',
        mass: 1.2,
        damping: 10,
        stiffness: 140,
        dampingRatio: 0.386,
        $type: 'motion',
        $description: 'Playful elastic oscillation for celebratory badges'
      },
      springStiff: {
        $value: 'springStiff',
        mass: 0.5,
        damping: 20,
        stiffness: 260,
        dampingRatio: 0.877,
        $type: 'motion',
        $description: 'Crisp rapid transitions for accordion expansions'
      },
      springHeavy: {
        $value: 'springHeavy',
        mass: 2.0,
        damping: 30,
        stiffness: 120,
        dampingRatio: 0.968,
        $type: 'motion',
        $description: 'Cinematic inertial weight for full-screen titles'
      },
      snappy: {
        $value: 'snappy',
        mass: 0.5,
        damping: 15,
        stiffness: 200,
        dampingRatio: 0.75,
        $type: 'motion',
        $description: 'Fast responsive tactile spring preset matching motion-engine.ts'
      },
      smooth: {
        $value: 'smooth',
        mass: 1.0,
        damping: 30,
        stiffness: 100,
        dampingRatio: 1.50,
        $type: 'motion',
        $description: 'Smooth gentle spring preset matching motion-engine.ts'
      },
      bouncy: {
        $value: 'bouncy',
        mass: 0.8,
        damping: 8,
        stiffness: 150,
        dampingRatio: 0.365,
        $type: 'motion',
        $description: 'Bouncy elastic spring preset matching motion-engine.ts'
      },
      heavy: {
        $value: 'heavy',
        mass: 2.0,
        damping: 40,
        stiffness: 300,
        dampingRatio: 0.816,
        $type: 'motion',
        $description: 'Heavy inertial spring preset matching motion-engine.ts'
      }
    },
    transition: {
      duration: {
        instant:    { $value: '50ms',  ms: 50,  $type: 'duration', $description: 'Instantaneous toggle feedback' },
        fast:       { $value: '150ms', ms: 150, $type: 'duration', $description: 'Hover state transitions and small tooltips' },
        normal:     { $value: '250ms', ms: 250, $type: 'duration', $description: 'Standard modal and dropdown expansions' },
        slow:       { $value: '400ms', ms: 400, $type: 'duration', $description: 'Page transitions and large sheet animations' },
        deliberate: { $value: '600ms', ms: 600, $type: 'duration', $description: 'Complex multi-step choreographies' }
      },
      easing: {
        easeOut:    { $value: 'cubic-bezier(0.16, 1, 0.3, 1)',    $type: 'cubicBezier', $description: 'Decelerates naturally into rest position' },
        easeInOut:  { $value: 'cubic-bezier(0.65, 0, 0.35, 1)',   $type: 'cubicBezier', $description: 'Balanced acceleration and deceleration' },
        easeIn:     { $value: 'cubic-bezier(0.32, 0, 0.67, 0)',   $type: 'cubicBezier', $description: 'Accelerates cleanly off-screen during exits' },
        spring:     { $value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', $type: 'cubicBezier', $description: 'CSS curve approximating spring overshoot' }
      }
    }
  }
} as const;

// ----------------------------------------------------------------------------
// 3. Derived Types
// ----------------------------------------------------------------------------

export type DesignTokens = typeof tokens;
export type ColorTokens = typeof tokens.color;
export type NeutralPalette = typeof tokens.color.slate;
export type BrandPalette = typeof tokens.color.brand;
export type SecondaryPalette = typeof tokens.color.teal;
export type AccentPalette = typeof tokens.color.rose;
export type SemanticStatusTokens = typeof tokens.color.semantic;
export type SurfaceTokens = typeof tokens.color.surface;
export type TextTokens = typeof tokens.color.text;

export type SpacingTokens = typeof tokens.spacing;
export type SpacingStep = keyof typeof tokens.spacing;

export type TypographyTokens = typeof tokens.typography;
export type TypographyScaleStep = keyof typeof tokens.typography.scale;

export type RadiiTokens = typeof tokens.radii;
export type RadiusStep = keyof typeof tokens.radii;

export type ElevationTokens = typeof tokens.elevation;
export type ElevationLevel = keyof typeof tokens.elevation;

export type MotionTokens = typeof tokens.motion;
export type SpringPresetName = keyof typeof tokens.motion.spring;
export type DurationStep = keyof typeof tokens.motion.transition.duration;
export type EasingStep = keyof typeof tokens.motion.transition.easing;

// ----------------------------------------------------------------------------
// 4. Pure Zero-Dependency Helper Utilities
// ----------------------------------------------------------------------------

/**
 * De-compands an sRGB 8-bit channel to linear photometric light output.
 * Accepts an 8-bit integer channel (0 to 255).
 */
export function sRGBtoLin(c: number): number {
  if (typeof c !== 'number' || isNaN(c)) {
    throw new TypeError(`Expected number for color channel, received ${typeof c}`);
  }
  const clamped = Math.max(0, Math.min(255, c));
  const norm = clamped / 255.0;
  if (norm <= 0.04045) {
    return norm / 12.92;
  }
  return Math.pow((norm + 0.055) / 1.055, 2.4);
}

/** Alias for sRGBtoLin */
export const sRGBToLinear = sRGBtoLin;

export interface RGBChannels {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/**
 * Parses a 3-digit or 6-digit hex string into integer RGB components.
 */
export function parseHex(hex: string): RGBChannels {
  if (typeof hex !== 'string') {
    throw new TypeError(`Expected hex string, received ${typeof hex}`);
  }
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color string: "${hex}"`);
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

/**
 * Calculates WCAG 2.1 relative luminance according to ITU-R BT.709.
 * L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const rLin = sRGBtoLin(r);
  const gLin = sRGBtoLin(g);
  const bLin = sRGBtoLin(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Computes the WCAG 2.1 contrast ratio between two hex colors:
 * CR = (L_lighter + 0.05) / (L_darker + 0.05)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface WcagComplianceResult {
  readonly ratio: number;
  readonly passAA: boolean;
  readonly passAAA: boolean;
  readonly isLarge: boolean;
}

/**
 * Checks whether a foreground/background hex color pair satisfies WCAG 2.1 standards.
 */
export function isWCAGCompliant(
  fgHex: string,
  bgHex: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(fgHex, bgHex);
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
  }
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Evaluates WCAG compliance and returns detailed status.
 */
export function evaluateWcagCompliance(
  ratioOrFg: number | string,
  bgOrSize?: string | 'normal' | 'large',
  isLargeText?: boolean
): WcagComplianceResult {
  let ratio: number;
  let isLarge = false;

  if (typeof ratioOrFg === 'number') {
    ratio = ratioOrFg;
    isLarge = bgOrSize === 'large';
  } else {
    if (typeof bgOrSize !== 'string') {
      throw new TypeError('Expected background hex string when first parameter is a color string');
    }
    ratio = getContrastRatio(ratioOrFg, bgOrSize);
    isLarge = Boolean(isLargeText);
  }

  const aaMin = isLarge ? 3.0 : 4.5;
  const aaaMin = isLarge ? 4.5 : 7.0;

  return {
    ratio: Number(ratio.toFixed(2)),
    passAA: ratio >= aaMin,
    passAAA: ratio >= aaaMin,
    isLarge
  };
}

export interface RemotionSpringConfig {
  readonly mass: number;
  readonly damping: number;
  readonly stiffness: number;
  readonly dampingRatio: number;
}

/**
 * Retrieves Remotion harmonic spring physics configuration for a given preset.
 */
export function getRemotionSpring(preset: keyof typeof tokens.motion.spring): RemotionSpringConfig {
  const s = tokens.motion.spring[preset];
  return {
    mass: s.mass,
    damping: s.damping,
    stiffness: s.stiffness,
    dampingRatio: s.dampingRatio,
  };
}

/** Alias for getRemotionSpring */
export const getRemotionSpringConfig = getRemotionSpring;

/**
 * Retrieves the pixel value for a spacing scale step.
 */
export function getSpacing(step: keyof typeof tokens.spacing): number {
  return tokens.spacing[step].px;
}

/**
 * Converts rem string (e.g. "1.5rem") to integer pixels based on root base font size.
 */
export function remToPx(rem: string, baseFontSize: number = 16): number {
  if (typeof rem !== 'string') {
    throw new TypeError(`Expected string, received ${typeof rem}`);
  }
  const val = parseFloat(rem.replace('rem', ''));
  if (isNaN(val)) {
    throw new Error(`Invalid rem string: "${rem}"`);
  }
  return val * baseFontSize;
}

/**
 * Converts pixel number to rem string.
 */
export function pxToRem(px: number, baseFontSize: number = 16): string {
  if (typeof px !== 'number' || isNaN(px)) {
    throw new TypeError(`Expected number, received ${typeof px}`);
  }
  return `${px / baseFontSize}rem`;
}

/**
 * Generates flat CSS custom properties from design tokens for root stylesheets.
 */
export function generateCSSVariables(): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [step, obj] of Object.entries(tokens.color.slate)) {
    vars[`--color-slate-${step}`] = obj.$value;
  }
  for (const [step, obj] of Object.entries(tokens.color.brand)) {
    vars[`--color-brand-${step}`] = obj.$value;
  }
  for (const [step, obj] of Object.entries(tokens.color.teal)) {
    vars[`--color-teal-${step}`] = obj.$value;
  }
  for (const [step, obj] of Object.entries(tokens.color.rose)) {
    vars[`--color-rose-${step}`] = obj.$value;
  }
  for (const [state, roles] of Object.entries(tokens.color.semantic)) {
    for (const [role, obj] of Object.entries(roles)) {
      vars[`--color-semantic-${state}-${role}`] = obj.$value;
    }
  }
  for (const [mode, surfaces] of Object.entries(tokens.color.surface)) {
    for (const [name, obj] of Object.entries(surfaces)) {
      vars[`--color-surface-${mode}-${name}`] = obj.$value;
    }
  }
  for (const [mode, texts] of Object.entries(tokens.color.text)) {
    for (const [name, obj] of Object.entries(texts)) {
      vars[`--color-text-${mode}-${name}`] = obj.$value;
    }
  }
  for (const [step, obj] of Object.entries(tokens.spacing)) {
    vars[`--spacing-${step}`] = obj.$value;
  }
  for (const [step, obj] of Object.entries(tokens.radii)) {
    vars[`--radius-${step}`] = obj.$value;
  }
  for (const [step, obj] of Object.entries(tokens.elevation)) {
    vars[`--shadow-${step}`] = obj.$value;
  }
  for (const [name, obj] of Object.entries(tokens.typography.scale)) {
    vars[`--font-size-${name}`] = obj.fontSize;
    vars[`--line-height-${name}`] = obj.lineHeight;
    vars[`--letter-spacing-${name}`] = obj.letterSpacing;
  }

  return vars;
}

// CommonJS compatibility bridge
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tokens,
    sRGBtoLin,
    sRGBToLinear,
    parseHex,
    getRelativeLuminance,
    getContrastRatio,
    isWCAGCompliant,
    evaluateWcagCompliance,
    getRemotionSpring,
    getRemotionSpringConfig,
    getSpacing,
    remToPx,
    pxToRem,
    generateCSSVariables,
  };
}
