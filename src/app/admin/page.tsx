import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import Link from "next/link";
import { getDb, ensureSchema } from "@/lib/db";
import { getStockCounts } from "@/lib/square-catalog";
import { products } from "@/lib/products";
import AdminLoginForm from "./AdminLoginForm";
import CatalogSync from "./CatalogSync";
import OrdersList from "./OrdersList";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEq(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

async function isAuthed() {
  const store = await cookies();
  const cookie = store.get("lg_admin")?.value;
  const expected = process.env.ADMIN_PASSWORD;
  if (!cookie || !expected) return false;
  return safeEq(cookie, expected);
}

export default async function AdminPage() {
  if (!(await isAuthed())) {
    return <AdminLoginForm />;
  }

  await ensureSchema();
  const db = getDb();
  const [orders, wholesale, contacts, stockCounts] = await Promise.all([
    db.execute(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`),
    db.execute(`SELECT * FROM wholesale_inquiries ORDER BY created_at DESC LIMIT 50`),
    db.execute(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50`),
    getStockCounts(),
  ]);
  const stock = products.map((p) => ({
    handle: p.handle,
    name: `${p.name.split(" — ")[0]} (${p.size})`,
    count: stockCounts[p.handle] ?? null,
  }));

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-cocoa">Admin</h1>
        <Link href="/admin/system" className="text-sm font-semibold text-guava hover:underline">
          System Health &rarr;
        </Link>
      </div>

      <h2 className="mt-12 mb-4 font-display text-2xl text-cocoa">Product Catalog</h2>
      <CatalogSync stock={stock} />

      <h2 className="mt-12 mb-4 font-display text-2xl text-cocoa">
        Orders ({orders.rows.length})
      </h2>
      <OrdersList orders={orders.rows as never} />

      <h2 className="mt-12 mb-4 font-display text-2xl text-cocoa">
        Wholesale Inquiries ({wholesale.rows.length})
      </h2>
      <div className="divide-y divide-cocoa/10 border-t border-cocoa/10">
        {wholesale.rows.map((w) => (
          <div key={w.id as string} className="py-4 text-sm">
            <p className="font-semibold text-cocoa">{w.business_name as string} · {w.email as string}</p>
            <p className="text-cocoa/60">{w.business_type as string}</p>
            <p className="text-cocoa/50">{w.message as string}</p>
          </div>
        ))}
        {wholesale.rows.length === 0 && <p className="py-4 text-sm text-cocoa/40">None yet.</p>}
      </div>

      <h2 className="mt-12 mb-4 font-display text-2xl text-cocoa">
        Contact Messages ({contacts.rows.length})
      </h2>
      <div className="divide-y divide-cocoa/10 border-t border-cocoa/10">
        {contacts.rows.map((c) => (
          <div key={c.id as string} className="py-4 text-sm">
            <p className="font-semibold text-cocoa">[{c.reason as string}] {c.name as string} · {c.email as string}</p>
            <p className="text-cocoa/50">{c.message as string}</p>
          </div>
        ))}
        {contacts.rows.length === 0 && <p className="py-4 text-sm text-cocoa/40">None yet.</p>}
      </div>
    </section>
  );
}
