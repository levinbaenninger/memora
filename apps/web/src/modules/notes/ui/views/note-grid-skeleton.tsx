import type { ReactNode } from "react";

import { Skeleton } from "@memora/ui/components/skeleton";

interface NoteGridSkeletonProps {
  title?: string;
  titleIcon?: ReactNode;
}

export function NoteGridSkeleton({ title, titleIcon }: NoteGridSkeletonProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 font-semibold text-2xl [&>svg]:size-5">
          {titleIcon}
          {title ?? <Skeleton className="h-7 w-32" />}
        </h1>
        <Skeleton className="h-8 w-24" />
      </div>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(14rem, 100%), 1fr))",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function NoteCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
