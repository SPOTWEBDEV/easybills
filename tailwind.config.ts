import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Literal scales — used directly (bg-paper-50, dark:bg-ink-950, etc.)
        // exactly as the original landing page markup expects.
        paper: {
          50: "#F7F7F5",
          100: "#FFFFFF",
          200: "#F1F1EE",
          300: "#E4E4DD",
          400: "#D2D2C7",
          500: "#B7B7AB",
          600: "#93938A",
          700: "#6E6E66",
          800: "#4A4A44",
          900: "#252521",
          950: "#131311",
        },
        ink: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          faint: "rgb(var(--fg-faint) / <alpha-value>)",
          50: "#F0F1F6",
          100: "#E1E3EC",
          200: "#C3C7D6",
          300: "#9E9EB1",
          400: "#9EA4B5",
          500: "#5A6170",
          600: "#3F4451",
          700: "#2A2F3D",
          800: "#181C27",
          900: "#12151D",
          950: "#0A0D13",
        },
        // Semantic tokens — read from the CSS custom properties in
        // globals.css, so they flip automatically with the `.dark` class.
        base: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--bg-elevated) / <alpha-value>)",
          raised: "rgb(var(--bg-elevated) / <alpha-value>)",
          hover: "rgb(var(--bg-hover) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          soft: "rgb(var(--border) / <alpha-value>)",
        },
        brand: {
          50: "#E7FBF6",
          100: "#C8F4E9",
          200: "#93E8D2",
          300: "#5DD9BC",
          400: "#2CC7A3",
          500: "#0EA894",
          600: "#0B8A7A",
          700: "#096E62",
          800: "#08574F",
          900: "#074640",
          950: "#042925",
        },
        good: "#1E9E5A",
        warn: "#C08A0E",
        bad: "#D6484F",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -16px rgba(10,13,19,0.35)",
        glow: "0 0 0 1px rgba(14,168,148,0.15), 0 20px 60px -15px rgba(14,168,148,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "150% 0" },
          "100%": { backgroundPosition: "-50% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
