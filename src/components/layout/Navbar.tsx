"use client";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useCart } from "@/context/CartContext";
import ScrollProgress from "@/components/motion/ScrollProgress";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/scents", label: "Scents" },
  { href: "/quiz", label: "Find Your Scent" },
  { href: "/about", label: "Our Story" },
  { href: "/give-back", label: "Give Back" },
  { href: "/wholesale", label: "Wholesale" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotionSafe();
  const pathname = usePathname();

  // Compact + blurred once the page has scrolled past ~80px.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation, lock body scroll + Escape while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Small scale bump on the cart pill whenever the count goes up. Reads
  // `count` from CartContext only — the context itself is untouched.
  const cartControls = useAnimationControls();
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current && !reduce) {
      cartControls.start({ scale: [1, 1.18, 0.96, 1], transition: { duration: 0.45, ease: "easeOut" } });
    }
    prevCount.current = count;
  }, [count, reduce, cartControls]);

  // The full-screen menu is position:fixed, so it's placed just below the
  // header's measured bottom edge. (The header drops backdrop-blur while the
  // menu is open — a backdrop-filter would otherwise become the fixed
  // element's containing block.)
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(68);
  useEffect(() => {
    if (open && headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
  }, [open, scrolled]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        open
          ? "border-b border-cocoa/10 bg-sand"
          : scrolled
            ? "border-b border-cocoa/10 bg-sand/85 shadow-[0_8px_30px_-20px_rgba(58,35,24,0.35)] backdrop-blur-md"
            : "border-b border-transparent bg-sand"
      }`}
    >
      <ScrollProgress />
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-[padding] duration-300 sm:px-6 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <Link
          href="/"
          className={`font-display font-semibold tracking-tight text-cocoa transition-[font-size] duration-300 ${
            scrolled ? "text-lg" : "text-xl"
          }`}
        >
          Liquid Gold <span className="text-gold-gradient italic">Skin Co.</span>
        </Link>

        <nav aria-label="Main" className="hidden gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className="group relative py-1 font-body text-sm font-medium text-cocoa/80 transition-colors hover:text-cocoa"
              >
                {l.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div animate={cartControls}>
            <Link
              href="/cart"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
              className="flex min-h-[40px] items-center gap-2 rounded-full bg-cocoa px-4 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-guava sm:px-5"
            >
              Cart
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-xs text-cocoa">
                {count}
              </span>
            </Link>
          </motion.div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span className={`h-0.5 w-6 bg-cocoa transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-cocoa transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-cocoa transition-transform duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu — full-screen sheet, Fraunces links stagger in */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-sand px-6 pb-10 pt-6 md:hidden"
            style={{ top: menuTop }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reduce ? 0.15 : 0.35, ease: EASE }}
          >
            <ul className="flex flex-col">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  className="border-b border-cocoa/10"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.06 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 font-display text-3xl italic text-cocoa transition-colors hover:text-guava"
                  >
                    {l.label}
                    <span aria-hidden className="font-body text-base not-italic text-gold">&rarr;</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mt-auto pt-10 text-sm text-cocoa/70"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.4 }}
            >
              <p className="font-display text-lg italic text-cocoa">Your skin just went on vacation.</p>
              <p className="mt-1">Free shipping over $50 · Small-batch, made fresh</p>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
