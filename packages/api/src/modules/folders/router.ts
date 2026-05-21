import { archiveFolder } from "./procedures/archive-folder";
import { createFolder } from "./procedures/create-folder";
import { hardDeleteFolder } from "./procedures/hard-delete-folder";
import { listFolders } from "./procedures/list-folders";
import { moveFolder } from "./procedures/move-folder";
import { restoreFolder } from "./procedures/restore-folder";
import { updateFolder } from "./procedures/update-folder";

export const foldersRouter = {
  create: createFolder,
  list: listFolders,
  update: updateFolder,
  move: moveFolder,
  archive: archiveFolder,
  restore: restoreFolder,
  hardDelete: hardDeleteFolder,
};
