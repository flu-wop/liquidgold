"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import type { Product } from "@/lib/products";

export type Tab = { id: string; label: string; products: Product[] };

// Static class names (Tailwind can't build `lg:grid-cols-${n}`), so the grid
// always fills its row: 5 scents -> 5 columns, 4 travel kits -> 4, etc.
const COLS: Record<number, string> = {
  1: "md:grid-cols-3 lg:grid-cols-3",
  2: "md:grid-cols-3 lg:grid-cols-3",
  3: "md:grid-cols-3 lg:grid-cols-3",
  4: "md:grid-cols-4 lg:grid-cols-4",
};
const colsFor = (n: number) => COLS[n] ?? "md:grid-cols-3 lg:grid-cols-5";

export default function BestSellersTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const reduce = useReducedMotionSafe();
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!current) return null;

  // Arrow-key navigation per the ARIA tabs pattern.
  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const n = e.key === "Home" ? 0 : tabs.length - 1;
      setActive(tabs[n].id);
      refs.current[n]?.focus();
    } else if (dir) {
      e.preventDefault();
      const n = (i + dir + tabs.length) % tabs.length;
      setActive(tabs[n].id);
      refs.current[n]?.focus();
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Best sellers by product type"
        className="no-scrollbar -mx-4 mb-10 flex gap-1 overflow-x-auto border-b border-cocoa/15 px-4 sm:mx-0 sm:gap-2 sm:px-0 md:mb-12"
      >
        {tabs.map((t, i) => {
          const selected = t.id === current.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative min-h-[48px] whitespace-nowrap px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-colors sm:px-6 ${
                selected ? "text-cocoa" : "text-cocoa/55 hover:text-cocoa"
              }`}
            >
              {t.label}
              {selected && (
                <motion.span
                  layoutId={reduce ? undefined : `${uid}-underline`}
                  className="absolute inset-x-3 -bottom-px h-0.5 bg-gradient-to-r from-gold to-guava sm:inset-x-5"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${current.id}`} tabIndex={0}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 ${colsFor(current.products.length)}`}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {current.products.map((p) => (
              <ProductCard
                key={p.handle}
                product={p}
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
