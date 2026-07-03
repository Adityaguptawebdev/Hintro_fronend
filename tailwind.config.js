/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f54900',
        secondary: {
          DEFAULT: 'oklch(0.274 0.006 286.033)',
        },
        destructive: {
          DEFAULT: '#ff6467',
        },
        border: 'oklch(1 0 0 / 0.1)',
        card: {
          DEFAULT: 'oklch(0.21 0.006 285.885)',
          foreground: '#fafafa',
        },
        background: '#09090b',
        foreground: '#fafafa',
        muted: {
          DEFAULT: 'oklch(0.274 0.006 286.033)',
          foreground: '#9f9fa9',
        },
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '30': '7.5rem',
        '45': '11.25rem',
        '75': '18.75rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '239': '59.75rem',
        '285': '71.25rem',
      },
      borderWidth: {
        '1': '1px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
