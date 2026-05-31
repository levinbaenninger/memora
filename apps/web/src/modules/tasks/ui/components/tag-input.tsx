import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type KeyboardEvent, useState } from "react";

import { Badge } from "@memora/ui/components/badge";
import { Input } from "@memora/ui/components/input";

interface TagInputProps {
  onChange: (tags: string[]) => void;
  suggestions: string[];
  value: string[];
}

function normalize(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function TagInput({ value, onChange, suggestions }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const name = normalize(raw);
    if (!name) {
      return;
    }
    const exists = value.some((t) => t.toLowerCase() === name.toLowerCase());
    if (!exists) {
      onChange([...value, name]);
    }
    setDraft("");
  };

  const remove = (name: string) => {
    onChange(value.filter((t) => t !== name));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      remove(value.at(-1) as string);
    }
  };

  const selected = new Set(value.map((t) => t.toLowerCase()));
  const draftNorm = normalize(draft).toLowerCase();
  const matches = suggestions
    .filter((s) => !selected.has(s.toLowerCase()))
    .filter((s) => (draftNorm ? s.toLowerCase().includes(draftNorm) : true))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-transparent p-1.5">
        {value.map((tag) => (
          <Badge className="gap-1" key={tag} variant="secondary">
            #{tag}
            <button
              aria-label={`Remove ${tag}`}
              className="rounded-sm hover:text-foreground"
              onClick={() => remove(tag)}
              type="button"
            >
              <HugeiconsIcon
                className="size-3"
                icon={Cancel01Icon}
                strokeWidth={2}
              />
            </button>
          </Badge>
        ))}
        <Input
          className="h-6 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? "Add tags…" : ""}
          value={draft}
        />
      </div>
      {matches.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {matches.map((s) => (
            <button
              className="rounded-md border px-2 py-0.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
              key={s}
              onClick={() => add(s)}
              type="button"
            >
              #{s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
