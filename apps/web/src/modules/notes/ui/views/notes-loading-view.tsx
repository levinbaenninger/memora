import { Skeleton } from "@memora/ui/components/skeleton";

export function NotesLoadingView() {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-3">
        {[100, 93, 86, 79, 72, 65].map((width) => (
          <Skeleton
            className="h-4 w-full"
            key={width}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  );
}
