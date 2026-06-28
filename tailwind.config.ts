import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          dark: "#A07830",
        },
        copper: "#B87333",
        bg: "#0A0A0A",
        surface: {
          DEFAULT: "#141414",
          elevated: "#1E1E1E",
        },
        border: {
          DEFAULT: "#2A2A2A",
        },
        text: {
          DEFAULT: "#F5F0E8",
          muted: "#9A9A8A",
        },
        success: "#4CAF7C",
        warning: "#D4A017",
        destructive: {
          DEFAULT: "#C0392B",
        },
      },
      fontFamily: {
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "8px",
        xl: "12px",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(201, 168, 76, 0.15)",
        "gold-glow-lg": "0 0 40px rgba(201, 168, 76, 0.25)",
        "surface": "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #A07830 100%)",
        "surface-gradient": "linear-gradient(180deg, #141414 0%, #0A0A0A 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "ticker": "ticker 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(201, 168, 76, 0.35)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
