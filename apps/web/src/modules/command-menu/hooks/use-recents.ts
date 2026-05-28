import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export function useRecents(enabled: boolean) {
  return useQuery({
    ...orpc.recentVisits.list.queryOptions(),
    enabled,
    staleTime: 30_000,
  });
}
