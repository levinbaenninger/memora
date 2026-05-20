import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export type NoteView = "all" | "pinned" | "favorites" | "archived";

export interface NotesListParams {
  folderId?: string | null;
  limit?: number;
  offset?: number;
  q?: string;
  tagId?: string | null;
  view: NoteView;
}

export function useNotesList(params: NotesListParams) {
  const { folderId, tagId, view, q, limit = 50, offset = 0 } = params;
  const isArchived = view === "archived";
  const normalizedQ = q?.trim() ?? "";
  const hasQuery = normalizedQ.length > 0;

  const searchResult = useQuery({
    ...orpc.notes.search.queryOptions({
      input: {
        query: normalizedQ,
        folderId: folderId ?? undefined,
        tagIds: tagId ? [tagId] : [],
        pinned: view === "pinned" ? true : undefined,
        favorite: view === "favorites" ? true : undefined,
        includeArchived: isArchived,
        limit,
        offset,
      },
    }),
    enabled: hasQuery,
  });

  const listResult = useSuspenseQuery(
    orpc.notes.list.queryOptions({
      input: {
        folderId: folderId ?? undefined,
        tagId: tagId ?? undefined,
        pinned: view === "pinned" ? true : undefined,
        favorite: view === "favorites" ? true : undefined,
        includeArchived: isArchived,
        limit,
        offset,
      },
    })
  );

  const raw = hasQuery ? searchResult.data : listResult.data;
  const notes = raw ?? [];

  return {
    notes,
    isPending: hasQuery ? searchResult.isPending : false,
    isError: hasQuery ? searchResult.isError : false,
    error: hasQuery ? searchResult.error : null,
  };
}

export function useNote(id: string) {
  return useSuspenseQuery(
    orpc.notes.get.queryOptions({
      input: { id, includeArchived: true },
    })
  );
}

export function useFoldersList() {
  return useSuspenseQuery(orpc.notes.folders.list.queryOptions({ input: {} }));
}

export function useTagsList() {
  return useSuspenseQuery(orpc.notes.tags.list.queryOptions());
}

export function useNoteOutboundLinks(id: string) {
  return useQuery({
    ...orpc.notes.links.getOutbound.queryOptions({
      input: { id },
    }),
    enabled: !!id,
  });
}

export function useNoteBacklinks(id: string) {
  return useQuery({
    ...orpc.notes.links.getBacklinks.queryOptions({
      input: { id },
    }),
    enabled: !!id,
  });
}
