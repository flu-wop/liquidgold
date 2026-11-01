// LIVE CATALOG — real product structure from Ariel, Aug 11 2026.
// TODO(commerce): inStock is hardcoded true everywhere until real
// inventory (Stripe + Square, kept in sync) is wired up.

import { scents } from "./scents";

export type ProductType = string;

export type Product = {
  handle: string;
  name: string;
  scent: string; // scent slug
  type: ProductType;
  size: string;
  price: number;
  // Optional "was" price — shown struck through next to `price` on
  // bundles so the saving is visible. Display only; checkout always
  // charges `price`.
  compareAtPrice?: number;
  image: string;
  // Optional second photo — product cards swap to it on hover.
  hoverImage?: string;
  // Optional "what's inside" list for kits and bundles.
  includes?: string[];
  description: string;
  ingredients: string[];
  howToUse: string;
  featured: boolean;
  inStock: boolean;
};

// ── RETAIL PRICING ── (Nov 2026 price update)
// Single source of truth for every static SKU. Checkout reads these
// server-side (via getProduct), so changing a number here changes what
// customers are charged. Re-run "Sync catalog" in /admin afterwards so
// Square's dashboard shows the same prices.
export const PRICES = {
  butter4oz: 9.99,
  butter8oz: 14.99,
  oil8oz: 14.99,
  perfume10ml: 7.99,
  travelKit: 17.99,
  butterOilBundle: 26.99,
} as const;

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

// TODO(content): perfume and travel-kit ingredient lists are pending from
// Ariel — left empty (the product page shows "coming soon") rather than
// guessed, same rule as the scent notes.
const perfume = {
  description:
    "Your favorite Liquid Gold scent in a 10 mL perfume — small enough for any bag, made for touch-ups on the go. Layer it over the matching Body Butter or Body Oil to make the scent last all day.",
  ingredients: [] as string[],
  howToUse:
    "Apply to pulse points (wrists, neck, behind the ears) or over moisturized skin. For a longer-lasting scent, layer over the matching Body Butter or Body Oil.",
};

const travelKit = {
  description:
    "Your full Liquid Gold ritual, sized for the road. Four travel-size essentials in one scent, so you can cleanse, polish, moisturize, and scent your skin wherever the trip takes you.",
  ingredients: [] as string[],
  howToUse:
    "Cleanse with the Body Wash, then massage the Body Scrub over damp skin in circles and rinse. Finish with the Body Butter while skin is still slightly damp, then apply the Perfume to pulse points.",
};

const bundle = {
  description:
    "The full glow routine: an 8 oz Body Butter and an 8 oz Body Oil in the same scent, bundled for less than buying them separately. Butter for deep moisture, oil for a lightweight glow on top.",
  ingredients: [
    "Body Butter: Shea Butter, Cocoa Butter, Sweet Almond Oil, Avocado Oil, Jojoba Oil, Fragrance Oil (varies by scent)",
    "Body Oil: Sunflower Oil, Jojoba Oil, Avocado Oil, Fragrance Oil (varies by scent)",
  ],
  howToUse:
    "After showering, massage the Body Butter into damp skin, then smooth the Body Oil over the top to lock in moisture and add glow.",
};

const TYPE_SLUG: Record<string, string> = {
  "Body Butter": "butter",
  "Body Oil": "oil",
  Perfume: "perfume",
  "Travel Kit": "travel-kit",
  Bundle: "bundle",
};

function slugify(scentSlug: string, type: ProductType, size: string) {
  const typeSlug = TYPE_SLUG[type] ?? type.toLowerCase().replace(/\s+/g, "-");
  // "8 oz" -> "8oz" (unchanged from the original 15 SKUs, so existing
  // handles, carts and Square mappings keep working), "8 oz + 8 oz" ->
  // "8oz-8oz", "10 mL" -> "10ml".
  const sizeSlug = size
    .toLowerCase()
    .split("+")
    .map((part) => part.replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean)
    .join("-");
  return `${scentSlug}-${typeSlug}-${sizeSlug}`;
}

// REAL PHOTOS — pulled from her live Shopify store (liquidgoldskinco.com)
// Aug 11 2026, since the product names there match this catalog exactly.
// `*2` = an alternate shot used for the hover swap on product cards.
// Bundle shots: Juicy Paradise, Pink Fantasy and Unscented already have a
// photo of the butter and oil together; the other two are side-by-side
// composites of the two real product photos.
const productImages: Record<
  string,
  { butter: string; butter2?: string; oil: string; oil2?: string; bundle: string }
