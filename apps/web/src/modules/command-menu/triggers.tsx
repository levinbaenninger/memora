"use client";

import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatForDisplay } from "@tanstack/react-hotkeys";

import { Button } from "@memora/ui/components/button";
import { Kbd, KbdGroup } from "@memora/ui/components/kbd";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@memora/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@memora/ui/components/tooltip";

import { useCommandMenu } from "./context";

const HOTKEY = "Mod+K";

export function CommandMenuSidebarTrigger() {
  const { setOpen } = useCommandMenu();
  const { isMobile, setOpenMobile } = useSidebar();
  const hotkeyParts = formatForDisplay(HOTKEY, { separatorToken: " " }).split(
    " "
  );

  const onClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    setOpen(true);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onClick} tooltip="Search">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
            <span>Search</span>
            <KbdGroup className="ml-auto group-data-[collapsible=icon]:hidden">
              {hotkeyParts.map((part) => (
                <Kbd key={part}>{part}</Kbd>
              ))}
            </KbdGroup>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function CommandMenuMobileTrigger({
  className,
}: {
  className?: string;
}) {
  const { setOpen } = useCommandMenu();

  return (
    <Tooltip>
      <TooltipTrigger
        delay={300}
        render={
          <Button
            aria-label="Open command menu"
            className={className}
            onClick={() => setOpen(true)}
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
          </Button>
        }
      />
      <TooltipContent side="bottom">Search</TooltipContent>
    </Tooltip>
  );
}
