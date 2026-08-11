// LIVE CATALOG — real product structure from Ariel, Aug 11 2026.
// TODO(commerce): inStock is hardcoded true everywhere until real
// inventory (Stripe + Square, kept in sync) is wired up.

import { scents } from "./scents";

export type ProductType = "Body Butter" | "Body Oil";

export type Product = {
  handle: string;
  name: string;
  scent: string; // scent slug
  type: ProductType;
  size: string;
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  howToUse: string;
  featured: boolean;
  inStock: boolean;
};

const bodyButter = {
  description:
    "A rich, nourishing body butter made to deeply moisturize the skin and leave it feeling soft, smooth, and glowing. Made with a blend of moisturizing butters and skin-loving oils.",
  ingredients: [
    "Shea Butter",
    "Cocoa Butter",
    "Sweet Almond Oil",
    "Avocado Oil",
    "Jojoba Oil",
    "Fragrance Oil (varies by scent)",
  ],
  howToUse:
    "Massage into clean skin as needed, especially after bathing or showering. For an extra glow and longer-lasting moisture, layer with Liquid Gold Body Oil.",
};

const bodyOil = {
  description:
    "A lightweight moisturizing body oil designed to soften, nourish, and give the skin a beautiful glow without feeling heavy.",
  ingredients: ["Sunflower Oil", "Jojoba Oil", "Avocado Oil", "Fragrance Oil (varies by scent)"],
  howToUse:
    "Massage into damp or dry skin. For maximum moisture, apply after showering or layer over Liquid Gold Body Butter.",
};

function slugify(scentSlug: string, type: ProductType, size: string) {
  const typeSlug = type === "Body Butter" ? "butter" : "oil";
  return `${scentSlug}-${typeSlug}-${size.replace(" ", "")}`;
}

// REAL PHOTOS — pulled from her live Shopify store (liquidgoldskinco.com)
// Aug 11 2026, since the product names there match this catalog exactly.
// Juicy Paradise has no dedicated Body Oil shot yet on her live site (both
// listings share one image there) — flagged, not fabricated.
const productImages: Record<string, { butter: string; oil: string }> = {
  "cocoa-cashmere": {
    butter: "/images/products/cocoa-cashmere-butter.jpg",
    oil: "/images/products/cocoa-cashmere-oil.jpg",
  },
  "juicy-paradise": {
    butter: "/images/products/juicy-paradise.png",
    oil: "/images/products/juicy-paradise.png", // TODO(assets): no distinct oil shot yet
  },
  "bare-current": {
    butter: "/images/products/bare-current-butter.jpg",
    oil: "/images/products/bare-current-oil.jpg",
  },
  "pink-fantasy": {
    butter: "/images/products/pink-fantasy.jpg",
    oil: "/images/products/pink-fantasy.jpg",
  },
  unscented: {
    butter: "/images/products/unscented-butter.jpg",
    oil: "/images/products/unscented-oil.jpg",
  },
};

export const products: Product[] = scents.flatMap((s) => [
  {
    handle: slugify(s.slug, "Body Butter", "8oz"),
    name: `${s.name} Body Butter — 8 oz`,
    scent: s.slug,
    type: "Body Butter" as const,
    size: "8 oz",
    price: 25,
    image: productImages[s.slug]?.butter ?? "/images/placeholder-product.jpg",
    ...bodyButter,
    featured: s.slug !== "unscented",
    inStock: true,
  },
  {
    handle: slugify(s.slug, "Body Butter", "4oz"),
    name: `${s.name} Body Butter — 4 oz`,
    scent: s.slug,
    type: "Body Butter" as const,
    size: "4 oz",
    price: 15,
    image: productImages[s.slug]?.butter ?? "/images/placeholder-product.jpg",
    ...bodyButter,
    featured: false,
    inStock: true,
  },
  {
    handle: slugify(s.slug, "Body Oil", "8oz"),
    name: `${s.name} Body Oil — 8 oz`,
    scent: s.slug,
    type: "Body Oil" as const,
    size: "8 oz",
    price: 32,
    image: productImages[s.slug]?.oil ?? "/images/placeholder-product.jpg",
    ...bodyOil,
    featured: false,
    inStock: true,
  },
]);

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);

export const productsByScent = (scentSlug: string) =>
  products.filter((p) => p.scent === scentSlug);

export const featuredProducts = () => products.filter((p) => p.featured);
