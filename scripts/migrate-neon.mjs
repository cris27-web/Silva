import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to run Neon migrations.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schema = await readFile(new URL("../neon/schema.sql", import.meta.url), "utf8");

await sql.query(schema);
console.log("Neon schema applied.");
