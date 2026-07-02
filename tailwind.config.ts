import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cdmu-navy": "#0072C6",
        "cdmu-navy-light": "#2E9BE6",
        "cdmu-gold": "#F4A300",
        "cdmu-gold-light": "#F7C948",
        "cdmu-teal": "#0072C6",
        "cdmu-teal-light": "#2E9BE6",
        "cdmu-green": "#1EB53A",
        "cdmu-green-light": "#4CD964",
        "cdmu-green-dark": "#17862D",
        "cdmu-blue": "#0072C6",
        "cdmu-blue-light": "#2E9BE6",
        "cdmu-blue-dark": "#005A9E",
        "cdmu-red": "#E74C3C",
        "cdmu-amber": "#F39C12",
        "cdmu-gray-50": "#F8FAFC",
        "cdmu-gray-100": "#F1F5F9",
        "cdmu-gray-200": "#E2E8F0",
        "cdmu-gray-300": "#CBD5E1",
        "cdmu-gray-500": "#64748B",
        "cdmu-gray-600": "#475569",
        "cdmu-gray-700": "#334155",
        "cdmu-gray-900": "#0F172A",
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "Open Sans", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
