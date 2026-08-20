import { getDb, ensureSchema } from "./db";
import { getSquare } from "./square";
import { Resend } from "resend";
import { getAllCatalogVariationIds } from "./square-catalog";
import { products } from "./products";

export type CheckResult = { status: "ok" | "warn" | "error"; detail: string };

// ---- 1. Env Var Status ----
const REQUIRED_ENV_VARS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_LOCATION_ID",
  "SQUARE_ENVIRONMENT",
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  "NEXT_PUBLIC_SQUARE_LOCATION_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_TO_EMAIL",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_SITE_URL",
];

export function checkEnvVars(): Record<string, CheckResult> {
  const results: Record<string, CheckResult> = {};
  for (const key of REQUIRED_ENV_VARS) {
    const present = !!process.env[key];
    results[key] = { status: present ? "ok" : "error", detail: present ? "set" : "MISSING" };
  }
  return results;
}

// ---- 2. Webhook / Connection Health ----
export async function checkSquare(): Promise<CheckResult> {
  try {
    const square = getSquare();
    const result = await square.locations.list();
    const locations = result.locations ?? [];
    const match = locations.find((l) => l.id === process.env.SQUARE_LOCATION_ID);
    if (!match) return { status: "error", detail: `SQUARE_LOCATION_ID not found among ${locations.length} location(s) on this account` };
    return { status: "ok", detail: `Connected — ${match.name ?? match.id}` };
  } catch (err) {
    return { status: "error", detail: `Square API error: ${(err as Error).message}` };
  }
}

export async function checkSquareWebhook(): Promise<CheckResult> {
  try {
    const square = getSquare();
    const result = await square.webhooks.subscriptions.list();
    const subs = [];
    for await (const sub of result) subs.push(sub);
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/^https?:\/\//, "");
    const match = subs.find((s) => s.notificationUrl?.includes(site));
    if (!match) return { status: "warn", detail: "No webhook subscription found for this site's URL" };
    if (!match.enabled) return { status: "error", detail: "Webhook subscription exists but is disabled" };
    return { status: "ok", detail: `Enabled — ${(match.eventTypes ?? []).join(", ")}` };
  } catch (err) {
    return { status: "error", detail: `Square API error: ${(err as Error).message}` };
  }
}

export async function checkLastOrder(): Promise<CheckResult> {
  try {
    await ensureSchema();
    const db = getDb();
    const result = await db.execute("SELECT created_at FROM orders ORDER BY created_at DESC LIMIT 1");
    if (result.rows.length === 0) return { status: "warn", detail: "No orders yet" };
    const lastUnix = Number(result.rows[0].created_at);
    const daysAgo = (Date.now() / 1000 - lastUnix) / 86400;
    const last = new Date(lastUnix * 1000);
    if (daysAgo > 30) return { status: "warn", detail: `Last order ${Math.round(daysAgo)} days ago` };
    return { status: "ok", detail: `Last order ${last.toLocaleString()}` };
  } catch (err) {
    return { status: "error", detail: `DB read failed: ${(err as Error).message}` };
  }
}

export async function checkResend(): Promise<CheckResult> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const domains = await resend.domains.list();
    const fromDomain = (process.env.RESEND_FROM_EMAIL || "").split("@")[1];
    if (!fromDomain) return { status: "error", detail: "RESEND_FROM_EMAIL not set" };
    const match = domains.data?.data?.find((d) => d.name === fromDomain);
    if (!match) return { status: "error", detail: `Domain ${fromDomain} not found in Resend account` };
    if (match.status !== "verified") return { status: "error", detail: `Domain status: ${match.status}` };
    return { status: "ok", detail: `${fromDomain} verified` };
  } catch (err) {
    return { status: "error", detail: `Resend API error: ${(err as Error).message}` };
  }
}

export async function checkTurso(): Promise<CheckResult> {
  try {
    const db = getDb();
    await db.execute("SELECT 1");
    return { status: "ok", detail: "Connected" };
  } catch (err) {
    return { status: "error", detail: `Turso connection failed: ${(err as Error).message}` };
  }
}

// ---- 3. API Usage (self-tracked) ----
export async function checkApiUsage(): Promise<CheckResult> {
  try {
    await ensureSchema();
    const db = getDb();
    const result = await db.execute(
      "SELECT provider, COUNT(*) as count FROM api_calls WHERE created_at > unixepoch() - 30*86400 GROUP BY provider"
    );
    const summary = result.rows.map((r) => `${r.provider}: ${r.count}`).join(", ") || "No calls logged in the last 30 days";
    return { status: "ok", detail: summary };
  } catch {
    return { status: "warn", detail: "api_calls table not set up yet — usage tracking inactive" };
  }
}

// ---- 4. Product Sync ----
export async function checkProductSync(): Promise<CheckResult> {
  try {
    const map = await getAllCatalogVariationIds();
    const synced = products.filter((p) => map[p.handle]).length;
    if (synced === 0) return { status: "warn", detail: "0 products synced yet — run Sync in the Product Catalog panel" };
    if (synced < products.length) return { status: "warn", detail: `${synced} of ${products.length} SKUs synced` };
    return { status: "ok", detail: `All ${products.length} SKUs synced` };
  } catch (err) {
    return { status: "error", detail: `Sync check failed: ${(err as Error).message}` };
  }
}
