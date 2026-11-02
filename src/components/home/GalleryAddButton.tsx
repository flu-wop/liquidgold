"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";

// Add-to-cart for a gallery card. Lives outside the card's <Link> (a
// button can't sit inside a link). Always visible as a round "+" so touch
// screens can use it; on hover/focus it widens to show the price.
export default function GalleryAddButton({ product, decorative }: { product: Product; decorative?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={add}
      tabIndex={decorative ? -1 : undefined}
      aria-label={added ? `${product.name.split(" — ")[0]} added to cart` : `Add ${product.name.split(" — ")[0]} to cart, $${product.price.toFixed(2)}`}
      className="absolute bottom-3 right-3 z-20 flex h-11 items-center gap-2 overflow-hidden rounded-full bg-cream px-3.5 text-sm font-semibold text-cocoa shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition-[background-color,transform] duration-200 hover:bg-white active:scale-95 motion-reduce:active:scale-100 sm:bottom-4 sm:right-4 lg:bottom-5 lg:right-5"
    >
      <span aria-hidden className="text-lg leading-none">{added ? "✓" : "+"}</span>
      <span className={`whitespace-nowrap ${added ? "inline" : "hidden group-hover:inline"}`}>
        {added ? "Added" : `Add · $${product.price.toFixed(2)}`}
      </span>
    </button>
  );
}
