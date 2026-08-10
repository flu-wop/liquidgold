import Button from "@/components/ui/Button";

export default function WholesalePage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Bring the <span className="text-gold-gradient italic">island</span> to your shelves
      </h1>
      <p className="mt-6 text-cocoa/70">
        Liquid Gold Skin Co. partners with salons, spas, estheticians, and
        boutiques who want to offer a fragrance-forward body care experience
        their clients won&apos;t find anywhere else.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          { title: "Why Carry Liquid Gold", desc: "Small-batch, fragrance-led, built for repeat purchase and retail display." },
          { title: "Who We Work With", desc: "Salons, spas, estheticians, boutiques, and gift shops." },
          { title: "Partner Benefits", desc: "Wholesale pricing, marketing assets, and priority on new scent launches." },
        ].map((b) => (
          <div key={b.title}>
            <p className="font-display text-xl text-cocoa">{b.title}</p>
            <p className="mt-2 text-sm text-cocoa/60">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* PLACEHOLDER: form submit not wired yet — routes to Resend once
          the contact/notification layer is built */}
      <div className="mt-16 rounded-3xl bg-lagoon/10 p-8">
        <h2 className="font-display text-2xl text-cocoa">Apply for Wholesale</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2">
          <input placeholder="Business name" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <input placeholder="Email" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <input placeholder="Business type (salon, spa, boutique...)" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm md:col-span-2" />
          <textarea placeholder="Tell us about your business" rows={4} className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm md:col-span-2" />
          <Button type="submit" className="md:col-span-2 w-fit">Submit Application</Button>
        </form>
      </div>

      {/* PLACEHOLDER: link to real catalog PDF once she confirms it exists */}
      <p className="mt-8 text-sm text-cocoa/60">
        Prefer a PDF? [Wholesale catalog download — pending]
      </p>
    </section>
  );
}
