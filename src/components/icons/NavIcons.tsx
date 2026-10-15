import React from 'react';

export interface NavIconProps {
  className?: string;
  active?: boolean;
}

/**
 * 1. Hôm Nay (Bát Cơm Nóng):
 * Steaming ceramic rice bowl with rising culinary aroma.
 * Replaces generic crossed fork & knife.
 */
export const RiceBowlNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Subtle duotone active fill */}
    {active && (
      <path
        d="M3.5 12.5C3.5 17.5 7.5 20 12 20C16.5 20 20.5 17.5 20.5 12.5H3.5Z"
        className="fill-stone-400/25 dark:fill-stone-500/25"
      />
    )}
    {/* Bowl Silhouette */}
    <path
      d="M3.5 12.5C3.5 17.5 7.5 20 12 20C16.5 20 20.5 17.5 20.5 12.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bowl Top Lip */}
    <line 
      x1="2.5" 
      y1="12.5" 
      x2="21.5" 
      y2="12.5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    {/* Bowl Foot */}
    <path 
      d="M8.5 20L8 21.5C8 22 8.5 22.5 9 22.5H15C15.5 22.5 16 22 16 21.5L15.5 20" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Steaming Aroma Waves */}
    <path
      d="M8 8.5C7.5 6.5 9.5 5 8.5 3"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M12 9.5C11.5 7 13.5 5.5 12.5 2.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 8.5C15.5 6.5 17.5 5 16.5 3"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 2. Thực Đơn (Bảng Thực Đơn Tuần):
 * Artisanal kitchen menu slate with daily checklist marks.
 * Replaces generic office calendar.
 */
export const WeeklyMenuNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <rect 
        x="4" 
        y="4" 
        width="16" 
        height="17" 
        rx="2.5" 
        className="fill-stone-400/25 dark:fill-stone-500/25" 
      />
    )}
    {/* Board Body */}
    <rect 
      x="4" 
      y="4" 
      width="16" 
      height="17" 
      rx="2.5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Top Wooden/Metal Hanging Clip */}
    <path 
      d="M9 4V3C9 2 10 1.5 12 1.5C14 1.5 15 2 15 3V4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Daily Meal Schedule Rows */}
    <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="17" x2="12.5" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Small Spoon/Spur marker */}
    <circle cx="15.5" cy="17" r="1.25" fill="currentColor" />
  </svg>
);

/**
 * 3. Tiệc (Mâm Tiệc Đậy Nắp Cloche):
 * Grand banquet feast cloche platter.
 * Replaces generic party popper.
 */
export const FeastClocheNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <path 
        d="M3 17C3 9.5 21 9.5 21 17H3Z" 
        className="fill-stone-400/25 dark:fill-stone-500/25" 
      />
    )}
    {/* Cloche Dome */}
    <path 
      d="M3 17C3 9.5 21 9.5 21 17" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Top Brass Handle Knob */}
    <circle cx="12" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="9" x2="12" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Serving Platter Rim */}
    <line x1="1.5" y1="17" x2="22.5" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Platter Base Stand */}
    <path 
      d="M4.5 20H19.5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    {/* Aroma Sparkle Star above */}
    <path 
      d="M12 2V4M11 3H13" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
  </svg>
);

/**
 * 4. Minigame (Vòng Quay Bữa Cơm / Arcade Fortune Wheel):
 * Culinary dice & fortune wheel representing meal recommendations.
 * Replaces generic console gamepad.
 */
export const ArcadeWheelNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <circle cx="12" cy="12" r="9" className="fill-stone-400/25 dark:fill-stone-500/25" />
    )}
    {/* Wheel Outer Rim */}
    <circle 
      cx="12" 
      cy="12" 
      r="9" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    {/* Center Pivot */}
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    {/* 4 Balanced Crosshairs */}
    <line x1="12" y1="3" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="12" y1="16.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="3" y1="12" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="16.5" y1="12" x2="21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    {/* Diagonal Fortune Dots */}
    <circle cx="7" cy="7" r="1" fill="currentColor" />
    <circle cx="17" cy="7" r="1" fill="currentColor" />
    <circle cx="17" cy="17" r="1" fill="currentColor" />
    <circle cx="7" cy="17" r="1" fill="currentColor" />
  </svg>
);

/**
 * 5. Đi Chợ (Làn Đi Chợ Đan Tre):
 * Traditional woven bamboo/rattan market basket.
 * Replaces generic metal supermarket cart.
 */
export const MarketBasketNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <path 
        d="M4.5 11.5L6.5 20C6.7 20.8 7.5 21.5 8.5 21.5H15.5C16.5 21.5 17.3 20.8 17.5 20L19.5 11.5H4.5Z" 
        className="fill-stone-400/25 dark:fill-stone-500/25" 
      />
    )}
    {/* Basket Body */}
    <path 
      d="M4.5 11.5L6.5 20C6.7 20.8 7.5 21.5 8.5 21.5H15.5C16.5 21.5 17.3 20.8 17.5 20L19.5 11.5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Basket Collar Rim */}
    <rect 
      x="3" 
      y="9.5" 
      width="18" 
      height="2.5" 
      rx="1.25" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Arched Bamboo Twin Handles */}
    <path 
      d="M8.5 9.5V6.5C8.5 4.5 10 3 12 3C14 3 15.5 4.5 15.5 6.5V9.5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Woven Cross-Weave Texture */}
    <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="12" y1="12" x2="12" y2="18.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * 6. Tủ Lạnh (Hộc Tủ Tươi Mát):
 * Clean fresh food safe with cooling crystal.
 * Replaces generic refrigerator box.
 */
