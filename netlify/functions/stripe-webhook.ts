import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { db, json, requireEnv } from "../lib/shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const envError = requireEnv(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);
  if (envError) return envError;

  try {
    const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY));
    const signature = event.headers["stripe-signature"];
    if (!signature || !event.body) return json(400, { error: "Missing Stripe signature" });

    const stripeEvent = stripe.webhooks.constructEvent(event.body, signature, String(process.env.STRIPE_WEBHOOK_SECRET));
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        await db().sql`
          update bookings set
            status = 'confirmed',
            payment_status = 'paid',
            stripe_checkout_session_id = ${session.id},
            stripe_payment_intent_id = ${String(session.payment_intent || "")},
            updated_at = now()
          where id = ${bookingId}
        `;
      }
    }

    return json(200, { received: true });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Invalid webhook" });
  }
};
