"use client";

import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function SuccessClient() {
  const params = useSearchParams();
  const order = params.get("order") ?? "LG-0000";
  const total = params.get("total");
  const subtotal = params.get("subtotal");
  const discount = params.get("discount");
  const tax = params.get("tax");
  const shipping = params.get("shipping");
  const hasBreakdown = total && subtotal;

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

      {hasBreakdown && (
        <div className="mx-auto mt-8 max-w-xs space-y-2 rounded-2xl bg-lagoon/10 p-6 text-left text-sm">
          <div className="flex justify-between text-cocoa/70">
            <span>Subtotal</span>
            <span>${Number(subtotal).toFixed(2)}</span>
          </div>
          {discount && Number(discount) > 0 && (
            <div className="flex justify-between text-lagoon-deep">
              <span>Discount</span>
              <span>-${Number(discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-cocoa/70">
            <span>Tax</span>
            <span>${Number(tax ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-cocoa/70">
            <span>Shipping</span>
            <span>{Number(shipping) === 0 ? "Free" : `$${Number(shipping).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between border-t border-cocoa/20 pt-2 font-semibold text-cocoa">
            <span>Total Charged</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mt-10">
        <Button href="/shop">Keep Shopping</Button>
      </div>
    </section>
  );
}
