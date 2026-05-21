import { getBacklinks } from "./procedures/get-backlinks";
import { getOutboundLinks } from "./procedures/get-outbound-links";

export const linksRouter = {
  getOutbound: getOutboundLinks,
  getBacklinks,
};
