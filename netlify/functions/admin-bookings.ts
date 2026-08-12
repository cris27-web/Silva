import type { Handler } from "@netlify/functions";
import { demoBookings, getSupabase, isDemoMode, json, requireAdmin, requireEnv } from "../lib/shared";

export const handler: Handler = async (event) => {
  if (!requireAdmin(event.headers.authorization)) return json(401, { error: "Invalid admin token" });

  const envError = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const supabase = getSupabase();
  if (envError || !supabase) {
    if (!isDemoMode()) return envError || json(503, { error: "Supabase is not configured" });
    return json(200, { bookings: demoBookings, demo: true });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, customer_name, customer_email, customer_phone, service_name, booking_date, booking_time, status, payment_status, total_amount, add_ons, notes")
    .order("booking_date", { ascending: true });

  if (error) return json(500, { error: error.message });
  return json(200, { bookings: data || [] });
};
