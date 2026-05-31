import { formatForDisplay } from "@tanstack/react-hotkeys";

import { Kbd, KbdGroup } from "@memora/ui/components/kbd";
import { cn } from "@memora/ui/lib/utils";

const WHITESPACE = /\s+/;

interface ShortcutProps {
  className?: string;
  /**
   * A hotkey string ("Mod+Shift+P") or a space-separated sequence ("g d").
   * Each space-separated part renders as its own key, formatted for the
   * current platform (⌘ on macOS, Ctrl on Windows/Linux).
   */
  keys: string;
}

export function Shortcut({ keys, className }: ShortcutProps) {
  const parts = keys.trim().split(WHITESPACE);

  return (
    <KbdGroup className={cn("ml-auto", className)}>
      {parts.map((part) => (
        <Kbd key={part}>{formatForDisplay(part)}</Kbd>
      ))}
    </KbdGroup>
  );
}
