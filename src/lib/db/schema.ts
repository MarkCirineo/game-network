// ============================================================
// ArcadeKit — Database schema
// Better Auth's four core tables (user, session, account,
// verification), the username plugin's fields, and ArcadeKit's own
// user fields. `name` and `image` stay empty: real names and photos
// are never stored. Property names
// must match Better Auth's field names; column names are snake_case.
// Check against `yarn auth:schema` (Better Auth's generator) after
// changing auth plugins or user fields.
// ============================================================

import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  /** When the "I'm 13 or older" box was ticked for this account */
  ageConfirmedAt: timestamp("age_confirmed_at"),
  // Username plugin: the public name. `username` is the lowercase
  // copy used for uniqueness; `displayUsername` keeps the capitals.
  username: text("username").unique(),
  displayUsername: text("display_username"),
  /** Last time the username was changed (limits changes to one per 30 days) */
  usernameChangedAt: timestamp("username_changed_at"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

/**
 * Usernames given up by a rename or a deleted account. Held for
 * USERNAME_HOLD_DAYS so nobody can grab a known player's old name right
 * away; only the original owner (releasedBy) can take it back meanwhile.
 * releasedBy is null when the account was deleted.
 */
export const releasedUsername = pgTable("released_username", {
  /** Lowercase username */
  username: text("username").primaryKey(),
  releasedBy: text("released_by").references(() => user.id, { onDelete: "set null" }),
  releasedAt: timestamp("released_at").defaultNow().notNull(),
  availableAt: timestamp("available_at").notNull(),
});

/**
 * Daily Rank: each day's puzzle, saved the first time anyone opens
 * it. Puzzles are generated from the category lists, so saving them
 * keeps a published puzzle fixed when categories are added or fixed
 * later. Holds the answers: never send `rounds` to the browser as is.
 */
export const dailyPuzzle = pgTable("daily_puzzle", {
  puzzle: integer("puzzle").primaryKey(),
  rounds: jsonb("rounds").$type<unknown[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Daily Rank: one row per play of a daily puzzle. Guests' plays have
 * no user_id; signing in later claims them (see src/lib/daily/plays.ts).
 * `id` is the play token the browser keeps. `rounds` holds each round
 * the player has locked in: their order and the marks (2/1/0) per item.
 */
export const dailyPlay = pgTable(
  "daily_play",
  {
    id: text("id").primaryKey(),
    puzzle: integer("puzzle").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    rounds: jsonb("rounds").$type<DailyPlayRound[]>().default([]).notNull(),
    score: integer("score").default(0).notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    uniqueIndex("daily_play_user_puzzle_idx")
      .on(table.userId, table.puzzle)
      .where(sql`${table.userId} is not null`),
    index("daily_play_puzzle_idx").on(table.puzzle, table.completedAt),
  ],
);

export interface DailyPlayRound {
  guess: string[];
  marks: number[];
}

/**
 * Rule Out board packs an account owns, one row per pack (pack ids
 * are in shared/boards/packs.ts). Packs that are free with an account
 * need no row. `source` is "purchase" for a Stripe checkout (with its
 * session id, so a repeated webhook can't add a pack twice) or
 * "grant" for packs given by hand.
 */
export const ownedPack = pgTable(
  "owned_pack",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    packId: text("pack_id").notNull(),
    source: text("source").$type<"purchase" | "grant">().notNull(),
    checkoutSessionId: text("checkout_session_id"),
    acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.packId] })],
);
