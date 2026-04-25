import { Fragment, type ReactNode } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@memora/ui/components/breadcrumb";
import type { AppLinkRenderer } from "@memora/ui/components/app-shared";

/** Current page segment shown in the header — pass a nav item or `{ title, icon? }`. */
export type AppBreadcrumbPage = {
	title: string;
	path?: string;
	icon?: ReactNode;
};

export function AppBreadcrumbs({
	items,
	renderLink,
}: {
	items: AppBreadcrumbPage[];
	renderLink: AppLinkRenderer;
}) {
	if (!items.length) {
		return null;
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<Fragment key={`${item.title}-${item.path ?? index}`}>
							<BreadcrumbItem>
								{isLast || !item.path ? (
									<BreadcrumbPage className="flex items-center gap-2 [&>svg]:size-3.5">
										{item.icon}
										{item.title}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink
										className="flex items-center gap-2 [&>svg]:size-3.5"
										render={renderLink(item.path)}
									>
										{item.icon}
										{item.title}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
