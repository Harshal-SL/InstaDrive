/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6fe',
          100: '#d8e6fb',
          200: '#b3cff8',
          300: '#84aff3',
          400: '#5286ec',
          500: '#3366cc',
          600: '#1a365d',
          700: '#193366',
          800: '#142a53',
          900: '#112244',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d1dbe8',
          300: '#a9bdd4',
          400: '#7997bb',
          500: '#5a7aa1',
          600: '#476185',
          700: '#3b4f6d',
          800: '#34435c',
          900: '#2e3b4e',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out forwards',
        'slideUp': 'slideUp 0.5s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}