export const FreshPantryNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <rect 
        x="5" 
        y="2.5" 
        width="14" 
        height="19" 
        rx="3" 
        className="fill-stone-400/25 dark:fill-stone-500/25" 
      />
    )}
    {/* Main Appliance Cabinet */}
    <rect 
      x="5" 
      y="2.5" 
      width="14" 
      height="19" 
      rx="3" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Freezer / Fresh Food Compartment Divider */}
    <line x1="5" y1="9.5" x2="19" y2="9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    {/* Door Handles */}
    <line x1="7.5" y1="5.5" x2="7.5" y2="7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="7.5" y1="12.5" x2="7.5" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Tiny Ice/Freshness Star Indicator */}
    <path 
      d="M15 5.5L15 6.5M14.5 6L15.5 6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
  </svg>
);

/**
 * 7. Tài Khoản (Đầu Bếp Gia Đình):
 * Home chef hat & apron silhouette.
 * Replaces generic user bust.
 */
export const ChefProfileNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <path 
        d="M5 20.5C5 16.5 8 14.5 12 14.5C16 14.5 19 16.5 19 20.5" 
        className="fill-stone-400/25 dark:fill-stone-500/25" 
      />
    )}
    {/* Chef Toque / Hat Puffs */}
    <path 
      d="M7 11.5C5.5 11 5 8.5 6.5 6.5C7.5 5 10 5 11 6C11.5 4.5 13.5 4 14.5 5C15.5 4.5 17.5 5 18 6.5C19 8.5 18 11 17 11.5" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Chef Hat Band */}
    <path 
      d="M7 11.5H17V13.5C17 14 16.5 14.5 16 14.5H8C7.5 14.5 7 14 7 13.5V11.5Z" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Shoulders / Apron Silhouette */}
    <path 
      d="M4.5 21C4.5 17 8 15.5 12 15.5C16 15.5 19.5 17 19.5 21" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);

/**
 * 8. Đi Chợ Chung (Làn Chợ Khóa Đôi):
 * Collaborative shopping basket with secure lock.
 * Replaces generic lock.
 */
export const CollabBasketIcon: React.FC<NavIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Basket */}
    <path 
      d="M4 11L5.5 19C5.7 19.8 6.5 20.5 7.5 20.5H16.5C17.5 20.5 18.3 19.8 18.5 19L20 11" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <rect x="3" y="9" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="1.75" />
    <path d="M8 9V6C8 4.5 9.5 3.5 12 3.5C14.5 3.5 16 4.5 16 6V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Integrated Padlock */}
    <rect x="10" y="13" width="4" height="3.5" rx="0.75" fill="currentColor" />
    <path d="M10.8 13V12C10.8 11.3 11.3 10.8 12 10.8C12.7 10.8 13.2 11.3 13.2 12V13" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/**
 * 9. Xuất Zalo Đi Chợ (Cuộn Giấy Thực Đơn):
 * Grocery shopping scroll with bullet points.
 * Replaces generic copy/export icon.
 */
export const GroceryScrollIcon: React.FC<NavIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Scroll Base */}
    <path 
      d="M6 3C6 2 7 1.5 8.5 1.5H17.5C18.5 1.5 19.5 2.5 19.5 3.5V19.5C19.5 20.8 18.2 22 16.8 22H6.5C5.2 22 4 21 4 19.5C4 18 5 17 6.5 17H17" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Checklist Lines */}
    <line x1="8.5" y1="6" x2="15.5" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="8.5" y1="9.5" x2="15.5" y2="9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="8.5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * 10. Công Thức (Sổ Tay Công Thức Bếp):
 * Artisanal culinary recipe notebook with bookmark ribbon.
 * Replaces generic document book.
 */
export const RecipeBookNavIcon: React.FC<NavIconProps> = ({ className = 'w-5 h-5', active = false }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {active && (
      <path 
        d="M5 4.5C5 3.5 5.8 2.5 7 2.5H19V20.5H7C5.8 20.5 5 19.5 5 18.5V4.5Z" 
        className="fill-stone-400/25 dark:fill-stone-500/25" 
      />
    )}
    {/* Book Cover / Spine */}
    <path 
      d="M5 4.5C5 3.4 5.9 2.5 7 2.5H19V21.5H7C5.9 21.5 5 20.6 5 19.5V4.5Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Book Spine Fold */}
    <path 
      d="M5 18.5C5 17.4 5.9 16.5 7 16.5H19" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Hanging Bookmark Ribbon */}
    <path 
      d="M10 2.5V8.5L12 7L14 8.5V2.5" 
      fill="currentColor" 
      fillOpacity={active ? "0.8" : "0.3"}
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Page Recipe Lines */}
    <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="9" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
