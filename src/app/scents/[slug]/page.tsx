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
      {/* Each scent gets its own accent-layered hero — the "destination"
          feel from the brief, without breaking the shared base palette. */}
      <section
        className="grain px-6 py-24 text-center"
        style={{ background: `linear-gradient(180deg, ${scent.accent}33, #FBEEDD)` }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-cocoa/50">
          {scent.mood}
        </p>
        <h1
          className="mt-3 font-display text-5xl italic md:text-7xl"
          style={{ color: scent.accent }}
        >
          {scent.name}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-cocoa/70">{scent.story}</p>
        <p className="mt-4 text-sm font-medium text-cocoa/60">
          {scent.notes.join(" · ")}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-6 font-display text-2xl text-cocoa">
          Shop this <span className="italic text-gold-gradient">scent</span>
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {scentProducts.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-cocoa px-6 py-16 text-center text-cream">
        <p className="font-display text-2xl italic">More islands to explore</p>
        <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">
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
