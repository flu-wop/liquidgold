import Image from "next/image";
import Button from "@/components/ui/Button";
import Reassurance from "@/components/ui/Reassurance";
import { CONTENT_FIELDS } from "@/lib/content";

type HeroProps = { headline: string; subheadline: string; image: string };

export default function Hero({ headline, subheadline, image }: HeroProps) {
  // The default headline gets the fancy multi-line/gold-italic-last-word
  // treatment. If Ariel overrides it in admin, we render it as clean plain
  // text instead — trying to auto-detect "which word should be gold
  // italic" from freeform text she typed would be fragile, so we
  // deliberately trade a little visual flourish for never guessing wrong.
  const isDefaultHeadline = headline === CONTENT_FIELDS["hero.headline"].default;

  return (
    <section className="relative overflow-hidden bg-sand px-6 pb-20 pt-14 md:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <span className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-guava">
            Island-Inspired Body Care
          </span>
          {isDefaultHeadline ? (
            <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-cocoa md:text-7xl">
              Your skin
              <br />
              just went on
              <br />
              <span className="text-gold-gradient italic">vacation.</span>
            </h1>
          ) : (
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-cocoa md:text-6xl">
              {headline}
            </h1>
          )}
          <p className="mt-7 max-w-sm font-body text-lg text-cocoa/70">
            {subheadline}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/shop">Shop the Escape</Button>
            <Button href="/quiz" variant="secondary">
              Find Your Island Scent
            </Button>
          </div>
          <Reassurance>Free shipping over $50 · Small-batch, made fresh</Reassurance>
        </div>
        <div className="clip-corner relative aspect-[4/5] w-full overflow-hidden md:col-span-3 md:aspect-[16/10]">
          <Image
            src={image}
            alt="Liquid Gold Skin Co. — island-inspired body care ritual"
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
