"use client";

// REAL CHECKOUT — uses Square's Web Payments SDK to tokenize the card
// entirely client-side. The raw card number never touches our server or
// hits our network requests — only the resulting single-use token
// ("sourceId") does. This is a Square requirement, not a style choice:
// posting raw card data to your own backend is a PCI-compliance violation.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
        }>;
      }>;
    };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  // Square's Web Payments SDK is loaded via script tag (no npm types), so
  // the card instance is typed loosely here rather than fighting a complex
  // conditional type for something that's inherently `any` at the boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef = useRef<any>(null);

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 6;
  const total = subtotal + shipping;

  // Load the Square SDK script once, then mount the card field.
  useEffect(() => {
    if (items.length === 0) return;

    const env = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production" ? "web" : "sandbox.web";
    const src = `https://${env}.squarecdn.com/v1/square.js`;

    const existing = document.querySelector(`script[src="${src}"]`);
    async function initCard() {
      if (!window.Square) return;
      const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;
      const payments = await window.Square.payments(appId, locationId);
      const card = await payments.card();
      await card.attach("#square-card-container");
      cardRef.current = card;
      setSdkReady(true);
    }

    if (existing) {
      initCard();
    } else {
      const script = document.createElement("script");
      script.src = src;
      script.onload = initCard;
      document.head.appendChild(script);
    }
  }, [items.length]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cardRef.current) return;
    setProcessing(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const tokenResult = await cardRef.current.tokenize();
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        setError(tokenResult.errors?.[0]?.message ?? "Card could not be verified. Check the details and try again.");
        setProcessing(false);
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          email: form.get("email"),
          name: form.get("name"),
          address: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          zip: form.get("zip"),
          items: items.map((i) => ({ handle: i.handle, qty: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setProcessing(false);
        return;
      }

      clear();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setProcessing(false);
    }
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
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="font-display text-xl text-cocoa">Contact</p>
          <input name="email" required type="email" placeholder="Email" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />

          <p className="pt-4 font-display text-xl text-cocoa">Shipping Address</p>
          <input name="name" required maxLength={100} placeholder="Full name" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <input name="address" required maxLength={200} placeholder="Address" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input name="city" required maxLength={100} placeholder="City" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
            <input name="state" required maxLength={50} placeholder="State" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
            <input name="zip" required maxLength={20} placeholder="ZIP" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
          </div>

          <p className="pt-4 font-display text-xl text-cocoa">Payment</p>
          {/* Square's SDK renders the actual card fields into this div —
              we never see or handle the raw card number ourselves. */}
          <div id="square-card-container" className="rounded-xl border border-cocoa/20 bg-cream p-4" />
          {!sdkReady && <p className="text-xs text-cocoa/40">Loading secure payment form…</p>}

          {error && <p className="text-sm text-hibiscus">{error}</p>}

          <button
            type="submit"
            disabled={processing || !sdkReady}
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
