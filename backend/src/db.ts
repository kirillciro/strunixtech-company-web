import "dotenv/config";
import { Pool } from "pg";

// Shared PostgreSQL connection pool used by every route handler.
// DATABASE_URL is expected to point at the local or hosted Postgres instance.
// SSL is enabled automatically when DATABASE_URL is a remote host (e.g. Supabase).
const isRemote =
  process.env.DATABASE_URL?.includes("supabase") ??
  process.env.DATABASE_URL?.includes("amazonaws") ??
  process.env.DATABASE_SSL === "true";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});
