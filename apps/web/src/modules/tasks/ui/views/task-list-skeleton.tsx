import { Skeleton } from "@memora/ui/components/skeleton";

export function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-8 w-full" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton className="h-12 w-full rounded-lg" key={i} />
        ))}
      </div>
    </div>
  );
}
