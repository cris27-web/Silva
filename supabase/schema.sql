create extension if not exists "pgcrypto";

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  service_id text not null,
  service_name text not null,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  booking_date date not null,
  booking_time text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  address text not null,
  postcode text not null,
  notes text,
  total_amount numeric(10, 2) not null,
  status text not null default 'pending_payment',
  payment_status text not null default 'pending',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default false,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on bookings (booking_date, booking_time);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists reviews_approved_idx on reviews (approved, created_at desc);

alter table bookings enable row level security;
alter table reviews enable row level security;

create policy "Approved reviews are public"
  on reviews for select
  using (approved = true);

-- Netlify Functions use the Supabase service role key for booking/admin writes.
