import { useDebouncedCallback } from "@tanstack/react-pacer";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { orpc } from "@/utils/orpc";

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 8;

export function useNoteSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const setDebounced = useDebouncedCallback(
    (value: string) => setDebouncedQuery(value),
    { wait: 200 }
  );

  useEffect(() => {
    setDebounced(query);
  }, [query, setDebounced]);

  const trimmed = debouncedQuery.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    ...orpc.notes.search.queryOptions({
      input: {
        query: trimmed,
        includeArchived: false,
        limit: RESULT_LIMIT,
        offset: 0,
        tagIds: [],
      },
    }),
    enabled,
    placeholderData: keepPreviousData,
  });
}
