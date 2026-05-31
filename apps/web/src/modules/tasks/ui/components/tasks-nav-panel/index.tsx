import { ScrollArea } from "@memora/ui/components/scroll-area";

import { TaskTagList } from "./tag-list";

export function TasksNavPanel() {
  return (
    <ScrollArea className="flex-1">
      <div className="py-2">
        <TaskTagList />
      </div>
    </ScrollArea>
  );
}
