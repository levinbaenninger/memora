import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

function useTasksInvalidation() {
  const queryClient = useQueryClient();

  return {
    queryClient,
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: orpc.tasks.list.key() }),
    invalidateTags: () =>
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.tags.list.key(),
      }),
    invalidateTask: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.get.key({ input: { id } }),
      }),
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
        inv.invalidateTags();
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

export function useCompleteTask() {
  const inv = useTasksInvalidation();
  const { queryClient } = inv;

  return useMutation(
    orpc.tasks.complete.mutationOptions({
      onMutate: async ({ id, completed = true }) => {
        await queryClient.cancelQueries({ queryKey: orpc.tasks.list.key() });
        await queryClient.cancelQueries({
          queryKey: orpc.tasks.get.key({ input: { id } }),
        });

        const listSnapshots = queryClient
          .getQueriesData<unknown[]>({ queryKey: orpc.tasks.list.key() })
          .map(([key, data]) => ({ key, data }));

        const taskKey = orpc.tasks.get.key({ input: { id } });
        const taskSnapshot = queryClient.getQueryData(taskKey);

        for (const { key } of listSnapshots) {
          queryClient.setQueryData<
            Array<{ id: string; completedAt: Date | null }>
          >(key, (old) => {
            if (!old) {
              return old;
            }
            return old.map((t) =>
              t.id === id
                ? { ...t, completedAt: completed ? new Date() : null }
                : t
            );
          });
        }

        queryClient.setQueryData<{ id: string; completedAt: Date | null }>(
          taskKey,
          (old) => {
            if (!old) {
              return old;
            }
            return { ...old, completedAt: completed ? new Date() : null };
          }
        );

        return { listSnapshots, taskSnapshot, taskKey };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.listSnapshots) {
          for (const { key, data } of ctx.listSnapshots) {
            queryClient.setQueryData(key, data);
          }
        }
        if (ctx?.taskKey) {
          queryClient.setQueryData(ctx.taskKey, ctx.taskSnapshot);
        }
        toast.error("Failed to update task");
      },
      onSettled: (_data, _err, { id }) => {
        inv.invalidateList();
        inv.invalidateTask(id);
      },
    })
  );
}

export function useCreateTaskTag() {
  const inv = useTasksInvalidation();

  return useMutation(
    orpc.tasks.tags.create.mutationOptions({
      onSuccess: () => {
        inv.invalidateTags();
      },
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
      onError: (err) => {
        const code = (err as { code?: string } | null)?.code;
        if (code === "CONFLICT") {
          toast.error("A tag with that name already exists");
          return;
        }
        toast.error("Failed to rename tag");
      },
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
