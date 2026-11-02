import Link from "next/link";
import Image from "next/image";
import { scents } from "@/lib/scents";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";

export const dynamic = "force-dynamic";

export default async function ScentsIndexPage() {
  const hiddenSlugs = await getHiddenScentSlugs();
  const visibleScents = scents.filter((s) => !hiddenSlugs.has(s.slug));
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-6xl">
        Choose your <span className="text-gold-gradient italic">island escape</span>
      </h1>
      <RevealGroup className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
        {visibleScents.map((s) => (
          <RevealItem key={s.slug}>
          <Link
            href={`/scents/${s.slug}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
              <span className="absolute inset-x-4 bottom-4 translate-y-2 text-sm font-semibold uppercase tracking-widest text-cream opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                Shop {s.name} &rarr;
              </span>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1" style={{ background: s.accent }} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-cocoa/60">
              {s.mood}
            </p>
            <p className="font-display text-2xl italic text-cocoa">{s.name}</p>
            <p className="mt-1 text-sm text-cocoa/70">{s.personality}</p>
          </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
