export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Our <span className="text-gold-gradient italic">Story</span>
      </h1>
      {/* PLACEHOLDER: real founder story, photos, and behind-the-scenes
          content pending from Liquid Gold */}
      <div className="mt-8 aspect-video w-full rounded-3xl bg-gradient-to-br from-guava/40 via-gold/40 to-lagoon/40" />
      <p className="mt-8 text-lg leading-relaxed text-cocoa/70">
        [Founder story placeholder — Bermuda connection, why Liquid Gold was
        created, what makes the products different. Real copy pending from
        the client.]
      </p>
      <p className="mt-6 text-lg leading-relaxed text-cocoa/70">
        [Brand mission placeholder.]
      </p>
    </section>
  );
}
