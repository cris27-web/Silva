# Cleaning Business Website

Production-minded local cleaning-business website built for GitHub + Netlify with service comparison, add-on booking, availability-aware slots, admin operations, reviews, Netlify Database storage, and Stripe Checkout integration.

## Stack

- Astro static pages for performance.
- React islands for booking, reviews, and admin interactions.
- Netlify for hosting, functions, and Netlify Database.
- GitHub for source control.
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

Copy `.env.example` to `.env` when you are ready to connect Stripe and the admin token.

## Netlify Database

This project uses Netlify Database via `@netlify/database`. No manual database project or connection string is needed. Netlify provisions the Postgres database automatically on deploy or when running Netlify Dev.

Database migrations live in:

```text
netlify/database/migrations/
```

Production deploys apply migrations before publishing the site.

## Production environment

Check production env locally with:

```bash
npm run validate:env
```

Required production variables:

- `PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_ACCESS_TOKEN`

## Netlify setup

1. Push this repo to GitHub.
2. In Netlify, import or link the GitHub repo.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add environment variables from `.env.example`.
6. In Stripe, add the webhook endpoint:
   `https://your-site.netlify.app/.netlify/functions/stripe-webhook`

## Production notes

- Replace the simple `ADMIN_ACCESS_TOKEN` flow with a proper auth system before scaling beyond a simple owner workflow.
- Add real phone/email/opening hours only when you have the live business details.
- Use real before/after photos only with customer permission.
- Stripe Checkout can display Apple Pay / Google Pay when enabled in Stripe and supported by the customer device/browser.
