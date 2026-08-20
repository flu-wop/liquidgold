"use client";

import { useState, useEffect, useCallback } from "react";

type CheckResult = { status: "ok" | "warn" | "error"; detail: string };
type HealthData = {
  envVars: Record<string, CheckResult>;
  webhookHealth: { square: CheckResult; squareWebhook: CheckResult; lastOrder: CheckResult; resend: CheckResult; turso: CheckResult };
  apiUsage: CheckResult;
  productSync: CheckResult;
  checkedAt: string;
};

const STATUS_COLOR: Record<string, string> = { ok: "#1B9C93", warn: "#D9A441", error: "#F0487A" };

function Pill({ status }: { status: "ok" | "warn" | "error" }) {
  return (
    <span
      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: STATUS_COLOR[status] }}
    />
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-lagoon/10 p-5">
      <h3 className="mb-3 font-display text-lg text-cocoa">{title}</h3>
      {children}
    </div>
  );
}

export default function SystemDashboard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState("");

  const fetchHealth = useCallback(async () => {
    const res = await fetch("/api/admin/health");
    if (!res.ok) {
      setError("Health check failed to load.");
      return;
    }
    setData(await res.json());
    setError("");
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (error) return <p className="text-sm text-hibiscus">{error}</p>;
  if (!data) return <p className="text-sm text-cocoa/40">Checking system health…</p>;

  return (
    <div>
      <p className="mb-4 text-xs text-cocoa/40">
        Last checked {new Date(data.checkedAt).toLocaleTimeString()} — refreshes every 60s
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Env Vars">
          {Object.entries(data.envVars).map(([key, r]) => (
            <div key={key} className="mb-1.5 text-sm text-cocoa/80">
              <Pill status={r.status} /> {key} — {r.detail}
            </div>
          ))}
        </Card>

        <Card title="Connections">
          {Object.entries(data.webhookHealth).map(([key, r]) => (
            <div key={key} className="mb-1.5 text-sm text-cocoa/80">
              <Pill status={r.status} /> {key} — {r.detail}
            </div>
          ))}
        </Card>

        <Card title="API Usage (30 days)">
          <div className="text-sm text-cocoa/80"><Pill status={data.apiUsage.status} /> {data.apiUsage.detail}</div>
        </Card>

        <Card title="Product Sync">
          <div className="text-sm text-cocoa/80"><Pill status={data.productSync.status} /> {data.productSync.detail}</div>
        </Card>
      </div>
    </div>
  );
}
