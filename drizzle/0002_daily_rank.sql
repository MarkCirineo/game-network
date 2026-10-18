CREATE TABLE "daily_play" (
	"id" text PRIMARY KEY NOT NULL,
	"puzzle" integer NOT NULL,
	"user_id" text,
	"rounds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daily_puzzle" (
	"puzzle" integer PRIMARY KEY NOT NULL,
	"rounds" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_play" ADD CONSTRAINT "daily_play_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_play_user_puzzle_idx" ON "daily_play" USING btree ("user_id","puzzle") WHERE "daily_play"."user_id" is not null;--> statement-breakpoint
CREATE INDEX "daily_play_puzzle_idx" ON "daily_play" USING btree ("puzzle","completed_at");