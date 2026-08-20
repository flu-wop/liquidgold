"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stock = { handle: string; name: string; count: number | null };

function StockRow({ item }: { item: Stock }) {
  const [value, setValue] = useState(item.count?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    const quantity = Number(value);
    if (Number.isNaN(quantity) || quantity < 0) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/set-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: item.handle, quantity }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save — try again.");
    }
  }

  return (
    <div className="rounded-lg bg-lagoon/10 px-3 py-2 text-xs">
      <p className="font-medium text-cocoa">{item.name}</p>
      {item.count === null ? (
        <p className="text-cocoa/50">Not synced</p>
      ) : (
        <div className="mt-1 flex items-center gap-1">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-16 rounded border border-cocoa/20 bg-cream px-1.5 py-0.5 text-xs"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-cocoa px-2 py-0.5 text-xs font-semibold text-cream disabled:opacity-50"
          >
            {saving ? "…" : saved ? "\u2713" : "Set"}
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-hibiscus">{error}</p>}
    </div>
  );
}

export default function CatalogSync({ stock }: { stock: Stock[] }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    const res = await fetch("/api/admin/sync-catalog", { method: "POST" });
    const data = await res.json();
    setSyncing(false);
    if (res.ok) {
      setResult(`Synced ${data.variationCount} products (${data.itemsCreated} new, ${data.itemsUpdated} updated).`);
      router.refresh();
    } else {
      setResult(data.error ?? "Sync failed.");
    }
  }

  const synced = stock.filter((s) => s.count !== null);
  const unsynced = stock.filter((s) => s.count === null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-cocoa/60">
          {synced.length} of {stock.length} SKUs synced to Square Catalog.
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-full bg-cocoa px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Sync Product Catalog"}
        </button>
      </div>
      {result && <p className="mt-2 text-sm text-lagoon-deep">{result}</p>}

      {unsynced.length > 0 && (
        <p className="mt-2 text-xs italic text-cocoa/40">
          Not yet synced: run a sync above, then set quantities below.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stock.map((s) => (
          <StockRow key={s.handle} item={s} />
        ))}
      </div>
    </div>
  );
}
