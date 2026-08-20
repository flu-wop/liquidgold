"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CONTENT_FIELDS, type ContentKey } from "@/lib/content";

type Props = { values: Record<ContentKey, string> };

function TextField({ fieldKey, initial }: { fieldKey: ContentKey; initial: string }) {
  const field = CONTENT_FIELDS[fieldKey];
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fieldKey, value }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save");
    }
  }

  return (
    <div className="rounded-xl bg-lagoon/10 p-4">
      <p className="mb-2 text-sm font-semibold text-cocoa">{field.label}</p>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={value.split("\n").length > 3 ? 6 : 3}
          className="w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
        />
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-cocoa px-4 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved \u2713" : "Save"}
        </button>
        {error && <p className="text-xs text-hibiscus">{error}</p>}
      </div>
    </div>
  );
}

function ImageField({ fieldKey, initial }: { fieldKey: ContentKey; initial: string }) {
  const field = CONTENT_FIELDS[fieldKey];
  const [preview, setPreview] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("key", fieldKey);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setPreview(data.url);
      router.refresh();
    } else {
      setError(data.error ?? "Upload failed");
    }
  }

  return (
    <div className="rounded-xl bg-lagoon/10 p-4">
      <p className="mb-2 text-sm font-semibold text-cocoa">{field.label}</p>
      <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-lg bg-cream">
        <Image src={preview} alt="" fill className="object-cover" />
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        disabled={uploading}
        className="text-xs"
      />
      {uploading && <p className="mt-1 text-xs text-cocoa/50">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-hibiscus">{error}</p>}
    </div>
  );
}

function Section({ title, keys, values }: { title: string; keys: ContentKey[]; values: Record<ContentKey, string> }) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 font-display text-2xl text-cocoa">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {keys.map((k) =>
          CONTENT_FIELDS[k].type === "image" ? (
            <ImageField key={k} fieldKey={k} initial={values[k]} />
          ) : (
            <TextField key={k} fieldKey={k} initial={values[k]} />
          )
        )}
      </div>
    </div>
  );
}

export default function ContentEditor({ values }: Props) {
  const scentSlugs = ["cocoa-cashmere", "juicy-paradise", "bare-current", "pink-fantasy", "unscented"];
  return (
    <div>
      <Section title="Homepage" keys={["hero.headline", "hero.subheadline", "hero.image"]} values={values} />
      <Section title="About Page" keys={["about.story", "about.founderImage", "about.mission"]} values={values} />
      {scentSlugs.map((slug) => (
        <Section
          key={slug}
          title={`Scent — ${slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}`}
          keys={[`scent.${slug}.story` as ContentKey, `scent.${slug}.vibe` as ContentKey, `scent.${slug}.image` as ContentKey]}
          values={values}
        />
      ))}
    </div>
  );
}
