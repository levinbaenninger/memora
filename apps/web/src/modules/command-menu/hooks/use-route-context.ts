import { useParams } from "@tanstack/react-router";

export interface RouteEntityContext {
  folderId: string | null;
  noteId: string | null;
  tagId: string | null;
}

export function useRouteEntityContext(): RouteEntityContext {
  const params = useParams({ strict: false }) as Record<
    string,
    string | undefined
  >;
  return {
    noteId: params.noteId ?? null,
    folderId: params.folderId ?? null,
    tagId: params.tagId ?? null,
  };
}
