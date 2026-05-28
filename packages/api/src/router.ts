import type { RouterClient } from "@orpc/server";

import { foldersRouter } from "./modules/folders/router";
import { linksRouter } from "./modules/links/router";
import { tagsRouter } from "./modules/note-tags/router";
import { notesRouter } from "./modules/notes/router";

export const appRouter = {
  notes: {
    ...notesRouter,
    folders: foldersRouter,
    links: linksRouter,
    tags: tagsRouter,
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<AppRouter>;
