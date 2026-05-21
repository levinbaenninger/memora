import { Skeleton } from "@memora/ui/components/skeleton";

export function NoteEditorSkeleton() {
  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 pt-6">
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex flex-wrap items-center gap-2 py-3">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-3 border-t pt-4">
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-5/6 max-w-2xl" />
          <Skeleton className="h-4 w-2/3 max-w-2xl" />
          <Skeleton className="h-4 w-4/5 max-w-2xl" />
          <Skeleton className="h-4 w-3/5 max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-1/2 max-w-2xl" />
        </div>
      </div>
    </div>
  );
}
