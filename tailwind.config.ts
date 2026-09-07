import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ===== Stitch "DocTime" design system tokens (light clinical theme) =====
        surface: "#faf8ff",
        "surface-subtle": "#f8faff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eaedff",
        "surface-container-high": "#e2e7ff",
        "surface-tint": "#f4f8fe",
        "on-surface": "#131b2e",
        "on-surface-variant": "#424655",
        outline: "#727687",
        "outline-variant": "#c2c6d8",
        "border-subtle": "#e2e8f0",
        primary: "#0053cd",
        "on-primary": "#ffffff",
        "primary-container": "#136afb",
        "on-primary-container": "#fdfbff",
        "primary-fixed": "#dae2ff",
        "primary-fixed-dim": "#b2c5ff",
        secondary: "#006591",
        "on-secondary": "#ffffff",
        "secondary-container": "#39b8fd",
        "secondary-fixed": "#c9e6ff",
        "secondary-fixed-dim": "#89ceff",
        "on-secondary-container": "#004666",
        tertiary: "#006947",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#00855b",
        "tertiary-fixed": "#6ffbbe",
        "on-tertiary-fixed": "#002113",
        "error-container": "#ffdad6",
        "badge-available": "#10b981",
        "badge-available-bg": "#ecfdf5",
        "badge-urgent": "#ef4444",
        "badge-urgent-bg": "#fef2f2",
        "rating-amber": "#f59e0b",
        medical: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        health: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1.5s linear infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        }
      }
    },
  },
  plugins: [],
};
export default config;

