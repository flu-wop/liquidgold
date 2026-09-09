import { getDb, ensureSchema } from "./db";

// Reuses the generic `content` key/value table rather than a new table —
// this is the same "hide, don't delete" pattern as inStock/Square sync:
// nothing about the product data is destroyed, it just stops rendering
// on customer-facing pages. Key format: scent.<slug>.hidden = "1" | "0".
// Missing key = visible (default), matching the fail-open philosophy
// used everywhere else in this file.

function hiddenKey(slug: string) {
  return `scent.${slug}.hidden`;
}

export async function getHiddenScentSlugs(): Promise<Set<string>> {
  try {
    await ensureSchema();
    const db = getDb();
    const r = await db.execute(
      `SELECT key FROM content WHERE key LIKE 'scent.%.hidden' AND value = '1'`
    );
    return new Set(
      r.rows.map((row) => (row.key as string).replace(/^scent\./, "").replace(/\.hidden$/, ""))
    );
  } catch (e) {
    console.error("hidden scent fetch failed, defaulting to none hidden", e);
    return new Set(); // fail open — never accidentally hide the whole shop
  }
}

export async function setScentHidden(slug: string, hidden: boolean): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO content (key, value, updated_at) VALUES (?, ?, unixepoch())
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    args: [hiddenKey(slug), hidden ? "1" : "0"],
  });
}
