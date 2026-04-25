"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@memora/ui/components/sidebar";
import type {
  AppLinkRenderer,
  SidebarNavGroup,
  SidebarNavItem,
} from "@/modules/app/routes";
import { LogoIcon } from "@/modules/app/ui/components/logo";
import { NavigationGroup } from "@/modules/app/ui/components/navigation-group";

export function AppSidebar({
  footerNavLinks,
  navGroups,
  renderLink,
}: {
  footerNavLinks: SidebarNavItem[];
  navGroups: SidebarNavGroup[];
  renderLink: AppLinkRenderer;
}) {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="justify-center">
        <SidebarMenuButton render={renderLink("/dashboard")}>
          <LogoIcon />
          <span className="font-medium">Memora</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavigationGroup key={group.id} renderLink={renderLink} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavigationGroup
          className="p-0"
          id="footer"
          items={footerNavLinks}
          label=""
          renderLink={renderLink}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
