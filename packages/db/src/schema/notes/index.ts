import { relations } from "drizzle-orm";

import { user } from "../auth";
import { noteFolders } from "./folders";
import { noteLinks } from "./links";
import { notes } from "./notes";
import { noteShares } from "./shares";
import { notesToTags, noteTags } from "./tags";

export * from "./folders";
export * from "./links";
export * from "./notes";
export * from "./recent-visits";
export * from "./shares";
export * from "./tags";

export const noteFolderRelations = relations(noteFolders, ({ one, many }) => ({
  user: one(user, {
    fields: [noteFolders.userId],
    references: [user.id],
  }),
  parent: one(noteFolders, {
    fields: [noteFolders.parentId],
    references: [noteFolders.id],
    relationName: "folder_parent",
  }),
  children: many(noteFolders, { relationName: "folder_parent" }),
  notes: many(notes),
}));

export const noteRelations = relations(notes, ({ one, many }) => ({
  user: one(user, {
    fields: [notes.userId],
    references: [user.id],
  }),
  folder: one(noteFolders, {
    fields: [notes.folderId],
    references: [noteFolders.id],
  }),
  tags: many(notesToTags),
  outboundLinks: many(noteLinks, { relationName: "source_note" }),
  backlinks: many(noteLinks, { relationName: "target_note" }),
  shares: many(noteShares),
}));

export const noteShareRelations = relations(noteShares, ({ one }) => ({
  note: one(notes, {
    fields: [noteShares.noteId],
    references: [notes.id],
  }),
}));

export const noteTagRelations = relations(noteTags, ({ one, many }) => ({
  user: one(user, {
    fields: [noteTags.userId],
    references: [user.id],
  }),
  notes: many(notesToTags),
}));

export const notesToTagsRelations = relations(notesToTags, ({ one }) => ({
  note: one(notes, {
    fields: [notesToTags.noteId],
    references: [notes.id],
  }),
  tag: one(noteTags, {
    fields: [notesToTags.tagId],
    references: [noteTags.id],
  }),
}));

export const noteLinkRelations = relations(noteLinks, ({ one }) => ({
  user: one(user, {
    fields: [noteLinks.userId],
    references: [user.id],
  }),
  source: one(notes, {
    fields: [noteLinks.sourceNoteId],
    references: [notes.id],
    relationName: "source_note",
  }),
  target: one(notes, {
    fields: [noteLinks.targetNoteId],
    references: [notes.id],
    relationName: "target_note",
  }),
}));
