// ============================================================
// ArcadeKit — Database Migrations
// Applies the SQL migrations in ./drizzle (made by drizzle-kit)
// to DATABASE_URL, then exits. Drizzle records what's been applied,
// so running it again is safe.
//   Local:      node --env-file=.env.local scripts/migrate.mjs
//   Production: docker compose -f docker/docker-compose.yml run --rm migrate
// ============================================================

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate] DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("[migrate] Database is up to date");
} catch (error) {
  console.error("[migrate] Failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
