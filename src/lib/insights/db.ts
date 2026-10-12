// lib/insights/db.ts
// Insights' handle on this site's existing database. Returns null when
// TURSO_DATABASE_URL isn't set, so pages and the beacon degrade instead of throwing.
import type { Client } from "@libsql/client"
import { getDb } from "@/lib/db"

export function getDB(): Client | null {
  if (!process.env.TURSO_DATABASE_URL) return null
  return getDb()
}