> = {
  "cocoa-cashmere": {
    butter: "/images/products/cocoa-cashmere-butter.jpg",
    butter2: "/images/products/cocoa-cashmere-butter-2.jpg",
    oil: "/images/products/cocoa-cashmere-oil.jpg",
    oil2: "/images/products/cocoa-cashmere-oil-2.jpg",
    bundle: "/images/products/bundle-cocoa-cashmere.jpg",
  },
  "juicy-paradise": {
    butter: "/images/products/juicy-paradise.jpg",
    oil: "/images/products/juicy-paradise.jpg", // TODO(assets): no distinct oil shot yet
    bundle: "/images/products/juicy-paradise.jpg",
  },
  "bare-current": {
    butter: "/images/products/bare-current-butter.jpg",
    butter2: "/images/products/bare-current-oil.jpg",
    oil: "/images/products/bare-current-oil.jpg",
    oil2: "/images/products/bare-current-butter.jpg",
    bundle: "/images/products/bundle-bare-current.jpg",
  },
  "pink-fantasy": {
    butter: "/images/products/pink-fantasy.jpg",
    oil: "/images/products/pink-fantasy-oil-2.jpg",
    oil2: "/images/products/pink-fantasy.jpg",
    bundle: "/images/products/pink-fantasy.jpg",
  },
  unscented: {
    butter: "/images/products/unscented-butter.jpg",
    butter2: "/images/products/unscented-butter-2.jpg",
    oil: "/images/products/unscented-oil.jpg",
    bundle: "/images/products/unscented-oil.jpg",
  },
};

const PLACEHOLDER = "/images/placeholder-product.jpg";

// Perfume + Travel Kit come in the four fragrances only — an "unscented"
// perfume isn't a thing. TODO(assets): these use branded "photo coming
// soon" cards until Ariel sends real photography; swap the paths below.
const isScented = (slug: string) => slug !== "unscented";

export const products: Product[] = scents.flatMap((s) => {
  const img = productImages[s.slug];
  const list: Product[] = [
    {
      handle: slugify(s.slug, "Body Butter", "8oz"),
      name: `${s.name} Body Butter — 8 oz`,
      scent: s.slug,
      type: "Body Butter",
      size: "8 oz",
      price: PRICES.butter8oz,
      image: img?.butter ?? PLACEHOLDER,
      hoverImage: img?.butter2,
      ...bodyButter,
      featured: s.slug !== "unscented",
      inStock: true,
    },
    {
      handle: slugify(s.slug, "Body Butter", "4oz"),
      name: `${s.name} Body Butter — 4 oz`,
      scent: s.slug,
      type: "Body Butter",
      size: "4 oz",
      price: PRICES.butter4oz,
      image: img?.butter ?? PLACEHOLDER,
      hoverImage: img?.butter2,
      ...bodyButter,
      featured: false,
      inStock: true,
    },
    {
      handle: slugify(s.slug, "Body Oil", "8oz"),
      name: `${s.name} Body Oil — 8 oz`,
      scent: s.slug,
      type: "Body Oil",
      size: "8 oz",
      price: PRICES.oil8oz,
      image: img?.oil ?? PLACEHOLDER,
      hoverImage: img?.oil2,
      ...bodyOil,
      featured: false,
      inStock: true,
    },
    {
      handle: slugify(s.slug, "Bundle", "8oz + 8oz"),
      name: `${s.name} Butter + Oil Bundle — 8 oz + 8 oz`,
      scent: s.slug,
      type: "Bundle",
      size: "8 oz + 8 oz",
      price: PRICES.butterOilBundle,
      compareAtPrice: Math.round((PRICES.butter8oz + PRICES.oil8oz) * 100) / 100,
      image: img?.bundle ?? PLACEHOLDER,
      hoverImage: img?.butter,
      includes: [`${s.name} Body Butter — 8 oz`, `${s.name} Body Oil — 8 oz`],
      ...bundle,
      featured: false,
      inStock: true,
    },
  ];
  if (isScented(s.slug)) {
    list.push(
      {
        handle: slugify(s.slug, "Perfume", "10 mL"),
        name: `${s.name} Perfume — 10 mL`,
        scent: s.slug,
        type: "Perfume",
        size: "10 mL",
        price: PRICES.perfume10ml,
        image: `/images/products/perfume-${s.slug}.jpg`,
        ...perfume,
        featured: false,
        inStock: true,
      },
      {
        handle: slugify(s.slug, "Travel Kit", "4-Piece"),
        name: `${s.name} 4-Piece Travel Kit — 4-Piece`,
        scent: s.slug,
        type: "Travel Kit",
        size: "4-Piece",
        price: PRICES.travelKit,
        image: `/images/products/travel-kit-${s.slug}.jpg`,
        includes: [
          `${s.name} Body Wash (travel size)`,
          `${s.name} Body Scrub (travel size)`,
          `${s.name} Body Butter (travel size)`,
          `${s.name} Perfume — 5 mL`,
        ],
        ...travelKit,
        featured: false,
        inStock: true,
      }
    );
  }
  return list;
});

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);

export const productsByScent = (scentSlug: string) =>
  products.filter((p) => p.scent === scentSlug);

export const featuredProducts = () => products.filter((p) => p.featured);
