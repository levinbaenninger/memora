import { Spinner } from "@memora/ui/components/spinner";

export function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
