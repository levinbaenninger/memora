import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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
  const hasQuery = !!q && q.trim().length > 0;

  const searchResult = useQuery({
    ...orpc.notes.search.queryOptions({
      input: {
        query: q ?? "",
        folderId: folderId ?? undefined,
        tagIds: tagId ? [tagId] : [],
        includeArchived: isArchived,
        limit,
        offset,
      },
    }),
    enabled: hasQuery,
  });

  const listResult = useQuery({
    ...orpc.notes.list.queryOptions({
      input: {
        folderId: folderId ?? undefined,
        includeArchived: isArchived,
        limit,
        offset,
      },
    }),
    enabled: !hasQuery,
  });

  const raw = hasQuery ? searchResult.data : listResult.data;

  const notes = useMemo(() => {
    if (!raw) {
      return [];
    }
    let result = raw;
    if (tagId && !hasQuery) {
      result = result.filter((n) => n.tags.some((t) => t.id === tagId));
    }
    if (view === "pinned") {
      result = result.filter((n) => n.pinned);
    }
    if (view === "favorites") {
      result = result.filter((n) => n.favorite);
    }
    if (view === "archived") {
      result = result.filter((n) => !!n.archivedAt);
    }
    return result;
  }, [raw, tagId, view, hasQuery]);

  return {
    notes,
    isPending: hasQuery ? searchResult.isPending : listResult.isPending,
    isError: hasQuery ? searchResult.isError : listResult.isError,
    error: hasQuery ? searchResult.error : listResult.error,
  };
}

export function useNote(id: string) {
  return useQuery({
    ...orpc.notes.get.queryOptions({
      input: { id, includeArchived: true },
    }),
    enabled: !!id,
  });
}

export function useFoldersList() {
  return useQuery(orpc.notes.folders.list.queryOptions({ input: {} }));
}

export function useTagsList() {
  return useQuery(orpc.notes.tags.list.queryOptions());
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
