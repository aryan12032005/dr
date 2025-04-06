/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
export default {
  content: [
    "./index.html",
   "./src/**/*.{js,ts,jsx,tsx}",
  ],  
  theme: {
    extend: {
      fontFamily: {
        dancing: ['"Dancing Script"', 'cursive'],
        patrick: ['"Patrick Hand"', 'cursive'],
        indie: ['"Indie Flower"', 'cursive'],
        kalam: ['"Kalam"', 'cursive'],
        shadows: ['"Shadows Into Light"', 'cursive'],
        sacramento: ['"Sacramento"', 'cursive'],
        reenie: ['"Reenie Beanie"', 'cursive'],
      },
      textShadow: {
        sm: '1px 1px 2px rgba(0, 0, 0, 0.25)',
        lg: '3px 3px 6px rgba(0, 0, 0, 0.35)',
        md: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [
    require('tailwindcss-textshadow')
  ],
}


