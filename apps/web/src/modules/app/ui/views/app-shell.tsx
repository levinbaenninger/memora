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
import { CommandMenu } from "@/modules/command-menu/command-menu";
import { CommandMenuProvider } from "@/modules/command-menu/context";
import { useGlobalHotkeys } from "@/modules/command-menu/hooks/use-global-hotkeys";
import { useNotesBreadcrumbs } from "@/modules/notes/hooks/use-notes-breadcrumbs";
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
  const baseBreadcrumbItems = getBreadcrumbItems(pathname);
  const notesBreadcrumbs = useNotesBreadcrumbs(pathname);
  const breadcrumbItems = [...baseBreadcrumbItems, ...notesBreadcrumbs];
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
    <CommandMenuProvider>
      <SidebarProvider>
        <AppSidebar
          footerNavLinks={footerNavLinks}
          navGroups={navGroups}
          renderLink={renderLink}
        />
        <SidebarInset className="fade-in slide-in-from-bottom-2 min-w-0 animate-in px-16 py-4 duration-500 ease-out md:py-6">
          <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col">
            <AppHeader
              breadcrumbItems={breadcrumbItems}
              renderLink={renderLink}
              user={user}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
              {children}
            </div>
          </div>
        </SidebarInset>
        <CommandMenu />
        <GlobalHotkeysMount />
      </SidebarProvider>
    </CommandMenuProvider>
  );
}

function GlobalHotkeysMount() {
  useGlobalHotkeys();
  return null;
}
