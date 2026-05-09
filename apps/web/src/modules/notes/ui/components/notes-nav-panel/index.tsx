import { ScrollArea } from "@memora/ui/components/scroll-area";

import { FolderTree } from "./folder-tree";
import { TagList } from "./tag-list";

export function NotesNavPanel() {
  return (
    <ScrollArea className="flex-1">
      <div className="py-2">
        <FolderTree />
        <TagList />
      </div>
    </ScrollArea>
  );
}
