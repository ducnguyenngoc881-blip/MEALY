/**
 * MealWise Centralized Design Tokens (Exia Repair III 60-30-10 Flat Matte System v4.0)
 * Strictly zero metallic coloring, chrome gradients, or shiny textures.
 */

export const theme = {
  colors: {
    // 60% Dominant Base Surfaces (Clean Matte White & Flat Neutral Gray)
    canvas: {
      light: '#F8FAFC',
      dark: '#12161F',
    },
    card: {
      light: '#FFFFFF',
      dark: '#1A202C',
    },
    subcard: {
      light: '#F8FAFC',
      dark: '#141824',
    },
    border: {
      light: '#E2E8F0',
      dark: '#2D3748',
    },
    text: {
      headingLight: '#0F172A',
      primaryLight: '#1E293B',
      primaryDark: '#F8FAFC',
      secondaryLight: '#64748B',
      secondaryDark: '#94A3B8',
    },

    // 30% Secondary Brand Identity (Flat Cobalt & Sky Blue)
    brand: {
      cobalt: '#1D4ED8',
      cobaltHover: '#2563EB',
      skyLight: '#EFF6FF',
      skyDarkTint: 'rgba(30, 58, 138, 0.30)',
    },

    // 10% Semantic Accents (Emerald Green, Amber Yellow, Monza Red) & Culinary Tokens
    accents: {
      emerald: '#10B981',
      emeraldDark: '#059669',
      amber: '#EAB308',
      amberDark: '#F59E0B',
      monza: '#DC2626',
      monzaDark: '#E11D48',
      chiliRose: '#E11D48',
      turmericGold: '#D97706',
      clayEarth: '#78350F',
    },
  },
  typography: {
    fontSans: "'Manrope', 'Inter', 'Be Vietnam Pro', system-ui, -apple-system, sans-serif",
    fontHeading: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
    fontBody: "'Inter', system-ui, -apple-system, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    hierarchy: {
      displayHero: { size: '24px', rem: '1.50rem', weight: 900, lineHeight: 1.2, tracking: '-0.025em', tw: 'text-2xl font-black tracking-tight' },
      screenTitle: { size: '20px', rem: '1.25rem', weight: 900, lineHeight: 1.25, tracking: '-0.020em', tw: 'text-lg sm:text-xl font-black tracking-tight' },
      cardTitle: { size: '17px', rem: '1.0625rem', weight: 800, lineHeight: 1.3, tracking: '-0.015em', tw: 'text-base sm:text-lg font-extrabold truncate' },
      sectionHeader: { size: '14px', rem: '0.875rem', weight: 800, lineHeight: 1.35, tracking: '-0.010em', tw: 'text-sm font-extrabold' },
      bodyStep: { size: '13.5px', rem: '0.84rem', weight: 500, lineHeight: 1.5, tracking: '0em', tw: 'text-xs sm:text-sm font-medium leading-relaxed' },
      chipPill: { size: '12px', rem: '0.75rem', weight: 700, lineHeight: 1.2, tracking: '0.010em', tw: 'text-xs font-bold whitespace-nowrap shrink-0' },
      microBadge: { size: '10.5px', rem: '0.65rem', weight: 800, lineHeight: 1.1, tracking: '0.040em', tw: 'text-[10px] sm:text-[11px] font-black uppercase' },
    },
  },
  radii: {
    // 6-Tier Corner Radius (round) Hierarchy & Concentric Formula: R_outer = R_inner + Padding
    xs: { px: 8, rem: '0.50rem', tw: 'rounded-lg', usage: 'Micro badges, 28x28 action buttons, inner progress bars' },
    sm: { px: 12, rem: '0.75rem', tw: 'rounded-xl', usage: 'Inputs, search bars, secondary buttons, nested inner cards (20px outer - 8px pad)' },
    md: { px: 16, rem: '1.00rem', tw: 'rounded-2xl', usage: 'Fridge compartment tiles, ingredient cards, primary full-width CTAs' },
    lg: { px: 20, rem: '1.25rem', tw: 'rounded-[20px]', usage: 'Featured aspect-video recipe cards, floating 5-tab bottom dock' },
    xl: { px: 24, rem: '1.50rem', tw: 'rounded-3xl', usage: 'Bottom sheets, confirmation modals, full-screen onboarding cards' },
    pill: { px: 9999, rem: '9999px', tw: 'rounded-full', usage: '1-Tap horizontal spice chips, category filter pills, voice note badges' },
  },
  spacing: {
    baseUnitPx: 4,
    scalePx: [4, 8, 12, 16, 20, 24, 32],
    minTapTargetPx: 44,
    minTapGapPx: 8,
  },
  elevation: {
    darkCard: 'none',
    lightCard: '0 4px 14px -2px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.02)',
    floatingDock: '0 12px 28px -6px rgba(15, 23, 42, 0.12)',
  },
  iconGrid: {
    viewBox: '0 0 24 24',
    sizePx: 24,
    liveAreaPx: 20,
    paddingPx: 2,
    strokeWidth: 2.0,
    activeStrokeWidth: 2.25,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    squircleRadiusRatio: 0.225,
  },
  layout: {
    mobileMaxWidth: 'max-w-lg',
    viewportRangePx: [360, 430],
    thumbZones: {
      stretchTopPercent: 25,
      naturalReachMidPercent: 35,
      primaryThumbBottomPercent: 40,
    },
  },
} as const;

export type AppTheme = typeof theme;
