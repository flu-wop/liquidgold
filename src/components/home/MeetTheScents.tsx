import Link from "next/link";
import { scents } from "@/lib/scents";
import { getScentContent, type ContentKey } from "@/lib/content";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";

export default function MeetTheScents({
  contentMap,
  hiddenSlugs,
}: {
  contentMap: Partial<Record<ContentKey, string>>;
  hiddenSlugs: Set<string>;
}) {
  const visibleScents = scents.filter((s) => !hiddenSlugs.has(s.slug));
  return (
    <section className="bg-cocoa py-20 text-cream md:py-28">
      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-3 font-display text-4xl leading-[0.95] md:text-6xl">
          Meet the <span className="italic text-gold-light">scents</span>
        </h2>
        <p className="mb-14 max-w-lg text-cream/75">
          Every fragrance is its own island escape. Choose the mood you want
          to wear.
        </p>
      </Reveal>
      {/* Full-bleed editorial rows using her real product photography */}
      <div className="divide-y divide-cream/10 border-y border-cream/10">
        {visibleScents.map((s, i) => {
          const display = getScentContent(contentMap, s.slug);
          return (
            <Link
              key={s.slug}
              href={`/scents/${s.slug}`}
              className="group grid gap-0 focus-visible:outline-offset-[-4px] md:grid-cols-2"
            >
              <div className={`relative ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <ParallaxImage
                  src={display.image}
                  alt={s.name}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="aspect-[16/11] w-full md:aspect-auto md:h-full md:min-h-[30rem]"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <Reveal className="flex flex-col justify-center px-6 py-14 md:px-16">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">
                  0{i + 1} · {s.mood}
                </p>
                <p
                  className="mt-3 font-display text-5xl italic transition-transform duration-300 group-hover:translate-x-2 motion-reduce:transition-none md:text-6xl"
                  style={{ color: s.accent === "#4F6B66" ? "#8FB3AC" : s.accent }}
                >
                  {s.name}
                </p>
                <p className="mt-4 max-w-sm text-cream/80">{display.story}</p>
                {s.notes.length > 0 && (
                  <p className="mt-3 text-sm uppercase tracking-wide text-cream/60">
                    {s.notes.slice(0, 4).join("  ·  ")}
                  </p>
                )}
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold-light">
                  Explore the scent
                  <span aria-hidden className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">&rarr;</span>
                </span>
              </Reveal>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
