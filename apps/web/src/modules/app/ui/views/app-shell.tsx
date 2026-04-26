import { SidebarInset, SidebarProvider } from "@memora/ui/components/sidebar";
import {
  type AppLinkRenderer,
  getBreadcrumbItems,
  getFooterNavLinks,
  getNavGroups,
} from "@/modules/app/routes";
import { AppHeader } from "@/modules/app/ui/components/app-header";
import { AppSidebar } from "@/modules/app/ui/components/app-sidebar";
import type { UserButtonProps } from "@/modules/app/ui/components/user/user-button";

interface AppShellProps {
  children: React.ReactNode;
  pathname: string;
  renderLink: AppLinkRenderer;
  user?: UserButtonProps["user"];
}

export function AppShell({
  children,
  pathname,
  renderLink,
  user,
}: AppShellProps) {
  const breadcrumbItems = getBreadcrumbItems(pathname);
  const navGroups = getNavGroups(pathname);
  const footerNavLinks = getFooterNavLinks(pathname);

  return (
    <SidebarProvider>
      <AppSidebar
        footerNavLinks={footerNavLinks}
        navGroups={navGroups}
        renderLink={renderLink}
      />
      <SidebarInset className="p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <AppHeader
            breadcrumbItems={breadcrumbItems}
            renderLink={renderLink}
            user={user}
          />
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
