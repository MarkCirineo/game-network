// ============================================================
// ArcadeKit — Stripe Webhook
// POST /api/stripe/webhook — events Stripe sends about payments.
// Signed with STRIPE_WEBHOOK_SECRET; anything unsigned is refused.
//   checkout.session.completed / async_payment_succeeded → add the packs
//   charge.refunded (full refund)                        → take them back
//   charge.dispute.closed (lost)                         → take them back
// In the Stripe Dashboard, point a webhook endpoint at this URL with
// those four events.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { checkoutForPayment, fulfillCheckout, revokeCheckout } from "@/lib/packPurchases";
import { stripe } from "@/lib/stripe";

function paymentIntentId(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function revokePayment(value: string | Stripe.PaymentIntent | null): Promise<void> {
  const id = paymentIntentId(value);
  const sessionId = id ? await checkoutForPayment(id) : null;
  if (sessionId) await revokeCheckout(sessionId);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckout(event.data.object.id);
        break;
      case "charge.refunded":
        if (event.data.object.refunded) await revokePayment(event.data.object.payment_intent);
        break;
      case "charge.dispute.closed":
        if (event.data.object.status === "lost") await revokePayment(event.data.object.payment_intent);
        break;
    }
  } catch (error) {
    // A 500 makes Stripe retry the event later
    console.error(`[stripe/webhook] ${event.type}`, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
