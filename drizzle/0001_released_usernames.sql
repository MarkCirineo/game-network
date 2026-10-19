CREATE TABLE "released_username" (
	"username" text PRIMARY KEY NOT NULL,
	"released_by" text,
	"released_at" timestamp DEFAULT now() NOT NULL,
	"available_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "released_username" ADD CONSTRAINT "released_username_released_by_user_id_fk" FOREIGN KEY ("released_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;