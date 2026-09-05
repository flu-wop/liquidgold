"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, FileEdit, BarChart3, Activity } from "lucide-react"
import { LogoutButton } from "./LogoutButton"

const SECTIONS = [
  { href: "/admin",         icon: ShoppingBag, label: "Orders" },
  { href: "/admin/content", icon: FileEdit,    label: "Content" },
  { href: "/admin/funnel",  icon: BarChart3,   label: "Funnel" },
  { href: "/admin/system",  icon: Activity,    label: "System" },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-20 border-b border-cocoa/10 bg-cocoa/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {SECTIONS.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs tracking-wide whitespace-nowrap transition-colors ${
                    active ? "bg-guava text-cream" : "text-cream/60 hover:text-cream"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  )
}
