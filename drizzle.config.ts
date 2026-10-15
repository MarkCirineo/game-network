// ============================================================
// ArcadeKit — Drizzle Kit config
// `yarn db:generate` turns schema changes into SQL migrations in
// ./drizzle; `yarn db:migrate` applies them (scripts/migrate.mjs).
// ============================================================

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
