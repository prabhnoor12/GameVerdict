/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' }
      }
    }
  },
  plugins: []
};
