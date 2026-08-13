// PLACEHOLDER: real reviews (with photo/video) come from the Judge.me or
// Okendo app once installed, per the architecture plan. This is static
// mock content standing in for that layout.

// Real customer reviews will populate this section once Judge.me or Okendo
// is installed per the architecture plan. Until then, this shows genuine
// product facts instead of invented customer quotes — fabricated
// testimonials (with fake names/locations) are a real liability once this
// goes live as a commerce site, not just a design placeholder.

const highlights = [
  { label: "48-Hour Whip", detail: "Shea and cocoa butter base, whipped for 48 hours for a texture that melts on contact." },
  { label: "Small-Batch", detail: "Made fresh in Bermuda-inspired batches, never mass-produced or left sitting in a warehouse." },
  { label: "Squalane + Jojoba", detail: "Non-greasy glow, formulated to absorb fast instead of sitting on top of the skin." },
];

export default function Reviews() {
  return (
    <section className="bg-lagoon/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 font-display text-3xl text-cocoa md:text-4xl">
          Why people <span className="text-gold-gradient italic">choose Liquid Gold</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.label} className="rounded-3xl bg-cream p-8 shadow-sm">
              <p className="font-display text-lg italic text-cocoa">{h.label}</p>
              <p className="mt-4 text-sm text-cocoa/70">{h.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-cocoa/50">
          Customer reviews coming soon — this section is wired for Judge.me/Okendo once installed.
        </p>
      </div>
    </section>
  );
}
