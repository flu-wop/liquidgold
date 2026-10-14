// src/components/admin/insights-ui.tsx
// Server-rendered pieces for /admin/insights: stat tiles, daily bars, tables,
// funnel. No client JS; charts are plain SVG/CSS.
import type { Insights } from "@/lib/insights/types"

export const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
const num = (n: number) => n.toLocaleString("en-US")

export function longDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-cocoa/15 p-5 sm:p-6">
      <h3 className="font-display text-xl text-lagoon-deep mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev && !cur) return <span className="text-cocoa/50 text-xs">no data yet</span>
  if (!prev) return <span className="text-cocoa/50 text-xs">new this period</span>
  const pct = Math.round(((cur - prev) / prev) * 100)
  const tone = pct > 0 ? "text-emerald-600" : pct < 0 ? "text-red-600" : "text-cocoa/65"
  return <span className={`text-xs ${tone}`}>{pct > 0 ? "+" : ""}{pct}% vs previous period</span>
}

export function Stat({ label, value, cur, prev }: { label: string; value: string; cur: number; prev: number }) {
  return (
    <div className="bg-white border border-cocoa/15 p-5">
      <div className="text-xs text-cocoa/65 uppercase tracking-wide mb-1">{label}</div>
      <div className="font-display text-3xl text-cocoa mb-1">{value}</div>
      <Delta cur={cur} prev={prev} />
    </div>
  )
}

export function Bars({ rows, format }: { rows: { date: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div>
      <div className="flex items-end gap-px h-28" role="img" aria-label="Daily values">
        {rows.map((r) => (
          <div
            key={r.date}
            title={`${longDate(r.date)}: ${format(r.value)}`}
            className="flex-1 bg-lagoon/70 hover:bg-lagoon rounded-t-[1px] min-w-[2px]"
            style={{ height: `${Math.max(2, (r.value / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-cocoa/50 mt-1">
        <span>{longDate(rows[0].date)}</span>
        <span>{longDate(rows[rows.length - 1].date)}</span>
      </div>
    </div>
  )
}

export function Overview({ data }: { data: Insights }) {
  return (
    <div className="space-y-5">
      {data.attention.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3">
          {data.attention.map((a) => (
            <div key={a.label} className={`border  px-4 py-3 text-sm ${a.tone === "alert" && a.value > 0 ? "border-red-500/50 text-red-600" : "border-cocoa/15 text-cocoa/65"}`}>
              <b className="text-cocoa">{num(a.value)}</b> {a.label}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.sources.map((s) => (
          <Stat key={s.key} label={s.label} value={s.format === "money" ? money(s.total) : num(s.total)} cur={s.total} prev={s.prev} />
        ))}
        <Stat label="Visitors" value={num(data.visitors.cur)} cur={data.visitors.cur} prev={data.visitors.prev} />
        <Stat label="Page views" value={num(data.pageviews.cur)} cur={data.pageviews.cur} prev={data.pageviews.prev} />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {data.sources.filter((s) => s.format === "money").map((s) => (
          <Card key={s.key} title={`${s.label} by day`}>
            <Bars rows={data.daily.map((d) => ({ date: d.date, value: d.series[s.key] ?? 0 }))} format={money} />
          </Card>
        ))}
        <Card title="Visitors by day">
          <Bars rows={data.daily.map((d) => ({ date: d.date, value: d.visitors }))} format={num} />
        </Card>
      </div>
    </div>
  )
}

export function PagesTab({ data }: { data: Insights }) {
  const devTotal = Object.values(data.devices).reduce((a, b) => a + b, 0)
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card title="Top pages">
        {data.pages.length === 0 && <p className="text-sm text-cocoa/50">No page views recorded in this range.</p>}
        {data.pages.map((p) => (
          <div key={p.path} className="flex justify-between gap-3 text-sm py-1.5 border-b border-cocoa/10">
            <span className="text-cocoa truncate font-mono text-xs">{p.path || "/"}</span>
            <span className="text-cocoa/65 shrink-0">{num(p.views)} views{p.avgTime ? ` · ${p.avgTime}s avg` : ""}</span>
          </div>
        ))}
      </Card>
      <div className="space-y-5">
        <Card title="Where visitors came from">
          {data.referrers.length === 0 && <p className="text-sm text-cocoa/50">No outside referrers yet (direct visits don&apos;t show here).</p>}
          {data.referrers.map((r) => (
            <div key={r.host} className="flex justify-between text-sm py-1.5 border-b border-cocoa/10">
              <span className="text-cocoa">{r.host}</span>
              <span className="text-cocoa/65">{num(r.visits)}</span>
            </div>
          ))}
        </Card>
        <Card title="Devices">
          {devTotal === 0 && <p className="text-sm text-cocoa/50">No visits recorded in this range.</p>}
          {Object.entries(data.devices).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1.5 border-b border-cocoa/10">
              <span className="text-cocoa capitalize">{k}</span>
              <span className="text-cocoa/65">{Math.round((v / devTotal) * 100)}% ({num(v)})</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function FunnelTab({ data }: { data: Insights }) {
  const sales = data.sources.find((s) => s.key === "sales")
  return (
    <div className="space-y-5">
      {data.funnels.map((f) => {
        const top = Math.max(1, f.steps[0]?.value ?? 1)
        return (
          <Card key={f.label} title={f.label}>
            {f.steps.map((s, i) => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cocoa">{s.label}</span>
                  <span className="text-cocoa/65">{num(s.value)}{i > 0 && f.steps[i - 1].value ? ` · ${Math.round((s.value / f.steps[i - 1].value) * 100)}% of previous` : ""}</span>
                </div>
                <div className="h-2 bg-cocoa/10 "><div className="h-2 bg-lagoon " style={{ width: `${(s.value / top) * 100}%` }} /></div>
              </div>
            ))}
            {sales && <div className="text-xs text-cocoa/65 mt-4">Completed purchases in this range: <b className="text-cocoa">{num(sales.total)}</b> (from Square, counted separately from visitor tracking).</div>}
          </Card>
        )
      })}
    </div>
  )
}
