import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export type TaskStatus = "active" | "completed" | "all";

export interface TasksListParams {
  dueAfter?: Date;
  dueBefore?: Date;
  limit?: number;
  offset?: number;
  sort?: "dueAt" | "updatedAt";
  status?: TaskStatus;
  tagId?: string | null;
}

export function tasksListInput(params: TasksListParams) {
  const {
    status = "active",
    tagId,
    sort = "dueAt",
    dueBefore,
    dueAfter,
    limit = 100,
    offset = 0,
  } = params;

  return {
    completed: status === "all" ? undefined : status === "completed",
    tagId: tagId ?? undefined,
    sort,
    dueBefore,
    dueAfter,
    limit,
    offset,
  };
}

export function useTasksList(params: TasksListParams) {
  return useQuery(
    orpc.tasks.list.queryOptions({ input: tasksListInput(params) })
  );
}

export function useTask(id: string | null) {
  return useQuery({
    ...orpc.tasks.get.queryOptions({ input: { id: id ?? "" } }),
    enabled: !!id,
  });
}

export function useTaskTags() {
  return useSuspenseQuery(orpc.tasks.tags.list.queryOptions());
}
