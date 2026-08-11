// LIVE COLLECTION — real scent data from Ariel, Aug 11 2026.
// Only scents marked live below. Future/unreleased concept scents
// (Satin Heat, Bronze Salt, Dolce Sol) are intentionally excluded per her
// explicit instruction: "DO NOT DISPLAY ON WEBSITE."

export type Mood = "Sexy" | "Fresh" | "Cozy" | "Tropical" | "Romantic" | "Warm";

export type Scent = {
  slug: string;
  name: string;
  personality: string; // her short tag line, e.g. "Warm • Creamy • Cozy • Sensual"
  mood: Mood; // primary mood bucket, used by the quiz + Shop by Mood
  vibe: string; // her longer mood description sentence
  accent: string;
  notes: string[]; // empty = notes pending, don't render a notes line
  story: string; // her "short description"
  availableIn: ("Body Butter" | "Body Oil")[];
  image: string;
};

export const scents: Scent[] = [
  {
    slug: "cocoa-cashmere",
    name: "Cocoa Cashmere",
    personality: "Warm • Creamy • Cozy • Sensual",
    mood: "Cozy",
    vibe: "Cozy, sexy, warm, comforting, and addictive.",
    accent: "#A6763E",
    notes: [
      "Light Spices",
      "Creamy Coconut",
      "Jasmine",
      "Vanilla Tonka",
      "Sandalwood",
      "Amber",
      "Cedarwood",
      "Olive Wood",
      "Musk",
      "Cocoa Butter",
    ],
    story:
      "A warm, creamy fragrance that wraps the skin in coconut, soft florals, vanilla-tonka warmth, woods, amber, and musk.",
    availableIn: ["Body Butter", "Body Oil"],
    image: "/images/products/cocoa-cashmere-butter.jpg",
  },
  {
    slug: "juicy-paradise",
    name: "Juicy Paradise",
    personality: "Juicy • Tropical • Sexy • Bright",
    mood: "Tropical",
    vibe: "Bright sunshine, tropical fruit, warm skin, and vacation energy.",
    accent: "#FF6F52",
    notes: ["White Florals", "Peach", "Guava", "Mango", "Papaya"],
    story:
      "A juicy tropical blend overflowing with ripe peach, guava, mango, papaya, and soft white florals.",
    availableIn: ["Body Butter", "Body Oil"],
    image: "/images/products/juicy-paradise.png",
  },
  {
    slug: "bare-current",
    name: "Bare Current",
    personality: "Fresh • Clean • Coastal • Unisex",
    mood: "Fresh",
    vibe: "Fresh out of the ocean, sun-warmed skin, clean air, and effortless island energy.",
    // Deliberately moodier/more muted than the rest of the palette —
    // per her note: "should be visually more unisex, slightly moodier,
    // and less feminine than the other scents."
    accent: "#4F6B66",
    notes: ["Sea Spray", "Sunstone", "Marine Musk", "Jasmine"],
    story:
      "A fresh, skin-like fragrance inspired by warm sun, ocean air, sea spray, soft jasmine, and marine musk.",
    availableIn: ["Body Butter", "Body Oil"],
    image: "/images/products/bare-current-oil.jpg",
  },
  {
    slug: "pink-fantasy",
    name: "Pink Fantasy",
    personality: "Flirty • Tropical • Feminine • Bright",
    mood: "Romantic",
    vibe: "Pink sunsets, tropical drinks, warm weather, and flirty island energy.",
    accent: "#F0487A",
    // TODO(content): final fragrance-note breakdown pending from Ariel
    // before launch — notes intentionally left empty, not fabricated.
    notes: [],
    story:
      "A playful, tropical fragrance made to feel bright, feminine, fun, and vacation-ready.",
    availableIn: ["Body Butter", "Body Oil"],
    image: "/images/products/pink-fantasy.jpg",
  },
  {
    slug: "unscented",
    name: "Unscented",
    personality: "Simple • Natural • Gentle",
    mood: "Warm",
    vibe: "For customers who want deep moisture without fragrance.",
    accent: "#C9A46B",
    notes: [],
    story: "No added fragrance. Naturally carries a light cocoa butter aroma.",
    availableIn: ["Body Butter", "Body Oil"],
    image: "/images/products/unscented-butter.jpg",
  },
];

export const getScent = (slug: string) => scents.find((s) => s.slug === slug);
