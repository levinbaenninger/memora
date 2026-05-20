import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@memora/ui/components/breadcrumb";

import type { AppLinkRenderer, SidebarNavItem } from "@/modules/app/routes";

type AppBreadcrumbPage = Pick<
  SidebarNavItem,
  "icon" | "params" | "path" | "search" | "title"
>;

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
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.title}-${item.path ?? index}`}>
              <BreadcrumbItem
                className={isLast ? "min-w-0 flex-1" : "hidden sm:inline-flex"}
              >
                {isLast || !item.path ? (
                  <BreadcrumbPage className="flex min-w-0 items-center gap-2 [&>svg]:size-3.5">
                    {item.icon}
                    <span className="min-w-0 truncate">{item.title}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="flex min-w-0 items-center gap-2 [&>svg]:size-3.5"
                    render={renderLink(item.path, item.params, item.search)}
                  >
                    {item.icon}
                    <span className="min-w-0 truncate">{item.title}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
