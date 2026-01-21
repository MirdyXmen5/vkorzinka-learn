/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#7ed44f',
          DEFAULT: '#5cad2d',
          dark: '#4a8c24',
        },
        'brand': '#fffeff',
        'brand-text': '#000000',
      }
    },
  },
  plugins: [],
}
