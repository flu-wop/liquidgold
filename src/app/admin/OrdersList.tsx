"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderItem = { name: string; size: string; type: string; qty: number; price: number };

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
  items_json: string;
  subtotal_cents: number;
  discount_code: string | null;
  discount_cents: number;
  tax_cents: number;
  shipping_cents: number;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  label_url: string | null;
  label_cost: string | null;
  created_at: number;
};

function parseItems(json: string): OrderItem[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const field = "rounded border border-cocoa/20 bg-cream px-2 py-1.5 text-xs";
const pill = "min-h-[32px] rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-60";

function LabelButton({ order }: { order: Order }) {
  const [busy, setBusy] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  if (order.label_url) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <a href={order.label_url} target="_blank" rel="noopener noreferrer" className={`${pill} bg-cocoa text-cream`}>
          Print label (4×6)
        </a>
        {order.label_cost && <span className="text-xs text-cocoa/60">Postage ${order.label_cost}</span>}
      </div>
    );
  }

  async function buy() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/create-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, weightOz: weight ? Number(weight) : undefined }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't create the label.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="decimal"
          placeholder="Weight oz (auto)"
          aria-label="Package weight in ounces (leave blank to estimate)"
          className={`${field} w-32`}
        />
        <button onClick={buy} disabled={busy} className={`${pill} bg-cocoa text-cream`}>
          {busy ? "Buying…" : "Buy label (EasyPost)"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-hibiscus">{error}</p>}
    </div>
  );
}

function ShipForm({ order }: { order: Order }) {
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [carrier, setCarrier] = useState(order.tracking_carrier ?? "USPS");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleShip() {
    setSending(true);
    setError("");
    const res = await fetch("/api/admin/ship-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        trackingNumber: tracking,
        carrier,
        trackingUrl: order.tracking_url ?? undefined,
      }),
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
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} aria-label="Carrier" className={field}>
          <option>USPS</option>
          <option>UPS</option>
          <option>FedEx</option>
        </select>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking number (optional)"
          aria-label="Tracking number"
          className={`${field} min-w-0 flex-1 sm:flex-none sm:w-56`}
        />
        <button onClick={handleShip} disabled={sending} className={`${pill} bg-lagoon text-cream`}>
          {sending ? "Sending…" : "Mark Shipped + Email"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-hibiscus">{error}</p>}
    </div>
  );
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <div className="-mt-1 divide-y divide-cocoa/10">
      {orders.map((o) => {
        const items = parseItems(o.items_json);
        return (
          <div key={o.id} className="space-y-3 py-5 text-sm first:pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-semibold text-cocoa">
                {o.id}
                <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-cocoa/70">
                  {o.status}
                </span>
              </p>
              <p className="font-semibold text-cocoa">${(o.total_cents / 100).toFixed(2)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa/50">Ship to</p>
                <p className="mt-1 text-cocoa">{o.name}</p>
                <p className="text-cocoa/70">{o.address}</p>
                <p className="text-cocoa/70">{o.city}, {o.state} {o.zip}</p>
                <p className="mt-1 break-all text-cocoa/60">{o.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa/50">Items</p>
                <ul className="mt-1 space-y-0.5 text-cocoa">
                  {items.map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-3">
                      <span className="min-w-0">
                        {i.qty} × {i.name} <span className="text-cocoa/50">({i.size})</span>
                      </span>
                      <span className="shrink-0 text-cocoa/60">${(i.price * i.qty).toFixed(2)}</span>
                    </li>
                  ))}
                  {items.length === 0 && <li className="text-cocoa/50">No item details saved.</li>}
                </ul>
              </div>
            </div>

            <p className="text-xs text-cocoa/60">
              Subtotal ${(o.subtotal_cents / 100).toFixed(2)}
              {o.discount_code
                ? ` · ${o.discount_code}${o.discount_cents > 0 ? ` -$${(o.discount_cents / 100).toFixed(2)}` : ""}`
                : ""}
              {" "}· Tax ${(o.tax_cents / 100).toFixed(2)}
              {" "}· Shipping {o.shipping_cents === 0 ? "free" : `$${(o.shipping_cents / 100).toFixed(2)}`}
            </p>

            {o.status === "shipped" ? (
              <div className="space-y-2">
                <p className="text-xs text-lagoon-deep">
                  Shipped{o.tracking_number ? ` — ${o.tracking_carrier} ${o.tracking_number}` : ""}
                </p>
                {o.label_url && <LabelButton order={o} />}
              </div>
            ) : (
              <div className="space-y-2">
                <LabelButton order={o} />
                <ShipForm key={o.tracking_number ?? "none"} order={o} />
              </div>
            )}
          </div>
        );
      })}
      {orders.length === 0 && <p className="py-4 text-sm text-cocoa/40">No orders yet.</p>}
    </div>
  );
}
