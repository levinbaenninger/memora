import { cn } from "@memora/ui/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

function Spinner({ className, strokeWidth, ...props }: React.ComponentProps<"svg">) {
  const resolvedStroke =
    typeof strokeWidth === "string"
      ? Number.parseFloat(strokeWidth) || 2
      : (strokeWidth ?? 2)
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={resolvedStroke}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
