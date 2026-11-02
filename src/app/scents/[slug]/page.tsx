import { notFound } from "next/navigation";
import Image from "next/image";
import { getScent, scents } from "@/lib/scents";
import { productsByScent } from "@/lib/products";
import ScentBuyBox from "@/components/ScentBuyBox";
import { getStockCounts } from "@/lib/square-catalog";
import Button from "@/components/ui/Button";
import { getContentMap, getScentContent } from "@/lib/content";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import Reveal from "@/components/motion/Reveal";

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
  let stock: Record<string, number | null> = {};
  try {
    stock = await getStockCounts();
  } catch (e) {
    console.error("stock fetch failed on scent page, proceeding without it", e);
  }
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
          <a
            href="#shop"
            className="mt-9 inline-flex min-h-[48px] items-center justify-center rounded-full bg-cream px-8 text-sm font-semibold tracking-wide text-cocoa transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-white active:scale-[0.98] motion-reduce:transform-none"
          >
            Shop {scent.name} &darr;
          </a>
        </Reveal>
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="mb-10 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
            Shop <span className="italic text-gold-gradient">{scent.name}</span>
          </h2>
        </Reveal>
        <ScentBuyBox scent={scent} products={scentProducts} stock={stock} />
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
