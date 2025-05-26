/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Magra", "sans-serif"],
      },
      colors: {
        primary: "#5C59B6",
        secondary: "#F0F4FF",
      },
    },
  },
  plugins: [],
};
