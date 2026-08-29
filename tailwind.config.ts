import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        shell: "#f6f8f5",
        foreground: "var(--foreground)",
        "chart-label": "var(--chart-label)",
        "chart-tooltip-background": "var(--chart-tooltip-background)",
        "chart-tooltip-foreground": "var(--chart-tooltip-foreground)",
        "chart-tooltip-muted": "var(--chart-tooltip-muted)"
      },
      boxShadow: { glass: "0 24px 80px rgba(0,0,0,.08)" },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" }
    }
  },
  plugins: []
};

export default config;
