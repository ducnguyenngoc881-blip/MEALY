import React from 'react';

export interface MealyLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Mealy Brand Logo Mark (Concept: Harmonic Rice Bowl & "M" Steam Monogram)
 * An authentic ceramic Vietnamese rice bowl with rising steam curls that fluidly
 * form the letter "M" (Mealy / Mê Ly / Mâm Cơm), accented with an organic emerald herb tip.
 */
export const MealyLogoMark: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 160 160" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
    data-brand="Mealy"
  >
    <defs>
      <linearGradient id="mealy-logo-emerald" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>

    {/* Ceramic Bowl Body - Minimalist silhouette */}
    <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      {/* Bowl Rim */}
      <line x1="24" y1="96" x2="136" y2="96" />
      {/* Bowl Body Arc */}
      <path d="M30 96 C32 132 64 144 80 144 C96 144 128 132 130 96" />
      {/* Foot Ring */}
      <path d="M58 144 L56 152 H104 L102 144" strokeWidth="6" />
    </g>

    {/* Left Steam Curve - Fluid left wing of the "M" */}
    <path 
      d="M48 86 C44 64 64 56 60 38 C58 28 52 22 58 16 C64 24 72 32 68 46 C64 60 76 68 74 86" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Right Steam Curve - Fluid right wing of the "M" with freshness emerald gradient */}
    <path 
      d="M86 86 C84 72 98 66 96 50 C94 38 108 32 104 18 C110 28 116 38 110 54 C106 66 114 74 112 86" 
      stroke="url(#mealy-logo-emerald)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Central Harmony Point - Warm flavor apex */}
    <circle cx="80" cy="50" r="4.5" fill="#059669" />
  </svg>
);

/**
 * Backward compatibility alias
 */
export const MealWiseLogoMark = MealyLogoMark;
export type MealWiseLogoProps = MealyLogoProps;

/**
 * Mealy Full Brand Lockup (Logo Mark + High-End Typography)
 */
export const MealyLogo: React.FC<MealyLogoProps> = ({ 
  className = '', 
  showSubtitle = false 
}) => (
  <div className={`flex items-center gap-2 select-none ${className}`} data-brand="MealWise">
    <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-950 border border-stone-800 dark:border-stone-200 flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105">
      <MealyLogoMark className="w-5 h-5 text-stone-100 dark:text-stone-900" />
    </div>
    <div className="leading-tight">
      <span className="text-[15px] font-black text-stone-950 dark:text-white tracking-tight block whitespace-nowrap">
        MealWise
      </span>
      {showSubtitle && (
        <span className="text-[9px] text-stone-500 dark:text-stone-400 font-extrabold block -mt-0.5 whitespace-nowrap tracking-wide uppercase">
          Mâm Cơm Việt
        </span>
      )}
    </div>
  </div>
);

/**
 * Backward compatibility alias
 */
export const MealWiseLogo = MealyLogo;
