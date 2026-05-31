import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@memora/ui/components/button";
import { Input } from "@memora/ui/components/input";

import { useCreateTask } from "@/modules/tasks/mutations";

export function QuickAdd({ tagNames }: { tagNames?: string[] }) {
  const create = useCreateTask();
  const [title, setTitle] = useState("");

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed || create.isPending) {
      return;
    }
    create.mutate(
      { title: trimmed, tagNames: tagNames ?? [] },
      { onSuccess: () => setTitle("") }
    );
  };

  return (
    <div className="flex gap-2">
      <Input
        className="flex-1"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            submit();
          }
        }}
        placeholder="Add a task…"
        value={title}
      />
      <Button
        disabled={!title.trim() || create.isPending}
        onClick={submit}
        type="button"
      >
        <HugeiconsIcon className="size-4" icon={Add01Icon} strokeWidth={2} />
        Add
      </Button>
    </div>
  );
}
