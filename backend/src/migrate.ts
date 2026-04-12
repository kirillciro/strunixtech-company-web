import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "dotenv/config";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const __dir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dir, "../../database/003_users_auth.sql"),
  "utf8",
);

pool
  .query(sql)
  .then(() => {
    console.log("Migration 003_users_auth applied OK");
    process.exit(0);
  })
  .catch((e: Error) => {
    console.error("Migration failed:", e.message);
    process.exit(1);
  });
