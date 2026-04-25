import {
  ArchiveIcon,
  DashboardSquare01Icon,
  FolderLibraryIcon,
  InboxIcon,
  NoteIcon,
  Settings01Icon,
  StarIcon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createElement, type ReactElement, type ReactNode } from "react";

export interface SidebarNavItem {
  icon?: ReactNode;
  isActive?: boolean;
  matchPaths?: string[];
  path?: string;
  subItems?: SidebarNavItem[];
  title: string;
}

export interface SidebarNavGroup {
  items: SidebarNavItem[];
  label: string;
}

export type AppLinkRenderer = (to: string) => ReactElement;

function routeIcon(icon: Parameters<typeof HugeiconsIcon>[0]["icon"]) {
  return createElement(HugeiconsIcon, { icon, strokeWidth: 2 });
}

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: routeIcon(DashboardSquare01Icon),
      },
      {
        title: "Inbox",
        path: "/inbox",
        icon: routeIcon(InboxIcon),
      },
      {
        title: "Notes",
        path: "/notes",
        icon: routeIcon(NoteIcon),
      },
      {
        title: "Tasks",
        path: "/tasks",
        icon: routeIcon(Task01Icon),
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        title: "Projects",
        path: "/projects",
        icon: routeIcon(FolderLibraryIcon),
      },
      {
        title: "Favorites",
        path: "/favorites",
        icon: routeIcon(StarIcon),
      },
      {
        title: "Archive",
        path: "/archive",
        icon: routeIcon(ArchiveIcon),
      },
    ],
  },
];

export const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Settings",
    path: "/settings/account",
    matchPaths: ["/settings"],
    icon: routeIcon(Settings01Icon),
  },
];

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...footerNavLinks,
];

function isNavItemActive(item: SidebarNavItem, pathname: string) {
  const matchPaths = [item.path, ...(item.matchPaths ?? [])].filter(Boolean);

  return matchPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function getBreadcrumbItems(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      const subItem = item.subItems
        ?.filter((child) => isNavItemActive(child, pathname))
        .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];

      if (subItem) {
        return [item, subItem];
      }

      if (isNavItemActive(item, pathname)) {
        return [item];
      }
    }
  }

  const footerItem = footerNavLinks.find((item) =>
    isNavItemActive(item, pathname)
  );

  return footerItem ? [footerItem] : [];
}

export function getNavGroups(pathname: string) {
  return navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const subItems = item.subItems?.map((subItem) => ({
        ...subItem,
        isActive: isNavItemActive(subItem, pathname),
      }));

      return {
        ...item,
        isActive:
          isNavItemActive(item, pathname) ||
          !!subItems?.some((subItem) => subItem.isActive),
        subItems,
      };
    }),
  }));
}

export function getFooterNavLinks(pathname: string) {
  return footerNavLinks.map((item) => ({
    ...item,
    isActive: isNavItemActive(item, pathname),
  }));
}
