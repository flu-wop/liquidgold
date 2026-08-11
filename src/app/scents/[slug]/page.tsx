import { notFound } from "next/navigation";
import Image from "next/image";
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
      {/* Full-viewport campaign hero using her real product photography,
          with a dark scrim for text legibility. */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <Image
          src={scent.image}
          alt={scent.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${scent.accent}66, #1a1a1acc)`,
          }}
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream/80">
            {scent.personality}
          </p>
          <h1 className="mt-4 font-display text-7xl italic text-cream md:text-9xl">
            {scent.name}
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg text-cream/90">{scent.story}</p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-cream/70">{scent.vibe}</p>
          {scent.notes.length > 0 ? (
            <p className="mt-5 text-sm font-medium uppercase tracking-widest text-cream/70">
              {scent.notes.join("   ·   ")}
            </p>
          ) : (
            <p className="mt-5 text-sm italic text-cream/50">
              Fragrance notes coming soon
            </p>
          )}
        </div>
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
