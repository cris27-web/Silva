import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { getSupabase, json, parseBody } from "./_shared";

type CheckoutPayload = {
  bookingId: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody<CheckoutPayload>(event.body);
    if (!body.bookingId) return json(400, { error: "Missing checkout details" });

    const secret = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.PUBLIC_SITE_URL || process.env.URL || "http://localhost:4321";

    if (!secret) {
      return json(200, {
        demo: true,
        message: "Demo checkout ready. Add Stripe keys to redirect customers to secure payment."
      });
    }

    const supabase = getSupabase();
    if (!supabase) return json(503, { error: "Supabase must be configured before live checkout is enabled" });

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, service_name, total_amount")
      .eq("id", body.bookingId)
      .single();

    if (error || !booking) return json(404, { error: "Booking not found" });

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking/cancelled`,
      metadata: {
        booking_id: booking.id
      },
      payment_intent_data: {
        metadata: {
          booking_id: booking.id
        }
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(Number(booking.total_amount) * 100),
            product_data: {
              name: booking.service_name
            }
          }
        }
      ]
    });

    return json(200, { id: session.id, url: session.url });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
