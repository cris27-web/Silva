# Cleaning Business Website

Modern, fast cleaning-business website built for GitHub + Netlify with a booking flow, admin area, reviews, Supabase-ready data model, and Stripe Checkout integration.

## Free-tier stack

- Astro static pages for performance.
- Netlify Free for hosting and functions.
- GitHub Free for source control.
- Supabase Free for database and auth.
- Stripe for Apple Pay / Google Pay / cards with no monthly fee.
- Optional free email provider such as Resend or Brevo.

## Local setup

```bash
npm install
npm run dev
```

For the booking/admin API routes locally, use Netlify Dev:

```bash
npm run dev:netlify
```

Copy `.env.example` to `.env` when you are ready to connect Supabase and Stripe.

Without environment variables, the booking and admin functions return demo responses so the site can be tested immediately.

## Netlify setup

1. Push this repo to GitHub.
2. In Netlify, import the GitHub repo.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add environment variables from `.env.example`.
6. In Stripe, add the webhook endpoint:
   `https://your-site.netlify.app/.netlify/functions/stripe-webhook`

## Production notes

- Replace `ADMIN_ACCESS_TOKEN` with Supabase Auth before taking real bookings.
- Run `supabase/schema.sql` in Supabase SQL editor.
- Stripe Checkout can display Apple Pay / Google Pay when enabled in Stripe and supported by the customer device/browser.
