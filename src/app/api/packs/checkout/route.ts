// ============================================================
// ArcadeKit — Pack Checkout API
// POST /api/packs/checkout — { item: "<pack id>" | "bundle" } → { url }
// Starts a Stripe checkout for a signed-in player. The price is
// worked out here from what they already own, never sent by the page.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPackCheckout, PurchaseError } from "@/lib/packPurchases";
import { stripeConfigured } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Buying packs isn't available yet." }, { status: 503 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Sign in to buy packs." }, { status: 401 });

  let item: unknown;
  try {
    item = (await request.json()).item;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof item !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const url = await createPackCheckout({ id: session.user.id, email: session.user.email }, item);
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PurchaseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[packs/checkout]", error);
    return NextResponse.json({ error: "Couldn't start checkout. Try again in a moment." }, { status: 500 });
  }
}
