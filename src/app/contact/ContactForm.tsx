"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const reasons = [
  "Order Help",
  "General Questions",
  "Wholesale",
  "Collaborations/Partnerships",
  "Events",
  "Press/Content",
];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: form.get("reason"),
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });
    if (res.ok) {
      setStatus("sent");
      e.currentTarget.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong — try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-10 rounded-3xl bg-lagoon/10 p-8 text-center">
        <p className="font-display text-2xl text-cocoa">Message sent</p>
        <p className="mt-2 text-sm text-cocoa/60">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4">
      <select name="reason" required className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm">
        {reasons.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <input name="name" required maxLength={100} placeholder="Name" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
      <input name="email" type="email" required maxLength={200} placeholder="Email" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
      <textarea name="message" required maxLength={2000} placeholder="Message" rows={5} className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
      {status === "error" && <p className="text-sm text-hibiscus">{errorMsg}</p>}
      <Button type="submit">{status === "sending" ? "Sending…" : "Send Message"}</Button>
    </form>
  );
}
