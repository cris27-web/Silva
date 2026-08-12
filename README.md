# Cleaning Business Website

Production-minded local cleaning-business website built for GitHub + Netlify with service comparison, add-on booking, availability-aware slots, admin operations, reviews, Supabase-ready data, and Stripe Checkout integration.

## Free-tier stack

- Astro static pages for performance.
- React islands for booking, reviews, and admin interactions.
- Netlify Free for hosting and functions.
- GitHub Free for source control.
- Supabase Free for database and booking/review storage.
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

## Demo mode and production mode

Demo responses are now explicit. Set `DEMO_MODE="true"` for local demos without Supabase/Stripe. In production, set `DEMO_MODE="false"` and add the real environment variables. Missing production variables return clear errors instead of pretending a booking, review, or payment succeeded.

Check production env locally with:

```bash
npm run validate:env
```

## Netlify setup

1. Push this repo to GitHub.
2. In Netlify, import or link the GitHub repo.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add environment variables from `.env.example`.
6. Run `supabase/schema.sql` in the Supabase SQL editor.
7. In Stripe, add the webhook endpoint:
   `https://your-site.netlify.app/.netlify/functions/stripe-webhook`

## Production notes

- Replace `ADMIN_ACCESS_TOKEN` with Supabase Auth before scaling beyond a simple owner workflow.
- Add real phone/email/opening hours only when you have the live business details.
- Use real before/after photos only with customer permission.
- Stripe Checkout can display Apple Pay / Google Pay when enabled in Stripe and supported by the customer device/browser.
