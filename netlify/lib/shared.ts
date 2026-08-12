import { neon } from "@neondatabase/serverless";
import { addOns, bookingSlots, calculateBookingPrice, getService } from "../../src/data/services";

export type JsonResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export const sql = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
  return neon(databaseUrl);
};

export const json = (statusCode: number, data: unknown): JsonResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
});

export const parseBody = <T>(body: string | null): T => {
  if (!body) return {} as T;
  return JSON.parse(body) as T;
};

export const missingEnv = (keys: string[]) => keys.filter((key) => !process.env[key]);

export const requireEnv = (keys: string[]) => {
  const missing = missingEnv(keys);
  if (missing.length === 0) return null;
  return json(503, { error: `Missing required environment variables: ${missing.join(", ")}` });
};

export const requireAdmin = (authorization?: string) => {
  const configured = process.env.ADMIN_ACCESS_TOKEN;
  if (!configured || configured === "change-me-before-deploy") return false;
  return authorization === `Bearer ${configured}`;
};

export const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export const isPastDate = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${value}T00:00:00`);
  selected.setHours(0, 0, 0, 0);
  return selected < today;
};

export const validateBookingPayload = (body: {
  serviceId?: string;
  bedrooms?: number;
  bathrooms?: number;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  addOns?: unknown;
}) => {
  const required = [body.serviceId, body.date, body.time, body.name, body.email, body.phone, body.address, body.postcode];
  if (required.some((value) => !String(value || "").trim())) return { error: "Missing required booking details" };
  if (!getService(String(body.serviceId))) return { error: "Unknown service selected" };
  if (!isValidDate(String(body.date)) || isPastDate(String(body.date))) return { error: "Choose a valid future booking date" };
  if (!bookingSlots.includes(String(body.time))) return { error: "Choose an available booking time" };
  if (!String(body.email).includes("@")) return { error: "Enter a valid email address" };
  if (Number(body.bedrooms) < 1 || Number(body.bedrooms) > 8) return { error: "Bedrooms must be between 1 and 8" };
  if (Number(body.bathrooms) < 1 || Number(body.bathrooms) > 6) return { error: "Bathrooms must be between 1 and 6" };

  const pricedBooking = calculateBookingPrice(String(body.serviceId), Number(body.bedrooms), Number(body.bathrooms), body.addOns);
  if (!pricedBooking) return { error: "Could not price booking" };
  return { pricedBooking };
};

export const parseAddOns = (items: unknown) => {
  if (Array.isArray(items)) return items;
  if (typeof items !== "string") return [];
  try {
    const parsed = JSON.parse(items);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const mapBookingRow = (row: Record<string, unknown>) => ({
  ...row,
  add_ons: parseAddOns(row.add_ons),
  total_amount: Number(row.total_amount || 0)
});

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
    total_amount: 57,
    add_ons: [],
    notes: "Demo booking only"
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
    total_amount: 172,
    add_ons: addOns.filter((addOn) => ["oven-clean", "inside-fridge"].includes(addOn.id)),
    notes: "Demo booking only"
  }
];

export { addOns, bookingSlots, calculateBookingPrice };
