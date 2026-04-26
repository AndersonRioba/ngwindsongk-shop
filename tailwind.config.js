import { addDynamicIconSelectors } from "@iconify/tailwind";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: "#6D31EDFF",
        'primary-dark': "#5b26c7",
        secondary: "#15ABFFFF",
        tertiary: "",
        oats: "#f97316",
        nanacare: "#1877F2",
        nutmill: "#FFFFFF",
        Success: '#288747',
        Warning: 'rgba(220, 156, 34, 1)',
        Error: 'rgba(220, 34, 34, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
    }
  },
  plugins: [
    addDynamicIconSelectors(),
  ],
};

export default config;
