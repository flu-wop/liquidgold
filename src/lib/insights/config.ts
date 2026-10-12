// lib/insights/config.ts
// Liquid Gold Skin Co.'s InsightsConfig. Sales come from this site's own tables.
import type { ResultSet } from "@libsql/client"
import type { DayRange, DayValue, InsightsConfig } from "./types"
import { localDay, addDays } from "./core"

const TZ = "America/Chicago"

const since = (r: DayRange) => Math.floor(new Date(`${addDays(r.start, -1)}T00:00:00Z`).getTime() / 1000)
function rowsOf(res: ResultSet, map: (v: number) => number = (v) => v): DayValue[] {
  return res.rows.map((row) => ({
    date: localDay(new Date(Number(row.ts) * 1000), TZ),
    value: map(Number(row.v) || 0),
  }))
}

export const insightsConfig: InsightsConfig = {
  siteName: "Liquid Gold Skin Co.",
  eventsTable: "lg_site_events",
  timezone: TZ,
  eventTypes: ["page_view", "page_time", "checkout_click"],
  sources: [
    {
      key: "revenue", label: "Revenue", format: "money",
      fetch: async (r, db) => rowsOf(await db.execute({ sql: "SELECT created_at AS ts, total_cents AS v FROM orders WHERE status IN ('paid','shipped') AND created_at >= ?", args: [since(r)] }), (v) => v / 100),
    },
    {
      key: "sales", label: "Orders", format: "count",
      fetch: async (r, db) => rowsOf(await db.execute({ sql: "SELECT created_at AS ts, 1 AS v FROM orders WHERE status IN ('paid','shipped') AND created_at >= ?", args: [since(r)] })),
    },
  ],
  funnels: [
    {
      label: "Buying a product",
      steps: [
        { label: "Visited the site", type: "page_view" },
        { label: "Opened the Shop", type: "page_view", path: "/shop" },
        { label: "Reached checkout", type: "page_view", path: "/checkout" },
        { label: "Tried to pay", type: "checkout_click" },
      ],
    },
  ],
  attention: async (db) => {
    const r = await db.execute("SELECT COUNT(*) AS n FROM orders WHERE status = 'paid'")
    return [{ label: "paid orders waiting to ship", value: Number(r.rows[0]?.n ?? 0), tone: "alert" as const }]
  },
}
