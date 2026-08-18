import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb, ensureSchema } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendWholesaleNotification } from "@/lib/resend";

export const runtime = "nodejs";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;
}

export async function POST(req: Request) {
  const allowed = await rateLimit(`wholesale:${clientIp(req)}`, 5, 600); // 5 per 10 min
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: { businessName?: string; email?: string; businessType?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { businessName, email, businessType, message } = body;
  if (!businessName || businessName.length > 150) {
    return NextResponse.json({ error: "Invalid business name" }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (businessType && businessType.length > 100) {
    return NextResponse.json({ error: "Business type too long" }, { status: 400 });
  }
  if (message && message.length > 2000) {
    return NextResponse.json({ error: "Message must be under 2000 characters" }, { status: 400 });
  }

  try {
    await ensureSchema();
    await getDb().execute({
      sql: `INSERT INTO wholesale_inquiries (id, business_name, email, business_type, message) VALUES (?, ?, ?, ?, ?)`,
      args: [randomUUID(), businessName, email, businessType ?? "", message ?? ""],
    });
  } catch (e) {
    console.error("wholesale DB write failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    await sendWholesaleNotification({
      businessName, email, businessType: businessType ?? "", message: message ?? "",
    });
  } catch (e) {
    console.error("wholesale notification email failed", e);
  }

  return NextResponse.json({ ok: true });
}
