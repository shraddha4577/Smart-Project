/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060a14',
          900: '#0a0f1d',
          850: '#0e1628',
          800: '#131e36',
          750: '#192644',
          700: '#1f2e52',
          600: '#2d406e',
          500: '#3d568f',
        },
        cyber: {
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -2px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 15px -2px rgba(139, 92, 246, 0.4)',
        'glow-green': '0 0 15px -2px rgba(16, 185, 129, 0.4)',
        'glow-red': '0 0 15px -2px rgba(239, 68, 68, 0.4)',
        'glow-yellow': '0 0 15px -2px rgba(245, 158, 11, 0.4)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
