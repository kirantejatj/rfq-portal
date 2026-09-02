/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0056b3',
          600: '#004494',
          700: '#003375',
          800: '#0a2540',
          900: '#061727',
        },
        gold: {
          500: '#d97706',
          600: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
