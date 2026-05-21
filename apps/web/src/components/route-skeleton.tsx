import { Skeleton } from "@memora/ui/components/skeleton";

export function RouteSkeleton() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-48" />
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
          <Skeleton className="h-32 rounded-lg" key={i} />
        ))}
      </div>
    </div>
  );
}
