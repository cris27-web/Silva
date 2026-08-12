import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { db, json, parseBody, requireEnv } from "../lib/shared";

type CheckoutPayload = {
  bookingId: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody<CheckoutPayload>(event.body);
    if (!body.bookingId) return json(400, { error: "Missing checkout details" });

    const envError = requireEnv(["STRIPE_SECRET_KEY", "PUBLIC_SITE_URL"]);
    if (envError) return envError;

    const [booking] = await db().sql`
      select id, service_name, total_amount from bookings
      where id = ${body.bookingId}
      limit 1
    `;

    if (!booking) return json(404, { error: "Booking not found" });

    const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY));
    const siteUrl = process.env.PUBLIC_SITE_URL || process.env.URL || "http://localhost:4321";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking/cancelled`,
      metadata: { booking_id: String(booking.id) },
      payment_intent_data: { metadata: { booking_id: String(booking.id) } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(Number(booking.total_amount) * 100),
            product_data: { name: String(booking.service_name) }
          }
        }
      ]
    });

    await db().sql`
      update bookings set stripe_checkout_session_id = ${session.id}, updated_at = now()
      where id = ${booking.id}
    `;

    return json(200, { id: session.id, url: session.url });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
