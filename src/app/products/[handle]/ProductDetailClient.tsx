"use client";

import { useState } from "react";
import Image from "next/image";
import { productsByScent, type Product, type ProductType } from "@/lib/products";
import type { Scent } from "@/lib/scents";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Reassurance from "@/components/ui/Reassurance";

export default function ProductDetailClient({
  initial,
  scent,
}: {
  initial: Product;
  scent: Scent | undefined;
}) {
  const variants = productsByScent(initial.scent);
  const types = Array.from(new Set(variants.map((v) => v.type))) as ProductType[];
  const [type, setType] = useState<ProductType>(initial.type);
  const [size, setSize] = useState(initial.size);

  const active =
    variants.find((v) => v.type === type && v.size === size) ?? initial;
  const sizesForType = variants.filter((v) => v.type === type);

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleTypeChange(t: ProductType) {
    setType(t);
    const firstSize = variants.find((v) => v.type === t)?.size;
    if (firstSize) setSize(firstSize);
  }

  function handleAdd() {
    addItem(active, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div className="clip-corner relative aspect-[4/5] w-full overflow-hidden bg-sand">
        <Image
          src={active.image}
          alt={active.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      <div>
        {scent && (
          <p className="text-xs font-semibold uppercase tracking-widest text-guava">
            {scent.name} · {scent.mood}
          </p>
        )}
        <h1 className="mt-2 font-display text-5xl text-cocoa">
          {active.name.split(" — ")[0]}
        </h1>

        {/* Variant selectors */}
        <div className="mt-5 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
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
          <div className="mt-2 flex flex-wrap gap-2">
            {sizesForType.map((v) => (
              <button
                key={v.size}
                onClick={() => setSize(v.size)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
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

        <p className="mt-5 font-semibold text-2xl text-cocoa">${active.price}</p>
        <p className="mt-4 text-cocoa/70">{active.description}</p>

        {scent && scent.notes.length > 0 && (
          <p className="mt-4 text-sm text-cocoa/60">Notes: {scent.notes.join(" · ")}</p>
        )}
        {scent && scent.notes.length === 0 && (
          <p className="mt-4 text-sm italic text-cocoa/40">Fragrance notes coming soon</p>
        )}

        <div className="mt-8 flex gap-4">
          <Button onClick={handleAdd}>{added ? "Added ✓" : "Add to Cart"}</Button>
          <Button variant="ghost">Add to Wishlist</Button>
        </div>
        <Reassurance>
          {active.inStock ? "In stock, ships within 2 business days" : "Back-in-stock alerts coming soon"}
        </Reassurance>

        <div className="mt-10 space-y-6 border-t border-cocoa/10 pt-6 text-sm text-cocoa/70">
          <div>
            <p className="font-semibold text-cocoa">How to Use</p>
            <p className="mt-1">{active.howToUse}</p>
          </div>
          <div>
            <p className="font-semibold text-cocoa">Ingredients</p>
            <p className="mt-1">{active.ingredients.join(", ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
