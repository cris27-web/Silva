import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to run Neon migrations.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schema = (await readFile(new URL("../neon/schema.sql", import.meta.url), "utf8")).replace(/^\uFEFF/, "");
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log("Neon schema applied.");
