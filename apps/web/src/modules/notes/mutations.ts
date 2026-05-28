import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { client, orpc } from "@/utils/orpc";
import { useNotesStore } from "./store";

function useNotesInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() }),
    invalidateSearch: () =>
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() }),
    invalidateNote: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: orpc.notes.get.key({ input: { id } }),
      }),
    invalidateFolders: () =>
      queryClient.invalidateQueries({
        queryKey: orpc.notes.folders.list.key(),
      }),
    invalidateTags: () =>
      queryClient.invalidateQueries({ queryKey: orpc.notes.tags.list.key() }),
    invalidateLinks: (id: string) => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.links.getOutbound.key({ input: { id } }),
      });
      queryClient.invalidateQueries({
        queryKey: orpc.notes.links.getBacklinks.key({ input: { id } }),
      });
    },
  };
}

export function useCreateNote() {
  const navigate = useNavigate();
  const inv = useNotesInvalidation();

  return useMutation(
    orpc.notes.create.mutationOptions({
      onSuccess: (note) => {
        inv.invalidateList();
        inv.invalidateSearch();
        navigate({
          to: "/notes/$noteId",
          params: { noteId: note.id },
        });
      },
      onError: () => toast.error("Failed to create note"),
    })
  );
}

export function useUpdateNote() {
  const { setSaveStatus } = useNotesStore();
  const inv = useNotesInvalidation();

  return useMutation(
    orpc.notes.update.mutationOptions({
      onMutate: () => {
        setSaveStatus("saving");
      },
      onSuccess: (note) => {
        setSaveStatus("saved");
        inv.invalidateList();
        inv.invalidateSearch();
        inv.invalidateTags();
        inv.invalidateNote(note.id);
        inv.invalidateLinks(note.id);
      },
      onError: (error) => {
        // Note hard-deleted between debounce and mutation — silently drop.
        const code = (error as { code?: string } | null)?.code;
        if (code === "NOT_FOUND") {
          setSaveStatus("idle");
          return;
        }
        setSaveStatus("error");
        toast.error("Failed to save note");
      },
    })
  );
}

export function useArchiveNote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.notes.archive({ id }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      queryClient.invalidateQueries({
        queryKey: orpc.notes.get.key({ input: { id } }),
      });
      navigate({ to: "/notes" });
      toast.success("Note archived");
    },
    onError: () => toast.error("Failed to archive note"),
  });
}

export function useRestoreNote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.notes.restore({ id }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      queryClient.invalidateQueries({
        queryKey: orpc.notes.get.key({ input: { id } }),
      });
      toast.success("Note restored");
      navigate({
        to: "/notes/$noteId",
        params: { noteId: id },
      });
    },
    onError: () => toast.error("Failed to restore note"),
  });
}

export function useDeleteNote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.notes.archive({ id });
      } catch (e) {
        // NOT_FOUND means already archived or never existed — proceed to hard delete.
        // Anything else (auth/network/server) bubbles up.
        const code = (e as { code?: string } | null)?.code;
        if (code !== "NOT_FOUND") {
          throw e;
        }
      }
      return client.notes.hardDelete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      navigate({ to: "/notes" });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });
}

export function useCreateFolder() {
  const inv = useNotesInvalidation();

  return useMutation(
    orpc.notes.folders.create.mutationOptions({
      onSuccess: () => {
        inv.invalidateFolders();
      },
      onError: () => toast.error("Failed to create folder"),
    })
  );
}

export function useUpdateFolder() {
  const inv = useNotesInvalidation();
  const router = useRouter();

  return useMutation(
    orpc.notes.folders.update.mutationOptions({
      onSuccess: () => {
        inv.invalidateFolders();
        router.invalidate();
      },
      onError: () => toast.error("Failed to rename folder"),
    })
  );
}

export function useArchiveFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.notes.folders.archive({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.folders.list.key(),
      });
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      toast.success("Folder archived");
    },
    onError: () => toast.error("Failed to archive folder"),
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.notes.folders.archive({ id });
      } catch (e) {
        const code = (e as { code?: string } | null)?.code;
        if (code !== "NOT_FOUND") {
          throw e;
        }
      }
      return client.notes.folders.hardDelete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.folders.list.key(),
      });
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      toast.success("Folder deleted");
    },
    onError: () => toast.error("Failed to delete folder"),
  });
}

export function useCreateTag() {
  const inv = useNotesInvalidation();

  return useMutation(
    orpc.notes.tags.create.mutationOptions({
      onSuccess: () => {
        inv.invalidateTags();
      },
      onError: () => toast.error("Failed to create tag"),
    })
  );
}

export function useUpdateTag() {
  const inv = useNotesInvalidation();
  const router = useRouter();

  return useMutation(
    orpc.notes.tags.update.mutationOptions({
      onSuccess: () => {
        inv.invalidateTags();
        inv.invalidateList();
        inv.invalidateSearch();
        router.invalidate();
      },
    })
  );
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.notes.tags.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.notes.tags.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      toast.success("Tag deleted");
    },
    onError: () => toast.error("Failed to delete tag"),
  });
}
