import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        // Learning worlds (color-coded)
        "world-learn": "hsl(var(--world-learn))",
        "world-research": "hsl(var(--world-research))",
        "world-write": "hsl(var(--world-write))",
        "world-read": "hsl(var(--world-read))",
        "world-think": "hsl(var(--world-think))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px hsl(var(--shadow-color) / 0.06), 0 6px 20px hsl(var(--shadow-color) / 0.07)",
        "card-hover": "0 2px 4px hsl(var(--shadow-color) / 0.08), 0 16px 40px hsl(var(--shadow-color) / 0.12)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        pop: "pop 0.35s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
