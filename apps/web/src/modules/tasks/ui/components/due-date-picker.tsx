"use client";

import { CalendarIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
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

import { formatDueDate } from "../../lib/task-dates";

interface DueDatePickerProps {
  className?: string;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  value?: Date | null;
}

export function DueDatePicker({
  value,
  onChange,
  placeholder = "Set due date",
  className,
}: DueDatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            className={cn(
              "h-8 justify-start gap-2 px-2 font-normal",
              !value && "text-muted-foreground",
              className
            )}
            size="sm"
            type="button"
            variant="outline"
          >
            <HugeiconsIcon
              className="size-3.5 shrink-0"
              icon={CalendarIcon}
              strokeWidth={2}
            />
            <span className="truncate">
              {value ? formatDueDate(value) : placeholder}
            </span>
            {value ? (
              <button
                aria-label="Clear due date"
                className="-mr-0.5 ml-auto flex size-4 shrink-0 items-center justify-center rounded hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                type="button"
              >
                <HugeiconsIcon
                  className="size-3"
                  icon={Cancel01Icon}
                  strokeWidth={2}
                />
              </button>
            ) : null}
          </Button>
        )}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          onSelect={(date) => {
            onChange(date ?? null);
            setOpen(false);
          }}
          selected={value ?? undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
