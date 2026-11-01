"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { productsByScent, type Product, type ProductType } from "@/lib/products";
import type { Scent } from "@/lib/scents";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Reassurance from "@/components/ui/Reassurance";
import Price from "@/components/ui/Price";
import { trackViewItem } from "@/lib/analytics";

export default function ProductDetailClient({
  initial,
  scent,
  descriptions,
  isCustom = false,
}: {
  initial: Product;
  scent: Scent | undefined;
  descriptions: { bodyButter: string; bodyOil: string };
  isCustom?: boolean;
}) {
  // Custom (admin-added) products aren't in the static catalog, so they
  // have no known variants to switch between — just show the one SKU as-is.
  const variants = isCustom ? [initial] : productsByScent(initial.scent);
  const types = Array.from(new Set(variants.map((v) => v.type))) as ProductType[];
  const [type, setType] = useState<ProductType>(initial.type);
  const [size, setSize] = useState(initial.size);

  const active =
    variants.find((v) => v.type === type && v.size === size) ?? initial;
  const sizesForType = variants.filter((v) => v.type === type);
  // `variants` comes from the static catalog, so its .description is always
  // the hardcoded default — override with the admin-edited copy here so
  // switching Body Butter <-> Body Oil mid-page still reflects /admin/content.
  // Custom products — and the bundle / perfume / travel kit SKUs, which have
  // no admin-editable copy yet — carry their own per-product description.
  const activeDescription = isCustom
    ? active.description
    : active.type === "Body Butter"
      ? descriptions.bodyButter
      : active.type === "Body Oil"
        ? descriptions.bodyOil
        : active.description;

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  // Gallery: main shot + optional alternate. Resets when the variant changes.
  const shots = [active.image, active.hoverImage].filter(Boolean) as string[];
  const [shot, setShot] = useState(0);
  useEffect(() => setShot(0), [active.handle]);
  const shown = shots[shot] ?? active.image;

  // Fire once per page landing, using the product actually landed on —
  // not every variant toggle, which would inflate view_item counts.
  useEffect(() => {
    trackViewItem({
      handle: initial.handle,
      name: initial.name.split(" — ")[0],
      price: initial.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.handle]);

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
    <div className="grid gap-10 md:grid-cols-2 md:gap-14">
      <div className="md:sticky md:top-24 md:self-start">
        <div className="clip-corner relative aspect-[4/5] w-full overflow-hidden bg-sand">
          <Image
            key={shown}
            src={shown}
            alt={active.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="animate-in fade-in object-cover duration-500 motion-reduce:animate-none"
            priority
          />
        </div>
        {shots.length > 1 && (
          <div className="mt-3 flex gap-3">
            {shots.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Show photo ${i + 1} of ${shots.length}`}
                aria-pressed={shot === i}
                className={`relative h-20 w-16 overflow-hidden rounded-sm border-2 transition-colors ${
                  shot === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        {scent && (
          <p className="text-xs font-semibold uppercase tracking-widest text-guava">
            {scent.name} · {scent.mood}
          </p>
        )}
        <h1 className="mt-3 font-display text-4xl leading-[0.98] text-cocoa sm:text-5xl md:text-6xl">
          {active.name.split(" — ")[0]}
        </h1>

        {/* Variant selectors */}
        <div className="mt-5 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              aria-pressed={type === t}
              className={`min-h-[40px] rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
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
                aria-pressed={size === v.size}
                className={`min-h-[40px] rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
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

        <Price price={active.price} compareAt={active.compareAtPrice} size="lg" className="mt-5" />
        <p className="mt-4 text-cocoa/70">{activeDescription}</p>

        {active.includes && active.includes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-cocoa/60">
              What&rsquo;s inside
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-cocoa/80">
              {active.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {scent && scent.notes.length > 0 && (
          <p className="mt-4 text-sm text-cocoa/60">Notes: {scent.notes.join(" · ")}</p>
        )}
        {scent && scent.notes.length === 0 && (
          <p className="mt-4 text-sm italic text-cocoa/40">Fragrance notes coming soon</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
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
            {active.ingredients.length > 0 ? (
              <p className="mt-1">{active.ingredients.join(", ")}</p>
            ) : (
              <p className="mt-1 italic text-cocoa/50">Full ingredient list coming soon</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
