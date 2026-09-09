import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { createCustomProduct, updateCustomProduct, setCustomProductActive } from "@/lib/custom-products";

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

function validateProductFields(body: Record<string, unknown>): string | null {
  const { scentName, type, size, price, image, description, ingredients, howToUse } = body;
  if (typeof scentName !== "string" || !scentName.trim() || scentName.length > 80) return "Invalid product/scent name";
  if (typeof type !== "string" || !type.trim() || type.length > 40) return "Invalid type";
  if (typeof size !== "string" || !size.trim() || size.length > 40) return "Invalid size";
  if (typeof price !== "number" || !(price > 0) || price > 10000) return "Invalid price";
  if (typeof image !== "string" || !image.startsWith("http")) return "Invalid image — upload one first";
  if (typeof description !== "string" || description.length > 2000) return "Invalid description";
  if (!Array.isArray(ingredients) || ingredients.some((i) => typeof i !== "string")) return "Invalid ingredients";
  if (typeof howToUse !== "string" || howToUse.length > 1000) return "Invalid how-to-use text";
  return null;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const allowed = await rateLimit(`products-create:${clientIp(req)}`, 20, 300);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const error = validateProductFields(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const product = await createCustomProduct({
      scentName: body.scentName,
      type: body.type,
      size: body.size,
      price: body.price,
      image: body.image,
      description: body.description,
      ingredients: body.ingredients,
      howToUse: body.howToUse,
      featured: !!body.featured,
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const allowed = await rateLimit(`products-update:${clientIp(req)}`, 30, 300);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { handle } = body;
  if (typeof handle !== "string" || !handle) {
    return NextResponse.json({ error: "Missing handle" }, { status: 400 });
  }

  // "active" toggle only — skip full field validation for that path.
  if (typeof body.active === "boolean" && Object.keys(body).length === 2) {
    try {
      await setCustomProductActive(handle, body.active);
      return NextResponse.json({ ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Full edit — validate whichever fields were sent, same rules as create.
  const merged = { scentName: "x", type: "x", size: "x", price: 1, image: "http://x", description: "", ingredients: [], howToUse: "", ...body };
  const error = validateProductFields(merged);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    await updateCustomProduct(handle, {
      scentName: body.scentName,
      type: body.type,
      size: body.size,
      price: body.price,
      image: body.image,
      description: body.description,
      ingredients: body.ingredients,
      howToUse: body.howToUse,
      featured: body.featured,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
