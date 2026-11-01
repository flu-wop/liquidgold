import Link from "next/link";
import Image from "next/image";
import { scents } from "@/lib/scents";
import type { Mood } from "@/lib/quiz";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const moods: Mood[] = ["Sexy", "Fresh", "Cozy", "Tropical", "Romantic", "Warm"];

export default function ShopByMood({ hiddenSlugs }: { hiddenSlugs: Set<string> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <h2 className="mb-10 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
          Shop by <span className="text-gold-gradient italic">mood</span>
        </h2>
      </Reveal>
      <RevealGroup className="flex flex-col divide-y divide-cocoa/10 border-y border-cocoa/10" stagger={0.07}>
        {moods.map((m) => {
          const scent = scents.find((s) => s.mood === m && !hiddenSlugs.has(s.slug));
          const accent = scent?.accent ?? "#FF6F52";
          return (
            <RevealItem key={m}>
              <Link
                href={scent ? `/scents/${scent.slug}` : "/scents"}
                className="group relative isolate flex items-center justify-between gap-4 overflow-hidden py-5 md:py-6"
                style={{ "--accent": accent } as React.CSSProperties}
              >
                {/* accent wash slides in from the left on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[color:var(--accent)] opacity-10 transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                />
                <span className="font-display text-4xl italic text-cocoa transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-[color:var(--accent)] motion-reduce:transition-none md:text-6xl">
                  {m}
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-body text-xs uppercase tracking-widest text-cocoa/60 transition-colors group-hover:text-cocoa sm:text-sm">
                    {scent?.name ?? "Explore"} &rarr;
                  </span>
                  {scent && (
                    <span className="clip-corner relative hidden h-16 w-12 flex-shrink-0 translate-x-6 overflow-hidden opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none md:block md:h-20 md:w-16">
                      <Image src={scent.image} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                  )}
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
