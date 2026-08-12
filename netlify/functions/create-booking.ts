import type { Handler } from "@netlify/functions";
import { calculateBookingTotal, getSupabase, json, parseBody } from "./_shared";

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
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody<BookingPayload>(event.body);
    const required = [body.serviceId, body.date, body.time, body.name, body.email, body.address, body.postcode];
    if (required.some((value) => !value)) return json(400, { error: "Missing required booking details" });

    const pricedBooking = calculateBookingTotal(body.serviceId, body.bedrooms, body.bathrooms);
    if (!pricedBooking) return json(400, { error: "Unknown service selected" });

    const supabase = getSupabase();
    if (!supabase) {
      return json(200, {
        id: `demo-${Date.now()}`,
        demo: true,
        amount: pricedBooking.totalAmount,
        serviceName: pricedBooking.service.name,
        message: "Demo booking created. Add Supabase keys to store live bookings."
      });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service_id: body.serviceId,
        service_name: pricedBooking.service.name,
        bedrooms: pricedBooking.bedrooms,
        bathrooms: pricedBooking.bathrooms,
        booking_date: body.date,
        booking_time: body.time,
        customer_name: body.name,
        customer_email: body.email,
        customer_phone: body.phone,
        address: body.address,
        postcode: body.postcode,
        notes: body.notes,
        total_amount: pricedBooking.totalAmount,
        status: "pending_payment",
        payment_status: "pending"
      })
      .select("id, service_name, total_amount")
      .single();

    if (error) return json(500, { error: error.message });
    return json(200, data);
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
