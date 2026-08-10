// PLACEHOLDER DATA LAYER
// TODO(commerce): replace with real product/inventory data once Stripe
// (online) + Square (in-person POS) are wired up and synced. Shape is kept
// close to what a real product record will look like so swapping the data
// source later doesn't require rewriting every page that consumes it.

export type Product = {
  handle: string;
  name: string;
  scent: string; // scent slug, ties to scents.ts
  type: "Body Butter" | "Body Oil" | "Bundle";
  price: number;
  image: string;
  description: string;
  inStock: boolean; // always true in the placeholder build
};

export const products: Product[] = [
  {
    handle: "horseshoe-bay-butter",
    name: "Horseshoe Bay Whipped Butter",
    scent: "horseshoe-bay",
    type: "Body Butter",
    price: 32,
    image: "/images/placeholder-product.jpg",
    description:
      "A pink-sand-inspired whip of shea and coconut butter, scented with guava and warm vanilla.",
    inStock: true,
  },
  {
    handle: "horseshoe-bay-oil",
    name: "Horseshoe Bay Dry Oil",
    scent: "horseshoe-bay",
    type: "Body Oil",
    price: 28,
    image: "/images/placeholder-product.jpg",
    description:
      "Fast-absorbing dry oil that layers under or over the whipped butter for a lasting glow.",
    inStock: true,
  },
  {
    handle: "royal-dockyard-butter",
    name: "Royal Dockyard Whipped Butter",
    scent: "royal-dockyard",
    type: "Body Butter",
    price: 32,
    image: "/images/placeholder-product.jpg",
    description: "Warm amber, sea salt, and fig — deep, sensual, night-out energy.",
    inStock: true,
  },
  {
    handle: "gold-hill-bundle",
    name: "Gold Hill Layering Bundle",
    scent: "gold-hill",
    type: "Bundle",
    price: 54,
    image: "/images/placeholder-product.jpg",
    description: "Citrus-gold escape, bottled — the oil and butter, together.",
    inStock: true,
  },
];

export const getProduct = (handle: string) =>
  products.find((p) => p.handle === handle);

export const productsByScent = (scentSlug: string) =>
  products.filter((p) => p.scent === scentSlug);
