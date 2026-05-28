import { createShare } from "./procedures/create-share";
import { duplicateFromShare } from "./procedures/duplicate-from-share";
import { getPublicShare } from "./procedures/get-public-share";
import { listShares } from "./procedures/list-shares";
import { revokeShare } from "./procedures/revoke-share";

export const sharesRouter = {
  create: createShare,
  list: listShares,
  revoke: revokeShare,
  getPublic: getPublicShare,
  duplicate: duplicateFromShare,
};
