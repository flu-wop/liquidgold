import { notFound } from "next/navigation";
import { getScent, scents } from "@/lib/scents";
import { productsByScent } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";

export default async function ScentDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scent = getScent(slug);
  if (!scent) notFound();

  const scentProducts = productsByScent(scent.slug);
  const otherScents = scents.filter((s) => s.slug !== scent.slug);

  return (
    <>
      {/* Full-viewport campaign hero — each scent is its own world, not a
          product page. PLACEHOLDER: replace gradient with real campaign
          photography once available. */}
      <section
        className="grain relative flex min-h-[85vh] flex-col items-center justify-center px-6 text-center"
        style={{ background: `linear-gradient(160deg, ${scent.accent}, #1a1a1a)` }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream/70">
          {scent.personality}
        </p>
        <h1 className="mt-4 font-display text-7xl italic text-cream md:text-9xl">
          {scent.name}
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-lg text-cream/80">{scent.story}</p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-cream/60">{scent.vibe}</p>
        {scent.notes.length > 0 ? (
          <p className="mt-5 text-sm font-medium uppercase tracking-widest text-cream/60">
            {scent.notes.join("   ·   ")}
          </p>
        ) : (
          <p className="mt-5 text-sm italic text-cream/40">
            Fragrance notes coming soon
          </p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-8 font-display text-3xl text-cocoa">
          Shop this <span className="italic text-gold-gradient">scent</span>
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {scentProducts.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-cocoa px-6 py-20 text-center text-cream">
        <p className="font-display text-3xl italic">More islands to explore</p>
        <div className="mx-auto mt-10 flex max-w-md flex-wrap justify-center gap-4">
          {otherScents.map((s) => (
            <Button key={s.slug} href={`/scents/${s.slug}`} variant="secondary">
              {s.name}
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}
