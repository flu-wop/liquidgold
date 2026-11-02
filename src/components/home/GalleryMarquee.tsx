import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";

// Immersive photo gallery: three stacked rows of tall rounded cards that
// drift in alternating directions, with soft edge fades, a category chip
// on every card and a caption that rises on hover. Pure CSS motion (see
// .marquee-track in globals.css), so it stays a server component and is
// fully static under prefers-reduced-motion (rows become swipeable).
// Layout pattern modelled on the gallery on chicagowaffles.com.

type Shot = { src: string; chip: string; title: string; sub: string; href: string };

const P = "/images/products/";
const shots: Shot[] = [
  { src: `${P}hero-ritual.jpg`, chip: "The Ritual", title: "Your daily glow", sub: "Butter, oil, and an island state of mind", href: "/shop" },
  { src: `${P}cocoa-cashmere-butter.jpg`, chip: "Body Butter", title: "Cocoa Cashmere", sub: "Warm, creamy, addictive", href: "/scents/cocoa-cashmere" },
  { src: `${P}pink-fantasy-oil-2.jpg`, chip: "Body Oil", title: "Pink Fantasy", sub: "Pink sunsets and flirty island energy", href: "/scents/pink-fantasy" },
  { src: `${P}juicy-paradise.jpg`, chip: "The Scents", title: "Juicy Paradise", sub: "Peach, guava, mango, papaya", href: "/scents/juicy-paradise" },
  { src: `${P}bare-current-butter.jpg`, chip: "Body Butter", title: "Bare Current", sub: "Sea spray and sun-warmed skin", href: "/scents/bare-current" },
  { src: `${P}unscented-butter-2.jpg`, chip: "The Ritual", title: "Unscented", sub: "Deep moisture, no fragrance", href: "/scents/unscented" },
  { src: `${P}cocoa-cashmere-oil.jpg`, chip: "Body Oil", title: "Cocoa Cashmere", sub: "A featherweight glow", href: "/scents/cocoa-cashmere" },
  { src: `${P}pink-fantasy.jpg`, chip: "The Scents", title: "Pink Fantasy", sub: "Butter + oil, island style", href: "/scents/pink-fantasy" },
  { src: `${P}bare-current-oil.jpg`, chip: "Body Oil", title: "Bare Current", sub: "Fresh out of the ocean", href: "/scents/bare-current" },
  { src: `${P}cocoa-cashmere-butter-2.jpg`, chip: "The Ritual", title: "Beach day, bottled", sub: "Whipped for 48 hours", href: "/shop#bundles" },
  { src: `${P}unscented-oil.jpg`, chip: "Body Oil", title: "Unscented Body Oil", sub: "Simple, natural, gentle", href: "/scents/unscented" },
  { src: `${P}cocoa-cashmere-oil-2.jpg`, chip: "The Ritual", title: "After the shower", sub: "Layer oil over butter", href: "/shop#bundles" },
];

// Three rows, each starting at a different photo so neighbours never match.
const rows = [
  { items: shots, duration: 70, reverse: false },
  { items: [...shots.slice(4), ...shots.slice(0, 4)], duration: 80, reverse: true },
  { items: [...shots.slice(8), ...shots.slice(0, 8)], duration: 62, reverse: false },
];

const CARD =
  "relative h-[280px] w-[200px] overflow-hidden rounded-2xl sm:h-[320px] sm:w-[240px] sm:rounded-3xl lg:h-[380px] lg:w-[280px] xl:h-[420px] xl:w-[320px]";

function Card({ shot, hidden }: { shot: Shot; hidden: boolean }) {
  return (
    <Link
      href={shot.href}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="group relative mx-2 flex-shrink-0 sm:mx-2.5 lg:mx-3"
    >
      <div className={CARD}>
        <Image
          src={shot.src}
          alt={hidden ? "" : `${shot.title} — ${shot.chip}`}
          fill
          sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 320px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/80 via-cocoa/10 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium text-cocoa backdrop-blur-sm sm:left-4 sm:top-4 lg:left-5 lg:top-5 lg:px-4 lg:py-2 lg:text-sm">
          {shot.chip}
        </span>
        <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:inset-x-5 lg:bottom-5">
          <p className="font-display text-xl text-cream lg:text-2xl">{shot.title}</p>
          <p className="mt-0.5 text-sm text-cream/85">{shot.sub}</p>
        </div>
      </div>
    </Link>
  );
}

export default function GalleryMarquee() {
  return (
    <section
      aria-label="Photo gallery"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-sand to-cream py-16 md:py-24"
    >
      <Reveal className="mx-auto mb-10 max-w-3xl px-6 text-center md:mb-14">
        <div className="flex items-center justify-center gap-4">
          <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-gold" />
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-guava">The Gallery</p>
          <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <h2 className="mt-5 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
          Island <span className="text-gold-gradient italic">moments</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cocoa/75 md:text-lg">
          A glimpse into the Liquid Gold ritual — real jars, real skin, real sunshine.
        </p>
      </Reveal>

      <div className="relative">
        {/* edge fades (wide screens) */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 bg-gradient-to-r from-cream to-transparent sm:block lg:w-48" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-24 bg-gradient-to-l from-cream to-transparent sm:block lg:w-48" />

        {rows.map((row, ri) => (
          <div
            key={ri}
            className={`marquee mb-4 overflow-hidden motion-reduce:overflow-x-auto sm:mb-5 lg:mb-6 ${row.reverse ? "marquee-reverse" : ""}`}
          >
            <div className="marquee-track flex w-max" style={{ animationDuration: `${row.duration}s` }}>
              {row.items.map((s, i) => (
                <Card key={`a${i}`} shot={s} hidden={ri > 0} />
              ))}
              {row.items.map((s, i) => (
                <Card key={`b${i}`} shot={s} hidden />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
