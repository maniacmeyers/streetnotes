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
        "neu-bg": "#e0e5ec",
        "neu-shadow": "#a3b1c6",
        "neu-highlight": "#ffffff",
        "neu-accent": "#6366f1",
        "neu-heading": "#2d3436",
        "neu-body": "#44475a",
        "neu-muted": "#636e72",
        "neu-subtle": "#b2bec3",
      },
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "cursive"],
        inter: ["var(--font-inter)", "sans-serif"],
        "fira-code": ["var(--font-fira-code)", "monospace"],
        "general-sans": ["var(--font-general-sans)", "sans-serif"],
        satoshi: ["var(--font-satoshi)", "sans-serif"],
      },
      boxShadow: {
        neo: "8px 8px 0px #000000",
        "neo-white": "8px 8px 0px #FFFFFF",
        "neo-sm": "4px 4px 0px #000000",
        "neo-sm-white": "4px 4px 0px #FFFFFF",
        "neu-raised": "6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff",
        "neu-raised-sm": "3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff",
        "neu-raised-hover": "8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff",
        "neu-inset": "inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff",
        "neu-inset-sm": "inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff",
        "neu-pressed": "inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff",
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
