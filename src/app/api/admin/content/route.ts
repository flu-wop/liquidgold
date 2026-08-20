import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { CONTENT_FIELDS, setContentValue, type ContentKey } from "@/lib/content";

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
  const allowed = await rateLimit(`content:${clientIp(req)}`, 60, 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { key, value } = await req.json().catch(() => ({}));
  if (!key || typeof key !== "string" || !(key in CONTENT_FIELDS)) {
    return NextResponse.json({ error: "Unknown field" }, { status: 400 });
  }
  if (typeof value !== "string" || value.length > 20000) {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  try {
    await setContentValue(key as ContentKey, value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
