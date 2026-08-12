import type { Handler } from "@netlify/functions";
import { bookingSlots, getSupabase, isDemoMode, isPastDate, isValidDate, json, requireEnv } from "../lib/shared";

export const handler: Handler = async (event) => {
  const date = event.queryStringParameters?.date;
  if (!date || !isValidDate(date) || isPastDate(date)) return json(400, { error: "Choose a valid future date" });

  const envError = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const supabase = getSupabase();
  if (envError || !supabase) {
    if (!isDemoMode()) return envError || json(503, { error: "Supabase is not configured" });
    return json(200, { slots: bookingSlots, demo: true });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("booking_time")
    .eq("booking_date", date)
    .in("status", ["pending_payment", "confirmed"]);

  if (error) return json(500, { error: error.message });
  const booked = new Set((data || []).map((booking) => booking.booking_time));
  return json(200, { slots: bookingSlots.filter((slot) => !booked.has(slot)) });
};
