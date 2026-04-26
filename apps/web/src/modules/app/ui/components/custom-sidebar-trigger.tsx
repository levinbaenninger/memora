import { Kbd, KbdGroup } from "@memora/ui/components/kbd";
import { SidebarTrigger } from "@memora/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@memora/ui/components/tooltip";
import { formatForDisplay } from "@tanstack/react-hotkeys";

const SIDEBAR_TRIGGER_HOTKEY = "Mod+B";

export function CustomSidebarTrigger({ className }: { className?: string }) {
  const hotkeyParts = formatForDisplay(SIDEBAR_TRIGGER_HOTKEY, {
    separatorToken: " ",
  }).split(" ");

  return (
    <Tooltip>
      <TooltipTrigger
        delay={300}
        render={<SidebarTrigger className={className} />}
      />
      <TooltipContent className="px-2 py-1" side="right">
        Toggle Sidebar{" "}
        <KbdGroup>
          {hotkeyParts.map((part) => (
            <Kbd key={part}>{part}</Kbd>
          ))}
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}
