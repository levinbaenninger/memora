import { archiveNote } from "./procedures/archive-note";
import { createNote } from "./procedures/create-note";
import { getNote } from "./procedures/get-note";
import { hardDeleteNote } from "./procedures/hard-delete-note";
import { listNotes } from "./procedures/list-notes";
import { purgeExpiredArchived } from "./procedures/purge-expired-archived";
import { restoreNote } from "./procedures/restore-note";
import { searchNotes } from "./procedures/search-notes";
import { updateNote } from "./procedures/update-note";

export const notesRouter = {
  create: createNote,
  get: getNote,
  list: listNotes,
  search: searchNotes,
  update: updateNote,
  archive: archiveNote,
  restore: restoreNote,
  hardDelete: hardDeleteNote,
  purgeExpiredArchived,
};
