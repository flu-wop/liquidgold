"use client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin")
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-xs text-cream/60 hover:text-cream transition-colors shrink-0">
      Log out
    </button>
  )
}
