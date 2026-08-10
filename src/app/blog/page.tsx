import Link from "next/link";
import { posts } from "@/lib/blog";

export default function BlogIndexPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        The <span className="text-gold-gradient italic">Journal</span>
      </h1>
      <div className="mt-12 space-y-10">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="block border-b border-cocoa/10 pb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-guava">
              {p.category}
            </p>
            <p className="mt-2 font-display text-2xl text-cocoa">{p.title}</p>
            <p className="mt-2 text-cocoa/60">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
