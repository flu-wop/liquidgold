import Image from "next/image";
import Link from "next/link";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";

// Real customer reviews will populate this section once Judge.me or Okendo
// is installed per the architecture plan. Until then, this shows genuine
// product facts instead of invented customer quotes — fabricated
// testimonials (with fake names/locations) are a real liability once this
// goes live as a commerce site, not just a design placeholder.
//
// The founder note quotes Ariel's own published words from the About page
// (CONTENT_FIELDS["about.story"] default) — nothing new is attributed to her.

const highlights = [
  { label: "48-Hour Whip", detail: "Shea and cocoa butter base, whipped for 48 hours for a texture that melts on contact." },
  { label: "Small-Batch", detail: "Made fresh in Bermuda-inspired batches, never mass-produced or left sitting in a warehouse." },
  { label: "Squalane + Jojoba", detail: "Non-greasy glow, formulated to absorb fast instead of sitting on top of the skin." },
];

export default function Reviews({ founderImage }: { founderImage: string }) {
  return (
    <>
      {/* Editorial pull-quote band — product facts, not testimonials */}
      <section className="bg-lagoon/10 px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lagoon-deep">
              Why people choose Liquid Gold
            </p>
            <blockquote className="mt-6 font-display text-3xl leading-[1.12] text-cocoa sm:text-4xl md:text-6xl">
              <span aria-hidden className="mr-1 text-gold">&ldquo;</span>
              Whipped for 48 hours. Made in small batches.{" "}
              <span className="text-gold-gradient italic">Never left sitting in a warehouse.</span>
              <span aria-hidden className="ml-1 text-gold">&rdquo;</span>
            </blockquote>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-8 border-t border-cocoa/15 pt-10 md:grid-cols-3" stagger={0.1}>
            {highlights.map((h) => (
              <RevealItem key={h.label}>
                <p className="font-display text-xl italic text-cocoa">{h.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-cocoa/75">{h.detail}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Founder note — founder-ariel.jpg is her signature, so it signs the note */}
      <section className="bg-sand px-4 py-20 sm:px-6 md:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-guava">A note from the founder</p>
          <p className="mt-6 font-display text-3xl leading-[1.15] text-cocoa md:text-5xl">
            &ldquo;This brand is more than skin deep to me.{" "}
            <span className="text-gold-gradient italic">It&rsquo;s family deep.</span>&rdquo;
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cocoa/75">
            My skin journey began in 2019 — this has become my life and my passion. Thank you for
            being here and for joining me on this journey. Your glow is waiting.
          </p>
          <div className="relative mx-auto mt-8 h-24 w-56 md:h-28 md:w-64">
            <Image
              src={founderImage}
              alt="Signature of Ariel Salgado, founder of Liquid Gold Skin Co."
              fill
              sizes="256px"
              className="object-contain mix-blend-multiply"
            />
          </div>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-cocoa/60">Ariel Salgado, founder</p>
          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cocoa"
          >
            Read her story
            <span aria-hidden className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
              &rarr;
            </span>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
