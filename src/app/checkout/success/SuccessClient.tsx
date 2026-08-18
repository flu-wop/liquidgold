"use client";

import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function SuccessClient() {
  const params = useSearchParams();
  const order = params.get("order") ?? "LG-0000";

  return (
    <section className="mx-auto max-w-lg px-6 py-32 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-lagoon">
        Order Confirmed
      </p>
      <h1 className="mt-4 font-display text-5xl italic text-cocoa">
        You&apos;re all set.
      </h1>
      <p className="mt-4 text-cocoa/70">
        Order <span className="font-semibold text-cocoa">{order}</span> is on its
        way to island status. A confirmation email is headed your way.
      </p>
      <div className="mt-10">
        <Button href="/shop">Keep Shopping</Button>
      </div>
    </section>
  );
}
