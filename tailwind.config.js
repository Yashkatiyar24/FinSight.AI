/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-dark-bg': '#0a0e1a',
        'neo-panel': '#0f1218',
        'neo-panel-light': '#141925',
        'neo-blue': '#2bd1ff',
        'neo-purple': '#7a5cff',
        'neo-gold': '#ffd700',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
