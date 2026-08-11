import { scents } from "@/lib/scents";
import ScentShopCard from "@/components/ScentShopCard";

export default function ShopPage() {
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
          <ScentShopCard key={s.slug} scent={s} />
        ))}
      </div>
    </section>
  );
}
