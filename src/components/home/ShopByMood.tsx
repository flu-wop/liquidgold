import Link from "next/link";
import { scents } from "@/lib/scents";
import type { Mood } from "@/lib/quiz";

const moods: Mood[] = ["Sexy", "Fresh", "Cozy", "Tropical", "Romantic", "Warm"];

export default function ShopByMood() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="mb-10 font-display text-4xl text-cocoa md:text-5xl">
        Shop by <span className="text-gold-gradient italic">mood</span>
      </h2>
      <div className="flex flex-col divide-y divide-cocoa/10 border-t border-cocoa/10">
        {moods.map((m) => {
          const scent = scents.find((s) => s.mood === m);
          return (
            <Link
              key={m}
              href={scent ? `/scents/${scent.slug}` : "/scents"}
              className="group flex items-center justify-between py-6 transition-colors hover:text-guava"
            >
              <span className="font-display text-4xl italic text-cocoa transition-colors group-hover:text-guava md:text-5xl">
                {m}
              </span>
              <span className="font-body text-sm uppercase tracking-widest text-cocoa/40 transition-transform group-hover:translate-x-1 group-hover:text-guava">
                {scent?.name ?? "Explore"} &rarr;
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
