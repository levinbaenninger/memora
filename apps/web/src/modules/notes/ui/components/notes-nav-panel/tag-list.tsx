import { useLocation, useNavigate } from "@tanstack/react-router";

import { TagNavList } from "@/components/tag-nav-list";
import { useDeleteTag, useUpdateTag } from "@/modules/notes/mutations";
import { useTagsList } from "@/modules/notes/queries";

export function TagList() {
  const { data: tags } = useTagsList();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const deleteTag = useDeleteTag();
  const updateTag = useUpdateTag();

  return (
    <TagNavList
      entityName="notes"
      isActive={(tagId) => pathname === `/notes/tag/${tagId}`}
      onDelete={(tag) => {
        if (pathname === `/notes/tag/${tag.id}`) {
          navigate({ to: "/notes" });
        }
        deleteTag.mutate(tag.id);
      }}
      onNavigateHome={() => navigate({ to: "/notes" })}
      onNavigateToTag={(tagId) =>
        navigate({ to: "/notes/tag/$tagId", params: { tagId } })
      }
      onRename={(id, name) => updateTag.mutate({ id, name })}
      tags={tags}
    />
  );
}
