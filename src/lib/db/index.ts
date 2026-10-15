// ============================================================
// ArcadeKit — Database connection (server only)
// One pg pool per process. In dev, the pool is kept on globalThis
// so hot reloads don't open a new pool each time.
// ============================================================

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { arcadekitPool?: Pool };

const pool =
  globalForDb.arcadekitPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.arcadekitPool = pool;
}

export const db = drizzle(pool, { schema });
