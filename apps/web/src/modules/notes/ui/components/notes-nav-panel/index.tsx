import { Suspense } from "react";

import { ScrollArea } from "@memora/ui/components/scroll-area";

import { FolderTree } from "./folder-tree";
import { NotesNavSkeleton } from "./notes-nav-skeleton";
import { TagList } from "./tag-list";

export function NotesNavPanel() {
  return (
    <ScrollArea className="flex-1">
      <div className="py-2">
        <Suspense fallback={<NotesNavSkeleton />}>
          <FolderTree />
          <TagList />
        </Suspense>
      </div>
    </ScrollArea>
  );
}
