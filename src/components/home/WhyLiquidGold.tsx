import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const benefits = [
  { title: "Deep Hydration", desc: "Shea and cocoa butter base, whipped for 48 hours." },
  { title: "Glowing Skin", desc: "Jojoba and avocado oil for a natural, non-greasy glow." },
  { title: "Small-Batch", desc: "Made fresh in Bermuda-inspired batches, never mass-produced." },
  { title: "Island Fragrance", desc: "Every scent tells a story rooted in a real place." },
];

export default function WhyLiquidGold() {
  return (
    <section className="bg-cream px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5">
          <ParallaxImage
            src="/images/products/unscented-butter-2.jpg"
            alt="Liquid Gold Body Butter held in cupped hands"
            sizes="(max-width: 768px) 100vw, 40vw"
            className="clip-corner aspect-[4/5] w-full bg-sand"
          />
        </Reveal>
        <div className="md:col-span-7">
          <Reveal>
            <h2 className="font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
              Why <span className="text-gold-gradient italic">Liquid Gold</span>
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2" stagger={0.1}>
            {benefits.map((b, i) => (
              <RevealItem key={b.title} className="border-t border-cocoa/15 pt-5">
                <p className="font-display text-5xl font-light italic leading-none text-[#9C6B14] md:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-4 font-display text-2xl text-cocoa">{b.title}</p>
                <p className="mt-2 text-cocoa/70">{b.desc}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
