import { createClient } from "@supabase/supabase-js";

export type JsonResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type ServiceDefinition = {
  id: string;
  name: string;
  basePrice: number;
};

export const serviceCatalog: ServiceDefinition[] = [
  { id: "regular-clean", name: "Regular clean", basePrice: 45 },
  { id: "deep-clean", name: "Deep clean", basePrice: 95 },
  { id: "end-of-tenancy", name: "End of tenancy", basePrice: 145 }
];

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

export const getService = (serviceId: string) => serviceCatalog.find((service) => service.id === serviceId);

export const calculateBookingTotal = (serviceId: string, bedrooms: number, bathrooms: number) => {
  const service = getService(serviceId);
  if (!service) return null;

  const safeBedrooms = Math.min(Math.max(Number(bedrooms) || 1, 1), 8);
  const safeBathrooms = Math.min(Math.max(Number(bathrooms) || 1, 1), 6);
  const roomCost = Math.max(0, safeBedrooms - 1) * 12 + Math.max(0, safeBathrooms - 1) * 10;

  return {
    service,
    bedrooms: safeBedrooms,
    bathrooms: safeBathrooms,
    totalAmount: service.basePrice + roomCost
  };
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
  if (!configured || configured === "change-me-before-deploy") return false;
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
