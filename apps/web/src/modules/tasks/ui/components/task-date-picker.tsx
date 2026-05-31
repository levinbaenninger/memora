"use client";

import { Calendar01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@memora/ui/components/button";
import { Calendar } from "@memora/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@memora/ui/components/popover";
import { cn } from "@memora/ui/lib/utils";

interface TaskDatePickerProps {
  disabled?: boolean;
  onChange: (date: Date | null) => void;
  value: Date | null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function TaskDatePicker({
  value,
  onChange,
  disabled,
}: TaskDatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (day: Date | undefined) => {
    onChange(day ?? null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const isOverdue =
    value != null && value < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            className={cn(
              "h-8 w-full justify-start gap-2 px-2.5 font-normal",
              !value && "text-muted-foreground",
              isOverdue && "text-destructive"
            )}
            disabled={disabled}
            type="button"
            variant="outline"
          >
            <HugeiconsIcon
              className={cn(
                "size-3.5 shrink-0",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
              icon={Calendar01Icon}
              strokeWidth={2}
            />
            <span className="flex-1 text-left text-sm">
              {value ? formatDate(value) : "Pick a date"}
            </span>
            {value && (
              <button
                aria-label="Clear date"
                className="ml-auto flex size-4 items-center justify-center rounded-sm hover:bg-muted-foreground/20"
                onClick={handleClear}
                tabIndex={0}
                type="button"
              >
                <HugeiconsIcon
                  className="size-3"
                  icon={Cancel01Icon}
                  strokeWidth={2}
                />
              </button>
            )}
          </Button>
        )}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          onSelect={handleSelect}
          selected={value ?? undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
