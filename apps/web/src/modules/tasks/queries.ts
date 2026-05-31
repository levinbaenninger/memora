import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export type TaskView = "active" | "completed" | "all";

export interface TasksListParams {
  limit?: number;
  offset?: number;
  tagId?: string | null;
  view: TaskView;
}

function viewToCompleted(view: TaskView): boolean | undefined {
  if (view === "active") {
    return false;
  }
  if (view === "completed") {
    return true;
  }
  return undefined;
}

export const TASK_LIMIT = 50;

export function tasksListInput(params: TasksListParams) {
  const { tagId, view, limit = TASK_LIMIT, offset = 0 } = params;
  return {
    completed: viewToCompleted(view),
    tagId: tagId ?? undefined,
    limit,
    offset,
  };
}

export function useTasksList(params: TasksListParams) {
  const result = useQuery(
    orpc.tasks.list.queryOptions({
      input: tasksListInput(params),
    })
  );

  return {
    tasks: result.data ?? [],
    isPending: result.isPending,
    isError: result.isError,
    error: result.error,
  };
}

export function useTask(id: string) {
  return useSuspenseQuery(
    orpc.tasks.get.queryOptions({
      input: { id },
    })
  );
}

export function useTaskTagsList() {
  return useSuspenseQuery(orpc.tasks.tags.list.queryOptions());
}
