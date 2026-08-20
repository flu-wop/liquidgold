"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  total_cents: number;
  status: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  subtotal_cents: number;
  discount_code: string | null;
  discount_cents: number;
  tax_cents: number;
  shipping_cents: number;
  tracking_number: string | null;
  tracking_carrier: string | null;
};

function ShipForm({ order }: { order: Order }) {
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleShip() {
    setSending(true);
    setError("");
    const res = await fetch("/api/admin/ship-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, trackingNumber: tracking, carrier }),
    });
    setSending(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to mark shipped — try again.");
    }
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="rounded border border-cocoa/20 bg-cream px-2 py-1 text-xs">
          <option>USPS</option>
          <option>UPS</option>
          <option>FedEx</option>
        </select>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking number (optional)"
          className="rounded border border-cocoa/20 bg-cream px-2 py-1 text-xs"
        />
        <button
          onClick={handleShip}
          disabled={sending}
          className="rounded-full bg-lagoon px-3 py-1 text-xs font-semibold text-cream disabled:opacity-60"
        >
          {sending ? "Sending…" : "Mark Shipped + Email"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-hibiscus">{error}</p>}
    </div>
  );
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <div className="divide-y divide-cocoa/10 border-t border-cocoa/10">
      {orders.map((o) => (
        <div key={o.id} className="py-4 text-sm">
          <p className="font-semibold text-cocoa">
            {o.id} — ${(o.total_cents / 100).toFixed(2)} — {o.status}
          </p>
          <p className="text-cocoa/60">{o.name} · {o.email}</p>
          <p className="text-cocoa/50">{o.address}, {o.city}, {o.state} {o.zip}</p>
          <p className="text-xs text-cocoa/40">
            Subtotal ${(o.subtotal_cents / 100).toFixed(2)}
            {o.discount_code ? ` · ${o.discount_code} -$${(o.discount_cents / 100).toFixed(2)}` : ""}
            {" "}· Tax ${(o.tax_cents / 100).toFixed(2)}
            {" "}· Shipping ${(o.shipping_cents / 100).toFixed(2)}
          </p>
          {o.status === "shipped" ? (
            <p className="mt-1 text-xs text-lagoon-deep">
              Shipped{o.tracking_number ? ` — ${o.tracking_carrier} ${o.tracking_number}` : ""}
            </p>
          ) : (
            <ShipForm order={o} />
          )}
        </div>
      ))}
      {orders.length === 0 && <p className="py-4 text-sm text-cocoa/40">No orders yet.</p>}
    </div>
  );
}
