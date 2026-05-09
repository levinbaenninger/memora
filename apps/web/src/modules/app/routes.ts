import {
  ArchiveIcon,
  DashboardSquare01Icon,
  FavouriteIcon,
  NoteIcon,
  PinIcon,
  Settings01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { LinkProps } from "@tanstack/react-router";
import { createElement, type ReactElement, type ReactNode } from "react";

type AppRouteTo = NonNullable<LinkProps["to"]>;
type AppRouteParams = LinkProps["params"];

export interface SidebarNavItem {
  contextualContent?: ReactNode;
  icon?: ReactNode;
  isActive?: boolean;
  matchPaths?: string[];
  params?: AppRouteParams;
  path?: AppRouteTo;
  search?: Record<string, unknown>;
  subItems?: SidebarNavItem[];
  title: string;
}

export interface SidebarNavGroup {
  id: string;
  items: SidebarNavItem[];
  label: string;
}

export type AppLinkRenderer = (
  to: AppRouteTo,
  params?: AppRouteParams,
  search?: Record<string, unknown>
) => ReactElement;

function routeIcon(icon: Parameters<typeof HugeiconsIcon>[0]["icon"]) {
  return createElement(HugeiconsIcon, { icon, strokeWidth: 2 });
}

const navGroups: SidebarNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: routeIcon(DashboardSquare01Icon),
      },
      {
        title: "Notes",
        path: "/notes",
        icon: routeIcon(NoteIcon),
        subItems: [
          {
            title: "All Notes",
            path: "/notes",
            search: { view: "all", folder: undefined, tag: undefined },
            icon: routeIcon(NoteIcon),
          },
          {
            title: "Pinned",
            path: "/notes",
            search: { view: "pinned", folder: undefined, tag: undefined },
            icon: routeIcon(PinIcon),
          },
          {
            title: "Favorites",
            path: "/notes",
            search: { view: "favorites", folder: undefined, tag: undefined },
            icon: routeIcon(FavouriteIcon),
          },
          {
            title: "Archive",
            path: "/notes",
            search: { view: "archived", folder: undefined, tag: undefined },
            icon: routeIcon(ArchiveIcon),
          },
        ],
      },
      {
        title: "Tasks",
        path: "/tasks",
        icon: routeIcon(Task01Icon),
      },
    ],
  },
];

const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Settings",
    path: "/settings/$path",
    params: { path: "account" },
    matchPaths: ["/settings", "/settings/account"],
    icon: routeIcon(Settings01Icon),
  },
];

function isNavItemActive(
  item: SidebarNavItem,
  pathname: string,
  currentSearch?: Record<string, unknown>
) {
  const matchPaths = [item.path, ...(item.matchPaths ?? [])].filter(
    (path): path is string => path != null && path !== ""
  );

  const pathMatch = matchPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!pathMatch) {
    return false;
  }

  if (item.search && currentSearch) {
    return Object.entries(item.search).every(
      ([k, v]) => (currentSearch[k] ?? undefined) === (v ?? undefined)
    );
  }

  return pathMatch;
}

function comparePathLengthDesc(a: SidebarNavItem, b: SidebarNavItem) {
  return (b.path?.length ?? 0) - (a.path?.length ?? 0);
}

function getActiveSubItem(item: SidebarNavItem, pathname: string) {
  return item.subItems
    ?.filter((child) => isNavItemActive(child, pathname))
    .slice()
    .sort(comparePathLengthDesc)[0];
}

function getActiveNavBreadcrumb(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      const subItem = getActiveSubItem(item, pathname);

      if (subItem) {
        return [item, subItem];
      }

      if (isNavItemActive(item, pathname)) {
        return [item];
      }
    }
  }
}

export function getBreadcrumbItems(pathname: string) {
  const activeNavBreadcrumb = getActiveNavBreadcrumb(pathname);

  if (activeNavBreadcrumb) {
    return activeNavBreadcrumb;
  }

  const footerItem = footerNavLinks.find((item) =>
    isNavItemActive(item, pathname)
  );

  return footerItem ? [footerItem] : [];
}

export function getNavGroups(
  pathname: string,
  currentSearch?: Record<string, unknown>
) {
  return navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const subItems = item.subItems?.map((subItem) => ({
        ...subItem,
        isActive: isNavItemActive(subItem, pathname, currentSearch),
      }));

      return {
        ...item,
        isActive:
          isNavItemActive(item, pathname, currentSearch) ||
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
