import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { createElement } from "react";

import type { SidebarNavItem } from "@/modules/app/routes";
import { orpc } from "@/utils/orpc";

const VIEW_TITLES: Record<string, string> = {
  completed: "Completed",
  all: "All Tasks",
};

interface TasksPathInfo {
  tagId?: string;
  view?: keyof typeof VIEW_TITLES;
}

function parseTasksPath(pathname: string): TasksPathInfo {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "tasks") {
    return {};
  }

  const second = segments[1];
  const third = segments[2];

  if (!second) {
    return {};
  }
  if (second === "tag" && third) {
    return { tagId: third };
  }
  if (second in VIEW_TITLES) {
    return { view: second as keyof typeof VIEW_TITLES };
  }
  return {};
}

export function useTasksBreadcrumbs(pathname: string): SidebarNavItem[] {
  const info = parseTasksPath(pathname);
  const needsTags = !!info.tagId;

  const tagsQuery = useQuery({
    ...orpc.tasks.tags.list.queryOptions(),
    enabled: needsTags,
  });

  if (info.view) {
    return [];
  }

  if (info.tagId) {
    const tag = tagsQuery.data?.find((t) => t.id === info.tagId);
    return [
      {
        title: tag?.name ?? "Tag",
        icon: createElement(HugeiconsIcon, {
          icon: Tag01Icon,
          strokeWidth: 2,
        }),
        path: "/tasks/tag/$tagId",
        params: { tagId: info.tagId },
      },
    ];
  }

  return [];
}
