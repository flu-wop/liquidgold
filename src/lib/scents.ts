// PLACEHOLDER DATA LAYER — real content pending final scent lineup + copy
// from Liquid Gold. Structure supports the "each scent is its own world"
// destination-page concept from her brief.

export type Scent = {
  slug: string;
  name: string;
  mood: "Sexy" | "Fresh" | "Cozy" | "Tropical" | "Romantic" | "Warm";
  accent: string; // hex — each scent layers its own accent on the base palette
  notes: string[];
  story: string;
  image: string;
};

export const scents: Scent[] = [
  {
    slug: "horseshoe-bay",
    name: "Horseshoe Bay",
    mood: "Tropical",
    accent: "#FF6F52",
    notes: ["Pink Guava", "Coconut Water", "Warm Vanilla"],
    story:
      "Named for Bermuda's famous pink-sand beach — bright, fruited, and a little sun-warmed.",
    image: "/images/placeholder-scent.jpg",
  },
  {
    slug: "royal-dockyard",
    name: "Royal Dockyard",
    mood: "Sexy",
    accent: "#D9A441",
    notes: ["Amber", "Sea Salt", "Fig"],
    story:
      "Inspired by the old fortress at dusk — warm, a little smoky, built for the night.",
    image: "/images/placeholder-scent.jpg",
  },
  {
    slug: "gold-hill",
    name: "Gold Hill",
    mood: "Fresh",
    accent: "#1B9C93",
    notes: ["Bergamot", "Citrus Blossom", "Golden Musk"],
    story: "Morning light through St. George's — citrus-bright and easy.",
    image: "/images/placeholder-scent.jpg",
  },
];

export const getScent = (slug: string) => scents.find((s) => s.slug === slug);
