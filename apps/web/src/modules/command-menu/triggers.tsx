"use client";

import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import type { FocusEvent, MouseEvent } from "react";

import { Button } from "@memora/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@memora/ui/components/input-group";
import { Kbd, KbdGroup } from "@memora/ui/components/kbd";
import { SidebarGroup, useSidebar } from "@memora/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@memora/ui/components/tooltip";

import { useCommandMenu } from "./context";

const HOTKEY = "Mod+K";

export function CommandMenuSidebarTrigger() {
  const { setOpen, query } = useCommandMenu();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const hotkeyParts = formatForDisplay(HOTKEY, { separatorToken: " " }).split(
    " "
  );

  const openPalette = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    setOpen(true);
  };

  const onFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.blur();
    openPalette();
  };

  const onCollapsedClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    openPalette();
  };

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarGroup>
        <Button
          aria-label="Open command menu"
          className="size-8"
          onClick={onCollapsedClick}
          size="icon"
          variant="ghost"
        >
          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
        </Button>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <InputGroup className="h-9 rounded-md border-input/40 bg-input/30 shadow-none!">
        <InputGroupAddon>
          <HugeiconsIcon
            className="size-4 shrink-0 opacity-60"
            icon={SearchIcon}
            strokeWidth={2}
          />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search"
          onFocus={onFocus}
          placeholder="Search…"
          readOnly
          value={query}
        />
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            {hotkeyParts.map((part) => (
              <Kbd key={part}>{part}</Kbd>
            ))}
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
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
