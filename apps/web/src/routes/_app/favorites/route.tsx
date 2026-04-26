import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/favorites")({
  head: () => ({
    meta: [{ title: "Favorites" }],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  return <p className="text-muted-foreground text-sm">Favorites</p>;
}
