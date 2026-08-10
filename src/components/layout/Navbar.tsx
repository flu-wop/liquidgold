import Link from "next/link";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/scents", label: "Scents" },
  { href: "/quiz", label: "Find Your Scent" },
  { href: "/about", label: "Our Story" },
  { href: "/wholesale", label: "Wholesale" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-cocoa/10 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-cocoa"
        >
          Liquid Gold <span className="text-gold-gradient italic">Skin Co.</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-sm font-medium text-cocoa/80 transition-colors hover:text-guava"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/shop"
          className="rounded-full bg-cocoa px-5 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-guava"
        >
          Cart (0)
        </Link>
      </div>
    </header>
  );
}
