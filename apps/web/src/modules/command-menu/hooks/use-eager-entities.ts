import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export function useFoldersForPalette() {
  return useQuery(orpc.notes.folders.list.queryOptions({ input: {} }));
}

export function useTagsForPalette() {
  return useQuery(orpc.notes.tags.list.queryOptions());
}
