CREATE TABLE "note_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"name" text NOT NULL,
	"archived_at" timestamp,
	"archive_expires_at" timestamp,
	"archive_origin_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_links" (
	"user_id" text NOT NULL,
	"source_note_id" text NOT NULL,
	"target_note_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "note_links_user_id_source_note_id_target_note_id_pk" PRIMARY KEY("user_id","source_note_id","target_note_id")
);
--> statement-breakpoint
CREATE TABLE "note_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"content_text" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp,
	"archive_expires_at" timestamp,
	"archive_origin_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes_to_tags" (
	"note_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notes_to_tags_note_id_tag_id_pk" PRIMARY KEY("note_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "note_folders" ADD CONSTRAINT "note_folders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_folders" ADD CONSTRAINT "note_folders_parent_id_note_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."note_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_source_note_id_notes_id_fk" FOREIGN KEY ("source_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_target_note_id_notes_id_fk" FOREIGN KEY ("target_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_folder_id_note_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."note_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_to_tags" ADD CONSTRAINT "notes_to_tags_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_to_tags" ADD CONSTRAINT "notes_to_tags_tag_id_note_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."note_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "note_folders_user_archived_updated_idx" ON "note_folders" USING btree ("user_id","archived_at","updated_at");--> statement-breakpoint
CREATE INDEX "note_folders_user_parent_archived_idx" ON "note_folders" USING btree ("user_id","parent_id","archived_at");--> statement-breakpoint
CREATE UNIQUE INDEX "note_links_user_source_target_unique" ON "note_links" USING btree ("user_id","source_note_id","target_note_id");--> statement-breakpoint
CREATE INDEX "note_links_user_target_idx" ON "note_links" USING btree ("user_id","target_note_id");--> statement-breakpoint
CREATE INDEX "note_links_user_source_idx" ON "note_links" USING btree ("user_id","source_note_id");--> statement-breakpoint
CREATE UNIQUE INDEX "note_tags_user_slug_unique" ON "note_tags" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "note_tags_user_name_idx" ON "note_tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "notes_user_archived_updated_idx" ON "notes" USING btree ("user_id","archived_at","updated_at");--> statement-breakpoint
CREATE INDEX "notes_user_folder_archived_idx" ON "notes" USING btree ("user_id","folder_id","archived_at");--> statement-breakpoint
CREATE INDEX "notes_search_idx" ON "notes" USING gin (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("content_text", '')));--> statement-breakpoint
CREATE INDEX "notes_to_tags_tag_id_idx" ON "notes_to_tags" USING btree ("tag_id");