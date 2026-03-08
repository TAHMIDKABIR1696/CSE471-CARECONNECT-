import Stripe from "stripe";

/**
 * Stripe Service — External Stripe API interactions
 */

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY not found in environment variables. Stripe payments will not work."
  );
}

// ── Check if Stripe is configured ──
export const isConfigured = (): boolean => stripe !== null;

// ── Create a PaymentIntent ──
export const createPaymentIntent = async (
  amountInCents: number,
  currency: string,
  metadata: Record<string, string>,
  description: string
) => {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata,
    description,
  });
};

// ── Verify webhook signature ──
export const constructWebhookEvent = (body: Buffer | string, signature: string, secret: string) => {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.webhooks.constructEvent(body, signature, secret);
};

// ── Retrieve a PaymentIntent ──
export const retrievePaymentIntent = async (paymentIntentId: string) => {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

export type { Stripe };
