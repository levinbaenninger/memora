import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@memora/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@memora/ui/components/sidebar";

import type {
  AppLinkRenderer,
  SidebarNavGroup,
  SidebarNavItem,
} from "@/modules/app/routes";

interface NavigationMenuItemProps {
  item: SidebarNavItem;
  renderLink: AppLinkRenderer;
}

function NavigationMenuItem({ item, renderLink }: NavigationMenuItemProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const shouldOpen =
    !!item.isActive || !!item.subItems?.some((i) => !!i.isActive);
  const [open, setOpen] = useState(shouldOpen);

  useEffect(() => {
    setOpen(shouldOpen);
  }, [shouldOpen]);

  const closeMobileSheet = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Collapsible
      className="group/collapsible"
      key={item.title}
      onOpenChange={setOpen}
      open={open}
      render={<SidebarMenuItem />}
    >
      {item.subItems?.length ? (
        <>
          <CollapsibleTrigger
            render={<SidebarMenuButton isActive={item.isActive} />}
          >
            {item.icon}
            <span>{item.title}</span>
            <HugeiconsIcon
              className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    isActive={subItem.isActive}
                    onClick={closeMobileSheet}
                    render={
                      subItem.path
                        ? renderLink(subItem.path, subItem.params)
                        : undefined
                    }
                  >
                    {subItem.icon}
                    <span>{subItem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      ) : (
        <SidebarMenuButton
          isActive={item.isActive}
          onClick={closeMobileSheet}
          render={item.path ? renderLink(item.path, item.params) : undefined}
        >
          {item.icon}
          <span>{item.title}</span>
        </SidebarMenuButton>
      )}
    </Collapsible>
  );
}

export function NavigationGroup({
  label,
  items,
  renderLink,
  className,
}: SidebarNavGroup & { renderLink: AppLinkRenderer; className?: string }) {
  return (
    <SidebarGroup className={className}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <NavigationMenuItem
            item={item}
            key={item.title}
            renderLink={renderLink}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
