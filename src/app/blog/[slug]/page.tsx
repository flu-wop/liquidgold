import { notFound } from "next/navigation";
import { posts } from "@/lib/blog";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-guava">
        {post.category}
      </p>
      <h1 className="mt-2 font-display text-4xl text-cocoa">{post.title}</h1>
      {/* PLACEHOLDER: real post body pending content plan */}
      <p className="mt-8 leading-relaxed text-cocoa/70">
        [Full post content placeholder — {post.excerpt}]
      </p>
    </article>
  );
}
