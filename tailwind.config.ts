import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(18, 29, 43, 0.12)",
        tile: "0 12px 34px rgba(35, 45, 40, 0.10)",
        search: "0 18px 46px rgba(35, 45, 40, 0.16)",
        panel: "0 28px 80px rgba(20, 28, 25, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
