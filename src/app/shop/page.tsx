import { scents } from "@/lib/scents";
import ScentShopCard from "@/components/ScentShopCard";
import ProductCard from "@/components/ProductCard";
import { getStockCounts } from "@/lib/square-catalog";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import { getCustomProducts } from "@/lib/custom-products";

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

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Shop the <span className="text-gold-gradient italic">Escape</span>
      </h1>
      <p className="mt-3 max-w-md text-cocoa/60">
        Pick a scent, then choose Body Butter or Body Oil and your size.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {visibleScents.map((s) => (
          <ScentShopCard key={s.slug} scent={s} stock={stock} />
        ))}
      </div>

      {/* Admin-added products — shown as plain cards rather than the
          scent-grouped card above, since they don't have the editorial
          mood/notes/accent data the 5 hero scents do. */}
      {customProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 font-display text-3xl text-cocoa">More from the Shop</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {customProducts.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
