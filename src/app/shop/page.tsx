import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const types = ["All", "Body Butter", "Body Oil"];

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Shop the <span className="text-gold-gradient italic">Escape</span>
      </h1>
      {/* PLACEHOLDER: filters are static, not wired to real query/state yet */}
      <div className="mt-8 flex flex-wrap gap-3">
        {types.map((t) => (
          <button
            key={t}
            className="rounded-full border border-cocoa/20 px-5 py-2 text-sm text-cocoa/70 hover:border-guava hover:text-guava"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.handle} product={p} />
        ))}
      </div>
    </section>
  );
}
