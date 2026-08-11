"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-cocoa">Your cart is empty</h1>
        <p className="mt-3 text-cocoa/60">
          Time to find your island escape.
        </p>
        <div className="mt-8">
          <Button href="/shop">Shop the Escape</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Your <span className="text-gold-gradient italic">Cart</span>
      </h1>

      <div className="mt-10 divide-y divide-cocoa/10 border-t border-cocoa/10">
        {items.map((item) => (
          <div key={item.handle} className="flex items-center gap-5 py-6">
            <div className="clip-corner relative h-24 w-24 flex-shrink-0 overflow-hidden bg-sand">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg text-cocoa">{item.name}</p>
              <p className="text-sm text-cocoa/50">
                {item.type} · {item.size}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => updateQty(item.handle, item.qty - 1)}
                  className="h-7 w-7 rounded-full border border-cocoa/20 text-cocoa/60 hover:border-cocoa"
                >
                  –
                </button>
                <span className="w-6 text-center text-sm">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.handle, item.qty + 1)}
                  className="h-7 w-7 rounded-full border border-cocoa/20 text-cocoa/60 hover:border-cocoa"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.handle)}
                  className="ml-3 text-xs uppercase tracking-wide text-cocoa/40 hover:text-hibiscus"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="font-semibold text-cocoa">${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-cocoa/10 pt-6">
        <p className="text-lg text-cocoa/70">Subtotal</p>
        <p className="font-display text-2xl text-cocoa">${subtotal.toFixed(2)}</p>
      </div>
      <p className="mt-1 text-right text-xs text-cocoa/40">
        Shipping and taxes calculated at checkout
      </p>

      <div className="mt-8 flex justify-end gap-4">
        <Button href="/shop" variant="ghost">
          Continue Shopping
        </Button>
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-guava px-7 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-hibiscus"
        >
          Checkout
        </Link>
      </div>
    </section>
  );
}
