import { getFeaturedProductsAsync } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export default async function BestSellers({ hiddenSlugs }: { hiddenSlugs: Set<string> }) {
  // Static featured SKUs plus any admin-added products marked featured —
  // merged so a brand-new product can show up here too.
  const allFeatured = await getFeaturedProductsAsync();
  const products = allFeatured.filter((p) => !hiddenSlugs.has(p.scent));
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <Reveal className="mb-10 flex items-end justify-between gap-6 md:mb-14">
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
      <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4">
        {products.map((p) => (
          <RevealItem key={p.handle}>
            <ProductCard product={p} />
          </RevealItem>
        ))}
      </RevealGroup>
      <div className="mt-10 md:hidden">
        <Button href="/shop" variant="ghost" className="w-full">
          Shop All
        </Button>
      </div>
    </section>
  );
}
