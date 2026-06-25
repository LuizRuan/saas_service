import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          dark: '#102A43',
          light: '#2E5490',
          50: '#EBF0F7',
          100: '#D0DFED',
          200: '#A8C3DE',
          300: '#7FA7CF',
          400: '#4E7EB5',
          500: '#1E3A5F',
          600: '#152B47',
        },
        success: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#4ADE80',
          50: '#F0FDF4',
        },
        warning: '#F97316',
        danger: '#EF4444',
        muted: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'premium': '0 20px 40px -12px rgb(30 58 95 / 0.15)',
        'glow': '0 0 40px -10px rgb(34 197 94 / 0.3)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #102A43 0%, #1E3A5F 40%, #2E5490 100%)',
        'gradient-hero': 'linear-gradient(160deg, #0D2137 0%, #1E3A5F 35%, #2E5490 70%, #3B6BAA 100%)',
        'gradient-cta': 'linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
