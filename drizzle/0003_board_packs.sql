CREATE TABLE "owned_pack" (
	"user_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"source" text NOT NULL,
	"checkout_session_id" text,
	"acquired_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "owned_pack_user_id_pack_id_pk" PRIMARY KEY("user_id","pack_id")
);
--> statement-breakpoint
ALTER TABLE "owned_pack" ADD CONSTRAINT "owned_pack_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;