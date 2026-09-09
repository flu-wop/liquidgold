"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CustomProduct = {
  handle: string;
  scentName: string;
  type: string;
  size: string;
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  howToUse: string;
  featured: boolean;
  active: boolean;
};

type FormState = {
  scentName: string;
  type: string;
  size: string;
  price: string;
  image: string;
  description: string;
  ingredients: string; // comma-separated in the UI, split on save
  howToUse: string;
  featured: boolean;
};

const BLANK_FORM: FormState = {
  scentName: "", type: "", size: "", price: "", image: "",
  description: "", ingredients: "", howToUse: "", featured: false,
};

function ProductForm({
  initial,
  editingHandle,
  onSaved,
  onCancel,
}: {
  initial: FormState;
  editingHandle: string | null; // null = creating a new product
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload-product-image", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) {
      setForm((f) => ({ ...f, image: data.url }));
    } else {
      setError(data.error ?? "Upload failed");
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const price = Number(form.price);
    const ingredients = form.ingredients.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      scentName: form.scentName.trim(),
      type: form.type.trim(),
      size: form.size.trim(),
      price,
      image: form.image,
      description: form.description.trim(),
      ingredients,
      howToUse: form.howToUse.trim(),
      featured: form.featured,
      ...(editingHandle ? { handle: editingHandle } : {}),
    };
    const res = await fetch("/api/admin/products", {
      method: editingHandle ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      setError(data.error ?? "Save failed");
    }
  }

  return (
    <div className="rounded-xl bg-lagoon/10 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-cocoa">
          Product / Scent Name
          <input
            value={form.scentName}
            onChange={(e) => setForm({ ...form, scentName: e.target.value })}
            placeholder="e.g. Cocoa Cashmere, or a brand-new line like Gift Box"
            className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-cocoa">
          Type
          <input
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            placeholder="e.g. Body Butter, Body Oil, Gift Set"
            className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-cocoa">
          Size
          <input
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            placeholder="e.g. 8 oz"
            className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-cocoa">
          Price (USD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 block text-xs font-semibold text-cocoa">
        Description
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-xs font-semibold text-cocoa">
        Ingredients (comma-separated)
        <input
          value={form.ingredients}
          onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
          placeholder="Shea Butter, Cocoa Butter, Sweet Almond Oil"
          className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-xs font-semibold text-cocoa">
        How to Use
        <textarea
          value={form.howToUse}
          onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
          rows={2}
          className="mt-1 w-full rounded-lg border border-cocoa/20 bg-cream px-3 py-2 text-sm"
        />
      </label>

      <div className="mt-3 flex items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-cocoa">Photo</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 text-xs" />
          {uploading && <p className="mt-1 text-xs text-cocoa/50">Uploading…</p>}
        </div>
        {form.image && (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-sand">
            <Image src={form.image} alt="" fill className="object-cover" />
          </div>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-cocoa">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Show on homepage best-sellers
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-hibiscus">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || uploading || !form.scentName || !form.type || !form.size || !form.price || !form.image}
          className="rounded-full bg-cocoa px-5 py-2 text-sm font-semibold text-cream disabled:opacity-50"
        >
          {saving ? "Saving…" : editingHandle ? "Save Changes" : "Add Product"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="rounded-full border border-cocoa/20 px-5 py-2 text-sm text-cocoa/60">
            Cancel
          </button>
        )}
      </div>
      <p className="mt-3 text-xs italic text-cocoa/40">
        After saving, hit &quot;Sync Product Catalog&quot; below so it gets real inventory tracking in Square —
        it won&apos;t show real stock or count against inventory until that&apos;s done.
      </p>
    </div>
  );
}

function formFromProduct(p: CustomProduct): FormState {
  return {
    scentName: p.scentName, type: p.type, size: p.size, price: String(p.price), image: p.image,
    description: p.description, ingredients: p.ingredients.join(", "), howToUse: p.howToUse, featured: p.featured,
  };
}

export default function CustomProducts({ products }: { products: CustomProduct[] }) {
  const [adding, setAdding] = useState(false);
  const [editingHandle, setEditingHandle] = useState<string | null>(null);
  const router = useRouter();

  async function toggleActive(p: CustomProduct) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: p.handle, active: !p.active }),
    });
    router.refresh();
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-cocoa">Admin-Added Products</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-full bg-guava px-4 py-1.5 text-xs font-semibold text-cream hover:bg-hibiscus"
          >
            + Add Product
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <ProductForm
            initial={BLANK_FORM}
            editingHandle={null}
            onSaved={() => { setAdding(false); router.refresh(); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) =>
          editingHandle === p.handle ? (
            <ProductForm
              key={p.handle}
              initial={formFromProduct(p)}
              editingHandle={p.handle}
              onSaved={() => { setEditingHandle(null); router.refresh(); }}
              onCancel={() => setEditingHandle(null)}
            />
          ) : (
            <div key={p.handle} className="flex items-center gap-3 rounded-lg bg-lagoon/10 px-3 py-2 text-sm">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-sand">
                <Image src={p.image} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium text-cocoa ${p.active ? "" : "text-cocoa/40 line-through"}`}>
                  {p.scentName} {p.type} — {p.size}
                </p>
                <p className="text-xs text-cocoa/50">${p.price}</p>
              </div>
              <button onClick={() => setEditingHandle(p.handle)} className="text-xs font-semibold text-lagoon-deep">
                Edit
              </button>
              <button onClick={() => toggleActive(p)} className="text-xs font-semibold text-cocoa/60">
                {p.active ? "Hide" : "Show"}
              </button>
            </div>
          )
        )}
        {products.length === 0 && !adding && (
          <p className="text-sm text-cocoa/40">No admin-added products yet.</p>
        )}
      </div>
    </div>
  );
}
