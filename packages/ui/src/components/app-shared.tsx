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
import type { ReactElement, ReactNode } from "react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	matchPaths?: string[];
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export type AppLinkRenderer = (to: string) => ReactElement;

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Workspace",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
			},
			{
				title: "Inbox",
				path: "/inbox",
				icon: <HugeiconsIcon icon={InboxIcon} strokeWidth={2} />,
			},
			{
				title: "Notes",
				path: "/notes",
				icon: <HugeiconsIcon icon={NoteIcon} strokeWidth={2} />,
			},
			{
				title: "Tasks",
				path: "/tasks",
				icon: <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />,
			},
		],
	},
	{
		label: "Organization",
		items: [
			{
				title: "Projects",
				path: "/projects",
				icon: <HugeiconsIcon icon={FolderLibraryIcon} strokeWidth={2} />,
			},
			{
				title: "Favorites",
				path: "/favorites",
				icon: <HugeiconsIcon icon={StarIcon} strokeWidth={2} />,
			},
			{
				title: "Archive",
				path: "/archive",
				icon: <HugeiconsIcon icon={ArchiveIcon} strokeWidth={2} />,
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Settings",
		path: "/settings/account",
		matchPaths: ["/settings"],
		icon: <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />,
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
