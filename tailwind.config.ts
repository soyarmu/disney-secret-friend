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
        disney: {
          blue: "#0b1e3f",
          gold: "#ffd700",
          purple: "#8b5cf6",
          pink: "#ec4899",
        },
      },
      backgroundImage: {
        "magical-gradient": "linear-gradient(135deg, #0b1e3f 0%, #1e3a8a 50%, #312e81 100%)",
        "golden-gradient": "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
