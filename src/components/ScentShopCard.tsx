"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsByScent, type ProductType } from "@/lib/products";
import type { Scent } from "@/lib/scents";
import { useCart } from "@/context/CartContext";
import Price from "@/components/ui/Price";

type Stock = Record<string, number | null>;

export default function ScentShopCard({ scent, stock = {} }: { scent: Scent; stock?: Stock }) {
  const variants = productsByScent(scent.slug);
  const types = Array.from(new Set(variants.map((v) => v.type))) as ProductType[];
  const [type, setType] = useState<ProductType>(types[0]);
  const sizesForType = variants.filter((v) => v.type === type);
  const [size, setSize] = useState(sizesForType[0]?.size);

  const active =
    variants.find((v) => v.type === type && v.size === size) ?? variants[0];
  // null = not synced to Square yet, treat as available. 0 = actually sold out.
  const activeStock = stock[active.handle];
  const soldOut = activeStock === 0;

  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleTypeChange(t: ProductType) {
    setType(t);
    const firstSize = variants.find((v) => v.type === t)?.size;
    if (firstSize) setSize(firstSize);
  }

  function handleAdd() {
    if (soldOut) return;
    addItem(active, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="group">
      <Link href={`/products/${active.handle}`} className="block" aria-label={`${scent.name} — view ${active.type} details`}>
        <div className="clip-corner relative aspect-[3/4] w-full overflow-hidden bg-sand">
          <Image
            src={active.image}
            alt={active.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${soldOut ? "opacity-40 grayscale" : ""}`}
          />
          {soldOut && (
            <span className="absolute left-2 top-2 rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-cream">
              Sold Out
            </span>
          )}
        </div>
      </Link>
      <p className="mt-4 font-display text-xl leading-tight text-cocoa md:text-2xl">{scent.name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-cocoa/70">
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: scent.accent }} />
        {scent.mood}
      </p>

      {/* Variant selectors — type first, then size */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            aria-pressed={type === t}
            className={`min-h-[32px] rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              type === t
                ? "border-cocoa bg-cocoa text-cream"
                : "border-cocoa/20 text-cocoa/70 hover:border-cocoa/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {sizesForType.length > 1 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {sizesForType.map((v) => (
            <button
              key={v.size}
              onClick={() => setSize(v.size)}
              aria-pressed={size === v.size}
              className={`min-h-[32px] rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                size === v.size
                  ? "border-guava bg-guava-deep text-cream"
                  : "border-cocoa/20 text-cocoa/70 hover:border-guava/50"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      )}

      <Price price={active.price} compareAt={active.compareAtPrice} className="mt-3" />
      <div className="mt-3">
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="min-h-[40px] w-full rounded-full bg-cocoa px-4 py-2 text-xs font-semibold text-cream transition-[background-color,transform] duration-200 hover:bg-guava active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cocoa motion-reduce:active:scale-100"
        >
          {soldOut ? "Sold Out" : justAdded ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
