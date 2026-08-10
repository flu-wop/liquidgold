// PLACEHOLDER: form submit currently does nothing — wire to Klaviyo (or
// Resend, if we're not using Klaviyo for this) once email/SMS marketing is
// scoped in Phase 3.

export default function JoinParadise() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="font-display text-3xl text-cocoa md:text-4xl">
        Join <span className="text-gold-gradient italic">Paradise</span>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-cocoa/60">
        Product launches, special offers, and skincare tips — no spam, just
        sunshine.
      </p>
      <form className="mx-auto mt-8 flex max-w-sm gap-2">
        <input
          type="email"
          placeholder="you@email.com"
          className="w-full rounded-full border border-cocoa/20 bg-cream px-5 py-3 text-sm outline-none focus:border-guava"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-full bg-guava px-6 py-3 text-sm font-semibold text-cream hover:bg-hibiscus"
        >
          Join
        </button>
      </form>
    </section>
  );
}
