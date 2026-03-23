import type { Config } from "tailwindcss";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const safeArea = require("tailwindcss-safe-area");

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#121212",
        black: "#000000",
        white: "#FFFFFF",
        volt: "#00E676",
      },
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "cursive"],
        inter: ["var(--font-inter)", "sans-serif"],
        "fira-code": ["var(--font-fira-code)", "monospace"],
      },
      boxShadow: {
        neo: "8px 8px 0px #000000",
        "neo-white": "8px 8px 0px #FFFFFF",
        "neo-sm": "4px 4px 0px #000000",
        "neo-sm-white": "4px 4px 0px #FFFFFF",
      },
      borderWidth: {
        "3": "3px",
        "4": "4px",
        "8": "8px",
      },
    },
  },
  plugins: [safeArea],
};
export default config;
