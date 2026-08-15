import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        My <span className="text-gold-gradient italic">Story</span>
      </h1>
      <p className="mt-4 font-display text-lg italic text-cocoa/60">
        More than Skin Deep
      </p>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-cocoa/70">
        <p>I&rsquo;m Ariel Salgado &mdash; founder of Liquid Gold Skin Co.</p>
        <p>
          This brand is more than skin deep to me. It&rsquo;s family deep.
          It&rsquo;s a story of growth, resilience, and learning how to love
          myself, one small habit at a time.
        </p>
        <p>
          Being surrounded by the incredibly strong women in my family set my
          mind on success &amp; what it could look like, but the way I
          measured success was a bit different. I paved my own path, was on
          the ground running at 18. Corporate lifestyle was never for me. I
          knew I had to be my own boss. Creating discipline and healthy
          habits for myself didn&rsquo;t come easy. I lost my mother before
          the age of 20 &mdash; she was a great pillar of success in my life.
          Losing my mother young felt like a setback, and I no longer knew
          what it meant to take care of myself. I was not living, I was
          surviving.
        </p>
        <p>
          And through that survival, you grow. I didn&rsquo;t know what was
          right or wrong, but I knew one thing: I love to learn. I dove into
          research, experimented with natural ingredients, and slowly began
          creating products for myself.
        </p>
        <p>
          My skin journey began in 2019 &mdash; this has become my life and
          my passion. Over the years, I continued to make transitions out of
          consumerism that is detrimental to our skin and ultimately our
          health. This is my way of transforming an idea taught to us that we
          know to question but are confused how to into something beautiful
          and intentional.
        </p>
        <p>
          Thank you for being here and for joining me on this journey. Your
          glow is waiting.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl">
        <Image
          src="/images/brand/founder-ariel.jpg"
          alt="Ariel Salgado, founder of Liquid Gold Skin Co."
          width={1021}
          height={1080}
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="mt-16">
        <h2 className="font-display text-3xl text-cocoa md:text-4xl">
          Our <span className="text-gold-gradient italic">Mission</span>
        </h2>
        <p className="mt-2 font-display text-sm font-semibold uppercase tracking-widest text-guava">
          Affordable. Clean. Beauty.
        </p>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-cocoa/70">
          <p>
            At Liquid Gold Skin Co., we believe self care isn&rsquo;t just a
            luxury &mdash; it&rsquo;s a necessity. Every product is made with
            love and intention, turning your daily skincare into a ritual of
            self love and a reminder to let go of the harsh chemicals and
            preservatives. Preserve yourself inside and out.
          </p>
          <p>
            This is a journey that we are on together &mdash; letting go of
            the unnatural and making the effort to enjoy taking care of our
            body and skin more than ever. It is a war against the unnatural,
            and together we are going to win!
          </p>
          <p className="font-display italic text-cocoa">Yours truly, Ariel</p>
        </div>
      </div>
    </section>
  );
}
