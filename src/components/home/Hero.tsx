import Button from "@/components/ui/Button";
import Marquee from "@/components/motion/Marquee";
import { HeroHeadline, HeroFade, HeroImage } from "@/components/home/HeroMotion";
import { CONTENT_FIELDS } from "@/lib/content";

type HeroProps = { headline: string; subheadline: string; image: string };

export default function Hero({ headline, subheadline, image }: HeroProps) {
  // The default headline gets the fancy multi-line/gold-italic-last-word
  // treatment. If Ariel overrides it in admin, we render it as clean plain
  // text instead — trying to auto-detect "which word should be gold
  // italic" from freeform text she typed would be fragile, so we
  // deliberately trade a little visual flourish for never guessing wrong.
  const isDefaultHeadline = headline === CONTENT_FIELDS["hero.headline"].default;
  const lines = isDefaultHeadline ? ["Your skin", "just went on", "vacation."] : [headline];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-sand">
        {/* Mobile: image leads, headline rises over its faded lower edge.
            Desktop: full-height image on the right, headline overlaps its
            left edge where a sand gradient keeps the type legible. */}
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/11] md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[62%]">
          <div className="clip-corner absolute inset-0 md:[clip-path:none]">
            <HeroImage src={image} alt="Liquid Gold Skin Co. — island-inspired body care ritual" />
          </div>
          {/* scrims: bottom fade on mobile, left fade on desktop */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sand from-25% via-sand/80 to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-sand via-sand/75 to-transparent md:block" />
        </div>

        <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-5 pb-14 sm:-mt-28 sm:px-6 md:mt-0 md:flex md:min-h-[calc(100svh-4.5rem)] md:items-center md:py-24">
          <div className="md:max-w-[44rem]">
            <HeroFade delay={0.05}>
              <span className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-guava">
                Island-Inspired Body Care
              </span>
            </HeroFade>
            <HeroHeadline
              lines={lines}
              accentLast={isDefaultHeadline}
              className={
                isDefaultHeadline
                  ? "font-display text-[3.6rem] font-semibold leading-[0.92] tracking-tight text-cocoa sm:text-7xl lg:text-[6.5rem]"
                  : "font-display text-5xl font-semibold leading-[1.02] tracking-tight text-cocoa md:text-6xl lg:text-7xl"
              }
            />
            <HeroFade delay={0.65}>
              <p className="mt-7 max-w-sm font-body text-lg text-cocoa/75">{subheadline}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button href="/shop">Shop the Escape</Button>
                <Button href="/quiz" variant="secondary">
                  Find Your Island Scent
                </Button>
              </div>
            </HeroFade>
          </div>
        </div>
      </section>
      <Marquee
        className="bg-cocoa py-3.5 font-body text-xs font-semibold uppercase tracking-[0.25em] text-cream/90"
        items={[
          "Free shipping over $75",
          "Small-batch, made fresh",
          "Island-inspired body care",
          "Free shipping over $75",
          "Small-batch, made fresh",
          "Island-inspired body care",
        ]}
      />
    </>
  );
}
