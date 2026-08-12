import type { Handler } from "@netlify/functions";
import { getSupabase, isDemoMode, json, parseBody, requireEnv } from "../lib/shared";

type ReviewPayload = {
  customer_name: string;
  rating: string;
  comment: string;
  area?: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody<ReviewPayload>(event.body);
    const rating = Number(body.rating || 5);
    if (!body.customer_name?.trim() || !body.comment?.trim()) return json(400, { error: "Missing review details" });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json(400, { error: "Rating must be between 1 and 5" });

    const envError = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
    const supabase = getSupabase();
    if (envError || !supabase) {
      if (!isDemoMode()) return envError || json(503, { error: "Reviews are not configured yet" });
      return json(200, { demo: true, message: "Demo review submitted for approval." });
    }

    const { error } = await supabase.from("reviews").insert({
      customer_name: body.customer_name.trim(),
      rating,
      comment: body.comment.trim(),
      area: body.area?.trim() || null,
      approved: false
    });

    if (error) return json(500, { error: error.message });
    return json(200, { message: "Review submitted for approval." });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
