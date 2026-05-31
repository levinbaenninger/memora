import { useHotkey, useHotkeySequence } from "@tanstack/react-hotkeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { useCreateNote } from "@/modules/notes/mutations";
import { useCompleteTask, useDeleteTask } from "@/modules/tasks/mutations";
import { useTasksStore } from "@/modules/tasks/store";
import { client, orpc } from "@/utils/orpc";
import { useTagsForPalette } from "./use-eager-entities";
import { useRouteEntityContext } from "./use-route-context";

const OPTS = { ignoreInputs: true } as const;
const SEQUENCE_OPTS = { ignoreInputs: true, timeout: 1000 } as const;

export function useGlobalHotkeys() {
  const navigate = useNavigate();
  const { noteId, folderId, tagId } = useRouteEntityContext();
  const tags = useTagsForPalette().data ?? [];
  const queryClient = useQueryClient();
  const createNote = useCreateNote();
  const { openTaskId, setOpenTaskId, setCreateDialogOpen } = useTasksStore();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  const noteQuery = useQuery({
    ...orpc.notes.get.queryOptions({
      input: { id: noteId ?? "", includeArchived: true },
    }),
    enabled: !!noteId,
  });
  const note = noteQuery.data;

  const taskQuery = useQuery({
    ...orpc.tasks.get.queryOptions({ input: { id: openTaskId ?? "" } }),
    enabled: !!openTaskId,
  });
  const openTask = taskQuery.data;

  const invalidateNote = () => {
    if (!noteId) {
      return;
    }
    queryClient.invalidateQueries({
      queryKey: orpc.notes.get.key({ input: { id: noteId } }),
    });
    queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
    queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
  };

  const update = useMutation({
    mutationFn: (input: { pinned?: boolean; favorite?: boolean }) =>
      client.notes.update({ id: noteId ?? "", ...input }),
    onSuccess: (_data, variables) => {
      if (noteId) {
        queryClient.invalidateQueries({
          queryKey: orpc.notes.get.key({ input: { id: noteId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      }
      if (variables.favorite !== undefined) {
        toast.success(variables.favorite ? "Favorited" : "Unfavorited");
      }
      if (variables.pinned !== undefined) {
        toast.success(variables.pinned ? "Pinned" : "Unpinned");
      }
    },
    onError: () => toast.error("Failed to update note"),
  });

  const archive = useMutation({
    mutationFn: () => client.notes.archive({ id: noteId ?? "" }),
    onSuccess: () => {
      if (noteId) {
        queryClient.invalidateQueries({
          queryKey: orpc.notes.get.key({ input: { id: noteId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      }
      toast.success("Note archived", {
        action: {
          label: "Undo",
          onClick: () => {
            client.notes
              .restore({ id: noteId ?? "" })
              .then(() => {
                invalidateNote();
                toast.success("Note restored");
              })
              .catch(() => toast.error("Failed to restore note"));
          },
        },
      });
    },
    onError: () => toast.error("Failed to archive note"),
  });

  useHotkey(
    "Mod+N",
    (event) => {
      event.preventDefault();
      const activeTag = tagId ? tags.find((tag) => tag.id === tagId) : null;
      createNote.mutate({
        title: "Untitled",
        content: [],
        folderId: folderId ?? undefined,
        tagNames: activeTag ? [activeTag.name] : [],
      });
    },
    OPTS
  );

  useHotkey(
    "Mod+Shift+F",
    (event) => {
      if (!note) {
        return;
      }
      event.preventDefault();
      update.mutate({ favorite: !note.favorite });
    },
    { ...OPTS, enabled: !!note }
  );

  useHotkey(
    "Mod+Shift+P",
    (event) => {
      if (!note) {
        return;
      }
      event.preventDefault();
      update.mutate({ pinned: !note.pinned });
    },
    { ...OPTS, enabled: !!note }
  );

  useHotkey(
    "Mod+Backspace",
    (event) => {
      if (!note || note.archivedAt) {
        return;
      }
      event.preventDefault();
      archive.mutate();
    },
    { ...OPTS, enabled: !!note }
  );

  useHotkey(
    "Mod+T",
    (event) => {
      event.preventDefault();
      setCreateDialogOpen(true);
    },
    OPTS
  );

  useHotkey(
    "Mod+Enter",
    (event) => {
      if (!openTask) {
        return;
      }
      event.preventDefault();
      completeTask.mutate({
        id: openTaskId ?? "",
        completed: !openTask.completedAt,
      });
    },
    { ...OPTS, enabled: !!openTaskId }
  );

  useHotkey(
    "Mod+Backspace",
    (event) => {
      if (!openTask || noteId) {
        return;
      }
      event.preventDefault();
      deleteTask.mutate(
        { id: openTaskId ?? "" },
        { onSuccess: () => setOpenTaskId(null) }
      );
    },
    { ...OPTS, enabled: !!openTaskId && !noteId }
  );

  useHotkeySequence(
    ["G", "N"],
    () => navigate({ to: "/notes" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "P"],
    () => navigate({ to: "/notes/pinned" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "F"],
    () => navigate({ to: "/notes/favorites" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "A"],
    () => navigate({ to: "/notes/archived" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "D"],
    () => navigate({ to: "/dashboard" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "T"],
    () => navigate({ to: "/tasks" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "C"],
    () => navigate({ to: "/tasks/completed" }),
    SEQUENCE_OPTS
  );
  useHotkeySequence(
    ["G", "L"],
    () => navigate({ to: "/tasks/all" }),
    SEQUENCE_OPTS
  );
}
