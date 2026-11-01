import { notFound } from "next/navigation";
import Image from "next/image";
import { getScent, scents } from "@/lib/scents";
import { productsByScent } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";
import { getContentMap, getScentContent } from "@/lib/content";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

export default async function ScentDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scent = getScent(slug);
  if (!scent) notFound();

  const hiddenSlugs = await getHiddenScentSlugs();
  // A hidden scent is meant to be fully off the site, not just off the
  // listing pages — direct/bookmarked links shouldn't still work.
  if (hiddenSlugs.has(scent.slug)) notFound();

  const scentProducts = productsByScent(scent.slug);
  const otherScents = scents.filter((s) => s.slug !== scent.slug && !hiddenSlugs.has(s.slug));
  const contentMap = await getContentMap();
  const display = getScentContent(contentMap, scent.slug);

  return (
    <>
      {/* Full-viewport campaign hero using her real product photography,
          with a dark scrim for text legibility. */}
      <section className="relative isolate flex min-h-[85svh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
        <Image
          src={display.image}
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
        <Reveal className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream/90">
            {scent.personality}
          </p>
          <h1 className="mt-4 font-display text-6xl italic leading-[0.95] text-cream sm:text-7xl md:text-9xl">
            {scent.name}
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg text-cream/90">{display.story}</p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-cream/85">{display.vibe}</p>
          {scent.notes.length > 0 ? (
            <p className="mx-auto mt-5 max-w-2xl text-sm font-medium uppercase tracking-widest text-cream/85">
              {scent.notes.join("   ·   ")}
            </p>
          ) : (
            <p className="mt-5 text-sm italic text-cream/75">
              Fragrance notes coming soon
            </p>
          )}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
        <Reveal>
          <h2 className="mb-10 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
            Shop this <span className="italic text-gold-gradient">scent</span>
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-3">
          {scentProducts.map((p) => (
            <RevealItem key={p.handle}>
              <ProductCard product={p} sizes="(max-width: 768px) 50vw, 33vw" />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="bg-cocoa px-6 py-20 text-center text-cream md:py-24">
        <p className="font-display text-3xl italic md:text-5xl">More islands to explore</p>
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
