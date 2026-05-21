ALTER TABLE "note_folders" DROP CONSTRAINT "note_folders_parent_id_note_folders_id_fk";
--> statement-breakpoint
DROP INDEX "note_links_user_source_target_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "note_folders_user_id_unique" ON "note_folders" USING btree ("user_id","id");--> statement-breakpoint
ALTER TABLE "note_folders" ADD CONSTRAINT "note_folders_user_id_parent_id_note_folders_user_id_id_fk" FOREIGN KEY ("user_id","parent_id") REFERENCES "public"."note_folders"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_user_archived_pinned_updated_idx" ON "notes" USING btree ("user_id","archived_at","pinned" DESC NULLS LAST,"updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notes_archive_expires_at_idx" ON "notes" USING btree ("archive_expires_at") WHERE "notes"."archive_expires_at" IS NOT NULL;