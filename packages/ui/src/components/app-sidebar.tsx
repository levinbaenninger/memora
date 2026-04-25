"use client";

import { LogoIcon } from "@memora/ui/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
} from "@memora/ui/components/sidebar";
import { NavGroup } from "@memora/ui/components/nav-group";
import type {
	AppLinkRenderer,
	SidebarNavGroup,
	SidebarNavItem,
} from "@memora/ui/components/app-shared";

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
				{navGroups.map((group, index) => (
					<NavGroup
						key={`sidebar-group-${index}`}
						renderLink={renderLink}
						{...group}
					/>
				))}
			</SidebarContent>
			<SidebarFooter>
				<NavGroup
					className="p-0"
					label=""
					items={footerNavLinks}
					renderLink={renderLink}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
