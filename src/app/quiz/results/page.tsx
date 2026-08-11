import Image from "next/image";
import { getScent, scents } from "@/lib/scents";
import ScentShopCard from "@/components/ScentShopCard";
import Button from "@/components/ui/Button";

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ scent?: string }>;
}) {
  const { scent: slug } = await searchParams;
  const scent = getScent(slug ?? "") ?? scents[0];

  return (
    <>
      {/* Same real-photo campaign hero treatment as the scent destination
          pages, so results feel like a payoff, not a downgrade. */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
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
            Your Island Escape Is
          </p>
          <h1 className="mt-4 font-display text-6xl italic text-cream md:text-8xl">
            {scent.name}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-cream/90">{scent.story}</p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-8 text-center font-display text-2xl text-cocoa">
          Shop <span className="italic text-gold-gradient">{scent.name}</span>
        </h2>
        {/* Same grouped card + variant selector + real Add to Cart as Shop page */}
        <div className="mx-auto max-w-xs">
          <ScentShopCard scent={scent} />
        </div>
        <div className="mt-10 text-center">
          <Button href={`/scents/${scent.slug}`} variant="ghost">
            Explore the full {scent.name} world
          </Button>
        </div>
      </section>
    </>
  );
}
