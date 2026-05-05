import { createClient } from "@supabase/supabase-js";

export type JsonResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export const json = (statusCode: number, data: unknown): JsonResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(data)
});

export const parseBody = <T>(body: string | null): T => {
  if (!body) return {} as T;
  return JSON.parse(body) as T;
};

export const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
};

export const requireAdmin = (authorization?: string) => {
  const configured = process.env.ADMIN_ACCESS_TOKEN;
  if (!configured) return true;
  return authorization === `Bearer ${configured}`;
};

export const demoBookings = [
  {
    id: "demo-1001",
    customer_name: "Amelia Roberts",
    customer_email: "amelia@example.com",
    service_name: "Regular clean",
    booking_date: "2026-05-08",
    booking_time: "09:00",
    status: "confirmed",
    payment_status: "paid",
    total_amount: 57
  },
  {
    id: "demo-1002",
    customer_name: "Marcus Taylor",
    customer_email: "marcus@example.com",
    service_name: "Deep clean",
    booking_date: "2026-05-09",
    booking_time: "11:30",
    status: "pending",
    payment_status: "pending",
    total_amount: 117
  }
];
