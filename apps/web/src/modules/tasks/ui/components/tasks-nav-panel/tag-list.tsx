import { useLocation, useNavigate } from "@tanstack/react-router";

import { TagNavList } from "@/components/tag-nav-list";
import { useDeleteTaskTag, useUpdateTaskTag } from "@/modules/tasks/mutations";
import { useTaskTagsList } from "@/modules/tasks/queries";

export function TaskTagList() {
  const { data: tags } = useTaskTagsList();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const deleteTag = useDeleteTaskTag();
  const updateTag = useUpdateTaskTag();

  return (
    <TagNavList
      entityName="tasks"
      isActive={(tagId) => pathname === `/tasks/tag/${tagId}`}
      onDelete={(tag) => {
        if (pathname === `/tasks/tag/${tag.id}`) {
          navigate({ to: "/tasks" });
        }
        deleteTag.mutate({ id: tag.id });
      }}
      onNavigateHome={() => navigate({ to: "/tasks" })}
      onNavigateToTag={(tagId) =>
        navigate({ to: "/tasks/tag/$tagId", params: { tagId } })
      }
      onRename={(id, name) => updateTag.mutate({ id, name })}
      tags={tags}
    />
  );
}
