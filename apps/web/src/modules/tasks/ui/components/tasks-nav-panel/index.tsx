import { Suspense } from "react";

import { ScrollArea } from "@memora/ui/components/scroll-area";

import { TasksNavSkeleton } from "./skeleton";
import { TaskTagList } from "./tag-list";

export function TasksNavPanel() {
  return (
    <ScrollArea className="flex-1">
      <div className="py-2">
        <Suspense fallback={<TasksNavSkeleton />}>
          <TaskTagList />
        </Suspense>
      </div>
    </ScrollArea>
  );
}
