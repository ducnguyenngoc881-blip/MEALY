/**
 * WCAG 2.1 Luminance & Contrast Ratio Calculation Helpers
 * Implements authoritative mathematical formula for color contrast accessibility.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function parseHexColor(hex: string): RGB {
  let cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) {
    throw new Error(`Invalid hex color string: "${hex}"`);
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calculate relative luminance according to WCAG 2.1 specs
 */
export function getRelativeLuminance(rgb: RGB): number {
  const normalize = (channel: number) => {
    const sRGB = channel / 255;
    return sRGB <= 0.04045
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };

  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two hex colors: (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = parseHexColor(hex1);
  const rgb2 = parseHexColor(hex2);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors pass WCAG AA requirement (>= 4.5:1 for normal text)
 */
export function isWcagAaCompliant(textColorHex: string, bgColorHex: string): boolean {
  return getContrastRatio(textColorHex, bgColorHex) >= 4.5;
}

/**
 * Check if two colors pass WCAG AA requirement for large text / UI elements (>= 3.0:1)
 */
export function isWcagAaLargeCompliant(textColorHex: string, bgColorHex: string): boolean {
  return getContrastRatio(textColorHex, bgColorHex) >= 3.0;
}
