import { Kbd, KbdGroup } from "@memora/ui/components/kbd";
import { SidebarTrigger } from "@memora/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@memora/ui/components/tooltip";

export function CustomSidebarTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger delay={1000} render={<SidebarTrigger />} />
      <TooltipContent className="px-2 py-1" side="right">
        Toggle Sidebar{" "}
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>b</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}
