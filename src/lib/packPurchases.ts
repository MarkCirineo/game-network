// ============================================================
// ArcadeKit — Buying Rule Out Board Packs (server only)
// Checkout runs on Stripe's hosted page. A purchase is recorded in
// owned_pack once Stripe says it's paid: from the webhook, or from
// the packs page the buyer lands on (whichever comes first; both
// are safe to repeat). A full refund or a lost dispute takes the
// packs from that checkout back.
// ============================================================

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ownedPack, user } from "@/lib/db/schema";
import { ownedPackIds } from "@/lib/packs";
import { stripe } from "@/lib/stripe";
import { APP_URL } from "@/lib/constants";
import { BOARD_PACKS, bundlePriceCents, getPack, type BoardPack } from "../../shared/boards/packs";

/**
 * Stripe tax code for a pack (must be eligible for Managed Payments).
 * "Video Games - downloaded - non subscription - with permanent rights":
 * the closest fit for game content that's yours to keep.
 */
const PACK_TAX_CODE = "txcd_10201000";

const PACKS_PATH = "/games/rule-out/packs";

/** What a checkout can be for: one paid pack, or every paid pack the buyer is missing */
export type PackPurchaseItem = string | "bundle";

export class PurchaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface PricedPurchase {
  packs: BoardPack[];
  amountCents: number;
  name: string;
}

/** Work out what this item costs this buyer, or throw when it can't be bought */
export function pricePurchase(item: PackPurchaseItem, owned: ReadonlySet<string>): PricedPurchase {
  if (item === "bundle") {
    const amountCents = bundlePriceCents(owned);
    if (amountCents === null) throw new PurchaseError("There's no bundle left to buy.", 409);
    const packs = BOARD_PACKS.filter((p) => p.access === "paid" && !owned.has(p.id));
    return { packs, amountCents, name: `Rule Out board packs: ${packs.map((p) => p.name).join(" + ")}` };
  }

  const pack = getPack(item);
  if (!pack || pack.access !== "paid" || !pack.priceCents) {
    throw new PurchaseError("That pack can't be bought.", 400);
  }
  if (owned.has(pack.id)) throw new PurchaseError(`You already own ${pack.name}.`, 409);
  return { packs: [pack], amountCents: pack.priceCents, name: `Rule Out board pack: ${pack.name}` };
}

/** Start a Stripe checkout for a signed-in buyer; returns the URL to send them to */
export async function createPackCheckout(
  buyer: { id: string; email: string },
  item: PackPurchaseItem,
): Promise<string> {
  const { packs, amountCents, name } = pricePurchase(item, await ownedPackIds(buyer.id));
  const packIds = packs.map((p) => p.id).join(",");

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    managed_payments: { enabled: true },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name,
            description: "Themed boards for Rule Out on ArcadeKit, yours to keep.",
            tax_code: PACK_TAX_CODE,
          },
        },
      },
    ],
    client_reference_id: buyer.id,
    customer_email: buyer.email,
    metadata: { userId: buyer.id, packIds },
    success_url: `${APP_URL}${PACKS_PATH}?checkout={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}${PACKS_PATH}`,
  });

  if (!session.url) throw new PurchaseError("Couldn't start checkout. Try again in a moment.", 502);
  return session.url;
}

export interface FulfilledCheckout {
  userId: string;
  packIds: string[];
}

/**
 * Record the packs from a paid checkout. Safe to call repeatedly.
 * Returns null when the checkout isn't paid (yet) or isn't a pack purchase.
 */
export async function fulfillCheckout(sessionId: string): Promise<FulfilledCheckout | null> {
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent.latest_charge"],
  });
  if (session.payment_status !== "paid") return null;

  // A checkout stays "paid" after a refund, so revisiting the return URL
  // (or a late webhook) mustn't hand refunded or disputed packs back
  const paymentIntent = session.payment_intent;
  const charge = typeof paymentIntent === "object" ? paymentIntent?.latest_charge : null;
  if (charge && typeof charge === "object" && (charge.refunded || charge.disputed)) return null;

  const userId = session.metadata?.userId;
  const packIds = (session.metadata?.packIds ?? "")
    .split(",")
    .filter((id) => getPack(id)?.access === "paid");
  if (!userId || packIds.length === 0) return null;

  const [buyer] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId));
  if (!buyer) {
    console.error(`[packs] Paid checkout ${session.id} belongs to a deleted account`);
    return null;
  }

  await db
    .insert(ownedPack)
    .values(packIds.map((packId) => ({ userId, packId, source: "purchase" as const, checkoutSessionId: session.id })))
    .onConflictDoNothing();
  return { userId, packIds };
}

/** Take back the packs a checkout added (full refund or lost dispute) */
export async function revokeCheckout(sessionId: string): Promise<void> {
  const removed = await db
    .delete(ownedPack)
    .where(eq(ownedPack.checkoutSessionId, sessionId))
    .returning({ packId: ownedPack.packId });
  if (removed.length > 0) {
    console.log(`[packs] Revoked ${removed.map((r) => r.packId).join(", ")} from checkout ${sessionId}`);
  }
}

/** The checkout session behind a payment, for refunds and disputes */
export async function checkoutForPayment(paymentIntentId: string): Promise<string | null> {
  const sessions = await stripe().checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
  return sessions.data[0]?.id ?? null;
}
