import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import Link from "next/link";
import AdminLoginForm from "../AdminLoginForm";
import SystemDashboard from "./SystemDashboard";

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

export default async function SystemPage() {
  if (!(await isAuthed())) return <AdminLoginForm />;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/admin" className="text-sm font-semibold text-guava hover:underline">
        &larr; Back to Admin
      </Link>
      <h1 className="mt-4 font-display text-4xl text-cocoa">System Health</h1>
      <div className="mt-8">
        <SystemDashboard />
      </div>
    </section>
  );
}
