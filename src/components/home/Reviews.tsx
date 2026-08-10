// PLACEHOLDER: real reviews (with photo/video) come from the Judge.me or
// Okendo app once installed, per the architecture plan. This is static
// mock content standing in for that layout.

const reviews = [
  { name: "Amara T.", quote: "Smells like an actual vacation. My skin has never been this soft.", scent: "Horseshoe Bay" },
  { name: "Jade R.", quote: "Royal Dockyard is unreal for date night. So many compliments.", scent: "Royal Dockyard" },
  { name: "Priya M.", quote: "The quiz recommended Gold Hill and it's now all I wear.", scent: "Gold Hill" },
];

export default function Reviews() {
  return (
    <section className="bg-lagoon/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 font-display text-3xl text-cocoa md:text-4xl">
          What people are <span className="text-gold-gradient italic">saying</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-3xl bg-cream p-8 shadow-sm">
              <p className="font-display text-lg italic text-cocoa">&ldquo;{r.quote}&rdquo;</p>
              <p className="mt-4 text-sm text-cocoa/60">
                {r.name} · {r.scent}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
