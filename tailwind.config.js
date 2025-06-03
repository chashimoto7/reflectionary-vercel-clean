/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          pink: '#c91e51',
          orange: '#f15d22',
          yellow: '#f6b12f',
          green: '#7bb348',
          purple: '#7e2f8e',
        },
      },
    },
  },
  plugins: [],
};

