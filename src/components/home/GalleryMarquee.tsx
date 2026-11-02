import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import GalleryAddButton from "@/components/home/GalleryAddButton";
import { getProduct, type Product } from "@/lib/products";
import { formatPrice } from "@/components/ui/Price";

type Entry = { src: string; handle: string; product: Product };

// Immersive photo gallery: three stacked rows of tall rounded cards that
// drift in alternating directions, with soft edge fades, a category chip
// on every card and a caption that rises on hover. Pure CSS motion (see
// .marquee-track in globals.css), so it stays a server component and is
// fully static under prefers-reduced-motion (rows become swipeable).
// Layout pattern modelled on the gallery on chicagowaffles.com.

// Products only: every card is a real, purchasable SKU (photo -> handle),
// and can be added to the cart right from the gallery. Perfume and travel
// kits join once they have real photography.
type Shot = { src: string; handle: string };

const P = "/images/products/";
const SHOTS: Shot[] = [
  { src: `${P}hero-ritual.jpg`, handle: "juicy-paradise-butter-8oz" },
  { src: `${P}cocoa-cashmere-butter.jpg`, handle: "cocoa-cashmere-butter-8oz" },
  { src: `${P}pink-fantasy-oil-2.jpg`, handle: "pink-fantasy-oil-8oz" },
  { src: `${P}bundle-cocoa-cashmere.jpg`, handle: "cocoa-cashmere-bundle-8oz-8oz" },
  { src: `${P}bare-current-butter.jpg`, handle: "bare-current-butter-8oz" },
  { src: `${P}unscented-butter-2.jpg`, handle: "unscented-butter-8oz" },
  { src: `${P}cocoa-cashmere-oil.jpg`, handle: "cocoa-cashmere-oil-8oz" },
  { src: `${P}juicy-paradise.jpg`, handle: "juicy-paradise-bundle-8oz-8oz" },
  { src: `${P}bare-current-oil.jpg`, handle: "bare-current-oil-8oz" },
  { src: `${P}pink-fantasy.jpg`, handle: "pink-fantasy-bundle-8oz-8oz" },
  { src: `${P}unscented-oil.jpg`, handle: "unscented-oil-8oz" },
  { src: `${P}bundle-bare-current.jpg`, handle: "bare-current-bundle-8oz-8oz" },
];

const entries = SHOTS.flatMap((s) => {
  const product = getProduct(s.handle);
  return product ? [{ ...s, product }] : [];
});

// Three rows, each starting at a different photo so neighbours never match.
const rows = [
  { items: entries, duration: 70, reverse: false },
  { items: [...entries.slice(4), ...entries.slice(0, 4)], duration: 80, reverse: true },
  { items: [...entries.slice(8), ...entries.slice(0, 8)], duration: 62, reverse: false },
];

const CARD =
  "relative h-[280px] w-[200px] overflow-hidden rounded-2xl sm:h-[320px] sm:w-[240px] sm:rounded-3xl lg:h-[380px] lg:w-[280px] xl:h-[420px] xl:w-[320px]";

function Card({ entry, hidden }: { entry: Entry; hidden: boolean }) {
  const p = entry.product;
  const title = p.name.split(" — ")[0];
  return (
    <div className="group relative mx-2 flex-shrink-0 sm:mx-2.5 lg:mx-3" aria-hidden={hidden || undefined}>
      <div className={CARD}>
        <Link href={`/products/${p.handle}`} tabIndex={hidden ? -1 : undefined} className="absolute inset-0 z-10" aria-label={`${title}, ${formatPrice(p.price)}`} />
        <Image
          src={entry.src}
          alt={hidden ? "" : title}
          fill
          sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 320px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-95" />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium text-cocoa backdrop-blur-sm sm:left-4 sm:top-4 lg:left-5 lg:top-5 lg:px-4 lg:py-2 lg:text-sm">
          {p.type === "Bundle" ? "Bundle" : p.type}
        </span>
        <div className="pointer-events-none absolute bottom-3 left-3 right-16 sm:bottom-4 sm:left-4 lg:bottom-5 lg:left-5">
          <p className="font-display text-lg leading-tight text-cream lg:text-xl">{title}</p>
          <p className="mt-0.5 text-sm text-cream/85">
            {p.size} · {formatPrice(p.price)}
          </p>
        </div>
        <GalleryAddButton product={p} decorative={hidden} />
      </div>
    </div>
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-guava">Shop the Gallery</p>
          <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <h2 className="mt-5 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
          Island <span className="text-gold-gradient italic">moments</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cocoa/75 md:text-lg">
          Every photo is a real product. Tap + to add it straight to your cart.
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
                <Card key={`a${i}`} entry={s} hidden={ri > 0} />
              ))}
              {row.items.map((s, i) => (
                <Card key={`b${i}`} entry={s} hidden />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
