import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import { formatPrice } from "@/components/ui/Price";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import Reveal from "@/components/motion/Reveal";

// Homepage spotlight for the bundle, travel kit and perfume — the newer
// SKUs that otherwise only show up as a toggle inside each scent card.
const TILES = [
  {
    type: "Bundle",
    anchor: "bundles",
    kicker: "Bundle & save",
    title: "Butter + Oil",
    line: "8 oz Body Butter + 8 oz Body Oil, same scent.",
    preferScent: "cocoa-cashmere",
  },
  {
    type: "Travel Kit",
    anchor: "travel-kits",
    kicker: "New",
    title: "4-Piece Travel Kit",
    line: "Body wash, scrub, butter + a 5 mL perfume.",
    preferScent: "juicy-paradise",
  },
  {
    type: "Perfume",
    anchor: "perfume",
    kicker: "New",
    title: "10 mL Perfume",
    line: "Every Liquid Gold fragrance, pocket-size.",
    preferScent: "pink-fantasy",
  },
];

export default function SetsAndExtras({ hiddenSlugs }: { hiddenSlugs: Set<string> }) {
  const tiles = TILES.map((t) => {
    const options = products.filter((p) => p.type === t.type && !hiddenSlugs.has(p.scent));
    const pick = options.find((p) => p.scent === t.preferScent) ?? options[0];
    return pick ? { ...t, product: pick } : null;
  }).filter((t): t is NonNullable<typeof t> => t !== null);

  if (tiles.length === 0) return null;

  return (
    <section className="bg-cream px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
            Sets &amp; <span className="text-gold-gradient italic">extras</span>
          </h2>
          <p className="max-w-sm text-cocoa/70">
            Stock up, travel light, or layer your scent — new ways to wear Liquid Gold.
          </p>
        </Reveal>
        <RevealGroup className="grid gap-6 md:grid-cols-3" stagger={0.12}>
          {tiles.map((t) => (
            <RevealItem key={t.type}>
              <Link
                href={`/shop#${t.anchor}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
              >
                <div className="clip-corner relative aspect-[4/5] overflow-hidden bg-sand">
                  <Image
                    src={t.product.image}
                    alt={t.product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cocoa backdrop-blur">
                    {t.kicker}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl text-cocoa">{t.title}</p>
                    <p className="mt-1 text-sm text-cocoa/70">{t.line}</p>
                  </div>
                  <p className="whitespace-nowrap pt-1 font-semibold text-guava">
                    {formatPrice(t.product.price)}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
