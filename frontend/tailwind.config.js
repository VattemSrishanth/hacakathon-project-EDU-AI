/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F5B52', // Evergreen
        secondary: '#B77B45', // Warm clay
        'ai-accent': '#397A78', // Mineral teal
      },
      boxShadow: {
        'inst': '0 1px 2px rgba(24, 43, 40, 0.04), 0 8px 24px rgba(24, 43, 40, 0.035)',
      },
    },
  },
  plugins: [],
}
