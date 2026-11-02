import { getAllActiveProducts } from "@/lib/catalog";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import BestSellersTabs, { type Tab } from "@/components/home/BestSellersTabs";

// One tab per product type, one card per scent (the 8 oz butter is the
// butter tab's hero size — the 4 oz is a size option on the product page).
const TABS: { id: string; label: string; type: string; size?: string }[] = [
  { id: "butter", label: "Body Butter", type: "Body Butter", size: "8 oz" },
  { id: "oil", label: "Body Oil", type: "Body Oil" },
  { id: "bundle", label: "Bundles", type: "Bundle" },
  { id: "travel-kit", label: "Travel Kits", type: "Travel Kit" },
];

export default async function BestSellers({ hiddenSlugs }: { hiddenSlugs: Set<string> }) {
  // Static catalog plus admin-added products, so a brand-new product can
  // show up here too (admin-added items marked "featured" land in the tab
  // matching their type, or a trailing "More" tab otherwise).
  const all = (await getAllActiveProducts()).filter((p) => !hiddenSlugs.has(p.scent));

  const tabs: Tab[] = TABS.map((t) => ({
    id: t.id,
    label: t.label,
    products: all.filter((p) => p.type === t.type && (!t.size || p.size === t.size)),
  })).filter((t) => t.products.length > 0);

  const knownTypes = new Set(TABS.map((t) => t.type));
  const extras = all.filter((p) => p.featured && !knownTypes.has(p.type));
  if (extras.length > 0) tabs.push({ id: "more", label: "More", products: extras });

  if (tabs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <Reveal className="mb-8 flex items-end justify-between gap-6 md:mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-guava">Most loved</p>
          <h2 className="mt-3 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
            Best <span className="text-gold-gradient italic">sellers</span>
          </h2>
        </div>
        <Button href="/shop" variant="ghost" className="hidden md:inline-flex">
          Shop All
        </Button>
      </Reveal>
      <BestSellersTabs tabs={tabs} />
      <div className="mt-10 md:hidden">
        <Button href="/shop" variant="ghost" className="w-full">
          Shop All
        </Button>
      </div>
    </section>
  );
}
