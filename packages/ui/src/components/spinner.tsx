import { cn } from "@memora/ui/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

function Spinner({ className, strokeWidth, ...props }: React.ComponentProps<"svg">) {
  let resolvedStroke = typeof strokeWidth === "number" ? strokeWidth : 2

  if (typeof strokeWidth === "string") {
    const parsed = Number.parseFloat(strokeWidth)
    resolvedStroke = Number.isNaN(parsed) ? 2 : parsed
  }

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
