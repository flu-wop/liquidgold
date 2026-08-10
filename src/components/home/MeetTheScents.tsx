import Link from "next/link";
import { scents } from "@/lib/scents";

export default function MeetTheScents() {
  return (
    <section className="bg-cocoa px-6 py-20 text-cream">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 font-display text-3xl md:text-4xl">
          Meet the <span className="italic text-gold-light">scents</span>
        </h2>
        <p className="mb-10 max-w-lg text-cream/60">
          Every fragrance is its own island escape. Choose the mood you want
          to wear.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {scents.map((s) => (
            <Link
              key={s.slug}
              href={`/scents/${s.slug}`}
              className="group block rounded-3xl border border-cream/10 p-8 transition-colors hover:border-cream/30"
              style={{ background: `${s.accent}1a` }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-cream/50">
                {s.mood}
              </p>
              <p className="mt-2 font-display text-2xl italic" style={{ color: s.accent }}>
                {s.name}
              </p>
              <p className="mt-3 text-sm text-cream/70">{s.notes.join(" · ")}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
