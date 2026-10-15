/**
 * MealWise Offline Image Fallback Generator
 * Generates beautiful, lightweight inline SVG data URIs for dishes
 * when the device is completely offline (Airplane mode, no Wi-Fi/4G).
 */

const PALETTES = [
  { bg1: '#064e3b', bg2: '#047857', accent: '#34d399', iconColor: '#a7f3d0' }, // Emerald / Rau xanh
  { bg1: '#7c2d12', bg2: '#b45309', accent: '#fbbf24', iconColor: '#fef3c7' }, // Amber / Món kho, nướng
  { bg1: '#831843', bg2: '#be185d', accent: '#f472b6', iconColor: '#fce7f3' }, // Rose / Món xào, thịt
  { bg1: '#1e3a8a', bg2: '#1d4ed8', accent: '#60a5fa', iconColor: '#dbeafe' }, // Blue / Hải sản, canh
  { bg1: '#4c1d95', bg2: '#6d28d9', accent: '#a78bfa', iconColor: '#ede9fe' }, // Purple / Lẩu, tráng miệng
];

export function getOfflineFoodPlaceholder(title: string, category: string = 'Món Ngon'): string {
  // Deterministic color palette based on title string hash
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % PALETTES.length;
  const p = PALETTES[paletteIndex];

  // Truncate title if long
  const cleanTitle = title.replace(/"/g, '&quot;').slice(0, 32);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%">
  <defs>
    <linearGradient id="g_${paletteIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="100%" stop-color="${p.bg2}" />
    </linearGradient>
    <radialGradient id="r_${paletteIndex}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${p.bg1}" stop-opacity="0" />
    </radialGradient>
  </defs>
  
  <rect width="400" height="280" fill="url(#g_${paletteIndex})" />
  <rect width="400" height="280" fill="url(#r_${paletteIndex})" />
  
  <!-- Subtle decorative rings -->
  <circle cx="200" cy="115" r="75" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="6,6" />
  <circle cx="200" cy="115" r="60" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.4" />
  
  <!-- Cloche / Food Dome Icon -->
  <g transform="translate(170, 85)" fill="none" stroke="${p.iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 0,35 Q 30,5 60,35 Z" fill="${p.accent}" fill-opacity="0.2" />
    <path d="M -5,35 L 65,35" />
    <circle cx="30" cy="3" r="4" fill="${p.iconColor}" />
    <path d="M 15,22 Q 30,14 45,22" stroke-width="2" stroke-opacity="0.6" />
  </g>
  
  <!-- Badge -->
  <rect x="20" y="20" rx="8" ry="8" width="90" height="24" fill="#020617" fill-opacity="0.6" stroke="${p.accent}" stroke-opacity="0.4" stroke-width="1"/>
  <text x="65" y="36" fill="${p.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="0.5">MEALWISE</text>
  
  <!-- Title text -->
  <text x="200" y="210" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="800" text-anchor="middle">
    ${cleanTitle}
  </text>
  <text x="200" y="235" fill="${p.iconColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" text-anchor="middle" opacity="0.85">
    ${category} • Chế độ Ngoại Tuyến
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
