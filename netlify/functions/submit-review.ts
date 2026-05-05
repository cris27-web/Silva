import type { Handler } from "@netlify/functions";
import { getSupabase, json, parseBody } from "./_shared";

type ReviewPayload = {
  customer_name: string;
  rating: string;
  comment: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const body = parseBody<ReviewPayload>(event.body);
  if (!body.customer_name || !body.comment) return json(400, { error: "Missing review details" });

  const supabase = getSupabase();
  if (!supabase) return json(200, { demo: true, message: "Demo review submitted for approval." });

  const { error } = await supabase.from("reviews").insert({
    customer_name: body.customer_name,
    rating: Number(body.rating || 5),
    comment: body.comment,
    approved: false
  });

  if (error) return json(500, { error: error.message });
  return json(200, { message: "Review submitted for approval." });
};
