import Link from "next/link";
import LiquidTrail from "@/components/ui/LiquidTrail";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Shop All" },
      { href: "/scents", label: "Shop by Scent" },
      { href: "/shop#bundles", label: "Butter + Oil Bundles" },
      { href: "/shop#travel-kits", label: "Travel Kits" },
      { href: "/shop#perfume", label: "Perfume" },
      { href: "/quiz", label: "Find Your Scent" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/give-back", label: "Give Back" },
      { href: "/blog", label: "Journal" },
      { href: "/wholesale", label: "Wholesale" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact Us" },
      { href: "/cart", label: "Your Cart" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-cocoa text-cream md:mt-24">
      <div className="-mb-px bg-sand">
        <LiquidTrail tone="cocoa" />
      </div>
      <div className="px-6 pb-10 pt-14 md:pt-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          {/* Brand + newsletter nudge */}
          <div className="lg:col-span-4">
            <Link href="/" className="font-display text-3xl font-semibold leading-none tracking-tight">
              Liquid Gold <span className="italic text-gold-light">Skin Co.</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
              Small-batch, island-inspired body butters, oils, and perfume — made to leave your
              skin soft, glowing, and impossible to forget.
            </p>
            <Link
              href="/#join-paradise"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-light"
            >
              Join Paradise for launches &amp; offers
              <span aria-hidden className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                &rarr;
              </span>
            </Link>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">
                  {col.title}
                </p>
                <ul className="space-y-1 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-block py-1.5 text-cream/85 transition-colors hover:text-gold-light"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">
                Questions?
              </p>
              <a
                href="mailto:liquidgoldskinco@gmail.com"
                className="break-all text-sm text-cream/85 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold-light"
              >
                liquidgoldskinco@gmail.com
              </a>
            </div>
          </nav>
        </div>

        {/* Promise strip */}
        <ul className="mx-auto mt-14 flex max-w-7xl flex-wrap gap-x-8 gap-y-2 border-t border-cream/10 pt-6 text-xs uppercase tracking-[0.15em] text-cream/60">
          <li>Free shipping over $50</li>
          <li>Small-batch, made fresh</li>
          <li>Secure checkout by Square</li>
          <li>Every order gives back</li>
        </ul>

        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-2 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Liquid Gold Skin Co. All rights reserved. Prices in USD.</p>
          <p>
            Designed by{" "}
            <a
              href="https://influential.live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-light/80 hover:text-gold-light"
            >
              IN-FLU-ENTIAL
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
