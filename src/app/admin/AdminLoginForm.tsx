"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-32 max-w-sm px-6">
      <h1 className="font-display text-3xl text-cocoa">Admin</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mt-6 w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm"
      />
      {error && <p className="mt-2 text-sm text-hibiscus">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-full bg-cocoa px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
      >
        {loading ? "Checking…" : "Log In"}
      </button>
    </form>
  );
}
