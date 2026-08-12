import type { Handler } from "@netlify/functions";
import { db, json, parseBody } from "../lib/shared";

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

    await db().sql`
      insert into reviews (customer_name, rating, comment, area, approved, source)
      values (${body.customer_name.trim()}, ${rating}, ${body.comment.trim()}, ${body.area?.trim() || null}, false, 'website')
    `;

    return json(200, { message: "Review submitted for approval." });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};
