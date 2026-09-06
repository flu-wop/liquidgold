import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-cocoa px-6 py-16 text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-lg italic text-gold-light">
            Liquid Gold Skin Co.
          </p>
          <p className="mt-3 text-sm text-cream/60">
            Island-inspired body care from Bermuda to your bathroom shelf.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cream/50">
            Shop
          </p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/shop">All Products</Link></li>
            <li><Link href="/scents">Shop by Scent</Link></li>
            <li><Link href="/quiz">Find Your Island Scent</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cream/50">
            Company
          </p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/give-back">Give Back</Link></li>
            <li><Link href="/wholesale">Wholesale</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cream/50">
            Join Paradise
          </p>
          <p className="text-sm text-cream/70">
            Product launches, scent drops, and skincare tips — no spam, just sunshine.
          </p>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-xs text-cream/40">
        © {new Date().getFullYear()} Liquid Gold Skin Co. All rights reserved.
      </p>
      <p className="mx-auto mt-3 max-w-7xl text-xs text-cream/30">
        Built by{" "}
        <a
          href="https://in-flu-ential.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-light/70 hover:text-gold-light"
        >
          IN-FLU-ENTIAL LLC
        </a>
      </p>
    </footer>
  );
}
