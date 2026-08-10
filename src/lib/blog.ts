// PLACEHOLDER — 2-3 sample posts as static content. Real CMS/content system
// is a Phase 3 item; not building a content pipeline yet.

export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
};

export const posts: Post[] = [
  {
    slug: "how-to-layer-body-oil-and-butter",
    title: "How to Layer Body Oil and Butter (For Skin That Actually Glows)",
    category: "How-To Guides",
    excerpt: "The order matters more than you think. Here's the routine that locks in moisture for 24 hours.",
  },
  {
    slug: "bermuda-inspired-ingredients",
    title: "The Island Ingredients Behind Every Liquid Gold Scent",
    category: "Ingredients",
    excerpt: "From pink sand to sea salt — how we translate a place into a fragrance.",
  },
  {
    slug: "gift-guide-fragrance-lovers",
    title: "A Gift Guide for the Fragrance Lover in Your Life",
    category: "Gift Guides",
    excerpt: "Three scent personalities, three easy gifts, zero guesswork.",
  },
];
