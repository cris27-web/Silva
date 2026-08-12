import type { Handler } from "@netlify/functions";
import { db, json, mapBookingRow, requireAdmin } from "../lib/shared";

export const handler: Handler = async (event) => {
  if (!requireAdmin(event.headers.authorization)) return json(401, { error: "Invalid admin token" });

  try {
    const rows = await db().sql`
      select id, customer_name, customer_email, customer_phone, service_name, booking_date, booking_time, status, payment_status, total_amount, add_ons, notes
      from bookings
      order by booking_date asc, booking_time asc
    `;
    return json(200, { bookings: rows.map(mapBookingRow) });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unable to load bookings" });
  }
};

