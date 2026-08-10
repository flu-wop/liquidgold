const benefits = [
  { title: "Deep Hydration", desc: "Shea and cocoa butter base, whipped for 48 hours." },
  { title: "Glowing Skin", desc: "Squalane and jojoba oil for a natural, non-greasy glow." },
  { title: "Small-Batch", desc: "Made fresh in Bermuda-inspired batches, never mass-produced." },
  { title: "Island Fragrance", desc: "Every scent tells a story rooted in a real place." },
];

export default function WhyLiquidGold() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 font-display text-3xl text-cocoa md:text-4xl">
        Why <span className="text-gold-gradient italic">Liquid Gold</span>
      </h2>
      <div className="grid gap-8 md:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.title}>
            <div className="mb-4 h-1 w-10 rounded-full bg-gold" />
            <p className="font-display text-xl text-cocoa">{b.title}</p>
            <p className="mt-2 text-sm text-cocoa/60">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
