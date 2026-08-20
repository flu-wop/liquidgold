import Image from "next/image";
import { getContentMap, content } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const contentMap = await getContentMap();
  const story = content(contentMap, "about.story").split("\n").filter(Boolean);
  const mission = content(contentMap, "about.mission").split("\n").filter(Boolean);
  const founderImage = content(contentMap, "about.founderImage");

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        My <span className="text-gold-gradient italic">Story</span>
      </h1>
      <p className="mt-4 font-display text-lg italic text-cocoa/60">
        More than Skin Deep
      </p>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-cocoa/70">
        {story.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl">
        <Image
          src={founderImage}
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
          {mission.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p className="font-display italic text-cocoa">Yours truly, Ariel</p>
        </div>
      </div>
    </section>
  );
}
