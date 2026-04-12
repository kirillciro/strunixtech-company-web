import "dotenv/config";
import { Pool } from "pg";

// Shared PostgreSQL connection pool used by every route handler.
// DATABASE_URL is expected to point at the local or hosted Postgres instance.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
