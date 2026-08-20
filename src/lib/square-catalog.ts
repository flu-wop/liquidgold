import { randomUUID } from "crypto";
import { getSquare } from "./square";
import { getDb, ensureSchema } from "./db";
import { scents } from "./scents";
import { products } from "./products";

// ── Product catalog sync with Square ──
// Mirrors our 15 SKUs (5 scents x 3 variants) into Square's Catalog as real
// CatalogItem/CatalogItemVariation objects. This is what makes real
// inventory tracking possible: Square automatically moves a variation's
// stock from IN_STOCK to SOLD whenever a paid Order references its
// catalogObjectId AND that variation has trackInventory enabled — no
// manual inventory-adjustment call needed on our end for online sales,
// and the SAME tracked stock is shared with in-person Square POS sales.
//
// This does NOT set any starting stock quantities — we have no real
// on-hand counts to invent. After syncing, go to Square Dashboard → Items
// → each item → set the actual quantity on hand.

export type SyncResult = {
  itemsCreated: number;
  itemsUpdated: number;
  variationCount: number;
};

export async function syncCatalog(): Promise<SyncResult> {
  const square = getSquare();
  await ensureSchema();
  const db = getDb();

  // Existing mapping — if a scent's Square item already exists, we UPDATE
  // it (same object ID) instead of creating a duplicate on every sync.
  const existing = await db.execute(`SELECT handle, item_id, variation_id FROM square_catalog_map`);
  const existingByHandle = new Map(
    existing.rows.map((r) => [r.handle as string, { itemId: r.item_id as string, variationId: r.variation_id as string }])
  );

  const batchObjects: unknown[] = [];
  let itemsCreated = 0;
  let itemsUpdated = 0;

  for (const scent of scents) {
    const scentProducts = products.filter((p) => p.scent === scent.slug);
    if (scentProducts.length === 0) continue;

    // Use the first variant's existing item_id if any variant for this
    // scent was already synced, so re-syncing updates in place.
    const anyExisting = scentProducts.map((p) => existingByHandle.get(p.handle)).find(Boolean);
    const itemId = anyExisting?.itemId ?? `#item-${scent.slug}`;
    const isNewItem = !anyExisting;
    if (isNewItem) itemsCreated++; else itemsUpdated++;

    const variations = scentProducts.map((p) => {
      const prior = existingByHandle.get(p.handle);
      const variationId = prior?.variationId ?? `#var-${p.handle}`;
      return {
        type: "ITEM_VARIATION",
        id: variationId,
        presentAtAllLocations: true,
        itemVariationData: {
          itemId,
          name: `${p.type} \u2014 ${p.size}`,
          sku: p.handle,
          pricingType: "FIXED_PRICING",
          priceMoney: { amount: BigInt(Math.round(p.price * 100)), currency: "USD" },
          trackInventory: true,
          sellable: true,
          stockable: true,
        },
      };
    });

    batchObjects.push({
      type: "ITEM",
      id: itemId,
      presentAtAllLocations: true,
      itemData: {
        name: scent.name,
        description: scent.story,
        variations,
      },
    });
  }

  const result = await square.catalog.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [{ objects: batchObjects as never }],
  });

  // Map temporary #-prefixed client IDs back to the real Square-assigned
  // IDs Square returns, then persist that mapping.
  const idMap = result.idMappings ?? [];
  const resolve = (clientId: string) =>
    idMap.find((m) => m.clientObjectId === clientId)?.objectId ?? clientId.replace(/^#(item|var)-/, "");

  let variationCount = 0;
  for (const scent of scents) {
    const scentProducts = products.filter((p) => p.scent === scent.slug);
    if (scentProducts.length === 0) continue;
    const anyExisting = scentProducts.map((p) => existingByHandle.get(p.handle)).find(Boolean);
    const clientItemId = anyExisting?.itemId ?? `#item-${scent.slug}`;
    const realItemId = anyExisting ? clientItemId : resolve(clientItemId);

    for (const p of scentProducts) {
      const prior = existingByHandle.get(p.handle);
      const clientVarId = prior?.variationId ?? `#var-${p.handle}`;
      const realVarId = prior ? clientVarId : resolve(clientVarId);
      await db.execute({
        sql: `INSERT INTO square_catalog_map (handle, item_id, variation_id, synced_at)
              VALUES (?, ?, ?, unixepoch())
              ON CONFLICT(handle) DO UPDATE SET item_id = excluded.item_id, variation_id = excluded.variation_id, synced_at = unixepoch()`,
        args: [p.handle, realItemId, realVarId],
      });
      variationCount++;
    }
  }

  return { itemsCreated, itemsUpdated, variationCount };
}

export async function getCatalogVariationId(handle: string): Promise<string | null> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: `SELECT variation_id FROM square_catalog_map WHERE handle = ?`,
    args: [handle],
  });
  return (r.rows[0]?.variation_id as string) ?? null;
}

export async function getAllCatalogVariationIds(): Promise<Record<string, string>> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute(`SELECT handle, variation_id FROM square_catalog_map`);
  const map: Record<string, string> = {};
  for (const row of r.rows) map[row.handle as string] = row.variation_id as string;
  return map;
}

// ── Live stock counts ──
// Reads IN_STOCK quantities directly from Square for every synced
// variation. Returns null for any handle that hasn't been synced yet
// (so callers can fall back to "unknown/always available" instead of
// wrongly showing everything as sold out before the first sync runs).
export async function getStockCounts(): Promise<Record<string, number | null>> {
  const map = await getAllCatalogVariationIds();
  const variationIds = Object.values(map);
  const stock: Record<string, number | null> = {};
  for (const handle of Object.keys(map)) stock[handle] = null;
  if (variationIds.length === 0) return stock;

  const square = getSquare();
  try {
    const result = await square.inventory.batchGetCounts({
      catalogObjectIds: variationIds,
      locationIds: [process.env.SQUARE_LOCATION_ID!],
      states: ["IN_STOCK"],
    });
    const countsByVariation: Record<string, number> = {};
    for await (const count of result) {
      if (count.catalogObjectId && count.quantity) {
        countsByVariation[count.catalogObjectId] = Number(count.quantity);
      }
    }
    for (const [handle, variationId] of Object.entries(map)) {
      stock[handle] = countsByVariation[variationId] ?? 0;
    }
  } catch (e) {
    console.error("failed to fetch Square inventory counts", e);
    // Leave everything null (unknown) rather than wrongly reporting 0 stock
  }
  return stock;
}
