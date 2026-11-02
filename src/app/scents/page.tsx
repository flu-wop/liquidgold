import Link from "next/link";
import Image from "next/image";
import { scents } from "@/lib/scents";
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
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {visibleScents.map((s) => (
          <Link
            key={s.slug}
            href={`/scents/${s.slug}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-cocoa/60">
              {s.mood}
            </p>
            <p className="font-display text-2xl italic text-cocoa">{s.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
