"use client";

// MOCK CHECKOUT — for demo/pitch purposes only. No real Stripe/Square call
// happens here. Same pattern as the Lamara Coffee Tier 2 demo: a fully
// functional-feeling flow that ends in a fake success screen, so a client
// can see what real checkout will feel like before payment is wired in.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 6;
  const total = subtotal + shipping;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    // Simulated processing delay — no network call, no real payment.
    setTimeout(() => {
      const orderNumber = `LG-${Math.floor(1000 + Math.random() * 9000)}`;
      clear();
      router.push(`/checkout/success?order=${orderNumber}`);
    }, 1200);
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-cocoa">Nothing to check out</h1>
        <div className="mt-8">
          <Button href="/shop">Shop the Escape</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm italic text-cocoa/40">
        Demo checkout — no payment is actually processed.
      </p>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="font-display text-xl text-cocoa">Contact</p>
          <input required placeholder="Email" type="email" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />

          <p className="pt-4 font-display text-xl text-cocoa">Shipping Address</p>
          <input required placeholder="Full name" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <input required placeholder="Address" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input required placeholder="City" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
            <input required placeholder="State" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
            <input required placeholder="ZIP" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          </div>

          <p className="pt-4 font-display text-xl text-cocoa">Payment</p>
          <input required placeholder="Card number" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="MM / YY" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
            <input required placeholder="CVC" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="mt-6 w-full rounded-full bg-guava px-7 py-4 font-body text-sm font-semibold text-cream transition-colors hover:bg-hibiscus disabled:opacity-60"
          >
            {processing ? "Processing…" : `Place Order — $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="rounded-3xl bg-lagoon/10 p-8">
          <p className="font-display text-xl text-cocoa">Order Summary</p>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.handle} className="flex items-center gap-4">
                <div className="clip-corner relative h-16 w-16 flex-shrink-0 overflow-hidden bg-cream">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cocoa">{item.name}</p>
                  <p className="text-xs text-cocoa/50">
                    {item.type} · {item.size} · Qty {item.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold text-cocoa">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-cocoa/10 pt-4 text-sm">
            <div className="flex justify-between text-cocoa/70">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-cocoa/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-t border-cocoa/10 pt-2 font-semibold text-cocoa">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
