import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@memora/ui/components/breadcrumb";
import { Fragment, type ReactNode } from "react";
import type { AppLinkRenderer, SidebarNavItem } from "@/modules/app/routes";

interface AppBreadcrumbPage
  extends Pick<SidebarNavItem, "icon" | "params" | "path" | "title"> {
  icon?: ReactNode;
}

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
                    render={renderLink(item.path, item.params)}
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
