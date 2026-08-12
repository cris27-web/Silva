import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { getSupabase, json, requireEnv } from "../lib/shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const envError = requireEnv(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (envError) return envError;

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return json(503, { error: "Stripe webhook is not configured" });

  try {
    const stripe = new Stripe(secret);
    const signature = event.headers["stripe-signature"];
    if (!signature || !event.body) return json(400, { error: "Missing Stripe signature" });

    const stripeEvent = stripe.webhooks.constructEvent(event.body, signature, webhookSecret);
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const supabase = getSupabase();
      if (bookingId && supabase) {
        await supabase.from("bookings").update({
          status: "confirmed",
          payment_status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: String(session.payment_intent || "")
        }).eq("id", bookingId);
      }
    }

    return json(200, { received: true });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Invalid webhook" });
  }
};
