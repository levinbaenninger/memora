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
import { NotesNavPanel } from "@/modules/notes/ui/components/notes-nav-panel";

interface AppShellProps {
  children: React.ReactNode;
  currentSearch?: Record<string, unknown>;
  pathname: string;
  renderLink: AppLinkRenderer;
  user?: UserButtonProps["user"];
}

export function AppShell({
  children,
  currentSearch,
  pathname,
  renderLink,
  user,
}: AppShellProps) {
  const breadcrumbItems = getBreadcrumbItems(pathname);
  const footerNavLinks = getFooterNavLinks(pathname);
  const isNotes = pathname.startsWith("/notes");

  const navGroups = getNavGroups(pathname, currentSearch).map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.path === "/notes"
        ? {
            ...item,
            contextualContent: isNotes ? <NotesNavPanel /> : undefined,
          }
        : item
    ),
  }));

  return (
    <SidebarProvider>
      <AppSidebar
        footerNavLinks={footerNavLinks}
        navGroups={navGroups}
        renderLink={renderLink}
      />
      <SidebarInset className={isNotes ? "overflow-hidden" : "p-4 md:p-6"}>
        {isNotes ? (
          <div className="flex h-full overflow-hidden">{children}</div>
        ) : (
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
            <AppHeader
              breadcrumbItems={breadcrumbItems}
              renderLink={renderLink}
              user={user}
            />
            <div className="flex flex-1 flex-col gap-4 overflow-hidden">
              {children}
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
