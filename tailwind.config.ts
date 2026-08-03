import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          DEFAULT: "#192a37",
          mid: "#243d50",
          light: "#2e5068",
        },
        teal: {
          DEFAULT: "#3fc1a5",
          light: "#6dd4bc",
          pale: "#e6f8f4",
          dark: "#0a7a63",
        },
        crimson: {
          DEFAULT: "#e84a7e",
          pale: "#fdeef4",
          dark: "#c0305a",
        },
        warm: {
          DEFAULT: "#f8f5f1",
          mid: "#eee9e2",
        },
        ink: {
          DEFAULT: "#192a37",
          mid: "#4a6070",
          light: "#7a95a6",
        },
        low: {
          DEFAULT: "#7a95a6",
          pale: "#eef3f6",
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        pill: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
