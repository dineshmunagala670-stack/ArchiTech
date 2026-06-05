/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-bg': '#f0f2f5',
        'accent-blue': '#007aff',
        'accent-green': '#34c759',
        'accent-orange': '#ff9500',
      },
    },
  },
  plugins: [],
}
