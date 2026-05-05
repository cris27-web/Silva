import type { Handler } from "@netlify/functions";
import { json } from "./_shared";

export const handler: Handler = async () => {
  return json(200, {
    slots: ["09:00", "11:30", "14:00", "16:30"],
    message: "Starter availability returns standard slots. Connect calendar rules when the schedule is ready."
  });
};
