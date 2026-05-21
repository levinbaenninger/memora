import { FolderIcon, Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { createElement } from "react";

import type { SidebarNavItem } from "@/modules/app/routes";
import { orpc } from "@/utils/orpc";

const VIEW_TITLES: Record<string, string> = {
  pinned: "Pinned",
  favorites: "Favorites",
  archived: "Archive",
};

interface NotesPathInfo {
  folderId?: string;
  noteId?: string;
  tagId?: string;
  view?: keyof typeof VIEW_TITLES;
}

interface FolderEntry {
  id: string;
  name: string;
  parentId: string | null;
}

function parseNotesPath(pathname: string): NotesPathInfo {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "notes") {
    return {};
  }

  const second = segments[1];
  const third = segments[2];

  if (!second) {
    return {};
  }
  if (second === "folder" && third) {
    return { folderId: third };
  }
  if (second === "tag" && third) {
    return { tagId: third };
  }
  if (second in VIEW_TITLES) {
    return { view: second as keyof typeof VIEW_TITLES };
  }
  return { noteId: second };
}

function folderCrumb(folder: FolderEntry): SidebarNavItem {
  return {
    title: folder.name,
    icon: createElement(HugeiconsIcon, { icon: FolderIcon, strokeWidth: 2 }),
    path: "/notes/folder/$folderId",
    params: { folderId: folder.id },
  };
}

function folderChainCrumbs(
  folderId: string,
  folders: FolderEntry[] | undefined
): SidebarNavItem[] {
  if (!folders) {
    return [
      {
        title: "Folder",
        icon: createElement(HugeiconsIcon, {
          icon: FolderIcon,
          strokeWidth: 2,
        }),
        path: "/notes/folder/$folderId",
        params: { folderId },
      },
    ];
  }

  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain: FolderEntry[] = [];
  const seen = new Set<string>();
  let cursor: string | null = folderId;

  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const folder = byId.get(cursor);
    if (!folder) {
      break;
    }
    chain.unshift(folder);
    cursor = folder.parentId;
  }

  if (chain.length === 0) {
    return [
      {
        title: "Folder",
        icon: createElement(HugeiconsIcon, {
          icon: FolderIcon,
          strokeWidth: 2,
        }),
        path: "/notes/folder/$folderId",
        params: { folderId },
      },
    ];
  }

  return chain.map(folderCrumb);
}

export function useNotesBreadcrumbs(pathname: string): SidebarNavItem[] {
  const info = parseNotesPath(pathname);
  const detailSearch = useSearch({ strict: false }) as { from?: string };
  const fromInfo =
    info.noteId && detailSearch.from ? parseNotesPath(detailSearch.from) : {};

  const needsFolders = !!info.folderId || !!fromInfo.folderId;
  const needsTags = !!info.tagId || !!fromInfo.tagId;
  const needsNote = !!info.noteId;

  const foldersQuery = useQuery({
    ...orpc.notes.folders.list.queryOptions({ input: {} }),
    enabled: needsFolders,
  });
  const tagsQuery = useQuery({
    ...orpc.notes.tags.list.queryOptions(),
    enabled: needsTags,
  });
  const noteQuery = useQuery({
    ...orpc.notes.get.queryOptions({
      input: { id: info.noteId ?? "", includeArchived: true },
    }),
    enabled: needsNote,
  });

  function listCrumbs(i: NotesPathInfo): SidebarNavItem[] {
    if (i.folderId) {
      return folderChainCrumbs(i.folderId, foldersQuery.data);
    }
    if (i.tagId) {
      const tag = tagsQuery.data?.find((t) => t.id === i.tagId);
      return [
        {
          title: tag?.name ?? "Tag",
          icon: createElement(HugeiconsIcon, {
            icon: Tag01Icon,
            strokeWidth: 2,
          }),
          path: "/notes/tag/$tagId",
          params: { tagId: i.tagId },
        },
      ];
    }
    if (i.view) {
      return [
        {
          title: VIEW_TITLES[i.view],
          path: `/notes/${i.view}` as never,
        },
      ];
    }
    return [];
  }

  if (!info.noteId && info.view) {
    return [];
  }

  if (info.noteId) {
    return [
      ...listCrumbs(fromInfo),
      {
        title: noteQuery.data?.title || "Untitled",
        path: "/notes/$noteId",
        params: { noteId: info.noteId },
      },
    ];
  }

  return listCrumbs(info);
}
