"use client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-cream/60 hover:text-cream text-xs tracking-wide transition-colors shrink-0"
    >
      Log out
    </button>
  )
}
