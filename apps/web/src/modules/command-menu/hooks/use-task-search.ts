import { useDebouncedValue } from "@tanstack/react-pacer";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 8;

export function useTaskSearch(query: string) {
  const [debouncedQuery] = useDebouncedValue(query, { wait: 200 });
  const trimmed = debouncedQuery.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    ...orpc.tasks.search.queryOptions({
      input: {
        query: trimmed,
        limit: RESULT_LIMIT,
        offset: 0,
      },
    }),
    enabled,
    placeholderData: keepPreviousData,
  });
}
