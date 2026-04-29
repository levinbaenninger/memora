"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@memora/ui/components/sidebar";
import type {
  AppLinkRenderer,
  SidebarNavGroup,
  SidebarNavItem,
} from "@/modules/app/routes";
import { CustomSidebarTrigger } from "@/modules/app/ui/components/custom-sidebar-trigger";
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
  const { setOpen, setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="relative h-12 p-2">
        <SidebarMenuButton
          className="absolute top-2 left-2 w-[calc(var(--sidebar-width)-1rem)] transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0 md:w-[calc(var(--sidebar-width)-4rem)]"
          onClick={closeSidebar}
          render={renderLink("/dashboard")}
        >
          <LogoIcon className="text-primary" />
          <span className="font-medium">Memora</span>
        </SidebarMenuButton>
        <CustomSidebarTrigger className="absolute top-2 right-2 hidden size-8 transition-[right] duration-200 ease-linear group-data-[collapsible=icon]:right-2.5 md:inline-flex" />
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
