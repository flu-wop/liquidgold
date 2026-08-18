import WholesaleForm from "./WholesaleForm";

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

      <WholesaleForm />

      {/* PLACEHOLDER: link to real catalog PDF once she confirms it exists */}
      <p className="mt-8 text-sm text-cocoa/60">
        Prefer a PDF? [Wholesale catalog download — pending]
      </p>
    </section>
  );
}
