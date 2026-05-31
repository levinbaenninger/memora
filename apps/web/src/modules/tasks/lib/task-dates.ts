export interface SortableTask {
  completedAt: Date | null;
  createdAt: Date;
  dueAt: Date | null;
  id: string;
}

export function sortTasks<T extends SortableTask>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    if (a.dueAt && b.dueAt) {
      return a.dueAt.getTime() - b.dueAt.getTime();
    }
    if (a.dueAt && !b.dueAt) {
      return -1;
    }
    if (!a.dueAt && b.dueAt) {
      return 1;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function isOverdue(
  task: Pick<SortableTask, "dueAt" | "completedAt">
): boolean {
  if (!task.dueAt || task.completedAt) {
    return false;
  }
  return task.dueAt < new Date();
}

export function formatDueDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dueDay.getTime() === today.getTime()) {
    return "Today";
  }
  if (dueDay.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }
  if (dueDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
