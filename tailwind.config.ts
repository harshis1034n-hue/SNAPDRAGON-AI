import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./frontend/**/*.{html,js,ts,jsx,tsx}",
    "./frontend/index.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate: {
          850: "#172033",
          900: "#0f172a",
          950: "#090d16",
        },
        snapdragon: {
          50: "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          accent: "#ff3b30",
        },
        shield: {
          emerald: "#10b981",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          amber: "#f59e0b",
          rose: "#f43f5e",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
};

export default config;
