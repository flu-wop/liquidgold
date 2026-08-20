import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import AdminLoginForm from "../AdminLoginForm";
import ContentEditor from "./ContentEditor";
import { CONTENT_FIELDS, getContentMap, content, type ContentKey } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export default async function ContentPage() {
  if (!(await isAuthed())) return <AdminLoginForm />;

  const map = await getContentMap();
  const values = {} as Record<ContentKey, string>;
  for (const key of Object.keys(CONTENT_FIELDS) as ContentKey[]) {
    values[key] = content(map, key);
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa">Edit Site Content</h1>
      <p className="mt-2 text-sm text-cocoa/60">
        Change wording and photos here — nothing here can break the site's layout or checkout.
      </p>
      <ContentEditor values={values} />
    </section>
  );
}
