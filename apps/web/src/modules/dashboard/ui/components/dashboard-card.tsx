import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

import { Button } from "@memora/ui/components/button";

interface DashboardCardProps {
  addLabel: string;
  children: ReactNode;
  onAdd: () => void;
  title: string;
}

export function DashboardCard({
  title,
  onAdd,
  addLabel,
  children,
}: DashboardCardProps) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-medium text-sm">{title}</h2>
        <Button
          aria-label={addLabel}
          onClick={onAdd}
          size="icon-sm"
          variant="ghost"
        >
          <HugeiconsIcon className="size-4" icon={Add01Icon} strokeWidth={2} />
        </Button>
      </header>
      <div className="flex flex-col gap-3 p-3">{children}</div>
    </section>
  );
}
