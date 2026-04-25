import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
} from "@memora/ui/components/sidebar";
import type { AppLinkRenderer, SidebarNavGroup } from "@/modules/app/routes";

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
          <Collapsible
            className="group/collapsible"
            defaultOpen={
              !!item.isActive || item.subItems?.some((i) => !!i.isActive)
            }
            key={`${item.title}-${item.isActive ? "active" : "idle"}`}
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
                          render={
                            subItem.path ? renderLink(subItem.path) : undefined
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
                render={item.path ? renderLink(item.path) : undefined}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            )}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
