import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        ink: {
          950: "#0A0D13",
          900: "#12151D",
          850: "#181C27",
          800: "#1F2430",
          700: "#2A2F3D",
          600: "#3A4053",
        },
        paper: {
          50: "#F7F7F5",
          100: "#EFEFEA",
          200: "#E4E4DD",
        },
        brand: {
          50: "#E6FBF8",
          100: "#C3F3EC",
          200: "#91E6D6",
          300: "#6FDFCF",
          400: "#3BC7B0",
          500: "#0EA894",
          600: "#0B8A79",
          700: "#086D60",
          900: "#04443B",
        },
        emerald: {
          50: "#EAFBEF",
          500: "#22A559",
          600: "#1B8A48",
        },
        coral: {
          50: "#FDECEC",
          500: "#E5484D",
          600: "#C93A3F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(18,21,29,0.08), 0 8px 24px -8px rgba(18,21,29,0.10)",
        "soft-dark": "0 2px 8px -2px rgba(0,0,0,0.35), 0 12px 32px -8px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(14,168,148,0.18), 0 8px 30px -8px rgba(14,168,148,0.45)",
      },
      backgroundImage: {
        "brand-mesh":
          "radial-gradient(120% 120% at 10% 0%, rgba(14,168,148,0.55) 0%, rgba(14,168,148,0) 55%), radial-gradient(90% 90% at 100% 100%, rgba(59,199,176,0.30) 0%, rgba(59,199,176,0) 55%), linear-gradient(160deg, #12151D 0%, #0A0D13 70%)",
        "accent-mesh":
          "linear-gradient(135deg, #3BC7B0 0%, #0EA894 45%, #086D60 100%)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "count-up": "count-up 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
