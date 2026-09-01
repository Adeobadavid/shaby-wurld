import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // exact tokens pulled from the Figma "Desktop - 3" hero node
        "sw-blush": "#d68073",
        "sw-cream": "#f4efe9",
      },
      fontFamily: {
        display: ["Canela Trial", "Georgia", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
