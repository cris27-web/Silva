# Cleaning Business Website

Production-minded local cleaning-business website built for GitHub + Netlify with service comparison, add-on booking, availability-aware slots, admin operations, reviews, Neon Postgres data, and Stripe Checkout integration.

## Free-tier stack

- Astro static pages for performance.
- React islands for booking, reviews, and admin interactions.
- Netlify Free for hosting and functions.
- GitHub Free for source control.
- Neon Free for Postgres booking/review storage.
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

Copy `.env.example` to `.env` when you are ready to connect Neon and Stripe.

## Neon setup

1. Create a free Neon project.
2. Copy the pooled connection string into `DATABASE_URL` locally and in Netlify environment variables.
3. Apply the schema:

```bash
npm run migrate:neon
```

You can also paste `neon/schema.sql` into the Neon SQL editor.

## Production env check

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
6. In Stripe, add the webhook endpoint:
   `https://your-site.netlify.app/.netlify/functions/stripe-webhook`

## Production notes

- Replace `ADMIN_ACCESS_TOKEN` with a full auth flow before scaling beyond a simple owner workflow.
- Add real phone/email/opening hours only when you have the live business details.
- Use real before/after photos only with customer permission.
- Stripe Checkout can display Apple Pay / Google Pay when enabled in Stripe and supported by the customer device/browser.
