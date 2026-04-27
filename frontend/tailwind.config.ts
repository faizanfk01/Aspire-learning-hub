import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1D4ED8",   // blue-700 — primary
          navy: "#1E3A8A",   // blue-900 — deep headers
          orange: "#F97316", // orange-500 — accents / hovers
        },
      },
    },
  },
  plugins: [],
};
export default config;
