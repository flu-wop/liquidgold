import { isAuthed } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) return <>{children}</>;
  return <AdminShell>{children}</AdminShell>;
}
