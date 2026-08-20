import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { syncCatalog } from "@/lib/square-catalog";

export const runtime = "nodejs";

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

export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const result = await syncCatalog();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("catalog sync failed", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Sync failed: ${message}` }, { status: 500 });
  }
}
