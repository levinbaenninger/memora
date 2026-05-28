import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

function invalidateShares(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({
    queryKey: orpc.notes.shares.list.key(),
  });
}

export function useCreateShare() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.notes.shares.create.mutationOptions({
      onSuccess: () => invalidateShares(queryClient),
      onError: (error) => {
        const msg =
          (error as { message?: string } | null)?.message ??
          "Failed to create share link";
        toast.error(msg);
      },
    })
  );
}

export function useRevokeShare() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.notes.shares.revoke.mutationOptions({
      onSuccess: () => {
        invalidateShares(queryClient);
        toast.success("Share link revoked");
      },
      onError: () => toast.error("Failed to revoke share link"),
    })
  );
}
