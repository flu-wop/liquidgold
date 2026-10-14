// Admin home — a quick read on the last 30 days, what needs shipping, and
// shortcuts to every section. Same layout as the other sites' admin home
// (Epoch Skin, MCS, Jade); the orders tables live at /admin/orders.
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { isAuthed } from "@/lib/admin-auth"
import { getDb, ensureSchema } from "@/lib/db"
import { getDB } from "@/lib/insights/db"
import { getInsights } from "@/lib/insights/core"
import { insightsConfig } from "@/lib/insights/config"
import type { Insights } from "@/lib/insights/types"
import { AdminPage, AdminLogin, adminBtn } from "@/components/admin/page-frame"
import { ADMIN_SECTIONS } from "@/components/admin/sections"
import { Stat, money, longDate } from "@/components/admin/insights-ui"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const metadata = { title: "Admin", robots: { index: false } }

const DESCRIPTIONS: Record<string, string> = {
  "/admin/insights": "Sales, visitors & the buying funnel",
  "/admin/orders": "Orders, catalog, wholesale & messages",
  "/admin/content": "Site wording & photos",
  "/admin/funnel": "Quiz, cart & abandoned checkouts",
  "/admin/system": "Env vars, webhooks & integrations",
}

const TZ = "America/Chicago"

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(new Date()))
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}

type ToShip = { id: string; name: string; sub: string; total: number; created: number }

function itemCount(json: unknown): number {
  try {
    const items = JSON.parse(String(json))
    if (!Array.isArray(items)) return 0
    return items.reduce((n: number, i: { quantity?: number; qty?: number }) => n + (Number(i?.quantity ?? i?.qty) || 1), 0)
  } catch {
    return 0
  }
}

export default async function AdminHomePage() {
  if (!(await isAuthed())) return <AdminLogin />

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date())

  // Make sure every table exists before Insights queries them (a no-op once created).
  try { await ensureSchema() } catch (err) { console.error("[admin home] ensureSchema", err) }

  let data: Insights | null = null
  let failed = false
  const idb = getDB()
  if (idb) {
    try { data = await getInsights(idb, insightsConfig, 30) } catch (err) { console.error("[admin home]", err); failed = true }
  }

  let toShip: ToShip[] = []
  try {
    const res = await getDb().execute("SELECT id, name, city, state, items_json, total_cents, created_at FROM orders WHERE status = 'paid' ORDER BY created_at ASC LIMIT 6")
    toShip = res.rows.map((r) => {
      const n = itemCount(r.items_json)
      return {
        id: String(r.id),
        name: String(r.name),
        sub: `${n ? `${n} item${n === 1 ? "" : "s"} · ` : ""}${r.city}, ${r.state}`,
        total: Number(r.total_cents) / 100,
        created: Number(r.created_at),
      }
    })
  } catch (err) {
    console.error("[admin home] to ship", err)
  }

  const rev = data?.sources.find((s) => s.key === "revenue")
  const sales = data?.sources.find((s) => s.key === "sales")
  const needsAttention = data?.attention.filter((a) => a.value > 0) ?? []

  return (
    <AdminPage>
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] tracking-[0.26em] uppercase text-lagoon-deep mb-1.5">{longDate(today)}</p>
        <h1 className="font-display text-3xl sm:text-4xl text-cocoa leading-tight">{greeting()}, Ariel</h1>
      </div>

      {needsAttention.map((a) => (
        <p key={a.label} className="mb-4 text-sm text-red-700 border border-red-300 bg-red-50 px-4 py-3">
          {a.value} {a.label}. <Link href="/admin/orders" className="underline">Review</Link>
        </p>
      ))}

      <section aria-label="Last 30 days" className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-cocoa/60">Last 30 days</h2>
          <Link href="/admin/insights" className="text-xs text-lagoon-deep hover:underline inline-flex items-center gap-1">
            All insights <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {data && rev && sales ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Revenue" value={money(rev.total)} cur={rev.total} prev={rev.prev} />
            <Stat label="Orders" value={String(sales.total)} cur={sales.total} prev={sales.prev} />
            <Stat label="Visitors" value={data.visitors.cur.toLocaleString("en-US")} cur={data.visitors.cur} prev={data.visitors.prev} />
            <Stat label="Page views" value={data.pageviews.cur.toLocaleString("en-US")} cur={data.pageviews.cur} prev={data.pageviews.prev} />
          </div>
        ) : (
          <p className="text-sm text-cocoa/65 bg-white border border-cocoa/15 p-4">
            {failed || idb ? "Couldn’t load numbers right now. Sections below still work." : "Numbers need a database connection. Sections below still work."}
          </p>
        )}
      </section>

      <div className="grid gap-8 lg:gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section aria-label="Ready to ship">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-cocoa/60">Ready to ship</h2>
            <Link href="/admin/orders" className="text-xs text-lagoon-deep hover:underline inline-flex items-center gap-1">
              Add tracking <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white border border-cocoa/15">
            {toShip.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-display text-lg text-cocoa mb-1">Nothing waiting to ship</p>
                <p className="text-sm text-cocoa/65">Paid orders show up here until you add tracking.</p>
              </div>
            ) : (
              <ul className="divide-y divide-cocoa/10">
                {toShip.map((o) => {
                  const day = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(o.created * 1000))
                  return (
                    <li key={o.id} className="flex gap-4 px-4 sm:px-5 py-3.5">
                      <div className="w-16 shrink-0">
                        <p className={`text-[10px] tracking-[0.14em] uppercase ${day === today ? "text-lagoon-deep font-medium" : "text-cocoa/60"}`}>
                          {day === today ? "Today" : longDate(day).split(",")[0]}
                        </p>
                        <p className="text-sm text-cocoa tabular-nums whitespace-nowrap">{money(o.total)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-cocoa font-medium truncate">{o.name}</p>
                        <p className="text-xs text-cocoa/65 truncate">{o.sub}</p>
                        <p className="text-[11px] text-cocoa/50 truncate">Ordered {longDate(day)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link href="/admin/orders" className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-cocoa/10 text-xs text-cocoa/65 hover:text-cocoa">
              All orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        <section aria-label="Sections">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-cocoa/60 mb-3">Go to</h2>
          <div className="grid grid-cols-2 gap-3">
            {[...ADMIN_SECTIONS.filter((s) => s.href === "/admin/insights"), ...ADMIN_SECTIONS.filter((s) => s.href !== "/admin" && s.href !== "/admin/insights")].map(({ href, label, icon: Icon }) => {
              const hero = href === "/admin/insights"
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group border p-4 transition-colors min-w-0 hover:border-lagoon ${hero ? "col-span-2 bg-lagoon/10 border-lagoon/30" : "bg-white border-cocoa/15"}`}
                >
                  <Icon className="w-4 h-4 mb-3 text-lagoon-deep" strokeWidth={1.6} aria-hidden />
                  <p className="font-display text-lg leading-tight text-cocoa">{label}</p>
                  <p className="text-xs mt-1 leading-snug text-cocoa/65">{DESCRIPTIONS[href]}</p>
                </Link>
              )
            })}
          </div>
          <Link href="/shop" className={`${adminBtn.secondary} w-full mt-3`}>
            Open the shop
          </Link>
        </section>
      </div>
    </AdminPage>
  )
}
