"use client";

import { cn } from "@memora/ui/lib/utils";
import { Separator } from "@memora/ui/components/separator";
import { AppBreadcrumbs } from "@memora/ui/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@memora/ui/components/custom-sidebar-trigger";
import type {
	AppLinkRenderer,
	SidebarNavItem,
} from "@memora/ui/components/app-shared";
import { UserButton } from "./user/user-button";
import type { UserButtonProps } from "./user/user-button";

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
		<header
			className={cn(
				"pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs items={breadcrumbItems} renderLink={renderLink} />
			</div>
			<UserButton size="icon" user={user} />
		</header>
	);
}
