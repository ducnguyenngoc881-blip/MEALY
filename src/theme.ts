/**
 * MealWise Centralized Design Tokens (Exia Repair III 60-30-10 Flat Matte System)
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

    // 10% Semantic Accents (Emerald Green, Amber Yellow, Monza Red)
    accents: {
      emerald: '#10B981',
      emeraldDark: '#059669',
      amber: '#EAB308',
      amberDark: '#F59E0B',
      monza: '#DC2626',
      monzaDark: '#E11D48',
    },
  },
  typography: {
    fontSans: "'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  layout: {
    mobileMaxWidth: 'max-w-lg',
  },
} as const;

export type AppTheme = typeof theme;
