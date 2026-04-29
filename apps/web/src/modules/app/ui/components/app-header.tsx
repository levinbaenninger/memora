"use client";

import { Separator } from "@memora/ui/components/separator";
import type { AppLinkRenderer, SidebarNavItem } from "@/modules/app/routes";
import { AppBreadcrumbs } from "@/modules/app/ui/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/modules/app/ui/components/custom-sidebar-trigger";
import type { UserButtonProps } from "./user/user-button";
import { UserButton } from "./user/user-button";

export function AppHeader({
  breadcrumbItems,
  renderLink,
  user,
}: {
  breadcrumbItems: SidebarNavItem[];
  renderLink: AppLinkRenderer;
  user?: UserButtonProps["user"];
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger className="md:hidden" />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center md:hidden"
          orientation="vertical"
        />
        <AppBreadcrumbs items={breadcrumbItems} renderLink={renderLink} />
      </div>
      <UserButton size="icon" user={user} />
    </header>
  );
}
