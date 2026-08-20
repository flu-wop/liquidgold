import { scents } from "@/lib/scents";
import ScentShopCard from "@/components/ScentShopCard";
import { getStockCounts } from "@/lib/square-catalog";

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
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Shop the <span className="text-gold-gradient italic">Escape</span>
      </h1>
      <p className="mt-3 max-w-md text-cocoa/60">
        Pick a scent, then choose Body Butter or Body Oil and your size.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {scents.map((s) => (
          <ScentShopCard key={s.slug} scent={s} stock={stock} />
        ))}
      </div>
    </section>
  );
}
