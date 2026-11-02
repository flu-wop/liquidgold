"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/products";
import type { Scent } from "@/lib/scents";
import { useCart } from "@/context/CartContext";
import Price from "@/components/ui/Price";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

const FORMAT_LABEL: Record<string, string> = {
  "Body Butter": "Body Butter",
  "Body Oil": "Body Oil",
  Bundle: "Butter + Oil Bundle",
  Perfume: "Perfume",
  "Travel Kit": "Travel Kit",
};

// Pick-a-format buy box for a scent page: big photo that follows the
// selection, format + size pills, live price, add to cart — no page hops.
export default function ScentBuyBox({
  scent,
  products,
  stock,
}: {
  scent: Scent;
  products: Product[];
  stock: Record<string, number | null>;
}) {
  const types = useMemo(() => Array.from(new Set(products.map((p) => p.type))), [products]);
  const [type, setType] = useState(types[0]);
  const sizes = products.filter((p) => p.type === type);
  const [size, setSize] = useState(sizes[0]?.size);
  const active = sizes.find((p) => p.size === size) ?? sizes[0] ?? products[0];
  const soldOut = stock[active.handle] === 0;

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const reduce = useReducedMotionSafe();

  function pickType(t: string) {
    setType(t);
    const first = products.find((p) => p.type === t);
    if (first) setSize(first.size);
    setAdded(false);
  }
  function add() {
    if (soldOut) return;
    addItem(active, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid items-start gap-8 md:grid-cols-2 md:gap-14">
      <div className="clip-corner relative aspect-[4/5] w-full overflow-hidden bg-sand md:sticky md:top-24">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active.image}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={active.image}
              alt={active.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover ${soldOut ? "opacity-50 grayscale" : ""}`}
            />
          </motion.div>
        </AnimatePresence>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${scent.accent}, #D9A441)` }}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: scent.accent }}>
          Step 1 · Choose your format
        </p>
        <div role="radiogroup" aria-label="Format" className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {types.map((t) => {
            const sel = t === type;
            const from = Math.min(...products.filter((p) => p.type === t).map((p) => p.price));
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => pickType(t)}
                className={`rounded-2xl border px-3 py-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 active:scale-[0.98] motion-reduce:active:scale-100 ${
                  sel
                    ? "border-cocoa bg-cocoa text-cream shadow-[0_14px_30px_-18px_rgba(58,35,24,0.7)]"
                    : "border-cocoa/20 bg-cream text-cocoa hover:border-cocoa/50"
                }`}
              >
                <span className="block text-sm font-semibold leading-tight">{FORMAT_LABEL[t] ?? t}</span>
                <span className={`mt-1 block text-xs ${sel ? "text-cream/75" : "text-cocoa/60"}`}>
                  from ${from.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {sizes.length > 1 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cocoa/60">Step 2 · Size</p>
            <div role="radiogroup" aria-label="Size" className="mt-3 flex flex-wrap gap-2">
              {sizes.map((p) => (
                <button
                  key={p.size}
                  type="button"
                  role="radio"
                  aria-checked={p.size === active.size}
                  onClick={() => setSize(p.size)}
                  className={`min-h-[44px] rounded-full border px-5 text-sm font-medium transition-colors ${
                    p.size === active.size
                      ? "border-guava bg-guava text-cream"
                      : "border-cocoa/20 text-cocoa/70 hover:border-guava/60"
                  }`}
                >
                  {p.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-cocoa/10 pt-6">
          <p className="font-display text-2xl leading-tight text-cocoa">{active.name.split(" — ")[0]}</p>
          <p className="mt-0.5 text-sm text-cocoa/60">{active.size}</p>
          <Price price={active.price} compareAt={active.compareAtPrice} size="lg" className="mt-3" />

          {active.includes && (
            <ul className="mt-4 space-y-1.5 text-sm text-cocoa/80">
              {active.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={add}
              disabled={soldOut}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-guava px-8 text-sm font-semibold tracking-wide text-cream transition-[background-color,transform] duration-200 hover:bg-hibiscus active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
            >
              {soldOut ? "Sold out" : added ? "Added to cart ✓" : "Add to cart"}
            </button>
            <Link
              href={`/products/${active.handle}`}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-cocoa/25 px-6 text-sm font-semibold text-cocoa transition-colors hover:border-cocoa"
            >
              Full details
            </Link>
          </div>
          <p className="mt-3 text-sm text-cocoa/60" aria-live="polite">
            {added ? "In your cart — keep shopping or check out anytime." : "Free shipping over $75 · Small-batch, made fresh"}
          </p>
        </div>
      </div>
    </div>
  );
}
