import { listRecents } from "./procedures/list-recents";
import { recordVisit } from "./procedures/record-visit";

export const recentVisitsRouter = {
  list: listRecents,
  record: recordVisit,
};
