const required = [
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PUBLIC_SITE_URL",
  "ADMIN_ACCESS_TOKEN"
];

const missing = required.filter((key) => !process.env[key] || process.env[key] === "change-me-before-deploy");

if (missing.length > 0) {
  console.error(`Missing required production env vars: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Production environment variables are present.");
