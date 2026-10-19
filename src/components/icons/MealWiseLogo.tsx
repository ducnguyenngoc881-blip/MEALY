import React from 'react';

export interface MealyLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Mealy Brand Logo Mark ("Mê Ly" — Noodle "M" Bowl, Chopsticks & Fresh Leaf)
 * Exact vector recreation of the team's official Mealy logo:
 * - Royal blue chopsticks (#2563EB) & bowl silhouette
 * - White noodle "M" monogram (#FFFFFF) rising over the chopsticks
 * - Fresh emerald green leaf (#10B981) at top right
 */
export const MealyLogoMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    data-brand="Mealy"
  >
    {/* Top-Right Fresh Green Leaf */}
    <path
      d="M 94 38 C 93 21 105 11 121 11 C 122 27 110 38 94 38 Z"
      fill="#10B981"
    />

    {/* Upper Chopstick (Tapered left-to-right, angled slightly downward) */}
    <path
      d="M 24 29 C 21 29 20 38 24 39 L 136 50 C 138 50 138 46 136 45 Z"
      fill="#2563EB"
    />

    {/* Lower Chopstick (Tapered left-to-right, horizontal) */}
    <path
      d="M 22 46 C 19 46 19 56 23 56 L 135 60 C 137 60 137 56 135 55 Z"
      fill="#2563EB"
    />

    {/* Royal Blue Bowl Silhouette with Footed Base */}
    <path
      d="M 27 76 C 27 112 48 132 58 136 L 59 144 C 59 146 61 148 64 148 L 96 148 C 99 148 101 146 101 144 L 102 136 C 112 132 133 112 133 76 L 126 76 C 124 106 105 125 80 125 C 55 125 36 106 34 76 Z"
      fill="#2563EB"
    />

    {/* Dark Navy Outline Separation around Noodle M over Lower Chopstick */}
    <path
      d="M 52 114 L 55 82 C 56 68 70 68 72 82 L 75 104 C 76 112 83 112 84 104 L 90 60 C 92 43 107 43 108 60 L 111 114"
      stroke="#0F172A"
      strokeWidth="18"
      strokeLinecap="square"
      strokeLinejoin="round"
    />

    {/* White Noodle "M" Monogram */}
    <path
      d="M 52 114 L 55 82 C 56 68 70 68 72 82 L 75 104 C 76 112 83 112 84 104 L 90 60 C 92 43 107 43 108 60 L 111 114"
      stroke="#FFFFFF"
      strokeWidth="12.5"
      strokeLinecap="butt"
      strokeLinejoin="round"
    />
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
  <div className={`flex items-center gap-2 select-none ${className}`} data-brand="Mealy">
    <div className="w-8 h-8 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 overflow-hidden">
      <MealyLogoMark className="w-7 h-7" />
    </div>
    <div className="leading-tight">
      <span className="text-[15px] font-black text-stone-950 dark:text-white tracking-tight block whitespace-nowrap">
        Mealy
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
