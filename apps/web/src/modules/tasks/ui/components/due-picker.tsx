import { Calendar01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useState } from "react";

import { Button } from "@memora/ui/components/button";
import { Calendar } from "@memora/ui/components/calendar";
import { Input } from "@memora/ui/components/input";
import { Label } from "@memora/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@memora/ui/components/popover";
import { cn } from "@memora/ui/lib/utils";

import { dueHasTime, formatDue } from "@/modules/tasks/lib/dates";

interface DuePickerProps {
  onChange: (value: Date | null) => void;
  value: Date | null;
}

export function DuePicker({ value, onChange }: DuePickerProps) {
  const [open, setOpen] = useState(false);

  const timeValue = value && dueHasTime(value) ? format(value, "HH:mm") : "";

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) {
      onChange(null);
      return;
    }
    // Preserve any time already chosen; otherwise keep it date-only (midnight).
    const next = new Date(day);
    if (value && dueHasTime(value)) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      next.setHours(0, 0, 0, 0);
    }
    onChange(next);
  };

  const handleTimeChange = (raw: string) => {
    const base = value ? new Date(value) : new Date();
    if (!raw) {
      // Cleared time → fall back to date-only.
      base.setHours(0, 0, 0, 0);
      onChange(base);
      return;
    }
    const [h, m] = raw.split(":").map(Number);
    base.setHours(h, m, 0, 0);
    onChange(base);
  };

  const clear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "w-full justify-start font-normal",
              !value && "text-muted-foreground"
            )}
            type="button"
            variant="outline"
          />
        }
      >
        <HugeiconsIcon
          className="size-4"
          icon={Calendar01Icon}
          strokeWidth={2}
        />
        {value ? formatDue(value) : "Set due date"}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          mode="single"
          onSelect={handleSelectDay}
          selected={value ?? undefined}
        />
        <div className="flex items-center gap-2 border-t p-3">
          <Label className="text-muted-foreground text-xs" htmlFor="due-time">
            Time
          </Label>
          <Input
            className="h-8 flex-1"
            id="due-time"
            onChange={(e) => handleTimeChange(e.target.value)}
            type="time"
            value={timeValue}
          />
          {value ? (
            <Button
              onClick={clear}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon
                className="size-4"
                icon={Cancel01Icon}
                strokeWidth={2}
              />
              <span className="sr-only">Clear due date</span>
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
