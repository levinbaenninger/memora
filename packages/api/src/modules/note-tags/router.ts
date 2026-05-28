import { createTag } from "./procedures/create-tag";
import { deleteTag } from "./procedures/delete-tag";
import { listTags } from "./procedures/list-tags";
import { updateTag } from "./procedures/update-tag";

export const tagsRouter = {
  list: listTags,
  create: createTag,
  update: updateTag,
  delete: deleteTag,
};
