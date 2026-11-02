import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import GalleryAddButton from "@/components/home/GalleryAddButton";
import { getProduct, type Product } from "@/lib/products";
import { formatPrice } from "@/components/ui/Price";


// Immersive photo gallery: three stacked rows of tall rounded cards that
// drift in alternating directions, with soft edge fades, a category chip
// on every card and a caption that rises on hover. Pure CSS motion (see
// .marquee-track in globals.css), so it stays a server component and is
// fully static under prefers-reduced-motion (rows become swipeable).
// Layout pattern modelled on the gallery on chicagowaffles.com.

// Mostly Ariel's own photography (public/images/gallery/g01..g16.jpg);
// real product shots fill the gaps and can be added to the cart straight
// from the gallery. Photos link to the scent they show, or to the shop.
type Photo = { kind: "photo"; n: number; alt: string; href: string; title: string; sub: string; chip: string };
type Prod = { kind: "product"; handle: string; src: string };
type Item = Photo | Prod;
type Entry = (Photo & { src: string }) | (Prod & { product: Product });

const ON_LOCATION = { title: "Liquid Gold, on location", sub: "Shop the collection", chip: "The Ritual" };
const photo = (n: number, alt: string, href = "/shop", extra: Partial<Photo> = {}): Photo => ({
  kind: "photo", n, alt, href, ...ON_LOCATION, ...extra,
});
const scentPhoto = (n: number, alt: string, slug: string, name: string, chip: string): Photo =>
  photo(n, alt, `/scents/${slug}`, { title: name, sub: "Explore the scent", chip });
const prod = (handle: string, src: string): Prod => ({ kind: "product", handle, src: `/images/products/${src}` });

const ROWS: { items: Item[]; duration: number; reverse: boolean }[] = [
  {
    duration: 78, reverse: false,
    items: [
      scentPhoto(2, "Two friends on the beach holding a jar of Cocoa Cashmere body butter", "cocoa-cashmere", "Cocoa Cashmere", "Body Butter"),
      scentPhoto(6, "Bare Current body oil on a tray of shells at the water's edge", "bare-current", "Bare Current", "Body Oil"),
      prod("cocoa-cashmere-butter-8oz", "cocoa-cashmere-butter.jpg"),
      scentPhoto(10, "A man resting on the sand with a bottle of Juicy Paradise body oil", "juicy-paradise", "Juicy Paradise", "Body Oil"),
      photo(3, "Smoothing body butter over glowing skin on a boat"),
      prod("bare-current-oil-8oz", "bare-current-oil.jpg"),
      scentPhoto(14, "A stack of Cocoa Cashmere body butter jars on gold fabric", "cocoa-cashmere", "Cocoa Cashmere", "Body Butter"),
      photo(1, "Two friends taking a selfie on a white-sand beach"),
    ],
  },
  {
    duration: 88, reverse: true,
    items: [
      scentPhoto(5, "A hand holding Pink Fantasy body butter over a turquoise lagoon", "pink-fantasy", "Pink Fantasy", "Body Butter"),
      prod("pink-fantasy-bundle-8oz-8oz", "pink-fantasy.jpg"),
      photo(7, "Body oils resting in the sand with shells"),
      scentPhoto(11, "Unscented body butter on a blue crochet bag", "unscented", "Unscented", "Body Butter"),
      prod("juicy-paradise-bundle-8oz-8oz", "juicy-paradise.jpg"),
      photo(8, "Two friends laughing in the shallows at sunset"),
      photo(12, "Body oil glistening on sun-warmed skin", "/shop", { chip: "Body Oil" }),
      prod("unscented-butter-8oz", "unscented-butter.jpg"),
    ],
  },
  {
    duration: 70, reverse: false,
    items: [
      scentPhoto(16, "Pink Fantasy body oil balanced against the turquoise sea", "pink-fantasy", "Pink Fantasy", "Body Oil"),
      photo(4, "A woman holding a bottle of body oil against her cheek on the beach"),
      prod("cocoa-cashmere-bundle-8oz-8oz", "bundle-cocoa-cashmere.jpg"),
      photo(13, "Friends relaxing at the edge of a resort pool"),
      photo(9, "Posing in a sea cave with a bottle of body oil"),
      prod("bare-current-butter-8oz", "bare-current-butter.jpg"),
      photo(15, "Breathing in the scent of a body butter on a boat"),
      prod("juicy-paradise-butter-8oz", "hero-ritual.jpg"),
    ],
  },
];

const rows = ROWS.map((r) => ({
  ...r,
  items: r.items.flatMap((it): Entry[] => {
    if (it.kind === "photo") return [{ ...it, src: `/images/gallery/g${String(it.n).padStart(2, "0")}.jpg` }];
    const product = getProduct(it.handle);
    return product ? [{ ...it, product }] : [];
  }),
}));

const CARD =
  "relative h-[280px] w-[200px] overflow-hidden rounded-2xl sm:h-[320px] sm:w-[240px] sm:rounded-3xl lg:h-[380px] lg:w-[280px] xl:h-[420px] xl:w-[320px]";

function Card({ entry, hidden }: { entry: Entry; hidden: boolean }) {
  if (entry.kind === "photo") {
    return (
      <div className="group relative mx-2 flex-shrink-0 sm:mx-2.5 lg:mx-3" aria-hidden={hidden || undefined}>
        <div className={CARD}>
          <Link href={entry.href} tabIndex={hidden ? -1 : undefined} className="absolute inset-0 z-10" aria-label={`${entry.title} — ${entry.sub}`} />
          <Image
            src={entry.src}
            alt={hidden ? "" : entry.alt}
            fill
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 320px"
            className="object-cover object-[50%_35%] transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium text-cocoa backdrop-blur-sm sm:left-4 sm:top-4 lg:left-5 lg:top-5 lg:px-4 lg:py-2 lg:text-sm">
            {entry.chip}
          </span>
          <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:inset-x-5 lg:bottom-5">
            <p className="font-display text-xl text-cream lg:text-2xl">{entry.title}</p>
            <p className="mt-0.5 text-sm text-cream/90">{entry.sub} &rarr;</p>
          </div>
        </div>
      </div>
    );
  }
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
          {p.type}
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-guava-deep">The Gallery</p>
          <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <h2 className="mt-5 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
          Island <span className="text-gold-gradient italic">moments</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cocoa/75 md:text-lg">
          Real jars, real skin, real sunshine. Tap + on any product to add it straight to your cart.
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
