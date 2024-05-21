/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        content: ["Krona One", "sans-serif"]
      },
      colors: {
        bg: "#F6F4F0"
      }
    }
  },
  plugins: []
};