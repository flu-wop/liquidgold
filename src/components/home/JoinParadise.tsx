import Reveal from "@/components/motion/Reveal";

// PLACEHOLDER: form submit currently does nothing — wire to Klaviyo (or
// Resend, if we're not using Klaviyo for this) once email/SMS marketing is
// scoped in Phase 3. Restyled only; still not connected to anything.

export default function JoinParadise({
  headline,
  subheadline,
}: {
  headline: string;
  subheadline: string;
}) {
  return (
    <section id="join-paradise" className="scroll-mt-24 px-4 py-24 sm:px-6 md:py-32">
      <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream via-sand to-guava/15 px-6 py-16 text-center shadow-[0_30px_80px_-40px_rgba(58,35,24,0.35)] md:px-16 md:py-20">
        <div aria-hidden className="blob absolute -right-24 -top-24 h-64 w-64 bg-gold/20 blur-2xl" />
        <div aria-hidden className="blob absolute -bottom-28 -left-20 h-72 w-72 bg-lagoon/15 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-guava">Newsletter</p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] text-cocoa md:text-6xl">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-cocoa/75">{subheadline}</p>
          <form className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row sm:gap-2">
            <label htmlFor="join-paradise-email" className="sr-only">
              Email address
            </label>
            <input
              id="join-paradise-email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              className="min-h-[48px] w-full rounded-full border border-cocoa/20 bg-cream px-5 py-3 text-base text-cocoa outline-none transition-colors placeholder:text-cocoa/40 focus:border-guava sm:text-sm"
            />
            <button
              type="submit"
              className="min-h-[48px] whitespace-nowrap rounded-full bg-guava px-7 py-3 text-sm font-semibold text-cream transition-[background-color,transform] duration-200 hover:bg-hibiscus active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Join Paradise
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
