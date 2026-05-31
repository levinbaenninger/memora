import { Button } from "@memora/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@memora/ui/components/select";
import { cn } from "@memora/ui/lib/utils";

import { type TaskStatus, useTaskTags } from "@/modules/tasks/queries";
import { TaskTagsManager } from "./task-tags-manager";

const STATUSES: { label: string; value: TaskStatus }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

const ALL_TAGS = "__all__";

interface TaskFilterBarProps {
  onStatusChange: (status: TaskStatus) => void;
  onTagChange: (tagId: string | null) => void;
  status: TaskStatus;
  tagId: string | null;
}

export function TaskFilterBar({
  status,
  tagId,
  onStatusChange,
  onTagChange,
}: TaskFilterBarProps) {
  const { data: tags } = useTaskTags();
  const activeTag = tags.find((t) => t.id === tagId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border p-0.5">
        {STATUSES.map((s) => (
          <Button
            className={cn("h-7", status === s.value && "bg-accent")}
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            size="sm"
            variant={status === s.value ? "secondary" : "ghost"}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Select
        onValueChange={(v) => onTagChange(v === ALL_TAGS ? null : v)}
        value={tagId ?? ALL_TAGS}
      >
        <SelectTrigger className="h-8 w-40 dark:bg-transparent dark:hover:bg-transparent">
          <SelectValue>
            {activeTag ? `#${activeTag.name}` : "All tags"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          <SelectItem value={ALL_TAGS}>All tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              #{tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <TaskTagsManager />
      </div>
    </div>
  );
}
