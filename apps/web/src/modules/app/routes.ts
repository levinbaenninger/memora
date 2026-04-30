import {
  DashboardSquare01Icon,
  NoteIcon,
  Settings01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { LinkProps } from "@tanstack/react-router";
import { createElement, type ReactElement, type ReactNode } from "react";

type AppRouteTo = NonNullable<LinkProps["to"]>;
type AppRouteParams = LinkProps["params"];

export interface SidebarNavItem {
  icon?: ReactNode;
  isActive?: boolean;
  matchPaths?: string[];
  params?: AppRouteParams;
  path?: AppRouteTo;
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
  params?: AppRouteParams
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

function isNavItemActive(item: SidebarNavItem, pathname: string) {
  const matchPaths = [item.path, ...(item.matchPaths ?? [])].filter(
    (path): path is string => path != null && path !== ""
  );

  return matchPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
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
