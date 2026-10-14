"use client"
import { usePathname } from "next/navigation"

// Public nav and footer never show on /admin routes.
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null
  return <>{children}</>
}
