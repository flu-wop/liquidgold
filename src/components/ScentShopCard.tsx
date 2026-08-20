"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsByScent, type ProductType } from "@/lib/products";
import type { Scent } from "@/lib/scents";
import { useCart } from "@/context/CartContext";

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
      <Link href={`/products/${active.handle}`} className="block">
        <div className="clip-corner relative aspect-[3/4] w-full overflow-hidden bg-sand">
          <Image
            src={active.image}
            alt={active.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.04] ${soldOut ? "opacity-40 grayscale" : ""}`}
          />
          {soldOut && (
            <span className="absolute left-2 top-2 rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-cream">
              Sold Out
            </span>
          )}
        </div>
      </Link>
      <p className="mt-4 font-display text-xl text-cocoa">{scent.name}</p>
      <p className="text-sm uppercase tracking-wide text-cocoa/50">{scent.mood}</p>

      {/* Variant selectors — type first, then size */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              type === t
                ? "border-cocoa bg-cocoa text-cream"
                : "border-cocoa/20 text-cocoa/60 hover:border-cocoa/50"
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
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                size === v.size
                  ? "border-guava bg-guava text-cream"
                  : "border-cocoa/20 text-cocoa/60 hover:border-guava/50"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p className="font-semibold text-guava">${active.price}</p>
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="rounded-full bg-cocoa px-4 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-guava disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cocoa"
        >
          {soldOut ? "Sold Out" : justAdded ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
