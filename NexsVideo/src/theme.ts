// theme.ts — Single source of truth for Remotion motion graphics & visual identity.
// NEVER hardcode inline hex colors, unconfigured springs, or linear easings.
import { Easing } from 'remotion';

export const theme = {
  colors: {
    bg: '#0A0A0F',
    bgAlt: '#12121A',
    surface: '#1A1A24',
    primary: '#7C3AED', // Hero accent color
    primaryGlow: 'rgba(124, 58, 237, 0.45)',
    accent: '#06B6D4',  // Cyan secondary accent
    accentGlow: 'rgba(6, 182, 212, 0.35)',
    gold: '#F59E0B',
    success: '#10B981',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  fonts: {
    display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),      // easeOutExpo — default entrances
    inOut: Easing.bezier(0.83, 0, 0.17, 1),   // easeInOutQuint — slides & moves
    in: Easing.bezier(0.7, 0, 0.84, 0),       // exits only (faster)
    smooth: Easing.bezier(0.25, 0.1, 0.25, 1),// standard smooth
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },  // UI elements, cards, words
    smooth: { damping: 20, stiffness: 90, mass: 1 },     // Big hero containers, panels
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },   // Badges, icons, logo pops
    stiff: { damping: 26, stiffness: 220, mass: 0.8 },    // Exact precision slides
  },
} as const;

export type Theme = typeof theme;
