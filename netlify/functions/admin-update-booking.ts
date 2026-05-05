import type { Handler } from "@netlify/functions";
import { getSupabase, json, parseBody, requireAdmin } from "./_shared";

type UpdatePayload = {
  id: string;
  status: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  if (!requireAdmin(event.headers.authorization)) return json(401, { error: "Invalid admin token" });

  const supabase = getSupabase();
  if (!supabase) return json(200, { demo: true, message: "Demo update accepted." });

  const body = parseBody<UpdatePayload>(event.body);
  const { error } = await supabase.from("bookings").update({ status: body.status }).eq("id", body.id);
  if (error) return json(500, { error: error.message });
  return json(200, { ok: true });
};
