import { Skeleton } from "@memora/ui/components/skeleton";

function NavGroupSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col">
      <div className="flex h-8 items-center px-2">
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="ms-3.5 flex flex-col gap-1 border-sidebar-border border-s py-1 ps-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder
          <Skeleton className="h-7 w-full" key={i} />
        ))}
      </div>
    </div>
  );
}

export function NotesNavSkeleton() {
  return (
    <div className="flex flex-col">
      <NavGroupSkeleton rows={3} />
      <NavGroupSkeleton rows={2} />
    </div>
  );
}
