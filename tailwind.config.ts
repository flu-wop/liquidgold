import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Liquid Gold Skin Co. design tokens — tropical/Bermuda, not the
        // dark/gold ecosystem used on James's other (moody) sites.
        sand: "#FBEEDD",       // base background — warm, not stark white
        cocoa: "#3A2318",      // primary text — warm dark brown, never pure black
        lagoon: "#1B9C93",     // Bermuda water — primary accent
        "lagoon-deep": "#0F6B65",
        guava: "#FF6F52",      // tropical fruit coral — secondary accent
        "guava-light": "#FF9478",
        gold: "#D9A441",       // "Liquid Gold" — the brand's namesake accent
        "gold-light": "#E8C06B",
        hibiscus: "#F0487A",   // sparing use only — CTAs, badges, never backgrounds
        cream: "#FFF8EF",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        blob: "63% 37% 54% 46% / 55% 48% 52% 45%",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
