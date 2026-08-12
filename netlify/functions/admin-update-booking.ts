import type { Handler } from "@netlify/functions";
import { getSupabase, isDemoMode, json, parseBody, requireAdmin, requireEnv } from "../lib/shared";

type UpdatePayload = {
  id: string;
  status: string;
};

const allowedStatuses = ["pending_payment", "confirmed", "completed", "cancelled"];

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  if (!requireAdmin(event.headers.authorization)) return json(401, { error: "Invalid admin token" });

  const body = parseBody<UpdatePayload>(event.body);
  if (!body.id || !allowedStatuses.includes(body.status)) return json(400, { error: "Choose a valid booking status" });

  const envError = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const supabase = getSupabase();
  if (envError || !supabase) {
    if (!isDemoMode()) return envError || json(503, { error: "Supabase is not configured" });
    return json(200, { demo: true, message: "Demo update accepted." });
  }

  const { error } = await supabase.from("bookings").update({ status: body.status }).eq("id", body.id);
  if (error) return json(500, { error: error.message });
  return json(200, { ok: true });
};
