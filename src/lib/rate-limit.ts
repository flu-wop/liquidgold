import { getDb, ensureSchema } from "./db";

// Fixed window. key = `${route}:${ip}`. Returns true if allowed.
// Fails OPEN on DB errors — a Turso hiccup should never be the reason a
// real customer can't check out. The error is logged so it's visible,
// but rate limiting degrading gracefully beats blocking all traffic.
export async function rateLimit(key: string, limit: number, windowSecs: number): Promise<boolean> {
  try {
    await ensureSchema();
    const db = getDb();
    const windowStart = Math.floor(Date.now() / 1000 / windowSecs) * windowSecs;
    const r = await db.execute({
      sql: `INSERT INTO rate_limits (k, w, c) VALUES (?, ?, 1)
            ON CONFLICT(k, w) DO UPDATE SET c = c + 1 RETURNING c`,
      args: [key, windowStart],
    });
    return Number(r.rows[0].c) <= limit;
  } catch (e) {
    console.error("rate limit check failed, failing open", e);
    return true;
  }
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}
