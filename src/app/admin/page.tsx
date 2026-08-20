import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import Link from "next/link";
import { getDb, ensureSchema } from "@/lib/db";
import { getStockCounts } from "@/lib/square-catalog";
import { products } from "@/lib/products";
import AdminLoginForm from "./AdminLoginForm";
import CatalogSync from "./CatalogSync";
import OrdersList from "./OrdersList";
import Accordion from "./Accordion";

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
      <h1 className="font-display text-4xl text-cocoa">Admin</h1>

      {/* Prominent nav buttons instead of small corner links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/content"
          className="rounded-2xl bg-guava px-6 py-6 text-center font-display text-xl text-cream transition-colors hover:bg-hibiscus"
        >
          Edit Site Content
          <span className="mt-1 block font-body text-sm font-normal text-cream/80">
            Wording &amp; photos
          </span>
        </Link>
        <Link
          href="/admin/system"
          className="rounded-2xl bg-cocoa px-6 py-6 text-center font-display text-xl text-cream transition-colors hover:bg-lagoon-deep"
        >
          System Health
          <span className="mt-1 block font-body text-sm font-normal text-cream/70">
            Is everything connected?
          </span>
        </Link>
      </div>

      {/* Everything below collapses so a busy admin page stays scannable
          as order volume grows — Orders opens by default since it's what
          gets checked most. */}
      <div className="mt-10">
        <Accordion title="Product Catalog">
          <CatalogSync stock={stock} />
        </Accordion>

        <Accordion title="Orders" count={orders.rows.length} defaultOpen>
          <OrdersList orders={orders.rows as never} />
        </Accordion>

        <Accordion title="Wholesale Inquiries" count={wholesale.rows.length}>
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
        </Accordion>

        <Accordion title="Contact Messages" count={contacts.rows.length}>
          <div className="divide-y divide-cocoa/10 border-t border-cocoa/10">
            {contacts.rows.map((c) => (
              <div key={c.id as string} className="py-4 text-sm">
                <p className="font-semibold text-cocoa">[{c.reason as string}] {c.name as string} · {c.email as string}</p>
                <p className="text-cocoa/50">{c.message as string}</p>
              </div>
            ))}
            {contacts.rows.length === 0 && <p className="py-4 text-sm text-cocoa/40">None yet.</p>}
          </div>
        </Accordion>
      </div>
    </section>
  );
}
