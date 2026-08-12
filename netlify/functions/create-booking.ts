import type { Handler } from "@netlify/functions";
import { db, json, parseBody, serializeAddOns, validateBookingPayload } from "../lib/shared";

type BookingPayload = {
  serviceId: string;
  bedrooms: number;
  bathrooms: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  notes?: string;
  addOns?: string[];
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody<BookingPayload>(event.body);
    const validation = validateBookingPayload(body);
    if ("error" in validation) return json(400, { error: validation.error });
    const { pricedBooking } = validation;
    const database = db();

    const existing = await database.sql`
      select id from bookings
      where booking_date = ${body.date}
        and booking_time = ${body.time}
        and status in ('pending_payment', 'confirmed')
      limit 1
    `;

    if (existing.length > 0) return json(409, { error: "That slot has just been booked. Choose another time." });

    const [booking] = await database.sql`
      insert into bookings (
        service_id,
        service_name,
        bedrooms,
        bathrooms,
        booking_date,
        booking_time,
        customer_name,
        customer_email,
        customer_phone,
        address,
        postcode,
        notes,
        add_ons,
        total_amount,
        status,
        payment_status
      ) values (
        ${body.serviceId},
        ${pricedBooking.service.name},
        ${pricedBooking.bedrooms},
        ${pricedBooking.bathrooms},
        ${body.date},
        ${body.time},
        ${body.name.trim()},
        ${body.email.trim()},
        ${body.phone.trim()},
        ${body.address.trim()},
        ${body.postcode.trim()},
        ${body.notes || null},
        ${serializeAddOns(pricedBooking.addOns)}::jsonb,
        ${pricedBooking.totalAmount},
        'pending_payment',
        'pending'
      ) returning id, service_name, total_amount, add_ons
    `;

    return json(200, booking);
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
