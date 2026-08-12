import type { Handler } from "@netlify/functions";
import { bookingSlots, db, isPastDate, isValidDate, json } from "../lib/shared";

export const handler: Handler = async (event) => {
  const date = event.queryStringParameters?.date;
  if (!date || !isValidDate(date) || isPastDate(date)) return json(400, { error: "Choose a valid future date" });

  try {
    const rows = await db().sql`
      select booking_time from bookings
      where booking_date = ${date}
        and status in ('pending_payment', 'confirmed')
    `;
    const booked = new Set(rows.map((booking) => String(booking.booking_time)));
    return json(200, { slots: bookingSlots.filter((slot) => !booked.has(slot)) });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Could not load availability" });
  }
};
