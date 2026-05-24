import { createShare } from "./procedures/create-share";
import { getPublicShare } from "./procedures/get-public-share";

export const sharesRouter = {
  create: createShare,
  getPublic: getPublicShare,
};
