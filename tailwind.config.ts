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
        "cdmu-green": "#34C759",
        "cdmu-green-light": "#4CD964",
        "cdmu-green-dark": "#248A3D",
        "cdmu-blue": "#007AFF",
        "cdmu-blue-light": "#5AC8FA",
        "cdmu-blue-dark": "#0051D5",
        "cdmu-red": "#FF3B30",
        "cdmu-amber": "#FF9500",
        "cdmu-gray-50": "#F2F2F7",
        "cdmu-gray-100": "#E5E5EA",
        "cdmu-gray-200": "#D1D1D6",
        "cdmu-gray-300": "#C7C7CC",
        "cdmu-gray-500": "#8E8E93",
        "cdmu-gray-600": "#636366",
        "cdmu-gray-700": "#48484A",
        "cdmu-gray-900": "#1C1C1E",
      },
      fontFamily: {
        sans: [
          "var(--font-open-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "SF Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        apple: "0 0.5px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)",
        "apple-lg": "0 1px 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
        "apple-inset": "inset 0 0.5px 0 rgba(255,255,255,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
