import { isAuthed } from "@/lib/admin-auth";
import { AdminPage, AdminPageHeader, AdminLogin } from "@/components/admin/page-frame";
import ContentEditor from "./ContentEditor";
import { CONTENT_FIELDS, getContentMap, content, type ContentKey } from "@/lib/content";

export const runtime = "nodejs";
export const metadata = { title: "Content · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  if (!(await isAuthed())) return <AdminLogin />;

  const map = await getContentMap();
  const values = {} as Record<ContentKey, string>;
  for (const key of Object.keys(CONTENT_FIELDS) as ContentKey[]) {
    values[key] = content(map, key);
  }

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Site" title="Edit Site Content" description="Change wording and photos here — nothing here can break the site's layout or checkout." />
      <ContentEditor values={values} />
    </AdminPage>
  );
}
