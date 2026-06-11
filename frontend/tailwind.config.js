/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C6CFF',
        secondary: '#A0A0B2',
        accent: '#7C6CFF',
        background: '#0B0B0F',
        surface: '#14141B',
        text: '#ECECF1',
        textSecondary: '#9A9AA8',
        border: '#26262F',
        success: '#3FB67E',
        warning: '#E0A23C',
        error: '#F0606B'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
