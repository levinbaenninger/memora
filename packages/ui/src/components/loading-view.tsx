import { Spinner } from "@memora/ui/components/spinner"
import { cn } from "@memora/ui/lib/utils"

function LoadingView({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex h-full w-full items-center justify-center p-6", className)}
      {...props}
    >
      <Spinner className="size-6" />
    </div>
  )
}

export { LoadingView }
