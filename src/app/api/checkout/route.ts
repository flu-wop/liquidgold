import { NextResponse } from "next/server";

// TODO(commerce): replace with real Stripe Checkout session creation.
// Will also need to check/decrement inventory in a way that stays in sync
// with Square POS sales happening in person — that sync is its own
// project, do not build ad hoc here.
//
// Reference pattern (once real): see /lib/booking-system skill —
// validate → save order → create Stripe Checkout session → redirect.

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Checkout not yet connected. Stripe + Square integration pending — see architecture plan.",
    },
    { status: 501 }
  );
}
