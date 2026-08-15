"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/scents", label: "Scents" },
  { href: "/quiz", label: "Find Your Scent" },
  { href: "/about", label: "Our Story" },
  { href: "/give-back", label: "Give Back" },
  { href: "/wholesale", label: "Wholesale" },
];

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cocoa/10 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-cocoa"
          onClick={() => setOpen(false)}
        >
          Liquid Gold <span className="text-gold-gradient italic">Skin Co.</span>
        </Link>

        {/* Desktop nav — unchanged */}
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

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="rounded-full bg-cocoa px-5 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-guava"
          >
            Cart ({count})
          </Link>

          {/* Hamburger — mobile only, any orientation, no more needing to
              rotate the phone to reach nav links */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-0.5 w-6 bg-cocoa transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-cocoa transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-cocoa transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-cocoa/10 bg-sand px-6 pb-6 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 font-display text-xl text-cocoa transition-colors hover:text-guava"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
