import { isAuthed } from "@/lib/admin-auth";
import { AdminPage, AdminPageHeader, AdminLogin } from "@/components/admin/page-frame";
import SystemDashboard from "./SystemDashboard";

export const runtime = "nodejs";
export const metadata = { title: "System · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SystemPage() {
  if (!(await isAuthed())) return <AdminLogin />;

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Health" title="System Health" description="Env vars, webhooks and integrations — is everything actually working." />
      <SystemDashboard />
    </AdminPage>
  );
}
