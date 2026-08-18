"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function WholesaleForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/wholesale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: form.get("businessName"),
        email: form.get("email"),
        businessType: form.get("businessType"),
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
      <div className="mt-16 rounded-3xl bg-lagoon/10 p-8 text-center">
        <p className="font-display text-2xl text-cocoa">Application received</p>
        <p className="mt-2 text-sm text-cocoa/60">We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 rounded-3xl bg-lagoon/10 p-8">
      <h2 className="font-display text-2xl text-cocoa">Apply for Wholesale</h2>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="businessName" required maxLength={150} placeholder="Business name" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
        <input name="email" type="email" required maxLength={200} placeholder="Email" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
        <input name="businessType" maxLength={100} placeholder="Business type (salon, spa, boutique...)" className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm md:col-span-2" />
        <textarea name="message" maxLength={2000} placeholder="Tell us about your business" rows={4} className="rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm md:col-span-2" />
        {status === "error" && <p className="text-sm text-hibiscus md:col-span-2">{errorMsg}</p>}
        <Button type="submit" className="w-fit md:col-span-2">
          {status === "sending" ? "Sending…" : "Submit Application"}
        </Button>
      </form>
    </div>
  );
}
