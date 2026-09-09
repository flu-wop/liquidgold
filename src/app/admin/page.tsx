import { getDb, ensureSchema } from "@/lib/db";
import { getStockCounts } from "@/lib/square-catalog";
import { products } from "@/lib/products";
import { scents } from "@/lib/scents";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import { getCustomProductsAdmin } from "@/lib/custom-products";
import { isAuthed } from "@/lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";
import CatalogSync from "./CatalogSync";
import ScentVisibility from "./ScentVisibility";
import CustomProducts from "./CustomProducts";
import OrdersList from "./OrdersList";
import Accordion from "./Accordion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthed())) {
    return <AdminLoginForm />;
  }

  await ensureSchema();
  const db = getDb();
  const [orders, wholesale, contacts, stockCounts, hiddenSlugs, customProducts] = await Promise.all([
    db.execute(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`),
    db.execute(`SELECT * FROM wholesale_inquiries ORDER BY created_at DESC LIMIT 50`),
    db.execute(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50`),
    getStockCounts(),
    getHiddenScentSlugs(),
    getCustomProductsAdmin(),
  ]);
  // Stock list covers both the static catalog and any admin-added products
  // so new SKUs show up for inventory-setting once synced, same as the
  // original 15.
  const stock = [...products, ...customProducts].map((p) => ({
    handle: p.handle,
    name: `${p.name.split(" — ")[0]} (${p.size})`,
    count: stockCounts[p.handle] ?? null,
  }));
  const scentRows = scents.map((s) => ({ slug: s.slug, name: s.name, hidden: hiddenSlugs.has(s.slug) }));

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa">Admin</h1>

      <div className="mt-10">
        <Accordion title="Product Catalog">
          <ScentVisibility scents={scentRows} />
          <CustomProducts products={customProducts} />
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
