import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { tasksListInput } from "@/modules/tasks/queries";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

const searchSchema = z.object({
  status: z.enum(["active", "completed", "all"]).optional(),
  tag: z.string().optional(),
});

export const Route = createFileRoute("/_app/tasks")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    status: search.status ?? "active",
    tag: search.tag,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      context.orpc.tasks.list.queryOptions({
        input: tasksListInput({
          status: deps.status,
          tagId: deps.tag,
          sort: deps.status === "completed" ? "updatedAt" : "dueAt",
        }),
      })
    ),
  head: () => ({
    meta: [{ title: "Tasks | Memora" }],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { status = "active", tag } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <TaskListView
      onStatusChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, status: next }) })
      }
      onTagChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, tag: next ?? undefined }) })
      }
      status={status}
      tagId={tag ?? null}
    />
  );
}
