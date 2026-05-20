"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@memora/ui/components/command";

import { useCommandMenu } from "./context";
import { jumpToItems } from "./jump-to-items";

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const navigate = useNavigate();

  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    setOpen(!open);
  });

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Jump to">
          {jumpToItems.map((item) => (
            <CommandItem
              key={item.id}
              keywords={item.keywords}
              onSelect={() =>
                run(() => {
                  // biome-ignore lint/suspicious/noExplicitAny: TanStack Router params type
                  navigate({ to: item.to, params: item.params as any });
                })
              }
              value={`${item.title} ${item.keywords.join(" ")}`}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
              <span>{item.title}</span>
              {item.shortcut ? (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
