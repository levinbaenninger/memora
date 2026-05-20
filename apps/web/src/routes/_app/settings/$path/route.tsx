import { viewPaths } from "@better-auth-ui/react/core";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { Settings } from "@/modules/app/ui/views/settings/settings";

export const Route = createFileRoute("/_app/settings/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.settings).includes(path)) {
      throw notFound();
    }
  },
  head: () => ({
    meta: [{ title: "Settings | Memora" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { path } = Route.useParams();

  return (
    <div className="w-full">
      <Settings path={path} />
    </div>
  );
}
