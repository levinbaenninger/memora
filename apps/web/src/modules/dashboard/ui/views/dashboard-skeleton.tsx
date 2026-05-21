import { Skeleton } from "@memora/ui/components/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </header>
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(14rem, 100%), 1fr))",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder
            <Skeleton className="h-32 rounded-lg" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
