/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E56',
          light: '#1a8a6e',
          dark: '#0a4f3d',
        },
        accent: {
          DEFAULT: '#EF9F27',
          light: '#f5b84d',
          dark: '#d4890f',
        },
        background: '#FAFAF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
