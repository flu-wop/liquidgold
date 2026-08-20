import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { put } from "@vercel/blob";
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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const allowed = await rateLimit(`upload-image:${clientIp(req)}`, 20, 300);
  if (!allowed) return NextResponse.json({ error: "Too many uploads — wait a bit" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const key = form?.get("key");

  if (!(file instanceof File) || typeof key !== "string" || !(key in CONTENT_FIELDS)) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (CONTENT_FIELDS[key as ContentKey].type !== "image") {
    return NextResponse.json({ error: "That field isn't an image field" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, or GIF images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
  }

  try {
    const blob = await put(`content/${key}-${Date.now()}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    await setContentValue(key as ContentKey, blob.url);
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
