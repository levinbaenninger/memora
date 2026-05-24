CREATE TABLE "note_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"note_id" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "note_shares_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "note_shares_note_id_idx" ON "note_shares" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "note_shares_expires_at_idx" ON "note_shares" USING btree ("expires_at") WHERE "note_shares"."expires_at" IS NOT NULL;