import Button from "@/components/ui/Button";
import Reassurance from "@/components/ui/Reassurance";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-lagoon/10 via-sand to-sand px-6 pb-20 pt-16 md:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div>
          <span className="mb-4 inline-block rounded-full bg-guava/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-guava">
            Island-Inspired Body Care
          </span>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-cocoa md:text-7xl">
            Your skin just went on{" "}
            <span className="text-gold-gradient italic">vacation.</span>
          </h1>
          <p className="mt-6 max-w-md font-body text-lg text-cocoa/70">
            Island-inspired body care made to leave your skin soft, glowing,
            and impossible to forget.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/shop">Shop the Escape</Button>
            <Button href="/quiz" variant="secondary">
              Find Your Island Scent
            </Button>
          </div>
          <Reassurance>Free shipping over $50 · Small-batch, made fresh</Reassurance>
        </div>
        {/* PLACEHOLDER: swap for real hero photo/video — body butter texture,
            glowing skin, Bermuda water — per her brief */}
        <div className="blob grain aspect-square w-full bg-gradient-to-br from-guava via-gold to-lagoon opacity-80 md:aspect-[4/5]" />
      </div>
    </section>
  );
}
