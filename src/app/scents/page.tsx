import Link from "next/link";
import Image from "next/image";
import { scents } from "@/lib/scents";

export default function ScentsIndexPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Choose your <span className="text-gold-gradient italic">island escape</span>
      </h1>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {scents.map((s) => (
          <Link
            key={s.slug}
            href={`/scents/${s.slug}`}
            className="group block overflow-hidden rounded-3xl"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-cocoa/50">
              {s.mood}
            </p>
            <p className="font-display text-2xl italic text-cocoa">{s.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
