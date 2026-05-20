"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@memora/ui/components/button";
import { Input } from "@memora/ui/components/input";

import { useCreateNote } from "@/modules/notes/mutations";

export function QuickCapture() {
  const createNote = useCreateNote();
  const [title, setTitle] = useState("");

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed || createNote.isPending) {
      return;
    }
    createNote.mutate({ title: trimmed, content: [] });
    setTitle("");
  };

  return (
    <div className="flex gap-2">
      <Input
        className="flex-1"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
        }}
        placeholder="Capture a thought…"
        value={title}
      />
      <Button
        disabled={!title.trim() || createNote.isPending}
        onClick={submit}
        type="button"
      >
        <HugeiconsIcon className="size-4" icon={Add01Icon} strokeWidth={2} />
        Create
      </Button>
    </div>
  );
}
