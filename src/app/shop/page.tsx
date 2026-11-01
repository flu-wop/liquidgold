import { scents } from "@/lib/scents";
import ScentShopCard from "@/components/ScentShopCard";
import ProductCard from "@/components/ProductCard";
import { getStockCounts } from "@/lib/square-catalog";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import { getCustomProducts } from "@/lib/custom-products";
import { products } from "@/lib/products";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { Product } from "@/lib/products";

// Sets & extras get their own browsable rows (and footer anchors) on top
// of being selectable inside each scent card.
const COLLECTIONS: { id: string; type: string; title: string; accent: string; blurb: string }[] = [
  {
    id: "bundles",
    type: "Bundle",
    title: "Butter + Oil",
    accent: "Bundles",
    blurb: "An 8 oz Body Butter and an 8 oz Body Oil in the same scent — the full glow routine for less.",
  },
  {
    id: "travel-kits",
    type: "Travel Kit",
    title: "4-Piece",
    accent: "Travel Kits",
    blurb: "Body wash, body scrub, body butter, and a 5 mL perfume — your whole ritual, carry-on ready.",
  },
  {
    id: "perfume",
    type: "Perfume",
    title: "10 mL",
    accent: "Perfume",
    blurb: "Every Liquid Gold fragrance in a pocket-size perfume. Layer it over the matching butter or oil.",
  },
];

// Stock counts must be fetched fresh on every request, not baked in at
// build time — otherwise every visitor would see whatever stock existed
// when the site was last deployed.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  // Fail open — a Square/Turso hiccup on the stock check should never take
  // down the whole shop page. Empty map means every card falls back to
  // "not synced yet" (available), same as before inventory sync existed.
  let stock: Record<string, number | null> = {};
  try {
    stock = await getStockCounts();
  } catch (e) {
    console.error("stock count fetch failed, shop page proceeding without it", e);
  }
  const [hidden, customProducts] = await Promise.all([
    getHiddenScentSlugs(),
    getCustomProducts({ includeInactive: false }),
  ]);
  const visibleScents = scents.filter((s) => !hidden.has(s.slug));
  const byType = (type: string): Product[] =>
    products.filter((p) => p.type === type && !hidden.has(p.scent));

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-guava">The Collection</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-cocoa md:text-7xl">
          Shop the <span className="text-gold-gradient italic">Escape</span>
        </h1>
        <p className="mt-4 max-w-md text-cocoa/70">
          Pick a scent, then choose Body Butter, Body Oil, a bundle, perfume, or a travel kit.
        </p>
        {/* Jump links — scroll horizontally on small screens */}
        <nav aria-label="Shop sections" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {[{ id: "scents", label: "By Scent" }, ...COLLECTIONS.map((c) => ({ id: c.id, label: c.accent }))].map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="whitespace-nowrap rounded-full border border-cocoa/20 px-4 py-2 text-sm font-medium text-cocoa/80 transition-colors hover:border-cocoa hover:text-cocoa"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </Reveal>
      <RevealGroup id="scents" className="mt-12 grid scroll-mt-24 grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 md:grid-cols-3 xl:grid-cols-5">
        {visibleScents.map((s) => (
          <RevealItem key={s.slug}>
            <ScentShopCard scent={s} stock={stock} />
          </RevealItem>
        ))}
      </RevealGroup>

      {COLLECTIONS.map((c) => {
        const items = byType(c.type);
        if (items.length === 0) return null;
        return (
          <div key={c.id} id={c.id} className="mt-24 scroll-mt-24 border-t border-cocoa/10 pt-14">
            <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-4xl leading-none text-cocoa md:text-5xl">
                {c.title} <span className="text-gold-gradient italic">{c.accent}</span>
              </h2>
              <p className="max-w-sm text-sm text-cocoa/70">{c.blurb}</p>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5">
              {items.map((p) => (
                <RevealItem key={p.handle}>
                  <ProductCard product={p} sizes="(max-width: 768px) 50vw, 20vw" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        );
      })}

      {/* Admin-added products — shown as plain cards rather than the
          scent-grouped card above, since they don't have the editorial
          mood/notes/accent data the 5 hero scents do. */}
      {customProducts.length > 0 && (
        <div className="mt-24 border-t border-cocoa/10 pt-14">
          <Reveal>
            <h2 className="mb-10 font-display text-4xl text-cocoa md:text-5xl">
              More from the <span className="text-gold-gradient italic">Shop</span>
            </h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4">
            {customProducts.map((p) => (
              <RevealItem key={p.handle}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}
    </section>
  );
}
