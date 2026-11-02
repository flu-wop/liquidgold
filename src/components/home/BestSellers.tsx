import { getAllActiveProducts } from "@/lib/catalog";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import BestSellersCategories, { type Category } from "@/components/home/BestSellersCategories";

// One tile per category (one photo each); clicking reveals one card per
// scent. The 8 oz is the butter's hero size — the 4 oz is a size option on
// the product page.
const P = "/images/products/";
const CATEGORIES: {
  id: string; label: string; type: string; size?: string; image: string; href: string; blurb: string;
}[] = [
  { id: "butter", label: "Body Butter", type: "Body Butter", size: "8 oz", image: `${P}cocoa-cashmere-butter.jpg`, href: "/shop", blurb: "Whipped for 48 hours. Rich, melt-on-contact moisture in every scent." },
  { id: "oil", label: "Body Oil", type: "Body Oil", image: `${P}pink-fantasy-oil-2.jpg`, href: "/shop", blurb: "A featherweight, glowy oil that sinks in without the grease." },
  { id: "bundle", label: "Bundles", type: "Bundle", image: `${P}bundle-cocoa-cashmere.jpg`, href: "/shop#bundles", blurb: "An 8 oz butter and an 8 oz oil in one scent — for less than buying separately." },
  // TODO(assets): swap for a real travel-kit photo once Ariel has one.
  { id: "travel-kit", label: "Travel Kits", type: "Travel Kit", image: `${P}cocoa-cashmere-butter-2.jpg`, href: "/shop#travel-kits", blurb: "Body wash, scrub, butter, and a 5 mL perfume — your whole ritual, carry-on ready." },
];

export default async function BestSellers({ hiddenSlugs }: { hiddenSlugs: Set<string> }) {
  // Static catalog plus admin-added products, so a brand-new product can
  // show up here too (admin-added items marked "featured" with a type
  // outside these four land in a trailing "More" tile).
  const all = (await getAllActiveProducts()).filter((p) => !hiddenSlugs.has(p.scent));

  const categories: Category[] = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    blurb: c.blurb,
    image: c.image,
    href: c.href,
    products: all.filter((p) => p.type === c.type && (!c.size || p.size === c.size)),
  })).filter((c) => c.products.length > 0);

  const known = new Set(CATEGORIES.map((c) => c.type));
  const extras = all.filter((p) => p.featured && !known.has(p.type));
  if (extras.length > 0) {
    categories.push({
      id: "more", label: "More", blurb: "New from the shop.", image: extras[0].image, href: "/shop", products: extras,
    });
  }
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <Reveal className="mb-8 flex items-end justify-between gap-6 md:mb-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-guava-deep">Most loved</p>
          <h2 className="mt-3 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
            Best <span className="text-gold-gradient italic">sellers</span>
          </h2>
          <p className="mt-3 max-w-md text-cocoa/70">Pick a category to see every scent.</p>
        </div>
        <Button href="/shop" variant="ghost" className="hidden md:inline-flex">
          Shop All
        </Button>
      </Reveal>
      <BestSellersCategories categories={categories} />
      <div className="mt-10 md:hidden">
        <Button href="/shop" variant="ghost" className="w-full">
          Shop All
        </Button>
      </div>
    </section>
  );
}
