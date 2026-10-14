// Shared frame for every admin page: width, header and panels.
// Not a client module, so server pages can use it freely.
import AdminLoginForm from "@/app/admin/AdminLoginForm"
export { adminBtn } from "./admin-btn"

export function AdminPage({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">{children}</main>
}

export function AdminPageHeader({
  eyebrow, title, description, actions,
}: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-6 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="text-[10px] tracking-[0.26em] uppercase text-lagoon-deep mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-3xl sm:text-4xl text-cocoa leading-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-cocoa/65 max-w-2xl">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-cocoa/15 ${className}`}>{children}</div>
}

// The site's own login form, in the standard frame. Never a second login.
export function AdminLogin() {
  return <AdminLoginForm />
}
