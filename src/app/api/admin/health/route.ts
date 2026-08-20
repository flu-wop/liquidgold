import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import {
  checkEnvVars, checkSquare, checkSquareWebhook, checkLastOrder,
  checkResend, checkTurso, checkApiUsage, checkProductSync,
} from "@/lib/health-checks";

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

export async function GET(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const allowed = await rateLimit(`health:${clientIp(req)}`, 20, 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const [envVars, square, squareWebhook, lastOrder, resend, turso, apiUsage, productSync] = await Promise.all([
    Promise.resolve(checkEnvVars()),
    checkSquare(),
    checkSquareWebhook(),
    checkLastOrder(),
    checkResend(),
    checkTurso(),
    checkApiUsage(),
    checkProductSync(),
  ]);

  return NextResponse.json({
    envVars,
    webhookHealth: { square, squareWebhook, lastOrder, resend, turso },
    apiUsage,
    productSync,
    checkedAt: new Date().toISOString(),
  });
}
