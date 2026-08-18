"use client";

// REAL CHECKOUT — uses Square's Web Payments SDK to tokenize payment info
// entirely client-side (card, Apple Pay, Google Pay, Cash App Pay). Raw
// card numbers never touch our server — only the resulting single-use
// token ("sourceId") does. This is a Square/PCI requirement, not a style
// choice. Apple Pay and Google Pay both require the site to be served over
// real HTTPS on a live domain — neither works on localhost, so they can
// only be tested on the deployed site, not locally. Apple Pay additionally
// requires the domain to be registered with Square first (Developer
// Dashboard → Apple Pay → Add Domain, or the /v2/apple-pay/domains API) —
// the button silently won't render until that's done.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

type SquarePayments = {
  card: () => Promise<SquareCardMethod>;
  applePay: (req: SquarePaymentRequest) => Promise<SquareWalletMethod>;
  googlePay: (req: SquarePaymentRequest) => Promise<SquareWalletMethod>;
  cashAppPay: (req: SquarePaymentRequest, opts: { redirectURL: string; referenceId: string }) => Promise<SquareWalletMethod>;
  paymentRequest: (opts: Record<string, unknown>) => SquarePaymentRequest;
};
type SquareCardMethod = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<SquareTokenizeResult>;
};
type SquareWalletMethod = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<SquareTokenizeResult>;
  addEventListener?: (event: string, cb: (e: unknown) => void) => void;
};
type SquareTokenizeResult = { status: string; token?: string; errors?: { message: string }[] };
type SquarePaymentRequest = { update: (opts: Record<string, unknown>) => void };

declare global {
  interface Window {
    Square?: { payments: (appId: string, locationId: string) => Promise<SquarePayments> };
  }
}

