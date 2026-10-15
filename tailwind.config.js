/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        18: '4.5rem',
      },
      colors: {
        // Exia Repair III Flat Matte System (60-30-10)
        exia: {
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
            light: '#1E293B',
            dark: '#F8FAFC',
            mutedLight: '#64748B',
            mutedDark: '#94A3B8',
          },
          cobalt: {
            DEFAULT: '#1D4ED8',
            hover: '#2563EB',
            light: '#EFF6FF',
            dark: '#1E3A8A',
          },
          emerald: {
            DEFAULT: '#10B981',
            dark: '#059669',
          },
          amber: {
            DEFAULT: '#EAB308',
            dark: '#F59E0B',
          },
          monza: {
            DEFAULT: '#DC2626',
            dark: '#E11D48',
          },
        },
        ceramic: {
          50: '#F8FAFC',  // Exia Cool White Canvas (60%)
          100: '#F1F5F9', // Exia Slate Sub-surface
          200: '#E2E8F0', // Exia Flat Border
          300: '#CBD5E1',
          400: '#94A3B8',
        },
        umber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        hearth: {
          950: '#12161F', // Exia Dark Canvas (60%)
          900: '#1A202C', // Exia Dark Card
          800: '#2D3748', // Exia Dark Border
          700: '#475569',
        },
        stone: {
          750: '#2D3748', // Flat Dark Border / Sub-card
          850: '#1A202C', // Flat Dark Card
        },
        slate: {
          750: '#2D3748', // Flat Dark Border / Sub-card
          850: '#1A202C', // Flat Dark Card
        },
        herbal: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A', // Fresh Basil / Garden Produce
          700: '#15803D',
        },
        cream: {
          50: '#FDFBF9',
          100: '#FAF7F2',
          200: '#F3ECE1',
        },
        sage: {
          50: '#F2F8F5',
          100: '#E8F5EE',
          200: '#C7E6D7',
          500: '#1E6B47',
          600: '#175437',
          700: '#113E29',
        },
        terracotta: {
          50: '#FEF6F3',
          100: '#FDEEE9',
          200: '#F9D5CA',
          500: '#E05A36',
          600: '#C44725',
          700: '#9C3418',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        }
      },
      boxShadow: {
        'dribbble': '0 20px 40px -15px rgba(0, 0, 0, 0.06)',
        'float': '0 12px 28px -8px rgba(30, 107, 71, 0.12)',
        'soft': '0 8px 24px -4px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
