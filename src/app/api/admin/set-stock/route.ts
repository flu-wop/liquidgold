import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { setStockCount } from "@/lib/square-catalog";

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

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const allowed = await rateLimit(`set-stock:${clientIp(req)}`, 30, 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { handle, quantity } = await req.json().catch(() => ({}));
  if (!handle || typeof quantity !== "number" || quantity < 0 || quantity > 100000) {
    return NextResponse.json({ error: "Invalid handle or quantity" }, { status: 400 });
  }
  try {
    await setStockCount(handle, Math.floor(quantity));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
