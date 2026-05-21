import { Skeleton } from "@memora/ui/components/skeleton";

export function NotesNavSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-2 py-2">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder
          <Skeleton className="h-6 w-full" key={`f-${i}`} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-12" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder
            <Skeleton className="h-5 w-14 rounded-full" key={`t-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
