"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/components/ui/Price";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import type { Product } from "@/lib/products";

export type Category = {
  id: string;
  label: string;
  blurb: string;
  image: string;
  href: string;
  products: Product[];
};

const COLS: Record<number, string> = {
  1: "md:grid-cols-3 lg:grid-cols-3",
  2: "md:grid-cols-3 lg:grid-cols-3",
  3: "md:grid-cols-3 lg:grid-cols-3",
  4: "md:grid-cols-4 lg:grid-cols-4",
};
const colsFor = (n: number) => COLS[n] ?? "md:grid-cols-3 lg:grid-cols-5";

// One photo per category; clicking opens that category's options (one
// card per scent) right underneath. Click again — or another category —
// to switch. Closed by default so the section stays a clean 4-up.
export default function BestSellersCategories({ categories }: { categories: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotionSafe();
  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = categories.find((c) => c.id === openId) ?? null;

  // On phones the panel opens below both tile rows — bring it into view.
  useEffect(() => {
    if (!openId || !panelRef.current) return;
    const t = setTimeout(
      () => panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }),
      reduce ? 0 : 280
    );
    return () => clearTimeout(t);
  }, [openId, reduce]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {categories.map((c) => {
          const isOpen = c.id === openId;
          const from = Math.min(...c.products.map((p) => p.price));
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenId(isOpen ? null : c.id)}
              aria-expanded={isOpen}
              aria-controls={`${uid}-panel`}
              className={`group relative block overflow-hidden rounded-2xl text-left transition-shadow duration-300 sm:rounded-3xl ${
                isOpen ? "shadow-[0_0_0_2px_var(--color-gold),0_24px_50px_-28px_rgba(58,35,24,0.6)]" : ""
              }`}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/15 to-transparent" />
                <span
                  aria-hidden
                  className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-cocoa backdrop-blur transition-transform duration-300 sm:right-4 sm:top-4 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                  <p className="font-display text-2xl leading-tight text-cream sm:text-3xl">{c.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cream/85 sm:text-sm">
                    From {formatPrice(from)} · {c.products.length} {c.products.length === 1 ? "option" : "options"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div ref={panelRef} id={`${uid}-panel`} role="region" aria-label={open ? `${open.label} options` : undefined} className="scroll-mt-24">
        <AnimatePresence initial={false} mode="wait">
          {open && (
            <motion.div
              key={open.id}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-10 md:pt-14">
                <div className="mb-8 flex flex-col gap-3 border-t border-cocoa/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-guava">Choose your scent</p>
                    <h3 className="mt-2 font-display text-3xl leading-none text-cocoa md:text-4xl">{open.label}</h3>
                    <p className="mt-2 max-w-md text-sm text-cocoa/70">{open.blurb}</p>
                  </div>
                  <Link
                    href={open.href}
                    className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-cocoa"
                  >
                    See all {open.label.toLowerCase()}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">&rarr;</span>
                  </Link>
                </div>
                <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 ${colsFor(open.products.length)}`}>
                  {open.products.map((p, i) => (
                    <motion.div
                      key={p.handle}
                      initial={reduce ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.12 + i * 0.06 }}
                    >
                      <ProductCard product={p} sizes="(max-width: 768px) 50vw, 20vw" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
