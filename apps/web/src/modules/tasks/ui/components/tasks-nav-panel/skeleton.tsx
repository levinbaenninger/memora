import { Skeleton } from "@memora/ui/components/skeleton";

export function TasksNavSkeleton() {
  return (
    <div className="space-y-1.5 px-2 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
        <Skeleton className="h-6 w-full rounded-md" key={i} />
      ))}
    </div>
  );
}
