import Image from "next/image";
import Button from "@/components/ui/Button";
import Reassurance from "@/components/ui/Reassurance";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-sand px-6 pb-20 pt-14 md:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <span className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-guava">
            Island-Inspired Body Care
          </span>
          <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-cocoa md:text-7xl">
            Your skin
            <br />
            just went on
            <br />
            <span className="text-gold-gradient italic">vacation.</span>
          </h1>
          <p className="mt-7 max-w-sm font-body text-lg text-cocoa/70">
            Island-inspired body care made to leave your skin soft, glowing,
            and impossible to forget.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/shop">Shop the Escape</Button>
            <Button href="/quiz" variant="secondary">
              Find Your Island Scent
            </Button>
          </div>
          <Reassurance>Free shipping over $50 · Small-batch, made fresh</Reassurance>
        </div>
        {/* Real lifestyle photo from her live site */}
        <div className="clip-corner relative aspect-[4/5] w-full overflow-hidden md:col-span-3 md:aspect-[16/10]">
          <Image
            src="/images/products/hero-ritual.jpg"
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
