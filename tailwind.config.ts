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
        // Shadcn-compatible tokens consumed by components/ui/*
        background: "#ffffff",
        foreground: "#0f172a",
        card: "#ffffff",
        "card-foreground": "#0f172a",
        popover: "#ffffff",
        "popover-foreground": "#0f172a",
        primary: "#4f46e5",
        "primary-foreground": "#ffffff",
        secondary: "#f1f5f9",
        "secondary-foreground": "#0f172a",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        accent: "#eef2ff",
        "accent-foreground": "#0f172a",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#6366f1",
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
        // Glass lift shadows — depth without brutalism's hard edge
        "glass-lift":
          "0 20px 60px -20px rgba(0, 0, 0, 0.6), 0 8px 20px -8px rgba(0, 0, 0, 0.4)",
        "glass-lift-lg":
          "0 30px 80px -20px rgba(0, 0, 0, 0.7), 0 12px 30px -10px rgba(0, 0, 0, 0.5)",
        "glow-volt":
          "0 0 40px rgba(0, 230, 118, 0.35), 0 0 80px rgba(0, 230, 118, 0.15)",
        "glow-volt-lg":
          "0 0 60px rgba(0, 230, 118, 0.5), 0 0 120px rgba(0, 230, 118, 0.25), 0 30px 80px -20px rgba(0, 230, 118, 0.3)",
        "glow-red":
          "0 0 40px rgba(239, 68, 68, 0.45), 0 0 80px rgba(239, 68, 68, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
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
