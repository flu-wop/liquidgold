"use client";

// Single entry point for all funnel tracking. Each exported function fires
// to whichever pixels are configured (GA4 / Meta / TikTok — all no-op if
// their env var isn't set, so this is safe to call before Ariel sends IDs)
// AND logs a lightweight event to our own Turso `funnel_events` table via
// /api/track. The Turso copy is what lets us answer "where do people drop
// off" ourselves instead of only living inside Meta/Google's dashboards,
// and it's the only place quiz activity and abandoned checkouts get
// recorded, since pixels don't have a concept of either out of the box.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

const SESSION_KEY = "lg_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

// Fire-and-forget log to our own funnel_events table. Never blocks the UI
// and never throws — a failed analytics call must not break shopping.
function logToTurso(eventType: string, data?: Record<string, unknown>) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), eventType, data }),
      keepalive: true, // survives page navigation, important for begin_checkout/purchase
    }).catch(() => {});
  } catch {
    // no-op
  }
}

type ItemPayload = {
  handle: string;
  name: string;
  price: number; // dollars
  qty?: number;
};

function ga4(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) window.gtag("event", event, params);
}

function metaPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) window.fbq("track", event, params);
}

function tiktokPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.ttq) window.ttq.track(event, params);
}

export function trackViewItem(item: ItemPayload) {
  ga4("view_item", {
    currency: "USD",
    value: item.price,
    items: [{ item_id: item.handle, item_name: item.name, price: item.price }],
  });
  metaPixel("ViewContent", {
    content_ids: [item.handle],
    content_name: item.name,
    value: item.price,
    currency: "USD",
  });
  tiktokPixel("ViewContent", {
    content_id: item.handle,
    content_name: item.name,
    value: item.price,
    currency: "USD",
  });
  logToTurso("view_item", { handle: item.handle, name: item.name });
}

export function trackAddToCart(item: ItemPayload) {
  const qty = item.qty ?? 1;
  ga4("add_to_cart", {
    currency: "USD",
    value: item.price * qty,
    items: [{ item_id: item.handle, item_name: item.name, price: item.price, quantity: qty }],
  });
  metaPixel("AddToCart", {
    content_ids: [item.handle],
    content_name: item.name,
    value: item.price * qty,
    currency: "USD",
  });
  tiktokPixel("AddToCart", {
    content_id: item.handle,
    content_name: item.name,
    value: item.price * qty,
    currency: "USD",
    quantity: qty,
  });
  logToTurso("add_to_cart", { handle: item.handle, name: item.name, qty });
}

export function trackBeginCheckout(items: ItemPayload[], subtotal: number) {
  ga4("begin_checkout", {
    currency: "USD",
    value: subtotal,
    items: items.map((i) => ({ item_id: i.handle, item_name: i.name, price: i.price, quantity: i.qty ?? 1 })),
  });
  metaPixel("InitiateCheckout", {
    content_ids: items.map((i) => i.handle),
    value: subtotal,
    currency: "USD",
    num_items: items.reduce((n, i) => n + (i.qty ?? 1), 0),
  });
  tiktokPixel("InitiateCheckout", {
    content_id: items.map((i) => i.handle).join(","),
    value: subtotal,
    currency: "USD",
  });
  // This is the row abandoned-checkout detection looks for: if there's no
  // matching `purchase` for this session within a few hours, it's a drop-off.
  logToTurso("checkout_started", {
    items: items.map((i) => ({ handle: i.handle, qty: i.qty ?? 1 })),
    subtotal,
  });
}

export function trackPurchase(orderId: string, items: ItemPayload[], total: number) {
  ga4("purchase", {
    transaction_id: orderId,
    currency: "USD",
    value: total,
    items: items.map((i) => ({ item_id: i.handle, item_name: i.name, price: i.price, quantity: i.qty ?? 1 })),
  });
  metaPixel("Purchase", {
    content_ids: items.map((i) => i.handle),
    value: total,
    currency: "USD",
  });
  tiktokPixel("CompletePayment", {
    content_id: items.map((i) => i.handle).join(","),
    value: total,
    currency: "USD",
  });
  logToTurso("purchase", { orderId, total });
}

export function trackQuizStarted() {
  ga4("quiz_started", {});
  logToTurso("quiz_started");
}

export function trackQuizCompleted(resultScent: string) {
  ga4("quiz_completed", { scent: resultScent });
  metaPixel("Lead", { content_name: `quiz:${resultScent}` });
  logToTurso("quiz_completed", { resultScent });
}
