import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

function useTasksInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: orpc.tasks.list.key() }),
    invalidateTask: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.get.key({ input: { id } }),
      }),
    invalidateTags: () =>
      queryClient.invalidateQueries({ queryKey: orpc.tasks.tags.list.key() }),
  };
}

export function useCreateTask() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.create.mutationOptions({
      onSuccess: () => {
        inv.invalidateList();
        inv.invalidateTags();
      },
      onError: () => toast.error("Failed to create task"),
    })
  );
}

export function useUpdateTask() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.update.mutationOptions({
      onSuccess: (task) => {
        inv.invalidateList();
        inv.invalidateTask(task.id);
        inv.invalidateTags();
      },
      onError: () => toast.error("Failed to save task"),
    })
  );
}

export function useToggleTaskComplete() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.complete.mutationOptions({
      onSuccess: (task) => {
        inv.invalidateList();
        inv.invalidateTask(task.id);
      },
      onError: () => toast.error("Failed to update task"),
    })
  );
}

export function useDeleteTask() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.delete.mutationOptions({
      onSuccess: () => {
        inv.invalidateList();
        toast.success("Task deleted");
      },
      onError: () => toast.error("Failed to delete task"),
    })
  );
}

export function useCreateTaskTag() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.tags.create.mutationOptions({
      onSuccess: () => inv.invalidateTags(),
      onError: () => toast.error("Failed to create tag"),
    })
  );
}

export function useUpdateTaskTag() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.tags.update.mutationOptions({
      onSuccess: () => {
        inv.invalidateTags();
        inv.invalidateList();
      },
      onError: () => toast.error("Failed to rename tag"),
    })
  );
}

export function useDeleteTaskTag() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.tags.delete.mutationOptions({
      onSuccess: () => {
        inv.invalidateTags();
        inv.invalidateList();
        toast.success("Tag deleted");
      },
      onError: () => toast.error("Failed to delete tag"),
    })
  );
}