// Client-side mirror of the server's discount map — for live display only.
// The server re-validates and re-applies the real discount independently;
// nothing here is trusted for the actual charge.
const DISPLAY_DISCOUNT_CODES: Record<string, number> = {
  ISLAND15: 15,
  ISLAND20: 20,
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState({ applePay: false, googlePay: false, cashAppPay: false });
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; pct: number } | null>(null);
  const [discountError, setDiscountError] = useState("");

  const cardRef = useRef<SquareCardMethod | null>(null);
  const applePayRef = useRef<SquareWalletMethod | null>(null);
  const googlePayRef = useRef<SquareWalletMethod | null>(null);
  const cashAppRef = useRef<SquareWalletMethod | null>(null);
  const paymentRequestRef = useRef<SquarePaymentRequest | null>(null);
  const contactFormRef = useRef<HTMLFormElement>(null);

  // Display-only estimate — server computes the real total via Square,
  // which is whatever tax rate Ariel has configured in her Square account.
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 6;
  const discountAmount = appliedDiscount ? subtotal * (appliedDiscount.pct / 100) : 0;
  const estimatedTotal = subtotal - discountAmount + shipping;

  function handleApplyDiscount() {
    const normalized = discountInput.trim().toUpperCase();
    const pct = DISPLAY_DISCOUNT_CODES[normalized];
    if (pct) {
      setAppliedDiscount({ code: normalized, pct });
      setDiscountError("");
    } else {
      setAppliedDiscount(null);
      setDiscountError("Invalid code");
    }
  }

  // Keep the wallet sheets (Apple Pay / Google Pay totals) in sync with
  // the live estimated total whenever the discount changes. Note: Square's
  // docs say Cash App Pay does NOT support updating its PaymentRequest —
  // update() returns false rather than throwing in that case, so this is
  // safe to call unconditionally, but Cash App Pay's displayed total may
  // lag behind a discount applied after it's already rendered.
  useEffect(() => {
    paymentRequestRef.current?.update({
      total: { amount: estimatedTotal.toFixed(2), label: "Liquid Gold Skin Co." },
    });
  }, [estimatedTotal]);

  // Load the Square SDK once, then mount card + wallet payment methods.
  useEffect(() => {
    if (items.length === 0) return;

    const env = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production" ? "web" : "sandbox.web";
    const src = `https://${env}.squarecdn.com/v1/square.js`;

    async function initPayments() {
      if (!window.Square) return;
      const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;
      const payments = await window.Square.payments(appId, locationId);

      // Card — always available
      const card = await payments.card();
      await card.attach("#square-card-container");
      cardRef.current = card;
      setSdkReady(true);

      // Shared payment request object for the wallet methods
      const paymentRequest = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: { amount: estimatedTotal.toFixed(2), label: "Liquid Gold Skin Co." },
      });
      paymentRequestRef.current = paymentRequest;

      // Each wallet method fails independently if unsupported (e.g. Apple
      // Pay on non-Safari, or an unregistered domain) — don't let one
      // wallet failing block the others or the card field.
      try {
        const applePay = await payments.applePay(paymentRequest);
        await applePay.attach("#apple-pay-button");
        applePayRef.current = applePay;
        setWalletsAvailable((w) => ({ ...w, applePay: true }));
      } catch (e) {
        console.log("Apple Pay unavailable:", e);
      }

      try {
        const googlePay = await payments.googlePay(paymentRequest);
        await googlePay.attach("#google-pay-button");
        googlePayRef.current = googlePay;
        setWalletsAvailable((w) => ({ ...w, googlePay: true }));
      } catch (e) {
        console.log("Google Pay unavailable:", e);
      }

      try {
        const cashAppPay = await payments.cashAppPay(paymentRequest, {
          redirectURL: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
          referenceId: `cart-${Date.now()}`,
        });
        await cashAppPay.attach("#cash-app-pay-button");
        cashAppRef.current = cashAppPay;
        setWalletsAvailable((w) => ({ ...w, cashAppPay: true }));
      } catch (e) {
        console.log("Cash App Pay unavailable:", e);
      }
    }

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      initPayments();
    } else {
      const script = document.createElement("script");
      script.src = src;
      script.onload = initPayments;
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  async function chargeAndRedirect(sourceId: string) {
    const form = contactFormRef.current;
    const email = form?.elements.namedItem("email") as HTMLInputElement | null;
    const name = form?.elements.namedItem("name") as HTMLInputElement | null;
    const address = form?.elements.namedItem("address") as HTMLInputElement | null;
    const city = form?.elements.namedItem("city") as HTMLInputElement | null;
    const state = form?.elements.namedItem("state") as HTMLInputElement | null;
    const zip = form?.elements.namedItem("zip") as HTMLInputElement | null;

    if (!email?.value || !name?.value || !address?.value || !city?.value || !state?.value || !zip?.value) {
      setError("Fill in your contact and shipping details before paying.");
      return false;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceId,
        email: email.value,
        name: name.value,
        address: address.value,
        city: city.value,
        state: state.value,
        zip: zip.value,
        items: items.map((i) => ({ handle: i.handle, qty: i.qty })),
        discountCode: appliedDiscount?.code,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return false;
    }

    clear();
    const q = new URLSearchParams({
      order: data.orderId,
      total: String(data.total),
      subtotal: String(data.subtotal),
      discount: String(data.discount),
      tax: String(data.tax),
      shipping: String(data.shipping),
    });
    router.push(`/checkout/success?${q.toString()}`);
    return true;
  }

  async function handleWalletPay(method: SquareWalletMethod | null, label: string) {
    if (!method) return;
    setProcessing(true);
    setError("");
    try {
      const result = await method.tokenize();
      if (result.status !== "OK" || !result.token) {
        setError(result.errors?.[0]?.message ?? `${label} could not be completed. Try again or use a card.`);
        setProcessing(false);
        return;
      }
      const ok = await chargeAndRedirect(result.token);
      if (!ok) setProcessing(false);
    } catch {
      setError(`${label} could not be completed. Try again or use a card.`);
      setProcessing(false);
    }
  }

  async function handleCardSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cardRef.current) return;
    setProcessing(true);
    setError("");
    try {
      const tokenResult = await cardRef.current.tokenize();
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        setError(tokenResult.errors?.[0]?.message ?? "Card could not be verified. Check the details and try again.");
        setProcessing(false);
        return;
      }
      const ok = await chargeAndRedirect(tokenResult.token);
      if (!ok) setProcessing(false);
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

  const anyWalletAvailable = walletsAvailable.applePay || walletsAvailable.googlePay || walletsAvailable.cashAppPay;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <form ref={contactFormRef} onSubmit={handleCardSubmit} className="space-y-4">
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

          {/* Wallet buttons — Square hides each one automatically if it's
              not supported/available, so this block can render empty on
              some browsers/devices. That's expected, not a bug. */}
          <div className="space-y-2 pt-2">
            <div id="apple-pay-button" onClick={() => handleWalletPay(applePayRef.current, "Apple Pay")} className="h-11 w-full cursor-pointer overflow-hidden rounded-xl" />
            <div id="google-pay-button" onClick={() => handleWalletPay(googlePayRef.current, "Google Pay")} className="h-11 w-full cursor-pointer overflow-hidden rounded-xl" />
            <div id="cash-app-pay-button" onClick={() => handleWalletPay(cashAppRef.current, "Cash App Pay")} className="h-11 w-full cursor-pointer overflow-hidden rounded-xl" />
          </div>
          {anyWalletAvailable && (
            <div className="flex items-center gap-3 text-xs text-cocoa/40">
              <div className="h-px flex-1 bg-cocoa/10" />
              or pay with card
              <div className="h-px flex-1 bg-cocoa/10" />
            </div>
          )}

          <p className="pt-2 font-display text-xl text-cocoa">Payment</p>
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
            {processing ? "Processing…" : `Place Order — $${estimatedTotal.toFixed(2)}`}
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

          {/* Discount code — display estimate only; server re-validates */}
          <div className="mt-6 flex gap-2 border-t border-cocoa/10 pt-4">
            <input
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="Discount code"
              className="flex-1 rounded-xl border border-cocoa/20 bg-cream px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="rounded-xl border border-cocoa/20 px-4 py-2 text-sm font-semibold text-cocoa hover:border-cocoa"
            >
              Apply
            </button>
          </div>
          {discountError && <p className="mt-1 text-xs text-hibiscus">{discountError}</p>}
          {appliedDiscount && (
            <p className="mt-1 text-xs text-lagoon-deep">
              {appliedDiscount.code} applied — {appliedDiscount.pct}% off
            </p>
          )}

          <div className="mt-4 space-y-2 border-t border-cocoa/10 pt-4 text-sm">
            <div className="flex justify-between text-cocoa/70">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-lagoon-deep">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-cocoa/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <p className="text-xs italic text-cocoa/40">
              Tax is calculated by Square at payment and shown on the next step.
            </p>
            <div className="flex justify-between border-t border-cocoa/10 pt-2 font-semibold text-cocoa">
              <span>Estimated Total</span>
              <span>${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
