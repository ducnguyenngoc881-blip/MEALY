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
        ceramic: {
          50: '#FAF8F5',  // Warm Jasmine Rice Canvas (60%)
          100: '#F5F1EB', // Soft Oatmeal / Dough
          200: '#EBE5DC', // Soft Ceramic Border
          300: '#DDD4C7',
          400: '#C8BEAD',
        },
        umber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706', // Golden Saffron & Caramel Glaze (10% Accent)
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        hearth: {
          950: '#121110', // Deep Cast Iron / Clay Pot Canvas
          900: '#1C1A18', // Elevated Hearth Card
          800: '#292524', // Hearth Border
          700: '#44403C',
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
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
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
