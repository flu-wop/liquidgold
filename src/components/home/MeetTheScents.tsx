import Link from "next/link";
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
      {/* Full-bleed editorial rows — each scent gets real room, not a card */}
      <div className="divide-y divide-cream/10">
        {scents.map((s, i) => (
          <Link
            key={s.slug}
            href={`/scents/${s.slug}`}
            className="group grid gap-0 md:grid-cols-2"
          >
            <div
              className={`grain aspect-[16/10] w-full md:aspect-auto ${
                i % 2 === 1 ? "md:order-2" : ""
              }`}
              style={{ background: `linear-gradient(135deg, ${s.accent}, #3A2318)` }}
            />
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
              <p className="mt-4 text-sm uppercase tracking-wide text-cream/60">
                {s.notes.join("  ·  ")}
              </p>
              <p className="mt-4 max-w-sm text-cream/70">{s.story}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
