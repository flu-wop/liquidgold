import { getDb, ensureSchema } from "./db";

export type FunnelCounts = {
  viewItem: number;
  addToCart: number;
  checkoutStarted: number;
  purchase: number;
  quizStarted: number;
  quizCompleted: number;
};

// Distinct sessions per event type over the window — sessions, not raw
// event rows, since one shopper viewing 5 products shouldn't count as 5
// people entering the funnel.
export async function getFunnelCounts(days: number): Promise<FunnelCounts> {
  await ensureSchema();
  const db = getDb();
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  const r = await db.execute({
    sql: `SELECT event_type, COUNT(DISTINCT session_id) as c
          FROM funnel_events
          WHERE created_at >= ?
          GROUP BY event_type`,
    args: [since],
  });

  const counts: FunnelCounts = {
    viewItem: 0,
    addToCart: 0,
    checkoutStarted: 0,
    purchase: 0,
    quizStarted: 0,
    quizCompleted: 0,
  };
  const map: Record<string, keyof FunnelCounts> = {
    view_item: "viewItem",
    add_to_cart: "addToCart",
    checkout_started: "checkoutStarted",
    purchase: "purchase",
    quiz_started: "quizStarted",
    quiz_completed: "quizCompleted",
  };
  for (const row of r.rows) {
    const key = map[row.event_type as string];
    if (key) counts[key] = Number(row.c);
  }
  return counts;
}

export type AbandonedCheckout = {
  sessionId: string;
  createdAt: number;
  subtotal: number | null;
  itemCount: number | null;
};

// A checkout_started session with no purchase from that same session within
// `graceHours`, and old enough that it's fair to call it abandoned rather
// than "still shopping." Deliberately simple (session-based, not
// customer-identified) since nothing on this stack captures email pre-payment.
export async function getAbandonedCheckouts(graceHours = 3, limit = 50): Promise<AbandonedCheckout[]> {
  await ensureSchema();
  const db = getDb();
  const cutoff = Math.floor(Date.now() / 1000) - graceHours * 3600;

  const r = await db.execute({
    sql: `SELECT cs.session_id, cs.created_at, cs.data_json
          FROM funnel_events cs
          WHERE cs.event_type = 'checkout_started'
            AND cs.created_at < ?
            AND NOT EXISTS (
              SELECT 1 FROM funnel_events p
              WHERE p.event_type = 'purchase' AND p.session_id = cs.session_id
            )
          ORDER BY cs.created_at DESC
          LIMIT ?`,
    args: [cutoff, limit],
  });

  return r.rows.map((row) => {
    let subtotal: number | null = null;
    let itemCount: number | null = null;
    try {
      const data = JSON.parse(row.data_json as string);
      subtotal = typeof data.subtotal === "number" ? data.subtotal : null;
      itemCount = Array.isArray(data.items)
        ? data.items.reduce((n: number, i: { qty?: number }) => n + (i.qty ?? 1), 0)
        : null;
    } catch {
      // malformed/missing data_json — still show the row, just without amounts
    }
    return {
      sessionId: row.session_id as string,
      createdAt: Number(row.created_at),
      subtotal,
      itemCount,
    };
  });
}
