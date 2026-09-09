import { randomUUID } from "crypto";
import { getDb, ensureSchema } from "./db";
import type { Product } from "./products";

export type CustomProductInput = {
  scentName: string; // display/grouping name, e.g. "Cocoa Cashmere" or a brand-new line like "Gift Box"
  type: string;
  size: string;
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  howToUse: string;
  featured: boolean;
};

function slugifyName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function rowToProduct(row: Record<string, unknown>): Product {
  let ingredients: string[] = [];
  try {
    ingredients = JSON.parse(row.ingredients_json as string);
  } catch {
    ingredients = [];
  }
  return {
    handle: row.handle as string,
    name: row.name as string,
    scent: row.scent_slug as string,
    type: row.type as string,
    size: row.size as string,
    price: row.price as number,
    image: row.image as string,
    description: row.description as string,
    ingredients,
    howToUse: row.how_to_use as string,
    featured: !!row.featured,
    inStock: true, // real stock lives in Square once synced; see catalog.ts
  };
}

export async function getCustomProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  try {
    await ensureSchema();
    const db = getDb();
    const r = await db.execute(
      opts.includeInactive
        ? `SELECT * FROM custom_products ORDER BY created_at DESC`
        : `SELECT * FROM custom_products WHERE active = 1 ORDER BY created_at DESC`
    );
    return r.rows.map((row) => rowToProduct(row as Record<string, unknown>));
  } catch (e) {
    console.error("custom product fetch failed, proceeding with none", e);
    return []; // fail open — a Turso hiccup should never take down the shop page
  }
}

// Returns raw admin metadata (active flag, scent_name) alongside the mapped
// product — the admin list needs both, storefront code only needs the latter.
export async function getCustomProductsAdmin(): Promise<(Product & { scentName: string; active: boolean })[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute(`SELECT * FROM custom_products ORDER BY created_at DESC`);
  return r.rows.map((row) => ({
    ...rowToProduct(row as Record<string, unknown>),
    scentName: row.scent_name as string,
    active: !!row.active,
  }));
}

export async function createCustomProduct(input: CustomProductInput): Promise<Product> {
  await ensureSchema();
  const db = getDb();
  const scentSlug = slugifyName(input.scentName) || randomUUID().slice(0, 8);
  const typeSlug = slugifyName(input.type) || "item";
  const sizeSlug = slugifyName(input.size);
  let handle = [scentSlug, typeSlug, sizeSlug].filter(Boolean).join("-");

  // Guard against colliding with an existing static or custom handle.
  const existing = await db.execute({
    sql: `SELECT handle FROM custom_products WHERE handle = ?`,
    args: [handle],
  });
  if (existing.rows.length > 0) handle = `${handle}-${randomUUID().slice(0, 4)}`;

  const name = `${input.scentName} ${input.type} — ${input.size}`;
  await db.execute({
    sql: `INSERT INTO custom_products
      (handle, name, scent_slug, scent_name, type, size, price, image, description, ingredients_json, how_to_use, featured, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    args: [
      handle, name, scentSlug, input.scentName, input.type, input.size, input.price,
      input.image, input.description, JSON.stringify(input.ingredients), input.howToUse,
      input.featured ? 1 : 0,
    ],
  });

  return {
    handle, name, scent: scentSlug, type: input.type, size: input.size, price: input.price,
    image: input.image, description: input.description, ingredients: input.ingredients,
    howToUse: input.howToUse, featured: input.featured, inStock: true,
  };
}

export async function updateCustomProduct(handle: string, input: Partial<CustomProductInput>): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const existing = await db.execute({ sql: `SELECT * FROM custom_products WHERE handle = ?`, args: [handle] });
  if (existing.rows.length === 0) throw new Error(`No custom product with handle "${handle}"`);

  const current = existing.rows[0] as Record<string, unknown>;
  const merged = {
    scent_name: (input.scentName ?? current.scent_name) as string,
    type: (input.type ?? current.type) as string,
    size: (input.size ?? current.size) as string,
    price: (input.price ?? current.price) as number,
    image: (input.image ?? current.image) as string,
    description: (input.description ?? current.description) as string,
    ingredients_json: (input.ingredients ? JSON.stringify(input.ingredients) : current.ingredients_json) as string,
    how_to_use: (input.howToUse ?? current.how_to_use) as string,
    featured: (input.featured !== undefined ? (input.featured ? 1 : 0) : current.featured) as number,
  };
  const name = `${merged.scent_name} ${merged.type} — ${merged.size}`;

  await db.execute({
    sql: `UPDATE custom_products SET
      name = ?, scent_name = ?, type = ?, size = ?, price = ?, image = ?,
      description = ?, ingredients_json = ?, how_to_use = ?, featured = ?, updated_at = unixepoch()
      WHERE handle = ?`,
    args: [
      name, merged.scent_name, merged.type, merged.size, merged.price, merged.image,
      merged.description, merged.ingredients_json, merged.how_to_use, merged.featured, handle,
    ],
  });
}

export async function setCustomProductActive(handle: string, active: boolean): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `UPDATE custom_products SET active = ?, updated_at = unixepoch() WHERE handle = ?`,
    args: [active ? 1 : 0, handle],
  });
}

// Hard delete — only offered for products that have never been ordered
// (checked by the caller/route), so this never orphans order history.
export async function deleteCustomProduct(handle: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: `DELETE FROM custom_products WHERE handle = ?`, args: [handle] });
}
