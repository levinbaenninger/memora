import { viewPaths } from "@better-auth-ui/react/core";
import { Settings } from "@memora/ui/components/settings/settings";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/$path")({
  head: () => ({
    meta: [{ title: "Settings" }],
  }),
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.settings).includes(path)) {
      throw notFound();
    }
  },
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
