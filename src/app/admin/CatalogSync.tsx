"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stock = { handle: string; name: string; count: number | null };

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
          Not yet synced: run a sync above. After syncing, set real starting quantities
          in Square Dashboard → Items (we don&apos;t invent stock numbers).
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stock.map((s) => (
          <div key={s.handle} className="rounded-lg bg-lagoon/10 px-3 py-2 text-xs">
            <p className="font-medium text-cocoa">{s.name}</p>
            <p className={s.count === 0 ? "text-hibiscus" : "text-cocoa/50"}>
              {s.count === null ? "Not synced" : s.count === 0 ? "Sold out" : `${s.count} in stock`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
