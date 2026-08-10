import { getScent, scents } from "@/lib/scents";
import { productsByScent } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ scent?: string }>;
}) {
  const { scent: slug } = await searchParams;
  const scent = getScent(slug ?? "") ?? scents[0];
  const scentProducts = productsByScent(scent.slug);

  return (
    <section
      className="grain px-6 py-24 text-center"
      style={{ background: `linear-gradient(180deg, ${scent.accent}33, #FBEEDD)` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-cocoa/50">
        Your island escape is
      </p>
      <h1
        className="mt-3 font-display text-5xl italic md:text-7xl"
        style={{ color: scent.accent }}
      >
        {scent.name}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-cocoa/70">{scent.story}</p>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-3">
        {scentProducts.map((p) => (
          <ProductCard key={p.handle} product={p} />
        ))}
      </div>

      <div className="mt-10">
        <Button href={`/scents/${scent.slug}`} variant="secondary">
          Explore {scent.name}
        </Button>
      </div>
    </section>
  );
}
