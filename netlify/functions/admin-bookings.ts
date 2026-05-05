import type { Handler } from "@netlify/functions";
import { demoBookings, getSupabase, json, requireAdmin } from "./_shared";

export const handler: Handler = async (event) => {
  if (!requireAdmin(event.headers.authorization)) return json(401, { error: "Invalid admin token" });

  const supabase = getSupabase();
  if (!supabase) return json(200, { bookings: demoBookings, demo: true });

  const { data, error } = await supabase
    .from("bookings")
    .select("id, customer_name, customer_email, service_name, booking_date, booking_time, status, payment_status, total_amount")
    .order("booking_date", { ascending: true });

  if (error) return json(500, { error: error.message });
  return json(200, { bookings: data || [] });
};
