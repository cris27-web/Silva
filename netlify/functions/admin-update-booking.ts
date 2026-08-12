import type { Handler } from "@netlify/functions";
import { json, parseBody, requireAdmin, sql } from "../lib/shared";

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

  try {
    await sql()`
      update bookings
      set status = ${body.status}, updated_at = now()
      where id = ${body.id}
    `;

    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unable to update booking" });
  }
};
