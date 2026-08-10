import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";

export default function BestSellers() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-3xl text-cocoa md:text-4xl">
          Best <span className="text-gold-gradient italic">sellers</span>
        </h2>
        <Button href="/shop" variant="ghost" className="hidden md:inline-flex">
          Shop All
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.handle} product={p} />
        ))}
      </div>
    </section>
  );
}
