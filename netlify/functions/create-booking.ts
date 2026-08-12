import type { Handler } from "@netlify/functions";
import { getSupabase, isDemoMode, json, parseBody, requireEnv, validateBookingPayload } from "../lib/shared";

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

    const envError = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
    const supabase = getSupabase();
    if (envError || !supabase) {
      if (!isDemoMode()) return envError || json(503, { error: "Supabase is not configured" });
      return json(200, {
        id: `demo-${Date.now()}`,
        demo: true,
        amount: pricedBooking.totalAmount,
        serviceName: pricedBooking.service.name,
        message: "Demo booking created. Set DEMO_MODE=false and add Supabase keys for live bookings."
      });
    }

    const { data: existing, error: lookupError } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", body.date)
      .eq("booking_time", body.time)
      .in("status", ["pending_payment", "confirmed"])
      .limit(1);

    if (lookupError) return json(500, { error: lookupError.message });
    if (existing && existing.length > 0) return json(409, { error: "That slot has just been booked. Choose another time." });

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service_id: body.serviceId,
        service_name: pricedBooking.service.name,
        bedrooms: pricedBooking.bedrooms,
        bathrooms: pricedBooking.bathrooms,
        booking_date: body.date,
        booking_time: body.time,
        customer_name: body.name.trim(),
        customer_email: body.email.trim(),
        customer_phone: body.phone.trim(),
        address: body.address.trim(),
        postcode: body.postcode.trim(),
        notes: body.notes,
        add_ons: pricedBooking.addOns,
        total_amount: pricedBooking.totalAmount,
        status: "pending_payment",
        payment_status: "pending"
      })
      .select("id, service_name, total_amount, add_ons")
      .single();

    if (error) return json(500, { error: error.message });
    return json(200, data);
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};

