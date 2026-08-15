const steps = [
  {
    title: "You Shop",
    body: "Every purchase you make counts.",
  },
  {
    title: "We Match",
    body: "For every order, we donate $1 to one of our partner charities.",
  },
  {
    title: "We Share the Glow",
    body: "Your self-care becomes someone else's self-care.",
  },
];

const charities = [
  {
    name: "National Eczema Association",
    body: "Providing education, advocacy, and support for those with eczema.",
  },
  {
    name: "Coalition of Skin Diseases",
    body: "Advocating for people living with chronic skin conditions.",
  },
  {
    name: "Care for Skin Foundation",
    body: "Offering skincare and reconstructive care to people in need around the world.",
  },
  {
    name: "Beauty Bus Foundation",
    body: "Delivering beauty and grooming services to patients and caregivers in need of comfort.",
  },
  {
    name: "Project Beauty Share",
    body: "Distributing hygiene and beauty products to women and families overcoming abuse, addiction, and homelessness.",
  },
];

export default function GiveBackPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-guava">
        Buy a Jar. Give $1. Share the Glow.
      </p>
      <h1 className="mt-2 font-display text-4xl text-cocoa md:text-5xl">
        Every Order <span className="text-gold-gradient italic">Gives Back</span>
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-cocoa/70">
        <p>
          At Liquid Gold Skin Co., beauty isn&rsquo;t just skin deep &mdash;
          it&rsquo;s world deep. We believe self-care should be more than
          beauty. It should be a force for good and highlight health.
          That&rsquo;s why we&rsquo;ve made giving back a part of our brand
          DNA.
        </p>
        <p>
          Every jar you purchase is more than a product. It&rsquo;s a promise
          &mdash; for every product sold, we donate $1 to a charity or
          foundation that supports people with eczema, chronic skin
          conditions, and those with limited access to quality skin care.
        </p>
        <p>
          Because for us, skin care isn&rsquo;t just about beauty. It&rsquo;s
          about dignity, comfort, and the simple joy of feeling good in your
          own skin.
        </p>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl text-cocoa md:text-3xl">
          How it works
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-3xl bg-lagoon/10 p-6">
              <span className="font-display text-3xl text-gold">
                {i + 1}
              </span>
              <p className="mt-2 font-display text-lg text-cocoa">
                {s.title}
              </p>
              <p className="mt-1 text-sm text-cocoa/60">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl text-cocoa md:text-3xl">
          Our Partner Charities
        </h2>
        <p className="mt-4 text-cocoa/70">
          We believe impact happens when we partner with organizations doing
          incredible work in both direct care and long-term advocacy. Each
          year we choose one or two charities to receive our donations.
        </p>
        <p className="mt-2 text-sm font-semibold text-cocoa/50">
          Potential partners include:
        </p>
        <ul className="mt-4 space-y-4">
          {charities.map((c) => (
            <li key={c.name} className="border-b border-cocoa/10 pb-4">
              <p className="font-display text-cocoa">{c.name}</p>
              <p className="mt-1 text-sm text-cocoa/60">{c.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-cocoa/60">
          If there are any charities or foundations you&rsquo;d love to see
          us support, please contact us at{" "}
          <a
            href="mailto:liquidgoldskinco@gmail.com"
            className="text-guava underline underline-offset-2"
          >
            liquidgoldskinco@gmail.com
          </a>
          .
        </p>
      </div>

      <p className="mt-16 font-display text-xl italic text-cocoa">
        Together, we&rsquo;re turning self-care into shared care. One jar at
        a time.
      </p>
    </section>
  );
}
