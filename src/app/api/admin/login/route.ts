import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

function safeEq(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export async function POST(req: Request) {
  const allowed = await rateLimit(`admin-login:${clientIp(req)}`, 5, 900); // 5 per 15 min
  if (!allowed) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string" || !safeEq(password, expected)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("lg_admin", expected, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}
