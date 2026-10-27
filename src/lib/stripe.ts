// ============================================================
// ArcadeKit — Stripe client (server only)
// Created on first use, so builds and pages that never touch
// payments work without STRIPE_SECRET_KEY. Payments run through
// Stripe Managed Payments: Stripe is the merchant of record and
// handles sales tax, VAT, fraud and disputes.
// ============================================================

import Stripe from "stripe";

let client: Stripe | null = null;

/** True when a secret key is configured */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key);
  return client;
}
