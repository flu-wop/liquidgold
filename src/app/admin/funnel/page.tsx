import { isAuthed } from "@/lib/admin-auth";
import AdminLoginForm from "../AdminLoginForm";
import { getFunnelCounts, getAbandonedCheckouts } from "@/lib/funnel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pct(part: number, whole: number): string {
  if (whole === 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function timeAgo(unixSecs: number): string {
  const mins = Math.round((Date.now() / 1000 - unixSecs) / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function FunnelPage() {
  if (!(await isAuthed())) return <AdminLoginForm />;

  const [counts30, abandoned] = await Promise.all([
    getFunnelCounts(30),
    getAbandonedCheckouts(3, 50),
  ]);

  const stages: { label: string; value: number; ofPrevious?: number }[] = [
    { label: "Viewed a product", value: counts30.viewItem },
    { label: "Added to cart", value: counts30.addToCart, ofPrevious: counts30.viewItem },
    { label: "Started checkout", value: counts30.checkoutStarted, ofPrevious: counts30.addToCart },
    { label: "Completed purchase", value: counts30.purchase, ofPrevious: counts30.checkoutStarted },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa">Funnel &amp; Conversion</h1>
      <p className="mt-2 text-sm text-cocoa/60">
        Last 30 days, counted by unique visitor session (not raw page views). Requires
        GA_MEASUREMENT_ID / META_PIXEL_ID / TIKTOK_PIXEL_ID to be set for the platform-side
        dashboards to also have this data — this table is our own independent copy.
      </p>

      <div className="mt-8 divide-y divide-cocoa/10 border-t border-b border-cocoa/10">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center justify-between py-4">
            <span className="text-cocoa">{s.label}</span>
            <span className="flex items-center gap-3">
              {i > 0 && s.ofPrevious !== undefined && (
                <span className="text-xs text-cocoa/40">
                  {pct(s.value, s.ofPrevious)} of previous step
                </span>
              )}
              <span className="min-w-[3ch] text-right font-display text-2xl text-cocoa">
                {s.value}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-lagoon/10 p-6">
          <p className="font-display text-3xl text-cocoa">{counts30.quizStarted}</p>
          <p className="mt-1 text-sm text-cocoa/60">Scent quiz started</p>
        </div>
        <div className="rounded-2xl bg-lagoon/10 p-6">
          <p className="font-display text-3xl text-cocoa">{counts30.quizCompleted}</p>
          <p className="mt-1 text-sm text-cocoa/60">
            Scent quiz completed ({pct(counts30.quizCompleted, counts30.quizStarted)})
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl text-cocoa">
          Abandoned Checkouts
          <span className="ml-2 text-base font-normal text-cocoa/40">({abandoned.length})</span>
        </h2>
        <p className="mt-1 text-sm text-cocoa/50">
          Checkout was started but no purchase followed within 3 hours. Sessions only — no
          email captured pre-payment on this stack, so these aren&apos;t individually followable
          without adding an earlier email-capture step.
        </p>
        <div className="mt-4 divide-y divide-cocoa/10 border-t border-cocoa/10">
          {abandoned.map((a) => (
            <div key={`${a.sessionId}-${a.createdAt}`} className="flex items-center justify-between py-3 text-sm">
              <span className="text-cocoa/70">{timeAgo(a.createdAt)}</span>
              <span className="text-cocoa/70">
                {a.itemCount ?? "?"} item{a.itemCount === 1 ? "" : "s"}
              </span>
              <span className="font-semibold text-cocoa">
                {a.subtotal !== null ? `$${a.subtotal.toFixed(2)}` : "—"}
              </span>
            </div>
          ))}
          {abandoned.length === 0 && (
            <p className="py-4 text-sm text-cocoa/40">None in the last 3+ hours.</p>
          )}
        </div>
      </div>
    </section>
  );
}
