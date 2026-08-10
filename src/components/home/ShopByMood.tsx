import Link from "next/link";
import { scents } from "@/lib/scents";
import type { Mood } from "@/lib/quiz";

const moods: { label: Mood; color: string }[] = [
  { label: "Sexy", color: "bg-hibiscus" },
  { label: "Fresh", color: "bg-lagoon" },
  { label: "Cozy", color: "bg-gold" },
  { label: "Tropical", color: "bg-guava" },
  { label: "Romantic", color: "bg-hibiscus" },
  { label: "Warm", color: "bg-gold" },
];

export default function ShopByMood() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 font-display text-3xl text-cocoa md:text-4xl">
        Shop by <span className="text-gold-gradient italic">mood</span>
      </h2>
      <div className="flex flex-wrap gap-4">
        {moods.map((m) => {
          const scent = scents.find((s) => s.mood === m.label);
          return (
            <Link
              key={m.label}
              href={scent ? `/scents/${scent.slug}` : "/scents"}
              className={`${m.color} rounded-full px-8 py-4 font-display text-lg italic text-cream transition-transform hover:scale-105`}
            >
              {m.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
