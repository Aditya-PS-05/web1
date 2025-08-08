import tailwindAnimate from "tailwindcss-animate";
import tailwindTypography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{jsx,tsx}"],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [tailwindAnimate, tailwindTypography],
};