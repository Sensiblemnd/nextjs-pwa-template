import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          base: "hsl(var(--surface-base))",
          raised: "hsl(var(--surface-raised))",
          overlay: "hsl(var(--surface-overlay))",
        },
        alert: {
          critical: "hsl(var(--alert-critical))",
          warning: "hsl(var(--alert-warning))",
          info: "hsl(var(--alert-info))",
          safe: "hsl(var(--alert-safe))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          dim: "hsl(var(--brand-dim))",
        },
      },
      spacing: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
