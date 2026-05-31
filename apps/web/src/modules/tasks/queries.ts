import { useSuspenseQuery } from "@tanstack/react-query";

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

export function tasksListInput(params: TasksListParams) {
  const { tagId, view, limit = 50, offset = 0 } = params;
  return {
    completed: viewToCompleted(view),
    tagId: tagId ?? undefined,
    limit,
    offset,
  };
}

export function useTasksList(params: TasksListParams) {
  return useSuspenseQuery(
    orpc.tasks.list.queryOptions({
      input: tasksListInput(params),
    })
  );
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
