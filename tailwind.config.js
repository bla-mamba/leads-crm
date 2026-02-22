/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00f0ff',
        'neon-green': '#00e676',
        'surface-dark': '#0a0e17',
        'surface-card': '#0d1320',
        'surface-elevated': '#111827',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'glow-line': 'glow-line 2s ease-in-out infinite',
        'border-flow': 'border-flow 4s ease infinite',
        'neon-flicker': 'neon-flicker 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
