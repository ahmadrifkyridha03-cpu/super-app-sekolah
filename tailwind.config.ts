import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#627D98",
          500: "#486581",
          600: "#334E68",
          700: "#243B53",
          800: "#1B3B5A",
          900: "#0F2942",
          950: "#0A1C2E",
        },
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        primary: {
          DEFAULT: "#0F2942",
          hover: "#1B3B5A",
          active: "#0A1C2E",
          surface: "#F0F4F8",
          border: "#D9E2EC",
        },
        accent: {
          DEFAULT: "#D97706",
          hover: "#B45309",
          surface: "#FFFBEB",
          border: "#FDE68A",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 41, 66, 0.08), 0 1px 2px rgba(15, 41, 66, 0.04)",
        dropdown: "0 10px 15px -3px rgba(15, 41, 66, 0.1), 0 4px 6px -2px rgba(15, 41, 66, 0.05)",
        modal: "0 25px 50px -12px rgba(15, 41, 66, 0.25)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
