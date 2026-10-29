/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#2A3656',
          600: '#3A486F',
        },
        teal: {
          500: '#00A896',
          600: '#028090',
        }
      }
    },
  },
  plugins: [],
}
