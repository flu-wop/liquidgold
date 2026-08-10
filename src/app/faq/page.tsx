const faqs = [
  { q: "How long do products take to ship?", a: "[Placeholder — pending shipping policy from client.]" },
  { q: "What are your products made of?", a: "[Placeholder — full ingredient philosophy pending.]" },
  { q: "Are the products good for sensitive skin?", a: "[Placeholder.]" },
  { q: "What's your return policy?", a: "[Placeholder.]" },
  { q: "Do you offer wholesale?", a: "Yes — visit our Wholesale page to apply." },
  { q: "How long do products last once opened?", a: "[Placeholder.]" },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Frequently Asked <span className="text-gold-gradient italic">Questions</span>
      </h1>
      <div className="mt-10 divide-y divide-cocoa/10">
        {faqs.map((f) => (
          <div key={f.q} className="py-6">
            <p className="font-display text-lg text-cocoa">{f.q}</p>
            <p className="mt-2 text-sm text-cocoa/60">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
