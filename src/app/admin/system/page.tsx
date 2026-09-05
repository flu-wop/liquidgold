import { isAuthed } from "@/lib/admin-auth";
import AdminLoginForm from "../AdminLoginForm";
import SystemDashboard from "./SystemDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SystemPage() {
  if (!(await isAuthed())) return <AdminLoginForm />;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-cocoa">System Health</h1>
      <div className="mt-8">
        <SystemDashboard />
      </div>
    </section>
  );
}
