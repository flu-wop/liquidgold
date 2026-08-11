import Link from "next/link";
import Image from "next/image";
import { scents } from "@/lib/scents";

export default function MeetTheScents() {
  return (
    <section className="bg-cocoa py-20 text-cream">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-2 font-display text-4xl md:text-5xl">
          Meet the <span className="italic text-gold-light">scents</span>
        </h2>
        <p className="mb-14 max-w-lg text-cream/60">
          Every fragrance is its own island escape. Choose the mood you want
          to wear.
        </p>
      </div>
      {/* Full-bleed editorial rows using her real product photography */}
      <div className="divide-y divide-cream/10">
        {scents.map((s, i) => (
          <Link
            key={s.slug}
            href={`/scents/${s.slug}`}
            className="group grid gap-0 md:grid-cols-2"
          >
            <div
              className={`relative aspect-[16/10] w-full md:aspect-auto ${
                i % 2 === 1 ? "md:order-2" : ""
              }`}
            >
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-14 md:px-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
                {s.mood}
              </p>
              <p
                className="mt-3 font-display text-5xl italic transition-transform duration-300 group-hover:translate-x-2 md:text-6xl"
                style={{ color: s.accent }}
              >
                {s.name}
              </p>
              <p className="mt-4 max-w-sm text-cream/70">{s.story}</p>
              {s.notes.length > 0 && (
                <p className="mt-3 text-sm uppercase tracking-wide text-cream/50">
                  {s.notes.slice(0, 4).join("  ·  ")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
