"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScentRow = { slug: string; name: string; hidden: boolean };

export default function ScentVisibility({ scents }: { scents: ScentRow[] }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-semibold text-cocoa">
        Show/Hide Products
        <span className="ml-2 font-normal text-cocoa/50">
          Hiding a scent removes all its sizes/types (Body Butter + Body Oil) from the shop
          page and homepage — nothing is deleted, and it's reversible any time.
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {scents.map((s) => (
          <ScentToggle key={s.slug} scent={s} />
        ))}
      </div>
    </div>
  );
}

function ScentToggle({ scent }: { scent: ScentRow }) {
  const [hidden, setHidden] = useState(scent.hidden);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toggle() {
    const next = !hidden;
    setSaving(true);
    const res = await fetch("/api/admin/scent-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: scent.slug, hidden: next }),
    });
    setSaving(false);
    if (res.ok) {
      setHidden(next);
      router.refresh();
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        hidden
          ? "border-cocoa/20 bg-cocoa/5 text-cocoa/40 line-through"
          : "border-lagoon bg-lagoon/10 text-lagoon-deep"
      }`}
    >
      {scent.name} {hidden ? "(hidden)" : ""}
    </button>
  );
}
