import type { Handler } from "@netlify/functions";
import { getSupabase, json, parseBody } from "./_shared";

type BookingPayload = {
  serviceId: string;
  serviceName: string;
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
  totalAmount: number;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody<BookingPayload>(event.body);
    const required = [body.serviceId, body.serviceName, body.date, body.time, body.name, body.email, body.address, body.postcode];
    if (required.some((value) => !value)) return json(400, { error: "Missing required booking details" });

    const supabase = getSupabase();
    if (!supabase) {
      return json(200, {
        id: `demo-${Date.now()}`,
        demo: true,
        message: "Demo booking created. Add Supabase keys to store live bookings."
      });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service_id: body.serviceId,
        service_name: body.serviceName,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        booking_date: body.date,
        booking_time: body.time,
        customer_name: body.name,
        customer_email: body.email,
        customer_phone: body.phone,
        address: body.address,
        postcode: body.postcode,
        notes: body.notes,
        total_amount: body.totalAmount,
        status: "pending_payment",
        payment_status: "pending"
      })
      .select("id")
      .single();

    if (error) return json(500, { error: error.message });
    return json(200, data);
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
