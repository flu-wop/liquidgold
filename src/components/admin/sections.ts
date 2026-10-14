// Plain module (no "use client") so server-rendered pages can read the list.
import { Home, ShoppingBag, FileEdit, Filter, BarChart3, Activity } from "lucide-react"

export const ADMIN_SECTIONS = [
  { href: "/admin", icon: Home, label: "Home" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/content", icon: FileEdit, label: "Content" },
  { href: "/admin/funnel", icon: Filter, label: "Funnel" },
  { href: "/admin/insights", icon: BarChart3, label: "Insights" },
  { href: "/admin/system", icon: Activity, label: "System" },
]
