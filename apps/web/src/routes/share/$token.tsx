import type { PartialBlock } from "@blocknote/core";
import { isDefinedError, ORPCError } from "@orpc/client";
import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  PublicShareError,
  PublicShareNotFound,
  PublicShareSkeleton,
  PublicShareView,
} from "@/modules/sharing/ui/views/public-share-view";

export const Route = createFileRoute("/share/$token")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        context.orpc.notes.shares.getPublic.queryOptions({
          input: { token: params.token },
        })
      );
    } catch (e) {
      if (
        e instanceof ORPCError &&
        isDefinedError(e) &&
        e.code === "NOT_FOUND"
      ) {
        throw notFound();
      }
      throw e;
    }
  },
  head: ({ loaderData }) => {
    const title =
      (loaderData as { title?: string } | undefined)?.title || "Shared note";
    return {
      meta: [
        { title: `${title} | Memora` },
        { name: "robots", content: "noindex,nofollow" },
        { name: "referrer", content: "no-referrer" },
      ],
    };
  },
  component: PublicShareRoute,
  pendingComponent: PublicShareSkeleton,
  notFoundComponent: PublicShareNotFound,
  errorComponent: PublicShareError,
});

function PublicShareRoute() {
  const data = Route.useLoaderData();
  return (
    <PublicShareView
      content={data.content as PartialBlock[]}
      ownerName={data.ownerName}
      title={data.title}
      updatedAt={data.updatedAt}
    />
  );
}
